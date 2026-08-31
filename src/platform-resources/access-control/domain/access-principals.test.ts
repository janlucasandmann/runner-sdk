import { describe, expect, it } from "vitest";
import {
  PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
  PLATFORM_ALL_AGENTS_PROFILE_IMAGE_URL,
  PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
  buildPlatformSystemPrincipalPermissionMetadata,
  buildPlatformSystemPrincipalRolePermissionMetadata,
  createPlatformSystemAccessPrincipalRows,
  getPlatformAccessPrincipalProfileImageUrl,
  getPlatformSharedTeamIds,
  getPlatformSystemPrincipalPermissionSet,
  getPlatformSystemPrincipalRolePermissionSet,
  isPlatformRoleScopedSystemAccessPrincipalId,
  normalizePlatformAccessPrincipalId,
  composePlatformAccessPrincipalRows,
} from "./access-principals.js";

describe("platform access principals", () => {
  it("normalizes legacy principal aliases", () => {
    expect(normalizePlatformAccessPrincipalId("all-agents")).toBe(
      PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
    );
    expect(normalizePlatformAccessPrincipalId("system:all-organization-members")).toBe(
      PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
    );
  });

  it("always composes both immutable system principals", () => {
    expect(createPlatformSystemAccessPrincipalRows()).toEqual([
      expect.objectContaining({ id: PLATFORM_ALL_AGENTS_PRINCIPAL_ID, locked: true }),
      expect.objectContaining({
        id: PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
        locked: true,
      }),
    ]);
  });

  it("assigns the optimized All Agents image to the shared system team", () => {
    expect(createPlatformSystemAccessPrincipalRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
          profileImageUrl: PLATFORM_ALL_AGENTS_PROFILE_IMAGE_URL,
        }),
        expect.objectContaining({
          id: PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
          profileImageUrl: PLATFORM_ALL_AGENTS_PROFILE_IMAGE_URL,
        }),
      ]),
    );
  });

  it("uses full access for organization members until an explicit policy is saved", () => {
    const permissionSet = getPlatformSystemPrincipalPermissionSet(
      {},
      PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
      "function",
    );

    expect(permissionSet.rings?.ring_1).toEqual({ defaultAccess: "full_access" });
    expect(permissionSet.rings?.ring_2).toEqual({ defaultAccess: "full_access" });
    expect(permissionSet.rings?.ring_3).toEqual({ defaultAccess: "full_access" });
  });

  it("writes a versioned organization-member policy without replacing unrelated metadata", () => {
    const metadata = buildPlatformSystemPrincipalPermissionMetadata(
      { ownerUserId: "user_1", sharedTeamIds: ["team_1"] },
      PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
      {
        version: 1,
        subjectType: "function",
        defaultAccess: "read_only",
      },
      "function",
    );

    expect(metadata.ownerUserId).toBe("user_1");
    expect(metadata.accessControl).toEqual(
      expect.objectContaining({
        version: 1,
        systemPrincipalPermissionSets: expect.objectContaining({
          [PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID]: expect.objectContaining({
            subjectType: "function",
            defaultAccess: "read_only",
          }),
        }),
      }),
    );
    expect(metadata.organizationMemberPermissionSet).toBeTruthy();
  });

  it("persists role-specific organization-member policies", () => {
    const metadata = buildPlatformSystemPrincipalRolePermissionMetadata(
      { ownerUserId: "user_1" },
      PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
      "contributor",
      {
        version: 1,
        subjectType: "agent_team_role",
        defaultAccess: "read_only",
      },
      "agent_team_role",
    );

    expect(
      getPlatformSystemPrincipalRolePermissionSet(
        metadata,
        PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
        "contributor",
        "agent_team_role",
      ),
    ).toEqual(
      expect.objectContaining({
        subjectType: "agent_team_role",
        defaultAccess: "read_only",
      }),
    );
    expect(metadata.ownerUserId).toBe("user_1");
    expect(metadata.accessControl).toEqual(
      expect.objectContaining({
        version: 1,
        systemPrincipalRolePermissionSets: expect.objectContaining({
          [PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID]:
            expect.objectContaining({
              contributor: expect.objectContaining({
                subjectType: "agent_team_role",
                defaultAccess: "read_only",
              }),
            }),
        }),
      }),
    );
  });

  it("only treats organization members as a role-scoped system principal", () => {
    expect(
      isPlatformRoleScopedSystemAccessPrincipalId(
        PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
      ),
    ).toBe(true);
    expect(
      isPlatformRoleScopedSystemAccessPrincipalId(
        PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
      ),
    ).toBe(false);
  });

  it("keeps physical team IDs separate from system principals", () => {
    expect(
      getPlatformSharedTeamIds({
        sharedTeamIds: ["team_1", "all-agents", "all_organization_members"],
        teamPermissionSets: { team_2: {}, "system:all-agents": {} },
      }),
    ).toEqual(["team_1", "team_2"]);
  });

  it("normalizes team profile images from direct and nested metadata fields", () => {
    expect(
      getPlatformAccessPrincipalProfileImageUrl({
        metadata: { profile: { photoURL: "/img/teams/platform.webp" } },
      }),
    ).toBe("/img/teams/platform.webp");
    expect(
      getPlatformAccessPrincipalProfileImageUrl({
        profileImageUrl: "/img/teams/direct.webp",
        metadata: { profileImageUrl: "/img/teams/nested.webp" },
      }),
    ).toBe("/img/teams/direct.webp");
  });

  it("canonicalizes physical teams and removes system aliases and duplicates", () => {
    expect(
      composePlatformAccessPrincipalRows([
        { id: " team_1 ", name: "Core", kind: "system" as const },
        { id: "team_1", name: "Duplicate", kind: "team" as const },
        {
          id: "system:all-organization-members",
          name: "Legacy",
          kind: "team" as const,
        },
      ]),
    ).toEqual([
      expect.objectContaining({ id: PLATFORM_ALL_AGENTS_PRINCIPAL_ID, kind: "system" }),
      expect.objectContaining({
        id: PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
        kind: "system",
      }),
      expect.objectContaining({ id: "team_1", name: "Core", kind: "team" }),
    ]);
  });
});
