import { Plus, Save, Trash2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformIconButton } from "../../../../../platform-ui/components/ui/icon-button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import { FileResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";
import type { TestsApi } from "../api/index.js";
import {
  applyTestCaseTargetKind,
  applyTestCasePresentation,
  getTestCaseCategory,
  getTestCaseExecutionProfile,
  getTestCaseTargetKind,
  TEST_CASE_CATEGORY_OPTIONS,
  TEST_CASE_TYPE_OPTIONS,
  validateTestCaseConfiguration,
  type TestCaseCategory,
  type TestCaseDefinition,
  type TestPlan,
  type TestPlanDefinition,
  type TestWorkspaceResourceOption,
} from "../domain/index.js";
import { TestCaseCodeEditor } from "./test-case-code-editor.js";
import {
  applyTestCaseCodeFile,
  serializeTestCaseCodeFiles,
  TEST_CASE_CODE_FILE_IDS,
  type TestCaseCodeFileId,
  type TestCaseCodeSources,
} from "./test-case-code-files.js";
import { TestCaseDefinitionBuilder } from "./test-case-definition-builder.js";
import {
  TestPlanSaveModal,
  type TestPlanSaveOutcome,
} from "./test-plan-save-modal.js";

type TestCaseDetailTab = "general" | "code";

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

function cloneTestCase(testCase: TestCaseDefinition): TestCaseDefinition {
  return JSON.parse(JSON.stringify(testCase)) as TestCaseDefinition;
}

function normalizeTags(tags: string): string[] {
  return Array.from(new Set(
    tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  ));
}

function projectCodeDraft(
  testCase: TestCaseDefinition,
  tags: string,
): TestCaseDefinition {
  return { ...testCase, tags: normalizeTags(tags) };
}

function getEditorSignature(testCase: TestCaseDefinition, tags: string): string {
  return JSON.stringify({ testCase, tags });
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

function EnvironmentVariableEditor({
  value,
  onChange,
}: {
  value: Readonly<Record<string, string>>;
  onChange: (value: Record<string, string>) => void;
}) {
  const entries = Object.entries(value);

  function uniqueKey() {
    let ordinal = entries.length + 1;
    let key = `VARIABLE_${ordinal}`;
    while (Object.hasOwn(value, key)) {
      ordinal += 1;
      key = `VARIABLE_${ordinal}`;
    }
    return key;
  }

  return (
    <div className="tests-case-settings-list">
      {entries.length === 0 ? (
        <div className="tests-case-settings-list__empty">No environment variables configured.</div>
      ) : entries.map(([key, entryValue], index) => (
        // Rows have no persisted identity; the positional key keeps focus while a name is edited.
        // biome-ignore lint/suspicious/noArrayIndexKey: environment row order is stable during editing
        <div className="tests-case-settings-list__row" key={index}>
          <input
            value={key}
            aria-label={`Environment variable ${index + 1} name`}
            placeholder="VARIABLE_NAME"
            onChange={(event) => {
              const nextKey = event.currentTarget.value;
              const next = { ...value };
              delete next[key];
              next[nextKey] = entryValue;
              onChange(next);
            }}
          />
          <input
            value={entryValue}
            aria-label={`Environment variable ${index + 1} value`}
            placeholder="Value"
            onChange={(event) => onChange({ ...value, [key]: event.currentTarget.value })}
          />
          <PlatformIconButton
            size="compact"
            aria-label={`Remove environment variable ${index + 1}`}
            onClick={() => {
              const next = { ...value };
              delete next[key];
              onChange(next);
            }}
          >
            <Trash2 width={13} height={13} aria-hidden="true" />
          </PlatformIconButton>
        </div>
      ))}
      <PlatformSecondaryButton
        size="compact"
        onClick={() => onChange({ ...value, [uniqueKey()]: "" })}
      >
        <Plus width={13} height={13} aria-hidden="true" />
        Add variable
      </PlatformSecondaryButton>
    </div>
  );
}

function SecretReferenceEditor({
  value,
  onChange,
}: {
  value: readonly string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="tests-case-settings-list">
      {value.length === 0 ? (
        <div className="tests-case-settings-list__empty">No secret references configured.</div>
      ) : value.map((secret, index) => (
        // Secret references are strings without a separate UI identity.
        // biome-ignore lint/suspicious/noArrayIndexKey: preserve input focus while editing the value
        <div className="tests-case-settings-list__row is-single" key={index}>
          <input
            value={secret}
            aria-label={`Secret reference ${index + 1}`}
            placeholder="SECRET_REFERENCE"
            onChange={(event) => onChange(value.map((candidate, candidateIndex) => (
              candidateIndex === index ? event.currentTarget.value : candidate
            )))}
          />
          <PlatformIconButton
            size="compact"
            aria-label={`Remove secret reference ${index + 1}`}
            onClick={() => onChange(value.filter((_, candidateIndex) => candidateIndex !== index))}
          >
            <Trash2 width={13} height={13} aria-hidden="true" />
          </PlatformIconButton>
        </div>
      ))}
      <PlatformSecondaryButton size="compact" onClick={() => onChange([...value, ""])}>
        <Plus width={13} height={13} aria-hidden="true" />
        Add secret reference
      </PlatformSecondaryButton>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<TestCaseDetailTab>("general");
  const [draft, setDraft] = useState<TestCaseDefinition>(() => cloneTestCase(testCase));
  const [tags, setTags] = useState(() => testCase.tags.join(", "));
  const [activeCodeFileId, setActiveCodeFileId] = useState<TestCaseCodeFileId>("case.json");
  const [codeSources, setCodeSources] = useState<TestCaseCodeSources>(
    () => serializeTestCaseCodeFiles(testCase),
  );
  const [codeErrors, setCodeErrors] = useState<Partial<Record<TestCaseCodeFileId, string>>>({});
  const [busyAction, setBusyAction] = useState<"save" | "delete" | "">("");
  const [error, setError] = useState("");
  const [builderError, setBuilderError] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [functions, setFunctions] = useState<TestWorkspaceResourceOption[]>([]);
  const [workflows, setWorkflows] = useState<TestWorkspaceResourceOption[]>([]);
  const [workflowVersions, setWorkflowVersions] = useState<TestWorkspaceResourceOption[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const identityChangeRef = useRef(onCaseIdentityChange);
  const committedCodeSourcesRef = useRef<TestCaseCodeSources>(
    serializeTestCaseCodeFiles(testCase),
  );
  const controlsPortalTarget = usePortalTarget(controlsPortalId);
  const sectionControlsPortalTarget = usePortalTarget(sectionControlsPortalId);
  const targetKind = getTestCaseTargetKind(draft);
  const request = draft.request && typeof draft.request === "object" && !Array.isArray(draft.request)
    ? draft.request
    : {};
  const workflowId = targetKind === "metronome_workflow"
    ? String(request.workflowId || "").trim()
    : "";
  const codeDraft = useMemo(
    () => projectCodeDraft(draft, tags),
    [draft, tags],
  );
  const canonicalCodeSources = useMemo(
    () => serializeTestCaseCodeFiles(codeDraft),
    [codeDraft],
  );

  useEffect(() => {
    identityChangeRef.current = onCaseIdentityChange;
  }, [onCaseIdentityChange]);

  useEffect(() => {
    const nextDraft = cloneTestCase(testCase);
    const nextCodeSources = serializeTestCaseCodeFiles(nextDraft);
    setDraft(nextDraft);
    setTags(testCase.tags.join(", "));
    setActiveTab("general");
    setActiveCodeFileId("case.json");
    setCodeSources(nextCodeSources);
    setCodeErrors({});
    committedCodeSourcesRef.current = nextCodeSources;
    setError("");
    setBuilderError("");
    setSaveModalOpen(false);
    setSaveError("");
  }, [testCase]);

  useEffect(() => {
    const synchronizedFileIds = TEST_CASE_CODE_FILE_IDS.filter(
      (fileId) => committedCodeSourcesRef.current[fileId] !== canonicalCodeSources[fileId],
    );
    if (synchronizedFileIds.length === 0) return;

    setCodeSources((current) => {
      const next = { ...current };
      for (const fileId of synchronizedFileIds) {
        next[fileId] = canonicalCodeSources[fileId];
        committedCodeSourcesRef.current[fileId] = canonicalCodeSources[fileId];
      }
      return next;
    });
    setCodeErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      for (const fileId of synchronizedFileIds) delete nextErrors[fileId];
      return nextErrors;
    });
  }, [canonicalCodeSources]);

  useEffect(() => {
    identityChangeRef.current?.(testCase);
  }, [testCase]);

  useEffect(() => {
    let cancelled = false;
    if (typeof api.listFunctions !== "function" || typeof api.listMetronomes !== "function") {
      return undefined;
    }
    setResourcesLoading(true);
    void Promise.allSettled([
      api.listFunctions(plan.projectId || ""),
      api.listMetronomes(plan.projectId || ""),
    ]).then(([functionResult, workflowResult]) => {
      if (cancelled) return;
      setFunctions(functionResult.status === "fulfilled" ? functionResult.value : []);
      setWorkflows(workflowResult.status === "fulfilled" ? workflowResult.value : []);
      setResourcesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [api, plan.projectId]);

  useEffect(() => {
    let cancelled = false;
    setWorkflowVersions([]);
    if (!workflowId || typeof api.listMetronomeVersions !== "function") return undefined;
    setVersionsLoading(true);
    void api.listMetronomeVersions(workflowId).then((versions) => {
      if (!cancelled) setWorkflowVersions(versions);
    }).catch(() => {
      if (!cancelled) setWorkflowVersions([]);
    }).finally(() => {
      if (!cancelled) setVersionsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [api, workflowId]);

  const dirty = getEditorSignature(draft, tags)
    !== getEditorSignature(testCase, testCase.tags.join(", "));
  const normalizedTimeout = Number(draft.timeoutMs);
  const normalizedRetries = Number(draft.retries);
  const configurationError = validateTestCaseConfiguration(draft);
  const settingsError = !draft.name.trim()
    ? "A case name is required."
    : !Number.isInteger(normalizedTimeout) || normalizedTimeout <= 0
      ? "Timeout must be a positive whole number of milliseconds."
      : !Number.isInteger(normalizedRetries) || normalizedRetries < 0
        ? "Retries must be a non-negative whole number."
        : Object.keys(draft.env).some((key) => !key.trim())
          ? "Every environment variable needs a name."
          : draft.secretRefs.some((value) => !value.trim())
            ? "Every secret reference needs a value."
            : "";
  const codeError = Object.values(codeErrors).find(Boolean) || "";
  const validationError = codeError || builderError || settingsError || configurationError;
  const executionProfile = getTestCaseExecutionProfile(draft);
  const category = getTestCaseCategory(draft);

  const handleBuilderValidation = useCallback((nextError: string) => {
    setBuilderError(nextError);
  }, []);

  function changeCodeFile(fileId: TestCaseCodeFileId, source: string) {
    setCodeSources((current) => ({ ...current, [fileId]: source }));
    const parsed = applyTestCaseCodeFile(codeDraft, fileId, source);
    setCodeErrors((current) => {
      const next = { ...current };
      if (parsed.error) next[fileId] = parsed.error;
      else delete next[fileId];
      return next;
    });
    if (!parsed.testCase) return;

    committedCodeSourcesRef.current[fileId] = serializeTestCaseCodeFiles(
      parsed.testCase,
    )[fileId];
    setDraft(parsed.testCase);
    setTags(parsed.testCase.tags.join(", "));
  }

  function changeCategory(value: TestCaseCategory) {
    setDraft((current) => applyTestCasePresentation(
      current,
      executionProfile.method === "deterministic" ? "contract" : (
        getTestCaseTargetKind(current) === "command" ? "command" : "agent"
      ),
      value,
    ));
    setTags((current) => {
      const categoryValues = new Set(TEST_CASE_CATEGORY_OPTIONS.map((option) => option.value));
      return [
        value,
        ...current.split(",").map((tag) => tag.trim()).filter(
          (tag) => tag && !categoryValues.has(tag as TestCaseCategory),
        ),
      ].join(", ");
    });
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
      tags: normalizeTags(tags),
      env: Object.fromEntries(
        Object.entries(draft.env).map(([key, value]) => [key.trim(), value]),
      ),
      secretRefs: draft.secretRefs.map((value) => value.trim()).filter(Boolean),
    };
  }

  async function saveCase(outcome: TestPlanSaveOutcome, versionDescription: string) {
    if (!dirty || busyAction) return;
    const nextCase = buildNextCase();
    if (!nextCase) return;
    setBusyAction("save");
    setError("");
    setSaveError("");
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
      let nextPlan = mergeUpdatedPlan(plan, updated, definition);
      if (outcome !== "draft") {
        const versions = plan.versions || [];
        const nextVersionNumber = versions.reduce(
          (maximum, version) => Math.max(maximum, Number(version.version) || 0),
          0,
        ) + 1;
        const version = await api.createVersion(plan.id, {
          label: `Version ${nextVersionNumber}`,
          description: versionDescription || `Updated ${nextCase.name}.`,
        });
        nextPlan = { ...nextPlan, versions: [...versions, version] };
        if (outcome === "publish") {
          const published = await api.publishVersion(plan.id, version.id);
          nextPlan = {
            ...nextPlan,
            ...published,
            definition,
            versions: nextPlan.versions,
            runs: plan.runs,
          };
        }
      }
      onPlanChange(nextPlan);
      onCaseIdentityChange?.(nextCase);
      setSaveModalOpen(false);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to save the test case.";
      setError(message);
      setSaveError(message);
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
      <div className="tests-case-detail-title-row">
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
        <PlatformSelector
          value={targetKind}
          options={TEST_CASE_TYPE_OPTIONS}
          ariaLabel="Test type"
          alignment="end"
          popupAlignment="right"
          popupWidth="min(330px, calc(100vw - 48px))"
          className="tests-case-detail-type-selector"
          onValueChange={(value) => setDraft((current) => (
            applyTestCaseTargetKind(current, value)
          ))}
        />
      </div>
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

  const definitionBuilder = (
    <TestCaseDefinitionBuilder
      testCase={draft}
      functions={functions}
      workflows={workflows}
      workflowVersions={workflowVersions}
      resourcesLoading={resourcesLoading}
      versionsLoading={versionsLoading}
      evidencePolicy={plan.definition.evidencePolicy}
      onChange={setDraft}
      onWorkflowRequest={() => setWorkflowVersions([])}
      onValidationError={handleBuilderValidation}
    />
  );

  const caseSettings = (
    <div className="tests-case-detail-settings-content">
      <h2 className="tests-case-detail-settings-title">Case Settings</h2>
      <section className="tests-case-detail-configuration">
        <div className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Category</span>
          <PlatformSelector
            value={category}
            options={TEST_CASE_CATEGORY_OPTIONS}
            onValueChange={changeCategory}
            ariaLabel="Select test case category"
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
        {targetKind === "command" ? (
          <label className="tests-case-detail-configuration-row">
            <span className="tests-case-detail-configuration-label">Working directory</span>
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
        ) : null}
        <label className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Timeout (seconds)</span>
          <input
            className="tests-case-detail-setting-input is-number"
            type="number"
            min={0.001}
            step={1}
            value={Number.isFinite(normalizedTimeout) ? normalizedTimeout / 1_000 : ""}
            onChange={(event) => setDraft((current) => ({
              ...current,
              timeoutMs: Math.round(Number(event.currentTarget.value) * 1_000),
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
        <div className="tests-case-detail-configuration-row">
          <span className="tests-case-detail-configuration-label">Executor</span>
          <span className="tests-case-detail-configuration-value">
            {executionProfile.label}
          </span>
        </div>
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

      <section className="tests-case-detail-settings-section">
        <header>
          <h3>Environment variables</h3>
          <p>Non-secret values made available to the environment executor.</p>
        </header>
        <EnvironmentVariableEditor
          value={draft.env}
          onChange={(env) => setDraft((current) => ({ ...current, env }))}
        />
      </section>

      <section className="tests-case-detail-settings-section">
        <header>
          <h3>Secret references</h3>
          <p>Only references are stored. Secret values remain in the selected environment.</p>
        </header>
        <SecretReferenceEditor
          value={draft.secretRefs}
          onChange={(secretRefs) => setDraft((current) => ({ ...current, secretRefs }))}
        />
      </section>

      <section className="tests-case-detail-settings-section tests-case-detail-danger-section">
        <header>
          <h3>Delete case</h3>
          <p>Permanently remove this case from the Test Plan.</p>
        </header>
        <PlatformSecondaryButton
          type="button"
          size="small"
          className="tests-case-detail-delete-button"
          disabled={Boolean(busyAction)}
          onClick={() => void deleteCase()}
        >
          <Trash2 width={14} height={14} aria-hidden="true" />
          {busyAction === "delete" ? "Deleting…" : "Delete Case"}
        </PlatformSecondaryButton>
      </section>
    </div>
  );

  const validationNotice = error || validationError
    ? (
        <div className="tests-case-detail-notice" role="alert">
          {error || validationError}
        </div>
      )
    : null;

  const general = (
    <div className="tests-case-detail-general">
      <div className="tests-case-detail-general__content">
        {metadata}
        {validationNotice}
        {definitionBuilder}
        {caseSettings}
      </div>
    </div>
  );

  const codeEditor = (
    <TestCaseCodeEditor
      testCaseId={draft.id || testCase.id}
      files={codeSources}
      activeFileId={activeCodeFileId}
      errors={codeErrors}
      onFileSelect={setActiveCodeFileId}
      onFileChange={changeCodeFile}
    />
  );

  const headerActions = (
    <PlatformPrimaryButton
      type="button"
      size="small"
      disabled={Boolean(busyAction) || !dirty || Boolean(validationError)}
      onClick={() => {
        setSaveError("");
        setSaveModalOpen(true);
      }}
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
        { value: "general", label: "General" },
        { value: "code", label: "Code" },
      ]}
      onValueChange={(value) => setActiveTab(value === "code" ? "code" : "general")}
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
        activeTab={activeTab === "code" ? "code" : "settings"}
        metadata={metadata}
        notice={activeTab === "code" ? validationNotice : null}
        code={codeEditor}
        settings={general}
        ariaLabel="Test case details"
        className="tests-case-detail-page"
        contentClassName="tests-case-detail-page__content"
        codeClassName="tests-case-detail-page__code"
        metadataClassName="tests-case-detail-page__metadata"
        noticeClassName="tests-case-detail-page__notice"
        workspaceClassName="tests-case-detail-page__workspace"
        settingsClassName="tests-case-detail-page__settings"
      />
      <TestPlanSaveModal
        open={saveModalOpen}
        planName={plan.name}
        nextVersion={(plan.versions || []).reduce(
          (maximum, version) => Math.max(maximum, Number(version.version) || 0),
          0,
        ) + 1}
        caseCount={plan.definition.cases.filter((candidate) => candidate.enabled !== false).length}
        hasPublishedVersion={Boolean(plan.publishedVersionId)}
        busy={busyAction === "save"}
        error={saveError}
        onClose={() => {
          if (busyAction !== "save") setSaveModalOpen(false);
        }}
        onSave={({ outcome, description: versionDescription }) => (
          saveCase(outcome, versionDescription)
        )}
      />
    </>
  );
}
