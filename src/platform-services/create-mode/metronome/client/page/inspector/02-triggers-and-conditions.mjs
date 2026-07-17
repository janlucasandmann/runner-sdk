export const METRONOME_INSPECTOR_02_FRAGMENT = String.raw`                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "When"),
                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                      React.createElement("div", { className: "playground-tasks-schedule-anchor playground-metronome-schedule-anchor" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (isMetronomeSchedulePopoverOpen ? " is-active" : ""),
                          onClick: (event) => {
                            event.stopPropagation();
                            if (isMetronomeSchedulePopoverOpen && !isMetronomeSchedulePopoverClosing) {
                              closeMetronomeSchedulePopover();
                              return;
                            }
                            if (metronomeSchedulePopoverCloseTimerRef.current && typeof window !== "undefined") {
                              window.clearTimeout(metronomeSchedulePopoverCloseTimerRef.current);
                              metronomeSchedulePopoverCloseTimerRef.current = null;
                            }
                            const nextRect = event.currentTarget?.getBoundingClientRect?.();
                            setMetronomeSchedulePopoverRect(nextRect
                              ? {
                                  left: nextRect.left,
                                  right: nextRect.right,
                                  top: nextRect.top,
                                  bottom: nextRect.bottom,
                                  width: nextRect.width,
                                  height: nextRect.height,
                                }
                              : null
                            );
                            setIsMetronomeSchedulePopoverClosing(false);
                            setIsMetronomeSchedulePopoverOpen(true);
                          },
                        },
                          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, scheduleSummaryLabel || "None"),
                          React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                        ),
                        schedulePopoverLayer
                      )
                    )
                  )
                )
              );
            };
            const renderMetronomeEmailSettings = () => {
              const defaultEmailConfig = buildDefaultMetronomeEmailTriggerConfig(activeWorkflow, selectedNode, config);
              const emailLocalPart = normalizeMetronomeEmailLocalPart(config.emailLocalPart || defaultEmailConfig.emailLocalPart);
              const updateEmailLocalPart = (value, normalize = false) => {
                const nextLocalPart = normalize
                  ? normalizeMetronomeEmailLocalPart(value, emailLocalPart || defaultEmailConfig.emailLocalPart)
                  : String(value || "").replace(/@.*$/, "");
                const normalizedForAddress = normalizeMetronomeEmailLocalPart(nextLocalPart, defaultEmailConfig.emailLocalPart);
                updateSelectedNodeConfigPatch({
                  emailLocalPart: nextLocalPart,
                  emailAddress: buildMetronomeEmailAddress(normalizedForAddress),
                });
              };
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-email-address-field" },
                  renderMetronomeFieldTitle("Email address", "Forward email to this workflow-specific address to trigger the Metronome."),
                  React.createElement("div", { className: "playground-metronome-email-address-control" },
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input playground-metronome-email-local-input",
                      value: config.emailLocalPart || emailLocalPart,
                      placeholder: defaultEmailConfig.emailLocalPart,
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateEmailLocalPart(event.target.value),
                      onBlur: (event) => updateEmailLocalPart(event.target.value, true),
                    }),
                    React.createElement("span", { className: "playground-metronome-email-domain" }, "@" + METRONOME_EMAIL_DOMAIN)
                  )
                ),
                React.createElement("div", { className: "playground-metronome-email-filter-stack" },
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("From", "Optional sender filter. Leave empty to allow any sender."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.fromContains || "",
                      placeholder: "customer@company.com",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("fromContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Subject", "Optional subject filter. Use this for routing support, invoices, leads, or approvals."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.subjectContains || "",
                      placeholder: "invoice",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("subjectContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Body", "Optional body filter. Leave empty to trigger on every email sent to this address."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.bodyContains || "",
                      placeholder: "urgent",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("bodyContains", event.target.value),
                    })
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling matching emails",
                  tooltip: "Additional instructions appended to the inbound email before the workflow continues.",
                })
              );
            };
            const renderMetronomeTelegramSettings = () => {
              const defaultTelegramConfig = buildDefaultMetronomeTelegramTriggerConfig(activeWorkflow, selectedNode, config);
              const updateTelegramCommand = (value, normalize = false) => {
                const nextCommand = normalize
                  ? normalizeMetronomeTelegramCommand(value, defaultTelegramConfig.telegramCommand)
                  : String(value || "");
                updateSelectedNodeConfig("telegramCommand", nextCommand);
              };
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-telegram-command-field" },
                  renderMetronomeFieldTitle("Command", "Send this command to the Computer Agents Telegram bot to trigger this workflow."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.telegramCommand || defaultTelegramConfig.telegramCommand,
                    placeholder: "/customer_intake",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateTelegramCommand(event.target.value),
                    onBlur: (event) => updateTelegramCommand(event.target.value, true),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-email-filter-stack" },
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("From", "Optional sender filter. Leave empty to allow every Telegram sender."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.telegramFromContains || "",
                      placeholder: "jan",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("telegramFromContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("ID", "Optional exact Telegram chat filter for private chats, groups, or channels."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.telegramChatId || "",
                      placeholder: "-1001234567890",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("telegramChatId", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Message", "Optional message filter. Leave empty to trigger whenever the command matches."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.telegramMessageContains || "",
                      placeholder: "urgent",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("telegramMessageContains", event.target.value),
                    })
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling matching Telegram messages",
                  tooltip: "Additional instructions appended to the inbound Telegram message before the workflow continues.",
                })
              );
            };
            const renderMetronomeFunctionTriggerSettings = () => {
              const defaultFunctionConfig = buildDefaultMetronomeFunctionTriggerConfig(activeWorkflow, selectedNode, config);
              const payloadFields = normalizeMetronomeFunctionTriggerPayloadFields(defaultFunctionConfig.payloadFields);
              const endpointUrl = resolveMetronomeFunctionTriggerEndpointUrl(activeWorkflow, selectedNode, defaultFunctionConfig, backendUrl);
              const endpointDisplayValue = endpointUrl || "Publish to get URL";
              const commitPayloadFields = (nextFields) => {
                const normalizedFields = normalizeMetronomeFunctionTriggerPayloadFields(nextFields);
                updateSelectedNodeConfigPatch({
                  payloadFields: normalizedFields,
                  payloadSchemaJson: JSON.stringify(buildMetronomeFunctionTriggerPayloadSchema(normalizedFields), null, 2),
                  samplePayloadJson: JSON.stringify(buildMetronomeFunctionTriggerSamplePayload(normalizedFields), null, 2),
                  expectedPayload: buildMetronomeFunctionTriggerSamplePayload(normalizedFields),
                });
              };
              const copyFunctionEndpoint = () => {
                if (!endpointUrl || typeof navigator === "undefined" || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") return;
                void navigator.clipboard.writeText(endpointUrl);
              };
              const updatePayloadField = (rowId, patch) => {
                commitPayloadFields(payloadFields.map((field) => field.id === rowId ? { ...field, ...patch } : field));
              };
              const removePayloadField = (rowId) => {
                if (payloadFields.length <= 1) return;
                commitPayloadFields(payloadFields.filter((field) => field.id !== rowId));
              };
              const addPayloadField = () => {
                commitPayloadFields([...payloadFields, createMetronomeFunctionTriggerPayloadField()]);
              };
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-function-trigger-endpoint-field" },
                  renderMetronomeFieldTitle("Endpoint", "Publishing this workflow deploys a Computer Agents cloud function that forwards requests to this workflow."),
                  React.createElement("div", { className: "playground-metronome-function-trigger-endpoint-control" },
                    React.createElement("input", {
                      type: "text",
                      readOnly: true,
                      className: "playground-metronome-input",
                      value: endpointDisplayValue,
                      onFocus: (event) => event.currentTarget.select(),
                    }),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-function-trigger-endpoint-copy",
                      disabled: !endpointUrl,
                      onClick: copyFunctionEndpoint,
                      title: endpointUrl ? "Copy endpoint" : "Publish to get URL",
                      "aria-label": "Copy endpoint",
                    }, React.createElement(Copy, { width: 13, height: 13, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-switch-row is-workflow-context" },
                  React.createElement("div", { className: "playground-metronome-switch-copy" },
                    React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                      React.createElement("span", null, "Require API key"),
                      renderMetronomeFieldTooltip("When enabled, callers must include a valid Computer Agents API key to invoke this workflow function.")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-switch" + (defaultFunctionConfig.functionRequireApiKey ? " is-on" : ""),
                    role: "switch",
                    "aria-checked": defaultFunctionConfig.functionRequireApiKey ? "true" : "false",
                    onClick: () => {
                      const nextRequireApiKey = !defaultFunctionConfig.functionRequireApiKey;
                      updateSelectedNodeConfigPatch({
                        functionRequireApiKey: nextRequireApiKey,
                        requireApiKey: nextRequireApiKey,
                        authentication: nextRequireApiKey ? "api_key" : "public",
                      });
                    },
                    "aria-label": "Require API key",
                  })
                ),
                React.createElement("div", {
                  className: "playground-metronome-field playground-metronome-function-trigger-payload-field",
                  onMouseDown: stopMetronomePointerPropagation,
                  onPointerDown: stopMetronomePointerPropagation,
                  onClick: stopMetronomePointerPropagation,
                },
                  renderMetronomeFieldTitle("Payload", "Define the expected request payload. These keys become available as dynamic content for downstream nodes."),
                  React.createElement("div", { className: "playground-metronome-function-trigger-payload-builder" },
                    React.createElement("div", { className: "playground-metronome-function-trigger-payload-rows" },
                      payloadFields.map((field, index) => {
                        const rowId = field.id || "payload-" + index;
                        return React.createElement("div", {
                          key: rowId,
                          className: "playground-metronome-function-trigger-payload-row",
                          onMouseDown: stopMetronomePointerPropagation,
                          onPointerDown: stopMetronomePointerPropagation,
                          onClick: stopMetronomePointerPropagation,
                        },
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: field.key || "",
                            placeholder: "key",
                            onMouseDown: stopMetronomePointerPropagation,
                            onPointerDown: stopMetronomePointerPropagation,
                            onClick: stopMetronomePointerPropagation,
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => updatePayloadField(rowId, { key: event.target.value, name: event.target.value }),
                          }),
                          renderMetronomeInspectorSelect({
                            id: "function-trigger-payload-type-" + (selectedNodeId || "selected") + "-" + rowId,
                            value: normalizeMetronomeFunctionTriggerPayloadType(field.type),
                            options: METRONOME_FUNCTION_TRIGGER_PAYLOAD_TYPE_OPTIONS.map((option) => ({
                              id: option.id,
                              label: option.label,
                              description: "Expected " + option.label.toLowerCase() + " value in the request payload.",
                            })),
                            searchPlaceholder: "Select type...",
                            onChange: (nextType) => updatePayloadField(rowId, { type: normalizeMetronomeFunctionTriggerPayloadType(nextType) }),
                          }),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-function-header-delete",
                            disabled: payloadFields.length <= 1,
                            "aria-label": "Delete payload field",
                            onMouseDown: stopMetronomePointerPropagation,
                            onPointerDown: stopMetronomePointerPropagation,
                            onClick: (event) => {
                              stopMetronomePointerPropagation(event);
                              removePayloadField(rowId);
                            },
                          }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
                        );
                      })
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-function-trigger-payload-add",
                      onMouseDown: stopMetronomePointerPropagation,
                      onPointerDown: stopMetronomePointerPropagation,
                      onClick: (event) => {
                        stopMetronomePointerPropagation(event);
                        addPayloadField();
                      },
                    },
                      React.createElement(Plus, { width: 12, height: 12, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Add payload field")
                    )
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling function calls",
                  tooltip: "Additional instructions appended to the function request payload before the workflow continues.",
                })
              );
            };
            const renderMetronomeGitHubSettings = () => {
              const defaultGitHubConfig = buildDefaultMetronomeGitHubTriggerConfig(config);
              const webhookEndpoint = typeof window !== "undefined" && window.location
                ? window.location.origin.replace(/\/$/, "") + "/api/real/metronomes/github/inbound"
                : "/api/real/metronomes/github/inbound";
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Webhook", "Add this URL as a GitHub webhook endpoint. GitHub events that match the filters below will start this workflow."),
                  React.createElement("input", {
                    type: "text",
                    readOnly: true,
                    className: "playground-metronome-input",
                    value: webhookEndpoint,
                    onFocus: (event) => event.currentTarget.select(),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Event", "Choose the GitHub webhook event that should trigger this workflow."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: normalizeMetronomeGitHubEventType(config.githubEventType || defaultGitHubConfig.githubEventType),
                    onChange: (event) => updateSelectedNodeConfig("githubEventType", normalizeMetronomeGitHubEventType(event.target.value)),
                  },
                    METRONOME_GITHUB_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-metronome-email-filter-stack" },
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Repository", "Optional repository filter. Use owner/repo or a partial repository name."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubRepositoryContains || "",
                      placeholder: "computer-agents/platform",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubRepositoryContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Branch", "Optional branch, tag, or ref filter. Useful for production branches or release tags."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubBranchContains || "",
                      placeholder: "main",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubBranchContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Actor", "Optional GitHub user or bot filter."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubActorContains || "",
                      placeholder: "github-actions",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubActorContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Action", "Optional action filter, for example opened, closed, completed, or requested."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubActionContains || "",
                      placeholder: "opened",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubActionContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Payload", "Optional text filter across title, body, commit message, and serialized webhook payload."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubPayloadContains || "",
                      placeholder: "deploy",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubPayloadContains", event.target.value),
                    })
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling matching GitHub events",
                  tooltip: "Additional instructions appended to the GitHub webhook event before the workflow continues.",
                })
              );
            };
            const renderMetronomeProjectTicketSettings = () => {
              const defaultTicketConfig = buildDefaultMetronomeProjectTicketTriggerConfig(config);
              const selectedTicketEventType = normalizeMetronomeProjectTicketEventType(config.ticketEventType || defaultTicketConfig.ticketEventType);
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                  renderMetronomeFieldTitle("Project", "Only ticket events from this project will start the workflow."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.ticketProjectId || config.projectId || "",
                    onChange: (event) => {
                      const nextProjectId = event.target.value;
                      const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                      updateSelectedNodeConfigPatch({
                        ticketProjectId: nextProjectId,
                        ticketProjectName: nextProject?.name || "",
                        projectId: nextProjectId,
                        projectName: nextProject?.name || "",
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, "Select project"),
                    metronomeProjectOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                  renderMetronomeFieldTitle("Ticket event", "Choose whether this workflow starts on a status transition or a new comment."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: selectedTicketEventType,
                    onChange: (event) => {
                      const nextEventType = normalizeMetronomeProjectTicketEventType(event.target.value);
                      updateSelectedNodeConfigPatch({
                        ticketEventType: nextEventType,
                        ticketFromStatus: config.ticketFromStatus || defaultTicketConfig.ticketFromStatus,
                        ticketToStatus: config.ticketToStatus || defaultTicketConfig.ticketToStatus,
                        ticketCommentContains: config.ticketCommentContains || "",
                      });
                    },
                  },
                    METRONOME_PROJECT_TICKET_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                selectedTicketEventType === "status_changed"
                  ? React.createElement("div", { className: "playground-metronome-email-filter-stack" },
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                        renderMetronomeFieldTitle("From status", "The previous ticket status. Leave as Any status to match every source status."),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: normalizeMetronomeProjectTicketStatus(config.ticketFromStatus || defaultTicketConfig.ticketFromStatus),
                          onChange: (event) => updateSelectedNodeConfig("ticketFromStatus", normalizeMetronomeProjectTicketStatus(event.target.value)),
                        },
                          METRONOME_PROJECT_TICKET_STATUS_OPTIONS.map((option) =>
                            React.createElement("option", { key: option.id, value: option.id }, option.label)
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                        renderMetronomeFieldTitle("To status", "The new ticket status. Use this for transitions such as To do -> In review."),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: normalizeMetronomeProjectTicketStatus(config.ticketToStatus || defaultTicketConfig.ticketToStatus),
                          onChange: (event) => updateSelectedNodeConfig("ticketToStatus", normalizeMetronomeProjectTicketStatus(event.target.value)),
                        },
                          METRONOME_PROJECT_TICKET_STATUS_OPTIONS.map((option) =>
                            React.createElement("option", { key: option.id, value: option.id }, option.label)
                          )
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                      renderMetronomeFieldTitle("Comment contains", "Optional substring filter for the added ticket comment."),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-metronome-input",
                        value: config.ticketCommentContains || "",
                        placeholder: "needs review",
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateSelectedNodeConfig("ticketCommentContains", event.target.value),
                      })
                    ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling matching ticket events",
                  tooltip: "Additional instructions appended to the project ticket event before the workflow continues.",
                })
              );
            };
            const renderMetronomeResourceEventSettings = () => {
              const defaultResourceConfig = buildDefaultMetronomeResourceTriggerConfig(config);
              const selectedResourceEventType = normalizeMetronomeResourceEventType(config.resourceEventType || defaultResourceConfig.resourceEventType);
              const resourceOptions = selectedResourceEventType === "function_deployed" ? metronomeFunctionOptions : metronomeWebAppOptions;
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Event", "Choose which kind of successful deployment starts this workflow."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: selectedResourceEventType,
                    onChange: (event) => {
                      const nextEventType = normalizeMetronomeResourceEventType(event.target.value);
                      updateSelectedNodeConfigPatch({
                        resourceEventType: nextEventType,
                        resourceId: "",
                        resourceName: "",
                        resourceKind: nextEventType === "function_deployed" ? "function" : "web_app",
                      });
                    },
                  },
                    METRONOME_RESOURCE_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Resource", "Select a specific resource or leave empty to match every resource of this deployment type."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.resourceId || "",
                    onChange: (event) => {
                      const nextResourceId = event.target.value;
                      const nextResource = resourceOptions.find((option) => option.id === nextResourceId) || null;
                      updateSelectedNodeConfigPatch({
                        resourceId: nextResourceId,
                        resourceName: nextResource?.name || "",
                        resourceKind: selectedResourceEventType === "function_deployed" ? "function" : (nextResource?.kind || "web_app"),
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, resourceOptions.length ? "Any matching resource" : "No matching resources available"),
                    resourceOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling successful deployments",
                  tooltip: "Additional instructions appended to the deployment event before the workflow continues.",
                })
              );
            };
            const renderMetronomeDatabaseEntryTriggerSettings = () => {
              const defaultDatabaseConfig = buildDefaultMetronomeDatabaseEntryTriggerConfig(config);
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Event", "Document added events can start this workflow when a new document is inserted."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.databaseEventType || defaultDatabaseConfig.databaseEventType,
                    onChange: () => updateSelectedNodeConfig("databaseEventType", "document_created"),
                  },
                    METRONOME_DATABASE_ENTRY_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Database", "Select the database resource that should emit document events."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.databaseId || "",
                    onChange: (event) => {
                      const nextDatabaseId = event.target.value;
                      const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                      updateSelectedNodeConfigPatch({
                        databaseId: nextDatabaseId,
                        databaseName: nextDatabase?.name || "",
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, metronomeDatabaseOptions.length ? "Select database" : "No databases available"),
                    metronomeDatabaseOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Collection", "Only documents added to this collection will start the workflow."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.databaseCollection || "",
                    placeholder: "customers",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("databaseCollection", event.target.value),
                  })
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling new database documents",
                  tooltip: "Additional instructions appended to the new document event before the workflow continues.",
                })
              );
            };
            const renderMetronomeAuthEventSettings = () => {
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Event", "Start this workflow when a new user registers through an auth resource."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.authEventType || "user_registered",
                    onChange: () => updateSelectedNodeConfig("authEventType", "user_registered"),
                  },
                    METRONOME_AUTH_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Resource", "Select a specific auth resource or leave empty to match all auth registrations."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.authResourceId || "",
                    onChange: (event) => {
                      const nextAuthResourceId = event.target.value;
                      const nextAuthResource = metronomeAuthOptions.find((option) => option.id === nextAuthResourceId) || null;
                      updateSelectedNodeConfigPatch({
                        authResourceId: nextAuthResourceId,
                        authResourceName: nextAuthResource?.name || "",
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, metronomeAuthOptions.length ? "Any auth resource" : "No auth resources available"),
                    metronomeAuthOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Email", "Optional filter for a domain, account, or test user."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.authEmailContains || "",
                    placeholder: "@company.com",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("authEmailContains", event.target.value),
                  })
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling new registrations",
                  tooltip: "Additional instructions appended to the auth registration event before the workflow continues.",
                })
              );
            };
            const renderTriggerSettings = () => {
              const triggerFields = selectedTriggerType === "thread_event" || selectedTriggerType === "thread"
		                ? React.createElement(React.Fragment, null,
	                    React.createElement("div", { className: "playground-metronome-field" },
	                      renderMetronomeFieldTitle("Command", "Runs immediately when a user message starts with this command."),
	                      React.createElement("input", {
	                        type: "text",
	                        className: "playground-metronome-input",
                        value: config.threadCommand || "@metronome",
                        placeholder: "@campaign",
	                        onChange: (event) => updateSelectedNodeConfig("threadCommand", event.target.value),
	                        onBlur: (event) => updateSelectedNodeConfig("threadCommand", normalizedThreadCommand(event.target.value)),
	                      })
	                    ),
	                    renderMetronomeRichTextField({
	                      fieldKey: "promptExtension",
		                      title: "Instructions",
		                      placeholder: "Add instructions here",
	                      tooltip: "Additional instructions appended to the triggering message before the workflow continues.",
	                    })
                  )
                : selectedTriggerType === "periodic"
                  ? renderMetronomeScheduleSettings()
	                : selectedTriggerType === "email"
	                  ? renderMetronomeEmailSettings()
	                : selectedTriggerType === "telegram"
	                  ? renderMetronomeTelegramSettings()
	                : selectedTriggerType === "function"
	                  ? renderMetronomeFunctionTriggerSettings()
	                : selectedTriggerType === "github"
	                  ? renderMetronomeGitHubSettings()
	                : selectedTriggerType === "project_ticket"
	                  ? renderMetronomeProjectTicketSettings()
	                : selectedTriggerType === "resource"
	                  ? renderMetronomeResourceEventSettings()
	                : selectedTriggerType === "database_entry"
	                  ? renderMetronomeDatabaseEntryTriggerSettings()
	                : selectedTriggerType === "auth"
	                  ? renderMetronomeAuthEventSettings()
	                : React.createElement("div", { className: "playground-metronome-field" },
	                  React.createElement("div", { className: "playground-metronome-field-hint" }, "Select a configured trigger type to decide how this workflow starts.")
	                );
              return React.createElement(React.Fragment, null,
                triggerFields,
                React.createElement("div", { className: "playground-metronome-trigger-evaluate-row" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-trigger-evaluate-link",
                    onClick: () => setIsMetronomeTriggerDiagnosticsModalOpen(true),
                  }, "Evaluate Node")
                ),
                renderMetronomeTriggerDiagnosticsModal()
              );
            };
            const renderConditionSettings = () => {
              const isFixedBranches = selectedConditionType === "database_document_field" || selectedConditionType === "ticket_status";
              const branchRulePlaceholder = selectedConditionType === "json"
                ? "input.0.summary contains 'ready'"
                : selectedConditionType === "previous_output_contains"
                  ? "Substring to match"
                  : "Resolved value";
              const branchLabelPlaceholder = selectedConditionType === "json"
                ? "Branch label"
                : selectedConditionType === "previous_output_contains"
                  ? "Branch label"
                  : "Branch";
              const ticketStatusOptions = [
                { id: "planned", label: "Planned" },
                { id: "in_review", label: "In Review" },
                { id: "blocked", label: "Blocked" },
                { id: "done", label: "Done" },
                { id: "canceled", label: "Canceled" },
              ];
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field-hint playground-metronome-type-description" }, renderConditionHint()),
                selectedConditionType === "database_document_field"
                  ? React.createElement("div", { className: "playground-metronome-condition-fields" },
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Database"),
                        renderMetronomeInspectorSelect({
                          id: "condition-database-" + (selectedNodeId || "selected"),
                          value: config.databaseId || "",
                          options: [
                            { id: "", label: metronomeDatabaseOptions.length ? "Select database" : "No databases available" },
                            ...metronomeDatabaseOptions.map((option) => ({
                              id: option.id,
                              label: option.name,
                              description: option.description || option.id || "",
                            })),
                          ],
                          searchPlaceholder: "Select database...",
                          onChange: (nextDatabaseId) => {
                            const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                            updateSelectedNodeConfigPatch({
                              databaseId: nextDatabaseId,
                              databaseName: nextDatabase?.name || "",
                            });
                          },
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Collection"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseCollection || config.collection || "",
                          placeholder: "customers",
                          onChange: (event) => updateSelectedNodeConfig("databaseCollection", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Document"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseDocumentId || "",
                          placeholder: "doc_123 or {{ input.0.summary }}",
                          onChange: (event) => updateSelectedNodeConfig("databaseDocumentId", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Field"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseFieldPath || "",
                          placeholder: "status",
                          onChange: (event) => updateSelectedNodeConfig("databaseFieldPath", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Operator"),
                        renderMetronomeInspectorSelect({
                          id: "condition-database-operator-" + (selectedNodeId || "selected"),
                          value: config.databaseOperator || "equals",
                          options: [
                            { id: "equals", label: "Equals" },
                            { id: "not_equals", label: "Not equals" },
                            { id: "contains", label: "Contains" },
                            { id: "not_contains", label: "Not contains" },
                          ],
                          onChange: (nextValue) => updateSelectedNodeConfig("databaseOperator", nextValue),
                          searchPlaceholder: "Select operator...",
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Comparison"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseCompareValue || "",
                          placeholder: "active",
                          onChange: (event) => updateSelectedNodeConfig("databaseCompareValue", event.target.value),
                        })
                      )
                    )
                  : null,
                selectedConditionType === "ticket_status"
                  ? React.createElement("div", { className: "playground-metronome-condition-fields" },
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Project"),
                        renderMetronomeInspectorSelect({
                          id: "condition-ticket-project-" + (selectedNodeId || "selected"),
                          value: config.ticketProjectId || "",
                          options: [
                            { id: "", label: metronomeProjectOptions.length ? "Select project" : "No projects available" },
                            ...metronomeProjectOptions.map((option) => ({
                              id: option.id,
                              label: option.name,
                              description: option.description || option.id || "",
                            })),
                          ],
                          searchPlaceholder: "Select project...",
                          onChange: (nextProjectId) => {
                            const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                            updateSelectedNodeConfigPatch({
                              ticketProjectId: nextProjectId,
                              ticketProjectName: nextProject?.name || "",
                            });
                          },
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Ticket ID"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.ticketId || "",
                          placeholder: "ticket_123",
                          onChange: (event) => updateSelectedNodeConfig("ticketId", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Operator"),
                        renderMetronomeInspectorSelect({
                          id: "condition-ticket-operator-" + (selectedNodeId || "selected"),
                          value: config.ticketStatusOperator || "equals",
                          options: [
                            { id: "equals", label: "Equals" },
                            { id: "not_equals", label: "Not equals" },
                          ],
                          onChange: (nextValue) => updateSelectedNodeConfig("ticketStatusOperator", nextValue),
                          searchPlaceholder: "Select operator...",
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Status"),
                        renderMetronomeInspectorSelect({
                          id: "condition-ticket-status-" + (selectedNodeId || "selected"),
                          value: config.ticketStatusValue || "planned",
                          options: ticketStatusOptions,
                          onChange: (nextValue) => updateSelectedNodeConfig("ticketStatusValue", nextValue),
                          searchPlaceholder: "Select status...",
                        })
                      )
                    )
                  : null,
                isFixedBranches
                  ? null
                  : React.createElement("div", { className: "playground-metronome-field playground-metronome-condition-editor-field" },
                    React.createElement("div", { className: "playground-metronome-condition-editor" },
                      conditionBranches.filter((branch) => branch.id !== "else").map((branch, branchIndex) => {
                        const isLockedBranch = isFixedBranches;
                        const branchKindLabel = branchIndex === 0
                            ? "If"
                            : "Else if";
                        return React.createElement("div", {
                          key: branch.id,
                          className: "playground-metronome-condition-editor-row" + (isFixedBranches ? " is-fixed" : ""),
                        },
                          React.createElement("div", { className: "playground-metronome-condition-editor-row-header" },
                            React.createElement("span", { className: "playground-metronome-condition-editor-row-kind" }, branchKindLabel),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-metronome-condition-editor-remove",
                              disabled: isLockedBranch || editableConditionBranchCount <= 1,
                              "aria-label": "Remove condition branch",
                              onClick: () => removeConditionBranch(branch.id),
                            }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.9 }))
                          ),
                          React.createElement("div", { className: "playground-metronome-condition-editor-row-fields" },
                            React.createElement("input", {
                              type: "text",
                              className: "playground-metronome-input",
                              value: branch.label || "",
                              placeholder: branchLabelPlaceholder,
                              disabled: isLockedBranch,
                              ...getMetronomeTextInputKeyHandlers(),
                              onChange: (event) => updateConditionBranch(branch.id, { label: event.target.value }),
                            }),
                            React.createElement("input", {
                              type: "text",
                              className: "playground-metronome-input",
                              value: branch.rule || "",
                              placeholder: branchRulePlaceholder,
                              disabled: isLockedBranch,
                              ...getMetronomeTextInputKeyHandlers(),
                              onChange: (event) => updateConditionBranch(branch.id, { rule: event.target.value }),
                            })
                          )
                        );
                      }),
                      canAddConditionBranches
                        ? React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-condition-editor-add",
                            onClick: addConditionBranch,
                          },
                            React.createElement(Plus, { width: 13, height: 13, strokeWidth: 2 }),
                            React.createElement("span", null, "Add")
                          )
                        : null
                    )
                  )
              );
            };
            const renderLoopSettings = () => {
              const loopConfig = createDefaultMetronomeLoopConfig(selectedLoopType, config);
              const ticketStatusOptions = [
                { id: "planned", label: "Planned" },
                { id: "in_review", label: "In Review" },
                { id: "blocked", label: "Blocked" },
                { id: "done", label: "Done" },
                { id: "canceled", label: "Canceled" },
              ];
              const renderMaxIterationsField = (
                label = "Safety limit",
                description = "Maximum loop iterations before the workflow stops to prevent runaway automation.",
                className = ""
              ) => React.createElement("div", { className: ("playground-metronome-field " + className).trim() },
                renderMetronomeFieldTitle(label, description),
                React.createElement("input", {
                  type: "number",
                  min: 1,
                  max: 500,
                  className: "playground-metronome-input",
                  value: loopConfig.maxIterations,
                  onKeyDown: stopMetronomeInputKeyPropagation,
                  onKeyUp: stopMetronomeInputKeyPropagation,
                  onChange: (event) => updateSelectedNodeConfig("maxIterations", Math.max(1, Number(event.target.value) || 1)),
                })
              );
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field-hint playground-metronome-type-description playground-metronome-loop-type-description" },
                  selectedLoopType === "fixed_count"
                    ? "Runs the enclosed steps a fixed number of times."
                    : selectedLoopType === "workflow_context_contains"
                      ? "Runs enclosed steps until the accumulated workflow summaries contain the target text."
                      : selectedLoopType === "input_items"
                        ? "Runs enclosed steps for each item or batch from a previous node output."
                        : selectedLoopType === "project_tickets"
                          ? "Runs enclosed steps while matching project tickets still exist."
                          : selectedLoopType === "database_documents"
                            ? "Prepares matching documents from a database collection for downstream steps."
                            : "Runs enclosed steps while matching database documents still exist."
                ),
                selectedLoopType === "fixed_count"
                  ? React.createElement("div", { className: "playground-metronome-field" },
                      renderMetronomeFieldTitle("Iterations"),
                      React.createElement("input", {
                        type: "number",
                        min: 1,
                        max: 500,
                        className: "playground-metronome-input",
                        value: loopConfig.iterations,
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateSelectedNodeConfig("iterations", Math.max(1, Number(event.target.value) || 1)),
                      })
                    )
                  : null,
                selectedLoopType === "workflow_context_contains"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Run summary contains", "The loop stops once the accumulated workflow context contains this text."),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: loopConfig.contextContainsText,
                          placeholder: "ready for review",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("contextContainsText", event.target.value),
                        })
                      ),
                      renderMaxIterationsField()
                    )
                  : null,
                selectedLoopType === "input_items"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-loop-input-binding-field" },
                        renderMetronomeFieldTitle("Input binding", "Use previous.batches for table batches, previous.records for rows, or loop.records inside nested loops."),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: loopConfig.inputBinding,
                          placeholder: "previous.batches",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("inputBinding", event.target.value),
                        })
                      ),
                      renderMaxIterationsField(
                        "Item limit",
                        "Maximum number of input items or batches to expose to enclosed steps.",
                        "playground-metronome-loop-item-limit-field"
                      )
                    )
                  : null,
                selectedLoopType === "project_tickets"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Project"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: loopConfig.projectId,
                          onChange: (event) => {
                            const nextProjectId = event.target.value;
                            const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                            updateSelectedNodeConfigPatch({
                              projectId: nextProjectId,
                              projectName: nextProject?.name || "",
                            });
                          },
                        },
                          React.createElement("option", { value: "" }, "Select project"),
                          metronomeProjectOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Repeat while tickets are"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: loopConfig.ticketStatusValue,
                          onChange: (event) => updateSelectedNodeConfig("ticketStatusValue", event.target.value),
                        },
                          ticketStatusOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.label))
                        )
                      ),
                      renderMaxIterationsField()
                    )
                  : null,
                (selectedLoopType === "database_field" || selectedLoopType === "database_documents")
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Database"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: loopConfig.databaseId,
                          onChange: (event) => {
                            const nextDatabaseId = event.target.value;
                            const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                            updateSelectedNodeConfigPatch({
                              databaseId: nextDatabaseId,
                              databaseName: nextDatabase?.name || "",
                            });
                          },
                        },
                          React.createElement("option", { value: "" }, "Select database"),
                          metronomeDatabaseOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Collection"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: loopConfig.databaseCollection,
                          placeholder: "customers",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("databaseCollection", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-condition-compact-grid" },
                        React.createElement("div", { className: "playground-metronome-field" },
                          renderMetronomeFieldTitle(
                            selectedLoopType === "database_documents" ? "Filter field path" : "Field path",
                            selectedLoopType === "database_documents"
                              ? "Optional. Leave empty to include every document in the collection."
                              : "Field path checked before repeating the loop."
                          ),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: loopConfig.databaseFieldPath,
                            placeholder: "status",
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => updateSelectedNodeConfig("databaseFieldPath", event.target.value),
                          })
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          renderMetronomeFieldTitle("Operator"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: loopConfig.databaseOperator,
                            onChange: (event) => updateSelectedNodeConfig("databaseOperator", event.target.value),
                          },
                            React.createElement("option", { value: "equals" }, "Equals"),
                            React.createElement("option", { value: "not_equals" }, "Not equals"),
                            React.createElement("option", { value: "contains" }, "Contains"),
                            React.createElement("option", { value: "not_contains" }, "Not contains"),
                            React.createElement("option", { value: "exists" }, "Exists"),
                            React.createElement("option", { value: "not_exists" }, "Does not exist")
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Compare value"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: loopConfig.databaseCompareValue,
                          placeholder: "pending",
                          disabled: loopConfig.databaseOperator === "exists" || loopConfig.databaseOperator === "not_exists",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("databaseCompareValue", event.target.value),
                        })
                      ),
                      renderMaxIterationsField(
                        selectedLoopType === "database_documents" ? "Document limit" : "Safety limit",
                        selectedLoopType === "database_documents"
                          ? "Maximum number of documents exposed to downstream nodes."
                          : "Maximum loop iterations before the workflow stops to prevent runaway automation."
                      )
                    )
                  : null
              );
            };
            const getMetronomeBackendUrl = () => {
              let normalizedBackendUrl = String(backendUrl || "/api/real").trim() || "/api/real";
              while (normalizedBackendUrl.length > 1 && normalizedBackendUrl.endsWith("/")) {
                normalizedBackendUrl = normalizedBackendUrl.slice(0, -1);
              }
              return normalizedBackendUrl;
            };
            const resolveMetronomeAttachmentEnvironment = (nodeConfig = config) => {
              const configuredEnvironmentId = String(nodeConfig.environmentId || "").trim();
              if (configuredEnvironmentId) {
                const configuredEnvironment = metronomeComputerOptions.find((environment) => String(environment.id) === configuredEnvironmentId);
                if (configuredEnvironment) {
                  return configuredEnvironment;
                }
              }
              const configuredProjectId = String(nodeConfig.projectId || "").trim();
              if (configuredProjectId) {
                const configuredProject = metronomeProjectOptions.find((project) => String(project.id) === configuredProjectId);
                const projectEnvironmentId = getMetronomeProjectEnvironmentId(configuredProject);
                if (projectEnvironmentId) {
                  const projectEnvironment = metronomeComputerOptions.find((environment) => String(environment.id) === projectEnvironmentId);
                  if (projectEnvironment) {
                    return projectEnvironment;
                  }
                }
              }
              return metronomeComputerOptions[0] || null;
            };
            const loadMetronomeEnvironmentFileInventory = async (environmentId) => {
              const normalizedEnvironmentId = String(environmentId || "").trim();
              if (!normalizedEnvironmentId) {
                setMetronomeEnvironmentFilePickerState({ status: "error", error: "Select a computer before attaching files from the computer." });
                setMetronomeEnvironmentFilePickerInventory([]);
                return false;
              }
              setMetronomeEnvironmentFilePickerState({ status: "loading", error: "" });
              setMetronomeEnvironmentFilePickerInventory([]);
              setMetronomeEnvironmentFilePickerExpandedFolders([]);
              setMetronomeEnvironmentFilePickerSelectedPaths([]);
              try {
                const filesUrl = buildPlaygroundEnvironmentFilesListUrl(getMetronomeBackendUrl(), normalizedEnvironmentId, "", -1);
                const response = await fetch(filesUrl, {
                  method: "GET",
                  headers: requestHeaders || {},
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load computer files.");
                }
                const nextInventory = normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data);
                setMetronomeEnvironmentFilePickerInventory(nextInventory);
                setMetronomeEnvironmentFilePickerState({ status: "ready", error: "" });
                return true;
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to load computer files.";
                setMetronomeEnvironmentFilePickerInventory([]);
                setMetronomeEnvironmentFilePickerState({ status: "error", error: errorMessage });
                return false;
              }
            };
            const openMetronomeEnvironmentFilePicker = () => {
`;
