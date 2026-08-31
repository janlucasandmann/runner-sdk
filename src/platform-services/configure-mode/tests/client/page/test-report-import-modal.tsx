import { FileUp, Loader2 } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import type {
  TestCaseDefinition,
  TestImportRunCreateInput,
  TestReportFormat,
} from "../domain/index.js";

interface TestReportImportModalProps {
  open: boolean;
  scenarios: readonly TestCaseDefinition[];
  busy?: boolean;
  error?: string;
  onClose: () => void;
  onImport: (input: TestImportRunCreateInput) => Promise<void> | void;
}

const FORMAT_OPTIONS: Array<{
  value: TestReportFormat;
  label: string;
  description: string;
}> = [
  { value: "junit", label: "JUnit XML", description: "JUnit-compatible XML from any test runner." },
  { value: "vitest", label: "Vitest JSON", description: "Vitest JSON reporter output." },
  { value: "jest", label: "Jest JSON", description: "Jest --json output." },
  { value: "playwright", label: "Playwright JSON", description: "Playwright JSON reporter output." },
  { value: "normalized", label: "Normalized JSON", description: "Computer Agents scenarios, Tests, and results schema." },
];

function reportValue(format: TestReportFormat, source: string): unknown {
  if (format === "junit") return source;
  try {
    return JSON.parse(source);
  } catch {
    throw new Error("The selected report format requires valid JSON.");
  }
}

export function TestReportImportModal({
  open,
  scenarios,
  busy = false,
  error = "",
  onClose,
  onImport,
}: TestReportImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [scenarioId, setScenarioId] = useState("");
  const [format, setFormat] = useState<TestReportFormat>("junit");
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [localError, setLocalError] = useState("");

  const scenarioOptions = useMemo(() => scenarios
    .filter((scenario) => scenario.enabled !== false)
    .map((scenario) => ({
      value: scenario.id,
      label: scenario.name,
      description: scenario.description || scenario.id,
    })), [scenarios]);

  useEffect(() => {
    if (!open) return;
    setScenarioId(scenarioOptions[0]?.value || "");
    setFormat("junit");
    setSource("");
    setFileName("");
    setCommitSha("");
    setLocalError("");
  }, [open, scenarioOptions]);

  async function chooseFile(file: File | undefined) {
    if (!file) return;
    const nextSource = await file.text();
    setSource(nextSource);
    setFileName(file.name);
    setLocalError("");
    const extension = file.name.toLowerCase().split(".").at(-1);
    if (extension === "xml") setFormat("junit");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!scenarioId) {
      setLocalError("Choose the scenario this report verifies.");
      return;
    }
    if (!source.trim()) {
      setLocalError("Upload or paste a report.");
      return;
    }
    try {
      const report = reportValue(format, source);
      setLocalError("");
      void onImport({
        scenarioId,
        format,
        report,
        commitSha: commitSha.trim() || undefined,
      });
    } catch (nextError) {
      setLocalError(nextError instanceof Error ? nextError.message : "The report is invalid.");
    }
  }

  return (
    <PlatformModal
      open={open}
      title="Import test report"
      description="Attach standard CI results to one scenario as an immutable, self-reported run."
      as="form"
      size="large"
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      closeButtonDisabled={busy}
      onClose={onClose}
      className="tests-report-import-modal"
      surfaceProps={{ onSubmit: submit }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" disabled={busy} onClick={onClose}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={busy || !scenarioId || !source.trim()}
          >
            {busy ? (
              <Loader2 className="tests-spin" width={14} height={14} aria-hidden="true" />
            ) : (
              <FileUp width={14} height={14} aria-hidden="true" />
            )}
            {busy ? "Importing…" : "Import Run"}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <div className="tests-report-import-modal__grid">
        <div className="tests-form-field">
          <span>Scenario</span>
          <PlatformSelector
            value={scenarioId}
            options={scenarioOptions}
            fullWidth
            ariaLabel="Imported report scenario"
            disabled={busy}
            onValueChange={setScenarioId}
          />
        </div>
        <div className="tests-form-field">
          <span>Format</span>
          <PlatformSelector
            value={format}
            options={FORMAT_OPTIONS}
            fullWidth
            ariaLabel="Imported report format"
            disabled={busy}
            onValueChange={(value) => setFormat(value as TestReportFormat)}
          />
        </div>
        <label className="tests-form-field is-span-2">
          <span>Commit SHA <small>Optional</small></span>
          <input
            value={commitSha}
            maxLength={200}
            placeholder="0123456789abcdef"
            aria-label="Imported report commit SHA"
            disabled={busy}
            onChange={(event) => setCommitSha(event.currentTarget.value)}
          />
        </label>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".xml,.json,application/xml,text/xml,application/json"
        hidden
        onChange={(event) => void chooseFile(event.currentTarget.files?.[0])}
      />
      <PlatformSecondaryButton
        size="small"
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        <FileUp width={14} height={14} aria-hidden="true" />
        {fileName || "Choose report file"}
      </PlatformSecondaryButton>
      <PlatformInstructionsEditor
        title={format === "junit" ? "JUnit XML" : `${format} JSON`}
        value={source}
        onChange={setSource}
        placeholder={format === "junit"
          ? '<testsuite name="unit">…</testsuite>'
          : '{\n  "testResults": []\n}'}
        ariaLabel="Imported test report"
        historyKey="tests:report-import"
        variant="minimalistic-ui"
        stickyHeader={false}
        editorMode="code"
        codeLanguage={format === "junit" ? "xml" : "json"}
        codePath={format === "junit" ? "test-results.xml" : "test-results.json"}
        className="tests-report-import-modal__editor"
      />
      {localError || error ? (
        <p className="tests-form-error" role="alert">{localError || error}</p>
      ) : null}
    </PlatformModal>
  );
}
