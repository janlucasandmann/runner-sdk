import { Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  buildPlatformSystemPrincipalPermissionMetadata,
  buildPlatformSystemPrincipalRolePermissionMetadata,
  buildPlatformTeamAccessMetadata,
  buildPlatformTeamRolePermissionMetadata,
  getPlatformSharedTeamIds,
  getPlatformSystemPrincipalPermissionSet,
  getPlatformSystemPrincipalRolePermissionSet,
  getPlatformTeamPermissionSet,
  getPlatformTeamRolePermissionSet,
  getPlatformTeamRolePermissionSets,
  isPlatformRoleScopedSystemAccessPrincipalId,
  isPlatformSystemAccessPrincipalId,
  PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
  type PlatformAccessPrincipal,
  PlatformResourceAccessSettings,
} from "../../../../../../platform-resources/access-control/index.js";
import { PlatformButtonSelector } from "../../../../../../platform-ui/components/ui/selector/index.js";
import type { PlatformPermissionSet } from "../../../../../../platform-ui/pages/permissions/index.js";
import type { InferenceEndpointRow } from "../inference-endpoint-model.js";

export interface InferenceEndpointAccessTeam extends PlatformAccessPrincipal {
  roleId: string;
}

export interface InferenceEndpointTeamShareResult {
  id?: string;
}

export interface InferenceEndpointAccessSettingsProps {
  endpoint: InferenceEndpointRow;
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  onWorkspaceTeamsRequest?: () => void;
  onMetadataChange: (
    metadata: Record<string, unknown>,
    permissionSet?: Record<string, unknown> | null,
  ) => void | Promise<void>;
  onAddTeamShare: (
    team: InferenceEndpointAccessTeam,
    metadata: Record<string, unknown>,
  ) => Promise<InferenceEndpointTeamShareResult>;
  onRemoveTeamShare: (teamId: string, shareId: string) => Promise<void>;
  onPermissionDetailOpenChange?: (open: boolean) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readTeamId(source: Record<string, unknown>): string {
  const nested = asRecord(source.team);
  return String(
    source.id || source.teamId || source.team_id || nested.id || nested.teamId || "",
  ).trim();
}

export function normalizeInferenceEndpointAccessTeam(
  value: unknown,
): InferenceEndpointAccessTeam | null {
  const source = asRecord(value);
  const nested = asRecord(source.team);
  const metadata = asRecord(source.metadata);
  const profile = asRecord(metadata.profile);
  const id = readTeamId(source);
  if (!id) return null;
  const rawRoleId = String(
    source.roleId || source.role || source.membershipRole || source.currentUserRole || "member",
  )
    .trim()
    .toLowerCase();
  const roleId = rawRoleId === "administrator" || rawRoleId === "manage" ? "admin" : rawRoleId;
  const name =
    String(
      source.name || source.title || source.displayName || source.teamName || nested.name || "Team",
    ).trim() || "Team";
  return {
    id,
    name,
    kind: "team",
    description: String(source.description || nested.description || "").trim(),
    roleId,
    roleLabel: String(
      source.roleLabel || (roleId ? roleId.charAt(0).toUpperCase() + roleId.slice(1) : "Team"),
    ),
    createdAt: String(source.createdAt || source.created_at || nested.createdAt || "").trim(),
    profileImageUrl: String(
      source.profileImageUrl ||
        source.imageUrl ||
        source.avatarUrl ||
        nested.profileImageUrl ||
        nested.imageUrl ||
        nested.avatarUrl ||
        profile.photoURL ||
        metadata.avatarUrl ||
        "",
    ).trim(),
  };
}

export function InferenceEndpointAccessSettings({
  endpoint,
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  onWorkspaceTeamsRequest,
  onMetadataChange,
  onAddTeamShare,
  onRemoveTeamShare,
  onPermissionDetailOpenChange,
}: InferenceEndpointAccessSettingsProps) {
  const [selectedPrincipalId, setSelectedPrincipalId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("member");
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const [addTeamsOpen, setAddTeamsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const metadata = useMemo(() => asRecord(endpoint.metadata), [endpoint.metadata]);
  const permissionSet = useMemo(() => {
    const nextPermissionSet = asRecord(endpoint.permissionSet);
    return Object.keys(nextPermissionSet).length > 0 ? nextPermissionSet : null;
  }, [endpoint.permissionSet]);
  const sharedTeamIds = useMemo(() => getPlatformSharedTeamIds(metadata), [metadata]);
  const sharedTeamIdSet = useMemo(() => new Set(sharedTeamIds), [sharedTeamIds]);
  const allTeams = useMemo(
    () =>
      workspaceTeams
        .map(normalizeInferenceEndpointAccessTeam)
        .filter((team): team is InferenceEndpointAccessTeam => Boolean(team)),
    [workspaceTeams],
  );
  const teamById = useMemo(() => new Map(allTeams.map((team) => [team.id, team])), [allTeams]);
  const sharedTeams = useMemo(
    () =>
      sharedTeamIds.map(
        (teamId) =>
          teamById.get(teamId) || {
            id: teamId,
            name: "Team",
            kind: "team" as const,
            description: "",
            roleId: "member",
            roleLabel: "Member",
            createdAt: "",
            profileImageUrl: "",
          },
      ),
    [sharedTeamIds, teamById],
  );
  const availableTeams = useMemo(
    () =>
      allTeams.filter(
        (team) => !sharedTeamIdSet.has(team.id) && ["admin", "owner"].includes(team.roleId),
      ),
    [allTeams, sharedTeamIdSet],
  );
  const selectedTeam = isPlatformSystemAccessPrincipalId(selectedPrincipalId)
    ? null
    : sharedTeams.find((team) => team.id === selectedPrincipalId) || null;
  const systemPrincipalId = isPlatformSystemAccessPrincipalId(selectedPrincipalId)
    ? selectedPrincipalId
    : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;

  useEffect(() => {
    if (workspaceTeams.length === 0 && !workspaceTeamsLoading) {
      onWorkspaceTeamsRequest?.();
    }
  }, [onWorkspaceTeamsRequest, workspaceTeams.length, workspaceTeamsLoading]);

  async function persistMetadata(nextMetadata: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      await onMetadataChange(nextMetadata, permissionSet);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Failed to update endpoint access.",
      );
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
        "inference_endpoint_team_role",
      );
      const share = await onAddTeamShare(team, {
        permissionSet: getPlatformTeamPermissionSet(
          withTeam,
          team.id,
          "inference_endpoint_team_role",
        ),
        rolePermissionSets: getPlatformTeamRolePermissionSets(
          withTeam,
          team.id,
          "inference_endpoint_team_role",
        ),
      });
      createdShareId = String(share.id || "").trim();
      const nextMetadata = {
        ...withTeam,
        teamAccessShareIds: {
          ...asRecord(metadata.teamAccessShareIds),
          [team.id]: createdShareId,
        },
      };
      await onMetadataChange(nextMetadata, permissionSet);
      setAddTeamsOpen(false);
    } catch (nextError) {
      if (createdShareId) {
        await onRemoveTeamShare(team.id, createdShareId).catch(() => undefined);
      }
      setError(nextError instanceof Error ? nextError.message : "Failed to grant team access.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTeams(teams: readonly InferenceEndpointAccessTeam[]) {
    if (busy || teams.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const shareIds = asRecord(metadata.teamAccessShareIds);
      await Promise.all(
        teams.map(async (team) => {
          const shareId = String(shareIds[team.id] || "").trim();
          if (shareId) await onRemoveTeamShare(team.id, shareId);
        }),
      );
      let nextMetadata = { ...metadata };
      teams.forEach((team) => {
        nextMetadata = buildPlatformTeamAccessMetadata(
          nextMetadata,
          team.id,
          false,
          "inference_endpoint_team_role",
        );
      });
      const nextShareIds = { ...shareIds };
      teams.forEach((team) => {
        delete nextShareIds[team.id];
      });
      nextMetadata.teamAccessShareIds = nextShareIds;
      await onMetadataChange(nextMetadata, permissionSet);
      setSelectedPrincipalId("");
      setSelectedTeamIds(new Set());
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
    "inference_endpoint",
    permissionSet,
  );
  const systemRolePermissionSet = getPlatformSystemPrincipalRolePermissionSet(
    metadata,
    systemPrincipalId,
    selectedRoleId,
    "inference_endpoint_team_role",
  );
  const teamPermissionSet = selectedTeam
    ? getPlatformTeamRolePermissionSet(
        metadata,
        selectedTeam.id,
        selectedRoleId,
        "inference_endpoint_team_role",
      )
    : null;
  const addTeamsControl = (
    <PlatformButtonSelector
      mode="popup"
      buttonVariant="secondary"
      buttonSize="small"
      label="Add Teams"
      leading={<Plus width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
      open={addTeamsOpen}
      onOpenChange={setAddTeamsOpen}
      closeOnSelect
      popupAriaLabel="Add teams with inference endpoint access"
      popupAlignment="right"
      popupRole="menu"
      popupVariant="minimal"
      popupWidth={240}
      disabled={busy || workspaceTeamsLoading}
    >
      {availableTeams.length > 0 ? (
        availableTeams.map((team) => (
          <button
            key={team.id}
            type="button"
            role="menuitem"
            className="platform-data-table__menu-item"
            onClick={() => void addTeam(team.id)}
          >
            <Users
              className="platform-data-table__menu-icon"
              width={14}
              height={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="platform-data-table__menu-copy">{team.name}</span>
          </button>
        ))
      ) : (
        <div className="playground-project-teams-menu-empty">
          {workspaceTeamsLoading ? "Loading teams..." : "All available teams have access."}
        </div>
      )}
    </PlatformButtonSelector>
  );

  return (
    <PlatformResourceAccessSettings<InferenceEndpointAccessTeam>
      teams={sharedTeams}
      resourceLabel="Inference Endpoint"
      selectedPrincipalId={selectedPrincipalId}
      onSelectedPrincipalIdChange={(value) => {
        setSelectedRoleId("member");
        setSelectedPrincipalId(value);
        onPermissionDetailOpenChange?.(Boolean(value));
      }}
      subjectType="inference_endpoint"
      teamSubjectType="inference_endpoint_team_role"
      selectedRoleId={selectedRoleId}
      onSelectedRoleIdChange={setSelectedRoleId}
      systemPermissionSet={systemPermissionSet}
      onSystemPermissionSetChange={(nextPermissionSet: PlatformPermissionSet) => {
        void persistMetadata(
          buildPlatformSystemPrincipalPermissionMetadata(
            metadata,
            systemPrincipalId,
            nextPermissionSet,
            "inference_endpoint",
          ),
        );
      }}
      systemRolePermissionSet={systemRolePermissionSet}
      onSystemRolePermissionSetChange={(roleId, nextPermissionSet) => {
        if (!isPlatformRoleScopedSystemAccessPrincipalId(systemPrincipalId)) return;
        void persistMetadata(
          buildPlatformSystemPrincipalRolePermissionMetadata(
            metadata,
            systemPrincipalId,
            roleId,
            nextPermissionSet,
            "inference_endpoint_team_role",
          ),
        );
      }}
      teamPermissionSet={teamPermissionSet}
      onTeamPermissionSetChange={(roleId, nextPermissionSet) => {
        if (!selectedTeam) return;
        void persistMetadata(
          buildPlatformTeamRolePermissionMetadata(
            metadata,
            selectedTeam.id,
            roleId,
            nextPermissionSet,
            "inference_endpoint_team_role",
          ),
        );
      }}
      animationKey={`${endpoint.id}:${selectedRoleId}`}
      disabled={busy}
      backLabel="Settings"
      className="inference-endpoint-detail__access-settings"
      tableProps={{
        className: "inference-endpoint-detail__access-table",
        title: "Manage Inference Access",
        titleTooltip:
          "Controls which agents, organization roles, and teams can view, use, configure, test, share, or delete this endpoint.",
        trailing: addTeamsControl,
        selectedIds: selectedTeamIds,
        onSelectedIdsChange: setSelectedTeamIds,
        pagination: {},
        busy: busy || workspaceTeamsLoading,
        error: error || null,
        onRemoveTeams: removeTeams,
        getTeamProfileImageUrl: (team) => String(team.profileImageUrl || ""),
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
