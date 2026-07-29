// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectDeliveryWorkspace } from "./project-delivery-workspace.js";

afterEach(cleanup);

function jsonResponse(
  payload: Record<string, unknown>,
  status = 200,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}

describe("ProjectDeliveryWorkspace", () => {
  it("loads read models without implicitly starting, applying, or promoting anything", async () => {
    const fetchImpl = vi.fn(async (
      path: RequestInfo | URL,
      _init?: RequestInit,
    ) => {
      const url = String(path);
      if (url.includes("/delivery-design")) {
        return jsonResponse({ error: "Not found" }, 404);
      }
      return jsonResponse({ data: [], hasMore: false });
    });

    render(
      <ProjectDeliveryWorkspace
        projectId="project-one"
        projectName="Evidence pipeline"
        projectDescription="Build a verified evidence pipeline."
        canManage
        fetchImpl={fetchImpl as typeof fetch}
      />,
    );

    await screen.findByText("No Optimization Campaigns");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls.every((call) => {
      const init = call[1] as RequestInit | undefined;
      return !init?.method || init.method === "GET";
    })).toBe(true);
  });

  it("keeps preview, save, and apply as distinct operator actions", async () => {
    const request = {
      schemaVersion: "computer_agents_project_delivery_design_request_v1",
      brief: {
        name: "Evidence pipeline",
        goal: "Build a verified evidence pipeline.",
        context: "",
        workflowKind: "scheduled_pipeline",
        constraints: [],
        expectedOutputs: [],
        schedule: null,
      },
      validationAssets: [],
      capabilities: { requiredSecretKeys: [] },
      controls: {
        mode: "autonomous",
        optimizationEnabled: true,
        maximumOptimizationIterations: 5,
        guardrailPolicies: [],
        assuranceApprovalMode: "manual",
        repairEnabled: true,
        maximumRepairAttempts: 2,
      },
      acceptance: {
        minimumAverageScore: 0.8,
        minimumPassRate: 0.8,
        requireAllTestsPassing: true,
        requirePublishedOptimizationCandidate: false,
      },
      budget: { maximumTotalCostUsd: 50 },
    };
    const savedDesign = {
      id: "design-one",
      revision: 1,
      status: "ready",
      designFingerprint: `sha256:${"a".repeat(64)}`,
      request,
      design: {
        readiness: "ready",
        archetype: "scheduled_pipeline",
        designFingerprint: `sha256:${"a".repeat(64)}`,
        missingInputs: [],
        assumptions: [],
      },
    };
    const fetchImpl = vi.fn(async (path: RequestInfo | URL, init?: RequestInit) => {
      const url = String(path);
      if (!init?.method && url.includes("/delivery-design")) {
        return jsonResponse({ error: "Not found" }, 404);
      }
      if (!init?.method && url.includes("/optimization-campaigns")) {
        return jsonResponse({ data: [], hasMore: false });
      }
      if (url.endsWith("/delivery-design/preview")) {
        return jsonResponse({ deliveryDesign: savedDesign.design, persisted: false, sideEffects: [] });
      }
      if (url.endsWith("/delivery-design") && init?.method === "PUT") {
        return jsonResponse({ deliveryDesign: savedDesign, alreadySaved: false });
      }
      if (url.endsWith("/delivery-design/apply")) {
        return jsonResponse({
          deliveryDesign: savedDesign,
          deliveryPlan: { id: "delivery-plan-one" },
          provisioned: false,
          executionStarted: false,
        });
      }
      throw new Error(`Unexpected request ${url}`);
    });

    render(
      <ProjectDeliveryWorkspace
        projectId="project-one"
        projectName="Evidence pipeline"
        projectDescription="Build a verified evidence pipeline."
        canManage
        fetchImpl={fetchImpl as typeof fetch}
      />,
    );
    await screen.findByText("No Optimization Campaigns");

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    await waitFor(() => {
      expect(fetchImpl.mock.calls.some((call) =>
        String(call[0]).endsWith("/delivery-design/preview"))).toBe(true);
    });
    expect(fetchImpl.mock.calls.some((call) =>
      String(call[0]).endsWith("/delivery-design/apply"))).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Save design" }));
    await waitFor(() => {
      expect(screen.getByText("Scheduled Pipeline")).not.toBeNull();
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply to plan" }));
    await screen.findByText("Applied as plan");

    const applyCall = fetchImpl.mock.calls.find((call) =>
      String(call[0]).endsWith("/delivery-design/apply"));
    expect(JSON.parse(String((applyCall?.[1] as RequestInit).body))).toMatchObject({
      designFingerprint: savedDesign.designFingerprint,
    });
  });

  it("preserves machine bindings and validation contracts while editing the brief", async () => {
    const persistedRequest = {
      schemaVersion: "computer_agents_project_delivery_design_request_v1",
      brief: {
        name: "Equal Care",
        goal: "Extract evidence.",
        context: "Use complete papers.",
        workflowKind: "scheduled_pipeline",
        constraints: ["No abstract-only evidence"],
        expectedOutputs: ["Canonical findings"],
        schedule: "0 2 * * *",
      },
      bindings: {
        agentVersionId: "agent-version-17",
        functionVersionId: "function-version-9",
        metronomeVersionId: "metronome-version-4",
      },
      tests: {
        testId: "test-12",
        testVersionId: "test-version-6",
      },
      evaluation: {
        evaluationId: "evaluation-8",
        evaluationVersionId: "evaluation-version-3",
      },
      validationAssets: [
        {
          kind: "validation_set",
          fileId: "file-42",
          checksum: `sha256:${"b".repeat(64)}`,
        },
      ],
      capabilities: {
        requiredSecretKeys: ["NCBI_API_KEY"],
      },
      controls: {
        mode: "autonomous",
        optimizationEnabled: true,
        maximumOptimizationIterations: 7,
        guardrailPolicies: ["evidence-provenance-v1"],
        assuranceApprovalMode: "manual",
        repairEnabled: true,
        maximumRepairAttempts: 3,
      },
      acceptance: {
        minimumAverageScore: 0.91,
        minimumPassRate: 0.95,
        requireAllTestsPassing: true,
        requirePublishedOptimizationCandidate: true,
      },
      budget: {
        maximumTotalCostUsd: 25,
      },
    };
    const persistedDesign = {
      id: "design-equal-care",
      revision: 3,
      status: "ready",
      designFingerprint: `sha256:${"c".repeat(64)}`,
      request: persistedRequest,
      design: {
        readiness: "ready",
        archetype: "scheduled_pipeline",
        designFingerprint: `sha256:${"c".repeat(64)}`,
        missingInputs: [],
        assumptions: [],
      },
    };
    let savedRequest: Record<string, unknown> | null = null;
    const fetchImpl = vi.fn(async (path: RequestInfo | URL, init?: RequestInit) => {
      const url = String(path);
      if (!init?.method && url.endsWith("/delivery-design")) {
        return jsonResponse({ deliveryDesign: persistedDesign });
      }
      if (!init?.method && url.includes("/optimization-campaigns")) {
        return jsonResponse({ data: [], hasMore: false });
      }
      if (url.endsWith("/delivery-design") && init?.method === "PUT") {
        const body = JSON.parse(String(init.body)) as {
          request: Record<string, unknown>;
        };
        savedRequest = body.request;
        return jsonResponse({
          deliveryDesign: {
            ...persistedDesign,
            request: body.request,
            revision: 4,
          },
          alreadySaved: false,
        });
      }
      throw new Error(`Unexpected request ${url}`);
    });

    render(
      <ProjectDeliveryWorkspace
        projectId="equal-care"
        projectName="Equal Care"
        projectDescription="Fallback description."
        canManage
        fetchImpl={fetchImpl as typeof fetch}
      />,
    );

    await screen.findByDisplayValue("Extract evidence.");
    fireEvent.change(screen.getByLabelText("Goal"), {
      target: { value: "Extract and verify full-text evidence." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save design" }));

    await waitFor(() => expect(savedRequest).not.toBeNull());
    expect(savedRequest).toMatchObject({
      bindings: persistedRequest.bindings,
      tests: persistedRequest.tests,
      evaluation: persistedRequest.evaluation,
      validationAssets: persistedRequest.validationAssets,
      capabilities: persistedRequest.capabilities,
      controls: persistedRequest.controls,
      acceptance: persistedRequest.acceptance,
      budget: persistedRequest.budget,
      brief: {
        name: "Equal Care",
        goal: "Extract and verify full-text evidence.",
        context: "Use complete papers.",
        workflowKind: "scheduled_pipeline",
        constraints: ["No abstract-only evidence"],
        expectedOutputs: ["Canonical findings"],
        schedule: "0 2 * * *",
      },
    });
  });
});
