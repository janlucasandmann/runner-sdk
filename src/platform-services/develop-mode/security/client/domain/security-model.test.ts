import { describe, expect, it } from "vitest";

import { getSecuritySeverityRank, readSecurityWorkspaceRoute } from "./security-model.js";

describe("security workspace model", () => {
  it("restores the most specific deep link", () => {
    expect(readSecurityWorkspaceRoute("?security_repository=repo_1")).toEqual({ kind: "repository", id: "repo_1" });
    expect(readSecurityWorkspaceRoute("?security_repository=repo_1&security_run=run_1")).toEqual({ kind: "run", id: "run_1" });
    expect(readSecurityWorkspaceRoute("?security_repository=repo_1&security_run=run_1&security_finding=finding_1"))
      .toEqual({ kind: "finding", id: "finding_1" });
    expect(readSecurityWorkspaceRoute("?unrelated=1")).toEqual({ kind: "overview" });
  });

  it("orders severities for posture sorting", () => {
    expect(["low", "critical", "informational", "high", "medium"]
      .sort((left, right) => getSecuritySeverityRank(right as never) - getSecuritySeverityRank(left as never)))
      .toEqual(["critical", "high", "medium", "low", "informational"]);
  });
});

