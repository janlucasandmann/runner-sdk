export const IMAGINE_TEMPLATE_PAGE_SHARING_SCRIPT = String.raw`          const renderPopupRow = ({ key, selected, label, description, onClick }) => React.createElement("button", {
            key,
            type: "button",
            className: "playground-imagine-template-popup-row" + (selected ? " is-selected" : ""),
            onClick,
          },
            React.createElement("span", { className: "tb-popup-check-slot" },
              selected
                ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                : null
            ),
            React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
              React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, label),
              description
                ? React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, description)
                : null
            )
          );

          const handleShareTemplateWithTeam = async () => {
            const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
            const normalizedTeamId = String(shareTeamId || "").trim();
            const normalizedTemplateId = String(activeTemplate?.id || "").trim();
            if (!normalizedBackendUrl || !normalizedTeamId || !normalizedTemplateId || !activeTemplate?.isCustom) {
              return;
            }
            setShareLoading(true);
            setShareError("");
            try {
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              if (apiKey) {
                headers.set("X-API-Key", apiKey);
              }
              const templatePayload = {
                ...activeTemplate,
              };
              delete templatePayload["long" + "Description"];
              const response = await fetch(
                normalizedBackendUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares",
                {
                  method: "POST",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                  body: JSON.stringify({
                    resourceType: "imagine_template",
                    resourceId: normalizedTemplateId,
                    accessLevel: "use",
                    metadata: {
                      template: templatePayload,
                    },
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to share template.");
              }
              setActiveActionPopup("");
              setShareError("");
            } catch (error) {
              setShareError(error instanceof Error ? error.message : "Failed to share template.");
            } finally {
              setShareLoading(false);
            }
          };

          const renderActionPopup = () => {
            if (!activeActionPopup) {
              return null;
            }
            if (activeActionPopup === "template-actions") {
              return React.createElement(PlatformPopupSurface, { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Template actions"),
                React.createElement("div", { className: "playground-imagine-template-popup-list" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-imagine-template-popup-row",
                    onClick: () => {
                      setShareError("");
                      setActiveActionPopup("share-template");
                    },
                  },
                    React.createElement("span", { className: "tb-popup-check-slot" },
                      React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
                      React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, "Share with team"),
                      React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, "Make this template available to a team")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-imagine-template-popup-row is-danger",
                    onClick: () => {
                      setActiveActionPopup("");
                      setSettingsFlipped(false);
                      if (typeof onDeleteTemplate === "function") {
                        onDeleteTemplate(activeTemplate);
                      }
                    },
                  },
                    React.createElement("span", { className: "tb-popup-check-slot" },
                      React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
                      React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, "Delete template"),
                      React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, "Remove it from My Templates")
                    )
                  )
                )
              );
            }
            if (activeActionPopup === "share-template") {
              return React.createElement(PlatformPopupSurface, { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Share with team"),
                shareLoading && !shareTeams.length
                  ? React.createElement("p", { className: "playground-imagine-template-action-popup-copy" }, "Loading teams...")
                  : React.createElement("div", { className: "playground-imagine-template-popup-list" },
                      shareTeams.length
                        ? shareTeams.map((team) => renderPopupRow({
                            key: "share-team:" + team.id,
                            selected: String(team.id || "") === shareTeamId,
                            label: team.name || "Untitled team",
                            description: "Use this Imagine template",
                            onClick: () => setShareTeamId(String(team.id || "")),
                          }))
                        : React.createElement("p", { className: "playground-imagine-template-action-popup-copy" }, "No teams available yet.")
                    ),
                shareError
                  ? React.createElement("p", { className: "playground-imagine-template-popup-error" }, shareError)
                  : null,
                React.createElement("div", { className: "playground-imagine-template-popup-footer" },
                  React.createElement(PlatformSecondaryButton, {
                    size: "medium",
                    type: "button",
                    className: "playground-imagine-template-popup-button is-secondary",
                    onClick: () => {
                      setShareError("");
                      setActiveActionPopup("template-actions");
                    },
                  }, "Back"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "button",
                    className: "playground-imagine-template-popup-button is-primary",
                    disabled: shareLoading || !shareTeamId,
                    onClick: () => {
                      void handleShareTemplateWithTeam();
                    },
                  }, shareLoading ? "Sharing..." : "Share")
                )
              );
            }
            if (activeActionPopup === "info") {
              return React.createElement(PlatformPopupSurface, { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, activeTemplate?.title || "Template"),
                React.createElement("p", { className: "playground-imagine-template-action-popup-copy" },
                  activeTemplate?.description || "Use this template as visual direction for the generated image."
                )
              );
            }
            if (activeActionPopup === "attachments") {
              return React.createElement(PlatformPopupSurface, { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Attachments"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-popup-dropzone" + (isAttachmentDragging ? " is-dragging" : ""),
                  onClick: () => fileInputRef.current?.click(),
                  onDragOver: (event) => {
                    event.preventDefault();
                    setIsAttachmentDragging(true);
                  },
                  onDragLeave: (event) => {
                    if (event.currentTarget.contains(event.relatedTarget)) {
                      return;
                    }
                    setIsAttachmentDragging(false);
                  },
                  onDrop: handleAttachmentDrop,
                },
                  React.createElement(Paperclip, { width: 16, height: 16, strokeWidth: 1.8 }),
                  React.createElement("span", null, isAttachmentDragging ? "Drop files here" : "Attach files")
                ),
                attachedFiles.length
                  ? React.createElement("div", { className: "playground-imagine-template-popup-attachments" },
                      attachedFiles.map((fileName) => React.createElement("span", { key: fileName, className: "playground-imagine-template-attachment" },
                        React.createElement(FileText, { width: 13, height: 13, strokeWidth: 1.8 }),
                        React.createElement("span", null, fileName)
                      ))
                    )
                  : null
              );
            }
            if (activeActionPopup === "projects") {
              return React.createElement(PlatformPopupSurface, { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Project"),
                React.createElement("div", { className: "playground-imagine-template-popup-list" },
                  renderPopupRow({
                    key: "project:none",
                    selected: !selectedProjectId,
                    label: "None",
                    description: "Generate without project context",
                    onClick: () => handleProjectSelect(""),
                  }),
                  availableProjects.length
                    ? availableProjects.map((project) => renderPopupRow({
                        key: "project:" + project.id,
                        selected: selectedProjectId === project.id,
                        label: project.name,
                        description: "Use strategy, tasks, files, and history",
                        onClick: () => handleProjectSelect(project.id),
                      }))
                    : React.createElement("p", { className: "playground-imagine-template-action-popup-copy" }, "No projects available.")
                )
              );
            }
            if (activeActionPopup === "aspect") {
              return React.createElement(PlatformPopupSurface, { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Aspect ratio"),
                React.createElement("div", { className: "playground-imagine-template-popup-list" },
                  aspectRatioOptions.map((option) => renderPopupRow({
                    key: "aspect:" + (option.value || "none"),
                    selected: aspectRatio === option.value,
                    label: option.label,
                    description: option.description,
                    onClick: () => handleAspectRatioSelect(option.value),
                  }))
                )
              );
            }
            if (activeActionPopup === "connectors") {
              return React.createElement(PlatformPopupSurface, { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Connectors"),
                React.createElement("div", { className: "playground-imagine-template-popup-list" },
                  connectors.map((connector) => {
                    const isSelected = selectedConnectors.includes(connector.id);
                    return React.createElement("button", {
                      key: connector.id,
                      type: "button",
                      className: "playground-imagine-template-popup-row" + (isSelected ? " is-selected" : ""),
                      onClick: () => handleConnectorBrowse(connector),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        isSelected
                          ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
                        React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, connector.label),
                        React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, "Open file explorer")
                      )
                    );
                  })
                )
              );
            }
            return null;
          };

          const renderActionButton = ({ id, label, Icon, onClick, className }) => React.createElement("button", {
            key: id,
            type: "button",
            className: "playground-imagine-template-action-button" + (activeActionPopup === id ? " is-active" : "") + (className ? " " + className : ""),
            title: label,
            "aria-label": label,
            onClick: onClick || (() => setActiveActionPopup((current) => current === id ? "" : id)),
          }, React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.8 }));

`;
