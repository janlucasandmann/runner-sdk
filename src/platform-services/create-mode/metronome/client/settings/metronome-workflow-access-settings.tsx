import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
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
  PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
  type PlatformAccessPrincipal,
  PlatformResourceAccessSettings,
} from "../../../../../platform-resources/access-control/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import type { PlatformPermissionSet } from "../../../../../platform-ui/pages/permissions/index.js";

export interface MetronomeAccessTeam extends PlatformAccessPrincipal {
  roleId: string;
  resourceShareId: string;
}

export interface MetronomeAccessWorkflow {
  id: string;
  metadata?: unknown;
}

export interface MetronomeWorkflowAccessSettingsProps {
  workflow: MetronomeAccessWorkflow;
  workspaceTeams?: readonly unknown[];
  disabled?: boolean;
  onMetadataChange: (metadata: Record<string, unknown>) => Promise<void>;
  onAddTeamShare: (
    teamId: string,
    permissionSets: Record<string, unknown>,
  ) => Promise<{ id?: string } | undefined>;
  onRemoveTeamShare: (teamId: string, shareId: string) => Promise<void>;
  onPermissionDetailOpenChange?: (open: boolean) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(source: Record<string, unknown>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function normalizeMetronomeAccessTeam(value: unknown): MetronomeAccessTeam | null {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const profile = asRecord(metadata.profile);
  const id = readString(source, ["id", "teamId", "team_id"]);
  if (!id) return null;
  const rawRoleId =
    readString(source, [
      "roleId",
      "role",
      "memberRole",
      "member_role",
      "membershipRole",
      "membership_role",
      "currentUserRole",
      "current_user_role",
      "viewerRole",
      "viewer_role",
      "myRole",
      "my_role",
    ]).toLowerCase() || "admin";
  const roleId =
    ({ administrator: "admin", manage: "admin" } as Record<string, string>)[rawRoleId] || rawRoleId;
  return {
    id,
    name: readString(source, ["name", "title", "label"]) || "Team",
    kind: "team",
    description: readString(source, ["description"]),
    roleId,
    roleLabel:
      readString(source, ["roleLabel", "role_label"]) ||
      roleId.charAt(0).toUpperCase() + roleId.slice(1),
    createdAt: readString(source, ["createdAt", "created_at"]),
    profileImageUrl:
      readString(source, [
        "profileImageUrl",
        "profile_image_url",
        "avatarUrl",
        "avatar_url",
        "imageUrl",
        "image_url",
        "photoURL",
        "photoUrl",
      ]) ||
      readString(profile, ["photoURL", "photoUrl", "imageUrl", "image_url"]) ||
      readString(metadata, ["profileImageUrl", "profile_image_url", "avatarUrl", "avatar_url"]),
    resourceShareId: readString(source, [
      "metronomeWorkflowShareId",
      "metronome_workflow_share_id",
      "resourceShareId",
      "resource_share_id",
      "shareId",
      "share_id",
    ]),
  };
}

function getTeamAccessShareIds(metadata: Record<string, unknown>): Record<string, unknown> {
  return asRecord(metadata.teamAccessShareIds || metadata.team_access_share_ids);
}

export function MetronomeWorkflowAccessSettings({
  workflow,
  workspaceTeams = [],
  disabled = false,
  onMetadataChange,
  onAddTeamShare,
  onRemoveTeamShare,
  onPermissionDetailOpenChange,
}: MetronomeWorkflowAccessSettingsProps) {
  const [selectedPrincipalId, setSelectedPrincipalId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const metadata = asRecord(workflow.metadata);
  const allTeams = useMemo(
    () =>
      workspaceTeams
        .map(normalizeMetronomeAccessTeam)
        .filter((team): team is MetronomeAccessTeam => Boolean(team)),
    [workspaceTeams],
  );
  const sharedTeamIds = useMemo(() => {
    const ids = new Set(getPlatformSharedTeamIds(metadata));
    allTeams.forEach((team) => {
      if (team.resourceShareId) ids.add(team.id);
    });
    return ids;
  }, [metadata, allTeams]);
  const sharedTeams = useMemo(
    () => allTeams.filter((team) => sharedTeamIds.has(team.id)),
    [allTeams, sharedTeamIds],
  );
  const availableTeams = useMemo(
    () =>
      allTeams.filter(
        (team) => !sharedTeamIds.has(team.id) && ["admin", "owner"].includes(team.roleId),
      ),
    [allTeams, sharedTeamIds],
  );
  const selectedTeam = isPlatformSystemAccessPrincipalId(selectedPrincipalId)
    ? null
    : sharedTeams.find((team) => team.id === selectedPrincipalId) || null;
  const systemPrincipalId = isPlatformSystemAccessPrincipalId(selectedPrincipalId)
    ? selectedPrincipalId
    : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;
  const isBusy = busy || disabled;

  async function persistMetadata(nextMetadata: Record<string, unknown>) {
    if (isBusy) return;
    setBusy(true);
    setError("");
    try {
      await onMetadataChange(nextMetadata);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to update access.");
    } finally {
      setBusy(false);
    }
  }

  async function addTeam(teamId: string) {
    const team = availableTeams.find((candidate) => candidate.id === teamId);
    if (!team || isBusy) return;
    setBusy(true);
    setError("");
    let createdShareId = "";
    try {
      const withTeam = buildPlatformTeamAccessMetadata(
        metadata,
        team.id,
        true,
        "metronome_workflow_team_role",
      );
      const permissionSets = asRecord(asRecord(withTeam.teamRolePermissionSets)[team.id]);
      const share = await onAddTeamShare(team.id, permissionSets);
      createdShareId = String(share?.id || "").trim();
      await onMetadataChange({
        ...withTeam,
        teamAccessShareIds: {
          ...getTeamAccessShareIds(metadata),
          [team.id]: createdShareId,
        },
      });
    } catch (nextError) {
      if (createdShareId) {
        await onRemoveTeamShare(team.id, createdShareId).catch(() => undefined);
      }
      setError(nextError instanceof Error ? nextError.message : "Failed to grant team access.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTeams(teams: readonly MetronomeAccessTeam[]) {
    if (isBusy || teams.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const shareIds = getTeamAccessShareIds(metadata);
      await Promise.all(
        teams.map((team) => {
          const shareId = String(shareIds[team.id] || team.resourceShareId || "").trim();
          return onRemoveTeamShare(team.id, shareId);
        }),
      );
      let nextMetadata = { ...metadata };
      for (const team of teams) {
        nextMetadata = buildPlatformTeamAccessMetadata(
          nextMetadata,
          team.id,
          false,
          "metronome_workflow_team_role",
        );
      }
      const nextShareIds = { ...shareIds };
      teams.forEach((team) => {
        delete nextShareIds[team.id];
      });
      nextMetadata.teamAccessShareIds = nextShareIds;
      await onMetadataChange(nextMetadata);
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
    "metronome_workflow",
  );
  const systemRolePermissionSet = getPlatformSystemPrincipalRolePermissionSet(
    metadata,
    systemPrincipalId,
    selectedRoleId,
    "metronome_workflow_team_role",
  );
  const teamPermissionSet = selectedTeam
    ? getPlatformTeamRolePermissionSet(
        metadata,
        selectedTeam.id,
        selectedRoleId,
        "metronome_workflow_team_role",
      )
    : null;
  const addTeamSelector = (
    <PlatformSelector
      className="metronome-access-add-selector"
      value=""
      options={availableTeams.map((team) => ({
        value: team.id,
        label: team.name,
        description: team.description || team.roleLabel,
      }))}
      label={
        <span className="metronome-access-add-label">
          <Plus width={14} height={14} aria-hidden="true" />
          Add Team
        </span>
      }
      placeholder="Add Team"
      ariaLabel="Add a team to this Metronome workflow"
      disabled={isBusy || availableTeams.length === 0}
      onValueChange={(teamId) => void addTeam(teamId)}
      popupAlignment="right"
      popupWidth={280}
    />
  );

  return (
    <PlatformResourceAccessSettings<MetronomeAccessTeam>
      teams={sharedTeams}
      resourceLabel="Metronome Workflow"
      selectedPrincipalId={selectedPrincipalId}
      onSelectedPrincipalIdChange={(value) => {
        setSelectedRoleId("member");
        setSelectedPrincipalId(value);
        onPermissionDetailOpenChange?.(Boolean(value));
      }}
      subjectType="metronome_workflow"
      teamSubjectType="metronome_workflow_team_role"
      selectedRoleId={selectedRoleId}
      onSelectedRoleIdChange={setSelectedRoleId}
      systemPermissionSet={systemPermissionSet}
      onSystemPermissionSetChange={(permissionSet: PlatformPermissionSet) => {
        void persistMetadata(
          buildPlatformSystemPrincipalPermissionMetadata(
            metadata,
            systemPrincipalId,
            permissionSet,
            "metronome_workflow",
          ),
        );
      }}
      systemRolePermissionSet={systemRolePermissionSet}
      onSystemRolePermissionSetChange={(roleId, permissionSet) => {
        if (!isPlatformRoleScopedSystemAccessPrincipalId(systemPrincipalId)) return;
        void persistMetadata(
          buildPlatformSystemPrincipalRolePermissionMetadata(
            metadata,
            systemPrincipalId,
            roleId,
            permissionSet,
            "metronome_workflow_team_role",
          ),
        );
      }}
      teamPermissionSet={teamPermissionSet}
      onTeamPermissionSetChange={(roleId, permissionSet) => {
        if (!selectedTeam) return;
        void persistMetadata(
          buildPlatformTeamRolePermissionMetadata(
            metadata,
            selectedTeam.id,
            roleId,
            permissionSet,
            "metronome_workflow_team_role",
          ),
        );
      }}
      disabled={isBusy}
      tableProps={{
        title: "Manage Workflow Access",
        busy,
        trailing: addTeamSelector,
        error,
        onRemoveTeams: removeTeams,
        formatCreatedAt: (createdAt) =>
          createdAt
            ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                new Date(createdAt),
              )
            : "—",
      }}
    />
  );
}
