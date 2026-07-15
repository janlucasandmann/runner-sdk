// @vitest-environment jsdom

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
});
