import { Braces, FileJson2, Gauge, KeyRound, ListChecks } from "lucide-react";
import {
  type PlatformCodeEditorFile,
  PlatformCodeEditorWorkspace,
  PlatformMonacoCodeEditor,
} from "../../../../../platform-ui/components/composite/code-editor-workspace/index.js";
import type { TestCaseCodeFileId, TestCaseCodeSources } from "./test-case-code-files.js";

export interface TestCaseCodeEditorProps {
  testCaseId: string;
  files: TestCaseCodeSources;
  activeFileId: TestCaseCodeFileId;
  errors?: Partial<Record<TestCaseCodeFileId, string>>;
  onFileSelect: (fileId: TestCaseCodeFileId) => void;
  onFileChange: (fileId: TestCaseCodeFileId, source: string) => void;
}

const TEST_CASE_CODE_FILES: readonly PlatformCodeEditorFile[] = [
  {
    id: "case.json",
    label: "case.json",
    tabLabel: "case.json",
    ariaLabel: "Case metadata",
    leading: <FileJson2 aria-hidden="true" />,
    openInTab: true,
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
  {
    id: "execution.json",
    label: "execution.json",
    tabLabel: "execution.json",
    ariaLabel: "Execution configuration",
    leading: <Gauge aria-hidden="true" />,
    openInTab: true,
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
  {
    id: "request.json",
    label: "request.json",
    tabLabel: "request.json",
    ariaLabel: "Target request",
    leading: <Braces aria-hidden="true" />,
    openInTab: true,
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
  {
    id: "assertions.json",
    label: "assertions.json",
    tabLabel: "assertions.json",
    ariaLabel: "Assertions",
    leading: <ListChecks aria-hidden="true" />,
    openInTab: true,
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
  {
    id: "environment.json",
    label: "environment.json",
    tabLabel: "environment.json",
    ariaLabel: "Environment and secret references",
    leading: <KeyRound aria-hidden="true" />,
    openInTab: true,
    selectable: false,
    renameDisabled: true,
    deleteDisabled: true,
    moveDisabled: true,
  },
] as const;

function isTestCaseCodeFileId(fileId: string): fileId is TestCaseCodeFileId {
  return TEST_CASE_CODE_FILES.some((file) => file.id === fileId);
}

export function TestCaseCodeEditor({
  testCaseId,
  files,
  activeFileId,
  errors = {},
  onFileSelect,
  onFileChange,
}: TestCaseCodeEditorProps) {
  return (
    <PlatformCodeEditorWorkspace
      files={TEST_CASE_CODE_FILES.map((file) => ({
        ...file,
        dirty: Boolean(errors[file.id as TestCaseCodeFileId]),
      }))}
      activeFileId={activeFileId}
      onFileSelect={(fileId) => {
        if (isTestCaseCodeFileId(fileId)) onFileSelect(fileId);
      }}
      sidebarTitle="Case files"
      variant="full-screen"
      className="tests-case-code-workspace"
      ariaLabel="Test case configuration files"
      editor={
        <PlatformMonacoCodeEditor
          className="tests-case-code-editor"
          value={files[activeFileId]}
          onChange={(source) => onFileChange(activeFileId, source)}
          language="json"
          path={`tests/cases/${testCaseId}/${activeFileId}`}
          ariaLabel={`${activeFileId} test case configuration`}
        />
      }
    />
  );
}
