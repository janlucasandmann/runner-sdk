// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BookOpen } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformPageHero } from "./platform-page-hero.js";

afterEach(cleanup);

describe("PlatformPageHero", () => {
  it("renders the shared page introduction and optional actions", async () => {
    const user = userEvent.setup();
    const onOpenDocumentation = vi.fn();
    const { container } = render(
      <PlatformPageHero
        className="example-hero"
        title="Workspace Studio"
        description="Create and manage intelligent services."
        actions={[
          {
            id: "documentation",
            label: "Documentation",
            icon: BookOpen,
            onClick: onOpenDocumentation,
          },
        ]}
      />,
    );

    const hero = container.querySelector("[data-platform-page-hero='true']");
    expect(hero).not.toBeNull();
    expect(hero?.classList.contains("example-hero")).toBe(true);
    expect(
      screen.getByRole("heading", { name: "Workspace Studio", level: 1 }),
    ).not.toBeNull();
    expect(screen.getByText("Create and manage intelligent services.")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Documentation" }).querySelector("svg"),
    ).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Documentation" }));
    expect(onOpenDocumentation).toHaveBeenCalledOnce();
  });
});
