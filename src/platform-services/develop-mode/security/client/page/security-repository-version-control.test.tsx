// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SecurityServiceRepository } from "../api/security-repository.js";
import type {
  SecurityRepositoryDetail,
  SecurityRepositoryVersion,
  SecurityRepositoryVersionSnapshot,
} from "../domain/index.js";
import { SecurityRepositoryVersionControl } from "./security-repository-version-control.js";

const snapshot: SecurityRepositoryVersionSnapshot = {
  schemaVersion: 1,
  policy: {
    schemaVersion: 1,
    defaultBranch: "main",
    scanMode: "incremental",
    schedule: { enabled: false, cron: "0 3 * * *", timezone: "UTC" },
    pullRequests: {
      enabled: true,
      branches: [],
      pathIncludes: [],
      pathExcludes: [],
      scanForksReadOnly: true,
    },
    push: { enabled: false, branches: [] },
    scanners: ["sast"],
    remediation: {
      mode: "disabled",
      minimumSeverity: "high",
      draftPullRequestsOnly: true,
      allowWorkflowChanges: false,
      maximumChangedFiles: 20,
      maximumPatchBytes: 250_000,
    },
  },
  threatModel: {
    schemaVersion: 1,
    summary: "API service",
    entryPoints: [],
    untrustedInputs: [],
    trustBoundaries: [],
    sensitiveDataPaths: [],
    privilegedActions: [],
    priorityAreas: [],
    exclusions: [],
  },
};

const version: SecurityRepositoryVersion = {
  id: "security_repository_version_1",
  version: 1,
  label: "Version 1",
  name: "Version 1",
  description: "Initial version",
  status: "published",
  snapshot,
  metadata: null,
  publishedAt: "2026-07-22T08:00:00.000Z",
  createdAt: "2026-07-22T08:00:00.000Z",
  updatedAt: "2026-07-22T08:00:00.000Z",
};

const detail = {
  repository: {
    id: "security_repository_1",
    fullName: "acme/api",
  },
  policy: {
    id: "policy_1",
    version: 1,
    value: snapshot.policy,
    changeSummary: "Initial policy",
    createdAt: "2026-07-22T08:00:00.000Z",
  },
  threatModel: {
    id: "threat_1",
    version: 1,
    value: snapshot.threatModel,
    changeSummary: "Initial threat model",
    createdAt: "2026-07-22T08:00:00.000Z",
  },
  runs: [],
  findings: [],
  auditEvents: [],
} as unknown as SecurityRepositoryDetail;

beforeEach(() => {
  const controls = document.createElement("div");
  controls.id = "security-version-controls";
  document.body.appendChild(controls);
  const drawer = document.createElement("aside");
  drawer.id = "security-version-drawer";
  document.body.appendChild(drawer);
});

afterEach(() => {
  cleanup();
  document.getElementById("security-version-controls")?.remove();
  document.getElementById("security-version-drawer")?.remove();
});

describe("SecurityRepositoryVersionControl", () => {
  it("drives the shared header label, history drawer, draft guard, and save control", async () => {
    const repository = {
      listRepositoryVersions: vi.fn().mockResolvedValue([version]),
    } as unknown as SecurityServiceRepository;
    const onHeaderChange = vi.fn();
    const onNavigationGuardChange = vi.fn();
    const onVersionsSidebarOpenChange = vi.fn();

    render(
      <SecurityRepositoryVersionControl
        detail={detail}
        repository={repository}
        controlsPortalId="security-version-controls"
        versionsDrawerPortalId="security-version-drawer"
        onBack={vi.fn()}
        onReload={vi.fn().mockResolvedValue(detail)}
        onHeaderChange={onHeaderChange}
        onNavigationGuardChange={onNavigationGuardChange}
        onVersionsSidebarOpenChange={onVersionsSidebarOpenChange}
      >
        {({ detail: versionedDetail, onPolicyChange }) => (
          <div>
            <span>{versionedDetail.repository.fullName}</span>
            <button
              type="button"
              onClick={() =>
                onPolicyChange({
                  ...versionedDetail.policy!.value,
                  scanMode: "full",
                })
              }
            >
              Change scan mode
            </button>
          </div>
        )}
      </SecurityRepositoryVersionControl>,
    );

    await waitFor(() => {
      expect(onHeaderChange).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "detail",
          title: "acme/api",
          resourceType: "security_repository",
          versionNumber: 1,
          versionIsLatest: true,
        }),
      );
    });

    const detailHeader = onHeaderChange.mock.calls
      .map(([state]) => state)
      .find((state) => state.mode === "detail" && state.versionNumber === 1);
    await act(async () => detailHeader.onVersionClick());
    expect(await screen.findByText("Version history")).toBeTruthy();
    expect(onVersionsSidebarOpenChange).toHaveBeenCalledWith(true);

    const saveButton = screen.getByRole("button", {
      name: "Save repository security changes",
    });
    const saveOptionsButton = screen.getByRole("button", {
      name: "Version save options",
    });
    expect(screen.queryByRole("button", { name: "Run scan" })).toBeNull();
    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    expect((saveOptionsButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Change scan mode" }));
    await waitFor(() => {
      expect((saveButton as HTMLButtonElement).disabled).toBe(false);
      expect((saveOptionsButton as HTMLButtonElement).disabled).toBe(false);
    });
    expect(onNavigationGuardChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "security-repository-unsaved-changes",
        active: true,
      }),
    );
  });
});
