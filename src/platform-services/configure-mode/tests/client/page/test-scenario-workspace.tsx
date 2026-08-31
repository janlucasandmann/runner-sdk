import {
  ChevronDown,
  ChevronUp,
  Copy,
  FlaskConical,
  Play,
  Plus,
  Trash2,
} from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import {
  PlatformPrimaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformIconButton } from "../../../../../platform-ui/components/ui/icon-button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import type { TestsApi } from "../api/index.js";
import {
  getTestCaseCategoryLabel,
  getTestCaseExecutionLabel,
  getTestCaseTargetKind,
  getTestCaseTargetSummary,
  validateTestCaseConfiguration,
  validateTestCaseTargetCompatibility,
  type TestCaseDefinition,
  type TestCaseResult,
  type TestPlan,
  type TestPlanDefinition,
  type TestWorkspaceResourceOption,
} from "../domain/index.js";
import { TestCaseDefinitionBuilder } from "./test-case-definition-builder.js";
import { useTestTargetResources } from "./use-test-target-resources.js";

interface TestScenarioWorkspaceProps {
  plan: TestPlan;
  definition: TestPlanDefinition;
  api: TestsApi;
  latestResultById: ReadonlyMap<string, TestCaseResult>;
  busy?: boolean;
  onDefinitionChange: (definition: TestPlanDefinition) => void;
  onAdd: () => void;
  onDuplicate: (scenario: TestCaseDefinition) => void;
  onRemove: (scenario: TestCaseDefinition) => void;
  onTry: (definition: TestPlanDefinition, scenarioIds: string[]) => Promise<void>;
}

function resultVariant(status: string) {
  if (status === "passed") return "green" as const;
  if (["failed", "error", "completed_with_errors"].includes(status)) return "red" as const;
  if (["queued", "running"].includes(status)) return "blue" as const;
  return "gray" as const;
}

function moveScenario(
  definition: TestPlanDefinition,
  scenarioId: string,
  direction: -1 | 1,
): TestPlanDefinition {
  const index = definition.cases.findIndex((scenario) => scenario.id === scenarioId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= definition.cases.length) return definition;
  const cases = [...definition.cases];
  [cases[index], cases[nextIndex]] = [cases[nextIndex], cases[index]];
  return { ...definition, cases };
}

export function TestScenarioWorkspace({
  plan,
  definition,
  api,
  latestResultById,
  busy = false,
  onDefinitionChange,
  onAdd,
  onDuplicate,
  onRemove,
  onTry,
}: TestScenarioWorkspaceProps) {
  const [selectedId, setSelectedId] = useState(definition.cases[0]?.id || "");
  const [workflowVersions, setWorkflowVersions] = useState<TestWorkspaceResourceOption[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [builderError, setBuilderError] = useState("");
  const [trying, setTrying] = useState(false);
  const [error, setError] = useState("");
  const targetResources = useTestTargetResources(api);

  useEffect(() => {
    if (definition.cases.some((scenario) => scenario.id === selectedId)) return;
    setSelectedId(definition.cases[0]?.id || "");
  }, [definition.cases, selectedId]);

  const loadWorkflowVersions = useCallback(async (workflowId: string) => {
    if (!workflowId) {
      setWorkflowVersions([]);
      return;
    }
    setVersionsLoading(true);
    try {
      setWorkflowVersions(await api.listMetronomeVersions(workflowId));
    } catch {
      setWorkflowVersions([]);
    } finally {
      setVersionsLoading(false);
    }
  }, [api]);

  const selectedScenario = useMemo(
    () => definition.cases.find((scenario) => scenario.id === selectedId) || null,
    [definition.cases, selectedId],
  );
  const selectedIndex = selectedScenario
    ? definition.cases.findIndex((scenario) => scenario.id === selectedScenario.id)
    : -1;
  const selectedTarget = selectedScenario
    ? getTestCaseTargetKind(selectedScenario)
    : null;
  const resourceLoading = selectedTarget === "computer_agents_function"
    ? targetResources.functionsLoading
    : selectedTarget === "metronome_workflow"
      ? targetResources.workflowsLoading
      : false;
  const resourceError = selectedTarget === "computer_agents_function"
    ? targetResources.functionsError
    : selectedTarget === "metronome_workflow"
      ? targetResources.workflowsError
      : "";
  const scenarioError = selectedScenario
    ? validateTestCaseTargetCompatibility(
        selectedScenario,
        plan.targetType,
        plan.targetId,
      ) || validateTestCaseConfiguration(selectedScenario)
    : "";
  const validationError = resourceError || builderError || scenarioError;

  const updateSelected = useCallback((nextScenario: TestCaseDefinition) => {
    onDefinitionChange({
      ...definition,
      cases: definition.cases.map((scenario) => (
        scenario.id === nextScenario.id ? nextScenario : scenario
      )),
    });
  }, [definition, onDefinitionChange]);

  const tryScenario = async () => {
    if (!selectedScenario || validationError || busy || trying) return;
    setTrying(true);
    setError("");
    try {
      await onTry(definition, [selectedScenario.id]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to try the scenario.");
    } finally {
      setTrying(false);
    }
  };

  return (
    <div className="tests-scenario-workspace">
      <aside className="tests-scenario-workspace__sidebar" aria-label="Test scenarios">
        <div className="tests-scenario-workspace__sidebar-header">
          <span>Scenarios</span>
          <PlatformIconButton
            aria-label="Add scenario"
            size="small"
            disabled={busy}
            onClick={onAdd}
          >
            <Plus width={14} height={14} aria-hidden="true" />
          </PlatformIconButton>
        </div>
        <div className="tests-scenario-workspace__list">
          {definition.cases.map((scenario) => {
            const result = latestResultById.get(scenario.id);
            return (
              <button
                key={scenario.id}
                type="button"
                className={selectedId === scenario.id ? "is-active" : ""}
                onClick={() => setSelectedId(scenario.id)}
              >
                <span>
                  <strong>{scenario.name}</strong>
                  <small>{getTestCaseExecutionLabel(scenario)} · {getTestCaseCategoryLabel(scenario)}</small>
                </span>
                {result ? (
                  <i className={`is-${result.status}`} title={`Last result: ${result.status}`} />
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="tests-scenario-workspace__editor">
        {selectedScenario ? (
          <>
            <header className="tests-scenario-workspace__editor-header">
              <div className="tests-scenario-workspace__identity">
                <input
                  value={selectedScenario.name}
                  aria-label="Scenario name"
                  maxLength={500}
                  onChange={(event) => updateSelected({
                    ...selectedScenario,
                    name: event.currentTarget.value,
                  })}
                />
                <span>
                  {getTestCaseTargetSummary(selectedScenario)}
                  {latestResultById.get(selectedScenario.id) ? (
                    <PlatformLabel variant={resultVariant(
                      latestResultById.get(selectedScenario.id)?.status || "",
                    )}>
                      {latestResultById.get(selectedScenario.id)?.classification === "flaky"
                        ? "Flaky"
                        : latestResultById.get(selectedScenario.id)?.status}
                    </PlatformLabel>
                  ) : null}
                </span>
              </div>
              <div className="tests-scenario-workspace__actions">
                <PlatformIconButton
                  aria-label="Move scenario up"
                  size="small"
                  disabled={busy || selectedIndex <= 0}
                  onClick={() => onDefinitionChange(moveScenario(definition, selectedScenario.id, -1))}
                >
                  <ChevronUp width={14} height={14} aria-hidden="true" />
                </PlatformIconButton>
                <PlatformIconButton
                  aria-label="Move scenario down"
                  size="small"
                  disabled={busy || selectedIndex < 0 || selectedIndex >= definition.cases.length - 1}
                  onClick={() => onDefinitionChange(moveScenario(definition, selectedScenario.id, 1))}
                >
                  <ChevronDown width={14} height={14} aria-hidden="true" />
                </PlatformIconButton>
                <PlatformIconButton
                  aria-label="Duplicate scenario"
                  size="small"
                  disabled={busy}
                  onClick={() => onDuplicate(selectedScenario)}
                >
                  <Copy width={14} height={14} aria-hidden="true" />
                </PlatformIconButton>
                <PlatformIconButton
                  aria-label="Remove scenario"
                  size="small"
                  disabled={busy}
                  onClick={() => onRemove(selectedScenario)}
                >
                  <Trash2 width={14} height={14} aria-hidden="true" />
                </PlatformIconButton>
                <PlatformPrimaryButton
                  size="small"
                  disabled={busy || trying || Boolean(validationError) || selectedScenario.enabled === false}
                  onClick={() => void tryScenario()}
                >
                  <Play width={13} height={13} aria-hidden="true" />
                  {trying ? "Starting…" : "Try Scenario"}
                </PlatformPrimaryButton>
              </div>
            </header>
            <PlatformInstructionsEditor
              value={selectedScenario.description}
              onChange={(description) => updateSelected({ ...selectedScenario, description })}
              title="Description"
              placeholder="Describe the behavior and expected outcome."
              ariaLabel="Scenario description"
              readOnly={busy}
              stickyHeader={false}
              historyKey={`${plan.id}:${selectedScenario.id}:description`}
              variant="minimalistic-ui"
              contentVariant="text"
              className="tests-scenario-workspace__description"
            />
            {error || validationError ? (
              <p className="tests-form-error" role="alert">{error || validationError}</p>
            ) : null}
            <TestCaseDefinitionBuilder
              testCase={selectedScenario}
              functions={targetResources.functions}
              workflows={targetResources.workflows}
              workflowVersions={workflowVersions}
              resourcesLoading={resourceLoading}
              versionsLoading={versionsLoading}
              evidencePolicy={definition.evidencePolicy}
              onChange={updateSelected}
              onWorkflowRequest={(workflowId) => void loadWorkflowVersions(workflowId)}
              onValidationError={setBuilderError}
            />
          </>
        ) : (
          <PlatformEmptyState
            icon={FlaskConical}
            title="Build the first scenario"
            description="A scenario is one independently runnable behavior, contract, browser journey, or unit-test command."
            primaryAction={{ label: "Add Scenario", onClick: onAdd }}
          />
        )}
      </section>
    </div>
  );
}
