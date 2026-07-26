import type { ReactNode } from "react";
import { PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { DotLoader } from "../../../../../platform-ui/components/ui/dot-loader/index.js";

const PROJECT_SUMMARY_ITEM_LIMIT = 3;

export interface ProjectSummaryTeamItem {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ProjectSummaryResourceItem {
  id: string;
  name: string;
  icon?: ReactNode;
  source?: unknown;
}

export interface ProjectSummaryDetailsProps {
  teams: readonly ProjectSummaryTeamItem[];
  resources: readonly ProjectSummaryResourceItem[];
  teamsLoading?: boolean;
  resourcesLoading?: boolean;
  onTeamsSelect?: () => void;
  onResourcesSelect?: () => void;
  onResourceSelect?: (resource: ProjectSummaryResourceItem) => void;
  className?: string;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "T"
  );
}

function ProjectSummaryRow({
  label,
  loading,
  emptyLabel,
  onSelect,
  children,
}: {
  label: string;
  loading: boolean;
  emptyLabel: string;
  onSelect?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="platform-project-summary-details__row">
      {onSelect ? (
        <button
          type="button"
          className="platform-project-summary-details__label"
          onClick={onSelect}
        >
          {label}
        </button>
      ) : (
        <span className="platform-project-summary-details__label">{label}</span>
      )}
      <div className="platform-project-summary-details__items">
        {loading ? (
          <span
            className="platform-project-summary-details__loading"
            role="status"
            aria-label={`Loading ${label}`}
          >
            <DotLoader dotCount={4} dotSize={2} gap={2} />
          </span>
        ) : children ? (
          children
        ) : (
          <span className="platform-project-summary-details__empty">{emptyLabel}</span>
        )}
        {onSelect ? (
          <PlatformSecondaryButton
            type="button"
            size="small"
            className="platform-project-summary-details__show-all"
            aria-label={`Show all ${label.toLowerCase()}`}
            onClick={onSelect}
          >
            Show all
          </PlatformSecondaryButton>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectSummaryDetails({
  teams,
  resources,
  teamsLoading = false,
  resourcesLoading = false,
  onTeamsSelect,
  onResourcesSelect,
  onResourceSelect,
  className = "",
}: ProjectSummaryDetailsProps) {
  return (
    <section
      className={joinClassNames("platform-project-summary-details", className)}
      aria-label="Project access and resources"
    >
      <ProjectSummaryRow
        label="Teams"
        loading={teamsLoading}
        emptyLabel="No teams have access"
        onSelect={onTeamsSelect}
      >
        {teams.length
          ? teams.slice(0, PROJECT_SUMMARY_ITEM_LIMIT).map((team) => (
              <span
                className="platform-project-summary-details__item is-team"
                key={team.id}
                title={team.name}
              >
                <span className="platform-project-summary-details__team-avatar" aria-hidden="true">
                  {getInitials(team.name)}
                  {team.imageUrl ? (
                    <img
                      className="platform-project-summary-details__team-avatar-image"
                      src={team.imageUrl}
                      alt=""
                      draggable={false}
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                  ) : null}
                </span>
                <span className="platform-project-summary-details__item-label">{team.name}</span>
              </span>
            ))
          : null}
      </ProjectSummaryRow>

      <ProjectSummaryRow
        label="Resources"
        loading={resourcesLoading}
        emptyLabel="No resources connected"
        onSelect={onResourcesSelect}
      >
        {resources.length
          ? resources.slice(0, PROJECT_SUMMARY_ITEM_LIMIT).map((resource) => {
              const content = (
                <>
                  {resource.icon ? (
                    <span
                      className="platform-project-summary-details__resource-icon"
                      aria-hidden="true"
                    >
                      {resource.icon}
                    </span>
                  ) : null}
                  <span className="platform-project-summary-details__item-label">
                    {resource.name}
                  </span>
                </>
              );
              return onResourceSelect ? (
                <button
                  type="button"
                  className="platform-project-summary-details__item is-resource"
                  key={resource.id}
                  title={resource.name}
                  onClick={() => onResourceSelect(resource)}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="platform-project-summary-details__item is-resource"
                  key={resource.id}
                  title={resource.name}
                >
                  {content}
                </span>
              );
            })
          : null}
      </ProjectSummaryRow>
    </section>
  );
}
