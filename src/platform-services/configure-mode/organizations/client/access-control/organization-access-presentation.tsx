import type { ReactNode } from "react";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";

export function OrganizationAccessStatusLabel({
  status,
}: {
  status: string;
}) {
  const normalized = String(status || "").toLowerCase();
  let variant: PlatformLabelVariant = "gray";
  if (["active", "approved", "allow", "allowed"].includes(normalized)) {
    variant = "green";
  } else if (["pending", "approval_required"].includes(normalized)) {
    variant = "yellow";
  } else if (["denied", "deny"].includes(normalized)) {
    variant = "red";
  } else if (normalized === "disabled") {
    variant = "gray";
  }
  return (
    <PlatformLabel variant={variant}>
      {normalized ? normalized.replace(/[_-]+/g, " ") : "unknown"}
    </PlatformLabel>
  );
}

export function OrganizationAccessAvatar({
  label,
  imageUrl = "",
}: {
  label: string;
  imageUrl?: string;
}) {
  const initials = String(label || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
  return (
    <span className="organization-access-control__avatar" aria-hidden="true">
      {imageUrl ? <img src={imageUrl} alt="" /> : <span>{initials || "?"}</span>}
    </span>
  );
}

export function OrganizationAccessIdentity({
  label,
  detail,
  imageUrl,
}: {
  label: ReactNode;
  detail?: ReactNode;
  imageUrl?: string;
}) {
  return (
    <span className="organization-access-control__identity">
      <OrganizationAccessAvatar label={String(label || "")} imageUrl={imageUrl} />
      <span className="organization-access-control__identity-copy">
        <span>{label}</span>
        {detail ? <small>{detail}</small> : null}
      </span>
    </span>
  );
}

export function OrganizationAccessField({
  label,
  description,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="organization-access-control__field">
      <span className="organization-access-control__field-label">{label}</span>
      {description ? (
        <span className="organization-access-control__field-description">
          {description}
        </span>
      ) : null}
      {children}
    </label>
  );
}

export function OrganizationAccessNotice({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "error";
  children: ReactNode;
}) {
  return (
    <div
      className={`organization-access-control__notice is-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

