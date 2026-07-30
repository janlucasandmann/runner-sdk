import { PlatformPageHero } from "../../../../../platform-ui/components/composite/page-hero/index.js";

export function TestsOverviewGuide() {
  return (
    <section className="tests-overview-guide" aria-label="Get started with Tests">
      <PlatformPageHero
        className="tests-overview-guide__hero"
        title="Prove every component works before delivery"
      />
    </section>
  );
}
