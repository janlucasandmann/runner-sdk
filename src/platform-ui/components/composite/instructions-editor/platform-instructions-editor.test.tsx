// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { PlatformInstructionsEditor } from "./platform-instructions-editor.js";

afterEach(cleanup);

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
      /\.platform-instructions-editor\.is-minimalistic-ui,[\s\S]*padding:\s*0;[\s\S]*border-radius:\s*0;[\s\S]*background:\s*transparent;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor\.is-minimalistic-ui \.platform-instructions-editor__body\s*\{[\s\S]*width:\s*100%;[\s\S]*margin-left:\s*0;[\s\S]*border:\s*none;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor\.is-minimalistic-ui \.platform-instructions-editor__input\s*\{[\s\S]*border:\s*none;/,
    );
  });
});
