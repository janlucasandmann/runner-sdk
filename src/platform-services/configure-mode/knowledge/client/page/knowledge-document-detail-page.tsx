import { Bookmark, MessageSquareText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import { PlatformPrimaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import type { KnowledgeApi } from "../api/index.js";
import type { KnowledgeDocument, KnowledgeLibrary } from "../domain/index.js";

export interface KnowledgeDocumentDetailPageProps {
  library: KnowledgeLibrary;
  document: KnowledgeDocument;
  api: KnowledgeApi;
  controlsPortalId?: string;
  onDocumentChange: (document: KnowledgeDocument, library: KnowledgeLibrary) => void;
}

export function KnowledgeDocumentDetailPage({
  library,
  document,
  api,
  controlsPortalId,
  onDocumentChange,
}: KnowledgeDocumentDetailPageProps) {
  const [title, setTitle] = useState(document.title);
  const [markdown, setMarkdown] = useState(document.markdown);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTitle(document.title);
    setMarkdown(document.markdown);
  }, [document.id, document.revisionId, document.title, document.markdown]);
  useEffect(() => {
    setPortal(
      controlsPortalId && typeof globalThis.document !== "undefined"
        ? globalThis.document.getElementById(controlsPortalId)
        : null,
    );
  }, [controlsPortalId]);

  const dirty = title.trim() !== document.title || markdown !== document.markdown;
  const save = useCallback(async () => {
    if (!dirty || busy || !title.trim()) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.updateDocument(library.id, document.id, {
        title: title.trim(),
        markdown,
        baseRevisionId: document.revisionId,
      });
      onDocumentChange(result.document, result.library);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save the document.");
    } finally {
      setBusy(false);
    }
  }, [api, busy, dirty, document.id, document.revisionId, library.id, markdown, onDocumentChange, title]);

  useEffect(() => {
    const handleSave = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", handleSave);
    return () => window.removeEventListener("keydown", handleSave);
  }, [save]);

  const action = (
    <PlatformPrimaryButton size="small" disabled={!dirty || busy || !title.trim()} onClick={() => void save()}>
      <Bookmark width={14} height={14} />
      {busy ? "Saving…" : "Save Changes"}
    </PlatformPrimaryButton>
  );

  return (
    <div className="knowledge-document-detail-page">
      {portal ? createPortal(action, portal) : null}
      {error ? <p className="knowledge-inline-error" role="alert">{error}</p> : null}
      <PlatformInstructionsEditor
        value={markdown}
        onChange={setMarkdown}
        title={(
          <span className="knowledge-document-editor-title">
            <MessageSquareText width={16} height={16} aria-hidden="true" />
            <input
              value={title}
              aria-label="Knowledge document title"
              onChange={(event) => setTitle(event.currentTarget.value)}
            />
          </span>
        )}
        placeholder="Write durable knowledge for people and agents."
        ariaLabel={document.title}
        variant="minimalistic-ui"
        editorMode="rich-text"
        historyKey={`${document.id}:${document.revisionId}`}
        className="knowledge-document-editor"
      />
    </div>
  );
}
