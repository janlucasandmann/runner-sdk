// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  PlatformSettingsDataTable,
  PlatformSettingsSection,
  PlatformSettingsSectionList,
  PlatformSettingsTableSection,
} from "./platform-settings-section.js";

afterEach(cleanup);

describe("PlatformSettingsSection", () => {
  it("uses the shared 14px section title and transparent surfaces", () => {
    const css = readFileSync(
      path.join(
        process.cwd(),
        "src/platform-ui/components/composite/settings-section/settings-section.css",
      ),
      "utf8",
    );

    expect(css).toMatch(
      /\.platform-settings-section__title\s*\{[\s\S]*?font-size:\s*14px;/,
    );
    expect(css).not.toMatch(
      /\.platform-settings-section__header\s*\{[^}]*background:/,
    );
    expect(css).not.toMatch(
      /\.platform-settings-section__body\s*\{[^}]*background:/,
    );
  });

  it("owns the shared settings section structure", () => {
    const { container } = render(
      <PlatformSettingsSectionList aria-label="Runtime settings">
        <PlatformSettingsSection
          title="Runtime Versions"
          icon={<span data-testid="runtime-icon">R</span>}
          actions={<button type="button">Add runtime</button>}
        >
          <span>Node.js 24</span>
        </PlatformSettingsSection>
      </PlatformSettingsSectionList>,
    );

    expect(container.querySelector("[data-platform-settings-section-list='true']")).not.toBeNull();
    expect(container.querySelector("[data-platform-settings-section='true']")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Runtime Versions", level: 2 })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Add runtime" })).not.toBeNull();
    expect(screen.getByText("Node.js 24")).not.toBeNull();
  });

  it("provides the canonical settings table defaults", () => {
    const { container } = render(
      <PlatformSettingsDataTable
        rows={[{ id: "node", value: "24" }]}
        columns={[
          { id: "runtime", header: "Runtime", accessor: "id" },
          { id: "version", header: "Version", accessor: "value" },
        ]}
        getRowId={(row) => row.id}
        ariaLabel="Runtime versions"
      />,
    );

    expect(screen.getByRole("table", { name: "Runtime versions" })).not.toBeNull();
    const tableRoot = container.querySelector(".platform-settings-data-table");
    expect(tableRoot).not.toBeNull();
    expect(tableRoot?.classList.contains("is-minimalistic-ui")).toBe(true);
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(container.querySelector(".platform-data-table__pagination")).toBeNull();
  });

  it("owns the shared resource-management table shell", () => {
    const { container } = render(
      <PlatformSettingsTableSection
        title="Guardrails"
        description="Choose which guardrails apply."
        titleActions={<button type="button">Filter guardrails</button>}
      >
        <div data-testid="guardrail-table">Table</div>
      </PlatformSettingsTableSection>,
    );

    const section = container.querySelector(
      "[data-platform-settings-table-section='true']",
    );
    const surface = container.querySelector(
      ".platform-settings-table-section__surface",
    );
    const table = screen.getByTestId("guardrail-table");
    expect(section).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Guardrails", level: 2 }),
    ).not.toBeNull();
    const titleActions = container.querySelector(
      ".platform-settings-table-section__title-actions",
    );
    expect(
      titleActions?.contains(
        screen.getByRole("button", { name: "Filter guardrails" }),
      ),
    ).toBe(true);
    expect(surface?.contains(table)).toBe(true);

    const help = screen.getByRole("button", { name: "About Guardrails" });
    fireEvent.mouseEnter(help);
    expect(screen.getByRole("tooltip").textContent).toBe(
      "Choose which guardrails apply.",
    );
  });
});
