// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Bot, Globe, KeyRound, Webhook } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DevelopHomeOverviewPage } from "./develop-home-overview-page.js";
import { DevelopWebhooksOverviewPage } from "./develop-webhooks-overview-page.js";

afterEach(cleanup);

describe("Develop overview pages", () => {
  it("renders Develop Home through the centralized Home page", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onOpenQuickstart = vi.fn();
    const onOpenAllConcepts = vi.fn();
    const onOpenQuickLink = vi.fn();
    const onOpenPricing = vi.fn();
    const onOpenDocumentation = vi.fn();

    const { container } = render(
      <DevelopHomeOverviewPage
        rows={[
          {
            id: "web-apps",
            kind: "web_app",
            label: "Web Apps",
            description: "Deploy browser applications.",
            icon: Globe,
            resourceCount: 1,
            resourceCountLabel: "1",
            operationCount: 0,
            operationCountLabel: "0",
            searchText: "Web Apps browser applications active",
          },
          {
            id: "agent-runtime",
            kind: "agent_runtime",
            label: "Agent Runtime",
            description: "Run persistent agents.",
            icon: Bot,
            resourceCount: 0,
            resourceCountLabel: "0",
            operationCount: 0,
            operationCountLabel: "0",
            searchText: "Agent Runtime persistent agents",
          },
        ]}
        supplementaryContent={{
          onOpenQuickstart,
          onOpenAllConcepts,
          quickLinks: [{
            id: "api-keys",
            label: "Create an API Key",
            description: "Authenticate API requests.",
            icon: KeyRound,
            onClick: onOpenQuickLink,
          }],
        }}
        onOpen={onOpen}
        onOpenPricing={onOpenPricing}
        onOpenDocumentation={onOpenDocumentation}
      />,
    );

    expect(container.querySelectorAll(".platform-home-page.is-develop-home")).toHaveLength(1);
    expect(screen.getByRole("main", { name: "Develop Home" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Develop your Workspace" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Build" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Operate" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Quickstart" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Documentation" })).not.toBeNull();
    expect(container.querySelector(".platform-analytics")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Web Apps" }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ kind: "web_app" }));
    await user.click(screen.getByRole("button", { name: "Agent Runtime" }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ kind: "agent_runtime" }));
    await user.click(screen.getByRole("button", { name: "Create an API Key" }));
    expect(onOpenQuickLink).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Developer quickstart" }));
    expect(onOpenQuickstart).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Core concepts" }));
    expect(onOpenAllConcepts).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Pricing" }));
    expect(onOpenPricing).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Documentation" }));
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
