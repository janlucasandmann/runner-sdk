import { useEffect, useState } from "react";

import {
  detectCodeLanguage,
  normalizeRunnerFilePath,
} from "./command-parsing.js";

const RUNNER_LOG_DEFAULT_THEME = "runner-log-transparent";

let runnerLogThemeRegistered = false;
let runnerLogMonacoLoader: Promise<any> | null = null;

function loadRunnerLogMonacoModule() {
  if (!runnerLogMonacoLoader) {
    runnerLogMonacoLoader = import("@monaco-editor/react").catch(() => null);
  }
  return runnerLogMonacoLoader;
}

function ensureRunnerLogMonacoTheme(monaco: any) {
  if (runnerLogThemeRegistered) return;
  monaco.editor.defineTheme(RUNNER_LOG_DEFAULT_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#00000000",
      "editorGutter.background": "#00000000",
      "editorLineNumber.foreground": "#ffffff52",
      "editorLineNumber.activeForeground": "#ffffff72",
      "editorLineHighlightBackground": "#00000000",
      "editor.selectionBackground": "#ffffff12",
      "editor.inactiveSelectionBackground": "#ffffff08",
      "scrollbar.shadow": "#00000000",
      "diffEditor.insertedTextBackground": "#2ea04333",
      "diffEditor.removedTextBackground": "#f8514933",
      "diffEditor.insertedLineBackground": "#2ea04324",
      "diffEditor.removedLineBackground": "#f8514924",
      "diffEditor.diagonalFill": "#00000000",
    },
  });
  runnerLogThemeRegistered = true;
}

export interface RunnerCodeViewerProps {
  content: string;
  filePath?: string;
  language?: string;
  maxHeight?: number;
  showLineNumbers?: boolean;
  className?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  fillHeight?: boolean;
}

export function RunnerCodeViewer({
  content,
  filePath,
  language,
  maxHeight,
  showLineNumbers = false,
  className,
  readOnly = true,
  onChange,
  fillHeight = false,
}: RunnerCodeViewerProps) {
  const [EditorComponent, setEditorComponent] = useState<any>(null);
  const resolvedLanguage = language || detectCodeLanguage(content, filePath);
  const lineCount = Math.max(1, content.split("\n").length);
  const naturalHeight = Math.max(lineCount * 18 + 8, 26);
  const height: number | string = fillHeight
    ? "100%"
    : typeof maxHeight === "number"
      ? Math.min(naturalHeight, maxHeight)
      : naturalHeight;
  const isScrollable = fillHeight
    || (typeof maxHeight === "number" && naturalHeight > maxHeight);
  const normalizedFilePath = normalizeRunnerFilePath(filePath);
  const editorKey = readOnly
    ? `${resolvedLanguage}:${normalizedFilePath || "inline"}:${content.length}:${height}:${showLineNumbers ? "ln" : "nln"}`
    : `${resolvedLanguage}:${normalizedFilePath || "inline"}:${showLineNumbers ? "ln" : "nln"}:editable`;

  useEffect(() => {
    let isCancelled = false;
    void loadRunnerLogMonacoModule().then((module) => {
      const editorComponent = module?.Editor || module?.default || null;
      if (!isCancelled) {
        setEditorComponent(() => editorComponent);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className={`tb-log-card-code ${className || ""}`.trim()}>
      {EditorComponent ? (
        <EditorComponent
          key={editorKey}
          beforeMount={ensureRunnerLogMonacoTheme}
          height={height}
          language={resolvedLanguage}
          path={normalizedFilePath}
          theme={RUNNER_LOG_DEFAULT_THEME}
          value={content}
          onChange={(value: string | undefined) => {
            if (!readOnly) {
              onChange?.(value || "");
            }
          }}
          options={{
            readOnly,
            domReadOnly: readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineHeight: 18,
            lineNumbers: showLineNumbers ? "on" : "off",
            folding: false,
            wordWrap: "off",
            automaticLayout: true,
            scrollbar: {
              vertical: isScrollable ? "auto" : "hidden",
              horizontal: "auto",
              verticalScrollbarSize: isScrollable ? 8 : 0,
              horizontalScrollbarSize: 8,
              alwaysConsumeMouseWheel: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            renderLineHighlight: "none",
            contextmenu: !readOnly,
            selectionHighlight: !readOnly,
            occurrencesHighlight: "off",
            glyphMargin: false,
            lineDecorationsWidth: showLineNumbers ? 8 : 0,
            lineNumbersMinChars: showLineNumbers ? 4 : 0,
            guides: {
              indentation: false,
              highlightActiveIndentation: false,
            },
            padding: { top: 0, bottom: 0 },
          }}
        />
      ) : readOnly ? (
        <pre className="tb-log-card-code-fallback">
          <code>{content}</code>
        </pre>
      ) : (
        <textarea
          className="tb-log-card-code-fallback tb-log-card-code-editor-fallback"
          value={content}
          onChange={(event) => onChange?.(event.target.value)}
          spellCheck={false}
        />
      )}
    </div>
  );
}
