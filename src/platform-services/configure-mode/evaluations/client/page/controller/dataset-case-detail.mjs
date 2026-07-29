export const EVALUATIONS_PAGE_CONTROLLER_DATASET_CASE_DETAIL_SCRIPT = String.raw`        function renderEvaluationDatasetCaseDetail() {
          const state = evaluationCaseEditorState;
          if (!activeSet || !state?.draft) {
            return React.createElement("div", {
                className: "playground-evaluations-dataset-case-loading",
              },
              React.createElement(PlatformLoadingState, {
                message: "Loading case...",
                centered: true,
              })
            );
          }

          const draft = buildEvaluationCaseEditorDraft(state.draft, Number(state.index || 0));
          const activeFileId = evaluationCaseActiveFileId === "expectedOutput"
            ? "expectedOutput"
            : evaluationCaseActiveFileId === "evaluationGuidance"
              ? "evaluationGuidance"
              : "input";
          const activeFileValue = activeFileId === "expectedOutput"
            ? String(draft.expectedOutput || "")
            : activeFileId === "evaluationGuidance"
              ? String(draft.evaluationGuidance || "")
              : String(draft.input || "");
          const caseFiles = [
            {
              id: "input",
              label: "Input",
              tabLabel: "Input",
              editorMode: "markdown",
              selectable: false,
              renameDisabled: true,
              deleteDisabled: true,
              moveDisabled: true,
            },
            {
              id: "expectedOutput",
              label: "Expected Output",
              tabLabel: "Expected Output",
              editorMode: "markdown",
              selectable: false,
              renameDisabled: true,
              deleteDisabled: true,
              moveDisabled: true,
            },
            {
              id: "evaluationGuidance",
              label: "Evaluator Guidance",
              tabLabel: "Evaluator Guidance",
              editorMode: "markdown",
              selectable: false,
              renameDisabled: true,
              deleteDisabled: true,
              moveDisabled: true,
            },
          ];
          const updateActiveFileValue = (value) => {
            updateEvaluationCaseEditorDraft({
              [activeFileId]: typeof value === "string" ? value : "",
            });
          };
          const metadata = React.createElement("div", {
              className: "playground-evaluations-dataset-case-identity",
            },
            React.createElement("input", {
              type: "text",
              className: "playground-evaluations-dataset-case-title-input",
              value: String(draft.title || ""),
              placeholder: "Case title",
              "aria-label": "Case title",
              onChange: (event) => updateEvaluationCaseEditorDraft({ title: event.target.value }),
            }),
            React.createElement("input", {
              type: "text",
              className: "file-resource-detail-page__description-input playground-evaluations-dataset-case-description-input",
              value: String(draft.description || ""),
              placeholder: "Describe what this case evaluates.",
              "aria-label": "Case description",
              onChange: (event) => updateEvaluationCaseEditorDraft({ description: event.target.value }),
            })
          );
          const code = React.createElement(PlatformCodeEditorWorkspace, {
            className: "playground-evaluations-dataset-case-workspace",
            ariaLabel: (String(draft.title || "").trim() || "Evaluation case") + " files",
            variant: "full-screen",
            files: caseFiles,
            activeFileId,
            onFileSelect: setEvaluationCaseActiveFileId,
            markdownEditor: {
              value: activeFileValue,
              onChange: updateActiveFileValue,
              placeholder: activeFileId === "expectedOutput"
                ? "Describe the expected result in Markdown..."
                : activeFileId === "evaluationGuidance"
                  ? "Add scoring criteria, tolerances, or partial-credit guidance..."
                  : "Describe the evaluation input in Markdown...",
              ariaLabel: activeFileId === "expectedOutput"
                ? "Expected output Markdown"
                : activeFileId === "evaluationGuidance"
                  ? "Evaluator guidance Markdown"
                  : "Evaluation input Markdown",
              historyKey: "evaluation-case:" + draft.id + ":" + activeFileId,
            },
          });
          const optimizationRole = normalizePlaygroundEvaluationOptimizationRole(draft.optimizationRole);
          const optimizationRoleOptions = [
            {
              value: "train",
              label: "Training",
              description: "Available to optimization workflows as training evidence.",
            },
            {
              value: "validation",
              label: "Validation",
              description: "Used to select candidates without exposing expected output.",
            },
            {
              value: "holdout",
              label: "Holdout",
              description: "Reserved for final verification and never used for optimization.",
            },
          ];
          const settings = React.createElement("div", {
              className: "playground-evaluations-dataset-case-settings-content",
            },
            React.createElement("section", {
                className: "playground-evaluations-dataset-case-configuration",
              },
              React.createElement("div", {
                  className: "playground-evaluations-dataset-case-configuration-row",
                },
                React.createElement("span", {
                  className: "playground-evaluations-dataset-case-configuration-label",
                },
                  React.createElement("span", null, "Optimization Role"),
                  React.createElement(PlatformPermissionHelpTooltip, {
                    text: "Controls whether this case is used for training, candidate validation, or final holdout verification.",
                    ariaLabel: "About optimization role",
                    placement: "bottom",
                    className: "playground-evaluations-dataset-case-setting-tooltip",
                  })
                ),
                React.createElement(PlatformSelector, {
                  value: optimizationRole,
                  options: optimizationRoleOptions,
                  onValueChange: (nextValue) => updateEvaluationCaseEditorDraft({
                    optimizationRole: normalizePlaygroundEvaluationOptimizationRole(nextValue),
                  }),
                  ariaLabel: "Select case optimization role",
                  label: getPlaygroundEvaluationOptimizationRoleLabel(optimizationRole),
                  alignment: "end",
                  popupAlignment: "right",
                  popupWidth: "min(330px, calc(100vw - 48px))",
                  className: "playground-evaluations-dataset-case-role-selector",
                  triggerClassName: "playground-evaluations-dataset-case-role-trigger",
                  popupClassName: "playground-evaluations-dataset-case-role-popup",
                })
              ),
              React.createElement("label", {
                  className: "playground-evaluations-dataset-case-configuration-row",
                },
                React.createElement("span", {
                  className: "playground-evaluations-dataset-case-configuration-label",
                },
                  React.createElement("span", null, "Runs per Evaluation"),
                  React.createElement(PlatformPermissionHelpTooltip, {
                    text: "Sets how many independent executions of this case are included in each evaluation run.",
                    ariaLabel: "About runs per evaluation",
                    placement: "bottom",
                    className: "playground-evaluations-dataset-case-setting-tooltip",
                  })
                ),
                React.createElement("input", {
                  type: "text",
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  className: "playground-evaluations-dataset-case-run-input",
                  value: String(draft.runCount || "1"),
                  onChange: (event) => {
                    const nextValue = String(event.target.value || "");
                    if (nextValue && !/^\d{0,2}$/.test(nextValue)) return;
                    if (nextValue && Number(nextValue) > 50) return;
                    updateEvaluationCaseEditorDraft({ runCount: nextValue });
                  },
                })
              )
            )
          );
          const sidebar = React.createElement(PlatformUiCard, {
              variant: "sidebar",
              className: "playground-evaluations-dataset-case-sidebar-card",
            },
            React.createElement("div", {
                className: "playground-evaluations-detail-sidebar-list playground-tasks-detail-facts-body",
              },
              renderEvaluationDetailSidebarRow("case-id", "Case ID", draft.id, {
                title: draft.id,
              }),
              draft.sourceThreadId
                ? renderEvaluationDetailSidebarRow("source-thread", "Source Thread", draft.sourceThreadTitle || draft.sourceThreadId, {
                    title: draft.sourceThreadId,
                  })
                : null,
              renderEvaluationDetailSidebarRow("created", "Created", formatPlaygroundEvaluationDate(draft.createdAt)),
              renderEvaluationDetailSidebarRow("updated", "Updated", formatPlaygroundEvaluationDate(draft.updatedAt || draft.createdAt)),
              React.createElement(PlatformSecondaryButton, {
                type: "button",
                size: "small",
                fullWidth: true,
                className: "playground-evaluations-dataset-case-delete-button",
                onClick: deleteEvaluationCaseEditor,
              }, "Delete Case")
            )
          );
          return React.createElement(EvaluationCaseDetailPage, {
            activeTab: evaluationCaseDetailTab === "settings" ? "settings" : "code",
            metadata,
            code,
            settings,
            sidebar,
            sidebarCollapsed: evaluationCaseDetailTab !== "settings",
          });
        }

`;
