import {
  Bot as LucideBot,
  Calendar as LucideCalendar,
  Cloud as LucideCloud,
  Cpu as LucideCpu,
  Rocket as LucideRocket,
} from "lucide-react";
import type { RunnerCreatedResourcePreview } from "../runner-log-boxes.js";

export function renderTurnAgentAvatar(
  name: string,
  photoUrl?: string | null,
) {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    return null;
  }
  const normalizedPhotoUrl = String(photoUrl || "").trim();
  return (
    <span className="tb-turn-agent-avatar" aria-hidden="true" title={normalizedName}>
      {normalizedPhotoUrl
        ? (
          <img
            className="tb-turn-agent-avatar-image"
            src={normalizedPhotoUrl}
            alt={normalizedName.charAt(0).toUpperCase()}
          />
        )
        : (
          <span className="tb-turn-agent-avatar-fallback">
            {normalizedName.charAt(0).toUpperCase()}
          </span>
        )}
    </span>
  );
}

export function getRunnerComputerDisplayLabel(
  environmentName: string | null | undefined,
): string {
  const normalizedName = String(environmentName || "").trim() || "Default";
  return /\bcomputer\b/i.test(normalizedName)
    ? normalizedName
    : `${normalizedName} Computer`;
}

export function getRunnerSummaryResourceSubtitle(
  resource: RunnerCreatedResourcePreview,
): string {
  if (resource.resourceType === "agent") {
    return [resource.model, resource.isDefault ? "Default" : ""]
      .filter(Boolean)
      .join(" · ");
  }
  if (resource.resourceType === "skill") {
    return [resource.category, resource.isDefault ? "Default" : ""]
      .filter(Boolean)
      .join(" · ");
  }
  if (resource.resourceType === "environment") {
    return [resource.projectName, resource.isDefault ? "Default" : ""]
      .filter(Boolean)
      .join(" · ");
  }
  return [resource.status, resource.projectName].filter(Boolean).join(" · ");
}

function renderRunnerSummaryResourceIcon(
  resource: RunnerCreatedResourcePreview,
) {
  if (resource.resourceType === "agent") {
    return <LucideBot className="runner-summary-resource-icon" strokeWidth={1.8} />;
  }
  if (resource.resourceType === "skill") {
    return <LucideCpu className="runner-summary-resource-icon" strokeWidth={1.8} />;
  }
  if (resource.resourceType === "environment") {
    return <LucideCloud className="runner-summary-resource-icon" strokeWidth={1.8} />;
  }
  if (resource.resourceType === "project") {
    return <LucideRocket className="runner-summary-resource-icon" strokeWidth={1.8} />;
  }
  return <LucideCalendar className="runner-summary-resource-icon" strokeWidth={1.8} />;
}

export function getRunnerSummaryResourceChipVerb(
  resource: RunnerCreatedResourcePreview,
): string {
  return resource.mutationVerb === "updated" ? "Updated" : "Created";
}

export function renderRunnerSummaryResourceChip(
  resource: RunnerCreatedResourcePreview,
  options: {
    onClick?: (resource: RunnerCreatedResourcePreview) => void;
  } = {},
) {
  const typeLabel =
    resource.resourceType === "agent"
      ? "Agent"
      : resource.resourceType === "skill"
        ? "Skill"
        : resource.resourceType === "environment"
          ? "Environment"
          : resource.resourceType === "project"
            ? "Project"
            : "Milestone";
  const subtitle = getRunnerSummaryResourceSubtitle(resource);
  const isAgent = resource.resourceType === "agent";
  const className =
    `runner-summary-resource-chip is-${resource.resourceType} ${options.onClick ? "is-clickable" : ""}`.trim();
  const title = isAgent
    ? `${getRunnerSummaryResourceChipVerb(resource)} ${resource.name}`.trim()
    : [typeLabel, resource.name, subtitle].filter(Boolean).join(" · ");
  const content = isAgent
    ? (
      <>
        <span
          className={`runner-summary-resource-icon-slot is-${resource.resourceType}`.trim()}
          aria-hidden="true"
        >
          {renderRunnerSummaryResourceIcon(resource)}
        </span>
        <span className="runner-summary-resource-inline-text">
          {getRunnerSummaryResourceChipVerb(resource)} {resource.name}
        </span>
      </>
    )
    : (
      <>
        <span
          className={`runner-summary-resource-icon-slot is-${resource.resourceType}`.trim()}
          aria-hidden="true"
        >
          {renderRunnerSummaryResourceIcon(resource)}
        </span>
        <span className="runner-summary-resource-copy">
          <span className="runner-summary-resource-label">{typeLabel}</span>
          <span className="runner-summary-resource-name">{resource.name}</span>
          {subtitle
            ? <span className="runner-summary-resource-meta">{subtitle}</span>
            : null}
        </span>
      </>
    );

  if (options.onClick) {
    return (
      <button
        type="button"
        className={className}
        title={title}
        onClick={() => options.onClick?.(resource)}
      >
        {content}
      </button>
    );
  }
  return (
    <div className={className} title={title}>
      {content}
    </div>
  );
}
