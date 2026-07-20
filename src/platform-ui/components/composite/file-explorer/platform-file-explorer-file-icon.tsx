import { Image as ImageIcon } from "lucide-react";

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

const PLATFORM_FOLDER_ICON_URL = new URL(
  "../../thread-components/assets/folder.png",
  import.meta.url,
).toString();
const PLATFORM_TEXT_FILE_ICON_URL = new URL(
  "../../thread-components/assets/txtfile.png",
  import.meta.url,
).toString();

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames
    .map((className) => String(className || "").trim())
    .filter(Boolean)
    .join(" ");
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
