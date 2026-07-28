import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import {
  normalizePlatformPermissionSet,
  normalizePlatformRolePermissionSet,
  PlatformPermissionsPage,
  PlatformRolePermissionsPage,
  updatePlatformPermissionActionAccess,
  updatePlatformPermissionActionRing,
  updatePlatformPermissionRingAccess,
  type PlatformPermissionAccess,
  type PlatformPermissionActionDefinition,
  type PlatformPermissionActionPresentation,
  type PlatformPermissionRole,
  type PlatformPermissionSet,
  type PlatformPermissionSubjectType,
} from "../../../platform-ui/pages/permissions/index.js";
import {
  getPlatformSystemAccessPrincipal,
  isPlatformRoleScopedSystemAccessPrincipalId,
  type PlatformAccessPrincipal,
} from "../domain/access-principals.js";
import { PlatformResourceAccessTable } from "./platform-resource-access-table.js";
import type { PlatformResourceAccessTableProps } from "./platform-resource-access-table.js";

export const PLATFORM_RESOURCE_ACCESS_ROLES: readonly PlatformPermissionRole<string>[] = [
  {
    id: "owner",
    label: "Owner",
    description: "Has permanent full control of this resource and its access policies.",
  },
  {
    id: "member",
    label: "Member",
    description: "Can use this resource, with elevated operations routed through approval.",
  },
  {
    id: "contributor",
    label: "Contributor",
    description: "Can use and update this resource while administrative changes remain protected.",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Can manage this resource, its versions, and its access policies.",
  },
] as const;

export const PLATFORM_ORGANIZATION_ACCESS_ROLES: readonly PlatformPermissionRole<string>[] = [
  {
    id: "owner",
    label: "Owner",
    description: "Has permanent full control of the organization and this resource.",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Can administer organization resources and their access policies.",
  },
  {
    id: "developer",
    label: "Developer",
    description: "Can use and configure operational resources without changing administrative access.",
  },
  {
    id: "member",
    label: "Member",
    description: "Can use this resource, with elevated operations routed through approval.",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Can inspect this resource but cannot invoke or configure it.",
  },
  {
    id: "viewer",
    label: "Viewer",
    description: "Has read-only visibility into this resource.",
  },
] as const;

export interface PlatformResourceAccessSettingsProps<TTeam extends PlatformAccessPrincipal> {
  teams: readonly TTeam[];
  resourceLabel: string;
  selectedPrincipalId?: string;
  onSelectedPrincipalIdChange: (principalId: string) => void;
  tableProps?: Omit<
    PlatformResourceAccessTableProps<TTeam>,
    "teams" | "resourceLabel" | "onOpenPermissions"
  >;
  subjectType: PlatformPermissionSubjectType;
  teamSubjectType?: PlatformPermissionSubjectType;
  systemPermissionSet?: PlatformPermissionSet | null;
  onSystemPermissionSetChange?: (permissionSet: PlatformPermissionSet) => void;
  systemRolePermissionSet?: PlatformPermissionSet | null;
  onSystemRolePermissionSetChange?: (
    roleId: string,
    permissionSet: PlatformPermissionSet,
  ) => void;
  roles?: readonly PlatformPermissionRole<string>[];
  selectedRoleId?: string;
  onSelectedRoleIdChange?: (roleId: string) => void;
  teamPermissionSet?: PlatformPermissionSet | null;
  onTeamPermissionSetChange?: (roleId: string, permissionSet: PlatformPermissionSet) => void;
  actionDefinitions?: readonly PlatformPermissionActionDefinition[];
  actionPresentation?: Readonly<Record<string, PlatformPermissionActionPresentation | undefined>>;
  animationKey?: string | number;
  disabled?: boolean;
  backLabel?: string;
  permissionHeaderAction?: ReactNode;
  className?: string;
}

function updatePermissionSet(
  permissionSet: PlatformPermissionSet | null | undefined,
  subjectType: PlatformPermissionSubjectType,
  update:
    | {
        type: "ring-access";
        ringId: string;
        value: PlatformPermissionAccess;
      }
    | { type: "action-ring"; actionId: string; value: string }
    | {
        type: "action-access";
        actionId: string;
        value: PlatformPermissionAccess;
      },
): PlatformPermissionSet {
  const normalized = normalizePlatformPermissionSet(permissionSet, subjectType);
  if (update.type === "ring-access") {
    return updatePlatformPermissionRingAccess(normalized, update.ringId, update.value, subjectType);
  }
  if (update.type === "action-ring") {
    return updatePlatformPermissionActionRing(
      normalized,
      update.actionId,
      update.value,
      subjectType,
    );
  }
  return updatePlatformPermissionActionAccess(
    normalized,
    update.actionId,
    update.value,
    subjectType,
  );
}

export function PlatformResourceAccessSettings<TTeam extends PlatformAccessPrincipal>({
  teams,
  resourceLabel,
  selectedPrincipalId = "",
  onSelectedPrincipalIdChange,
  tableProps,
  subjectType,
  teamSubjectType = subjectType,
  systemPermissionSet,
  onSystemPermissionSetChange,
  systemRolePermissionSet,
  onSystemRolePermissionSetChange,
  roles,
  selectedRoleId = "member",
  onSelectedRoleIdChange,
  teamPermissionSet,
  onTeamPermissionSetChange,
  actionDefinitions,
  actionPresentation,
  animationKey = 0,
  disabled = false,
  backLabel = "Settings",
  permissionHeaderAction,
  className = "",
}: PlatformResourceAccessSettingsProps<TTeam>) {
  const systemPrincipal = getPlatformSystemAccessPrincipal(selectedPrincipalId);
  const selectedTeam = systemPrincipal
    ? null
    : teams.find((team) => String(team.id) === String(selectedPrincipalId)) || null;
  const normalizedSystemPermissionSet = normalizePlatformPermissionSet(
    systemPermissionSet,
    subjectType,
  );
  const normalizedTeamPermissionSet = normalizePlatformPermissionSet(
    teamPermissionSet,
    teamSubjectType,
  );
  const isRoleScopedSystemPrincipal =
    isPlatformRoleScopedSystemAccessPrincipalId(systemPrincipal?.id);
  const resolvedRoles = roles || (
    isRoleScopedSystemPrincipal
      ? PLATFORM_ORGANIZATION_ACCESS_ROLES
      : PLATFORM_RESOURCE_ACCESS_ROLES
  );
  const activeRoleId = resolvedRoles.some((role) => role.id === selectedRoleId)
    ? selectedRoleId
    : resolvedRoles[0]?.id || "member";
  const rolePermissionSet = isRoleScopedSystemPrincipal
    ? normalizePlatformRolePermissionSet(
        systemRolePermissionSet,
        teamSubjectType,
        activeRoleId,
      )
    : normalizePlatformRolePermissionSet(
        normalizedTeamPermissionSet,
        teamSubjectType,
        activeRoleId,
      );

  if (!systemPrincipal && !selectedTeam) {
    return (
      <PlatformResourceAccessTable
        {...tableProps}
        teams={teams}
        resourceLabel={resourceLabel}
        onOpenPermissions={(principal) => onSelectedPrincipalIdChange(String(principal.id))}
      />
    );
  }

  const principalName = systemPrincipal?.name || selectedTeam?.name || "Team";
  const canEditSystemPermissions = !disabled && Boolean(onSystemPermissionSetChange);
  const canEditRolePermissions =
    !disabled &&
    Boolean(
      isRoleScopedSystemPrincipal
        ? onSystemRolePermissionSetChange
        : onTeamPermissionSetChange,
    );
  const updateRolePermissionSet = (
    update:
      | {
          type: "ring-access";
          ringId: string;
          value: PlatformPermissionAccess;
        }
      | { type: "action-ring"; actionId: string; value: string }
      | {
          type: "action-access";
          actionId: string;
          value: PlatformPermissionAccess;
        },
  ) => {
    const nextPermissionSet = updatePermissionSet(
      rolePermissionSet,
      teamSubjectType,
      update,
    );
    if (isRoleScopedSystemPrincipal) {
      onSystemRolePermissionSetChange?.(activeRoleId, nextPermissionSet);
      return;
    }
    onTeamPermissionSetChange?.(activeRoleId, nextPermissionSet);
  };

  return (
    <section
      className={`platform-resource-access-settings playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-permissions-section playground-project-teams-section${className ? ` ${className}` : ""}`}
      data-platform-resource-access-settings="true"
    >
      <div className="playground-project-team-permissions-header">
        <button
          type="button"
          className="playground-project-team-permissions-back"
          onClick={() => onSelectedPrincipalIdChange("")}
        >
          <ArrowLeft width={13} height={13} strokeWidth={1.9} />
          <span>{backLabel}</span>
        </button>
        <div className="playground-project-team-permissions-title">{principalName} Permissions</div>
        {permissionHeaderAction}
      </div>

      {systemPrincipal && !isRoleScopedSystemPrincipal ? (
        <PlatformPermissionsPage
          permissionSet={normalizedSystemPermissionSet}
          subjectType={subjectType}
          actionDefinitions={actionDefinitions}
          actionPresentation={actionPresentation}
          animationKey={animationKey}
          disabled={!canEditSystemPermissions}
          onRingAccessChange={
            canEditSystemPermissions
              ? (ringId, access) =>
                  onSystemPermissionSetChange?.(
                    updatePermissionSet(normalizedSystemPermissionSet, subjectType, {
                      type: "ring-access",
                      ringId,
                      value: access,
                    }),
                  )
              : undefined
          }
          onActionRingChange={
            canEditSystemPermissions
              ? (actionId, ringId) =>
                  onSystemPermissionSetChange?.(
                    updatePermissionSet(normalizedSystemPermissionSet, subjectType, {
                      type: "action-ring",
                      actionId,
                      value: ringId,
                    }),
                  )
              : undefined
          }
          onActionAccessChange={
            canEditSystemPermissions
              ? (actionId, access) =>
                  onSystemPermissionSetChange?.(
                    updatePermissionSet(normalizedSystemPermissionSet, subjectType, {
                      type: "action-access",
                      actionId,
                      value: access,
                    }),
                  )
              : undefined
          }
        />
      ) : (
        <PlatformRolePermissionsPage
          roles={resolvedRoles}
          value={activeRoleId}
          onValueChange={(roleId) => onSelectedRoleIdChange?.(roleId)}
          roleAriaLabel={
            isRoleScopedSystemPrincipal
              ? `${resourceLabel} organization member roles`
              : `${resourceLabel} team roles`
          }
          roleKicker={
            isRoleScopedSystemPrincipal
              ? "Organization member role"
              : `${resourceLabel} role`
          }
          roleDescription={
            isRoleScopedSystemPrincipal
              ? `${resourceLabel}-scoped permissions for organization members assigned this role.`
              : `${resourceLabel}-scoped permissions for this role in ${principalName}.`
          }
          readOnly={activeRoleId === "owner"}
          className="platform-resource-access-settings__role-page playground-project-team-role-pages"
          roleListClassName="platform-resource-access-settings__role-sidebar playground-project-team-role-list"
          permissionPageClassName="platform-resource-access-settings__permission-page playground-project-team-role-permission-page"
          permissionHeaderClassName="platform-resource-access-settings__permission-header playground-project-team-role-permission-header"
          permissionSet={rolePermissionSet}
          subjectType={teamSubjectType}
          actionDefinitions={actionDefinitions}
          actionPresentation={actionPresentation}
          animationKey={animationKey}
          disabled={!canEditRolePermissions}
          onRingAccessChange={
            canEditRolePermissions
              ? (ringId, access) =>
                  updateRolePermissionSet({
                    type: "ring-access",
                    ringId,
                    value: access,
                  })
              : undefined
          }
          onActionRingChange={
            canEditRolePermissions
              ? (actionId, ringId) =>
                  updateRolePermissionSet({
                    type: "action-ring",
                    actionId,
                    value: ringId,
                  })
              : undefined
          }
          onActionAccessChange={
            canEditRolePermissions
              ? (actionId, access) =>
                  updateRolePermissionSet({
                    type: "action-access",
                    actionId,
                    value: access,
                  })
              : undefined
          }
        />
      )}
    </section>
  );
}
