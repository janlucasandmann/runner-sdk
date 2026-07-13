export const RESOURCE_TEMPLATES_PAGE_CSS = String.raw`
      .playground-resource-templates-page {
        width: 100%;
        height: 100%;
        min-height: 0;
        border-radius: inherit;
        background: #050505;
        overflow-y: auto;
        box-sizing: border-box;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-resource-templates-page-inner {
        box-sizing: border-box;
        width: min(100%, calc(var(--playground-centered-page-max-width) + 88px));
        max-width: calc(var(--playground-centered-page-max-width) + 88px);
        margin: 0 auto;
        padding: 42px 44px 48px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .playground-resource-templates-hero-heading {
        margin: 0;
        text-align: center;
        font-size: 24px;
        line-height: 1.2;
        font-weight: 500;
        letter-spacing: -0.02em;
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-resource-templates-hero-slide-content {
        width: min(100%, 650px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        text-align: center;
      }

      .playground-resource-templates-hero-pills {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 34px;
      }

      .playground-resource-templates-hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 34px;
        padding: 0 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.86);
        color: #111;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 14px 44px rgba(0, 0, 0, 0.16);
      }

      .playground-resource-templates-hero-pill.is-incoming {
        animation: playground-metronome-hero-pill-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .playground-resource-templates-hero-pill.is-outgoing {
        position: absolute;
        inset: 0 auto auto 50%;
        transform: translateX(-50%);
        animation: playground-metronome-hero-pill-out 260ms cubic-bezier(0.7, 0, 0.84, 0) both;
        pointer-events: none;
      }

      .playground-resource-templates-hero-pill-icon {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.08);
        color: #0d0d0d;
      }

      .playground-resource-templates-hero-copy {
        margin: 0;
        max-width: 560px;
        color: rgba(0, 0, 0, 0.7);
        font-size: 13px;
        line-height: 1.55;
      }

      .playground-resource-templates-hero-cta {
        position: absolute;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        min-height: 32px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: #0d0d0d;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
      }

      .playground-resource-templates-hero-dot {
        width: 8px;
        height: 8px;
        display: block;
        flex: 0 0 auto;
        padding: 0;
        border: 0;
        border-radius: 999px;
        appearance: none;
        background: rgba(255, 255, 255, 0.28);
        transition: background-color 160ms ease, transform 160ms ease;
        cursor: pointer;
      }

      .playground-resource-templates-hero-dot.is-active {
        background: rgba(255, 255, 255, 0.96);
        transform: scale(1.1);
      }

      .playground-resource-templates-notice {
        min-height: 18px;
        color: #66a6ff;
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-resource-templates-section-header {
        align-items: flex-start;
      }

      .playground-resource-templates-toolbar {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        flex-wrap: wrap;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-resource-templates-toolbar .playground-plugins-toolbar-controls {
        margin-left: auto;
      }

      .playground-resource-templates-filter-shell .playground-tasks-toolbar-popup-menu {
        left: 0;
        right: auto;
        transform-origin: top left;
      }

      .playground-resource-templates-resource-table .playground-resource-templates-col-main {
        width: 42%;
      }

      .playground-resource-templates-resource-table .playground-resource-templates-col-category {
        width: 16%;
      }

      .playground-resource-templates-resource-table .playground-resource-templates-col-difficulty {
        width: 14%;
      }

      .playground-resource-templates-resource-table .playground-resource-templates-col-setup {
        width: 14%;
      }

      .playground-resource-templates-resource-table .playground-resource-templates-col-actions {
        width: 76px;
      }

      .playground-resource-templates-template-main {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-resource-templates-template-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        flex: 0 0 auto;
      }

      .playground-resource-templates-template-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-resource-templates-row-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 500;
      }

      .playground-resource-templates-row-summary {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.35;
      }

      .playground-resource-templates-row-cell {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
      }

      .playground-resource-templates-publish-button {
        min-height: 28px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        cursor: pointer;
      }

      .playground-resource-templates-publish-button:hover,
      .playground-resource-templates-publish-button:focus-visible {
        color: rgba(255, 255, 255, 0.98);
        outline: none;
      }

      .playground-resource-templates-table-empty {
        padding: 28px 0;
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
        .playground-resource-templates-page-inner {
          padding: 30px 18px 42px;
        }

        .playground-resource-templates-toolbar .playground-plugins-search-shell {
          flex: 1 1 100%;
          width: 100%;
          min-width: 0;
          max-width: none;
        }

        .playground-resource-templates-resource-table .playground-resource-templates-col-difficulty,
        .playground-resource-templates-resource-table .playground-resource-templates-col-setup,
        .playground-resource-templates-resource-table th:nth-child(3),
        .playground-resource-templates-resource-table td:nth-child(3),
        .playground-resource-templates-resource-table th:nth-child(4),
        .playground-resource-templates-resource-table td:nth-child(4) {
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
        onPublishTemplate,
        onPreviewTemplate,
        templateSlideIndex,
        setTemplateSlideIndex,
        templateToolbarPopover,
        setTemplateToolbarPopover,
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
        const normalizedTemplateSlideIndex = Math.max(0, Number(templateSlideIndex || 0) || 0);
        const normalizedTemplateToolbarPopover = String(templateToolbarPopover || "");
        const updateTemplateSlideIndex = typeof setTemplateSlideIndex === "function" ? setTemplateSlideIndex : () => {};
        const updateTemplateToolbarPopover = typeof setTemplateToolbarPopover === "function" ? setTemplateToolbarPopover : () => {};
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
        const featuredTemplates = templateList.filter((template) => template.featured).slice(0, 6);
        const heroTemplates = (featuredTemplates.length ? featuredTemplates : templateList).slice(0, 6);
        const activeHeroIndex = heroTemplates.length ? normalizedTemplateSlideIndex % heroTemplates.length : 0;
        const activeHeroTemplate = heroTemplates[activeHeroIndex] || null;
        const outgoingHeroTemplate = heroTemplates.length > 1 ? heroTemplates[(activeHeroIndex + heroTemplates.length - 1) % heroTemplates.length] : null;
        const activeTypeOption = typeList.find((type) => String(type.id || "") === normalizedActiveType) || typeList[0] || { id: "all", label: "All templates" };
        const templateCountByType = templateList.reduce((counts, template) => {
          const type = String(template.type || "").trim();
          counts.all = (counts.all || 0) + 1;
          if (type) counts[type] = (counts[type] || 0) + 1;
          return counts;
        }, { all: 0 });

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

        function previewTemplate(template) {
          if (!template) return;
          updateTemplateToolbarPopover("");
          const previewableTemplateTypes = new Set(["metronome", "web_app", "function", "database"]);
          if (previewableTemplateTypes.has(String(template.type || "").trim()) && typeof onPreviewTemplate === "function") {
            onPreviewTemplate(template);
            return;
          }
          if (typeof setSelectedTemplateId === "function") {
            setSelectedTemplateId(String(template.id || ""));
          }
        }

        function renderHeroTemplatePill(template, className) {
          if (!template) return null;
          return React.createElement("div", { className },
            React.createElement("span", { className: "playground-resource-templates-hero-pill-icon" }, renderTemplateIcon(template.type, 13)),
            React.createElement("span", null, template.title || "Template")
          );
        }

        function renderTemplateFilterOption(option) {
          const optionId = String(option?.id || "all");
          const count = Math.max(0, Number(templateCountByType[optionId] || 0) || 0);
          return React.createElement("button", {
              key: optionId,
              type: "button",
              className: "tb-popup-row tb-popup-row-select" + (normalizedActiveType === optionId ? " selected" : ""),
              onClick: () => {
                if (typeof setActiveType === "function") setActiveType(optionId);
                updateTemplateToolbarPopover("");
              },
            },
            React.createElement("span", { className: "tb-popup-check-slot" },
              normalizedActiveType === optionId
                ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                : null
            ),
            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
              React.createElement("span", null, option?.label || optionId),
              React.createElement("span", null, count === 1 ? "1 resource" : count + " resources")
            )
          );
        }

        function renderTemplatesTable() {
          const columns = [
            {
              id: "resource",
              header: "Resource",
              accessor: (template) => template.title || "Untitled template",
              sortable: true,
              width: "minmax(260px, 1.65fr)",
              cell: ({ row: template }) => React.createElement("div", { className: "playground-resource-templates-template-main" },
                React.createElement("span", { className: "playground-resource-templates-template-icon" }, renderTemplateIcon(template.type, 16)),
                React.createElement("div", { className: "playground-resource-templates-template-copy" },
                  React.createElement("div", { className: "playground-resource-templates-row-title" }, template.title || "Untitled template"),
                  React.createElement("div", { className: "playground-resource-templates-row-summary" }, template.summary || "")
                )
              ),
            },
            {
              id: "category",
              header: "Category",
              accessor: (template) => template.typeLabel || template.type || "Template",
              sortable: true,
              width: "minmax(130px, 0.75fr)",
              cell: ({ row: template }) => React.createElement("span", { className: "playground-resource-templates-row-cell" }, template.typeLabel || template.type || "Template"),
            },
            {
              id: "difficulty",
              header: "Difficulty",
              accessor: (template) => template.difficulty || "Standard",
              sortable: true,
              width: "minmax(110px, 0.65fr)",
              hideBelow: 760,
              cell: ({ row: template }) => React.createElement("span", { className: "playground-resource-templates-row-cell" }, template.difficulty || "Standard"),
            },
            {
              id: "setup",
              header: "Setup",
              accessor: (template) => template.estimatedSetup || "5 min",
              sortable: true,
              width: "minmax(100px, 0.55fr)",
              hideBelow: 900,
              cell: ({ row: template }) => React.createElement("span", { className: "playground-resource-templates-row-cell" }, template.estimatedSetup || "5 min"),
            },
          ];
          return React.createElement(PlatformDataTable, {
            rows: filteredTemplates,
            columns,
            getRowId: (template) => "template:" + String(template.id || template.title),
            ariaLabel: "Resource templates",
            className: "playground-resource-templates-platform-data-table",
            sorting: { defaultValue: { id: "resource", direction: "asc" } },
            toolbar: {
              search: {
                value: searchQuery || "",
                onChange: (value) => typeof setSearchQuery === "function" && setSearchQuery(value),
                placeholder: "Search resources",
                manual: true,
              },
              filters: [{
                id: "template-type",
                label: "Filter",
                value: normalizedActiveType,
                onChange: (value) => typeof setActiveType === "function" && setActiveType(value),
                options: typeList.map((option) => {
                  const optionId = String(option?.id || "all");
                  const count = Math.max(0, Number(templateCountByType[optionId] || 0) || 0);
                  return {
                    id: optionId,
                    label: option?.label || optionId,
                    description: count === 1 ? "1 resource" : count + " resources",
                  };
                }),
              }],
              showSort: true,
            },
            onRowActivate: previewTemplate,
            getRowActions: (template) => [{
              id: "publish",
              label: "Publish",
              icon: Plus,
              onSelect: () => {
                if (typeof setPublishTemplateId === "function") setPublishTemplateId(String(template.id || ""));
              },
            }],
            emptyState: React.createElement("div", { className: "playground-metronome-table-main playground-resource-templates-table-empty" },
              React.createElement("div", { className: "playground-metronome-table-title" }, "No resources match this filter"),
              React.createElement("div", { className: "playground-metronome-table-subtitle" }, "Adjust search or choose another category.")
            ),
            noResultsState: "No resources match this search.",
          });
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

        return React.createElement("div", { className: "playground-resource-templates-page" },
          React.createElement("div", { className: "playground-resource-templates-page-inner playground-plugins-page" },
            React.createElement("h2", { className: "playground-resource-templates-hero-heading playground-tools-overview-heading" }, "Start from reusable project resources"),
            React.createElement("section", { className: "playground-plugins-hero-slider playground-metronome-hero-slider playground-resource-templates-hero-slider" },
              React.createElement("div", { className: "playground-plugins-hero-slide" },
                React.createElement("div", { className: "playground-resource-templates-hero-slide-content" },
                  React.createElement("div", { className: "playground-resource-templates-hero-pills" },
                    outgoingHeroTemplate
                      ? renderHeroTemplatePill(outgoingHeroTemplate, "playground-resource-templates-hero-pill is-outgoing")
                      : null,
                    renderHeroTemplatePill(activeHeroTemplate, "playground-resource-templates-hero-pill is-incoming")
                  ),
                  activeHeroTemplate
                    ? React.createElement("p", { className: "playground-resource-templates-hero-copy" },
                        activeHeroTemplate.summary || activeHeroTemplate.description || ""
                      )
                    : null
                ),
                activeHeroTemplate
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-resource-templates-hero-cta",
                      onClick: () => previewTemplate(activeHeroTemplate),
                    },
                      React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Open preview")
                    )
                  : null,
                heroTemplates.length > 1
                  ? React.createElement("div", { className: "playground-plugins-hero-dots" },
                      heroTemplates.map((template, index) => React.createElement("button", {
                        key: String(template.id || index),
                        type: "button",
                        className: "playground-resource-templates-hero-dot" + (index === activeHeroIndex ? " is-active" : ""),
                        "aria-label": "Show " + String(template.title || "template"),
                        onClick: () => updateTemplateSlideIndex(index),
                      }))
                    )
                  : null
              )
            ),
            React.createElement("section", { className: "playground-plugins-section" },
              React.createElement("div", { className: "playground-plugins-section-header playground-resource-templates-section-header" },
                React.createElement("div", { className: "playground-plugins-section-copy" },
                  React.createElement("h3", { className: "playground-plugins-section-title" }, "Resources"),
                  React.createElement("p", { className: "playground-plugins-section-subtitle" },
                    "Reusable templates for metronomes, files, web apps, functions, databases, and Imagine resources."
                  ),
                  notice
                    ? React.createElement("div", { className: "playground-resource-templates-notice" }, notice)
                    : null
                )
              ),
              renderTemplatesTable()
            )
          ),
          renderTemplateModal(selectedTemplate),
          renderPublishModal(publishTemplate)
        );
      }
`;
