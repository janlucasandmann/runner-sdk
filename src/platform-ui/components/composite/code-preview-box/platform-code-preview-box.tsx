import { Copy } from "lucide-react";
import {
  useEffect,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { BeforeMount, EditorProps } from "@monaco-editor/react";
import { PlatformPrimaryButton } from "../../ui/button/index.js";
import { PlatformSwitch } from "../../ui/switch/index.js";

export type PlatformCodePreviewMode = "static" | "editor";

export interface PlatformCodePreviewLanguage {
  value: string;
  label: ReactNode;
  editorLanguage?: string;
}

export interface PlatformCodePreviewAction {
  label: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface PlatformCodePreviewBoxProps {
  title: ReactNode;
  description?: ReactNode;
  action?: PlatformCodePreviewAction;
  languages: readonly PlatformCodePreviewLanguage[];
  language: string;
  onLanguageChange: (language: string) => void;
  code: string;
  mode?: PlatformCodePreviewMode;
  codePath?: string;
  codeHeight?: CSSProperties["height"];
  copyLabel?: string;
  onCopy?: (code: string) => void | Promise<void>;
  ariaLabel?: string;
  className?: string;
  editorTheme?: string;
  editorBeforeMount?: BeforeMount;
  editorOptions?: EditorProps["options"];
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

const STATIC_CODE_TOKEN_PATTERN = /(\/\/.*$|#.*$|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\b(?:async|await|catch|class|const|def|else|export|for|from|function|if|import|in|lambda|let|new|print|return|throw|try|var|while)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*(?=\s*\()|\b[A-Za-z_$][\w$]*(?=\s*[.:]))/g;
const STATIC_CODE_KEYWORDS = new Set([
  "async",
  "await",
  "catch",
  "class",
  "const",
  "def",
  "else",
  "export",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "lambda",
  "let",
  "new",
  "print",
  "return",
  "throw",
  "try",
  "var",
  "while",
]);
const LOADER_PATTERN: readonly number[] = [2, 1, 0, 3, 6, 7, 8, 5, 4, -1, -1, -1, -1];

let monacoEditorModulePromise: Promise<MonacoEditorComponent> | null = null;

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

function loadMonacoEditorModule() {
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

function getStaticTokenClass(token: string) {
  if (token.startsWith("//") || token.startsWith("#")) return "is-comment";
  if (token.startsWith("'") || token.startsWith('"')) return "is-string";
  if (STATIC_CODE_KEYWORDS.has(token)) return "is-keyword";
  if (/^\d/.test(token)) return "is-number";
  if (token.endsWith(".") || token.endsWith(":")) return "is-property";
  return "is-identifier";
}

function renderStaticCodeTokens(line: string) {
  const parts: ReactNode[] = [];
  const pattern = new RegExp(STATIC_CODE_TOKEN_PATTERN.source, STATIC_CODE_TOKEN_PATTERN.flags);
  let cursor = 0;
  let match = pattern.exec(line);

  while (match) {
    if (match.index > cursor) parts.push(line.slice(cursor, match.index));
    const token = match[0];
    parts.push(
      <span
        key={`${match.index}:${token}`}
        className={`platform-code-preview-box__token ${getStaticTokenClass(token)}`}
      >
        {token}
      </span>,
    );
    cursor = match.index + token.length;
    match = pattern.exec(line);
  }

  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts.length ? parts : "\u00a0";
}

function PlatformCodePreviewLoader() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % LOADER_PATTERN.length);
    }, 800 / LOADER_PATTERN.length);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="platform-code-preview-box__loader"
      role="status"
      aria-label="Loading code editor"
    >
      {Array.from({ length: 9 }, (_, dotIndex) => {
        const currentPatternValue = LOADER_PATTERN[activeIndex];
        const patternPosition = LOADER_PATTERN.indexOf(dotIndex);
        const distance = patternPosition < 0
          ? Number.POSITIVE_INFINITY
          : (activeIndex - patternPosition + LOADER_PATTERN.length) % LOADER_PATTERN.length;
        const opacity = currentPatternValue === -1
          ? 0.1
          : distance === 0
            ? 1
            : distance === 1
              ? 0.5
              : distance === 2
                ? 0.25
                : 0.1;

        return (
          <span
            key={dotIndex}
            className="platform-code-preview-box__loader-dot"
            style={{ opacity }}
          />
        );
      })}
    </div>
  );
}

function PlatformStaticCodePreview({ code }: { code: string }) {
  return (
    <pre className="platform-code-preview-box__code">
      {String(code || "").split("\n").map((line, index) => (
        <span key={`${index}:${line}`} className="platform-code-preview-box__line">
          <span className="platform-code-preview-box__line-number">{index + 1}</span>
          <span>{renderStaticCodeTokens(line)}</span>
        </span>
      ))}
    </pre>
  );
}

function PlatformEditorCodePreview({
  code,
  codePath,
  editorLanguage,
  editorTheme,
  editorBeforeMount,
  editorOptions,
}: Pick<
  PlatformCodePreviewBoxProps,
  "code" | "codePath" | "editorTheme" | "editorBeforeMount" | "editorOptions"
> & {
  editorLanguage: string;
}) {
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

  if (!EditorComponent) {
    return (
      <div className="platform-code-preview-box__editor-state">
        {editorError ? (
          <span className="platform-code-preview-box__editor-error">{editorError}</span>
        ) : (
          <PlatformCodePreviewLoader />
        )}
      </div>
    );
  }

  return (
    <EditorComponent
      path={codePath}
      height="100%"
      language={editorLanguage}
      theme={editorTheme}
      value={code}
      beforeMount={editorBeforeMount}
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        readOnly: true,
        domReadOnly: true,
        fontSize: 12,
        lineHeight: 18,
        lineNumbersMinChars: 2,
        renderLineHighlight: "none",
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        folding: false,
        glyphMargin: false,
        wordWrap: "off",
        padding: { top: 10, bottom: 10 },
        fontFamily: EDITOR_FONT_FAMILY,
        ...editorOptions,
      }}
    />
  );
}

export function PlatformCodePreviewBox({
  title,
  description,
  action,
  languages,
  language,
  onLanguageChange,
  code,
  mode = "static",
  codePath,
  codeHeight = mode === "editor" ? "220px" : "200px",
  copyLabel = "Copy code",
  onCopy,
  ariaLabel,
  className = "",
  editorTheme,
  editorBeforeMount,
  editorOptions,
}: PlatformCodePreviewBoxProps) {
  const activeLanguage = languages.find((option) => option.value === language) || languages[0];
  const normalizedLanguage = activeLanguage?.value || language;
  const editorLanguage = activeLanguage?.editorLanguage || normalizedLanguage || "plaintext";
  const previewStyle = {
    "--platform-code-preview-height": typeof codeHeight === "number" ? `${codeHeight}px` : codeHeight,
  } as CSSProperties;

  async function handleCopy() {
    if (onCopy) {
      await onCopy(code);
      return;
    }
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      // Clipboard access can be unavailable outside a secure browsing context.
    }
  }

  return (
    <section
      className={joinClassNames("platform-code-preview-box", className)}
      aria-label={ariaLabel || (typeof title === "string" ? title : "Code preview")}
      data-platform-code-preview-mode={mode}
    >
      <div className="platform-code-preview-box__inner">
        <div className="platform-code-preview-box__intro">
          <h2 className="platform-code-preview-box__title">{title}</h2>
          {description ? <p className="platform-code-preview-box__description">{description}</p> : null}
          {action ? (
            <PlatformPrimaryButton
              className="platform-code-preview-box__action"
              aria-label={action.ariaLabel}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.label}
            </PlatformPrimaryButton>
          ) : null}
        </div>

        <div className="platform-code-preview-box__preview">
          <div className="platform-code-preview-box__toolbar">
            <PlatformSwitch
              className="platform-code-preview-box__languages"
              value={normalizedLanguage}
              options={languages}
              onValueChange={onLanguageChange}
              ariaLabel="Code language"
            />
            <button
              type="button"
              className="platform-code-preview-box__copy"
              aria-label={copyLabel}
              title={copyLabel}
              onClick={() => void handleCopy()}
            >
              <Copy aria-hidden="true" strokeWidth={1.9} />
            </button>
          </div>

          <div className="platform-code-preview-box__code-shell" style={previewStyle}>
            {mode === "editor" ? (
              <PlatformEditorCodePreview
                code={code}
                codePath={codePath}
                editorLanguage={editorLanguage}
                editorTheme={editorTheme}
                editorBeforeMount={editorBeforeMount}
                editorOptions={editorOptions}
              />
            ) : (
              <PlatformStaticCodePreview code={code} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
