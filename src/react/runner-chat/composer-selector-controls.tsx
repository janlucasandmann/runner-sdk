import type { CSSProperties, RefObject } from "react";
import {
  Brain as LucideBrain,
  Check as LucideCheck,
  Monitor as LucideMonitor,
  Rocket as LucideRocket,
  X as LucideX,
} from "../../platform-ui/components/ui/hugeicons-compat.js";
import type { PlatformPopupAnimation } from "../../platform-ui/components/composite/popup/index.js";
import { PlatformHoverLabel } from "../../platform-ui/components/ui/icon-button/index.js";
import {
  PlatformAgentAvatar,
  PlatformAgentSelectorPopup,
} from "../../platform-ui/components/ui/selector/index.js";
import { PlatformSwitch } from "../../platform-ui/components/ui/switch/index.js";
import {
  RUNNER_REASONING_EFFORT_OPTIONS,
  getRunnerAgentOptionPhotoUrl,
  getRunnerProjectEnvironmentId,
  getRunnerReasoningEffortOption,
  type RunnerChatOption,
  type RunnerChatProjectOption,
} from "./agent-options.js";
import {
  RunnerComposerPopupSurface,
  renderComposerPopupPortal,
} from "./composer-popup.js";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCorporate,
} from "./icons.js";
import type {
  RunnerReasoningEffortId,
  RunnerWorkspaceSelectorMode,
} from "./voice-audio.js";

type ElementRef<T extends HTMLElement> = RefObject<T | null>;

interface PopupPresentationProps {
  animation: PlatformPopupAnimation | false;
  popupStyle: CSSProperties | null;
}

export interface RunnerComposerOrganizationSelectorProps
  extends PopupPresentationProps {
  buttonRef: ElementRef<HTMLButtonElement>;
  canChange: boolean;
  onSelect: (organizationId: string) => void;
  onToggle: () => void;
  open: boolean;
  options: RunnerChatOption[];
  organizationId: string | null;
  popupRef: ElementRef<HTMLDivElement>;
}

export function RunnerComposerOrganizationSelector({
  animation,
  buttonRef,
  canChange,
  onSelect,
  onToggle,
  open,
  options,
  organizationId,
  popupRef,
  popupStyle,
}: RunnerComposerOrganizationSelectorProps) {
  const normalizedOrganizationId = String(organizationId || "").trim();
  const selected =
    options.find((organization) => organization.id === normalizedOrganizationId)
    || options.find((organization) => organization.isDefault)
    || options[0]
    || null;
  const label = selected?.name || "Organization";

  return (
    <div className="tb-composer-organization-anchor">
      <button
        ref={buttonRef}
        type="button"
        className={`tb-composer-organization-selector ${open ? "active" : ""}`.trim()}
        onClick={() => {
          if (canChange) {
            onToggle();
          }
        }}
        disabled={!canChange}
        aria-label={`Organization: ${label}`}
        aria-expanded={open}
      >
        <IconCorporate
          className="tb-composer-organization-icon"
          strokeWidth={1.45}
        />
        <span className="tb-composer-organization-label">{label}</span>
        {canChange ? (
          <IconChevronDown className="tb-composer-organization-chevron" />
        ) : null}
      </button>

      {renderComposerPopupPortal(
        open ? (
          <RunnerComposerPopupSurface
            ref={popupRef}
            className="tb-popup-menu-inline tb-popup-menu-inline-agent tb-popup-menu-inline-organization"
            animation={animation}
          >
            <div className="tb-popup-menu-inline-body tb-popup-menu-inline-body-organization">
              {options.map((organization) => {
                const isSelected = selected?.id === organization.id;
                return (
                  <button
                    key={organization.id}
                    type="button"
                    className={`tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-organization ${isSelected ? "selected" : ""}`.trim()}
                    onClick={() => onSelect(organization.id)}
                  >
                    <IconCorporate
                      className="tb-popup-icon"
                      strokeWidth={1.6}
                    />
                    <span className="tb-popup-label">{organization.name}</span>
                    <span className="tb-popup-check-slot">
                      {isSelected ? (
                        <IconCheck className="tb-popup-check" />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </RunnerComposerPopupSurface>
        ) : null,
        popupStyle,
      )}
    </div>
  );
}

export interface RunnerAgentSelectorControlProps
  extends PopupPresentationProps {
  buttonRef: ElementRef<HTMLButtonElement>;
  displayedAgentLabel: string;
  hasApiKey: boolean;
  hidden: boolean;
  locked?: boolean;
  onCloseReasoning: () => void;
  onDoneReasoning: () => void;
  onOpenReasoning: () => void;
  onSelectAgent: (agentId: string) => void;
  onSelectReasoningEffort: (effort: RunnerReasoningEffortId) => void;
  onToggle: () => void;
  open: boolean;
  options: RunnerChatOption[];
  popupRef: ElementRef<HTMLDivElement>;
  reasoningEffort: RunnerReasoningEffortId;
  reasoningOpen: boolean;
  reasoningPopupAnimation: PlatformPopupAnimation | false;
  reasoningPopupRef: ElementRef<HTMLDivElement>;
  reasoningPopupStyle: CSSProperties | null;
  selectedAgentId: string;
  totalAgentCount: number;
}

export function RunnerAgentSelectorControl({
  animation,
  buttonRef,
  displayedAgentLabel,
  hasApiKey,
  hidden,
  locked = false,
  onCloseReasoning,
  onDoneReasoning,
  onOpenReasoning,
  onSelectAgent,
  onSelectReasoningEffort,
  onToggle,
  open,
  options,
  popupRef,
  popupStyle,
  reasoningEffort,
  reasoningOpen,
  reasoningPopupAnimation,
  reasoningPopupRef,
  reasoningPopupStyle,
  selectedAgentId,
  totalAgentCount,
}: RunnerAgentSelectorControlProps) {
  const selectedAgent = options.find((agent) => agent.id === selectedAgentId) || null;

  if (hidden || totalAgentCount === 0) {
    return null;
  }

  const selectedReasoningEffort =
    getRunnerReasoningEffortOption(reasoningEffort);
  return (
    <div className="tb-selector-anchor tb-selector-anchor-agent">
      <PlatformHoverLabel
        className="tb-composer-selector-hover-label"
        label="Agent"
        placement="top"
      >
        <button
          ref={buttonRef}
          type="button"
          className={`tb-inline-selector tb-inline-selector-agent ${open ? "active" : ""} ${locked ? "is-locked" : ""}`.trim()}
          onClick={locked ? undefined : onToggle}
          disabled={locked}
          aria-disabled={locked}
        >
          {selectedAgent ? (
            <PlatformAgentAvatar
              name={selectedAgent.name}
              avatarUrl={getRunnerAgentOptionPhotoUrl(selectedAgent)}
              compact
            />
          ) : null}
          <span className="tb-inline-selector-label" title={displayedAgentLabel}>
            {displayedAgentLabel}
          </span>
          <span className="tb-composer-agent-button-effort">
            {selectedReasoningEffort.label}
          </span>
          <IconChevronDown className="tb-inline-selector-chevron" />
        </button>
      </PlatformHoverLabel>

      {renderComposerPopupPortal(
        open ? (
          <RunnerComposerPopupSurface
            ref={popupRef}
            className="platform-selector__popup tb-popup-menu-inline tb-popup-menu-inline-agent"
            animation={animation}
            animateHeight
          >
            {!hasApiKey ? (
              <div className="tb-popup-note">
                <div className="tb-popup-note-title">API key required</div>
                <div className="tb-popup-note-body">
                  Enter an API key in the playground sidebar to select an agent.
                </div>
              </div>
            ) : (
              <PlatformAgentSelectorPopup
                value={selectedAgentId}
                options={options.map((agent) => ({
                  value: agent.id,
                  name: agent.name,
                  avatarUrl: getRunnerAgentOptionPhotoUrl(agent),
                  searchText: agent.description || "",
                }))}
                onValueChange={(agentId) => onSelectAgent(agentId)}
                ariaLabel="Agents and squads"
                searchPlaceholder="Search agents..."
                searchAriaLabel="Search agents and squads"
                emptyContent="No agents or squads match your search."
                className="tb-composer-agent-selector-popup"
                optionClassName="tb-composer-agent-option"
                footer={(
                  <button
                    type="button"
                    className={`tb-popup-row tb-popup-row-core-action tb-agent-reasoning-effort-entry ${reasoningOpen ? "selected" : ""}`.trim()}
                    onClick={onOpenReasoning}
                  >
                    <LucideBrain
                      className="tb-popup-icon"
                      strokeWidth={1.75}
                    />
                    <span className="tb-popup-label">Reasoning effort</span>
                    <span className="tb-popup-value">
                      {selectedReasoningEffort.label}
                    </span>
                    <IconChevronRight className="tb-popup-chevron" />
                  </button>
                )}
              />
            )}
          </RunnerComposerPopupSurface>
        ) : null,
        popupStyle,
      )}

      {renderComposerPopupPortal(
        reasoningOpen ? (
          <RunnerComposerPopupSurface
            ref={reasoningPopupRef}
            className="tb-popup-menu-side tb-popup-menu-agent-reasoning"
            animation={reasoningPopupAnimation}
          >
            <div className="tb-popup-attach-topbar">
              <button
                type="button"
                className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close"
                onClick={onCloseReasoning}
                aria-label="Close reasoning effort popup"
              >
                <LucideX
                  className="tb-popup-attach-topbar-icon"
                  strokeWidth={1.75}
                />
              </button>
              <div className="tb-popup-attach-topbar-title">
                Reasoning effort
              </div>
              <button
                type="button"
                className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm"
                onClick={onDoneReasoning}
                aria-label="Done"
              >
                <LucideCheck
                  className="tb-popup-attach-topbar-icon"
                  strokeWidth={2}
                />
              </button>
            </div>
            <div
              className="tb-agent-reasoning-effort-panel tb-agent-reasoning-effort-panel-side"
            >
              <PlatformSwitch
                className="tb-agent-reasoning-effort-tabs"
                ariaLabel="Reasoning effort"
                fullWidth
                value={selectedReasoningEffort.id}
                options={RUNNER_REASONING_EFFORT_OPTIONS.map((option) => ({
                  value: option.id,
                  label: option.label,
                  title: option.description,
                }))}
                onValueChange={(nextEffort) => {
                  onSelectReasoningEffort(
                    nextEffort as RunnerReasoningEffortId,
                  );
                }}
              />
            </div>
          </RunnerComposerPopupSurface>
        ) : null,
        reasoningPopupStyle,
      )}
    </div>
  );
}

export interface RunnerWorkspaceSelectorControlProps
  extends PopupPresentationProps {
  buttonRef: ElementRef<HTMLButtonElement>;
  displayedWorkspaceLabel: string;
  effectiveMode: RunnerWorkspaceSelectorMode;
  environments: RunnerChatOption[];
  hasApiKey: boolean;
  hidden: boolean;
  locked?: boolean;
  mode: RunnerWorkspaceSelectorMode;
  onModeChange: (mode: RunnerWorkspaceSelectorMode) => void;
  onSelectEnvironment: (environmentId: string) => void;
  onSelectProject: (projectId: string) => void;
  onToggle: () => void;
  open: boolean;
  popupRef: ElementRef<HTMLDivElement>;
  projects: RunnerChatProjectOption[];
  selectedEnvironmentId: string;
  selectedProjectId: string;
}

export function RunnerWorkspaceSelectorControl({
  animation,
  buttonRef,
  displayedWorkspaceLabel,
  effectiveMode,
  environments,
  hasApiKey,
  hidden,
  locked = false,
  mode,
  onModeChange,
  onSelectEnvironment,
  onSelectProject,
  onToggle,
  open,
  popupRef,
  popupStyle,
  projects,
  selectedEnvironmentId,
  selectedProjectId,
}: RunnerWorkspaceSelectorControlProps) {
  if (hidden) {
    return null;
  }

  const emptyLabel =
    mode === "projects"
      ? "No projects available."
      : "No computers available.";

  return (
    <div className="tb-selector-anchor tb-selector-anchor-workspace">
      <PlatformHoverLabel
        className="tb-composer-selector-hover-label"
        label="Environment"
        placement="top"
      >
        <button
          ref={buttonRef}
          type="button"
          className={`tb-inline-selector ${open ? "active" : ""} ${locked ? "is-locked" : ""}`.trim()}
          onClick={locked ? undefined : onToggle}
          disabled={locked}
          aria-disabled={locked}
        >
          <span className="tb-inline-selector-label" title={displayedWorkspaceLabel}>
            {displayedWorkspaceLabel}
          </span>
          <IconChevronDown className="tb-inline-selector-chevron" />
        </button>
      </PlatformHoverLabel>

      {renderComposerPopupPortal(
        open ? (
          <RunnerComposerPopupSurface
            ref={popupRef}
            className="tb-popup-menu-inline tb-popup-menu-inline-right tb-popup-menu-inline-workspace"
            animation={animation}
          >
            {!hasApiKey ? (
              <div className="tb-popup-note">
                <div className="tb-popup-note-title">API key required</div>
                <div className="tb-popup-note-body">
                  Enter an API key in the playground sidebar to select a
                  workspace.
                </div>
              </div>
            ) : (
              <>
                <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                  <PlatformSwitch
                    className="tb-popup-selector-switch"
                    ariaLabel="Workspace type"
                    value={mode}
                    options={[
                      { value: "computers", label: "Computers" },
                      { value: "projects", label: "Projects" },
                    ]}
                    onValueChange={(nextMode) => {
                      if (
                        nextMode === "computers"
                        || nextMode === "projects"
                      ) {
                        onModeChange(nextMode);
                      }
                    }}
                  />
                </div>
                <div className="tb-popup-menu-inline-body tb-popup-menu-inline-body-agent tb-popup-menu-inline-body-workspace">
                  {mode === "projects" ? (
                    projects.length > 0 ? (
                      projects.map((project) => {
                        const projectEnvironmentId =
                          getRunnerProjectEnvironmentId(project);
                        const isSelected =
                          effectiveMode === "projects"
                          && selectedProjectId === project.id;
                        return (
                          <button
                            key={project.id}
                            type="button"
                            className={`tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-workspace ${isSelected ? "selected" : ""}`}
                            onClick={() => onSelectProject(project.id)}
                            disabled={!projectEnvironmentId}
                            title={
                              !projectEnvironmentId
                                ? "This project has no linked computer."
                                : project.name
                            }
                          >
                            <LucideRocket
                              className="tb-popup-icon"
                              strokeWidth={1.75}
                            />
                            <span className="tb-popup-label">
                              {project.name}
                            </span>
                            <span className="tb-popup-check-slot">
                              {isSelected ? (
                                <IconCheck className="tb-popup-check" />
                              ) : null}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="tb-popup-menu-inline-empty">
                        <div className="tb-popup-empty-state">
                          {emptyLabel}
                        </div>
                      </div>
                    )
                  ) : environments.length > 0 ? (
                    environments.map((environment) => {
                      const isSelected =
                        effectiveMode === "computers"
                        && selectedEnvironmentId === environment.id;
                      return (
                        <button
                          key={environment.id}
                          type="button"
                          className={`tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-workspace ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            onSelectEnvironment(environment.id);
                          }}
                        >
                          <LucideMonitor
                            className="tb-popup-icon"
                            strokeWidth={1.75}
                          />
                          <span className="tb-popup-label">
                            {environment.name}
                          </span>
                          <span className="tb-popup-check-slot">
                            {isSelected ? (
                              <IconCheck className="tb-popup-check" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="tb-popup-menu-inline-empty">
                      <div className="tb-popup-empty-state">{emptyLabel}</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </RunnerComposerPopupSurface>
        ) : null,
        popupStyle,
      )}
    </div>
  );
}
