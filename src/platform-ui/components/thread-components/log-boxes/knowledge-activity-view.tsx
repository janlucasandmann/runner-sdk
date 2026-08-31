import { LibraryBig } from "../../ui/hugeicons-compat.js";
import { useEffect, useRef, useState } from "react";
import type { RunnerLog } from "../../../../types.js";
import { CompactActionLogLine } from "./compact-action-log-line.js";
import {
  parseRunnerKnowledgeActivityDetails,
  type RunnerKnowledgeActivityDetails,
} from "./knowledge-activity-state.js";

function normalizeBaseUrl(value?: string): string {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

function readLibraryName(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const source = value as Record<string, unknown>;
  const library =
    source.library && typeof source.library === "object" && !Array.isArray(source.library)
      ? (source.library as Record<string, unknown>)
      : source;
  return typeof library.name === "string" ? library.name.trim() : "";
}

export interface KnowledgeActivityLogBoxProps {
  log: RunnerLog;
  backendUrl?: string;
  requestHeaders?: HeadersInit;
  onKnowledgeLibraryPreviewClick?: (library: { libraryId: string; libraryName?: string }) => void;
}

export function KnowledgeActivityLogBox({
  log,
  backendUrl,
  requestHeaders,
  onKnowledgeLibraryPreviewClick,
}: KnowledgeActivityLogBoxProps) {
  const details = parseRunnerKnowledgeActivityDetails(log) as RunnerKnowledgeActivityDetails;
  const [resolvedName, setResolvedName] = useState(details.libraryName);
  const requestHeadersRef = useRef(requestHeaders);
  requestHeadersRef.current = requestHeaders;

  useEffect(() => {
    setResolvedName(details.libraryName);
    const baseUrl = normalizeBaseUrl(backendUrl);
    if (details.libraryName || !baseUrl || !details.libraryId) return undefined;

    const controller = new AbortController();
    void fetch(`${baseUrl}/knowledge/${encodeURIComponent(details.libraryId)}`, {
      credentials: "include",
      cache: "no-store",
      headers: requestHeadersRef.current,
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const nextName = readLibraryName(payload);
        if (nextName) setResolvedName(nextName);
      })
      .catch((error) => {
        if (error && typeof error === "object" && "name" in error && error.name === "AbortError")
          return;
      });

    return () => controller.abort();
  }, [backendUrl, details.libraryId, details.libraryName]);

  const displayName = resolvedName || details.libraryId;
  return (
    <CompactActionLogLine
      icon={<LibraryBig className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title={`${details.operation === "update" ? "Updated" : "Read"} Knowledge Library ${displayName}`}
      ariaLabel={`Open Knowledge library ${displayName}`}
      onClick={
        onKnowledgeLibraryPreviewClick
          ? () =>
              onKnowledgeLibraryPreviewClick({
                libraryId: details.libraryId,
                libraryName: resolvedName || details.libraryName || undefined,
              })
          : null
      }
    />
  );
}
