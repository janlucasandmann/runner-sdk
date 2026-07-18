import { useCallback, useEffect, useRef, useState } from "react";
import { buildRunnerHeaders } from "./api-utils.js";
import {
  decodeBase64TextContent,
  normalizeBase64Content,
  type RunnerChatFetchedFileContent,
} from "./attachment-api.js";
import { getBrowserFileType } from "./attachment-utils.js";
import type { RunnerFileBrowserSource } from "./file-browser-source.js";
import {
  buildEnvironmentFileDownloadUrl,
  isBrowserFilePreviewable,
  type RunnerChatFileNode,
} from "./workspace-files.js";

export type RunnerFileBrowserPreviewKind = "image" | "text" | "video";

export interface UseRunnerFileBrowserPreviewOptions {
  apiKey: string;
  backendUrl: string;
  environmentId?: string | null;
  fetchConnectorContent?: (file: RunnerChatFileNode) => Promise<RunnerChatFetchedFileContent>;
  fetchImpl?: typeof fetch;
  item: RunnerChatFileNode | null;
  requestHeaders?: HeadersInit;
  source: RunnerFileBrowserSource;
}

export interface RunnerFileBrowserPreviewController {
  content: string | null;
  kind: RunnerFileBrowserPreviewKind | null;
  loading: boolean;
}

export function useRunnerFileBrowserPreview({
  apiKey,
  backendUrl,
  environmentId,
  fetchConnectorContent,
  fetchImpl = globalThis.fetch,
  item,
  requestHeaders,
  source,
}: UseRunnerFileBrowserPreviewOptions): RunnerFileBrowserPreviewController {
  const [content, setContent] = useState<string | null>(null);
  const [kind, setKind] = useState<RunnerFileBrowserPreviewKind | null>(null);
  const [loading, setLoading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  const releaseObjectUrl = useCallback(() => {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

  useEffect(() => {
    releaseObjectUrl();

    if (!item || item.isFolder || !isBrowserFilePreviewable(item)) {
      setContent(null);
      setKind(null);
      setLoading(false);
      return;
    }

    const fileType = getBrowserFileType(item.mimeType, item.name);
    if (source !== "workspace" && source !== "notion" && fetchConnectorContent) {
      let cancelled = false;
      setLoading(true);
      setContent(null);
      setKind(null);

      void fetchConnectorContent(item)
        .then((payload) => {
          if (cancelled) return;
          if (!payload?.content) {
            if ((fileType === "image" || fileType === "video") && item.previewUrl) {
              setKind(fileType);
              setContent(item.previewUrl);
            } else {
              setContent(null);
              setKind(null);
            }
            return;
          }

          if (fileType === "image") {
            const mimeType = payload.mimeType || item.mimeType || "image/png";
            setKind("image");
            setContent(`data:${mimeType};base64,${normalizeBase64Content(payload.content)}`);
            return;
          }
          if (fileType === "video" && payload.encoding === "base64") {
            const mimeType = payload.mimeType || item.mimeType || "video/mp4";
            setKind("video");
            setContent(`data:${mimeType};base64,${normalizeBase64Content(payload.content)}`);
            return;
          }
          setKind("text");
          setContent(
            (payload.encoding === "base64"
              ? decodeBase64TextContent(payload.content)
              : payload.content
            ).slice(0, 5000),
          );
        })
        .catch(() => {
          if (cancelled) return;
          if ((fileType === "image" || fileType === "video") && item.previewUrl) {
            setKind(fileType);
            setContent(item.previewUrl);
          } else {
            setContent(null);
            setKind(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    if (source !== "workspace") {
      if ((fileType === "image" || fileType === "video") && item.previewUrl) {
        setKind(fileType);
        setContent(item.previewUrl);
      } else {
        setKind(null);
        setContent(null);
      }
      setLoading(false);
      return;
    }

    const previewUrl = buildEnvironmentFileDownloadUrl(
      backendUrl,
      environmentId || "",
      item.path || "",
    );
    if (!previewUrl || typeof fetchImpl !== "function") {
      setContent(null);
      setKind(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setContent(null);
    setKind(null);

    void fetchImpl(previewUrl, {
      method: "GET",
      headers: buildRunnerHeaders(requestHeaders, apiKey.trim()),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load preview (${response.status})`);
        }
        if (fileType === "image" || fileType === "video") {
          const objectUrl = URL.createObjectURL(await response.blob());
          objectUrlRef.current = objectUrl;
          setKind(fileType);
          setContent(objectUrl);
          return;
        }
        setKind("text");
        setContent((await response.text()).slice(0, 5000));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setContent(null);
        setKind(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [
    apiKey,
    backendUrl,
    environmentId,
    fetchConnectorContent,
    fetchImpl,
    item,
    releaseObjectUrl,
    requestHeaders,
    source,
  ]);

  return { content, kind, loading };
}
