// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestPlan } from "../domain/index.js";
import { TestPlanCreateModal } from "./test-plan-create-modal.js";

afterEach(cleanup);

describe("TestPlanCreateModal", () => {
  it("creates an unpublished empty draft without inventing a first case", async () => {
    const created = {
      id: "plan-draft",
      name: "Release readiness",
    } as TestPlan;
    const onCreate = vi.fn().mockResolvedValue(created);

    render(
      <TestPlanCreateModal
        open
        projects={[]}
        environments={[]}
        onClose={vi.fn()}
        onCreate={onCreate}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Release verification"), {
      target: { value: "Release readiness" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Test Plan" }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      name: "Release readiness",
      publishInitialVersion: false,
      definition: expect.objectContaining({
        cases: [],
        schemaVersion: "computer_agents_test_plan_v1",
      }),
    }));
    expect(screen.queryByText("Initial Case")).toBeNull();
  });
});
