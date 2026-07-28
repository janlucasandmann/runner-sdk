// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
  PlatformResourceAccessSettings,
} from "../../access-control/index.js";
import { TagDetailPage } from "./tag-detail-page.js";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fill: vi.fn(),
    rect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
  } as never);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(performance.now() + 300);
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TagDetailPage", () => {
  it("renders the connector identity and canonical detail tabs", () => {
    const onTabChange = vi.fn();
    const onConnect = vi.fn();
    const { container } = render(
      <TagDetailPage
        identityIcon={
          <span role="img" aria-label="Email icon">
            E
          </span>
        }
        identityTitle="Email"
        identityDescription="Start and continue agent work from email."
        connectionAction={{ label: "Connect", onClick: onConnect }}
        overviewInformation={[
          { id: "visibility", label: "Visibility", value: "Organization" },
          { id: "authentication", label: "Authentication", value: "OAuth 2.0" },
        ]}
        overviewIncludedItems={[
          {
            id: "inbox",
            title: "Agent inbox",
            description: "Receive work from email.",
          },
        ]}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        sidebar={<div>Tag properties</div>}
        activeTab="overview"
        onTabChange={onTabChange}
      >
        <div>Tag analytics</div>
      </TagDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Email" })).not.toBeNull();
    expect(screen.getByText("Start and continue agent work from email.")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Information" })).not.toBeNull();
    expect(screen.getByText("Visibility")).not.toBeNull();
    expect(screen.getByText("Organization")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Included actions" })).not.toBeNull();
    expect(screen.getByText("Not connected")).not.toBeNull();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Overview",
      "Authentication",
      "Permissions",
    ]);

    const connectButtons = screen.getAllByRole("button", { name: "Connect" });
    expect(connectButtons).toHaveLength(2);
    fireEvent.click(connectButtons[0]);
    expect(onConnect).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("tab", { name: "Authentication" }));
    expect(onTabChange).toHaveBeenCalledWith("authentication");
  });

  it("renders the centralized authentication empty state and connect action", () => {
    const onConnect = vi.fn();
    const { container } = render(
      <TagDetailPage
        identityTitle="Atlassian"
        identityDescription="Connect Jira and Confluence."
        connectionAction={{ label: "Connect", onClick: onConnect }}
        sidebar={<div>Plugin properties</div>}
        activeTab="authentication"
        onTabChange={vi.fn()}
        authenticationMethod="OAuth 2.0"
      >
        <div>Plugin overview</div>
      </TagDetailPage>,
    );

    expect(screen.getByRole("heading", { name: "Authentication credentials" })).not.toBeNull();
    expect(screen.getByText("No authentication yet")).not.toBeNull();
    expect(
      screen.getByText("Connect this integration to use its protected data and actions."),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-empty-state")).toHaveLength(1);
    expect(container.querySelector("[data-resource-detail-page='true']")?.classList).toContain(
      "is-sidebar-auto-collapsed",
    );

    fireEvent.click(screen.getByRole("button", { name: "Connect authentication" }));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("shows connected authentication details without duplicating the setup flow", () => {
    render(
      <TagDetailPage
        identityTitle="GitHub"
        connectionAction={{
          label: "Disconnect",
          tone: "destructive",
          onClick: vi.fn(),
        }}
        sidebar={<div>Plugin properties</div>}
        activeTab="authentication"
        onTabChange={vi.fn()}
        authenticationConnected
        authenticationIdentity="octocat"
        authenticationMethod="OAuth 2.0"
      >
        <div>Plugin overview</div>
      </TagDetailPage>,
    );

    expect(screen.getByText("Authentication connected")).not.toBeNull();
    expect(screen.getByText("octocat")).not.toBeNull();
    expect(screen.getByText("OAuth 2.0")).not.toBeNull();
    expect(screen.queryByText("No authentication yet")).toBeNull();
  });

  it("renders centralized access roles and auto-collapses the sidebar on Permissions", () => {
    const { container } = render(
      <TagDetailPage
        identityTitle="Email"
        sidebar={<div>Tag properties</div>}
        activeTab="permissions"
        onTabChange={vi.fn()}
        permissions={
          <PlatformResourceAccessSettings
            teams={[]}
            resourceLabel="Email"
            selectedPrincipalId={PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID}
            onSelectedPrincipalIdChange={vi.fn()}
            subjectType="tag"
            teamSubjectType="tag_team_role"
            selectedRoleId="member"
            onSelectedRoleIdChange={vi.fn()}
            onSystemRolePermissionSetChange={vi.fn()}
          />
        }
      >
        <div>Legacy permissions content</div>
      </TagDetailPage>,
    );

    expect(
      container.querySelectorAll("[data-platform-resource-access-settings='true']"),
    ).toHaveLength(1);
    expect(screen.getByRole("tablist", { name: "Email organization member roles" })).not.toBeNull();
    expect(container.querySelector("[data-resource-detail-page='true']")?.classList).toContain(
      "is-sidebar-auto-collapsed",
    );
    expect(screen.queryByText("Legacy permissions content")).toBeNull();
  });
});
