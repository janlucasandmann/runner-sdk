// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import { PlatformInstructionsEditor } from "./platform-instructions-editor.js";
import {
  normalizePlatformInstructionsEditorMarkdownImages,
  parsePlatformInstructionsEditorImageMarkdown,
} from "./platform-instructions-editor-image-node.js";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
    language,
    options,
  }: {
    value?: string;
    onChange?: (value: string) => void;
    language?: string;
    options?: { ariaLabel?: string };
  }) => (
    <textarea
      aria-label={options?.ariaLabel || "Code editor"}
      data-testid="instructions-monaco-editor"
      data-language={language}
      value={value || ""}
      onChange={(event) => onChange?.(event.currentTarget.value)}
    />
  ),
}));

beforeEach(() => {
  vi.stubGlobal("scrollBy", vi.fn());
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: () => document.querySelector("[contenteditable='true']") || document.body,
  });
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value: () => [],
  });
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      left: 0,
      right: 0,
      top: 0,
      bottom: 20,
      width: 0,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("PlatformInstructionsEditor", () => {
  it("supports a body-only presentation without rendering its header", () => {
    const { container } = render(
      <PlatformInstructionsEditor
        value="# Knowledge"
        onChange={() => undefined}
        ariaLabel="Knowledge document"
        showHeader={false}
        bodyTitle="Knowledge guide"
      />,
    );

    expect(container.querySelector(".platform-instructions-editor__header")).toBeNull();
    expect(screen.getByRole("heading", { name: "Knowledge guide" })).not.toBeNull();
    expect(screen.getByRole("textbox", { name: "Knowledge document" })).not.toBeNull();
  });

  it("provides a centralized Monaco-backed code mode", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <PlatformInstructionsEditor
        title="Request body"
        value={'{"ready":true}'}
        onChange={onChange}
        ariaLabel="Request body"
        historyKey="request-body"
        editorMode="code"
        codeLanguage="json"
        codePath="request.json"
      />,
    );

    const shell = container.querySelector('[data-platform-instructions-editor-mode="code"]');
    expect(shell).not.toBeNull();
    expect(
      container.querySelector('[data-platform-monaco-code-editor="true"][data-language="json"]'),
    ).not.toBeNull();
    expect(screen.queryByRole("toolbar", { name: "Markdown formatting" })).toBeNull();

    const editor = await screen.findByTestId("instructions-monaco-editor");
    fireEvent.change(editor, { target: { value: '{"ready":false}' } });
    expect(onChange).toHaveBeenLastCalledWith('{"ready":false}', { source: "edit" });
  });

  it("does not report controlled content as an edit during initial hydration", async () => {
    const onChange = vi.fn();

    render(
      <PlatformInstructionsEditor
        value={[
          "# Existing instructions",
          "",
          "- Keep the current configuration.",
          "- Preserve **formatted** content.",
          "",
          "| Check | Result |",
          "| --- | --- |",
          "| Hydration | Stable |",
        ].join("\n")}
        onChange={onChange}
        historyKey="hydrated-resource"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Instructions" })).not.toBeNull();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reports an edit after the controlled editor receives user focus", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PlatformInstructionsEditor
        value="Existing instructions"
        onChange={onChange}
        historyKey="editable-resource"
      />,
    );

    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard(" updated");

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toContain("updated");
  });

  it("keeps wrapped text in one block and applies styles to an explicitly created block", async () => {
    const user = userEvent.setup();
    let persistedValue = "";

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("One paragraph that can wrap naturally without becoming another block");
    expect(Array.from(editor.children).map((child) => child.tagName)).toEqual(["P"]);

    await user.keyboard("{Enter}A separately styled block");
    expect(Array.from(editor.children).map((child) => child.tagName)).toEqual(["P", "P"]);
    expect(persistedValue).toContain("block\n\nA separately styled block");

    await user.click(screen.getByRole("button", { name: "Style" }));
    await user.click(screen.getByRole("menuitem", { name: "Heading 1" }));
    expect(editor.firstElementChild?.tagName).toBe("P");
    expect(editor.querySelector("h1")?.textContent).toBe("A separately styled block");
    expect(persistedValue).toContain("\n\n# A separately styled block");
  });

  it("creates and focuses a paragraph when the whitespace below content is clicked", async () => {
    const user = userEvent.setup();
    let persistedValue = "Existing block";

    function Example() {
      const [value, setValue] = useState(persistedValue);
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
          variant="minimalistic-ui"
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    const existingBlock = editor.lastElementChild as HTMLElement;
    vi.spyOn(existingBlock, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 400,
      top: 0,
      bottom: 20,
      width: 400,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.mouseDown(editor, { button: 0, clientX: 20, clientY: 36 });
    expect(Array.from(editor.children).map((child) => child.tagName)).toEqual(["P", "P"]);
    expect(document.activeElement).toBe(editor);

    await user.keyboard("Created by clicking below");
    expect(persistedValue).toBe("Existing block\n\nCreated by clicking below");
  });

  it("uses Shift+Enter for a soft line break inside the active block", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PlatformInstructionsEditor value="" onChange={() => undefined} />,
    );
    const editor = screen.getByRole("textbox", { name: "Instructions" });

    await user.click(editor);
    await user.keyboard("First line{Shift>}{Enter}{/Shift}Second line");

    expect(Array.from(editor.children).map((child) => child.tagName)).toEqual(["P"]);
    expect(
      container.querySelector(".platform-instructions-editor__prosemirror p br"),
    ).not.toBeNull();
  });

  it("moves the placeholder to the selected empty block", async () => {
    const user = userEvent.setup();

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={setValue}
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });

    await user.click(editor);
    await user.keyboard("Existing block{Enter}");

    const blocks = Array.from(editor.children);
    expect(blocks).toHaveLength(2);
    await waitFor(() => {
      expect(editor.querySelector("[data-placeholder].is-empty")).not.toBeNull();
    });
    const placeholderBlock = editor.querySelector("[data-placeholder].is-empty");
    expect(placeholderBlock?.textContent).toBe("");
    expect(placeholderBlock?.getAttribute("data-placeholder")).toBe('Enter "/" for commands');
    expect(blocks.filter((block) => block.hasAttribute("data-placeholder"))).toHaveLength(1);

    await user.keyboard("New content");
    expect(editor.querySelector("[data-placeholder].is-empty")).toBeNull();
  });

  it("does not report resource or authoritative-value hydration as an edit", async () => {
    const onChange = vi.fn();
    const view = render(
      <PlatformInstructionsEditor
        value="List-preview instructions"
        onChange={onChange}
        historyKey="agent-list-preview"
      />,
    );

    view.rerender(
      <PlatformInstructionsEditor
        value={"# Authoritative instructions\n\n- Keep this configuration."}
        onChange={onChange}
        historyKey="agent-authoritative"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Instructions" }).textContent).toContain(
        "Authoritative instructions",
      );
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps formatting rendered while editing and owns keyboard formatting history", async () => {
    const user = userEvent.setup();
    let persistedValue = "Build carefully";

    function Example() {
      const [value, setValue] = useState("Build carefully");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
          historyKey="agent-1"
        />
      );
    }

    const { container } = render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(container.querySelector("strong")?.textContent).toBe("Build carefully");
    expect(persistedValue).toBe("**Build carefully**");

    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Redo" })).toBeNull();
    await user.click(editor);
    await user.keyboard("{Control>}z{/Control}");
    expect(container.querySelector("strong")).toBeNull();
    expect(persistedValue).toBe("Build carefully");
    await user.keyboard("{Control>}{Shift>}z{/Shift}{/Control}");
    expect(container.querySelector("strong")?.textContent).toBe("Build carefully");
    expect(persistedValue).toBe("**Build carefully**");
  });

  it("opens the centralized formatting popup when a text selection is completed", async () => {
    const user = userEvent.setup();

    render(
      <PlatformInstructionsEditor
        value="Select this line"
        onChange={() => undefined}
        historyKey="automatic-selection-menu"
      />,
    );

    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");

    expect(screen.getByRole("menu", { name: "Text formatting" })).not.toBeNull();
  });

  it("summarizes mixed block selections and changes their type from the hover submenu", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PlatformInstructionsEditor
        value={"Normal text\n\n# Existing heading"}
        onChange={() => undefined}
        historyKey="mixed-selection-types"
      />,
    );

    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");

    const typeTrigger = screen.getByRole("menuitem", { name: "Multiple types" });
    const typeSubmenu = typeTrigger.closest(".platform-popup-submenu");
    expect(typeSubmenu).not.toBeNull();
    if (!typeSubmenu) throw new Error("Expected the block type submenu anchor.");
    fireEvent.pointerEnter(typeSubmenu);
    const typeMenu = screen.getByRole("menu", { name: "Change block type" });
    expect(typeMenu.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(screen.getByRole("menuitemradio", { name: "Normal text" })).not.toBeNull();
    expect(screen.getByRole("menuitemradio", { name: "Heading 1" })).not.toBeNull();
    expect(
      screen
        .getByRole("menuitemradio", { name: "Bulleted list" })
        .querySelector('[data-hugeicons-icon="ListIcon"]'),
    ).not.toBeNull();

    await user.click(screen.getByRole("menuitemradio", { name: "Heading 1" }));
    expect(screen.getByRole("menu", { name: "Text formatting" })).not.toBeNull();
    expect(
      Array.from(container.querySelectorAll(".platform-instructions-editor__prosemirror h1"))
        .filter((heading) => Boolean(heading.textContent?.trim())),
    ).toHaveLength(2);
  });

  it("treats a selected list as one block type in the selection menu", async () => {
    const user = userEvent.setup();
    render(
      <PlatformInstructionsEditor
        value={"- First\n- Second"}
        onChange={() => undefined}
        historyKey="list-selection-type"
      />,
    );

    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");

    const typeTrigger = screen.getByRole("menuitem", { name: "Bulleted list" });
    const typeSubmenu = typeTrigger.closest(".platform-popup-submenu");
    expect(typeSubmenu).not.toBeNull();
    if (!typeSubmenu) throw new Error("Expected the list type submenu anchor.");
    fireEvent.pointerEnter(typeSubmenu);
    expect(
      screen.getByRole("menuitemradio", { name: "Bulleted list" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("renders a Notion-style drag handle for editable document blocks", async () => {
    const { container } = render(
      <PlatformInstructionsEditor
        value={"# Heading\n\nParagraph"}
        onChange={() => undefined}
        historyKey="block-drag-handle"
        variant="block-editor"
      />,
    );

    await waitFor(() => {
      expect(
        container.querySelector(".platform-instructions-editor__block-drag-handle"),
      ).not.toBeNull();
    });

    const handle = container.querySelector(
      ".platform-instructions-editor__block-drag-handle",
    ) as HTMLElement;
    expect(handle.draggable).toBe(true);
    expect(container.querySelector('[aria-label="Move block"]')).not.toBeNull();
  });

  it("keeps block drag handles out of default and minimalistic editor variants", async () => {
    const { container, rerender } = render(
      <PlatformInstructionsEditor value="Paragraph" onChange={() => undefined} />,
    );

    await waitFor(() => {
      expect(
        container.querySelector(".platform-instructions-editor__block-drag-handle"),
      ).toBeNull();
    });

    rerender(
      <PlatformInstructionsEditor
        value="Paragraph"
        onChange={() => undefined}
        variant="minimalistic-ui"
      />,
    );
    expect(
      container.querySelector(".platform-instructions-editor__block-drag-handle"),
    ).toBeNull();
  });

  it("formats a selected range from the centralized right-click menu", async () => {
    const user = userEvent.setup();
    let persistedValue = "Build carefully";

    function Example() {
      const [value, setValue] = useState(persistedValue);
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
          historyKey="selection-menu"
        />
      );
    }

    const { container } = render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");
    fireEvent.contextMenu(editor, { clientX: 4, clientY: 4 });

    const menu = screen.getByRole("menu", { name: "Text formatting" });
    const menuSurface = menu.closest(".platform-popup-surface") as HTMLElement;
    expect(menuSurface.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(menuSurface.style.width).toBe("230px");
    const normalTextTrigger = screen.getByRole("menuitem", { name: "Normal text" });
    expect(normalTextTrigger.querySelector(".hugeicons-type")).not.toBeNull();
    expect(screen.getByRole("menuitemcheckbox", { name: "Bold" })).not.toBeNull();
    expect(screen.getByRole("menuitemcheckbox", { name: "Italic" })).not.toBeNull();
    expect(screen.getByRole("menuitemcheckbox", { name: "Underline" })).not.toBeNull();
    expect(screen.getByRole("menuitemcheckbox", { name: "Align left" })).not.toBeNull();
    expect(screen.getByRole("menuitemcheckbox", { name: "Align center" })).not.toBeNull();
    expect(screen.getByRole("menuitemcheckbox", { name: "Align right" })).not.toBeNull();
    const justifySelectionButton = screen.getByRole("menuitemcheckbox", {
      name: "Align justify",
    });
    expect(justifySelectionButton.querySelector(".hugeicons-align-justify")).not.toBeNull();

    const boldSelectionButton = screen.getByRole("menuitemcheckbox", { name: "Bold" });
    await user.click(boldSelectionButton);
    expect(persistedValue).toBe("**Build carefully**");
    expect(boldSelectionButton.getAttribute("aria-checked")).toBe("true");
    expect(boldSelectionButton.classList.contains("is-active")).toBe(true);

    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");
    fireEvent.contextMenu(editor, { clientX: 4, clientY: 4 });
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Align center" }));
    expect(persistedValue).toBe("**Build carefully** <!-- computer-agents:text-align=center -->");
    expect(
      container
        .querySelector(".platform-instructions-editor__prosemirror p")
        ?.getAttribute("style"),
    ).toContain("text-align: center");

    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");
    fireEvent.contextMenu(editor, { clientX: 4, clientY: 4 });
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Align justify" }));
    expect(persistedValue).toBe("**Build carefully** <!-- computer-agents:text-align=justify -->");
    expect(
      container
        .querySelector(".platform-instructions-editor__prosemirror p")
        ?.getAttribute("style"),
    ).toContain("text-align: justify");

    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");
    fireEvent.contextMenu(editor, { clientX: 4, clientY: 4 });
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Bold" }));
    expect(persistedValue).toBe("Build carefully <!-- computer-agents:text-align=justify -->");
  });

  it("renders persisted text alignment without exposing its Markdown marker", () => {
    const { container } = render(
      <PlatformInstructionsEditor
        value="Justified instructions <!-- computer-agents:text-align=justify -->"
        onChange={() => undefined}
        readOnly
      />,
    );

    const paragraph = container.querySelector(
      '.platform-markdown__paragraph[data-platform-text-align="justify"]',
    );
    expect(paragraph?.textContent).toBe("Justified instructions");
    expect(paragraph?.getAttribute("style")).toContain("text-align: justify");
  });

  it("uses minimal centralized popups for block styles and insert actions", async () => {
    const user = userEvent.setup();
    let persistedValue = "Build carefully";

    function Example() {
      const [value, setValue] = useState(persistedValue);
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");
    await user.click(screen.getByRole("button", { name: "Style" }));
    expect(screen.getByRole("button", { name: "Style" }).classList.contains("is-active")).toBe(
      true,
    );
    const styleMenu = screen.getByRole("menu", { name: "Style" });
    expect(
      styleMenu.closest(".platform-popup-surface")?.getAttribute("data-platform-popup-variant"),
    ).toBe("minimal");
    expect(screen.getByRole("menuitem", { name: "Paragraph" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Heading 3" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Paragraph quote" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Block quote" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Preformatted" })).not.toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "Heading 1" }));
    expect(persistedValue.trim()).toBe("# Build carefully");
    expect(screen.getByRole("button", { name: "Style" }).classList.contains("is-active")).toBe(
      false,
    );

    expect(
      screen
        .getByRole("button", { name: "List" })
        .querySelector('[data-hugeicons-icon="ListIcon"]'),
    ).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Insert" }));
    const insertMenu = screen.getByRole("menu", { name: "Insert" });
    expect(
      insertMenu.closest(".platform-popup-surface")?.getAttribute("data-platform-popup-variant"),
    ).toBe("minimal");
    expect(screen.getByRole("menuitem", { name: "Code" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Link" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "File" }).hasAttribute("disabled")).toBe(true);
    expect(
      screen
        .getByRole("menuitem", { name: "Table" })
        .querySelector('[data-hugeicons-icon="TablePropertiesIcon"]'),
    ).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Divider" })).not.toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Prompt" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Code" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Link" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add file" })).toBeNull();
  });

  it("inserts a selected centralized prompt when the host opts in", async () => {
    const user = userEvent.setup();
    let persistedValue = "";
    let selectPrompt:
      | ((prompt: {
          id?: string;
          name?: string;
          markdown?: string | null;
          currentVersion?: { markdown?: string | null } | null;
        }) => void | Promise<void>)
      | null = null;
    const openSearch = vi.fn((onSelect: typeof selectPrompt) => {
      selectPrompt = onSelect;
    });
    const changeSources: Array<string | undefined> = [];

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue, context) => {
            persistedValue = nextValue;
            changeSources.push(context?.source);
            setValue(nextValue);
          }}
          promptInsertion={{ openSearch }}
        />
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("textbox", { name: "Instructions" }));
    await user.click(screen.getByRole("button", { name: "Insert" }));
    await user.click(screen.getByRole("menuitem", { name: "Prompt" }));

    expect(openSearch).toHaveBeenCalledOnce();
    expect(selectPrompt).not.toBeNull();
    await act(async () => {
      await selectPrompt?.({
        id: "prompt-1",
        name: "Incident response",
        markdown: "Stale content",
        currentVersion: {
          markdown: "## Incident response\n\n- Contain the incident",
        },
      });
    });

    await waitFor(() => {
      expect(persistedValue).toContain("## Incident response");
      expect(persistedValue).toContain("- Contain the incident");
    });
    expect(persistedValue).not.toContain("Stale content");
    expect(changeSources.at(-1)).toBe("prompt-insert");
  });

  it("inserts, edits, persists, and renders Markdown tables", async () => {
    const user = userEvent.setup();
    let persistedValue = "";

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    const view = render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.click(screen.getByRole("button", { name: "Insert" }));
    await user.click(screen.getByRole("menuitem", { name: "Table" }));

    const table = await screen.findByRole("table");
    expect(table.querySelectorAll("tr")).toHaveLength(3);
    expect(table.querySelectorAll("th")).toHaveLength(3);
    expect(table.querySelectorAll("td")).toHaveLength(6);
    const tableBody = table.querySelector(":scope > tbody");
    expect(tableBody).not.toBeNull();
    expect(tableBody?.parentElement).toBe(table);
    expect(tableBody?.querySelector(":scope > div")).toBeNull();
    expect(
      table.closest(".platform-instructions-editor__table-layout")?.getAttribute("style"),
    ).toContain("max(100%, 360px)");
    expect(persistedValue).toContain("| ---");

    const tableNode = table.closest(".platform-instructions-editor__table-node");
    const tableOptionsButton = screen.getByRole("button", {
      name: "Table options",
    });
    expect(tableNode).not.toBeNull();
    expect(tableNode?.contains(tableOptionsButton)).toBe(true);
    expect(tableOptionsButton.closest(".platform-instructions-editor__table-layout")).toBe(
      table.parentElement,
    );
    expect(
      fireEvent.contextMenu(tableNode as HTMLElement, {
        clientX: 420,
        clientY: 240,
      }),
    ).toBe(false);
    const contextTableMenu = screen.getByRole("menu", {
      name: "Table options",
    });
    const contextTableSurface = contextTableMenu.closest(".platform-popup-surface") as HTMLElement;
    expect(contextTableSurface.style.left).toBe("420px");
    expect(contextTableSurface.style.top).toBe("240px");
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu", { name: "Table options" })).toBeNull());
    await user.hover(tableNode as HTMLElement);
    await user.click(tableOptionsButton);
    const tableOptions = screen.getByRole("menu", { name: "Table options" });
    expect(
      tableOptions.closest(".platform-popup-surface")?.getAttribute("data-platform-popup-variant"),
    ).toBe("minimal");
    expect(
      tableOptions.querySelectorAll(".platform-instructions-editor__toolbar-popup-divider"),
    ).toHaveLength(2);
    expect(screen.getByRole("menuitem", { name: "Add column left" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Add row above" }).hasAttribute("disabled")).toBe(
      true,
    );
    expect(screen.getByRole("menuitem", { name: "Delete table" })).not.toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "Add row below" }));
    expect(table.querySelectorAll("tr")).toHaveLength(4);

    const savedTable = persistedValue;
    view.unmount();
    render(<PlatformInstructionsEditor value={savedTable} onChange={() => undefined} readOnly />);
    const readOnlyTable = screen.getByRole("table");
    expect(readOnlyTable.querySelectorAll("tr")).toHaveLength(4);
    expect(readOnlyTable.querySelectorAll("th")).toHaveLength(3);
    expect(readOnlyTable.closest(".platform-markdown__table-wrap")).not.toBeNull();
  });

  it("applies contextual table actions to the hovered table", async () => {
    const user = userEvent.setup();
    const value = [
      "| First |",
      "| --- |",
      "| One |",
      "",
      "Between tables",
      "",
      "| Second |",
      "| --- |",
      "| Two |",
    ].join("\n");

    render(<PlatformInstructionsEditor value={value} onChange={() => undefined} />);

    const tables = await screen.findAllByRole("table");
    const tableOptionButtons = await screen.findAllByRole("button", {
      name: "Table options",
    });
    expect(tables).toHaveLength(2);
    expect(tableOptionButtons).toHaveLength(2);

    const secondTableNode = tables[1]?.closest(".platform-instructions-editor__table-node");
    expect(secondTableNode).not.toBeNull();
    await user.hover(secondTableNode as HTMLElement);
    await user.click(tableOptionButtons[1] as HTMLButtonElement);
    await user.click(screen.getByRole("menuitem", { name: "Add row below" }));

    expect(tables[0]?.querySelectorAll("tr")).toHaveLength(2);
    expect(tables[1]?.querySelectorAll("tr")).toHaveLength(3);
  });

  it("opens the centralized slash menu at the caret and runs filtered commands", async () => {
    const user = userEvent.setup();
    let persistedValue = "";

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("/");

    const commandMenu = await screen.findByRole("menu", {
      name: "Formatting commands",
    });
    expect(
      commandMenu.closest(".platform-popup-surface")?.getAttribute("data-platform-popup-variant"),
    ).toBe("minimal");
    expect(screen.getByRole("menuitem", { name: "Paragraph" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Bold" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Align left" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Align center" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Align right" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Align justify" })).not.toBeNull();
    expect(
      screen
        .getByRole("menuitem", { name: "Bulleted list" })
        .querySelector('[data-hugeicons-icon="ListIcon"]'),
    ).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Checklist" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Code" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "File" })).not.toBeNull();
    const tableCommand = screen.getByRole("menuitem", { name: "Table" });
    expect(
      tableCommand.querySelector('[data-hugeicons-icon="TablePropertiesIcon"]'),
    ).not.toBeNull();
    expect(
      tableCommand.querySelector(".platform-instructions-editor__slash-shortcut")?.textContent,
    ).toBe("⇧ ⌥ T");
    expect(screen.getByRole("menuitem", { name: "Divider" })).not.toBeNull();
    expect(
      document.querySelector(".platform-instructions-editor__slash-anchor")?.parentElement,
    ).toBe(document.body);
    expect(
      screen
        .getByRole("menuitem", { name: "Paragraph" })
        .querySelector(".platform-instructions-editor__slash-shortcut")?.textContent,
    ).toBe("⌘ ⌥ 0");
    expect(commandMenu.querySelector('[aria-label="Recommended"]')).not.toBeNull();
    expect(commandMenu.querySelector('[aria-label="Basic blocks"]')).not.toBeNull();
    expect(commandMenu.querySelector('[aria-label="Text formatting"]')).not.toBeNull();
    expect(commandMenu.querySelector('[aria-label="Insert"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Close menu with Escape" })).not.toBeNull();
    expect(
      document.querySelector(".platform-instructions-editor__slash-search-hint")?.textContent,
    ).toBe("Write to search");
    expect(persistedValue.trim()).toBe("/");

    await user.keyboard("head");
    expect(screen.queryByRole("menuitem", { name: "Paragraph" })).toBeNull();
    expect(document.querySelector(".platform-instructions-editor__slash-search-hint")).toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "Heading 2" }));
    await user.keyboard("Plan");

    expect(persistedValue.trim()).toBe("## Plan");
    expect(screen.queryByRole("menu", { name: "Formatting commands" })).toBeNull();
  });

  it("closes the slash command menu and its search hint with Escape", async () => {
    const user = userEvent.setup();

    render(<PlatformInstructionsEditor value="" onChange={() => undefined} />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("/");

    expect(
      await screen.findByRole("menu", { name: "Formatting commands" }),
    ).not.toBeNull();
    expect(
      document.querySelector(
        ".platform-instructions-editor__slash-search-hint",
      ),
    ).not.toBeNull();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("menu", { name: "Formatting commands" }),
    ).toBeNull();
    expect(
      document.querySelector(
        ".platform-instructions-editor__slash-search-hint",
      ),
    ).toBeNull();
  });

  it("opens the full slash command menu for a right-click without selected text", async () => {
    const user = userEvent.setup();
    let persistedValue = "Align this paragraph";

    function Example() {
      const [value, setValue] = useState(persistedValue);
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
          historyKey="unselected-context-menu"
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    fireEvent.contextMenu(editor, { clientX: 8, clientY: 8 });

    const commandMenu = await screen.findByRole("menu", {
      name: "Formatting commands",
    });
    expect(screen.queryByRole("menu", { name: "Text formatting" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Paragraph" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Align left" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Align center" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Align right" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Align justify" })).not.toBeNull();
    expect(
      screen
        .getByRole("menuitem", { name: "Align center" })
        .querySelector(".platform-instructions-editor__slash-shortcut")?.textContent,
    ).toBe("⌘ ⇧ E");
    expect(commandMenu).not.toBeNull();

    await user.click(screen.getByRole("menuitem", { name: "Align center" }));
    expect(persistedValue).toBe("Align this paragraph <!-- computer-agents:text-align=center -->");
  });

  it("navigates slash commands with the arrow keys and runs the active command with Enter", async () => {
    const user = userEvent.setup();
    let persistedValue = "";

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("/");

    const tableOption = await screen.findByRole("menuitem", { name: "Table" });
    const paragraphOption = screen.getByRole("menuitem", { name: "Paragraph" });
    const headingOneOption = screen.getByRole("menuitem", {
      name: "Heading 1",
    });

    expect(tableOption.classList.contains("is-selected")).toBe(true);

    await user.keyboard("{ArrowDown}");
    expect(paragraphOption.classList.contains("is-selected")).toBe(true);

    await user.keyboard("{ArrowDown}");
    expect(headingOneOption.classList.contains("is-selected")).toBe(true);

    await user.keyboard("{Enter}Keyboard heading");

    expect(persistedValue.trim()).toBe("# Keyboard heading");
    expect(screen.queryByRole("menu", { name: "Formatting commands" })).toBeNull();
  });

  it("creates checklists from the toolbar and slash command", async () => {
    const user = userEvent.setup();

    function Example() {
      const [value, setValue] = useState("");
      return <PlatformInstructionsEditor value={value} onChange={setValue} />;
    }

    const { container } = render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });

    await user.click(editor);
    await user.click(screen.getByRole("button", { name: "Checklist" }));
    await user.keyboard("Toolbar task");

    expect(container.querySelector('ul[data-type="taskList"]')).not.toBeNull();
    expect(
      container.querySelector('ul[data-type="taskList"] input[type="checkbox"]'),
    ).not.toBeNull();

    await user.keyboard("{Enter}{Enter}/check");
    await user.click(screen.getByRole("menuitem", { name: "Checklist" }));
    await user.keyboard("Slash task");

    expect(container.querySelectorAll('ul[data-type="taskList"]')).toHaveLength(1);
    expect(
      container.querySelectorAll('ul[data-type="taskList"] input[type="checkbox"]'),
    ).toHaveLength(2);
  });

  it("keeps native Backspace and Delete editing available around the slash menu", async () => {
    const user = userEvent.setup();
    let persistedValue = "";

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("Edit me{Backspace}");
    expect(persistedValue).toBe("Edit m");

    await user.keyboard(" /");
    await screen.findByRole("menu", { name: "Formatting commands" });
    await user.keyboard("{Backspace}");
    expect(persistedValue).not.toContain("/");
    expect(screen.queryByRole("menu", { name: "Formatting commands" })).toBeNull();

    const deleteEvent = new KeyboardEvent("keydown", {
      key: "Delete",
      bubbles: true,
      cancelable: true,
    });
    editor.dispatchEvent(deleteEvent);
    expect(deleteEvent.defaultPrevented).toBe(false);
  });

  it("applies normalized links to selected text", async () => {
    const user = userEvent.setup();
    const prompt = vi.spyOn(window, "prompt");
    let persistedValue = "Computer Agents";

    function Example() {
      const [value, setValue] = useState(persistedValue);
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");
    prompt.mockReturnValueOnce("computer-agents.com");
    await user.click(screen.getByRole("button", { name: "Insert" }));
    await user.click(screen.getByRole("menuitem", { name: "Link" }));
    expect(persistedValue).toBe("[Computer Agents](https://computer-agents.com)");
    expect(screen.getByRole("button", { name: "Insert" }).classList.contains("is-active")).toBe(
      false,
    );
  });

  it("inserts a visible linked URL when no text is selected", async () => {
    const user = userEvent.setup();
    const prompt = vi
      .spyOn(window, "prompt")
      .mockReturnValueOnce("https://docs.computer-agents.com");
    let persistedValue = "";

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("textbox", { name: "Instructions" }));
    await user.click(screen.getByRole("button", { name: "Insert" }));
    await user.click(screen.getByRole("menuitem", { name: "Link" }));
    expect(persistedValue).toBe(
      "[https://docs.computer-agents.com](https://docs.computer-agents.com)",
    );
  });

  it("inserts a styled divider from the shared insert menu", async () => {
    const user = userEvent.setup();
    let persistedValue = "";

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
        />
      );
    }

    const { container } = render(<Example />);
    await user.click(screen.getByRole("textbox", { name: "Instructions" }));
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(
      screen.getByRole("menuitem", { name: "Divider" }).querySelector(".hugeicons-minus"),
    ).not.toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "Divider" }));

    expect(container.querySelector(".platform-instructions-editor__prosemirror hr")).not.toBeNull();
    expect(persistedValue).toContain("---");
  });

  it("round-trips paragraph quotes through controlled Markdown", async () => {
    const user = userEvent.setup();
    let persistedValue = "A quoted paragraph";

    function Example({ readOnly = false }: { readOnly?: boolean }) {
      const [value, setValue] = useState(persistedValue);
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
          readOnly={readOnly}
        />
      );
    }

    const { container, rerender } = render(<Example />);
    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await user.click(editor);
    await user.keyboard("{Control>}a{/Control}");
    await user.click(screen.getByRole("button", { name: "Style" }));
    await user.click(screen.getByRole("menuitem", { name: "Paragraph quote" }));

    expect(persistedValue).toContain(":::paragraph-quote");
    expect(container.querySelector('[data-platform-paragraph-quote="true"]')?.textContent).toBe(
      "A quoted paragraph",
    );

    rerender(<Example readOnly />);
    expect(container.querySelector(".platform-markdown__paragraph-quote")?.textContent).toBe(
      "A quoted paragraph",
    );
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
      <PlatformInstructionsEditor value="" onChange={() => undefined} variant="minimalistic-ui" />,
    );

    const minimalEditor = container.querySelector("[data-platform-instructions-editor]");
    expect(minimalEditor?.classList.contains("is-minimalistic-ui")).toBe(true);
    expect(minimalEditor?.getAttribute("data-platform-instructions-editor-variant")).toBe(
      "minimalistic-ui",
    );

    rerender(<PlatformInstructionsEditor value="" onChange={() => undefined} />);
    const defaultEditor = container.querySelector("[data-platform-instructions-editor]");
    expect(defaultEditor?.classList.contains("is-minimalistic-ui")).toBe(false);
    expect(defaultEditor?.getAttribute("data-platform-instructions-editor-variant")).toBe(
      "default",
    );

    rerender(
      <PlatformInstructionsEditor value="" onChange={() => undefined} variant="block-editor" />,
    );
    const blockEditor = container.querySelector("[data-platform-instructions-editor]");
    expect(blockEditor?.classList.contains("is-minimalistic-ui")).toBe(true);
    expect(blockEditor?.classList.contains("is-block-editor")).toBe(true);
    expect(blockEditor?.getAttribute("data-platform-instructions-editor-variant")).toBe(
      "block-editor",
    );
  });

  it("collapses only overflowing content and expands before editing", async () => {
    const user = userEvent.setup();
    const scrollHeight = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function getScrollHeight() {
        return this.classList.contains("platform-instructions-editor__prosemirror") ? 240 : 0;
      });

    const { container } = render(
      <PlatformInstructionsEditor
        value={Array.from({ length: 12 }, (_, index) => `Description line ${index + 1}`).join(
          "\n\n",
        )}
        onChange={() => undefined}
        collapsedLines={10}
      />,
    );

    const editorShell = container.querySelector<HTMLElement>("[data-platform-instructions-editor]");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Show more" })).not.toBeNull();
    });
    expect(editorShell?.getAttribute("data-platform-instructions-editor-collapsed-lines")).toBe(
      "10",
    );
    expect(editorShell?.classList.contains("is-content-collapsed")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(editorShell?.classList.contains("is-content-expanded")).toBe(true);
    expect(screen.getByRole("button", { name: "Show less" })).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Show less" }));
    expect(editorShell?.classList.contains("is-content-collapsed")).toBe(true);

    await user.click(screen.getByRole("textbox", { name: "Instructions" }));
    await waitFor(() => {
      expect(editorShell?.classList.contains("is-content-collapsed")).toBe(false);
    });
    expect(editorShell?.classList.contains("is-content-expanded")).toBe(true);
    scrollHeight.mockRestore();
  });

  it("does not show a disclosure control when content fits", () => {
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(80);

    render(
      <PlatformInstructionsEditor
        value="Short description"
        onChange={() => undefined}
        collapsedLines={10}
      />,
    );

    expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
  });

  it("exposes its editing surface for composed keyboard focus flows", () => {
    const editorRef = createRef<HTMLElement>();
    render(
      <PlatformInstructionsEditor value="" onChange={() => undefined} editorRef={editorRef} />,
    );

    editorRef.current?.focus();
    expect(document.activeElement).toBe(editorRef.current);
  });

  it("focuses the editing surface when auto focus is requested", async () => {
    render(
      <PlatformInstructionsEditor value="Existing content" onChange={() => undefined} autoFocus />,
    );

    const editor = screen.getByRole("textbox", { name: "Instructions" });
    await waitFor(() => {
      expect(document.activeElement).toBe(editor);
    });
  });

  it("uploads and inserts multiple images as rendered Markdown", async () => {
    const user = userEvent.setup();
    const upload = vi.fn(async (files: File[]) =>
      files.map((file, index) => ({
        src: `/api/attachments/image-${index + 1}`,
        alt: file.name,
        attachmentId: `attachment-${index + 1}`,
      })),
    );
    let persistedValue = "Start here";
    const changeContexts: Array<string | undefined> = [];

    function Example() {
      const [value, setValue] = useState(persistedValue);
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue, context) => {
            persistedValue = nextValue;
            changeContexts.push(context?.source);
            setValue(nextValue);
          }}
          contentVariant="image-enabled"
          imageUpload={{ upload }}
        />
      );
    }

    const { container } = render(<Example />);
    const input = container.querySelector(
      ".platform-instructions-editor__file-input",
    ) as HTMLInputElement;
    await user.click(screen.getByRole("button", { name: "Insert" }));
    const fileOption = screen.getByRole("menuitem", { name: "File" });
    expect(fileOption.hasAttribute("disabled")).toBe(false);
    await user.click(fileOption);
    await user.upload(input, [
      new File(["one"], "one.png", { type: "image/png" }),
      new File(["two"], "two.webp", { type: "image/webp" }),
    ]);

    await waitFor(() => expect(container.querySelectorAll("img")).toHaveLength(2));
    expect(upload).toHaveBeenCalledTimes(1);
    expect(persistedValue).toContain(
      '![one.png](/api/attachments/image-1 "computer-agents:image:size=medium&attachmentId=attachment-1&fileSize=3&mimeType=image%2Fpng")',
    );
    expect(persistedValue).toContain(
      '![two.webp](/api/attachments/image-2 "computer-agents:image:size=medium&attachmentId=attachment-2&fileSize=3&mimeType=image%2Fwebp")',
    );
    expect(changeContexts.at(-1)).toBe("image-upload");
  });

  it("canonicalizes parenthesized image URLs and owns persisted image actions", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    const onRemove = vi.fn();
    const editingChanges: boolean[] = [];
    const upload = vi.fn(async (files: File[]) => [
      {
        src: "/api/attachments/diagram (final).svg",
        name: files[0]?.name,
        size: files[0]?.size,
        mimeType: files[0]?.type,
        attachmentId: "diagram-final",
      },
    ]);
    let persistedValue = "";

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue) => {
            persistedValue = nextValue;
            setValue(nextValue);
          }}
          contentVariant="file-enabled"
          fileUpload={{ upload, onRename, onRemove }}
          onEditingChange={(editing) => editingChanges.push(editing)}
        />
      );
    }

    const { container } = render(<Example />);
    const input = container.querySelector(
      ".platform-instructions-editor__file-input",
    ) as HTMLInputElement;
    const sourceFile = new File(["svg"], "diagram (final).svg", {
      type: "image/svg+xml",
    });
    await user.upload(input, sourceFile);

    const image = await waitFor(() => {
      const nextImage = container.querySelector(
        ".platform-instructions-editor__image",
      ) as HTMLImageElement | null;
      expect(nextImage).not.toBeNull();
      return nextImage as HTMLImageElement;
    });
    expect(image.src).toContain("diagram%20%28final%29.svg");
    expect(image.classList.contains("is-size-medium")).toBe(true);
    expect(screen.getByRole("textbox", { name: "Instructions" }).textContent).not.toContain(
      ".svg)",
    );
    expect(persistedValue).toContain("diagram%20%28final%29.svg");
    expect(persistedValue).toContain("size=medium");
    expect(persistedValue).toContain("attachmentId=diagram-final");

    const initialImageNode = container.querySelector(
      ".platform-instructions-editor__image-node",
    ) as HTMLElement;
    const imageHost = image.closest(
      ".platform-instructions-editor__image-node-host",
    ) as HTMLElement;
    expect(imageHost).not.toBeNull();
    expect(imageHost.dataset.platformImageSize).toBe("medium");
    fireEvent.mouseDown(image, { button: 0 });
    await waitFor(() => expect(initialImageNode.classList.contains("is-selected")).toBe(true));
    expect(
      fireEvent.contextMenu(initialImageNode, {
        clientX: 360,
        clientY: 210,
      }),
    ).toBe(false);
    const contextImageMenu = screen.getByRole("menu", {
      name: "diagram (final).svg actions",
    });
    const contextImageSurface = contextImageMenu.closest(".platform-popup-surface") as HTMLElement;
    expect(contextImageSurface.style.left).toBe("360px");
    expect(contextImageSurface.style.top).toBe("210px");
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() =>
      expect(
        screen.queryByRole("menu", {
          name: "diagram (final).svg actions",
        }),
      ).toBeNull(),
    );

    await user.click(screen.getByRole("textbox", { name: "Instructions" }));
    editingChanges.length = 0;
    await user.click(
      screen.getByRole("button", {
        name: "Image actions for diagram (final).svg",
      }),
    );
    expect(screen.getByText("diagram (final).svg")).not.toBeNull();
    expect(screen.getByText("3 B")).not.toBeNull();
    await user.click(screen.getByRole("menuitemradio", { name: "Small" }));
    expect(image.classList.contains("is-size-small")).toBe(true);
    expect(persistedValue).toContain("size=small");
    expect(editingChanges).not.toContain(false);

    await user.click(
      screen.getByRole("button", {
        name: "Image actions for diagram (final).svg",
      }),
    );
    await user.click(screen.getByRole("menuitemradio", { name: "Middle" }));
    const imageNode = container.querySelector(".platform-instructions-editor__image-node");
    expect(imageNode?.classList.contains("is-align-center")).toBe(true);
    expect(imageHost.dataset.platformImageAlignment).toBe("center");
    expect(persistedValue).toContain("align=center");
    expect(editingChanges).not.toContain(false);

    await user.click(
      screen.getByRole("button", {
        name: "Image actions for diagram (final).svg",
      }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    const renameInput = screen.getByLabelText("Image name");
    await user.clear(renameInput);
    await user.type(renameInput, "diagram-final.svg");
    await user.click(screen.getByRole("button", { name: "Rename" }));
    await waitFor(() =>
      expect(onRename).toHaveBeenCalledWith(
      expect.objectContaining({ attachmentId: "diagram-final" }),
      "diagram-final.svg",
      ),
    );
    expect(persistedValue).toContain("![diagram-final.svg]");

    await user.click(
      screen.getByRole("button", {
        name: "Image actions for diagram-final.svg",
      }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    await waitFor(() =>
      expect(onRemove).toHaveBeenCalledWith(
      expect.objectContaining({ attachmentId: "diagram-final" }),
      ),
    );
    await waitFor(() =>
      expect(container.querySelector(".platform-instructions-editor__image")).toBeNull(),
    );
    expect(persistedValue).not.toContain("diagram-final.svg");
  });

  it("repairs balanced legacy image destinations without leaving visible suffix text", () => {
    const legacyValue = "![diagram.svg](/api/files/diagram (final).svg)";
    const normalizedValue = normalizePlatformInstructionsEditorMarkdownImages(legacyValue);
    const images = parsePlatformInstructionsEditorImageMarkdown(normalizedValue);

    expect(images).toHaveLength(1);
    expect(images[0]?.src).toBe("/api/files/diagram%20%28final%29.svg");
    expect(images[0]?.alignment).toBe("left");
    expect(normalizedValue).toContain("size=medium");
    expect(normalizedValue).not.toContain("(final).svg)");
  });

  it("loads persisted protected images through the authenticated preview resolver", async () => {
    const NativeURL = URL;
    const createObjectURL = vi.fn(() => "blob:authenticated-image-preview");
    const revokeObjectURL = vi.fn();
    class PreviewURL extends NativeURL {}
    Object.defineProperties(PreviewURL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL },
    });
    vi.stubGlobal("URL", PreviewURL);
    const svgSource = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"/>';
    const resolvePreviewSource = vi.fn(async (_file: unknown, signal: AbortSignal) => {
        expect(signal.aborted).toBe(false);
        return new Blob([svgSource], { type: "application/octet-stream" });
    });
    const value =
      '![download.svg](/api/real/attachments/att-image "computer-agents:image:size=medium&attachmentId=att-image&mimeType=image%2Fsvg%2Bxml")';

    const view = render(
      <PlatformInstructionsEditor
        value={value}
        onChange={() => undefined}
        contentVariant="file-enabled"
        fileUpload={{
          upload: async () => [],
          resolvePreviewSource,
        }}
      />,
    );

    const image = await waitFor(() => {
      const candidate = view.container.querySelector(
        ".platform-instructions-editor__image",
      ) as HTMLImageElement | null;
      expect(candidate?.src).toMatch(/^data:image\/svg\+xml;base64,/);
      return candidate as HTMLImageElement;
    });
    expect(resolvePreviewSource).toHaveBeenCalledWith(
      expect.objectContaining({
        src: "/api/real/attachments/att-image",
        attachmentId: "att-image",
      }),
      expect.any(AbortSignal),
    );
    expect(image.dataset.platformPreviewStatus).toBe("ready");
    expect(image.dataset.platformImageFormat).toBe("svg");
    expect(image.style.width).toBe("500px");
    expect(image.style.aspectRatio).toBe("640 / 320");
    expect(createObjectURL).not.toHaveBeenCalled();

    await userEvent.setup().click(
      screen.getByRole("button", {
        name: "Image actions for download.svg",
      }),
    );
    expect(screen.getByText(`${new Blob([svgSource]).size} B`)).not.toBeNull();
    expect(resolvePreviewSource).toHaveBeenCalledTimes(1);
    expect(image.src).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(
      document
        .querySelector(".platform-instructions-editor__image-popup")
        ?.getAttribute("data-platform-popup-placement"),
    ).toMatch(/-start$/);

    view.unmount();
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it("uploads, renders, and removes non-image files inline", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    const onRemove = vi.fn();
    const upload = vi.fn(async (files: File[]) =>
      files.map((file) => ({
        src: "/api/attachments/report-1",
        name: file.name,
        size: file.size,
        mimeType: file.type,
        attachmentId: "report-1",
        metadata: { taskAttachment: { id: "report-1" } },
      })),
    );
    let persistedValue = "Review the evidence";
    const changeContexts: Array<string | undefined> = [];
    const uploadedFileContexts: Array<unknown> = [];

    function Example() {
      const [value, setValue] = useState(persistedValue);
      return (
        <PlatformInstructionsEditor
          value={value}
          onChange={(nextValue, context) => {
            persistedValue = nextValue;
            changeContexts.push(context?.source);
            uploadedFileContexts.push(context?.uploadedFiles);
            setValue(nextValue);
          }}
          contentVariant="file-enabled"
          fileUpload={{ upload, onActivate, onRemove }}
        />
      );
    }

    const { container } = render(<Example />);
    const input = container.querySelector(
      ".platform-instructions-editor__file-input",
    ) as HTMLInputElement;
    const file = new File(["paper"], "report.pdf", {
      type: "application/pdf",
    });

    await user.click(screen.getByRole("button", { name: "Insert" }));
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await user.upload(input, file);

    await screen.findByText("report.pdf");
    expect(upload).toHaveBeenCalledWith([file]);
    expect(persistedValue).toContain(":::attachment");
    expect(persistedValue).toContain('attachmentId="report-1"');
    expect(persistedValue).toContain('mimeType="application/pdf"');
    expect(changeContexts.at(-1)).toBe("file-upload");
    expect(uploadedFileContexts.at(-1)).toEqual([
      expect.objectContaining({
        attachmentId: "report-1",
        metadata: { taskAttachment: { id: "report-1" } },
      }),
    ]);
    expect(container.querySelector("img.platform-file-explorer__file-icon")).not.toBeNull();

    const fileItem = screen
      .getByText("report.pdf")
      .closest(".platform-attachments__item") as HTMLElement;
    expect(
      fireEvent.contextMenu(fileItem, {
        clientX: 280,
        clientY: 190,
      }),
    ).toBe(false);
    const contextFileMenu = screen.getByRole("menu", {
      name: "report.pdf actions",
    });
    const contextFileSurface = contextFileMenu.closest(".platform-popup-surface") as HTMLElement;
    expect(contextFileSurface.style.left).toBe("280px");
    expect(contextFileSurface.style.top).toBe("190px");
    expect(
      fileItem
        .closest(".platform-instructions-editor__attachment-node")
        ?.classList.contains("is-selected"),
    ).toBe(true);
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("menu", { name: "report.pdf actions" })).toBeNull(),
    );

    await user.click(screen.getByRole("button", { name: "report.pdf" }));
    expect(onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ attachmentId: "report-1", name: "report.pdf" }),
    );
    await user.click(screen.getByRole("button", { name: "Remove report.pdf" }));
    await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText("report.pdf")).toBeNull());
    expect(persistedValue).not.toContain(":::attachment");
  });

  it("accepts non-image files dropped onto the editor", async () => {
    const upload = vi.fn(async () => [
      {
        src: "/api/attachments/dropped",
        name: "dropped.pdf",
        size: 5,
        mimeType: "application/pdf",
        attachmentId: "dropped-pdf",
      },
    ]);
    const { container } = render(
      <PlatformInstructionsEditor
        value=""
        onChange={() => undefined}
        contentVariant="file-enabled"
        fileUpload={{ upload }}
      />,
    );
    const shell = container.querySelector("[data-platform-instructions-editor]") as HTMLElement;
    const file = new File(["paper"], "dropped.pdf", {
      type: "application/pdf",
    });
    const dataTransfer = {
      files: [file],
      items: [{ kind: "file", type: "application/pdf" }],
      dropEffect: "none",
    };

    fireEvent.dragEnter(shell, { dataTransfer });
    expect(shell.classList.contains("is-file-dragging")).toBe(true);
    fireEvent.drop(shell, { dataTransfer, clientX: 0, clientY: 0 });
    await waitFor(() => expect(upload).toHaveBeenCalledWith([file]));
    await screen.findByText("dropped.pdf");
  });

  it("renders persisted non-image files in read-only descriptions", () => {
    render(
      <PlatformInstructionsEditor
        value={
          ':::attachment {src="/api/attachments/report" name="report.docx" size="55170" mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" attachmentId="report-1"} :::'
        }
        onChange={() => undefined}
        readOnly
      />,
    );

    expect(screen.getByText("report.docx")).not.toBeNull();
    expect(screen.getByText("53.88 KB")).not.toBeNull();
    expect(screen.queryByRole("toolbar", { name: "Markdown formatting" })).toBeNull();
  });

  it("keeps the minimalistic UI surfaces flat and transparent", () => {
    const css = readFileSync(
      path.join(
        process.cwd(),
        "src/platform-ui/components/composite/instructions-editor/instructions-editor.css",
      ),
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
      /\.platform-instructions-editor\.is-minimalistic-ui \.platform-instructions-editor__prosemirror\s*\{[\s\S]*padding:\s*12px 0 24px;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor__prosemirror pre\s*\{[\s\S]*padding:\s*0;[\s\S]*background:\s*transparent;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor__slash-scroll-region\s*\{[\s\S]*overflow-y:\s*auto;[\s\S]*scrollbar-width:\s*none;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor__slash-scroll-region::?-webkit-scrollbar\s*\{\s*display:\s*none;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor\.is-content-collapsed[\s\S]*\.platform-instructions-editor__content-viewport\s*\{[\s\S]*max-height:\s*calc\([\s\S]*--platform-instructions-editor-collapsed-lines[\s\S]*overflow:\s*hidden;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor__selection-format-button\.is-active\s*\{[\s\S]*color:\s*#4da3ff;[\s\S]*background:\s*rgba\(77,\s*163,\s*255,\s*0\.1\);/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor__selection-popup\.platform-popup-surface\s*\{[\s\S]*--platform-popup-padding:\s*0;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor__selection-type-popup\.platform-popup-surface\s*\{[\s\S]*--platform-popup-padding:\s*0;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor__selection-type-submenu[\s\S]*\.platform-popup-submenu__trigger\s*\{[\s\S]*padding:\s*8px 10px;/,
    );
    expect(css).toMatch(
      /\.platform-instructions-editor__selection-popup-divider\s*\{[\s\S]*margin:\s*0;/,
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

    vi.spyOn(scrollContainer, "getBoundingClientRect").mockImplementation(
      () => ({ top: 0 }) as DOMRect,
    );
    vi.spyOn(editor, "getBoundingClientRect").mockImplementation(
      () => ({ top: editorTop }) as DOMRect,
    );
    vi.spyOn(header, "getBoundingClientRect").mockImplementation(() => ({ top: 0 }) as DOMRect);

    fireEvent.scroll(scrollContainer);
    expect(header.classList.contains("is-stuck")).toBe(true);
    expect(header.getAttribute("data-platform-instructions-editor-header-stuck")).toBe("true");

    editorTop = 0;
    fireEvent.scroll(scrollContainer);
    expect(header.classList.contains("is-stuck")).toBe(false);

    const css = readFileSync(
      path.join(
        process.cwd(),
        "src/platform-ui/components/composite/instructions-editor/instructions-editor.css",
      ),
      "utf8",
    );
    expect(css).toMatch(
      /\.platform-instructions-editor\.is-sticky \.platform-instructions-editor__header\.is-stuck\s*\{[\s\S]*border-top-left-radius:\s*0;[\s\S]*border-top-right-radius:\s*0;/,
    );
  });
});
