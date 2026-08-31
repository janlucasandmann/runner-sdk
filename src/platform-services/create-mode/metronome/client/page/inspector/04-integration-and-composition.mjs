export const METRONOME_INSPECTOR_04_FRAGMENT = String.raw`                        fieldKey: "inputBinding",
                        fallback: "last.documents",
                        className: "playground-metronome-firecrawl-source-field",
                        options: [
                          { id: "last.documents", label: "Previous node documents" },
                          { id: "last.json", label: "Previous node JSON" },
                          { id: "last.text", label: "Previous node text" },
                          { id: "workflow.context", label: "Full workflow context" },
                        ],
                      }),
                      renderMetronomeRichTextField({
                        fieldKey: "prompt",
                        title: "Instructions",
                        placeholder: "Extract company name, price, date, and source URL.",
                        tooltip: "Describe the structured data Firecrawl should extract from the selected source.",
                        isInstructionsField: true,
                      }),
                      renderMetronomeJsonEditorField({
                        title: "Output schema",
                        fieldKey: "schemaJson",
                        value: config.schemaJson || config.schema_json || "{\n  \"type\": \"object\",\n  \"properties\": {}\n}",
                        path: "extract-schema.json",
                      })
                    )
                  : null,
                React.createElement(MetronomeInspectorField, null,
                  renderMetronomeFieldTitle("Limit", "Maximum number of Firecrawl results, pages, or documents this node may return."),
                  React.createElement(MetronomeInspectorInput, {
                    type: "number",
                    min: "1",
                    max: "50",
                    className: "playground-metronome-input",
                    value: Number.isFinite(Number(config.limit)) ? String(config.limit) : "5",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("limit", Number(event.target.value) || 1),
                  })
                ),
                React.createElement(MetronomeInspectorSwitchRow, { className: "is-workflow-context" },
                  React.createElement("div", { className: "playground-metronome-switch-copy" },
                    React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                      React.createElement("span", null, "Save artifacts"),
                      renderMetronomeFieldTooltip("Store scraped pages, parsed documents, and extracted records as workflow artifacts for following nodes.")
                    )
                  ),
                  React.createElement(MetronomeInspectorSwitch, {
                    type: "button",
                    className: (config.saveArtifacts === false || config.save_artifacts === false ? "" : " is-on"),
                    role: "switch",
                    "aria-checked": config.saveArtifacts === false || config.save_artifacts === false ? "false" : "true",
                    onClick: () => updateSelectedNodeConfig("saveArtifacts", config.saveArtifacts === false || config.save_artifacts === false),
                  })
                ),
                React.createElement(MetronomeInspectorField, { className: "playground-metronome-firecrawl-output-key-field" },
                  renderMetronomeFieldTitle("Output key", "Name this Firecrawl output so downstream nodes can bind to it, for example previous.firecrawl.documents."),
                  React.createElement(MetronomeInspectorInput, {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.outputKey || config.output_key || "firecrawl",
                    placeholder: "firecrawl",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("outputKey", event.target.value),
                  })
                )
              );
            };
            const renderTableSettings = () => {
              const operation = normalizeMetronomeTableOperation(config.operation || subtype);
              const inlineTableContent = String(config.content || config.csvText || config.csv_text || config.tsvText || config.tsv_text || "").trim();
              const inlineTableSourceName = String(config.sourceName || config.source_name || config.fixturePath || config.fixture_path || config.fixture || "").trim();
              const inlineTableLineCount = inlineTableContent
                ? inlineTableContent.split(/\r?\n/).filter((line) => line.trim()).length
                : 0;
              const inlineTableDataRowCount = inlineTableLineCount > 0 && config.hasHeader !== false && config.has_header !== false
                ? Math.max(0, inlineTableLineCount - 1)
                : inlineTableLineCount;
              const inlineTableSummary = inlineTableContent
                ? [
                    inlineTableSourceName || (operation === "parse_tsv" ? "Embedded TSV" : "Embedded CSV"),
                    inlineTableDataRowCount ? inlineTableDataRowCount + " row" + (inlineTableDataRowCount === 1 ? "" : "s") : "",
                    inlineTableContent.length ? inlineTableContent.length.toLocaleString() + " chars" : "",
                  ].filter(Boolean).join(" · ")
                : "";
              return React.createElement(React.Fragment, null,
                renderMetronomeDataBindingSelect({
                  title: "Source",
                  fieldKey: "inputBinding",
                  fallback: "trigger.input.files",
                  options: [
                    { id: "workflow.trigger.input.csvContent", label: "Trigger CSV content", description: "CSV text sent with the workflow run." },
                    { id: "trigger.input.files", label: "Trigger files" },
                    { id: "trigger.input", label: "Trigger input" },
                    { id: "last.files", label: "Previous node files" },
                    { id: "last.text", label: "Previous node text" },
                    { id: "last.records", label: "Previous node records" },
                    { id: "workflow.context", label: "Full workflow context" },
                  ],
                }),
                inlineTableContent
                  ? React.createElement(MetronomeInspectorField, { className: "playground-metronome-table-inline-source-field" },
                      renderMetronomeFieldTitle("Content", "Inline CSV/TSV content bundled with this node and used if the selected binding does not provide content."),
                      React.createElement(MetronomeInspectorInput, {
                        type: "text",
                        className: "playground-metronome-input",
                        value: inlineTableSummary,
                        disabled: true,
                        readOnly: true,
                      })
                    )
                  : null,
                React.createElement(MetronomeInspectorField, { className: "playground-metronome-table-fallback-field" },
                  renderMetronomeFieldTitle("Fallback File", "Used when the source binding does not contain inline CSV/TSV text or a file reference."),
                  React.createElement(MetronomeInspectorInput, {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.filePath || config.file_path || "",
                    placeholder: operation === "parse_tsv" ? "/workspace/uploads/data.tsv" : "/workspace/uploads/data.csv",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("filePath", event.target.value),
                  })
                ),
                React.createElement(MetronomeInspectorField, null,
                  renderMetronomeFieldTitle("Delimiter", "Leave empty to auto-detect comma, semicolon, or tab-delimited data."),
                  React.createElement(MetronomeInspectorInput, {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.delimiter || "",
                    placeholder: operation === "parse_tsv" ? "\\t" : "auto",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("delimiter", event.target.value),
                  })
                ),
                React.createElement(MetronomeInspectorSwitchRow, { className: "is-workflow-context" },
                  React.createElement("div", { className: "playground-metronome-switch-copy" },
                    React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                      React.createElement("span", null, "First row contains headers"),
                      renderMetronomeFieldTooltip("Headers are normalized into snake_case keys while preserving the original labels.")
                    )
                  ),
                  React.createElement(MetronomeInspectorSwitch, {
                    type: "button",
                    className: (config.hasHeader === false || config.has_header === false ? "" : " is-on"),
                    role: "switch",
                    "aria-checked": config.hasHeader === false || config.has_header === false ? "false" : "true",
                    onClick: () => updateSelectedNodeConfig("hasHeader", config.hasHeader === false || config.has_header === false),
                  })
                ),
                React.createElement(MetronomeInspectorField, { className: "playground-metronome-table-batch-size-field" },
                  renderMetronomeFieldTitle("Batch size", "Creates a batches array for downstream database or loop nodes. Use 0 to disable batching."),
                  React.createElement(MetronomeInspectorInput, {
                    type: "number",
                    min: "0",
                    max: "10000",
                    className: "playground-metronome-input",
                    value: Number.isFinite(Number(config.batchSize || config.batch_size)) ? String(config.batchSize || config.batch_size) : "5",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("batchSize", Math.max(0, Number(event.target.value) || 0)),
                  })
                ),
                React.createElement(MetronomeInspectorField, { className: "playground-metronome-table-output-key-field" },
                  renderMetronomeFieldTitle("Output key", "Name this parsed table output so downstream nodes can bind to records, batches, and columns."),
                  React.createElement(MetronomeInspectorInput, {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.outputKey || config.output_key || "table",
                    placeholder: "table",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("outputKey", event.target.value),
                  })
                )
              );
            };
            const renderDatabaseSettings = () => {
              const isDeleteOperation = subtype === "delete_document";
              const isBulkWriteOperation = subtype === "insert_many_documents" || subtype === "upsert_many_documents";
              const documentJson = String(config.documentJson || config.document || "{\n  \"source\": \"metronome\",\n  \"payload\": \"{{ input }}\"\n}");
              const databaseEditMode = String(config.databaseEditMode || "direct") === "json" ? "json" : "direct";
              const parsedDocument = parseMetronomeDatabaseDocumentObject(documentJson);
              const fieldTypeLabels = {
                string: "String",
                number: "Number",
                boolean: "Boolean",
                null: "Null",
                map: "Map",
                array: "Array",
              };
              const commitDocumentObject = (nextDocument) => {
                updateSelectedNodeConfig("documentJson", formatMetronomeDatabaseDocumentJson(nextDocument));
              };
              const toggleDatabasePath = (path) => {
                const pathKey = getMetronomeDatabasePathKey(path);
                setMetronomeDatabaseExpandedPaths((current) => ({
                  ...current,
                  [pathKey]: current[pathKey] === false ? true : false,
                }));
              };
              const updateDatabaseFieldValue = (path, rawValue) => {
                if (!parsedDocument) return;
                const currentValue = getMetronomeDatabaseValueAtPath(parsedDocument, path);
                commitDocumentObject(setMetronomeDatabaseValueAtPath(parsedDocument, path, coerceMetronomeDatabaseFieldValue(currentValue, rawValue)));
              };
              const deleteDatabaseFieldValue = (path) => {
                if (!parsedDocument) return;
                commitDocumentObject(deleteMetronomeDatabaseValueAtPath(parsedDocument, path));
              };
              const closeMetronomeDatabaseFieldComposer = () => {
                setMetronomeDatabaseFieldComposerState({
                  open: false,
                  parentPath: [],
                  key: "",
                  type: "string",
                  value: "",
                  error: "",
                });
              };
              const openMetronomeDatabaseFieldComposer = (parentPath = []) => {
                setMetronomeDatabaseFieldComposerState({
                  open: true,
                  parentPath: Array.isArray(parentPath) ? parentPath : [],
                  key: "",
                  type: "string",
                  value: "",
                  error: "",
                });
              };
              const submitMetronomeDatabaseFieldComposer = (event) => {
                event.preventDefault();
                if (!parsedDocument) {
                  setMetronomeDatabaseFieldComposerState((current) => ({ ...current, error: "Document JSON must be an object." }));
                  return;
                }
                const parentPath = Array.isArray(metronomeDatabaseFieldComposerState.parentPath)
                  ? metronomeDatabaseFieldComposerState.parentPath
                  : [];
                const parentValue = parentPath.length
                  ? getMetronomeDatabaseValueAtPath(parsedDocument, parentPath)
                  : parsedDocument;
                if (!parentValue || typeof parentValue !== "object" || Array.isArray(parentValue)) {
                  setMetronomeDatabaseFieldComposerState((current) => ({ ...current, error: "Fields can only be added to objects." }));
                  return;
                }
                const fieldKey = String(metronomeDatabaseFieldComposerState.key || "").trim();
                if (!fieldKey) {
                  setMetronomeDatabaseFieldComposerState((current) => ({ ...current, error: "Enter a field name." }));
                  return;
                }
                if (Object.prototype.hasOwnProperty.call(parentValue, fieldKey)) {
                  setMetronomeDatabaseFieldComposerState((current) => ({ ...current, error: "Field already exists." }));
                  return;
                }
                let fieldValue;
                try {
                  fieldValue = createMetronomeDatabaseFieldValue(
                    metronomeDatabaseFieldComposerState.type,
                    metronomeDatabaseFieldComposerState.value
                  );
                } catch (error) {
                  setMetronomeDatabaseFieldComposerState((current) => ({
                    ...current,
                    error: error?.message || "Field value is invalid.",
                  }));
                  return;
                }
                const nextPath = [...parentPath, fieldKey];
                commitDocumentObject(setMetronomeDatabaseValueAtPath(parsedDocument, nextPath, fieldValue));
                setMetronomeDatabaseExpandedPaths((current) => ({
                  ...current,
                  ...(parentPath.length ? { [getMetronomeDatabasePathKey(parentPath)]: true } : {}),
                  [getMetronomeDatabasePathKey(nextPath)]: true,
                }));
                closeMetronomeDatabaseFieldComposer();
              };
              const renderDatabaseFieldValueEditor = (path, value) => {
                const fieldType = getMetronomeDatabaseFieldType(value);
                if (fieldType === "boolean") {
                  return React.createElement(MetronomeInspectorNativeSelect, {
                    className: "playground-metronome-database-value-select",
                    value: value ? "true" : "false",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateDatabaseFieldValue(path, event.target.value),
                  },
                    React.createElement("option", { value: "true" }, "true"),
                    React.createElement("option", { value: "false" }, "false")
                  );
                }
                if (fieldType === "null") {
                  return React.createElement("span", { className: "playground-metronome-database-value-static" }, "null");
                }
                if (fieldType === "map" || fieldType === "array") {
                  return React.createElement("span", { className: "playground-metronome-database-field-preview" }, formatMetronomeDatabaseFieldPreview(value));
                }
                return React.createElement(MetronomeInspectorInput, {
                  type: fieldType === "number" ? "number" : "text",
                  className: "playground-metronome-database-value-input",
                  value: fieldType === "number" ? String(Number.isFinite(Number(value)) ? value : 0) : String(value || ""),
                  placeholder: fieldType === "number" ? "0" : "Value",
                  onKeyDown: stopMetronomeInputKeyPropagation,
                  onKeyUp: stopMetronomeInputKeyPropagation,
                  onChange: (event) => updateDatabaseFieldValue(path, event.target.value),
                });
              };
              const renderDatabaseFieldRows = (containerValue, parentPath = [], depth = 0) => {
                const entries = Array.isArray(containerValue)
                  ? containerValue.map((item, index) => [String(index), item])
                  : Object.entries(containerValue || {});
                if (!entries.length) {
                  return React.createElement("div", { className: "playground-metronome-database-empty-fields" }, "No fields in this object.");
                }
                return React.createElement("div", { className: depth === 0 ? "playground-metronome-database-field-tree" : "playground-metronome-database-field-children" },
                  entries.map(([key, value]) => {
                    const path = [...parentPath, key];
                    const pathKey = getMetronomeDatabasePathKey(path);
                    const fieldType = getMetronomeDatabaseFieldType(value);
                    const canExpand = fieldType === "map" || fieldType === "array";
                    const isExpanded = canExpand && metronomeDatabaseExpandedPaths[pathKey] !== false;
                    return React.createElement("div", { key: pathKey || key, className: "playground-metronome-database-field-node" },
                      React.createElement("div", {
                        className: "playground-metronome-database-field-row",
                        style: depth ? { paddingLeft: Math.min(depth * 14, 56) + "px" } : undefined,
                      },
                        React.createElement("div", { className: "playground-metronome-database-field-main" },
                          canExpand
                            ? React.createElement("button", {
                                type: "button",
                                className: "playground-metronome-database-field-toggle" + (isExpanded ? " is-expanded" : ""),
                                "aria-label": isExpanded ? "Collapse field" : "Expand field",
                                onClick: () => toggleDatabasePath(path),
                              }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                            : React.createElement("span", { className: "playground-metronome-database-field-toggle-placeholder", "aria-hidden": "true" }),
                          React.createElement("span", { className: "playground-metronome-database-field-key" }, key),
                          React.createElement("span", { className: "playground-metronome-database-field-separator" }, ":"),
                          React.createElement("span", { className: "playground-metronome-database-field-type-pill" }, fieldTypeLabels[fieldType] || fieldType)
                        ),
                        React.createElement("div", { className: "playground-metronome-database-field-value-shell" },
                          renderDatabaseFieldValueEditor(path, value)
                        ),
	                        React.createElement("div", { className: "playground-metronome-database-field-actions" },
                          fieldType === "map"
                            ? React.createElement("button", {
                                type: "button",
                                className: "playground-metronome-database-field-action",
                                title: "Add nested field",
                                "aria-label": "Add nested field",
                                onClick: () => openMetronomeDatabaseFieldComposer(path),
                              }, React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.9 }))
                            : null,
	                          React.createElement("button", {
	                            type: "button",
	                            className: "playground-metronome-database-field-action is-danger",
	                            title: "Delete field",
                            "aria-label": "Delete field",
                            onClick: () => deleteDatabaseFieldValue(path),
                          }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.9 }))
                        )
                      ),
                      canExpand && isExpanded
                        ? renderDatabaseFieldRows(value, path, depth + 1)
                        : null
                    );
                  })
                );
              };
              const renderDatabaseDirectEditor = () => {
                if (!parsedDocument) {
                  return React.createElement("div", { className: "playground-metronome-database-empty-fields" },
                    React.createElement("span", null, "Document JSON must be an object before it can be edited directly."),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-database-add-field",
                      onClick: () => updateSelectedNodeConfig("databaseEditMode", "json"),
                    }, "Open JSON editor")
                  );
                }
		                return React.createElement("div", { className: "playground-metronome-database-fields-body" },
                      React.createElement("div", { className: "playground-metronome-database-fields-header" },
                        React.createElement("div", { className: "playground-metronome-database-fields-title" }, "Fields"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-metronome-database-add-field",
                          onClick: () => openMetronomeDatabaseFieldComposer([]),
                        },
                          React.createElement(Plus, { width: 13, height: 13, strokeWidth: 2 }),
                          React.createElement("span", null, "Add Field")
                        )
                      ),
                      Object.keys(parsedDocument).length
                        ? renderDatabaseFieldRows(parsedDocument)
                        : React.createElement("div", { className: "playground-metronome-database-empty-fields" },
                            React.createElement("span", null, "This document does not contain any fields yet.")
                          )
		                );
	              };
	              const renderDatabaseJsonEditor = (pathLabel, value) => React.createElement("div", { className: "playground-metronome-inline-code-editor playground-metronome-database-json-editor-shell" },
	                React.createElement(MetronomeGeneratedCodeEditor, {
	                  file: { path: pathLabel, language: "json" },
	                  value,
                    readOnly: isActiveWorkflowBuiltIn,
	                  onChange: (nextValue) => updateSelectedNodeConfig("documentJson", String(nextValue || "")),
	                })
	              );
              const databaseFieldComposerParentLabel = metronomeDatabaseFieldComposerState.parentPath?.length
                ? metronomeDatabaseFieldComposerState.parentPath.join(".")
                : "document root";
              const databaseFieldComposerModal = metronomeDatabaseFieldComposerState.open
                ? React.createElement(PlatformModalBackdrop, {
                    className: "playground-tasks-project-modal-backdrop",
                    onClick: closeMetronomeDatabaseFieldComposer,
                  },
                    React.createElement(PlatformModalSurface, {
                        as: "form",
                        className: "playground-tasks-project-modal playground-database-browser-modal",
                        onClick: (event) => event.stopPropagation(),
                        onSubmit: submitMetronomeDatabaseFieldComposer,
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
                          onClick: closeMetronomeDatabaseFieldComposer,
                          title: "Close",
                          "aria-label": "Close",
                        }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                      ),
                      React.createElement("div", { className: "playground-database-browser-modal-copy" },
                        "Create a new field on ",
                        databaseFieldComposerParentLabel,
                        "."
                      ),
                      React.createElement("div", { className: "playground-database-browser-modal-grid" },
                        React.createElement("label", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Field"),
                          React.createElement(MetronomeInspectorInput, {
                            type: "text",
                            className: "playground-environments-input",
                            value: metronomeDatabaseFieldComposerState.key,
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => setMetronomeDatabaseFieldComposerState((current) => ({
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
                            React.createElement(MetronomeInspectorNativeSelect, {
                              className: "playground-environments-select playground-database-browser-value-select",
                              value: metronomeDatabaseFieldComposerState.type,
                              onKeyDown: stopMetronomeInputKeyPropagation,
                              onKeyUp: stopMetronomeInputKeyPropagation,
                              onChange: (event) => setMetronomeDatabaseFieldComposerState((current) => ({
                                ...current,
                                type: event.target.value,
                                value: ["map", "array", "null"].includes(event.target.value) ? "" : current.value,
                                error: "",
                              })),
                            },
                              Object.entries(fieldTypeLabels).map(([type, label]) =>
                                React.createElement("option", { key: type, value: type }, label)
                              )
                            )
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-project-modal-field playground-database-browser-modal-value-row" },
                        React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Value"),
                        metronomeDatabaseFieldComposerState.type === "boolean"
                          ? React.createElement(MetronomeInspectorNativeSelect, {
                              className: "playground-environments-select playground-database-browser-value-select",
                              value: metronomeDatabaseFieldComposerState.value === "true" ? "true" : "false",
                              onKeyDown: stopMetronomeInputKeyPropagation,
                              onKeyUp: stopMetronomeInputKeyPropagation,
                              onChange: (event) => setMetronomeDatabaseFieldComposerState((current) => ({
                                ...current,
                                value: event.target.value,
                                error: "",
                              })),
                            },
                              React.createElement("option", { value: "true" }, "true"),
                              React.createElement("option", { value: "false" }, "false")
                            )
                          : metronomeDatabaseFieldComposerState.type === "map"
                            ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates an empty nested object.")
                            : metronomeDatabaseFieldComposerState.type === "array"
                              ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates an empty array.")
                              : metronomeDatabaseFieldComposerState.type === "null"
                                ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates a null value.")
                                : React.createElement(MetronomeInspectorInput, {
                                    type: "text",
                                    className: "playground-environments-input playground-database-browser-modal-value-input",
                                    value: metronomeDatabaseFieldComposerState.value,
                                    onKeyDown: stopMetronomeInputKeyPropagation,
                                    onKeyUp: stopMetronomeInputKeyPropagation,
                                    onChange: (event) => setMetronomeDatabaseFieldComposerState((current) => ({
                                      ...current,
                                      value: event.target.value,
                                      error: "",
                                    })),
                                    placeholder: metronomeDatabaseFieldComposerState.type === "number" ? "42" : "Value",
                                  })
                      ),
                      metronomeDatabaseFieldComposerState.error
                        ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, metronomeDatabaseFieldComposerState.error)
                        : null,
                      React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: closeMetronomeDatabaseFieldComposer,
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
	              return React.createElement(React.Fragment, null,
	                React.createElement(MetronomeInspectorField, null,
	                  renderMetronomeFieldTitle("Database"),
                  renderMetronomeInspectorSelect({
                    id: "database-resource-" + (selectedNodeId || "selected"),
                    value: config.databaseId || "",
                    options: [
                      { id: "", label: metronomeDatabaseOptions.length ? "Select database" : "No databases available" },
                      ...metronomeDatabaseOptions.map((option) => ({
                        id: option.id,
                        label: option.name,
                        description: option.description || option.id || "",
                      })),
                    ],
                    onChange: (nextDatabaseId) => {
                      const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                      updateSelectedNodeConfigPatch({
                        databaseId: nextDatabaseId,
                        databaseName: nextDatabase?.name || "",
                      });
                    },
                    searchPlaceholder: "Select database...",
                  })
                ),
                React.createElement(MetronomeInspectorField, null,
                  renderMetronomeFieldTitle("Collection"),
                  React.createElement(MetronomeInspectorInput, {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.collection || "",
                    placeholder: "customers",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("collection", event.target.value),
                  })
                ),
                isBulkWriteOperation
                  ? null
                  : React.createElement(MetronomeInspectorField, null,
                      renderMetronomeFieldTitle("Document"),
                      React.createElement(MetronomeInspectorInput, {
                        type: "text",
                        className: "playground-metronome-input",
                        value: config.documentId || "",
                        placeholder: isDeleteOperation || subtype === "update_document" ? "Document id or {{ input }}" : "Optional",
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateSelectedNodeConfig("documentId", event.target.value),
                      })
                    ),
                isBulkWriteOperation
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "Source",
                        tooltip: "Choose where this database write reads the array of records from.",
                        fieldKey: "recordsBinding",
                        fallback: "last.records",
                        options: [
                          { id: "last.records", label: "Previous node records" },
                          { id: "last.json.records", label: "Previous node JSON records" },
                          { id: "last.documents", label: "Previous node documents" },
                          { id: "workflow.context.records", label: "Workflow context records" },
                        ],
                      }),
                      subtype === "upsert_many_documents"
                        ? React.createElement(MetronomeInspectorField, { className: "playground-metronome-database-upsert-key-field" },
                            renderMetronomeFieldTitle("Upsert key", "Field used to match existing documents before writing."),
                            React.createElement(MetronomeInspectorInput, {
                              type: "text",
                              className: "playground-metronome-input",
                              value: config.upsertKey || config.upsert_key || "id",
                              placeholder: "id",
                              onKeyDown: stopMetronomeInputKeyPropagation,
                              onKeyUp: stopMetronomeInputKeyPropagation,
                              onChange: (event) => updateSelectedNodeConfig("upsertKey", event.target.value),
                            })
                          )
                        : null
                    )
                  : renderMetronomeDataBindingSelect({
                      title: "Input source",
                      tooltip: "Choose which upstream output should populate this database operation.",
                      fieldKey: "inputBinding",
                      fallback: "last.json",
                      className: "playground-metronome-database-input-source-field",
                    }),
	                isDeleteOperation
	                  ? null
	                  : React.createElement(MetronomeInspectorField, { className: "playground-metronome-database-document-field" },
	                      React.createElement("div", { className: "playground-metronome-database-fields-card" },
	                        React.createElement("div", { className: "playground-metronome-database-document-toolbar" },
	                          React.createElement("div", { className: "playground-metronome-database-document-title" }, "Document"),
	                          React.createElement("div", { className: "content-mode-switch playground-metronome-database-mode-switch", role: "group", "aria-label": "Database document editor mode" },
	                            [
	                              { id: "direct", label: "Direct" },
	                              { id: "json", label: "JSON" },
	                            ].map((mode) => React.createElement("button", {
	                              key: mode.id,
	                              type: "button",
	                              className: "content-mode-button" + (databaseEditMode === mode.id ? " is-active" : ""),
	                              onClick: () => updateSelectedNodeConfig("databaseEditMode", mode.id),
	                            }, mode.label))
	                          )
	                        ),
	                        databaseEditMode === "json"
		                          ? renderDatabaseJsonEditor("document.json", documentJson)
		                          : renderDatabaseDirectEditor()
		                      )
		                    ),
                  databaseFieldComposerModal
	              );
	            };
            const renderApprovalSettings = () => React.createElement(React.Fragment, null,
              renderMetronomeRichTextField({
                fieldKey: "message",
                title: "Approval instructions",
                placeholder: "Describe what needs approval",
              }),
              React.createElement(MetronomeInspectorFieldHint, null,
                "User Approval routes to True when approved and False when rejected."
              )
            );
            const renderFunctionSettings = () => {
              const functionConfig = createDefaultMetronomeFunctionConfig(config);
              const functionMode = normalizeMetronomeFunctionMode(functionConfig.functionMode);
              const isExternalApi = functionMode === "external_api";
              const functionInputBinding = normalizeMetronomeDataBinding(
                functionConfig.inputBinding || functionConfig.input_binding,
                "last.json"
              );
              const functionInputBindingOptions = (() => {
                const options = [
                  { id: "workflow.trigger.input.payload", label: "Trigger payload" },
                  ...METRONOME_WORKFLOW_DATA_BINDING_OPTIONS,
                  ...nodes
                    .filter((node) => String(node?.id || "").trim() && String(node?.id || "").trim() !== String(selectedNodeId || "").trim())
                    .map((node) => ({
                      id: "node." + String(node.id).trim() + ".data",
                      label: String(node?.data?.label || node?.label || node.id).trim() + " output",
                    })),
                ];
                if (!options.some((option) => option.id === functionInputBinding)) {
                  options.unshift({ id: functionInputBinding, label: functionInputBinding });
                }
                const seen = new Set();
                return options.filter((option) => {
                  const id = String(option?.id || "").trim();
                  if (!id || seen.has(id)) return false;
                  seen.add(id);
                  return true;
                });
              })();
              const functionSendsRequestBody = !["GET", "HEAD"].includes(
                normalizeMetronomeFunctionHttpMethod(functionConfig.httpMethod || functionConfig.method)
              );
              const resetFunctionInvokeState = () => setMetronomeFunctionInvokeState({
                nodeId: selectedNodeId || "",
                status: "idle",
                error: "",
                resultText: "",
              });
              const commitFunctionHeaderRows = (nextRows) => {
                const normalizedRows = normalizeMetronomeFunctionHeaderRows(nextRows);
                updateSelectedNodeConfigPatch({
                  requestHeaders: normalizedRows,
                  requestHeadersJson: serializeMetronomeFunctionHeaderRows(normalizedRows),
                });
              };
              const functionHeaderRows = normalizeMetronomeFunctionHeaderRows(functionConfig.requestHeaders);
              const updateFunctionHeaderRow = (rowId, patch) => {
                commitFunctionHeaderRows(functionHeaderRows.map((row) => row.id === rowId ? { ...row, ...patch } : row));
              };
              const removeFunctionHeaderRow = (rowId) => {
                if (functionHeaderRows.length <= 1) return;
                commitFunctionHeaderRows(functionHeaderRows.filter((row) => row.id !== rowId));
              };
              const addFunctionHeaderRow = () => {
                commitFunctionHeaderRows([...functionHeaderRows, createMetronomeHeaderRow()]);
              };
              const addFunctionSecretHeaderRow = () => {
                void loadAllMetronomeHeaderSecrets();
                commitFunctionHeaderRows([...functionHeaderRows, createMetronomeHeaderRow({ valueType: "secret" })]);
              };
              const httpMethodOptions = ["POST", "GET", "PUT", "DELETE", "PATCH", "HEAD"].map((method) => ({
                id: method,
                label: method,
                description: "Send an HTTP " + method + " request.",
              }));
              const renderFunctionHeaders = () => React.createElement("div", {
                className: "playground-metronome-function-headers-field",
                onMouseDown: stopMetronomePointerPropagation,
                onPointerDown: stopMetronomePointerPropagation,
                onClick: stopMetronomePointerPropagation,
              },
                renderMetronomeFieldTitle("Headers (optional)"),
                React.createElement("div", { className: "playground-metronome-function-headers-list" },
                  functionHeaderRows.map((row, index) => {
                    const rowId = row.id || "header-" + index;
                    const secretOptions = metronomeHeaderSecretOptions.length
                      ? metronomeHeaderSecretOptions
                      : [{ id: "", label: metronomeSecretVaultSecretsLoadingId ? "Loading secrets..." : "No secrets available" }];
                    return React.createElement("div", {
                      key: rowId,
                      className: "playground-metronome-function-header-row",
                      onMouseDown: stopMetronomePointerPropagation,
                      onPointerDown: stopMetronomePointerPropagation,
                      onClick: stopMetronomePointerPropagation,
                    },
                      React.createElement(MetronomeInspectorInput, {
                        type: "text",
                        className: "playground-metronome-input",
                        value: row.name || "",
                        placeholder: "Name",
                        onMouseDown: stopMetronomePointerPropagation,
                        onPointerDown: stopMetronomePointerPropagation,
                        onClick: stopMetronomePointerPropagation,
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateFunctionHeaderRow(rowId, { name: event.target.value }),
                      }),
                      row.valueType === "secret"
                        ? renderMetronomeInspectorSelect({
                            id: "function-header-secret-" + (selectedNodeId || "selected") + "-" + rowId,
                            value: row.secretRef || "",
                            options: secretOptions,
                            disabled: !metronomeHeaderSecretOptions.length,
                            placeholder: metronomeHeaderSecretOptions.length ? "Select secret" : "No secrets available",
                            searchPlaceholder: "Select secret...",
                            onChange: (nextSecretRef, option) => {
                              updateFunctionHeaderRow(rowId, {
                                valueType: "secret",
                                value: "",
                                secretRef: nextSecretRef,
                                secretVaultId: option?.vaultId || "",
                                secretVaultName: option?.vaultName || "",
                                secretId: option?.secretId || "",
                                secretName: option?.secretName || "",
                              });
                            },
                          })
                        : React.createElement(MetronomeInspectorInput, {
                            type: "text",
                            className: "playground-metronome-input",
                            value: row.value || "",
                            placeholder: "Value",
                            onMouseDown: stopMetronomePointerPropagation,
                            onPointerDown: stopMetronomePointerPropagation,
                            onClick: stopMetronomePointerPropagation,
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => updateFunctionHeaderRow(rowId, { valueType: "text", value: event.target.value }),
                          }),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-metronome-function-header-delete",
                        disabled: functionHeaderRows.length <= 1,
                        "aria-label": "Delete header",
                        onMouseDown: stopMetronomePointerPropagation,
                        onPointerDown: stopMetronomePointerPropagation,
                        onClick: (event) => {
                          stopMetronomePointerPropagation(event);
                          removeFunctionHeaderRow(rowId);
                        },
                      }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
                    );
                  }),
                  React.createElement("div", { className: "playground-metronome-function-header-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-function-header-link",
                      onMouseDown: stopMetronomePointerPropagation,
                      onPointerDown: stopMetronomePointerPropagation,
                      onClick: (event) => {
                        stopMetronomePointerPropagation(event);
                        addFunctionHeaderRow();
                      },
                    },
                      React.createElement(Plus, { width: 12, height: 12, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Add header")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-function-header-link",
                      onMouseDown: stopMetronomePointerPropagation,
                      onPointerDown: stopMetronomePointerPropagation,
                      onClick: (event) => {
                        stopMetronomePointerPropagation(event);
                        addFunctionSecretHeaderRow();
                      },
                    },
                      React.createElement(Plus, { width: 12, height: 12, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Add secret")
                    ),
                    renderMetronomeFieldTooltip("Secrets are taken from the Secrets service in Develop mode.")
                  )
                )
              );
              return React.createElement(React.Fragment, null,
                React.createElement(MetronomeInspectorField, { className: "playground-metronome-function-type-field" },
                  renderMetronomeFieldTitle("Type"),
                  renderMetronomeInspectorSelect({
                    id: "function-mode-" + (selectedNodeId || "selected"),
                    value: functionMode,
                    options: [
                      {
                        id: "computer_agents_function",
                        label: "Computer Agents Function",
                        description: "Invoke a deployed Computer Agents function resource.",
                      },
                      {
                        id: "external_api",
                        label: "External API",
                        description: "Call an external HTTP endpoint from this workflow.",
                      },
                    ],
                    searchPlaceholder: "Select function type...",
                    onChange: (nextMode) => {
                      updateSelectedNodeConfigPatch(createDefaultMetronomeFunctionConfig({
                        ...functionConfig,
                        functionMode: nextMode,
                      }));
                      resetFunctionInvokeState();
                    },
                  })
                ),
                isExternalApi
                  ? React.createElement(React.Fragment, null,
                      React.createElement(MetronomeInspectorField, { className: "playground-metronome-function-url-field" },
                        renderMetronomeFieldTitle("URL"),
                        React.createElement(MetronomeInspectorInput, {
                          type: "text",
                          className: "playground-metronome-input",
                          value: functionConfig.url || "",
                          placeholder: "https://api.example.com/events",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("url", event.target.value),
                        })
                      ),
                      renderMetronomeDataBindingSelect({
                        title: "Input source",
                        tooltip: "The selected data is available as input when resolving URL, header, and request-body templates.",
                        fieldKey: "inputBinding",
                        fallback: "last.json",
                        options: functionInputBindingOptions,
                        className: "playground-metronome-function-input-source-field",
                      }),
                      renderFunctionHeaders(),
                      React.createElement(MetronomeInspectorField, { className: "playground-metronome-function-method-field" },
                        renderMetronomeFieldTitle("Method"),
                        renderMetronomeInspectorSelect({
                          id: "function-http-method-" + (selectedNodeId || "selected"),
                          value: functionConfig.httpMethod || "POST",
                          options: httpMethodOptions,
                          searchPlaceholder: "Select method...",
                          onChange: (nextMethod) => updateSelectedNodeConfigPatch({
                            httpMethod: normalizeMetronomeFunctionHttpMethod(nextMethod),
                            method: normalizeMetronomeFunctionHttpMethod(nextMethod),
                          }),
                        })
                      ),
                      functionSendsRequestBody
                        ? React.createElement(MetronomeInspectorField, null,
                            renderMetronomeFieldTitle("Request body", "When empty, the selected input source is sent directly."),
                            React.createElement("div", { className: "playground-metronome-inline-code-editor" },
                              React.createElement(MetronomeGeneratedCodeEditor, {
                                file: { path: "payload.json", language: "json" },
                                value: functionConfig.payloadJson,
                                readOnly: isActiveWorkflowBuiltIn,
                                onChange: (nextValue) => updateSelectedNodeConfig("payloadJson", String(nextValue || "")),
                              })
                            )
                          )
                        : null
                    )
                  : React.createElement(React.Fragment, null,
                      React.createElement(MetronomeInspectorField, null,
                        renderMetronomeFieldTitle("Function"),
                        renderMetronomeInspectorSelect({
                          id: "function-resource-" + (selectedNodeId || "selected"),
                          value: functionConfig.functionId || "",
                          options: [
                            { id: "", label: metronomeFunctionOptions.length ? "Select function" : "No functions available" },
                            ...metronomeFunctionOptions.map((option) => ({
                              id: option.id,
                              label: option.name,
                              description: option.description || option.id || "",
                            })),
                          ],
                          searchPlaceholder: "Select a function...",
                          onChange: (nextFunctionId) => {
                            const nextFunction = metronomeFunctionOptions.find((option) => option.id === nextFunctionId) || null;
                            updateSelectedNodeConfigPatch({
                              functionId: nextFunctionId,
                              functionName: nextFunction?.name || "",
                            });
                            resetFunctionInvokeState();
                          },
                        })
                      ),
                      renderMetronomeDataBindingSelect({
                        title: "Input source",
                        tooltip: "When the request payload is empty, the selected input is sent directly to the function.",
                        fieldKey: "inputBinding",
                        fallback: "last.json",
                        options: functionInputBindingOptions,
                        className: "playground-metronome-function-input-source-field",
                      }),
                      React.createElement(MetronomeInspectorField, null,
                        renderMetronomeFieldTitle("Request payload"),
                        React.createElement("div", { className: "playground-metronome-inline-code-editor" },
                          React.createElement(MetronomeGeneratedCodeEditor, {
                            file: { path: "payload.json", language: "json" },
                            value: functionConfig.payloadJson,
                            readOnly: isActiveWorkflowBuiltIn,
                            onChange: (nextValue) => {
                              updateSelectedNodeConfig("payloadJson", String(nextValue || ""));
                              resetFunctionInvokeState();
                            },
                          })
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-function-test-section" },
                        React.createElement("div", { className: "playground-metronome-function-test-header" },
                          renderMetronomeFieldTitle("Test invoke"),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-function-test-button" + (selectedFunctionInvokeState.status === "loading" ? " is-loading" : ""),
                            disabled: selectedFunctionInvokeState.status === "loading" || !String(functionConfig.functionId || "").trim(),
                            onClick: handleMetronomeFunctionTestInvoke,
                          },
                            React.createElement(selectedFunctionInvokeState.status === "loading" ? Loader2 : Play, { width: 13, height: 13, strokeWidth: 1.9 }),
                            selectedFunctionInvokeState.status === "loading" ? "Invoking" : "Invoke"
                          )
                        ),
                        selectedFunctionInvokeState.error
                          ? React.createElement("div", { className: "playground-metronome-function-test-error" }, selectedFunctionInvokeState.error)
                          : null,
                        selectedFunctionInvokeState.resultText
                          ? React.createElement("pre", { className: "playground-metronome-function-test-result" }, selectedFunctionInvokeState.resultText)
                          : null
                      )
                    )
              );
            };
            const renderMetronomeWorkflowSettings = () => React.createElement(React.Fragment, null,
              React.createElement(MetronomeInspectorField, null,
                renderMetronomeFieldTitle("Workflow"),
                renderMetronomeInspectorSelect({
                  id: "metronome-workflow-" + (selectedNodeId || "selected"),
                  value: config.workflowId || "",
                  options: [
                    { id: "", label: "Select Metronome" },
                    ...metronomeWorkflowOptions.map((option) => ({
                      id: option.id,
                      label: option.name,
                      description: option.description || option.id || "",
                    })),
                  ],
                  searchPlaceholder: "Select a workflow...",
                  onChange: (nextWorkflowId) => {
                    const nextWorkflow = metronomeWorkflowOptions.find((option) => option.id === nextWorkflowId) || null;
                    updateSelectedNodeConfigPatch({
                      workflowId: nextWorkflowId,
                      workflowName: nextWorkflow?.name || "",
                    });
                  },
                })
              ),
              React.createElement(MetronomeInspectorFieldHint, { className: "playground-metronome-workflow-selector-description" },
                "This workflow receives the accumulated context chain and returns its run summary to the next node."
              )
            );
            const renderSelectedNodeSettings = () => {
              const nodeSettingsRenderers = {
                trigger: renderTriggerSettings,
                condition: renderConditionSettings,
                loop: renderLoopSettings,
                action: renderThreadSettings,
                ticket: renderTicketSettings,
                approval: renderApprovalSettings,
                imagine: renderImagineSettings,
                function: renderFunctionSettings,
                database: renderDatabaseSettings,
                table: renderTableSettings,
                firecrawl: renderFirecrawlSettings,
                metronome: renderMetronomeWorkflowSettings,
              };
              const renderSettings = nodeSettingsRenderers[kind];
              return typeof renderSettings === "function" ? renderSettings() : null;
            };
            const showTypeSelector = !["action", "approval", "end", "note", "ticket", "imagine", "function"].includes(kind);
            const rawNodeLabel = String(selectedNode.data?.label || "");
            const defaultNodeLabel = getMetronomeDefaultNodeLabel(kind, subtype);
            const inspectorNodeLabel = getMetronomeNodeDisplayLabel(selectedNode);
            const inspectorNodeDescription = getMetronomeNodeTypeDescription(selectedNode);
            const triggerNodeCount = nodes.filter((node) => String(node?.data?.kind || node?.kind || "").trim() === "trigger").length;
            const canDeleteSelectedNode = !isActiveWorkflowBuiltIn && (kind !== "trigger" || triggerNodeCount > 1);
            const selectedTestNodeCount = Math.max(1, nodes.filter((node) => node?.selected === true).length);
            return React.createElement("aside", {
              className: "playground-metronome-node-inspector" + (isActiveWorkflowBuiltIn ? " is-readonly" : ""),
            },
			              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-metronome-inspector-header" },
			                React.createElement("div", { className: "playground-metronome-inspector-title-row" },
			                  React.createElement("div", { className: "playground-tasks-detail-navbar-title playground-metronome-inspector-navbar-title" },
			                    React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
			                      React.createElement("span", {
			                        className: "playground-content-title playground-metronome-inspector-title-text",
			                      }, inspectorNodeLabel)
			                    )
			                  ),
		                  React.createElement("div", { className: "playground-metronome-inspector-actions" },
		                    React.createElement("button", {
		                      type: "button",
		                      className: "playground-files-header-icon-button is-plain playground-metronome-inspector-test",
		                      onClick: openMetronomeExecutionTestDialog,
		                      disabled: isActiveWorkflowBuiltIn,
		                      title: selectedTestNodeCount > 1 ? "Test selected workflow slice" : "Test node",
		                      "aria-label": selectedTestNodeCount > 1 ? "Test selected workflow slice" : "Test node",
		                    },
		                      React.createElement(Play, { width: 15, height: 15, strokeWidth: 1.9 })
		                    ),
		                    React.createElement("button", {
		                      type: "button",
		                      className: "playground-files-header-icon-button is-plain playground-metronome-inspector-docs",
		                      onClick: () => window.open("http://localhost:3001/developers", "_blank", "noopener,noreferrer"),
		                      title: "Open Metronome docs",
		                      "aria-label": "Open Metronome docs",
		                    },
		                      React.createElement(LibraryBig, { width: 15, height: 15, strokeWidth: 1.9 })
		                    ),
		                    !canDeleteSelectedNode ? null : React.createElement("button", {
		                      type: "button",
		                      className: "playground-files-header-icon-button is-plain playground-metronome-inspector-delete",
		                      onClick: deleteSelectedNode,
		                      disabled: !canDeleteSelectedNode,
		                      title: "Delete node",
		                      "aria-label": "Delete node",
		                    },
		                      React.createElement(Trash2, { width: 15, height: 15, strokeWidth: 1.9 })
		                    )
		                  )
		                ),
		                React.createElement("div", { className: "playground-metronome-inspector-title-description" }, inspectorNodeDescription)
		              ),
              React.createElement("div", { className: "playground-metronome-inspector-body" },
                React.createElement("fieldset", {
                  className: "playground-metronome-inspector-fieldset",
                  disabled: isActiveWorkflowBuiltIn,
                  "aria-disabled": isActiveWorkflowBuiltIn ? "true" : "false",
                },
                React.createElement(MetronomeInspectorField, { className: "playground-metronome-node-name-field" },
                  renderMetronomeFieldTitle("Name"),
                  React.createElement(MetronomeInspectorInput, {
                    type: "text",
                    className: "playground-metronome-input",
                    value: rawNodeLabel,
                    placeholder: defaultNodeLabel,
                    "aria-label": "Node name",
                    disabled: isActiveWorkflowBuiltIn,
                    readOnly: isActiveWorkflowBuiltIn,
                    onChange: (event) => updateSelectedNodeData({ label: event.target.value }),
                    ...getMetronomeTextInputKeyHandlers((event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                      }
                    }),
                  })
                ),
                showTypeSelector ? React.createElement(MetronomeInspectorField, { className: "playground-metronome-node-type-field" },
                  renderMetronomeFieldTitle("Type"),
                  renderMetronomeInspectorSelect({
                    id: "node-type-" + (selectedNodeId || "selected"),
                    value: kind === "trigger" && subtype === "thread"
                      ? "thread_event"
                      : kind === "loop"
                        ? selectedLoopType
                        : subtype,
                    options: (Array.isArray(meta.subtypes) ? meta.subtypes : []).map((option) => {
                      const source = option && typeof option === "object"
                        ? option
                        : { id: option, label: option };
                      return {
                        ...source,
                        description: source.description || getMetronomeSubtypeShortDescription(kind, source.id || source.value),
                      };
                    }),
                    searchPlaceholder: "Select a type...",
                    onChange: (rawSubtype) => {
                      const nextSubtype = kind === "trigger" && rawSubtype === "thread"
                        ? "thread_event"
                        : kind === "loop"
                          ? normalizeMetronomeLoopType(rawSubtype)
                          : rawSubtype;
                      updateSelectedNodeData({
                        subtype: nextSubtype,
                        description: getMetronomeSubtypeLabel(kind, nextSubtype),
                      });
                      if (kind === "trigger") {
                        updateSelectedNodeConfigPatch({
                          triggerType: nextSubtype,
                          threadCommand: config.threadCommand || "@metronome",
                          promptExtension: config.promptExtension || "",
                          ...(
                            nextSubtype === "periodic"
                              ? buildDefaultMetronomeScheduleConfig(config)
                              : {}
                          ),
	                          ...(
	                            nextSubtype === "email"
	                              ? buildDefaultMetronomeEmailTriggerConfig(activeWorkflow, selectedNode, config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "telegram"
	                              ? buildDefaultMetronomeTelegramTriggerConfig(activeWorkflow, selectedNode, config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "function"
	                              ? buildDefaultMetronomeFunctionTriggerConfig(activeWorkflow, selectedNode, config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "github"
	                              ? buildDefaultMetronomeGitHubTriggerConfig(config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "project_ticket"
	                              ? buildDefaultMetronomeProjectTicketTriggerConfig(config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "resource"
	                              ? buildDefaultMetronomeResourceTriggerConfig(config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "database_entry"
	                              ? buildDefaultMetronomeDatabaseEntryTriggerConfig(config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "auth"
	                              ? buildDefaultMetronomeAuthTriggerConfig(config)
	                              : {}
	                          ),
	                        });
                      } else if (kind === "condition") {
                        const nextConditionType = normalizeMetronomeConditionType(nextSubtype);
                        updateSelectedNodeConfigPatch({
                          conditionType: nextConditionType,
                          databaseId: config.databaseId || "",
                          databaseName: config.databaseName || "",
                          databaseCollection: config.databaseCollection || config.collection || "",
                          databaseDocumentId: config.databaseDocumentId || "",
                          databaseFieldPath: config.databaseFieldPath || "",
                          databaseOperator: config.databaseOperator || "equals",
                          databaseCompareValue: config.databaseCompareValue || "",
                          ticketProjectId: config.ticketProjectId || "",
                          ticketProjectName: config.ticketProjectName || "",
                          ticketId: config.ticketId || "",
                          ticketStatusOperator: config.ticketStatusOperator || "equals",
                          ticketStatusValue: config.ticketStatusValue || "planned",
                          conditions: normalizeMetronomeConditionBranches(config.conditions, nextConditionType),
                        });
                      } else if (kind === "ticket") {
                        updateSelectedNodeConfigPatch({
                          operation: nextSubtype,
                          projectId: config.projectId || "",
                          projectName: config.projectName || "",
                          ticketId: config.ticketId || "",
                          ticketTitle: config.ticketTitle || "",
                          ticketStatus: config.ticketStatus || "planned",
                          comment: config.comment || "",
                          fieldsJson: config.fieldsJson || "{\n  \"status\": \"planned\"\n}",
                        });
                      } else if (kind === "firecrawl") {
                        updateSelectedNodeConfigPatch(createDefaultMetronomeFirecrawlConfig(nextSubtype, config));
                      } else if (kind === "table") {
                        updateSelectedNodeConfigPatch(createDefaultMetronomeTableConfig(nextSubtype, config));
                  } else if (kind === "database") {
                    updateSelectedNodeConfigPatch(createDefaultMetronomeDatabaseConfig(nextSubtype, config));
                  } else if (kind === "loop") {
                    const nextLoopType = normalizeMetronomeLoopType(nextSubtype);
                    updateSelectedNodeConfigPatch(createDefaultMetronomeLoopConfig(nextLoopType, config));
                  } else if (kind === "function") {
                    updateSelectedNodeConfigPatch(createDefaultMetronomeFunctionConfig(config));
                  }
                },
              })
                ) : null,
                renderSelectedNodeSettings()
                )
		              ),
              renderMetronomeAttachmentModalPortal()
		            );
          };
`;
