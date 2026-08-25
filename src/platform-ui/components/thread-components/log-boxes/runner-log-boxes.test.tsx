import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../../../types.js";
import { RunnerWorkLogEntry } from "./runner-log-boxes.js";

describe("runner log boxes", () => {
  it("uses the shared text-file asset for read-file activity", () => {
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message: "Read file /workspace/notes.txt",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command: "cat /workspace/notes.txt",
        output: "hello",
        exitCode: 0,
        filePaths: ["/workspace/notes.txt"],
      },
    };

    const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);

    expect(markup).toContain("Read file");
    expect(markup).toContain("txtfile.png");
    expect(markup).not.toContain('class="lucide lucide-file-text');
  });

  it("renders SKILL.md reads as semantic skill-description activity", () => {
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message: "Read file /workspace/.claude/skills/mission-control/SKILL.md",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command: "cat /workspace/.claude/skills/mission-control/SKILL.md",
        output:
          "---\nname: mission-control\ndescription: Maintain projects.\n---\n",
        exitCode: 0,
        filePaths: ["/workspace/.claude/skills/mission-control/SKILL.md"],
      },
    };

    const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);

    expect(markup).toContain("Read skill description of Mission Control");
    expect(markup).toContain("lucide-square-mouse-pointer");
    expect(markup).not.toContain("txtfile.png");
    expect(markup).not.toContain("/workspace/.claude/skills");
  });

  it("uses the rocket emoji for listed-project activity", () => {
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message: "Listed projects",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command:
          "python3 /workspace/.claude/skills/task-management/scripts/manage-tasks.py projects list",
        output: JSON.stringify({
          stdout: JSON.stringify({
            data: [{ id: "project_1", name: "My Project" }],
          }),
          stderr: "",
        }),
        exitCode: 0,
      },
    };

    const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);

    expect(markup).toContain("Listed Projects");
    expect(markup).toContain("🚀");
    expect(markup).not.toContain("lucide-rocket");
  });

  it("uses the centralized switch for structured command output", () => {
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message: "Ran command",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command: 'printf \'{"status":"ok"}\'',
        output: JSON.stringify({
          stdout: JSON.stringify({ status: "ok" }),
          stderr: "",
        }),
        exitCode: 0,
      },
    };

    const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);

    expect(markup).toContain("Command Output");
    expect(markup).toContain('data-platform-switch="true"');
    expect(markup).toContain('data-platform-switch-option="preview"');
    expect(markup).toContain('data-platform-switch-option="json"');
    expect(markup).not.toContain("tb-run-summary-json-mode-button");
  });

  it("collapses CLI help output into one topic-aware activity line", () => {
    const log: RunnerLog = {
      time: "2026-08-25T10:00:00.000Z",
      message: "Checked task CLI help",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command:
          "python3 /workspace/.claude/skills/task-management/scripts/manage-tasks.py tasks -h",
        output: JSON.stringify({
          stdout:
            "usage: manage-tasks.py tasks [-h] {list,get,create,comments,comment}",
          stderr: "",
        }),
        exitCode: 0,
      },
    };

    const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);

    expect(markup).toContain("Called help on Tasks");
    expect(markup).not.toContain("tb-log-compact-action-detail");
    expect(markup).toContain("lucide-circle-question-mark");
    expect(markup).not.toContain("Command Output");
    expect(markup).not.toContain("usage: manage-tasks.py");
  });

  it("collapses a Knowledge document listing into one library activity line", () => {
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message: "Read Knowledge documents",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command:
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge documents list knowledge_library_123",
        output: JSON.stringify({
          stdout: JSON.stringify({
            object: "list",
            documents: [
              { id: "knowledge_document_1", title: "Project Strategy" },
              { id: "knowledge_document_2", title: "Evaluation Methodology" },
            ],
          }),
          exitCode: 0,
        }),
        exitCode: 0,
      },
    };

    const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);

    expect(markup).toContain("Read Knowledge Library knowledge_library_123");
    expect(markup).toContain("lucide-library-big");
    expect(markup).not.toContain("Command Output");
    expect(markup).not.toContain("Project Strategy");
  });

  it("collapses a Knowledge library version-state read into one library activity line", () => {
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message: "Inspected Knowledge library state",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command:
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge get knowledge_library_123",
        output: JSON.stringify({
          stdout:
            "CURRENT_VERSION_ID: knowledge_version_1\nCURRENT_VERSION_NUMBER: 1\nPUBLISHED_VERSION_ID: ''\nDOC COUNT: 7\n",
          stderr: "",
        }),
        exitCode: 0,
      },
    };

    const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);

    expect(markup).toContain("Read Knowledge Library knowledge_library_123");
    expect(markup).toContain("lucide-library-big");
    expect(markup).not.toContain("Command Output");
    expect(markup).not.toContain("CURRENT_VERSION_ID");
    expect(markup).not.toContain("DOC COUNT");
  });

  it("collapses a filtered Knowledge listing into one library activity line", () => {
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message:
        "Inspected one Knowledge library from the accessible library list",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command: `$ python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge list 2>&1 | python3 -c "
import sys, json
d = json.loads(sys.stdin.read())
for lib in d.get('data', []):
    if lib.get('id') == 'knowledge_qcyS4Tz0IMeoz_2Ml9Wag':
        print('CURRENT_VERSION_ID:', lib.get('currentVersionId'))
        print('DOC COUNT:', len(lib.get('documents', [])))
"`,
        output: JSON.stringify({
          stdout:
            "CURRENT_VERSION_ID: knowledge_version_1\nCURRENT_VERSION_NUMBER: 1\nPUBLISHED_VERSION_ID: ''\nDOC COUNT: 7\n",
          stderr: "",
        }),
        exitCode: 0,
      },
    };

    const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);

    expect(markup).toContain(
      "Read Knowledge Library knowledge_qcyS4Tz0IMeoz_2Ml9Wag",
    );
    expect(markup).toContain("lucide-library-big");
    expect(markup).not.toContain("Command Output");
    expect(markup).not.toContain("CURRENT_VERSION_ID");
  });

  it("collapses a formatted project task listing into one project activity line", () => {
    const log: RunnerLog = {
      time: "2026-08-25T08:00:00.000Z",
      message: "Listed project tasks",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command: `$ python3 /workspace/.claude/skills/task-management/scripts/manage-tasks.py tasks list --project-id planproj_zpFzDI7EPG7Pu7x-kh8CE 2>&1 | python3 -c "print('TASK COUNT:', 5)" 2>&1 | head -40`,
        output: JSON.stringify({
          stdout:
            "TASK COUNT: 5\n- task_1 | Define project goal | deps: [] | assignee: Spark",
          stderr: "",
        }),
        exitCode: 0,
      },
    };

    const markup = renderToStaticMarkup(
      <RunnerWorkLogEntry
        log={log}
        availableProjects={[
          { id: "planproj_zpFzDI7EPG7Pu7x-kh8CE", name: "My New Project" },
        ]}
      />,
    );

    expect(markup).toContain("Listed tasks in My New Project");
    expect(markup).toContain("tb-log-project-resource-icon is-task");
    expect(markup).toContain("lucide-bookmark");
    expect(markup).not.toContain("Command Output");
    expect(markup).not.toContain("Define project goal");
  });

  it("collapses a formatted project milestone listing into one project activity line", () => {
    const log: RunnerLog = {
      time: "2026-08-25T08:00:00.000Z",
      message: "Listed project milestones",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command: `$ python3 /workspace/.claude/skills/task-management/scripts/manage-tasks.py releases list --project-id planproj_zpFzDI7EPG7Pu7x-kh8CE 2>&1 | python3 -c "print('RELEASE COUNT:', 2)" 2>&1 | head -40`,
        output: JSON.stringify({
          stdout:
            "RELEASE COUNT: 2\n- release_1 | Research foundation | Milestone 1",
          stderr: "",
        }),
        exitCode: 0,
      },
    };

    const markup = renderToStaticMarkup(
      <RunnerWorkLogEntry
        log={log}
        availableProjects={[
          { id: "planproj_zpFzDI7EPG7Pu7x-kh8CE", name: "My New Project" },
        ]}
      />,
    );

    expect(markup).toContain("Listed milestones in My New Project");
    expect(markup).toContain("tb-log-project-resource-icon is-milestone");
    expect(markup).toContain("lucide-milestone");
    expect(markup).not.toContain("Command Output");
    expect(markup).not.toContain("Research foundation");
  });

  it("uses the shared text-file asset for created and updated file activity", () => {
    for (const [message, command, kind] of [
      [
        "Write: /workspace/new.txt",
        "printf 'hello' > /workspace/new.txt",
        "created",
      ],
      [
        "Edit: /workspace/notes.txt",
        "sed -i 's/a/b/' /workspace/notes.txt",
        "modified",
      ],
    ] as const) {
      const log: RunnerLog = {
        time: "2026-08-25T08:00:00.000Z",
        message,
        type: "info",
        eventType: "command_execution",
        metadata: {
          command,
          output: "",
          exitCode: 0,
          filePaths: [message.replace(/^(?:Write|Edit):\s*/, "")],
          changeKinds: [kind],
        },
      };

      const markup = renderToStaticMarkup(<RunnerWorkLogEntry log={log} />);
      expect(markup).toContain("txtfile.png");
      expect(markup).not.toContain("lucide-file-plus");
    }
  });
});
