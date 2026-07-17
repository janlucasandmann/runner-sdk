import { describe, expect, it } from "vitest";
import { buildPermissionRequestPreview } from "./permission-request-view.js";

describe("buildPermissionRequestPreview", () => {
  it("presents shell commands as a one-shot permission", () => {
    expect(
      buildPermissionRequestPreview(
        "Bash",
        JSON.stringify({ command: "git push origin main" }),
        "Publishing changes requires approval.",
      ),
    ).toEqual({
      summary: "Approving lets the agent run this shell command once, then continue.",
      details: [],
      previewLabel: "Command",
      previewContent: "git push origin main",
      previewLanguage: "shell",
      reason: "Publishing changes requires approval.",
    });
  });

  it("normalizes REPL language aliases and file metadata", () => {
    expect(
      buildPermissionRequestPreview(
        "repl",
        JSON.stringify({
          path: "/workspace/check.py",
          lang: "py",
          source: "print('ok')",
        }),
        "",
      ),
    ).toMatchObject({
      summary: "Approving lets the agent run this Python code once, then continue.",
      details: [{ label: "File", value: "/workspace/check.py" }],
      previewContent: "print('ok')",
      previewLanguage: "python",
    });
  });

  it("builds an edit preview without exposing generic ask-rule copy", () => {
    expect(
      buildPermissionRequestPreview(
        "edit_file",
        JSON.stringify({
          file_path: "/workspace/app.ts",
          old_string: "before",
          new_string: "after",
        }),
        "Requires approval due to ask rule",
      ),
    ).toEqual({
      summary: "Approving lets the agent edit this file once, then continue.",
      details: [{ label: "File", value: "/workspace/app.ts" }],
      previewLabel: "Proposed change",
      previewContent: "Replace:\nbefore\n\nWith:\nafter",
      previewLanguage: undefined,
      previewFilePath: "/workspace/app.ts",
      reason: "",
    });
  });

  it("retains plain-text input for unknown tools", () => {
    expect(
      buildPermissionRequestPreview("send_email", "Send the prepared status update", ""),
    ).toMatchObject({
      summary: "Approving lets the agent use send_email once, then continue.",
      previewContent: "Send the prepared status update",
    });
  });
});
