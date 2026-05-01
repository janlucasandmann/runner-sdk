import { useState } from "react";
import { Github } from "lucide-react";
import type { RunnerLog } from "../types.js";
import {
  formatRunnerUnitCount,
  formatShellCommandForGitParsing,
  getGitCommandOutputText,
  isSuccessfulGitCommandLog,
  parsePositiveInteger,
} from "./runner-git-log-utils.js";
import { LogHeader, LogPanel } from "./runner-log-card.js";
import { stripRunnerSystemTags } from "./runner-markdown.js";

type GitDiffFileEntry = {
  path: string;
  linesChanged: number | null;
  graph: string;
  additionsWeight: number;
  deletionsWeight: number;
};

export type GitDiffLogDetails = {
  scope: "staged" | "working" | "diff";
  filesChanged: number;
  insertions: number;
  deletions: number;
  linesChanged: number;
  files: GitDiffFileEntry[];
};

const GIT_DIFF_FILE_PREVIEW_LIMIT = 8;

function commandDiffScope(command: string): GitDiffLogDetails["scope"] {
  const normalized = formatShellCommandForGitParsing(stripRunnerSystemTags(command || ""));
  if (/(?:^|\s)--(?:cached|staged)\b/i.test(normalized)) {
    return "staged";
  }
  if (/\bgit\s+diff\b/i.test(normalized)) {
    return "working";
  }
  return "diff";
}

function parseGitDiffStatLine(line: string): GitDiffFileEntry | null {
  const match = line.match(/^\s*(.+?)\s+\|\s+(\d+)(?:\s+([+\-]+))?\s*$/);
  if (!match?.[1]) return null;

  const path = match[1].trim();
  if (!path || /\bfiles?\s+changed\b/i.test(path)) {
    return null;
  }

  const graph = match[3] || "";
  const additionsWeight = (graph.match(/\+/g) || []).length;
  const deletionsWeight = (graph.match(/-/g) || []).length;

  return {
    path,
    linesChanged: parsePositiveInteger(match[2] || undefined),
    graph,
    additionsWeight,
    deletionsWeight,
  };
}

function parseGitDiffSummaryLine(line: string): Pick<GitDiffLogDetails, "filesChanged" | "insertions" | "deletions"> | null {
  if (!/\bfiles?\s+changed\b/i.test(line)) {
    return null;
  }
  return {
    filesChanged: parsePositiveInteger(line.match(/(\d+)\s+files?\s+changed/i)?.[1] || undefined) ?? 0,
    insertions: parsePositiveInteger(line.match(/(\d+)\s+insertions?\(\+\)/i)?.[1] || undefined) ?? 0,
    deletions: parsePositiveInteger(line.match(/(\d+)\s+deletions?\(-\)/i)?.[1] || undefined) ?? 0,
  };
}

export function parseGitDiffLogDetails(log: RunnerLog): GitDiffLogDetails | null {
  if (!isSuccessfulGitCommandLog(log, "diff")) return null;

  const output = getGitCommandOutputText(log);
  const lines = output.split(/\r?\n/).map((line) => line.trimEnd()).filter((line) => line.trim().length > 0);
  const files = lines.map(parseGitDiffStatLine).filter((entry): entry is GitDiffFileEntry => Boolean(entry));
  const summary = lines.map(parseGitDiffSummaryLine).find((entry): entry is NonNullable<ReturnType<typeof parseGitDiffSummaryLine>> => Boolean(entry));

  if (!summary && files.length === 0) {
    return null;
  }

  const filesChanged = summary?.filesChanged ?? files.length;
  const insertions = summary?.insertions ?? 0;
  const deletions = summary?.deletions ?? 0;

  return {
    scope: commandDiffScope(String(log.metadata?.command || log.message || "")),
    filesChanged,
    insertions,
    deletions,
    linesChanged: insertions + deletions,
    files,
  };
}

function formatGitDiffScope(scope: GitDiffLogDetails["scope"]): string {
  if (scope === "staged") return "Prepared changes";
  if (scope === "working") return "Working changes";
  return "Git changes";
}

function gitDiffFileChangeLabel(file: GitDiffFileEntry): string {
  if (file.linesChanged !== null) {
    return formatRunnerUnitCount(file.linesChanged, "line");
  }
  return "changed";
}

export function GitDiffLogBox({
  details,
  timeLabel,
}: {
  details: GitDiffLogDetails;
  timeLabel?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const visibleFiles = details.files.slice(0, GIT_DIFF_FILE_PREVIEW_LIMIT);
  const hiddenFileCount = Math.max(0, details.files.length - visibleFiles.length);
  const title = formatGitDiffScope(details.scope);
  const changedLabel = `${formatRunnerUnitCount(details.filesChanged, "file")} changed`;

  return (
    <div className="tb-log-card tb-log-card-git-diff">
      <LogHeader
        icon={<Github className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Git Diff"
        title={title}
        meta={<span className="tb-log-card-pill">{changedLabel}</span>}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-git-summary">
          <div className="tb-log-git-overview">
            <div className="tb-log-git-main">
              <span className="tb-log-git-title">{title}</span>
              <span className="tb-log-git-meta">{changedLabel}</span>
            </div>
            <div className="tb-log-git-stats" aria-label="Git diff statistics">
              {details.linesChanged > 0 ? <span className="tb-log-git-stat is-total">{formatRunnerUnitCount(details.linesChanged, "line")}</span> : null}
              {details.insertions > 0 ? <span className="tb-log-git-stat is-added">+{details.insertions.toLocaleString()}</span> : null}
              {details.deletions > 0 ? <span className="tb-log-git-stat is-removed">-{details.deletions.toLocaleString()}</span> : null}
            </div>
          </div>
          {visibleFiles.length > 0 ? (
            <div className="tb-log-git-diff-files">
              {visibleFiles.map((file, index) => {
                const totalWeight = Math.max(1, file.additionsWeight + file.deletionsWeight);
                const additionsPercent = Math.max(0, Math.min(100, (file.additionsWeight / totalWeight) * 100));
                const deletionsPercent = Math.max(0, Math.min(100, (file.deletionsWeight / totalWeight) * 100));
                return (
                  <div className="tb-log-git-diff-file" key={`${file.path}-${index}`}>
                    <div className="tb-log-git-diff-file-main">
                      <span className="tb-log-git-status-file-path">{file.path}</span>
                      <span className="tb-log-git-diff-file-count">{gitDiffFileChangeLabel(file)}</span>
                    </div>
                    <div className="tb-log-git-diff-file-bar" aria-hidden="true">
                      {additionsPercent > 0 ? <span className="tb-log-git-diff-file-bar-added" style={{ width: `${additionsPercent}%` }} /> : null}
                      {deletionsPercent > 0 ? <span className="tb-log-git-diff-file-bar-removed" style={{ width: `${deletionsPercent}%` }} /> : null}
                    </div>
                  </div>
                );
              })}
              {hiddenFileCount > 0 ? (
                <div className="tb-log-git-status-file-more">{formatRunnerUnitCount(hiddenFileCount, "more file")}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </LogPanel>
    </div>
  );
}
