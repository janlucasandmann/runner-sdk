// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformTicketItem } from "./platform-ticket-item.js";

afterEach(cleanup);

describe("PlatformTicketItem", () => {
  it("renders the shared backlog row structure", () => {
    const onClick = vi.fn();
    const { container } = render(
      <PlatformTicketItem
        title="Verify extraction"
        taskType="subtask"
        typeIcon={<span data-testid="type-icon" />}
        priority={<span data-testid="priority" />}
        ticketNumber="EC-002"
        status={<span>In review</span>}
        assignee={<span>Forge</span>}
        action={<button type="button">Run</button>}
        completed
        role="button"
        tabIndex={0}
        onClick={onClick}
      />,
    );

    const row = container.querySelector(
      "[data-platform-ticket-item-variant='list']",
    );
    expect(row?.classList.contains("playground-tasks-backlog-item")).toBe(true);
    expect(
      container.querySelector(
        ".playground-tasks-backlog-project-icon.is-subtask",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(".playground-tasks-backlog-title.is-complete")
        ?.textContent,
    ).toBe("Verify extraction");
    expect(screen.getByText("EC-002")).not.toBeNull();
    fireEvent.click(row as Element);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders the shared board card structure", () => {
    const { container } = render(
      <PlatformTicketItem
        variant="card"
        title="Map evidence"
        description={<span>Normalize the source data.</span>}
        typeIcon={<span data-testid="card-type-icon" />}
        ticketNumber="EC-003"
        status={<span>To do</span>}
        assignee={<span>Foundry</span>}
      />,
    );

    const card = screen.getByRole("button", { name: /Map evidence/i });
    expect(card.getAttribute("data-platform-ticket-item-variant")).toBe("card");
    expect(card.classList.contains("playground-tasks-lane-card")).toBe(true);
    const description = container.querySelector(
      ".playground-tasks-lane-card-copy",
    );
    expect(description?.textContent).toContain("Normalize the source data.");
    expect(description?.parentElement).toBe(card);
    expect(
      container.querySelector(".playground-tasks-lane-card-ticket")
        ?.textContent,
    ).toBe("EC-003");
  });

  it("supports a minimal list appearance", () => {
    const { container } = render(
      <PlatformTicketItem title="Nested ticket" appearance="minimalistic-ui" />,
    );

    const row = container.querySelector(
      "[data-platform-ticket-item-variant='list']",
    );
    expect(row?.classList.contains("is-minimalistic-ui")).toBe(true);
    expect(row?.getAttribute("data-platform-ticket-item-appearance")).toBe(
      "minimalistic-ui",
    );

    const css = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/platform-ui/components/ui/ticket-item/ticket-item.css",
      ),
      "utf8",
    );
    expect(css).toMatch(/background:\s*transparent/);
    expect(css).toMatch(/border:\s*none/);
    expect(css).toMatch(/backdrop-filter:\s*none/);
    expect(css).toMatch(/padding-left:\s*0/);
    expect(css).toMatch(/padding-right:\s*0/);

    const runnerChatStyleManifest = fs.readFileSync(
      path.join(process.cwd(), "scripts/runner-chat-style-sources.mjs"),
      "utf8",
    );
    const platformStyleManifest = fs.readFileSync(
      path.join(
        process.cwd(),
        "apps/platform/shared/development-style-resolution.mjs",
      ),
      "utf8",
    );
    expect(runnerChatStyleManifest).toContain(
      "src/platform-ui/components/ui/ticket-item/ticket-item.css",
    );
    expect(platformStyleManifest).toContain(
      "src/platform-ui/components/ui/ticket-item/ticket-item.css",
    );

    const packageManifest = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
    ) as { exports?: Record<string, unknown> };
    expect(
      packageManifest.exports?.[
        "./platform-ui/components/ui/ticket-item/styles.css"
      ],
    ).toEqual({
      default: "./dist/platform-ui/components/ui/ticket-item/ticket-item.css",
    });
  });
});
