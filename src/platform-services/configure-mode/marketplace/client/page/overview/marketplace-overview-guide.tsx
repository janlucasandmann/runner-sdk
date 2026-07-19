import { ArrowRight, LibraryBig, Rocket } from "lucide-react";
import { PlatformPageHero } from "../../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";

interface MarketplaceOverviewGuideProps {
  resourceCount: number;
  featuredCount: number;
  onBrowse: () => void;
  onBrowseFeatured: () => void;
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

export function MarketplaceOverviewGuide({
  resourceCount,
  featuredCount,
  onBrowse,
  onBrowseFeatured,
}: MarketplaceOverviewGuideProps) {
  return (
    <section
      className="resource-overview-guide marketplace-overview-guide"
      aria-label="Get started with Marketplace"
    >
      <PlatformPageHero
        className="marketplace-overview-guide__hero"
        title="Start from reusable resources"
        description="Browse production-ready templates for workflows, files, apps, functions, databases, and generated media, then publish them directly into a project."
      />

      <div className="resource-overview-guide__cards marketplace-overview-guide__cards">
        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-cyan" aria-hidden="true">
            <LibraryBig width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Marketplace</h2>
          <p className="platform-ui-card__feature-description">
            Discover reusable building blocks with clear setup requirements, capabilities, and
            expected outputs.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink
              label="Browse Resources"
              meta={`${resourceCount} ${resourceCount === 1 ? "resource" : "resources"}`}
              onClick={onBrowse}
            />
          </div>
        </PlatformUiCard>

        <PlatformUiCard as="article" variant="feature">
          <span className="platform-ui-card__feature-icon is-blue" aria-hidden="true">
            <Rocket width={34} height={34} strokeWidth={1.6} />
          </span>
          <h2 className="platform-ui-card__feature-title">Project-ready Templates</h2>
          <p className="platform-ui-card__feature-description">
            Start with curated resources, preview how they work, and publish the right template
            into an existing project.
          </p>
          <div className="platform-ui-card__feature-links">
            <GuideLink
              label="View Featured Resources"
              meta={`${featuredCount} featured`}
              onClick={onBrowseFeatured}
            />
          </div>
        </PlatformUiCard>
      </div>
    </section>
  );
}
