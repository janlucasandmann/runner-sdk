// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
  it("adds the optional Agent Triggers tab without changing other connectors", () => {
    const onTabChange = vi.fn();
    render(
      <TagDetailPage
        identityTitle="Jira"
        activeTab="agent-triggers"
        onTabChange={onTabChange}
        agentTriggers={<div>Jira webhook routing</div>}
      >
        <div>Jira overview</div>
      </TagDetailPage>,
    );

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Overview",
      "Authentication",
      "Agent Triggers",
      "Permissions",
    ]);
    expect(screen.getByText("Jira webhook routing")).not.toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Overview" }));
    expect(onTabChange).toHaveBeenCalledWith("overview");
  });

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
        identityKind="tags"
        identityId="email"
        identityTitle="Email"
        identityDescription="Start and continue agent work from email."
        connectionAction={{ onClick: onConnect }}
        overviewInformation={[
          { id: "visibility", label: "Visibility", value: "Organization" },
          { id: "authentication", label: "Authentication", value: "OAuth 2.0" },
        ]}
        overviewIncludedItems={[
          {
            id: "inbox",
            title: "Agent inbox",
            description: "Receive work from email.",
            access: "interactive",
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

    expect(
      container.querySelectorAll("[data-resource-detail-page='true']"),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll("[data-platform-detail-tab-bar='true']"),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll("[data-platform-detail-sidebar='true']"),
    ).toHaveLength(1);
    expect(
      container.querySelector(
        ".connection-identity-icon.is-catalog.is-tag.is-email",
      ),
    ).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Email" })).not.toBeNull();
    expect(
      screen.getByText("Start and continue agent work from email."),
    ).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Information" })).not.toBeNull();
    expect(screen.getByText("Visibility")).not.toBeNull();
    expect(screen.getByText("Organization")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Included elements" }),
    ).not.toBeNull();
    expect(screen.getByText("Interactive")).not.toBeNull();
    expect(screen.getByText("Agent inbox")).not.toBeNull();
    expect(
      container.querySelector("[data-resource-detail-page='true']")?.classList,
    ).toContain("is-sidebar-auto-collapsed");
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Overview",
      "Authentication",
      "Permissions",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Add Credentials" }));
    expect(screen.getByRole("dialog", { name: "Email" })).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Credential name"), {
      target: { value: "Support inbox" },
    });
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Email" })).getByRole(
        "button",
        {
          name: "Add Credentials",
        },
      ),
    );
    expect(onConnect).toHaveBeenCalledWith("Support inbox");

    fireEvent.click(screen.getByRole("tab", { name: "Authentication" }));
    expect(onTabChange).toHaveBeenCalledWith("authentication");
  });

  it("renders the centralized authentication empty state and connect action", () => {
    const onConnect = vi.fn();
    const { container } = render(
      <TagDetailPage
        identityTitle="Atlassian"
        identityDescription="Connect Jira and Confluence."
        connectionAction={{ onClick: onConnect }}
        sidebar={<div>Plugin properties</div>}
        activeTab="authentication"
        onTabChange={vi.fn()}
        authenticationMethod="OAuth 2.0"
      >
        <div>Plugin overview</div>
      </TagDetailPage>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Credentials available for this connector",
      }),
    ).not.toBeNull();
    expect(screen.getByText("No authentication yet")).not.toBeNull();
    expect(
      screen.getByText(
        "Connect this integration to use its protected data and actions.",
      ),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-empty-state")).toHaveLength(1);
    expect(
      container.querySelector("[data-resource-detail-page='true']")?.classList,
    ).toContain("is-sidebar-auto-collapsed");

    const addButtons = screen.getAllByRole("button", {
      name: /Add [Cc]redentials/,
    });
    fireEvent.click(addButtons.at(-1)!);
    fireEvent.change(screen.getByLabelText("Credential name"), {
      target: { value: "Atlassian work" },
    });
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Atlassian" })).getByRole(
        "button",
        {
          name: "Add Credentials",
        },
      ),
    );
    expect(onConnect).toHaveBeenCalledWith("Atlassian work");
  });

  it("keeps provider connection failures inside the credential modal", async () => {
    const onConnect = vi
      .fn()
      .mockRejectedValue(new Error("Provider authorization unavailable."));
    render(
      <TagDetailPage
        identityTitle="GitHub"
        connectionAction={{ onClick: onConnect }}
        activeTab="authentication"
        onTabChange={vi.fn()}
      >
        <div>Plugin overview</div>
      </TagDetailPage>,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Add Credentials" })[0],
    );
    fireEvent.change(screen.getByLabelText("Credential name"), {
      target: { value: "Engineering" },
    });
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "GitHub" })).getByRole(
        "button",
        {
          name: "Add Credentials",
        },
      ),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Provider authorization unavailable.",
      );
    });
    expect(screen.getByRole("dialog", { name: "GitHub" })).not.toBeNull();
    expect(
      screen.getByLabelText("Credential name").getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("shows connected authentication details without duplicating the setup flow", () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    render(
      <TagDetailPage
        identityTitle="GitHub"
        connectionAction={{ onClick: onConnect }}
        sidebar={<div>Plugin properties</div>}
        activeTab="authentication"
        onTabChange={vi.fn()}
        authenticationConnected
        credentials={[
          {
            id: "github-work",
            name: "Work GitHub",
            identity: "octocat",
            method: "OAuth 2.0",
            status: "valid",
            isDefault: true,
            createdAt: "2026-07-29T06:00:00.000Z",
            updatedAt: "2026-07-29T06:00:00.000Z",
            lastCheckedAt: new Date().toISOString(),
          },
          {
            id: "github-personal",
            name: "Personal GitHub",
            identity: "octocat-personal",
            method: "OAuth 2.0",
            status: "valid",
            isDefault: false,
            createdAt: "2026-07-29T06:00:00.000Z",
            updatedAt: "2026-07-29T06:00:00.000Z",
            lastCheckedAt: new Date().toISOString(),
          },
        ]}
        onCredentialDisconnect={onDisconnect}
      >
        <div>Plugin overview</div>
      </TagDetailPage>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Credentials available for this connector",
      }),
    ).not.toBeNull();
    expect(screen.getByText("octocat")).not.toBeNull();
    expect(screen.getAllByText("OAuth 2.0")).toHaveLength(2);
    expect(screen.getByText("Work GitHub")).not.toBeNull();
    expect(screen.getByText("Personal GitHub")).not.toBeNull();
    expect(screen.getAllByText("Default")).toHaveLength(1);
    expect(screen.getAllByText("Valid")).toHaveLength(2);
    expect(screen.queryByText("No authentication yet")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Credential actions for Personal GitHub",
      }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledWith("github-personal");
  });

  it("expands connector capabilities into their JSON input schema", () => {
    const { container } = render(
      <TagDetailPage
        identityTitle="GitHub"
        activeTab="overview"
        onTabChange={vi.fn()}
        overviewIncludedItems={[
          {
            id: "list_commits",
            title: "list_commits",
            description:
              "Get list of commits of a branch in a GitHub repository.",
            access: "read-only",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
              },
              required: ["owner", "repo"],
            },
          },
        ]}
      >
        <div>Plugin overview</div>
      </TagDetailPage>,
    );

    const trigger = screen.getByRole("button", { name: /list_commits/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(
      container
        .querySelector(".tag-detail-page__schema-panel")
        ?.hasAttribute("hidden"),
    ).toBe(true);

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const schema = container.querySelector(".tag-detail-page__schema-code");
    expect(schema?.textContent).toContain('"owner"');
    expect(schema?.textContent).toContain('"required"');
    expect(
      container
        .querySelector(".tag-detail-page__schema-panel")
        ?.hasAttribute("hidden"),
    ).toBe(false);
    expect(
      screen.getByRole("button", { name: "Copy list_commits input schema" }),
    ).not.toBeNull();
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
      container.querySelectorAll(
        "[data-platform-resource-access-settings='true']",
      ),
    ).toHaveLength(1);
    expect(
      screen.getByRole("tablist", { name: "Email organization member roles" }),
    ).not.toBeNull();
    expect(
      container.querySelector("[data-resource-detail-page='true']")?.classList,
    ).toContain("is-sidebar-auto-collapsed");
    expect(screen.queryByText("Legacy permissions content")).toBeNull();
  });
});
