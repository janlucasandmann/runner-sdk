// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AgentDetailPage } from "./agent-detail-page.js";

afterEach(cleanup);

describe("AgentDetailPage", () => {
  it("composes the shared detail shell and canonical agent tabs", () => {
    const { container } = render(
      <AgentDetailPage
        header={<h1>Atlas</h1>}
        actions={<button type="button">Save</button>}
        sidebar={<div>Agent model</div>}
        activeTab="general"
        onTabChange={vi.fn()}
      >
        <div>Agent instructions</div>
      </AgentDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "General",
      "Insights",
      "Evaluation",
      "Guardrails",
      "Permissions",
    ]);
    expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
  });
});
