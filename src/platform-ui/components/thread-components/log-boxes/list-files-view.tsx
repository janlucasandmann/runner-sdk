import { FolderOpen } from "lucide-react";
import type { RunnerPreviewAttachment } from "../../../../react/runner-document-preview.js";
import type { RunnerLog } from "../../../../types.js";
import { CompactActionLogLine } from "./compact-action-log-line.js";
import {
  buildListFilesPreviewAttachment,
  extractListFilesDirectoryPath,
  getListFileCountLabel,
  parseListFilesOutput,
} from "./list-files-state.js";
import { resolveCommandOutputText } from "./structured-command-output.js";

interface ListFilesLogBoxProps {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onWorkspacePathClick?: (path: string) => void;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}

export function ListFilesLogBox({
  log,
  backendUrl,
  environmentId,
  onPreviewDocument,
}: ListFilesLogBoxProps) {
  const compactCommand = log.metadata?.command || "";
  const compactOutput = resolveCommandOutputText(log.metadata?.output, "stdout");
  const compactDirectoryPath = extractListFilesDirectoryPath(compactCommand);
  const compactItems = parseListFilesOutput(compactOutput);
  const compactIsError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  if (!compactIsError && compactItems.length === 0) {
    return null;
  }
  return (
    <CompactActionLogLine
      icon={<FolderOpen className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="List Files"
      detail={
        compactIsError
          ? "failed"
          : compactDirectoryPath || getListFileCountLabel(compactItems.length)
      }
      onClick={
        !compactIsError && onPreviewDocument
          ? () =>
              onPreviewDocument(
                buildListFilesPreviewAttachment(compactDirectoryPath, backendUrl, environmentId),
              )
          : undefined
      }
    />
  );
}
