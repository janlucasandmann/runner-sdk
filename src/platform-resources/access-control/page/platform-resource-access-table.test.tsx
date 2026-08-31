// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
  PLATFORM_ALL_AGENTS_PROFILE_IMAGE_URL,
  type PlatformAccessPrincipal,
} from "../domain/access-principals.js";
import { PlatformResourceAccessTable } from "./platform-resource-access-table.js";

afterEach(cleanup);

const teams: PlatformAccessPrincipal[] = [
  {
    id: "team_platform",
    name: "Platform",
    kind: "team",
    description: "4 members",
    profileImageUrl: "/img/teams/platform.webp",
    createdAt: "2026-07-22T08:00:00.000Z",
  },
];

describe("PlatformResourceAccessTable", () => {
  it("always renders both immutable system principals before physical teams", () => {
    render(
      <PlatformResourceAccessTable
        teams={teams}
        resourceLabel="Function"
        onOpenPermissions={vi.fn()}
      />,
    );

    const table = screen.getByRole("table", { name: "Function access" });
    expect(within(table).getByText("All Agents")).not.toBeNull();
    expect(within(table).getByText("All Organization Members")).not.toBeNull();
    expect(within(table).getByText("Platform")).not.toBeNull();
    const teamAvatar = table.querySelector(
      '.platform-resource-access-table__principal-avatar-image[src="/img/teams/platform.webp"]',
    );
    expect(teamAvatar).not.toBeNull();
    expect(
      table.querySelector(
        `.platform-resource-access-table__principal-avatar-image[src="${PLATFORM_ALL_AGENTS_PROFILE_IMAGE_URL}"]`,
      ),
    ).not.toBeNull();
    expect(within(table).queryByText("4 members")).toBeNull();
    expect(
      (
        within(table).getByRole("checkbox", {
          name: "All Agents is always included",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        within(table).getByRole("checkbox", {
          name: "All Organization Members is always included",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    within(table)
      .getAllByRole("checkbox")
      .forEach((checkbox) => {
        expect(checkbox.getAttribute("data-platform-checkbox")).toBe("true");
        expect(checkbox.classList.contains("platform-checkbox")).toBe(true);
      });
  });

  it("opens system-principal policies and only selects physical teams", async () => {
    const user = userEvent.setup();
    const onOpenPermissions = vi.fn();
    const onSelectedIdsChange = vi.fn();
    render(
      <PlatformResourceAccessTable
        teams={teams}
        resourceLabel="Function"
        onOpenPermissions={onOpenPermissions}
        onSelectedIdsChange={onSelectedIdsChange}
      />,
    );

    const table = screen.getByRole("table", { name: "Function access" });
    await user.click(within(table).getByText("All Organization Members"));
    expect(onOpenPermissions).toHaveBeenCalledWith(
      expect.objectContaining({
        id: PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
        locked: true,
      }),
    );

    await user.click(
      within(table).getByRole("checkbox", { name: "Select Platform" }),
    );
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(
      new Set(["team_platform"]),
    );
    expect(
      (
        within(table).getByRole("checkbox", {
          name: "All Agents is always included",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it("places search and Add Teams on a dedicated row beneath the title", () => {
    const { container } = render(
      <PlatformResourceAccessTable
        teams={teams}
        resourceLabel="Function"
        trailing={<button type="button">Add Teams</button>}
        onOpenPermissions={vi.fn()}
      />,
    );

    const controls = container.querySelector(
      ".platform-data-table__toolbar-controls",
    );
    const title = container.querySelector(
      ".platform-resource-access-table__heading",
    );
    const accessContainer = container.querySelector(
      ".platform-resource-access-table__container",
    );
    const addTeams = screen.getByRole("button", { name: "Add Teams" });
    const search = screen.getByRole("searchbox", { name: "Search access" });
    const table = screen.getByRole("table", { name: "Function access" });

    expect(title?.textContent).toBe("Manage Function Access");
    expect(
      screen.getByText(
        "Choose which organization roles and teams can access and manage this Function.",
      ),
    ).not.toBeNull();
    expect(screen.queryByRole("button", { name: /About Manage Function Access/i })).toBeNull();
    expect(accessContainer?.contains(title)).toBe(false);
    expect(accessContainer?.contains(controls)).toBe(true);
    expect(accessContainer?.contains(table)).toBe(true);
    expect(controls?.firstElementChild?.contains(search)).toBe(true);
    expect(controls?.lastElementChild?.contains(addTeams)).toBe(true);
  });

  it("renders a shared leading toolbar control in place of a page-specific title", () => {
    render(
      <PlatformResourceAccessTable
        teams={teams}
        resourceLabel="Agent"
        title={null}
        leading={<button type="button">Access</button>}
        onOpenPermissions={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Access" })).not.toBeNull();
    expect(screen.queryByText("Manage Agent Access")).toBeNull();
  });

  it("renders contextual help as visible section copy without a tooltip", () => {
    render(
      <PlatformResourceAccessTable
        teams={teams}
        resourceLabel="Agent"
        titleTooltip="Explains who can manage this agent."
        onOpenPermissions={vi.fn()}
      />,
    );

    expect(screen.getByText("Explains who can manage this agent.")).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "About Manage Agent Access" }),
    ).toBeNull();
  });

  it("renders the centralized footer when pagination is enabled", () => {
    render(
      <PlatformResourceAccessTable
        teams={teams}
        resourceLabel="Agent"
        pagination={{}}
        onOpenPermissions={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Agent access pagination" }),
    ).not.toBeNull();
  });
});
