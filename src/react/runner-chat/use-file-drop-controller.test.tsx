// @vitest-environment jsdom

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRunnerFileDropController } from "./use-file-drop-controller.js";

function FileDropHarness({ onFilesDropped }: { onFilesDropped: (files: File[]) => boolean }) {
  const controller = useRunnerFileDropController({ onFilesDropped });
  return (
    <div>
      <div
        data-testid="root"
        role="application"
        ref={controller.rootRef}
        onDragEnter={controller.handleRootDragEnter}
        onDragOver={controller.handleRootDragOver}
        onDragLeave={controller.handleRootDragLeave}
        onDrop={controller.handleRootDrop}
      />
      <button
        type="button"
        data-testid="dropzone"
        onDragOver={controller.handleDropzoneDragOver}
        onDragLeave={controller.handleDropzoneDragLeave}
        onDrop={controller.handleDropzoneDrop}
      />
      <span data-testid="screen-active">{String(controller.isScreenDragActive)}</span>
      <span data-testid="dropzone-active">{String(controller.isDropzoneDragging)}</span>
    </div>
  );
}

describe("useRunnerFileDropController", () => {
  it("tracks screen drag state and clears it on a window boundary event", () => {
    const { container } = render(<FileDropHarness onFilesDropped={() => true} />);
    const root = container.querySelector<HTMLElement>('[data-testid="root"]');
    const screenActive = container.querySelector<HTMLElement>('[data-testid="screen-active"]');
    if (!root || !screenActive) throw new Error("Missing drag harness.");

    fireEvent.dragEnter(root, {
      dataTransfer: { types: ["Files"], files: [], dropEffect: "none" },
    });
    expect(screenActive?.textContent).toBe("true");

    fireEvent.blur(window);
    expect(screenActive?.textContent).toBe("false");
  });

  it("delivers files from the popup dropzone", () => {
    const onFilesDropped = vi.fn(() => true);
    const { container } = render(<FileDropHarness onFilesDropped={onFilesDropped} />);
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    const dropzone = container.querySelector<HTMLElement>('[data-testid="dropzone"]');
    const dropzoneActive = container.querySelector<HTMLElement>('[data-testid="dropzone-active"]');
    if (!dropzone || !dropzoneActive) throw new Error("Missing dropzone harness.");

    fireEvent.dragOver(dropzone, {
      dataTransfer: { types: ["Files"], files: [file], dropEffect: "none" },
    });
    expect(dropzoneActive?.textContent).toBe("true");

    fireEvent.drop(dropzone, {
      dataTransfer: { types: ["Files"], files: [file], dropEffect: "none" },
    });
    expect(onFilesDropped).toHaveBeenCalledWith([file]);
    expect(dropzoneActive?.textContent).toBe("false");
  });
});
