// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { PlatformAgentSelector, PlatformAgentSelectorPopup } from "./platform-agent-selector.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const OPTIONS = [
  {
    value: "agent_1",
    name: "Bounded optimization target delivery specialist",
    avatarUrl: "/img/agent-profile-pics/forge.webp",
    searchText: "Agent",
  },
  {
    value: "squad_1",
    name: "Research squad",
    searchText: "Agent squad",
  },
] as const;

describe("PlatformAgentSelector", () => {
  it("uses the ticket-detail selector surface with search, avatars, and one-line names", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PlatformAgentSelector
        value="agent_1"
        options={OPTIONS}
        onValueChange={onValueChange}
        ariaLabel="Select ticket assignee"
        popupClassName="playground-tasks-detail-assignee-selector-popup"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Select ticket assignee" });
    expect(trigger.textContent).toContain(OPTIONS[0].name);
    expect(trigger.querySelector(".platform-agent-selector__avatar-image")?.getAttribute("src"))
      .toBe(OPTIONS[0].avatarUrl);

    await user.click(trigger);

    const popup = document.body.querySelector(
      ".platform-popup-surface.platform-agent-selector__popup.is-minimal.is-portaled",
    );
    expect(popup).not.toBeNull();
    expect(popup?.classList.contains("playground-tasks-detail-assignee-selector-popup")).toBe(true);
    expect(screen.getByRole("searchbox", { name: "Search agents and squads" })).not.toBeNull();
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(
      screen.getByRole("option", { name: OPTIONS[0].name })
        .querySelector(".platform-agent-selector__option-name")
        ?.getAttribute("title"),
    ).toBe(OPTIONS[0].name);

    await user.click(screen.getByRole("option", { name: OPTIONS[1].name }));
    expect(onValueChange).toHaveBeenCalledWith(
      "squad_1",
      expect.objectContaining({ name: "Research squad" }),
    );
    expect(screen.queryByRole("searchbox", { name: "Search agents and squads" })).toBeNull();
  });

  it("filters a shared popup by name and searchable metadata", () => {
    render(
      <PlatformAgentSelectorPopup
        value="agent_1"
        options={OPTIONS}
        ariaLabel="Agents and squads"
      />,
    );

    const search = screen.getByRole("searchbox", { name: "Search agents and squads" });
    fireEvent.change(search, { target: { value: "squad" } });

    expect(screen.queryByRole("option", { name: OPTIONS[0].name })).toBeNull();
    expect(screen.getByRole("option", { name: OPTIONS[1].name })).not.toBeNull();
  });
});
