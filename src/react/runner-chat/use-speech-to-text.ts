import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SPEECH_WORKLET_BUFFER_SIZE,
  SPEECH_WORKLET_PROCESSOR_NAME,
  calculateRms,
  combineInputWithTranscript,
  createSpeechCaptureWorkletUrl,
  downsampleTo16kHz,
  encodePcmChunkBase64,
  resolveSpeechToTextUrl,
} from "./voice-audio.js";
import { RUNNER_VOICE_MEDIA_CONSTRAINTS } from "./voice-realtime-protocol.js";
import {
  RUNNER_SPEECH_ACTIVITY_HANGOVER_MS,
  RUNNER_SPEECH_ACTIVITY_RMS_THRESHOLD,
  appendBoundedRunnerSpeechMessage,
  buildRunnerSpeechSocketUrl,
  normalizeRunnerSpeechAudioChunk,
  parseRunnerSpeechServerEvent,
  type RunnerSpeechClientMessage,
} from "./speech-transport.js";

export interface RunnerSpeechToTextOptions {
  apiKey: string;
  backendUrl: string;
  input: string;
  onError: (message: string | null) => void;
  onInputChange: (input: string) => void;
  requestHeaders?: HeadersInit;
  speechToTextUrl?: string;
}

export interface RunnerSpeechToTextController {
  isListening: boolean;
  recordingElapsedSeconds: number;
  resetDraft: (input: string) => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  supportsSpeechToText: boolean;
  toggle: () => Promise<void>;
}

interface RunnerSpeechResources {
  audioContext: AudioContext | null;
  mediaStream: MediaStream | null;
  processorNode: AudioWorkletNode | null;
  sinkGainNode: GainNode | null;
  socket: WebSocket | null;
  sourceNode: MediaStreamAudioSourceNode | null;
}

function supportsRunnerSpeechCapture(resolvedSpeechToTextUrl: string | null): boolean {
  if (!resolvedSpeechToTextUrl || typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const browserWindow = window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };
  return (
    typeof WebSocket !== "undefined"
    && typeof AudioWorkletNode !== "undefined"
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && Boolean(browserWindow.AudioContext || browserWindow.webkitAudioContext)
  );
}

function disconnectSpeechResources(resources: RunnerSpeechResources): void {
  const {
    audioContext,
    mediaStream,
    processorNode,
    sinkGainNode,
    socket,
    sourceNode,
  } = resources;

  if (processorNode) {
    processorNode.port.onmessage = null;
    processorNode.disconnect();
  }
  sourceNode?.disconnect();
  sinkGainNode?.disconnect();
  mediaStream?.getTracks().forEach((track) => track.stop());
  if (audioContext) {
    void audioContext.close().catch(() => undefined);
  }
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    socket.close(1000, "Speech-to-text stopped");
  }
}

/**
 * Owns the browser dictation transport used by RunnerChat.
 *
 * Full-duplex agent voice sessions deliberately remain a separate controller:
 * dictation edits the composer draft, whereas voice sessions persist canonical
 * thread messages and can continue independently from a worker run.
 */
export function useRunnerSpeechToText({
  apiKey,
  backendUrl,
  input,
  onError,
  onInputChange,
  requestHeaders,
  speechToTextUrl,
}: RunnerSpeechToTextOptions): RunnerSpeechToTextController {
  const [isListening, setIsListening] = useState(false);
  const [recordingStartedAtMs, setRecordingStartedAtMs] = useState<number | null>(null);
  const [recordingElapsedSeconds, setRecordingElapsedSeconds] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const socketReadyRef = useRef(false);
  const pendingChunksRef = useRef<RunnerSpeechClientMessage[]>([]);
  const baseInputRef = useRef(input);
  const currentInputRef = useRef(input);
  const transcriptRef = useRef("");
  const activityOpenRef = useRef(false);
  const lastVoiceMsRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorNodeRef = useRef<AudioWorkletNode | null>(null);
  const sinkGainNodeRef = useRef<GainNode | null>(null);
  const onErrorRef = useRef(onError);
  const onInputChangeRef = useRef(onInputChange);

  const resolvedSpeechToTextUrl = useMemo(
    () => resolveSpeechToTextUrl(speechToTextUrl, backendUrl, requestHeaders),
    [backendUrl, requestHeaders, speechToTextUrl],
  );
  const supportsSpeechToText = useMemo(
    () => Boolean(apiKey.trim()) && supportsRunnerSpeechCapture(resolvedSpeechToTextUrl),
    [apiKey, resolvedSpeechToTextUrl],
  );

  useEffect(() => {
    currentInputRef.current = input;
  }, [input]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onInputChangeRef.current = onInputChange;
  }, [onInputChange]);

  const takeResources = useCallback((): RunnerSpeechResources => {
    const resources = {
      audioContext: audioContextRef.current,
      mediaStream: mediaStreamRef.current,
      processorNode: processorNodeRef.current,
      sinkGainNode: sinkGainNodeRef.current,
      socket: socketRef.current,
      sourceNode: sourceNodeRef.current,
    };
    socketRef.current = null;
    socketReadyRef.current = false;
    pendingChunksRef.current = [];
    processorNodeRef.current = null;
    sourceNodeRef.current = null;
    sinkGainNodeRef.current = null;
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    transcriptRef.current = "";
    baseInputRef.current = currentInputRef.current;
    activityOpenRef.current = false;
    lastVoiceMsRef.current = 0;
    return resources;
  }, []);

  const sendSignal = useCallback((socket: WebSocket, type: "activity-start" | "activity-end") => {
    if (socketReadyRef.current && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type }));
      return;
    }
    if (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING) {
      return;
    }
    appendBoundedRunnerSpeechMessage(pendingChunksRef.current, { type });
  }, []);

  const resetDraft = useCallback((nextInput: string) => {
    currentInputRef.current = nextInput;
    baseInputRef.current = nextInput;
    transcriptRef.current = "";
  }, []);

  const stop = useCallback(async () => {
    const wasActivityOpen = activityOpenRef.current;
    const resources = takeResources();
    const { audioContext, mediaStream, processorNode, sinkGainNode, socket, sourceNode } = resources;

    if (processorNode) {
      processorNode.port.onmessage = null;
      processorNode.disconnect();
    }
    sourceNode?.disconnect();
    sinkGainNode?.disconnect();
    mediaStream?.getTracks().forEach((track) => track.stop());

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      if (socket.readyState === WebSocket.OPEN && wasActivityOpen) {
        socket.send(JSON.stringify({ type: "activity-end" }));
        await new Promise((resolve) => globalThis.setTimeout(resolve, 250));
      }
      socket.close(1000, "Speech-to-text stopped");
    }
    if (audioContext) {
      await audioContext.close().catch(() => undefined);
    }

    setRecordingStartedAtMs(null);
    setRecordingElapsedSeconds(0);
    setIsListening(false);
  }, [takeResources]);

  const start = useCallback(async () => {
    if (!apiKey.trim()) {
      onErrorRef.current("Enter an API key to enable speech-to-text.");
      return;
    }
    if (!supportsSpeechToText || !resolvedSpeechToTextUrl) {
      onErrorRef.current("Speech-to-text is not supported in this browser.");
      return;
    }

    await stop();
    onErrorRef.current(null);

    let pendingStream: MediaStream | null = null;
    let pendingAudioContext: AudioContext | null = null;
    try {
      pendingStream = await navigator.mediaDevices.getUserMedia(
        RUNNER_VOICE_MEDIA_CONSTRAINTS,
      );
      const browserWindow = window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextConstructor = browserWindow.AudioContext || browserWindow.webkitAudioContext;
      if (!AudioContextConstructor) {
        throw new Error("Speech-to-text is not supported in this browser.");
      }

      const socket = new WebSocket(buildRunnerSpeechSocketUrl(resolvedSpeechToTextUrl, apiKey));
      pendingAudioContext = new AudioContextConstructor();
      const workletUrl = createSpeechCaptureWorkletUrl();
      try {
        await pendingAudioContext.audioWorklet.addModule(workletUrl);
      } finally {
        URL.revokeObjectURL(workletUrl);
      }
      const sourceNode = pendingAudioContext.createMediaStreamSource(pendingStream);
      const processorNode = new AudioWorkletNode(
        pendingAudioContext,
        SPEECH_WORKLET_PROCESSOR_NAME,
        {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          channelCount: 1,
          processorOptions: {
            bufferSize: SPEECH_WORKLET_BUFFER_SIZE,
          },
        },
      );
      const sinkGainNode = pendingAudioContext.createGain();
      sinkGainNode.gain.value = 0;

      socketRef.current = socket;
      socketReadyRef.current = false;
      pendingChunksRef.current = [];
      mediaStreamRef.current = pendingStream;
      audioContextRef.current = pendingAudioContext;
      sourceNodeRef.current = sourceNode;
      processorNodeRef.current = processorNode;
      sinkGainNodeRef.current = sinkGainNode;
      baseInputRef.current = currentInputRef.current;
      transcriptRef.current = "";
      activityOpenRef.current = false;
      lastVoiceMsRef.current = 0;
      pendingStream = null;
      pendingAudioContext = null;

      const flushPendingChunks = () => {
        if (!pendingChunksRef.current.length || socket.readyState !== WebSocket.OPEN) {
          return;
        }
        for (const message of pendingChunksRef.current) {
          socket.send(JSON.stringify(message));
        }
        pendingChunksRef.current = [];
      };
      const sendChunk = (chunk: string) => {
        if (!chunk) return;
        if (socketReadyRef.current && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "audio", data: chunk }));
          return;
        }
        appendBoundedRunnerSpeechMessage(
          pendingChunksRef.current,
          { type: "audio", data: chunk },
        );
      };

      socket.onmessage = (event) => {
        let payload: unknown;
        try {
          payload = JSON.parse(String(event.data || ""));
        } catch {
          return;
        }
        const message = parseRunnerSpeechServerEvent(payload);
        if (message.kind === "ready") {
          socketReadyRef.current = true;
          flushPendingChunks();
          return;
        }
        if (message.kind === "transcript") {
          transcriptRef.current = combineInputWithTranscript(transcriptRef.current, message.text);
          onInputChangeRef.current(combineInputWithTranscript(baseInputRef.current, transcriptRef.current));
          return;
        }
        if (message.kind === "turn-complete") {
          const committedInput = combineInputWithTranscript(baseInputRef.current, transcriptRef.current);
          baseInputRef.current = committedInput;
          transcriptRef.current = "";
          onInputChangeRef.current(committedInput);
          return;
        }
        if (message.kind === "error") {
          onErrorRef.current(message.message);
          void stop();
        }
      };
      socket.onerror = () => {
        onErrorRef.current("Speech-to-text connection failed.");
        void stop();
      };
      socket.onclose = (event) => {
        const closeReason = event.reason?.trim();
        if (socketRef.current === socket && closeReason && closeReason !== "Speech-to-text stopped") {
          onErrorRef.current(`Speech-to-text stopped: ${closeReason}`);
        }
        if (socketRef.current === socket) {
          void stop();
        }
      };

      processorNode.port.onmessage = (event) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        const normalizedChunk = normalizeRunnerSpeechAudioChunk(event.data);
        if (!normalizedChunk?.length) return;

        const rms = calculateRms(normalizedChunk);
        const now = Date.now();
        const isSpeechChunk = rms >= RUNNER_SPEECH_ACTIVITY_RMS_THRESHOLD;
        if (isSpeechChunk) {
          lastVoiceMsRef.current = now;
          if (!activityOpenRef.current) {
            activityOpenRef.current = true;
            sendSignal(socket, "activity-start");
          }
        }
        if (!isSpeechChunk && now - lastVoiceMsRef.current > RUNNER_SPEECH_ACTIVITY_HANGOVER_MS) {
          if (activityOpenRef.current) {
            activityOpenRef.current = false;
            sendSignal(socket, "activity-end");
          }
          return;
        }

        const pcmChunk = downsampleTo16kHz(normalizedChunk, audioContextRef.current?.sampleRate || 16000);
        if (pcmChunk.length) {
          sendChunk(encodePcmChunkBase64(pcmChunk));
        }
      };

      sourceNode.connect(processorNode);
      processorNode.connect(sinkGainNode);
      sinkGainNode.connect(audioContextRef.current.destination);
      await audioContextRef.current.resume();
      setRecordingStartedAtMs(Date.now());
      setRecordingElapsedSeconds(0);
      setIsListening(true);
    } catch (error) {
      pendingStream?.getTracks().forEach((track) => track.stop());
      if (pendingAudioContext) {
        await pendingAudioContext.close().catch(() => undefined);
      }
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      onErrorRef.current(
        normalizedError.message === "Permission denied"
          ? "Microphone access was blocked."
          : normalizedError.message || "Speech-to-text failed to start.",
      );
      await stop();
    }
  }, [apiKey, resolvedSpeechToTextUrl, sendSignal, stop, supportsSpeechToText]);

  const toggle = useCallback(async () => {
    if (isListening) {
      await stop();
      return;
    }
    await start();
  }, [isListening, start, stop]);

  useEffect(() => {
    if (!isListening || recordingStartedAtMs === null) {
      setRecordingElapsedSeconds(0);
      return;
    }
    const updateElapsed = () => {
      setRecordingElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - recordingStartedAtMs) / 1000)),
      );
    };
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(timer);
  }, [isListening, recordingStartedAtMs]);

  useEffect(() => {
    return () => {
      disconnectSpeechResources(takeResources());
    };
  }, [takeResources]);

  return {
    isListening,
    recordingElapsedSeconds,
    resetDraft,
    start,
    stop,
    supportsSpeechToText,
    toggle,
  };
}
