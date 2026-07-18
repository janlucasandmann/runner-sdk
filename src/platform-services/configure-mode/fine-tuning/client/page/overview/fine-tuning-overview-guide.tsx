import { ArrowRight, ChartColumnIncreasing, TestTubeDiagonal } from "lucide-react";
import { PlatformPageHero } from "../../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";

interface FineTuningOverviewGuideProps {
  jobCount: number;
  onCreate: () => void;
  onBrowse: () => void;
  onShowCompleted: () => void;
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

export function FineTuningOverviewGuide({
  jobCount,
  onCreate,
  onBrowse,
  onShowCompleted,
}: FineTuningOverviewGuideProps) {
  return (
    <section className="fine-tuning-overview-guide" aria-label="Get started with Fine-tuning">
      <PlatformPageHero
        className="fine-tuning-overview-guide__hero"
        title="Improve agents with evaluated evidence"
        description="Turn measured agent performance into focused training jobs, then verify every new version against the evaluation sets that matter."
      />

      <div className="fine-tuning-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <TestTubeDiagonal width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Fine-tuning Jobs</h2>
          <p className="platform-ui-card__feature-description">
            Create targeted training jobs from evaluated examples and track each job from
            preparation through verification.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Start Fine-tuning" onClick={onCreate} />
            <GuideLink
              label="Browse Jobs"
              meta={`${jobCount} ${jobCount === 1 ? "job" : "jobs"}`}
              onClick={onBrowse}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <ChartColumnIncreasing width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Evaluation-driven Training</h2>
          <p className="platform-ui-card__feature-description">
            Compare baseline and verification scores so every promoted version is backed by
            measurable improvement.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Review Completed Jobs" onClick={onShowCompleted} />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
