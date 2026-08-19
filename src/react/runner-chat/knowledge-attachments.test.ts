// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildRunnerKnowledgeAttachmentMarkdown } from "./knowledge-attachments.js";
import { buildTurnAttachmentsFromLocalAttachments } from "./turn-attachments.js";

describe("buildRunnerKnowledgeAttachmentMarkdown", () => {
  it("serializes active documents in stable library order", () => {
    expect(buildRunnerKnowledgeAttachmentMarkdown({
      id: "knowledge-1",
      name: "Platform Handbook",
      description: "Shared operating context.",
      documents: [
        {
          id: "later",
          title: "Deployments",
          markdown: "Use the release workflow.",
          sortOrder: 20,
        },
        {
          id: "archived",
          title: "Old process",
          markdown: "Do not include this.",
          sortOrder: 5,
          archived: true,
        },
        {
          id: "first",
          title: "Conventions",
          summary: "The important defaults.",
          content: "Prefer centralized components.",
          sortOrder: 10,
        },
      ],
    })).toBe([
      "# Platform Handbook",
      "Shared operating context.",
      "## Conventions",
      "The important defaults.",
      "Prefer centralized components.",
      "## Deployments",
      "Use the release workflow.",
    ].join("\n\n"));
  });

  it("preserves Knowledge library and version provenance on persisted turn attachments", () => {
    const attachments = buildTurnAttachmentsFromLocalAttachments([{
      id: "attachment-1",
      file: new File(["# Platform Handbook"], "Platform Handbook.md", {
        type: "text/markdown",
      }),
      type: "document",
      source: "local",
      referenceType: "knowledge",
      displayName: "Platform Handbook",
      knowledgeLibraryId: "knowledge-1",
      knowledgeVersionId: "knowledge-version-3",
      knowledgeVersionNumber: 3,
      uploadStatus: "idle",
    }]);

    expect(attachments?.[0]).toMatchObject({
      referenceType: "knowledge",
      displayName: "Platform Handbook",
      knowledgeLibraryId: "knowledge-1",
      knowledgeVersionId: "knowledge-version-3",
      knowledgeVersionNumber: 3,
    });
  });
});
