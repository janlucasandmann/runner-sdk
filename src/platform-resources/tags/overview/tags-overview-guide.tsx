import { ArrowRight, ArrowUpRight, BookOpen, MessagesSquare } from "lucide-react";
import type { ConnectionOverviewRow } from "../../shared/connections/connection-overview-page.js";

interface TagsOverviewGuideProps {
  rows: readonly ConnectionOverviewRow[];
  onOpen: (row: ConnectionOverviewRow) => void;
  quickstartUrl: string;
  documentationUrl: string;
  tutorialUrl: string;
}

const CHANNEL_EXAMPLES = [
  { id: "email", label: "Run tasks by email" },
  { id: "telegram", label: "Operate agents from Telegram" },
  { id: "discord", label: "Coordinate work from Discord" },
] as const;

function ExternalGuideLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="tags-overview-guide__link" href={href} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <ArrowUpRight width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
    </a>
  );
}

export function TagsOverviewGuide({
  rows,
  onOpen,
  quickstartUrl,
  documentationUrl,
  tutorialUrl,
}: TagsOverviewGuideProps) {
  const rowsById = new Map(rows.map((row) => [row.id.toLowerCase(), row]));

  return (
    <section className="tags-overview-guide" aria-label="Get started with Tags">
      <header className="tags-overview-guide__intro">
        <h1 className="tags-overview-guide__heading">Tags</h1>
        <p className="tags-overview-guide__intro-description">
          Connect Email, Telegram, and Discord to start agent tasks and receive results directly in those channels.
        </p>
      </header>
      <div className="tags-overview-guide__cards">
        <article className="tags-overview-guide__card">
          <BookOpen className="tags-overview-guide__icon is-learn" width={28} height={28} strokeWidth={1.6} aria-hidden="true" />
          <h2 className="tags-overview-guide__title">Start with Tags</h2>
          <p className="tags-overview-guide__description">
            Connect communication channels so people can start agent work and receive results without leaving the tools they already use.
          </p>
          <nav className="tags-overview-guide__links" aria-label="Tags learning resources">
            <ExternalGuideLink href={quickstartUrl}>Quickstart</ExternalGuideLink>
            <ExternalGuideLink href={documentationUrl}>Documentation</ExternalGuideLink>
            <ExternalGuideLink href={tutorialUrl}>Event-driven tutorial</ExternalGuideLink>
          </nav>
        </article>

        <article className="tags-overview-guide__card">
          <MessagesSquare className="tags-overview-guide__icon is-examples" width={28} height={28} strokeWidth={1.6} aria-hidden="true" />
          <h2 className="tags-overview-guide__title">Channel examples</h2>
          <p className="tags-overview-guide__description">
            Inspect setup, capabilities, and access controls for each supported channel before connecting it.
          </p>
          <div className="tags-overview-guide__links">
            {CHANNEL_EXAMPLES.map((example) => {
              const row = rowsById.get(example.id);
              if (!row) return null;
              return (
                <button key={example.id} type="button" className="tags-overview-guide__link" onClick={() => onOpen(row)}>
                  <span>{example.label}</span>
                  <ArrowRight width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
