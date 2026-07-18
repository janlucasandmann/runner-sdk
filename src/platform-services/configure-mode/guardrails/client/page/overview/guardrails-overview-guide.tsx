import { ArrowRight, ListChecks, ShieldCheck } from "lucide-react";
import { PlatformPageHero } from "../../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";

interface GuardrailsOverviewGuideProps {
  guardrailCount: number;
  onCreate: () => void;
  onBrowse: () => void;
  onShowDefaults: () => void;
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

export function GuardrailsOverviewGuide({
  guardrailCount,
  onCreate,
  onBrowse,
  onShowDefaults,
}: GuardrailsOverviewGuideProps) {
  return (
    <section className="guardrails-overview-guide" aria-label="Get started with Guardrails">
      <PlatformPageHero
        className="guardrails-overview-guide__hero"
        title="Set reliable boundaries for agents"
        description="Create reusable safeguards that guide agent behavior, protect sensitive operations, and keep work aligned with your policies."
      />

      <div className="guardrails-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <ShieldCheck width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Guardrail Sets</h2>
          <p className="platform-ui-card__feature-description">
            Group related policies into reusable sets and apply them consistently across agents.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Create a Guardrail Set" onClick={onCreate} />
            <GuideLink
              label="Browse Guardrails"
              meta={`${guardrailCount} ${guardrailCount === 1 ? "set" : "sets"}`}
              onClick={onBrowse}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <ListChecks width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Policies and Prompts</h2>
          <p className="platform-ui-card__feature-description">
            Start with built-in protections, then add precise instructions for your own operational
            requirements.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Review Default Sets" onClick={onShowDefaults} />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
