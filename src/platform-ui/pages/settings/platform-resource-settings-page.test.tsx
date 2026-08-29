// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
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
        attributes: [{ id: "updated", label: "Updated", value: "Today" }],
      }}
      detailsSidebarAriaLabel="Knowledge Library details"
    />,
  );
  return { ...result, onTitleChange, onDescriptionChange, titleRef };
}

describe("PlatformResourceSettingsPage", () => {
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
    expect(screen.getByText("Updated")).not.toBeNull();

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

  it("keeps identity and Access mounted while hiding optional settings and the sidebar", () => {
    const { container } = renderSettings(true);
    const page = screen.getByRole("region", { name: "Knowledge Library settings" });

    expect(page.classList.contains("is-access-detail-open")).toBe(true);
    expect(screen.getByText("Access section")).not.toBeNull();
    expect(screen.getByRole("textbox", { name: "Knowledge library name" })).not.toBeNull();
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
