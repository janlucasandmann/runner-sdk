// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformResourceSettingsPage } from "./platform-resource-settings-page.js";

afterEach(() => {
  document.body.innerHTML = "";
});

function renderSettings(accessDetailOpen = false) {
  const onTitleChange = vi.fn();
  const onDescriptionChange = vi.fn();
  const titleRef = createRef<HTMLTextAreaElement>();
  const result = render(
    <PlatformResourceSettingsPage
      ariaLabel="Knowledge Library settings"
      identity={{
        icon: <span>K</span>,
        title: "Project delivery knowledge",
        description: "Durable project context",
        titleAriaLabel: "Knowledge library name",
        descriptionAriaLabel: "Knowledge library description",
        titleRef,
        onTitleChange,
        onDescriptionChange,
      }}
      location={<section>Location section</section>}
      connectors={<section>Connectors section</section>}
      additionalSections={<section>Retention section</section>}
      access={<section>Access section</section>}
      accessDetailOpen={accessDetailOpen}
      details={{
        variant: "standard",
        customAttributes: [{ id: "status", label: "Status", value: "Ready" }],
        updatedAt: "2020-04-15T10:30:00.000Z",
        creator: { value: "creator-1", name: "Creator Name" },
        owner: { value: "owner-1", name: "Owner Name" },
        primaryActions: [{ id: "open", label: "Open", onSelect: vi.fn() }],
      }}
      detailsSidebarAriaLabel="Knowledge Library details"
      detailsSidebarClassName="knowledge-detail-sidebar playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar"
    />,
  );
  return { ...result, onTitleChange, onDescriptionChange, titleRef };
}

describe("PlatformResourceSettingsPage", () => {
  it("sticks its details sidebar from the initial settings-tab position", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/platform-ui/pages/settings/resource-settings-page.css"),
      "utf8",
    );

    expect(css).toMatch(
      /\.platform-resource-settings-page > \.platform-detail-sidebar\.platform-resource-settings-page__sidebar\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*var\(--platform-resource-settings-top-inset\);[\s\S]*?margin:\s*0;[\s\S]*?padding:\s*0;/,
    );
    expect(css).toMatch(
      /\.platform-resource-settings-page__sidebar-content\s*\{[\s\S]*?margin:\s*0;[\s\S]*?padding:\s*0;/,
    );
  });

  it("owns one invariant desktop details-sidebar width", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/platform-ui/pages/settings/resource-settings-page.css"),
      "utf8",
    );

    expect(css).toMatch(/--platform-resource-settings-sidebar-width:\s*340px;/);
    expect(css).toMatch(
      /grid-template-columns:\s*minmax\(0, 1fr\) var\(--platform-resource-settings-sidebar-width\);/,
    );
    expect(css).toMatch(
      /\.platform-resource-settings-page__sidebar-content\s*\{[\s\S]*?width:\s*100%;/,
    );
    expect(css).toMatch(
      /\.platform-resource-settings-page__sidebar-content > \.platform-resource-detail-sidebar\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*none;/,
    );
  });

  it("keeps the Agent Settings identity avatar circular without changing other resources", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/platform-ui/pages/settings/resource-settings-page.css"),
      "utf8",
    );

    expect(css).toMatch(
      /\.platform-resource-settings-page\.playground-agent-resource-settings[\s\S]*?\.platform-resource-settings-identity__icon[\s\S]*?border-radius:\s*50%;/,
    );
  });

  it("owns the canonical identity, ordered settings slots, access, and details sidebar", () => {
    const { container, onTitleChange, onDescriptionChange, titleRef } = renderSettings();
    const page = screen.getByRole("region", { name: "Knowledge Library settings" });

    expect(page.getAttribute("data-platform-resource-settings-page")).toBe("true");
    expect(
      container.querySelector("[data-platform-resource-settings-identity='true']"),
    ).not.toBeNull();
    expect(
      Array.from(container.querySelectorAll("[data-platform-resource-settings-slot]")).map((slot) =>
        slot.getAttribute("data-platform-resource-settings-slot"),
      ),
    ).toEqual(["location", "connectors", "additional", "access"]);
    expect(screen.getByRole("complementary", { name: "Knowledge Library details" })).not.toBeNull();
    const sidebar = screen.getByRole("complementary", {
      name: "Knowledge Library details",
    });
    const sidebarContent = container.querySelector(
      "[data-platform-resource-settings-sidebar-content='true']",
    );
    expect(sidebar.classList.contains("playground-project-overview-sidebar")).toBe(false);
    expect(sidebarContent?.classList.contains("playground-project-overview-sidebar")).toBe(true);
    expect(screen.getByText("Status")).not.toBeNull();
    expect(screen.getByText("Updated")).not.toBeNull();
    expect(screen.getByText("Creator")).not.toBeNull();
    expect(screen.getByText("Owner")).not.toBeNull();
    expect(screen.getByText("Scope")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Open" }).querySelector("svg")).toBeNull();

    const title = screen.getByRole("textbox", { name: "Knowledge library name" });
    expect(titleRef.current).toBe(title);
    expect(title.tagName).toBe("TEXTAREA");
    expect((title as HTMLTextAreaElement).rows).toBe(1);
    fireEvent.change(title, { target: { value: "Long\nwrapped title" } });
    expect(onTitleChange).toHaveBeenLastCalledWith("Long wrapped title");

    fireEvent.change(screen.getByRole("textbox", { name: "Knowledge library description" }), {
      target: { value: "First line\nSecond line" },
    });
    expect(onDescriptionChange).toHaveBeenLastCalledWith("First line\nSecond line");
  });

  it("promotes Access to a dedicated page without the parent identity or sidebar", () => {
    const { container } = renderSettings(true);
    const page = screen.getByRole("region", { name: "Knowledge Library settings" });

    expect(page.classList.contains("is-access-detail-open")).toBe(true);
    expect(screen.getByText("Access section")).not.toBeNull();
    expect(
      screen.queryByRole("textbox", { name: "Knowledge library name" }),
    ).toBeNull();
    expect(screen.queryByText("Location section")).toBeNull();
    expect(screen.queryByText("Connectors section")).toBeNull();
    expect(screen.queryByText("Retention section")).toBeNull();
    expect(
      screen.queryByRole("complementary", {
        name: "Knowledge Library details",
      }),
    ).toBeNull();
    expect(
      container.querySelector("[data-platform-resource-settings-slot='access']"),
    ).not.toBeNull();
  });
});
