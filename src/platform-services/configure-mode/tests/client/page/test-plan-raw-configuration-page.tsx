import {
  Bookmark,
  FlaskConical,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  PlatformCodeEditorWorkspace,
  PlatformMonacoCodeEditor,
} from "../../../../../platform-ui/components/composite/code-editor-workspace/index.js";
import {
  usePlatformVersionNavigationGuard,
  type PlatformVersionNavigationGuardRegistrar,
} from "../../../../../platform-ui/components/composite/versioning/index.js";
import {
  PlatformPrimaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import {
  MarkdownResourceDetailPage,
} from "../../../../../platform-ui/pages/details/index.js";
import type { TestsApi } from "../api/index.js";
import {
  parseTestPlanDefinition,
  serializeTestPlanDefinition,
  type TestPlan,
} from "../domain/index.js";
import {
  TestPlanSaveModal,
  type TestPlanSaveOutcome,
} from "./test-plan-save-modal.js";

export interface TestPlanRawConfigurationPageProps {
  plan: TestPlan;
  api: TestsApi;
  controlsPortalId?: string;
  onNavigationGuardChange?: PlatformVersionNavigationGuardRegistrar;
  onPlanChange: (plan: TestPlan) => void;
  onReload: () => Promise<void>;
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

export function TestPlanRawConfigurationPage({
  plan,
  api,
  controlsPortalId,
  onNavigationGuardChange,
  onPlanChange,
  onReload,
}: TestPlanRawConfigurationPageProps) {
  const serializedDefinition = useMemo(
    () => serializeTestPlanDefinition(plan.definition),
    [plan.definition],
  );
  const [baselineJson, setBaselineJson] = useState(serializedDefinition);
  const [definitionJson, setDefinitionJson] = useState(serializedDefinition);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const controlsPortalTarget = usePortalTarget(controlsPortalId);
  const parsedDefinition = useMemo(
    () => parseTestPlanDefinition(definitionJson),
    [definitionJson],
  );
  const dirty = definitionJson !== baselineJson;

  useEffect(() => {
    setBaselineJson(serializedDefinition);
    setDefinitionJson(serializedDefinition);
    setSaveModalOpen(false);
    setSaveError("");
  }, [plan.id, plan.updatedAt, serializedDefinition]);

  const discardUnsavedChanges = useCallback(() => {
    setDefinitionJson(baselineJson);
    setSaveModalOpen(false);
    setSaveError("");
  }, [baselineJson]);

  usePlatformVersionNavigationGuard({
    dirty,
    resourceId: plan.id,
    resourceName: plan.name,
    resourceType: "Test",
    onDiscard: discardUnsavedChanges,
    onNavigationGuardChange,
  });

  const openSaveModal = useCallback(() => {
    if (!dirty || busy || !parsedDefinition.definition) return;
    setSaveError("");
    setSaveModalOpen(true);
  }, [busy, dirty, parsedDefinition.definition]);

  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      openSaveModal();
    };
    window.addEventListener("keydown", handleSaveShortcut, true);
    return () => window.removeEventListener("keydown", handleSaveShortcut, true);
  }, [openSaveModal]);

  async function saveConfiguration(
    outcome: TestPlanSaveOutcome,
    versionDescription: string,
  ) {
    if (!parsedDefinition.definition || !dirty || busy) return;
    setBusy(true);
    setSaveError("");
    try {
      const updated = await api.updatePlan(plan.id, {
        definition: parsedDefinition.definition,
      } as Partial<TestPlan>);
      const nextDefinitionJson = serializeTestPlanDefinition(parsedDefinition.definition);
      const mergedPlan: TestPlan = {
        ...plan,
        ...updated,
        definition: parsedDefinition.definition,
        versions: plan.versions,
        runs: plan.runs,
      };

      setBaselineJson(nextDefinitionJson);
      setDefinitionJson(nextDefinitionJson);
      onPlanChange(mergedPlan);

      if (outcome !== "draft") {
        const versions = Array.isArray(plan.versions) ? plan.versions : [];
        const version = await api.createVersion(plan.id, {
          label: `Version ${versions.length + 1}`,
          description: versionDescription || "Saved from the Tests service.",
        });
        if (outcome === "publish") {
          await api.publishVersion(plan.id, version.id);
        }
        await onReload();
      }
      setSaveModalOpen(false);
    } catch (nextError) {
      setSaveError(
        nextError instanceof Error
          ? nextError.message
          : "Failed to save the test configuration.",
      );
    } finally {
      setBusy(false);
    }
  }

  const headerActions = (
    <PlatformPrimaryButton
      type="button"
      size="small"
      disabled={busy || !dirty || !parsedDefinition.definition}
      onClick={openSaveModal}
    >
      <Bookmark width={14} height={14} aria-hidden="true" />
      {busy ? "Saving…" : "Save Changes"}
    </PlatformPrimaryButton>
  );

  const metadata = (
    <section className="tests-raw-configuration-identity" aria-label="Test configuration identity">
      <span className="tests-raw-configuration-identity__icon" aria-hidden="true">
        <FlaskConical width={22} height={22} strokeWidth={1.7} />
      </span>
      <div className="tests-raw-configuration-identity__copy">
        <h1>{plan.name}</h1>
        <p>{plan.description || "Edit the complete test definition as JSON."}</p>
      </div>
    </section>
  );

  const notice = parsedDefinition.error ? (
    <div className="tests-raw-configuration-error" role="alert">
      {parsedDefinition.error}
    </div>
  ) : null;

  const editor = (
    <PlatformCodeEditorWorkspace
      files={[{
        id: "test-config.json",
        label: "test-config.json",
        tabLabel: "test-config.json",
        editorMode: "code",
        openInTab: true,
      }]}
      activeFileId="test-config.json"
      sidebarHidden
      variant="full-screen"
      className="tests-raw-configuration-workspace"
      ariaLabel="Test configuration editor"
      editor={(
        <PlatformMonacoCodeEditor
          className="tests-raw-configuration-monaco"
          value={definitionJson}
          onChange={setDefinitionJson}
          language="json"
          path={`tests/${plan.id}/test-config.json`}
          ariaLabel="Raw test configuration JSON"
        />
      )}
    />
  );

  return (
    <>
      {controlsPortalTarget ? createPortal(headerActions, controlsPortalTarget) : null}
      <MarkdownResourceDetailPage
        metadata={metadata}
        notice={notice}
        code={editor}
        activeTab="code"
        ariaLabel={`${plan.name} raw test configuration`}
        className="tests-raw-configuration-page"
        contentClassName="tests-raw-configuration-page__content"
        codeClassName="tests-raw-configuration-page__code"
        metadataClassName="tests-raw-configuration-page__metadata"
        noticeClassName="tests-raw-configuration-page__notice"
        workspaceClassName="tests-raw-configuration-page__workspace"
      />
      <TestPlanSaveModal
        open={saveModalOpen}
        planName={plan.name}
        nextVersion={(plan.versions?.length || 0) + 1}
        caseCount={parsedDefinition.definition?.cases.filter(
          (testCase) => testCase.enabled !== false,
        ).length || 0}
        hasPublishedVersion={Boolean(plan.publishedVersionId)}
        busy={busy}
        error={saveError}
        onClose={() => {
          if (!busy) setSaveModalOpen(false);
        }}
        onSave={({ outcome, description }) => saveConfiguration(outcome, description)}
      />
    </>
  );
}
