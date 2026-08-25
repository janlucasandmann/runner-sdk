import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../../../types.js";
import { parseRunnerProjectTaskListDetails } from "./project-task-list-state.js";

function commandLog(
  command: string,
  output: unknown = "",
  exitCode = 0,
): RunnerLog {
  return {
    time: "2026-08-25T08:00:00.000Z",
    message: `Executed: ${command}`,
    type: "info",
    eventType: "command_execution",
    metadata: {
      command,
      output: typeof output === "string" ? output : JSON.stringify(output),
      exitCode,
    },
  };
}

describe("project task-list activity state", () => {
  it("recognizes the task-management project task listing and its formatted count", () => {
    const command = `$ python3 /workspace/.claude/skills/task-management/scripts/manage-tasks.py tasks list --project-id planproj_zpFzDI7EPG7Pu7x-kh8CE 2>&1 | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('TASK COUNT:', len(data['data']))
" 2>&1 | head -40`;
    expect(
      parseRunnerProjectTaskListDetails(
        commandLog(command, {
          stdout: "TASK COUNT: 5\n- task_1 | Define project goal",
        }),
      ),
    ).toEqual({
      projectId: "planproj_zpFzDI7EPG7Pu7x-kh8CE",
      projectName: "",
      taskCount: 5,
    });
  });

  it("does not collapse task mutations or failed listings", () => {
    expect(
      parseRunnerProjectTaskListDetails(
        commandLog("python3 manage-tasks.py tasks update task_1 --status done"),
      ),
    ).toBeNull();
    expect(
      parseRunnerProjectTaskListDetails(
        commandLog(
          "python3 manage-tasks.py tasks list --project-id project_1",
          "failed",
          1,
        ),
      ),
    ).toBeNull();
  });
});
