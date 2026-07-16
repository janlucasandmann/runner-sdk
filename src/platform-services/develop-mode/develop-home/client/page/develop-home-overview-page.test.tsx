// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Globe, KeyRound, Webhook } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ResourceOverviewAnalyticsModel } from "../../../../../platform-ui/pages/overview/index.js";
import { DevelopHomeOverviewPage } from "./develop-home-overview-page.js";
import { DevelopWebhooksOverviewPage } from "./develop-webhooks-overview-page.js";

afterEach(cleanup);

const analytics: ResourceOverviewAnalyticsModel = {
  title: "Develop resource activity",
  ariaLabel: "Develop resource activity over time",
  metrics: [
    { id: "resources", label: "Resources", value: "1", color: "#7effff" },
    { id: "operations", label: "Operations", value: "12", color: "#8fc4ff" },
  ],
  labels: [],
  series: [],
  emptyState: "No activity yet.",
};

describe("Develop overview pages", () => {
  it("renders Develop Home entirely through the canonical overview shell without tabs", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onShowUsage = vi.fn();
    const onOpenPricing = vi.fn();
    const onOpenDocumentation = vi.fn();
    const onQuickstartLanguageChange = vi.fn();
    const onOpenQuickstart = vi.fn();
    const onOpenConcept = vi.fn();
    const onOpenAllConcepts = vi.fn();
    const onOpenUsage = vi.fn();
    const onCreateApiKey = vi.fn();
    const onOpenResources = vi.fn();
    const onOpenApiKeys = vi.fn();
    const onOpenQuickLink = vi.fn();

    const { container } = render(
      <>
        <div id="develop-home-test-controls" data-testid="develop-home-controls" />
        <DevelopHomeOverviewPage
          rows={[{
            id: "web-apps",
            kind: "web_app",
            label: "Web Apps",
            description: "Deploy browser applications.",
            icon: Globe,
            resourceCount: 1,
            resourceCountLabel: "1",
            operationCount: 12,
            operationCountLabel: "12",
            searchText: "Web Apps browser applications active",
          }]}
          period="day"
          onPeriodChange={vi.fn()}
          analytics={analytics}
          controlsPortalId="develop-home-test-controls"
          supplementaryContent={{
            quickstartLanguages: [
              { id: "javascript", label: "javascript", lines: ["const client = new ComputerAgentsClient();"] },
              { id: "python", label: "python", lines: ["client = ComputerAgentsClient()"] },
            ],
            activeQuickstartLanguageId: "javascript",
            onQuickstartLanguageChange,
            onOpenQuickstart,
            concepts: [{
              id: "threads",
              title: "Threads",
              description: "Persistent agent work.",
              imageUrl: "/threads.jpg",
              onClick: onOpenConcept,
            }],
            onOpenAllConcepts,
            usageValue: "42 CT",
            resourceCountLabel: "3 resources",
            apiKeyCountLabel: "2 keys",
            onOpenUsage,
            onCreateApiKey,
            onOpenResources,
            onOpenApiKeys,
            quickLinks: [{
              id: "api-keys",
              label: "Create an API Key",
              icon: KeyRound,
              onClick: onOpenQuickLink,
            }],
          }}
          onOpen={onOpen}
          onShowUsage={onShowUsage}
          onOpenPricing={onOpenPricing}
          onOpenDocumentation={onOpenDocumentation}
        />
      </>,
    );

    expect(container.querySelectorAll(".resource-overview-page.is-develop-home")).toHaveLength(1);
    expect(container.querySelectorAll(".platform-analytics")).toHaveLength(1);
    expect(screen.getByRole("table", { name: "Develop resources" })).not.toBeNull();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("tab", { name: "Webhooks" })).toBeNull();
    expect(within(screen.getByTestId("develop-home-controls")).getByRole("radiogroup", { name: "Analytics time frame" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Developer quickstart" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Core concepts" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Usage" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Quick Links" })).not.toBeNull();
    expect(screen.getByText("42 CT")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "python" }));
    expect(onQuickstartLanguageChange).toHaveBeenCalledWith("python");
    await user.click(screen.getByRole("button", { name: "Get started" }));
    expect(onOpenQuickstart).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: /Threads/ }));
    expect(onOpenConcept).toHaveBeenCalledOnce();
    await user.click(screen.getAllByRole("button", { name: "Create an API Key" }).at(-1)!);
    expect(onOpenQuickLink).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Web Apps"));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ kind: "web_app" }));

    await user.click(within(screen.getByTestId("develop-home-controls")).getByRole("button", { name: "Develop options" }));
    const menu = screen.getByRole("menu", { name: "Develop options" });
    await user.click(within(menu).getByRole("menuitem", { name: "Show Usage" }));
    expect(onShowUsage).toHaveBeenCalledOnce();

    await user.click(within(screen.getByTestId("develop-home-controls")).getByRole("button", { name: "Develop options" }));
    await user.click(screen.getByRole("menuitem", { name: "API Pricing" }));
    expect(onOpenPricing).toHaveBeenCalledOnce();

    await user.click(within(screen.getByTestId("develop-home-controls")).getByRole("button", { name: "Develop options" }));
    await user.click(screen.getByRole("menuitem", { name: "Documentation" }));
    expect(onOpenDocumentation).toHaveBeenCalledOnce();
  });

  it("renders Webhooks as an independent canonical overview page with its own controls", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCreate = vi.fn();
    const onToggle = vi.fn();
    const onTest = vi.fn();
    const onDelete = vi.fn();
    const row = {
      id: "hook-1",
      name: "Payments hook",
      sourceLabel: "Stripe",
      eventLabel: "checkout.completed",
      actionLabel: "Start agent",
      enabled: true,
      lastTriggeredAt: 123,
      lastTriggeredLabel: "Today",
      icon: Webhook,
      searchText: "Payments hook Stripe checkout completed active",
      raw: { id: "hook-1" },
    };

    const { container } = render(
      <>
        <div id="develop-webhooks-test-controls" data-testid="develop-webhooks-controls" />
        <DevelopWebhooksOverviewPage
          rows={[row]}
          controlsPortalId="develop-webhooks-test-controls"
          successMessage="Webhook updated."
          onOpen={onOpen}
          onCreate={onCreate}
          onToggle={onToggle}
          onTest={onTest}
          onDelete={onDelete}
        />
      </>,
    );

    expect(container.querySelectorAll(".resource-overview-page.is-develop-webhooks")).toHaveLength(1);
    expect(container.querySelectorAll(".platform-analytics")).toHaveLength(1);
    expect(screen.getByRole("table", { name: "Webhooks" })).not.toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Webhook updated.");
    expect(screen.queryByRole("radiogroup", { name: "Analytics time frame" })).toBeNull();
    const createButton = within(screen.getByTestId("develop-webhooks-controls")).getByRole("button", { name: "Webhook" });
    await user.click(createButton);
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Payments hook"));
    expect(onOpen).toHaveBeenCalledWith(row);

    await user.click(screen.getByRole("button", { name: "Open actions for Payments hook" }));
    await user.click(screen.getByRole("menuitem", { name: "Test fire" }));
    expect(onTest).toHaveBeenCalledWith(row);
  });
});
