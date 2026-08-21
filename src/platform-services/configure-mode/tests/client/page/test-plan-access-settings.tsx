import { useMemo, useState } from "react";
import {
  PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
  PlatformResourceAccessSettings,
  buildPlatformSystemPrincipalPermissionMetadata,
  buildPlatformSystemPrincipalRolePermissionMetadata,
  buildPlatformTeamAccessMetadata,
  buildPlatformTeamRolePermissionMetadata,
  getPlatformSharedTeamIds,
  getPlatformSystemPrincipalPermissionSet,
  getPlatformSystemPrincipalRolePermissionSet,
  getPlatformTeamRolePermissionSet,
  isPlatformRoleScopedSystemAccessPrincipalId,
  isPlatformSystemAccessPrincipalId,
  type PlatformAccessPrincipal,
} from "../../../../../platform-resources/access-control/index.js";
import type { PlatformPermissionSet } from "../../../../../platform-ui/pages/permissions/index.js";
import type { TestsApi } from "../api/index.js";
import type { TestPlan } from "../domain/index.js";

export interface TestAccessTeam extends PlatformAccessPrincipal {
  roleId: string;
}

interface TestPlanAccessSettingsProps {
  plan: TestPlan;
  api: TestsApi;
  workspaceTeams?: readonly unknown[];
  onPlanChange: (plan: TestPlan) => void;
  onPermissionDetailOpenChange?: (open: boolean) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeTestAccessTeam(value: unknown): TestAccessTeam | null {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const profile = asRecord(metadata.profile);
  const id = String(source.id || source.teamId || source.team_id || "").trim();
  if (!id) return null;
  const name = String(source.name || source.title || source.label || "Team").trim();
  const rawRoleId = String(
    source.roleId
    || source.role
    || source.memberRole
    || source.member_role
    || source.membershipRole
    || source.membership_role
    || source.currentUserRole
    || source.current_user_role
    || source.viewerRole
    || source.viewer_role
    || source.myRole
    || source.my_role
    || "admin",
  ).trim().toLowerCase();
  const roleId = ({
    administrator: "admin",
    manage: "admin",
  } as Record<string, string>)[rawRoleId] || rawRoleId;
  return {
    id,
    name,
    kind: "team",
    description: String(source.description || "").trim(),
    roleId,
    roleLabel: String(
      source.roleLabel
      || source.role_label
      || (roleId ? roleId.charAt(0).toUpperCase() + roleId.slice(1) : "Team"),
    ).trim(),
    createdAt: String(source.createdAt || source.created_at || "").trim(),
    profileImageUrl: String(
      source.profileImageUrl
      || source.profile_image_url
      || source.avatarUrl
      || source.avatar_url
      || source.imageUrl
      || source.image_url
      || source.photoURL
      || source.photoUrl
      || profile.photoURL
      || profile.photoUrl
      || profile.imageUrl
      || profile.image_url
      || metadata.profileImageUrl
      || metadata.profile_image_url
      || metadata.avatarUrl
      || metadata.avatar_url
      || "",
    ).trim(),
  };
}

export function TestPlanAccessSettings({
  plan,
  api,
  workspaceTeams = [],
  onPlanChange,
  onPermissionDetailOpenChange,
}: TestPlanAccessSettingsProps) {
  const [selectedPrincipalId, setSelectedPrincipalId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const metadata = asRecord(plan.metadata);
  const sharedTeamIds = useMemo(
    () => new Set(getPlatformSharedTeamIds(metadata)),
    [metadata],
  );
  const allTeams = useMemo(
    () => workspaceTeams
      .map(normalizeTestAccessTeam)
      .filter((team): team is TestAccessTeam => Boolean(team)),
    [workspaceTeams],
  );
  const sharedTeams = useMemo(
    () => allTeams.filter((team) => sharedTeamIds.has(team.id)),
    [allTeams, sharedTeamIds],
  );
  const availableTeams = useMemo(
    () => allTeams.filter((team) => (
      !sharedTeamIds.has(team.id)
      && ["admin", "owner"].includes(team.roleId)
    )),
    [allTeams, sharedTeamIds],
  );
  const selectedTeam = isPlatformSystemAccessPrincipalId(selectedPrincipalId)
    ? null
    : sharedTeams.find((team) => team.id === selectedPrincipalId) || null;
  const systemPrincipalId = isPlatformSystemAccessPrincipalId(selectedPrincipalId)
    ? selectedPrincipalId
    : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;

  async function persistMetadata(nextMetadata: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const updated = await api.updatePlan(plan.id, { metadata: nextMetadata } as Partial<TestPlan>);
      onPlanChange({
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to update access.");
    } finally {
      setBusy(false);
    }
  }

  async function addTeam(teamId: string) {
    const team = availableTeams.find((candidate) => candidate.id === teamId);
    if (!team || busy) return;
    setBusy(true);
    setError("");
    let createdShareId = "";
    try {
      const withTeam = buildPlatformTeamAccessMetadata(
        metadata,
        team.id,
        true,
        "test_plan_team_role",
      );
      const share = await api.addTeamShare(team.id, plan.id, {
        permissionSets: asRecord(withTeam.teamRolePermissionSets)[team.id] || {},
      });
      createdShareId = String(share.id || "").trim();
      const currentShareIds = asRecord(metadata.teamAccessShareIds);
      const nextMetadata = {
        ...withTeam,
        teamAccessShareIds: {
          ...currentShareIds,
          [team.id]: createdShareId,
        },
      };
      const updated = await api.updatePlan(plan.id, { metadata: nextMetadata } as Partial<TestPlan>);
      onPlanChange({
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      });
    } catch (nextError) {
      if (createdShareId) {
        await api.removeTeamShare(team.id, createdShareId).catch(() => undefined);
      }
      setError(nextError instanceof Error ? nextError.message : "Failed to grant team access.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTeams(teams: readonly TestAccessTeam[]) {
    if (busy || teams.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const shareIds = asRecord(metadata.teamAccessShareIds);
      await Promise.all(teams.map(async (team) => {
        const shareId = String(shareIds[team.id] || "").trim();
        if (shareId) await api.removeTeamShare(team.id, shareId);
      }));
      let nextMetadata = { ...metadata };
      for (const team of teams) {
        nextMetadata = buildPlatformTeamAccessMetadata(
          nextMetadata,
          team.id,
          false,
          "test_plan_team_role",
        );
      }
      const nextShareIds = { ...shareIds };
      teams.forEach((team) => delete nextShareIds[team.id]);
      nextMetadata.teamAccessShareIds = nextShareIds;
      const updated = await api.updatePlan(plan.id, { metadata: nextMetadata } as Partial<TestPlan>);
      onPlanChange({
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      });
      setSelectedPrincipalId("");
      onPermissionDetailOpenChange?.(false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to remove team access.");
    } finally {
      setBusy(false);
    }
  }

  const systemPermissionSet = getPlatformSystemPrincipalPermissionSet(
    metadata,
    systemPrincipalId,
    "test_plan",
  );
  const systemRolePermissionSet = getPlatformSystemPrincipalRolePermissionSet(
    metadata,
    systemPrincipalId,
    selectedRoleId,
    "test_plan_team_role",
  );
  const teamPermissionSet = selectedTeam
    ? getPlatformTeamRolePermissionSet(
        metadata,
        selectedTeam.id,
        selectedRoleId,
        "test_plan_team_role",
      )
    : null;

  return (
    <PlatformResourceAccessSettings<TestAccessTeam>
      teams={sharedTeams}
      resourceLabel="Test Plan"
      selectedPrincipalId={selectedPrincipalId}
      onSelectedPrincipalIdChange={(value) => {
        setSelectedRoleId("member");
        setSelectedPrincipalId(value);
        onPermissionDetailOpenChange?.(Boolean(value));
      }}
      subjectType="test_plan"
      teamSubjectType="test_plan_team_role"
      selectedRoleId={selectedRoleId}
      onSelectedRoleIdChange={setSelectedRoleId}
      systemPermissionSet={systemPermissionSet}
      onSystemPermissionSetChange={(permissionSet: PlatformPermissionSet) => {
        void persistMetadata(buildPlatformSystemPrincipalPermissionMetadata(
          metadata,
          systemPrincipalId,
          permissionSet,
          "test_plan",
        ));
      }}
      systemRolePermissionSet={systemRolePermissionSet}
      onSystemRolePermissionSetChange={(roleId, permissionSet) => {
        if (!isPlatformRoleScopedSystemAccessPrincipalId(systemPrincipalId)) return;
        void persistMetadata(buildPlatformSystemPrincipalRolePermissionMetadata(
          metadata,
          systemPrincipalId,
          roleId,
          permissionSet,
          "test_plan_team_role",
        ));
      }}
      teamPermissionSet={teamPermissionSet}
      onTeamPermissionSetChange={(roleId, permissionSet) => {
        if (!selectedTeam) return;
        void persistMetadata(buildPlatformTeamRolePermissionMetadata(
          metadata,
          selectedTeam.id,
          roleId,
          permissionSet,
          "test_plan_team_role",
        ));
      }}
      disabled={busy}
      addTeams={{
        teams: availableTeams,
        totalTeamCount: allTeams.length,
        disabled: busy,
        popupAriaLabel: "Add teams with Test Plan access",
        onAddTeam: (team) => addTeam(team.id),
      }}
      tableProps={{
        busy,
        error,
        onRemoveTeams: removeTeams,
        formatCreatedAt: (createdAt) => createdAt
          ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(createdAt))
          : "—",
      }}
    />
  );
}
