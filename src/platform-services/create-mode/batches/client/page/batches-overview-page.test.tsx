// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BatchJob } from "../batches-types.js";
import { BatchCreateModal } from "./batch-create-modal.js";
import {
  BatchesOverviewPage,
  getBatchDropIndex,
  reorderBatchJobsForDisplay,
} from "./batches-overview-page.js";

const heldJob: BatchJob = {
  id: "batch_1",
  userId: "user_1",
  organizationId: null,
  createdByUserId: "user_1",
  name: "Review repository",
  description: "Run the repository review later.",
  targetKind: "thread_run",
  targetResourceId: "thread_1",
  targetVersionId: null,
  definition: { threadId: "thread_1", message: "Review it" },
  startPolicy: "manual",
  status: "held",
  queueLane: "default",
  priority: 100,
  position: 1000,
  maxAttempts: 3,
  attemptCount: 0,
  executionGeneration: 1,
  availableAt: "2026-08-17T10:00:00.000Z",
  waitReason: null,
  nativeResourceType: null,
  nativeResourceId: null,
  sourceProjectId: null,
  sourceTicketId: null,
  permissionSet: "ring_2",
  idempotencyKey: null,
  leaseOwner: null,
  leaseExpiresAt: null,
  heartbeatAt: null,
  lastError: null,
  metadata: {},
  createdAt: "2026-08-17T10:00:00.000Z",
  updatedAt: "2026-08-17T10:00:00.000Z",
  queuedAt: null,
  startedAt: null,
  completedAt: null,
};

afterEach(cleanup);

function workflowContext(triggerType: string) {
  const nodes = [
    {
      id: "trigger_1",
      data: { kind: "trigger", subtype: triggerType, config: { triggerType } },
    },
    {
      id: "action_1",
      data: {
        kind: "action",
        config: { agentId: "agent_spark", environmentId: "computer_default" },
      },
    },
  ];
  return {
    workflow: { id: "metronome_security_review", name: "Security review" },
    definition: { nodes, edges: [{ source: "trigger_1", target: "action_1" }] },
    versionId: "metronome_version_4",
    nodes,
    edges: [{ source: "trigger_1", target: "action_1" }],
    functionOptions: [],
    webAppOptions: [],
    databaseOptions: [],
    authOptions: [],
  };
}

describe("BatchesOverviewPage", () => {
  it("reuses the Skills overview and exposes lifecycle actions", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCreate = vi.fn();
    const onStart = vi.fn();
    const { container } = render(
      <>
        <div id="batches-test-controls" />
        <BatchesOverviewPage
          jobs={[heldJob]}
          controlsPortalId="batches-test-controls"
          onOpen={onOpen}
          onCreate={onCreate}
          onStart={onStart}
          onHold={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onReorder={vi.fn()}
        />
      </>,
    );

    expect(container.querySelector(".is-skills.is-batches")).not.toBeNull();
    expect(container.querySelector(".lucide-message-square")).not.toBeNull();
    expect(screen.getAllByText("Review repository").length).toBeGreaterThan(0);
    expect(screen.getByRole("columnheader", { name: "Owner" })).not.toBeNull();
    expect(screen.queryByRole("columnheader", { name: "Creator" })).toBeNull();
    expect(screen.getByRole("checkbox", { name: "Select all visible rows" })).not.toBeNull();
    expect(screen.getByRole("checkbox", { name: "Select Review repository" })).not.toBeNull();
    const overviewRow = screen.getByRole("row", { name: "Review repository" });
    expect(overviewRow.getAttribute("draggable")).toBe("true");
    expect(
      within(overviewRow).getByText("Run the repository review later."),
    ).not.toBeNull();
    expect(within(overviewRow).queryByText("On shelf")).toBeNull();
    expect(screen.queryByRole("button", { name: "Reorder Review repository" })).toBeNull();
    expect(screen.queryByText(/Shelf work for later/)).toBeNull();
    await user.click(screen.getByRole("button", { name: "New Job" }));
    expect(onCreate).toHaveBeenLastCalledWith();

    await user.click(screen.getByRole("button", { name: "Choose job type" }));
    expect(screen.getByRole("menu", { name: "Choose job type" })).not.toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "Workflow" }));
    expect(onCreate).toHaveBeenLastCalledWith("metronome_run");

    await user.click(screen.getByRole("button", { name: "Open actions for Review repository" }));
    await user.click(screen.getByRole("menuitem", { name: "Start" }));
    expect(onStart).toHaveBeenCalledWith(heldJob);

    await user.click(screen.getByRole("button", { name: "Open actions for Review repository" }));
    expect(screen.getByRole("menuitem", { name: "Delete" }).classList.contains("is-danger")).toBe(false);
  });

  it("filters jobs from the app-header scope switch and renders the owner identity", async () => {
    const user = userEvent.setup();
    const otherJob: BatchJob = {
      ...heldJob,
      id: "batch_2",
      userId: "user_2",
      createdByUserId: "user_3",
      name: "Team evaluation",
      description: "",
      metadata: {
        owner: {
          userId: "user_2",
          name: "Simone Owner",
          avatarUrl: "/simone.png",
        },
        creator: {
          userId: "user_3",
          name: "Casey Creator",
          avatarUrl: "/casey.png",
        },
      },
    };

    function ScopeHarness() {
      const [scope, setScope] = useState<"all" | "created">("all");
      return (
        <>
          <div id="batches-test-scope" />
          <BatchesOverviewPage
            jobs={[heldJob, otherJob]}
            scopePortalId="batches-test-scope"
            scope={scope}
            onScopeChange={setScope}
            currentUser={{
              id: "user_1",
              name: "Jan Sandmann",
              email: "jan@example.com",
              avatarUrl: "/jan.png",
            }}
            onOpen={vi.fn()}
            onCreate={vi.fn()}
            onStart={vi.fn()}
            onHold={vi.fn()}
            onCancel={vi.fn()}
            onDelete={vi.fn()}
            onReorder={vi.fn()}
          />
        </>
      );
    }

    const { container } = render(<ScopeHarness />);
    expect(await screen.findByRole("radiogroup", { name: "Batch scope" })).not.toBeNull();
    expect(screen.getByRole("radio", { name: "All Jobs" })).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Created by me" })).not.toBeNull();
    expect(screen.getByText("Jan Sandmann")).not.toBeNull();
    expect(screen.getByText("Simone Owner")).not.toBeNull();
    expect(screen.queryByText("Casey Creator")).toBeNull();
    expect(screen.getByText("No description")).not.toBeNull();
    expect(container.querySelector('img[src="/jan.png"]')).not.toBeNull();
    expect(container.querySelector('img[src="/simone.png"]')).not.toBeNull();

    await user.click(screen.getByRole("radio", { name: "Created by me" }));
    await waitFor(() => expect(screen.queryByText("Team evaluation")).toBeNull());
    expect(screen.getAllByText("Review repository").length).toBeGreaterThan(0);
    expect(screen.getByRole("radio", { name: "Created by me" }).getAttribute("aria-checked")).toBe(
      "true",
    );
  });

  it("separates shelf and capacity queues into expandable ordering sections", async () => {
    const capacityJob: BatchJob = {
      ...heldJob,
      id: "batch_2",
      name: "Capacity scan",
      startPolicy: "when_capacity_available",
      status: "queued",
    };
    const laterShelfJob: BatchJob = {
      ...heldJob,
      id: "batch_3",
      name: "Later shelf review",
      position: 2000,
    };
    const repeatableJob: BatchJob = {
      ...heldJob,
      id: "batch_4",
      name: "Repeatable review",
      startPolicy: "stay_on_shelf",
    };
    const completedJob: BatchJob = {
      ...heldJob,
      id: "batch_5",
      name: "Completed one-shot review",
      status: "succeeded",
      completedAt: "2026-08-17T11:00:00.000Z",
    };
    render(
      <BatchesOverviewPage
        jobs={[capacityJob, laterShelfJob, heldJob, repeatableJob, completedJob]}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onStart={vi.fn()}
        onHold={vi.fn()}
        onCancel={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Collapse Keep on shelf" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Collapse Stay on shelf" })).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Collapse Start when capacity is free" }),
    ).not.toBeNull();
    expect(screen.getAllByText("Repeatable review").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Completed one-shot review")).toHaveLength(0);
    expect(
      getBatchDropIndex([capacityJob, laterShelfJob, heldJob], laterShelfJob, heldJob, "before"),
    ).toBe(0);
    expect(
      getBatchDropIndex([capacityJob, laterShelfJob, heldJob], heldJob, capacityJob, "after"),
    ).toBe(-1);
    const optimisticallyReordered = reorderBatchJobsForDisplay(
      [laterShelfJob, heldJob],
      laterShelfJob,
      0,
    );
    expect(
      optimisticallyReordered.find((job) => job.id === laterShelfJob.id)
        ?.position,
    ).toBe(1000);
    expect(
      optimisticallyReordered.find((job) => job.id === heldJob.id)?.position,
    ).toBe(1001);
  });

  it("uses save and start actions for existing manual-policy jobs", async () => {
    const onSubmit = vi.fn();
    render(
      <BatchCreateModal
        open
        mode="edit"
        draft={heldJob}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        threadComposerProps={{
          backendUrl: "/api/real",
          apiKey: "test-key",
          agents: [{ id: "agent_spark", name: "Spark", isDefault: true }],
          environments: [{ id: "computer_default", name: "Default Computer", isDefault: true }],
        }}
      />,
    );

    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Review repository");
    expect(
      (screen.getByRole("button", { name: "Batch work type: Thread" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Save Changes" }).querySelector(".lucide-bookmark"),
    ).not.toBeNull();
    expect(screen.getByRole("button", { name: "Start Job" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    expect(screen.queryByText("Attempts")).toBeNull();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Review repository with current changes" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Start Job" }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Review repository with current changes",
          targetKind: "thread_run",
          startPolicy: "manual",
          definition: expect.objectContaining({ message: "Review it" }),
        }),
        "start",
      );
    });
    await waitFor(() => {
      expect((screen.getByRole("button", { name: "Start Job" }) as HTMLButtonElement).disabled)
        .toBe(false);
    });

    cleanup();
    const onSave = vi.fn();
    const { rerender } = render(
      <BatchCreateModal
        open
        mode="edit"
        draft={{ ...heldJob, startPolicy: "stay_on_shelf" }}
        onClose={vi.fn()}
        onSubmit={onSave}
        threadComposerProps={{
          backendUrl: "/api/real",
          apiKey: "test-key",
          agents: [{ id: "agent_spark", name: "Spark", isDefault: true }],
          environments: [{ id: "computer_default", name: "Default Computer", isDefault: true }],
        }}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Batch start policy").textContent).toContain("Stay on shelf");
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ startPolicy: "stay_on_shelf" }),
        "save",
      );
    });

    rerender(
      <BatchCreateModal
        open
        mode="view"
        draft={{ ...heldJob, status: "succeeded" } as BatchJob}
        onClose={vi.fn()}
        onSubmit={onSave}
      />,
    );
    expect((screen.getByLabelText("Name") as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Close" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Save Changes" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add Job" })).toBeNull();
  });

  it("creates a new Thread Batch from a prompt without requiring a thread ID", async () => {
    const onSubmit = vi.fn();
    render(
      <BatchCreateModal
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
        loadTargetResources={async (targetKind) =>
          targetKind === "metronome_run"
            ? [
                {
                  id: "metronome_security_review",
                  targetKind,
                  name: "Security review",
                  description: "Review repositories for vulnerabilities.",
                  status: "active",
                  versionId: "metronome_version_4",
                },
              ]
            : []
        }
        loadMetronomeManualRunContext={async () => workflowContext("thread_event")}
        threadComposerProps={{
          backendUrl: "/api/real",
          apiKey: "test-key",
          agentId: "agent_spark",
          environmentId: "computer_default",
          agents: [{ id: "agent_spark", name: "Spark", isDefault: true }],
          environments: [{ id: "computer_default", name: "Default Computer", isDefault: true }],
        }}
      />,
    );

    const nameInput = screen.getByLabelText("Name");
    expect(nameInput.closest(".platform-modal-header.is-search")).not.toBeNull();
    expect(nameInput.closest(".platform-search")?.querySelector(".lucide-truck")).not.toBeNull();
    expect(document.querySelector(".batches-create-modal__body [aria-label='Name']")).toBeNull();
    expect(
      document.querySelector(".batches-create-modal__body [aria-label='Batch work type']"),
    ).toBeNull();
    const descriptionEditor = screen.getByRole("textbox", { name: "Batch description" });
    expect(
      descriptionEditor
        .closest("[data-platform-instructions-editor='true']")
        ?.getAttribute("data-platform-instructions-editor-variant"),
    ).toBe("minimalistic-ui");
    expect(document.querySelector(".batches-create-modal__description-editor textarea")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "More options" }));
    fireEvent.click(screen.getByRole("button", { name: /^Attach Files/ }));
    expect(screen.getByText("Upload New")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close attach files popup" }));

    const threadComposer = screen.getByPlaceholderText(
      "Describe the work this Batch should perform",
    );
    fireEvent.pointerDown(threadComposer);
    fireEvent.change(threadComposer, { target: { value: "/" } });
    expect(
      screen
        .getByRole("listbox", { name: "Slash commands" })
        .closest(".tb-composer-popup-portal-root"),
    ).not.toBeNull();
    fireEvent.change(threadComposer, { target: { value: "@" } });
    expect(
      screen.getByRole("listbox", { name: "Connectors" }).closest(".tb-composer-popup-portal-root"),
    ).not.toBeNull();
    fireEvent.change(threadComposer, { target: { value: "" } });

    const typeSwitch = screen.getByRole("button", { name: "Batch work type: Thread" });
    expect(typeSwitch.closest(".platform-modal-header__actions")).not.toBeNull();
    fireEvent.click(typeSwitch);
    expect(screen.getByRole("menu", { name: "Batch work type" })).not.toBeNull();
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Workflow/ }));
    expect(screen.getByRole("button", { name: "Batch work type: Workflow" })).not.toBeNull();
    const resourceSelector = await screen.findByRole("button", { name: "Workflow resource" });
    fireEvent.click(resourceSelector);
    fireEvent.click(await screen.findByRole("option", { name: /Security review/ }));
    expect(screen.getByRole("button", { name: "Workflow resource" }).textContent).toContain(
      "Security review",
    );
    expect(screen.queryByText("Resource ID")).toBeNull();
    expect(screen.queryByText(/Version ID/)).toBeNull();
    expect(
      screen.getByText("The published resource version will be pinned automatically."),
    ).not.toBeNull();
    expect(screen.queryByText("Definition")).toBeNull();
    expect(
      await screen.findByPlaceholderText("Describe the input for this workflow run"),
    ).not.toBeNull();
    expect(screen.getByRole("button", { name: /Spark/ }).getAttribute("aria-disabled")).toBe(
      "true",
    );
    expect(
      screen.getByRole("button", { name: /Default Computer/ }).getAttribute("aria-disabled"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Batch work type: Workflow" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Thread/ }));

    expect(screen.queryByText("Existing thread ID")).toBeNull();
    expect(screen.queryByText(/Version ID/)).toBeNull();
    expect(screen.queryByText("Definition")).toBeNull();
    expect(
      screen.getByLabelText("Batch start policy").closest(".platform-modal-footer"),
    ).not.toBeNull();

    fireEvent.change(nameInput, { target: { value: "Review the repository" } });
    fireEvent.change(screen.getByPlaceholderText("Describe the work this Batch should perform"), {
      target: { value: "Inspect the repository and report the most important risks." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Job" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Review the repository",
          targetKind: "thread_run",
          targetResourceId: null,
          targetVersionId: null,
          definition: expect.objectContaining({
            message: "Inspect the repository and report the most important risks.",
            agentId: "agent_spark",
            environmentId: "computer_default",
          }),
        }),
        "save",
      );
    });
  });

  it("submits a selected Workflow with a pinned version and simulated trigger input", async () => {
    const onSubmit = vi.fn();
    render(
      <BatchCreateModal
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
        loadTargetResources={async (targetKind) => [
          {
            id: "metronome_daily_scan",
            targetKind,
            name: "Daily scan",
            description: "Scan connected repositories.",
            status: "active",
            versionId: "metronome_version_9",
          },
        ]}
        loadMetronomeManualRunContext={async () => ({
          ...workflowContext("periodic"),
          workflow: { id: "metronome_daily_scan", name: "Daily scan" },
          versionId: "metronome_version_9",
        })}
        threadComposerProps={{
          backendUrl: "/api/real",
          apiKey: "test-key",
          agents: [{ id: "agent_spark", name: "Spark", isDefault: true }],
          environments: [{ id: "computer_default", name: "Default Computer", isDefault: true }],
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Run daily scan" } });
    fireEvent.click(screen.getByRole("button", { name: "Batch work type: Thread" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Workflow/ }));
    const resourceSelector = await screen.findByRole("button", { name: "Workflow resource" });
    fireEvent.click(resourceSelector);
    const resourceSearch = screen.getByRole("searchbox", {
      name: "Search Workflow resources",
    });
    expect(
      resourceSearch.closest(".platform-selector__popup-header.is-search-header"),
    ).not.toBeNull();
    expect(resourceSelector.closest(".platform-selector")?.getAttribute("class")).toContain(
      "is-full-width",
    );
    fireEvent.change(resourceSearch, { target: { value: "Daily" } });
    expect(screen.getByRole("option", { name: /Daily scan/ })).not.toBeNull();
    fireEvent.click(await screen.findByRole("option", { name: /Daily scan/ }));
    await screen.findByPlaceholderText("Optionally add instructions for this scheduled run");
    const addJobButton = screen.getByRole("button", { name: "Add Job" });
    await waitFor(() => expect((addJobButton as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(addJobButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Run daily scan",
          targetKind: "metronome_run",
          targetResourceId: "metronome_daily_scan",
          targetVersionId: "metronome_version_9",
          definition: expect.objectContaining({
            metronomeId: "metronome_daily_scan",
            versionId: "metronome_version_9",
            input: expect.objectContaining({
              source: "periodic",
              triggerType: "periodic",
              simulation: expect.objectContaining({ mode: "manual" }),
              schedule: expect.any(Object),
            }),
          }),
        }),
        "save",
      );
    });
  });

  it("renders explicit trigger fields for structured Workflow inputs", async () => {
    const onSubmit = vi.fn();
    const context = workflowContext("github");
    render(
      <BatchCreateModal
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
        loadTargetResources={async (targetKind) => [
          {
            id: "metronome_github_release",
            targetKind,
            name: "GitHub release",
            description: "Publish from a repository event.",
            status: "active",
            versionId: "metronome_version_12",
          },
        ]}
        loadMetronomeManualRunContext={async () => ({
          ...context,
          workflow: { id: "metronome_github_release", name: "GitHub release" },
          versionId: "metronome_version_12",
        })}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Release from GitHub" } });
    fireEvent.click(screen.getByRole("button", { name: "Batch work type: Thread" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Workflow/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Workflow resource" }));
    fireEvent.click(await screen.findByRole("option", { name: /GitHub release/ }));

    expect(await screen.findByRole("button", { name: "Event" })).not.toBeNull();
    const repositoryInput = screen.getByPlaceholderText("organization/repository");
    fireEvent.change(repositoryInput, { target: { value: "computer-agents/platform" } });
    const addJobButton = screen.getByRole("button", { name: "Add Job" });
    await waitFor(() => expect((addJobButton as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(addJobButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          targetKind: "metronome_run",
          targetResourceId: "metronome_github_release",
          targetVersionId: "metronome_version_12",
          definition: expect.objectContaining({
            input: expect.objectContaining({
              source: "github",
              github: expect.objectContaining({
                eventType: "push",
                repositoryFullName: "computer-agents/platform",
              }),
            }),
          }),
        }),
        "save",
      );
    });
  });

  it("uses linked Project and Ticket selectors without exposing a raw definition", async () => {
    const onSubmit = vi.fn();
    render(
      <BatchCreateModal
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
        loadProjects={async () => [
          {
            id: "project_equal_care",
            name: "Equal Care",
            description: "Scientific evidence extraction",
            status: "active",
          },
        ]}
        loadProjectTickets={async (projectId) => [
          {
            id: "ticket_extract_five",
            projectId,
            name: "EQ-042 · Extract five papers",
            description: "Create a reviewable evidence database.",
            status: "todo",
            ticketNumber: "EQ-042",
            disabled: false,
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Extract Equal Care papers" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Batch work type: Thread" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Project ticket/ }));

    const projectSelector = await screen.findByRole("button", { name: "Batch Project" });
    const ticketSelector = screen.getByRole("button", { name: "Batch Project Ticket" });
    expect(projectSelector.closest(".batches-form-field")?.classList.contains("is-span-2")).toBe(
      false,
    );
    expect(ticketSelector.closest(".batches-form-field")?.classList.contains("is-span-2")).toBe(
      false,
    );
    expect(screen.queryByText("Definition")).toBeNull();

    fireEvent.click(projectSelector);
    fireEvent.click(await screen.findByRole("option", { name: /Equal Care/ }));
    await waitFor(() => expect((ticketSelector as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(ticketSelector);
    fireEvent.click(await screen.findByRole("option", { name: /Extract five papers/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add Job" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          targetKind: "project_ticket_action",
          targetResourceId: null,
          sourceProjectId: "project_equal_care",
          sourceTicketId: "ticket_extract_five",
          definition: expect.objectContaining({
            projectId: "project_equal_care",
            ticketId: "ticket_extract_five",
          }),
        }),
        "save",
      );
    });
  });

  it("hides raw definitions for Evaluation and Agent Optimization batches", () => {
    render(
      <BatchCreateModal
        open
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        loadTargetResources={async () => []}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Batch work type: Thread" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Evaluation/ }));
    expect(screen.queryByText("Definition")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Batch work type: Evaluation" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Agent Optimization/ }));
    expect(screen.queryByText("Definition")).toBeNull();
  });
});
