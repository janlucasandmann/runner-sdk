import { ArrowRight, Cable, Tag } from "lucide-react";
import { PlatformPageHero } from "../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../platform-ui/components/composite/ui-card/index.js";
import type { ConnectionOverviewRow } from "../../shared/connections/connection-overview-page.js";

interface TagsOverviewGuideProps {
  tagRows: readonly ConnectionOverviewRow[];
  pluginRows: readonly ConnectionOverviewRow[];
  onOpenTag: (row: ConnectionOverviewRow) => void;
  onOpenPlugin: (row: ConnectionOverviewRow) => void;
}

const TAG_EXAMPLES = [
  { id: "email", label: "Explore Email" },
  { id: "telegram", label: "Explore Telegram" },
  { id: "discord", label: "Explore Discord" },
] as const;

const PLUGIN_EXAMPLES = [
  { id: "github", label: "Explore GitHub" },
  { id: "notion", label: "Explore Notion" },
  { id: "google-drive", label: "Explore Google Drive" },
] as const;

function ConnectionLinks({
  examples,
  rows,
  onOpen,
}: {
  examples: readonly { id: string; label: string }[];
  rows: readonly ConnectionOverviewRow[];
  onOpen: (row: ConnectionOverviewRow) => void;
}) {
  const rowsById = new Map(rows.map((row) => [row.id.toLowerCase(), row]));
  return (
    <div className="platform-ui-card__feature-links">
      {examples.map((example) => {
        const row = rowsById.get(example.id);
        if (!row) return null;
        return (
          <button
            key={example.id}
            type="button"
            className="platform-ui-card__feature-link"
            onClick={() => onOpen(row)}
          >
            <span className="platform-ui-card__feature-link-label">{example.label}</span>
            <span className="platform-ui-card__feature-link-end">
              <ArrowRight width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TagsOverviewGuide({
  tagRows,
  pluginRows,
  onOpenTag,
  onOpenPlugin,
}: TagsOverviewGuideProps) {
  return (
    <section className="tags-overview-guide" aria-label="Get started with Tags and Plugins">
      <PlatformPageHero
        className="tags-overview-guide__hero"
        title="Connect agents everywhere"
        description="Use Tags to invoke agents from communication channels and Plugins to connect the external services agents use while working."
      />
      <div className="tags-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <Tag width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Tags</h2>
          <p className="platform-ui-card__feature-description">
            Give agents identities in communication channels. Messages can start or continue threads, with results returned to the same conversation.
          </p>
          <ConnectionLinks examples={TAG_EXAMPLES} rows={tagRows} onOpen={onOpenTag} />
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <Cable width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Plugins</h2>
          <p className="platform-ui-card__feature-description">
            Connect repositories, knowledge bases, and cloud storage so agents can use external context and provider actions while completing work.
          </p>
          <ConnectionLinks examples={PLUGIN_EXAMPLES} rows={pluginRows} onOpen={onOpenPlugin} />
        </PlatformUiCard>
      </div>
    </section>
  );
}
