// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Bot, Monitor, Sparkles } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigureHomeOverviewPage } from "./configure-home-overview-page.js";

afterEach(cleanup);

describe("ConfigureHomeOverviewPage", () => {
  it("renders the Configure resource cards without the notifications table", async () => {
    const user = userEvent.setup();
    const onOpenNotifications = vi.fn();
    const onOpenEvaluations = vi.fn();
    const onOpenGuardrails = vi.fn();
    const onOpenPricing = vi.fn();
    const onOpenDocumentation = vi.fn();

    const { container } = render(
      <ConfigureHomeOverviewPage
        cards={[
          {
            id: "agents",
            title: "Agents",
            description: "Workspace agents",
            value: "3",
            icon: Bot,
            onClick: vi.fn(),
          },
          {
            id: "computers",
            title: "Computers",
            description: "Persistent computers",
            value: "2",
            icon: Monitor,
            onClick: vi.fn(),
          },
          {
            id: "skills",
            title: "Skills",
            description: "Agent capabilities",
            value: "8",
            icon: Sparkles,
            onClick: vi.fn(),
          },
        ]}
        onOpenNotifications={onOpenNotifications}
        onOpenEvaluations={onOpenEvaluations}
        onOpenGuardrails={onOpenGuardrails}
        onOpenPricing={onOpenPricing}
        onOpenDocumentation={onOpenDocumentation}
      />,
    );

    expect(container.querySelectorAll(".platform-home-page")).toHaveLength(1);
    expect(container.querySelector("[data-platform-home-page='true']")).not.toBeNull();
    expect(container.querySelector(".resource-overview-page")).toBeNull();
    expect(container.querySelector(".platform-analytics")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Configure your Workspace", level: 1 }),
    ).not.toBeNull();
    const features = screen.getByRole("region", { name: "Featured areas" });
    expect(features.querySelectorAll(".platform-ui-card")).toHaveLength(2);
    expect(within(features).getByRole("heading", { name: "Create" })).not.toBeNull();
    expect(within(features).getByRole("heading", { name: "Govern" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Quickstart" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Documentation" })).not.toBeNull();
    expect(screen.queryByRole("table", { name: "Notifications" })).toBeNull();

    await user.click(within(features).getByRole("button", { name: "Evaluations" }));
    expect(onOpenEvaluations).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Pricing" }));
    expect(onOpenPricing).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "View all documentation" }));
    expect(onOpenDocumentation).toHaveBeenCalledOnce();
  });
});
