import { ArrowRight, ArrowUpRight, BookOpen, MessagesSquare } from "lucide-react";
import { PlatformPageHero } from "../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../platform-ui/components/composite/ui-card/index.js";
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
    <a
      className="platform-ui-card__feature-link"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="platform-ui-card__feature-link-label">{children}</span>
      <span className="platform-ui-card__feature-link-end">
        <ArrowUpRight width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
      </span>
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
      <PlatformPageHero
        className="tags-overview-guide__hero"
        title="Tags"
        description="Connect Email, Telegram, and Discord to start agent tasks and receive results directly in those channels."
      />
      <div className="tags-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <BookOpen width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Start with Tags</h2>
          <p className="platform-ui-card__feature-description">
            Connect communication channels so people can start agent work and receive results without leaving the tools they already use.
          </p>
          <nav
            className="platform-ui-card__feature-links"
            aria-label="Tags learning resources"
          >
            <ExternalGuideLink href={quickstartUrl}>Quickstart</ExternalGuideLink>
            <ExternalGuideLink href={documentationUrl}>Documentation</ExternalGuideLink>
            <ExternalGuideLink href={tutorialUrl}>Event-driven tutorial</ExternalGuideLink>
          </nav>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <MessagesSquare width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Channel examples</h2>
          <p className="platform-ui-card__feature-description">
            Inspect setup, capabilities, and access controls for each supported channel before connecting it.
          </p>
          <div className="platform-ui-card__feature-links">
            {CHANNEL_EXAMPLES.map((example) => {
              const row = rowsById.get(example.id);
              if (!row) return null;
              return (
                <button
                  key={example.id}
                  type="button"
                  className="platform-ui-card__feature-link"
                  onClick={() => onOpen(row)}
                >
                  <span className="platform-ui-card__feature-link-label">
                    {example.label}
                  </span>
                  <span className="platform-ui-card__feature-link-end">
                    <ArrowRight
                      width={14}
                      height={14}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
