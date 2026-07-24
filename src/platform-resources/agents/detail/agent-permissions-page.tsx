import { ArrowLeft } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  getPlatformPermissionAccessLabel,
  getPlatformPermissionAccessProgress,
  getPlatformPermissionRingAccessById,
  getPlatformPermissionRingEndColor,
  normalizePlatformPermissionSet,
  PlatformPermissionMiniRingIcon,
  PlatformPermissionsPage,
  PLATFORM_PERMISSION_RING_DEFINITIONS,
  updatePlatformPermissionActionAccess,
  updatePlatformPermissionActionRing,
  updatePlatformPermissionRingAccess,
  type PlatformPermissionActionPresentation,
  type PlatformPermissionSet,
} from "../../../platform-ui/pages/permissions/index.js";

export interface AgentPermissionsPageProps {
  permissionSet?: PlatformPermissionSet | null;
  animationKey?: string | number;
  disabled?: boolean;
  showOverview?: boolean;
  showEffectiveAccess?: boolean;
  ariaLabel?: string;
  className?: string;
  backLabel?: ReactNode;
  onBack?: () => void;
  actionPresentation?: Readonly<Record<string, PlatformPermissionActionPresentation | undefined>>;
  onPermissionSetChange?: (permissionSet: PlatformPermissionSet) => void;
}

export interface AgentPermissionRingIconsProps {
  permissionSet?: PlatformPermissionSet | null;
  className?: string;
  itemClassName?: string;
  ariaHidden?: boolean;
}

export interface AgentPermissionMetersProps {
  permissionSet?: PlatformPermissionSet | null;
  onOpenPermissions?: () => void;
  className?: string;
}

export function getAgentPermissionSummary(
  permissionSet?: PlatformPermissionSet | null,
): string {
  const normalizedPermissionSet = normalizePlatformPermissionSet(permissionSet, "agent");
  return PLATFORM_PERMISSION_RING_DEFINITIONS.map((ring) => (
    `${ring.shortLabel}: ${getPlatformPermissionAccessLabel(
      getPlatformPermissionRingAccessById(normalizedPermissionSet, ring.id),
    )}`
  )).join(" / ");
}

export function AgentPermissionRingIcons({
  permissionSet,
  className = "playground-agents-detail-permission-rings",
  itemClassName = "playground-agents-detail-permission-ring",
  ariaHidden = true,
}: AgentPermissionRingIconsProps) {
  const normalizedPermissionSet = normalizePlatformPermissionSet(permissionSet, "agent");
  return (
    <span className={className} aria-hidden={ariaHidden ? "true" : undefined}>
      {PLATFORM_PERMISSION_RING_DEFINITIONS.map((ring) => {
        const access = getPlatformPermissionRingAccessById(normalizedPermissionSet, ring.id);
        return (
          <span
            key={ring.id}
            className={itemClassName}
            title={`${ring.label}: ${getPlatformPermissionAccessLabel(access)}`}
          >
            <PlatformPermissionMiniRingIcon ringId={ring.id} access={access} />
          </span>
        );
      })}
    </span>
  );
}

export function AgentPermissionMeters({
  permissionSet,
  onOpenPermissions,
  className = "playground-agents-detail-permission-bars",
}: AgentPermissionMetersProps) {
  const normalizedPermissionSet = normalizePlatformPermissionSet(permissionSet, "agent");
  return (
    <div className={className}>
      {PLATFORM_PERMISSION_RING_DEFINITIONS.map((ring) => {
        const access = getPlatformPermissionRingAccessById(normalizedPermissionSet, ring.id);
        const accessLabel = getPlatformPermissionAccessLabel(access);
        return (
          <button
            key={ring.id}
            type="button"
            className={`playground-agents-detail-permission-meter is-${ring.id.replace("_", "-")}`}
            title={`${ring.shortLabel}: ${accessLabel}`}
            aria-label={`Open permissions tab. ${ring.shortLabel}: ${accessLabel}`}
            onClick={onOpenPermissions}
            disabled={!onOpenPermissions}
          >
            <span
              className="playground-agents-detail-permission-meter-track"
              aria-hidden="true"
              style={{
                "--agent-permission-bar-progress": `${getPlatformPermissionAccessProgress(access)}%`,
                "--agent-permission-bar-active": getPlatformPermissionRingEndColor(ring.id, 1),
                "--agent-permission-bar-muted": getPlatformPermissionRingEndColor(ring.id, 0.2),
              } as CSSProperties}
            />
            <span className="playground-agents-detail-permission-meter-copy">
              <span
                className="playground-agents-detail-permission-meter-swatch"
                aria-hidden="true"
                style={{
                  "--agent-permission-bar-active": getPlatformPermissionRingEndColor(ring.id, 1),
                } as CSSProperties}
              />
              <span className="playground-agents-detail-permission-meter-title">{ring.shortLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function AgentPermissionsPage({
  permissionSet,
  animationKey = 0,
  disabled = false,
  showOverview = true,
  showEffectiveAccess = false,
  ariaLabel = "Agent permissions",
  className = "",
  backLabel = "Settings",
  onBack,
  actionPresentation,
  onPermissionSetChange,
}: AgentPermissionsPageProps) {
  const normalizedPermissionSet = normalizePlatformPermissionSet(permissionSet, "agent");
  const canEdit = !disabled && Boolean(onPermissionSetChange);

  return (
    <section
      className="platform-agent-permissions-page"
      data-platform-agent-permissions-page="true"
    >
      {onBack ? (
        <div className="playground-project-team-permissions-header">
          <button
            type="button"
            className="playground-project-team-permissions-back"
            onClick={onBack}
          >
            <ArrowLeft width={13} height={13} strokeWidth={1.9} />
            <span>{backLabel}</span>
          </button>
        </div>
      ) : null}
      <PlatformPermissionsPage
        permissionSet={normalizedPermissionSet}
        subjectType="agent"
        animationKey={animationKey}
        disabled={!canEdit}
        showOverview={showOverview}
        showEffectiveAccess={showEffectiveAccess}
        ariaLabel={ariaLabel}
        className={className}
        actionPresentation={actionPresentation}
        onRingAccessChange={canEdit
          ? (ringId, access) => {
              onPermissionSetChange?.(
                updatePlatformPermissionRingAccess(normalizedPermissionSet, ringId, access, "agent"),
              );
            }
          : undefined}
        onActionRingChange={canEdit
          ? (actionId, ringId) => {
              onPermissionSetChange?.(
                updatePlatformPermissionActionRing(normalizedPermissionSet, actionId, ringId, "agent"),
              );
            }
          : undefined}
        onActionAccessChange={canEdit
          ? (actionId, access) => {
              onPermissionSetChange?.(
                updatePlatformPermissionActionAccess(normalizedPermissionSet, actionId, access, "agent"),
              );
            }
          : undefined}
      />
    </section>
  );
}
