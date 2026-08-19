import type { RunnerChatKnowledgeAttachment } from "../runner-chat/public-types.js";

/**
 * Produces the self-contained Markdown file used to attach a Knowledge library to a run.
 * Archived documents are omitted and stable document ordering keeps repeated attachments
 * deterministic for persistence, caching, and model context.
 */
export function buildRunnerKnowledgeAttachmentMarkdown(
  library: RunnerChatKnowledgeAttachment,
): string {
  const libraryName = String(library?.name || "Untitled library").trim() || "Untitled library";
  const documents = (Array.isArray(library?.documents) ? library.documents : [])
    .filter((document) => document && document.archived !== true)
    .slice()
    .sort((left, right) => {
      const leftOrder = Number(left?.sortOrder);
      const rightOrder = Number(right?.sortOrder);
      if (Number.isFinite(leftOrder) || Number.isFinite(rightOrder)) {
        return (Number.isFinite(leftOrder) ? leftOrder : Number.MAX_SAFE_INTEGER)
          - (Number.isFinite(rightOrder) ? rightOrder : Number.MAX_SAFE_INTEGER);
      }
      return String(left?.title || "").localeCompare(String(right?.title || ""));
    });

  return [
    `# ${libraryName}`,
    String(library?.description || "").trim(),
    ...documents.map((document) => {
      const documentTitle = String(document?.title || "Untitled document").trim()
        || "Untitled document";
      const documentMarkdown = String(document?.markdown || document?.content || "").trim();
      const documentSummary = String(document?.summary || "").trim();
      return [
        `## ${documentTitle}`,
        documentSummary,
        documentMarkdown,
      ].filter(Boolean).join("\n\n");
    }),
  ].filter(Boolean).join("\n\n");
}
