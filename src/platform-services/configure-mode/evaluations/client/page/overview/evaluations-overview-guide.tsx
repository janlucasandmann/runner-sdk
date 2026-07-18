import { ArrowRight, ChartColumnIncreasing, Play } from "lucide-react";
import { PlatformPageHero } from "../../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";

interface EvaluationsOverviewGuideProps {
  evaluationCount: number;
  onCreate: () => void;
  onBrowse: () => void;
  onShowCompletedRuns: () => void;
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

export function EvaluationsOverviewGuide({
  evaluationCount,
  onCreate,
  onBrowse,
  onShowCompletedRuns,
}: EvaluationsOverviewGuideProps) {
  return (
    <section className="evaluations-overview-guide" aria-label="Get started with Evaluations">
      <PlatformPageHero
        className="evaluations-overview-guide__hero"
        title="Measure agent performance with confidence"
        description="Build repeatable test sets, run them against agents and workflows, and compare quality across versions with consistent scoring."
      />

      <div className="evaluations-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <ChartColumnIncreasing width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Evaluation Sets</h2>
          <p className="platform-ui-card__feature-description">
            Define representative cases, expected outcomes, pass thresholds, and evaluator guidance
            in one reusable dataset.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Create an Evaluation" onClick={onCreate} />
            <GuideLink
              label="Browse Evaluations"
              meta={`${evaluationCount} ${evaluationCount === 1 ? "set" : "sets"}`}
              onClick={onBrowse}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <Play width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Runs and Scoring</h2>
          <p className="platform-ui-card__feature-description">
            Inspect case-level evidence, evaluator reasoning, pass rates, and costs for every
            evaluation run.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="View Evaluations with Runs" onClick={onShowCompletedRuns} />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
