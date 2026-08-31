import { Check, ChevronRight, ImageOff, ImagePlus, Monitor, Settings, Upload } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

import {
  PlatformFileExplorerBrowserModal,
  PlatformFileExplorerFileIcon,
  type PlatformFileExplorerSourceGroup,
  PlatformFileExplorerThumbnail,
} from "../../../../../platform-ui/components/composite/file-explorer/index.js";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformPopup } from "../../../../../platform-ui/components/composite/popup/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import {
  KNOWLEDGE_LIBRARY_COVER_SCHEMA_VERSION,
  type KnowledgeLibraryCover,
  type KnowledgeLibraryGradientCover,
  type KnowledgeLibraryImageCover,
} from "../domain/index.js";
import {
  DEFAULT_KNOWLEDGE_LIBRARY_COVER_VIEW,
  KnowledgeLibraryCoverCropModal,
  type KnowledgeLibraryCoverView,
  normalizeKnowledgeLibraryCoverView,
} from "./knowledge-library-cover-crop-modal.js";

const KNOWLEDGE_LIBRARY_COVER_METADATA_KEY = "knowledgeCover";
const KNOWLEDGE_LIBRARY_COVER_SCHEMA = KNOWLEDGE_LIBRARY_COVER_SCHEMA_VERSION;

export type KnowledgeLibraryCoverGradient = KnowledgeLibraryGradientCover;
export type KnowledgeLibraryCoverImage = KnowledgeLibraryImageCover;
export type KnowledgeLibraryCoverValue = KnowledgeLibraryCover;

export interface KnowledgeLibraryCoverImageUpload {
  file: Blob;
  filename: string;
  mimeType: string;
  source: "upload" | "computer";
  computerId?: string;
  computerPath?: string;
}

interface KnowledgeCoverComputer {
  id: string;
  name: string;
}

interface KnowledgeCoverComputerFile {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  mimeType: string;
  size: number;
  modifiedAt: string;
}

interface KnowledgeCoverLocation {
  id: string;
  label: string;
  path: string;
}

interface KnowledgeLibraryCoverProps {
  cover: KnowledgeLibraryCoverValue;
  backendUrl?: string;
  requestHeaders?: Readonly<Record<string, string>>;
  disabled?: boolean;
  onImageUpload: (
    input: KnowledgeLibraryCoverImageUpload,
    view: KnowledgeLibraryCoverView,
  ) => Promise<void>;
  onChange: (cover: KnowledgeLibraryCoverValue | null) => Promise<void>;
}

interface KnowledgeLibraryAddCoverButtonProps {
  disabled?: boolean;
  onAdd: () => void;
}

interface KnowledgeCoverPreview {
  src: string;
  objectUrl: string;
}

interface KnowledgeCoverImageLoadState {
  key: string;
  status: "loading" | "loaded" | "failed";
  attempt: number;
}

type KnowledgeCoverCropCandidate =
  | {
      kind: "upload";
      file: File;
      preview: KnowledgeCoverPreview;
      aspectRatio: number;
    }
  | {
      kind: "computer";
      file: Blob;
      cover: KnowledgeLibraryCoverImage;
      preview: KnowledgeCoverPreview;
      aspectRatio: number;
    };

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(source: Record<string, unknown>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value !== "string" && typeof value !== "number") continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

function readCollection(value: unknown, keys: readonly string[]): unknown[] {
  if (Array.isArray(value)) return value;
  const source = asRecord(value);
  const nestedData = asRecord(source.data);
  for (const container of [source, nestedData]) {
    for (const key of keys) {
      if (Array.isArray(container[key])) return container[key] as unknown[];
    }
    if (Array.isArray(container.data)) return container.data as unknown[];
  }
  return [];
}

function normalizeBackendUrl(value: string): string {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

function resolveKnowledgeCoverImageUrl(src: string, backendUrl: string): string {
  const source = String(src || "").trim();
  if (!source) return "";
  if (source.startsWith("/knowledge/") && backendUrl) return `${backendUrl}${source}`;
  return source;
}

function encodeFilePath(path: string): string {
  return String(path || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildComputerFileUrl(
  backendUrl: string,
  computerId: string,
  operation: "download" | "thumbnail",
  path: string,
): string {
  const encodedPath = encodeFilePath(path);
  if (!backendUrl || !computerId || !encodedPath) return "";
  const base = `${normalizeBackendUrl(backendUrl)}/environments/${encodeURIComponent(computerId)}`;
  const url = `${base}/files/${operation}/${encodedPath}`;
  return operation === "thumbnail" ? `${url}?w=160&h=100` : url;
}

function isImageFile(file: Pick<KnowledgeCoverComputerFile, "mimeType" | "name">): boolean {
  return (
    file.mimeType.toLowerCase().startsWith("image/") ||
    /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)$/i.test(file.name)
  );
}

function inferImageMimeType(fileName: string): string {
  const extension =
    String(fileName || "")
      .trim()
      .toLowerCase()
      .split(".")
      .pop() || "";
  if (extension === "svg") return "image/svg+xml";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "tif" || extension === "tiff") return "image/tiff";
  if (["avif", "bmp", "gif", "ico", "png", "webp"].includes(extension)) {
    return `image/${extension === "ico" ? "x-icon" : extension}`;
  }
  return "image/png";
}

function normalizeComputers(payload: unknown): KnowledgeCoverComputer[] {
  return readCollection(payload, ["environments", "computers", "items"])
    .flatMap((value) => {
      const source = asRecord(value);
      const id = readString(source, ["id", "environmentId", "environment_id", "computerId"]);
      if (!id) return [];
      return [
        {
          id,
          name: readString(source, ["name", "displayName", "label", "title"]) || "Computer",
        },
      ];
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function normalizeComputerFiles(payload: unknown): KnowledgeCoverComputerFile[] {
  return readCollection(payload, ["files", "items"])
    .flatMap((value) => {
      const source = asRecord(value);
      const rawPath = readString(source, ["path", "relativePath", "relative_path"]);
      const path = rawPath.replace(/^\/+|\/+$/g, "");
      const name =
        readString(source, ["name", "fileName", "filename"]) ||
        path.split("/").filter(Boolean).at(-1) ||
        "";
      if (!name) return [];
      const kind = readString(source, ["type", "kind"]).toLowerCase();
      return [
        {
          id: path || name,
          name,
          path: path || name,
          isFolder: kind === "directory" || kind === "folder" || source.isDirectory === true,
          mimeType: readString(source, ["mimeType", "mime_type", "contentType"]),
          size: Number(source.size || 0) || 0,
          modifiedAt: readString(source, ["modifiedAt", "modifiedTime", "updatedAt"]),
        },
      ];
    })
    .filter((file) => file.isFolder || isImageFile(file))
    .sort((left, right) => {
      if (left.isFolder !== right.isFolder) return left.isFolder ? -1 : 1;
      return left.name.localeCompare(right.name);
    });
}

async function readJsonResponse(response: Response, fallback: string): Promise<unknown> {
  const text = await response.text().catch(() => "");
  let payload: unknown = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text };
  }
  if (!response.ok) {
    const source = asRecord(payload);
    throw new Error(String(source.message || source.error || fallback));
  }
  return payload;
}

function formatFileSize(value: number): string {
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getCoverError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getRequestHeadersSignature(
  headers: Readonly<Record<string, string>> | undefined,
): string {
  return Object.entries(headers || {})
    .map(([name, value]) => [name.toLowerCase(), String(value)] as const)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}:${value}`)
    .join("\n");
}

function getCoverImageLoadKey(
  cover: KnowledgeLibraryCoverValue,
  resolvedSrc: string,
  requestHeadersSignature: string,
): string {
  if (cover.type !== "image") return "";
  return JSON.stringify([
    cover.source,
    resolvedSrc,
    cover.assetId || "",
    cover.name,
    cover.mimeType,
    cover.attachmentId || "",
    cover.computerId || "",
    cover.computerPath || "",
    requestHeadersSignature,
  ]);
}

function withCoverImageRetry(src: string, attempt: number): string {
  if (attempt <= 0 || !src || /^(?:blob:|data:)/i.test(src) || typeof window === "undefined") {
    return src;
  }
  try {
    const url = new URL(src, window.location.href);
    if (url.origin !== window.location.origin) return src;
    url.searchParams.set("__ca_cover_retry", String(attempt));
    return /^https?:\/\//i.test(src)
      ? url.toString()
      : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return src;
  }
}

function waitForCoverImageRetry(delayMs: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);
    const handleAbort = () => {
      globalThis.clearTimeout(timeoutId);
      signal.removeEventListener("abort", handleAbort);
      reject(signal.reason);
    };
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

async function fetchCoverImageBlob(
  src: string,
  requestHeaders: Readonly<Record<string, string>> | undefined,
  signal: AbortSignal,
): Promise<Blob> {
  let lastError: unknown = new Error("Failed to load the computer cover image.");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(src, {
        credentials: "include",
        cache: /\/knowledge\/[^/]+\/cover\/image(?:\?|$)/.test(src)
          ? "force-cache"
          : "no-store",
        headers: requestHeaders,
        signal,
      });
      if (!response.ok) throw new Error("Failed to load the computer cover image.");
      return await response.blob();
    } catch (error) {
      if (signal.aborted) throw error;
      lastError = error;
      if (attempt < 2) await waitForCoverImageRetry(180 * (attempt + 1), signal);
    }
  }
  throw lastError;
}

function createKnowledgeCoverPreview(blob: Blob): Promise<KnowledgeCoverPreview> {
  if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    const objectUrl = URL.createObjectURL(blob);
    return Promise.resolve({ src: objectUrl, objectUrl });
  }
  if (typeof FileReader === "undefined") {
    return Promise.reject(new Error("Image previews are not supported in this browser."));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: String(reader.result || ""), objectUrl: "" });
    reader.onerror = () => reject(reader.error || new Error("Failed to preview the image."));
    reader.readAsDataURL(blob);
  });
}

function normalizeKnowledgeCoverImageBlob(
  sourceBlob: Blob,
  fileName: string,
  mimeType: string,
): Promise<Blob> {
  if (sourceBlob.type.startsWith("image/")) return Promise.resolve(sourceBlob);
  return sourceBlob
    .arrayBuffer()
    .then((buffer) => new Blob([buffer], { type: mimeType || inferImageMimeType(fileName) }));
}

export const DEFAULT_KNOWLEDGE_LIBRARY_COVER: KnowledgeLibraryCoverGradient = Object.freeze({
  schemaVersion: KNOWLEDGE_LIBRARY_COVER_SCHEMA,
  type: "gradient",
  preset: "blue",
});

export function readKnowledgeLibraryCover(
  value: unknown,
): KnowledgeLibraryCoverValue | null {
  const root = asRecord(value);
  const source = root.type
    ? root
    : asRecord(root[KNOWLEDGE_LIBRARY_COVER_METADATA_KEY]);
  if (source.type === "gradient" && source.preset === "blue") {
    return DEFAULT_KNOWLEDGE_LIBRARY_COVER;
  }
  const src = readString(source, ["src"]);
  if (source.type !== "image" || !src) return null;
  const view = normalizeKnowledgeLibraryCoverView({
    positionX: source.positionX as number,
    positionY: source.positionY as number,
    zoom: source.zoom as number,
  });
  return {
    schemaVersion: KNOWLEDGE_LIBRARY_COVER_SCHEMA,
    type: "image",
    ...(readString(source, ["assetId"]) ? { assetId: readString(source, ["assetId"]) } : {}),
    src,
    name: readString(source, ["name"]) || "Cover image",
    ...(readString(source, ["attachmentId"])
      ? { attachmentId: readString(source, ["attachmentId"]) }
      : {}),
    mimeType: readString(source, ["mimeType"]),
    source: source.source === "computer" ? "computer" : "upload",
    ...view,
    ...(readString(source, ["computerId"])
      ? { computerId: readString(source, ["computerId"]) }
      : {}),
    ...(readString(source, ["computerPath"])
      ? { computerPath: readString(source, ["computerPath"]) }
      : {}),
  };
}

export function withKnowledgeLibraryCoverMetadata(
  metadata: Record<string, unknown> | null | undefined,
  cover: KnowledgeLibraryCoverValue | null,
): Record<string, unknown> {
  const nextMetadata = { ...(metadata || {}) };
  if (cover) nextMetadata[KNOWLEDGE_LIBRARY_COVER_METADATA_KEY] = cover;
  else delete nextMetadata[KNOWLEDGE_LIBRARY_COVER_METADATA_KEY];
  return nextMetadata;
}

export function KnowledgeLibraryAddCoverButton({
  disabled = false,
  onAdd,
}: KnowledgeLibraryAddCoverButtonProps) {
  return (
    <PlatformSecondaryButton
      type="button"
      size="compact"
      className="knowledge-document-workspace__add-cover-button"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onAdd}
    >
      <ImagePlus aria-hidden="true" />
      Add Cover
    </PlatformSecondaryButton>
  );
}

export function KnowledgeLibraryCover({
  cover,
  backendUrl = "",
  requestHeaders,
  disabled = false,
  onImageUpload,
  onChange,
}: KnowledgeLibraryCoverProps) {
  const coverSectionRef = useRef<HTMLElement | null>(null);
  const coverImageRef = useRef<HTMLImageElement | null>(null);
  const requestHeadersRef = useRef(requestHeaders);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const settingsMenuRootRef = useRef<HTMLDivElement | null>(null);
  const settingsMenuSurfaceRef = useRef<HTMLDivElement | null>(null);
  requestHeadersRef.current = requestHeaders;
  const requestHeadersSignature = getRequestHeadersSignature(requestHeaders);
  const normalizedBackendUrl = normalizeBackendUrl(backendUrl);
  const coverImageSource = cover.type === "image"
    ? resolveKnowledgeCoverImageUrl(cover.src, normalizedBackendUrl)
    : "";
  const coverImageRequiresFetch = cover.type === "image"
    && (Boolean(cover.assetId) || cover.source === "computer");
  const coverImageLoadKey = getCoverImageLoadKey(
    cover,
    coverImageSource,
    requestHeadersSignature,
  );
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [computers, setComputers] = useState<KnowledgeCoverComputer[]>([]);
  const [selectedComputerId, setSelectedComputerId] = useState("");
  const [locations, setLocations] = useState<KnowledgeCoverLocation[]>([]);
  const [files, setFiles] = useState<KnowledgeCoverComputerFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<KnowledgeCoverComputerFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [computersLoading, setComputersLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [modalError, setModalError] = useState("");
  const [cropCandidate, setCropCandidate] = useState<KnowledgeCoverCropCandidate | null>(null);
  const [coverImageLoadState, setCoverImageLoadState] = useState<KnowledgeCoverImageLoadState>(
    () => ({
      key: coverImageLoadKey,
      status: cover.type === "image" ? "loading" : "loaded",
      attempt: 0,
    }),
  );
  const [resolvedComputerImage, setResolvedComputerImage] = useState({ key: "", src: "" });
  const selectedComputer = computers.find((computer) => computer.id === selectedComputerId) || null;
  const currentLocation = locations.at(-1) || null;
  const coverImageStatus =
    coverImageLoadState.key === coverImageLoadKey
      ? coverImageLoadState.status
      : cover.type === "image"
        ? "loading"
        : "loaded";
  const coverImageLoading = coverImageStatus === "loading";
  const coverImageFailed = coverImageStatus === "failed";
  const resolvedImageSrc =
    cover.type !== "image"
      ? ""
      : coverImageRequiresFetch
        ? resolvedComputerImage.key === coverImageLoadKey
          ? resolvedComputerImage.src
          : ""
        : coverImageSource;
  const renderedImageSrc = withCoverImageRetry(
    resolvedImageSrc,
    coverImageLoadState.key === coverImageLoadKey ? coverImageLoadState.attempt : 0,
  );

  useEffect(() => {
    const objectUrl = cropCandidate?.preview.objectUrl || "";
    return () => {
      if (objectUrl && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(objectUrl);
    };
  }, [cropCandidate?.preview.objectUrl]);

  useEffect(() => {
    if (!settingsMenuOpen || typeof document === "undefined") return undefined;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        settingsMenuRootRef.current?.contains(target) ||
        settingsMenuSurfaceRef.current?.contains(target)
      ) {
        return;
      }
      setSettingsMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsMenuOpen]);

  useEffect(() => {
    if (cover.type !== "image") {
      setResolvedComputerImage({ key: "", src: "" });
      setCoverImageLoadState({ key: "", status: "loaded", attempt: 0 });
      return undefined;
    }
    setCoverImageLoadState((current) =>
      current.key === coverImageLoadKey
        ? current
        : { key: coverImageLoadKey, status: "loading", attempt: 0 },
    );
    if (!coverImageRequiresFetch) return undefined;
    const controller = new AbortController();
    let preview: KnowledgeCoverPreview | null = null;
    setResolvedComputerImage({ key: coverImageLoadKey, src: "" });
    void fetchCoverImageBlob(coverImageSource, requestHeadersRef.current, controller.signal)
      .then(async (sourceBlob) => {
        const blob = await normalizeKnowledgeCoverImageBlob(sourceBlob, cover.name, cover.mimeType);
        preview = await createKnowledgeCoverPreview(blob);
        if (!controller.signal.aborted) {
          setResolvedComputerImage({ key: coverImageLoadKey, src: preview.src });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCoverImageLoadState((current) =>
            current.key === coverImageLoadKey
              ? { ...current, status: "failed" }
              : current,
          );
          setModalError(getCoverError(error, "Failed to load the cover image."));
        }
      });
    return () => {
      controller.abort();
      if (preview?.objectUrl && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(preview.objectUrl);
      }
    };
  }, [coverImageLoadKey, coverImageRequiresFetch, coverImageSource]);

  useEffect(() => {
    if (cover.type !== "image" || !renderedImageSrc) return;
    const image = coverImageRef.current;
    if (!image?.complete) return;
    setCoverImageLoadState((current) => {
      if (current.key !== coverImageLoadKey) return current;
      return {
        ...current,
        status: image.naturalWidth > 0 ? "loaded" : "failed",
      };
    });
  }, [coverImageLoadKey, renderedImageSrc]);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    if (!normalizedBackendUrl) {
      setComputers([]);
      setSelectedComputerId("");
      setComputersLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setComputersLoading(true);
    setModalError("");
    void fetch(`${normalizedBackendUrl}/environments`, {
      credentials: "include",
      headers: requestHeaders,
      signal: controller.signal,
    })
      .then((response) => readJsonResponse(response, "Failed to load computers."))
      .then((payload) => {
        const nextComputers = normalizeComputers(payload);
        const nextComputer = nextComputers[0] || null;
        setComputers(nextComputers);
        setSelectedComputerId(nextComputer?.id || "");
        setLocations(nextComputer ? [{ id: "root", label: nextComputer.name, path: "" }] : []);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setComputers([]);
        setSelectedComputerId("");
        setModalError(getCoverError(error, "Failed to load computers."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setComputersLoading(false);
      });
    return () => controller.abort();
  }, [normalizedBackendUrl, requestHeaders, settingsOpen]);

  useEffect(() => {
    if (!settingsOpen || !normalizedBackendUrl || !selectedComputerId || !currentLocation) {
      setFiles([]);
      setFilesLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    const query = new URLSearchParams({ depth: "1" });
    if (currentLocation.path) query.set("path", currentLocation.path);
    setFilesLoading(true);
    setModalError("");
    setSelectedFile(null);
    void fetch(
      `${normalizedBackendUrl}/environments/${encodeURIComponent(selectedComputerId)}/files?${query.toString()}`,
      {
        credentials: "include",
        headers: requestHeaders,
        signal: controller.signal,
      },
    )
      .then((response) => readJsonResponse(response, "Failed to load computer files."))
      .then((payload) => setFiles(normalizeComputerFiles(payload)))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setFiles([]);
        setModalError(getCoverError(error, "Failed to load computer files."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setFilesLoading(false);
      });
    return () => controller.abort();
  }, [currentLocation, normalizedBackendUrl, requestHeaders, selectedComputerId, settingsOpen]);

  const visibleFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return files;
    return files.filter((file) => file.name.toLowerCase().includes(query));
  }, [files, searchQuery]);

  const sourceGroups = useMemo<PlatformFileExplorerSourceGroup[]>(
    () => [
      {
        id: "computers",
        label: "Computers",
        items: computers.map((computer) => ({
          id: computer.id,
          label: computer.name,
          active: computer.id === selectedComputerId,
          onSelect: () => {
            setSelectedComputerId(computer.id);
            setLocations([{ id: "root", label: computer.name, path: "" }]);
            setSelectedFile(null);
            setSearchQuery("");
          },
        })),
      },
    ],
    [computers, selectedComputerId],
  );

  function validateCoverFile(file: File) {
    if (
      !file.type.toLowerCase().startsWith("image/") &&
      !isImageFile({
        name: file.name,
        mimeType: file.type,
      })
    ) {
      throw new Error("Choose an image file for the cover.");
    }
  }

  function getCurrentCoverAspectRatio() {
    const bounds = coverSectionRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return 3;
    return bounds.width / bounds.height;
  }

  async function uploadCover(file: File | null) {
    if (!file || pending) return;
    setPending(true);
    setModalError("");
    try {
      validateCoverFile(file);
      const preview = await createKnowledgeCoverPreview(file);
      setCropCandidate({
        kind: "upload",
        file,
        preview,
        aspectRatio: getCurrentCoverAspectRatio(),
      });
      setSettingsOpen(false);
    } catch (error) {
      setModalError(getCoverError(error, "Failed to prepare the cover image."));
    } finally {
      setPending(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }

  async function useSelectedComputerFile() {
    if (!selectedComputer || !selectedFile || selectedFile.isFolder || pending) return;
    const downloadUrl = buildComputerFileUrl(
      normalizedBackendUrl,
      selectedComputer.id,
      "download",
      selectedFile.path,
    );
    if (!downloadUrl) return;
    setPending(true);
    setModalError("");
    try {
      const response = await fetch(downloadUrl, {
        credentials: "include",
        headers: requestHeaders,
      });
      if (!response.ok) throw new Error("Failed to load the selected image.");
      const mimeType = selectedFile.mimeType || inferImageMimeType(selectedFile.name);
      const blob = await normalizeKnowledgeCoverImageBlob(
        await response.blob(),
        selectedFile.name,
        mimeType,
      );
      const preview = await createKnowledgeCoverPreview(blob);
      setCropCandidate({
        kind: "computer",
        file: blob,
        preview,
        aspectRatio: getCurrentCoverAspectRatio(),
        cover: {
          schemaVersion: KNOWLEDGE_LIBRARY_COVER_SCHEMA,
          type: "image",
          src: downloadUrl,
          name: selectedFile.name,
          mimeType,
          source: "computer",
          computerId: selectedComputer.id,
          computerPath: selectedFile.path,
          ...DEFAULT_KNOWLEDGE_LIBRARY_COVER_VIEW,
        },
      });
      setSettingsOpen(false);
    } catch (error) {
      setModalError(getCoverError(error, "Failed to prepare the selected cover image."));
    } finally {
      setPending(false);
    }
  }

  async function applyCrop(view: KnowledgeLibraryCoverView) {
    const candidate = cropCandidate;
    if (!candidate || pending) return;
    setPending(true);
    setModalError("");
    try {
      if (candidate.kind === "computer") {
        await onImageUpload({
          file: candidate.file,
          filename: candidate.cover.name,
          mimeType: candidate.cover.mimeType,
          source: "computer",
          computerId: candidate.cover.computerId,
          computerPath: candidate.cover.computerPath,
        }, view);
      } else {
        await onImageUpload({
          file: candidate.file,
          filename: candidate.file.name,
          mimeType: candidate.file.type || inferImageMimeType(candidate.file.name),
          source: "upload",
        }, view);
      }
      setCropCandidate(null);
    } catch (error) {
      setModalError(getCoverError(error, "Failed to apply the cover image."));
    } finally {
      setPending(false);
    }
  }

  async function removeCover() {
    if (pending) return;
    setSettingsMenuOpen(false);
    setPending(true);
    setModalError("");
    try {
      await onChange(null);
    } catch (error) {
      setModalError(getCoverError(error, "Failed to remove the cover image."));
    } finally {
      setPending(false);
    }
  }

  const coverView = cover.type === "image" ? normalizeKnowledgeLibraryCoverView(cover) : null;
  const coverImageStyle: CSSProperties | undefined = coverView
    ? {
        objectPosition: `${coverView.positionX}% ${coverView.positionY}%`,
        transform: `scale(${coverView.zoom})`,
        transformOrigin: `${coverView.positionX}% ${coverView.positionY}%`,
      }
    : undefined;

  return (
    <>
      <section
        ref={coverSectionRef}
        className={`knowledge-library-cover${cover.type === "image" ? " is-image" : ""}${coverImageLoading ? " is-image-loading" : ""}${coverImageFailed ? " is-image-failed" : ""}`}
        aria-label="Knowledge library cover"
      >
        {cover.type === "image" && renderedImageSrc ? (
          <img
            key={`${coverImageLoadKey}:${coverImageLoadState.attempt}`}
            ref={coverImageRef}
            className="knowledge-library-cover__image"
            src={renderedImageSrc}
            alt=""
            style={coverImageStyle}
            draggable={false}
            onLoad={() => {
              setCoverImageLoadState((current) =>
                current.key === coverImageLoadKey
                  ? { ...current, status: "loaded" }
                  : current,
              );
            }}
            onError={() => {
              setCoverImageLoadState((current) => {
                if (current.key !== coverImageLoadKey) return current;
                if (current.attempt < 2) {
                  return {
                    ...current,
                    status: "loading",
                    attempt: current.attempt + 1,
                  };
                }
                return { ...current, status: "failed" };
              });
            }}
          />
        ) : cover.type === "gradient" ? (
          <div className="knowledge-library-cover__gradient" aria-hidden="true" />
        ) : null}
        {coverImageLoading ? (
          <PlatformLoadingState
            centered
            className="knowledge-library-cover__loading"
            message="Loading cover image"
          />
        ) : null}
        <PlatformPopup
          open={settingsMenuOpen}
          rootRef={settingsMenuRootRef}
          surfaceRef={settingsMenuSurfaceRef}
          rootClassName="knowledge-library-cover__settings-menu"
          surfaceClassName="knowledge-library-cover__settings-popup"
          surfaceProps={{
            role: "menu",
            "aria-label": "Cover settings",
            width: 190,
          }}
          variant="minimal"
          portal
          placement="bottom-end"
          animation="down-in"
          trigger={({ open }) => (
            <PlatformPrimaryButton
              type="button"
              size="compact"
              className="knowledge-library-cover__settings-button"
              disabled={disabled || pending}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setSettingsMenuOpen((current) => !current)}
            >
              <Settings aria-hidden="true" />
              Cover Settings
            </PlatformPrimaryButton>
          )}
        >
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            disabled={pending}
            onClick={() => {
              setSettingsMenuOpen(false);
              setSettingsOpen(true);
            }}
          >
            <Monitor className="tb-popup-icon" aria-hidden="true" />
            <span className="tb-popup-label">From computer</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            disabled={pending}
            onClick={() => {
              setSettingsMenuOpen(false);
              uploadInputRef.current?.click();
            }}
          >
            <Upload className="tb-popup-icon" aria-hidden="true" />
            <span className="tb-popup-label">Upload image</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            disabled={pending}
            onClick={() => void removeCover()}
          >
            <ImageOff className="tb-popup-icon" aria-hidden="true" />
            <span className="tb-popup-label">Remove background</span>
          </button>
        </PlatformPopup>
      </section>

      <input
        ref={uploadInputRef}
        className="knowledge-library-cover__upload-input"
        type="file"
        accept="image/*"
        aria-label="Upload cover image"
        onChange={(event) => void uploadCover(event.currentTarget.files?.[0] || null)}
      />

      <PlatformFileExplorerBrowserModal
        open={settingsOpen}
        visible={settingsOpen}
        title="Choose cover image"
        size="full"
        className="knowledge-library-cover-browser"
        closeButtonLabel="Close cover settings"
        onClose={() => {
          if (!pending) setSettingsOpen(false);
        }}
        sourceGroups={sourceGroups}
        breadcrumbs={locations.map((location, index) => ({
          id: location.id,
          label: location.label,
          onSelect:
            index < locations.length - 1
              ? () => {
                  setLocations((current) => current.slice(0, index + 1));
                  setSearchQuery("");
                }
              : undefined,
        }))}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchPlaceholder="Search images"
        onBack={() => {
          if (locations.length > 1) setLocations((current) => current.slice(0, -1));
        }}
        canGoBack={locations.length > 1}
        canGoForward={false}
        showFilterTabs={false}
        filterContextKey={`${selectedComputerId}:${currentLocation?.path || "root"}`}
        items={visibleFiles}
        renderItem={(file) => {
          const selected = selectedFile?.id === file.id && !file.isFolder;
          const thumbnailUrl =
            file.isFolder || !selectedComputer
              ? ""
              : buildComputerFileUrl(
                  normalizedBackendUrl,
                  selectedComputer.id,
                  "thumbnail",
                  file.path,
                );
          return (
            <button
              key={file.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`tb-file-browser-item${selected ? " selected" : ""}`}
              onClick={() => {
                if (file.isFolder) {
                  setLocations((current) => [
                    ...current,
                    { id: file.id, label: file.name, path: file.path },
                  ]);
                  setSearchQuery("");
                  return;
                }
                setSelectedFile(file);
              }}
            >
              <span className="tb-file-browser-item-leading" aria-hidden="true">
                {file.isFolder ? <ChevronRight /> : null}
              </span>
              {file.isFolder ? (
                <PlatformFileExplorerFileIcon kind="folder" className="tb-file-browser-item-icon" />
              ) : (
                <PlatformFileExplorerThumbnail
                  src={thumbnailUrl}
                  fallback={
                    <PlatformFileExplorerFileIcon
                      kind="image"
                      className="tb-file-browser-item-icon"
                    />
                  }
                  alt=""
                  className="tb-file-browser-item-thumbnail"
                  draggable={false}
                />
              )}
              <span className="tb-file-browser-item-name">{file.name}</span>
              <span className="tb-file-browser-item-size">
                {file.isFolder ? "" : formatFileSize(file.size)}
              </span>
              {selected ? <Check className="knowledge-library-cover-browser__check" /> : null}
            </button>
          );
        }}
        getItemKind={(file) => (file.isFolder ? "folder" : "image")}
        getItemTimestamp={(file) => file.modifiedAt}
        loading={computersLoading || filesLoading}
        loadingMessage={computersLoading ? "Loading computers…" : "Loading images…"}
        error={modalError || undefined}
        emptyMessage={
          computers.length === 0
            ? "No computers are available. Upload an image instead."
            : "No images in this folder."
        }
        cancelLabel="Cancel"
        confirmLabel={pending ? "Saving Cover…" : "Use as Cover"}
        confirmDisabled={!selectedFile || selectedFile.isFolder || pending}
        onCancel={() => {
          if (!pending) setSettingsOpen(false);
        }}
        onConfirm={useSelectedComputerFile}
      />

      <KnowledgeLibraryCoverCropModal
        open={Boolean(cropCandidate)}
        imageSrc={cropCandidate?.preview.src || ""}
        imageName={
          cropCandidate?.kind === "computer"
            ? cropCandidate.cover.name
            : cropCandidate?.file.name || "Cover image"
        }
        aspectRatio={cropCandidate?.aspectRatio}
        initialView={DEFAULT_KNOWLEDGE_LIBRARY_COVER_VIEW}
        pending={pending}
        error={modalError}
        onCancel={() => {
          if (!pending) {
            setCropCandidate(null);
            setModalError("");
          }
        }}
        onApply={applyCrop}
      />
    </>
  );
}
