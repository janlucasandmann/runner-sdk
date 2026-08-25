import type { ReactNode } from "react";

export interface PlatformThreadSummarySection {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  content?: ReactNode;
}

export interface PlatformThreadSummaryPanelProps {
  sections: readonly PlatformThreadSummarySection[];
  ariaLabel?: string;
  className?: string;
}

/**
 * Compact, non-tabbed thread context surface used by the app-header sidebar.
 * Sections deliberately share one visual rhythm so task state, permissions,
 * connectors, changes, and resources do not each invent their own card UI.
 */
export function PlatformThreadSummaryPanel({
  sections,
  ariaLabel = "Thread context",
  className = "",
}: PlatformThreadSummaryPanelProps) {
  return (
    <section
      className={`platform-thread-workbench platform-thread-workbench--summary${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      <div className="platform-thread-workbench__summary-list">
        {sections.map((section) => (
          <section key={section.id} className="platform-thread-workbench__summary-section">
            <div className="platform-thread-workbench__summary-heading">
              <div className="platform-thread-workbench__summary-copy">
                <h2>{section.title}</h2>
                {section.description ? <p>{section.description}</p> : null}
              </div>
              {section.meta ? (
                <div className="platform-thread-workbench__summary-meta">{section.meta}</div>
              ) : null}
            </div>
            {section.content ? (
              <div className="platform-thread-workbench__summary-content">{section.content}</div>
            ) : null}
          </section>
        ))}
      </div>
    </section>
  );
}
