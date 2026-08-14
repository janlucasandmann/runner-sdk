// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformAttachmentPreview } from "./platform-attachment-preview.js";

const attachmentsCss = readFileSync(
  resolve(process.cwd(), "src/platform-ui/components/composite/attachments/attachments.css"),
  "utf8",
);

afterEach(cleanup);

describe("PlatformAttachmentPreview", () => {
  it("renders message attachments with a type label and no generated border layer", () => {
    const onActivate = vi.fn();

    const { container } = render(
      <PlatformAttachmentPreview
        name="Computer Agents doo - v1.5 - Stock.md"
        typeLabel="File"
        icon={<span data-testid="attachment-icon">icon</span>}
        variant="message"
        previewable
        onActivate={onActivate}
      />,
    );

    expect(container.querySelector('[data-platform-attachment-preview="true"]')).not.toBeNull();
    expect(
      container.querySelector('[data-platform-attachment-preview-variant="message"]'),
    ).not.toBeNull();
    expect(screen.getByText("File")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Preview Computer Agents/i }));
    expect(onActivate).toHaveBeenCalledOnce();
    expect(attachmentsCss).toMatch(
      /\.platform-attachment-preview--message\s*\{[^}]*border:\s*1px solid rgba\(255, 255, 255, 0\.15\);[^}]*background:\s*rgba\(255, 255, 255, 0\.1\);/s,
    );
    expect(attachmentsCss).not.toMatch(/\.platform-attachment-preview--message::before/);
  });

  it("keeps images in the image variant without adding a file type line", () => {
    render(
      <PlatformAttachmentPreview
        name="preview.png"
        typeLabel="File"
        imageContent={<span data-testid="image-preview">image</span>}
        isImage
        variant="message"
      />,
    );

    expect(screen.getByTestId("image-preview")).not.toBeNull();
    expect(screen.queryByText("File")).toBeNull();
  });
});
