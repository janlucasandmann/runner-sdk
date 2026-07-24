import { describe, expect, it } from "vitest";
import {
  buildSecurityRepositoryOwnerMetadata,
  buildSecurityRepositoryTeamAccessMetadata,
  buildSecurityRepositoryTeamRolePermissionMetadata,
  getSecurityRepositorySharedTeamIds,
  getSecurityRepositoryTeamRolePermissionSet,
  mergeSecurityRepositoryOwnerCandidates,
  normalizeSecurityRepositoryOwnerCandidate,
  normalizeSecurityWorkspaceTeam,
} from "./security-access.js";
import type { SecurityRepository } from "./security-types.js";

function createRepository(
  metadata: Record<string, unknown> | null = null,
): SecurityRepository {
  return {
    id: "security_repository_1",
    githubRepositoryId: "github_repository_1",
    githubInstallationId: "github_installation_1",
    githubNumericRepositoryId: "101",
    githubNumericInstallationId: "201",
    fullName: "acme/security",
    defaultBranch: "main",
    private: true,
    archived: false,
    status: "active",
    currentPolicyVersionId: null,
    currentThreatModelVersionId: null,
    permissionSet: null,
    lastRunId: null,
    lastRunAt: null,
    nextScanAt: null,
    metadata,
    findingCounts: { open: 0, critical: 0, high: 0 },
    lastRunStatus: null,
    lastRunStage: null,
    createdAt: "2026-07-22T08:00:00.000Z",
    updatedAt: "2026-07-22T08:00:00.000Z",
  };
}

describe("security repository team access", () => {
  it("normalizes workspace teams and legacy membership roles", () => {
    expect(
      normalizeSecurityWorkspaceTeam({
        team_id: "team_1",
        displayName: "AppSec",
        membership_role: "develop",
        member_count: 4,
      }),
    ).toMatchObject({
      id: "team_1",
      name: "AppSec",
      roleId: "contributor",
      roleLabel: "Contributor",
      memberCount: 4,
    });
  });

  it("adds and removes team access without dropping unrelated metadata", () => {
    const repository = createRepository({ retained: "value" });
    const addedMetadata = buildSecurityRepositoryTeamAccessMetadata(
      repository,
      "team_1",
      true,
    );
    const addedRepository = { ...repository, metadata: addedMetadata };

    expect(getSecurityRepositorySharedTeamIds(addedRepository)).toEqual([
      "team_1",
    ]);
    expect(addedMetadata.retained).toBe("value");
    expect(addedMetadata.teamRolePermissionSets).toHaveProperty("team_1");

    const removedMetadata = buildSecurityRepositoryTeamAccessMetadata(
      addedRepository,
      "team_1",
      false,
    );
    expect(
      getSecurityRepositorySharedTeamIds({
        ...repository,
        metadata: removedMetadata,
      }),
    ).toEqual([]);
    expect(removedMetadata.retained).toBe("value");
  });

  it("persists role-specific permissions while owner remains full access", () => {
    const repository = createRepository();
    const member = getSecurityRepositoryTeamRolePermissionSet(
      repository,
      "team_1",
      "member",
    );
    const owner = getSecurityRepositoryTeamRolePermissionSet(
      repository,
      "team_1",
      "owner",
    );
    expect(member.actions?.security_repository_run).toMatchObject({
      access: "full_access",
    });
    expect(owner.defaultAccess).toBe("full_access");

    const metadata = buildSecurityRepositoryTeamRolePermissionMetadata(
      repository,
      "team_1",
      "member",
      {
        ...member,
        actions: {
          ...member.actions,
          security_repository_run: {
            ringId: "ring_2",
            access: "no_access",
          },
        },
      },
    );
    const saved = getSecurityRepositoryTeamRolePermissionSet(
      { ...repository, metadata },
      "team_1",
      "member",
    );
    expect(saved.actions?.security_repository_run).toMatchObject({
      access: "no_access",
    });
  });
});

describe("security repository ownership", () => {
  it("normalizes nested team-member profiles and excludes revoked members", () => {
    expect(
      normalizeSecurityRepositoryOwnerCandidate({
        id: "membership_1",
        status: "active",
        user: {
          id: "user_ada",
          displayName: "Ada Lovelace",
          email: "ADA@ACME.TEST",
          photoUrl: "https://example.test/ada.png",
        },
        teamNames: ["AppSec"],
      }),
    ).toMatchObject({
      id: "user_ada",
      userId: "user_ada",
      name: "Ada Lovelace",
      email: "ada@acme.test",
      avatarUrl: "https://example.test/ada.png",
      teamNames: ["AppSec"],
    });
    expect(
      normalizeSecurityRepositoryOwnerCandidate({
        status: "revoked",
        user: { id: "user_removed", name: "Removed member" },
      }),
    ).toBeNull();
  });

  it("merges duplicate owner candidates and preserves all team labels", () => {
    expect(
      mergeSecurityRepositoryOwnerCandidates([
        {
          userId: "user_ada",
          name: "Ada Lovelace",
          teamNames: ["AppSec"],
        },
        {
          user: {
            id: "user_ada",
            email: "ada@acme.test",
            avatarUrl: "https://example.test/ada.png",
          },
          teamNames: ["Platform"],
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        userId: "user_ada",
        name: "Ada Lovelace",
        email: "ada@acme.test",
        avatarUrl: "https://example.test/ada.png",
        teamNames: ["AppSec", "Platform"],
      }),
    ]);
  });

  it("updates owner aliases without dropping repository access metadata", () => {
    const metadata = buildSecurityRepositoryOwnerMetadata(
      createRepository({
        retained: "value",
        sharedTeamIds: ["team_1"],
      }),
      {
        id: "user_grace",
        userId: "user_grace",
        name: "Grace Hopper",
        email: "grace@acme.test",
        avatarUrl: "https://example.test/grace.png",
      },
    );

    expect(metadata).toMatchObject({
      retained: "value",
      sharedTeamIds: ["team_1"],
      owner: {
        type: "user",
        id: "user_grace",
        userId: "user_grace",
        name: "Grace Hopper",
        email: "grace@acme.test",
      },
      ownerId: "user_grace",
      owner_id: "user_grace",
      ownerUserId: "user_grace",
      owner_user_id: "user_grace",
      ownerName: "Grace Hopper",
      owner_name: "Grace Hopper",
      ownerEmail: "grace@acme.test",
      owner_email: "grace@acme.test",
    });
  });
});
