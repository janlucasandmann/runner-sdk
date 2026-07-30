import { Save } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PlatformCodeEditorWorkspace,
  type PlatformCodeEditorFile,
} from "../../../../../platform-ui/components/composite/code-editor-workspace/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { PlatformPrimaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import {
  FileResourceDetailPage,
  PlatformServiceDetailProperty,
  PlatformServiceDetailPropertyList,
  type FileResourceDetailTab,
} from "../../../../../platform-ui/pages/details/index.js";
import type { TestsApi } from "../api/index.js";
import type {
  TestCaseDefinition,
  TestCaseKind,
  TestPlan,
  TestPlanDefinition,
} from "../domain/index.js";

type TestCaseFileId =
  | "command"
  | "request"
  | "assertions"
  | "environment"
  | "secrets";

interface TestCaseEditorFiles {
  request: string;
  assertions: string;
  environment: string;
  secrets: string;
}

interface ParsedTestCaseFiles {
  request: Record<string, unknown> | null;
  assertions: unknown[] | null;
  environment: Record<string, string> | null;
  secrets: string[] | null;
  error: string;
}

export interface TestCaseDetailPageProps {
  plan: TestPlan;
  testCase: TestCaseDefinition;
  api: TestsApi;
  controlsPortalId?: string;
  sectionControlsPortalId?: string;
  onPlanChange: (plan: TestPlan) => void;
  onCaseIdentityChange?: (testCase: TestCaseDefinition) => void;
  onDeleted: (plan: TestPlan) => void;
}

const TEST_CASE_FILES: readonly PlatformCodeEditorFile[] = [
  {
    id: "command",
    label: "Command",
    tabLabel: "Command",
    editorMode: "code",
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
  {
    id: "request",
    label: "Request",
    tabLabel: "Request",
    editorMode: "code",
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
  {
    id: "assertions",
    label: "Assertions",
    tabLabel: "Assertions",
    editorMode: "code",
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
  {
    id: "environment",
    label: "Environment",
    tabLabel: "Environment",
    editorMode: "code",
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
  {
    id: "secrets",
    label: "Secret References",
    tabLabel: "Secret References",
    editorMode: "code",
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
];

const TEST_CASE_KIND_OPTIONS: readonly {
  value: TestCaseKind;
  label: string;
  description: string;
}[] = [
  { value: "command", label: "Command", description: "Execute a deterministic shell command." },
  { value: "contract", label: "Contract", description: "Verify a component contract and assertions." },
  { value: "integration", label: "Integration", description: "Exercise multiple connected components." },
  { value: "browser", label: "Browser", description: "Run a browser-based verification flow." },
  { value: "agent", label: "Agent", description: "Delegate execution to a configured agent." },
  { value: "security", label: "Security", description: "Validate a security or trust boundary." },
  { value: "custom", label: "Custom", description: "Use a custom request and assertion contract." },
];

function cloneTestCase(testCase: TestCaseDefinition): TestCaseDefinition {
  return JSON.parse(JSON.stringify(testCase)) as TestCaseDefinition;
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function buildEditorFiles(testCase: TestCaseDefinition): TestCaseEditorFiles {
  return {
    request: formatJson(testCase.request || {}),
    assertions: formatJson(Array.isArray(testCase.assertions) ? testCase.assertions : []),
    environment: formatJson(testCase.env || {}),
    secrets: formatJson(Array.isArray(testCase.secretRefs) ? testCase.secretRefs : []),
  };
}

function parseEditorFiles(files: TestCaseEditorFiles): ParsedTestCaseFiles {
  try {
    const request = JSON.parse(files.request || "{}") as unknown;
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      throw new Error("Request must be a JSON object.");
    }
    const assertions = JSON.parse(files.assertions || "[]") as unknown;
    if (!Array.isArray(assertions)) {
      throw new Error("Assertions must be a JSON array.");
    }
    const environment = JSON.parse(files.environment || "{}") as unknown;
    if (!environment || typeof environment !== "object" || Array.isArray(environment)) {
      throw new Error("Environment must be a JSON object.");
    }
    if (Object.values(environment).some((value) => typeof value !== "string")) {
      throw new Error("Every environment value must be a string.");
    }
    const secrets = JSON.parse(files.secrets || "[]") as unknown;
    if (!Array.isArray(secrets) || secrets.some((value) => typeof value !== "string")) {
      throw new Error("Secret references must be a JSON array of strings.");
    }
    return {
      request: request as Record<string, unknown>,
      assertions,
      environment: environment as Record<string, string>,
      secrets,
      error: "",
    };
  } catch (error) {
    return {
      request: null,
      assertions: null,
      environment: null,
      secrets: null,
      error: error instanceof Error ? error.message : "The active case files are not valid JSON.",
    };
  }
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function getEditorSignature(
  testCase: TestCaseDefinition,
  files: TestCaseEditorFiles,
  tags: string,
): string {
  return JSON.stringify({
    id: testCase.id,
    name: testCase.name,
    description: testCase.description,
    kind: testCase.kind,
    command: testCase.command,
    workingDirectory: testCase.workingDirectory,
    timeoutMs: testCase.timeoutMs,
    retries: testCase.retries,
    agentId: testCase.agentId,
    enabled: testCase.enabled,
    tags,
    files,
  });
}

function usePortalTarget(id: string | undefined): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!id || typeof document === "undefined") {
      setTarget(null);
      return undefined;
    }
    const resolve = () => setTarget(document.getElementById(id));
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [id]);

  return target;
}

function mergeUpdatedPlan(
  plan: TestPlan,
  updated: TestPlan,
  definition: TestPlanDefinition,
): TestPlan {
  return {
    ...plan,
    ...updated,
    definition: updated.definition || definition,
    caseCount: Number.isFinite(updated.caseCount)
      ? updated.caseCount
      : definition.cases.length,
    versions: updated.versions || plan.versions,
    runs: updated.runs || plan.runs,
  };
}

export function TestCaseDetailPage({
  plan,
  testCase,
  api,
  controlsPortalId,
  sectionControlsPortalId,
  onPlanChange,
  onCaseIdentityChange,
  onDeleted,
}: TestCaseDetailPageProps) {
  const [activeTab, setActiveTab] = useState<FileResourceDetailTab>("code");
  const [activeFileId, setActiveFileId] = useState<TestCaseFileId>("command");
  const [draft, setDraft] = useState<TestCaseDefinition>(() => cloneTestCase(testCase));
  const [editorFiles, setEditorFiles] = useState<TestCaseEditorFiles>(
    () => buildEditorFiles(testCase),
  );
  const [tags, setTags] = useState(() => testCase.tags.join(", "));
  const [busyAction, setBusyAction] = useState<"save" | "delete" | "">("");
  const [error, setError] = useState("");
  const identityChangeRef = useRef(onCaseIdentityChange);
  const controlsPortalTarget = usePortalTarget(controlsPortalId);
  const sectionControlsPortalTarget = usePortalTarget(sectionControlsPortalId);

  useEffect(() => {
    identityChangeRef.current = onCaseIdentityChange;
  }, [onCaseIdentityChange]);

  useEffect(() => {
    setDraft(cloneTestCase(testCase));
    setEditorFiles(buildEditorFiles(testCase));
    setTags(testCase.tags.join(", "));
    setActiveFileId("command");
    setError("");
  }, [testCase.id, plan.updatedAt]);

  useEffect(() => {
    identityChangeRef.current?.(testCase);
  }, [testCase.id, testCase.name]);

  const parsedFiles = useMemo(() => parseEditorFiles(editorFiles), [editorFiles]);
  const baselineEditorFiles = useMemo(() => buildEditorFiles(testCase), [testCase]);
  const dirty = getEditorSignature(draft, editorFiles, tags)
    !== getEditorSignature(testCase, baselineEditorFiles, testCase.tags.join(", "));
  const normalizedTimeout = Number(draft.timeoutMs);
  const normalizedRetries = Number(draft.retries);
  const settingsError = !draft.name.trim()
    ? "A case name is required."
    : !Number.isInteger(normalizedTimeout) || normalizedTimeout <= 0
      ? "Timeout must be a positive whole number."
      : !Number.isInteger(normalizedRetries) || normalizedRetries < 0
        ? "Retries must be a non-negative whole number."
        : "";
  const validationError = parsedFiles.error || settingsError;

  const activeFileValue = activeFileId === "command"
    ? draft.command
    : activeFileId === "request"
      ? editorFiles.request
      : activeFileId === "assertions"
        ? editorFiles.assertions
        : activeFileId === "environment"
          ? editorFiles.environment
          : editorFiles.secrets;

  const activeFileAriaLabel = activeFileId === "command"
    ? "Test command"
    : activeFileId === "request"
      ? "Test request JSON"
      : activeFileId === "assertions"
        ? "Test assertions JSON"
        : activeFileId === "environment"
          ? "Test environment JSON"
          : "Test secret references JSON";

  function updateActiveFileValue(value: string) {
    if (activeFileId === "command") {
      setDraft((current) => ({ ...current, command: value }));
      return;
    }
    setEditorFiles((current) => ({
      ...current,
      [activeFileId]: value,
    }));
  }

  function buildNextCase(): TestCaseDefinition | null {
    if (validationError) {
      setError(validationError);
      return null;
    }
    return {
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      workingDirectory: draft.workingDirectory.trim(),
      timeoutMs: normalizedTimeout,
      retries: normalizedRetries,
      agentId: draft.agentId.trim(),
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      request: parsedFiles.request!,
      assertions: parsedFiles.assertions!,
      env: parsedFiles.environment!,
      secretRefs: parsedFiles.secrets!,
    };
  }

  async function saveCase() {
    if (!dirty || busyAction) return;
    const nextCase = buildNextCase();
    if (!nextCase) return;
    setBusyAction("save");
    setError("");
    try {
      const caseExists = plan.definition.cases.some(
        (candidate) => candidate.id === testCase.id,
      );
      const definition: TestPlanDefinition = {
        ...plan.definition,
        cases: caseExists
          ? plan.definition.cases.map((candidate) => (
              candidate.id === testCase.id ? nextCase : candidate
            ))
          : [...plan.definition.cases, nextCase],
      };
      const updated = await api.updatePlan(plan.id, {
        definition,
      } as Partial<TestPlan>);
      const nextPlan = mergeUpdatedPlan(plan, updated, definition);
      onPlanChange(nextPlan);
      onCaseIdentityChange?.(nextCase);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save the test case.");
    } finally {
      setBusyAction("");
    }
  }

  async function deleteCase() {
    if (busyAction) return;
    setBusyAction("delete");
    setError("");
    try {
      const definition: TestPlanDefinition = {
        ...plan.definition,
        cases: plan.definition.cases.filter(
          (candidate) => candidate.id !== testCase.id,
        ),
      };
      const updated = await api.updatePlan(plan.id, {
        definition,
      } as Partial<TestPlan>);
      onDeleted(mergeUpdatedPlan(plan, updated, definition));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to delete the test case.");
      setBusyAction("");
    }
  }

  const metadata = (
    <div className="tests-case-detail-identity">
      <input
        type="text"
        className="tests-case-detail-title-input"
        value={draft.name}
        placeholder="Case name"
        aria-label="Case name"
        onChange={(event) => setDraft((current) => ({
          ...current,
          name: event.currentTarget.value,
        }))}
      />
      <input
        type="text"
        className="file-resource-detail-page__description-input tests-case-detail-description-input"
        value={draft.description}
        placeholder="Describe what this case verifies."
        aria-label="Case description"
        onChange={(event) => setDraft((current) => ({
          ...current,
          description: event.currentTarget.value,
        }))}
      />
    </div>
  );

  const code = (
    <PlatformCodeEditorWorkspace
      className="tests-case-detail-workspace"
      ariaLabel={`${draft.name.trim() || "Test case"} files`}
      variant="full-screen"
      files={TEST_CASE_FILES}
      activeFileId={activeFileId}
      onFileSelect={(fileId) => setActiveFileId(
        TEST_CASE_FILES.some((file) => file.id === fileId)
          ? fileId as TestCaseFileId
          : "command",
      )}
      editor={(
        <textarea
          key={activeFileId}
          className="tests-case-detail-editor"
          aria-label={activeFileAriaLabel}
          spellCheck={false}
          value={activeFileValue}
          onChange={(event) => updateActiveFileValue(event.currentTarget.value)}
        />
      )}
    />
  );

  const settings = (
    <div className="tests-case-detail-settings-content">
      <h2 className="tests-case-detail-settings-title">Case Settings</h2>
      <section className="tests-case-detail-configuration">
        <div className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Type</span>
          <PlatformSelector
            value={draft.kind}
            options={TEST_CASE_KIND_OPTIONS}
            onValueChange={(value) => setDraft((current) => ({
              ...current,
              kind: value as TestCaseKind,
            }))}
            ariaLabel="Select test case type"
            alignment="end"
            popupAlignment="right"
            popupWidth="min(330px, calc(100vw - 48px))"
            className="tests-case-detail-setting-selector"
          />
        </div>
        <div className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">State</span>
          <PlatformSelector
            value={draft.enabled ? "enabled" : "disabled"}
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
            onValueChange={(value) => setDraft((current) => ({
              ...current,
              enabled: value !== "disabled",
            }))}
            ariaLabel="Select test case state"
            alignment="end"
            popupAlignment="right"
            className="tests-case-detail-setting-selector"
          />
        </div>
        <label className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Working Directory</span>
          <input
            className="tests-case-detail-setting-input"
            value={draft.workingDirectory}
            placeholder="Workspace root"
            onChange={(event) => setDraft((current) => ({
              ...current,
              workingDirectory: event.currentTarget.value,
            }))}
          />
        </label>
        <label className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Timeout (ms)</span>
          <input
            className="tests-case-detail-setting-input is-number"
            type="number"
            min={1}
            step={1}
            value={draft.timeoutMs}
            onChange={(event) => setDraft((current) => ({
              ...current,
              timeoutMs: Number(event.currentTarget.value),
            }))}
          />
        </label>
        <label className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Retries</span>
          <input
            className="tests-case-detail-setting-input is-number"
            type="number"
            min={0}
            step={1}
            value={draft.retries}
            onChange={(event) => setDraft((current) => ({
              ...current,
              retries: Number(event.currentTarget.value),
            }))}
          />
        </label>
        <label className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Executor Agent</span>
          <input
            className="tests-case-detail-setting-input"
            value={draft.agentId}
            placeholder="Use run agent"
            onChange={(event) => setDraft((current) => ({
              ...current,
              agentId: event.currentTarget.value,
            }))}
          />
        </label>
        <label className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Tags</span>
          <input
            className="tests-case-detail-setting-input"
            value={tags}
            placeholder="smoke, release"
            onChange={(event) => setTags(event.currentTarget.value)}
          />
        </label>
      </section>
    </div>
  );

  const sidebar = (
    <PlatformUiCard
      variant="sidebar"
      className="tests-case-detail-sidebar-card"
    >
      <PlatformServiceDetailPropertyList>
        <PlatformServiceDetailProperty label="Case ID">
          <span title={testCase.id}>{testCase.id}</span>
        </PlatformServiceDetailProperty>
        <PlatformServiceDetailProperty label="Type">
          {TEST_CASE_KIND_OPTIONS.find((option) => option.value === draft.kind)?.label || draft.kind}
        </PlatformServiceDetailProperty>
        <PlatformServiceDetailProperty label="State">
          <PlatformLabel variant={draft.enabled ? "green" : "gray"}>
            {draft.enabled ? "Enabled" : "Disabled"}
          </PlatformLabel>
        </PlatformServiceDetailProperty>
        <PlatformServiceDetailProperty label="Timeout">
          {Number.isFinite(normalizedTimeout) ? `${normalizedTimeout} ms` : "Invalid"}
        </PlatformServiceDetailProperty>
        <PlatformServiceDetailProperty label="Retries">
          {Number.isFinite(normalizedRetries) ? normalizedRetries : "Invalid"}
        </PlatformServiceDetailProperty>
        <PlatformServiceDetailProperty label="Updated">
          {formatTimestamp(plan.updatedAt)}
        </PlatformServiceDetailProperty>
        <PlatformPrimaryButton
          type="button"
          size="small"
          fullWidth
          className="tests-case-detail-delete-button"
          disabled={Boolean(busyAction)}
          onClick={() => void deleteCase()}
        >
          {busyAction === "delete" ? "Deleting…" : "Delete Case"}
        </PlatformPrimaryButton>
      </PlatformServiceDetailPropertyList>
    </PlatformUiCard>
  );

  const headerActions = (
    <PlatformPrimaryButton
      type="button"
      size="small"
      disabled={Boolean(busyAction) || !dirty || Boolean(validationError)}
      onClick={() => void saveCase()}
    >
      <Save width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
      <span>{busyAction === "save" ? "Saving…" : "Save Changes"}</span>
    </PlatformPrimaryButton>
  );

  const sectionSwitch = (
    <PlatformSwitch
      className="tests-case-detail-header-switch"
      value={activeTab}
      options={[
        { value: "code", label: "Code" },
        { value: "settings", label: "Settings" },
      ]}
      onValueChange={(value) => setActiveTab(value === "settings" ? "settings" : "code")}
      ariaLabel="Test case section"
    />
  );

  return (
    <>
      {controlsPortalTarget ? createPortal(headerActions, controlsPortalTarget) : null}
      {sectionControlsPortalTarget
        ? createPortal(sectionSwitch, sectionControlsPortalTarget)
        : null}
      <FileResourceDetailPage
        activeTab={activeTab}
        metadata={metadata}
        notice={error || validationError
          ? (
              <div className="tests-case-detail-notice" role="alert">
                {error || validationError}
              </div>
            )
          : null}
        code={code}
        settings={settings}
        sidebar={sidebar}
        sidebarCollapsed={activeTab !== "settings"}
        ariaLabel="Test case details"
        sidebarAriaLabel="Test case properties"
        className="tests-case-detail-page"
        contentClassName="tests-case-detail-page__content"
        codeClassName="tests-case-detail-page__code"
        metadataClassName="tests-case-detail-page__metadata"
        noticeClassName="tests-case-detail-page__notice"
        workspaceClassName="tests-case-detail-page__workspace"
        settingsClassName="tests-case-detail-page__settings"
        sidebarClassName="tests-case-detail-page__sidebar playground-project-overview-sidebar playground-agents-detail-sidebar"
      />
    </>
  );
}
