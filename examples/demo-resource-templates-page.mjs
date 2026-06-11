export const RESOURCE_TEMPLATES_PAGE_CSS = String.raw`
      .playground-resource-templates-page {
        width: min(100%, 1180px);
        margin: 0 auto;
        padding: 48px 0 64px;
        color: #fff;
      }

      .playground-resource-templates-hero {
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin-bottom: 28px;
      }

      .playground-resource-templates-hero-top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
      }

      .playground-resource-templates-eyebrow {
        margin: 0 0 8px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.35;
      }

      .playground-resource-templates-title {
        margin: 0;
        font-size: 32px;
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-resource-templates-copy {
        max-width: 640px;
        margin: 10px 0 0;
        color: rgba(255, 255, 255, 0.62);
        font-size: 13px;
        line-height: 1.55;
      }

      .playground-resource-templates-notice {
        min-height: 20px;
        color: #66a6ff;
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-resource-templates-featured-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-resource-templates-card {
        min-width: 0;
        min-height: 170px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        border: 0;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-resource-templates-card:hover {
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-resource-templates-card-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 166, 255, 0.14);
        color: #66a6ff;
      }

      .playground-resource-templates-card-meta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 11px;
        line-height: 1.3;
      }

      .playground-resource-templates-card-title {
        margin: 0;
        font-size: 15px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-resource-templates-card-summary {
        margin: 0;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-resource-templates-table-card {
        position: relative;
        padding: 1px;
        border-radius: 15px;
      }

      .playground-resource-templates-table-card::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.04) 45%, rgba(102, 166, 255, 0.24));
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }

      .playground-resource-templates-table-inner {
        position: relative;
        z-index: 1;
        overflow: hidden;
        border-radius: inherit;
        background: transparent;
      }

      .playground-resource-templates-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px;
      }

      .playground-resource-templates-search {
        min-width: 0;
        flex: 1 1 auto;
        height: 38px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 13px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.6);
      }

      .playground-resource-templates-search input {
        min-width: 0;
        flex: 1 1 auto;
        border: 0;
        outline: none;
        background: transparent;
        color: #fff;
        font: inherit;
        font-size: 12px;
      }

      .playground-resource-templates-filter {
        height: 38px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.84);
        padding: 0 14px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }

      .playground-resource-templates-filter.is-active {
        background: rgba(102, 166, 255, 0.16);
        color: #fff;
      }

      .playground-resource-templates-table {
        display: flex;
        flex-direction: column;
      }

      .playground-resource-templates-row {
        min-height: 58px;
        display: grid;
        grid-template-columns: minmax(260px, 1.5fr) minmax(110px, 0.55fr) minmax(150px, 0.75fr) minmax(160px, 0.8fr) auto;
        gap: 16px;
        align-items: center;
        padding: 12px 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-resource-templates-row.is-header {
        min-height: 36px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
      }

      .playground-resource-templates-row-title {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-resource-templates-row-icon {
        width: 28px;
        height: 28px;
        flex: 0 0 28px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 166, 255, 0.14);
        color: #66a6ff;
      }

      .playground-resource-templates-row-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
        font-weight: 500;
      }

      .playground-resource-templates-row-summary {
        min-width: 0;
        margin-top: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
      }

      .playground-resource-templates-row-cell {
        min-width: 0;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
      }

      .playground-resource-templates-row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .playground-resource-templates-action {
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        padding: 0 12px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }

      .playground-resource-templates-action.is-primary {
        background: #fff;
        color: #000;
      }

      .playground-resource-templates-empty {
        padding: 34px 16px;
        color: rgba(255, 255, 255, 0.54);
        text-align: center;
        font-size: 12px;
      }

      .playground-resource-templates-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 5000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.62);
        backdrop-filter: blur(18px);
      }

      .playground-resource-templates-modal {
        width: min(100%, 680px);
        max-height: min(760px, calc(100dvh - 48px));
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 18px;
        background: #202020;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.48);
      }

      .playground-resource-templates-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        padding: 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-resource-templates-modal-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-resource-templates-modal-type {
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
      }

      .playground-resource-templates-modal-close {
        width: 30px;
        height: 30px;
        flex: 0 0 30px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        cursor: pointer;
      }

      .playground-resource-templates-modal-body {
        overflow: auto;
        padding: 18px;
      }

      .playground-resource-templates-modal-copy {
        margin: 0 0 16px;
        color: rgba(255, 255, 255, 0.66);
        font-size: 13px;
        line-height: 1.55;
      }

      .playground-resource-templates-modal-section {
        margin-top: 18px;
      }

      .playground-resource-templates-modal-section h3 {
        margin: 0 0 9px;
        font-size: 13px;
        font-weight: 500;
      }

      .playground-resource-templates-modal-list {
        margin: 0;
        padding-left: 18px;
        color: rgba(255, 255, 255, 0.66);
        font-size: 12px;
        line-height: 1.6;
      }

      .playground-resource-templates-modal-projects {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .playground-resource-templates-project-option {
        min-height: 42px;
        border: 0;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.07);
        color: #fff;
        padding: 10px 12px;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-resource-templates-project-option:hover {
        background: rgba(255, 255, 255, 0.11);
      }

      @media (max-width: 980px) {
        .playground-resource-templates-featured-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-resource-templates-row {
          grid-template-columns: minmax(0, 1fr);
          gap: 7px;
        }

        .playground-resource-templates-row.is-header {
          display: none;
        }
      }
`;

export const RESOURCE_TEMPLATES_PAGE_SCRIPT = String.raw`
      function getPlaygroundResourceTemplateIcon(type) {
        const normalizedType = String(type || "").trim();
        if (normalizedType === "metronome") return typeof Metronome !== "undefined" ? Metronome : Layers;
        if (normalizedType === "file") return typeof FolderOpen !== "undefined" ? FolderOpen : Layers;
        if (normalizedType === "web_app") return typeof Monitor !== "undefined" ? Monitor : Layers;
        if (normalizedType === "function") return typeof FunctionSquare !== "undefined" ? FunctionSquare : Layers;
        if (normalizedType === "database") return typeof Database !== "undefined" ? Database : Layers;
        if (normalizedType === "imagine") return typeof Clapperboard !== "undefined" ? Clapperboard : Layers;
        return typeof Layers !== "undefined" ? Layers : null;
      }

      function renderPlaygroundResourceTemplatesPage({
        templates,
        types,
        projectOptions,
        activeType,
        setActiveType,
        searchQuery,
        setSearchQuery,
        selectedTemplateId,
        setSelectedTemplateId,
        publishTemplateId,
        setPublishTemplateId,
        notice,
        setNotice,
      }) {
        const templateList = Array.isArray(templates) ? templates : [];
        const typeList = Array.isArray(types) && types.length
          ? types
          : [{ id: "all", label: "All templates" }];
        const projects = Array.isArray(projectOptions) ? projectOptions : [];
        const normalizedActiveType = String(activeType || "all").trim() || "all";
        const normalizedSearch = String(searchQuery || "").trim().toLowerCase();
        const selectedTemplate = templateList.find((template) => String(template.id || "") === String(selectedTemplateId || ""));
        const publishTemplate = templateList.find((template) => String(template.id || "") === String(publishTemplateId || ""));
        const filteredTemplates = templateList.filter((template) => {
          const typeMatches = normalizedActiveType === "all" || String(template.type || "") === normalizedActiveType;
          if (!typeMatches) return false;
          if (!normalizedSearch) return true;
          const haystack = [
            template.title,
            template.summary,
            template.description,
            template.typeLabel,
            ...(Array.isArray(template.capabilities) ? template.capabilities : []),
          ].join(" ").toLowerCase();
          return haystack.includes(normalizedSearch);
        });
        const featuredTemplates = templateList.filter((template) => template.featured).slice(0, 4);

        function closeModal() {
          if (typeof setSelectedTemplateId === "function") setSelectedTemplateId("");
          if (typeof setPublishTemplateId === "function") setPublishTemplateId("");
        }

        function renderTemplateIcon(type, size) {
          const Icon = getPlaygroundResourceTemplateIcon(type);
          return Icon
            ? React.createElement(Icon, { width: size || 16, height: size || 16, strokeWidth: 1.8 })
            : null;
        }

        function renderFeaturedCard(template) {
          return React.createElement("button", {
              key: "featured:" + String(template.id || template.title),
              type: "button",
              className: "playground-resource-templates-card",
              onClick: () => typeof setSelectedTemplateId === "function" && setSelectedTemplateId(String(template.id || "")),
            },
            React.createElement("span", { className: "playground-resource-templates-card-icon" }, renderTemplateIcon(template.type, 17)),
            React.createElement("span", { className: "playground-resource-templates-card-meta" },
              String(template.typeLabel || "Template"),
              String(template.estimatedSetup || "") ? "· " + String(template.estimatedSetup) : ""
            ),
            React.createElement("h3", { className: "playground-resource-templates-card-title" }, template.title || "Untitled template"),
            React.createElement("p", { className: "playground-resource-templates-card-summary" }, template.summary || template.description || "")
          );
        }

        function renderTemplateRow(template) {
          return React.createElement("div", {
              key: "template:" + String(template.id || template.title),
              className: "playground-resource-templates-row",
            },
            React.createElement("div", { className: "playground-resource-templates-row-title" },
              React.createElement("span", { className: "playground-resource-templates-row-icon" }, renderTemplateIcon(template.type, 14)),
              React.createElement("div", { className: "playground-resource-templates-row-copy" },
                React.createElement("div", { className: "playground-resource-templates-row-name" }, template.title || "Untitled template"),
                React.createElement("div", { className: "playground-resource-templates-row-summary" }, template.summary || "")
              )
            ),
            React.createElement("div", { className: "playground-resource-templates-row-cell" }, template.typeLabel || template.type || "Template"),
            React.createElement("div", { className: "playground-resource-templates-row-cell" }, template.difficulty || "Standard"),
            React.createElement("div", { className: "playground-resource-templates-row-cell" }, template.estimatedSetup || "5 min"),
            React.createElement("div", { className: "playground-resource-templates-row-actions" },
              React.createElement("button", {
                type: "button",
                className: "playground-resource-templates-action",
                onClick: () => typeof setSelectedTemplateId === "function" && setSelectedTemplateId(String(template.id || "")),
              }, "View"),
              React.createElement("button", {
                type: "button",
                className: "playground-resource-templates-action is-primary",
                onClick: () => typeof setPublishTemplateId === "function" && setPublishTemplateId(String(template.id || "")),
              }, "Publish")
            )
          );
        }

        function renderTemplateModal(template) {
          if (!template) return null;
          return React.createElement("div", { className: "playground-resource-templates-modal-backdrop", onMouseDown: closeModal },
            React.createElement("div", {
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
          return React.createElement("div", { className: "playground-resource-templates-modal-backdrop", onMouseDown: closeModal },
            React.createElement("div", {
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
                          onClick: () => {
                            const projectName = String(project?.name || "project").trim() || "project";
                            if (typeof setNotice === "function") {
                              setNotice("Published " + String(template.title || "template") + " to " + projectName + ".");
                            }
                            closeModal();
                          },
                        }, project?.name || "Untitled project")
                      )
                    )
                  : React.createElement("div", { className: "playground-resource-templates-empty" }, "Create a project before publishing templates.")
              )
            )
          );
        }

        return React.createElement("div", { className: "playground-resource-templates-page" },
          React.createElement("section", { className: "playground-resource-templates-hero" },
            React.createElement("div", { className: "playground-resource-templates-hero-top" },
              React.createElement("div", null,
                React.createElement("p", { className: "playground-resource-templates-eyebrow" }, "Infrastructure templates"),
                React.createElement("h1", { className: "playground-resource-templates-title" }, "Start from reusable project resources"),
                React.createElement("p", { className: "playground-resource-templates-copy" },
                  "Use templates to create metronomes, files, databases, functions, web apps, and Imagine resources that match the way a project is meant to operate."
                )
              ),
              React.createElement("div", { className: "playground-resource-templates-notice" }, notice || "")
            ),
            React.createElement("div", { className: "playground-resource-templates-featured-grid" },
              featuredTemplates.map(renderFeaturedCard)
            )
          ),
          React.createElement("section", { className: "playground-resource-templates-table-card" },
            React.createElement("div", { className: "playground-resource-templates-table-inner" },
              React.createElement("div", { className: "playground-resource-templates-toolbar" },
                React.createElement("div", { className: "playground-resource-templates-search" },
                  React.createElement(Search, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("input", {
                    value: searchQuery || "",
                    onChange: (event) => typeof setSearchQuery === "function" && setSearchQuery(event.target.value),
                    placeholder: "Search templates",
                  })
                ),
                typeList.map((type) =>
                  React.createElement("button", {
                    key: String(type.id),
                    type: "button",
                    className: "playground-resource-templates-filter" + (normalizedActiveType === String(type.id) ? " is-active" : ""),
                    onClick: () => typeof setActiveType === "function" && setActiveType(String(type.id || "all")),
                  }, type.label || type.id)
                )
              ),
              React.createElement("div", { className: "playground-resource-templates-table" },
                React.createElement("div", { className: "playground-resource-templates-row is-header" },
                  React.createElement("div", null, "Template"),
                  React.createElement("div", null, "Type"),
                  React.createElement("div", null, "Difficulty"),
                  React.createElement("div", null, "Setup"),
                  React.createElement("div", null, "")
                ),
                filteredTemplates.length > 0
                  ? filteredTemplates.map(renderTemplateRow)
                  : React.createElement("div", { className: "playground-resource-templates-empty" }, "No templates match this filter.")
              )
            )
          ),
          renderTemplateModal(selectedTemplate),
          renderPublishModal(publishTemplate)
        );
      }
`;
