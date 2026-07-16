// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ModelDetailsModal } from "./model-details-modal.js";

afterEach(cleanup);

describe("ModelDetailsModal", () => {
  it("renders model and availability metadata through the centralized modal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onCreateAgent = vi.fn();
    const model = {
      id: "kimi-k2.7-code",
      label: "Kimi K2.7 Code",
      details: {
        categoryLabel: "Agent model",
        description: "Long-horizon coding model.",
        providerIcon: {
          src: "/img/05-model-provider-icons/kimi.png",
          alt: "Moonshot",
        },
        overviewFacts: [
          { label: "Model ID", value: "kimi-k2.7-code" },
          { label: "Context", value: "262k" },
        ],
        availabilityFacts: [
          { label: "Model provider", value: "Moonshot AI" },
          { label: "Delivery provider", value: "Cloudflare Workers AI" },
          { label: "Location", value: "Cloudflare global network" },
        ],
        capabilities: ["Function calling", "Reasoning"],
        documentationUrl: "https://developers.cloudflare.com/workers-ai/models/kimi-k2.7-code/",
        canCreateAgent: true,
        agentModelId: "kimi-k2.7-code",
      },
    };

    render(
      <ModelDetailsModal
        model={model}
        onClose={onClose}
        onCreateAgent={onCreateAgent}
      />,
    );

    expect(await screen.findByRole("dialog", { name: "Kimi K2.7 Code" })).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.queryByText("Agent model")).toBeNull();
    const providerIcon = screen.getByRole("heading", { name: "Kimi K2.7 Code", level: 2 })
      .querySelector<HTMLImageElement>(".models-overview-details-modal__provider-icon img");
    expect(providerIcon?.getAttribute("src")).toBe("/img/05-model-provider-icons/kimi.png");
    expect(providerIcon?.getAttribute("alt")).toBe("");
    expect(screen.getByText("Moonshot AI")).not.toBeNull();
    expect(screen.getByText("Cloudflare Workers AI")).not.toBeNull();
    expect(screen.getByText("Cloudflare global network")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Provider documentation" }).getAttribute("href"))
      .toBe("https://developers.cloudflare.com/workers-ai/models/kimi-k2.7-code/");

    await user.click(screen.getByRole("button", { name: "Create Agent" }));
    expect(onClose).toHaveBeenCalled();
    expect(onCreateAgent).toHaveBeenCalledWith(model);
  });
});
