import type { ReactNode } from "react";
import {
  FileResourceDetailPage,
  type FileResourceDetailPageProps,
} from "./file-resource-detail-page.js";

export interface MarkdownResourceDetailPageProps
  extends Omit<FileResourceDetailPageProps, "activeTab" | "settings" | "code"> {
  code: ReactNode;
  settings?: ReactNode;
  activeTab?: "code" | "settings";
}

/** Shared detail shell for resources whose primary content is a Markdown editor. */
export function MarkdownResourceDetailPage({
  activeTab = "code",
  settings = null,
  code,
  ...props
}: MarkdownResourceDetailPageProps) {
  return (
    <FileResourceDetailPage
      {...props}
      activeTab={activeTab}
      code={code}
      settings={settings}
    />
  );
}
