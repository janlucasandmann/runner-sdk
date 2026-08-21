import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  PlatformResourceAccessTable,
  PlatformResourceAccessAddTeams,
  getPlatformSystemAccessPrincipal,
  getPlatformSystemPrincipalPermissionSet,
  isPlatformSystemAccessPrincipalId,
  type PlatformAccessPrincipal,
  type PlatformSystemAccessPrincipalId,
} from "../../../../../platform-resources/access-control/index.js";
import { PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import {
  PlatformPermissionsPage,
  PlatformRolePermissionsPage,
  createPlatformDefaultPermissionSet,
  updatePlatformPermissionActionAccess,
  updatePlatformPermissionActionRing,
  updatePlatformPermissionRingAccess,
  type PlatformPermissionSet,
} from "../../../../../platform-ui/pages/permissions/index.js";
import {
  SECURITY_TEAM_ROLE_DEFINITIONS,
  getSecurityRepositorySharedTeamIds,
  getSecurityRepositoryTeamRolePermissionSet,
  getSecurityRepositoryTeamRolePermissionSets,
  normalizeSecurityWorkspaceTeam,
  type SecurityRepository,
  type SecurityTeamRoleId,
  type SecurityTeamRolePermissionSets,
  type SecurityWorkspaceTeam,
} from "../domain/index.js";
import { formatSecurityTimestamp } from "../domain/index.js";

interface SecurityAccessTeamRow extends SecurityWorkspaceTeam {
  kind: "team";
}

export interface SecurityRepositoryAccessSettingsProps {
  repository: SecurityRepository;
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  workspaceTeamsRequiresPlan?: boolean;
  busy?: boolean;
  children?: ReactNode;
  onWorkspaceTeamsRequest?: () => void;
  onSaveSystemPrincipalPermissionSet: (
    principalId: PlatformSystemAccessPrincipalId,
    permissionSet: PlatformPermissionSet,
  ) => void;
  onAddTeamAccess: (
    team: SecurityWorkspaceTeam,
    rolePermissionSets: SecurityTeamRolePermissionSets,
  ) => void;
  onRemoveTeamAccess: (teams: readonly SecurityWorkspaceTeam[]) => void;
  onSaveTeamRolePermissionSet: (
    team: SecurityWorkspaceTeam,
    roleId: SecurityTeamRoleId,
    permissionSet: PlatformPermissionSet,
  ) => void;
}

export function SecurityRepositoryAccessSettings({
  repository,
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  workspaceTeamsRequiresPlan = false,
  busy = false,
  children,
  onWorkspaceTeamsRequest,
  onSaveSystemPrincipalPermissionSet,
  onAddTeamAccess,
  onRemoveTeamAccess,
  onSaveTeamRolePermissionSet,
}: SecurityRepositoryAccessSettingsProps) {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<SecurityTeamRoleId>("member");
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => new Set());
  const teamsRequestedForRepositoryRef = useRef("");

  const normalizedWorkspaceTeams = useMemo(
    () =>
      workspaceTeams
        .map(normalizeSecurityWorkspaceTeam)
        .filter((team): team is SecurityWorkspaceTeam => Boolean(team)),
    [workspaceTeams],
  );
  const workspaceTeamById = useMemo(
    () => new Map(normalizedWorkspaceTeams.map((team) => [String(team.id), team])),
    [normalizedWorkspaceTeams],
  );
  const sharedTeamIds = useMemo(() => getSecurityRepositorySharedTeamIds(repository), [repository]);
  const sharedTeamIdSet = useMemo(() => new Set(sharedTeamIds), [sharedTeamIds]);
  const sharedTeams = useMemo<SecurityAccessTeamRow[]>(
    () =>
      sharedTeamIds.map((teamId) => ({
        ...(workspaceTeamById.get(teamId) || {
          id: teamId,
          name: "Team",
          roleId: "member",
          roleLabel: "Member",
          createdAt: "",
        }),
        kind: "team",
      })),
    [sharedTeamIds, workspaceTeamById],
  );
  const availableTeams = useMemo<SecurityAccessTeamRow[]>(
    () =>
      normalizedWorkspaceTeams
        .filter(
          (team) => ["admin", "owner"].includes(team.roleId) && !sharedTeamIdSet.has(team.id),
        )
        .map((team) => ({ ...team, kind: "team" })),
    [normalizedWorkspaceTeams, sharedTeamIdSet],
  );
  useEffect(() => {
    if (
      teamsRequestedForRepositoryRef.current === repository.id ||
      workspaceTeamsLoading ||
      workspaceTeamsRequiresPlan ||
      !onWorkspaceTeamsRequest
    ) {
      return;
    }
    teamsRequestedForRepositoryRef.current = repository.id;
    onWorkspaceTeamsRequest();
  }, [onWorkspaceTeamsRequest, repository.id, workspaceTeamsLoading, workspaceTeamsRequiresPlan]);

  useEffect(() => {
    if (
      selectedTeamId &&
      !isPlatformSystemAccessPrincipalId(selectedTeamId) &&
      !sharedTeamIdSet.has(selectedTeamId)
    ) {
      setSelectedTeamId("");
    }
  }, [selectedTeamId, sharedTeamIdSet]);

  const selectedTeam =
    selectedTeamId && !isPlatformSystemAccessPrincipalId(selectedTeamId)
      ? workspaceTeamById.get(selectedTeamId) ||
        sharedTeams.find((team) => team.id === selectedTeamId) ||
        null
      : null;
  const selectedSystemPrincipal = getPlatformSystemAccessPrincipal(selectedTeamId);
  const systemPermissionSet = selectedSystemPrincipal
    ? getPlatformSystemPrincipalPermissionSet(
        repository.metadata,
        selectedSystemPrincipal.id,
        "security_repository",
        repository.permissionSet,
      )
    : createPlatformDefaultPermissionSet("security_repository");
  const selectedRolePermissionSet = selectedTeam
    ? getSecurityRepositoryTeamRolePermissionSet(repository, selectedTeam.id, selectedRoleId)
    : null;

  const openPermissions = (team: PlatformAccessPrincipal) => {
    setSelectedRoleId("member");
    setSelectedTeamId(team.id);
  };

  if (selectedTeamId) {
    return (
      <section
        className="develop-security-access-editor"
        aria-label={
          selectedSystemPrincipal
            ? `${selectedSystemPrincipal.name} permissions`
            : `${selectedTeam?.name || "Team"} Security Agents access`
        }
      >
        <div className="develop-security-access-editor__header">
          <PlatformSecondaryButton size="compact" onClick={() => setSelectedTeamId("")}>
            <ArrowLeft width={13} height={13} strokeWidth={1.9} />
            Settings
          </PlatformSecondaryButton>
          <div>
            <span>Manage access</span>
            <h2>
              {selectedSystemPrincipal
                ? `${selectedSystemPrincipal.name} permissions`
                : `${selectedTeam?.name || "Team"} Security Agents access`}
            </h2>
          </div>
        </div>
        {selectedSystemPrincipal ? (
          <PlatformPermissionsPage
            permissionSet={systemPermissionSet}
            subjectType="security_repository"
            disabled={busy}
            ariaLabel={`${selectedSystemPrincipal.name} repository security permissions`}
            onRingAccessChange={(ringId, access) =>
              onSaveSystemPrincipalPermissionSet(
                selectedSystemPrincipal.id,
                updatePlatformPermissionRingAccess(
                  systemPermissionSet,
                  ringId,
                  access,
                  "security_repository",
                ),
              )
            }
            onActionRingChange={(actionId, ringId) =>
              onSaveSystemPrincipalPermissionSet(
                selectedSystemPrincipal.id,
                updatePlatformPermissionActionRing(
                  systemPermissionSet,
                  actionId,
                  ringId,
                  "security_repository",
                ),
              )
            }
            onActionAccessChange={(actionId, access) =>
              onSaveSystemPrincipalPermissionSet(
                selectedSystemPrincipal.id,
                updatePlatformPermissionActionAccess(
                  systemPermissionSet,
                  actionId,
                  access,
                  "security_repository",
                ),
              )
            }
          />
        ) : selectedTeam && selectedRolePermissionSet ? (
          <PlatformRolePermissionsPage<SecurityTeamRoleId>
            roles={SECURITY_TEAM_ROLE_DEFINITIONS.map((role) => ({
              ...role,
              meta: "Security Agents access",
            }))}
            value={selectedRoleId}
            onValueChange={setSelectedRoleId}
            roleAriaLabel="Security Agents team roles"
            roleKicker="Security Agents role"
            roleDescription={`Repository-scoped permissions for ${selectedRoleId.toLowerCase()}s in ${selectedTeam.name}.`}
            readOnly={selectedRoleId === "owner"}
            permissionSet={selectedRolePermissionSet}
            subjectType="security_repository"
            disabled={busy}
            onRingAccessChange={(ringId, access) =>
              onSaveTeamRolePermissionSet(
                selectedTeam,
                selectedRoleId,
                updatePlatformPermissionRingAccess(
                  selectedRolePermissionSet,
                  ringId,
                  access,
                  "security_repository",
                ),
              )
            }
            onActionRingChange={(actionId, ringId) =>
              onSaveTeamRolePermissionSet(
                selectedTeam,
                selectedRoleId,
                updatePlatformPermissionActionRing(
                  selectedRolePermissionSet,
                  actionId,
                  ringId,
                  "security_repository",
                ),
              )
            }
            onActionAccessChange={(actionId, access) =>
              onSaveTeamRolePermissionSet(
                selectedTeam,
                selectedRoleId,
                updatePlatformPermissionActionAccess(
                  selectedRolePermissionSet,
                  actionId,
                  access,
                  "security_repository",
                ),
              )
            }
          />
        ) : null}
      </section>
    );
  }

  const addTeamsControl = (
    <PlatformResourceAccessAddTeams
      teams={availableTeams}
      totalTeamCount={normalizedWorkspaceTeams.length}
      loading={workspaceTeamsLoading}
      requiresPlan={workspaceTeamsRequiresPlan}
      disabled={busy}
      popupAriaLabel="Add teams with Security Agents access"
      onRequestTeams={onWorkspaceTeamsRequest}
      onAddTeam={(team) => onAddTeamAccess(
        team,
        getSecurityRepositoryTeamRolePermissionSets(repository, team.id),
      )}
    />
  );

  return (
    <div className="develop-security-settings-root">
      <PlatformResourceAccessTable
        teams={sharedTeams}
        resourceLabel="Security Agents"
        title="Manage access"
        className="develop-security-access-table"
        selectedIds={selectedRowIds}
        busy={busy}
        trailing={addTeamsControl}
        onSelectedIdsChange={setSelectedRowIds}
        onOpenPermissions={openPermissions}
        onRemoveTeams={onRemoveTeamAccess}
        formatCreatedAt={(value) => formatSecurityTimestamp(value, "—")}
      />
      {children}
    </div>
  );
}
