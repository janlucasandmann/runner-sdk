import { ArrowRight, Sparkles, SquarePen } from "lucide-react";
import { PlatformPageHero } from "../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../platform-ui/components/composite/ui-card/index.js";

interface SkillsOverviewGuideProps {
  systemSkillCount: number;
  customSkillCount: number;
  onBrowseSystem: () => void;
  onBrowseCustom: () => void;
  onCreate: () => void;
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

function formatSkillCount(count: number) {
  return `${count} ${count === 1 ? "skill" : "skills"}`;
}

export function SkillsOverviewGuide({
  systemSkillCount,
  customSkillCount,
  onBrowseSystem,
  onBrowseCustom,
  onCreate,
}: SkillsOverviewGuideProps) {
  return (
    <section className="skills-overview-guide" aria-label="Get started with Skills">
      <PlatformPageHero
        className="skills-overview-guide__hero"
        title="Give agents reusable expertise"
        description="Use maintained system skills or create custom guidance that gives agents repeatable workflows, tool knowledge, and execution standards."
      />

      <div className="skills-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <Sparkles width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">System Skills</h2>
          <p className="platform-ui-card__feature-description">
            Start with maintained capabilities for common tools and workflows. System skills are
            ready to enable across agents without additional setup.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink
              label="Browse System Skills"
              meta={formatSkillCount(systemSkillCount)}
              onClick={onBrowseSystem}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <SquarePen width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Custom Skills</h2>
          <p className="platform-ui-card__feature-description">
            Turn your organization&apos;s processes, standards, and domain knowledge into reusable
            instructions agents can apply consistently.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Create a Skill" onClick={onCreate} />
            <GuideLink
              label="Browse Custom Skills"
              meta={formatSkillCount(customSkillCount)}
              onClick={onBrowseCustom}
            />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
