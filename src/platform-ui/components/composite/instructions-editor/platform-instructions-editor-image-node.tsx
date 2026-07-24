import TiptapImage, { type ImageOptions } from "@tiptap/extension-image";
import { mergeAttributes, type Editor, type NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  Copy,
  Ellipsis,
  Expand,
  Minimize2,
  Pencil,
  RectangleHorizontal,
  Trash2,
} from "lucide-react";
import {
  type CSSProperties,
  type ImgHTMLAttributes,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../ui/button/index.js";
import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformModal } from "../modal/index.js";
import {
  PlatformPopup,
  type PlatformPopupAnchorPoint,
} from "../popup/index.js";
import {
  formatPlatformInstructionsEditorFileSize,
  normalizePlatformInstructionsEditorFile,
  type PlatformInstructionsEditorFileUpload,
  type PlatformInstructionsEditorUploadedFile,
} from "./platform-instructions-editor-file-node.js";

export type PlatformInstructionsEditorImageSize = "small" | "medium" | "big";
export type PlatformInstructionsEditorImageAlignment =
  | "left"
  | "center"
  | "right";

export interface PlatformInstructionsEditorImage extends PlatformInstructionsEditorUploadedFile {
  displaySize?: PlatformInstructionsEditorImageSize;
  alignment?: PlatformInstructionsEditorImageAlignment;
}

export interface PlatformInstructionsEditorImageMarkdownMatch {
  raw: string;
  start: number;
  end: number;
  alt: string;
  src: string;
  title: string;
  displaySize: PlatformInstructionsEditorImageSize;
  alignment: PlatformInstructionsEditorImageAlignment;
  attachmentId: string;
  fileSize: number;
  mimeType: string;
}

interface PlatformInstructionsEditorImageNodeOptions extends ImageOptions {
  getFileUpload: () => PlatformInstructionsEditorFileUpload | undefined;
}

const IMAGE_METADATA_PREFIX = "computer-agents:image:";
const IMAGE_SIZE_VALUES = new Set<PlatformInstructionsEditorImageSize>([
  "small",
  "medium",
  "big",
]);
const IMAGE_ALIGNMENT_VALUES =
  new Set<PlatformInstructionsEditorImageAlignment>([
    "left",
    "center",
    "right",
  ]);

function normalizeImageSize(value: unknown): PlatformInstructionsEditorImageSize {
  const normalizedValue = String(value || "").trim() as PlatformInstructionsEditorImageSize;
  return IMAGE_SIZE_VALUES.has(normalizedValue) ? normalizedValue : "medium";
}

function normalizeImageAlignment(
  value: unknown,
): PlatformInstructionsEditorImageAlignment {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase() as PlatformInstructionsEditorImageAlignment;
  return IMAGE_ALIGNMENT_VALUES.has(normalizedValue)
    ? normalizedValue
    : "left";
}

function normalizeImageFileSize(value: unknown) {
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? size : 0;
}

function unescapeMarkdownImageAlt(value: string) {
  return String(value || "").replace(/\\([\\[\]])/g, "$1");
}

function escapeMarkdownImageAlt(value: string) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/[\r\n]+/g, " ");
}

export function normalizePlatformInstructionsEditorImageSource(value: unknown) {
  let source = String(value || "").trim();
  if (source.startsWith("<") && source.endsWith(">")) {
    source = source.slice(1, -1).trim();
  }
  return source.replace(/[\s()<>"\\]/g, (character) => {
    if (character === "(") return "%28";
    if (character === ")") return "%29";
    return encodeURIComponent(character);
  });
}

function serializeImageMetadataTitle(image: PlatformInstructionsEditorImage) {
  const parameters = new URLSearchParams();
  parameters.set("size", normalizeImageSize(image.displaySize));
  const alignment = normalizeImageAlignment(image.alignment);
  if (alignment !== "left") parameters.set("align", alignment);
  if (image.attachmentId) parameters.set("attachmentId", image.attachmentId);
  const fileSize = normalizeImageFileSize(image.size);
  if (fileSize) parameters.set("fileSize", String(fileSize));
  if (image.mimeType) parameters.set("mimeType", image.mimeType);
  if (image.title) parameters.set("title", image.title);
  return `${IMAGE_METADATA_PREFIX}${parameters.toString()}`;
}

export function parsePlatformInstructionsEditorImageTitle(value: unknown) {
  const rawTitle = String(value || "").trim();
  if (!rawTitle.startsWith(IMAGE_METADATA_PREFIX)) {
    return {
      title: rawTitle,
      displaySize: "medium" as const,
      alignment: "left" as const,
      attachmentId: "",
      fileSize: 0,
      mimeType: "",
    };
  }
  const parameters = new URLSearchParams(rawTitle.slice(IMAGE_METADATA_PREFIX.length));
  return {
    title: String(parameters.get("title") || "").trim(),
    displaySize: normalizeImageSize(parameters.get("size")),
    alignment: normalizeImageAlignment(parameters.get("align")),
    attachmentId: String(parameters.get("attachmentId") || "").trim(),
    fileSize: normalizeImageFileSize(parameters.get("fileSize")),
    mimeType: String(parameters.get("mimeType") || "").trim(),
  };
}

export function serializePlatformInstructionsEditorImageMarkdown(
  image: Partial<PlatformInstructionsEditorImage>,
) {
  const normalizedImage = normalizePlatformInstructionsEditorFile(image);
  if (!normalizedImage) return "";
  const source = normalizePlatformInstructionsEditorImageSource(normalizedImage.src);
  if (!source) return "";
  const displaySize = normalizeImageSize(image.displaySize);
  const alignment = normalizeImageAlignment(image.alignment);
  const metadataTitle = serializeImageMetadataTitle({
    ...normalizedImage,
    displaySize,
    alignment,
  });
  return `![${escapeMarkdownImageAlt(normalizedImage.alt || normalizedImage.name || "Image")}](${source} "${metadataTitle}")`;
}

function findMarkdownImageClosingBracket(value: string, start: number) {
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === "\\") {
      index += 1;
      continue;
    }
    if (value[index] === "]") return index;
  }
  return -1;
}

function splitMarkdownImageDestination(value: string) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) return { src: "", title: "" };
  if (normalizedValue.startsWith("<")) {
    const closingBracket = normalizedValue.indexOf(">");
    if (closingBracket >= 0) {
      const src = normalizedValue.slice(1, closingBracket);
      const suffix = normalizedValue.slice(closingBracket + 1).trim();
      const titleMatch = /^(?:"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)'|\(((?:\\.|[^)])*)\))$/.exec(suffix);
      return {
        src,
        title: titleMatch ? String(titleMatch[1] ?? titleMatch[2] ?? titleMatch[3] ?? "") : "",
      };
    }
  }
  const titleMatch = /^([\s\S]*?)\s+(?:"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)'|\(((?:\\.|[^)])*)\))\s*$/.exec(normalizedValue);
  if (!titleMatch) return { src: normalizedValue, title: "" };
  return {
    src: String(titleMatch[1] || "").trim(),
    title: String(titleMatch[2] ?? titleMatch[3] ?? titleMatch[4] ?? ""),
  };
}

export function parsePlatformInstructionsEditorImageMarkdown(
  markdown: unknown,
): PlatformInstructionsEditorImageMarkdownMatch[] {
  const value = String(markdown || "");
  const matches: PlatformInstructionsEditorImageMarkdownMatch[] = [];
  let searchFrom = 0;
  while (searchFrom < value.length) {
    const start = value.indexOf("![", searchFrom);
    if (start < 0) break;
    let precedingSlashCount = 0;
    for (let index = start - 1; index >= 0 && value[index] === "\\"; index -= 1) {
      precedingSlashCount += 1;
    }
    if (precedingSlashCount % 2 === 1) {
      searchFrom = start + 2;
      continue;
    }
    const altEnd = findMarkdownImageClosingBracket(value, start + 2);
    if (altEnd < 0 || value[altEnd + 1] !== "(") {
      searchFrom = start + 2;
      continue;
    }
    let depth = 1;
    let imageEnd = -1;
    for (let index = altEnd + 2; index < value.length; index += 1) {
      if (value[index] === "\\") {
        index += 1;
        continue;
      }
      if (value[index] === "(") depth += 1;
      if (value[index] === ")") {
        depth -= 1;
        if (depth === 0) {
          imageEnd = index + 1;
          break;
        }
      }
    }
    if (imageEnd < 0) {
      searchFrom = start + 2;
      continue;
    }
    const destination = splitMarkdownImageDestination(
      value.slice(altEnd + 2, imageEnd - 1),
    );
    if (!destination.src) {
      searchFrom = imageEnd;
      continue;
    }
    const metadata = parsePlatformInstructionsEditorImageTitle(destination.title);
    matches.push({
      raw: value.slice(start, imageEnd),
      start,
      end: imageEnd,
      alt: unescapeMarkdownImageAlt(value.slice(start + 2, altEnd)),
      src: destination.src,
      title: metadata.title,
      displaySize: metadata.displaySize,
      alignment: metadata.alignment,
      attachmentId: metadata.attachmentId,
      fileSize: metadata.fileSize,
      mimeType: metadata.mimeType,
    });
    searchFrom = imageEnd;
  }
  return matches;
}

export function replacePlatformInstructionsEditorImageMarkdown(
  markdown: unknown,
  replacer: (image: PlatformInstructionsEditorImageMarkdownMatch) => string,
) {
  const value = String(markdown || "");
  const matches = parsePlatformInstructionsEditorImageMarkdown(value);
  if (!matches.length) return value;
  let cursor = 0;
  let result = "";
  matches.forEach((match) => {
    result += value.slice(cursor, match.start);
    result += replacer(match);
    cursor = match.end;
  });
  return result + value.slice(cursor);
}

export function normalizePlatformInstructionsEditorMarkdownImages(markdown: unknown) {
  return replacePlatformInstructionsEditorImageMarkdown(markdown, (image) => (
    serializePlatformInstructionsEditorImageMarkdown({
      src: image.src,
      name: image.alt || "Image",
      alt: image.alt || "Image",
      title: image.title,
      size: image.fileSize,
      mimeType: image.mimeType,
      attachmentId: image.attachmentId,
      displaySize: image.displaySize,
      alignment: image.alignment,
    }) || image.raw
  ));
}

function getImageFromNodeAttributes(attributes: Record<string, unknown>) {
  const image = normalizePlatformInstructionsEditorFile({
    src: String(attributes.src || ""),
    name: String(attributes.alt || "Image"),
    alt: String(attributes.alt || "Image"),
    title: String(attributes.title || ""),
    size: Number(attributes.fileSize || 0),
    mimeType: String(attributes.mimeType || ""),
    attachmentId: String(attributes.attachmentId || ""),
  });
  return image
    ? {
        ...image,
        displaySize: normalizeImageSize(attributes.displaySize),
        alignment: normalizeImageAlignment(attributes.alignment),
      }
    : null;
}

async function copyImageToClipboard(
  image: PlatformInstructionsEditorImage,
  previewSource = "",
) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  try {
    if (
      typeof navigator.clipboard.write === "function"
      && typeof ClipboardItem !== "undefined"
      && typeof fetch === "function"
    ) {
      const response = await fetch(previewSource || image.src);
      const blob = await response.blob();
      if (blob.type.startsWith("image/")) {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        return;
      }
    }
  } catch {
    // Fall back to the durable image URL when binary clipboard writes are unavailable.
  }
  await navigator.clipboard.writeText?.(image.src);
}

interface ResolvedImagePreview {
  src: string;
  size: number;
  status: "idle" | "loading" | "ready" | "error";
  isSvg: boolean;
  intrinsicWidth: number;
  intrinsicHeight: number;
}

function isSvgImage(
  image: PlatformInstructionsEditorImage,
  sourceBlob?: Blob,
) {
  const mimeTypes = [sourceBlob?.type, image.mimeType]
    .map((value) => String(value || "").trim().toLowerCase());
  if (
    mimeTypes.some(
      (mimeType) => mimeType === "image/svg+xml" || mimeType === "image/svg",
    )
  ) {
    return true;
  }
  const filename = String(image.name || image.alt || "")
    .trim()
    .toLowerCase();
  const source = String(image.src || "")
    .split(/[?#]/, 1)[0]
    .trim()
    .toLowerCase();
  return filename.endsWith(".svg") || source.endsWith(".svg");
}

function normalizeResolvedImageBlob(
  image: PlatformInstructionsEditorImage,
  sourceBlob: Blob,
) {
  if (!isSvgImage(image, sourceBlob)) return sourceBlob;
  if (String(sourceBlob.type || "").trim().toLowerCase() === "image/svg+xml") {
    return sourceBlob;
  }
  return new Blob([sourceBlob], { type: "image/svg+xml" });
}

function readImageBlobAsDataUrl(sourceBlob: Blob) {
  return new Promise<string>((resolve, reject) => {
    if (typeof FileReader === "undefined") {
      reject(new Error("This browser cannot render the SVG preview."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(reader.error || new Error("Failed to read the SVG preview."));
    reader.onabort = () =>
      reject(new DOMException("SVG preview loading was cancelled.", "AbortError"));
    reader.readAsDataURL(sourceBlob);
  });
}

function readImageBlobAsText(sourceBlob: Blob) {
  if (typeof sourceBlob.text === "function") return sourceBlob.text();
  return new Promise<string>((resolve, reject) => {
    if (typeof FileReader === "undefined") {
      reject(new Error("This browser cannot inspect the SVG preview."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(reader.error || new Error("Failed to inspect the SVG preview."));
    reader.onabort = () =>
      reject(new DOMException("SVG preview loading was cancelled.", "AbortError"));
    reader.readAsText(sourceBlob);
  });
}

function parsePositiveSvgNumber(value: unknown) {
  const normalizedValue = String(value || "").trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:px)?$/i.test(normalizedValue)) return 0;
  const number = Number.parseFloat(normalizedValue);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function parseSvgIntrinsicDimensions(source: string) {
  const fallback = { width: 300, height: 150 };
  if (typeof DOMParser === "undefined") return fallback;
  try {
    const document = new DOMParser().parseFromString(source, "image/svg+xml");
    if (document.querySelector("parsererror")) return fallback;
    const svg = document.documentElement;
    if (String(svg.localName || "").toLowerCase() !== "svg") return fallback;
    const viewBox = String(svg.getAttribute("viewBox") || "")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (
      viewBox.length === 4
      && Number.isFinite(viewBox[2])
      && Number.isFinite(viewBox[3])
      && viewBox[2] > 0
      && viewBox[3] > 0
    ) {
      return { width: viewBox[2], height: viewBox[3] };
    }
    const width = parsePositiveSvgNumber(svg.getAttribute("width"));
    const height = parsePositiveSvgNumber(svg.getAttribute("height"));
    return width && height ? { width, height } : fallback;
  } catch {
    return fallback;
  }
}

async function resolveSvgBlobPreview(sourceBlob: Blob) {
  const [src, source] = await Promise.all([
    readImageBlobAsDataUrl(sourceBlob),
    readImageBlobAsText(sourceBlob),
  ]);
  return {
    src,
    ...parseSvgIntrinsicDimensions(source),
  };
}

function isSelfRenderingImageSource(value: unknown) {
  const source = String(value || "").trim().toLowerCase();
  return source.startsWith("blob:") || source.startsWith("data:");
}

function getResolvedImageStyle(
  image: PlatformInstructionsEditorImage,
  preview: ResolvedImagePreview,
  style?: CSSProperties,
) {
  if (!preview.isSvg) return style;
  const width = preview.intrinsicWidth > 0 ? preview.intrinsicWidth : 300;
  const height = preview.intrinsicHeight > 0 ? preview.intrinsicHeight : 150;
  const displaySize = normalizeImageSize(image.displaySize);
  const svgStyle: CSSProperties = {
    aspectRatio: `${width} / ${height}`,
  };
  if (displaySize !== "big") {
    const maxHeight = displaySize === "small" ? 120 : 250;
    svgStyle.width = `${Math.max(1, maxHeight * (width / height))}px`;
  }
  return {
    ...style,
    ...svgStyle,
  };
}

function useResolvedImagePreview(
  image: PlatformInstructionsEditorImage,
  resolvePreviewSource:
    | PlatformInstructionsEditorFileUpload["resolvePreviewSource"]
    | undefined,
) {
  const imageSource = String(image.src || "").trim();
  const imageRef = useRef(image);
  const resolverRef = useRef(resolvePreviewSource);
  imageRef.current = image;
  resolverRef.current = resolvePreviewSource;
  const canResolvePreview = Boolean(resolvePreviewSource);
  const sourceIsSvg = isSvgImage(image);
  const [preview, setPreview] = useState<ResolvedImagePreview>(() => ({
    src:
      !canResolvePreview || isSelfRenderingImageSource(imageSource)
        ? imageSource
        : "",
    size: normalizeImageFileSize(image.size),
    status:
      !canResolvePreview || isSelfRenderingImageSource(imageSource)
        ? "ready"
        : "loading",
    isSvg: sourceIsSvg,
    intrinsicWidth: sourceIsSvg ? 300 : 0,
    intrinsicHeight: sourceIsSvg ? 150 : 0,
  }));

  useEffect(() => {
    const persistedSize = normalizeImageFileSize(image.size);
    const currentResolver = resolverRef.current;
    const currentImageIsSvg = isSvgImage(imageRef.current);
    if (!currentResolver || isSelfRenderingImageSource(imageSource)) {
      setPreview({
        src: imageSource,
        size: persistedSize,
        status: "ready",
        isSvg: currentImageIsSvg,
        intrinsicWidth: currentImageIsSvg ? 300 : 0,
        intrinsicHeight: currentImageIsSvg ? 150 : 0,
      });
      return undefined;
    }

    const controller = new AbortController();
    let ownedObjectUrl = "";
    let active = true;
    setPreview({
      src: "",
      size: persistedSize,
      status: "loading",
      isSvg: currentImageIsSvg,
      intrinsicWidth: currentImageIsSvg ? 300 : 0,
      intrinsicHeight: currentImageIsSvg ? 150 : 0,
    });

    void currentResolver(imageRef.current, controller.signal)
      .then(async (resolvedSource) => {
        if (!active || controller.signal.aborted) return;
        if (resolvedSource instanceof Blob) {
          const renderableBlob = normalizeResolvedImageBlob(
            imageRef.current,
            resolvedSource,
          );
          if (isSvgImage(imageRef.current, renderableBlob)) {
            const svgPreview = await resolveSvgBlobPreview(renderableBlob);
            if (!active || controller.signal.aborted) return;
            setPreview({
              src: svgPreview.src,
              size: persistedSize || normalizeImageFileSize(renderableBlob.size),
              status: svgPreview.src ? "ready" : "error",
              isSvg: true,
              intrinsicWidth: svgPreview.width,
              intrinsicHeight: svgPreview.height,
            });
            return;
          }
          if (typeof URL.createObjectURL !== "function") {
            setPreview({
              src: imageSource,
              size: persistedSize || normalizeImageFileSize(renderableBlob.size),
              status: "ready",
              isSvg: false,
              intrinsicWidth: 0,
              intrinsicHeight: 0,
            });
            return;
          }
          ownedObjectUrl = URL.createObjectURL(renderableBlob);
          setPreview({
            src: ownedObjectUrl,
            size: persistedSize || normalizeImageFileSize(renderableBlob.size),
            status: "ready",
            isSvg: false,
            intrinsicWidth: 0,
            intrinsicHeight: 0,
          });
          return;
        }
        const source = String(resolvedSource || "").trim();
        setPreview({
          src: source || imageSource,
          size: persistedSize,
          status: source || imageSource ? "ready" : "error",
          isSvg: currentImageIsSvg,
          intrinsicWidth: currentImageIsSvg ? 300 : 0,
          intrinsicHeight: currentImageIsSvg ? 150 : 0,
        });
      })
      .catch(() => {
        if (!active || controller.signal.aborted) return;
        setPreview({
          src: "",
          size: persistedSize,
          status: "error",
          isSvg: currentImageIsSvg,
          intrinsicWidth: currentImageIsSvg ? 300 : 0,
          intrinsicHeight: currentImageIsSvg ? 150 : 0,
        });
      });

    return () => {
      active = false;
      controller.abort();
      if (ownedObjectUrl && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(ownedObjectUrl);
      }
    };
  }, [
    image.attachmentId,
    image.mimeType,
    image.name,
    image.size,
    imageSource,
    canResolvePreview,
  ]);

  return preview;
}

export function PlatformInstructionsEditorImagePreview({
  image,
  resolvePreviewSource,
  className = "",
  ...imageProps
}: {
  image: PlatformInstructionsEditorImage;
  resolvePreviewSource?:
    PlatformInstructionsEditorFileUpload["resolvePreviewSource"];
  className?: string;
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "alt" | "className" | "src" | "title"
>) {
  const preview = useResolvedImagePreview(image, resolvePreviewSource);
  const resolvedStyle = getResolvedImageStyle(image, preview, imageProps.style);
  return (
    <img
      {...imageProps}
      className={`${className}${preview.status === "loading" ? " is-loading" : ""}${preview.status === "error" ? " is-load-error" : ""}`}
      src={preview.src || undefined}
      alt={image.alt || image.name || ""}
      title={image.title || undefined}
      style={resolvedStyle}
      aria-busy={preview.status === "loading" || undefined}
      data-platform-preview-size={preview.size || undefined}
      data-platform-preview-status={preview.status}
      data-platform-image-format={preview.isSvg ? "svg" : undefined}
      data-platform-image-alignment={normalizeImageAlignment(image.alignment)}
    />
  );
}

function PlatformInstructionsEditorImageNodeView({
  node,
  editor,
  updateAttributes,
  deleteNode,
  getPos,
  selected,
  getFileUpload,
}: NodeViewProps & {
  getFileUpload: () => PlatformInstructionsEditorFileUpload | undefined;
}) {
  const image = getImageFromNodeAttributes(node.attrs);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const renameInputId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorPoint, setMenuAnchorPoint] =
    useState<PlatformPopupAnchorPoint | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState(image?.name || "");
  const [renamePending, setRenamePending] = useState(false);
  const [renameError, setRenameError] = useState("");
  const fileUpload = getFileUpload();
  const editable = editor.isEditable && !fileUpload?.disabled;
  const preview = useResolvedImagePreview(
    image || {
      src: "",
      name: "",
    },
    fileUpload?.resolvePreviewSource,
  );
  const resolvedImageStyle = image
    ? getResolvedImageStyle(image, preview)
    : undefined;

  useEffect(() => {
    if (renameOpen || !image) return;
    setRenameDraft(image.name || "");
    setRenameError("");
  }, [image?.name, renameOpen]);

  useEffect(() => {
    if (!menuOpen || typeof window === "undefined") return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setMenuOpen(false);
      setMenuAnchorPoint(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMenuAnchorPoint(null);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  if (!image) return <NodeViewWrapper />;

  const selectImage = () => {
    const position = getPos();
    if (typeof position !== "number") return;
    const selection = NodeSelection.create(editor.state.doc, position);
    editor.view.dispatch(editor.state.tr.setSelection(selection));
    editor.view.focus();
  };
  const closeImageMenu = () => {
    setMenuOpen(false);
    setMenuAnchorPoint(null);
  };
  const updateSize = (displaySize: PlatformInstructionsEditorImageSize) => {
    updateAttributes({ displaySize });
    closeImageMenu();
  };
  const updateAlignment = (
    alignment: PlatformInstructionsEditorImageAlignment,
  ) => {
    updateAttributes({ alignment });
    closeImageMenu();
  };
  const saveRename = async () => {
    const nextName = renameDraft.trim();
    if (!nextName) {
      setRenameError("Enter an image name.");
      return;
    }
    if (nextName === image.name) {
      setRenameOpen(false);
      return;
    }
    setRenamePending(true);
    setRenameError("");
    try {
      await fileUpload?.onRename?.(image, nextName);
      updateAttributes({ alt: nextName });
      setRenameOpen(false);
    } catch (error) {
      setRenameError(error instanceof Error && error.message
        ? error.message
        : "The image could not be renamed.");
    } finally {
      setRenamePending(false);
    }
  };
  const removeImage = async () => {
    closeImageMenu();
    deleteNode();
    await fileUpload?.onRemove?.(image);
  };
  const sizeOptions: Array<{
    value: PlatformInstructionsEditorImageSize;
    label: string;
    icon: typeof Minimize2;
  }> = [
    { value: "small", label: "Small", icon: Minimize2 },
    { value: "medium", label: "Medium", icon: RectangleHorizontal },
    { value: "big", label: "Big", icon: Expand },
  ];
  const alignmentOptions: Array<{
    value: PlatformInstructionsEditorImageAlignment;
    label: string;
    icon: typeof AlignLeft;
  }> = [
    { value: "left", label: "Left", icon: AlignLeft },
    { value: "center", label: "Middle", icon: AlignCenter },
    { value: "right", label: "Right", icon: AlignRight },
  ];

  return (
    <>
      <NodeViewWrapper
        className={`platform-instructions-editor__image-node is-size-${image.displaySize} is-align-${image.alignment}${selected ? " is-selected" : ""}${menuOpen ? " is-menu-open" : ""}`}
        contentEditable={false}
        data-platform-image-size={image.displaySize}
        data-platform-image-alignment={image.alignment}
        data-drag-handle
        onMouseDown={(event: ReactMouseEvent<HTMLElement>) => {
          if (event.button === 0) selectImage();
        }}
        onContextMenu={(event: ReactMouseEvent<HTMLElement>) => {
          if (!editable) return;
          event.preventDefault();
          event.stopPropagation();
          selectImage();
          setMenuAnchorPoint({ x: event.clientX, y: event.clientY });
          setMenuOpen(true);
        }}
      >
        <img
          className={`platform-instructions-editor__image platform-markdown__image is-size-${image.displaySize} is-align-${image.alignment}`}
          src={preview.src || undefined}
          alt={image.alt || image.name || ""}
          title={image.title || undefined}
          style={resolvedImageStyle}
          draggable={false}
          aria-busy={preview.status === "loading" || undefined}
          data-platform-preview-status={preview.status}
          data-platform-image-format={preview.isSvg ? "svg" : undefined}
        />
        {editable ? (
          <div className="platform-instructions-editor__image-actions">
            <PlatformPopup
              open={menuOpen}
              rootRef={rootRef}
              surfaceRef={popupRef}
              rootClassName="platform-instructions-editor__image-popup-anchor"
              surfaceClassName="platform-instructions-editor__image-popup"
              surfaceProps={{
                role: "menu",
                "aria-label": `${image.name || "Image"} actions`,
                width: 220,
                onMouseDown: (event) => event.preventDefault(),
              }}
              variant="minimal"
              portal
              placement="bottom-start"
              portalAnchorPoint={menuAnchorPoint}
              portalOffset={menuAnchorPoint ? 0 : 8}
              trigger={(
                <PlatformIconButton
                  type="button"
                  size="compact"
                  aria-label={`Image actions for ${image.name || "image"}`}
                  active={menuOpen}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setMenuAnchorPoint(null);
                    selectImage();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuOpen((current) => !current);
                  }}
                >
                  <Ellipsis aria-hidden="true" strokeWidth={1.8} />
                </PlatformIconButton>
              )}
            >
              <div className="platform-instructions-editor__image-popup-header">
                <span className="platform-instructions-editor__image-popup-name" title={image.name}>
                  {image.name || "Image"}
                </span>
                <span className="platform-instructions-editor__image-popup-size">
                  {formatPlatformInstructionsEditorFileSize(
                    image.size || preview.size,
                  ) || "Size unavailable"}
                </span>
              </div>
              <div className="platform-instructions-editor__image-popup-group" role="group" aria-label="Image size">
                {sizeOptions.map((option) => {
                  const Icon = option.icon;
                  const active = image.displaySize === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      className={`tb-popup-row${active ? " is-selected" : ""}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        updateSize(option.value);
                      }}
                    >
                      <Icon className="tb-popup-icon" aria-hidden="true" strokeWidth={1.8} />
                      <span className="tb-popup-label">{option.label}</span>
                      <span className="tb-popup-check-slot">
                        {active ? <Check className="tb-popup-check" aria-hidden="true" strokeWidth={1.8} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div
                className="platform-instructions-editor__image-popup-group"
                role="group"
                aria-label="Image alignment"
              >
                {alignmentOptions.map((option) => {
                  const Icon = option.icon;
                  const active = image.alignment === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      className={`tb-popup-row${active ? " is-selected" : ""}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        updateAlignment(option.value);
                      }}
                    >
                      <Icon className="tb-popup-icon" aria-hidden="true" strokeWidth={1.8} />
                      <span className="tb-popup-label">{option.label}</span>
                      <span className="tb-popup-check-slot">
                        {active ? <Check className="tb-popup-check" aria-hidden="true" strokeWidth={1.8} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="platform-instructions-editor__image-popup-group is-actions">
                <button
                  type="button"
                  role="menuitem"
                  className="tb-popup-row"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeImageMenu();
                    void copyImageToClipboard(image, preview.src);
                  }}
                >
                  <Copy className="tb-popup-icon" aria-hidden="true" strokeWidth={1.8} />
                  <span className="tb-popup-label">Copy</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="tb-popup-row"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeImageMenu();
                    setRenameDraft(image.name || "");
                    setRenameError("");
                    setRenameOpen(true);
                  }}
                >
                  <Pencil className="tb-popup-icon" aria-hidden="true" strokeWidth={1.8} />
                  <span className="tb-popup-label">Rename</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="tb-popup-row"
                  onClick={(event) => {
                    event.stopPropagation();
                    void removeImage();
                  }}
                >
                  <Trash2 className="tb-popup-icon" aria-hidden="true" strokeWidth={1.8} />
                  <span className="tb-popup-label">Delete</span>
                </button>
              </div>
            </PlatformPopup>
          </div>
        ) : null}
      </NodeViewWrapper>

      <PlatformModal
        open={renameOpen}
        title="Rename Image"
        size="small"
        className="platform-instructions-editor__image-rename-modal"
        initialFocusRef={renameInputRef}
        closeButtonDisabled={renamePending}
        closeOnBackdrop={!renamePending}
        closeOnEscape={!renamePending}
        onClose={() => {
          if (!renamePending) setRenameOpen(false);
        }}
        footer={(
          <>
            <PlatformSecondaryButton
              type="button"
              size="medium"
              disabled={renamePending}
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              type="button"
              size="medium"
              disabled={renamePending || !renameDraft.trim() || renameDraft.trim() === image.name}
              onClick={() => void saveRename()}
            >
              {renamePending ? "Renaming..." : "Rename"}
            </PlatformPrimaryButton>
          </>
        )}
      >
        <form
          className="platform-instructions-editor__image-rename-form"
          onSubmit={(event) => {
            event.preventDefault();
            void saveRename();
          }}
        >
          <label className="platform-instructions-editor__image-rename-label" htmlFor={renameInputId}>
            Image name
          </label>
          <input
            id={renameInputId}
            ref={renameInputRef}
            className="platform-instructions-editor__image-rename-input"
            value={renameDraft}
            disabled={renamePending}
            onChange={(event) => setRenameDraft(event.target.value)}
          />
          {renameError ? (
            <p className="platform-instructions-editor__image-rename-error" role="alert">
              {renameError}
            </p>
          ) : null}
        </form>
      </PlatformModal>
    </>
  );
}

function getAdjacentImageRange(
  editor: Editor,
  direction: "backward" | "forward",
) {
  const { selection } = editor.state;
  if (selection instanceof NodeSelection && selection.node.type.name === "image") {
    return {
      from: selection.from,
      to: selection.to,
      image: getImageFromNodeAttributes(selection.node.attrs),
    };
  }
  if (!selection.empty) return null;
  const node = direction === "backward"
    ? selection.$from.nodeBefore
    : selection.$from.nodeAfter;
  if (node?.type.name !== "image") return null;
  return {
    from: direction === "backward" ? selection.from - node.nodeSize : selection.from,
    to: direction === "backward" ? selection.from : selection.from + node.nodeSize,
    image: getImageFromNodeAttributes(node.attrs),
  };
}

export const PlatformInstructionsEditorImageNode = TiptapImage.extend<PlatformInstructionsEditorImageNodeOptions>({
  addOptions() {
    const parentOptions = this.parent?.();
    return {
      inline: parentOptions?.inline ?? false,
      allowBase64: parentOptions?.allowBase64 ?? false,
      HTMLAttributes: parentOptions?.HTMLAttributes ?? {},
      resize: parentOptions?.resize ?? false,
      getFileUpload: () => undefined,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      displaySize: {
        default: "medium",
        parseHTML: (element) => normalizeImageSize(element.getAttribute("data-platform-image-size")),
        renderHTML: (attributes) => ({
          "data-platform-image-size": normalizeImageSize(attributes.displaySize),
        }),
      },
      alignment: {
        default: "left",
        parseHTML: (element) =>
          normalizeImageAlignment(
            element.getAttribute("data-platform-image-alignment"),
          ),
        renderHTML: (attributes) => ({
          "data-platform-image-alignment": normalizeImageAlignment(
            attributes.alignment,
          ),
        }),
      },
      attachmentId: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-platform-attachment-id") || "",
        renderHTML: (attributes) => ({
          "data-platform-attachment-id": String(attributes.attachmentId || ""),
        }),
      },
      fileSize: {
        default: 0,
        parseHTML: (element) => normalizeImageFileSize(element.getAttribute("data-platform-file-size")),
        renderHTML: (attributes) => ({
          "data-platform-file-size": normalizeImageFileSize(attributes.fileSize),
        }),
      },
      mimeType: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-platform-mime-type") || "",
        renderHTML: (attributes) => ({
          "data-platform-mime-type": String(attributes.mimeType || ""),
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  parseMarkdown(token, helpers) {
    const imageToken = token as typeof token & {
      href?: unknown;
      text?: unknown;
      title?: unknown;
    };
    const metadata = parsePlatformInstructionsEditorImageTitle(imageToken.title);
    return helpers.createNode("image", {
      src: normalizePlatformInstructionsEditorImageSource(imageToken.href),
      alt: String(imageToken.text || ""),
      title: metadata.title || null,
      displaySize: metadata.displaySize,
      alignment: metadata.alignment,
      attachmentId: metadata.attachmentId,
      fileSize: metadata.fileSize,
      mimeType: metadata.mimeType,
    });
  },

  renderMarkdown(node) {
    return serializePlatformInstructionsEditorImageMarkdown({
      src: String(node.attrs?.src || ""),
      name: String(node.attrs?.alt || "Image"),
      alt: String(node.attrs?.alt || "Image"),
      title: String(node.attrs?.title || ""),
      size: Number(node.attrs?.fileSize || 0),
      mimeType: String(node.attrs?.mimeType || ""),
      attachmentId: String(node.attrs?.attachmentId || ""),
      displaySize: normalizeImageSize(node.attrs?.displaySize),
      alignment: normalizeImageAlignment(node.attrs?.alignment),
    });
  },

  addNodeView() {
    const getFileUpload = this.options.getFileUpload;
    return ReactNodeViewRenderer((props) => (
      <PlatformInstructionsEditorImageNodeView
        {...props}
        getFileUpload={getFileUpload}
      />
    ), {
      className: "platform-instructions-editor__image-node-host",
      attrs: ({ node }) => ({
        "data-platform-image-size": normalizeImageSize(
          node.attrs.displaySize,
        ),
        "data-platform-image-alignment": normalizeImageAlignment(
          node.attrs.alignment,
        ),
      }),
    });
  },

  addKeyboardShortcuts() {
    const removeAdjacentImage = (direction: "backward" | "forward") => {
      const range = getAdjacentImageRange(this.editor, direction);
      if (!range) return false;
      const fileUpload = this.options.getFileUpload();
      if (fileUpload?.disabled) return true;
      const removed = this.editor.commands.deleteRange({ from: range.from, to: range.to });
      if (removed && range.image) void fileUpload?.onRemove?.(range.image);
      return removed;
    };
    return {
      Backspace: () => removeAdjacentImage("backward"),
      Delete: () => removeAdjacentImage("forward"),
    };
  },
});
