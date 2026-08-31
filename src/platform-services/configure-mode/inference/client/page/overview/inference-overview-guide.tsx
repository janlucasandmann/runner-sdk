import { ArrowRight, CloudCog, HardDrive } from "../../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { PlatformPageHero } from "../../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";

interface InferenceOverviewGuideProps {
  externalCount: number;
  localCount: number;
  onConfigureExternal: () => void;
  onBrowseAll: () => void;
  onBrowseLocal: () => void;
}

function GuideLink({
  label,
  meta,
  onClick,
}: {
  label: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="platform-ui-card__feature-link" onClick={onClick}>
      <span className="platform-ui-card__feature-link-label">{label}</span>
      <span className="platform-ui-card__feature-link-end">
        {meta ? <span className="platform-ui-card__feature-link-meta">{meta}</span> : null}
        <ArrowRight width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
      </span>
    </button>
  );
}

export function InferenceOverviewGuide({
  externalCount,
  localCount,
  onConfigureExternal,
  onBrowseAll,
  onBrowseLocal,
}: InferenceOverviewGuideProps) {
  return (
    <section className="resource-overview-guide inference-overview-guide" aria-label="Get started with Inference">
      <PlatformPageHero
        className="inference-overview-guide__hero"
        title="Route models through your infrastructure"
        description="Connect organization-managed or local inference endpoints, validate their health, and control which models are available to agents."
      />

      <div className="resource-overview-guide__cards inference-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <CloudCog width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">External Inference</h2>
          <p className="platform-ui-card__feature-description">
            Route compatible model traffic through an organization-managed OpenAI-compatible,
            vLLM, TGI, Ollama, or custom endpoint.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Configure Endpoint" onClick={onConfigureExternal} />
            <GuideLink
              label="Browse Endpoints"
              meta={`${externalCount} external`}
              onClick={onBrowseAll}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <HardDrive width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Local Inference</h2>
          <p className="platform-ui-card__feature-description">
            Inspect inference runtimes exposed by paired local runners, including provider,
            health, available models, and workspace bindings.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink
              label="View Local Endpoints"
              meta={`${localCount} ${localCount === 1 ? "endpoint" : "endpoints"}`}
              onClick={onBrowseLocal}
            />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
