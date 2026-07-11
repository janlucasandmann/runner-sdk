import { Bot, Eye, UserRound } from "lucide-react";
import type { RunnerThreadParticipant } from "../../thread/types.js";

export interface RunnerThreadParticipantAvatarProps {
  participant?: RunnerThreadParticipant | null;
  size?: "small" | "medium";
}

export function RunnerThreadParticipantAvatar({
  participant,
  size = "medium",
}: RunnerThreadParticipantAvatarProps) {
  const label = participant?.displayName?.trim() || "Participant";
  const kind = participant?.kind || "system";
  const className = `tb-thread-participant-avatar is-${size} is-${kind}`;

  if (participant?.avatarUrl) {
    return <img className={className} src={participant.avatarUrl} alt="" title={label} />;
  }

  const Icon = kind === "human" ? UserRound : kind === "observer" ? Eye : Bot;
  return (
    <span className={className} title={label} aria-hidden="true">
      <Icon strokeWidth={1.7} />
    </span>
  );
}

