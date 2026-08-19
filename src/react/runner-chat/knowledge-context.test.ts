import { describe, expect, it } from "vitest";
import {
  buildRunnerKnowledgeContextFromAttachments,
  mergeRunnerKnowledgeContexts,
  normalizeRunnerKnowledgeContext,
} from "./knowledge-context.js";

describe("runner Knowledge context", () => {
  it("normalizes library ids and pins supplied versions", () => {
    expect(normalizeRunnerKnowledgeContext({
      enabled: true,
      libraryIds: ["library-a", "library-a"],
      bindings: [{ libraryId: "library-a", versionId: "version-7", versionNumber: 7 }],
      mode: "read",
    })).toEqual({
      schemaVersion: "computer_agents_knowledge_context_v1",
      enabled: true,
      libraryIds: ["library-a"],
      bindings: [{ libraryId: "library-a", versionId: "version-7", versionNumber: 7 }],
      mode: "read",
    });
  });

  it("merges composer bindings without losing version pins", () => {
    expect(mergeRunnerKnowledgeContexts(
      { enabled: true, libraryIds: ["library-a"], mode: "read" },
      { enabled: true, bindings: [{ libraryId: "library-b", versionNumber: 3 }], mode: "propose" },
    )).toMatchObject({
      libraryIds: ["library-a", "library-b"],
      bindings: [
        { libraryId: "library-a" },
        { libraryId: "library-b", versionNumber: 3 },
      ],
      mode: "propose",
    });
  });

  it("derives context from Knowledge reference attachments", () => {
    expect(buildRunnerKnowledgeContextFromAttachments([
      {
        id: "attachment-1",
        file: new File(["# Knowledge"], "knowledge.md", { type: "text/markdown" }),
        type: "document",
        source: "local",
        referenceType: "knowledge",
        knowledgeLibraryId: "library-a",
        knowledgeVersionId: "version-2",
        knowledgeVersionNumber: 2,
      },
    ])).toMatchObject({
      libraryIds: ["library-a"],
      bindings: [{ libraryId: "library-a", versionId: "version-2", versionNumber: 2 }],
    });
  });
});
