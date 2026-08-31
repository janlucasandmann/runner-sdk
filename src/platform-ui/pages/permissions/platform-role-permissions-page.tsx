import {
  Bot,
  Code2,
  CreditCard,
  Crown,
  Eye,
  KeyRound,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "../../components/ui/hugeicons-compat.js";
import { useEffect, useRef, useState } from "react";
import { PlatformPopup } from "../../components/composite/popup/index.js";
import { PlatformDetailSidebar } from "../../components/composite/detail-sidebar/index.js";
import { PlatformUiCard } from "../../components/composite/ui-card/index.js";
import type {
  PlatformPermissionRoleMember,
  PlatformRolePermissionsPageProps,
} from "./permission-types.js";
import { PlatformPermissionsPage } from "./platform-permissions-page.js";

function getRoleLabelText(label: unknown) {
  return typeof label === "string" || typeof label === "number" ? String(label) : "Role";
}

function getRoleNavigationIcon(roleId: string): LucideIcon {
  const normalizedRoleId = String(roleId || "").trim().toLowerCase();
  if (normalizedRoleId === "owner") return Crown;
  if (normalizedRoleId === "admin") return ShieldCheck;
  if (normalizedRoleId === "developer" || normalizedRoleId === "contributor") {
    return Code2;
  }
  if (normalizedRoleId === "member") return UserRound;
  if (normalizedRoleId === "billing") return CreditCard;
  if (normalizedRoleId === "viewer") return Eye;
  if (normalizedRoleId.includes("agent")) return Bot;
  if (
    normalizedRoleId.includes("organization") ||
    normalizedRoleId.includes("org-member")
  ) {
    return UsersRound;
  }
  return KeyRound;
}

function getMemberInitials(name: string) {
  const parts = String(name || "Member")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function PlatformRoleAssignedMembers({
  roleLabel,
  members,
}: {
  roleLabel: unknown;
  members: readonly PlatformPermissionRoleMember[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const label = getRoleLabelText(roleLabel);
  const visibleMembers = members;

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || surfaceRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (members.length === 0) return null;

  return (
    <PlatformPopup
      open={open}
      rootRef={rootRef}
      surfaceRef={surfaceRef}
      rootClassName="platform-role-permissions-page__assigned-members"
      surfaceClassName="platform-role-permissions-page__assigned-members-popup"
      surfaceProps={{ role: "dialog", "aria-label": `${label} members` }}
      variant="minimal"
      portal
      placement="bottom-end"
      animation="down-in"
      trigger={({ open: isOpen }) => (
        <button
          type="button"
          className={`platform-role-permissions-page__assigned-members-trigger${isOpen ? " is-open" : ""}`}
          aria-label={`${label} assigned members`}
          aria-haspopup="dialog"
          aria-expanded={isOpen ? "true" : "false"}
          onClick={() => setOpen((current) => !current)}
        >
          <span
            className="platform-role-permissions-page__assigned-avatar-group"
            aria-hidden="true"
          >
            {visibleMembers.map((member) => (
              <span className="platform-role-permissions-page__assigned-avatar" key={member.id}>
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" />
                ) : (
                  getMemberInitials(member.name)
                )}
              </span>
            ))}
          </span>
        </button>
      )}
    >
      <div className="platform-role-permissions-page__assigned-popup-title">{label} members</div>
      {members.length > 0 ? (
        <div className="platform-role-permissions-page__assigned-popup-list">
          {members.map((member) => (
            <div className="platform-role-permissions-page__assigned-popup-row" key={member.id}>
              <span className="platform-role-permissions-page__assigned-popup-avatar">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" />
                ) : (
                  getMemberInitials(member.name)
                )}
              </span>
              <span className="platform-role-permissions-page__assigned-popup-copy">
                <span className="platform-role-permissions-page__assigned-popup-name">
                  {member.name}
                </span>
                {member.detail ? (
                  <span className="platform-role-permissions-page__assigned-popup-detail">
                    {member.detail}
                  </span>
                ) : null}
              </span>
              {member.status ? (
                <span className="platform-role-permissions-page__assigned-popup-status">
                  {member.status}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="platform-role-permissions-page__assigned-popup-empty">
          No members assigned to this role.
        </div>
      )}
    </PlatformPopup>
  );
}

export function PlatformRolePermissionsPage<TId extends string = string>({
  roles,
  value,
  onValueChange,
  roleAriaLabel = "Roles",
  roleKicker = "Role",
  roleTitle,
  roleDescription,
  roleHeaderAction,
  ownerRoleId = "owner" as TId,
  ownerRoleHeaderAction,
  readOnly = false,
  className = "",
  roleListClassName = "",
  roleListPlacement = "leading",
  roleListTitle,
  roleListFooter,
  permissionPageClassName = "",
  permissionHeaderClassName = "",
  ...permissionProps
}: PlatformRolePermissionsPageProps<TId>) {
  const selectedRole = roles.find((role) => role.id === value) || roles[0];
  if (!selectedRole) return null;

  const roleList = (
    <div
      className={`platform-role-permissions-page__roles playground-team-role-list${roleListClassName ? ` ${roleListClassName}` : ""}`}
      role="tablist"
      aria-label={roleAriaLabel}
      data-platform-role-sidebar="true"
    >
      {roles.map((role) => {
        const RoleIcon = getRoleNavigationIcon(String(role.id));
        return (
          <button
            key={role.id}
            type="button"
            role="tab"
            className={`platform-role-permissions-page__role playground-team-role-card${selectedRole.id === role.id ? " is-active" : ""}`}
            aria-selected={selectedRole.id === role.id}
            disabled={role.disabled}
            onClick={() => onValueChange(role.id)}
          >
            <span className="platform-role-permissions-page__role-heading playground-team-role-card-heading">
              <span className="platform-role-permissions-page__role-label">
                <RoleIcon
                  className="platform-role-permissions-page__role-icon"
                  width={14}
                  height={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span className="platform-role-permissions-page__role-title playground-team-role-card-title">
                  {role.label}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  const permissionPage = (
    <div
      className={`platform-role-permissions-page__content playground-team-role-permission-page${readOnly ? " is-read-only" : ""}${permissionPageClassName ? ` ${permissionPageClassName}` : ""}`}
    >
      <div
        className={`platform-role-permissions-page__header playground-team-role-permission-header${permissionHeaderClassName ? ` ${permissionHeaderClassName}` : ""}`}
      >
        <div>
          <h2 className="platform-role-permissions-page__title playground-team-role-permission-title">
            {roleTitle ?? selectedRole.label}
          </h2>
        </div>
        {selectedRole.id === ownerRoleId && ownerRoleHeaderAction !== undefined ? (
          ownerRoleHeaderAction
        ) : selectedRole.assignedMembers !== undefined ? (
          <PlatformRoleAssignedMembers
            roleLabel={selectedRole.label}
            members={selectedRole.assignedMembers}
          />
        ) : (
          roleHeaderAction
        )}
      </div>

      <PlatformPermissionsPage
        {...permissionProps}
        disabled={readOnly || permissionProps.disabled}
      />
    </div>
  );

  return (
    <div
      className={`platform-role-permissions-page playground-team-role-pages${className ? ` ${className}` : ""}`}
      data-platform-role-permissions-page="true"
      data-platform-role-list-placement={roleListPlacement}
    >
      {roleListPlacement === "details-sidebar" ? (
        <>
          <PlatformDetailSidebar
            ariaLabel={roleAriaLabel}
            className="platform-role-permissions-page__details-sidebar"
          >
            <PlatformUiCard
              as="section"
              variant="sidebar"
              cardTitle={roleListTitle}
              className="platform-role-permissions-page__details-card"
            >
              {roleList}
              {roleListFooter ? (
                <div className="platform-role-permissions-page__details-footer">
                  {roleListFooter}
                </div>
              ) : null}
            </PlatformUiCard>
          </PlatformDetailSidebar>
          {permissionPage}
        </>
      ) : (
        <>
          {roleList}
          {permissionPage}
        </>
      )}
    </div>
  );
}
