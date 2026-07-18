          const getEmbeddedServerKindLabel = (item) => {
            if (item?.resourceType === "database" || item?.kind === "database") {
              return "Database";
            }
            if (item?.kind === "function") {
              return "Function";
            }
            if (item?.kind === "api") {
              return "API";
            }
  	          if (item?.kind === "auth") {
  	            return "Authentication";
  	          }
            if (item?.kind === "agent_runtime") {
              return "Agent Runtime";
            }
            if (item?.kind === "secrets") {
              return "Secrets";
            }
            if (item?.kind === "payments") {
              return "Payments";
            }
            return "Web App";
          };
          const renderDatabaseExportControl = () => {
            const activeDatabase = draftDatabase?.id === selectedDatabaseId ? draftDatabase : null;
            const normalizedDatabaseId = String(activeDatabase?.id || "").trim();
            const exportDisabled = Boolean(
              isSelectedDatabaseTemplatePreview
              || isPlaygroundResourceTemplatePreviewRecord(activeDatabase)
              || databaseExporting
              || !normalizedDatabaseId
              || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID
            );
  
            return renderPlaygroundPlatformPopup({
              open: databaseExportMenuOpen,
              shellRef: databaseExportMenuRef,
              shellClassName: "playground-database-export-shell",
              menuClassName: "playground-database-export-menu",
              trigger: React.createElement(PlatformPrimaryButton, {
                  size: "small",
                  active: databaseExportMenuOpen,
                  onClick: () => {
                    setDatabaseActionsPopoverOpen(false);
                    setDatabaseExportMenuOpen((current) => !current);
                  },
                  disabled: exportDisabled,
                  title: "Export database",
                  "aria-label": "Export database",
                  "aria-haspopup": "menu",
                  "aria-expanded": databaseExportMenuOpen ? "true" : "false",
                },
                databaseExporting
                  ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                  : React.createElement(Download, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, databaseExporting ? "Exporting..." : "Export"),
                React.createElement("span", {
                  className: "playground-agents-detail-publish-divider",
                  "aria-hidden": "true",
                }),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })
              ),
              menuProps: {
                role: "menu",
                onClick: (event) => event.stopPropagation(),
              },
              children: [
                { id: "json", label: "Export as JSON", Icon: Braces },
                { id: "csv", label: "Export as CSV", Icon: FileText },
                { id: "xml", label: "Export as XML", Icon: CodeXml },
              ].map((option) => React.createElement("button", {
                  key: option.id,
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: () => void handleExportDatabase(option.id),
                },
                React.createElement(option.Icon, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, option.label)
                )
              )),
            });
          };
          const renderCurrentResourceSettingsControl = (buttonClassName) => {
            const normalizedButtonClassName = String(buttonClassName || "playground-files-header-icon-button").trim();
            if (isServersMode && selectedServerId) {
              const activeServer = draftServer?.id === selectedServerId ? draftServer : null;
              const normalizedServerId = String(activeServer?.id || "").trim();
              const normalizedKind = canonicalizePlaygroundServerKind(activeServer?.kind);
              const isSourceDeployableResource = ["function", "web_app"].includes(normalizedKind);
              const isManagedDetailResource = ["function", "web_app", "auth", "agent_runtime", "secrets", "payments"].includes(normalizedKind);
              const serverResourceLabel = formatPlaygroundServerKindLabel(normalizedKind);
              const serverDocumentationPath = normalizedKind === "auth"
                ? "/developers/libraries/authentication"
                : normalizedKind === "agent_runtime"
                  ? "/developers/libraries/agent-runtimes"
                  : normalizedKind === "secrets"
                    ? "/developers/libraries/secrets"
                    : normalizedKind === "payments"
                      ? "/developers/libraries/payments"
                      : normalizedKind === "function"
                        ? "/developers/libraries/functions"
                        : normalizedKind === "web_app"
                          ? "/developers/libraries/web-apps"
                          : "";
              if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
                return React.createElement("button", {
                  type: "button",
                  className: normalizedButtonClassName,
                  title: "Server actions",
                  "aria-label": "Server actions",
                  disabled: true,
                }, React.createElement(isManagedDetailResource ? Ellipsis : Settings2, { width: 16, height: 16, strokeWidth: 1.8 }));
              }
              const isAuthResource = normalizedKind === "auth";
              const isAgentRuntimeResource = normalizedKind === "agent_runtime";
              const isVoiceAgentResource = normalizedKind === "voice_agent";
              const isSecretsResource = normalizedKind === "secrets";
              const isPaymentsResource = normalizedKind === "payments";
                return React.createElement("div", {
                  className: "playground-files-toolbar-anchor"
                    + (isManagedDetailResource ? " playground-thread-nav-popup-shell" : "")
                    + " playground-tasks-toolbar-popup-shell",
                  ref: serverActionsPopoverRef,
                },
                React.createElement("button", {
                  type: "button",
                  className: normalizedButtonClassName + (serverActionsPopoverOpen ? " is-active" : ""),
                  title: "Server actions",
                  "aria-label": "Server actions",
                  "aria-haspopup": "menu",
                  "aria-expanded": serverActionsPopoverOpen ? "true" : "false",
                  onClick: () => setServerActionsPopoverOpen((current) => !current),
                  disabled: serverSaveState.isSaving || serverDeploymentState.isDeploying,
                }, React.createElement(isManagedDetailResource ? Ellipsis : Settings2, { width: 16, height: 16, strokeWidth: 1.8 })),
                serverActionsPopoverOpen
                  ? React.createElement(PlatformPopupSurface, {
                      className: "playground-tasks-toolbar-popup-menu"
                        + (isManagedDetailResource ? " playground-thread-nav-popup-menu" : "")
                        + " playground-tasks-toolbar-popup-menu-animate-down-in",
                      role: "menu",
                      onClick: (event) => event.stopPropagation(),
                    },
                      isManagedDetailResource
                        ? React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "tb-popup-row playground-thread-nav-popup-static-row" },
                              React.createElement("span", { className: "tb-popup-check-slot", "aria-hidden": "true" }),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, serverResourceLabel + " ID"),
                                React.createElement("span", {
                                  className: "playground-thread-nav-popup-thread-id",
                                  title: normalizedServerId,
                                }, normalizedServerId)
                              )
                            ),
                            React.createElement("div", { className: "playground-thread-nav-popup-divider", "aria-hidden": "true" })
                          )
                        : null,
                      serverDocumentationPath
                        ? React.createElement("button", {
                            type: "button",
                            role: "menuitem",
                            className: "tb-popup-row",
                            onClick: () => {
                              setServerActionsPopoverOpen(false);
                              window.open("http://localhost:3001" + serverDocumentationPath, "_blank", "noopener,noreferrer");
                            },
                          },
                            React.createElement(BookOpen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, "Documentation")
                            )
                          )
                        : null,
                      React.createElement("button", {
                        type: "button",
                        role: "menuitem",
                        className: "tb-popup-row",
                        onClick: () => openServerRenameDialog(activeServer),
                      },
                        React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Rename")
                        )
                      ),
                      !isAuthResource && !isAgentRuntimeResource && !isVoiceAgentResource && !isSecretsResource && !isPaymentsResource
                        ? React.createElement("button", {
                            type: "button",
                            role: "menuitem",
                            className: "tb-popup-row",
                            onClick: () => {
                              setServerActionsPopoverOpen(false);
                              void handleDeployServer();
                            },
                            disabled: serverDeploymentState.isDeploying,
                          },
                            React.createElement(Rocket, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, serverDeploymentState.isDeploying ? "Deploying..." : "Deploy")
                            )
                          )
                        : null,
                      React.createElement("button", {
                        type: "button",
                        role: "menuitem",
                        className: "tb-popup-row" + (isManagedDetailResource ? " playground-tasks-detail-menu-item-danger" : ""),
                        onClick: () => {
                          setServerActionsPopoverOpen(false);
                          void handleDeleteServer(normalizedServerId);
                        },
                      },
                        React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Delete")
                        )
                      )
                    )
                  : null
              );
            }
            if (isServersMode && selectedDatabaseId) {
              const activeDatabase = draftDatabase?.id === selectedDatabaseId ? draftDatabase : null;
              const normalizedDatabaseId = String(activeDatabase?.id || "").trim();
              if (!normalizedDatabaseId || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
                return React.createElement("button", {
                  type: "button",
                  className: normalizedButtonClassName,
                  title: "Database actions",
                  "aria-label": "Database actions",
                  disabled: true,
                }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 }));
              }
              return React.createElement("div", {
                  className: "playground-files-toolbar-anchor playground-thread-nav-popup-shell playground-tasks-toolbar-popup-shell",
                  ref: databaseActionsPopoverRef,
                },
                React.createElement("button", {
                  type: "button",
                  className: normalizedButtonClassName + (databaseActionsPopoverOpen ? " is-active" : ""),
                  title: "Database actions",
                  "aria-label": "Database actions",
                  "aria-haspopup": "menu",
                  "aria-expanded": databaseActionsPopoverOpen ? "true" : "false",
                  onClick: () => {
                    setDatabaseExportMenuOpen(false);
                    setDatabaseActionsPopoverOpen((current) => !current);
                  },
                  disabled: databaseSaveState.isSaving,
                }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
                databaseActionsPopoverOpen
                  ? React.createElement(PlatformPopupSurface, {
                      className: "playground-tasks-toolbar-popup-menu playground-thread-nav-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                      role: "menu",
                      onClick: (event) => event.stopPropagation(),
                    },
                      React.createElement("div", { className: "tb-popup-row playground-thread-nav-popup-static-row" },
                        React.createElement("span", { className: "tb-popup-check-slot", "aria-hidden": "true" }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Database ID"),
                          React.createElement("span", {
                            className: "playground-thread-nav-popup-thread-id",
                            title: normalizedDatabaseId,
                          }, normalizedDatabaseId)
                        )
                      ),
                      React.createElement("div", { className: "playground-thread-nav-popup-divider", "aria-hidden": "true" }),
                      React.createElement("button", {
                        type: "button",
                        role: "menuitem",
                        className: "tb-popup-row",
                        onClick: () => {
                          setDatabaseActionsPopoverOpen(false);
                          window.open("http://localhost:3001/developers/libraries/databases", "_blank", "noopener,noreferrer");
                        },
                      },
                        React.createElement(BookOpen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Documentation")
                        )
                      ),
                      React.createElement("button", {
                        type: "button",
                        role: "menuitem",
                        className: "tb-popup-row",
                        onClick: () => openDatabaseRenameDialog(activeDatabase),
                      },
                        React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Rename")
                        )
                      ),
                      React.createElement("button", {
                        type: "button",
                        role: "menuitem",
                        className: "tb-popup-row playground-tasks-detail-menu-item-danger",
                        onClick: () => {
                          setDatabaseActionsPopoverOpen(false);
                          void handleDeleteDatabase(normalizedDatabaseId);
                        },
                      },
                        React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Delete")
                        )
                      )
                    )
                  : null
              );
            }
            return null;
          };
          const renderCurrentResourceCreateControl = (buttonClassName) => {
            if (!isServersMode && shouldShowEnvironmentHome) {
              return null;
            }
            if (
              isServersMode
              && (
                normalizedEmbeddedServerKind === "voice_agent"
                || (shouldShowEnvironmentHome && normalizedEmbeddedServerKind === "database")
              )
            ) {
              return null;
            }
            if (isServersMode && shouldShowEnvironmentHome && normalizedEmbeddedServerKind) {
              const resourceLabel = embeddedServerKindLabel || "Resource";
              const resourceDocumentationPathByKind = {
                web_app: "/developers/libraries/web-apps",
                function: "/developers/libraries/functions",
                database: "/developers/libraries/databases",
                auth: "/developers/libraries/authentication",
                agent_runtime: "/developers/libraries/agent-runtimes",
                voice_agent: "/developers/libraries/voice-agents",
                secrets: "/developers/libraries/secrets",
                payments: "/developers/libraries/payments",
              };
              const documentationUrl = "http://localhost:3001"
                + (resourceDocumentationPathByKind[normalizedEmbeddedServerKind] || "/developers");
              return renderPlaygroundPlatformPopup({
                open: resourceOverviewTopNavMenuOpen,
                shellRef: resourceOverviewTopNavMenuRef,
                shellClassName: "playground-resource-overview-topnav-actions-shell",
                menuClassName: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                trigger: React.createElement("button", {
                  type: "button",
                  className: buttonClassName + (resourceOverviewTopNavMenuOpen ? " is-active" : ""),
                  title: resourceLabel + " options",
                  "aria-label": resourceLabel + " options",
                  "aria-haspopup": "menu",
                  "aria-expanded": resourceOverviewTopNavMenuOpen ? "true" : "false",
                  onClick: () => setResourceOverviewTopNavMenuOpen((current) => !current),
                }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
                menuProps: {
                  role: "menu",
                  onClick: (event) => event.stopPropagation(),
                },
                children: React.createElement(React.Fragment, null,
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setResourceOverviewTopNavMenuOpen(false);
                      const docsWindow = window.open(documentationUrl, "_blank", "noopener,noreferrer");
                      if (docsWindow) docsWindow.opener = null;
                    },
                  },
                    React.createElement(BookOpen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, resourceLabel + " documentation")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setResourceOverviewTopNavMenuOpen(false);
                      handleCreateServer(normalizedEmbeddedServerKind);
                    },
                  },
                    React.createElement(Plus, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, "New " + resourceLabel)
                    )
                  )
                ),
              });
            }
            const shouldShowCreateLabel = String(buttonClassName || "").includes("playground-top-nav-private-chat-button");
            return React.createElement("div", { className: "playground-files-toolbar-anchor" },
              React.createElement("button", {
                type: "button",
                className: buttonClassName + ((isServersMode ? serverComposerOpen : environmentComposerOpen) ? " is-active" : ""),
                onClick: isServersMode ? () => handleCreateServer(normalizedEmbeddedServerKind) : handleCreateEnvironment,
                title: isServersMode ? "Create " + (embeddedServerKindLabel || "resource") : "Create computer",
                "aria-label": isServersMode ? "Create " + (embeddedServerKindLabel || "resource") : "Create computer",
              },
                React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 }),
                shouldShowCreateLabel
                  ? React.createElement("span", null, isServersMode ? (embeddedServerKindLabel || "Resource") : "New Computer")
                  : null
              )
            );
          };
          const renderResourcesTopActionControl = (buttonClassName) => {
            if (isServersMode && !shouldShowEnvironmentHome && selectedDatabaseId) {
              return React.createElement(React.Fragment, null,
                renderDatabaseExportControl(),
                renderCurrentResourceSettingsControl(buttonClassName)
              );
            }
            if (isServersMode && !shouldShowEnvironmentHome && selectedServerId) {
              return renderCurrentResourceSettingsControl(buttonClassName);
            }
            return renderCurrentResourceCreateControl(buttonClassName);
          };
          const shouldHideResourcesTopNavActions = environmentVersionsSidebarOpen
            || serverVersionsSidebarOpen
            || (!isServersMode && !shouldShowEnvironmentHome && Boolean(selectedEnvironmentId));
          const resourcesTopNavActions = topNavActionsContainer
            && !shouldHideResourcesTopNavActions
            && (isServersMode || !shouldShowEnvironmentHome)
            ? createPortal(
                renderResourcesTopActionControl(isServersMode ? "playground-files-header-icon-button is-plain" : "playground-top-nav-private-chat-button"),
                topNavActionsContainer
              )
            : null;
  
  	        function renderEmbeddedResourcesOverviewSection() {
  	          const isDevelopServerKindOverview = embeddedInResources && isServersMode && Boolean(normalizedEmbeddedServerKind);
  	          const isDevelopConfigureOverview = embeddedInResources && (!isServersMode || Boolean(normalizedEmbeddedServerKind));
  	          const resourcesOverviewFilterOptions = isServersMode
  	            ? (normalizedEmbeddedServerKind
                ? [
                    { id: "all", label: "All " + currentServerResourcesLabel, description: "Show every " + currentServerResourcesLabel.toLowerCase() + " resource" },
                    { id: "published", label: "Published", description: "Only show published resources" },
                  ]
                : [
                  { id: "all", label: "All Resources", description: "Show every server resource together" },
                  { id: "web_app", label: "Web Apps", description: "Only show deployed app services" },
                  { id: "function", label: "Functions", description: "Only show serverless function resources" },
                  { id: "api", label: "API", description: "Only show API resources" },
                  { id: "managed", label: "Managed", description: "Only show databases, auth, runtimes, secrets, and payments" },
                ])
              : [
                  { id: "all", label: "All Computers", description: "Show running and stopped computers together" },
                  { id: "running", label: "Running", description: "Only show active computers" },
                  { id: "stopped", label: "Stopped", description: "Only show stopped computers" },
                ];
            const resourcesOverviewSortOptions = [
              { id: "name", label: "Name (A-Z)", sortKey: "name", direction: "asc" },
              { id: "updated", label: "Recently Updated", sortKey: "updated", direction: "desc" },
            ];
            const normalizeResourcesOverviewSortDirection = (direction) =>
              direction === "desc" ? "desc" : "asc";
            const normalizedResourcesOverviewSortDirection = normalizeResourcesOverviewSortDirection(resourcesOverviewSortDirection);
            const baseOverviewItems = isServersMode ? filteredOverviewServerResources : filteredOverviewEnvironments;
            const getOverviewResourceCreatedAt = (item) => item?.createdAt || item?.metadata?.createdAt || "";
            const getOverviewResourceLastUsedAt = (item) => {
              const metadata = item?.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
                ? item.metadata
                : null;
              const billingState = metadata?.resourceBilling && typeof metadata.resourceBilling === "object" && !Array.isArray(metadata.resourceBilling)
                ? metadata.resourceBilling
                : null;
              const candidates = [
                item?.lastUsedAt,
                item?.lastRunAt,
                metadata?.lastUsedAt,
                metadata?.lastRunAt,
                item?.lastDeployedAt,
                billingState?.activeSessionLastSettledAt,
                billingState?.activeSessionStartedAt,
                billingState?.lastSettledAt,
                billingState?.activeSince,
                item?.updatedAt,
              ];
              let selected = "";
              let selectedTimestamp = 0;
              candidates.forEach((value) => {
                const timestamp = Date.parse(String(value || ""));
                if (Number.isFinite(timestamp) && timestamp > selectedTimestamp) {
                  selectedTimestamp = timestamp;
                  selected = value;
                }
              });
              return selected;
            };
            const getOverviewResourceDisplayName = (item) =>
              String(item?.name || (isServersMode ? "Untitled Server" : "Untitled Computer")).trim();
            const getOverviewResourceProfileLabel = (item) =>
              String(getPlaygroundEnvironmentComputeProfileConfig(item?.computeProfile)?.label || "Standard").trim();
            const getOverviewResourceTimestamp = (value) => {
              const timestamp = Date.parse(String(value || ""));
              return Number.isFinite(timestamp) ? timestamp : 0;
            };
            const getOverviewResourceUpdatedTimestamp = (item) =>
              getOverviewResourceTimestamp(item?.updatedAt || item?.metadata?.updatedAt || item?.createdAt || item?.metadata?.createdAt || "");
            const getOverviewResourceSortValue = (item, sortKey) => {
              switch (sortKey) {
                case "type":
                  return isServersMode ? getEmbeddedServerKindLabel(item) : getOverviewResourceProfileLabel(item);
                case "published":
                  return isServersMode ? (isOverviewResourcePublished(item) ? 1 : 0) : 0;
                case "profile":
                  return getOverviewResourceProfileLabel(item);
                case "created":
                  return getOverviewResourceTimestamp(getOverviewResourceCreatedAt(item));
                case "lastUsed":
                  return getOverviewResourceTimestamp(getOverviewResourceLastUsedAt(item));
                case "updated":
                  return getOverviewResourceUpdatedTimestamp(item);
                case "name":
                default:
                  return getOverviewResourceDisplayName(item);
              }
            };
            const compareOverviewResourceSortValues = (left, right, sortKey) => {
              const leftValue = getOverviewResourceSortValue(left, sortKey);
              const rightValue = getOverviewResourceSortValue(right, sortKey);
              if (typeof leftValue === "number" || typeof rightValue === "number") {
                const leftNumber = typeof leftValue === "number" && Number.isFinite(leftValue) ? leftValue : 0;
                const rightNumber = typeof rightValue === "number" && Number.isFinite(rightValue) ? rightValue : 0;
                if (leftNumber !== rightNumber) {
                  return leftNumber - rightNumber;
                }
              } else {
                const textComparison = String(leftValue || "").localeCompare(String(rightValue || ""), undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
                if (textComparison !== 0) {
                  return textComparison;
                }
              }
              return getOverviewResourceDisplayName(left).localeCompare(getOverviewResourceDisplayName(right), undefined, {
                numeric: true,
                sensitivity: "base",
              });
            };
            const isOverviewResourcePublished = (item) => item?.resourceType === "database"
              ? String(item?.status || "").trim().toLowerCase() === "active"
              : (
                  String(item?.status || "").trim().toLowerCase() === "deployed"
                  || Boolean(String(item?.serviceUrl || item?.customDomain || item?.cloudRunServiceName || "").trim())
                );
  	          const overviewItems = baseOverviewItems
  	            .filter((item) => {
  	              if (resourcesOverviewFilter === "all" || isDevelopServerKindOverview) {
  	                return true;
  	              }
                if (!isServersMode) {
                  const normalizedStatus = String(item?.status || "").trim().toLowerCase();
                  if (resourcesOverviewFilter === "running") {
                    return normalizedStatus === "running";
                  }
                  if (resourcesOverviewFilter === "stopped") {
                    return normalizedStatus !== "running";
                  }
                  return true;
                }
  
                if (normalizedEmbeddedServerKind && resourcesOverviewFilter === "published") {
                  return isOverviewResourcePublished(item);
                }
                const normalizedKind = item?.resourceType === "database"
                  ? "managed"
                  : canonicalizePlaygroundServerKind(item?.kind);
                if (resourcesOverviewFilter === "managed") {
                  return normalizedKind === "managed" || normalizedKind === "auth" || normalizedKind === "agent_runtime" || normalizedKind === "secrets" || normalizedKind === "payments";
                }
                return normalizedKind === resourcesOverviewFilter;
              })
              .slice()
              .sort((left, right) => {
                const baseComparison = compareOverviewResourceSortValues(left, right, resourcesOverviewSort);
                return normalizedResourcesOverviewSortDirection === "desc" ? -baseComparison : baseComparison;
              });
            const visibleOverviewComputerIds = !isServersMode
              ? overviewItems.map((item) => String(item?.id || "").trim()).filter(Boolean)
              : [];
            const selectedVisibleOverviewComputerIds = visibleOverviewComputerIds.filter((computerId) => selectedOverviewComputerIds.has(computerId));
            const allVisibleOverviewComputersSelected = visibleOverviewComputerIds.length > 0 && selectedVisibleOverviewComputerIds.length === visibleOverviewComputerIds.length;
            const getOverviewServerResourceSelectionId = (item) => {
              const resourceId = String(item?.id || "").trim();
              if (!resourceId) {
                return "";
              }
              return (item?.resourceType === "database" ? "database" : "server") + ":" + resourceId;
            };
            const visibleOverviewServerResourceIds = isServersMode
              ? overviewItems.map(getOverviewServerResourceSelectionId).filter(Boolean)
              : [];
            const selectedVisibleOverviewServerResourceIds = visibleOverviewServerResourceIds.filter((resourceId) => selectedOverviewServerResourceIds.has(resourceId));
            const allVisibleOverviewServerResourcesSelected = visibleOverviewServerResourceIds.length > 0 && selectedVisibleOverviewServerResourceIds.length === visibleOverviewServerResourceIds.length;
            const overviewTitle = isServersMode ? (embeddedServerKindPluralLabel || "Servers") : "Computers";
            const renderOverviewResourceIcon = (item) => {
              if (!isServersMode) {
                return React.createElement(HardDrive, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              if (item?.resourceType === "database") {
                return React.createElement(Database, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              const normalizedKind = canonicalizePlaygroundServerKind(item?.kind);
              if (normalizedKind === "function") {
                return React.createElement(FunctionSquare, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              if (normalizedKind === "api") {
                return React.createElement(Code2, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              if (normalizedKind === "agent_runtime") {
                return React.createElement(Bot, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              if (normalizedKind === "voice_agent") {
                return React.createElement(Mic, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              if (normalizedKind === "auth") {
                return React.createElement(Users, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              if (normalizedKind === "secrets") {
                return React.createElement(Key, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              if (normalizedKind === "payments") {
                return React.createElement(ReceiptText, { width: 17, height: 17, strokeWidth: 1.8 });
              }
              return React.createElement(Globe, { width: 17, height: 17, strokeWidth: 1.8 });
            };
            const openOverviewResourceItem = (item) => {
              setResourcesOverviewToolbarPopover("");
              return isServersMode
                ? (item?.resourceType === "database" ? handleDatabaseSelect(item.id) : handleServerSelect(item.id))
                : handleEnvironmentSelect(item.id);
            };
            const renderOverviewResourceNameCell = (item) => {
              const title = item?.name || (isServersMode ? "Untitled Server" : "Untitled Computer");
              const description = String(item?.description || (isServersMode ? getEmbeddedServerKindLabel(item) : "Computer")).trim();
              return React.createElement("div", { className: "playground-resources-overview-name-cell" },
                isServersMode
                  ? React.createElement("span", { className: "playground-resources-overview-table-icon", "aria-hidden": "true" },
                      renderOverviewResourceIcon(item)
                    )
                  : null,
                React.createElement("div", { className: "playground-resources-overview-name-copy" },
                  React.createElement("div", { className: "playground-resources-overview-name-title" }, title),
                  React.createElement("div", {
                    className: "playground-resources-overview-name-description",
                    title: description,
                  }, description)
                )
              );
            };
            const renderOverviewDateCell = (value, emptyLabel = "-") => React.createElement("div", {
              className: "playground-agents-overview-table-value is-right",
              title: value ? formatPlaygroundExactDate(value) : "",
            }, value ? formatPlaygroundFileDate(value) : emptyLabel);
  	          const renderComputerProfilesTable = () => (
              React.createElement(PlatformDataTable, {
                rows: PLAYGROUND_ENVIRONMENT_COMPUTE_PROFILES,
                getRowId: (profile) => profile.id,
                ariaLabel: "Computer profiles",
                className: "playground-computer-profiles-platform-table",
                surface: "plain",
                sticky: false,
                columns: [
                  {
                    id: "profile",
                    header: "Profile",
                    accessor: (profile) => profile.label,
                    width: "minmax(210px, 2fr)",
                    cell: ({ row: profile }) => React.createElement("div", { className: "playground-agents-overview-model-cell" },
                      React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                        profile.guiEnabled
                          ? React.createElement(Monitor, { width: 16, height: 16, strokeWidth: 1.8 })
                          : React.createElement(HardDrive, { width: 16, height: 16, strokeWidth: 1.8 })
                      ),
                      React.createElement("div", { className: "playground-agents-overview-model-copy" },
                        React.createElement("div", { className: "playground-agents-overview-name-title", title: profile.label }, profile.label),
                        React.createElement("div", { className: "playground-agents-overview-name-description", title: profile.description }, profile.description)
                      )
                    ),
                  },
                  { id: "resources", header: "Resources", accessor: formatPlaygroundEnvironmentProfileResources, width: "minmax(120px, 1fr)" },
                  {
                    id: "gui",
                    header: "GUI",
                    accessor: (profile) => profile.guiEnabled ? "Enabled" : "CLI",
                    width: "minmax(80px, 0.7fr)",
                    cell: ({ row: profile }) => React.createElement("span", { className: "playground-agents-model-access" + (profile.guiEnabled ? " is-available" : " is-locked") }, profile.guiEnabled ? "Enabled" : "CLI"),
                  },
                  {
                    id: "office",
                    header: "Office Apps",
                    accessor: (profile) => profile.id === "desktop" ? "Optional" : "Unavailable",
                    width: "minmax(100px, 0.85fr)",
                    hideBelow: 760,
                    cell: ({ row: profile }) => React.createElement("span", { className: "playground-agents-model-access" + (profile.id === "desktop" ? " is-available" : " is-locked") }, profile.id === "desktop" ? "Optional" : "Unavailable"),
                  },
                  { id: "minute", header: "USD / min", accessor: formatPlaygroundEnvironmentProfileRate, width: "minmax(100px, 0.8fr)", align: "end" },
                  { id: "hour", header: "USD / hr", accessor: formatPlaygroundEnvironmentProfileHourlyPrice, width: "minmax(100px, 0.8fr)", align: "end" },
                ],
              })
            );
            const renderServerTypesTable = () => {
              const serverTypes = [
                {
                  id: "web_app",
                  label: "Web App",
                  description: "Deploy full web services, dashboards, and API-backed apps.",
                  renderIcon: () => React.createElement(Globe, { width: 16, height: 16, strokeWidth: 1.8 }),
                  runtime: "Node.js service",
                  deployment: "Cloud Run",
                  interfaceLabel: "Public URL",
                  managed: false,
                },
                {
                  id: "function",
                  label: "Function",
                  description: "Run serverless handlers for webhooks, jobs, and focused backend tasks.",
                  renderIcon: () => React.createElement(FunctionSquare, { width: 16, height: 16, strokeWidth: 1.8 }),
                  runtime: "Serverless",
                  deployment: "Cloud Function",
                  interfaceLabel: "HTTP endpoint",
                  managed: false,
                },
                {
                  id: "database",
                  label: "Database",
                  description: "Managed document storage for app data, collections, and records.",
                  renderIcon: () => React.createElement(Database, { width: 16, height: 16, strokeWidth: 1.8 }),
                  runtime: "Firestore",
                  deployment: "Managed",
                  interfaceLabel: "Collections",
                  managed: true,
                },
                {
                  id: "api",
                  label: "API",
                  description: "Deploy API services for integrations, product backends, and SDK workflows.",
                  renderIcon: () => React.createElement(Code2, { width: 16, height: 16, strokeWidth: 1.8 }),
                  runtime: "HTTP service",
                  deployment: "Cloud Run",
                  interfaceLabel: "API endpoint",
                  managed: false,
                },
  	              {
  	                id: "auth",
  	                label: "Authentication",
  	                description: "Managed identity layer for users, sessions, and sign-in providers.",
                  renderIcon: () => React.createElement(Users, { width: 16, height: 16, strokeWidth: 1.8 }),
                  runtime: "Identity",
                  deployment: "Managed",
                  interfaceLabel: "Users",
                  managed: true,
                },
                {
                  id: "agent_runtime",
                  label: "Agent Runtime",
                  description: "Managed execution service for agent runtime requests and runs.",
                  renderIcon: () => React.createElement(Bot, { width: 16, height: 16, strokeWidth: 1.8 }),
                  runtime: "Agent service",
                  deployment: "Managed",
                  interfaceLabel: "Runs API",
                  managed: true,
                },
                {
                  id: "secrets",
                  label: "Secrets",
                  description: "Encrypted vaults for API keys, credentials, and runtime configuration.",
                  renderIcon: () => React.createElement(Key, { width: 16, height: 16, strokeWidth: 1.8 }),
                  runtime: "Encrypted vault",
                  deployment: "Managed",
                  interfaceLabel: "Secrets API",
                  managed: true,
                },
              ];
              return React.createElement(PlatformDataTable, {
                rows: serverTypes,
                getRowId: (type) => type.id,
                ariaLabel: "Server resource types",
                className: "playground-server-types-platform-table",
                surface: "plain",
                sticky: false,
                columns: [
                  {
                    id: "type",
                    header: "Type",
                    accessor: (type) => type.label,
                    width: "minmax(220px, 2fr)",
                    cell: ({ row: type }) => React.createElement("div", { className: "playground-agents-overview-model-cell" },
                      React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" }, type.renderIcon()),
                      React.createElement("div", { className: "playground-agents-overview-model-copy" },
                        React.createElement("div", { className: "playground-agents-overview-name-title", title: type.label }, type.label),
                        React.createElement("div", { className: "playground-agents-overview-name-description", title: type.description }, type.description)
                      )
                    ),
                  },
                  { id: "runtime", header: "Runtime", accessor: (type) => type.runtime, width: "minmax(110px, 1fr)" },
                  { id: "deployment", header: "Deployment", accessor: (type) => type.deployment, width: "minmax(110px, 1fr)" },
                  { id: "interface", header: "Interface", accessor: (type) => type.interfaceLabel, width: "minmax(100px, 0.9fr)", hideBelow: 760 },
                  {
                    id: "managed",
                    header: "Managed",
                    accessor: (type) => type.managed ? "Yes" : "No",
                    width: "minmax(90px, 0.7fr)",
                    align: "end",
                    cell: ({ row: type }) => React.createElement("span", { className: "playground-agents-model-access" + (type.managed ? " is-available" : " is-locked") }, type.managed ? "Yes" : "No"),
                  },
                ],
              });
            };
            const renderServerResourceSettingsSection = () => {
              const canEditResourceLimit = Boolean(canConfigureResourceBilling && typeof onResourceBillingPreferencesChange === "function");
              const deployedContinuousServers = orderedServers.filter((server) => {
                const normalizedKind = canonicalizePlaygroundServerKind(server?.kind);
                return normalizedKind !== "function" && String(server?.status || "").trim().toLowerCase() === "deployed";
              });
              const idleConsumptionByKind = deployedContinuousServers.reduce((accumulator, server) => {
                const normalizedKind = canonicalizePlaygroundServerKind(server?.kind);
                const ratePerMinute = Number(PLAYGROUND_SERVER_IDLE_RATE_PER_MINUTE[normalizedKind] || PLAYGROUND_SERVER_IDLE_RATE_PER_MINUTE.web_app || 0);
                const dailyCT = Math.max(0, ratePerMinute * 1440 * SETTINGS_CT_PER_DOLLAR);
                accumulator[normalizedKind] = (accumulator[normalizedKind] || 0) + dailyCT;
                return accumulator;
              }, {});
              const estimatedIdleDailyCT = Object.values(idleConsumptionByKind).reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0);
              const idleConsumptionBreakdown = Object.entries(idleConsumptionByKind)
                .filter(([, value]) => Number(value) > 0)
                .sort((left, right) => Number(right[1] || 0) - Number(left[1] || 0));
              const updateResourceBillingPreferences = (patch, immediate = false) => {
                if (!canEditResourceLimit) {
                  return;
                }
                onResourceBillingPreferencesChange(normalizeDemoSettingsBillingPreferences({
                  ...normalizedResourceBillingPreferences,
                  ...patch,
                }), immediate);
              };
  
              return React.createElement("div", { className: "playground-settings-detail-stack playground-resources-overview-settings-stack" },
                resourceBillingError
                  ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, resourceBillingError)
                  : null,
                resourceBillingSuccess
                  ? React.createElement("div", { className: "playground-environments-success playground-environments-editor-notice" }, resourceBillingSuccess)
                  : null,
                React.createElement("section", { className: "playground-resources-overview-estimate-card" },
                  React.createElement("div", { className: "playground-resources-overview-estimate-copy" },
                    React.createElement("div", { className: "playground-resources-overview-estimate-label" }, "Estimated Inactive Usage"),
                    React.createElement("div", { className: "playground-resources-overview-estimate-value" }, formatSettingsComputeTokens(estimatedIdleDailyCT) + " / day"),
                    React.createElement("div", { className: "playground-resources-overview-estimate-note" },
                      deployedContinuousServers.length > 0
                        ? "Based on " + deployedContinuousServers.length + " deployed continuous " + (deployedContinuousServers.length === 1 ? "resource" : "resources") + " sitting idle."
                        : "No deployed continuous server resources are currently accruing idle runtime."
                    )
                  ),
                  idleConsumptionBreakdown.length > 0
                    ? React.createElement("div", { className: "playground-resources-overview-estimate-breakdown" },
                        idleConsumptionBreakdown.map(([kind, value]) =>
                          React.createElement("span", { key: kind, className: "playground-resources-overview-estimate-chip" },
                            formatSettingsUsageResourceKind(kind) + " " + formatSettingsComputeTokens(value) + " / day"
                          )
                        )
                      )
                    : null
                ),
                React.createElement("section", { className: "playground-settings-plans-resource-cap-section playground-resources-overview-settings-card" },
                  React.createElement("div", { className: "playground-tasks-detail-facts playground-settings-plans-resource-cap-facts" },
                    React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                        React.createElement("div", { className: "playground-tasks-detail-fact-label" },
                          React.createElement("div", { className: "playground-settings-plans-resource-cap-label" },
                            React.createElement("span", null, "Server Resource Usage Limit")
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                          React.createElement("div", { className: "playground-settings-plans-resource-cap-control" },
                            React.createElement("input", {
                              id: "resources-server-spend-cap",
                              type: "number",
                              min: "0",
                              step: "1",
                              className: "playground-settings-input playground-settings-plans-resource-cap-input",
                              value: normalizedResourceBillingPreferences.monthlyResourceSpendLimit > 0
                                ? normalizedResourceBillingPreferences.monthlyResourceSpendLimit
                                : "",
                              onChange: (event) => updateResourceBillingPreferences({
                                monthlyResourceSpendLimit: normalizeSettingsSpendLimit(event.target.value),
                              }, false),
                              disabled: !canEditResourceLimit || resourceBillingSaving,
                              placeholder: "None",
                            }),
                            React.createElement("span", { className: "playground-settings-plans-resource-cap-suffix" }, "USD / month")
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                        React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Pause resources when the cap is reached"),
                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-toggle" + (normalizedResourceBillingPreferences.pauseOnLimit ? " is-active" : ""),
                            onClick: () => updateResourceBillingPreferences({
                              pauseOnLimit: !normalizedResourceBillingPreferences.pauseOnLimit,
                            }, true),
                            disabled: !canEditResourceLimit || resourceBillingSaving,
                            "aria-pressed": normalizedResourceBillingPreferences.pauseOnLimit,
                          }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                        React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Send email alerts before you hit the limit"),
                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-toggle" + (normalizedResourceBillingPreferences.emailAlerts ? " is-active" : ""),
                            onClick: () => updateResourceBillingPreferences({
                              emailAlerts: !normalizedResourceBillingPreferences.emailAlerts,
                            }, true),
                            disabled: !canEditResourceLimit || resourceBillingSaving,
                            "aria-pressed": normalizedResourceBillingPreferences.emailAlerts,
                          }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                        )
                      )
                    )
                  ),
                  canConfigureResourceBilling
                    ? null
                    : React.createElement("div", { className: "playground-settings-plan-card-copy" },
                        "Upgrade to Builder to configure server resource usage limits."
                      )
                )
              );
            };
  	          const activeResourcesOverviewHomeTab = getActiveResourcesOverviewHomeTab();
  	          const sectionTitle = activeResourcesOverviewHomeTab === "profiles"
  	            ? "Profiles"
  	            : activeResourcesOverviewHomeTab === "types"
  	              ? "Types"
  	              : activeResourcesOverviewHomeTab === "settings"
  	                ? "Settings"
  	              : overviewTitle;
  	          const isOverviewResourceListLoading = isServersMode
  	            ? normalizedEmbeddedServerKind === "database"
  	              ? (!hasLoadedDatabases || databaseListLoading)
  	              : normalizedEmbeddedServerKind
  	                ? (!hasLoadedServers || serverListLoading)
  	                : (!hasLoadedServers || !hasLoadedDatabases || serverListLoading || databaseListLoading)
  	            : false;
  	          const shouldShowOverviewResourceLoading = overviewItems.length === 0
  	            && isOverviewResourceListLoading
  	            && !normalizedResourcesSearchQuery
  	            && resourcesOverviewFilter === "all";
  			          const developConfigureResourcesLabel = isServersMode ? currentServerResourcesLabel : "Computers";
  			          const computerOverviewCreateButton = !isServersMode
  			            ? React.createElement("button", {
  			                type: "button",
  			                className: "playground-top-nav-private-chat-button playground-agents-nav-create-button playground-agents-overview-toolbar-create-button playground-resources-overview-create-button",
  			                onClick: () => {
  			                  setResourcesOverviewToolbarPopover("");
  			                  handleCreateEnvironment();
  			                },
  			                title: "Create computer",
  			                "aria-label": "Create computer",
  			              },
  			                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
  			                React.createElement("span", null, "New Computer")
  			              )
  			            : null;
  			          const serverOverviewCreateButton = isServersMode && normalizedEmbeddedServerKind !== "voice_agent"
  			            ? React.createElement("button", {
  			                type: "button",
  			                className: "playground-top-nav-private-chat-button playground-agents-nav-create-button playground-agents-overview-toolbar-create-button playground-resources-overview-create-button",
  			                onClick: () => {
  			                  setResourcesOverviewToolbarPopover("");
  			                  handleCreateServer(normalizedEmbeddedServerKind);
  			                },
  			                title: "Create " + (embeddedServerKindLabel || "server"),
  			                "aria-label": "Create " + (embeddedServerKindLabel || "server"),
  			              },
  			                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
  			                React.createElement("span", null, "New " + (embeddedServerKindLabel || "Server"))
  			              )
  			            : null;
  		          const overviewResourceColumns = [
  		            {
  		              id: "name",
  		              header: "Name",
  		              accessor: getOverviewResourceDisplayName,
  		              sortable: true,
  		              width: "minmax(220px, 1.5fr)",
  		              cell: ({ row }) => renderOverviewResourceNameCell(row),
  		            },
  		            ...(isServersMode
  		              ? [
  		                  {
  		                    id: "type",
  		                    header: "Type",
  		                    accessor: getEmbeddedServerKindLabel,
  		                    sortable: true,
  		                    width: "minmax(125px, 0.65fr)",
  		                    hideBelow: 760,
  		                    cell: ({ row }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getEmbeddedServerKindLabel(row)),
  		                  },
  		                  {
  		                    id: "published",
  		                    header: "Published",
  		                    accessor: (row) => isOverviewResourcePublished(row) ? 1 : 0,
  		                    sortable: true,
  		                    width: "minmax(105px, 0.5fr)",
  		                    hideBelow: 900,
  		                    cell: ({ row }) => {
  		                      const published = isOverviewResourcePublished(row);
  		                      return React.createElement("div", {
  		                        className: "playground-agents-overview-table-value playground-resources-overview-published" + (published ? " is-yes" : ""),
  		                      }, published ? "Yes" : "No");
  		                    },
  		                  },
  		                ]
  		              : [{
  		                  id: "profile",
  		                  header: "Computer Profile",
  		                  accessor: getOverviewResourceProfileLabel,
  		                  sortable: true,
  		                  width: "minmax(150px, 0.75fr)",
  		                  hideBelow: 720,
  		                  cell: ({ row }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getOverviewResourceProfileLabel(row)),
  		                }]),
  		            {
  		              id: "created",
  		              header: "Created",
  		              accessor: (row) => getOverviewResourceTimestamp(getOverviewResourceCreatedAt(row)),
  		              sortable: true,
  		              sortDescFirst: true,
  		              width: "minmax(120px, 0.6fr)",
  		              align: "end",
  		              hideBelow: 860,
  		              cell: ({ row }) => renderOverviewDateCell(getOverviewResourceCreatedAt(row)),
  		            },
  		            {
  		              id: "lastUsed",
  		              header: "Last used",
  		              accessor: (row) => getOverviewResourceTimestamp(getOverviewResourceLastUsedAt(row)),
  		              sortable: true,
  		              sortDescFirst: true,
  		              width: "minmax(120px, 0.6fr)",
  		              align: "end",
  		              hideBelow: 1040,
  		              cell: ({ row }) => renderOverviewDateCell(getOverviewResourceLastUsedAt(row), "Never"),
  		            },
  		          ];
  		          const getOverviewResourceActions = (item, actionState) => {
  		            if (!isServersMode) {
  		              const targets = Array.isArray(actionState?.targetRows) && actionState.targetRows.length ? actionState.targetRows : [item];
  		              const mutableTargets = targets.filter((target) => !target?.isDefault && !target?.isSystem);
  		              const bulkMode = targets.length > 1;
  		              const isProtected = Boolean(item?.isSystem || item?.isDefault);
  		              const isDeleting = saveState.isSaving && item?.id === selectedEnvironmentId;
  		              const isCopying = fileEnvironmentMutationState.action === "fork" && fileEnvironmentMutationState.environmentId === item?.id;
  		              const isSharing = environmentShareTeamState.action === "share";
  		              if (bulkMode) {
  		                return [
  		                  {
  		                    id: "share-team",
  		                    label: "Share selected with Team",
  		                    icon: UsersRound,
  		                    disabled: saveState.isSaving || isSharing || mutableTargets.length === 0,
  		                    onSelect: () => openEnvironmentShareTeamModal(null, { environmentIds: mutableTargets.map((target) => target.id) }),
  		                  },
  		                  {
  		                    id: "delete",
  		                    label: "Delete selected",
  		                    icon: Trash2,
  		                    danger: true,
  		                    separatorBefore: true,
  		                    disabled: saveState.isSaving || isSharing || mutableTargets.length === 0,
  		                    onSelect: () => void handleDeleteEnvironments(mutableTargets),
  		                  },
  		                ];
  		              }
  		              return [
  		                { id: "rename", label: "Rename", icon: SquarePen, disabled: isProtected || isDeleting || isCopying || isSharing, onSelect: () => openEnvironmentRenameDialog(item) },
  		                { id: "share-team", label: "Share with Team", icon: UsersRound, disabled: isProtected || isDeleting || isCopying || isSharing, onSelect: () => openEnvironmentShareTeamModal(item) },
  		                { id: "copy", label: isCopying ? "Copying..." : "Copy", icon: Copy, disabled: isDeleting || isCopying || isSharing, onSelect: () => void handleCopyEnvironmentFromMenu(item) },
  		                { id: "delete", label: isDeleting ? "Deleting..." : "Delete", icon: Trash2, danger: true, separatorBefore: true, disabled: isProtected || isDeleting || isCopying || isSharing, onSelect: () => void handleDeleteEnvironment(item.id) },
  		              ];
  		            }
  		            const isDatabaseResource = item?.resourceType === "database";
  		            const isDraft = item?.id === PLAYGROUND_SERVER_DRAFT_ID || item?.id === PLAYGROUND_DATABASE_DRAFT_ID;
  		            const isSaving = isDatabaseResource ? databaseSaveState.isSaving : serverSaveState.isSaving;
  		            const isDeleting = isSaving && (isDatabaseResource ? selectedDatabaseId === item?.id : selectedServerId === item?.id);
  		            return [
  		              {
  		                id: "rename",
  		                label: "Rename",
  		                icon: SquarePen,
  		                disabled: isDraft || isSaving,
  		                onSelect: () => isDatabaseResource ? openDatabaseRenameDialog(item) : openServerRenameDialog(item),
  		              },
  		              { id: "copy", label: "Copy", icon: Copy, disabled: isSaving, onSelect: () => openServerResourceCopyComposer(item) },
  		              {
  		                id: "delete",
  		                label: isDeleting ? "Deleting..." : "Delete",
  		                icon: Trash2,
  		                danger: true,
  		                separatorBefore: true,
  		                disabled: isDraft || isSaving,
  		                onSelect: () => isDatabaseResource ? void handleDeleteDatabase(item.id) : void handleDeleteServer(item.id),
  		              },
  		            ];
  		          };
  		          const prefetchOverviewResource = (item) => {
  		            if (!isServersMode) return;
  		            if (item?.resourceType === "database") {
  		              prefetchDatabaseBootstrap(item.id);
  		            } else if (["function", "web_app", "auth", "agent_runtime", "secrets", "payments"].includes(canonicalizePlaygroundServerKind(item?.kind))) {
  		              void loadServerAnalytics(item.id, { period: "day" });
  		            }
  		          };
  		          const overviewResourceTable = React.createElement(PlatformDataTable, {
  		            rows: overviewItems,
  		            columns: overviewResourceColumns,
  		            getRowId: (item) => isServersMode ? getOverviewServerResourceSelectionId(item) : String(item?.id || ""),
  		            ariaLabel: overviewTitle,
  		            className: "playground-resource-overview-platform-data-table",
  		            surface: "plain",
  		            sorting: {
  		              value: { id: resourcesOverviewSort, direction: normalizedResourcesOverviewSortDirection },
  		              manual: true,
  		              onChange: (nextSorting) => {
  		                if (!nextSorting) return;
  		                setResourcesOverviewSort(nextSorting.id);
  		                setResourcesOverviewSortDirection(nextSorting.direction);
  		                setResourcesOverviewToolbarPopover("");
  		              },
  		            },
  		            selection: {
  		              enabled: true,
  		              value: isServersMode ? selectedOverviewServerResourceIds : selectedOverviewComputerIds,
  		              onChange: ({ selectedIds }) => {
  		                if (isServersMode) setSelectedOverviewServerResourceIds(new Set(selectedIds));
  		                else setSelectedOverviewComputerIds(new Set(selectedIds));
  		              },
  		              ariaLabel: (item) => "Select " + getOverviewResourceDisplayName(item),
  		            },
  		            toolbar: isDevelopConfigureOverview ? {
  		              search: { value: searchPopupQuery, onChange: setSearchPopupQuery, placeholder: isServersMode ? "Search resources" : "Search computers", manual: true },
  		              showSort: true,
  		              filters: [{ id: "status", label: "Status", value: resourcesOverviewFilter, options: resourcesOverviewFilterOptions, onChange: setResourcesOverviewFilter }],
  		              primaryAction: !isServersMode
  		                ? { label: "New Computer", icon: Plus, onClick: handleCreateEnvironment }
  		                : isDevelopServerKindOverview
  		                  ? { label: "New " + (embeddedServerKindLabel || "Resource"), icon: Plus, onClick: () => handleCreateServer(normalizedEmbeddedServerKind) }
  		                  : undefined,
  		            } : undefined,
  		            getRowActions: getOverviewResourceActions,
  		            getRowAriaLabel: getOverviewResourceDisplayName,
  		            onRowActivate: openOverviewResourceItem,
  		            onRowPointerEnter: prefetchOverviewResource,
  		            onRowFocus: prefetchOverviewResource,
  		            loading: shouldShowOverviewResourceLoading,
  		            emptyState: normalizedResourcesSearchQuery || resourcesOverviewFilter !== "all"
  		              ? (isServersMode ? "No matching " + currentServerResourcesLabel.toLowerCase() + " found." : "No matching computers found.")
  		              : (isServersMode ? "No " + currentServerResourcesLabel.toLowerCase() + " available." : "No computers available."),
  		          });
  	          if (isDevelopConfigureOverview && activeResourcesOverviewHomeTab === "general") {
  		            return React.createElement("section", {
  		              className: isServersMode
  		                ? "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-overview-list-section playground-team-grid-table-section playground-resources-overview-section playground-develop-resource-overview-table-section is-servers-overview is-develop-server-kind-list"
  		                : "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-resources-overview-section is-computers-overview is-develop-server-kind-list playground-computers-overview-list-section",
  		            }, overviewResourceTable);
  		          }
  	          return React.createElement("section", { className: "playground-plugins-section playground-resources-overview-section " + (isServersMode ? "is-servers-overview" : "is-computers-overview") },
              activeResourcesOverviewHomeTab === "settings"
                ? null
                : React.createElement("div", { className: "playground-plugins-section-header" },
                    React.createElement("div", { className: "playground-plugins-section-copy" },
                      React.createElement("h3", { className: "playground-plugins-section-title" }, sectionTitle)
                    )
                  ),
              activeResourcesOverviewHomeTab === "profiles"
                ? renderComputerProfilesTable()
                : activeResourcesOverviewHomeTab === "types"
                  ? renderServerTypesTable()
                  : activeResourcesOverviewHomeTab === "settings"
                    ? renderServerResourceSettingsSection()
                : React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-plugins-search-row playground-resources-overview-search-row", ref: resourcesOverviewToolbarRef },
                React.createElement("div", { className: "playground-plugins-search-shell" },
                  React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("input", {
                    type: "search",
                    value: searchPopupQuery,
                    onChange: (event) => setSearchPopupQuery(event.target.value),
                    className: "playground-plugins-search",
                    placeholder: isServersMode ? "Search resources" : "Search computers",
                  })
                ),
                React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-sort" + (resourcesOverviewToolbarPopover === "sort" || resourcesOverviewSort !== "name" || normalizedResourcesOverviewSortDirection !== "asc" ? " is-active" : ""),
                      onClick: () => setResourcesOverviewToolbarPopover((current) => current === "sort" ? "" : "sort"),
                    },
                      React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Sort")
                    ),
                    resourcesOverviewToolbarPopover === "sort"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          resourcesOverviewSortOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (resourcesOverviewSort === (option.sortKey || option.id) && normalizedResourcesOverviewSortDirection === normalizeResourcesOverviewSortDirection(option.direction) ? " selected" : ""),
                                onClick: () => {
                                  setResourcesOverviewSort(option.sortKey || option.id);
                                  setResourcesOverviewSortDirection(normalizeResourcesOverviewSortDirection(option.direction));
                                  setResourcesOverviewToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                resourcesOverviewSort === (option.sortKey || option.id) && normalizedResourcesOverviewSortDirection === normalizeResourcesOverviewSortDirection(option.direction)
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label)
                              )
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-filter" + (resourcesOverviewToolbarPopover === "filter" || resourcesOverviewFilter !== "all" ? " is-active" : ""),
                      onClick: () => setResourcesOverviewToolbarPopover((current) => current === "filter" ? "" : "filter"),
                    },
                      React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Filter")
                    ),
                    resourcesOverviewToolbarPopover === "filter"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          resourcesOverviewFilterOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (resourcesOverviewFilter === option.id ? " selected" : ""),
                                onClick: () => {
                                  setResourcesOverviewFilter(option.id);
                                  setResourcesOverviewToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                resourcesOverviewFilter === option.id
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label),
                                React.createElement("span", null, option.description)
                              )
                            )
                          )
                    )
                      : null
                  )
                ),
                normalizedEmbeddedServerKind === "voice_agent" ? null : React.createElement("button", {
                  type: "button",
                  className: "playground-overview-new-button playground-resources-overview-create-button",
                  onClick: () => {
                    setResourcesOverviewToolbarPopover("");
                    if (isServersMode) {
                      handleCreateServer(normalizedEmbeddedServerKind);
                    } else {
                      handleCreateEnvironment();
                    }
                  },
                  title: isServersMode ? "Create " + (embeddedServerKindLabel || "server") : "Create computer",
                  "aria-label": isServersMode ? "Create " + (embeddedServerKindLabel || "server") : "Create computer",
                },
                  React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, isServersMode ? "New " + (embeddedServerKindLabel || "Server") : "New Computer")
                )
              ),
  		            overviewResourceTable
  		          )
  		        );
  		      }
  
            if (creationOnly) {
              return React.createElement(React.Fragment, null,
                renderEnvironmentCreationSetupModal()
              );
            }

  	        if (embeddedInResources) {
  	          const shouldShowServerCreationSetup = isServersMode && serverComposerOpen && normalizedEmbeddedServerKind && normalizedEmbeddedServerKind !== "voice_agent";
  	          const normalizedEmbeddedDatabaseDetailTab = ["data", "usage", "settings"].includes(databaseDetailTab) ? databaseDetailTab : "data";
  	          const isEmbeddedDatabaseDataTab = Boolean(isServersMode && selectedDatabaseId && !selectedServerId && normalizedEmbeddedDatabaseDetailTab === "data");
  	          const embeddedActiveServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
  	          const embeddedActiveServerKind = canonicalizePlaygroundServerKind(embeddedActiveServer?.kind);
  	          const isEmbeddedServerCodeTab = Boolean(
  	            isServersMode
  	            && selectedServerId
  	            && !selectedDatabaseId
  	            && ["function", "web_app"].includes(embeddedActiveServerKind)
  	            && serverDetailTab === "code"
  	          );
  	          const isEmbeddedAuthUsersTab = Boolean(
  	            isServersMode
  	            && selectedServerId
  	            && !selectedDatabaseId
  	            && embeddedActiveServerKind === "auth"
  	            && authDetailTab === "users"
  	          );
  	          const isEmbeddedSecretsTab = Boolean(
  	            isServersMode
  	            && selectedServerId
  	            && !selectedDatabaseId
  	            && embeddedActiveServerKind === "secrets"
  	            && secretsDetailTab === "secrets"
  	          );
  	          const isEmbeddedResourceTypeOverview = Boolean(
  	            isServersMode
  	            && normalizedEmbeddedServerKind
  	            && !selectedServerId
  	            && !selectedDatabaseId
  	          );
  	          const embeddedResourcesPageClassName = "playground-environments-detail playground-plugins-detail playground-skills-page playground-resources-page "
  	            + (isServersMode ? "is-servers-view" : "is-computers-view")
  	            + (isServersMode && normalizedEmbeddedServerKind ? " is-develop-server-kind-page" : "")
  	            + (isEmbeddedResourceTypeOverview ? " playground-agents-overview-page playground-resource-type-overview-page" : "")
  	            + (!isServersMode ? " is-develop-configure-page" : "")
  	            + (isEmbeddedDatabaseDataTab ? " is-database-data-tab" : "")
  	            + (isEmbeddedServerCodeTab ? " is-code-tab" : "")
  	            + (isEmbeddedAuthUsersTab ? " is-auth-users-tab" : "")
  	            + (isEmbeddedSecretsTab ? " is-secrets-tab" : "");
  	          const resourcesDetailScrollClassName = "playground-environments-detail-scroll playground-settings-detail-scroll"
  	            + (isEmbeddedDatabaseDataTab ? " is-database-data-tab" : "")
  	            + (isEmbeddedServerCodeTab ? " is-code-tab" : "")
  	            + (isEmbeddedAuthUsersTab ? " is-auth-users-tab" : "")
  	            + (isEmbeddedSecretsTab ? " is-secrets-tab" : "");
  	          const resourcesDetailContentClassName = "playground-resources-detail-content"
  	            + (isEmbeddedDatabaseDataTab ? " is-database-data-tab" : "")
  	            + (isEmbeddedServerCodeTab ? " is-code-tab" : "")
  	            + (isEmbeddedAuthUsersTab ? " is-auth-users-tab" : "")
  	            + (isEmbeddedSecretsTab ? " is-secrets-tab" : "");
            return React.createElement(React.Fragment, null,
              resourcesTopNavActions,
              shouldShowServerCreationSetup
                ? React.createElement("section", { className: embeddedResourcesPageClassName },
                    renderServerCreationSetupPage()
                  )
                : shouldShowEnvironmentHome
  	              ? React.createElement("section", { className: embeddedResourcesPageClassName },
  	                  renderEnvironmentsHome(
  	                    isServersMode && normalizedEmbeddedServerKind
  	                      ? null
  	                      : isServersMode
  	                        ? renderEmbeddedResourcesOverviewSection()
  	                        : null
  	                  )
                  )
                : React.createElement("section", { className: embeddedResourcesPageClassName },
                    React.createElement("div", { className: resourcesDetailScrollClassName, ref: resourcesDetailScrollRef },
                      React.createElement("div", { className: resourcesDetailContentClassName },
                        isServersMode
                          ? (
                              selectedServerId
                                ? (isLoadingCurrentServer && !draftServer
                                    ? React.createElement("div", { className: "playground-files-state" },
                                        React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                                      )
                                    : renderCurrentServerEditor())
                                : selectedDatabaseId
                                  ? (isLoadingCurrentDatabase && !draftDatabase
                                      ? React.createElement("div", { className: "playground-files-state" },
                                          React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                                        )
                                      : renderCurrentDatabaseEditor())
                                  : null
                            )
                          : (isLoadingCurrentEnvironment && !draftEnvironment
                              ? React.createElement("div", { className: "playground-files-state" },
                                  React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                                )
                              : renderCurrentEnvironmentEditor())
                      )
                    )
                  ),
              renderEnvironmentRenameModal(),
              shouldShowEnvironmentHome ? renderEnvironmentListActionMenu() : null,
              shouldShowEnvironmentHome ? renderEnvironmentBulkActionMenu() : null,
              shouldShowEnvironmentHome ? renderEnvironmentShareTeamModalElement() : null,
              renderServerResourceActionMenu(),
              renderServerRenameModal(),
              shouldShowEnvironmentHome ? renderDatabaseRenameModal() : null,
              renderServerAuthUserComposerModal(),
              renderEnvironmentCreationSetupModal(),
              renderServerComposerDialog()
            );
          }
  
          return React.createElement("div", { className: "playground-environments-page" },
            React.createElement("div", { className: "playground-environments-shell" },
              React.createElement("aside", { className: "playground-environments-list-pane" },
                React.createElement("div", { className: "playground-files-browser-header playground-environments-list-header" },
                  toolbarPopover
                    ? React.createElement(PlatformPopupDismissLayer, {
                        className: "playground-files-search-backdrop",
                        onClick: () => setToolbarPopover(""),
                      })
                    : null,
                  React.createElement("div", { className: "playground-files-topbar" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-list-title playground-environments-list-title-button",
                      onClick: showEnvironmentsHome,
                    }, "Environments"),
                    React.createElement("div", { className: "playground-files-topbar-actions" },
                      React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-environments-search-shell" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-header-icon-button is-plain" + (toolbarPopover === "search" ? " is-active" : ""),
                          onClick: () => toggleToolbarPopover("search"),
                          title: currentSearchTitle,
                        }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
                        toolbarPopover === "search"
                          ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                              React.createElement("div", { className: "playground-tasks-project-search-header" },
                                React.createElement("div", { className: "playground-tasks-project-search-title" }, currentSearchTitle),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-tasks-project-search-close",
                                  onClick: () => setToolbarPopover(""),
                                }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
                              ),
                              React.createElement("div", { className: "playground-tasks-project-search-body" },
                                React.createElement("div", { className: "playground-files-search-field" },
                                  React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                                  React.createElement("input", {
                                    ref: searchPopupInputRef,
                                    type: "text",
                                    className: "playground-files-search-field-input",
                                    placeholder: currentSearchPlaceholder,
                                    value: searchPopupQuery,
                                    onChange: (event) => setSearchPopupQuery(event.target.value),
                                  })
                                ),
                                searchPopupQuery.trim()
                                  ? searchResults.length > 0
                                    ? React.createElement("div", { className: "playground-files-search-results" },
                                        searchResults.map((item) =>
                                          React.createElement("button", {
                                              key: item.id,
                                              type: "button",
                                              className: "playground-files-search-result",
                                              onClick: () =>
                                                isServersMode
                                                  ? (item.resourceType === "database" ? handleDatabaseSelect(item.id) : handleServerSelect(item.id))
                                                  : handleEnvironmentSelect(item.id),
                                            },
                                              isServersMode
                                                ? (
                                                    item.resourceType === "database"
                                                      ? React.createElement(Database, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                      : canonicalizePlaygroundServerKind(item.kind) === "function"
                                                        ? React.createElement(FunctionSquare, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                        : canonicalizePlaygroundServerKind(item.kind) === "api"
                                                          ? React.createElement(Code2, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                        : canonicalizePlaygroundServerKind(item.kind) === "agent_runtime"
                                                          ? React.createElement(Bot, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                        : canonicalizePlaygroundServerKind(item.kind) === "voice_agent"
                                                          ? React.createElement(Mic, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                        : canonicalizePlaygroundServerKind(item.kind) === "auth"
                                                          ? React.createElement(Users, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                        : canonicalizePlaygroundServerKind(item.kind) === "secrets"
                                                          ? React.createElement(Key, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                        : canonicalizePlaygroundServerKind(item.kind) === "payments"
                                                          ? React.createElement(ReceiptText, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                          : React.createElement(Globe, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                  )
                                                : React.createElement(HardDrive, { className: "playground-files-entry-icon", strokeWidth: 1.8 }),
                                              React.createElement("div", { className: "playground-files-search-result-copy" },
                                                React.createElement("div", { className: "playground-files-search-result-name" }, item.name || (isServersMode ? "Untitled Resource" : "Untitled Computer")),
                                                React.createElement("div", { className: "playground-files-search-result-path" }, item.description || item.id || "No description")
                                              )
                                            )
                                        )
                                      )
                                    : React.createElement("div", { className: "playground-files-search-empty" }, currentSearchEmpty)
                                  : React.createElement("div", { className: "playground-tasks-project-search-hint" }, "Type a name or description to search.")
                              )
                            )
                          : null
                      ),
                      renderResourcesTopActionControl("playground-files-header-icon-button")
                    )
                  ),
                  React.createElement("div", { className: "playground-agents-list-switch-row" },
                    React.createElement("div", { className: "content-mode-switch playground-agents-list-switch" },
                      React.createElement("button", {
                        type: "button",
                        className: "content-mode-button" + (!isServersMode ? " is-active" : ""),
                        onClick: () => setResourceMode("computers"),
                      }, "Computers"),
                      React.createElement("button", {
                        type: "button",
                        className: "content-mode-button" + (isServersMode ? " is-active" : ""),
                        onClick: () => setResourceMode("servers"),
                      }, "Servers")
                    )
                  )
                ),
                React.createElement("div", { className: "playground-environments-list-body" },
                  isServersMode
                    ? (
                      (serverListLoading || databaseListLoading) && visibleDisplayServerResources.length === 0
                        ? React.createElement("div", { className: "playground-files-state" },
                            React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                          )
                        : visibleDisplayServerResources.length > 0
                          ? visibleDisplayServerResources.map((resource) => {
                              const isDatabaseResource = resource.resourceType === "database";
                              const isActive = !shouldShowEnvironmentHome && (isDatabaseResource ? (!selectedServerId && selectedDatabaseId === resource.id) : selectedServerId === resource.id);
                              const normalizedKind = canonicalizePlaygroundServerKind(resource.kind);
                              const serverListMetaLabel = normalizedKind === "web_app" || normalizedKind === "function" || normalizedKind === "database" || normalizedKind === "api" || normalizedKind === "auth" || normalizedKind === "agent_runtime" || normalizedKind === "voice_agent" || normalizedKind === "secrets" || normalizedKind === "payments"
                                  ? ""
                                  : String(resource.kind || "").replace(/_/g, " ");
                              return React.createElement("div", {
                                  key: (isDatabaseResource ? "database:" : "server:") + resource.id,
                                  className: "playground-environments-list-item-row" + (isActive ? " is-active" : ""),
                                },
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-environments-list-item" + (isActive ? " is-active" : ""),
                                    onClick: () => isDatabaseResource ? handleDatabaseSelect(resource.id) : handleServerSelect(resource.id),
                                  },
                                    isDatabaseResource
                                      ? React.createElement(Database, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                      : normalizedKind === "function"
                                        ? React.createElement(FunctionSquare, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                        : normalizedKind === "api"
                                          ? React.createElement(Code2, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                        : normalizedKind === "agent_runtime"
                                          ? React.createElement(Bot, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                        : normalizedKind === "voice_agent"
                                          ? React.createElement(Mic, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                        : normalizedKind === "auth"
                                          ? React.createElement(Users, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                        : normalizedKind === "secrets"
                                          ? React.createElement(Key, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                        : normalizedKind === "payments"
                                          ? React.createElement(ReceiptText, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                          : normalizedKind === "web_app"
                                            ? React.createElement(Globe, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                            : React.createElement(Server, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 }),
                                    React.createElement("div", { className: "playground-environments-list-item-copy" },
                                      React.createElement("div", { className: "playground-environments-list-item-title" }, resource.name || "Untitled Resource"),
                                      serverListMetaLabel
                                        ? React.createElement("div", { className: "playground-files-search-result-path" }, serverListMetaLabel)
                                        : null
                                    )
                                  )
                                );
                            })
                          : React.createElement("div", { className: "playground-environments-empty-state" },
                              React.createElement("div", { className: "playground-environments-empty-title" }, "No " + currentServerResourcesLabel.toLowerCase()),
                              React.createElement("div", { className: "playground-environments-empty-copy" }, normalizedEmbeddedServerKind === "voice_agent" ? "Configure voice on an existing agent to make it available for web or phone calls." : normalizedEmbeddedServerKind ? "Create your first " + currentServerResourcesLabel.toLowerCase() + " resource." : "Create your first web app, function, auth module, agent runtime, secrets vault, payments resource, API, or database."),
                              normalizedEmbeddedServerKind === "voice_agent" ? null : React.createElement(PlatformPrimaryButton, {
                                size: "medium",
                                type: "button",
                                className: "playground-environments-action-button is-primary",
                                onClick: () => handleCreateServer(normalizedEmbeddedServerKind),
                              },
                                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("span", null, "New " + (embeddedServerKindLabel || "Resource"))
                              )
                            )
                    )
                    : (
                      displayEnvironments.length > 0
                        ? displayEnvironments.map((environment) => {
                            const isActive = !shouldShowEnvironmentHome && selectedEnvironmentId === environment.id;
                            const hasActions = !environment.isDefault && !environment.isSystem;
                            const isMenuOpen = environmentListActionMenuState?.environmentId === environment.id;
                            return React.createElement("div", {
                                key: environment.id,
                                className: "playground-environments-list-item-row" + (isActive ? " is-active" : ""),
                              },
                                React.createElement("button", {
                                    type: "button",
                                    className: "playground-environments-list-item" + (isActive ? " is-active" : "") + (hasActions ? " has-actions" : ""),
                                    onClick: () => handleEnvironmentSelect(environment.id),
                                  },
                                    React.createElement("div", { className: "playground-environments-list-item-copy" },
                                      React.createElement("div", { className: "playground-environments-list-item-title" }, environment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID ? (draftEnvironment?.name || "New Computer") : (environment.name || "Untitled Computer"))
                                    ),
                                    environment.isDefault
                                      ? React.createElement("span", { className: "playground-environments-badge" }, "Default")
                                      : null
                                  ),
                                hasActions
                                  ? React.createElement("div", { className: "playground-environments-list-item-side" },
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-environments-list-item-menu-button" + (isMenuOpen ? " is-open" : ""),
                                        onClick: (event) => openEnvironmentListActionMenu(event, environment),
                                        "aria-label": "Computer actions",
                                        "aria-expanded": isMenuOpen ? "true" : "false",
                                      },
                                        React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })
                                      )
                                    )
                                  : null
                              );
                          })
                        : React.createElement("div", { className: "playground-environments-empty-state" },
                            React.createElement("div", { className: "playground-environments-empty-title" }, "No computers"),
                            React.createElement("div", { className: "playground-environments-empty-copy" }, "Create your first computer to configure runtimes, packages, and context."),
                            React.createElement(PlatformPrimaryButton, {
                              size: "medium",
                              type: "button",
                              className: "playground-environments-action-button is-primary",
                              onClick: handleCreateEnvironment,
                            },
                              React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("span", null, "New Computer")
                            )
                          )
                    )
                )
              ),
              React.createElement("section", {
                className: "playground-environments-detail" + (serverAgentRuntimeRunComposer.open ? " has-modal-overlay" : ""),
              },
                shouldShowEnvironmentHome
                  ? renderEnvironmentsHome()
                  : isServersMode
                  ? (
                      selectedServerId
                        ? (isLoadingCurrentServer && !draftServer
                            ? React.createElement("div", { className: "playground-files-state" },
                                React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                              )
                            : renderCurrentServerEditor())
                        : selectedDatabaseId
                          ? (isLoadingCurrentDatabase && !draftDatabase
                              ? React.createElement("div", { className: "playground-files-state" },
                                  React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                                )
                              : renderCurrentDatabaseEditor())
                          : React.createElement("div", { className: "playground-environments-detail-empty" },
                              React.createElement("div", { className: "playground-files-state" }, "Select a web app, function, auth module, agent runtime, secrets vault, or database to configure it.")
                            )
                    )
                  : (isLoadingCurrentEnvironment && !draftEnvironment
                      ? React.createElement("div", { className: "playground-files-state" },
                          React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                        )
                      : renderCurrentEnvironmentEditor())
                ,
                shouldShowEnvironmentHome
                  ? React.createElement("div", { className: "playground-environments-home-composer-host" },
                      React.createElement("div", { className: "playground-environments-home-content" },
                        React.createElement("div", { className: "playground-environments-home-composer-shell" },
                          React.createElement(RunnerChat, {
                            key: "environments-home-resource-composer",
                            className: "playground-environments-home-runner",
                            backendUrl,
                            apiKey,
                            fetchCustomSkills,
                            speechToTextUrl: speechToTextUrl || undefined,
                            requestHeaders,
                            appId: "runner-web-sdk-demo",
                            inputMode: "computer-agents",
                            computerAgents: computerAgents || undefined,
                            environments: environments.map((environment) => ({
                              ...environment,
                              ...(preferredEnvironmentId && environment.id === preferredEnvironmentId ? { isDefault: true } : {}),
                            })),
  	                          agents: ensurePlaygroundComposerDefaultChoices(Array.isArray(agents) ? agents : []).map((agent) => (
  	                            buildPlaygroundRunnerAgentOption(agent, preferredAgentId && agent.id === preferredAgentId ? { isDefault: true } : {})
  	                          )),
                            isAgentSelectionBlocked: (agent) => isFreeAgentPlan && isPlaygroundFreePlanLockedComposerAgent(agent),
                            onBlockedAgentSelect: openAgentUpgradeModal,
                            skills: Array.isArray(skills) ? skills : [],
                            skillDefaults: getDemoImageGenerationSkillDefaults(),
                            environmentId: preferredEnvironmentId || undefined,
                            agentId: preferredAgentId || undefined,
                            keepFocusOnSubmit: true,
                            showUsageInStatus: false,
                            placeholder: "Type /computer, /app or /function",
                            enableResourceCreationCommand: true,
                            resourceCreationCommand: environmentsHomeResourceCommandRequest,
                            resourceCreationCommandHiddenPrompt: buildEnvironmentsHomeResourceHiddenPrompt,
                            onExternalRunRequestCreate: handleEnvironmentsHomeThreadStartRequest,
                            onResourceCreationCommandChange: (commandType) => {
                              setEnvironmentsHomeActiveResourceCommand(commandType || "");
                            },
                            onThreadIdChange: (threadId) => {
                              const normalizedThreadId = String(threadId || "").trim();
                              if (!normalizedThreadId || typeof onThreadRegistered !== "function") {
                                return;
                              }
                              onThreadRegistered(normalizedThreadId);
                            },
                            onRunFinish: (_result, threadId) => handleEnvironmentsHomeThreadOpen(threadId),
                            onAgentChange: (nextAgentId) => {
                              if (typeof onPreferredAgentChange === "function") {
                                onPreferredAgentChange(String(nextAgentId || "").trim());
                              }
                            },
                            onEnvironmentChange: (nextEnvironmentId) => {
                              if (typeof onPreferredEnvironmentChange === "function") {
                                onPreferredEnvironmentChange(String(nextEnvironmentId || "").trim());
                              }
                            },
                            onDocumentPreviewOpenChange: () => {
                            },
                            onDeepResearchDetailOpenChange: () => {
                            },
                          })
                        )
                      )
                    )
                  : null
            )
          ),
            renderEnvironmentListActionMenu(),
            renderEnvironmentBulkActionMenu(),
            shouldShowEnvironmentHome ? renderEnvironmentShareTeamModalElement() : null,
            renderServerResourceActionMenu(),
            renderEnvironmentRenameModal(),
            renderServerRenameModal(),
            shouldShowEnvironmentHome ? renderDatabaseRenameModal() : null,
            renderServerAuthUserComposerModal(),
            renderEnvironmentCreationSetupModal(),
            renderServerComposerDialog()
          );
        }
  
