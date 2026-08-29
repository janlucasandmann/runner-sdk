import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pageStylePaths = [
  ["detail", new URL("./details/resource-detail.css", import.meta.url)],
  ["home", new URL("./home/platform-home.css", import.meta.url)],
  ["overview", new URL("./overview/resource-overview.css", import.meta.url)],
  ["settings", new URL("./settings/resource-settings-page.css", import.meta.url)],
] as const;

describe("platform page width contract", () => {
  it.each(pageStylePaths)("%s pages use the shared content max-width token", (_kind, styleUrl) => {
    const styles = fs.readFileSync(fileURLToPath(styleUrl), "utf8");

    expect(styles).toContain("var(--platform-page-content-max-width, 87.5rem)");
  });
});

describe("resource Settings page shell integration", () => {
  it("owns the only page inset inside file resource detail pages", () => {
    const settingsCss = fs.readFileSync(
      fileURLToPath(new URL("./settings/resource-settings-page.css", import.meta.url)),
      "utf8",
    );

    expect(settingsCss).toMatch(
      /\.file-resource-detail-page\.is-settings-tab:has\(\.platform-resource-settings-page\)\s*\{[\s\S]{0,80}padding:\s*0;/,
    );
  });
});
