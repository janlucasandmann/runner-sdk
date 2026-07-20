// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { PlatformInstructionsEditor } from "./platform-instructions-editor.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformInstructionsEditor", () => {
  it("renders Markdown and owns formatting history", async () => {
    const user = userEvent.setup();

    function Example() {
      const [value, setValue] = useState("Build carefully");
      return <PlatformInstructionsEditor value={value} onChange={setValue} historyKey="agent-1" />;
    }

    const { container } = render(<Example />);
    const textarea = screen.getByRole("textbox", { name: "Instructions" }) as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    textarea.setSelectionRange(0, 5);
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(textarea.value).toBe("**Build** carefully");

    fireEvent.blur(textarea);
    expect(container.querySelector("strong")?.textContent).toBe("Build");

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(textarea.value).toBe("Build carefully");
    await user.click(screen.getByRole("button", { name: "Redo" }));
    expect(textarea.value).toBe("**Build** carefully");
  });

  it("renders safe read-only Markdown without editor controls", () => {
    const { container } = render(
      <PlatformInstructionsEditor
        value={"++Important++\n\n- First\n- Second\n\n<script>alert('x')</script>"}
        onChange={() => undefined}
        readOnly
      />,
    );

    expect(container.querySelector("u")?.textContent).toBe("Important");
    expect(screen.getByText("First")).not.toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.queryByRole("toolbar", { name: "Markdown formatting" })).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("exposes the minimalistic UI variant without changing the default editor", () => {
    const { container, rerender } = render(
      <PlatformInstructionsEditor
        value=""
        onChange={() => undefined}
        variant="minimalistic-ui"
      />,
    );

    const minimalEditor = container.querySelector("[data-platform-instructions-editor]");
    expect(minimalEditor?.classList.contains("is-minimalistic-ui")).toBe(true);
    expect(minimalEditor?.getAttribute("data-platform-instructions-editor-variant")).toBe("minimalistic-ui");

    rerender(<PlatformInstructionsEditor value="" onChange={() => undefined} />);
    const defaultEditor = container.querySelector("[data-platform-instructions-editor]");
    expect(defaultEditor?.classList.contains("is-minimalistic-ui")).toBe(false);
    expect(defaultEditor?.getAttribute("data-platform-instructions-editor-variant")).toBe("default");
  });

  it("keeps the minimalistic UI surfaces flat and transparent", () => {
    const css = readFileSync(
      path.join(process.cwd(), "src/platform-ui/components/composite/instructions-editor/instructions-editor.css"),
      "utf8",
    );

    expect(css).toMatch(
      /\.platform-instructions-editor\s*\{[\s\S]*border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.075\);[\s\S]*border-radius:\s*15px;[\s\S]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.075\);/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor\.is-minimalistic-ui,[\s\S]*padding:\s*0;[\s\S]*border:\s*none;[\s\S]*border-radius:\s*0;[\s\S]*background:\s*transparent;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor\.is-minimalistic-ui \.platform-instructions-editor__body\s*\{[\s\S]*width:\s*100%;[\s\S]*margin-left:\s*0;[\s\S]*border:\s*none;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor\.is-minimalistic-ui \.platform-instructions-editor__input\s*\{[\s\S]*border:\s*none;/,
    );
  });

  it("removes the top radius only while the sticky header is pinned", () => {
    const { container } = render(
      <div data-testid="scroll-container" style={{ height: "100px", overflowY: "auto" }}>
        <PlatformInstructionsEditor value="Instructions" onChange={() => undefined} />
      </div>,
    );
    const scrollContainer = screen.getByTestId("scroll-container");
    const editor = container.querySelector(".platform-instructions-editor") as HTMLElement;
    const header = container.querySelector(".platform-instructions-editor__header") as HTMLElement;
    let editorTop = -20;

    vi.spyOn(scrollContainer, "getBoundingClientRect").mockImplementation(() => ({ top: 0 } as DOMRect));
    vi.spyOn(editor, "getBoundingClientRect").mockImplementation(() => ({ top: editorTop } as DOMRect));
    vi.spyOn(header, "getBoundingClientRect").mockImplementation(() => ({ top: 0 } as DOMRect));

    fireEvent.scroll(scrollContainer);
    expect(header.classList.contains("is-stuck")).toBe(true);
    expect(header.getAttribute("data-platform-instructions-editor-header-stuck")).toBe("true");

    editorTop = 0;
    fireEvent.scroll(scrollContainer);
    expect(header.classList.contains("is-stuck")).toBe(false);

    const css = readFileSync(
      path.join(process.cwd(), "src/platform-ui/components/composite/instructions-editor/instructions-editor.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.platform-instructions-editor\.is-sticky \.platform-instructions-editor__header\.is-stuck\s*\{[\s\S]*border-top-left-radius:\s*0;[\s\S]*border-top-right-radius:\s*0;/,
    );
  });
});
