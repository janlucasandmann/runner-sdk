          function renderCurrentDatabaseEditor() {
            if (!draftDatabase) {
              return React.createElement("div", { className: "playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-files-state" }, "Select a database to browse its collections and documents.")
              );
            }
  
            const isDatabaseTemplatePreview = isSelectedDatabaseTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftDatabase);
            const DatabaseJsonEditorComponent = databaseJsonEditorModule?.default || null;
            const collectionLoading = loadingDatabaseCollectionsId === draftDatabase.id;
            const documentsLoading = loadingDatabaseDocumentsKey === (draftDatabase.id + ":" + selectedDatabaseCollectionId);
            const selectedCollection = currentDatabaseCollection;
            const selectedDocument = currentDatabaseDocuments.find((document) => document.id === selectedDatabaseDocumentId) || null;
            const collectionStats = currentDatabaseCollections.reduce((sum, collection) => sum + Number(collection?.documentCount || 0), 0);
  	      const normalizedDatabaseDetailChartTimescale = normalizePlaygroundEnvironmentHomeChartPeriod(databaseDetailChartTimescale);
  	      const activeDatabaseAnalyticsStateKey = buildPlaygroundDatabaseAnalyticsStateKey(
  	        draftDatabase.id,
  	        normalizedDatabaseDetailChartTimescale
  	      );
  	      const activeDatabaseAnalytics = activeDatabaseAnalyticsStateKey
  	        ? databaseAnalyticsById[activeDatabaseAnalyticsStateKey] || null
  	        : null;
            const activeDatabaseAnalyticsSummary = activeDatabaseAnalytics?.summary || null;
  	      const activeDatabaseOperationBuckets = Array.isArray(activeDatabaseAnalytics?.charts?.operations)
  	        ? activeDatabaseAnalytics.charts.operations
  	        : [];
  	      const isDatabaseAnalyticsLoading = loadingDatabaseAnalyticsId === activeDatabaseAnalyticsStateKey;
            const formatDatabaseTelemetryTotal = (value) => new Intl.NumberFormat("en-US").format(Math.max(0, Number(value || 0)) || 0);
            const databaseDetailActivityBuckets = buildPlaygroundEnvironmentHomeActivityBuckets(normalizedDatabaseDetailChartTimescale);
            const readDatabaseDetailOperationTimestampMs = (entry) => {
              const timestamp = Date.parse(String(entry?.bucketStart || entry?.timestamp || entry?.createdAt || entry?.updatedAt || ""));
              return Number.isFinite(timestamp) ? timestamp : null;
            };
            const resolvedDatabaseDetailOperationBuckets = databaseDetailActivityBuckets.map((bucket) => {
              const totals = activeDatabaseOperationBuckets.reduce((next, entry) => {
                const timestampMs = readDatabaseDetailOperationTimestampMs(entry);
                if (!Number.isFinite(timestampMs) || timestampMs < bucket.startMs || timestampMs >= bucket.endMs) {
                  return next;
                }
                return {
                  reads: next.reads + Math.max(0, Number(entry?.reads || 0)),
                  writes: next.writes + Math.max(0, Number(entry?.writes || 0)),
                  deletes: next.deletes + Math.max(0, Number(entry?.deletes || 0)),
                };
              }, { reads: 0, writes: 0, deletes: 0 });
              return {
                ...bucket,
                ...totals,
                total: totals.reads + totals.writes + totals.deletes,
              };
            });
            const resolvedDatabaseAnalyticsSummary = activeDatabaseAnalyticsSummary || {
              totalCollections: currentDatabaseCollections.length,
              totalDocuments: collectionStats,
              reads24h: 0,
              writes24h: 0,
              deletes24h: 0,
            };
            const databaseDetailAnalytics = {
              title: "Database usage",
              ariaLabel: "Database reads and writes over time",
              loading: isDatabaseAnalyticsLoading && !activeDatabaseAnalytics,
              metrics: [
                {
                  id: "collections",
                  value: formatDatabaseTelemetryTotal(resolvedDatabaseAnalyticsSummary.totalCollections ?? currentDatabaseCollections.length),
                  label: "Collections",
                  color: "#7effff",
                },
                {
                  id: "documents",
                  value: formatDatabaseTelemetryTotal(resolvedDatabaseAnalyticsSummary.totalDocuments ?? collectionStats),
                  label: "Documents",
                  color: "rgb(143, 196, 255)",
                },
                {
                  id: "reads",
                  value: formatDatabaseTelemetryTotal(resolvedDatabaseAnalyticsSummary.reads ?? resolvedDatabaseAnalyticsSummary.reads24h ?? 0),
                  label: "Reads",
                  color: "rgb(103, 80, 255)",
                },
                {
                  id: "writes",
                  value: formatDatabaseTelemetryTotal(
                    Number(resolvedDatabaseAnalyticsSummary.writes ?? resolvedDatabaseAnalyticsSummary.writes24h ?? 0)
                      + Number(resolvedDatabaseAnalyticsSummary.deletes ?? resolvedDatabaseAnalyticsSummary.deletes24h ?? 0)
                  ),
                  label: "Writes / Deletes",
                  color: "#f53b3a",
                },
              ],
              labels: resolvedDatabaseDetailOperationBuckets.map((bucket) => bucket?.label || ""),
              series: [
                {
                  id: "database-reads",
                  label: "Reads",
                  color: "rgb(143, 196, 255)",
                  values: resolvedDatabaseDetailOperationBuckets.map((bucket) => Number(bucket?.reads || 0)),
                  type: "line",
                  valueKind: "count",
                },
                {
                  id: "database-writes",
                  label: "Writes",
                  color: "rgb(103, 80, 255)",
                  values: resolvedDatabaseDetailOperationBuckets.map((bucket) =>
                    Number(bucket?.writes || 0) + Number(bucket?.deletes || 0)
                  ),
                  type: "line",
                  valueKind: "count",
                },
              ],
            };
            const documentIsDirty = databaseDocumentEditorState.value !== databaseDocumentEditorState.initialValue;
            const parsedDocumentData = parsePlaygroundDatabaseDocumentObject(databaseDocumentEditorState.value);
            const databaseFieldTypeLabels = {
              string: "String",
              number: "Number",
              boolean: "Boolean",
              null: "Null",
              map: "Map",
              array: "Array",
            };
  
            const renderDatabaseFactRow = (label, control) => React.createElement("div", {
                className: "playground-tasks-detail-fact",
                key: label,
              },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
            );
            const databaseDetailTimescaleControl = React.createElement(PlatformSwitch, {
              className: "playground-database-detail-usage-ranges",
              value: normalizedDatabaseDetailChartTimescale,
              options: [
                { value: "day", label: "24H" },
                { value: "week", label: "7D" },
                { value: "month", label: "30D" },
              ],
              onValueChange: setDatabaseDetailChartTimescale,
              ariaLabel: "Database analytics time frame",
            });
            const canUndoDatabaseDescription = Array.isArray(databaseDescriptionHistory.past) && databaseDescriptionHistory.past.length > 0;
            const canRedoDatabaseDescription = Array.isArray(databaseDescriptionHistory.future) && databaseDescriptionHistory.future.length > 0;
            const renderDatabaseDescriptionToolbarButton = (action) =>
              React.createElement("button", {
                key: action.id,
                type: "button",
                className: "playground-tasks-detail-format-button",
                title: action.label,
                "aria-label": action.label,
                disabled: isDatabaseTemplatePreview || Boolean(action.disabled),
                onMouseDown: (event) => event.preventDefault(),
                onClick: action.onClick || (() => handleDatabaseDescriptionFormat(action.id)),
              }, React.createElement(action.icon, {
                width: 14,
                height: 14,
                strokeWidth: action.strokeWidth || 1.8,
              }));
            const databaseDescriptionFormatActions = React.createElement("div", { className: "playground-tasks-detail-format-actions" },
              renderDatabaseDescriptionToolbarButton({
                id: "undo",
                label: "Undo",
                icon: Undo2,
                disabled: !canUndoDatabaseDescription,
                onClick: handleDatabaseDescriptionUndo,
              }),
              renderDatabaseDescriptionToolbarButton({
                id: "redo",
                label: "Redo",
                icon: Redo2,
                disabled: !canRedoDatabaseDescription,
                onClick: handleDatabaseDescriptionRedo,
              }),
              React.createElement("span", {
                className: "playground-agents-detail-instructions-toolbar-divider",
                "aria-hidden": "true",
              }),
              [
                { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
                { id: "italic", label: "Italic", icon: Italic },
                { id: "underline", label: "Underline", icon: Underline },
              ].map(renderDatabaseDescriptionToolbarButton),
              React.createElement("span", {
                className: "playground-agents-detail-instructions-toolbar-divider",
                "aria-hidden": "true",
              }),
              [
                { id: "list", label: "List", icon: List },
                { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
              ].map(renderDatabaseDescriptionToolbarButton),
              React.createElement("span", {
                className: "playground-agents-detail-instructions-toolbar-divider",
                "aria-hidden": "true",
              }),
              [
                { id: "code", label: "Code", icon: CodeXml },
                { id: "link", label: "Link", icon: Link2 },
              ].map(renderDatabaseDescriptionToolbarButton)
            );
            const databaseDescriptionEditor = React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isDatabaseDescriptionEditing ? " is-editing" : " is-preview") },
              !isDatabaseDescriptionEditing
                ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                    String(draftDatabase.description || "").trim()
                      ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                          content: draftDatabase.description,
                          className: "playground-tasks-detail-description-preview tb-message-markdown",
                        })
                      : React.createElement("div", {
                          className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                        }, "Add Description here")
                  )
                : null,
              React.createElement("textarea", {
                ref: databaseDescriptionTextareaRef,
                className: "playground-tasks-detail-description-input " + (isDatabaseDescriptionEditing ? "is-editing" : "is-preview"),
                rows: 1,
                placeholder: isDatabaseDescriptionEditing ? "Add Description here" : "",
                value: draftDatabase.description || "",
                readOnly: isDatabaseTemplatePreview,
                "aria-readonly": isDatabaseTemplatePreview ? "true" : "false",
                onFocus: () => {
                  if (!isDatabaseTemplatePreview) {
                    setIsDatabaseDescriptionEditing(true);
                  }
                },
                onChange: (event) => {
                  if (isDatabaseTemplatePreview) {
                    return;
                  }
                  updateDatabaseDescriptionValue(event.target.value);
                  resizeEnvironmentDescriptionTextarea(event.currentTarget);
                },
                onBlur: () => {
                  setIsDatabaseDescriptionEditing(false);
                  if (!isDatabaseTemplatePreview && String(draftDatabase.name || "").trim()) {
                    void handleDatabaseSave();
                  }
                },
              })
            );
            const databaseDescriptionSection = React.createElement("div", {
                className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-database-description-section",
                key: "database-description",
              },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                databaseDescriptionFormatActions
              ),
              databaseDescriptionEditor
            );
  
            const databaseDetailsSection = React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-database-detail-usage-header-actions" },
                databaseDetailTimescaleControl
              ),
              React.createElement(PlatformAnalyticsSection, {
                analytics: databaseDetailAnalytics,
                chartType: "line",
                className: "playground-database-detail-usage-analytics",
              }),
              React.createElement("div", { className: "playground-server-detail-fact-rows playground-database-detail-usage-fact-rows" },
                renderDatabaseFactRow("ID",
                  React.createElement("span", {
                    className: "playground-environments-editor-fact-value is-id",
                    title: draftDatabase.id || "Unsaved database",
                  }, draftDatabase.id || "Unsaved database")
                ),
                renderDatabaseFactRow("Provider",
                  React.createElement("span", { className: "playground-environments-editor-fact-value" }, draftDatabase.provider || "firestore")
                ),
                renderDatabaseFactRow("Location",
                  React.createElement("span", { className: "playground-environments-editor-fact-value" }, draftDatabase.location || "eur3")
                ),
                renderDatabaseFactRow("Updated",
                  React.createElement("span", { className: "playground-environments-editor-fact-value" }, formatPlaygroundFileDate(draftDatabase.updatedAt))
                )
              )
            );
  
            function renderDatabaseSelectorRow({
              label,
              count,
              value,
              options,
              placeholder,
              onChange,
              onCreate,
              createLabel,
              createDisabled = false,
            }) {
              return React.createElement("div", { className: "playground-database-browser-selector-row" },
                React.createElement("div", { className: "playground-database-browser-selector-label" },
                  React.createElement("span", null, label),
                  React.createElement("span", { className: "playground-database-browser-selector-count" }, String(count))
                ),
                React.createElement("div", { className: "playground-database-browser-selector-main" },
                  React.createElement("div", { className: "playground-database-browser-select-shell" },
                    React.createElement("select", {
                      className: "playground-database-browser-select",
                      value,
                      onChange,
                      disabled: collectionLoading || documentsLoading || options.length === 0,
                    },
                      React.createElement("option", { value: "" }, placeholder),
                      options.map((option) =>
                        React.createElement("option", { key: option.value, value: option.value }, option.label)
                      )
                    ),
                    React.createElement(ChevronDown, { className: "playground-database-browser-select-chevron", width: 16, height: 16, strokeWidth: 1.9 })
                  ),
                  onCreate
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-database-browser-selector-action",
                        onClick: () => void onCreate(),
                        disabled: createDisabled,
                        title: createLabel,
                        "aria-label": createLabel,
                      }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }))
                    : null
                )
              );
            }
  
            function renderDatabaseFieldValueInput(fieldPath, fieldValue) {
              const valueType = getPlaygroundDatabaseFieldType(fieldValue);
              if (valueType === "boolean") {
                return React.createElement("select", {
                  className: "playground-database-browser-value-select",
                  value: fieldValue ? "true" : "false",
                  disabled: isDatabaseTemplatePreview,
                  onChange: (event) => handleDatabaseFieldValueChange(fieldPath, event.target.value === "true"),
                },
                  React.createElement("option", { value: "true" }, "true"),
                  React.createElement("option", { value: "false" }, "false")
                );
              }
              if (valueType === "null") {
                return React.createElement("div", { className: "playground-database-browser-value-static" }, "null");
              }
              return React.createElement("input", {
                type: "text",
                className: "playground-database-browser-value-input",
                value: valueType === "number" ? String(fieldValue) : String(fieldValue || ""),
                readOnly: isDatabaseTemplatePreview,
                "aria-readonly": isDatabaseTemplatePreview ? "true" : "false",
                onChange: (event) => handleDatabaseFieldValueChange(fieldPath, event.target.value),
                spellCheck: false,
              });
            }
  
            function renderDatabaseFieldRows(containerValue, parentPath = [], depth = 0) {
              const entries = Array.isArray(containerValue)
                ? containerValue.map((item, index) => [String(index), item])
                : Object.entries(isPlaygroundDatabasePlainObject(containerValue) ? containerValue : {});
  
              if (!entries.length) {
                return React.createElement("div", {
                  className: "playground-database-browser-empty-fields",
                  style: { marginLeft: depth > 0 ? String(depth * 18) + "px" : undefined },
                }, "No fields yet.");
              }
  
              return React.createElement("div", { className: "playground-database-browser-field-tree" },
                entries.map(([fieldKey, fieldValue]) => {
                  const fieldPath = [...parentPath, fieldKey];
                  const fieldType = getPlaygroundDatabaseFieldType(fieldValue);
                  const expandable = fieldType === "map" || fieldType === "array";
                  const expanded = databaseFieldExpansionState[getPlaygroundDatabasePathKey(fieldPath)] !== false;
  
                  return React.createElement("div", { key: getPlaygroundDatabasePathKey(fieldPath), className: "playground-database-browser-field-node" },
                    React.createElement("div", {
                        className: "playground-database-browser-field-row",
                        style: { paddingLeft: String(depth * 18) + "px" },
                      },
                      React.createElement("div", { className: "playground-database-browser-field-main" },
                        expandable
                          ? React.createElement("button", {
                              type: "button",
                              className: "playground-database-browser-field-toggle" + (expanded ? " is-expanded" : ""),
                              onClick: () => toggleDatabaseFieldExpansion(fieldPath),
                              "aria-label": expanded ? "Collapse field" : "Expand field",
                            }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                          : React.createElement("span", { className: "playground-database-browser-field-toggle-placeholder" }),
                        React.createElement("span", { className: "playground-database-browser-field-key" }, fieldKey),
                        React.createElement("span", { className: "playground-database-browser-field-separator" }, ":"),
                        expandable
                          ? React.createElement("div", { className: "playground-database-browser-field-group" },
                              React.createElement("span", { className: "playground-database-browser-field-type-pill" }, databaseFieldTypeLabels[fieldType] || fieldType),
                              React.createElement("span", { className: "playground-database-browser-field-preview" }, formatPlaygroundDatabaseFieldPreview(fieldValue))
                            )
                          : React.createElement("div", { className: "playground-database-browser-field-value-shell" },
                              renderDatabaseFieldValueInput(fieldPath, fieldValue)
                            )
                      ),
                      React.createElement("div", { className: "playground-database-browser-field-actions" },
                        fieldType === "map"
                          ? React.createElement("button", {
                              type: "button",
                              className: "playground-database-browser-field-action",
                              onClick: () => openDatabaseFieldComposer(fieldPath),
                              disabled: isDatabaseTemplatePreview,
                              title: "Add nested field",
                              "aria-label": "Add nested field",
                            }, React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.9 }))
                          : null,
                        React.createElement("button", {
                          type: "button",
                          className: "playground-database-browser-field-action is-danger",
                          onClick: () => handleDeleteDatabaseField(fieldPath),
                          disabled: isDatabaseTemplatePreview,
                          title: "Delete field",
                          "aria-label": "Delete field",
                        }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.9 }))
                      )
                    ),
                    expandable && expanded
                      ? React.createElement("div", { className: "playground-database-browser-field-children" },
                          renderDatabaseFieldRows(fieldValue, fieldPath, depth + 1)
                        )
                      : null
                  );
                })
              );
            }
  
            const databaseFieldsContent = databaseDocumentEditorState.error
              ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, databaseDocumentEditorState.error)
              : databaseDocumentEditorState.saveError
                ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, databaseDocumentEditorState.saveError)
                : (databaseDocumentViewMode !== "json" && databaseDocumentEditorState.saveMessage)
                  ? React.createElement("div", { className: "playground-environments-success playground-environments-editor-notice" }, databaseDocumentEditorState.saveMessage)
                  : collectionLoading || documentsLoading || databaseDocumentEditorState.isLoading
                    ? React.createElement("div", { className: "playground-files-state" },
                        React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                      )
                    : !selectedCollection
                      ? React.createElement("div", { className: "playground-files-state" }, "Select a collection to browse its documents.")
                      : !selectedDocument
                        ? React.createElement("div", { className: "playground-files-state" }, "Select a document to inspect its fields.")
                        : databaseDocumentViewMode === "json"
                          ? React.createElement("div", {
                              className: "playground-database-browser-json-editor-shell playground-code-preview-editor-shell",
                              onBlur: (event) => {
                                const nextTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
                                if (nextTarget && event.currentTarget.contains(nextTarget)) {
                                  return;
                                }
                                handleDatabaseJsonEditorBlur();
                              },
                            },
                              DatabaseJsonEditorComponent
                                ? React.createElement(DatabaseJsonEditorComponent, {
                                    path: "database:" + String(draftDatabase.id || "database") + ":" + String(databaseDocumentEditorState.documentId || "document") + ".json",
                                    height: "100%",
                                    language: "json",
                                    theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                                    value: databaseDocumentEditorState.value,
                                    onChange: isDatabaseTemplatePreview ? undefined : handleDatabaseDocumentEditorChange,
                                    beforeMount: ensurePlaygroundCodeEditorTheme,
                                    options: {
                                      automaticLayout: true,
                                      readOnly: isDatabaseTemplatePreview,
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
                                      wordWrap: "on",
                                      padding: {
                                        top: 12,
                                        bottom: 12,
                                      },
                                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                    },
                                  })
                                : !databaseJsonEditorModuleError
                                  ? React.createElement("div", { className: "playground-code-preview-state" },
                                      React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                                      React.createElement("span", null, "Loading editor...")
                                    )
                                  : React.createElement("textarea", {
                                      className: "playground-code-preview-textarea playground-servers-source-editor-textarea",
                                      value: databaseDocumentEditorState.value,
                                      onChange: (event) => handleDatabaseDocumentEditorChange(event.target.value),
                                      readOnly: isDatabaseTemplatePreview,
                                      spellCheck: false,
                                      wrap: "off",
                                    })
                            )
                          : React.createElement("div", { className: "playground-database-browser-fields-body" },
                              parsedDocumentData && Object.keys(parsedDocumentData).length
                                ? renderDatabaseFieldRows(parsedDocumentData, [], 0)
                                : React.createElement("div", { className: "playground-database-browser-empty-fields is-root" },
                                    React.createElement("div", null, "This document does not contain any fields yet."),
                                    React.createElement("button", {
                                      type: "button",
                                      className: "playground-database-browser-add-field",
                                      onClick: () => openDatabaseFieldComposer([]),
                                      disabled: isDatabaseTemplatePreview,
                                    },
                                      React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }),
                                      React.createElement("span", null, "Add Field")
                                    )
                                  )
                            );
            const renderDatabaseBrowserActionMenu = ({ open, onToggle, onDelete, deleteLabel, disabled }) =>
              React.createElement("div", { className: "playground-database-browser-pane-menu-shell" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-database-browser-pane-menu-button",
                  onClick: () => onToggle?.(),
                  disabled,
                  title: "More actions",
                  "aria-label": "More actions",
                }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.9 })),
                open
                  ? React.createElement(PlatformPopupSurface, { className: "playground-database-browser-pane-menu" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-database-browser-pane-menu-item is-danger",
                        onClick: () => void onDelete?.(),
                        disabled,
                      },
                        React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.9 }),
                        React.createElement("span", null, deleteLabel)
                      )
                    )
                  : null
              );
            const renderDatabaseBrowserPaneHeader = ({ title, count, Icon, onCreate, createLabel, createDisabled, actionMenu }) =>
              React.createElement("div", { className: "playground-database-browser-pane-header" },
                React.createElement("div", { className: "playground-database-browser-pane-title-row" },
                  React.createElement("div", { className: "playground-database-browser-pane-title" },
                    Icon
                      ? React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.9 })
                      : null,
                    React.createElement("span", null, title),
                    typeof count === "number"
                      ? React.createElement("span", { className: "playground-database-browser-selector-count" }, String(count))
                      : null
                  ),
                  actionMenu ? renderDatabaseBrowserActionMenu(actionMenu) : null
                ),
                React.createElement("div", { className: "playground-database-browser-pane-action-row" },
                  onCreate
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-database-browser-add-field",
                        onClick: () => void onCreate(),
                        disabled: createDisabled,
                        title: createLabel,
                        "aria-label": createLabel,
                      },
                        React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }),
                        React.createElement("span", null, createLabel)
                      )
                    : null
                )
              );
            const renderDatabaseBrowserEmptyPane = (label) =>
              React.createElement("div", { className: "playground-database-browser-pane-empty" }, label);
            const databaseBrowserSection = React.createElement("div", { className: "playground-tasks-detail-facts playground-environments-editor-facts playground-server-details-card playground-database-browser-surface" },
              React.createElement("div", { className: "playground-database-browser-columns" },
                React.createElement("div", { className: "playground-database-browser-pane playground-database-browser-collections-pane" },
                  renderDatabaseBrowserPaneHeader({
                    title: "Collections",
                    count: currentDatabaseCollections.length,
                    Icon: Layers,
                    onCreate: !isDatabaseTemplatePreview && draftDatabase.id && draftDatabase.id !== PLAYGROUND_DATABASE_DRAFT_ID
                      ? handleCreateDatabaseCollection
                      : null,
                    createLabel: "Add Collection",
                    createDisabled: isDatabaseTemplatePreview || !draftDatabase.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID,
                  }),
                  React.createElement("div", { className: "playground-database-browser-pane-list" },
                    collectionLoading
                      ? React.createElement("div", { className: "playground-files-state" },
                          React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                        )
                      : currentDatabaseCollections.length
                        ? currentDatabaseCollections.map((collection) =>
                            React.createElement("button", {
                                key: collection.id,
                                type: "button",
                                className: "playground-database-browser-pane-row" + (selectedDatabaseCollectionId === collection.id ? " is-active" : ""),
                                onClick: () => {
                                  selectedDatabaseCollectionIdRef.current = collection.id;
                                  setSelectedDatabaseCollectionId(collection.id);
                                  selectedDatabaseDocumentIdRef.current = "";
                                  setSelectedDatabaseDocumentId("");
                                  setDatabaseDocumentViewMode("preview");
                                  setDatabaseDocumentEditorState({
                                    documentId: "",
                                    value: "{}",
                                    initialValue: "{}",
                                    error: "",
                                    saveError: "",
                                    saveMessage: "",
                                    isLoading: false,
                                    isSaving: false,
                                  });
                                },
                                title: collection.name || collection.id || "Collection",
                              },
                              React.createElement("span", { className: "playground-database-browser-pane-row-label" }, collection.name || collection.id || "Collection"),
                              React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.9 })
                            )
                          )
                        : renderDatabaseBrowserEmptyPane("No collections yet.")
                  )
                ),
                React.createElement("div", { className: "playground-database-browser-pane playground-database-browser-documents-pane" },
                  renderDatabaseBrowserPaneHeader({
                    title: "Documents",
                    count: selectedCollection ? Number(selectedCollection.documentCount || currentDatabaseDocuments.length || 0) : currentDatabaseDocuments.length,
                    Icon: FileText,
                    onCreate: !isDatabaseTemplatePreview && draftDatabase.id && draftDatabase.id !== PLAYGROUND_DATABASE_DRAFT_ID && selectedDatabaseCollectionId
                      ? handleCreateDatabaseDocument
                      : null,
                    createLabel: "Add Document",
                    createDisabled: isDatabaseTemplatePreview || !selectedDatabaseCollectionId,
                    actionMenu: {
                      open: databaseCollectionActionsOpen,
                      onToggle: () => setDatabaseCollectionActionsOpen((current) => !current),
                      onDelete: () => handleDeleteDatabaseCollection(selectedDatabaseCollectionId),
                      deleteLabel: "Delete Collection",
                      disabled: isDatabaseTemplatePreview || !selectedDatabaseCollectionId,
                    },
                  }),
                  React.createElement("div", { className: "playground-database-browser-pane-list" },
                    documentsLoading
                      ? React.createElement("div", { className: "playground-files-state" },
                          React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                        )
                      : !selectedCollection
                        ? renderDatabaseBrowserEmptyPane("Select a collection.")
                        : currentDatabaseDocuments.length
                          ? currentDatabaseDocuments.map((document) =>
                              React.createElement("button", {
                                  key: document.id,
                                  type: "button",
                                  className: "playground-database-browser-pane-row" + (selectedDatabaseDocumentId === document.id ? " is-active" : ""),
                                  onClick: () => handleSelectDatabaseDocument(document),
                                  title: document.id || "Document",
                                },
                                React.createElement("span", { className: "playground-database-browser-pane-row-label" }, document.id || "Document"),
                                React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.9 })
                              )
                            )
                          : renderDatabaseBrowserEmptyPane("No documents yet.")
                  )
                ),
                React.createElement("div", { className: "playground-database-browser-pane playground-database-browser-fields-pane" },
                  React.createElement("div", { className: "playground-database-browser-fields-card" },
                    React.createElement("div", { className: "playground-database-browser-fields-header" },
                      React.createElement("div", { className: "playground-database-browser-pane-title-row" },
                        React.createElement("div", { className: "playground-database-browser-pane-title playground-database-browser-fields-title" },
                          React.createElement(Braces, { width: 14, height: 14, strokeWidth: 1.9 }),
                          React.createElement("span", null, selectedDocument?.id || "Document")
                        ),
                        renderDatabaseBrowserActionMenu({
                          open: databaseDocumentActionsOpen,
                          onToggle: () => setDatabaseDocumentActionsOpen((current) => !current),
                          onDelete: () => handleDeleteDatabaseDocument(selectedDatabaseDocumentId),
                          deleteLabel: "Delete Document",
                          disabled: isDatabaseTemplatePreview || !selectedDatabaseDocumentId,
                        })
                      ),
                      React.createElement("div", { className: "playground-database-browser-pane-action-row" },
                        selectedDocument && parsedDocumentData
                          && databaseDocumentViewMode === "preview"
                          ? React.createElement("button", {
                              type: "button",
                              className: "playground-database-browser-add-field",
                              onClick: () => openDatabaseFieldComposer([]),
                              disabled: isDatabaseTemplatePreview,
                            },
                              React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }),
                              React.createElement("span", null, "Add Field")
                            )
                          : null,
                        selectedDocument
                          ? React.createElement("div", { className: "content-mode-switch playground-agents-list-switch playground-database-browser-mode-switch" },
                              React.createElement("button", {
                                type: "button",
                                className: "content-mode-button" + (databaseDocumentViewMode === "preview" ? " is-active" : ""),
                                onClick: () => switchDatabaseDocumentViewMode("preview"),
                              }, "Preview"),
                              React.createElement("button", {
                                type: "button",
                                className: "content-mode-button" + (databaseDocumentViewMode === "json" ? " is-active" : ""),
                                onClick: () => switchDatabaseDocumentViewMode("json"),
                              }, "JSON")
                            )
                          : null
                      )
                    ),
                    databaseFieldsContent
                  )
                )
              )
            );
  
            const databaseCollectionComposerModal = !isDatabaseTemplatePreview && databaseCollectionComposerState.open
              ? React.createElement(PlatformModalBackdrop, {
                  className: "playground-tasks-project-modal-backdrop",
                  onClick: closeDatabaseCollectionComposer,
                },
                  React.createElement(PlatformModalSurface, {
                      as: "form",
                      className: "playground-tasks-project-modal playground-database-browser-modal",
                      onClick: (event) => event.stopPropagation(),
                      onSubmit: handleSubmitDatabaseCollectionComposer,
                    },
                    React.createElement("div", { className: "playground-tasks-project-modal-top" },
                      React.createElement("div", { className: "playground-database-browser-modal-title-row" },
                        React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger" },
                          React.createElement(Database, { width: 16, height: 16, strokeWidth: 1.8 })
                        ),
                        React.createElement("div", { className: "playground-database-browser-modal-title" }, "New Collection")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: closeDatabaseCollectionComposer,
                        title: "Close",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                    ),
                    React.createElement("div", { className: "playground-database-browser-modal-copy" }, "Create a new top-level collection inside this database."),
                    React.createElement("div", { className: "playground-database-browser-modal-grid is-single-column" },
                      React.createElement("label", { className: "playground-tasks-project-modal-field" },
                        React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Collection Name"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-environments-input",
                          value: databaseCollectionComposerState.name,
                          onChange: (event) => setDatabaseCollectionComposerState((current) => ({
                            ...current,
                            name: event.target.value,
                            error: "",
                          })),
                          placeholder: "items",
                          autoFocus: true,
                        })
                      )
                    ),
                    databaseCollectionComposerState.error
                      ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, databaseCollectionComposerState.error)
                      : null,
                    React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: closeDatabaseCollectionComposer,
                        disabled: databaseCollectionComposerState.isSaving,
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "submit",
                        className: "playground-environments-action-button is-primary",
                        disabled: databaseCollectionComposerState.isSaving,
                      }, databaseCollectionComposerState.isSaving ? "Creating..." : "Create")
                    )
                  )
                )
              : null;
  
            const databaseDocumentComposerModal = !isDatabaseTemplatePreview && databaseDocumentComposerState.open
              ? React.createElement(PlatformModalBackdrop, {
                  className: "playground-tasks-project-modal-backdrop",
                  onClick: closeDatabaseDocumentComposer,
                },
                  React.createElement(PlatformModalSurface, {
                      as: "form",
                      className: "playground-tasks-project-modal playground-database-browser-modal",
                      onClick: (event) => event.stopPropagation(),
                      onSubmit: handleSubmitDatabaseDocumentComposer,
                    },
                    React.createElement("div", { className: "playground-tasks-project-modal-top" },
                      React.createElement("div", { className: "playground-database-browser-modal-title-row" },
                        React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger" },
                          React.createElement(FileText, { width: 16, height: 16, strokeWidth: 1.8 })
                        ),
                        React.createElement("div", { className: "playground-database-browser-modal-title" }, "New Document")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: closeDatabaseDocumentComposer,
                        title: "Close",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                    ),
                    React.createElement("div", { className: "playground-database-browser-modal-copy" }, "Create a new document inside the selected collection."),
                    React.createElement("div", { className: "playground-database-browser-modal-grid is-single-column" },
                      React.createElement("label", { className: "playground-tasks-project-modal-field" },
                        React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Document ID"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-environments-input",
                          value: databaseDocumentComposerState.documentId,
                          onChange: (event) => setDatabaseDocumentComposerState((current) => ({
                            ...current,
                            documentId: event.target.value,
                            error: "",
                          })),
                          placeholder: "doc_abc123",
                          autoFocus: true,
                        })
                      )
                    ),
                    databaseDocumentComposerState.error
                      ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, databaseDocumentComposerState.error)
                      : null,
                    React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: closeDatabaseDocumentComposer,
                        disabled: databaseDocumentComposerState.isSaving,
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "submit",
                        className: "playground-environments-action-button is-primary",
                        disabled: databaseDocumentComposerState.isSaving,
                      }, databaseDocumentComposerState.isSaving ? "Creating..." : "Create")
                    )
                  )
                )
              : null;
  
            const databaseFieldComposerModal = !isDatabaseTemplatePreview && databaseFieldComposerState.open
              ? React.createElement(PlatformModalBackdrop, {
                  className: "playground-tasks-project-modal-backdrop",
                  onClick: closeDatabaseFieldComposer,
                },
                  React.createElement(PlatformModalSurface, {
                      as: "form",
                      className: "playground-tasks-project-modal playground-database-browser-modal",
                      onClick: (event) => event.stopPropagation(),
                      onSubmit: handleSubmitDatabaseFieldComposer,
                    },
                    React.createElement("div", { className: "playground-tasks-project-modal-top" },
                      React.createElement("div", { className: "playground-database-browser-modal-title-row" },
                        React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger" },
                          React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 })
                        ),
                        React.createElement("div", { className: "playground-database-browser-modal-title" }, "Add Field")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: closeDatabaseFieldComposer,
                        title: "Close",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                    ),
                    React.createElement("div", { className: "playground-database-browser-modal-copy" }, "Create a new field on this document or nested object."),
                    React.createElement("div", { className: "playground-database-browser-modal-grid" },
                      React.createElement("label", { className: "playground-tasks-project-modal-field" },
                        React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Field"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-environments-input",
                          value: databaseFieldComposerState.key,
                          onChange: (event) => setDatabaseFieldComposerState((current) => ({
                            ...current,
                            key: event.target.value,
                            error: "",
                          })),
                          placeholder: "title",
                          autoFocus: true,
                        })
                      ),
                      React.createElement("label", { className: "playground-tasks-project-modal-field" },
                        React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Type"),
                        React.createElement("div", { className: "playground-database-browser-modal-select-shell" },
                          React.createElement("select", {
                            className: "playground-environments-select playground-database-browser-value-select",
                            value: databaseFieldComposerState.type,
                            onChange: (event) => setDatabaseFieldComposerState((current) => ({
                              ...current,
                              type: event.target.value,
                              value: ["map", "array", "null"].includes(event.target.value) ? "" : current.value,
                              error: "",
                            })),
                          },
                            ["string", "number", "boolean", "null", "map", "array"].map((type) =>
                              React.createElement("option", { key: type, value: type }, databaseFieldTypeLabels[type])
                            )
                          ),
                          React.createElement(ChevronDown, { className: "playground-database-browser-select-chevron", width: 16, height: 16, strokeWidth: 1.9 })
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-project-modal-field playground-database-browser-modal-field--full playground-database-browser-modal-value-row" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Value"),
                      databaseFieldComposerState.type === "boolean"
                        ? React.createElement("select", {
                            className: "playground-environments-select playground-database-browser-value-select",
                            value: databaseFieldComposerState.value === "true" ? "true" : "false",
                            onChange: (event) => setDatabaseFieldComposerState((current) => ({
                              ...current,
                              value: event.target.value,
                              error: "",
                            })),
                          },
                            React.createElement("option", { value: "true" }, "true"),
                            React.createElement("option", { value: "false" }, "false")
                          )
                        : databaseFieldComposerState.type === "map"
                          ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates an empty nested object.")
                          : databaseFieldComposerState.type === "array"
                            ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates an empty array.")
                            : databaseFieldComposerState.type === "null"
                              ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates a null value.")
                              : React.createElement("input", {
                                  type: "text",
                                  className: "playground-environments-input playground-database-browser-modal-value-input",
                                  value: databaseFieldComposerState.value,
                                  onChange: (event) => setDatabaseFieldComposerState((current) => ({
                                    ...current,
                                    value: event.target.value,
                                    error: "",
                                  })),
                                  placeholder: databaseFieldComposerState.type === "number" ? "42" : "Value",
                                })
                    ),
                    databaseFieldComposerState.error
                      ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, databaseFieldComposerState.error)
                      : null,
                    React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: closeDatabaseFieldComposer,
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "submit",
                        className: "playground-environments-action-button is-primary",
                      }, "Add")
                    )
                  )
                )
  	            : null;
  	          const databaseDangerSection = isDatabaseTemplatePreview ? null : React.createElement("section", { className: "playground-server-danger-section playground-database-danger-section playground-server-details-card" },
  	            React.createElement("div", { className: "playground-server-danger-copy-row" },
  	              React.createElement("span", { className: "playground-server-danger-icon", "aria-hidden": "true" },
  	                React.createElement(AlertCircle, { width: 15, height: 15, strokeWidth: 2 })
  	              ),
  	              React.createElement("div", { className: "playground-server-danger-copy" },
  	                React.createElement("div", { className: "playground-server-danger-title" }, "Delete this database"),
  	                React.createElement("div", { className: "playground-server-danger-text" },
  	                  "Make sure you have copied anything you need before deleting this database and its documents."
  	                )
  	              )
  	            ),
  	            React.createElement("button", {
  	              type: "button",
  	              className: "playground-server-danger-delete-button",
  	              onClick: () => void handleDeleteDatabase(draftDatabase.id),
  	              disabled: databaseSaveState.isSaving
  	                || !draftDatabase.id
  	                || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID,
  	            }, "Delete database")
  	          );
  	          const normalizedDatabaseDetailTab = ["data", "usage", "settings"].includes(databaseDetailTab) ? databaseDetailTab : "data";
  	          const databaseDetailTabPanelId = "playground-database-detail-tab-panel";
  	          const databaseDetailTabs = React.createElement(PlatformDetailTabBar, {
  	            tabs: [
  	              { id: "data", label: "Data", icon: Database },
  	              { id: "usage", label: "Usage", icon: ChartColumnIncreasing },
  	              { id: "settings", label: "Settings", icon: Settings },
  	            ],
  	            value: normalizedDatabaseDetailTab,
  	            onValueChange: setDatabaseDetailTab,
  	            ariaLabel: "Database sections",
  	            panelId: databaseDetailTabPanelId,
  	            showDivider: true,
  	            className: "playground-database-detail-tabs",
  	          });
  	          const databaseApiBaseUrl = "https://api.computer-agents.com/v1";
  	          const databaseApiResourceUrl = databaseApiBaseUrl + "/databases/" + encodeURIComponent(draftDatabase.id || "database_id") + "/collections";
  	          const databaseQuickstartSnippets = {
  	            javascript: [
  	              "const response = await fetch('" + databaseApiResourceUrl + "', {",
  	              "  headers: { 'X-API-Key': process.env.COMPUTER_AGENTS_API_KEY },",
  	              "});",
  	              "",
  	              "const { data: collections } = await response.json();",
  	              "console.log(collections);",
  	            ],
  	            python: [
  	              "import os",
  	              "import requests",
  	              "",
  	              "response = requests.get(",
  	              "    '" + databaseApiResourceUrl + "',",
  	              "    headers={'X-API-Key': os.environ['COMPUTER_AGENTS_API_KEY']},",
  	              ")",
  	              "",
  	              "collections = response.json()['data']",
  	              "print(collections)",
  	            ],
  	          };
  	          const activeDatabaseQuickstartLanguage = databaseQuickstartSnippets[databaseQuickstartLanguage]
  	            ? databaseQuickstartLanguage
  	            : "javascript";
  	          const databaseQuickstartCode = databaseQuickstartSnippets[activeDatabaseQuickstartLanguage].join("\n");
  	          const databaseApiQuickstartSection = React.createElement(PlatformCodePreviewBox, {
  	            title: "Database API",
  	            description: "Read collections and documents from this database with the Computer Agents API.",
  	            action: {
  	              label: "API reference",
  	              onClick: () => window.open("http://localhost:3001/developers", "_blank", "noopener,noreferrer"),
  	            },
  	            languages: [
  	              { value: "javascript", label: "javascript", editorLanguage: "javascript" },
  	              { value: "python", label: "python", editorLanguage: "python" },
  	            ],
  	            language: activeDatabaseQuickstartLanguage,
  	            onLanguageChange: setDatabaseQuickstartLanguage,
  	            code: databaseQuickstartCode,
  	            mode: "editor",
  	            codePath: "database-api-quickstart-" + String(draftDatabase.id || "database") + "."
  	              + (activeDatabaseQuickstartLanguage === "python" ? "py" : "js"),
  	            codeHeight: "220px",
  	            copyLabel: "Copy database API code",
  	            editorTheme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
  	            editorBeforeMount: ensurePlaygroundCodeEditorTheme,
  	            className: "playground-database-api-quickstart-card",
  	          });
  	          const databaseUsageTabContent = React.createElement(React.Fragment, null,
  	            databaseDetailsSection,
  	            databaseApiQuickstartSection
  	          );
  	          const databaseStorageLocation = String(draftDatabase.location || "eur3").trim() || "eur3";
  	          const databaseDataTabContent = React.createElement("div", { className: "playground-database-browser-tab-body" },
  	            databaseBrowserSection,
  	            React.createElement("div", { className: "playground-database-storage-location-note" },
  	              React.createElement(MapPin, { width: 13, height: 13, strokeWidth: 1.8 }),
  	              "Data is stored in Location ",
  	              React.createElement("strong", null, databaseStorageLocation),
  	              "."
  	            )
  	          );
  	          const databaseSharedTeamIds = getDatabaseSharedTeamIds(draftDatabase);
  	          const databaseSharedTeamIdSet = new Set(databaseSharedTeamIds);
  	          const databaseWorkspaceTeamById = new Map(
  	            normalizedEnvironmentWorkspaceTeams.map((team) => [team.id, team])
  	          );
  	          const databaseOwnerIdentity = getDatabaseOwnerIdentity(draftDatabase);
  	          const isCurrentDatabaseOwner = isCurrentUserDatabaseOwner(draftDatabase);
  	          const databaseOwnerIdentityKey = getDatabaseOwnerIdentityKey(databaseOwnerIdentity);
  	          const databaseOwnerCandidatesByKey = new Map();
  	          databaseSharedTeamIds.forEach((teamId) => {
  	            const team = databaseWorkspaceTeamById.get(teamId) || { id: teamId, name: "Team" };
  	            const members = Array.isArray(databaseOwnerTeamMembersById[teamId])
  	              ? databaseOwnerTeamMembersById[teamId]
  	              : [];
  	            members.filter(isHumanDatabaseOwnerCandidate).forEach((member) => {
  	              const identity = normalizeDatabaseOwnerIdentity(member);
  	              const identityKey = getDatabaseOwnerIdentityKey(identity);
  	              if (!identityKey) return;
  	              const existing = databaseOwnerCandidatesByKey.get(identityKey);
  	              const teamNames = Array.from(new Set([
  	                ...(Array.isArray(existing?.teamNames) ? existing.teamNames : []),
  	                String(team.name || "Team").trim(),
  	              ].filter(Boolean)));
  	              databaseOwnerCandidatesByKey.set(identityKey, {
  	                ...(existing || {}),
  	                ...identity,
  	                teamNames,
  	              });
  	            });
  	          });
  	          const databaseOwnerCandidates = Array.from(databaseOwnerCandidatesByKey.values()).sort((left, right) => (
  	            String(left?.name || left?.email || "").localeCompare(String(right?.name || right?.email || ""), undefined, {
  	              numeric: true,
  	              sensitivity: "base",
  	            })
  	          ));
  	          const databaseOwnerMissingTeamIds = databaseSharedTeamIds.filter((teamId) => (
  	            !Object.prototype.hasOwnProperty.call(databaseOwnerTeamMembersById, teamId)
  	          ));
  	          const databasePermissionTeams = [
  	            {
  	              id: "all_agents",
  	              name: "All Agents",
  	              meta: "Always included",
  	              permission: "Database default",
  	              createdAt: "",
  	              locked: true,
  	            },
  	            ...databaseSharedTeamIds.map((teamId) => {
  	              const team = databaseWorkspaceTeamById.get(teamId) || { id: teamId, name: "Team" };
  	              return {
  	                ...team,
  	                id: teamId,
  	                name: team.name || "Untitled team",
  	                meta: team.memberCount ? String(team.memberCount) + " members" : "Team workspace",
  	                permission: "Database permissions",
  	                createdAt: team.createdAt || "",
  	                locked: false,
  	              };
  	            }),
  	          ];
  	          const normalizedDatabaseAccessSortDirection = databaseAccessSortDirection === "desc" ? "desc" : "asc";
  	          const normalizedDatabaseAccessSearchQuery = String(databaseAccessSearchQuery || "").trim().toLowerCase();
  	          const getDatabaseAccessSortValue = (team, sortKey) => {
  	            if (sortKey === "policy") return String(team?.permission || "");
  	            if (sortKey === "created") {
  	              const timestamp = Date.parse(String(team?.createdAt || ""));
  	              return Number.isFinite(timestamp) ? timestamp : 0;
  	            }
  	            return String(team?.name || "");
  	          };
  	          const visibleDatabasePermissionTeams = databasePermissionTeams.filter((team) => {
  	            if (databaseAccessFilter === "teams" && team.locked) return false;
  	            if (databaseAccessFilter === "default" && !team.locked) return false;
  	            if (!normalizedDatabaseAccessSearchQuery) return true;
  	            return [team.name, team.permission, team.meta]
  	              .some((value) => String(value || "").toLowerCase().includes(normalizedDatabaseAccessSearchQuery));
  	          }).sort((left, right) => {
  	            const leftValue = getDatabaseAccessSortValue(left, databaseAccessSort);
  	            const rightValue = getDatabaseAccessSortValue(right, databaseAccessSort);
  	            let comparison = 0;
  	            if (typeof leftValue === "number" || typeof rightValue === "number") {
  	              comparison = Number(leftValue || 0) - Number(rightValue || 0);
  	            } else {
  	              comparison = String(leftValue || "").localeCompare(String(rightValue || ""), undefined, {
  	                numeric: true,
  	                sensitivity: "base",
  	              });
  	            }
  	            if (!comparison) {
  	              comparison = String(left?.name || "").localeCompare(String(right?.name || ""), undefined, {
  	                numeric: true,
  	                sensitivity: "base",
  	              });
  	            }
  	            return normalizedDatabaseAccessSortDirection === "desc" ? -comparison : comparison;
  	          });
  	          const databaseAddableTeams = availableEnvironmentShareTeams.filter((team) => !databaseSharedTeamIdSet.has(team.id));
  	          const selectedDatabasePermissionTeam = databasePermissionTeams.find((team) =>
  	            String(team.id) === String(databasePermissionTeamId || "")
  	          ) || null;
  	          const canManageDatabaseTeamAccess = Boolean(
  	            !isDatabaseTemplatePreview
  	            && draftDatabase.id
  	            && draftDatabase.id !== PLAYGROUND_DATABASE_DRAFT_ID
  	          );
  	          const databaseAccessFilterOptions = [
  	            { id: "all", label: "All access", description: "Show default and team access" },
  	            { id: "teams", label: "Teams", description: "Only show team access grants" },
  	            { id: "default", label: "Default access", description: "Only show the database default" },
  	          ];
  	          const formatDatabaseTeamCreatedDate = (value) => {
  	            if (!value) return "";
  	            try {
  	              return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
  	            } catch {
  	              return String(value || "");
  	            }
  	          };
  	          const renderAddDatabaseTeamsMenu = () => {
  	            if (databaseTeamMenuId !== "add-teams") {
  	              return null;
  	            }
  	            return React.createElement(PlatformPopupSurface, {
  	                className: "playground-tasks-toolbar-popup-menu playground-project-teams-add-menu playground-tasks-toolbar-popup-menu-animate-down-in",
  	                onClick: (event) => event.stopPropagation(),
  	              },
  	              databaseAddableTeams.length
  	                ? databaseAddableTeams.map((team) =>
  	                    React.createElement("button", {
  	                      key: team.id,
  	                      type: "button",
  	                      className: "tb-popup-row playground-project-team-menu-item",
  	                      disabled: databaseSaveState.isSaving || Boolean(databaseTeamAccessState.action),
  	                      onClick: () => void handleAddDatabaseTeamAccess(team),
  	                    },
  	                      React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.8 }),
  	                      React.createElement("span", null, team.name || "Untitled team")
  	                    )
  	                  )
  	                : React.createElement("button", {
  	                    type: "button",
  	                    className: "tb-popup-row playground-project-team-menu-item",
  	                    disabled: true,
  	                  }, workspaceTeamsLoading
  	                    ? "Loading teams..."
  	                    : workspaceTeamsRequiresPlan
  	                      ? "Teams require a team plan"
  	                      : "All teams already have access")
  	            );
  	          };
  	          const databaseOwnerLabel = String(databaseOwnerIdentity.name || databaseOwnerIdentity.email || "Owner").trim();
  	          const databaseOwnerDetail = databaseOwnerIdentity.email
  	            && databaseOwnerLabel.toLowerCase() !== databaseOwnerIdentity.email.toLowerCase()
  	              ? databaseOwnerIdentity.email
  	              : "";
  	          const databaseOwnerSelectorRow = React.createElement("div", {
  	              className: "playground-database-access-owner-row",
  	            },
  	            React.createElement("span", { className: "playground-database-access-owner-label" }, "Owner"),
  	            renderPlaygroundPlatformPopup({
  	              open: databaseOwnerPopoverOpen,
  	              shellRef: databaseOwnerPopoverRef,
  	              shellClassName: "playground-database-owner-popup-shell",
  	              menuClassName: "playground-database-owner-menu playground-agents-detail-owner-menu",
  	              trigger: React.createElement("button", {
  	                  type: "button",
  	                  className: "playground-database-owner-trigger",
  	                  disabled: !canManageDatabaseTeamAccess || !isCurrentDatabaseOwner || databaseSaveState.isSaving,
  	                  onClick: () => setDatabaseOwnerPopoverOpen((current) => !current),
  	                  "aria-label": "Choose database owner",
  	                  "aria-expanded": databaseOwnerPopoverOpen ? "true" : "false",
  	                  title: !isCurrentDatabaseOwner
  	                    ? "Only the current owner can transfer database ownership."
  	                    : (databaseOwnerDetail ? databaseOwnerLabel + " · " + databaseOwnerDetail : databaseOwnerLabel),
  	                },
  	                React.createElement("span", { className: "playground-team-member-cell" },
  	                  React.createElement(AccountAvatar, {
  	                    className: "playground-team-member-avatar",
  	                    imageClassName: "playground-team-member-avatar-image",
  	                    fallbackLabel: getAccountInitials(databaseOwnerLabel),
  	                    photoUrl: databaseOwnerIdentity.avatarUrl || "",
  	                  }),
  	                  React.createElement("span", { className: "playground-team-member-copy" },
  	                    React.createElement("span", { className: "playground-team-table-title" }, databaseOwnerLabel)
  	                  )
  	                ),
  	                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
  	              ),
  	              menuProps: {
  	                role: "menu",
  	                onClick: (event) => event.stopPropagation(),
  	              },
  	              children: databaseSharedTeamIds.length === 0
  	                ? React.createElement("div", { className: "playground-agents-detail-owner-menu-empty" },
  	                    "Grant a team access before choosing an owner."
  	                  )
  	                : databaseOwnerMissingTeamIds.length > 0
  	                  ? React.createElement("div", { className: "playground-agents-detail-owner-menu-empty" }, "Loading team members...")
  	                  : databaseOwnerCandidates.length > 0
  	                    ? databaseOwnerCandidates.map((candidate) => {
  	                        const candidateKey = getDatabaseOwnerIdentityKey(candidate);
  	                        const isSelected = candidateKey === databaseOwnerIdentityKey;
  	                        const candidateLabel = String(candidate.name || candidate.email || "Team member").trim();
  	                        const candidateDetail = candidate.email && candidateLabel.toLowerCase() !== candidate.email.toLowerCase()
  	                          ? candidate.email
  	                          : (Array.isArray(candidate.teamNames) ? candidate.teamNames.join(", ") : "");
  	                        return React.createElement("button", {
  	                            key: candidateKey,
  	                            type: "button",
  	                            className: "tb-popup-row playground-agents-detail-owner-option" + (isSelected ? " is-selected" : ""),
  	                            role: "menuitem",
  	                            onClick: () => {
  	                              if (isSelected) {
  	                                setDatabaseOwnerPopoverOpen(false);
  	                                return;
  	                              }
  	                              openDatabaseOwnerTransferModal(candidate);
  	                            },
  	                          },
  	                          React.createElement(AccountAvatar, {
  	                            className: "playground-agents-detail-owner-option-avatar",
  	                            imageClassName: "playground-agents-detail-owner-option-avatar-image",
  	                            fallbackLabel: getAccountInitials(candidateLabel),
  	                            photoUrl: candidate.avatarUrl || "",
  	                          }),
  	                          React.createElement("span", { className: "playground-agents-detail-owner-option-copy" },
  	                            React.createElement("span", null, candidateLabel),
  	                            candidateDetail ? React.createElement("span", null, candidateDetail) : null
  	                          ),
  	                          isSelected ? React.createElement(Check, { width: 13, height: 13, strokeWidth: 1.8 }) : null
  	                        );
  	                      })
  	                    : React.createElement("div", { className: "playground-agents-detail-owner-menu-empty" },
  	                        "No human team members are available."
  	                      ),
  	            })
  	          );
  	          const databaseOwnerTransferTargetLabel = String(
  	            databaseOwnerTransferTarget?.name || databaseOwnerTransferTarget?.email || "New owner"
  	          ).trim();
  	          const databaseOwnerTransferModalContent = databaseOwnerTransferTarget
  	            ? renderPlaygroundPlatformModal({
  	                open: true,
  	                visible: databaseOwnerTransferModalVisible,
  	                closing: databaseOwnerTransferModalClosing,
  	                onClose: () => closeDatabaseOwnerTransferModal(),
  	                as: "form",
  	                backdropClassName: "playground-tasks-project-issue-backdrop playground-database-owner-transfer-backdrop",
  	                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-database-owner-transfer-modal",
  	                ariaLabel: "Transfer database ownership",
  	                surfaceProps: {
  	                  onSubmit: (event) => {
  	                    event.preventDefault();
  	                    void handleDatabaseOwnerTransferConfirm();
  	                  },
  	                },
  	                children: React.createElement(React.Fragment, null,
  	                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
  	                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
  	                      React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
  	                        React.createElement(Shield, { width: 17, height: 17, strokeWidth: 1.8 })
  	                      ),
  	                      React.createElement("div", {
  	                        className: "playground-content-title playground-tasks-project-modal-name-input",
  	                      }, "Transfer Database Ownership")
  	                    ),
  	                    React.createElement("button", {
  	                      type: "button",
  	                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
  	                      onClick: () => closeDatabaseOwnerTransferModal(),
  	                      disabled: databaseSaveState.isSaving,
  	                      title: "Close",
  	                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
  	                  ),
  	                  React.createElement("div", { className: "playground-database-owner-transfer-copy" },
  	                    React.createElement("div", { className: "playground-database-owner-transfer-person" },
  	                      React.createElement(AccountAvatar, {
  	                        className: "playground-team-member-avatar",
  	                        imageClassName: "playground-team-member-avatar-image",
  	                        fallbackLabel: getAccountInitials(databaseOwnerTransferTargetLabel),
  	                        photoUrl: databaseOwnerTransferTarget.avatarUrl || "",
  	                      }),
  	                      React.createElement("div", { className: "playground-database-owner-transfer-person-copy" },
  	                        React.createElement("span", { className: "playground-database-owner-transfer-person-name" }, databaseOwnerTransferTargetLabel),
  	                        databaseOwnerTransferTarget.email
  	                          ? React.createElement("span", { className: "playground-database-owner-transfer-person-email" }, databaseOwnerTransferTarget.email)
  	                          : null
  	                      )
  	                    ),
  	                    React.createElement("p", { className: "playground-database-owner-transfer-warning" },
  	                      "This transfers ownership immediately. The new owner will be able to transfer ownership again. "
  	                        + "You will keep only the privileges granted through your team access and will no longer be able to change the owner."
  	                    )
  	                  ),
  	                  databaseSaveState.error
  	                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, databaseSaveState.error)
  	                    : null,
  	                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
  	                    React.createElement("button", {
  	                      type: "button",
  	                      className: "playground-environments-action-button",
  	                      onClick: () => closeDatabaseOwnerTransferModal(),
  	                      disabled: databaseSaveState.isSaving,
  	                    }, "Cancel"),
  	                    React.createElement(PlatformPrimaryButton, {
  	                      size: "medium",
  	                      type: "submit",
  	                      className: "playground-environments-action-button is-primary",
  	                      disabled: databaseSaveState.isSaving,
  	                    }, databaseSaveState.isSaving ? "Transferring..." : "Transfer Owner")
  	                  )
  	                ),
  	              })
  	            : null;
  	          const databaseOwnerTransferModal = databaseOwnerTransferModalContent
  	            && typeof createPortal === "function"
  	            && typeof document !== "undefined"
  	            && document.body
  	              ? createPortal(databaseOwnerTransferModalContent, document.body)
  	              : databaseOwnerTransferModalContent;
  	          const databaseAddTeamsControl = canManageDatabaseTeamAccess
  	            ? React.createElement("div", {
  	                className: "playground-tasks-toolbar-popup-shell playground-project-teams-add-shell playground-database-team-menu-scope" + (databaseTeamMenuId === "add-teams" ? " is-open" : ""),
  	              },
  	              React.createElement("button", {
  	                type: "button",
  	                className: "playground-files-control-button playground-project-teams-add-button",
  	                disabled: workspaceTeamsLoading || databaseSaveState.isSaving || Boolean(databaseTeamAccessState.action),
  	                onClick: (event) => {
  	                  event.stopPropagation();
  	                  if (typeof onWorkspaceTeamsRequest === "function" && !workspaceTeamsLoading) onWorkspaceTeamsRequest({});
  	                  setDatabaseTeamMenuId((current) => current === "add-teams" ? "" : "add-teams");
  	                },
  	              },
  	                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
  	                React.createElement("span", null, "Add Teams")
  	              ),
  	              renderAddDatabaseTeamsMenu()
  	            )
  	            : null;
  	          const databaseAccessColumns = [
  	            {
  	              id: "name",
  	              header: "Team",
  	              accessor: (team) => team.name || "Untitled team",
  	              sortable: true,
  	              width: "minmax(220px, 1.45fr)",
  	              cell: ({ row: team }) => React.createElement("div", { className: "playground-agents-overview-name-cell" },
  	                React.createElement("div", { className: "playground-agents-overview-name-copy" },
  	                  React.createElement("div", { className: "playground-agents-overview-name-title" }, team.name)
  	                )
  	              ),
  	            },
  	            {
  	              id: "policy",
  	              header: "Policy",
  	              accessor: (team) => team.permission || "",
  	              sortable: true,
  	              width: "minmax(150px, 0.9fr)",
  	              cell: ({ row: team }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, team.permission),
  	            },
  	            {
  	              id: "created",
  	              header: "Created",
  	              accessor: (team) => Date.parse(String(team.createdAt || "")) || 0,
  	              sortable: true,
  	              sortDescFirst: true,
  	              width: "minmax(120px, 0.7fr)",
  	              align: "end",
  	              cell: ({ row: team }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, team.locked ? "Default" : (formatDatabaseTeamCreatedDate(team.createdAt) || "—")),
  	            },
  	          ];
  	          const databaseTeamAccessPlatformSection = React.createElement("section", {
  	              className: "playground-project-settings-access-section playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-database-access-table-section",
  	            },
  	            React.createElement(PlatformDataTable, {
  	              rows: visibleDatabasePermissionTeams,
  	              columns: databaseAccessColumns,
  	              getRowId: (team) => String(team.id || ""),
  	              ariaLabel: "Database team access",
  	              className: "playground-database-access-platform-data-table",
  	              sorting: {
  	                value: { id: databaseAccessSort, direction: normalizedDatabaseAccessSortDirection },
  	                manual: true,
  	                onChange: (next) => {
  	                  if (!next) return;
  	                  setDatabaseAccessSort(next.id);
  	                  setDatabaseAccessSortDirection(next.direction);
  	                },
  	              },
  	              selection: {
  	                enabled: true,
  	                value: selectedDatabaseAccessTeamIds,
  	                isRowSelectable: (team) => !team.locked,
  	                ariaLabel: (team) => team.locked ? "All Agents is always included" : "Select " + team.name,
  	                onChange: ({ selectedIds }) => setSelectedDatabaseAccessTeamIds(new Set(selectedIds)),
  	              },
  	              toolbar: {
  	                search: {
  	                  value: databaseAccessSearchQuery,
  	                  onChange: setDatabaseAccessSearchQuery,
  	                  placeholder: "Search teams",
  	                  manual: true,
  	                },
  	                filters: [{
  	                  id: "database-access-kind",
  	                  label: "Filter",
  	                  value: databaseAccessFilter,
  	                  onChange: setDatabaseAccessFilter,
  	                  options: databaseAccessFilterOptions,
  	                }],
  	                showSort: true,
  	                trailing: databaseAddTeamsControl,
  	              },
  	              onRowActivate: (team) => {
  	                setDatabaseTeamMenuId("");
  	                setDatabasePermissionRoleId("member");
  	                setDatabasePermissionTeamId(team.id);
  	              },
  	              getRowActions: (team) => team.locked
  	                ? []
  	                : [
  	                    ...(typeof onOpenTeamPage === "function" ? [{
  	                      id: "view-team",
  	                      label: "View team",
  	                      icon: ExternalLink,
  	                      onSelect: () => onOpenTeamPage(team.id),
  	                    }] : []),
  	                    {
  	                      id: "remove",
  	                      label: "Remove team access",
  	                      icon: Trash2,
  	                      danger: true,
  	                      disabled: databaseSaveState.isSaving || Boolean(databaseTeamAccessState.action),
  	                      onSelect: ({ rows }) => {
  	                        const targets = rows.filter((row) => !row.locked);
  	                        if (targets.length > 1) void handleRemoveDatabaseTeamAccessBulk(targets);
  	                        else if (targets[0]) void handleRemoveDatabaseTeamAccess(targets[0]);
  	                      },
  	                    },
  	                  ],
  	              error: databaseTeamAccessState.error || null,
  	              emptyState: normalizedDatabaseAccessSearchQuery || databaseAccessFilter !== "all"
  	                ? "No matching team access found."
  	                : "No team access configured.",
  	              noResultsState: "No matching team access found.",
  	            })
  	          );
  	          const databaseSettingsOverviewContent = React.createElement("section", {
  	              className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-teams-section playground-project-settings-root playground-database-settings-root",
  	            },
  	            databaseDescriptionSection,
  	            React.createElement("div", { className: "playground-database-access-section-group" },
  	              React.createElement("div", { className: "playground-database-access-section-header" },
  	                React.createElement("h2", { className: "playground-project-teams-table-title playground-database-access-section-title" }, "Manage Database Access"),
  	                databaseOwnerSelectorRow
  	              ),
  	              databaseTeamAccessPlatformSection
  	            ),
  	            databaseDangerSection,
  	            databaseOwnerTransferModal
  	          );
  	          const selectedDatabaseRoleDefinition = getPlaygroundTeamRoleDefinition(databasePermissionRoleId);
  	          const selectedDatabaseRolePermissionSet = selectedDatabasePermissionTeam && selectedDatabasePermissionTeam.id !== "all_agents"
  	            ? getDatabaseTeamRolePermissionSet(draftDatabase, selectedDatabasePermissionTeam.id, selectedDatabaseRoleDefinition.id)
  	            : null;
  	          const databaseTeamRolePages = selectedDatabasePermissionTeam && selectedDatabasePermissionTeam.id !== "all_agents"
  	            ? React.createElement(PlatformRolePermissionsPage, {
  	                roles: PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
  	                  id: role.id,
  	                  label: role.label,
  	                  description: role.description,
  	                  meta: "Database access",
  	                })),
  	                value: selectedDatabaseRoleDefinition.id,
  	                onValueChange: setDatabasePermissionRoleId,
  	                roleAriaLabel: "Database team roles",
  	                roleKicker: "Database role",
  	                roleDescription: "Database-scoped permissions for "
  	                  + selectedDatabaseRoleDefinition.label.toLowerCase() + "s in "
  	                  + (selectedDatabasePermissionTeam.name || "this team") + ".",
  	                readOnly: selectedDatabaseRoleDefinition.id === "owner",
  	                className: "playground-project-team-role-pages playground-database-team-role-pages",
  	                roleListClassName: "playground-project-team-role-list",
  	                permissionPageClassName: "playground-project-team-role-permission-page",
  	                permissionHeaderClassName: "playground-project-team-role-permission-header",
  	                permissionSet: selectedDatabaseRolePermissionSet,
  	                accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
  	                ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
  	                actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
  	                subjectType: "database",
  	                animationKey: databasePermissionChartAnimationKey,
  	                disabled: isDatabaseTemplatePreview,
  	                onRingAccessChange: (ringId, nextAccess) => updateDatabaseTeamRolePermissionRingAccess(
  	                  selectedDatabasePermissionTeam.id,
  	                  selectedDatabaseRoleDefinition.id,
  	                  ringId,
  	                  nextAccess
  	                ),
  	                onActionRingChange: (actionId, nextRingId) => updateDatabaseTeamRolePermissionActionRing(
  	                  selectedDatabasePermissionTeam.id,
  	                  selectedDatabaseRoleDefinition.id,
  	                  actionId,
  	                  nextRingId
  	                ),
  	                onActionAccessChange: (actionId, nextAccess) => updateDatabaseTeamRolePermissionActionAccess(
  	                  selectedDatabasePermissionTeam.id,
  	                  selectedDatabaseRoleDefinition.id,
  	                  actionId,
  	                  nextAccess
  	                ),
  	              })
  	            : null;
  	          const databaseSettingsPermissionContent = selectedDatabasePermissionTeam
  	            ? React.createElement("section", {
  	                className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-permissions-section playground-project-teams-section playground-database-permissions-section",
  	              },
  	              React.createElement("div", { className: "playground-project-team-permissions-header" },
  	                React.createElement("button", {
  	                  type: "button",
  	                  className: "playground-project-team-permissions-back",
  	                  onClick: () => setDatabasePermissionTeamId(""),
  	                },
  	                  React.createElement(ArrowLeft, { width: 13, height: 13, strokeWidth: 1.9 }),
  	                  React.createElement("span", null, "Settings")
  	                ),
  	                React.createElement("div", { className: "playground-project-team-permissions-title" },
  	                  selectedDatabasePermissionTeam.id === "all_agents"
  	                    ? "All Agents Permissions"
  	                    : (selectedDatabasePermissionTeam.name || "Team") + " Database Access"
  	                )
  	              ),
  	              selectedDatabasePermissionTeam.id === "all_agents"
  	                ? React.createElement(PlatformPermissionsPage, {
  	                  permissionSet: normalizePlaygroundPermissionSet(draftDatabase.permissionSet, "database"),
  	                  subjectType: "database",
  	                  animationKey: databasePermissionChartAnimationKey,
  	                  disabled: isDatabaseTemplatePreview,
  	                  onRingAccessChange: updateDatabasePermissionRingAccess,
  	                  onActionRingChange: updateDatabasePermissionActionRing,
  	                  onActionAccessChange: updateDatabasePermissionActionAccess,
  	                })
  	                : databaseTeamRolePages
  	            )
  	            : null;
  	          const databaseSettingsTabContent = selectedDatabasePermissionTeam
  	            ? databaseSettingsPermissionContent
  	            : databaseSettingsOverviewContent;
  	          const databaseEditorTabContent = normalizedDatabaseDetailTab === "data"
  	            ? databaseDataTabContent
  	            : normalizedDatabaseDetailTab === "settings"
  	              ? databaseSettingsTabContent
  	              : databaseUsageTabContent;
  	          const databaseEditorMainClassName = "playground-environments-editor-main playground-tasks-detail-main" + (
  	            normalizedDatabaseDetailTab === "data" ? " is-database-data-tab" : ""
  	          );
  	          const databaseEditorScrollClassName = "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" + (
  	            normalizedDatabaseDetailTab === "data" ? " is-database-data-tab" : ""
  	          );
  	          const databaseDetailContentClassName = "playground-server-detail-content playground-database-detail-content" + (
  	            normalizedDatabaseDetailTab === "data" ? " is-database-data-tab" : ""
  	          );
  	          const databaseDetailTabPanelClassName = "playground-database-detail-tab-panel " + (
  	            normalizedDatabaseDetailTab === "data" ? "is-data" : normalizedDatabaseDetailTab === "settings" ? "is-settings" : "is-usage"
  	          );
  
  	          return React.createElement(React.Fragment, null,
  	            React.createElement("div", { className: databaseEditorMainClassName },
  	              React.createElement("div", { className: databaseEditorScrollClassName },
                  React.createElement("div", { className: databaseDetailContentClassName },
                    databaseSaveState.error
                      ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, databaseSaveState.error)
                      : null,
                    React.createElement("div", { className: "playground-database-detail-header-area" },
                      databaseDetailTabs
                    ),
  	                  React.createElement("div", {
  	                      id: databaseDetailTabPanelId,
  	                      role: "tabpanel",
  	                      className: databaseDetailTabPanelClassName,
  	                      "aria-label": normalizedDatabaseDetailTab === "data"
  	                        ? "Database data"
  	                        : normalizedDatabaseDetailTab === "settings"
  	                          ? "Database settings"
  	                          : "Database usage",
  	                    },
  	                    databaseEditorTabContent
  	                  )
                  )
                )
              ),
              renderDatabaseRenameModal(),
              databaseCollectionComposerModal,
              databaseDocumentComposerModal,
              databaseFieldComposerModal
            );
          }
  
