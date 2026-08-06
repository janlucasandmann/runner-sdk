import {
  useEffect,
  useState,
  type ComponentType,
} from "react";
import type {
  BeforeMount,
  EditorProps,
  OnMount,
} from "@monaco-editor/react";
import { PlatformLoadingState } from "../loading-state/index.js";

export interface PlatformMonacoCodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  path?: string;
  ariaLabel?: string;
  readOnly?: boolean;
  theme?: string;
  className?: string;
  options?: EditorProps["options"];
  beforeMount?: BeforeMount;
  onMount?: OnMount;
}

type MonacoEditorComponent = ComponentType<EditorProps>;

const EDITOR_FONT_FAMILY = [
  "ui-monospace",
  "SFMono-Regular",
  "Menlo",
  "Monaco",
  "Consolas",
  '"Liberation Mono"',
  '"Courier New"',
  "monospace",
].join(", ");

let monacoEditorModulePromise: Promise<MonacoEditorComponent> | null = null;

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
): string {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function loadMonacoEditorModule(): Promise<MonacoEditorComponent> {
  if (!monacoEditorModulePromise) {
    monacoEditorModulePromise = import("@monaco-editor/react")
      .then((module) => {
        const directDefault = module.default as unknown;
        const nestedDefault = directDefault
          && typeof directDefault === "object"
          && "default" in directDefault
          ? (directDefault as { default?: MonacoEditorComponent }).default
          : undefined;
        return nestedDefault || directDefault as MonacoEditorComponent;
      })
      .catch((error) => {
        monacoEditorModulePromise = null;
        throw error;
      });
  }
  return monacoEditorModulePromise;
}

export function PlatformMonacoCodeEditor({
  value,
  onChange,
  language = "plaintext",
  path,
  ariaLabel = "Code editor",
  readOnly = false,
  theme = "vs-dark",
  className = "",
  options,
  beforeMount,
  onMount,
}: PlatformMonacoCodeEditorProps) {
  const [EditorComponent, setEditorComponent] = useState<MonacoEditorComponent | null>(null);
  const [editorError, setEditorError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void loadMonacoEditorModule()
      .then((component) => {
        if (cancelled) return;
        setEditorComponent(() => component);
        setEditorError("");
      })
      .catch((error) => {
        if (cancelled) return;
        setEditorError(error instanceof Error ? error.message : "Failed to load code editor.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={joinClassNames("platform-monaco-code-editor", className)}
      data-platform-monaco-code-editor="true"
      data-language={language}
    >
      {EditorComponent ? (
        <EditorComponent
          path={path}
          height="100%"
          language={language}
          theme={theme}
          value={value}
          saveViewState
          beforeMount={beforeMount}
          onMount={onMount}
          onChange={(nextValue) => onChange?.(nextValue ?? "")}
          loading={(
            <PlatformLoadingState
              className="platform-monaco-code-editor__loading"
              message="Loading code editor…"
              centered
            />
          )}
          options={{
            ariaLabel,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            readOnly,
            domReadOnly: readOnly,
            fontSize: 12,
            lineHeight: 19,
            lineNumbersMinChars: 3,
            renderLineHighlight: "line",
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            folding: true,
            glyphMargin: false,
            wordWrap: "off",
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: false,
            formatOnPaste: true,
            formatOnType: true,
            padding: { top: 14, bottom: 14 },
            fontFamily: EDITOR_FONT_FAMILY,
            ...options,
          }}
        />
      ) : editorError ? (
        <textarea
          className="platform-monaco-code-editor__fallback"
          aria-label={ariaLabel}
          spellCheck={false}
          readOnly={readOnly}
          value={value}
          onChange={(event) => onChange?.(event.currentTarget.value)}
        />
      ) : (
        <PlatformLoadingState
          className="platform-monaco-code-editor__loading"
          message="Loading code editor…"
          centered
        />
      )}
    </div>
  );
}
