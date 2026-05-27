import { useEffect, useRef, useState } from "react";
import {
  FileText as LucideFileText,
  LoaderCircle as LucideLoaderCircle,
  Presentation as LucidePresentation,
} from "lucide-react";
import {
  isRunnerKeynotePresentationFile,
  isRunnerPowerPointPresentationFile,
} from "./runner-presentation-utils.js";

interface RunnerPresentationPreviewProps {
  blob?: Blob | null;
  filename: string;
  mimeType?: string | null;
}

interface KeynotePreviewImage {
  name: string;
  url: string;
}

type PresentationLoadState =
  | { status: "idle" | "loading" }
  | { status: "ready"; slideCount?: number | null; keynoteImages?: KeynotePreviewImage[] }
  | { status: "error"; error: string };

type PptxPreviewModule = typeof import("pptx-preview");
type JsZipConstructor = typeof import("jszip");
type JsZipRuntimeModule = JsZipConstructor | { default: JsZipConstructor };

const RUNNER_PPTX_PREVIEW_ESM_URL = "https://esm.sh/pptx-preview@1.0.7?bundle";
const RUNNER_JSZIP_ESM_URL = "https://esm.sh/jszip@3.10.1?bundle";

let pptxPreviewModulePromise: Promise<PptxPreviewModule> | null = null;
let jsZipModulePromise: Promise<JsZipRuntimeModule> | null = null;

function isBrowserModuleResolutionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || "");
  return /failed to resolve module specifier|bare specifier|relative references must start/i.test(message);
}

function loadPptxPreviewModule(): Promise<PptxPreviewModule> {
  if (!pptxPreviewModulePromise) {
    pptxPreviewModulePromise = import("pptx-preview").catch((error) => {
      if (!isBrowserModuleResolutionError(error)) throw error;
      return import(/* @vite-ignore */ RUNNER_PPTX_PREVIEW_ESM_URL) as Promise<PptxPreviewModule>;
    });
  }
  return pptxPreviewModulePromise;
}

function loadJsZipModule(): Promise<JsZipRuntimeModule> {
  if (!jsZipModulePromise) {
    jsZipModulePromise = (import("jszip") as Promise<JsZipRuntimeModule>).catch((error) => {
      if (!isBrowserModuleResolutionError(error)) throw error;
      return import(/* @vite-ignore */ RUNNER_JSZIP_ESM_URL) as Promise<JsZipRuntimeModule>;
    });
  }
  return jsZipModulePromise;
}

function getJsZipConstructor(module: JsZipRuntimeModule): JsZipConstructor {
  return typeof module === "function" ? module : module.default;
}

function sortKeynotePreviewCandidates(left: string, right: string): number {
  function score(name: string): number {
    const normalized = name.toLowerCase();
    if (normalized.includes("quicklook/preview")) return 0;
    if (normalized.includes("preview-web")) return 1;
    if (normalized.includes("preview")) return 2;
    if (normalized.includes("thumbnail")) return 3;
    return 4;
  }
  return score(left) - score(right) || left.localeCompare(right);
}

function isKeynotePreviewCandidate(path: string): boolean {
  const normalized = String(path || "").toLowerCase();
  return (
    /(?:^|\/)quicklook\/[^/]+\.(?:png|jpe?g)$/i.test(normalized) ||
    /(?:^|\/)(?:preview|preview-web|preview-micro|thumbnail)[^/]*\.(?:png|jpe?g)$/i.test(normalized) ||
    /(?:^|\/)previews\/[^/]+\.(?:png|jpe?g)$/i.test(normalized)
  );
}

export function RunnerPresentationPreview({
  blob,
  filename,
  mimeType,
}: RunnerPresentationPreviewProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const keynoteObjectUrlsRef = useRef<string[]>([]);
  const [loadState, setLoadState] = useState<PresentationLoadState>({ status: "idle" });
  const [stageWidth, setStageWidth] = useState(0);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const updateWidth = () => {
      const nextWidth = Math.floor(shell.clientWidth || 0);
      setStageWidth((current) => (Math.abs(current - nextWidth) < 8 ? current : nextWidth));
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      for (const url of keynoteObjectUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      keynoteObjectUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!blob || !stage) {
      setLoadState({ status: "idle" });
      return undefined;
    }

    let cancelled = false;
    stage.innerHTML = "";
    setLoadState({ status: "loading" });

    for (const url of keynoteObjectUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    keynoteObjectUrlsRef.current = [];

    if (isRunnerPowerPointPresentationFile(filename, mimeType)) {
      void (async () => {
        const width = Math.max(320, Math.min(1280, Math.floor(stageWidth || stage.clientWidth || 960) - 40));
        const [{ init }, buffer] = await Promise.all([
          loadPptxPreviewModule(),
          blob.arrayBuffer(),
        ]);
        if (cancelled) return;
        stage.innerHTML = "";
        const previewer = init(stage, {
          width,
          mode: "list",
        });
        const presentation = await previewer.preview(buffer);
        if (cancelled) {
          previewer.destroy?.();
          stage.innerHTML = "";
          return;
        }
        const slideCount = typeof (presentation as any)?.slides?.length === "number"
          ? (presentation as any).slides.length
          : typeof (previewer as any)?.slideCount === "number"
            ? (previewer as any).slideCount
            : null;
        setLoadState({ status: "ready", slideCount });
      })().catch((error) => {
        if (cancelled) return;
        const normalizedError = error instanceof Error ? error.message : String(error || "");
        stage.innerHTML = "";
        setLoadState({ status: "error", error: normalizedError || "Failed to render presentation preview." });
      });

      return () => {
        cancelled = true;
        stage.innerHTML = "";
      };
    }

    if (isRunnerKeynotePresentationFile(filename, mimeType)) {
      void (async () => {
        const JSZip = getJsZipConstructor(await loadJsZipModule());
        const zip = await JSZip.loadAsync(await blob.arrayBuffer());
        if (cancelled) return;

        const candidates = Object.values(zip.files)
          .filter((file) => !file.dir && isKeynotePreviewCandidate(file.name))
          .sort((left, right) => sortKeynotePreviewCandidates(left.name, right.name))
          .slice(0, 20);

        const images: KeynotePreviewImage[] = [];
        for (const file of candidates) {
          const imageBlob = await file.async("blob");
          if (cancelled) return;
          const url = URL.createObjectURL(imageBlob);
          keynoteObjectUrlsRef.current.push(url);
          images.push({ name: file.name.split("/").pop() || file.name, url });
        }

        setLoadState({
          status: "ready",
          slideCount: images.length,
          keynoteImages: images,
        });
      })().catch((error) => {
        if (cancelled) return;
        const normalizedError = error instanceof Error ? error.message : String(error || "");
        setLoadState({ status: "error", error: normalizedError || "Failed to inspect Keynote preview." });
      });

      return () => {
        cancelled = true;
        for (const url of keynoteObjectUrlsRef.current) {
          URL.revokeObjectURL(url);
        }
        keynoteObjectUrlsRef.current = [];
      };
    }

    setLoadState({ status: "error", error: "Presentation preview is not available for this file type yet." });
    return undefined;
  }, [blob, filename, mimeType, stageWidth]);

  const keynoteImages = loadState.status === "ready" ? loadState.keynoteImages || [] : [];

  return (
    <div ref={shellRef} className="tb-attachment-preview-presentation-shell">
      {loadState.status === "loading" ? (
        <div className="tb-attachment-preview-presentation-state">
          <LucideLoaderCircle className="tb-attachment-preview-presentation-state-icon is-spinning" strokeWidth={1.8} />
          <span>Loading presentation...</span>
        </div>
      ) : null}
      {loadState.status === "error" ? (
        <div className="tb-attachment-preview-presentation-state">
          <LucideFileText className="tb-attachment-preview-presentation-state-icon" strokeWidth={1.8} />
          <span>{loadState.error}</span>
        </div>
      ) : null}
      {isRunnerKeynotePresentationFile(filename, mimeType) && loadState.status === "ready" ? (
        keynoteImages.length > 0 ? (
          <div className="tb-attachment-preview-keynote-list">
            {keynoteImages.map((image, index) => (
              <figure key={`${image.name}:${index}`} className="tb-attachment-preview-keynote-page">
                <img src={image.url} alt={`Keynote slide ${index + 1}`} draggable={false} />
              </figure>
            ))}
          </div>
        ) : (
          <div className="tb-attachment-preview-presentation-state">
            <LucidePresentation className="tb-attachment-preview-presentation-state-icon" strokeWidth={1.8} />
            <span>Keynote preview unavailable. Export this file to PPTX or PDF to preview the slides here.</span>
          </div>
        )
      ) : null}
      <div
        ref={stageRef}
        className={`tb-attachment-preview-presentation-stage${isRunnerPowerPointPresentationFile(filename, mimeType) ? "" : " is-hidden"}`}
        aria-hidden={!isRunnerPowerPointPresentationFile(filename, mimeType)}
      />
    </div>
  );
}
