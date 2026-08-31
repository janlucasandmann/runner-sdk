// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { useRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  RunnerForkExistingEnvironmentFileCopyMode,
  RunnerForkFileCopyMode,
  RunnerForkTarget,
} from "./thread-api.js";
import { RunnerForkThreadDialog } from "./workflow-dialogs.js";

afterEach(() => cleanup());

function ForkDialogHarness({ onConfirm = vi.fn() }: { onConfirm?: () => void }) {
  const [target, setTarget] = useState<RunnerForkTarget>("existing_environment");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState("environment-default");
  const [environmentPopupOpen, setEnvironmentPopupOpen] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState("Default Fork");
  const [newEnvironmentFileCopyMode, setNewEnvironmentFileCopyMode] =
    useState<RunnerForkFileCopyMode>("all");
  const [existingEnvironmentFileCopyMode, setExistingEnvironmentFileCopyMode] =
    useState<RunnerForkExistingEnvironmentFileCopyMode>("none");
  const environmentPopupRef = useRef<HTMLDivElement | null>(null);
  const environments = [
    { id: "environment-default", name: "Default" },
    { id: "environment-staging", name: "Staging" },
    { id: "environment-production", name: "Production" },
  ];

  return (
    <RunnerForkThreadDialog
      open
      source="thread"
      stagedPrompt=""
      target={target}
      onTargetChange={setTarget}
      environments={environments}
      selectedEnvironmentId={selectedEnvironmentId}
      selectedEnvironmentName={
        environments.find((environment) => environment.id === selectedEnvironmentId)?.name || null
      }
      onEnvironmentSelect={setSelectedEnvironmentId}
      environmentPopupOpen={environmentPopupOpen}
      onEnvironmentPopupOpenChange={setEnvironmentPopupOpen}
      environmentPopupRef={environmentPopupRef}
      newEnvironmentName={newEnvironmentName}
      onNewEnvironmentNameChange={setNewEnvironmentName}
      newEnvironmentFileCopyMode={newEnvironmentFileCopyMode}
      onNewEnvironmentFileCopyModeChange={setNewEnvironmentFileCopyMode}
      existingEnvironmentFileCopyMode={existingEnvironmentFileCopyMode}
      onExistingEnvironmentFileCopyModeChange={setExistingEnvironmentFileCopyMode}
      showExistingEnvironmentCopyOptions={false}
      error={null}
      creating={false}
      onClearError={() => {}}
      onConfirm={onConfirm}
      onClose={() => {}}
    />
  );
}

describe("RunnerForkThreadDialog", () => {
  it("uses the centralized modal, selector, and button contracts", () => {
    render(<ForkDialogHarness />);

    const dialog = screen.getByRole("dialog", { name: "Fork Thread" });
    expect(dialog.classList.contains("platform-modal-surface")).toBe(true);
    expect(dialog.classList.contains("tb-popup-modal")).toBe(false);
    expect(dialog.querySelector("[data-platform-modal-part='body']")).not.toBeNull();
    expect(dialog.querySelector("[data-platform-modal-part='footer']")).not.toBeNull();
    expect(dialog.querySelector("select")).toBeNull();
    expect(dialog.querySelector(".tb-popup-check")).toBeNull();

    expect(screen.getByRole("button", { name: "Choose fork destination" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Choose existing Environment" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Cancel" }).classList.contains("platform-button"),
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Create Fork" }).classList.contains("platform-button"),
    ).toBe(true);
  });

  it("filters existing Environments through the centralized popup search", () => {
    render(<ForkDialogHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Choose existing Environment" }));
    const search = screen.getByRole("searchbox", { name: "Search environments" });
    fireEvent.change(search, { target: { value: "prod" } });

    expect(screen.getByRole("option", { name: "Production" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Staging" })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: "Production" }));

    expect(
      screen.getByRole("button", { name: "Choose existing Environment" }).textContent,
    ).toContain("Production");
    expect(screen.queryByRole("searchbox", { name: "Search environments" })).toBeNull();
  });

  it("switches to a new Environment without sending the fork automatically", () => {
    const onConfirm = vi.fn();
    render(<ForkDialogHarness onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "Choose fork destination" }));
    fireEvent.click(screen.getByRole("option", { name: /Create new Environment/ }));

    const nameInput = screen.getByRole("textbox", { name: "New environment name" });
    expect(nameInput.classList.contains("platform-input")).toBe(true);
    fireEvent.change(nameInput, { target: { value: "Research branch" } });
    expect((nameInput as HTMLInputElement).value).toBe("Research branch");

    fireEvent.click(screen.getByRole("button", { name: "Choose files for the new Environment" }));
    fireEvent.click(screen.getByRole("option", { name: /Start with an empty workspace/ }));
    expect(
      screen.getByRole("button", { name: "Choose files for the new Environment" }).textContent,
    ).toContain("Start with an empty workspace");

    fireEvent.click(screen.getByRole("button", { name: "Create Fork" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("keeps portaled fork styles independent from the RunnerChat root", () => {
    const css = readFileSync(
      path.join(process.cwd(), "src/react/runner-chat/styles/dialogs-and-file-browser.css"),
      "utf8",
    );

    expect(css).toMatch(/\.platform-modal-surface\.tb-fork-thread-modal\s*\{/);
    expect(css).toMatch(/\.tb-fork-thread-modal-body\s*\{/);
    expect(css).not.toMatch(/\.tb-runner-chat\s+\.tb-fork-thread-modal\s*\{/);
  });
});
