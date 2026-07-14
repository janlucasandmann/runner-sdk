import { createTeamMemberProfileLookupHandler } from "./member-profiles.mjs";

const TEAM_MEMBER_PROFILE_LOOKUP_PATH = "/api/real/team-member-profiles/lookup";
const TEAMS_PROXY_METHODS = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);
const TEAMS_PROXY_PATH_PATTERN = /^\/api\/real\/teams(?:\/(.*))?$/;

function assertAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Teams service requires the ${name} adapter.`);
  }
}

function buildTeamsUpstreamPath(match) {
  const suffix = match?.[1]
    ? "/" + match[1]
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/")
    : "";
  return "/teams" + suffix;
}

/** Creates the Teams API and member-profile proxy service from host transport adapters. */
export function createTeamsService(adapters = {}) {
  [
    "extractIdToken",
    "fetchUpstreamJsonForProxyExactPath",
    "hasAiosSession",
    "proxyUpstreamGet",
    "proxyUpstreamJsonRequest",
    "readOptionalApiKey",
    "readRequestBody",
    "sendJson",
  ].forEach((name) => assertAdapter(adapters, name));

  const runtimeAdapters = Object.freeze({
    ...adapters,
    fetchImpl: typeof adapters.fetchImpl === "function" ? adapters.fetchImpl : globalThis.fetch,
    firebaseRestApiKey: String(adapters.firebaseRestApiKey || "").trim(),
  });
  if (typeof runtimeAdapters.fetchImpl !== "function") {
    throw new TypeError("Teams service requires a fetch implementation.");
  }
  const handleTeamMemberProfileLookup = createTeamMemberProfileLookupHandler(runtimeAdapters);

  return Object.freeze({
    handleRequest(req, res, url) {
      if (req.method === "POST" && url.pathname === TEAM_MEMBER_PROFILE_LOOKUP_PATH) {
        void handleTeamMemberProfileLookup(req, res);
        return true;
      }

      const teamsProxyMatch = url.pathname.match(TEAMS_PROXY_PATH_PATTERN);
      if (!teamsProxyMatch || !TEAMS_PROXY_METHODS.has(req.method || "")) {
        return false;
      }
      const upstreamPath = buildTeamsUpstreamPath(teamsProxyMatch);
      if (req.method === "GET") {
        void adapters.proxyUpstreamGet(req, res, upstreamPath + (url.search || ""));
      } else {
        void adapters.proxyUpstreamJsonRequest(req, res, upstreamPath, req.method);
      }
      return true;
    },
  });
}
