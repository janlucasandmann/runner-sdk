import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CompactActionLogLine } from "./compact-action-log-line.js";

function normalizeBaseUrl(value?: string): string {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

function readProjectName(value: unknown, projectId: string): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const source = value as Record<string, unknown>;
  const project =
    source.project &&
    typeof source.project === "object" &&
    !Array.isArray(source.project)
      ? (source.project as Record<string, unknown>)
      : source.data &&
          typeof source.data === "object" &&
          !Array.isArray(source.data)
        ? (source.data as Record<string, unknown>)
        : source;
  const candidateId = String(
    project.id || project.projectId || project.project_id || "",
  ).trim();
  if (candidateId && candidateId !== projectId) return "";
  return typeof project.name === "string"
    ? project.name.trim()
    : typeof project.title === "string"
      ? project.title.trim()
      : "";
}

function findAvailableProjectName(
  availableProjects: readonly unknown[] | undefined,
  projectId: string,
): string {
  for (const value of availableProjects || []) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const project = value as Record<string, unknown>;
    const candidateId = String(
      project.id || project.projectId || project.project_id || "",
    ).trim();
    if (candidateId !== projectId) continue;
    const name =
      typeof project.name === "string" ? project.name : project.title;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return "";
}

export interface ProjectScopedListActivityLogBoxProps {
  projectId: string;
  projectName: string;
  titlePrefix: string;
  icon: ReactNode;
  iconVariant: "task" | "milestone";
  backendUrl?: string;
  requestHeaders?: HeadersInit;
  availableProjects?: readonly unknown[];
  onProjectPreviewClick?: (project: {
    projectId: string;
    projectName?: string;
  }) => void;
}

export function ProjectScopedListActivityLogBox({
  projectId,
  projectName,
  titlePrefix,
  icon,
  iconVariant,
  backendUrl,
  requestHeaders,
  availableProjects,
  onProjectPreviewClick,
}: ProjectScopedListActivityLogBoxProps) {
  const availableName = useMemo(
    () => findAvailableProjectName(availableProjects, projectId),
    [availableProjects, projectId],
  );
  const [resolvedName, setResolvedName] = useState(
    projectName || availableName,
  );
  const requestHeadersRef = useRef(requestHeaders);
  requestHeadersRef.current = requestHeaders;

  useEffect(() => {
    const immediateName = projectName || availableName;
    setResolvedName(immediateName);
    const baseUrl = normalizeBaseUrl(backendUrl);
    if (immediateName || !baseUrl || !projectId) return undefined;

    const controller = new AbortController();
    void fetch(`${baseUrl}/projects/${encodeURIComponent(projectId)}`, {
      credentials: "include",
      cache: "no-store",
      headers: requestHeadersRef.current,
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const nextName = readProjectName(payload, projectId);
        if (nextName) setResolvedName(nextName);
      })
      .catch((error) => {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "AbortError"
        )
          return;
      });

    return () => controller.abort();
  }, [availableName, backendUrl, projectId, projectName]);

  const displayName = resolvedName || projectName || projectId;
  return (
    <CompactActionLogLine
      className="is-project-scoped-list"
      icon={
        <span className={`tb-log-project-resource-icon is-${iconVariant}`}>
          {icon}
        </span>
      }
      title={`${titlePrefix} ${displayName}`}
      ariaLabel={`Open project ${displayName}`}
      onClick={
        onProjectPreviewClick
          ? () =>
              onProjectPreviewClick({
                projectId,
                projectName: resolvedName || projectName || undefined,
              })
          : null
      }
    />
  );
}
