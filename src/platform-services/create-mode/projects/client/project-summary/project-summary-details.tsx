import type { CSSProperties, ReactNode } from "react";
import { PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { DotLoader } from "../../../../../platform-ui/components/ui/dot-loader/index.js";

const PROJECT_SUMMARY_ITEM_LIMIT = 3;

export interface ProjectSummaryResourceItem {
  id: string;
  name: string;
  icon?: ReactNode;
  source?: unknown;
}

export interface ProjectSummaryMilestoneItem {
  id: string;
  name: string;
  progressPercent: number;
  source?: unknown;
}

export interface ProjectSummaryDetailsProps {
  resources: readonly ProjectSummaryResourceItem[];
  milestones?: readonly ProjectSummaryMilestoneItem[];
  resourcesLoading?: boolean;
  milestonesLoading?: boolean;
  onResourcesSelect?: () => void;
  onMilestonesSelect?: () => void;
  onResourceSelect?: (resource: ProjectSummaryResourceItem) => void;
  onMilestoneSelect?: (milestone: ProjectSummaryMilestoneItem) => void;
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
  resources,
  milestones = [],
  resourcesLoading = false,
  milestonesLoading = false,
  onResourcesSelect,
  onMilestonesSelect,
  onResourceSelect,
  onMilestoneSelect,
  className = "",
}: ProjectSummaryDetailsProps) {
  return (
    <section
      className={joinClassNames("platform-project-summary-details", className)}
      aria-label="Project resources and milestones"
    >
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

      <ProjectSummaryRow
        label="Milestones"
        loading={milestonesLoading}
        emptyLabel="No milestones yet"
        onSelect={onMilestonesSelect}
      >
        {milestones.length
          ? milestones.slice(0, PROJECT_SUMMARY_ITEM_LIMIT).map((milestone) => {
              const normalizedPercent = Math.max(
                0,
                Math.min(100, Math.round(milestone.progressPercent || 0)),
              );
              const content = (
                <>
                  <span
                    className="platform-project-summary-details__milestone-ring"
                    style={{
                      "--project-milestone-progress": `${normalizedPercent}%`,
                    } as CSSProperties}
                    aria-hidden="true"
                  />
                  <span className="platform-project-summary-details__item-label">
                    {milestone.name}
                  </span>
                </>
              );
              return onMilestoneSelect ? (
                <button
                  type="button"
                  className="platform-project-summary-details__item is-milestone"
                  key={milestone.id}
                  title={`${milestone.name} - ${normalizedPercent}% complete`}
                  aria-label={`${milestone.name}, ${normalizedPercent}% complete`}
                  onClick={() => onMilestoneSelect(milestone)}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="platform-project-summary-details__item is-milestone"
                  key={milestone.id}
                  title={`${milestone.name} - ${normalizedPercent}% complete`}
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
