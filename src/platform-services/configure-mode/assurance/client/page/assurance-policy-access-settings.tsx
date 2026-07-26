import { Plus } from "lucide-react";
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
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import type { PlatformPermissionSet } from "../../../../../platform-ui/pages/permissions/index.js";
import type { AssuranceApi } from "../api/index.js";
import type { AssurancePolicy } from "../domain/index.js";

interface AssuranceAccessTeam extends PlatformAccessPrincipal {
  roleId: string;
}

interface AssurancePolicyAccessSettingsProps {
  policy: AssurancePolicy;
  api: AssuranceApi;
  workspaceTeams?: readonly unknown[];
  onPolicyChange: (policy: AssurancePolicy) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizeTeam(value: unknown): AssuranceAccessTeam | null {
  const source = asRecord(value);
  const id = String(source.id || source.teamId || source.team_id || "").trim();
  if (!id) return null;
  return {
    id,
    name: String(source.name || source.title || source.label || "Team").trim(),
    kind: "team",
    description: String(source.description || "").trim(),
    roleId: String(source.roleId || source.role || source.memberRole || "member")
      .trim()
      .toLowerCase(),
    roleLabel: String(source.roleLabel || source.role || "Member").trim(),
    createdAt: String(source.createdAt || source.created_at || "").trim(),
    profileImageUrl: String(
      source.profileImageUrl
      || source.avatarUrl
      || source.imageUrl
      || "",
    ).trim(),
  };
}

export function AssurancePolicyAccessSettings({
  policy,
  api,
  workspaceTeams = [],
  onPolicyChange,
}: AssurancePolicyAccessSettingsProps) {
  const [selectedPrincipalId, setSelectedPrincipalId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const metadata = asRecord(policy.metadata);
  const sharedTeamIds = useMemo(
    () => new Set(getPlatformSharedTeamIds(metadata)),
    [metadata],
  );
  const allTeams = useMemo(
    () => workspaceTeams
      .map(normalizeTeam)
      .filter((team): team is AssuranceAccessTeam => Boolean(team)),
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

  function replacePolicy(updated: AssurancePolicy) {
    onPolicyChange({
      ...policy,
      ...updated,
      versions: policy.versions,
      runs: policy.runs,
    });
  }

  async function persistMetadata(nextMetadata: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      replacePolicy(await api.updatePolicy(policy.id, { metadata: nextMetadata }));
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
        "assurance_policy_team_role",
      );
      const share = await api.addTeamShare(team.id, policy.id, {
        permissionSets: asRecord(withTeam.teamRolePermissionSets)[team.id] || {},
      });
      createdShareId = String(share.id || "").trim();
      replacePolicy(await api.updatePolicy(policy.id, {
        metadata: {
          ...withTeam,
          teamAccessShareIds: {
            ...asRecord(metadata.teamAccessShareIds),
            [team.id]: createdShareId,
          },
        },
      }));
    } catch (nextError) {
      if (createdShareId) {
        await api.removeTeamShare(team.id, createdShareId).catch(() => undefined);
      }
      setError(nextError instanceof Error ? nextError.message : "Failed to grant team access.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTeams(teams: readonly AssuranceAccessTeam[]) {
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
          "assurance_policy_team_role",
        );
      }
      const nextShareIds = { ...shareIds };
      teams.forEach((team) => delete nextShareIds[team.id]);
      nextMetadata.teamAccessShareIds = nextShareIds;
      replacePolicy(await api.updatePolicy(policy.id, { metadata: nextMetadata }));
      setSelectedPrincipalId("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to remove team access.");
    } finally {
      setBusy(false);
    }
  }

  const systemPermissionSet = getPlatformSystemPrincipalPermissionSet(
    metadata,
    systemPrincipalId,
    "assurance_policy",
  );
  const systemRolePermissionSet = getPlatformSystemPrincipalRolePermissionSet(
    metadata,
    systemPrincipalId,
    selectedRoleId,
    "assurance_policy_team_role",
  );
  const teamPermissionSet = selectedTeam
    ? getPlatformTeamRolePermissionSet(
        metadata,
        selectedTeam.id,
        selectedRoleId,
        "assurance_policy_team_role",
      )
    : null;

  const addTeamSelector = (
    <PlatformSelector
      value=""
      options={availableTeams.map((team) => ({
        value: team.id,
        label: team.name,
        description: team.description || team.roleLabel,
      }))}
      label={(
        <span className="assurance-access-add-label">
          <Plus width={14} height={14} aria-hidden="true" />
          Add Team
        </span>
      )}
      placeholder="Add Team"
      ariaLabel="Add a team to this Assurance Policy"
      disabled={busy || availableTeams.length === 0}
      onValueChange={(teamId) => void addTeam(teamId)}
      popupAlignment="right"
      popupWidth={280}
    />
  );

  return (
    <PlatformResourceAccessSettings<AssuranceAccessTeam>
      teams={sharedTeams}
      resourceLabel="Assurance Policy"
      selectedPrincipalId={selectedPrincipalId}
      onSelectedPrincipalIdChange={(value) => {
        setSelectedRoleId("member");
        setSelectedPrincipalId(value);
      }}
      subjectType="assurance_policy"
      teamSubjectType="assurance_policy_team_role"
      selectedRoleId={selectedRoleId}
      onSelectedRoleIdChange={setSelectedRoleId}
      systemPermissionSet={systemPermissionSet}
      onSystemPermissionSetChange={(permissionSet: PlatformPermissionSet) => {
        void persistMetadata(buildPlatformSystemPrincipalPermissionMetadata(
          metadata,
          systemPrincipalId,
          permissionSet,
          "assurance_policy",
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
          "assurance_policy_team_role",
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
          "assurance_policy_team_role",
        ));
      }}
      disabled={busy}
      tableProps={{
        busy,
        trailing: addTeamSelector,
        error,
        onRemoveTeams: removeTeams,
        formatCreatedAt: (createdAt) => createdAt
          ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(createdAt))
          : "—",
      }}
    />
  );
}
