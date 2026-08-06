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
    fireEvent.change(screen.getByLabelText("New test case command"), {
      target: { value: "npm test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add case" }));

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      id: "release-smoke",
      name: "Release smoke",
      kind: "command",
      command: "npm test",
      tags: ["smoke"],
    }));
  });
});
