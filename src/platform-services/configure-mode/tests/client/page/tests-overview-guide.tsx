import { ArrowRight, FlaskConical, ShieldCheck } from "lucide-react";
import { PlatformPageHero } from "../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";

interface TestsOverviewGuideProps {
  planCount: number;
  passedRunCount: number;
  onCreate: () => void;
  onBrowse: () => void;
  onShowPassed: () => void;
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

export function TestsOverviewGuide({
  planCount,
  passedRunCount,
  onCreate,
  onBrowse,
  onShowPassed,
}: TestsOverviewGuideProps) {
  return (
    <section className="tests-overview-guide" aria-label="Get started with Tests">
      <PlatformPageHero
        className="tests-overview-guide__hero"
        title="Prove every component works before delivery"
        description="Create versioned engineering test plans, execute them in Computer Agents environments, and retain case-level evidence linked to projects, tickets, releases, and commits."
      />

      <div className="tests-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <FlaskConical width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Test Plans</h2>
          <p className="platform-ui-card__feature-description">
            Define command, contract, integration, browser, agent, and security
            checks once, then publish an immutable version for every run.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Create a Test Plan" onClick={onCreate} />
            <GuideLink
              label="Browse Test Plans"
              meta={`${planCount} ${planCount === 1 ? "plan" : "plans"}`}
              onClick={onBrowse}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <ShieldCheck width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Verification Evidence</h2>
          <p className="platform-ui-card__feature-description">
            Inspect real exit codes, logs, traces, screenshots, artifacts, and a
            server-signed evidence fingerprint before Mission Control advances.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink
              label="View Plans with Passing Runs"
              meta={`${passedRunCount} passed`}
              onClick={onShowPassed}
            />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
