import { Bot, UserRound } from "lucide-react";
import type { RunnerThreadParticipant } from "../../thread/types.js";

export interface RunnerThreadParticipantAvatarProps {
  participant?: RunnerThreadParticipant | null;
  size?: "small" | "medium";
}

export function RunnerThreadParticipantAvatar({
  participant,
  size = "medium",
}: RunnerThreadParticipantAvatarProps) {
  const rawKind = participant?.kind || "system";
  const isInternalAssistant = rawKind === "communicator" || rawKind === "observer";
  const label = isInternalAssistant ? "Agent" : participant?.displayName?.trim() || "Participant";
  const kind = isInternalAssistant ? "worker" : rawKind;
  const className = `tb-thread-participant-avatar is-${size} is-${kind}`;

  if (!isInternalAssistant && participant?.avatarUrl) {
    return <img className={className} src={participant.avatarUrl} alt="" title={label} />;
  }

  const Icon = kind === "human" ? UserRound : Bot;
  return (
    <span className={className} title={label} aria-hidden="true">
      <Icon strokeWidth={1.7} />
    </span>
  );
}
