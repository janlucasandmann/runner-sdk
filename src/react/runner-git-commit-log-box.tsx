import { useState } from "react";
import { Github } from "lucide-react";
import type { RunnerLog } from "../types.js";
import {
  extractGitQuotedArgument,
  formatRunnerUnitCount,
  formatShellCommandForGitParsing,
  getGitCommandOutputText,
  isSuccessfulGitCommandLog,
  parsePositiveInteger,
} from "./runner-git-log-utils.js";
import { LogHeader, LogPanel } from "./runner-log-card.js";
import { stripRunnerSystemTags } from "./runner-markdown.js";

export type GitCommitLogDetails = {
  branch: string | null;
  shortSha: string | null;
  message: string;
  filesChanged: number | null;
  insertions: number;
  deletions: number;
  linesChanged: number;
};

function extractGitCommitMessageFromCommand(command: string): string | null {
  const displayCommand = formatShellCommandForGitParsing(stripRunnerSystemTags(command || ""));
  const quotedMessage = extractGitQuotedArgument(displayCommand, "(?:-m|--message)");
  if (quotedMessage) return quotedMessage;

  const assignedMessageMatch = displayCommand.match(/(?:^|\s)--message=(?:"([^"]*)"|'([^']*)'|(\S+))/i);
  const assignedMessage = assignedMessageMatch?.[1] || assignedMessageMatch?.[2] || assignedMessageMatch?.[3];
  if (assignedMessage?.trim()) return assignedMessage.trim();

  const compactShortMessageMatch = displayCommand.match(/(?:^|\s)-m(?:"([^"]*)"|'([^']*)')/i);
  const compactShortMessage = compactShortMessageMatch?.[1] || compactShortMessageMatch?.[2];
  return compactShortMessage?.trim() || null;
}

export function parseGitCommitLogDetails(log: RunnerLog): GitCommitLogDetails | null {
  if (!isSuccessfulGitCommandLog(log, "commit")) return null;

  const command = log.metadata?.command || log.message || "";
  const output = getGitCommandOutputText(log);
  const commitHeaderMatch = output.match(/^\s*\[([^\]]+)\]\s+(.+?)\s*$/m);
  if (!commitHeaderMatch) return null;

  const bracket = commitHeaderMatch[1] || "";
  const shaMatch = bracket.match(/\b([0-9a-f]{4,40})\b(?!.*\b[0-9a-f]{4,40}\b)/i);
  const shortSha = shaMatch?.[1] || null;
  const branch = shaMatch?.index !== undefined
    ? bracket.slice(0, shaMatch.index).replace(/\s*\([^)]*\)\s*/g, " ").trim() || null
    : bracket.replace(/\s*\([^)]*\)\s*/g, " ").trim() || null;

  const outputMessage = commitHeaderMatch[2]?.trim() || "";
  const message = outputMessage || extractGitCommitMessageFromCommand(command) || "Commit created";
  const statsLine = output.split(/\r?\n/).find((line) => /\bfiles?\s+changed\b/i.test(line));
  const filesChanged = parsePositiveInteger(statsLine?.match(/(\d+)\s+files?\s+changed/i)?.[1] || undefined);
  const insertions = parsePositiveInteger(statsLine?.match(/(\d+)\s+insertions?\(\+\)/i)?.[1] || undefined) ?? 0;
  const deletions = parsePositiveInteger(statsLine?.match(/(\d+)\s+deletions?\(-\)/i)?.[1] || undefined) ?? 0;

  return {
    branch,
    shortSha,
    message,
    filesChanged,
    insertions,
    deletions,
    linesChanged: insertions + deletions,
  };
}

export function GitCommitLogBox({
  details,
  timeLabel,
}: {
  details: GitCommitLogDetails;
  timeLabel?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const totalChangedLabel = `${formatRunnerUnitCount(details.linesChanged, "line")} changed`;
  const fileChangedLabel = details.filesChanged !== null
    ? `${formatRunnerUnitCount(details.filesChanged, "file")} changed`
    : null;
  const commitMeta = [
    details.branch ? `Committed to ${details.branch}` : "Commit created",
    details.shortSha,
  ].filter(Boolean).join(" / ");

  return (
    <div className="tb-log-card tb-log-card-git-commit">
      <LogHeader
        icon={<Github className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Git Commit"
        title={details.message}
        meta={details.shortSha ? <span className="tb-log-card-pill">{details.shortSha}</span> : null}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-git-summary">
          <div className="tb-log-git-overview">
            <div className="tb-log-git-main">
              <span className="tb-log-git-title">{details.message}</span>
              <span className="tb-log-git-meta">{commitMeta}</span>
            </div>
            <div className="tb-log-git-stats" aria-label="Commit statistics">
              <span className="tb-log-git-stat is-total">{totalChangedLabel}</span>
              {fileChangedLabel ? <span className="tb-log-git-stat">{fileChangedLabel}</span> : null}
              {details.insertions > 0 ? <span className="tb-log-git-stat is-added">+{details.insertions.toLocaleString()}</span> : null}
              {details.deletions > 0 ? <span className="tb-log-git-stat is-removed">-{details.deletions.toLocaleString()}</span> : null}
            </div>
          </div>
        </div>
      </LogPanel>
    </div>
  );
}
