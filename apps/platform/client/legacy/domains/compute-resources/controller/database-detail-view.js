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

            const databaseDescriptionSection = React.createElement(PlatformInstructionsEditor, {
              key: "database-description",
              value: draftDatabase.description || "",
              onChange: (value) => updateDatabaseField("description", value),
              title: "Description",
              placeholder: "Add Description here",
              ariaLabel: "Database description",
              readOnly: isDatabaseTemplatePreview,
              stickyHeader: false,
              historyKey: "database-description:" + (draftDatabase.id || "draft"),
              variant: "minimalistic-ui",
              className: "playground-database-description-section",
              onEditingChange: (editing) => {
                if (!editing && !isDatabaseTemplatePreview && String(draftDatabase.name || "").trim()) {
                  void handleDatabaseSave();
                }
              },
            });
            const databaseDeploymentMapSection = React.createElement(PlatformDeploymentMap, {
              key: "database-deployment-map",
              regionCode: draftDatabase.location || "eur3",
              title: "Deployment region",
              className: "playground-database-deployment-map",
            });
  
            const databaseDetailsSection = React.createElement(PlatformAnalyticsSection, {
              variant: "default",
              analytics: databaseDetailAnalytics,
              chartType: "line",
              title: databaseDetailAnalytics.title,
              timeframe: {
                value: normalizedDatabaseDetailChartTimescale,
                options: [
                  { value: "day", label: "24H" },
                  { value: "week", label: "7D" },
                  { value: "month", label: "30D" },
                ],
                onValueChange: setDatabaseDetailChartTimescale,
                ariaLabel: "Database analytics time frame",
              },
              className: "playground-database-detail-usage-analytics playground-server-detail-analytics",
            });
  
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
                      ? React.createElement(PlatformEmptyState, {
                          className: "playground-database-browser-pane-empty",
                          icon: Braces,
                          title: "Select a collection",
                          description: "Choose a collection to browse its documents and fields.",
                        })
                      : !selectedDocument
                        ? React.createElement(PlatformEmptyState, {
                            className: "playground-database-browser-pane-empty",
                            icon: Braces,
                            title: "Select a document",
                            description: "Choose a document to inspect and edit its fields.",
                          })
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
                                : React.createElement(PlatformEmptyState, {
                                    className: "playground-database-browser-pane-empty playground-database-browser-fields-empty-state",
                                    icon: Braces,
                                    title: "No fields yet",
                                    description: "Add a field to begin structuring this document.",
                                    primaryAction: isDatabaseTemplatePreview
                                      ? undefined
                                      : {
                                          label: "Add Field",
                                          icon: Plus,
                                          onClick: () => openDatabaseFieldComposer([]),
                                        },
                                  })
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
            const renderDatabaseBrowserEmptyPane = ({ icon, title, description }) =>
              React.createElement(PlatformEmptyState, {
                className: "playground-database-browser-pane-empty",
                icon,
                title,
                description,
              });
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
                        : renderDatabaseBrowserEmptyPane({
                            icon: Layers,
                            title: "No collections yet",
                            description: "Create a collection to start storing documents.",
                          })
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
                        ? renderDatabaseBrowserEmptyPane({
                            icon: Layers,
                            title: "Select a collection",
                            description: "Choose a collection to browse its documents.",
                          })
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
                          : renderDatabaseBrowserEmptyPane({
                              icon: FileText,
                              title: "No documents yet",
                              description: "Add a document to begin storing data in this collection.",
                            })
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
                        selectedDocument
                          ? React.createElement("button", {
                              type: "button",
                              className: "playground-database-browser-add-field"
                                + (databaseDocumentViewMode === "preview" && parsedDocumentData ? "" : " is-layout-placeholder"),
                              onClick: () => openDatabaseFieldComposer([]),
                              disabled: isDatabaseTemplatePreview
                                || databaseDocumentViewMode !== "preview"
                                || !parsedDocumentData,
                              "aria-hidden": databaseDocumentViewMode !== "preview" || !parsedDocumentData ? "true" : undefined,
                              tabIndex: databaseDocumentViewMode === "preview" && parsedDocumentData ? 0 : -1,
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
  
            const renderDatabaseComposerModal = ({
              open,
              title,
              description,
              onClose,
              onSubmit,
              isSaving = false,
              submitLabel,
              savingLabel,
            }, bodyContent) => {
              if (isDatabaseTemplatePreview) {
                return null;
              }
              const handleClose = () => {
                if (!isSaving) {
                  onClose();
                }
              };
              return React.createElement(PlatformModal, {
                  open: Boolean(open),
                  title,
                  description,
                  onClose: handleClose,
                  closeOnBackdrop: !isSaving,
                  closeOnEscape: !isSaving,
                  closeButtonDisabled: isSaving,
                  as: "form",
                  size: "medium",
                  className: "playground-database-browser-modal",
                  bodyClassName: "playground-database-browser-modal-body",
                  footerClassName: "playground-database-browser-modal-footer",
                  surfaceProps: {
                    onSubmit,
                  },
                  footer: React.createElement(React.Fragment, null,
                    React.createElement(PlatformSecondaryButton, {
                      type: "button",
                      size: "medium",
                      onClick: handleClose,
                      disabled: isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      type: "submit",
                      size: "medium",
                      disabled: isSaving,
                    }, isSaving ? savingLabel : submitLabel)
                  ),
                },
                bodyContent
              );
            };

            const databaseCollectionComposerModal = renderDatabaseComposerModal({
                open: databaseCollectionComposerState.open,
                title: "New Collection",
                description: "Create a new top-level collection inside this database.",
                onClose: closeDatabaseCollectionComposer,
                onSubmit: handleSubmitDatabaseCollectionComposer,
                isSaving: databaseCollectionComposerState.isSaving,
                submitLabel: "Create",
                savingLabel: "Creating...",
              },
              React.createElement(React.Fragment, null,
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
                      : null
              )
            );
  
            const databaseDocumentComposerModal = renderDatabaseComposerModal({
                open: databaseDocumentComposerState.open,
                title: "New Document",
                description: "Create a new document inside the selected collection.",
                onClose: closeDatabaseDocumentComposer,
                onSubmit: handleSubmitDatabaseDocumentComposer,
                isSaving: databaseDocumentComposerState.isSaving,
                submitLabel: "Create",
                savingLabel: "Creating...",
              },
              React.createElement(React.Fragment, null,
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
                      : null
              )
            );
  
            const databaseFieldComposerModal = renderDatabaseComposerModal({
                open: databaseFieldComposerState.open,
                title: "Add Field",
                description: "Create a new field on this document or nested object.",
                onClose: closeDatabaseFieldComposer,
                onSubmit: handleSubmitDatabaseFieldComposer,
                submitLabel: "Add",
                savingLabel: "Adding...",
              },
              React.createElement(React.Fragment, null,
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
                      : null
              )
            );
	          const normalizedDatabaseDetailTab = ["data", "usage", "settings"].includes(databaseDetailTab) ? databaseDetailTab : "data";
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
            const databaseDataTabContent = React.createElement("div", { className: "playground-database-browser-tab-body" },
              databaseBrowserSection
            );
  	          const databaseSharedTeamIds = getDatabaseSharedTeamIds(draftDatabase);
  	          const databaseSharedTeamIdSet = new Set(databaseSharedTeamIds);
  	          const databaseWorkspaceTeamById = new Map(
  	            normalizedEnvironmentWorkspaceTeams.map((team) => [team.id, team])
  	          );
	          const databaseCreatorIdentity = getDatabaseCreatorIdentity(draftDatabase);
	          const databaseCreatorValue = renderDevelopResourceIdentityValue(databaseCreatorIdentity);
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
	            ...createPlatformSystemAccessPrincipalRows().map((principal) => ({
	              ...principal,
	              meta: principal.description || "Always included",
	              permission: principal.id === PLATFORM_ALL_AGENTS_PRINCIPAL_ID
	                ? "Agent policy"
	                : "Organization member policy",
	            })),
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
	          const databaseAddableTeams = availableEnvironmentShareTeams.filter((team) => !databaseSharedTeamIdSet.has(team.id));
  	          const selectedDatabasePermissionTeam = databasePermissionTeams.find((team) =>
  	            String(team.id) === String(databasePermissionTeamId || "")
  	          ) || null;
  	          const canManageDatabaseTeamAccess = Boolean(
  	            !isDatabaseTemplatePreview
  	            && draftDatabase.id
  	            && draftDatabase.id !== PLAYGROUND_DATABASE_DRAFT_ID
  	          );
	          const formatDatabaseTeamCreatedDate = (value) => {
  	            if (!value) return "";
  	            try {
  	              return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
  	            } catch {
  	              return String(value || "");
  	            }
  	          };
	          const renderAddDatabaseTeamsMenuContent = () =>
	              databaseAddableTeams.length
	                ? databaseAddableTeams.map((team) =>
	                    React.createElement("button", {
	                      key: team.id,
	                      type: "button",
	                      role: "menuitem",
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
	                    role: "menuitem",
	                    className: "tb-popup-row playground-project-team-menu-item",
  	                    disabled: true,
  	                  }, workspaceTeamsLoading
  	                    ? "Loading teams..."
  	                    : workspaceTeamsRequiresPlan
  	                      ? "Teams require a team plan"
	                      : "All teams already have access");
	          const databaseOwnerLabel = String(databaseOwnerIdentity.name || databaseOwnerIdentity.email || "Owner").trim();
	          const databaseOwnerOptions = databaseOwnerCandidates.map((candidate) => {
	            const candidateKey = getDatabaseOwnerIdentityKey(candidate);
	            const candidateLabel = String(candidate.name || candidate.email || "Team member").trim();
	            const candidateDetail = candidate.email && candidateLabel.toLowerCase() !== candidate.email.toLowerCase()
	              ? candidate.email
	              : (Array.isArray(candidate.teamNames) ? candidate.teamNames.join(", ") : "");
	            return {
	              value: candidateKey,
	              label: candidateLabel,
	              description: candidateDetail || undefined,
	              ariaLabel: candidateDetail ? candidateLabel + ", " + candidateDetail : candidateLabel,
	              leading: React.createElement(AccountAvatar, {
	                className: "playground-agents-detail-owner-option-avatar",
	                imageClassName: "playground-agents-detail-owner-option-avatar-image",
	                fallbackLabel: getAccountInitials(candidateLabel),
	                photoUrl: candidate.avatarUrl || "",
	              }),
	              candidate,
	            };
	          });
	          const databaseOwnerSelectorControl = React.createElement(PlatformSelector, {
	            value: databaseOwnerIdentityKey,
	            options: databaseOwnerOptions,
	            open: databaseOwnerPopoverOpen,
	            onOpenChange: setDatabaseOwnerPopoverOpen,
	            onValueChange: (nextValue) => {
	              const selectedOwner = databaseOwnerOptions.find((option) => option.value === nextValue)?.candidate;
	              if (!selectedOwner || nextValue === databaseOwnerIdentityKey) {
	                setDatabaseOwnerPopoverOpen(false);
	                return;
	              }
	              openDatabaseOwnerTransferModal(selectedOwner);
	            },
	            ariaLabel: "Choose database owner",
	            label: React.createElement("span", { className: "playground-team-member-cell" },
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
	            alignment: "end",
	            popupAlignment: "right",
	            fullWidth: true,
	            disabled: !canManageDatabaseTeamAccess || !isCurrentDatabaseOwner || databaseSaveState.isSaving,
	            loading: databaseSharedTeamIds.length > 0 && databaseOwnerMissingTeamIds.length > 0,
	            loadingContent: "Loading team members...",
	            emptyContent: databaseSharedTeamIds.length === 0
	              ? "Grant a team access before choosing an owner."
	              : "No human team members are available.",
	            popupWidth: 260,
	            popupMaxHeight: "min(320px, calc(100vh - 180px))",
	            className: "playground-database-owner-selector playground-server-owner-selector",
	            triggerClassName: "playground-database-owner-trigger playground-server-owner-selector-trigger",
	            popupClassName: "playground-agents-detail-owner-menu playground-server-owner-selector-popup",
	            optionClassName: "playground-agents-detail-owner-option",
	          });
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
	            ? React.createElement(PlatformPopup, {
	                open: databaseTeamMenuId === "add-teams",
	                variant: "minimal",
	                portal: true,
	                placement: "bottom-end",
	                portalOffset: 6,
	                rootClassName: "playground-project-teams-add-shell playground-database-team-menu-scope",
	                surfaceClassName: "playground-project-teams-add-menu playground-database-team-menu-scope",
	                surfaceProps: {
	                  role: "menu",
	                  "aria-label": "Add teams to database",
	                  onClick: (event) => event.stopPropagation(),
	                  onKeyDown: (event) => {
	                    if (event.key === "Escape") {
	                      event.preventDefault();
	                      event.stopPropagation();
	                      setDatabaseTeamMenuId("");
	                    }
	                  },
	                },
	                animation: "down-in",
	                trigger: React.createElement(PlatformSecondaryButton, {
	                  type: "button",
	                  size: "small",
	                  className: "playground-project-teams-add-button",
	                  "aria-haspopup": "menu",
	                  "aria-expanded": databaseTeamMenuId === "add-teams" ? "true" : "false",
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
	              },
	              renderAddDatabaseTeamsMenuContent()
	            )
	            : null;
	          const databaseTeamAccessPlatformSection = React.createElement("section", {
	              className: "playground-project-settings-access-section",
	            },
	            React.createElement(PlatformResourceAccessTable, {
	              teams: databasePermissionTeams.filter((team) => !isPlatformSystemAccessPrincipalId(team.id)),
	              resourceLabel: "Database",
	              className: "playground-database-access-platform-data-table",
	              selectedIds: selectedDatabaseAccessTeamIds,
	              onSelectedIdsChange: setSelectedDatabaseAccessTeamIds,
	              trailing: databaseAddTeamsControl,
	              busy: databaseSaveState.isSaving || Boolean(databaseTeamAccessState.action),
	              onOpenPermissions: (team) => {
	                setDatabaseTeamMenuId("");
	                setDatabasePermissionRoleId("member");
	                setDatabasePermissionTeamId(team.id);
	              },
	              getTeamActions: (team) => typeof onOpenTeamPage === "function"
	                ? [{
	                      id: "view-team",
	                      label: "View team",
	                      icon: ExternalLink,
	                      onSelect: () => onOpenTeamPage(team.id),
	                  }]
	                : [],
	              onRemoveTeams: (teams) => {
	                if (teams.length > 1) void handleRemoveDatabaseTeamAccessBulk(teams);
	                else if (teams[0]) void handleRemoveDatabaseTeamAccess(teams[0]);
	              },
	              formatCreatedAt: (value) => formatDatabaseTeamCreatedDate(value) || "—",
	              error: databaseTeamAccessState.error || null,
	            })
	          );
  	          const databaseSettingsOverviewContent = React.createElement("section", {
  	              className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-teams-section playground-project-settings-root playground-database-settings-root",
  	            },
	            databaseDeploymentMapSection,
	            databaseDescriptionSection,
	            React.createElement("div", { className: "playground-database-access-section-group" },
	              databaseTeamAccessPlatformSection
	            )
	          );
	          const selectedDatabaseRoleDefinition = getPlaygroundTeamRoleDefinition(databasePermissionRoleId);
	          const selectedDatabaseRolePermissionSet = selectedDatabasePermissionTeam && !isPlatformSystemAccessPrincipalId(selectedDatabasePermissionTeam.id)
	            ? getDatabaseTeamRolePermissionSet(draftDatabase, selectedDatabasePermissionTeam.id, selectedDatabaseRoleDefinition.id)
	            : null;
	          const databaseTeamRolePages = selectedDatabasePermissionTeam && !isPlatformSystemAccessPrincipalId(selectedDatabasePermissionTeam.id)
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
	                  isPlatformSystemAccessPrincipalId(selectedDatabasePermissionTeam.id)
	                    ? selectedDatabasePermissionTeam.name + " Permissions"
	                    : (selectedDatabasePermissionTeam.name || "Team") + " Database Access"
	                )
	              ),
	              isPlatformSystemAccessPrincipalId(selectedDatabasePermissionTeam.id)
	                ? React.createElement(PlatformPermissionsPage, {
	                  permissionSet: getPlatformSystemPrincipalPermissionSet(
	                    draftDatabase.metadata,
	                    selectedDatabasePermissionTeam.id,
	                    "database",
	                    draftDatabase.permissionSet
	                  ),
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
	          const renderDatabaseSidebarValue = (value, className = "") =>
	            React.createElement("span", {
	              className: "playground-environments-editor-fact-value" + (className ? " " + className : ""),
	              title: String(value || ""),
	            }, value || "Not set");
	          const renderDatabaseSidebarRow = (label, valueNode, options = {}) =>
	            React.createElement("div", {
	                key: label,
	                className: "playground-project-overview-sidebar-row"
	                  + (options.className ? " " + options.className : ""),
	              },
	              React.createElement("div", { className: "playground-project-overview-sidebar-row-label" }, label),
	              React.createElement("div", {
	                className: "playground-project-overview-sidebar-row-value"
	                  + (options.valueClassName ? " " + options.valueClassName : ""),
	              }, valueNode)
	            );
	          const databaseDetailSidebar = React.createElement(PlatformUiCard, {
	              as: "section",
	              variant: "sidebar",
	              cardTitle: "Properties",
	              className: "playground-project-overview-sidebar-card playground-server-detail-properties-card playground-database-detail-properties-card",
	            },
	            React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
	              renderDatabaseSidebarRow("Creator", databaseCreatorValue, {
	                valueClassName: "playground-server-detail-sidebar-identity-cell",
	              }),
	              renderDatabaseSidebarRow("Provider",
	                renderDatabaseSidebarValue(draftDatabase.provider || "firestore")
	              ),
	              renderDatabaseSidebarRow("Location",
	                renderDatabaseSidebarValue(draftDatabase.location || "eur3")
	              ),
	              renderDatabaseSidebarRow("Resource ID",
	                renderDatabaseSidebarValue(draftDatabase.id || "Unsaved database", "is-id")
	              ),
	              renderDatabaseSidebarRow("Created",
	                renderDatabaseSidebarValue(formatPlaygroundFileDate(draftDatabase.createdAt))
	              ),
	              renderDatabaseSidebarRow("Updated",
	                renderDatabaseSidebarValue(formatPlaygroundFileDate(draftDatabase.updatedAt))
	              ),
	              renderDatabaseSidebarRow("Owner", databaseOwnerSelectorControl, {
	                className: "playground-server-detail-sidebar-owner-row",
	                valueClassName: "playground-server-detail-sidebar-owner-cell",
	              })
	            )
	          );
	          const databaseDetailSidebarCollapsed = Boolean(databaseDetailsCollapsed);
	          const databaseEditorTabContent = normalizedDatabaseDetailTab === "data"
	            ? databaseDataTabContent
	            : normalizedDatabaseDetailTab === "settings"
	              ? databaseSettingsTabContent
	              : databaseUsageTabContent;
	          const databaseEditorMainClassName = "playground-environments-editor-main playground-tasks-detail-main playground-database-detail-main" + (
	            normalizedDatabaseDetailTab === "data" ? " is-database-data-tab" : ""
	          );
	          const databaseEditorScrollClassName = "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" + (
	            normalizedDatabaseDetailTab === "data" ? " is-database-data-tab" : ""
	          );
	          const databaseDetailContentClassName = "playground-server-detail-content playground-database-detail-content" + (
	            normalizedDatabaseDetailTab === "data" ? " is-database-data-tab" : ""
	          );
	          const databaseDetailWorkspace = React.createElement(DevelopServerDetailPage, {
	              tabs: [],
	              activeTab: normalizedDatabaseDetailTab,
	              onTabChange: (nextTab) => {
	                setDatabaseOwnerPopoverOpen(false);
	                setDatabaseDetailTab(nextTab);
	              },
	              sidebar: databaseDetailSidebar,
	              sidebarCollapsed: databaseDetailSidebarCollapsed,
	              sidebarAutoCollapseTabs: ["data"],
	              ariaLabel: "Database details for " + (draftDatabase.name || "Untitled database"),
	              sidebarAriaLabel: (draftDatabase.name || "Database") + " properties",
	              className: "is-database-server-detail" + (
	                normalizedDatabaseDetailTab === "data" ? " is-database-data-tab" : ""
	              ),
	              contentClassName: databaseDetailContentClassName,
	            },
	            databaseSaveState.error
	              ? React.createElement("div", {
	                  className: "playground-environments-error playground-environments-editor-notice",
	                  role: "alert",
	                }, databaseSaveState.error)
	              : null,
	            databaseEditorTabContent
	          );

	          return React.createElement(React.Fragment, null,
	            React.createElement("div", { className: databaseEditorMainClassName },
	              React.createElement("div", { className: databaseEditorScrollClassName },
	                databaseDetailWorkspace
	                )
	              ),
	              databaseOwnerTransferModal,
	              renderDatabaseRenameModal(),
	              databaseCollectionComposerModal,
              databaseDocumentComposerModal,
              databaseFieldComposerModal
            );
          }
  
