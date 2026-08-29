// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KnowledgeLibraryCoverCropModal } from "./knowledge-library-cover-crop-modal.js";

afterEach(cleanup);

describe("KnowledgeLibraryCoverCropModal", () => {
  it("loads the preview and applies normalized zoom and keyboard positioning", () => {
    const onApply = vi.fn();
    render(
      <KnowledgeLibraryCoverCropModal
        open
        imageSrc="/cover.png"
        imageName="Launch cover"
        initialView={{ positionX: 50, positionY: 50, zoom: 1 }}
        onCancel={vi.fn()}
        onApply={onApply}
      />,
    );

    expect(screen.getByRole("status", { name: "Loading cover image" })).not.toBeNull();
    const applyButton = screen.getByRole("button", { name: "Apply" }) as HTMLButtonElement;
    expect(applyButton.disabled).toBe(true);

    const cropModal = screen.getByRole("dialog", { name: "Adjust cover" });
    const sourcePreview = cropModal.querySelector(
      ".knowledge-library-cover-crop-modal__source-preview",
    );
    expect(sourcePreview).not.toBeNull();
    fireEvent.load(sourcePreview as HTMLImageElement);
    expect(applyButton.disabled).toBe(false);

    fireEvent.change(screen.getByRole("slider", { name: "Cover zoom" }), {
      target: { value: "1.5" },
    });
    fireEvent.keyDown(screen.getByRole("application", { name: "Cover image visible area" }), {
      key: "ArrowRight",
    });
    fireEvent.click(applyButton);

    expect(onApply).toHaveBeenCalledWith({ positionX: 51, positionY: 50, zoom: 1.5 });
  });

  it("uses the header back control to cancel without applying", () => {
    const onCancel = vi.fn();
    const onApply = vi.fn();
    render(
      <KnowledgeLibraryCoverCropModal
        open
        imageSrc="/cover.png"
        onCancel={onCancel}
        onApply={onApply}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back to cover selection" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();
  });
});
