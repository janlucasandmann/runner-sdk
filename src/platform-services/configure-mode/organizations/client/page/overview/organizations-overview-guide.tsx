import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { PlatformPageHero } from "../../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";

interface OrganizationsOverviewGuideProps {
  organizationCount: number;
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

export function OrganizationsOverviewGuide({
  organizationCount,
  onCreate,
  onBrowse,
  onOpenDocumentation,
}: OrganizationsOverviewGuideProps) {
  return (
    <section className="organizations-overview-guide" aria-label="Get started with Organizations">
      <PlatformPageHero
        className="organizations-overview-guide__hero"
        title="Coordinate work across organizations"
        description="Bring members, resources, usage, and billing into governed workspaces with clear ownership and access."
      />

      <div className="organizations-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <Building2 width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Organizations</h2>
          <p className="platform-ui-card__feature-description">
            Create company-wide workspaces for people, agents, computers, projects, and shared
            operational resources.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Create an Organization" onClick={onCreate} />
            <GuideLink
              label="Browse Organizations"
              meta={`${organizationCount} ${organizationCount === 1 ? "organization" : "organizations"}`}
              onClick={onBrowse}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <ShieldCheck width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Governance and Billing</h2>
          <p className="platform-ui-card__feature-description">
            Manage roles, resource access, subscription plans, and usage from one organization-level
            control plane.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink label="Organization Documentation" onClick={onOpenDocumentation} />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
