// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { KnowledgeLibrary } from "../domain/index.js";
import { KnowledgeLibraryCreateModal } from "./knowledge-library-create-modal.js";

afterEach(cleanup);

describe("KnowledgeLibraryCreateModal", () => {
  it("uses the centralized name header and minimal instructions editor", async () => {
    const onCreate = vi.fn().mockResolvedValue({} as KnowledgeLibrary);
    const onClose = vi.fn();
    render(
      <KnowledgeLibraryCreateModal
        open
        onClose={onClose}
        onCreate={onCreate}
      />,
    );

    const nameInput = screen.getByLabelText("Knowledge library name");
    expect(nameInput.closest(".platform-modal-header.is-search")).not.toBeNull();
    expect(
      document.body.querySelector(
        ".platform-modal-header__search .lucide-library-big",
      ),
    ).not.toBeNull();
    expect(screen.queryByText("Name")).toBeNull();

    const descriptionEditor = document.body.querySelector(
      ".knowledge-create-modal__description-editor",
    );
    expect(descriptionEditor).not.toBeNull();
    expect(descriptionEditor?.classList.contains("is-minimalistic-ui")).toBe(true);
    expect(
      screen.getByRole("textbox", { name: "Knowledge library description" }),
    ).not.toBeNull();

    fireEvent.change(nameInput, { target: { value: "Engineering handbook" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Library" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        name: "Engineering handbook",
        description: "",
        homeTitle: "Home",
        homeMarkdown: "# Engineering handbook\n\n",
      });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits with Command+Enter only while creation is enabled", async () => {
    const onCreate = vi.fn().mockResolvedValue({} as KnowledgeLibrary);
    render(
      <KnowledgeLibraryCreateModal
        open
        onClose={vi.fn()}
        onCreate={onCreate}
      />,
    );

    const nameInput = screen.getByLabelText("Knowledge library name");
    fireEvent.keyDown(nameInput, { key: "Enter", metaKey: true });
    expect(onCreate).not.toHaveBeenCalled();

    fireEvent.change(nameInput, { target: { value: "Research library" } });
    fireEvent.keyDown(nameInput, { key: "Enter", metaKey: true });

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
  });
});
