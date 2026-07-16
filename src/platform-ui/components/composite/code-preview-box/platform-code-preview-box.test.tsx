// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformCodePreviewBox } from "./platform-code-preview-box.js";

afterEach(cleanup);

const languages = [
  { value: "javascript", label: "javascript" },
  { value: "python", label: "python" },
] as const;

describe("PlatformCodePreviewBox", () => {
  it("renders the shared quickstart composition and changes languages", () => {
    const onLanguageChange = vi.fn();
    const onAction = vi.fn();
    const { container } = render(
      <PlatformCodePreviewBox
        title="Developer quickstart"
        description="Run your first workflow."
        action={{ label: "Get started", onClick: onAction }}
        languages={languages}
        language="javascript"
        onLanguageChange={onLanguageChange}
        code={"const client = createClient();\nclient.run();"}
      />,
    );

    expect(screen.getByRole("heading", { name: "Developer quickstart" })).not.toBeNull();
    expect(container.querySelectorAll(".platform-code-preview-box__line")).toHaveLength(2);

    fireEvent.click(screen.getByRole("radio", { name: "python" }));
    expect(onLanguageChange).toHaveBeenCalledWith("python");

    const action = screen.getByRole("button", { name: "Get started" });
    expect(action.getAttribute("data-platform-button-variant")).toBe("primary");
    fireEvent.click(action);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("copies the current code through the component contract", async () => {
    const onCopy = vi.fn();
    render(
      <PlatformCodePreviewBox
        title="Database API"
        languages={languages}
        language="python"
        onLanguageChange={() => {}}
        code="print('ready')"
        copyLabel="Copy database API code"
        onCopy={onCopy}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy database API code" }));
    expect(onCopy).toHaveBeenCalledWith("print('ready')");
  });

  it("exposes editor mode without rendering page-owned editor markup", () => {
    render(
      <PlatformCodePreviewBox
        title="Database API"
        languages={languages}
        language="javascript"
        onLanguageChange={() => {}}
        code="console.log('ready');"
        mode="editor"
      />,
    );

    expect(screen.getByLabelText("Database API").getAttribute("data-platform-code-preview-mode")).toBe("editor");
    expect(screen.getByRole("status", { name: "Loading code editor" })).not.toBeNull();
  });
});
