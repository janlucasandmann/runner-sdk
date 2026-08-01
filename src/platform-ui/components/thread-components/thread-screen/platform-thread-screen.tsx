import type { ReactNode } from "react";

export interface PlatformThreadScreenProps {
  conversation: ReactNode;
  workbench?: ReactNode;
  decisionBar?: ReactNode;
  workbenchOpen?: boolean;
  className?: string;
}

export function PlatformThreadScreen({
  conversation,
  workbench,
  decisionBar,
  workbenchOpen = false,
  className = "",
}: PlatformThreadScreenProps) {
  return (
    <div
      className={`platform-thread-screen${workbenchOpen ? " is-workbench-open" : ""}${className ? ` ${className}` : ""}`}
      data-platform-thread-screen="true"
    >
      <section className="platform-thread-screen__conversation" aria-label="Conversation">
        <div className="platform-thread-screen__conversation-content">{conversation}</div>
        {decisionBar ? (
          <div className="platform-thread-screen__decision-bar">{decisionBar}</div>
        ) : null}
      </section>
      {workbenchOpen && workbench ? (
        <aside className="platform-thread-screen__workbench" aria-label="Execution details">
          {workbench}
        </aside>
      ) : null}
    </div>
  );
}
