// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformAttachments } from "./platform-attachments.js";

const attachmentsCss = readFileSync(
  resolve(
    process.cwd(),
    "src/platform-ui/components/composite/attachments/attachments.css",
  ),
  "utf8",
);

afterEach(cleanup);

describe("PlatformAttachments", () => {
  it("preserves its intrinsic height inside scrolling flex layouts", () => {
    expect(attachmentsCss).toMatch(
      /\.platform-attachments\s*\{[^}]*flex:\s*0 0 auto;[^}]*align-self:\s*stretch;[^}]*padding:\s*12px 24px;/s,
    );
  });

  it("separates the header without painting the computer upload action", () => {
    expect(attachmentsCss).toMatch(
      /\.platform-attachments__header\s*\{[^}]*padding-bottom:\s*12px;[^}]*border-bottom:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.1\);/s,
    );
    expect(attachmentsCss).toMatch(
      /button\.platform-attachments__computer-upload\.platform-button\.is-secondary[^}]*\{[^}]*background:\s*transparent !important;[^}]*backdrop-filter:\s*none;/s,
    );
    expect(attachmentsCss).toMatch(
      /button\.platform-attachments__computer-upload\.platform-button\s*\{[^}]*padding-right:\s*0 !important;/s,
    );
    expect(attachmentsCss).toMatch(
      /\.platform-attachments__drop-target\.is-empty\s*\{[^}]*border:\s*0;/s,
    );
  });

  it("renders the centralized card, upload action, and empty drop target", () => {
    const onUploadFromComputer = vi.fn();
    const onBrowse = vi.fn();

    const { container } = render(
      <PlatformAttachments
        onUploadFromComputer={onUploadFromComputer}
        onBrowse={onBrowse}
      />,
    );

    expect(container.querySelector("[data-platform-ui-card-variant='default']")).not.toBeNull();
    expect(container.querySelector("[data-platform-attachments='true']")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Attachments", level: 2 })).not.toBeNull();

    const computerUpload = screen.getByRole("button", { name: "From Computer Agents" });
    expect(computerUpload.getAttribute("data-platform-button-variant")).toBe("secondary");
    expect(computerUpload.querySelector("svg")).not.toBeNull();
    fireEvent.click(computerUpload);
    expect(onUploadFromComputer).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: /Drag & drop files here/i }));
    expect(onBrowse).toHaveBeenCalledOnce();
  });

  it("renders the add row and interactive attachment rows", () => {
    const onBrowse = vi.fn();
    const onActivate = vi.fn();
    const onRemove = vi.fn();

    render(
      <PlatformAttachments
        onBrowse={onBrowse}
        items={[
          {
            id: "attachment-1",
            name: "study.csv",
            metadata: "12 KB",
            preview: <span data-testid="preview">CSV</span>,
            onActivate,
            onRemove,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add a new file/i }));
    expect(onBrowse).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "study.csv" }));
    expect(onActivate).toHaveBeenCalledOnce();
    expect(screen.getByText("12 KB")).not.toBeNull();
    expect(screen.getByTestId("preview")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Remove study.csv" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("reports drag state and dropped files", () => {
    const onDraggingChange = vi.fn();
    const onFilesDrop = vi.fn();
    const file = new File(["paper"], "paper.pdf", { type: "application/pdf" });

    const { container } = render(
      <PlatformAttachments
        onDraggingChange={onDraggingChange}
        onFilesDrop={onFilesDrop}
      />,
    );
    const dropTarget = container.querySelector(".platform-attachments__drop-target");
    expect(dropTarget).not.toBeNull();

    fireEvent.dragOver(dropTarget!, {
      dataTransfer: { files: [file], dropEffect: "none" },
    });
    expect(onDraggingChange).toHaveBeenLastCalledWith(true);

    fireEvent.drop(dropTarget!, {
      dataTransfer: { files: [file] },
    });
    expect(onDraggingChange).toHaveBeenLastCalledWith(false);
    expect(onFilesDrop).toHaveBeenCalledWith([file], expect.anything());
  });
});
