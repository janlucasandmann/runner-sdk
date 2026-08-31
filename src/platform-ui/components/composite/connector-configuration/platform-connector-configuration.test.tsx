// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PlatformConnectorConfiguration,
  PlatformConnectorConfigurationRow,
  PlatformConnectorConfigurationSection,
} from "./platform-connector-configuration.js";

afterEach(cleanup);

describe("PlatformConnectorConfiguration", () => {
  it("owns the shared card and row hierarchy", () => {
    const { container } = render(
      <PlatformConnectorConfiguration title="acme/repository" metadata="Repository">
        <PlatformConnectorConfigurationRow
          title="Base branch"
          description="Branch used as the starting point."
        >
          <button type="button">main</button>
        </PlatformConnectorConfigurationRow>
      </PlatformConnectorConfiguration>,
    );

    expect(
      container.querySelector("[data-platform-connector-configuration='true']"),
    ).not.toBeNull();
    expect(
      container.querySelector("[data-platform-connector-configuration-row='true']"),
    ).not.toBeNull();
    expect(screen.getByText("acme/repository")).not.toBeNull();
    expect(screen.getByText("Repository")).not.toBeNull();
    expect(screen.getByRole("button", { name: "main" })).not.toBeNull();
  });

  it("renders a shared synchronization indicator before a pending row control", () => {
    const { container } = render(
      <PlatformConnectorConfiguration title="Product strategy">
        <PlatformConnectorConfigurationRow
          title="Sync to Notion"
          pending
          pendingLabel="Synchronizing Product strategy"
        >
          <button type="button">Toggle</button>
        </PlatformConnectorConfigurationRow>
      </PlatformConnectorConfiguration>,
    );

    const control = container.querySelector(".platform-connector-configuration__control");
    const spinner = screen.getByRole("img", { name: "Synchronizing Product strategy" });
    expect(spinner.getAttribute("src")).toBe("/img/spinner.svg");
    expect(control?.firstElementChild).toBe(spinner);
    expect(control?.lastElementChild).toBe(screen.getByRole("button", { name: "Toggle" }));
  });

  it("supports a headerless plain attribute-list presentation", () => {
    const { container } = render(
      <PlatformConnectorConfiguration
        title="acme/repository"
        surface="plain"
        showHeader={false}
      >
        <PlatformConnectorConfigurationRow title="Base branch">
          <button type="button">main</button>
        </PlatformConnectorConfigurationRow>
      </PlatformConnectorConfiguration>,
    );

    const configuration = container.querySelector(
      "[data-platform-connector-configuration='true']",
    );
    expect(configuration?.getAttribute("data-platform-connector-configuration-surface")).toBe(
      "plain",
    );
    expect(configuration?.querySelector(".platform-connector-configuration__header")).toBeNull();
    expect(screen.queryByText("acme/repository")).toBeNull();
    expect(screen.getByRole("button", { name: "main" })).toBeTruthy();
  });

  it("groups related connector policies into semantic sections", () => {
    const { container } = render(
      <PlatformConnectorConfiguration title="acme/repository" surface="plain" showHeader={false}>
        <PlatformConnectorConfigurationSection
          title="Version synchronization"
          description="Keep exact revisions aligned."
        >
          <PlatformConnectorConfigurationRow title="Base branch">
            <button type="button">main</button>
          </PlatformConnectorConfigurationRow>
        </PlatformConnectorConfigurationSection>
      </PlatformConnectorConfiguration>,
    );

    const section = container.querySelector(
      "[data-platform-connector-configuration-section='true']",
    );
    expect(section).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Version synchronization" })).toBeTruthy();
    expect(screen.getByText("Keep exact revisions aligned.")).toBeTruthy();
    expect(section?.querySelector("[data-platform-connector-configuration-row='true']")).toBeTruthy();
  });

  it("opens a minimal scoped menu and disconnects the connector", async () => {
    const onDisconnect = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <PlatformConnectorConfiguration
        title="Strategy database"
        actionLabel="Actions for Strategy database"
        onDisconnect={onDisconnect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Actions for Strategy database" }));
    const menu = screen.getByRole("menu", { name: "Actions for Strategy database" });
    expect(menu.closest(".platform-popup-surface")?.classList.contains("is-minimal")).toBe(true);
    fireEvent.click(screen.getByRole("menuitem", { name: "Disconnect connector" }));

    await waitFor(() => expect(onDisconnect).toHaveBeenCalledOnce());
    expect(container.querySelector("[aria-expanded='true']")).toBeNull();
  });
});
