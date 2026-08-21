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
import type { KnowledgeApi } from "../api/index.js";
import type { KnowledgeLibrary } from "../domain/index.js";

export interface KnowledgeAccessTeam extends PlatformAccessPrincipal {
  roleId: string;
}

export interface KnowledgeAccessSettingsProps {
  library: KnowledgeLibrary;
  api: KnowledgeApi;
  workspaceTeams?: readonly unknown[];
  workspaceTeamMembersById?: Readonly<Record<string, readonly unknown[] | undefined>>;
  onWorkspaceTeamMembersRequest?: (teamId: string) => void | Promise<void>;
  onLibraryChange: (library: KnowledgeLibrary) => void;
  onPermissionDetailOpenChange?: (open: boolean) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeKnowledgeAccessTeam(value: unknown): KnowledgeAccessTeam | null {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const profile = asRecord(metadata.profile);
  const id = String(source.id || source.teamId || source.team_id || "").trim();
  if (!id) return null;
  const rawRoleId = String(
    source.roleId || source.role || source.currentUserRole || source.myRole || "admin",
  ).trim().toLowerCase();
  const roleId = rawRoleId === "administrator" || rawRoleId === "manage" ? "admin" : rawRoleId;
  return {
    id,
    name: String(source.name || source.title || source.label || "Team").trim(),
    kind: "team",
    description: String(source.description || "").trim(),
    roleId,
    roleLabel: String(source.roleLabel || (roleId ? roleId.charAt(0).toUpperCase() + roleId.slice(1) : "Team")),
    createdAt: String(source.createdAt || source.created_at || "").trim(),
    profileImageUrl: String(
      source.profileImageUrl || source.avatarUrl || profile.photoURL || metadata.avatarUrl || "",
    ).trim(),
  };
}

export function KnowledgeAccessSettings({
  library,
  api,
  workspaceTeams = [],
  workspaceTeamMembersById = {},
  onWorkspaceTeamMembersRequest,
  onLibraryChange,
  onPermissionDetailOpenChange,
}: KnowledgeAccessSettingsProps) {
  const [selectedPrincipalId, setSelectedPrincipalId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const metadata = asRecord(library.metadata);
  const sharedTeamIds = useMemo(() => new Set(getPlatformSharedTeamIds(metadata)), [metadata]);
  const allTeams = useMemo(
    () => workspaceTeams
      .map(normalizeKnowledgeAccessTeam)
      .filter((team): team is KnowledgeAccessTeam => Boolean(team)),
    [workspaceTeams],
  );
  const sharedTeams = useMemo(
    () => allTeams.filter((team) => sharedTeamIds.has(team.id)),
    [allTeams, sharedTeamIds],
  );
  const availableTeams = useMemo(
    () => allTeams.filter((team) => !sharedTeamIds.has(team.id) && ["admin", "owner"].includes(team.roleId)),
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
      onLibraryChange(await api.updateLibrary(library.id, { metadata: nextMetadata }));
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
        "knowledge_library_team_role",
      );
      const share = await api.addTeamShare(team.id, library.id, {
        permissionSets: asRecord(withTeam.teamRolePermissionSets)[team.id] || {},
      });
      createdShareId = String(share.id || "").trim();
      const nextMetadata = {
        ...withTeam,
        teamAccessShareIds: {
          ...asRecord(metadata.teamAccessShareIds),
          [team.id]: createdShareId,
        },
      };
      onLibraryChange(await api.updateLibrary(library.id, { metadata: nextMetadata }));
    } catch (nextError) {
      if (createdShareId) await api.removeTeamShare(team.id, createdShareId).catch(() => undefined);
      setError(nextError instanceof Error ? nextError.message : "Failed to grant team access.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTeams(teams: readonly KnowledgeAccessTeam[]) {
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
          "knowledge_library_team_role",
        );
      }
      const nextShareIds = { ...shareIds };
      teams.forEach((team) => delete nextShareIds[team.id]);
      nextMetadata.teamAccessShareIds = nextShareIds;
      onLibraryChange(await api.updateLibrary(library.id, { metadata: nextMetadata }));
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
    "knowledge_library",
  );
  const systemRolePermissionSet = getPlatformSystemPrincipalRolePermissionSet(
    metadata,
    systemPrincipalId,
    selectedRoleId,
    "knowledge_library_team_role",
  );
  const teamPermissionSet = selectedTeam
    ? getPlatformTeamRolePermissionSet(
        metadata,
        selectedTeam.id,
        selectedRoleId,
        "knowledge_library_team_role",
      )
    : null;

  return (
    <PlatformResourceAccessSettings<KnowledgeAccessTeam>
      teams={sharedTeams}
      resourceLabel="Knowledge Library"
      selectedPrincipalId={selectedPrincipalId}
      onSelectedPrincipalIdChange={(value) => {
        setSelectedRoleId("member");
        setSelectedPrincipalId(value);
        onPermissionDetailOpenChange?.(Boolean(value));
      }}
      subjectType="knowledge_library"
      teamSubjectType="knowledge_library_team_role"
      selectedRoleId={selectedRoleId}
      onSelectedRoleIdChange={setSelectedRoleId}
      systemPermissionSet={systemPermissionSet}
      onSystemPermissionSetChange={(permissionSet: PlatformPermissionSet) => {
        void persistMetadata(buildPlatformSystemPrincipalPermissionMetadata(
          metadata,
          systemPrincipalId,
          permissionSet,
          "knowledge_library",
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
          "knowledge_library_team_role",
        ));
      }}
      teamPermissionSet={teamPermissionSet}
      teamMembers={selectedTeam ? workspaceTeamMembersById[selectedTeam.id] || [] : []}
      teamMembersTeamId={
        selectedTeam && Object.prototype.hasOwnProperty.call(
          workspaceTeamMembersById,
          selectedTeam.id,
        )
          ? selectedTeam.id
          : ""
      }
      onRequestTeamMembers={onWorkspaceTeamMembersRequest}
      onTeamPermissionSetChange={(roleId, permissionSet) => {
        if (!selectedTeam) return;
        void persistMetadata(buildPlatformTeamRolePermissionMetadata(
          metadata,
          selectedTeam.id,
          roleId,
          permissionSet,
          "knowledge_library_team_role",
        ));
      }}
      disabled={busy}
      addTeams={{
        teams: availableTeams,
        totalTeamCount: allTeams.length,
        disabled: busy,
        popupAriaLabel: "Add teams with Knowledge Library access",
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
