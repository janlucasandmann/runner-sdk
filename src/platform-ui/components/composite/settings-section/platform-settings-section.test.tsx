// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  PlatformSettingsDataTable,
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "./platform-settings-section.js";

afterEach(cleanup);

describe("PlatformSettingsSection", () => {
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
});
