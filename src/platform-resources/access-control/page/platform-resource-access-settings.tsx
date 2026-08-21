import { Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PlatformButton } from "../../../platform-ui/components/ui/button/index.js";
import { PlatformButtonSelector } from "../../../platform-ui/components/ui/selector/index.js";
import {
  normalizePlatformPermissionSet,
  normalizePlatformRolePermissionSet,
  PlatformRolePermissionsPage,
  updatePlatformPermissionActionAccess,
  updatePlatformPermissionActionRing,
  updatePlatformPermissionRingAccess,
  type PlatformPermissionAccess,
  type PlatformPermissionActionDefinition,
  type PlatformPermissionActionPresentation,
  type PlatformPermissionRole,
  type PlatformPermissionRoleMember,
  type PlatformPermissionSet,
  type PlatformPermissionSubjectType,
} from "../../../platform-ui/pages/permissions/index.js";
import {
  getPlatformAccessPrincipalProfileImageUrl,
  getPlatformAccessPrincipalRoleLabel,
  getPlatformSystemAccessPrincipal,
  isPlatformRoleScopedSystemAccessPrincipalId,
  type PlatformAccessPrincipal,
} from "../domain/access-principals.js";
import {
  PlatformResourceAccessPrincipalAvatar,
  PlatformResourceAccessTable,
} from "./platform-resource-access-table.js";
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

export const PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT =
  "platform:resource-access-navigation-change";

export const PLATFORM_RESOURCE_ACCESS_HISTORY_STATE_KEY =
  "__computerAgentsResourceAccess";

interface PlatformResourceAccessHistoryEntry {
  sourceId: string;
  principalId: string;
  resourceLabel: string;
  parentNavigationKey: string;
}

interface PlatformResourceAccessNavigationEventDetail {
  sourceId: string;
  open: boolean;
  principalId?: string;
  principalName?: string;
  principalKind?: "system" | "team";
  principalProfileImageUrl?: string;
  resourceLabel?: string;
  onClose?: () => void;
}

function publishPlatformResourceAccessNavigation(
  detail: PlatformResourceAccessNavigationEventDetail,
): void {
  if (typeof window === "undefined" || typeof window.CustomEvent !== "function") {
    return;
  }
  window.dispatchEvent(new CustomEvent(PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT, {
    detail,
  }));
}

function getPlatformResourceAccessParentNavigationKey(state: unknown): string {
  if (!state || typeof state !== "object" || Array.isArray(state)) return "";
  const entry = (state as { entry?: unknown }).entry;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return "";
  try {
    return JSON.stringify(entry);
  } catch {
    return "";
  }
}

function getPlatformResourceAccessHistoryEntry(
  state: unknown,
): PlatformResourceAccessHistoryEntry | null {
  if (!state || typeof state !== "object" || Array.isArray(state)) return null;
  const candidate = (state as Record<string, unknown>)[
    PLATFORM_RESOURCE_ACCESS_HISTORY_STATE_KEY
  ];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }
  const entry = candidate as Partial<PlatformResourceAccessHistoryEntry>;
  const sourceId = String(entry.sourceId || "").trim();
  const principalId = String(entry.principalId || "").trim();
  const resourceLabel = String(entry.resourceLabel || "").trim();
  if (!sourceId || !principalId || !resourceLabel) return null;
  return {
    sourceId,
    principalId,
    resourceLabel,
    parentNavigationKey: String(entry.parentNavigationKey || ""),
  };
}

function isPlatformResourceAccessHistoryEntryForPage(
  entry: PlatformResourceAccessHistoryEntry,
  state: unknown,
  sourceId: string,
  resourceLabel: string,
): boolean {
  if (entry.sourceId === sourceId) return true;
  return Boolean(
    entry.resourceLabel === resourceLabel &&
      entry.parentNavigationKey &&
      entry.parentNavigationKey ===
        getPlatformResourceAccessParentNavigationKey(state),
  );
}

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

type PlatformResourceAccessMemberRecord = Record<string, unknown>;

function asPlatformResourceAccessMemberRecord(
  value: unknown,
): PlatformResourceAccessMemberRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as PlatformResourceAccessMemberRecord)
    : null;
}

function getPlatformResourceAccessMemberIdentitySources(
  value: unknown,
): PlatformResourceAccessMemberRecord[] {
  const root = asPlatformResourceAccessMemberRecord(value);
  if (!root) return [];
  const sources: PlatformResourceAccessMemberRecord[] = [];
  const queued: PlatformResourceAccessMemberRecord[] = [root];
  const seen = new Set<PlatformResourceAccessMemberRecord>();
  const nestedKeys = [
    "profile",
    "user",
    "account",
    "member",
    "identity",
    "person",
    "membership",
  ];
  while (queued.length > 0 && sources.length < 16) {
    const source = queued.shift();
    if (!source || seen.has(source)) continue;
    seen.add(source);
    sources.push(source);
    nestedKeys.forEach((key) => {
      const nested = asPlatformResourceAccessMemberRecord(source[key]);
      if (nested && !seen.has(nested)) queued.push(nested);
    });
  }
  return sources;
}

function readPlatformResourceAccessMemberString(
  value: unknown,
  keys: readonly string[],
): string {
  for (const source of getPlatformResourceAccessMemberIdentitySources(value)) {
    for (const key of keys) {
      const candidate = source[key];
      if (typeof candidate === "string" || typeof candidate === "number") {
        const normalized = String(candidate).trim();
        if (normalized) return normalized;
      }
    }
  }
  return "";
}

function normalizePlatformResourceAccessMemberRoleId(value: unknown): string {
  const roleId = readPlatformResourceAccessMemberString(value, [
    "roleId",
    "role_id",
    "role",
    "teamRole",
    "team_role",
    "membershipRole",
    "membership_role",
  ]).toLowerCase();
  const legacyRoleMap: Record<string, string> = {
    create: "member",
    viewer: "member",
    configure: "contributor",
    develop: "contributor",
    editor: "contributor",
    administrator: "admin",
  };
  return legacyRoleMap[roleId] || roleId || "member";
}

function normalizePlatformResourceAccessRoleMembers(
  members: readonly unknown[],
  team?: unknown,
): Readonly<Record<string, readonly PlatformPermissionRoleMember[]>> {
  const teamRecord = asPlatformResourceAccessMemberRecord(team);
  const ownerRecord = asPlatformResourceAccessMemberRecord(teamRecord?.owner);
  const teamOwnerUserId =
    readPlatformResourceAccessMemberString(teamRecord, [
      "ownerUserId",
      "owner_user_id",
      "ownerId",
      "owner_id",
      "createdByUserId",
      "created_by_user_id",
    ]) ||
    readPlatformResourceAccessMemberString(ownerRecord, [
      "userId",
      "user_id",
      "uid",
      "id",
    ]);
  const teamOwnerEmail = (
    readPlatformResourceAccessMemberString(teamRecord, [
      "ownerEmail",
      "owner_email",
    ]) ||
    readPlatformResourceAccessMemberString(ownerRecord, [
      "email",
      "emailAddress",
      "email_address",
    ])
  ).toLowerCase();
  const membersByRole = new Map<string, PlatformPermissionRoleMember[]>();
  const seenIds = new Set<string>();
  members.forEach((member, index) => {
    const status = readPlatformResourceAccessMemberString(member, ["status"])
      .toLowerCase();
    if (["disabled", "inactive", "removed", "revoked", "suspended"].includes(status)) {
      return;
    }
    const email = readPlatformResourceAccessMemberString(member, [
      "email",
      "emailAddress",
      "email_address",
      "mail",
      "primaryEmail",
      "primary_email",
    ]).toLowerCase();
    const userId = readPlatformResourceAccessMemberString(member, [
      "userId",
      "user_id",
      "uid",
    ]);
    const id = readPlatformResourceAccessMemberString(member, [
      "id",
      "memberId",
      "member_id",
      "userId",
      "user_id",
      "uid",
    ]) || email || `team-member-${index}`;
    if (seenIds.has(id)) return;
    seenIds.add(id);
    const name = readPlatformResourceAccessMemberString(member, [
      "displayName",
      "display_name",
      "fullName",
      "full_name",
      "name",
      "memberName",
      "userName",
      "username",
    ]) || email || "Team member";
    const avatarUrl = readPlatformResourceAccessMemberString(member, [
      "photoURL",
      "photoUrl",
      "photo_url",
      "avatarUrl",
      "avatarURL",
      "avatar",
      "picture",
      "imageUrl",
      "profileImageUrl",
      "profile_image_url",
    ]);
    const roleId =
      (teamOwnerUserId && userId && teamOwnerUserId === userId) ||
      (teamOwnerEmail && email && teamOwnerEmail === email)
        ? "owner"
        : normalizePlatformResourceAccessMemberRoleId(member);
    const roleMembers = membersByRole.get(roleId) || [];
    roleMembers.push({
      id,
      name,
      ...(email && email.toLowerCase() !== name.toLowerCase()
        ? { detail: email }
        : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(status ? { status } : {}),
    });
    membersByRole.set(roleId, roleMembers);
  });
  return Object.fromEntries(membersByRole);
}

export interface PlatformResourceAccessSettingsProps<TTeam extends PlatformAccessPrincipal> {
  teams: readonly TTeam[];
  resourceLabel: string;
  selectedPrincipalId?: string;
  onSelectedPrincipalIdChange: (principalId: string) => void;
  tableProps?: Omit<
    PlatformResourceAccessTableProps<TTeam>,
    "teams" | "resourceLabel" | "onOpenPermissions"
  >;
  addTeams?: PlatformResourceAccessAddTeamsConfig<TTeam>;
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
  teamMembers?: readonly unknown[];
  teamMembersTeamId?: string;
  onRequestTeamMembers?: (teamId: string) => void | Promise<void>;
  onViewTeam?: (team: TTeam) => void;
  className?: string;
}

export interface PlatformResourceAccessAddTeamsConfig<
  TTeam extends PlatformAccessPrincipal,
> {
  teams: readonly TTeam[];
  totalTeamCount?: number;
  loading?: boolean;
  requiresPlan?: boolean;
  disabled?: boolean;
  label?: ReactNode;
  popupAriaLabel?: string;
  emptyContent?: ReactNode;
  planRequiredContent?: ReactNode;
  onRequestTeams?: () => void | Promise<void>;
  onAddTeam: (team: TTeam) => void | Promise<void>;
  getTeamProfileImageUrl?: (team: TTeam) => string;
}

export function PlatformResourceAccessAddTeams<
  TTeam extends PlatformAccessPrincipal,
>({
  teams,
  totalTeamCount = teams.length,
  loading = false,
  requiresPlan = false,
  disabled = false,
  label = "Add Teams",
  popupAriaLabel = "Add teams with resource access",
  emptyContent,
  planRequiredContent = "A team plan is required to manage team access.",
  onRequestTeams,
  onAddTeam,
  getTeamProfileImageUrl,
}: PlatformResourceAccessAddTeamsConfig<TTeam>) {
  const mountedRef = useRef(true);
  const directoryRequestStartedRef = useRef(false);
  const onRequestTeamsRef = useRef(onRequestTeams);
  const [open, setOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  onRequestTeamsRef.current = onRequestTeams;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const requestTeams = useCallback(async () => {
    const request = onRequestTeamsRef.current;
    if (
      loading ||
      requesting ||
      requiresPlan ||
      !request ||
      directoryRequestStartedRef.current
    ) {
      return;
    }
    directoryRequestStartedRef.current = true;
    setRequesting(true);
    try {
      await Promise.resolve(request());
    } catch {
      directoryRequestStartedRef.current = false;
      // The owning resource adapter surfaces authoritative loading errors.
    } finally {
      if (mountedRef.current) setRequesting(false);
    }
  }, [loading, requesting, requiresPlan]);

  useEffect(() => {
    // Access grants intentionally persist stable team IDs. Load the
    // authoritative organization directory as soon as the table mounts so a
    // restored grant is hydrated with its durable name and profile image
    // before the user has to open Add Teams.
    void requestTeams();
  }, [requestTeams]);

  const resolvedLoading = loading || requesting;
  const resolvedEmptyContent = requiresPlan
    ? planRequiredContent
    : emptyContent ||
      (totalTeamCount > 0
        ? "All available teams have access."
        : "No teams are available yet.");

  return (
    <PlatformButtonSelector
      mode="popup"
      buttonVariant="secondary"
      buttonSize="small"
      label={label}
      leading={<Plus width={14} height={14} strokeWidth={1.8} />}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) void requestTeams();
      }}
      closeOnSelect
      popupAriaLabel={popupAriaLabel}
      popupAlignment="right"
      popupRole="menu"
      popupVariant="minimal"
      popupWidth={260}
      disabled={disabled}
      className="platform-resource-access-settings__add-teams"
      popupClassName="platform-resource-access-settings__add-teams-popup"
    >
      {teams.length ? (
        teams.map((team) => {
          const teamName = String(team.name || "Team");
          const imageUrl = String(
            getTeamProfileImageUrl?.(team) ||
              getPlatformAccessPrincipalProfileImageUrl(team),
          ).trim();
          const roleLabel = getPlatformAccessPrincipalRoleLabel(team) || "Member";
          return (
            <button
              key={String(team.id)}
              type="button"
              role="menuitem"
              className="platform-data-table__menu-item platform-resource-access-settings__add-team-item"
              onClick={() => void onAddTeam(team)}
            >
              <PlatformResourceAccessPrincipalAvatar
                key={imageUrl || String(team.id)}
                name={teamName}
                imageUrl={imageUrl}
              />
              <span className="platform-data-table__menu-copy platform-resource-access-settings__add-team-copy">
                <span className="platform-resource-access-settings__add-team-name">
                  {teamName}
                </span>
                <span className="platform-resource-access-settings__add-team-role">
                  {roleLabel}
                </span>
              </span>
            </button>
          );
        })
      ) : (
        <div className="platform-resource-access-settings__add-teams-empty">
          {resolvedLoading ? "Loading teams..." : resolvedEmptyContent}
        </div>
      )}
    </PlatformButtonSelector>
  );
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
  addTeams,
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
  permissionHeaderAction,
  teamMembers = [],
  teamMembersTeamId = "",
  onRequestTeamMembers,
  onViewTeam,
  className = "",
}: PlatformResourceAccessSettingsProps<TTeam>) {
  const navigationSourceId = `resource-access-${useId().replace(/:/g, "")}`;
  const detailSectionRef = useRef<HTMLElement | null>(null);
  const selectedPrincipalIdRef = useRef(selectedPrincipalId);
  const onSelectedPrincipalIdChangeRef = useRef(onSelectedPrincipalIdChange);
  const onRequestTeamMembersRef = useRef(onRequestTeamMembers);
  const closePermissionDetailRef = useRef<() => void>(() => undefined);
  const systemPrincipal = getPlatformSystemAccessPrincipal(selectedPrincipalId);
  const selectedTeam = systemPrincipal
    ? null
    : teams.find((team) => String(team.id) === String(selectedPrincipalId)) || null;
  const selectedPrincipal = systemPrincipal || selectedTeam;
  const selectedPrincipalProfileImageUrl = selectedTeam
    ? getPlatformAccessPrincipalProfileImageUrl(selectedTeam)
    : "";
  selectedPrincipalIdRef.current = selectedPrincipalId;
  onSelectedPrincipalIdChangeRef.current = onSelectedPrincipalIdChange;
  onRequestTeamMembersRef.current = onRequestTeamMembers;

  useEffect(() => {
    const selectedTeamId = String(selectedTeam?.id || "").trim();
    if (
      !selectedTeamId ||
      (selectedTeamId === String(teamMembersTeamId || "").trim() &&
        teamMembers.length > 0) ||
      !onRequestTeamMembersRef.current
    ) {
      return;
    }
    void Promise.resolve(onRequestTeamMembersRef.current(selectedTeamId)).catch(() => {
      // The owning resource adapter surfaces authoritative membership errors.
    });
  }, [selectedTeam?.id, teamMembers.length, teamMembersTeamId]);

  const openPermissionDetail = useCallback(
    (principalId: string) => {
      const normalizedPrincipalId = String(principalId || "").trim();
      if (!normalizedPrincipalId) return;
      if (typeof window !== "undefined" && window.history) {
        const currentState = window.history.state;
        const currentEntry = getPlatformResourceAccessHistoryEntry(currentState);
        const alreadyCurrent = currentEntry &&
          isPlatformResourceAccessHistoryEntryForPage(
            currentEntry,
            currentState,
            navigationSourceId,
            resourceLabel,
          ) &&
          currentEntry.principalId === normalizedPrincipalId;
        if (!alreadyCurrent) {
          window.history.pushState(
            {
              ...(currentState && typeof currentState === "object"
                ? currentState
                : {}),
              [PLATFORM_RESOURCE_ACCESS_HISTORY_STATE_KEY]: {
                sourceId: navigationSourceId,
                principalId: normalizedPrincipalId,
                resourceLabel,
                parentNavigationKey:
                  getPlatformResourceAccessParentNavigationKey(currentState),
              } satisfies PlatformResourceAccessHistoryEntry,
            },
            "",
            window.location.href,
          );
        }
      }
      onSelectedPrincipalIdChangeRef.current(normalizedPrincipalId);
    },
    [navigationSourceId, resourceLabel],
  );

  const closePermissionDetail = useCallback(() => {
    if (typeof window !== "undefined" && window.history) {
      const currentState = window.history.state;
      const currentEntry = getPlatformResourceAccessHistoryEntry(currentState);
      if (
        currentEntry &&
        isPlatformResourceAccessHistoryEntryForPage(
          currentEntry,
          currentState,
          navigationSourceId,
          resourceLabel,
        ) &&
        window.history.length > 1
      ) {
        window.history.back();
        return;
      }
    }
    onSelectedPrincipalIdChangeRef.current("");
  }, [navigationSourceId, resourceLabel]);
  closePermissionDetailRef.current = closePermissionDetail;

  useEffect(() => {
    const restoreHistoryState = (
      state: unknown,
      clearWhenMissing = true,
    ) => {
      const historyEntry = getPlatformResourceAccessHistoryEntry(state);
      if (
        historyEntry &&
        isPlatformResourceAccessHistoryEntryForPage(
          historyEntry,
          state,
          navigationSourceId,
          resourceLabel,
        )
      ) {
        if (selectedPrincipalIdRef.current !== historyEntry.principalId) {
          onSelectedPrincipalIdChangeRef.current(historyEntry.principalId);
        }
        return;
      }
      if (clearWhenMissing && selectedPrincipalIdRef.current) {
        onSelectedPrincipalIdChangeRef.current("");
      }
    };
    const handlePopState = (event: PopStateEvent) => {
      restoreHistoryState(event.state);
    };

    // Preserve an adapter-provided initial principal (for example a restored
    // resource settings state). Only browser traversal is authoritative for
    // closing it when the access-detail marker is absent.
    restoreHistoryState(window.history?.state, false);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Keep the access marker on the history entry that owns it. When the
      // user follows View Team (or any other full-page link), browser Back
      // must be able to reconstruct this exact nested access screen after the
      // resource component mounts again.
    };
  }, [navigationSourceId, resourceLabel]);

  useEffect(() => {
    if (!selectedPrincipal) return;

    let active = true;
    const publishOpenState = () => {
      if (!active) return;
      publishPlatformResourceAccessNavigation({
        sourceId: navigationSourceId,
        open: true,
        principalId: String(selectedPrincipal.id),
        principalName:
          String(selectedPrincipal.name || "Access").trim() || "Access",
        principalKind: systemPrincipal ? "system" : "team",
        principalProfileImageUrl: selectedPrincipalProfileImageUrl,
        resourceLabel,
        onClose: () => closePermissionDetailRef.current(),
      });
    };

    if (typeof window !== "undefined" && typeof window.queueMicrotask === "function") {
      window.queueMicrotask(publishOpenState);
    } else {
      Promise.resolve().then(publishOpenState);
    }

    return () => {
      active = false;
      publishPlatformResourceAccessNavigation({
        sourceId: navigationSourceId,
        open: false,
      });
    };
  }, [
    navigationSourceId,
    resourceLabel,
    selectedPrincipal?.id,
    selectedPrincipal?.name,
    selectedPrincipalProfileImageUrl,
    systemPrincipal?.id,
  ]);

  useLayoutEffect(() => {
    const host = detailSectionRef.current?.parentElement;
    if (!selectedPrincipal || !host) return;
    host.setAttribute(
      "data-platform-resource-access-detail-host",
      navigationSourceId,
    );
    return () => {
      if (
        host.getAttribute("data-platform-resource-access-detail-host") ===
        navigationSourceId
      ) {
        host.removeAttribute("data-platform-resource-access-detail-host");
      }
    };
  }, [navigationSourceId, selectedPrincipal?.id]);
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
  const isFlatSystemPrincipal = Boolean(
    systemPrincipal && !isRoleScopedSystemPrincipal,
  );
  const flatSystemRoleId = String(systemPrincipal?.id || "all-agents");
  const baseResolvedRoles: readonly PlatformPermissionRole<string>[] =
    isFlatSystemPrincipal
      ? [
          {
            id: flatSystemRoleId,
            label: String(systemPrincipal?.name || "All Agents"),
            description: String(
              systemPrincipal?.description ||
                "Default access policy for every agent in the organization.",
            ),
          },
        ]
      : roles ||
        (isRoleScopedSystemPrincipal
          ? PLATFORM_ORGANIZATION_ACCESS_ROLES
          : PLATFORM_RESOURCE_ACCESS_ROLES);
  const hasAuthoritativeTeamMembers = Boolean(
    selectedTeam &&
      String(selectedTeam.id) === String(teamMembersTeamId || "").trim(),
  );
  const teamMembersByRole = hasAuthoritativeTeamMembers
    ? normalizePlatformResourceAccessRoleMembers(teamMembers, selectedTeam)
    : {};
  const resolvedRoles: readonly PlatformPermissionRole<string>[] = selectedTeam
    ? baseResolvedRoles.map((role) => ({
        ...role,
        assignedMembers: hasAuthoritativeTeamMembers
          ? teamMembersByRole[role.id] || []
          : role.assignedMembers,
      }))
    : baseResolvedRoles;
  const activeRoleId = resolvedRoles.some((role) => role.id === selectedRoleId)
    ? selectedRoleId
    : resolvedRoles[0]?.id || "member";
  const rolePermissionSubjectType = isFlatSystemPrincipal
    ? subjectType
    : teamSubjectType;
  const rolePermissionSet = isFlatSystemPrincipal
    ? normalizedSystemPermissionSet
    : isRoleScopedSystemPrincipal
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
    const centralizedAddTeams = addTeams ? (
      <PlatformResourceAccessAddTeams {...addTeams} />
    ) : null;
    return (
      <PlatformResourceAccessTable
        {...tableProps}
        teams={teams}
        resourceLabel={resourceLabel}
        trailing={tableProps?.trailing ?? centralizedAddTeams}
        onOpenPermissions={(principal) => openPermissionDetail(String(principal.id))}
      />
    );
  }

  const canEditRolePermissions =
    !disabled &&
    Boolean(
      isFlatSystemPrincipal
        ? onSystemPermissionSetChange
        : isRoleScopedSystemPrincipal
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
      rolePermissionSubjectType,
      update,
    );
    if (isFlatSystemPrincipal) {
      onSystemPermissionSetChange?.(nextPermissionSet);
      return;
    }
    if (isRoleScopedSystemPrincipal) {
      onSystemRolePermissionSetChange?.(activeRoleId, nextPermissionSet);
      return;
    }
    onTeamPermissionSetChange?.(activeRoleId, nextPermissionSet);
  };

  return (
    <section
      ref={detailSectionRef}
      className={`platform-resource-access-settings${selectedTeam ? " is-team-detail-view" : " is-system-detail-view"} playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-permissions-section playground-project-teams-section${className ? ` ${className}` : ""}`}
      data-platform-resource-access-settings="true"
      data-platform-resource-access-view={selectedTeam ? "team" : "system"}
    >
      <PlatformRolePermissionsPage
        roles={resolvedRoles}
        value={activeRoleId}
        onValueChange={(roleId) => {
          if (!isFlatSystemPrincipal) onSelectedRoleIdChange?.(roleId);
        }}
        roleAriaLabel={
          isFlatSystemPrincipal
            ? `${resourceLabel} all agents policy`
            : isRoleScopedSystemPrincipal
              ? `${resourceLabel} organization member roles`
              : `${resourceLabel} team roles`
        }
        readOnly={!isFlatSystemPrincipal && activeRoleId === "owner"}
        className="platform-resource-access-settings__role-page playground-project-team-role-pages"
        roleListClassName="platform-resource-access-settings__role-sidebar playground-project-team-role-list"
        roleListPlacement="details-sidebar"
        roleListTitle="Roles"
        roleListFooter={
          selectedTeam && onViewTeam ? (
            <PlatformButton
              variant="primary"
              size="medium"
              fullWidth
              className="platform-resource-access-settings__view-team"
              onClick={() => onViewTeam(selectedTeam)}
            >
              View Team
            </PlatformButton>
          ) : null
        }
        roleHeaderAction={permissionHeaderAction}
        permissionPageClassName="platform-resource-access-settings__permission-page playground-project-team-role-permission-page"
        permissionHeaderClassName="platform-resource-access-settings__permission-header playground-project-team-role-permission-header"
        permissionSet={rolePermissionSet}
        subjectType={rolePermissionSubjectType}
        actionDefinitions={actionDefinitions}
        actionPresentation={actionPresentation}
        actionTablePresentation="grouped-rings"
        actionSearchPlaceholder="Search permissions"
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
    </section>
  );
}
