import { Image as ImageIcon } from "../../ui/hugeicons-compat.js";

export type PlatformFileExplorerFileKind =
  | "folder"
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "code"
  | "spreadsheet"
  | "document"
  | "file";

export interface PlatformFileExplorerFileIconProps {
  kind: PlatformFileExplorerFileKind;
  className?: string;
}

export interface PlatformFileExplorerFileDescriptor {
  name?: string;
  filename?: string;
  path?: string;
  mimeType?: string;
  type?: string;
  isFolder?: boolean;
}

// Keep these URLs aligned with the Files page. The platform serves the shared
// artwork from `/img/logos`; resolving the source PNGs relative to the bundled
// module produces a `/dist/...` URL that is not available in the browser.
const PLATFORM_FOLDER_ICON_URL = "/img/logos/folder.png";
const PLATFORM_TEXT_FILE_ICON_URL = "/img/logos/txtfile.png";

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames
    .map((className) => String(className || "").trim())
    .filter(Boolean)
    .join(" ");
}

export function resolvePlatformFileExplorerFileKind(
  file: PlatformFileExplorerFileDescriptor | null | undefined,
): PlatformFileExplorerFileKind {
  if (!file || file.isFolder) return "folder";

  const mimeType = String(file.mimeType || file.type || "").toLowerCase();
  const fileName = String(file.name || file.filename || file.path || "")
    .trim()
    .toLowerCase();
  const extension = fileName.includes(".")
    ? fileName.split(".").pop() || ""
    : "";

  if (
    mimeType.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"].includes(
      extension,
    )
  ) {
    return "image";
  }
  if (
    mimeType.startsWith("video/") ||
    ["mp4", "m4v", "mov", "webm", "mkv"].includes(extension)
  ) {
    return "video";
  }
  if (
    mimeType.startsWith("audio/") ||
    ["mp3", "m4a", "wav", "aac", "flac", "ogg", "opus"].includes(extension)
  ) {
    return "audio";
  }
  if (mimeType === "application/pdf" || extension === "pdf") return "pdf";
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    ["csv", "tsv", "xls", "xlsx", "xlsm", "xlsb", "ods", "numbers"].includes(
      extension,
    )
  ) {
    return "spreadsheet";
  }
  if (
    mimeType.includes("wordprocessing") ||
    mimeType.includes("msword") ||
    mimeType.includes("presentation") ||
    ["doc", "docx", "odt", "rtf", "ppt", "pptx", "pages"].includes(extension)
  ) {
    return "document";
  }
  if (
    mimeType.includes("json") ||
    mimeType.startsWith("text/") ||
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "mjs",
      "cjs",
      "css",
      "html",
      "md",
      "py",
      "rb",
      "go",
      "rs",
      "java",
      "c",
      "cpp",
      "h",
      "hpp",
      "yml",
      "yaml",
      "sh",
      "sql",
      "toml",
      "xml",
    ].includes(extension)
  ) {
    return "code";
  }
  return "file";
}

export function PlatformFileExplorerFileIcon({
  kind,
  className,
}: PlatformFileExplorerFileIconProps) {
  const iconClassName = joinClassNames(
    "platform-file-explorer__file-icon",
    `is-${kind}`,
    className,
  );

  if (kind === "image") {
    return (
      <ImageIcon
        className={iconClassName}
        strokeWidth={1.75}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      className={joinClassNames(iconClassName, "is-asset")}
      src={
        kind === "folder"
          ? PLATFORM_FOLDER_ICON_URL
          : PLATFORM_TEXT_FILE_ICON_URL
      }
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
