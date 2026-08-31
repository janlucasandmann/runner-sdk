// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
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

    const nameInput = screen.getByLabelText("Test name");
    expect(nameInput.closest(".platform-modal-header.is-search")).not.toBeNull();
    expect(
      document.body.querySelector(
        ".platform-modal-header__search .hugeicons-flask-conical",
      ),
    ).not.toBeNull();
    expect(
      document.body
        .querySelector(".tests-create-modal__description-editor")
        ?.classList.contains("is-minimalistic-ui"),
    ).toBe(true);

    fireEvent.keyDown(nameInput, { key: "Enter", metaKey: true });
    expect(onCreate).not.toHaveBeenCalled();

    fireEvent.change(nameInput, {
      target: { value: "Release readiness" },
    });
    fireEvent.keyDown(nameInput, { key: "Enter", metaKey: true });

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      name: "Release readiness",
      publishInitialVersion: false,
      targetType: "custom",
      metadata: expect.objectContaining({ testProductModelVersion: 2 }),
      definition: expect.objectContaining({
        cases: [],
        schemaVersion: "computer_agents_test_plan_v1",
      }),
    }));
    expect(screen.queryByText("Initial Case")).toBeNull();
  });

  it("keeps accessible Functions selectable even when workflow discovery fails", async () => {
    const user = userEvent.setup();
    render(
      <TestPlanCreateModal
        open
        api={{
          listFunctions: vi.fn().mockResolvedValue([{
            id: "function-1",
            name: "Checkout Function",
          }]),
          listMetronomes: vi.fn().mockRejectedValue(new Error("Workflow service unavailable")),
        }}
        projects={[]}
        environments={[]}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Function Contract and behavior tests" }));
    const targetSelector = await screen.findByRole("button", { name: "Test target" });
    await waitFor(() => expect(targetSelector.textContent).toContain("Select function"));
    await user.click(targetSelector);
    expect(screen.getByRole("option", { name: "Checkout Function" })).not.toBeNull();
    expect(screen.queryByText("Workflow service unavailable")).toBeNull();
  });

  it("infers project scope from the selected resource without a separate Project field", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue({ id: "plan-1" } as TestPlan);
    render(
      <TestPlanCreateModal
        open
        api={{
          listFunctions: vi.fn().mockResolvedValue([{
            id: "function-1",
            name: "Checkout Function",
            projectIds: ["project-1"],
          }]),
          listMetronomes: vi.fn().mockResolvedValue([]),
        }}
        projects={[{ id: "project-1", name: "Checkout" }]}
        environments={[]}
        onClose={vi.fn()}
        onCreate={onCreate}
      />,
    );

    expect(screen.queryByRole("button", { name: "Test project" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Project Cross-resource release assurance" }));
    expect(screen.getByRole("button", { name: "Test project" })).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Function Contract and behavior tests" }));
    expect(screen.queryByRole("button", { name: "Test project" })).toBeNull();
    await user.type(screen.getByLabelText("Test name"), "Checkout contract");
    const targetSelector = await screen.findByRole("button", { name: "Test target" });
    await user.click(targetSelector);
    await user.click(screen.getByRole("option", { name: "Checkout Function" }));
    await user.click(screen.getByRole("button", { name: "Create Test" }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      targetType: "function",
      targetId: "function-1",
      projectId: "project-1",
    })));
  });
});
