import { useState } from "react";
import { Github } from "lucide-react";
import type { RunnerLog } from "../types.js";
import {
  formatRunnerUnitCount,
  getGitCommandOutputText,
  isSuccessfulGitCommandLog,
} from "./runner-git-log-utils.js";
import { LogHeader, LogPanel } from "./runner-log-card.js";

type GitStatusFileCategory = "staged" | "unstaged" | "untracked" | "conflict";

type GitStatusFileEntry = {
  path: string;
  label: string;
  category: GitStatusFileCategory;
  code?: string;
};

export type GitStatusLogDetails = {
  branch: string | null;
  upstreamSummary: string | null;
  clean: boolean;
  stagedCount: number;
  unstagedCount: number;
  untrackedCount: number;
  conflictCount: number;
  totalCount: number;
  files: GitStatusFileEntry[];
};

const GIT_STATUS_FILE_PREVIEW_LIMIT = 8;

function normalizeGitStatusLine(value: string): string {
  return value.replace(/\s+$/g, "");
}

function formatGitStatusSummaryText(details: GitStatusLogDetails): string {
  if (details.clean) return "Working tree clean";
  return `${formatRunnerUnitCount(details.totalCount, "file")} with changes`;
}

function cleanUpstreamSummary(value: string | null): string | null {
  const normalized = value?.trim().replace(/\.$/, "");
  return normalized || null;
}

function parsePorcelainBranchLine(line: string): Pick<GitStatusLogDetails, "branch" | "upstreamSummary"> {
  const payload = line.replace(/^##\s+/, "").trim();
  if (!payload) return { branch: null, upstreamSummary: null };
  if (/^HEAD\b/i.test(payload)) return { branch: "HEAD detached", upstreamSummary: null };

  const noCommitsMatch = payload.match(/^No commits yet on\s+(.+)$/i);
  if (noCommitsMatch?.[1]) {
    return { branch: noCommitsMatch[1].trim(), upstreamSummary: "No commits yet" };
  }

  const statusMatch = payload.match(/\[([^\]]+)\]\s*$/);
  const branchPayload = statusMatch ? payload.slice(0, statusMatch.index).trim() : payload;
  const branch = branchPayload.split("...")[0]?.trim() || branchPayload.trim() || null;
  const upstreamSummary = statusMatch?.[1] ? statusMatch[1].trim() : branchPayload.includes("...") ? `tracking ${branchPayload.split("...")[1]?.trim()}` : null;
  return { branch, upstreamSummary };
}

function describePorcelainStatus(code: string): { label: string; category: GitStatusFileCategory; staged: boolean; unstaged: boolean; untracked: boolean; conflict: boolean } {
  const indexStatus = code[0] || " ";
  const worktreeStatus = code[1] || " ";
  const conflict = code.includes("U") || ["AA", "DD"].includes(code);
  const untracked = code === "??";
  const staged = !untracked && !conflict && indexStatus !== " " && indexStatus !== "!";
  const unstaged = !untracked && !conflict && worktreeStatus !== " " && worktreeStatus !== "!";

  if (conflict) {
    return { label: "conflict", category: "conflict", staged: false, unstaged: false, untracked: false, conflict: true };
  }
  if (untracked) {
    return { label: "untracked", category: "untracked", staged: false, unstaged: false, untracked: true, conflict: false };
  }
  if (staged && unstaged) {
    return { label: "staged + unstaged", category: "staged", staged: true, unstaged: true, untracked: false, conflict: false };
  }
  if (staged) {
    return { label: statusLetterLabel(indexStatus), category: "staged", staged: true, unstaged: false, untracked: false, conflict: false };
  }
  return { label: statusLetterLabel(worktreeStatus), category: "unstaged", staged: false, unstaged: true, untracked: false, conflict: false };
}

function statusLetterLabel(value: string): string {
  switch (value) {
    case "A":
      return "added";
    case "C":
      return "copied";
    case "D":
      return "deleted";
    case "M":
      return "modified";
    case "R":
      return "renamed";
    case "T":
      return "type changed";
    default:
      return "changed";
  }
}

function parsePorcelainGitStatus(output: string): GitStatusLogDetails {
  const lines = output.split(/\r?\n/).map(normalizeGitStatusLine).filter((line) => line.trim().length > 0);
  let branch: string | null = null;
  let upstreamSummary: string | null = null;
  let stagedCount = 0;
  let unstagedCount = 0;
  let untrackedCount = 0;
  let conflictCount = 0;
  const files: GitStatusFileEntry[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      const branchDetails = parsePorcelainBranchLine(line);
      branch = branchDetails.branch;
      upstreamSummary = branchDetails.upstreamSummary;
      continue;
    }
    if (!/^[ MADRCU?!][ MADRCU?!]\s+/.test(line)) continue;

    const code = line.slice(0, 2);
    const path = line.slice(3).trim();
    if (!path) continue;

    const state = describePorcelainStatus(code);
    if (state.staged) stagedCount += 1;
    if (state.unstaged) unstagedCount += 1;
    if (state.untracked) untrackedCount += 1;
    if (state.conflict) conflictCount += 1;
    files.push({
      path,
      label: state.label,
      category: state.category,
      code,
    });
  }

  return {
    branch,
    upstreamSummary,
    clean: files.length === 0,
    stagedCount,
    unstagedCount,
    untrackedCount,
    conflictCount,
    totalCount: files.length,
    files,
  };
}

function parseReadableGitStatus(output: string): GitStatusLogDetails {
  const lines = output.split(/\r?\n/).map(normalizeGitStatusLine);
  let branch: string | null = null;
  let upstreamSummary: string | null = null;
  let section: GitStatusFileCategory | null = null;
  const files: GitStatusFileEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const branchMatch = trimmed.match(/^On branch\s+(.+)$/i);
    if (branchMatch?.[1]) {
      branch = branchMatch[1].trim();
      continue;
    }

    const detachedMatch = trimmed.match(/^HEAD detached (?:at|from)\s+(.+)$/i);
    if (detachedMatch?.[1]) {
      branch = `HEAD detached at ${detachedMatch[1].trim()}`;
      continue;
    }

    if (/^Your branch\b/i.test(trimmed)) {
      upstreamSummary = cleanUpstreamSummary(trimmed);
      continue;
    }

    if (/^Changes to be committed:/i.test(trimmed)) {
      section = "staged";
      continue;
    }
    if (/^Changes not staged for commit:/i.test(trimmed)) {
      section = "unstaged";
      continue;
    }
    if (/^Untracked files:/i.test(trimmed)) {
      section = "untracked";
      continue;
    }
    if (/^Unmerged paths:/i.test(trimmed)) {
      section = "conflict";
      continue;
    }
    if (/^(?:nothing to commit|nothing added|no changes added|no commits yet|all conflicts fixed)/i.test(trimmed)) {
      section = null;
      continue;
    }
    if (!section || trimmed.startsWith("(")) continue;

    if (section === "untracked") {
      files.push({ path: trimmed, label: "untracked", category: "untracked" });
      continue;
    }

    const fileMatch = trimmed.match(/^([^:]+):\s+(.+)$/);
    if (!fileMatch?.[2]) continue;
    const label = section === "conflict" ? "conflict" : fileMatch[1].trim();
    files.push({
      path: fileMatch[2].trim(),
      label,
      category: section,
    });
  }

  const stagedCount = files.filter((file) => file.category === "staged").length;
  const unstagedCount = files.filter((file) => file.category === "unstaged").length;
  const untrackedCount = files.filter((file) => file.category === "untracked").length;
  const conflictCount = files.filter((file) => file.category === "conflict").length;

  return {
    branch,
    upstreamSummary,
    clean: files.length === 0,
    stagedCount,
    unstagedCount,
    untrackedCount,
    conflictCount,
    totalCount: files.length,
    files,
  };
}

function looksLikePorcelainGitStatus(output: string): boolean {
  return output
    .split(/\r?\n/)
    .some((line) => /^##\s+/.test(line) || /^[ MADRCU?!][ MADRCU?!]\s+/.test(line));
}

function looksLikeReadableGitStatus(output: string): boolean {
  return output
    .split(/\r?\n/)
    .some((line) =>
      /^(?:On branch|HEAD detached|Your branch|Changes to be committed:|Changes not staged for commit:|Untracked files:|Unmerged paths:|nothing to commit|nothing added|no changes added|no commits yet)/i.test(line.trim())
    );
}

export function parseGitStatusLogDetails(log: RunnerLog): GitStatusLogDetails | null {
  if (!isSuccessfulGitCommandLog(log, "status")) return null;

  const output = getGitCommandOutputText(log);
  if (!output.trim()) {
    return {
      branch: null,
      upstreamSummary: null,
      clean: true,
      stagedCount: 0,
      unstagedCount: 0,
      untrackedCount: 0,
      conflictCount: 0,
      totalCount: 0,
      files: [],
    };
  }

  if (looksLikePorcelainGitStatus(output)) return parsePorcelainGitStatus(output);
  if (looksLikeReadableGitStatus(output)) return parseReadableGitStatus(output);
  return null;
}

export function GitStatusLogBox({
  details,
  timeLabel,
}: {
  details: GitStatusLogDetails;
  timeLabel?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const statusText = formatGitStatusSummaryText(details);
  const visibleFiles = details.files.slice(0, GIT_STATUS_FILE_PREVIEW_LIMIT);
  const hiddenFileCount = Math.max(0, details.files.length - visibleFiles.length);
  const metaText = [
    details.branch ? `On ${details.branch}` : "Repository status",
    details.upstreamSummary,
  ].filter(Boolean).join(" / ");

  return (
    <div className="tb-log-card tb-log-card-git-status">
      <LogHeader
        icon={<Github className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Git Status"
        title={details.branch || statusText}
        meta={<span className={`tb-log-card-pill ${details.clean ? "" : "is-dirty"}`.trim()}>{details.clean ? "clean" : `${details.totalCount} files`}</span>}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-git-summary">
          <div className="tb-log-git-overview">
            <div className="tb-log-git-main">
              <span className="tb-log-git-title">{statusText}</span>
              <span className="tb-log-git-meta">{metaText}</span>
            </div>
            <div className="tb-log-git-stats" aria-label="Working tree statistics">
              {details.clean ? <span className="tb-log-git-stat is-clean">clean</span> : null}
              {details.stagedCount > 0 ? <span className="tb-log-git-stat is-added">{details.stagedCount.toLocaleString()} staged</span> : null}
              {details.unstagedCount > 0 ? <span className="tb-log-git-stat is-total">{details.unstagedCount.toLocaleString()} unstaged</span> : null}
              {details.untrackedCount > 0 ? <span className="tb-log-git-stat is-untracked">{details.untrackedCount.toLocaleString()} untracked</span> : null}
              {details.conflictCount > 0 ? <span className="tb-log-git-stat is-removed">{details.conflictCount.toLocaleString()} conflicts</span> : null}
            </div>
          </div>
          {visibleFiles.length > 0 ? (
            <div className="tb-log-git-status-files">
              {visibleFiles.map((file, index) => (
                <div className="tb-log-git-status-file" key={`${file.category}-${file.path}-${index}`}>
                  <span className={`tb-log-git-status-file-state is-${file.category}`.trim()}>{file.label}</span>
                  <span className="tb-log-git-status-file-path">{file.path}</span>
                </div>
              ))}
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
