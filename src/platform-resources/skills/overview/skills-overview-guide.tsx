import { PlatformPageHero } from "../../../platform-ui/components/composite/page-hero/index.js";
import type { ReactNode } from "react";

export function SkillsOverviewGuide({
  title = "Give agents reusable expertise",
}: { title?: ReactNode } = {}) {
  return (
    <section className="skills-overview-guide" aria-label="Get started with Skills">
      <PlatformPageHero
        className="skills-overview-guide__hero"
        title={title}
      />
    </section>
  );
}
