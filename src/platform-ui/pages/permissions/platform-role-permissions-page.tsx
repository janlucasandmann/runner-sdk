import type { PlatformRolePermissionsPageProps } from "./permission-types.js";
import { PlatformPermissionsPage } from "./platform-permissions-page.js";

export function PlatformRolePermissionsPage<TId extends string = string>({
  roles,
  value,
  onValueChange,
  roleAriaLabel = "Roles",
  roleKicker = "Role",
  roleTitle,
  roleDescription,
  roleHeaderAction,
  readOnly = false,
  className = "",
  roleListClassName = "",
  permissionPageClassName = "",
  permissionHeaderClassName = "",
  ...permissionProps
}: PlatformRolePermissionsPageProps<TId>) {
  const selectedRole = roles.find((role) => role.id === value) || roles[0];
  if (!selectedRole) return null;

  return (
    <div
      className={`platform-role-permissions-page playground-team-role-pages${className ? ` ${className}` : ""}`}
      data-platform-role-permissions-page="true"
    >
      <div
        className={`platform-role-permissions-page__roles playground-team-role-list${roleListClassName ? ` ${roleListClassName}` : ""}`}
        role="tablist"
        aria-label={roleAriaLabel}
        data-platform-role-sidebar="true"
      >
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            role="tab"
            className={`platform-role-permissions-page__role playground-team-role-card${selectedRole.id === role.id ? " is-active" : ""}`}
            aria-selected={selectedRole.id === role.id}
            disabled={role.disabled}
            onClick={() => onValueChange(role.id)}
          >
            <span className="platform-role-permissions-page__role-title playground-team-role-card-title">
              {role.label}
            </span>
            {role.description ? (
              <span className="platform-role-permissions-page__role-description playground-team-role-card-description">
                {role.description}
              </span>
            ) : null}
            {role.meta ? (
              <span className="platform-role-permissions-page__role-meta playground-team-role-card-meta">
                {role.meta}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div
        className={`platform-role-permissions-page__content playground-team-role-permission-page${readOnly ? " is-read-only" : ""}${permissionPageClassName ? ` ${permissionPageClassName}` : ""}`}
      >
        <div
          className={`platform-role-permissions-page__header playground-team-role-permission-header${permissionHeaderClassName ? ` ${permissionHeaderClassName}` : ""}`}
        >
          <div>
            {roleKicker ? (
              <div className="platform-role-permissions-page__kicker playground-team-role-permission-kicker">
                {roleKicker}
              </div>
            ) : null}
            <h2 className="platform-role-permissions-page__title playground-team-role-permission-title">
              {roleTitle ?? selectedRole.label}
            </h2>
            {(roleDescription ?? selectedRole.description) ? (
              <p className="platform-role-permissions-page__description playground-team-role-permission-copy">
                {roleDescription ?? selectedRole.description}
              </p>
            ) : null}
          </div>
          {roleHeaderAction}
        </div>

        <PlatformPermissionsPage
          {...permissionProps}
          disabled={readOnly || permissionProps.disabled}
        />
      </div>
    </div>
  );
}
