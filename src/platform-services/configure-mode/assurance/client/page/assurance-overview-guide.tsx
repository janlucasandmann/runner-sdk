import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { PlatformPageHero } from "../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";

interface AssuranceOverviewGuideProps {
  policyCount: number;
  passedRunCount: number;
  blockedRunCount: number;
  onCreate: () => void;
  onBrowse: () => void;
  onShowBlocked: () => void;
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

export function AssuranceOverviewGuide({
  policyCount,
  passedRunCount,
  blockedRunCount,
  onCreate,
  onBrowse,
  onShowBlocked,
}: AssuranceOverviewGuideProps) {
  return (
    <section className="assurance-overview-guide" aria-label="Assurance overview">
      <PlatformPageHero
        className="assurance-overview-guide__hero"
        title="Ship only what the evidence proves."
        description="Assurance combines immutable Test, Evaluation, and Agent Optimization evidence into one project- and commit-bound release decision."
      />
      <div className="assurance-overview-guide__cards">
        <PlatformUiCard variant="feature" className="assurance-guide-card">
          <div className="platform-ui-card__feature-icon is-blue">
            <ShieldCheck width={24} height={24} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <div className="platform-ui-card__feature-copy">
            <span className="platform-ui-card__feature-kicker">Release policy</span>
            <h2 className="platform-ui-card__feature-title">Define the evidence boundary</h2>
            <p className="platform-ui-card__feature-description">
              Pin exact verification versions, thresholds, freshness, budget, and human approval requirements.
            </p>
          </div>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Create Assurance Policy" onClick={onCreate} />
            <GuideLink label="Browse Policies" meta={`${policyCount}`} onClick={onBrowse} />
          </div>
        </PlatformUiCard>
        <PlatformUiCard variant="feature" className="assurance-guide-card">
          <div className="platform-ui-card__feature-icon is-green">
            <BadgeCheck width={24} height={24} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <div className="platform-ui-card__feature-copy">
            <span className="platform-ui-card__feature-kicker">Release decisions</span>
            <h2 className="platform-ui-card__feature-title">Audit every decision</h2>
            <p className="platform-ui-card__feature-description">
              Every outcome is rebuilt from authoritative rows, fingerprinted, and retained with its approval history.
            </p>
          </div>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Passed Runs" meta={`${passedRunCount}`} onClick={onBrowse} />
            <GuideLink label="Awaiting Approval" meta={`${blockedRunCount}`} onClick={onShowBlocked} />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
