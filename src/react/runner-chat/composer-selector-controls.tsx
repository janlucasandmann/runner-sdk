import type { CSSProperties, RefObject } from "react";
import {
  Brain as LucideBrain,
  Building2 as LucideBuilding2,
  Check as LucideCheck,
  Monitor as LucideMonitor,
  Rocket as LucideRocket,
  X as LucideX,
} from "lucide-react";
import {
  PlatformPopupSurface,
  type PlatformPopupAnimation,
} from "../../platform-ui/components/composite/popup/index.js";
import { PlatformSwitch } from "../../platform-ui/components/ui/switch/index.js";
import {
  RUNNER_REASONING_EFFORT_OPTIONS,
  getRunnerAgentOptionProviderType,
  getRunnerAgentProviderIcon,
  getRunnerAgentSelectorMode,
  getRunnerProjectEnvironmentId,
  getRunnerReasoningEffortOption,
  type RunnerChatOption,
  type RunnerChatProjectOption,
} from "./agent-options.js";
import { renderComposerPopupPortal } from "./composer-popup.js";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconLayers,
  IconUser,
} from "./icons.js";
import type {
  RunnerAgentSelectorMode,
  RunnerReasoningEffortId,
  RunnerWorkspaceSelectorMode,
} from "./voice-audio.js";

type ElementRef<T extends HTMLElement> = RefObject<T | null>;

interface PopupPresentationProps {
  animation: PlatformPopupAnimation | false;
  popupStyle: CSSProperties | null;
}

function RunnerAgentOptionIcon({ agent }: { agent: RunnerChatOption }) {
  const providerIcon = getRunnerAgentProviderIcon(
    getRunnerAgentOptionProviderType(agent),
  );
  if (!providerIcon) {
    return <IconUser className="tb-popup-icon" />;
  }

  const className = [
    "tb-popup-icon",
    "tb-popup-provider-icon",
    providerIcon.className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      className={className}
      src={providerIcon.src}
      alt=""
      title={providerIcon.alt}
      aria-hidden="true"
      draggable={false}
    />
  );
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
        <LucideBuilding2
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
          <PlatformPopupSurface
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
                    <LucideBuilding2
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
          </PlatformPopupSurface>
        ) : null,
        popupStyle,
      )}
    </div>
  );
}

export interface RunnerAgentSelectorControlProps
  extends PopupPresentationProps {
  availableModes: RunnerAgentSelectorMode[];
  buttonRef: ElementRef<HTMLButtonElement>;
  displayedAgentLabel: string;
  hasApiKey: boolean;
  hidden: boolean;
  mode: RunnerAgentSelectorMode;
  onCloseReasoning: () => void;
  onDoneReasoning: () => void;
  onModeChange: (mode: RunnerAgentSelectorMode) => void;
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
  availableModes,
  buttonRef,
  displayedAgentLabel,
  hasApiKey,
  hidden,
  mode,
  onCloseReasoning,
  onDoneReasoning,
  onModeChange,
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
  if (hidden || totalAgentCount === 0) {
    return null;
  }

  const selectedReasoningEffort =
    getRunnerReasoningEffortOption(reasoningEffort);
  const emptyLabel =
    mode === "teams"
      ? "No teams available."
      : mode === "humans"
        ? "No humans available."
        : "No agents available.";

  return (
    <div className="tb-selector-anchor">
      <button
        ref={buttonRef}
        type="button"
        className={`tb-inline-selector tb-inline-selector-agent ${open ? "active" : ""}`.trim()}
        onClick={onToggle}
      >
        <span>{displayedAgentLabel}</span>
        <span className="tb-composer-agent-button-effort">
          {selectedReasoningEffort.label}
        </span>
        <IconChevronDown className="tb-inline-selector-chevron" />
      </button>

      {renderComposerPopupPortal(
        open ? (
          <PlatformPopupSurface
            ref={popupRef}
            className="tb-popup-menu-inline tb-popup-menu-inline-agent"
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
              <>
                <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                  <PlatformSwitch
                    className="tb-popup-selector-switch"
                    ariaLabel="Agent type"
                    value={mode}
                    options={availableModes.map((availableMode) => ({
                      value: availableMode,
                      label:
                        availableMode === "teams"
                          ? "Squads"
                          : availableMode === "humans"
                            ? "Humans"
                            : "Agents",
                    }))}
                    onValueChange={(nextMode) => {
                      onModeChange(nextMode as RunnerAgentSelectorMode);
                    }}
                  />
                </div>
                <div className="tb-popup-menu-inline-body tb-popup-menu-inline-body-agent">
                  {options.length > 0 ? (
                    options.map((agent) => {
                      const isTeamAgent =
                        getRunnerAgentSelectorMode(agent) === "teams";
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          className={`tb-popup-row tb-popup-row-select tb-popup-row-agent ${selectedAgentId === agent.id ? "selected" : ""}`}
                          onClick={() => onSelectAgent(agent.id)}
                        >
                          {isTeamAgent ? (
                            <IconLayers className="tb-popup-icon" />
                          ) : (
                            <RunnerAgentOptionIcon agent={agent} />
                          )}
                          <span className="tb-popup-label">{agent.name}</span>
                          <span className="tb-popup-check-slot">
                            {selectedAgentId === agent.id ? (
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
              </>
            )}
          </PlatformPopupSurface>
        ) : null,
        popupStyle,
      )}

      {renderComposerPopupPortal(
        reasoningOpen ? (
          <PlatformPopupSurface
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
          </PlatformPopupSurface>
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
    <div className="tb-selector-anchor">
      <button
        ref={buttonRef}
        type="button"
        className={`tb-inline-selector ${open ? "active" : ""}`.trim()}
        onClick={onToggle}
      >
        <span>{displayedWorkspaceLabel}</span>
        <IconChevronDown className="tb-inline-selector-chevron" />
      </button>

      {renderComposerPopupPortal(
        open ? (
          <PlatformPopupSurface
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
          </PlatformPopupSurface>
        ) : null,
        popupStyle,
      )}
    </div>
  );
}
