// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformMonacoCodeEditor } from "./platform-monaco-code-editor.js";

vi.mock("@monaco-editor/react", () => ({
  default: ({ options }: { options?: Record<string, unknown> }) => (
    <div
      data-testid="monaco-editor"
      data-options={JSON.stringify(options)}
    />
  ),
}));

afterEach(cleanup);

describe("PlatformMonacoCodeEditor", () => {
  it("uses the centralized minimal editor presentation", async () => {
    render(
      <PlatformMonacoCodeEditor
        value={'{"ready":true}'}
        language="json"
        readOnly
      />,
    );

    const editor = await screen.findByTestId("monaco-editor");
    const options = JSON.parse(editor.getAttribute("data-options") || "{}") as {
      bracketPairColorization?: { enabled?: boolean };
      guides?: Record<string, boolean>;
      matchBrackets?: string;
      renderLineHighlight?: string;
      stickyScroll?: { enabled?: boolean };
    };

    expect(options.bracketPairColorization?.enabled).toBe(false);
    expect(options.guides).toMatchObject({
      bracketPairs: false,
      bracketPairsHorizontal: false,
      highlightActiveBracketPair: false,
      indentation: false,
      highlightActiveIndentation: false,
    });
    expect(options.matchBrackets).toBe("never");
    expect(options.renderLineHighlight).toBe("none");
    expect(options.stickyScroll?.enabled).toBe(true);
  });
});
