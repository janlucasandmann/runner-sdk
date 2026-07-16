// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DevelopApiKeysOverviewPage,
  type DevelopApiKeysOverviewPageProps,
} from "./api-keys-overview-page.js";

const rows: DevelopApiKeysOverviewPageProps["rows"] = [
  {
    id: "key-standard",
    name: "Default Web Key",
    keyPrefix: "tb_default",
    createdAt: 2,
    createdLabel: "Today",
    lastUsedAt: 2,
    lastUsedLabel: "Today",
    creatorName: "Computer Agents",
    creatorAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
    creatorFallback: "CA",
    permissionsLabel: "Full Access",
    isStandard: true,
    canRevoke: false,
    searchText: "Default Web Key tb_default Computer Agents Full Access standard",
  },
  {
    id: "key-scoped",
    name: "Automation",
    keyPrefix: "tb_automation",
    createdAt: 1,
    createdLabel: "Yesterday",
    lastUsedAt: 0,
    lastUsedLabel: "Never",
    creatorName: "Jan Sandmann",
    creatorAvatarUrl: "/img/profiles/jan.jpg",
    creatorFallback: "JS",
    permissionsLabel: "Execute Only",
    isStandard: false,
    canRevoke: true,
    searchText: "Automation tb_automation jan@example.com Execute Only scoped",
  },
];

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
});

function renderPage(overrides: Partial<DevelopApiKeysOverviewPageProps> = {}) {
  const props: DevelopApiKeysOverviewPageProps = {
    rows,
    controlsPortalId: "api-key-test-controls",
    period: "month",
    onPeriodChange: vi.fn(),
    analytics: {
      title: "API activity",
      ariaLabel: "API requests and token consumption over time",
      labels: ["Jul 16"],
      series: [
        { id: "requests", label: "Requests", values: [12], color: "#8fc4ff" },
        { id: "tokens", label: "Tokens", values: [2000], color: "#7effff", axis: "secondary" },
      ],
      metrics: [
        { id: "requests", label: "Requests", value: "12", color: "#8fc4ff" },
        { id: "tokens", label: "Tokens Consumed", value: "2,000", color: "#7effff" },
        { id: "keys", label: "API Keys", value: "2", color: "#6750ff" },
        { id: "used", label: "Used API Keys", value: "1", color: "#9ff6ce" },
      ],
    },
    onCreate: vi.fn(),
    onReveal: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
  const result = render(
    <>
      <div id="api-key-test-controls" data-testid="api-key-controls" />
      <DevelopApiKeysOverviewPage {...props} />
    </>,
  );
  return { ...result, props };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DevelopApiKeysOverviewPage", () => {
  it("uses the canonical overview shell and portals the create action", async () => {
    const user = userEvent.setup();
    const { container, props } = renderPage();

    expect(container.querySelectorAll(".resource-overview-page.is-develop-api-keys")).toHaveLength(1);
    expect(container.querySelector(".platform-data-table.is-minimalistic-ui")).not.toBeNull();
    expect(screen.getByRole("region", { name: "API requests and token consumption over time" })).not.toBeNull();
    expect(screen.getByRole("table", { name: "API keys" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "All API Keys", level: 2 })).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: "Creator" })).not.toBeNull();
    expect(screen.queryByRole("columnheader", { name: "Created by" })).toBeNull();
    expect(
      screen.getByText("Computer Agents").closest(".resource-overview-identity")?.querySelector("img")?.getAttribute("src"),
    ).toBe("/img/agent-profile-pics/ca-profilepic.jpg");
    expect(
      screen.getByText("Jan Sandmann").closest(".resource-overview-identity")?.querySelector("img")?.getAttribute("src"),
    ).toBe("/img/profiles/jan.jpg");
    expect(screen.getByText("Full Access").dataset.platformLabelVariant).toBe("green");
    expect(screen.getByText("Execute Only").dataset.platformLabelVariant).toBe("blue");

    const createButton = within(screen.getByTestId("api-key-controls")).getByRole("button", { name: "API Key" });
    const controls = within(screen.getByTestId("api-key-controls"));
    expect(controls.getByRole("radio", { name: "30D" })).not.toBeNull();
    await user.click(controls.getByRole("radio", { name: "7D" }));
    expect(props.onPeriodChange).toHaveBeenCalledWith("week");
    await user.click(createButton);
    expect(props.onCreate).toHaveBeenCalledOnce();
  });

  it("filters rows and exposes reveal and delete actions through the shared table menu", async () => {
    const user = userEvent.setup();
    const onReveal = vi.fn();
    const onDelete = vi.fn();
    renderPage({ onReveal, onDelete });

    await user.click(screen.getByRole("button", { name: "Filter" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Scoped" }));
    expect(screen.queryByText("Default Web Key")).toBeNull();
    expect(screen.getByText("Automation")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Open actions for Automation" }));
    await user.click(screen.getByRole("menuitem", { name: "View key" }));
    expect(onReveal).toHaveBeenCalledWith(rows[1]);

    await user.click(screen.getByRole("button", { name: "Open actions for Automation" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith([rows[1]]);
  });

  it("keeps the newly created key available for copy and dismissal", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    const onDismiss = vi.fn();
    renderPage({
      createdNotice: {
        keyValue: "tb_secret",
        onCopy,
        onDismiss,
      },
    });

    expect(screen.getByText("tb_secret")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Copy newly created API key" }));
    expect(onCopy).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Dismiss created API key" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("renders the API key empty state with the canonical icon and supporting copy", () => {
    const { container } = renderPage({
      rows: [],
      analytics: {
        title: "API activity",
        ariaLabel: "API requests and token consumption over time",
        labels: [],
        series: [
          { id: "requests", label: "Requests", values: [], color: "#8fc4ff" },
          { id: "tokens", label: "Tokens", values: [], color: "#7effff", axis: "secondary" },
        ],
        metrics: [
          { id: "requests", label: "Requests", value: "0", color: "#8fc4ff" },
          { id: "tokens", label: "Tokens Consumed", value: "0", color: "#7effff" },
          { id: "keys", label: "API Keys", value: "0", color: "#6750ff" },
          { id: "used", label: "Used API Keys", value: "0", color: "#9ff6ce" },
        ],
      },
    });

    expect(container.querySelectorAll(".platform-empty-state")).toHaveLength(2);
    expect(container.querySelectorAll(".lucide-key-round")).toHaveLength(2);
    expect(screen.getByText("No API keys yet")).not.toBeNull();
    expect(screen.getByText("Create an API key to authenticate SDK and API requests.")).not.toBeNull();
    expect(screen.getByText("No API activity yet")).not.toBeNull();
    expect(screen.getByText("Authenticated API requests will appear here once your keys are used.")).not.toBeNull();
  });
});
