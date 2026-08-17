// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DATABASES_RESOURCE_DEFINITION,
  DEVELOP_RESOURCE_KINDS,
  DevelopResourceOverviewRoute,
  createDevelopResourceOverviewAnalytics,
  createDevelopResourceOverviewRows,
  getDevelopResourceDefinition,
} from "./index.js";

afterEach(cleanup);

describe("Develop-mode service overview registry", () => {
  it("registers every independent Develop service", () => {
    expect(DEVELOP_RESOURCE_KINDS).toEqual([
      "web_app",
      "api",
      "function",
      "database",
      "auth",
      "agent_runtime",
      "voice_agent",
      "secrets",
      "payments",
    ]);
    expect(getDevelopResourceDefinition("database")).toBe(DATABASES_RESOURCE_DEFINITION);
  });

  it("normalizes raw records through the selected service definition", () => {
    const [row] = createDevelopResourceOverviewRows([{
      id: "db-1",
      name: "Production",
      description: "Customer records",
      resourceType: "database",
      status: "active",
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-12T10:00:00.000Z",
    }], "database", {
      formatDate: () => "Jul 12",
      formatExactDate: (value) => value,
    });

    expect(row).toMatchObject({
      id: "database:db-1",
      sourceId: "db-1",
      resourceType: "database",
      name: "Production",
      typeLabel: "Database",
      published: true,
      createdLabel: "Jul 12",
      lastUsedLabel: "Jul 12",
    });
  });

  it("maps service-specific analytics vocabulary", () => {
    const analytics = createDevelopResourceOverviewAnalytics("database", {
      labels: ["Mon", "Tue"],
      resourceCounts: { databases: 2 },
      totals: { databaseReads: 12, databaseWrites: 4, errors: 1, computeTokens: 36 },
      series: { databaseReads: [8, 4], databaseWrites: [1, 3] },
    }, { publishedCount: 1 });

    expect(analytics.metrics.map((metric) => metric.label)).toEqual([
      "Databases",
      "Database Reads",
      "Database Writes",
      "Errors",
      "Cost in CT",
    ]);
    expect(analytics.series.map((series) => series.id)).toEqual(["database-reads", "database-writes"]);
  });

  it("routes to the service-owned page and delegates controls", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(
      <>
        <div id="develop-overview-controls" data-testid="develop-overview-controls" />
        <div id="develop-overview-period-controls" data-testid="develop-overview-period-controls" />
        <DevelopResourceOverviewRoute
        kind="function"
        rows={[
          {
            id: "server:fn-1",
            sourceId: "fn-1",
            resourceType: "server",
            kind: "function",
            name: "Published Function",
            description: "Live",
            typeLabel: "Function",
            published: true,
            createdAt: 1,
            createdLabel: "Today",
            lastUsedAt: 1,
            lastUsedLabel: "Today",
            searchText: "Published Function Live",
          },
          {
            id: "server:fn-2",
            sourceId: "fn-2",
            resourceType: "server",
            kind: "function",
            name: "Draft Function",
            description: "Draft",
            typeLabel: "Function",
            published: false,
            createdAt: 1,
            createdLabel: "Today",
            lastUsedAt: 0,
            lastUsedLabel: "Never",
            searchText: "Draft Function Draft",
          },
        ]}
        period="month"
        onPeriodChange={vi.fn()}
        controlsPortalId="develop-overview-controls"
        periodPortalId="develop-overview-period-controls"
        operationalMetrics={{ labels: [], series: {}, totals: {}, resourceCounts: { functions: 2 } }}
        onOpen={vi.fn()}
        onCreate={onCreate}
        onRename={vi.fn()}
        onCopy={vi.fn()}
        onDelete={vi.fn()}
        />
      </>,
    );

    expect(document.querySelectorAll(".resource-overview-page")).toHaveLength(1);
    expect(document.querySelector(".resource-overview-page__header")).toBeNull();
    const createButton = screen.getByRole("button", { name: "Function" });
    expect(screen.getByTestId("develop-overview-controls").contains(createButton)).toBe(true);
    const timeframe = screen.getByRole("radiogroup", { name: "Analytics time frame" });
    expect(screen.getByTestId("develop-overview-period-controls").contains(timeframe)).toBe(true);
    await user.click(createButton);
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Filter" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Published" }));
    const table = screen.getByRole("table", { name: "Functions" });
    expect(within(table).getByText("Published Function")).not.toBeNull();
    expect(within(table).queryByText("Draft Function")).toBeNull();
  });

  it("remains stable while navigating repeatedly between server resource overviews", () => {
    const rows = [{
      id: "server:resource-1",
      sourceId: "resource-1",
      resourceType: "server" as const,
      kind: "function",
      name: "Resource One",
      description: "Overview navigation regression fixture",
      typeLabel: "Resource",
      published: true,
      createdAt: 1,
      createdLabel: "Today",
      lastUsedAt: 1,
      lastUsedLabel: "Today",
      searchText: "Resource One",
    }];
    const overviewProps = {
      rows,
      period: "month" as const,
      onPeriodChange: vi.fn(),
      controlsPortalId: "develop-overview-navigation-controls",
      periodPortalId: "develop-overview-navigation-period-controls",
      operationalMetrics: { labels: [], series: {}, totals: {}, resourceCounts: {} },
      onOpen: vi.fn(),
      onCreate: vi.fn(),
      onRename: vi.fn(),
      onCopy: vi.fn(),
      onDelete: vi.fn(),
    };
    const resourceKinds = [
      "web_app",
      "function",
      "database",
      "auth",
      "secrets",
      "payments",
    ] as const;
    const renderRoute = (kind: (typeof resourceKinds)[number]) => (
      <>
        <div id="develop-overview-navigation-controls" />
        <div id="develop-overview-navigation-period-controls" />
        <DevelopResourceOverviewRoute kind={kind} {...overviewProps} />
      </>
    );
    const view = render(renderRoute(resourceKinds[0]));

    for (let pass = 0; pass < 8; pass += 1) {
      resourceKinds.forEach((kind) => view.rerender(renderRoute(kind)));
    }

    expect(document.querySelectorAll(".resource-overview-page")).toHaveLength(1);
    expect(document.querySelectorAll('[data-resource-overview-controls="true"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-resource-overview-period-controls="true"]')).toHaveLength(1);
  });
});
