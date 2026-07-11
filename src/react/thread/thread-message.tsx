import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type {
  RunnerThreadMessage,
  RunnerThreadParticipant,
  RunnerThreadRoutingReceipt,
} from "../../thread/types.js";
import { RunnerThreadParticipantAvatar } from "./participant-avatar.js";
import { RunnerThreadRoutingReceiptView } from "./routing-receipt.js";

export interface RunnerThreadMessageViewProps {
  message: RunnerThreadMessage;
  participant?: RunnerThreadParticipant | null;
  receipt?: RunnerThreadRoutingReceipt | null;
  renderContent?: (message: RunnerThreadMessage) => ReactNode;
  onCorrectRoute?: (receipt: RunnerThreadRoutingReceipt) => void;
}

function formatMessageTimeUtc(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return `${date.toISOString().slice(11, 16)} UTC`;
}

function RunnerThreadMessageTime({ value }: { value: string }) {
  const [label, setLabel] = useState(() => formatMessageTimeUtc(value));
  useEffect(() => {
    const date = new Date(value);
    setLabel(Number.isFinite(date.getTime())
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "");
  }, [value]);
  return <time dateTime={value}>{label}</time>;
}

export function RunnerThreadMessageView({
  message,
  participant,
  receipt,
  renderContent,
  onCorrectRoute,
}: RunnerThreadMessageViewProps) {
  const participantKind = participant?.kind || "system";
  const displayName = participant?.displayName || (participantKind === "human" ? "You" : "Communicator");
  const isHuman = participantKind === "human";

  return (
    <article className={`tb-thread-message is-${participantKind} ${isHuman ? "is-human" : "is-agent"}`}>
      {!isHuman ? <RunnerThreadParticipantAvatar participant={participant} /> : null}
      <div className="tb-thread-message-main">
        {!isHuman ? (
          <div className="tb-thread-message-meta">
            <span className="tb-thread-message-author">{displayName}</span>
            {message.modality !== "text" ? (
              <span className="tb-thread-message-modality">{message.modality.replaceAll("_", " ")}</span>
            ) : null}
            <RunnerThreadMessageTime value={message.createdAt} />
          </div>
        ) : null}
        <div className="tb-thread-message-content">
          {renderContent ? renderContent(message) : message.content}
        </div>
        {receipt ? <RunnerThreadRoutingReceiptView receipt={receipt} onCorrectRoute={onCorrectRoute} /> : null}
      </div>
    </article>
  );
}
