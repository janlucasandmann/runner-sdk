import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../../../types.js";
import {
  parseRunnerKnowledgeActivityDetails,
  parseRunnerKnowledgeReadDetails,
} from "./knowledge-activity-state.js";

function commandLog(command: string, output: unknown = ""): RunnerLog {
  return {
    time: "2026-08-25T06:00:00.000Z",
    message: command,
    type: "info",
    eventType: "command_execution",
    metadata: {
      command,
      output: typeof output === "string" ? output : JSON.stringify(output),
    },
  };
}

describe("Knowledge activity state", () => {
  it("recognizes a Knowledge library document-list read", () => {
    expect(
      parseRunnerKnowledgeReadDetails(
        commandLog(
          `$ python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge documents list knowledge_library_123 2>&1 | python3 -c "import sys, json; print('DOC COUNT:', 4)"`,
        ),
      ),
    ).toEqual({
      libraryId: "knowledge_library_123",
      libraryName: "",
      operation: "list",
    });
  });

  it("recognizes a direct Knowledge document read and its returned library name", () => {
    expect(
      parseRunnerKnowledgeReadDetails(
        commandLog(
          "curl https://api.example.test/knowledge/knowledge_library_123/documents/knowledge_document_4",
          JSON.stringify({
            libraryName: "Project Research",
            id: "knowledge_document_4",
          }),
        ),
      ),
    ).toEqual({
      libraryId: "knowledge_library_123",
      libraryName: "Project Research",
      operation: "get",
    });
  });

  it("recognizes a Knowledge library metadata read used to inspect version state", () => {
    expect(
      parseRunnerKnowledgeReadDetails(
        commandLog(
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge get knowledge_library_123",
          {
            stdout:
              "CURRENT_VERSION_ID: knowledge_version_1\nCURRENT_VERSION_NUMBER: 1\nPUBLISHED_VERSION_ID: ''\nDOC COUNT: 7\n",
            stderr: "",
          },
        ),
      ),
    ).toEqual({
      libraryId: "knowledge_library_123",
      libraryName: "",
      operation: "get",
    });
  });

  it("recognizes a general library listing narrowed to one explicit library", () => {
    expect(
      parseRunnerKnowledgeReadDetails(
        commandLog(
          `$ python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge list 2>&1 | python3 -c "
import sys, json
raw = sys.stdin.read()
d = json.loads(raw)
for lib in d.get('data', []):
    if lib.get('id') == 'knowledge_qcyS4Tz0IMeoz_2Ml9Wag':
        print('CURRENT_VERSION_ID:', lib.get('currentVersionId'))
        print('DOC COUNT:', len(lib.get('documents', [])))
"`,
          {
            stdout:
              "CURRENT_VERSION_ID: knowledge_version_1\nCURRENT_VERSION_NUMBER: 1\nPUBLISHED_VERSION_ID: ''\nDOC COUNT: 7\n",
            stderr: "",
          },
        ),
      ),
    ).toEqual({
      libraryId: "knowledge_qcyS4Tz0IMeoz_2Ml9Wag",
      libraryName: "",
      operation: "list",
    });
  });

  it("does not collapse an unscoped Knowledge library listing", () => {
    expect(
      parseRunnerKnowledgeReadDetails(
        commandLog(
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge list",
        ),
      ),
    ).toBeNull();
  });

  it("recognizes the equivalent direct Knowledge library API read", () => {
    expect(
      parseRunnerKnowledgeReadDetails(
        commandLog(
          "curl https://api.example.test/v1/knowledge/knowledge_library_123",
        ),
      ),
    ).toEqual({
      libraryId: "knowledge_library_123",
      libraryName: "",
      operation: "get",
    });
  });

  it("recognizes Knowledge version inspection as a library read", () => {
    expect(
      parseRunnerKnowledgeReadDetails(
        commandLog(
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge versions knowledge_library_123 get knowledge_version_1",
        ),
      ),
    ).toEqual({
      libraryId: "knowledge_library_123",
      libraryName: "",
      operation: "get",
    });
  });

  it("recognizes Knowledge document proposals as library updates", () => {
    expect(
      parseRunnerKnowledgeActivityDetails(
        commandLog(
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge documents propose knowledge_library_123 --operation update_document",
          { libraryName: "Project Research", id: "knowledge_proposal_1" },
        ),
      ),
    ).toEqual({
      libraryId: "knowledge_library_123",
      libraryName: "Project Research",
      operation: "update",
    });
  });

  it("does not mislabel Knowledge mutations as reads", () => {
    expect(
      parseRunnerKnowledgeReadDetails(
        commandLog(
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge documents propose knowledge_library_123 --operation update_document",
        ),
      ),
    ).toBeNull();
  });

  it("does not collapse failed Knowledge mutations", () => {
    const failedLog = commandLog(
      "python3 computer-agents.py knowledge documents propose knowledge_library_123 --operation update_document",
    );
    failedLog.metadata = { ...failedLog.metadata, exitCode: 1 };
    expect(parseRunnerKnowledgeActivityDetails(failedLog)).toBeNull();
  });
});
