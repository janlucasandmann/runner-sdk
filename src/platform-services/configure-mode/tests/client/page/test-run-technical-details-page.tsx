import {
  Braces,
  FileJson2,
  ListTree,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PlatformCodeEditorWorkspace,
  PlatformMonacoCodeEditor,
  type PlatformCodeEditorFile,
} from "../../../../../platform-ui/components/composite/code-editor-workspace/index.js";
import { MarkdownResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";
import type { TestPlan, TestRun } from "../domain/index.js";

export interface TestRunTechnicalDetailsPageProps {
  run: TestRun;
  plan: TestPlan;
}

type TestRunTechnicalFileId = "technical-details" | "evidence-json";

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function formatStatus(value: string): string {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

const files: readonly PlatformCodeEditorFile[] = [
  {
    id: "technical-details",
    label: "Technical details",
    tabLabel: "technical-details.json",
    ariaLabel: "Technical details",
    leading: <ListTree aria-hidden="true" />,
    openInTab: true,
  },
  {
    id: "evidence-json",
    label: "JSON",
    tabLabel: "evidence.json",
    ariaLabel: "Raw evidence JSON",
    leading: <Braces aria-hidden="true" />,
    openInTab: true,
  },
];

export function TestRunTechnicalDetailsPage({
  run,
  plan,
}: TestRunTechnicalDetailsPageProps) {
  const [activeFileId, setActiveFileId] = useState<TestRunTechnicalFileId>(
    "technical-details",
  );

  useEffect(() => {
    setActiveFileId("technical-details");
  }, [run.id]);

  const technicalDetailsJson = useMemo(() => {
    const evidence = readObject(run.evidence);
    const provenance = readObject(evidence.provenance);
    const attestation = readObject(provenance.attestation);
    const publishedVersion = plan.versions?.find(
      (version) => version.id === run.versionId,
    );
    const executorThreadId = String(
      run.metadata?.executorThreadId
      || run.metadata?.executor_thread_id
      || "",
    ).trim();

    return JSON.stringify({
      runId: run.id,
      status: formatStatus(run.status),
      testPlanId: run.testPlanId,
      testVersion: publishedVersion?.version ?? null,
      runFingerprint: String(evidence.fingerprint || "") || null,
      planFingerprint: String(evidence.planFingerprint || plan.planFingerprint || "") || null,
      trigger: formatStatus(run.triggerType),
      commitSha: run.commitSha || null,
      executorThreadId: executorThreadId || null,
      evidenceSource: formatStatus(String(provenance.source || "legacy import")),
      trustLevel: formatStatus(String(provenance.trustLevel || "legacy")),
      verificationStatus: formatStatus(
        String(provenance.verificationStatus || "unverified"),
      ),
      attestationId: String(attestation.attestationId || "") || null,
      generatedAt: formatTimestamp(String(evidence.generatedAt || run.completedAt || "")),
      startedAt: formatTimestamp(run.startedAt),
      completedAt: formatTimestamp(run.completedAt),
      execution: run.execution,
    }, null, 2);
  }, [plan.planFingerprint, plan.versions, run]);

  const rawEvidenceJson = useMemo(
    () => JSON.stringify(readObject(run.evidence), null, 2),
    [run.evidence],
  );
  const activeValue = activeFileId === "technical-details"
    ? technicalDetailsJson
    : rawEvidenceJson;
  const activeAriaLabel = activeFileId === "technical-details"
    ? "Test run technical details JSON"
    : "Raw test run evidence JSON";
  const activePath = activeFileId === "technical-details"
    ? `tests/${plan.id}/runs/${run.id}/technical-details.json`
    : `tests/${plan.id}/runs/${run.id}/evidence.json`;

  const metadata = (
    <section className="tests-raw-configuration-identity" aria-label="Test run identity">
      <span className="tests-raw-configuration-identity__icon" aria-hidden="true">
        <FileJson2 width={22} height={22} strokeWidth={1.7} />
      </span>
      <div className="tests-raw-configuration-identity__copy">
        <h1>Run {run.id.slice(-8)}</h1>
        <p>{plan.name} · {formatStatus(run.status)}</p>
      </div>
    </section>
  );

  const editor = (
    <PlatformCodeEditorWorkspace
      files={files}
      activeFileId={activeFileId}
      onFileSelect={(fileId) => setActiveFileId(
        fileId === "evidence-json" ? "evidence-json" : "technical-details",
      )}
      sidebarTitle="Run data"
      variant="full-screen"
      className="tests-run-technical-workspace"
      ariaLabel="Test run technical data"
      editor={(
        <PlatformMonacoCodeEditor
          className="tests-raw-configuration-monaco"
          value={activeValue}
          language="json"
          path={activePath}
          ariaLabel={activeAriaLabel}
          readOnly
        />
      )}
    />
  );

  return (
    <MarkdownResourceDetailPage
      metadata={metadata}
      code={editor}
      activeTab="code"
      ariaLabel={`${plan.name} test run technical details`}
      className="tests-raw-configuration-page tests-run-technical-page"
      contentClassName="tests-raw-configuration-page__content"
      codeClassName="tests-raw-configuration-page__code"
      metadataClassName="tests-raw-configuration-page__metadata"
      workspaceClassName="tests-raw-configuration-page__workspace"
    />
  );
}
