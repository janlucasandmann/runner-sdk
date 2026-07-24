// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SecurityRepositoryDetail } from "../domain/index.js";
import { SecurityRepositorySidebar } from "./security-repository-sidebar.js";

const detail = {
  repository: {
    id: "security_repository_1",
    fullName: "acme/api",
    defaultBranch: "main",
    private: true,
    status: "active",
    lastRunAt: null,
    nextScanAt: null,
    metadata: {
      creator: { name: "Ada Lovelace", email: "ada@acme.test" },
      owner: { name: "Grace Hopper", email: "grace@acme.test" },
    },
  },
  policy: { version: 3 },
  threatModel: { version: 2 },
  runs: [],
  findings: [],
  auditEvents: [],
} as unknown as SecurityRepositoryDetail;

afterEach(cleanup);

describe("SecurityRepositorySidebar", () => {
  it("uses centralized cards with the direct sidebar lists and identity rows from Evaluation details", () => {
    const { container } = render(
      <aside className="playground-agents-detail-sidebar playground-ticket-detail-sidebar develop-security-detail-sidebar">
        <SecurityRepositorySidebar detail={detail} />
      </aside>,
    );

    expect(
      container.querySelectorAll("[data-platform-ui-card-variant='sidebar']"),
    ).toHaveLength(2);
    expect(
      container.querySelectorAll(".platform-detail-sidebar__section"),
    ).toHaveLength(0);

    const detailsHeading = screen.getByRole("heading", {
      name: "Details",
      level: 2,
    });
    expect(
      detailsHeading.classList.contains("platform-ui-card__sidebar-title"),
    ).toBe(true);
    const detailsSection = detailsHeading.closest("section");
    expect(
      detailsSection?.classList.contains(
        "playground-ticket-detail-sidebar-section",
      ),
    ).toBe(true);
    expect(
      detailsSection?.classList.contains(
        "playground-ticket-detail-sidebar-details",
      ),
    ).toBe(true);
    expect(
      detailsSection?.classList.contains(
        "playground-evaluations-detail-sidebar-card",
      ),
    ).toBe(true);
    expect(
      detailsSection?.querySelector(
        ".playground-evaluations-detail-sidebar-list",
      ),
    ).not.toBeNull();
    expect(
      detailsSection?.querySelectorAll(
        ".playground-evaluations-detail-sidebar-row",
      ),
    ).toHaveLength(7);
    expect(
      detailsSection?.querySelector(".playground-tasks-detail-facts"),
    ).toBeNull();
    expect(
      detailsSection?.querySelector(".is-centralized-sidebar-content"),
    ).toBeNull();

    expect(screen.getByLabelText("Status: active")).toBeTruthy();
    const creatorRow = screen.getByLabelText("Creator: Ada Lovelace");
    expect(
      creatorRow.querySelector(".playground-evaluations-detail-person"),
    ).not.toBeNull();
    expect(
      creatorRow.querySelector(".playground-evaluations-run-agent-avatar"),
    ).not.toBeNull();
    expect(screen.getByLabelText("Default branch: main")).toBeTruthy();
    expect(screen.queryByText("Policy v3")).toBeNull();
    expect(screen.queryByText("Threat model v2")).toBeNull();
    expect(screen.queryByText("Policy")).toBeNull();
    expect(screen.queryByText("Threat model")).toBeNull();
    const ownerRow = screen.getByLabelText("Owner: Grace Hopper");
    expect(ownerRow.classList.contains("is-owner")).toBe(true);
    expect(
      ownerRow.querySelector(".playground-evaluations-detail-owner-value"),
    ).not.toBeNull();
    expect(within(ownerRow).getByText("Grace Hopper")).toBeTruthy();
    expect(
      ownerRow.querySelector(".playground-evaluations-detail-owner-avatar"),
    ).not.toBeNull();
    const ownerSelector = within(ownerRow).getByRole("button", {
      name: "Choose repository owner",
    });
    expect((ownerSelector as HTMLButtonElement).disabled).toBe(true);
    expect(
      ownerSelector.closest(".playground-evaluations-detail-owner-selector"),
    ).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "About" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Owner" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Properties" })).toBeNull();
    expect(container.querySelector(".develop-security-properties")).toBeNull();

    const safetySection = screen
      .getByRole("heading", { name: "Safety boundary" })
      .closest("section");
    expect(
      safetySection?.classList.contains(
        "playground-ticket-detail-sidebar-section",
      ),
    ).toBe(true);
    expect(
      safetySection?.classList.contains(
        "playground-ticket-detail-sidebar-threads",
      ),
    ).toBe(true);
    expect(
      safetySection?.querySelectorAll(
        ".playground-evaluations-detail-sidebar-row",
      ),
    ).toHaveLength(3);
    expect(
      safetySection?.querySelector(".playground-tasks-detail-facts"),
    ).toBeNull();
  });

  it("uses the signed-in identity for legacy repositories without creator metadata", () => {
    const legacyDetail = {
      ...detail,
      repository: {
        ...detail.repository,
        metadata: null,
      },
    } as unknown as SecurityRepositoryDetail;

    const { container } = render(
      <SecurityRepositorySidebar
        detail={legacyDetail}
        viewerIdentity={{
          id: "user_jan",
          userId: "user_jan",
          name: "Jan Sandmann",
          email: "jan@computeragents.test",
          avatarUrl: "https://example.test/jan.png",
        }}
      />,
    );

    expect(screen.getByLabelText("Creator: Jan Sandmann")).toBeTruthy();
    expect(screen.getByLabelText("Owner: Jan Sandmann")).toBeTruthy();
    expect(screen.queryByText("Unknown")).toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("loads eligible team members and persists a selected owner through the centralized selector", async () => {
    const onLoadOwnerCandidates = vi.fn().mockResolvedValue([
      {
        status: "active",
        user: {
          id: "user_ada",
          displayName: "Ada Lovelace",
          email: "ada@acme.test",
        },
        teamNames: ["AppSec"],
      },
    ]);
    const onOwnerChange = vi.fn().mockResolvedValue(true);

    render(
      <SecurityRepositorySidebar
        detail={detail}
        viewerIdentity={{
          id: "user_grace",
          userId: "user_grace",
          name: "Grace Hopper",
          email: "grace@acme.test",
        }}
        onLoadOwnerCandidates={onLoadOwnerCandidates}
        onOwnerChange={onOwnerChange}
      />,
    );

    const selector = screen.getByRole("button", {
      name: "Choose repository owner",
    });
    expect((selector as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(selector);

    const adaOption = await screen.findByRole("option", {
      name: "Ada Lovelace, ada@acme.test",
    });
    expect(onLoadOwnerCandidates).toHaveBeenCalledTimes(1);
    fireEvent.click(adaOption);

    await waitFor(() =>
      expect(onOwnerChange).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user_ada",
          userId: "user_ada",
          name: "Ada Lovelace",
          email: "ada@acme.test",
        }),
      ),
    );
  });
});
