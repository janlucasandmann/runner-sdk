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
  renderUserContent?: (message: RunnerThreadMessage) => ReactNode;
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

function formatUserMessageTimeUtc(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function formatUserMessageTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  const now = new Date();
  const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (messageDay.getTime() === today.getTime()) return `Today ${time}`;
  if (messageDay.getTime() === yesterday.getTime()) return `Yesterday ${time}`;

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" as const }),
  }).format(date);
  return `${dateLabel}, ${time}`;
}

export function RunnerThreadUserMessageTime({ value }: { value: string }) {
  const [label, setLabel] = useState(() => formatUserMessageTimeUtc(value));
  useEffect(() => setLabel(formatUserMessageTime(value)), [value]);
  return <time className="tb-thread-user-message-time" dateTime={value}>{label}</time>;
}

export function RunnerThreadMessageView({
  message,
  participant,
  receipt,
  renderContent,
  renderUserContent,
  onCorrectRoute,
}: RunnerThreadMessageViewProps) {
  const participantKind = participant?.kind || "system";
  const displayName = participant?.displayName || (participantKind === "human" ? "You" : "Communicator");
  const isHuman = participantKind === "human";

  if (isHuman) {
    return (
      <article className="tb-turn tb-turn-user">
        <RunnerThreadUserMessageTime value={message.createdAt} />
        <div className="tb-user-turn-shell">
          <div className="task-prompt-in-session-context">
            {renderUserContent
              ? renderUserContent(message)
              : renderContent
                ? renderContent(message)
                : message.content}
          </div>
          {receipt ? <RunnerThreadRoutingReceiptView receipt={receipt} onCorrectRoute={onCorrectRoute} /> : null}
        </div>
      </article>
    );
  }

  return (
    <article className={`tb-thread-message is-${participantKind} is-agent`}>
      <RunnerThreadParticipantAvatar participant={participant} />
      <div className="tb-thread-message-main">
        <div className="tb-thread-message-meta">
          <span className="tb-thread-message-author">{displayName}</span>
          {message.modality !== "text" ? (
            <span className="tb-thread-message-modality">{message.modality.replaceAll("_", " ")}</span>
          ) : null}
          <RunnerThreadMessageTime value={message.createdAt} />
        </div>
        <div className="tb-thread-message-content">
          {renderContent ? renderContent(message) : message.content}
        </div>
        {receipt ? <RunnerThreadRoutingReceiptView receipt={receipt} onCorrectRoute={onCorrectRoute} /> : null}
      </div>
    </article>
  );
}
