// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ComputerDetailPage } from "./computer-detail-page.js";

afterEach(cleanup);

describe("ComputerDetailPage", () => {
  it("composes the shared detail shell and computer tabs", () => {
    const onTabChange = vi.fn();
    const onOpenFilebase = vi.fn();
    const { container } = render(
      <ComputerDetailPage
        header={<h1>Build Computer</h1>}
        tabBarActions={<button type="button">Version 3</button>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        sidebar={<div>Computer properties</div>}
        activeTab="general"
        onTabChange={onTabChange}
        onOpenFilebase={onOpenFilebase}
      >
        <div>Computer analytics</div>
      </ComputerDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "General",
      "Runtime",
      "Settings",
      "Filebase",
    ]);

    fireEvent.click(screen.getByRole("tab", { name: "Runtime" }));
    expect(onTabChange).toHaveBeenCalledWith("runtime");

    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));
    expect(onTabChange).toHaveBeenCalledWith("settings");

    fireEvent.click(screen.getByRole("tab", { name: "Open Filebase" }));
    expect(onOpenFilebase).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledTimes(2);
  });

  it("disables Filebase when the computer has not been saved", () => {
    render(
      <ComputerDetailPage
        header={<h1>Draft Computer</h1>}
        sidebar={<div>Computer properties</div>}
        activeTab="general"
        onTabChange={vi.fn()}
        onOpenFilebase={vi.fn()}
        filebaseDisabled
      >
        <div>Draft configuration</div>
      </ComputerDetailPage>,
    );

    expect((screen.getByRole("tab", { name: "Open Filebase" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
