export const FILES_PREVIEW_COMPONENTS_SCRIPT = `
      function PlaygroundFileIcon({
        entry,
        size = "small",
        className = "",
        environmentId = "",
        backendUrl = "",
        useThumbnail = false,
      }) {
        const kind = getPlaygroundFileKind(entry);
        const baseClassName = ("playground-files-entry-icon" + (size === "large" ? " is-large" : "") + (className ? " " + className : "")).trim();
        const [thumbnailFailed, setThumbnailFailed] = useState(false);
        const [thumbnailFallbackFailed, setThumbnailFallbackFailed] = useState(false);
        const thumbnailUrl = useMemo(() => {
          if (!useThumbnail || kind !== "image" || !isPlaygroundRasterThumbnailCandidate(entry) || !environmentId || !backendUrl || !entry?.path) {
            return "";
          }
          return buildPlaygroundEnvironmentThumbnailUrl(backendUrl, environmentId, entry.path, size === "large" ? 128 : 64);
        }, [backendUrl, entry?.path, environmentId, kind, size, useThumbnail]);
        const thumbnailFallbackUrl = useMemo(() => {
          if (!useThumbnail || kind !== "image" || !environmentId || !backendUrl || !entry?.path) {
            return "";
          }
          return buildPlaygroundEnvironmentDownloadUrl(backendUrl, environmentId, entry.path);
        }, [backendUrl, entry?.path, environmentId, kind, useThumbnail]);

        useEffect(() => {
          setThumbnailFailed(false);
          setThumbnailFallbackFailed(false);
        }, [thumbnailFallbackUrl, thumbnailUrl]);

        if (kind === "folder") {
          return React.createElement("img", {
            className: baseClassName + " is-asset is-folder",
            src: PLAYGROUND_FOLDER_ICON_URL,
            alt: "",
            "aria-hidden": "true",
            draggable: false,
          });
        }
        if (kind === "image") {
          const imageThumbnailUrl = thumbnailUrl && !thumbnailFailed
            ? thumbnailUrl
            : (!thumbnailFallbackFailed ? thumbnailFallbackUrl : "");
          if (imageThumbnailUrl) {
            return React.createElement("img", {
              className: baseClassName + " is-thumbnail",
              src: imageThumbnailUrl,
              alt: entry?.name || "Image",
              loading: "lazy",
              decoding: "async",
              onError: () => {
                if (imageThumbnailUrl === thumbnailUrl && thumbnailFallbackUrl) {
                  setThumbnailFailed(true);
                } else {
                  setThumbnailFallbackFailed(true);
                }
              },
            });
          }
          return React.createElement(ImageIcon, { className: baseClassName + " is-image", strokeWidth: 1.75 });
        }
        return React.createElement("img", {
          className: baseClassName + " is-asset",
          src: PLAYGROUND_TEXT_FILE_ICON_URL,
          alt: "",
          "aria-hidden": "true",
          draggable: false,
        });
      }

      function PlaygroundCodeEditorPreview({
        entry,
        environmentId,
        backendUrl,
        requestHeaders,
        headerActions,
        headerCopy,
        onClose,
        onResizeStart,
        autoFocus = false,
        onAutoFocusComplete,
        showCloseButton = false,
        showResizeHandle = true,
        onSaveSuccess,
      }) {
        const [editorModule, setEditorModule] = useState(null);
        const [editorModuleError, setEditorModuleError] = useState("");
        const [loadState, setLoadState] = useState({
          status: "idle",
          value: "",
          initialValue: "",
          error: "",
        });
        const [isSaving, setIsSaving] = useState(false);
        const [saveError, setSaveError] = useState("");
        const [saveMessage, setSaveMessage] = useState("");
        const [wordWrap, setWordWrap] = useState(true);
        const editorInstanceRef = useRef(null);
        const textareaRef = useRef(null);
        const editorHistoryRef = useRef({
          past: [],
          future: [],
          current: "",
          isApplying: false,
        });
        const [editorHistoryAvailability, setEditorHistoryAvailability] = useState({
          canUndo: false,
          canRedo: false,
        });

        const MonacoEditorComponent = editorModule?.default || null;
        const downloadUrl = useMemo(() => {
          if (!entry || !environmentId) return "";
          return buildPlaygroundEnvironmentDownloadUrl(backendUrl, environmentId, entry.path);
        }, [backendUrl, environmentId, entry]);
        const editorLanguage = useMemo(() => getPlaygroundCodeEditorLanguage(entry), [entry]);
        const editorLanguageLabel = useMemo(() => formatPlaygroundCodeEditorLanguageLabel(entry), [entry]);
        const lineCount = useMemo(() => {
          if (loadState.status !== "ready") return 0;
          if (!loadState.value) return 1;
          const normalizedValue = String(loadState.value).replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");
          return normalizedValue ? normalizedValue.split("\\n").length : 1;
        }, [loadState.status, loadState.value]);
        const isDirty = loadState.status === "ready" && loadState.value !== loadState.initialValue;
        const shortcutLabel = useMemo(() => {
          if (typeof navigator === "undefined") return "Ctrl+S";
          return /mac|iphone|ipad/i.test(String(navigator.platform || "")) ? "Cmd+S" : "Ctrl+S";
        }, []);

        function updateEditorHistoryAvailability() {
          const history = editorHistoryRef.current;
          setEditorHistoryAvailability({
            canUndo: history.past.length > 0,
            canRedo: history.future.length > 0,
          });
        }

        function resetEditorHistory(value) {
          editorHistoryRef.current = {
            past: [],
            future: [],
            current: String(value || ""),
            isApplying: false,
          };
          setEditorHistoryAvailability({
            canUndo: false,
            canRedo: false,
          });
        }

        function recordEditorHistoryValue(nextValue) {
          const normalizedNextValue = String(nextValue || "");
          const history = editorHistoryRef.current;
          if (history.isApplying || history.current === normalizedNextValue) {
            return;
          }
          history.past = [...history.past, history.current].slice(-200);
          history.future = [];
          history.current = normalizedNextValue;
          updateEditorHistoryAvailability();
        }

        function applyEditorHistoryValue(nextValue) {
          const normalizedNextValue = String(nextValue || "");
          const history = editorHistoryRef.current;
          history.current = normalizedNextValue;
          history.isApplying = true;
          setLoadState((current) => current.status === "ready"
            ? {
                ...current,
                value: normalizedNextValue,
              }
            : current
          );
          const editor = editorInstanceRef.current;
          if (editor?.setValue && editor.getValue?.() !== normalizedNextValue) {
            editor.setValue(normalizedNextValue);
          }
          if (textareaRef.current && textareaRef.current.value !== normalizedNextValue) {
            textareaRef.current.value = normalizedNextValue;
          }
          window.requestAnimationFrame(() => {
            history.isApplying = false;
            updateEditorHistoryAvailability();
          });
        }

        useEffect(() => {
          let cancelled = false;

          void loadPlaygroundCodeEditorModule()
            .then((module) => {
              if (cancelled || !module) return;
              setEditorModule(module);
              void module.loader?.init?.()
                .then((monaco) => {
                  if (!cancelled) {
                    ensurePlaygroundCodeEditorTheme(monaco);
                  }
                })
                .catch(() => {});
            })
            .catch((error) => {
              if (cancelled) return;
              setEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
            });

          return () => {
            cancelled = true;
          };
        }, []);

        useEffect(() => {
          if (!entry || !environmentId || !downloadUrl) {
            setLoadState({
              status: "error",
              value: "",
              initialValue: "",
              error: "Preview unavailable for this file.",
            });
            return;
          }

          const controller = new AbortController();
          setLoadState({
            status: "loading",
            value: "",
            initialValue: "",
            error: "",
          });
          resetEditorHistory("");
          setSaveError("");
          setSaveMessage("");

          void fetch(downloadUrl, {
            method: "GET",
            headers: requestHeaders,
            signal: controller.signal,
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error("Failed to load file (" + response.status + ")");
              }
              const text = await response.text();
              resetEditorHistory(text);
              setLoadState({
                status: "ready",
                value: text,
                initialValue: text,
                error: "",
              });
            })
            .catch((error) => {
              if (controller.signal.aborted) {
                return;
              }
              setLoadState({
                status: "error",
                value: "",
                initialValue: "",
                error: error instanceof Error ? error.message : "Failed to load file.",
              });
            });

          return () => controller.abort();
        }, [downloadUrl, entry, environmentId, requestHeaders]);

        const handleSave = useCallback(async () => {
          if (!entry || !environmentId || !backendUrl || loadState.status !== "ready" || !isDirty || isSaving) {
            return;
          }

          setIsSaving(true);
          setSaveError("");
          setSaveMessage("");

          try {
            const formData = new FormData();
            const fileBlob = new Blob([loadState.value], {
              type: getPlaygroundPreviewMimeType(entry) || "text/plain",
            });
            formData.append("file", fileBlob, entry.name || "file");
            formData.append("path", getPlaygroundEntryParentPath(entry.path));

            const response = await fetch(
              backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/files/upload",
              {
                method: "POST",
                headers: requestHeaders,
                body: formData,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to save file.");
            }

            setLoadState((current) => current.status === "ready"
              ? {
                  ...current,
                  initialValue: current.value,
                }
              : current
            );
            setSaveMessage("Saved");

            if (typeof onSaveSuccess === "function") {
              await Promise.resolve(onSaveSuccess());
            }
          } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Failed to save file.");
          } finally {
            setIsSaving(false);
          }
        }, [backendUrl, entry, environmentId, isDirty, isSaving, loadState, onSaveSuccess, requestHeaders]);

        useEffect(() => {
          function handleKeyDown(event) {
            if (!(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== "s") {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation?.();
            void handleSave();
          }

          window.addEventListener("keydown", handleKeyDown, true);
          return () => window.removeEventListener("keydown", handleKeyDown, true);
        }, [handleSave]);

        function handleEditorChange(nextValue) {
          const normalizedValue = typeof nextValue === "string" ? nextValue : "";
          recordEditorHistoryValue(normalizedValue);
          setLoadState((current) => current.status === "ready"
            ? {
                ...current,
                value: normalizedValue,
              }
            : current
          );
          if (saveError) {
            setSaveError("");
          }
          if (saveMessage) {
            setSaveMessage("");
          }
        }

        function handleEditorUndo() {
          if (loadState.status !== "ready" || isSaving || !editorHistoryAvailability.canUndo) {
            return;
          }
          const history = editorHistoryRef.current;
          const previousValue = history.past.pop();
          if (typeof previousValue !== "string") {
            updateEditorHistoryAvailability();
            return;
          }
          history.future.push(history.current);
          applyEditorHistoryValue(previousValue);
          editorInstanceRef.current?.focus?.();
          textareaRef.current?.focus?.();
        }

        function handleEditorRedo() {
          if (loadState.status !== "ready" || isSaving || !editorHistoryAvailability.canRedo) {
            return;
          }
          const history = editorHistoryRef.current;
          const nextValue = history.future.pop();
          if (typeof nextValue !== "string") {
            updateEditorHistoryAvailability();
            return;
          }
          history.past.push(history.current);
          applyEditorHistoryValue(nextValue);
          editorInstanceRef.current?.focus?.();
          textareaRef.current?.focus?.();
        }

        function renderEditorBody() {
          if (loadState.status === "loading") {
            return React.createElement(PlatformLoadingState, {
              centered: true,
              className: "playground-code-preview-state",
              message: "Loading code...",
            });
          }

          if (loadState.status === "error") {
            return React.createElement("div", { className: "playground-code-preview-state is-error" }, loadState.error || "Failed to load file.");
          }

          if (MonacoEditorComponent) {
            return React.createElement(MonacoEditorComponent, {
              path: entry.path,
              height: "100%",
              language: editorLanguage,
              theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
              value: loadState.value,
              onChange: handleEditorChange,
              beforeMount: ensurePlaygroundCodeEditorTheme,
              onMount: (editor) => {
                editorInstanceRef.current = editor || null;
                if (!autoFocus) {
                  return;
                }
                window.requestAnimationFrame(() => {
                  editor?.focus?.();
                  if (typeof onAutoFocusComplete === "function") {
                    onAutoFocusComplete();
                  }
                });
              },
              options: {
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                fontSize: 12,
                lineHeight: 20,
                tabSize: 2,
                insertSpaces: true,
                renderLineHighlight: "gutter",
                lineNumbersMinChars: 3,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                wordWrap: wordWrap ? "on" : "off",
                padding: {
                  top: 12,
                  bottom: 12,
                },
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              },
            });
          }

          if (!editorModuleError) {
            return React.createElement(PlatformLoadingState, {
              centered: true,
              className: "playground-code-preview-state",
              message: "Loading editor...",
            });
          }

          return React.createElement("textarea", {
            ref: textareaRef,
            className: "playground-code-preview-textarea",
            value: loadState.value,
            onChange: (event) => handleEditorChange(event.target.value),
            autoFocus,
            spellCheck: false,
          });
        }

        const codeEditorHeaderActions = React.createElement(React.Fragment, null,
          React.createElement(PlatformIconButton, {
            size: "small",
            onClick: handleEditorUndo,
            disabled: isSaving || loadState.status !== "ready" || !editorHistoryAvailability.canUndo,
            title: "Undo change",
            "aria-label": "Undo change",
          }, React.createElement(RotateCcw, { width: 16, height: 16, strokeWidth: 1.9 })),
          React.createElement(PlatformIconButton, {
            size: "small",
            onClick: handleEditorRedo,
            disabled: isSaving || loadState.status !== "ready" || !editorHistoryAvailability.canRedo,
            title: "Redo change",
            "aria-label": "Redo change",
          }, React.createElement(RotateCw, { width: 16, height: 16, strokeWidth: 1.9 })),
          React.createElement(PlatformPrimaryButton, {
            size: "small",
            onClick: () => void handleSave(),
            disabled: !isDirty || isSaving || loadState.status !== "ready",
            title: "Save changes (" + shortcutLabel + ")",
          },
            React.createElement(Bookmark, { width: 13, height: 13, strokeWidth: 1.9 }),
            React.createElement("span", null, isSaving ? "Saving..." : "Save")
          ),
          headerActions
        );

        return React.createElement("div", { className: "tb-runner-document-preview-host tb-runner-document-preview-host-inline playground-code-preview-host" },
          React.createElement("aside", {
            className: "tb-attachment-preview-drawer tb-attachment-preview-drawer-inline playground-code-preview-drawer",
            "aria-label": (entry?.name || "Code file") + " editor",
          },
            showResizeHandle
              ? React.createElement("button", {
                  type: "button",
                  className: "tb-attachment-preview-drawer-resize-handle",
                  onPointerDown: onResizeStart,
                  "aria-label": "Resize file preview",
                  tabIndex: -1,
                })
              : null,
            React.createElement("div", { className: "tb-attachment-preview-drawer-header playground-code-preview-header" },
              headerCopy
                ? React.createElement("div", { className: "tb-attachment-preview-drawer-header-copy" }, headerCopy)
                : React.createElement("div", { className: "tb-attachment-preview-drawer-header-copy" },
                    React.createElement("div", { className: "tb-attachment-preview-drawer-header-text" },
                      React.createElement("div", { className: "tb-attachment-preview-drawer-name", title: entry?.name || "" }, entry?.name || "Untitled file")
                    )
                  ),
              codeEditorHeaderActions || (showCloseButton && onClose)
                ? React.createElement("div", { className: "tb-attachment-preview-drawer-header-actions" },
                    codeEditorHeaderActions,
                    showCloseButton && onClose
                      ? React.createElement(PlatformIconButton, {
                          size: "small",
                          onClick: onClose,
                          "aria-label": "Close file preview",
                        }, React.createElement(X, { width: 16, height: 16, strokeWidth: 2 }))
                      : null
                  )
                : null
            ),
            React.createElement("div", { className: "tb-attachment-preview-drawer-body playground-code-preview-body" },
              React.createElement("div", { className: "playground-code-preview-editor-shell" }, renderEditorBody())
            )
          )
        );
      }
`;
