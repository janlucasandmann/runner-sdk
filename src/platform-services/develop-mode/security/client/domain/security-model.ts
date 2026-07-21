import type { SecuritySeverity, SecurityWorkspaceRoute } from "./security-types.js";

export function formatSecurityTimestamp(value: string | null | undefined, fallback = "—"): string {
  const timestamp = Date.parse(String(value || ""));
  if (!Number.isFinite(timestamp)) return fallback;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(timestamp);
}

export function formatSecurityAction(value: string): string {
  return String(value || "")
    .replace(/^security\./, "")
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getSecuritySeverityRank(severity: SecuritySeverity): number {
  return { critical: 5, high: 4, medium: 3, low: 2, informational: 1 }[severity];
}

export function readSecurityWorkspaceRoute(search = globalThis.location?.search || ""): SecurityWorkspaceRoute {
  const params = new URLSearchParams(search);
  const findingId = params.get("security_finding")?.trim();
  if (findingId) return { kind: "finding", id: findingId };
  const runId = params.get("security_run")?.trim();
  if (runId) return { kind: "run", id: runId };
  const repositoryId = params.get("security_repository")?.trim();
  if (repositoryId) return { kind: "repository", id: repositoryId };
  return { kind: "overview" };
}

export function writeSecurityWorkspaceRoute(route: SecurityWorkspaceRoute, mode: "push" | "replace" = "push"): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const key of ["security_repository", "security_run", "security_finding"]) url.searchParams.delete(key);
  if (route.kind === "repository") url.searchParams.set("security_repository", route.id);
  if (route.kind === "run") url.searchParams.set("security_run", route.id);
  if (route.kind === "finding") url.searchParams.set("security_finding", route.id);
  window.history[mode === "replace" ? "replaceState" : "pushState"](
    { ...window.history.state, developSecurityRoute: route },
    "",
    url,
  );
}

