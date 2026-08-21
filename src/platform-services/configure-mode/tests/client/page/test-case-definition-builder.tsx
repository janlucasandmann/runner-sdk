import {
  Activity,
  Camera,
  FileArchive,
  Network,
  Plus,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  PlatformInstructionsEditor,
} from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import {
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "../../../../../platform-ui/components/composite/settings-section/index.js";
import {
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformCheckbox } from "../../../../../platform-ui/components/ui/checkbox/index.js";
import { PlatformIconButton } from "../../../../../platform-ui/components/ui/icon-button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { PlatformToggle } from "../../../../../platform-ui/components/ui/toggle/index.js";
import {
  getDefaultTestCaseRequest,
  getTestCaseTargetKind,
  type TestCaseDefinition,
  type TestPlanDefinition,
  type TestWorkspaceResourceOption,
} from "../domain/index.js";
import { TestAssertionBuilder } from "./test-assertion-builder.js";

interface TestCaseDefinitionBuilderProps {
  testCase: TestCaseDefinition;
  functions: readonly TestWorkspaceResourceOption[];
  workflows: readonly TestWorkspaceResourceOption[];
  workflowVersions: readonly TestWorkspaceResourceOption[];
  resourcesLoading?: boolean;
  versionsLoading?: boolean;
  evidencePolicy: TestPlanDefinition["evidencePolicy"];
  onChange: (testCase: TestCaseDefinition) => void;
  onWorkflowRequest: (workflowId: string) => void;
  onValidationError: (error: string) => void;
}

interface JsonValueFieldProps {
  id: string;
  label: string;
  description?: string;
  className?: string;
  codeHeaderLabel?: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onValidationError: (id: string, error: string) => void;
}

interface ScenarioStepEditorProps {
  step: Record<string, unknown>;
  index: number;
  functions: readonly TestWorkspaceResourceOption[];
  workflows: readonly TestWorkspaceResourceOption[];
  onChange: (step: Record<string, unknown>) => void;
  onRemove: () => void;
  onValidationError: (id: string, error: string) => void;
}

const REQUEST_METHOD_OPTIONS = ["GET", "POST", "PUT", "PATCH", "DELETE"].map(
  (value) => ({ value, label: value }),
);

const SCENARIO_TARGET_OPTIONS = [
  {
    value: "computer_agents_function",
    label: "Function",
    description: "Invoke one Function endpoint.",
  },
  {
    value: "metronome_workflow",
    label: "Workflow",
    description: "Run one Metronome workflow.",
  },
  {
    value: "control_plane_readiness",
    label: "Platform readiness",
    description: "Inspect the platform readiness contract.",
  },
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function formatJson(value: unknown): string {
  const formatted = JSON.stringify(value === undefined ? null : value, null, 2);
  return typeof formatted === "string" ? formatted : "null";
}

function withCurrentOption(
  options: readonly TestWorkspaceResourceOption[],
  value: string,
  fallbackLabel: string,
) {
  const normalizedValue = String(value || "").trim();
  const normalized = options.map((option) => ({
    value: option.id,
    label: option.name,
    description: option.description,
  }));
  if (normalizedValue && !normalized.some((option) => option.value === normalizedValue)) {
    normalized.unshift({
      value: normalizedValue,
      label: fallbackLabel,
      description: normalizedValue,
    });
  }
  return normalized;
}

function TestResourceField({
  label,
  ariaLabel,
  value,
  options,
  loading = false,
  fullRow = true,
  placeholder,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  options: readonly TestWorkspaceResourceOption[];
  loading?: boolean;
  fullRow?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const selectorOptions = withCurrentOption(options, value, `${label} · ${value}`);
  return (
    <div className={`tests-case-builder__field${fullRow ? " is-span-2" : ""}`}>
      <span>{label}</span>
      {loading || selectorOptions.length > 0 ? (
        <PlatformSelector
          value={value}
          options={selectorOptions}
          fullWidth
          loading={loading}
          loadingContent={`Loading ${label.toLowerCase()}…`}
          emptyContent={`No ${label.toLowerCase()} are available.`}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
          onValueChange={onChange}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      )}
    </div>
  );
}

function JsonValueField({
  id,
  label,
  description,
  className = "",
  codeHeaderLabel,
  value,
  onChange,
  onValidationError,
}: JsonValueFieldProps) {
  const serializedValue = formatJson(value);
  const [source, setSource] = useState(() => serializedValue);
  const [error, setError] = useState("");
  const fieldIdRef = useRef(id);
  const committedValueRef = useRef(serializedValue);

  useEffect(() => {
    const fieldChanged = fieldIdRef.current !== id;
    if (fieldChanged || committedValueRef.current !== serializedValue) {
      setSource(serializedValue);
    }
    fieldIdRef.current = id;
    committedValueRef.current = serializedValue;
    setError("");
    onValidationError(id, "");
    return () => onValidationError(id, "");
  }, [id, onValidationError, serializedValue]);

  function update(nextSource: string) {
    setSource(nextSource);
    try {
      const parsed = JSON.parse(nextSource || "null") as unknown;
      committedValueRef.current = formatJson(parsed);
      setError("");
      onValidationError(id, "");
      onChange(parsed);
    } catch {
      const message = `${label} must contain valid JSON.`;
      setError(message);
      onValidationError(id, message);
    }
  }

  return (
    <div className={`tests-case-builder__field tests-case-builder__editor-field is-span-2${className ? ` ${className}` : ""}`}>
      {description ? <small>{description}</small> : null}
      {codeHeaderLabel ? <span>{label}</span> : null}
      <PlatformInstructionsEditor
        title={codeHeaderLabel || label}
        value={source}
        onChange={update}
        placeholder="Enter JSON."
        ariaLabel={label}
        historyKey={id}
        variant="minimalistic-ui"
        stickyHeader={false}
        editorMode="code"
        codeLanguage="json"
        codePath={`${id}.json`}
        className={`tests-case-builder__instructions-editor tests-case-builder__json-editor${error ? " is-invalid" : ""}`}
      />
      {error ? <em role="alert">{error}</em> : null}
    </div>
  );
}

function ReadinessFields({
  request,
  onChange,
}: {
  request: Record<string, unknown>;
  onChange: (request: Record<string, unknown>) => void;
}) {
  return (
    <div className="tests-case-builder__checks">
      <div>
        <PlatformCheckbox
          aria-label="Require database readiness"
          checked={request.requireDatabase === true}
          onClick={() => onChange({
            ...request,
            requireDatabase: request.requireDatabase !== true,
          })}
        />
        <span>
          <strong>Database</strong>
          <small>Require the canonical database readiness signal.</small>
        </span>
      </div>
      <div>
        <PlatformCheckbox
          aria-label="Require agent runtime readiness"
          checked={request.requireAgentRuntime === true}
          onClick={() => onChange({
            ...request,
            requireAgentRuntime: request.requireAgentRuntime !== true,
          })}
        />
        <span>
          <strong>Agent runtime</strong>
          <small>Require the agent runtime to report availability.</small>
        </span>
      </div>
    </div>
  );
}

function FunctionRequestFields({
  request,
  functions,
  resourcesLoading = false,
  fieldId,
  onChange,
  onValidationError,
}: {
  request: Record<string, unknown>;
  functions: readonly TestWorkspaceResourceOption[];
  resourcesLoading?: boolean;
  fieldId: string;
  onChange: (request: Record<string, unknown>) => void;
  onValidationError: (id: string, error: string) => void;
}) {
  const functionId = String(request.functionId || "");
  const method = String(request.method || "POST").toUpperCase();
  const path = String(request.path || "/");
  return (
    <div className="tests-case-builder__form-grid is-function-request">
      <TestResourceField
        label="Function"
        ariaLabel="Test Function"
        value={functionId}
        options={functions}
        loading={resourcesLoading}
        fullRow={false}
        placeholder="Select a Function"
        onChange={(value) => onChange({ ...request, functionId: value })}
      />
      <div className="tests-case-builder__field">
        <span>Method</span>
        <PlatformSelector
          value={method}
          options={REQUEST_METHOD_OPTIONS}
          fullWidth
          ariaLabel="Function request method"
          onValueChange={(value) => onChange({ ...request, method: value })}
        />
      </div>
      <label className="tests-case-builder__field">
        <span>Path</span>
        <input
          value={path}
          aria-label="Function request path"
          placeholder="/"
          onChange={(event) => onChange({ ...request, path: event.currentTarget.value })}
        />
      </label>
      <JsonValueField
        id={`${fieldId}:body`}
        label="Request body"
        className="tests-case-builder__request-body-field"
        codeHeaderLabel="JSON"
        value={request.body ?? null}
        onChange={(body) => onChange({ ...request, body })}
        onValidationError={onValidationError}
      />
    </div>
  );
}

function WorkflowRequestFields({
  request,
  workflows,
  workflowVersions = [],
  resourcesLoading = false,
  versionsLoading = false,
  fieldId,
  onChange,
  onWorkflowRequest,
  onValidationError,
}: {
  request: Record<string, unknown>;
  workflows: readonly TestWorkspaceResourceOption[];
  workflowVersions?: readonly TestWorkspaceResourceOption[];
  resourcesLoading?: boolean;
  versionsLoading?: boolean;
  fieldId: string;
  onChange: (request: Record<string, unknown>) => void;
  onWorkflowRequest?: (workflowId: string) => void;
  onValidationError: (id: string, error: string) => void;
}) {
  const workflowId = String(request.workflowId || "");
  const versionId = String(request.workflowVersionId || "");
  const versionOptions = [
    { value: "", label: "Latest published version", description: "Resolve the published version when the run starts." },
    ...withCurrentOption(workflowVersions, versionId, `Version · ${versionId}`),
  ];
  return (
    <div className="tests-case-builder__form-grid">
      <TestResourceField
        label="Workflow"
        ariaLabel="Test workflow"
        value={workflowId}
        options={workflows}
        loading={resourcesLoading}
        placeholder="Select a workflow"
        onChange={(value) => {
          onChange({ ...request, workflowId: value, workflowVersionId: null });
          onWorkflowRequest?.(value);
        }}
      />
      <div className="tests-case-builder__field is-span-2">
        <span>Version</span>
        {versionsLoading || versionOptions.length > 1 || !versionId ? (
          <PlatformSelector
            value={versionId}
            options={versionOptions}
            fullWidth
            loading={versionsLoading}
            loadingContent="Loading workflow versions…"
            ariaLabel="Workflow version"
            onValueChange={(value) => onChange({
              ...request,
              workflowVersionId: value || null,
            })}
          />
        ) : (
          <input
            value={versionId}
            aria-label="Workflow version"
            placeholder="Latest published version"
            onChange={(event) => onChange({
              ...request,
              workflowVersionId: event.currentTarget.value || null,
            })}
          />
        )}
      </div>
      <JsonValueField
        id={`${fieldId}:input`}
        label="Workflow input"
        description="JSON supplied to the immutable workflow run."
        value={request.input ?? null}
        onChange={(input) => onChange({ ...request, input })}
        onValidationError={onValidationError}
      />
    </div>
  );
}

function ScenarioStepEditor({
  step,
  index,
  functions,
  workflows,
  onChange,
  onRemove,
  onValidationError,
}: ScenarioStepEditorProps) {
  const request = asRecord(step.request);
  const target = String(request.target || "control_plane_readiness") as
    typeof SCENARIO_TARGET_OPTIONS[number]["value"];
  const stepId = String(step.id || `step-${index + 1}`);

  function changeTarget(nextTarget: typeof SCENARIO_TARGET_OPTIONS[number]["value"]) {
    onChange({
      ...step,
      request: getDefaultTestCaseRequest(nextTarget),
    });
  }

  return (
    <article className="tests-case-builder__scenario-step">
      <header>
        <span>{index + 1}</span>
        <strong>{String(step.name || `Step ${index + 1}`)}</strong>
        <PlatformIconButton
          size="compact"
          aria-label={`Remove scenario step ${index + 1}`}
          onClick={onRemove}
        >
          <Trash2 width={13} height={13} aria-hidden="true" />
        </PlatformIconButton>
      </header>
      <div className="tests-case-builder__form-grid">
        <label className="tests-case-builder__field">
          <span>Step ID</span>
          <input
            value={stepId}
            aria-label={`Scenario step ${index + 1} ID`}
            onChange={(event) => onChange({ ...step, id: event.currentTarget.value })}
          />
        </label>
        <label className="tests-case-builder__field">
          <span>Name</span>
          <input
            value={String(step.name || "")}
            aria-label={`Scenario step ${index + 1} name`}
            placeholder={`Step ${index + 1}`}
            onChange={(event) => onChange({ ...step, name: event.currentTarget.value })}
          />
        </label>
        <div className="tests-case-builder__field is-span-2">
          <span>Target</span>
          <PlatformSelector
            value={SCENARIO_TARGET_OPTIONS.some((option) => option.value === target)
              ? target
              : "control_plane_readiness"}
            options={SCENARIO_TARGET_OPTIONS}
            fullWidth
            ariaLabel={`Scenario step ${index + 1} target`}
            onValueChange={changeTarget}
          />
        </div>
      </div>
      {target === "computer_agents_function" ? (
        <FunctionRequestFields
          request={request}
          functions={functions}
          fieldId={`scenario:${stepId}`}
          onChange={(nextRequest) => onChange({ ...step, request: nextRequest })}
          onValidationError={onValidationError}
        />
      ) : target === "metronome_workflow" ? (
        <WorkflowRequestFields
          request={request}
          workflows={workflows}
          fieldId={`scenario:${stepId}`}
          onChange={(nextRequest) => onChange({ ...step, request: nextRequest })}
          onValidationError={onValidationError}
        />
      ) : (
        <ReadinessFields
          request={request}
          onChange={(nextRequest) => onChange({ ...step, request: nextRequest })}
        />
      )}
      <div className="tests-case-builder__scenario-assertions">
        <div>
          <strong>Step assertions</strong>
          <small>Evaluated against this step’s response before the scenario continues.</small>
        </div>
        <TestAssertionBuilder
          value={Array.isArray(step.assertions) ? step.assertions : []}
          onChange={(assertions) => onChange({ ...step, assertions })}
        />
      </div>
    </article>
  );
}

function EvidenceItem({
  icon,
  label,
  enabled,
  selectable = false,
  onCheckedChange,
}: {
  icon: ReactNode;
  label: string;
  enabled: boolean;
  selectable?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <div className="tests-case-builder__evidence-item">
      <span aria-hidden="true">{icon}</span>
      <strong>{label}</strong>
      <PlatformToggle
        checked={enabled}
        disabled={!selectable}
        aria-label={`${label} evidence retention`}
        title={selectable ? undefined : "Managed in Test settings"}
        onCheckedChange={selectable ? onCheckedChange : undefined}
      />
    </div>
  );
}

export function TestCaseDefinitionBuilder({
  testCase,
  functions,
  workflows,
  workflowVersions,
  resourcesLoading = false,
  versionsLoading = false,
  evidencePolicy,
  onChange,
  onWorkflowRequest,
  onValidationError,
}: TestCaseDefinitionBuilderProps) {
  const target = getTestCaseTargetKind(testCase);
  const request = asRecord(testCase.request);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const structuredTopology = asRecord(request.target);
  const isBoundTopology = target === "service_topology"
    && String(structuredTopology.kind || "").toLowerCase() === "service_topology";

  const firstError = useMemo(
    () => Object.values(fieldErrors).find(Boolean) || "",
    [fieldErrors],
  );

  useEffect(() => {
    onValidationError(firstError);
  }, [firstError, onValidationError]);

  const setFieldError = useCallback((id: string, nextError: string) => {
    setFieldErrors((current) => {
      if ((current[id] || "") === nextError) return current;
      if (!nextError) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: nextError };
    });
  }, []);

  function updateRequest(nextRequest: Record<string, unknown>) {
    onChange({ ...testCase, request: nextRequest });
  }

  function updateScenarioStep(index: number, step: Record<string, unknown>) {
    const steps = Array.isArray(request.steps) ? request.steps.map(asRecord) : [];
    updateRequest({
      ...request,
      steps: steps.map((candidate, candidateIndex) => (
        candidateIndex === index ? step : candidate
      )),
    });
  }

  const steps = Array.isArray(request.steps) ? request.steps.map(asRecord) : [];

  return (
    <div className="tests-case-builder">
      <PlatformSettingsSectionList>
        <PlatformSettingsSection
          title={target === "command"
            ? "Command"
            : target === "agent"
              ? "Verification task"
              : target === "service_topology"
                ? "Scenario"
                : target === "control_plane_readiness"
                  ? "Readiness requirements"
                  : "Request"}
          className={target === "computer_agents_function"
            ? "tests-case-builder__function-request-section"
            : undefined}
          bodyClassName="tests-case-builder__section-body"
        >
          {target === "command" ? (
            <PlatformInstructionsEditor
              title="Command"
              value={testCase.command}
              onChange={(command) => onChange({ ...testCase, command })}
              placeholder="npm test"
              ariaLabel="Test command"
              historyKey={`${testCase.id}:command`}
              variant="minimalistic-ui"
              stickyHeader={false}
              editorMode="code"
              codeLanguage="shell"
              codePath={`tests/cases/${testCase.id}/command.sh`}
              className="tests-case-builder__instructions-editor tests-case-builder__command-editor"
            />
          ) : target === "agent" ? (
            <PlatformInstructionsEditor
              title="Instructions"
              value={testCase.command}
              onChange={(instructions) => onChange({
                ...testCase,
                command: instructions,
                request: instructions ? { ...request, instructions } : {},
              })}
              placeholder="Describe the exact workflow, success criteria, and evidence to retain."
              ariaLabel="Agent verification instructions"
              historyKey={`${testCase.id}:agent-instructions`}
              variant="minimalistic-ui"
              stickyHeader={false}
              className="tests-case-builder__instructions-editor tests-case-builder__agent-editor"
            />
          ) : target === "control_plane_readiness" ? (
            <ReadinessFields request={request} onChange={updateRequest} />
          ) : target === "computer_agents_function" ? (
            <FunctionRequestFields
              request={request}
              functions={functions}
              resourcesLoading={resourcesLoading}
              fieldId={`${testCase.id}:function`}
              onChange={updateRequest}
              onValidationError={setFieldError}
            />
          ) : target === "metronome_workflow" ? (
            <WorkflowRequestFields
              request={request}
              workflows={workflows}
              workflowVersions={workflowVersions}
              resourcesLoading={resourcesLoading}
              versionsLoading={versionsLoading}
              fieldId={`${testCase.id}:workflow`}
              onChange={updateRequest}
              onWorkflowRequest={onWorkflowRequest}
              onValidationError={setFieldError}
            />
          ) : isBoundTopology ? (
            <div className="tests-case-builder__bound-topology">
              <Network width={18} height={18} aria-hidden="true" />
              <span>
                <strong>Bound project topology</strong>
                <small>
                  Entrypoint {String(structuredTopology.entrypoint || "unknown")} with {
                    Array.isArray(structuredTopology.resources)
                      ? structuredTopology.resources.length
                      : 0
                  } pinned resources. The canonical binding is preserved unchanged.
                </small>
              </span>
            </div>
          ) : (
            <div className="tests-case-builder__scenario">
              <div className="tests-case-builder__scenario-toolbar">
                <div>
                  <PlatformCheckbox
                    aria-label="Stop scenario after first failure"
                    checked={request.stopOnFailure !== false}
                    onClick={() => updateRequest({
                      ...request,
                      stopOnFailure: request.stopOnFailure === false,
                    })}
                  />
                  Stop after the first failed step
                </div>
                <PlatformSecondaryButton
                  size="compact"
                  onClick={() => {
                    const ordinal = steps.length + 1;
                    updateRequest({
                      ...request,
                      target: "service_topology",
                      steps: [
                        ...steps,
                        {
                          id: `step-${ordinal}`,
                          name: `Step ${ordinal}`,
                          request: getDefaultTestCaseRequest("control_plane_readiness"),
                          assertions: [],
                        },
                      ],
                    });
                  }}
                >
                  <Plus width={13} height={13} aria-hidden="true" />
                  Add step
                </PlatformSecondaryButton>
              </div>
              {steps.length === 0 ? (
                <div className="tests-case-builder__empty">
                  Add the first step to define this deterministic scenario.
                </div>
              ) : steps.map((step, index) => (
                <ScenarioStepEditor
                  // The persisted scenario schema has no UI-only key; order is part of the contract.
                  // biome-ignore lint/suspicious/noArrayIndexKey: preserve editor identity while a step ID is edited
                  key={`${String(step.id || "step")}-${index}`}
                  step={step}
                  index={index}
                  functions={functions}
                  workflows={workflows}
                  onChange={(nextStep) => updateScenarioStep(index, nextStep)}
                  onRemove={() => updateRequest({
                    ...request,
                    steps: steps.filter((_, candidateIndex) => candidateIndex !== index),
                  })}
                  onValidationError={setFieldError}
                />
              ))}
            </div>
          )}
        </PlatformSettingsSection>

        {!["command", "agent"].includes(target) ? (
          <PlatformSettingsSection
            title="Expected outcome"
            bodyClassName="tests-case-builder__section-body"
          >
            <TestAssertionBuilder
              value={testCase.assertions}
              onChange={(assertions) => onChange({ ...testCase, assertions })}
            />
          </PlatformSettingsSection>
        ) : null}

        <PlatformSettingsSection
          title="Evidence"
          className="tests-case-builder__evidence-section"
          bodyClassName="tests-case-builder__section-body"
        >
          <div className="tests-case-builder__evidence-grid">
            <EvidenceItem
              icon={<TerminalSquare width={14} height={14} />}
              label="Logs"
              enabled={evidencePolicy.retainLogs}
            />
            <EvidenceItem
              icon={<Camera width={14} height={14} />}
              label="Screenshots"
              enabled={evidencePolicy.retainScreenshots}
            />
            <EvidenceItem
              icon={<Activity width={14} height={14} />}
              label="Traces"
              enabled={evidencePolicy.retainTraces}
            />
            <EvidenceItem
              icon={<FileArchive width={14} height={14} />}
              label="Artifacts"
              enabled={evidencePolicy.retainArtifacts}
            />
          </div>
        </PlatformSettingsSection>
      </PlatformSettingsSectionList>
    </div>
  );
}
