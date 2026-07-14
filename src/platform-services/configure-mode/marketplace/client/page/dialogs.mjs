export const MARKETPLACE_PAGE_DIALOGS_SCRIPT = String.raw`        function renderTemplateModal(template) {
          if (!template) return null;
          return React.createElement(PlatformModalBackdrop, { className: "playground-resource-templates-modal-backdrop", onMouseDown: closeModal },
            React.createElement(PlatformModalSurface, {
                className: "playground-resource-templates-modal",
                onMouseDown: (event) => event.stopPropagation(),
              },
              React.createElement("div", { className: "playground-resource-templates-modal-header" },
                React.createElement("div", null,
                  React.createElement("h2", { className: "playground-resource-templates-modal-title" }, template.title || "Template"),
                  React.createElement("div", { className: "playground-resource-templates-modal-type" },
                    [template.typeLabel || template.type || "Template", template.difficulty || "", template.estimatedSetup || ""].filter(Boolean).join(" · ")
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-resource-templates-modal-close",
                  onClick: closeModal,
                  "aria-label": "Close template",
                }, React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-resource-templates-modal-body" },
                React.createElement("p", { className: "playground-resource-templates-modal-copy" }, template.description || template.summary || ""),
                React.createElement("div", { className: "playground-resource-templates-modal-section" },
                  React.createElement("h3", null, "Capabilities"),
                  React.createElement("ul", { className: "playground-resource-templates-modal-list" },
                    (Array.isArray(template.capabilities) ? template.capabilities : []).map((item, index) =>
                      React.createElement("li", { key: "capability:" + index }, item)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-resource-templates-modal-section" },
                  React.createElement("h3", null, "Workflow"),
                  React.createElement("ol", { className: "playground-resource-templates-modal-list" },
                    (Array.isArray(template.workflowSteps) ? template.workflowSteps : []).map((item, index) =>
                      React.createElement("li", { key: "step:" + index }, item)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-resource-templates-modal-section" },
                  React.createElement("h3", null, "Outputs"),
                  React.createElement("ul", { className: "playground-resource-templates-modal-list" },
                    (Array.isArray(template.outputs) ? template.outputs : []).map((item, index) =>
                      React.createElement("li", { key: "output:" + index }, item)
                    )
                  )
                )
              )
            )
          );
        }

        function renderPublishModal(template) {
          if (!template) return null;
          return React.createElement(PlatformModalBackdrop, { className: "playground-resource-templates-modal-backdrop", onMouseDown: closeModal },
            React.createElement(PlatformModalSurface, {
                className: "playground-resource-templates-modal",
                onMouseDown: (event) => event.stopPropagation(),
              },
              React.createElement("div", { className: "playground-resource-templates-modal-header" },
                React.createElement("div", null,
                  React.createElement("h2", { className: "playground-resource-templates-modal-title" }, "Publish template"),
                  React.createElement("div", { className: "playground-resource-templates-modal-type" }, template.title || "Template")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-resource-templates-modal-close",
                  onClick: closeModal,
                  "aria-label": "Close publish dialog",
                }, React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-resource-templates-modal-body" },
                projects.length > 0
                  ? React.createElement("div", { className: "playground-resource-templates-modal-projects" },
                      projects.map((project) =>
                        React.createElement("button", {
                          key: String(project?.id || project?.name),
                          type: "button",
                          className: "playground-resource-templates-project-option",
                          onClick: async () => {
                            const projectName = String(project?.name || "project").trim() || "project";
                            try {
                              if (typeof onPublishTemplate === "function") {
                                await onPublishTemplate(template, project);
                              } else if (typeof setNotice === "function") {
                                setNotice("Published " + String(template.title || "template") + " to " + projectName + ".");
                              }
                              closeModal();
                            } catch (error) {
                              if (typeof setNotice === "function") {
                                setNotice(error instanceof Error ? error.message : "Failed to publish template.");
                              }
                            }
                          },
                        }, project?.name || "Untitled project")
                      )
                    )
                  : React.createElement("div", { className: "playground-resource-templates-empty" }, "Create a project before publishing templates.")
              )
            )
          );
        }

`;
