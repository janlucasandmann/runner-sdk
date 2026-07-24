// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BookOpen, Bot, Monitor, Sparkles } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformHomePage } from "./platform-home-page.js";

afterEach(cleanup);

describe("PlatformHomePage", () => {
  it("renders generic feature cards, page actions, and link sections", async () => {
    const user = userEvent.setup();
    const onOpenAgents = vi.fn();
    const onOpenComputers = vi.fn();
    const onOpenDocumentation = vi.fn();

    const { container } = render(
      <PlatformHomePage
        title="Workspace Studio"
        description="Create and manage intelligent services."
        headerActions={[
          {
            id: "documentation",
            label: "Documentation",
            icon: BookOpen,
            onClick: onOpenDocumentation,
          },
        ]}
        featureCards={[
          {
            id: "create",
            title: "Create",
            description: "Build and configure resources.",
            icon: Bot,
            links: [
              { id: "agents", label: "Agents", meta: "4", onClick: onOpenAgents },
              { id: "computers", label: "Computers", meta: "2", onClick: onOpenComputers },
              { id: "status", label: "Status", meta: "Healthy" },
            ],
          },
        ]}
        sections={[
          {
            id: "quickstart",
            title: "Quickstart",
            items: [
              {
                id: "create-agent",
                label: "Create an agent",
                description: "Configure your first agent.",
                icon: Sparkles,
                onClick: onOpenAgents,
              },
            ],
          },
          {
            id: "documentation",
            title: "Documentation",
            action: {
              id: "all-documentation",
              label: "View all documentation",
              onClick: onOpenDocumentation,
            },
            items: [
              {
                id: "computers-docs",
                label: "Computers",
                description: "Learn about persistent environments.",
                icon: Monitor,
                onClick: onOpenDocumentation,
              },
            ],
          },
        ]}
      />,
    );

    expect(container.querySelector("[data-platform-home-page='true']")).not.toBeNull();
    expect(
      container.querySelector(".platform-ui-card.platform-home-page__feature-card"),
    ).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Workspace Studio", level: 1 })).not.toBeNull();
    expect(screen.getByRole("region", { name: "Featured areas" })).not.toBeNull();
    expect(screen.getByText("4")).not.toBeNull();
    expect(
      screen
        .getByText("Healthy")
        .closest(".platform-ui-card__feature-link")
        ?.classList.contains("is-static"),
    ).toBe(true);
    expect(screen.queryByRole("button", { name: "Status" })).toBeNull();
    expect(screen.getAllByRole("heading", { name: "Documentation", level: 2 })).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Agents" }));
    expect(onOpenAgents).toHaveBeenCalledOnce();
    await user.click(
      within(screen.getByRole("region", { name: "Featured areas" })).getByRole("button", {
        name: "Computers",
      }),
    );
    expect(onOpenComputers).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "View all documentation" }));
    expect(onOpenDocumentation).toHaveBeenCalledOnce();

    const hero = container.querySelector("[data-platform-page-hero='true']");
    expect(
      within(hero as HTMLElement).getByRole("button", { name: "Documentation" }),
    ).not.toBeNull();
  });
});
