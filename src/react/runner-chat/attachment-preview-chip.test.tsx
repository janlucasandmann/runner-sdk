// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunnerAttachmentPreviewChip } from "./attachment-preview-chip.js";
import type { LocalAttachment, RunnerTurnAttachment } from "./attachment-types.js";

describe("RunnerAttachmentPreviewChip", () => {
  it("uses the Files page icon for a local composer attachment", () => {
    const attachment: LocalAttachment = {
      id: "local-pdf",
      file: new File(["pdf"], "order.pdf", { type: "application/pdf" }),
      type: "document",
      source: "local",
    };

    const { container } = render(
      <RunnerAttachmentPreviewChip
        attachment={attachment}
        backendUrl="https://api.example.com"
        removable
        onRemove={() => {}}
      />,
    );

    const icon = container.querySelector(
      ".platform-attachment-preview__file-icon .platform-file-explorer__file-icon.is-pdf",
    );
    expect(icon?.tagName.toLowerCase()).toBe("img");
    expect(icon?.getAttribute("src")).toBe("/img/logos/txtfile.png");
  });

  it("uses the Files page icon for a persisted message attachment", () => {
    const attachment: RunnerTurnAttachment = {
      id: "persisted-document",
      filename: "requirements.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      type: "document",
    };

    const { container } = render(
      <RunnerAttachmentPreviewChip
        attachment={attachment}
        backendUrl="https://api.example.com"
        variant="message"
      />,
    );

    const icon = container.querySelector(
      ".platform-attachment-preview__file-icon .platform-file-explorer__file-icon.is-document",
    );
    expect(icon?.tagName.toLowerCase()).toBe("img");
    expect(icon?.getAttribute("src")).toBe("/img/logos/txtfile.png");
  });
});
