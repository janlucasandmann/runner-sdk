import { ArrowRight, ShieldCheck, UsersRound } from "lucide-react";
import { PlatformPageHero } from "../../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";

interface TeamsOverviewGuideProps {
  teamCount: number;
  onCreate: () => void;
  onBrowse: () => void;
  onOpenDocumentation: () => void;
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

export function TeamsOverviewGuide({
  teamCount,
  onCreate,
  onBrowse,
  onOpenDocumentation,
}: TeamsOverviewGuideProps) {
  return (
    <section className="teams-overview-guide" aria-label="Get started with Teams">
      <PlatformPageHero
        className="teams-overview-guide__hero"
        title="Coordinate work across teams"
        description="Create focused groups, share the resources they need, and control how every member can work across your organization."
      />

      <div className="teams-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <UsersRound width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Teams</h2>
          <p className="platform-ui-card__feature-description">
            Bring people together around shared agents, computers, projects, and workflows without
            duplicating resources.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Create a Team" onClick={onCreate} />
            <GuideLink
              label="Browse Teams"
              meta={`${teamCount} ${teamCount === 1 ? "team" : "teams"}`}
              onClick={onBrowse}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <ShieldCheck width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Roles and Access</h2>
          <p className="platform-ui-card__feature-description">
            Define ownership, assign member roles, and keep resource permissions aligned with each
            team&apos;s responsibilities.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Team Documentation" onClick={onOpenDocumentation} />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
