export const METRONOME_INSPECTOR_03_FRAGMENT = String.raw`              if (isMetronomeAttachmentUploading) {
                return;
              }
              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              if (!attachmentEnvironment?.id) {
                setMetronomeAttachmentStatus("Select a computer before attaching files from the computer.");
                return;
              }
              setMetronomeAttachmentStatus("");
              setMetronomeEnvironmentFilePickerSearch("");
              setMetronomeEnvironmentFilePickerSelectedPaths([]);
              setMetronomeAttachmentModalOpen(true);
              void loadMetronomeEnvironmentFileInventory(attachmentEnvironment.id);
            };
            const uploadMetronomeAttachmentContent = async ({ filename, mimeType, data, options = {} }) => {
              const normalizedEnvironmentId = typeof options === "string"
                ? String(options || "").trim()
                : String(options?.environmentId || "").trim();
              const normalizedSourcePath = typeof options === "object" && options?.sourcePath
                ? normalizeHistoryPath(options.sourcePath)
                : "";
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(getMetronomeBackendUrl() + "/attachments/upload", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  filename: filename || "attachment",
                  mimeType: mimeType || "application/octet-stream",
                  data,
                  ...(normalizedEnvironmentId ? { environmentId: normalizedEnvironmentId } : {}),
                }),
              });
              const uploadResult = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(uploadResult?.message || uploadResult?.error || "Failed to upload attachment.");
              }
              const rawAttachment = uploadResult?.attachment && typeof uploadResult.attachment === "object"
                ? uploadResult.attachment
                : {};
              const normalizedMimeType = String(rawAttachment.mimeType || rawAttachment.contentType || mimeType || "application/octet-stream");
              const attachmentId = String(rawAttachment.id || rawAttachment.attachmentId || ("metronome_attachment_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8)));
              const attachmentUrl = rawAttachment.url || (attachmentId ? getMetronomeBackendUrl() + "/attachments/" + encodeURIComponent(attachmentId) : "");
              return {
                ...rawAttachment,
                id: attachmentId,
                name: rawAttachment.name || rawAttachment.filename || filename || "Attachment",
                filename: rawAttachment.filename || rawAttachment.name || filename || "Attachment",
                mimeType: normalizedMimeType,
                type: rawAttachment.type || (normalizedMimeType.startsWith("image/") ? "image" : "file"),
                size: Number(rawAttachment.size || rawAttachment.byteSize || 0),
                url: attachmentUrl,
                previewUrl: rawAttachment.previewUrl || attachmentUrl,
                environmentId: normalizedEnvironmentId || rawAttachment.environmentId || rawAttachment.sourceEnvironmentId || "",
                sourceEnvironmentId: normalizedEnvironmentId || rawAttachment.sourceEnvironmentId || rawAttachment.environmentId || "",
                sourcePath: normalizedSourcePath || rawAttachment.sourcePath || rawAttachment.workspacePath || "",
                workspacePath: normalizedSourcePath || rawAttachment.workspacePath || rawAttachment.sourcePath || "",
                source: "environment",
              };
            };
            const uploadMetronomeAttachmentFile = async (file, options = {}) => uploadMetronomeAttachmentContent({
              filename: file.name,
              mimeType: file.type || "application/octet-stream",
              data: await readFileAsBase64(file),
              options,
            });
            const appendMetronomeUploadedAttachments = (uploadedAttachments) => {
              const normalizedAttachments = (Array.isArray(uploadedAttachments) ? uploadedAttachments : []).filter(Boolean);
              if (!normalizedAttachments.length) {
                return false;
              }
              const currentNode = nodes.find((node) => node.id === selectedNodeId) || selectedNode;
              const latestAttachments = Array.isArray(currentNode?.data?.config?.attachments)
                ? currentNode.data.config.attachments
                : Array.isArray(config.attachments)
                  ? config.attachments
                  : [];
              updateSelectedNodeConfig("attachments", latestAttachments.concat(normalizedAttachments));
              return true;
            };
            const toggleMetronomeEnvironmentFileSelection = (path) => {
              const normalizedPath = normalizeHistoryPath(path);
              if (!normalizedPath) return;
              setMetronomeEnvironmentFilePickerSelectedPaths((current) =>
                current.includes(normalizedPath)
                  ? current.filter((value) => value !== normalizedPath)
                  : current.concat(normalizedPath)
              );
            };
            const toggleMetronomeEnvironmentFileFolder = (path) => {
              const normalizedPath = normalizeHistoryPath(path);
              if (!normalizedPath) return;
              setMetronomeEnvironmentFilePickerExpandedFolders((current) =>
                current.includes(normalizedPath)
                  ? current.filter((value) => value !== normalizedPath)
                  : current.concat(normalizedPath)
              );
            };
            const handleAttachMetronomeEnvironmentFiles = async () => {
              if (!metronomeAttachmentModalOpen || isMetronomeAttachmentUploading) {
                return;
              }
              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              const normalizedEnvironmentId = String(attachmentEnvironment?.id || "").trim();
              if (!normalizedEnvironmentId) {
                setMetronomeEnvironmentFilePickerState({ status: "error", error: "Select a computer before attaching files from the computer." });
                return;
              }
              const selectedEntries = metronomeEnvironmentFilePickerInventory.filter((entry) =>
                !entry.isFolder && metronomeEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
              );
              if (!selectedEntries.length) {
                return;
              }
              setMetronomeEnvironmentFilePickerState((current) => ({ ...current, error: "" }));
              setMetronomeAttachmentStatus("");
              setIsMetronomeAttachmentUploading(true);
              try {
                const uploadedAttachments = [];
                for (const entry of selectedEntries) {
                  const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(getMetronomeBackendUrl(), normalizedEnvironmentId, entry.path);
                  const response = await fetch(downloadUrl, {
                    method: "GET",
                    headers: requestHeaders || {},
                  });
                  if (!response.ok) {
                    throw new Error("Failed to load " + (entry.name || "file") + " (" + response.status + ")");
                  }
                  const blob = await response.blob();
                  const file = new globalThis.File([blob], entry.name || "file", {
                    type: entry.mimeType || blob.type || "application/octet-stream",
                  });
                  uploadedAttachments.push(await uploadMetronomeAttachmentFile(file, {
                    environmentId: normalizedEnvironmentId,
                    sourcePath: entry.path,
                  }));
                }
                appendMetronomeUploadedAttachments(uploadedAttachments);
                setMetronomeAttachmentModalOpen(false);
                setMetronomeEnvironmentFilePickerSelectedPaths([]);
                setMetronomeEnvironmentFilePickerSearch("");
                setMetronomeAttachmentStatus(uploadedAttachments.length === 1 ? "1 file attached." : uploadedAttachments.length + " files attached.");
                setIsMetronomeAttachmentUploading(false);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to attach computer files.";
                setMetronomeEnvironmentFilePickerState((current) => ({ ...current, error: errorMessage }));
                setMetronomeAttachmentStatus(errorMessage);
                setIsMetronomeAttachmentUploading(false);
              }
            };
            const renderMetronomeEnvironmentFilePickerIcon = (entry) => {
              if (entry?.isFolder) {
                return React.createElement("img", {
                  src: PLAYGROUND_FOLDER_ICON_URL,
                  alt: "",
                  draggable: false,
                  className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
                });
              }
              if (getPlaygroundFileKind(entry) === "image") {
                return React.createElement(ImageIcon, {
                  className: "tb-file-browser-item-icon tb-file-browser-item-icon-file",
                  strokeWidth: 1.75,
                });
              }
              return React.createElement("img", {
                src: PLAYGROUND_TEXT_FILE_ICON_URL,
                alt: "",
                draggable: false,
                className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
              });
            };
            const renderMetronomeEnvironmentFilePickerRow = (row) => {
              const entry = row.entry;
              const normalizedPath = normalizeHistoryPath(entry.path);
              const isSelected = metronomeEnvironmentFilePickerSelectedPaths.includes(normalizedPath);
              const isExpanded = metronomeEnvironmentFilePickerExpandedFolders.includes(normalizedPath);
              const metaValue = row.searchMatch
                ? getPlaygroundEntryParentPath(normalizedPath) || "Root"
                : formatPlaygroundFileDate(entry.modifiedTime || entry.createdTime);

              return React.createElement("div", { key: normalizedPath || entry.id },
                React.createElement("div", {
                  className: "tb-file-browser-item" + (isSelected ? " selected" : ""),
                  role: "button",
                  tabIndex: 0,
                  onClick: () => {
                    if (entry.isFolder && !row.searchMatch) {
                      toggleMetronomeEnvironmentFileFolder(normalizedPath);
                      return;
                    }
                    toggleMetronomeEnvironmentFileSelection(normalizedPath);
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (entry.isFolder && !row.searchMatch) {
                        toggleMetronomeEnvironmentFileFolder(normalizedPath);
                        return;
                      }
                      toggleMetronomeEnvironmentFileSelection(normalizedPath);
                    }
                  },
                  style: row.searchMatch ? undefined : { paddingLeft: String(12 + row.level * 20) + "px" },
                },
                  entry.isFolder && !row.searchMatch
                    ? React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-item-leading",
                        onClick: (event) => {
                          event.stopPropagation();
                          toggleMetronomeEnvironmentFileFolder(normalizedPath);
                        },
                      },
                        isExpanded
                          ? React.createElement(ChevronDown, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                          : React.createElement(ChevronRight, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                      )
                    : React.createElement("div", {
                        className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                        onClick: (event) => {
                          event.stopPropagation();
                          toggleMetronomeEnvironmentFileSelection(normalizedPath);
                        },
                      },
                        isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null
                      ),
                  renderMetronomeEnvironmentFilePickerIcon(entry),
                  React.createElement("span", { className: "tb-file-browser-item-name", title: entry.name }, entry.name),
                  React.createElement("span", { className: "tb-file-browser-item-meta", title: metaValue }, metaValue || "-"),
                  React.createElement("span", { className: "tb-file-browser-item-size" }, entry.isFolder ? "" : formatPlaygroundFileSize(entry.size))
                )
              );
            };
            const renderMetronomeEnvironmentFilePickerSidebar = (attachmentEnvironment) => React.createElement("div", { className: "tb-file-browser-sidebar" },
              React.createElement("div", { className: "tb-file-browser-search-wrap" },
                React.createElement("div", { className: "tb-file-browser-search" },
                  React.createElement(Search, { className: "tb-file-browser-search-icon", strokeWidth: 1.9 }),
                  React.createElement(MetronomeInspectorInput, {
                    className: "tb-file-browser-search-input",
                    value: metronomeEnvironmentFilePickerSearch,
                    placeholder: "Search files...",
                    onChange: (event) => setMetronomeEnvironmentFilePickerSearch(event.target.value),
                  }),
                  metronomeEnvironmentFilePickerSearch
                    ? React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-search-clear",
                        onClick: () => setMetronomeEnvironmentFilePickerSearch(""),
                        "aria-label": "Clear search",
                      }, React.createElement(X, { className: "tb-file-browser-search-clear-icon", strokeWidth: 1.9 }))
                    : null
                )
              ),
              attachmentEnvironment
                ? React.createElement("div", { className: "tb-file-browser-sidebar-section tb-file-browser-sidebar-section-environments" },
                    React.createElement("div", { className: "tb-file-browser-sidebar-title" }, "Computers"),
                    React.createElement("div", { className: "tb-file-browser-sidebar-list tb-file-browser-sidebar-list-environments" },
                      React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-source-row active",
                        onClick: () => void loadMetronomeEnvironmentFileInventory(attachmentEnvironment.id),
                      },
                        React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 }),
                        React.createElement("span", { className: "tb-file-browser-source-label" }, attachmentEnvironment.name || "Computer")
                      )
                    )
                  )
                : null
            );
            const renderThreadAttachments = (options = {}) => {
              const buttonLabel = String(options?.buttonLabel || "Upload from Computer").trim() || "Upload from Computer";
              const wrapperClassName = "playground-tasks-attachments playground-metronome-thread-attachments" + (options?.borderless ? " is-borderless" : "");
              const attachments = Array.isArray(config.attachments) ? config.attachments : [];
              const hasAttachments = attachments.length > 0;
              const openMetronomeAttachmentPicker = () => {
                if (metronomeAttachmentInputRef.current) {
                  metronomeAttachmentInputRef.current.click();
                }
              };
              const normalizeMetronomeAttachmentFiles = (fileList) => Array.from(fileList || [])
                .filter(Boolean)
                .map((file) => ({
                  id: "metronome_attachment_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
                  name: file.name || "Attachment",
                  filename: file.name || "Attachment",
                  size: Number(file.size || 0),
                  type: file.type || "application/octet-stream",
                  source: "upload",
                }));
              const addMetronomeAttachmentFiles = (fileList) => {
                const nextFiles = normalizeMetronomeAttachmentFiles(fileList);
                if (!nextFiles.length) {
                  return;
                }
                updateSelectedNodeConfig("attachments", attachments.concat(nextFiles));
                setMetronomeAttachmentStatus(nextFiles.length === 1 ? "1 file attached." : nextFiles.length + " files attached.");
              };
              const removeMetronomeAttachment = (attachmentToRemove) => {
                const removeKey = String(attachmentToRemove?.id || attachmentToRemove?.path || attachmentToRemove?.filename || attachmentToRemove?.name || "");
                updateSelectedNodeConfig("attachments", attachments.filter((attachment, index) => {
                  const key = String(attachment?.id || attachment?.path || attachment?.filename || attachment?.name || index);
                  return key !== removeKey;
                }));
              };
              const renderMetronomeAttachmentChip = (attachment, index) => {
                const label = String(attachment?.filename || attachment?.name || attachment?.path || "Attachment");
                return React.createElement("div", {
                  key: String(attachment?.id || attachment?.path || label || index),
                  className: "runner-attachment runner-attachment-file",
                },
                  React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-file-button",
                    tabIndex: -1,
                    "aria-label": "Attached " + label,
                  },
                    React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                      React.createElement(FileText, { className: "runner-attachment-file-icon", width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("div", { className: "runner-attachment-file-name", title: label }, label)
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-remove runner-attachment-remove-file",
                    "aria-label": "Remove " + label,
                    onClick: () => removeMetronomeAttachment(attachment),
                  }, React.createElement(X, { className: "runner-attachment-remove-icon", width: 12, height: 12, strokeWidth: 2 }))
                );
              };
              const handleMetronomeAttachmentDrop = (event) => {
                event.preventDefault();
                setIsMetronomeAttachmentDragging(false);
                addMetronomeAttachmentFiles(event.dataTransfer?.files);
              };
              return React.createElement("div", { className: wrapperClassName },
                React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
                  React.createElement("div", { className: "playground-tasks-attachments-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                      onClick: openMetronomeEnvironmentFilePicker,
                    }, buttonLabel)
                  )
                ),
                React.createElement(MetronomeInspectorInput, {
                  ref: metronomeAttachmentInputRef,
                  type: "file",
                  multiple: true,
                  hidden: true,
                  onChange: (event) => {
                    addMetronomeAttachmentFiles(event.target.files);
                    event.target.value = "";
                  },
                }),
                React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                  React.createElement("div", {
                    className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isMetronomeAttachmentDragging ? " dragging" : "") + (hasAttachments ? " is-filled" : ""),
                    onDragOver: (event) => {
                      event.preventDefault();
                      setIsMetronomeAttachmentDragging(true);
                    },
                    onDragLeave: (event) => {
                      if (event.currentTarget.contains(event.relatedTarget)) {
                        return;
                      }
                      setIsMetronomeAttachmentDragging(false);
                    },
                    onDrop: handleMetronomeAttachmentDrop,
                  },
                    hasAttachments
                      ? React.createElement(React.Fragment, null,
                          React.createElement("div", { className: "playground-tasks-attachments-topline" },
                            React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                            React.createElement("span", null, isMetronomeAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-attachments-browse",
                              onClick: openMetronomeAttachmentPicker,
                            }, "browse.")
                          ),
                          React.createElement("div", { className: "runner-attachments" },
                            attachments.map((attachment, index) => renderMetronomeAttachmentChip(attachment, index))
                          )
                        )
                      : React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-attachments-empty-button",
                          onClick: openMetronomeAttachmentPicker,
                        },
                          React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                          React.createElement("span", { className: "tb-popup-dropzone-title" }, isMetronomeAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                          React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                        )
                    )
                ),
                metronomeAttachmentStatus
                  ? React.createElement("div", { className: "playground-tasks-attachments-status" }, metronomeAttachmentStatus)
                  : null
              );
            };
            const renderMetronomeAttachmentModal = () => {
              if (!metronomeAttachmentModalOpen) {
                return null;
              }

              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              const selectedFilesCount = metronomeEnvironmentFilePickerInventory.filter((entry) =>
                !entry.isFolder && metronomeEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
              ).length;
              const searchQuery = String(metronomeEnvironmentFilePickerSearch || "").trim();
              const metronomeEnvironmentFilePickerRows = searchQuery
                ? buildPlaygroundEnvironmentSearchRows(metronomeEnvironmentFilePickerInventory, searchQuery, { filesOnly: true })
                : buildPlaygroundEnvironmentVisibleRows(
                    buildPlaygroundEnvironmentTree(metronomeEnvironmentFilePickerInventory),
                    "",
                    new Set(metronomeEnvironmentFilePickerExpandedFolders)
                  ).map((row) => ({ ...row, searchMatch: false }));

              return React.createElement("div", { className: "tb-runner-chat playground-metronome-environment-file-picker-portal" },
                React.createElement(PlatformModalBackdrop, {
                  className: "tb-file-browser-scrim",
                  onClick: () => {
                    if (!isMetronomeAttachmentUploading) {
                      setMetronomeAttachmentModalOpen(false);
                    }
                  },
                },
                  React.createElement(PlatformModalSurface, {
                    className: "tb-file-browser-modal",
                    onClick: (event) => event.stopPropagation(),
                  },
                    React.createElement("div", { className: "tb-file-browser-body" },
                      renderMetronomeEnvironmentFilePickerSidebar(attachmentEnvironment),
                      React.createElement("div", { className: "tb-file-browser-main" },
                        React.createElement("div", { className: "tb-file-browser-header" },
                          React.createElement("button", {
                            type: "button",
                            className: "tb-file-browser-nav-button",
                            onClick: () => {
                              if (!isMetronomeAttachmentUploading) {
                                setMetronomeAttachmentModalOpen(false);
                              }
                            },
                            "aria-label": "Close computer files",
                          }, React.createElement(X, { className: "tb-file-browser-nav-icon", strokeWidth: 1.9 })),
                          React.createElement("div", { className: "tb-file-browser-header-icon" },
                            React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 })
                          ),
                          React.createElement("div", { className: "tb-file-browser-breadcrumbs" },
                            React.createElement("span", { className: "tb-file-browser-breadcrumb-chip" },
                              React.createElement("button", {
                                type: "button",
                                className: "tb-file-browser-breadcrumb active",
                              }, attachmentEnvironment?.name || "Computer")
                            )
                          ),
                          React.createElement("div", { className: "tb-file-browser-count" }, selectedFilesCount + (selectedFilesCount === 1 ? " file selected" : " files selected"))
                        ),
                        React.createElement("div", { className: "tb-file-browser-list" },
                          metronomeEnvironmentFilePickerState.status === "loading"
                            ? React.createElement("div", { className: "tb-file-browser-empty" }, "Loading computer files...")
                            : metronomeEnvironmentFilePickerState.error
                              ? React.createElement("div", { className: "tb-file-browser-empty" }, metronomeEnvironmentFilePickerState.error)
                              : metronomeEnvironmentFilePickerRows.length === 0
                                ? React.createElement("div", { className: "tb-file-browser-empty" }, searchQuery ? "No matching files found." : "No files found on this computer.")
                                : React.createElement("div", { className: "tb-file-browser-list-inner" },
                                    metronomeEnvironmentFilePickerRows.map((row) => renderMetronomeEnvironmentFilePickerRow(row))
                                  )
                        )
                      )
                    ),
                    React.createElement("div", { className: "tb-file-browser-footer" },
                      React.createElement(PlatformSecondaryButton, {
                        type: "button",
                        className: "tb-file-browser-footer-button tb-file-browser-footer-button-secondary",
                        onClick: () => {
                          if (!isMetronomeAttachmentUploading) {
                            setMetronomeAttachmentModalOpen(false);
                          }
                        },
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        type: "button",
                        className: "tb-file-browser-footer-button tb-file-browser-footer-button-primary",
                        onClick: () => void handleAttachMetronomeEnvironmentFiles(),
                        disabled: selectedFilesCount === 0 || isMetronomeAttachmentUploading,
                      },
                        React.createElement("span", { className: "tb-file-browser-footer-button-content" },
                          isMetronomeAttachmentUploading
                            ? React.createElement("span", { className: "runner-spinner tb-file-browser-footer-button-spinner" })
                            : null,
                          React.createElement("span", { className: "tb-file-browser-footer-button-label" },
                            isMetronomeAttachmentUploading ? "Attaching Files..." : "Attach Files"
                          )
                        )
                      )
                    )
                  )
                )
              );
            };
            const renderMetronomeAttachmentModalPortal = () => {
              const modalElement = renderMetronomeAttachmentModal();
              if (!modalElement) {
                return null;
              }
              if (typeof document === "undefined" || typeof createPortal !== "function") {
                return modalElement;
              }
              return createPortal(modalElement, document.body);
            };
            const renderThreadSettings = () => {
              const outputContractValue = config.outputContractJson || config.output_contract_json || "{\n  \"summary\": \"\",\n  \"urls\": [],\n  \"records\": [],\n  \"artifacts\": []\n}";
              const parsedOutputContract = parseMetronomeDynamicContentJsonObject(outputContractValue) || {};
              const outputContractEntries = Object.entries(parsedOutputContract);
              const outputContractTypeOptions = [
                { id: "string", label: "Text" },
                { id: "number", label: "Number" },
                { id: "boolean", label: "Boolean" },
                { id: "array", label: "List" },
                { id: "object", label: "Object" },
              ];
              const createOutputContractValue = (type) => {
                if (type === "number") return 0;
                if (type === "boolean") return false;
                if (type === "array") return [];
                if (type === "object") return {};
                return "";
              };
              const commitOutputContract = (nextContract) => {
                const safeContract = nextContract && typeof nextContract === "object" && !Array.isArray(nextContract)
                  ? nextContract
                  : {};
                updateSelectedNodeConfigPatch({
                  outputMode: "structured",
                  requireJsonOutput: true,
                  outputContractJson: JSON.stringify(safeContract, null, 2),
                  outputFieldsJson: JSON.stringify(Object.keys(safeContract), null, 2),
                });
              };
              const addOutputContractField = () => {
                const fieldKey = String(metronomeOutputContractComposer.key || "").trim().replace(/[^A-Za-z0-9_$-]+/g, "_").replace(/^_+|_+$/g, "");
                if (!fieldKey || Object.prototype.hasOwnProperty.call(parsedOutputContract, fieldKey)) return;
                commitOutputContract({
                  ...parsedOutputContract,
                  [fieldKey]: createOutputContractValue(metronomeOutputContractComposer.type),
                });
                setMetronomeOutputContractComposer({ key: "", type: "string" });
              };
              const removeOutputContractField = (fieldKey) => {
                const nextContract = { ...parsedOutputContract };
                delete nextContract[fieldKey];
                commitOutputContract(nextContract);
              };
              const renderThreadOutputContractBuilder = () => React.createElement(MetronomeInspectorField, null,
                renderMetronomeFieldTitle("Output contract builder", "Define top-level structured fields. These become dynamic content for downstream nodes."),
                React.createElement("div", { className: "playground-metronome-output-contract-builder" },
                  outputContractEntries.length
                    ? React.createElement("div", { className: "playground-metronome-output-contract-rows" },
                        outputContractEntries.map(([fieldKey, fieldValue]) => React.createElement("div", {
                          key: fieldKey,
                          className: "playground-metronome-output-contract-row",
                        },
                          React.createElement("span", { className: "playground-metronome-output-contract-key", title: fieldKey }, fieldKey),
                          React.createElement("span", { className: "playground-metronome-output-contract-type" }, inferMetronomeDynamicContentValueType(fieldValue)),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-output-contract-delete",
                            onClick: () => removeOutputContractField(fieldKey),
                            title: "Remove field",
                            "aria-label": "Remove " + fieldKey,
                          }, React.createElement(X, { width: 12, height: 12, strokeWidth: 2 }))
                        ))
                      )
                    : React.createElement(MetronomeInspectorFieldHint, { as: "p" }, "No structured fields yet."),
                  React.createElement("div", { className: "playground-metronome-output-contract-composer" },
                    React.createElement(MetronomeInspectorInput, {
                      type: "text",
                      className: "playground-metronome-input",
                      value: metronomeOutputContractComposer.key,
                      placeholder: "field_name",
                      onKeyDown: (event) => {
                        stopMetronomeInputKeyPropagation(event);
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addOutputContractField();
                        }
                      },
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => setMetronomeOutputContractComposer((current) => ({
                        ...current,
                        key: event.target.value,
                      })),
                    }),
                    React.createElement(MetronomeInspectorNativeSelect, {
                      className: "playground-metronome-select",
                      value: metronomeOutputContractComposer.type,
                      onChange: (event) => setMetronomeOutputContractComposer((current) => ({
                        ...current,
                        type: event.target.value,
                      })),
                    },
                      outputContractTypeOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.label))
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-output-contract-add",
                      onClick: addOutputContractField,
                      disabled: !String(metronomeOutputContractComposer.key || "").trim(),
                      title: "Add output field",
                      "aria-label": "Add output field",
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 2 }))
                  )
                )
              );
              return React.createElement(React.Fragment, null,
              renderMetronomeRichTextField({
                fieldKey: "message",
                title: "Instructions",
                placeholder: "Add instructions here",
                tooltip: "Append instructions or context to the triggering message before the agent continues. Use this to pass project context, formatting requirements, or guidance for the next node summary.",
              }),
              renderMetronomeAgentSelector(),
              renderMetronomeWorkspaceSelector(),
              React.createElement(MetronomeInspectorSwitchRow, { className: "is-workflow-context" },
                React.createElement("div", { className: "playground-metronome-switch-copy" },
                  React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                    React.createElement("span", null, "Full workflow context"),
                    renderMetronomeFieldTooltip("Pass the full chain of previous node summaries into this thread. Turn off to pass only the latest node result.")
                  )
                ),
                React.createElement(MetronomeInspectorSwitch, {
                  type: "button",
                  className: (normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope) !== "latest" ? " is-on" : ""),
                  role: "switch",
                  "aria-checked": normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope) !== "latest",
                  onClick: () => {
                    const currentScope = normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope);
                    updateSelectedNodeConfig("inputContextScope", currentScope === "latest" ? "all" : "latest");
                  },
                })
              ),
              React.createElement("div", { className: "playground-metronome-trigger-evaluate-row is-thread-more-row" + (isMetronomeThreadMoreOpen ? " is-open" : "") },
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-thread-more-toggle" + (isMetronomeThreadMoreOpen ? " is-open" : ""),
                  "aria-expanded": isMetronomeThreadMoreOpen ? "true" : "false",
                  onClick: () => setIsMetronomeThreadMoreOpen((value) => !value),
                },
                  React.createElement(ChevronDown, { className: "playground-metronome-thread-more-toggle-icon", width: 13, height: 13, strokeWidth: 1.9 }),
                  React.createElement("span", null, "More")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-trigger-evaluate-link",
                  onClick: () => setIsMetronomeTriggerDiagnosticsModalOpen(true),
                }, "Evaluate Node")
              ),
              React.createElement("div", { className: "playground-metronome-thread-more-sections" + (isMetronomeThreadMoreOpen ? " is-open" : "") },
                React.createElement("div", { className: "playground-metronome-thread-more-sections-inner" },
                    React.createElement(MetronomeInspectorField, { className: "playground-metronome-thread-output-field" },
                      renderMetronomeFieldTitle("Output mode", "Structured output lets downstream Firecrawl, Database, and Function nodes bind to JSON, URLs, files, records, and artifacts."),
                      renderMetronomeInspectorSelect({
                        id: "thread-output-mode-" + (selectedNodeId || "selected"),
                        value: String(config.outputMode || config.output_mode || "text") === "structured" ? "structured" : "text",
                        options: [
                          { id: "text", label: "Narrative text" },
                          { id: "structured", label: "Structured JSON" },
                        ],
                        onChange: (nextValue) => updateSelectedNodeConfig("outputMode", nextValue),
                        searchPlaceholder: "Select output mode...",
                      })
                    ),
                    React.createElement(MetronomeInspectorField, { className: "playground-metronome-thread-output-field" },
                      renderMetronomeFieldTitle("Output key", "Name this thread output so downstream nodes can bind to it, for example previous.menu_detection.records."),
                      React.createElement(MetronomeInspectorInput, {
                        className: "playground-metronome-input",
                        value: config.outputKey || config.output_key || "thread",
                        onChange: (event) => updateSelectedNodeConfig("outputKey", event.target.value),
                        placeholder: "thread",
                      })
                    ),
                    React.createElement(MetronomeInspectorSwitchRow, { className: "is-workflow-context" },
                      React.createElement("div", { className: "playground-metronome-switch-copy" },
                        React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                          React.createElement("span", null, "Require JSON output"),
                          renderMetronomeFieldTooltip("Ask the agent to produce machine-readable output for deterministic downstream nodes.")
                        )
                      ),
                      React.createElement(MetronomeInspectorSwitch, {
                        type: "button",
                        className: (config.requireJsonOutput || config.require_json_output ? " is-on" : ""),
                        role: "switch",
                        "aria-checked": config.requireJsonOutput || config.require_json_output ? "true" : "false",
                        onClick: () => updateSelectedNodeConfig("requireJsonOutput", !(config.requireJsonOutput || config.require_json_output)),
                      })
                    ),
                    renderThreadOutputContractBuilder(),
                    renderMetronomeJsonEditorField({
                      title: "Output fields",
                      tooltip: "Fields that this thread can expose to following nodes.",
                      fieldKey: "outputFieldsJson",
                      value: config.outputFieldsJson || config.output_fields_json || JSON.stringify(METRONOME_THREAD_OUTPUT_FIELDS, null, 2),
                      path: "output-fields.json",
                    }),
                    renderMetronomeJsonEditorField({
                      title: "Output contract",
                      tooltip: "Optional JSON shape the agent should return when structured output is enabled.",
                      fieldKey: "outputContractJson",
                      value: config.outputContractJson || config.output_contract_json || "{\n  \"summary\": \"\",\n  \"urls\": [],\n  \"records\": [],\n  \"artifacts\": []\n}",
                      path: "output-contract.json",
                    })
                  )
                )
            );
            };
            const renderImagineSettings = () => {
              const templateOptions = getMetronomeImagineTemplateOptions();
              const selectedTemplate = templateOptions.find((option) => option.id === config.templateId) || null;
              const selectedMediaMode = normalizeMetronomeImagineMediaMode(config.mediaMode || selectedTemplate?.mediaType);
              const modelOptions = getMetronomeImagineModelOptions(selectedMediaMode);
              const selectedModelId = normalizeMetronomeImagineModelId(
                selectedMediaMode,
                selectedMediaMode === "video"
                  ? (config.videoModelId || config.modelId)
                  : (config.imageModelId || config.modelId)
              );
              const setImagineMediaMode = (nextMode) => {
                const normalizedMode = normalizeMetronomeImagineMediaMode(nextMode);
                const nextModelId = normalizeMetronomeImagineModelId(
                  normalizedMode,
                  normalizedMode === "video"
                    ? (config.videoModelId || config.modelId)
                    : (config.imageModelId || config.modelId)
                );
                updateSelectedNodeConfigPatch({
                  mediaMode: normalizedMode,
                  modelId: nextModelId,
                  ...(normalizedMode === "video" ? { videoModelId: nextModelId } : { imageModelId: nextModelId }),
                });
              };
              const setImagineModel = (nextModelId) => {
                const normalizedModelId = normalizeMetronomeImagineModelId(selectedMediaMode, nextModelId);
                updateSelectedNodeConfigPatch({
                  modelId: normalizedModelId,
                  ...(selectedMediaMode === "video" ? { videoModelId: normalizedModelId } : { imageModelId: normalizedModelId }),
                });
              };
              const selectImagineTemplate = (templateId) => {
                const nextTemplate = templateOptions.find((option) => option.id === templateId) || null;
                const nextMediaMode = normalizeMetronomeImagineMediaMode(nextTemplate?.mediaType || selectedMediaMode);
                const nextModelId = normalizeMetronomeImagineModelId(
                  nextMediaMode,
                  nextMediaMode === "video"
                    ? (config.videoModelId || config.modelId)
                    : (config.imageModelId || config.modelId)
                );
                const currentPrompt = String(config.prompt || "").trim();
                const shouldReplacePrompt = !currentPrompt
                  || currentPrompt === "Create an image from this workflow context."
                  || currentPrompt === "Create a video from this workflow context."
                  || (selectedTemplate?.prompt && currentPrompt === selectedTemplate.prompt);
                updateSelectedNodeConfigPatch({
                  templateId: nextTemplate?.id || "",
                  templateName: nextTemplate?.title || "",
                  mediaMode: nextMediaMode,
                  modelId: nextModelId,
                  ...(nextMediaMode === "video" ? { videoModelId: nextModelId } : { imageModelId: nextModelId }),
                  ...(shouldReplacePrompt ? { prompt: nextTemplate?.prompt || (nextMediaMode === "video" ? "Create a video from this workflow context." : "Create an image from this workflow context.") } : {}),
                });
              };

              return React.createElement(React.Fragment, null,
                React.createElement(MetronomeInspectorField, null,
                  renderMetronomeFieldTitle("Template"),
                  renderMetronomeInspectorSelect({
                    id: "imagine-template-" + (selectedNodeId || "selected"),
                    value: config.templateId || "",
                    options: [
                      { id: "", label: "Select template" },
                      ...templateOptions.map((option) => ({
                        id: option.id,
                        label: option.title + (normalizeMetronomeImagineMediaMode(option.mediaType) === "video" ? " · Video" : " · Image"),
                        description: option.description || option.prompt || "",
                      })),
                    ],
                    onChange: (nextValue) => selectImagineTemplate(nextValue),
                    searchPlaceholder: "Select a template...",
                  })
                ),
                React.createElement(MetronomeInspectorField, null,
                  renderMetronomeFieldTitle("Mode"),
                  renderMetronomeInspectorSelect({
                    id: "imagine-mode-" + (selectedNodeId || "selected"),
                    value: selectedMediaMode,
                    options: [
                      { id: "image", label: "Image", description: "Generate still images from workflow context." },
                      { id: "video", label: "Video", description: "Generate short videos from workflow context." },
                    ],
                    onChange: (nextValue) => setImagineMediaMode(nextValue),
                    searchPlaceholder: "Select mode...",
                  })
                ),
                React.createElement(MetronomeInspectorField, { className: "playground-metronome-imagine-model-field" },
                  renderMetronomeFieldTitle(
                    selectedMediaMode === "video" ? "Video model" : "Image model",
                    (modelOptions.find((option) => option.id === selectedModelId) || modelOptions[0])?.description || ""
                  ),
                  renderMetronomeInspectorSelect({
                    id: "imagine-model-" + selectedMediaMode + "-" + (selectedNodeId || "selected"),
                    value: selectedModelId,
                    options: modelOptions.map((option) => ({
                      id: option.id,
                      label: option.label,
                      description: option.description || "",
                    })),
                    onChange: (nextValue) => setImagineModel(nextValue),
                    searchPlaceholder: "Select a model...",
                  })
                ),
                renderMetronomeRichTextField({
                  fieldKey: "prompt",
                  title: "Instructions",
                  placeholder: selectedMediaMode === "video" ? "Describe the video to generate" : "Describe the image to generate",
                  tooltip: "Append generation instructions to the workflow context before Imagine runs. The node can use summaries and artifacts from previous nodes.",
                  isInstructionsField: true,
                }),
                renderMetronomeAgentSelector(),
                renderMetronomeWorkspaceSelector(),
                React.createElement(MetronomeInspectorSwitchRow, { className: "is-workflow-context" },
                  React.createElement("div", { className: "playground-metronome-switch-copy" },
                    React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                      React.createElement("span", null, "Full workflow context"),
                      renderMetronomeFieldTooltip("Pass the full chain of previous node summaries into Imagine. Turn off to pass only the latest node result.")
                    )
                  ),
                  React.createElement(MetronomeInspectorSwitch, {
                    type: "button",
                    className: (normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope) !== "latest" ? " is-on" : ""),
                    role: "switch",
                    "aria-checked": normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope) !== "latest",
                    onClick: () => {
                      const currentScope = normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope);
                      updateSelectedNodeConfig("inputContextScope", currentScope === "latest" ? "all" : "latest");
                    },
                  })
                )
              );
            };
            const renderTicketSettings = () => {
              const ticketStatusOptions = [
                { id: "planned", label: "Planned" },
                { id: "in_review", label: "In Review" },
                { id: "blocked", label: "Blocked" },
                { id: "done", label: "Done" },
                { id: "canceled", label: "Canceled" },
              ];
              const ticketActionOptions = [
                { id: "adapt_ticket", label: "Adapt ticket" },
                { id: "add_ticket_comment", label: "Add comment to ticket" },
                { id: "move_ticket_status", label: "Move ticket status" },
                { id: "start_work_on_ticket", label: "Start work on ticket" },
                { id: "add_subtask", label: "Add Subtask" },
              ];
              const selectedTicketAction = normalizeMetronomeTicketOperation(config.operation || subtype);
              const isAdaptTicket = selectedTicketAction === "adapt_ticket";
              const isStatusUpdate = selectedTicketAction === "move_ticket_status";
              const isComment = selectedTicketAction === "add_ticket_comment";
              const isStartWork = selectedTicketAction === "start_work_on_ticket";
              const isAddSubtask = selectedTicketAction === "add_subtask";
              const selectedProject = metronomeProjectOptions.find((option) => option.id === config.projectId) || null;
              const embeddedTicketOptions = extractMetronomeProjectTicketOptions(selectedProject);
              const fetchedTicketOptions = config.projectId && Object.prototype.hasOwnProperty.call(metronomeProjectTicketsByProjectId, config.projectId)
                ? (metronomeProjectTicketsByProjectId[config.projectId] || [])
                : [];
              const ticketOptionsBase = fetchedTicketOptions.length > 0 ? fetchedTicketOptions : embeddedTicketOptions;
              const normalizedCurrentTicket = config.ticketId
                ? normalizeMetronomeTicketOption({
                    id: config.ticketId,
                    title: config.ticketTitle || config.ticketId,
                    ticketNumber: config.ticketNumber || "",
                    status: config.ticketStatus || "planned",
                    projectId: config.projectId || "",
                    projectName: config.projectName || "",
                  }, selectedProject)
                : null;
              const ticketOptions = normalizedCurrentTicket && !ticketOptionsBase.some((option) => option.id === normalizedCurrentTicket.id)
                ? [normalizedCurrentTicket, ...ticketOptionsBase]
                : ticketOptionsBase;
              const formatTicketOptionLabel = (ticket) => {
                const ticketNumber = String(ticket?.ticketNumber || "").trim();
                const title = String(ticket?.title || ticket?.name || ticket?.id || "").trim();
                return [ticketNumber, title].filter(Boolean).join(" · ") || title || "Untitled ticket";
              };
              const renderTicketSelector = () => React.createElement(MetronomeInspectorField, null,
                renderMetronomeFieldTitle("Ticket"),
                renderMetronomeInspectorSelect({
                  id: "ticket-target-" + (selectedNodeId || "selected"),
                  value: config.ticketId || "",
                  disabled: !config.projectId,
                  options: [
                    { id: "", label: config.projectId ? "Select ticket" : "Select project first" },
                    ...ticketOptions.map((ticket) => ({
                      id: ticket.id,
                      label: formatTicketOptionLabel(ticket),
                      description: ticket.status || ticket.projectName || "",
                    })),
                  ],
                  onChange: (nextTicketId) => {
                    const nextTicket = ticketOptions.find((ticket) => ticket.id === nextTicketId) || null;
                    updateSelectedNodeConfigPatch({
                      ticketId: nextTicketId,
                      ticketTitle: nextTicket?.title || "",
                      ticketNumber: nextTicket?.ticketNumber || "",
                      ticketStatus: nextTicket?.status || config.ticketStatus || "planned",
                    });
                  },
                  searchPlaceholder: "Select a ticket...",
                })
              );
              return React.createElement(React.Fragment, null,
                React.createElement(MetronomeInspectorField, null,
                  renderMetronomeFieldTitle("Project"),
                  renderMetronomeInspectorSelect({
                    id: "ticket-project-" + (selectedNodeId || "selected"),
                    value: config.projectId || "",
                    options: [
                      { id: "", label: "Select project" },
                      ...metronomeProjectOptions.map((option) => ({
                        id: option.id,
                        label: option.name,
                        description: option.description || option.id || "",
                      })),
                    ],
                    onChange: (nextProjectId) => {
                      const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                      updateSelectedNodeConfigPatch({
                        projectId: nextProjectId,
                        projectName: nextProject?.name || "",
                        ticketId: "",
                        ticketTitle: "",
                        ticketNumber: "",
                        ticketStatus: config.ticketStatus || "planned",
                      });
                    },
                    searchPlaceholder: "Select a project...",
                  })
                ),
                React.createElement(MetronomeInspectorField, null,
                  renderMetronomeFieldTitle("Action"),
                  renderMetronomeInspectorSelect({
                    id: "ticket-action-" + (selectedNodeId || "selected"),
                    value: selectedTicketAction,
                    options: ticketActionOptions,
                    onChange: (nextAction) => {
                      const nextOperation = normalizeMetronomeTicketOperation(nextAction);
                      updateSelectedNodeData({
                        subtype: nextOperation,
                        description: getMetronomeSubtypeLabel("ticket", nextOperation),
                      });
                      updateSelectedNodeConfigPatch({
                        operation: nextOperation,
                        projectId: config.projectId || "",
                        projectName: config.projectName || "",
                        ticketId: config.ticketId || "",
                        ticketTitle: config.ticketTitle || "",
                        ticketStatus: config.ticketStatus || "planned",
                        comment: config.comment || "",
                        adaptationInstructions: config.adaptationInstructions || "",
                        subtaskTitle: config.subtaskTitle || "",
                        subtaskInstructions: config.subtaskInstructions || "Create a focused subtask from the workflow context.",
                        workInstructions: config.workInstructions || "Start work on this ticket and return a short implementation summary.",
                        agentId: config.agentId || defaultMetronomeAgentOption?.id || METRONOME_FALLBACK_AGENTS[0].id,
                        agentName: config.agentName || defaultMetronomeAgentOption?.name || METRONOME_FALLBACK_AGENTS[0].name,
                        environmentId: config.environmentId || defaultMetronomeComputerOption?.id || METRONOME_FALLBACK_COMPUTERS[0].id,
                        environmentName: config.environmentName || defaultMetronomeComputerOption?.name || METRONOME_FALLBACK_COMPUTERS[0].name,
                        fieldsJson: config.fieldsJson || "{\n  \"status\": \"planned\"\n}",
                      });
                    },
                    searchPlaceholder: "Select an action...",
                  })
                ),
                renderTicketSelector(),
                isAdaptTicket
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeAgentSelector({ title: "Assignee", popupTitle: "Assignee" }),
                      renderMetronomeWorkspaceSelector(),
                      renderMetronomeRichTextField({
                        fieldKey: "adaptationInstructions",
                        title: "Instructions",
                        placeholder: "Describe how the ticket should be adapted from the workflow context.",
                        tooltip: "Use this when previous node output should update the ticket title, body, status, or fields.",
                        isInstructionsField: true,
                      })
                    )
                  : null,
                isStatusUpdate
                  ? React.createElement(MetronomeInspectorField, null,
                      renderMetronomeFieldTitle("Status"),
                      renderMetronomeInspectorSelect({
                        id: "ticket-status-" + (selectedNodeId || "selected"),
                        value: config.ticketStatus || "planned",
                        options: ticketStatusOptions,
                        onChange: (nextValue) => updateSelectedNodeConfig("ticketStatus", nextValue),
                        searchPlaceholder: "Select a status...",
                      })
                    )
                  : null,
                isComment
                  ? renderMetronomeRichTextField({
                      fieldKey: "comment",
                      title: "Comment",
                      placeholder: "Write a ticket comment",
                      tooltip: "Write the comment that should be added to the selected project ticket.",
                    })
                  : null,
                isStartWork
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeAgentSelector(),
                      renderMetronomeWorkspaceSelector(),
                      renderMetronomeRichTextField({
                        fieldKey: "workInstructions",
                        title: "Work instructions",
                        placeholder: "Tell the agent how to start work on the selected ticket.",
                        tooltip: "The workflow will start an agent thread with the ticket context and these instructions.",
                      })
                    )
                  : null,
                isAddSubtask
                  ? React.createElement(React.Fragment, null,
                      React.createElement(MetronomeInspectorField, null,
                        renderMetronomeFieldTitle("Subtask title"),
                        React.createElement(MetronomeInspectorInput, {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.subtaskTitle || "",
                          placeholder: "Follow-up implementation task",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("subtaskTitle", event.target.value),
                        })
                      ),
                      renderMetronomeAgentSelector({ title: "Assignee", popupTitle: "Assignee" }),
                      renderMetronomeWorkspaceSelector(),
                      renderMetronomeRichTextField({
                        fieldKey: "subtaskInstructions",
                        title: "Subtask instructions",
                        placeholder: "Describe the subtask that should be added under the selected ticket.",
                        tooltip: "Create a child task connected to the selected ticket. Use workflow context to define scope, acceptance criteria, and owner guidance.",
                      })
                    )
                  : null
              );
            };
            const renderFirecrawlSettings = () => {
              const operation = normalizeMetronomeFirecrawlOperation(config.operation || subtype);
            const isSearch = operation === "web_search";
            const isScrape = operation === "scrape_url";
            const isParse = operation === "parse_document";
            const isExtract = operation === "extract_data";
              const parsedCredentialRef = parseMetronomeSecretCredentialRef(config.credentialRef || config.credential_ref || "");
              const credentialVaultId = String(config.credentialVaultId || config.credential_vault_id || parsedCredentialRef.vaultId || "").trim();
              const credentialSecretId = String(config.credentialSecretId || config.credential_secret_id || parsedCredentialRef.secretId || "").trim();
              const credentialVaultSecrets = credentialVaultId && Array.isArray(metronomeSecretVaultSecretsByVaultId[credentialVaultId])
                ? metronomeSecretVaultSecretsByVaultId[credentialVaultId]
                : [];
              const isCredentialSecretsLoading = credentialVaultId && metronomeSecretVaultSecretsLoadingId === credentialVaultId;
              return React.createElement(React.Fragment, null,
                React.createElement(MetronomeInspectorField, null,
                  renderMetronomeFieldTitle("Credential", "Use the managed Computer Agents Firecrawl credential by default, billed as usage. Choose a Secrets resource to use your own key."),
                  renderMetronomeInspectorSelect({
                    id: "firecrawl-credential-vault-" + (selectedNodeId || "selected"),
                    value: credentialVaultId,
                    options: [
                      { id: "", label: "Computer Agents Firecrawl", description: "Managed credential" },
                      ...metronomeSecretVaultOptions.map((option) => ({
                        id: option.id,
                        label: option.name,
                        description: option.description || option.id || "",
                      })),
                    ],
                    onChange: (nextValue) => {
                      const nextVaultId = String(nextValue || "").trim();
                      const nextVault = metronomeSecretVaultOptions.find((option) => option.id === nextVaultId) || null;
                      updateSelectedNodeConfigPatch({
                        credentialVaultId: nextVaultId,
                        credentialVaultName: nextVault?.name || "",
                        credentialSecretId: "",
                        credentialSecretName: "",
                        credentialRef: nextVaultId ? "" : "workspace:FIRECRAWL_API_KEY",
                      });
                      if (nextVaultId) {
                        void loadMetronomeSecretVaultSecrets(nextVaultId, { force: true });
                      }
                    },
                    searchPlaceholder: "Select credential...",
                  })
                ),
                credentialVaultId
                  ? React.createElement(MetronomeInspectorField, null,
                      renderMetronomeFieldTitle("Credential", "Select the Firecrawl API key stored in the chosen secrets resource."),
                      renderMetronomeInspectorSelect({
                        id: "firecrawl-credential-secret-" + (selectedNodeId || "selected"),
                        value: credentialSecretId,
                        disabled: isCredentialSecretsLoading,
                        options: [
                          { id: "", label: isCredentialSecretsLoading ? "Loading credentials..." : "Select credential" },
                          ...credentialVaultSecrets.map((secret) => ({
                            id: secret.id,
                            label: secret.name,
                            description: secret.description || secret.id || "",
                          })),
                        ],
                        onChange: (nextValue) => {
                          const nextSecretId = String(nextValue || "").trim();
                          const nextSecret = credentialVaultSecrets.find((secret) => secret.id === nextSecretId) || null;
                          updateSelectedNodeConfigPatch({
                            credentialSecretId: nextSecretId,
                            credentialSecretName: nextSecret?.name || "",
                            credentialRef: nextSecretId ? buildMetronomeSecretCredentialRef(credentialVaultId, nextSecretId) : "",
                          });
                        },
                        searchPlaceholder: "Select credential...",
                      })
                    )
                  : null,
                credentialVaultId && !isCredentialSecretsLoading && !credentialVaultSecrets.length
                  ? React.createElement(MetronomeInspectorFieldHint, { as: "p", className: "playground-metronome-firecrawl-credential-hint" }, "No credentials found in this secrets resource yet.")
                  : null,
                !credentialVaultId
                  ? React.createElement(MetronomeInspectorFieldHint, { as: "p", className: "playground-metronome-firecrawl-credential-hint" }, "Managed by Computer Agents and billed as usage.")
                  : null,
                !metronomeSecretVaultOptions.length
                  ? React.createElement(MetronomeInspectorFieldHint, { as: "p", className: "playground-metronome-firecrawl-credential-hint" }, "Create a Secrets resource in Develop mode to use your own Firecrawl key.")
                  : null,
                isSearch
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "Query",
                        fieldKey: "inputBinding",
                        fallback: "last.text",
                        className: "playground-metronome-firecrawl-source-field",
                        options: [
                          { id: "last.text", label: "Previous node text" },
                          { id: "last.json.query", label: "Previous node JSON query" },
                          { id: "trigger.input", label: "Trigger input" },
                          { id: "workflow.context", label: "Full workflow context" },
                        ],
                      }),
                      React.createElement(MetronomeInspectorField, { className: "playground-metronome-firecrawl-fallback-field" },
                        renderMetronomeFieldTitle("Fallback", "Used when the selected binding does not provide a query."),
                        React.createElement(MetronomeInspectorInput, {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.query || "",
                          placeholder: "latest pricing changes",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("query", event.target.value),
                        })
                      )
                    )
                  : null,
                isScrape
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "URL source",
                        fieldKey: "inputBinding",
                        fallback: "last.urls",
                        className: "playground-metronome-firecrawl-source-field",
                        options: [
                          { id: "last.urls", label: "Previous node URLs" },
                          { id: "last.json.url", label: "Previous node JSON URL" },
                          { id: "trigger.input.url", label: "Trigger input URL" },
                        ],
                      }),
                      React.createElement(MetronomeInspectorField, { className: "playground-metronome-firecrawl-fallback-field" },
                        renderMetronomeFieldTitle("Fallback URL"),
                        React.createElement(MetronomeInspectorInput, {
                          type: "url",
                          className: "playground-metronome-input",
                          value: config.url || "",
                          placeholder: "https://example.com",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("url", event.target.value),
                        })
                      ),
                      React.createElement(MetronomeInspectorField, null,
                        renderMetronomeFieldTitle("Formats"),
                        React.createElement(MetronomeInspectorInput, {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.formats || "markdown,html",
                          placeholder: "markdown,html",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("formats", event.target.value),
                        })
                      )
                    )
                  : null,
                isParse
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "Document source",
                        fieldKey: "inputBinding",
                        fallback: "last.files",
                        className: "playground-metronome-firecrawl-source-field",
                        options: [
                          { id: "last.files", label: "Previous node files" },
                          { id: "last.documents", label: "Previous node documents" },
                          { id: "last.json.filePath", label: "Previous node JSON file path" },
                        ],
                      }),
                      React.createElement(MetronomeInspectorField, { className: "playground-metronome-firecrawl-fallback-field" },
                        renderMetronomeFieldTitle("Fallback file path"),
                        React.createElement(MetronomeInspectorInput, {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.filePath || config.file_path || "",
                          placeholder: "/workspace/uploads/report.pdf",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("filePath", event.target.value),
                        })
                      )
                    )
                  : null,
                isExtract
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "Source",
`;
