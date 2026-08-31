import { Cable } from "../../../platform-ui/components/ui/hugeicons-compat.js";
import type { ReactNode } from "react";

export type ConnectionIdentityKind = "tags" | "plugins";
export type ConnectionIdentityIconVariant = "default" | "catalog";

export interface ConnectionIdentityIconProps {
  kind: ConnectionIdentityKind;
  connectionId?: string;
  icon?: ReactNode;
  logoUrl?: string;
  logoAlt?: string;
  logoClassName?: string;
  variant?: ConnectionIdentityIconVariant;
  className?: string;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function ConnectionIdentityIcon({
  kind,
  connectionId = "",
  icon,
  logoUrl,
  logoAlt = "",
  logoClassName,
  variant = "default",
  className,
}: ConnectionIdentityIconProps) {
  const normalizedId = connectionId.trim().toLowerCase();
  const isTag = kind === "tags";

  return (
    <span
      className={joinClassNames(
        "connection-identity-icon",
        "resource-overview-identity__visual",
        "is-connection",
        variant === "catalog" && "is-catalog",
        isTag ? "is-tag" : "is-plugin",
        isTag && "is-size-compact",
        isTag && normalizedId === "email" && "is-email",
        isTag && normalizedId === "discord" && "is-discord",
        isTag && normalizedId === "telegram" && "is-telegram",
        !isTag && normalizedId === "box" && "is-box",
        !isTag && normalizedId === "gitlab" && "is-gitlab",
        !isTag && normalizedId === "linear" && "is-linear",
        !isTag && normalizedId === "stripe" && "is-stripe",
        !isTag && normalizedId === "supabase" && "is-supabase",
        className,
      )}
      aria-hidden="true"
    >
      {logoUrl ? (
        <img src={logoUrl} alt={logoAlt} className={logoClassName} />
      ) : (
        icon || <Cable width={17} height={17} strokeWidth={1.8} />
      )}
    </span>
  );
}
