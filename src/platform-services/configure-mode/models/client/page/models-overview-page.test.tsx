// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlatformDataTableColumn } from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  getModelContextLabelVariant,
  ModelsOverviewPage,
  type ModelsOverviewRow,
} from "./models-overview-page.js";
import { ModelsFeaturedSection } from "./models-overview-presentation.js";

afterEach(cleanup);

const rows: ModelsOverviewRow[] = [
  {
    id: "model-1",
    label: "Model One",
    provider: "Provider One",
    contextWindow: "262k",
    speed: "97.7 t/s",
    details: {
      categoryLabel: "Agent model",
      description: "A model for agent execution.",
      overviewFacts: [{ label: "Model ID", value: "model-1" }],
      availabilityFacts: [
        { label: "Model provider", value: "Provider One" },
        { label: "Location", value: "Provider-managed" },
      ],
      canCreateAgent: true,
      agentModelId: "model-1",
    },
  },
];

const columns: PlatformDataTableColumn<ModelsOverviewRow>[] = [
  {
    id: "name",
    header: "Model",
    accessor: (row) => row.label,
    sortable: true,
  },
  {
    id: "provider",
    header: "Provider",
    accessor: (row) => row.provider,
    sortable: true,
  },
  {
    id: "context",
    header: "Context",
    accessor: (row) => row.contextWindow,
    sortable: true,
  },
  {
    id: "speed",
    header: "Speed in TPS",
    accessor: (row) => row.speed,
    sortable: true,
  },
];

describe("ModelsOverviewPage", () => {
  it("renders featured models with the centralized feature card component", () => {
    const { container } = render(
      <ModelsFeaturedSection
        models={[{
          id: "deepseek-v4-flash",
          label: "DeepSeek V4 Flash",
          description: "Fast model",
          provider: "DeepSeek",
          providerType: "deepseek",
          category: "agent",
          contextWindow: "128k",
          speed: "Fast",
        }]}
      />,
    );

    const card = container.querySelector(".playground-models-featured-card");
    expect(card?.classList.contains("platform-ui-card")).toBe(true);
    expect(card?.classList.contains("is-feature")).toBe(true);
    expect(card?.getAttribute("data-platform-ui-card-variant")).toBe("feature");
    expect(screen.getByText("DeepSeek V4 Flash")).not.toBeNull();
    const badge = screen.getByText("Speed & value");
    expect(badge.classList.contains("platform-label")).toBe(true);
    expect(badge.getAttribute("data-platform-label-has-icon")).toBeNull();
    expect(badge.querySelector("svg")).toBeNull();
    expect(screen.getByText(/Fast, cost-efficient execution/)).not.toBeNull();
  });

  it("limits the featured model section to the first three recommendations", () => {
    const featuredModels = [
      { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash" },
      { id: "kimi-k2.7-code", label: "Kimi K2.7 Code" },
      { id: "glm-5.2", label: "GLM 5.2" },
      { id: "grok-4.5", label: "Grok 4.5" },
    ].map((model) => ({
      ...model,
      description: `${model.label} description`,
      provider: "Provider",
      providerType: "provider",
      category: "agent" as const,
      contextWindow: "128k",
      speed: "Fast",
    }));

    const { container } = render(
      <ModelsFeaturedSection models={featuredModels} />,
    );

    expect(
      container.querySelectorAll(".playground-models-featured-card"),
    ).toHaveLength(3);
    expect(screen.getByText("DeepSeek V4 Flash")).not.toBeNull();
    expect(screen.getByText("Kimi K2.7 Code")).not.toBeNull();
    expect(screen.getByText("GLM 5.2")).not.toBeNull();
    expect(screen.queryByText("Grok 4.5")).toBeNull();
  });

  it("maps context capacities to the shared label variants", () => {
    expect(getModelContextLabelVariant(undefined)).toBe("gray");
    expect(getModelContextLabelVariant("Custom")).toBe("gray");
    expect(getModelContextLabelVariant("299k")).toBe("yellow");
    expect(getModelContextLabelVariant("300k")).toBe("blue");
    expect(getModelContextLabelVariant("999,999")).toBe("blue");
    expect(getModelContextLabelVariant("1M")).toBe("green");
  });

  it("uses the canonical overview shell with featured cards instead of analytics", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onProviderFilterChange = vi.fn();
    const onSortingChange = vi.fn();
    const onTabChange = vi.fn();
    const onCreateAgent = vi.fn();

    const { container } = render(
      <ModelsOverviewPage
        rows={rows}
        columns={columns}
        featuredContent={<section aria-label="Featured Models">Featured model cards</section>}
        skillSettingsContent={<div>Model skill settings</div>}
        tabs={[
          { id: "agent", label: "Agent Models" },
          { id: "image", label: "Image" },
          { id: "video", label: "Video" },
          { id: "deep_research", label: "Deep Research" },
        ]}
        activeTab="agent"
        onTabChange={onTabChange}
        onCreateAgent={onCreateAgent}
        searchValue=""
        onSearchChange={onSearchChange}
        providerFilter="all"
        providerFilterOptions={[
          { id: "all", label: "All models" },
          { id: "provider-one", label: "Provider One" },
        ]}
        onProviderFilterChange={onProviderFilterChange}
        sorting={{ id: "name", direction: "asc" }}
        onSortingChange={onSortingChange}
        getRowId={(row) => row.id}
      />,
    );

    expect(container.querySelectorAll(".resource-overview-page.is-models-overview")).toHaveLength(1);
    expect(container.querySelector(".platform-analytics")).toBeNull();
    expect(screen.getByRole("region", { name: "Featured Models" })).not.toBeNull();
    expect(screen.getByText("Model skill settings")).not.toBeNull();
    expect(screen.getByRole("table", { name: "Models" })).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "All Models" })).toBeNull();
    expect(screen.getByText("262k").getAttribute("data-platform-label-variant")).toBe("yellow");
    expect(screen.getByText("97.7 t/s").closest(".platform-label")).toBeNull();

    const selectAll = screen.getByRole("checkbox", { name: "Select all visible rows" });
    const selectModel = screen.getByRole("checkbox", { name: "Select Model One" });
    expect(selectAll.getAttribute("aria-checked")).toBe("false");
    await user.click(selectModel);
    expect(selectAll.getAttribute("aria-checked")).toBe("true");

    const tabBar = screen.getByRole("navigation", { name: "Model categories" });
    expect(tabBar.getAttribute("data-platform-detail-tab-bar-variant")).toBe("minimal");
    expect(tabBar.classList.contains("has-divider")).toBe(false);
    expect(within(tabBar).getByRole("tab", { name: "Agent Models" }).getAttribute("aria-selected")).toBe("true");
    await user.click(within(tabBar).getByRole("tab", { name: "Image" }));
    expect(onTabChange).toHaveBeenCalledWith("image");

    const rowActions = screen.getByRole("button", { name: "Open actions for Model One" });
    await user.click(rowActions);
    expect(screen.getByRole("menuitem", { name: "Create Agent" })).not.toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "View Details" }));
    expect(await screen.findByRole("dialog", { name: "Model One" })).not.toBeNull();
    expect(screen.getByText("Provider-managed")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Close model details" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Model One" })).toBeNull();
    });

    await user.click(rowActions);
    await user.click(screen.getByRole("menuitem", { name: "Create Agent" }));
    expect(onCreateAgent).toHaveBeenCalledWith(rows[0]);

    const search = screen.getByPlaceholderText("Search models");
    await user.type(search, "one");
    expect(onSearchChange).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Filter" }));
    const filterMenu = screen.getByRole("menu");
    await user.click(within(filterMenu).getByRole("menuitemradio", { name: "Provider One" }));
    expect(onProviderFilterChange).toHaveBeenCalledWith("provider-one");

    await user.click(screen.getByRole("button", { name: "Sort Model descending" }));
    expect(onSortingChange).toHaveBeenCalled();
  });
});
