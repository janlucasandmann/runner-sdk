// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformPopupSubmenu } from "../../composite/popup/index.js";
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
        typeIcon={<span data-testid="card-type-icon" />}
        priority={<span data-testid="card-priority-icon" />}
        ticketNumber="EC-003"
        status={<span data-testid="card-status-icon" />}
        assignee={<span>Foundry</span>}
        createdAt="2026-07-24T12:00:00.000Z"
      />,
    );

    const card = screen.getByRole("button", { name: /Map evidence/i });
    expect(card.getAttribute("data-platform-ticket-item-variant")).toBe("card");
    expect(card.classList.contains("playground-tasks-lane-card")).toBe(true);
    const header = container.querySelector(
      ".playground-tasks-lane-card-header",
    );
    expect(header?.textContent).toContain("EC-003");
    expect(header?.textContent).toContain("Foundry");
    expect(
      header?.querySelector("[data-testid='card-type-icon']"),
    ).not.toBeNull();
    const summary = container.querySelector(
      ".playground-tasks-lane-card-summary",
    );
    expect(summary?.textContent).toContain("Map evidence");
    expect(
      summary?.querySelector("[data-testid='card-status-icon']"),
    ).not.toBeNull();
    expect(
      container.querySelector(".playground-tasks-lane-card-ticket")
        ?.textContent,
    ).toBe("EC-003");
    const footer = container.querySelector(
      ".playground-tasks-lane-card-bottom",
    );
    expect(
      footer?.querySelector("[data-testid='card-priority-icon']"),
    ).not.toBeNull();
    expect(footer?.querySelector("[data-testid='card-type-icon']")).toBeNull();
    expect(footer?.textContent).toContain("Jul 24");
    expect(footer?.textContent).not.toContain("EC-003");
  });

  it("owns the shared pointer-positioned card action menu", () => {
    const onMenuOpen = vi.fn();
    render(
      <PlatformTicketItem
        variant="card"
        title="Inspect workflow"
        ticketActionMenu={({ closeMenu }) => (
          <button type="button" role="menuitem" onClick={closeMenu}>
            Open
          </button>
        )}
        onTicketActionMenuOpen={onMenuOpen}
      />,
    );

    fireEvent.contextMenu(
      screen.getByRole("button", { name: /Inspect workflow/i }),
      { clientX: 96, clientY: 144 },
    );

    const menu = screen.getByRole("menu", { name: "Ticket actions" });
    expect(menu.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(menu.style.width).toBe("224px");
    expect(menu.style.left).toBe("106px");
    expect(menu.style.top).toBe("154px");
    expect(onMenuOpen).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("menuitem", { name: "Open" }));
    expect(screen.queryByRole("menu", { name: "Ticket actions" })).toBeNull();
  });

  it("keeps a nested property submenu closed until pointer intent, then interactive", () => {
    const onStatusChange = vi.fn();
    render(
      <PlatformTicketItem
        variant="card"
        title="Update ticket state"
        ticketActionMenu={({ closeMenu }) => (
          <PlatformPopupSubmenu
            label="Status"
            popupAriaLabel="Change ticket status"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onStatusChange();
                closeMenu();
              }}
            >
              Done
            </button>
          </PlatformPopupSubmenu>
        )}
      />,
    );

    fireEvent.contextMenu(
      screen.getByRole("button", { name: /Update ticket state/i }),
      { clientX: 48, clientY: 72 },
    );
    expect(
      screen.queryByRole("menu", { name: "Change ticket status" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Status" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Done" }));

    expect(onStatusChange).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu", { name: "Ticket actions" })).toBeNull();
  });

  it("can open the same action menu from a list-row click", () => {
    const onClick = vi.fn();
    render(
      <PlatformTicketItem
        title="Backlog ticket"
        role="button"
        tabIndex={0}
        openTicketActionMenuOnClick
        ticketActionMenu={<button type="button" role="menuitem">Open</button>}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Backlog ticket/i }), {
      clientX: 40,
      clientY: 72,
    });

    expect(screen.getByRole("menu", { name: "Ticket actions" })).not.toBeNull();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("requests deletion from Command/Control plus Backspace/Delete only while hovered", () => {
    const onDeleteRequest = vi.fn();
    render(
      <PlatformTicketItem
        variant="card"
        title="Delete hovered ticket"
        onTicketDeleteRequest={onDeleteRequest}
      />,
    );

    const ticket = screen.getByRole("button", { name: /Delete hovered ticket/i });
    fireEvent.pointerEnter(ticket);
    fireEvent.keyDown(document, {
      key: "Backspace",
      code: "Backspace",
      metaKey: true,
    });
    fireEvent.keyDown(document, {
      key: "Delete",
      code: "Delete",
      ctrlKey: true,
    });
    expect(onDeleteRequest).toHaveBeenCalledTimes(2);

    fireEvent.pointerLeave(ticket);
    fireEvent.keyDown(document, {
      key: "Backspace",
      code: "Backspace",
      metaKey: true,
    });
    expect(onDeleteRequest).toHaveBeenCalledTimes(2);
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
    expect(css).toMatch(/white-space:\s*nowrap/);

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
