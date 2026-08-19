// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AssurancePolicy } from "../domain/index.js";
import { AssurancePolicyCreateModal } from "./assurance-policy-create-modal.js";

afterEach(cleanup);

describe("AssurancePolicyCreateModal", () => {
  it("uses the resource header, minimal editor, and enabled-only submit shortcut", async () => {
    const onCreate = vi.fn().mockResolvedValue({} as AssurancePolicy);
    render(
      <AssurancePolicyCreateModal
        open
        projects={[]}
        testPlans={[{
          id: "test-plan-1",
          name: "Release verification",
          publishedVersionId: "test-version-1",
        }]}
        onClose={vi.fn()}
        onCreate={onCreate}
      />,
    );

    const nameInput = screen.getByLabelText("Assurance Policy name");
    expect(nameInput.closest(".platform-modal-header.is-search")).not.toBeNull();
    expect(
      document.body.querySelector(
        ".platform-modal-header__search .lucide-shield-check",
      ),
    ).not.toBeNull();
    expect(
      document.body
        .querySelector(".assurance-create-modal__description-editor")
        ?.classList.contains("is-minimalistic-ui"),
    ).toBe(true);

    fireEvent.change(nameInput, { target: { value: "Production assurance" } });
    fireEvent.keyDown(nameInput, { key: "Enter", metaKey: true });
    expect(onCreate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Initial Assurance Test gate"));
    fireEvent.click(screen.getByRole("option", { name: "Release verification" }));
    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: "Create Policy" }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);
    });
    fireEvent.keyDown(
      screen.getByLabelText("Assurance Policy name"),
      { key: "Enter", metaKey: true },
    );

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      name: "Production assurance",
      description: "",
      definition: expect.objectContaining({
        schemaVersion: "computer_agents_assurance_policy_v1",
        testGates: [expect.objectContaining({
          testPlanId: "test-plan-1",
          versionId: "test-version-1",
        })],
      }),
    }));
  });
});
