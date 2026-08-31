// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlatformResourceSettingsPageProps } from "../../../platform-ui/pages/settings/index.js";
import { PlatformFileResourceIdentity } from "../../../platform-ui/pages/details/index.js";
import { ComputerDetailPage } from "./computer-detail-page.js";

afterEach(cleanup);

function createSettings(): PlatformResourceSettingsPageProps {
  return {
    ariaLabel: "Computer settings",
    identity: {
      icon: <span aria-hidden="true">C</span>,
      title: "Build Computer",
      description: "Build and test software",
      onTitleChange: vi.fn(),
      onDescriptionChange: vi.fn(),
    },
    details: {
      variant: "standard",
      customAttributes: [{ id: "status", label: "Status", value: "Stopped" }],
      updatedAt: "2026-08-30T10:00:00.000Z",
      creator: { value: "creator", name: "Creator" },
      owner: { value: "owner", name: "Owner" },
      scope: false,
      primaryActions: [{ id: "open", label: "Open GUI", onSelect: vi.fn() }],
    },
    location: <div>Computer location</div>,
    connectors: <div>GitHub connector</div>,
    access: <div>Computer access</div>,
  };
}

describe("ComputerDetailPage", () => {
  it("falls back to the sidebar-free General page for an unknown legacy tab", () => {
    const { container } = render(
      <ComputerDetailPage
        activeTab={"legacy" as never}
        general={<div>Computer overview</div>}
        runtime={{ value: "RUN apt-get update" }}
        settings={createSettings()}
      />,
    );

    expect(
      container.querySelector(".computer-detail-page.is-general-tab"),
    ).toBeTruthy();
    expect(screen.getByText("Computer overview")).toBeTruthy();
    expect(container.querySelector("[data-platform-detail-sidebar='true']")).toBeNull();
    expect(container.querySelector(".computer-runtime-editor")).toBeNull();
  });

  it("renders Runtime as the centralized full-screen Dockerfile editor", () => {
    const { container } = render(
      <ComputerDetailPage
        activeTab="runtime"
        general={<div>Computer overview</div>}
        metadata={
          <PlatformFileResourceIdentity
            icon={<button type="button">Change computer icon</button>}
            title="Build Computer"
            description="Build and test software"
          />
        }
        runtime={{
          value: "RUN apt-get update",
          readOnly: true,
        }}
        settings={createSettings()}
      />,
    );

    expect(
      container.querySelector(".computer-detail-page.is-runtime-tab"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-platform-file-resource-identity='true']"),
    ).toBeTruthy();
    expect(screen.getByDisplayValue("Build Computer")).toBeTruthy();
    expect(screen.getByDisplayValue("Build and test software")).toBeTruthy();
    expect(
      container.querySelector("[data-platform-code-editor-workspace='true']"),
    ).toBeTruthy();
    expect(
      container.querySelector(
        "[data-platform-monaco-code-editor='true'][data-language='dockerfile']",
      ),
    ).toBeTruthy();
    expect(screen.getAllByText("Dockerfile")).toHaveLength(2);
    expect(
      screen.queryByRole("region", { name: "Computer settings" }),
    ).toBeNull();
  });

  it("keeps the centralized editor shell visible while the effective Dockerfile loads", () => {
    const { container } = render(
      <ComputerDetailPage
        activeTab="runtime"
        general={<div>Computer overview</div>}
        runtime={{ value: "", loading: true }}
        settings={createSettings()}
      />,
    );

    expect(
      container.querySelector(
        ".computer-runtime-editor .platform-code-editor-workspace__file-list.is-loading",
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole("status", { name: "Loading Dockerfile..." }),
    ).toBeTruthy();
  });

  it("renders Settings through the canonical resource Settings page and details sidebar", () => {
    const { container } = render(
      <ComputerDetailPage
        activeTab="settings"
        general={<div>Computer overview</div>}
        runtime={{ value: "" }}
        settings={createSettings()}
      />,
    );

    expect(
      container.querySelector(".computer-detail-page.is-settings-tab"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-platform-resource-settings-page='true']"),
    ).toBeTruthy();
    expect(
      container.querySelector(
        "[data-platform-resource-settings-identity='true']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-platform-detail-sidebar='true']"),
    ).toBeTruthy();
    expect(screen.getByDisplayValue("Build Computer")).toBeTruthy();
    expect(screen.getByText("Computer location")).toBeTruthy();
    expect(screen.getByText("GitHub connector")).toBeTruthy();
    expect(screen.getByText("Computer access")).toBeTruthy();
    expect(container.querySelector(".computer-runtime-editor")).toBeNull();
  });
});
