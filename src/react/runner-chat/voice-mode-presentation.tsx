import {
  AudioLines as LucideAudioLines,
  LoaderCircle as LucideLoaderCircle,
} from "lucide-react";
import type { RunnerVoiceModeState } from "./use-voice-mode-session.js";
import {
  isRunnerChatWebVoiceMode,
  normalizeRunnerChatVoiceMode,
} from "./voice-audio.js";

export interface RunnerVoiceModeControlProps {
  agentVoiceMode?: string | null;
  disabled: boolean;
  enabled: boolean;
  isFull?: boolean;
  onStart: () => void;
  onStop: () => void;
  state: RunnerVoiceModeState;
}

export function RunnerVoiceModeControl({
  agentVoiceMode,
  disabled,
  enabled,
  isFull = false,
  onStart,
  onStop,
  state,
}: RunnerVoiceModeControlProps) {
  const agentWebVoiceEnabled =
    enabled
    && isRunnerChatWebVoiceMode(normalizeRunnerChatVoiceMode(agentVoiceMode));
  const isActive = state.status === "connected";
  const isBusy = state.status === "starting" || state.status === "closing";
  const shouldRender =
    enabled
    && (
      agentWebVoiceEnabled
      || isActive
      || isBusy
      || state.status === "error"
    );

  if (!shouldRender) {
    return null;
  }

  const isDisabled = Boolean(
    disabled
    || (isBusy && !isActive)
    || (!isActive && !agentWebVoiceEnabled),
  );
  const title = isActive
    ? "End voice mode"
    : agentWebVoiceEnabled
      ? "Start voice mode"
      : "Enable Web voice mode on this agent first";

  return (
    <button
      type="button"
      className={`task-voice-button ${isFull ? "task-voice-button-full" : ""} ${isActive ? "active" : ""}`.trim()}
      onClick={isActive ? onStop : onStart}
      disabled={isDisabled}
      aria-label={isActive ? "End voice mode" : "Start voice mode"}
      title={title}
    >
      {isBusy ? (
        <LucideLoaderCircle
          className="task-voice-icon task-voice-icon-spinner"
          strokeWidth={1.9}
        />
      ) : (
        <LucideAudioLines className="task-voice-icon" strokeWidth={1.9} />
      )}
    </button>
  );
}

export interface RunnerVoiceModeStatusBarProps {
  enabled: boolean;
  onStop: () => void;
  state: RunnerVoiceModeState;
}

export function RunnerVoiceModeStatusBar({
  enabled,
  onStop,
  state,
}: RunnerVoiceModeStatusBarProps) {
  if (!enabled || state.status === "idle") {
    return null;
  }

  const label =
    state.status === "starting"
      ? "Starting voice mode"
      : state.status === "closing"
        ? "Ending voice mode"
        : state.status === "error"
          ? "Voice mode error"
          : "Voice mode active";
  const transcript =
    state.lastAssistantTranscript
    || state.lastUserTranscript
    || "";
  const canStop = state.status === "connected" || state.status === "error";

  return (
    <div className={`tb-voice-session-strip ${state.status === "error" ? "is-error" : ""}`.trim()}>
      <LucideAudioLines
        className="tb-voice-session-strip-icon"
        strokeWidth={1.8}
      />
      <div className="tb-voice-session-strip-copy">
        <span className="tb-voice-session-strip-title">{label}</span>
        <span className="tb-voice-session-strip-meta">
          {state.error
            || transcript
            || state.agentName
            || "Live voice session"}
        </span>
      </div>
      {canStop ? (
        <button
          type="button"
          className="tb-voice-session-strip-action"
          onClick={onStop}
        >
          End
        </button>
      ) : null}
    </div>
  );
}
