import type { ElementType, ReactNode } from "react";

export type PlatformPermissionAccess = "full_access" | "ask_for_permission" | "read_only" | "no_access" | string;

export interface PlatformPermissionAccessOption {
  id: PlatformPermissionAccess;
  label: string;
  progress?: number;
}

export interface PlatformPermissionRingDefinition {
  id: string;
  number: number;
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  defaultAccess: PlatformPermissionAccess;
  icon?: ElementType;
}

export interface PlatformPermissionActionDefinition {
  id: string;
  ringId: string;
  label: string;
  description: string;
  subjectTypes?: readonly string[];
}

export interface PlatformPermissionRingPolicy {
  defaultAccess?: PlatformPermissionAccess;
}

export interface PlatformPermissionActionPolicy {
  ringId?: string;
  access?: PlatformPermissionAccess;
}

export interface PlatformPermissionRule {
  id?: string;
  targetId?: string;
  path?: string;
  access: PlatformPermissionAccess;
  note?: string;
}

export interface PlatformPermissionResourcePolicy {
  defaultAccess?: PlatformPermissionAccess;
  rules?: PlatformPermissionRule[];
}

export interface PlatformPermissionSet {
  version?: number;
  subjectType?: string;
  defaultAccess?: PlatformPermissionAccess;
  rings?: Record<string, PlatformPermissionRingPolicy | PlatformPermissionAccess | undefined>;
  actions?: Record<string, PlatformPermissionActionPolicy | PlatformPermissionAccess | undefined>;
  resources?: Record<string, PlatformPermissionResourcePolicy | PlatformPermissionAccess | undefined>;
}

export interface PlatformPermissionActionPresentation {
  label?: ReactNode;
  description?: ReactNode;
}

export type PlatformPermissionsOverviewVariant = "default" | "compact";

export interface PlatformPermissionsOverviewProps {
  permissionSet?: PlatformPermissionSet | null;
  accessOptions?: readonly PlatformPermissionAccessOption[];
  ringDefinitions?: readonly PlatformPermissionRingDefinition[];
  animationKey?: string | number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  variant?: PlatformPermissionsOverviewVariant;
  onRingAccessChange?: (ringId: string, access: PlatformPermissionAccess) => void;
}

export interface PlatformPermissionsSettingsSummaryProps
  extends Omit<PlatformPermissionsOverviewProps, "disabled" | "onRingAccessChange"> {
  title?: ReactNode;
  tooltip?: string;
  editLabel?: ReactNode;
  editDisabled?: boolean;
  onEdit?: () => void;
}

export interface PlatformPermissionsPageProps {
  permissionSet?: PlatformPermissionSet | null;
  accessOptions?: readonly PlatformPermissionAccessOption[];
  ringDefinitions?: readonly PlatformPermissionRingDefinition[];
  actionDefinitions?: readonly PlatformPermissionActionDefinition[];
  subjectType?: string;
  actionPresentation?: Readonly<Record<string, PlatformPermissionActionPresentation | undefined>>;
  animationKey?: string | number;
  disabled?: boolean;
  showOverview?: boolean;
  showEffectiveAccess?: boolean;
  ariaLabel?: string;
  className?: string;
  onRingAccessChange?: (ringId: string, access: PlatformPermissionAccess) => void;
  onActionRingChange?: (actionId: string, ringId: string) => void;
  onActionAccessChange?: (actionId: string, access: PlatformPermissionAccess) => void;
}

export interface PlatformPermissionRole<TId extends string = string> {
  id: TId;
  label: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  disabled?: boolean;
}

export interface PlatformRolePermissionsPageProps<TId extends string = string>
  extends Omit<PlatformPermissionsPageProps, "className"> {
  roles: readonly PlatformPermissionRole<TId>[];
  value: TId;
  onValueChange: (roleId: TId) => void;
  roleAriaLabel?: string;
  roleKicker?: ReactNode;
  roleTitle?: ReactNode;
  roleDescription?: ReactNode;
  roleHeaderAction?: ReactNode;
  readOnly?: boolean;
  className?: string;
  roleListClassName?: string;
  permissionPageClassName?: string;
  permissionHeaderClassName?: string;
}
