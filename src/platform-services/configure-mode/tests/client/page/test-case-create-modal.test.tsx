// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestCaseCreateModal } from "./test-case-create-modal.js";

afterEach(cleanup);

describe("TestCaseCreateModal", () => {
  it("creates a named command case with separate execution and category semantics", () => {
    const onCreate = vi.fn();
    render(
      <TestCaseCreateModal
        open
        existingCases={[]}
        onClose={vi.fn()}
        onCreate={onCreate}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Production readiness"), {
      target: { value: "Release smoke" },
    });
    fireEvent.change(screen.getByLabelText("New scenario command"), {
      target: { value: "npm test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Scenario" }));

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      id: "release-smoke",
      name: "Release smoke",
      kind: "command",
      command: "npm test",
      tags: ["smoke"],
    }));
  });

  it("binds workflow Tests to workflow scenarios without exposing command execution", () => {
    const onCreate = vi.fn();
    render(
      <TestCaseCreateModal
        open
        existingCases={[]}
        testTargetType="workflow"
        testTargetId="workflow-1"
        onClose={vi.fn()}
        onCreate={onCreate}
      />,
    );

    expect(screen.queryByLabelText("New scenario command")).toBeNull();
    expect(screen.getByText("Workflow run")).not.toBeNull();
    expect(screen.queryByLabelText("Deterministic contract target")).toBeNull();
    fireEvent.change(screen.getByPlaceholderText("Production readiness"), {
      target: { value: "Successful checkout workflow" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Scenario" }));

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      kind: "contract",
      command: "",
      request: expect.objectContaining({
        target: "metronome_workflow",
        workflowId: "workflow-1",
        input: null,
      }),
    }));
  });
});
