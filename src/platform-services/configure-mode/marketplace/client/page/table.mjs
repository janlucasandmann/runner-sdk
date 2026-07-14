export const MARKETPLACE_PAGE_TABLE_SCRIPT = String.raw`        function renderTemplateFilterOption(option) {
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

`;
