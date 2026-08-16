import {
  Bot,
  Braces,
  Plus,
  TerminalSquare,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformCheckbox } from "../../../../../platform-ui/components/ui/checkbox/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  applyTestCasePresentation,
  DETERMINISTIC_TEST_TARGET_OPTIONS,
  TEST_CASE_CATEGORY_OPTIONS,
  TEST_CASE_EXECUTION_OPTIONS,
  type TestCaseCategory,
  type TestCaseDefinition,
  type TestCaseExecutionMethod,
} from "../domain/index.js";
import { TestAssertionBuilder } from "./test-assertion-builder.js";

interface TestCaseCreateModalProps {
  open: boolean;
  existingCases: readonly TestCaseDefinition[];
  onClose: () => void;
  onCreate: (testCase: TestCaseDefinition) => void;
}

type DeterministicTarget = typeof DETERMINISTIC_TEST_TARGET_OPTIONS[number]["value"];

const EXECUTION_ICONS = {
  command: TerminalSquare,
  contract: Braces,
  agent: Bot,
} as const;

function slugify(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "test-case";
}

function uniqueCaseId(name: string, existingCases: readonly TestCaseDefinition[]): string {
  const base = slugify(name);
  const ids = new Set(existingCases.map((testCase) => testCase.id));
  if (!ids.has(base)) return base;
  let ordinal = 2;
  while (ids.has(`${base}-${ordinal}`)) ordinal += 1;
  return `${base}-${ordinal}`;
}

function parseJson(value: string, label: string): unknown {
  try {
    return JSON.parse(value || "null");
  } catch {
    throw new Error(`${label} must contain valid JSON.`);
  }
}

function emptyCase(name: string): TestCaseDefinition {
  return {
    id: "",
    name,
    description: "",
    kind: "command",
    command: "",
    workingDirectory: "",
    timeoutMs: 300_000,
    retries: 0,
    env: {},
    secretRefs: [],
    request: {},
    assertions: [],
    agentId: "",
    enabled: true,
    tags: ["smoke"],
  };
}

export function TestCaseCreateModal({
  open,
  existingCases,
  onClose,
  onCreate,
}: TestCaseCreateModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [executionMethod, setExecutionMethod] = useState<TestCaseExecutionMethod>("command");
  const [category, setCategory] = useState<TestCaseCategory>("smoke");
  const [command, setCommand] = useState("");
  const [workingDirectory, setWorkingDirectory] = useState("");
  const [instructions, setInstructions] = useState("");
  const [target, setTarget] = useState<DeterministicTarget>("control_plane_readiness");
  const [resourceId, setResourceId] = useState("");
  const [requestMethod, setRequestMethod] = useState("GET");
  const [requestPath, setRequestPath] = useState("/");
  const [requestPayload, setRequestPayload] = useState("null");
  const [serviceTopologyJson, setServiceTopologyJson] = useState(
    '{\n  "steps": []\n}',
  );
  const [requireDatabase, setRequireDatabase] = useState(true);
  const [requireAgentRuntime, setRequireAgentRuntime] = useState(true);
  const [assertions, setAssertions] = useState<unknown[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setExecutionMethod("command");
    setCategory("smoke");
    setCommand("");
    setWorkingDirectory("");
    setInstructions("");
    setTarget("control_plane_readiness");
    setResourceId("");
    setRequestMethod("GET");
    setRequestPath("/");
    setRequestPayload("null");
    setServiceTopologyJson('{\n  "steps": []\n}');
    setRequireDatabase(true);
    setRequireAgentRuntime(true);
    setAssertions([]);
    setError("");
  }, [open]);

  const selectedExecution = useMemo(
    () => TEST_CASE_EXECUTION_OPTIONS.find((option) => option.value === executionMethod),
    [executionMethod],
  );

  function buildContractRequest(): Record<string, unknown> {
    if (target === "control_plane_readiness") {
      return { target, requireDatabase, requireAgentRuntime };
    }
    if (target === "computer_agents_function") {
      if (!resourceId.trim()) throw new Error("Select or enter a Function ID.");
      if (!requestPath.trim().startsWith("/")) {
        throw new Error("The Function path must begin with /.");
      }
      return {
        target,
        functionId: resourceId.trim(),
        method: requestMethod,
        path: requestPath.trim(),
        body: parseJson(requestPayload, "Request body"),
      };
    }
    if (target === "metronome_workflow") {
      if (!resourceId.trim()) throw new Error("Select or enter a Metronome workflow ID.");
      return {
        target,
        workflowId: resourceId.trim(),
        input: parseJson(requestPayload, "Workflow input"),
      };
    }
    const topology = parseJson(serviceTopologyJson, "Service topology request");
    if (!topology || typeof topology !== "object" || Array.isArray(topology)) {
      throw new Error("Service topology request must be a JSON object.");
    }
    if (!Array.isArray((topology as Record<string, unknown>).steps)
      || ((topology as Record<string, unknown>).steps as unknown[]).length === 0) {
      throw new Error("Service topology must contain at least one deterministic step.");
    }
    return { target, ...topology as Record<string, unknown> };
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Enter a case name.");
      nameRef.current?.focus();
      return;
    }
    if (executionMethod === "command" && !command.trim()) {
      setError("Enter the command this case should execute.");
      return;
    }
    if (executionMethod === "agent" && !instructions.trim()) {
      setError("Describe the verification workflow for the executor agent.");
      return;
    }
    try {
      const base = emptyCase(normalizedName);
      const request = executionMethod === "contract"
        ? buildContractRequest()
        : executionMethod === "agent"
          ? { instructions: instructions.trim() }
          : {};
      const presented = applyTestCasePresentation(base, executionMethod, category);
      onCreate({
        ...presented,
        id: uniqueCaseId(normalizedName, existingCases),
        description: description.trim(),
        command: executionMethod === "agent" ? instructions.trim() : command.trim(),
        workingDirectory: workingDirectory.trim(),
        request,
        assertions,
      });
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "The test case is not valid.");
    }
  }

  return (
    <PlatformModal
      open={open}
      title="Add test case"
      description="Choose how this case executes, then define the behavior it verifies."
      as="form"
      size="large"
      initialFocusRef={nameRef}
      onClose={onClose}
      className="tests-case-create-modal"
      bodyClassName="tests-case-create-modal__body"
      surfaceProps={{ onSubmit: submit }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" onClick={onClose}>Cancel</PlatformSecondaryButton>
          <PlatformPrimaryButton size="medium" type="submit" disabled={!name.trim()}>
            <Plus width={14} height={14} aria-hidden="true" />
            Add case
          </PlatformPrimaryButton>
        </>
      )}
    >
      <label className="tests-form-field">
        <span>Case name</span>
        <input
          ref={nameRef}
          value={name}
          maxLength={500}
          placeholder="Production readiness"
          onChange={(event) => setName(event.currentTarget.value)}
        />
      </label>

      <fieldset className="tests-case-method-fieldset">
        <legend>Execution method</legend>
        <div className="tests-case-method-grid">
          {TEST_CASE_EXECUTION_OPTIONS.map((option) => {
            const Icon = EXECUTION_ICONS[option.value];
            const selected = executionMethod === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`tests-case-method-card${selected ? " is-selected" : ""}`}
                onClick={() => setExecutionMethod(option.value)}
              >
                <Icon width={17} height={17} aria-hidden="true" />
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                <em>{option.trust === "runner_captured" ? "Deterministic worker" : "Agent-executed"}</em>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="tests-form-grid">
        <div className="tests-form-field">
          <span>Category</span>
          <PlatformSelector
            value={category}
            options={TEST_CASE_CATEGORY_OPTIONS}
            fullWidth
            ariaLabel="Test case category"
            onValueChange={setCategory}
          />
        </div>
        <label className="tests-form-field">
          <span>Description</span>
          <input
            value={description}
            maxLength={5_000}
            placeholder="What this case proves"
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </label>
      </div>

      {executionMethod === "command" ? (
        <div className="tests-form-grid">
          <label className="tests-form-field is-span-2">
            <span>Command</span>
            <textarea
              value={command}
              rows={5}
              placeholder="npm test"
              aria-label="New test case command"
              onChange={(event) => setCommand(event.currentTarget.value)}
            />
          </label>
          <label className="tests-form-field is-span-2">
            <span>Working directory</span>
            <input
              value={workingDirectory}
              placeholder="Workspace root"
              onChange={(event) => setWorkingDirectory(event.currentTarget.value)}
            />
          </label>
        </div>
      ) : null}

      {executionMethod === "contract" ? (
        <div className="tests-case-create-modal__contract">
          <div className="tests-form-field">
            <span>Contract target</span>
            <PlatformSelector
              value={target}
              options={DETERMINISTIC_TEST_TARGET_OPTIONS}
              fullWidth
              ariaLabel="Deterministic contract target"
              onValueChange={setTarget}
            />
          </div>
          {target === "control_plane_readiness" ? (
            <div className="tests-case-create-modal__checks">
              <label>
                <PlatformCheckbox
                  aria-label="Require database readiness"
                  checked={requireDatabase}
                  onClick={() => setRequireDatabase((current) => !current)}
                />
                Require database readiness
              </label>
              <label>
                <PlatformCheckbox
                  aria-label="Require agent runtime readiness"
                  checked={requireAgentRuntime}
                  onClick={() => setRequireAgentRuntime((current) => !current)}
                />
                Require agent runtime readiness
              </label>
            </div>
          ) : null}
          {target === "computer_agents_function" || target === "metronome_workflow" ? (
            <div className="tests-form-grid">
              <label className="tests-form-field is-span-2">
                <span>{target === "computer_agents_function" ? "Function ID" : "Workflow ID"}</span>
                <input
                  value={resourceId}
                  placeholder={target === "computer_agents_function" ? "function_…" : "metronome_…"}
                  onChange={(event) => setResourceId(event.currentTarget.value)}
                />
              </label>
              {target === "computer_agents_function" ? (
                <>
                  <div className="tests-form-field">
                    <span>Method</span>
                    <PlatformSelector
                      value={requestMethod}
                      options={["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({ value, label: value }))}
                      fullWidth
                      ariaLabel="Function request method"
                      onValueChange={setRequestMethod}
                    />
                  </div>
                  <label className="tests-form-field">
                    <span>Path</span>
                    <input value={requestPath} onChange={(event) => setRequestPath(event.currentTarget.value)} />
                  </label>
                </>
              ) : null}
              <label className="tests-form-field is-span-2">
                <span>{target === "computer_agents_function" ? "Request body JSON" : "Workflow input JSON"}</span>
                <textarea
                  value={requestPayload}
                  rows={5}
                  spellCheck={false}
                  onChange={(event) => setRequestPayload(event.currentTarget.value)}
                />
              </label>
            </div>
          ) : null}
          {target === "service_topology" ? (
            <label className="tests-form-field">
              <span>Topology steps JSON</span>
              <textarea
                value={serviceTopologyJson}
                rows={8}
                spellCheck={false}
                onChange={(event) => setServiceTopologyJson(event.currentTarget.value)}
              />
            </label>
          ) : null}
          <div className="tests-case-create-modal__assertions">
            <div>
              <strong>Assertions</strong>
              <span>Assertions are evaluated directly against the target response.</span>
            </div>
            <TestAssertionBuilder value={assertions} onChange={setAssertions} />
          </div>
        </div>
      ) : null}

      {executionMethod === "agent" ? (
        <label className="tests-form-field">
          <span>Verification instructions</span>
          <textarea
            value={instructions}
            rows={8}
            placeholder="Describe the exact workflow, success criteria, and evidence the executor must retain."
            aria-label="Agent-guided verification instructions"
            onChange={(event) => setInstructions(event.currentTarget.value)}
          />
          <small className="tests-form-help">
            {selectedExecution?.description} Results from this path are agent-reported.
          </small>
        </label>
      ) : null}

      {error ? <p className="tests-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}
