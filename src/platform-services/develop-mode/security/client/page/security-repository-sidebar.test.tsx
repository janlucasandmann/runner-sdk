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
  it("places the primary Run scan action at the bottom of Details", () => {
    const onRunScan = vi.fn();
    const { container } = render(
      <SecurityRepositorySidebar detail={detail} onRunScan={onRunScan} />,
    );

    const detailsSection = container.querySelector(
      ".playground-security-agent-detail-properties-card",
    );
    const runScanButton = screen.getByRole("button", { name: "Run scan" });
    expect(runScanButton.getAttribute("data-platform-button-variant")).toBe(
      "primary",
    );
    expect(detailsSection?.lastElementChild).toBe(runScanButton);

    fireEvent.click(runScanButton);
    expect(onRunScan).toHaveBeenCalledTimes(1);
  });

  it("uses the title-free Agent Runtime properties card and shared sidebar rows", () => {
    const { container } = render(
      <aside className="playground-agents-detail-sidebar playground-ticket-detail-sidebar develop-security-detail-sidebar">
        <SecurityRepositorySidebar detail={detail} />
      </aside>,
    );

    expect(
      container.querySelectorAll("[data-platform-ui-card-variant='sidebar']"),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(".platform-detail-sidebar__section"),
    ).toHaveLength(0);
    expect(screen.queryByRole("heading")).toBeNull();

    const detailsSection = container.querySelector(
      ".playground-server-detail-properties-card",
    );
    expect(
      detailsSection?.classList.contains(
        "playground-security-agent-detail-properties-card",
      ),
    ).toBe(true);
    expect(
      detailsSection?.querySelector(
        ".playground-project-overview-sidebar-rows",
      ),
    ).not.toBeNull();
    expect(
      detailsSection?.querySelectorAll(
        ".playground-project-overview-sidebar-row",
      ),
    ).toHaveLength(10);
    expect(
      detailsSection?.querySelector(".playground-tasks-detail-facts"),
    ).toBeNull();
    expect(
      detailsSection?.querySelector(".is-centralized-sidebar-content"),
    ).toBeNull();

    expect(screen.getByLabelText("Status: active")).toBeTruthy();
    const creatorRow = screen.getByLabelText("Creator: Ada Lovelace");
    expect(
      creatorRow.querySelector(".resource-overview-identity"),
    ).not.toBeNull();
    expect(
      creatorRow.querySelector(".resource-overview-identity__visual"),
    ).not.toBeNull();
    expect(screen.getByLabelText("Default branch: main")).toBeTruthy();
    expect(screen.queryByText("Policy v3")).toBeNull();
    expect(screen.queryByText("Threat model v2")).toBeNull();
    expect(screen.queryByText("Policy")).toBeNull();
    expect(screen.queryByText("Threat model")).toBeNull();
    const ownerRow = screen.getByLabelText("Owner: Grace Hopper");
    expect(ownerRow.classList.contains("is-owner")).toBe(true);
    expect(
      ownerRow.querySelector(".platform-owner-selector__identity"),
    ).not.toBeNull();
    expect(within(ownerRow).getByText("Grace Hopper")).toBeTruthy();
    expect(
      ownerRow.querySelector(".platform-owner-selector__avatar"),
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
    expect(
      screen.queryByRole("heading", { name: "Safety boundary" }),
    ).toBeNull();
    expect(screen.getByLabelText("Checkout: Exact SHA")).toBeTruthy();
    expect(screen.getByLabelText("Worker: Disposable")).toBeTruthy();
    expect(
      screen.getByLabelText("Publication: Draft PR after approval"),
    ).toBeTruthy();
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
    expect(
      await screen.findByRole("heading", {
        name: "Transfer security repository ownership?",
      }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Transfer Ownership" }),
    );

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
