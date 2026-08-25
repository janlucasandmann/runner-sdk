import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../../../types.js";
import { parseRunnerProjectMilestoneListDetails } from "./project-milestone-list-state.js";

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

describe("project milestone-list activity state", () => {
  it("recognizes the task-management project release listing as milestones", () => {
    const command = `$ python3 /workspace/.claude/skills/task-management/scripts/manage-tasks.py releases list --project-id planproj_zpFzDI7EPG7Pu7x-kh8CE 2>&1 | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('RELEASE COUNT:', len(data.get('data', [])))
" 2>&1 | head -40`;
    expect(
      parseRunnerProjectMilestoneListDetails(
        commandLog(command, {
          stdout: "RELEASE COUNT: 2\n- release_1 | Research foundation",
        }),
      ),
    ).toEqual({
      projectId: "planproj_zpFzDI7EPG7Pu7x-kh8CE",
      projectName: "",
      milestoneCount: 2,
    });
  });

  it("does not collapse milestone mutations or failed listings", () => {
    expect(
      parseRunnerProjectMilestoneListDetails(
        commandLog("python3 manage-tasks.py releases create --name Test"),
      ),
    ).toBeNull();
    expect(
      parseRunnerProjectMilestoneListDetails(
        commandLog(
          "python3 manage-tasks.py releases list --project-id project_1",
          "failed",
          1,
        ),
      ),
    ).toBeNull();
  });
});
