// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformSubtasks } from "./platform-subtasks.js";

const subtasksCss = readFileSync(
  resolve(
    process.cwd(),
    "src/platform-ui/components/composite/subtasks/subtasks.css",
  ),
  "utf8",
);

afterEach(cleanup);

describe("PlatformSubtasks", () => {
  it("uses the same card dimensions and header treatment as attachments", () => {
    expect(subtasksCss).toMatch(
      /\.platform-subtasks\s*\{[^}]*flex:\s*0 0 auto;[^}]*padding:\s*12px 24px;/s,
    );
    expect(subtasksCss).toMatch(
      /\.platform-subtasks__header\s*\{[^}]*padding-bottom:\s*12px;[^}]*border-bottom:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.1\);/s,
    );
  });

  it("renders the empty card and invokes the centralized add action", () => {
    const onAdd = vi.fn();
    const { container } = render(<PlatformSubtasks onAdd={onAdd} />);

    expect(
      container.querySelector("[data-platform-ui-card-variant='default']"),
    ).not.toBeNull();
    expect(
      container.querySelector("[data-platform-subtasks='true']"),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Subtasks", level: 2 }),
    ).not.toBeNull();
    expect(screen.getByText("No subtasks yet")).not.toBeNull();

    const addButton = screen.getByRole("button", { name: "Subtask" });
    expect(addButton.getAttribute("data-platform-button-variant")).toBe(
      "secondary",
    );
    fireEvent.click(addButton);
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("offers a surface-free appearance with an icon-only add action", () => {
    const onAdd = vi.fn();
    const { container } = render(
      <PlatformSubtasks appearance="minimal" onAdd={onAdd} />,
    );

    const section = container.querySelector(
      "[data-platform-subtasks-appearance='minimal']",
    );
    expect(section?.classList.contains("is-minimal")).toBe(true);
    expect(subtasksCss).toMatch(
      /\.platform-subtasks\.is-minimal\s*\{[^}]*padding:\s*0;[^}]*border:\s*0;[^}]*border-radius:\s*0;[^}]*background:\s*transparent;/s,
    );
    expect(subtasksCss).toMatch(
      /\.platform-subtasks\.is-minimal \.platform-subtasks__header\s*\{[^}]*padding-bottom:\s*0;[^}]*border-bottom:\s*0;/s,
    );

    const emptyAddButton = screen.getByRole("button", {
      name: "Add Subtasks",
    });
    expect(emptyAddButton.getAttribute("data-platform-button-variant")).toBe(
      "secondary",
    );
    expect(screen.queryByRole("heading", { name: "Subtasks" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add subtask" })).toBeNull();
    expect(screen.queryByText("No subtasks yet")).toBeNull();
    expect(screen.queryByText("Break this ticket into smaller pieces.")).toBeNull();
    expect(subtasksCss).toMatch(
      /\.platform-subtasks\.is-minimal \.platform-subtasks__empty-add\.platform-button\s*\{\s*padding:\s*0 !important;/,
    );
    fireEvent.click(emptyAddButton);
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("renders interactive rows with the centralized backlog item and status label", () => {
    const onActivate = vi.fn();
    render(
      <PlatformSubtasks
        items={[
          {
            id: "task-2",
            title: "Verify extraction",
            metadata: "EC-002",
            status: "In Review",
            statusVariant: "blue",
            onActivate,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Verify extraction/i }));
    expect(onActivate).toHaveBeenCalledOnce();
    const ticketItem = document.querySelector(
      "[data-platform-ticket-item-variant='list']",
    );
    expect(
      ticketItem?.classList.contains("playground-tasks-backlog-item"),
    ).toBe(true);
    expect(ticketItem?.classList.contains("is-minimalistic-ui")).toBe(true);
    expect(screen.getByText("EC-002")).not.toBeNull();
    expect(
      screen.getByText("In Review").getAttribute("data-platform-label-variant"),
    ).toBe("blue");
  });
});
