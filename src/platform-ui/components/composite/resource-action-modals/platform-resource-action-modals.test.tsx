// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformResourceRenameModal } from "./platform-resource-rename-modal.js";
import { PlatformResourceShareModal } from "./platform-resource-share-modal.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.style.overflow = "";
});

describe("resource action modals", () => {
  it("selects an available team and submits its stable ID", () => {
    const onShare = vi.fn();

    function ShareHarness() {
      const [selectedTeamId, setSelectedTeamId] = useState("");
      return (
        <PlatformResourceShareModal
          open
          portal={false}
          selectionMode="single"
          resourceLabel="Test"
          resourceName="Release readiness"
          teams={[
            {
              id: "team-1",
              name: "Platform",
              roleLabel: "Owner",
              profileImageUrl: "/img/team-platform.webp",
            },
            { id: "team-2", name: "Security", shared: true },
          ]}
          selectedTeamId={selectedTeamId}
          onSelectedTeamIdChange={setSelectedTeamId}
          onClose={() => {}}
          onShare={onShare}
        />
      );
    }

    render(<ShareHarness />);
    expect(screen.queryByText(/Choose a team that should receive access/)).toBeNull();
    expect(
      screen
        .getByRole("dialog", { name: "Share test with team" })
        .querySelector(".platform-modal-header.is-title-only"),
    ).not.toBeNull();
    expect(screen.getByText("Already shared")).not.toBeNull();
    expect(
      screen
        .getByRole("radio", { name: /Platform Owner/ })
        .parentElement?.querySelector('img[src="/img/team-platform.webp"]'),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: /Platform Owner/ }));
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    expect(onShare).toHaveBeenCalledWith("team-1");
  });

  it("uses the centralized empty state when no teams are available", () => {
    const { container } = render(
      <PlatformResourceShareModal
        open
        portal={false}
        resourceLabel="Test"
        teams={[]}
        selectedTeamId=""
        onSelectedTeamIdChange={() => {}}
        onClose={() => {}}
        onShare={() => {}}
        emptyMessage="No manageable teams are available."
      />,
    );

    expect(screen.getByText("No manageable teams are available.")).not.toBeNull();
    expect(
      container.querySelector(".platform-empty-state.platform-resource-share-modal__empty"),
    ).not.toBeNull();
  });

  it("supports selecting and sharing with multiple teams", () => {
    const onShareTeams = vi.fn();

    function MultiShareHarness() {
      const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
      return (
        <PlatformResourceShareModal
          open
          portal={false}
          resourceLabel="File"
          teams={[
            { id: "team-1", name: "Platform", roleLabel: "Admin" },
            { id: "team-2", name: "Security", roleLabel: "Admin" },
          ]}
          selectedTeamIds={selectedTeamIds}
          onSelectedTeamIdsChange={setSelectedTeamIds}
          onClose={() => {}}
          onShareTeams={onShareTeams}
        />
      );
    }

    render(<MultiShareHarness />);
    fireEvent.click(screen.getByText("Platform").closest(".platform-resource-share-modal__team")!);
    fireEvent.click(screen.getByRole("checkbox", { name: /Select Security/ }));
    fireEvent.click(screen.getByRole("button", { name: "Share with 2 Teams" }));
    expect(onShareTeams).toHaveBeenCalledWith(["team-1", "team-2"]);
  });

  it("keeps teams that already have access unavailable in multi-select mode", () => {
    const onShareTeams = vi.fn();
    const { container } = render(
      <PlatformResourceShareModal
        open
        portal={false}
        resourceLabel="Prompt"
        teams={[
          { id: "team-1", name: "Platform", shared: true },
          { id: "team-2", name: "Security" },
        ]}
        selectedTeamIds={[]}
        onSelectedTeamIdsChange={() => {}}
        onClose={() => {}}
        onShareTeams={onShareTeams}
      />,
    );

    const sharedTeamCheckbox = screen.getByRole("checkbox", { name: /Select Platform/ });
    expect((sharedTeamCheckbox as HTMLButtonElement).disabled).toBe(true);
    expect(
      container.querySelector(".platform-resource-share-modal__team.is-shared.is-disabled"),
    ).not.toBeNull();
    expect(screen.getByText("Already shared")).not.toBeNull();
  });

  it("submits a trimmed changed resource name", () => {
    const onRename = vi.fn();
    render(
      <PlatformResourceRenameModal
        open
        portal={false}
        resourceLabel="Test"
        initialName="Release readiness"
        onClose={() => {}}
        onRename={onRename}
      />,
    );

    const input = screen.getByRole("textbox", { name: "New test name" });
    expect(screen.queryByText("Choose a new name for this test.")).toBeNull();
    expect(
      screen
        .getByRole("dialog", { name: "Rename test" })
        .querySelector(".platform-modal-header.is-title-only"),
    ).not.toBeNull();
    expect((input as HTMLInputElement).value).toBe("Release readiness");
    fireEvent.change(input, { target: { value: "  Production readiness  " } });
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    expect(onRename).toHaveBeenCalledWith("Production readiness");
  });

  it("inherits the canonical opening and closing lifecycle", () => {
    let enterFrame: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      enterFrame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    function RenameHarness() {
      const [open, setOpen] = useState(true);
      return (
        <PlatformResourceRenameModal
          open={open}
          portal={false}
          resourceLabel="Test"
          initialName="Release readiness"
          onClose={() => setOpen(false)}
          onRename={() => {}}
        />
      );
    }

    render(<RenameHarness />);
    const dialog = screen.getByRole("dialog", { name: "Rename test" });
    expect(dialog.getAttribute("data-platform-modal-state")).toBe("opening");
    act(() => enterFrame?.(0));
    expect(dialog.getAttribute("data-platform-modal-state")).toBe("visible");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog.getAttribute("data-platform-modal-state")).toBe("closing");
  });
});
