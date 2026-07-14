export const FINE_TUNING_PAGE_CONTROLLER_OVERVIEW_SCRIPT = String.raw`        function renderScoreChip(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedStatus = normalizePlaygroundFineTuningString(normalizedJob.status).toLowerCase();
          const hasAfter = hasPlaygroundFineTuningAfterResult(normalizedJob);
          const isError = new Set(["error", "failed", "cancelled", "canceled"]).has(normalizedStatus);
          const isActive = isPlaygroundFineTuningActiveStatus(normalizedStatus);
          const afterLabel = hasAfter
              ? formatPlaygroundFineTuningPercent(normalizedJob.afterScore)
              : isError
                ? "Error"
                : isActive
                ? "Running"
                : "Pending";
          return React.createElement("span", { className: "playground-fine-tuning-score-chip" },
            React.createElement("span", null, formatPlaygroundFineTuningPercent(normalizedJob.beforeScore)),
            React.createElement("span", { "aria-hidden": "true" }, "->"),
            React.createElement("span", null, afterLabel),
            hasAfter && !isError ? React.createElement("span", { className: "is-improvement" }, "+" + Math.round(normalizedJob.improvementScore * 100)) : null
          );
        }

        function renderStatus(job) {
          const status = normalizePlaygroundFineTuningString(job?.status || "completed").toLowerCase();
          const label = status === "completed" ? "Completed" : status === "running" ? "Running" : status === "verifying" ? "Verifying" : status === "queued" ? "Queued" : status === "error" ? "Error" : status || "Draft";
          return React.createElement("span", { className: "playground-fine-tuning-status-pill is-" + status }, label);
        }

        function renderOverview() {
          const sortOptions = [
            { id: "updated-desc", label: "Recently updated", description: "Newest jobs first." },
            { id: "name-asc", label: "Name", description: "Alphabetical by job name." },
            { id: "agent-asc", label: "Agent", description: "Alphabetical by target agent." },
            { id: "improvement-desc", label: "Best improvement", description: "Highest score lift first." },
            { id: "sets-desc", label: "Evaluation sets", description: "Most evaluation sets first." },
            { id: "conductor-asc", label: "Conducted by", description: "Alphabetical by conductor." },
          ];
          const filterOptions = [
            { id: "all", label: "All jobs", description: "Show every fine-tuning job." },
            { id: "completed", label: "Completed", description: "Finished jobs only." },
            { id: "running", label: "Running", description: "Currently running jobs." },
            { id: "verifying", label: "Verifying", description: "Jobs running verification." },
            { id: "with-improvement", label: "With improvement", description: "Jobs with a measured score lift." },
          ];
	          const sortMode = /^(?:updated|name|agent|improvement|sets|conductor)-(?:asc|desc)$/.test(String(fineTuningSortMode || ""))
	            ? String(fineTuningSortMode)
	            : "updated-desc";
          const filterMode = filterOptions.some((option) => option.id === fineTuningFilterMode) ? fineTuningFilterMode : "all";
          const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
          const getFineTuningJobAgentLabel = (job) => {
            const agent = normalizedAgents.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizePlaygroundFineTuningString(job?.targetAgentId || job?.agentId)) || null;
            return normalizePlaygroundFineTuningString(job?.agentName || job?.targetAgentName || agent?.name || agent?.label || agent?.title || "Agent");
          };
          const getFineTuningJobConductorLabel = (job) => {
            const explicitConductor = normalizePlaygroundFineTuningPersonIdentity(job?.conductedBy || job?.createdBy || job?.created_by || {});
            const conductor = getPlaygroundFineTuningPersonLabel(explicitConductor) ? explicitConductor : currentFineTuningUser;
            return getPlaygroundFineTuningPersonLabel(conductor);
          };
          const visibleJobs = filteredJobs
            .filter((job) => {
              const status = normalizePlaygroundFineTuningString(job?.status || "completed").toLowerCase();
              if (filterMode === "completed") return status === "completed";
              if (filterMode === "running") return status === "running";
              if (filterMode === "verifying") return status === "verifying";
              if (filterMode === "with-improvement") return Number(job?.improvementScore || 0) > 0;
              return true;
            })
	            .sort((left, right) => {
	              const direction = String(sortMode).endsWith("-asc") ? 1 : -1;
	              const sortKey = String(sortMode).replace(/-(?:asc|desc)$/, "");
	              let comparison = 0;
	              if (sortKey === "name") comparison = String(left?.name || "").localeCompare(String(right?.name || ""));
	              else if (sortKey === "agent") comparison = getFineTuningJobAgentLabel(left).localeCompare(getFineTuningJobAgentLabel(right));
	              else if (sortKey === "improvement") comparison = (Number(left?.improvementScore || 0) || 0) - (Number(right?.improvementScore || 0) || 0);
	              else if (sortKey === "sets") comparison = (Array.isArray(left?.evaluationSets) ? left.evaluationSets.length : 0) - (Array.isArray(right?.evaluationSets) ? right.evaluationSets.length : 0);
	              else if (sortKey === "conductor") comparison = getFineTuningJobConductorLabel(left).localeCompare(getFineTuningJobConductorLabel(right));
	              else comparison = (Date.parse(String(left?.updatedAt || "")) || 0) - (Date.parse(String(right?.updatedAt || "")) || 0);
	              if (comparison !== 0) return comparison * direction;
	              return String(left?.name || "").localeCompare(String(right?.name || ""));
	            });
          const hasFilters = Boolean(normalizedQuery || filterMode !== "all");
          const closeToolbarPopover = () => setFineTuningToolbarPopover("");
          function renderToolbarOption({ option, active, onClick }) {
            return React.createElement("button", {
                key: option.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (active ? " selected" : ""),
                onClick,
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                active ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 }) : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, option.label),
                option.description ? React.createElement("span", null, option.description) : null
              )
            );
          }
          const visibleFineTuningOverviewIds = visibleJobs.map((job) => String(job?.id || "").trim()).filter(Boolean);
          const selectedVisibleFineTuningOverviewIds = visibleFineTuningOverviewIds.filter((jobId) => selectedFineTuningOverviewIds.has(jobId));
          const allVisibleFineTuningJobsSelected = visibleFineTuningOverviewIds.length > 0 && selectedVisibleFineTuningOverviewIds.length === visibleFineTuningOverviewIds.length;
	          const renderFineTuningIdentityCell = (label, photoUrl) => {
	            const resolvedLabel = normalizePlaygroundFineTuningString(label) || "-";
	            if (resolvedLabel === "-") return React.createElement("span", { className: "playground-evaluations-run-cell-label" }, "-");
	            return React.createElement("span", { className: "playground-evaluations-run-agent-cell", title: resolvedLabel },
	              React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
	                photoUrl ? React.createElement("img", { src: photoUrl, alt: "" }) : getPlaygroundFineTuningInitials(resolvedLabel)
	              ),
	              React.createElement("span", { className: "playground-evaluations-run-cell-label" }, resolvedLabel)
	            );
	          };
	          const renderFineTuningAgentCell = (job) => {
	            const agent = normalizedAgents.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizePlaygroundFineTuningString(job?.targetAgentId || job?.agentId)) || null;
	            const label = getFineTuningJobAgentLabel(job);
	            const photoUrl = normalizePlaygroundFineTuningString(job?.agentPhotoUrl || job?.targetAgentPhotoUrl || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL);
	            return renderFineTuningIdentityCell(label, photoUrl);
	          };
	          const renderFineTuningConductorCell = (job) => {
	            const explicitConductor = normalizePlaygroundFineTuningPersonIdentity(job?.conductedBy || job?.createdBy || job?.created_by || {});
	            const conductor = getPlaygroundFineTuningPersonLabel(explicitConductor) ? explicitConductor : currentFineTuningUser;
	            return renderFineTuningIdentityCell(getPlaygroundFineTuningPersonLabel(conductor), conductor.avatarUrl);
	          };
	          const fineTuningSortId = String(sortMode || "updated-desc").replace(/-(?:asc|desc)$/, "");
	          const fineTuningSortDirection = String(sortMode || "").endsWith("-asc") ? "asc" : "desc";
	          const fineTuningOverviewColumns = [
	            {
	              id: "name",
	              header: "Job",
	              accessor: (job) => job?.name || "",
	              sortable: true,
	              width: "minmax(210px, 1.25fr)",
	              cell: ({ row: job }) => React.createElement("div", { className: "playground-plugin-row-title", title: job.name || "" }, job.name || "Untitled Fine-Tune"),
	            },
	            {
	              id: "agent",
	              header: "Agent",
	              accessor: getFineTuningJobAgentLabel,
	              sortable: true,
	              width: "minmax(150px, 0.82fr)",
	              cell: ({ row: job }) => renderFineTuningAgentCell(job),
	            },
	            {
	              id: "sets",
	              header: "Sets",
	              accessor: (job) => Array.isArray(job?.evaluationSets) ? job.evaluationSets.length : 0,
	              sortable: true,
	              sortDescFirst: true,
	              width: "minmax(85px, 0.42fr)",
	              align: "end",
	              cell: ({ row: job }) => {
	                const count = Array.isArray(job?.evaluationSets) ? job.evaluationSets.length : 0;
	                return count + " " + (count === 1 ? "set" : "sets");
	              },
	            },
	            {
	              id: "improvement",
	              header: "Improvement",
	              accessor: (job) => Number(job?.improvementScore || 0) || 0,
	              sortable: true,
	              sortDescFirst: true,
	              width: "minmax(155px, 0.82fr)",
	              hideBelow: 780,
	              cell: ({ row: job }) => renderScoreChip(job),
	            },
	            {
	              id: "conductor",
	              header: "Conducted by",
	              accessor: getFineTuningJobConductorLabel,
	              sortable: true,
	              width: "minmax(160px, 0.85fr)",
	              hideBelow: 980,
	              cell: ({ row: job }) => renderFineTuningConductorCell(job),
	            },
	          ];
	          const fineTuningEmptyState = scoredJobs.length === 0
	            ? React.createElement("div", { className: "playground-guardrails-empty" },
	                React.createElement("div", { className: "playground-guardrails-empty-icon" }, React.createElement(TestTubeDiagonal, { width: 18, height: 18, strokeWidth: 1.8 })),
	                React.createElement("div", { className: "playground-guardrails-empty-title" }, "No fine-tuning jobs yet"),
	                React.createElement("button", { type: "button", className: "playground-files-library-new-button playground-guardrails-empty-button", onClick: openCreateModal },
	                  React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }), "Fine-Tune"
	                )
	              )
	            : (hasFilters ? "No matching fine-tuning jobs." : "No fine-tuning jobs yet.");
	          const fineTuningOverviewDataTable = React.createElement(PlatformDataTable, {
	            rows: visibleJobs,
	            columns: fineTuningOverviewColumns,
	            getRowId: (job) => String(job?.id || ""),
	            ariaLabel: "Fine-tuning jobs",
	            className: "playground-fine-tuning-platform-data-table",
	            surface: "plain",
	            sorting: {
	              value: { id: fineTuningSortId, direction: fineTuningSortDirection },
	              manual: true,
	              onChange: (nextSorting) => {
	                if (!nextSorting) return;
	                setFineTuningSortMode(nextSorting.id + "-" + nextSorting.direction);
	                setFineTuningToolbarPopover("");
	              },
	            },
	            selection: {
	              enabled: true,
	              value: selectedFineTuningOverviewIds,
	              onChange: ({ selectedIds }) => setSelectedFineTuningOverviewIds(new Set(selectedIds)),
	              ariaLabel: (job) => "Select " + (job?.name || "fine-tuning job"),
	            },
	            toolbar: {
	              search: { value: fineTuningSearchQuery || "", onChange: (value) => typeof setFineTuningSearchQuery === "function" ? setFineTuningSearchQuery(value) : undefined, placeholder: "Search fine-tuning jobs", manual: true },
	              filters: [{ id: "status", label: "Status", value: filterMode, options: filterOptions, onChange: setFineTuningFilterMode }],
	              primaryAction: { label: "Fine-Tune", icon: Plus, onClick: openCreateModal },
	            },
	            getRowActions: (job) => [
	              { id: "open", label: "Open", icon: ExternalLink, onSelect: () => openJob(job.id) },
	              { id: "delete", label: "Delete", icon: Trash2, danger: true, separatorBefore: true, onSelect: () => deleteJob(job.id) },
	            ],
	            getRowAriaLabel: (job) => job?.name || "Fine-tuning job",
	            onRowActivate: (job) => openJob(job.id),
	            loading: fineTuningJobsLoading && scoredJobs.length === 0,
	            emptyState: fineTuningEmptyState,
	          });
	          return React.createElement("div", { className: "playground-plugins-page playground-guardrails-layout playground-evaluations-overview-layout playground-team-overview-page playground-agents-overview-page playground-fine-tuning-overview-shell is-develop-configure-page" },
            React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-team-overview-table-section playground-team-grid-table-section playground-evaluations-overview-section playground-fine-tuning-overview-table-section",
              },
	              fineTuningOverviewDataTable
	            )
          );
        }

`;
