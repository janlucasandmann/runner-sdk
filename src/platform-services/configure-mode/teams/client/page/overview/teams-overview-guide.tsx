import { PlatformPageHero } from "../../../../../../platform-ui/components/composite/page-hero/index.js";

export function TeamsOverviewGuide() {
  return (
    <section className="teams-overview-guide" aria-label="Get started with Teams">
      <PlatformPageHero
        className="teams-overview-guide__hero"
        title="Coordinate work across teams"
        description="Create focused groups, share the resources they need, and control how every member can work across your organization."
      />
    </section>
  );
}
