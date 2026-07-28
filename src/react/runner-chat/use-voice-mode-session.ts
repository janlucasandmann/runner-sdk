import { useCallback, useEffect, useRef, useState } from "react";
import type { RunnerChatOption } from "./agent-options.js";
import { generateRunnerClientId } from "./id-utils.js";
import {
  RUNNER_CHAT_VOICE_SAMPLE_RATE,
  base64Pcm16ToFloat32,
  float32ToBase64Pcm16,
  isRunnerChatWebVoiceMode,
  resampleFloat32ToSampleRate,
} from "./voice-audio.js";
import {
  RUNNER_VOICE_MEDIA_CONSTRAINTS,
  buildRunnerVoiceAudioAppendEvent,
  buildRunnerVoiceHeaders,
  buildRunnerVoiceSessionRequest,
  buildRunnerVoiceSessionUpdate,
  parseRunnerVoiceRealtimeEvent,
  readRunnerVoiceSessionConnection,
} from "./voice-realtime-protocol.js";

export type RunnerVoiceModeStatus =
  | "idle"
  | "starting"
  | "connected"
  | "closing"
  | "error";

export interface RunnerVoiceModeState {
  status: RunnerVoiceModeStatus;
  error: string;
  sessionId: string;
  threadId: string;
  agentId: string;
  agentName: string;
  lastUserTranscript: string;
  lastAssistantTranscript: string;
}

export interface RunnerVoiceLegacyTranscript {
  prompt: string;
  response: string;
  metadata: Record<string, unknown>;
}

export interface RunnerVoiceModeSessionOptions {
  agent: RunnerChatOption | null | undefined;
  agentId: string | null | undefined;
  agentName: string;
  apiKey: string;
  backendUrl: string;
  currentThreadId: string | null | undefined;
  disabled: boolean;
  environmentId: string | null | undefined;
  isDictationListening: boolean;
  isLegacyTranscriptFallback: boolean;
  isPreparingRun: boolean;
  onError: (message: string | null) => void;
  onLegacyTranscript: (transcript: RunnerVoiceLegacyTranscript) => void;
  onThreadIdChange: (threadId: string) => void;
  requestHeaders?: HeadersInit;
  stopDictation: () => Promise<void>;
}

export interface RunnerVoiceModeSessionController {
  start: () => Promise<void>;
  state: RunnerVoiceModeState;
  stop: (options?: { silent?: boolean }) => Promise<void>;
}

const IDLE_VOICE_MODE_STATE: RunnerVoiceModeState = {
  status: "idle",
  error: "",
  sessionId: "",
  threadId: "",
  agentId: "",
  agentName: "",
  lastUserTranscript: "",
  lastAssistantTranscript: "",
};

interface RunnerVoiceModeResources {
  audioContext: AudioContext | null;
  mediaStream: MediaStream | null;
  processor: ScriptProcessorNode | null;
  source: MediaStreamAudioSourceNode | null;
  websocket: WebSocket | null;
}

/**
 * Owns a full-duplex communicator session.
 *
 * This controller is intentionally separate from composer dictation. Voice
 * mode persists ordered user/communicator messages into the canonical thread,
 * can create a thread as part of session startup, and owns playback as well as
 * microphone capture.
 */
export function useRunnerVoiceModeSession(
  options: RunnerVoiceModeSessionOptions,
): RunnerVoiceModeSessionController {
  const [state, setState] = useState<RunnerVoiceModeState>(IDLE_VOICE_MODE_STATE);
  const stateRef = useRef(state);
  const optionsRef = useRef(options);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackTimeRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const pendingUserTranscriptRef = useRef("");
  const pendingUserCanonicalPersistedRef = useRef(false);
  const transcriptWriteTailRef = useRef<Promise<void>>(Promise.resolve());
  const sessionGenerationRef = useRef(0);
  const sessionThreadIdRef = useRef("");
  const currentThreadIdRef = useRef("");
  const groundingRefreshTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  optionsRef.current = options;
  currentThreadIdRef.current = String(options.currentThreadId || "").trim();

  const updateState = useCallback((
    next: RunnerVoiceModeState | ((current: RunnerVoiceModeState) => RunnerVoiceModeState),
  ) => {
    if (!mountedRef.current) return;
    setState((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      stateRef.current = resolved;
      return resolved;
    });
  }, []);

  const takeResources = useCallback((): RunnerVoiceModeResources => {
    const resources = {
      audioContext: audioContextRef.current,
      mediaStream: mediaStreamRef.current,
      processor: processorRef.current,
      source: sourceRef.current,
      websocket: websocketRef.current,
    };
    websocketRef.current = null;
    processorRef.current = null;
    sourceRef.current = null;
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    playbackTimeRef.current = 0;
    return resources;
  }, []);

  const releaseResources = useCallback(() => {
    if (groundingRefreshTimerRef.current) {
      clearInterval(groundingRefreshTimerRef.current);
      groundingRefreshTimerRef.current = null;
    }
    const { audioContext, mediaStream, processor, source, websocket } = takeResources();
    if (websocket && websocket.readyState !== WebSocket.CLOSED && websocket.readyState !== WebSocket.CLOSING) {
      try {
        websocket.close();
      } catch {}
    }
    if (processor) {
      try {
        processor.disconnect();
      } catch {}
      processor.onaudioprocess = null;
    }
    if (source) {
      try {
        source.disconnect();
      } catch {}
    }
    mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close().catch(() => undefined);
    }
  }, [takeResources]);

  const endBackendSession = useCallback(async (sessionId: string) => {
    const normalizedSessionId = String(sessionId || "").trim();
    const current = optionsRef.current;
    if (!normalizedSessionId || !current.backendUrl || !current.apiKey.trim()) return;
    await fetch(
      `${current.backendUrl}/voice-agents/sessions/${encodeURIComponent(normalizedSessionId)}/end`,
      {
        method: "POST",
        credentials: "include",
        headers: buildRunnerVoiceHeaders(current.requestHeaders, current.apiKey),
        body: JSON.stringify({}),
      },
    ).catch(() => undefined);
  }, []);

  const appendTranscriptMessage = useCallback(async (
    role: "user" | "assistant",
    content: string,
    event: Record<string, unknown>,
    sessionId: string,
    sessionGeneration: number,
  ) => {
    const normalizedSessionId = String(sessionId || "").trim();
    const normalizedContent = String(content || "").trim();
    const current = optionsRef.current;
    if (!normalizedSessionId || !normalizedContent || !current.backendUrl || !current.apiKey.trim()) {
      return;
    }

    const isCurrentSession = () => (
      sessionGenerationRef.current === sessionGeneration
      && sessionIdRef.current === normalizedSessionId
      && Boolean(sessionThreadIdRef.current)
      && currentThreadIdRef.current === sessionThreadIdRef.current
    );

    if (role === "user" && isCurrentSession()) {
      pendingUserTranscriptRef.current = normalizedContent;
      pendingUserCanonicalPersistedRef.current = false;
    }
    if (isCurrentSession()) {
      updateState((currentState) => ({
        ...currentState,
        lastUserTranscript: role === "user"
          ? normalizedContent
          : currentState.lastUserTranscript,
        lastAssistantTranscript: role === "assistant"
          ? normalizedContent
          : currentState.lastAssistantTranscript,
      }));
    }

    let canonicalPersisted = false;
    let persistenceError = "";
    const transcriptEvent = {
      ...event,
      client_transcript_id: String(
        event.client_transcript_id
        || event.clientTranscriptId
        || generateRunnerClientId("voice-transcript"),
      ),
    };
    for (let attempt = 0; attempt < 2 && !canonicalPersisted; attempt += 1) {
      try {
        const latest = optionsRef.current;
        const response = await fetch(
          `${latest.backendUrl}/voice-agents/sessions/${encodeURIComponent(normalizedSessionId)}/messages`,
          {
            method: "POST",
            credentials: "include",
            headers: buildRunnerVoiceHeaders(latest.requestHeaders, latest.apiKey),
            body: JSON.stringify({
              role,
              content: normalizedContent,
              event: transcriptEvent,
            }),
          },
        );
        const payload = await response.json().catch(() => null) as {
          event?: { id?: string };
          message?: { id?: string } | string;
          error?: string;
        } | null;
        const persistedMessageId = payload?.message && typeof payload.message === "object"
          ? payload.message.id
          : null;
        canonicalPersisted = response.ok && Boolean(payload?.event?.id && persistedMessageId);
        if (!canonicalPersisted) {
          persistenceError = typeof payload?.message === "string"
            ? payload.message
            : payload?.error
              ? payload.error
              : `Voice transcript persistence failed (${response.status}).`;
        }
      } catch (error) {
        persistenceError = error instanceof Error ? error.message : String(error);
      }
    }

    if (!isCurrentSession()) return;
    if (role === "user") {
      pendingUserCanonicalPersistedRef.current = canonicalPersisted;
    }
    if (role === "assistant") {
      const prompt = String(pendingUserTranscriptRef.current || "Voice input").trim() || "Voice input";
      const hadPendingUserTranscript = Boolean(pendingUserTranscriptRef.current.trim());
      const userCanonicalPersisted = !hadPendingUserTranscript
        || pendingUserCanonicalPersistedRef.current;
      pendingUserTranscriptRef.current = "";
      pendingUserCanonicalPersistedRef.current = false;

      if (
        optionsRef.current.isLegacyTranscriptFallback
        || !canonicalPersisted
        || !userCanonicalPersisted
      ) {
        optionsRef.current.onLegacyTranscript({
          prompt,
          response: normalizedContent,
          metadata: {
            source: "voice",
            channel: "web_voice",
            canonicalPersistenceFailed: !canonicalPersisted || !userCanonicalPersisted,
          },
        });
      }
    }
    if (!canonicalPersisted && persistenceError) {
      optionsRef.current.onError(
        `${persistenceError} The transcript remains visible locally; retrying the voice turn is safe.`,
      );
    }
  }, [updateState]);

  const enqueueTranscriptMessage = useCallback((
    role: "user" | "assistant",
    content: string,
    event: Record<string, unknown>,
  ) => {
    const sessionId = String(sessionIdRef.current || "").trim();
    const generation = sessionGenerationRef.current;
    const nextWrite = transcriptWriteTailRef.current
      .catch(() => undefined)
      .then(() => appendTranscriptMessage(role, content, event, sessionId, generation));
    transcriptWriteTailRef.current = nextWrite.catch(() => undefined);
  }, [appendTranscriptMessage]);

  const playAudioDelta = useCallback((base64Audio: string) => {
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state === "closed") return;
    const samples = base64Pcm16ToFloat32(base64Audio);
    if (!samples.length) return;
    const buffer = audioContext.createBuffer(
      1,
      samples.length,
      RUNNER_CHAT_VOICE_SAMPLE_RATE,
    );
    buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    const startAt = Math.max(audioContext.currentTime, playbackTimeRef.current);
    source.start(startAt);
    playbackTimeRef.current = startAt + buffer.duration;
  }, []);

  const handleRealtimeEvent = useCallback((event: Record<string, unknown>) => {
    const realtimeEvent = parseRunnerVoiceRealtimeEvent(event);
    if (realtimeEvent.kind === "audio") {
      playAudioDelta(realtimeEvent.audio);
      return;
    }
    if (realtimeEvent.kind === "transcript") {
      enqueueTranscriptMessage(
        realtimeEvent.role,
        realtimeEvent.transcript,
        realtimeEvent.raw,
      );
      return;
    }
    if (realtimeEvent.kind === "error") {
      updateState((current) => ({
        ...current,
        status: "error",
        error: realtimeEvent.message,
      }));
      optionsRef.current.onError(realtimeEvent.message);
    }
  }, [enqueueTranscriptMessage, playAudioDelta, updateState]);

  const stop = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    const sessionId = String(sessionIdRef.current || stateRef.current.sessionId || "").trim();
    if (!silent) {
      updateState((current) => ({
        ...current,
        status: current.status === "idle" ? "idle" : "closing",
        error: "",
      }));
    }
    releaseResources();
    sessionGenerationRef.current += 1;
    sessionIdRef.current = null;
    sessionThreadIdRef.current = "";
    pendingUserTranscriptRef.current = "";
    pendingUserCanonicalPersistedRef.current = false;
    if (sessionId) await endBackendSession(sessionId);
    if (!silent) {
      updateState(IDLE_VOICE_MODE_STATE);
    }
  }, [endBackendSession, releaseResources, updateState]);

  const start = useCallback(async () => {
    const current = optionsRef.current;
    const currentStatus = stateRef.current.status;
    if (
      current.disabled
      || current.isPreparingRun
      || currentStatus === "starting"
      || currentStatus === "connected"
    ) {
      return;
    }
    if (!current.apiKey.trim()) {
      current.onError("Enter an API key to start voice mode.");
      return;
    }
    if (!current.backendUrl) {
      current.onError("backendUrl is required.");
      return;
    }
    if (
      typeof window === "undefined"
      || typeof navigator === "undefined"
      || !navigator.mediaDevices?.getUserMedia
    ) {
      current.onError("Voice mode is not supported in this browser.");
      return;
    }

    const selectedAgent = current.agent || null;
    const normalizedAgentId = String(selectedAgent?.id || current.agentId || "").trim();
    if (!normalizedAgentId) {
      current.onError("Select an agent before starting voice mode.");
      return;
    }
    if (!isRunnerChatWebVoiceMode(selectedAgent?.voiceMode)) {
      current.onError("Enable Web voice mode for this agent before starting voice mode.");
      return;
    }

    sessionGenerationRef.current += 1;
    const startGeneration = sessionGenerationRef.current;
    let expectedThreadId = String(current.currentThreadId || "").trim();
    let createdSessionId = "";
    const isStartCurrent = () => (
      sessionGenerationRef.current === startGeneration
      && currentThreadIdRef.current === expectedThreadId
    );
    const abandonStart = async (sessionId = "") => {
      if (sessionGenerationRef.current === startGeneration) {
        sessionGenerationRef.current += 1;
        releaseResources();
        sessionIdRef.current = null;
        sessionThreadIdRef.current = "";
        pendingUserTranscriptRef.current = "";
        pendingUserCanonicalPersistedRef.current = false;
        updateState(IDLE_VOICE_MODE_STATE);
      }
      if (sessionId) await endBackendSession(sessionId);
    };

    updateState({
      ...IDLE_VOICE_MODE_STATE,
      status: "starting",
      threadId: String(current.currentThreadId || ""),
      agentId: normalizedAgentId,
      agentName: selectedAgent?.name || current.agentName,
    });
    current.onError(null);

    try {
      if (current.isDictationListening) {
        await current.stopDictation();
      }
      if (!isStartCurrent()) {
        await abandonStart();
        return;
      }
      releaseResources();

      const response = await fetch(
        `${current.backendUrl}/voice-agents/agents/${encodeURIComponent(normalizedAgentId)}/sessions`,
        {
          method: "POST",
          credentials: "include",
          headers: buildRunnerVoiceHeaders(current.requestHeaders, current.apiKey),
          body: JSON.stringify(buildRunnerVoiceSessionRequest({
            threadId: current.currentThreadId,
            environmentId: current.environmentId,
            agentName: selectedAgent?.name,
            communicatorMode: Boolean(current.currentThreadId),
          })),
        },
      );
      const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(
          String(payload.message || payload.error || "Failed to create voice session."),
        );
      }

      const connection = readRunnerVoiceSessionConnection(
        payload,
        current.currentThreadId,
      );
      createdSessionId = connection.sessionId;
      if (!isStartCurrent()) {
        await abandonStart(createdSessionId);
        return;
      }
      expectedThreadId = connection.threadId;
      pendingUserTranscriptRef.current = "";
      pendingUserCanonicalPersistedRef.current = false;
      sessionThreadIdRef.current = connection.threadId;

      if (connection.threadId && connection.threadId !== current.currentThreadId) {
        currentThreadIdRef.current = connection.threadId;
        optionsRef.current.onThreadIdChange(connection.threadId);
      }
      updateState((currentState) => ({
        ...currentState,
        sessionId: connection.sessionId,
        threadId: connection.threadId,
      }));

      const AudioContextConstructor = window.AudioContext
        || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) {
        throw new Error("Voice mode is not supported in this browser.");
      }
      const audioContext = new AudioContextConstructor({
        sampleRate: RUNNER_CHAT_VOICE_SAMPLE_RATE,
      });
      audioContextRef.current = audioContext;
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      if (!isStartCurrent()) {
        await abandonStart(connection.sessionId);
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        RUNNER_VOICE_MEDIA_CONSTRAINTS,
      );
      if (!isStartCurrent()) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
        await abandonStart(connection.sessionId);
        return;
      }
      mediaStreamRef.current = mediaStream;

      const websocket = new WebSocket(
        connection.realtimeUrl,
        [connection.websocketProtocol],
      );
      websocketRef.current = websocket;
      sessionIdRef.current = connection.sessionId;

      websocket.addEventListener("open", () => {
        if (websocketRef.current !== websocket || !isStartCurrent()) {
          try {
            websocket.close();
          } catch {}
          void endBackendSession(connection.sessionId);
          return;
        }
        websocket.send(JSON.stringify(
          buildRunnerVoiceSessionUpdate(connection.sessionUpdate, selectedAgent),
        ));
        if (
          connection.communicator.enabled
          && connection.communicator.groundingUrl
        ) {
          const refreshGrounding = async () => {
            const latest = optionsRef.current;
            const groundingUrl =
              connection.communicator.groundingUrl.startsWith("/")
                ? `${latest.backendUrl}${connection.communicator.groundingUrl}`
                : connection.communicator.groundingUrl;
            try {
              const response = await fetch(groundingUrl, {
                method: "GET",
                credentials: "include",
                headers: buildRunnerVoiceHeaders(
                  latest.requestHeaders,
                  latest.apiKey,
                ),
              });
              const payload = await response.json().catch(() => null) as {
                sessionUpdate?: unknown;
              } | null;
              if (
                !response.ok
                || !payload?.sessionUpdate
                || websocketRef.current !== websocket
                || websocket.readyState !== WebSocket.OPEN
                || !isStartCurrent()
              ) {
                return;
              }
              websocket.send(JSON.stringify(
                buildRunnerVoiceSessionUpdate(
                  payload.sessionUpdate,
                  selectedAgent,
                ),
              ));
            } catch {
              // A stale refresh must not interrupt an otherwise healthy voice
              // transport. The next bounded interval retries with fresh state.
            }
          };
          groundingRefreshTimerRef.current = setInterval(
            () => void refreshGrounding(),
            connection.communicator.refreshIntervalMs,
          );
        }

        const source = audioContext.createMediaStreamSource(mediaStream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (event) => {
          event.outputBuffer.getChannelData(0).fill(0);
          if (websocketRef.current !== websocket || websocket.readyState !== WebSocket.OPEN) {
            return;
          }
          const voiceSamples = resampleFloat32ToSampleRate(
            event.inputBuffer.getChannelData(0),
            audioContext.sampleRate,
            RUNNER_CHAT_VOICE_SAMPLE_RATE,
          );
          const audio = float32ToBase64Pcm16(voiceSamples);
          if (audio) {
            websocket.send(JSON.stringify(buildRunnerVoiceAudioAppendEvent(audio)));
          }
        };
        source.connect(processor);
        processor.connect(audioContext.destination);
        sourceRef.current = source;
        processorRef.current = processor;

        updateState({
          ...IDLE_VOICE_MODE_STATE,
          status: "connected",
          sessionId: connection.sessionId,
          threadId: connection.threadId,
          agentId: normalizedAgentId,
          agentName: selectedAgent?.name || current.agentName,
        });
      });

      websocket.addEventListener("message", (messageEvent) => {
        if (websocketRef.current !== websocket || typeof messageEvent.data !== "string") {
          return;
        }
        try {
          handleRealtimeEvent(
            JSON.parse(messageEvent.data) as Record<string, unknown>,
          );
        } catch {}
      });
      websocket.addEventListener("error", () => {
        if (websocketRef.current !== websocket) return;
        updateState((currentState) => ({
          ...currentState,
          status: "error",
          error: "Voice mode connection failed.",
        }));
        optionsRef.current.onError("Voice mode connection failed.");
      });
      websocket.addEventListener("close", () => {
        if (websocketRef.current !== websocket) return;
        releaseResources();
        updateState((currentState) => (
          currentState.status === "closing"
            ? currentState
            : {
                ...currentState,
                status: "error",
                error: "Voice mode disconnected.",
              }
        ));
      });
    } catch (error) {
      releaseResources();
      sessionIdRef.current = null;
      if (createdSessionId) {
        void endBackendSession(createdSessionId);
      }
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      const message = normalizedError.message || "Failed to start voice mode.";
      updateState((currentState) => ({
        ...currentState,
        status: "error",
        error: message,
      }));
      optionsRef.current.onError(message);
    }
  }, [endBackendSession, handleRealtimeEvent, releaseResources, updateState]);

  useEffect(() => {
    optionsRef.current.onError(null);
    const sessionId = String(sessionIdRef.current || "").trim();
    const selectedThreadId = String(options.currentThreadId || "").trim();
    if (
      sessionId
      && sessionThreadIdRef.current
      && selectedThreadId !== sessionThreadIdRef.current
    ) {
      void stop();
    }
  }, [options.currentThreadId, stop]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const sessionId = String(sessionIdRef.current || "").trim();
      sessionGenerationRef.current += 1;
      releaseResources();
      sessionIdRef.current = null;
      sessionThreadIdRef.current = "";
      if (sessionId) void endBackendSession(sessionId);
    };
  }, [endBackendSession, releaseResources]);

  return { start, state, stop };
}
