export const EVALUATIONS_PAGE_CONTROLLER_VIEWS_SCRIPT = String.raw`        function renderOverview() {
          const normalizedEvaluationsOverviewScope = evaluationsOverviewScope === "created"
            ? "created"
            : evaluationsOverviewScope === "shared"
              ? "shared"
              : "all";
          const currentEvaluationUserKeys = new Set(getEvaluationPersonIdentityKeys(currentEvaluationCreator));
          const currentEvaluationUserName = String(currentEvaluationCreator?.name || "").trim().toLowerCase();
          const isEvaluationCreatedByCurrentUser = (set) => {
            const creator = getPlaygroundEvaluationCreatorIdentity(set);
            const creatorKeys = getEvaluationPersonIdentityKeys(creator);
            if (creatorKeys.some((key) => currentEvaluationUserKeys.has(key))) return true;
            if (creatorKeys.length) return false;
            const creatorName = String(creator?.name || "").trim().toLowerCase();
            if (!creatorName || ["unknown", "you", "me", "current user"].includes(creatorName)) return true;
            return Boolean(currentEvaluationUserName && creatorName === currentEvaluationUserName);
          };
          const scopedEvaluationSets = normalizedEvaluationsOverviewScope === "all"
            ? normalizedSets
            : normalizedSets.filter((set) => {
                const createdByCurrentUser = isEvaluationCreatedByCurrentUser(set);
                return normalizedEvaluationsOverviewScope === "created"
                  ? createdByCurrentUser
                  : !createdByCurrentUser;
              });
          const evaluationOverviewRows = scopedEvaluationSets
            .map((set) => {
              const id = String(set?.id || "").trim();
              const name = String(set?.name || "Untitled Evaluation").trim();
              const description = String(set?.description || "").trim();
              const evaluator = normalizePlaygroundEvaluationEvaluator(set?.evaluator);
              const evaluatorAgent = evaluator.type === "agent"
                ? getPlaygroundEvaluationAgentRecord(agentOptions, evaluator.agentId)
                : null;
              const evaluatorLabel = getPlaygroundEvaluationEvaluatorLabel(evaluator, agentOptions);
              const evaluatorAvatarUrl = evaluatorAgent
                ? getPlaygroundEvaluationAgentPhotoUrl(evaluatorAgent)
                : "";
              const creator = resolvePlaygroundEvaluationCreatorIdentity(set, [currentEvaluationCreator]);
              const creatorName = getPlaygroundEvaluationCreatorLabel(creator) || "Unknown";
              const updatedValue = set?.updatedAt || set?.createdAt || "";
              const updatedDate = new Date(updatedValue || "");
              const overviewMetadata = set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
                ? set.metadata
                : {};
              const overviewSummaryVersion = Number(
                overviewMetadata.overviewSummaryVersion
                ?? overviewMetadata.overview_summary_version
                ?? 0
              ) || 0;
              const rawOverviewCaseCount = overviewMetadata.overviewCaseCount
                ?? overviewMetadata.overview_case_count;
              const rawOverviewRunCount = overviewMetadata.overviewRunCount
                ?? overviewMetadata.overview_run_count;
              const hasLoadedEvaluationDetails = evaluationDetailsLoadedRef.current.has(id);
              const caseCount = overviewSummaryVersion >= 1 && Number.isFinite(Number(rawOverviewCaseCount))
                ? Math.max(0, Number(rawOverviewCaseCount))
                : hasLoadedEvaluationDetails && Array.isArray(set?.dataRows)
                  ? set.dataRows.length
                  : null;
              const runCount = overviewSummaryVersion >= 1 && Number.isFinite(Number(rawOverviewRunCount))
                ? Math.max(0, Number(rawOverviewRunCount))
                : hasLoadedEvaluationDetails && Array.isArray(set?.runs)
                  ? set.runs.length
                  : null;
              return {
                id,
                name,
                description,
                evaluatorLabel,
                evaluatorType: evaluator.type,
                evaluatorAvatarUrl,
                evaluatorFallback: getPlaygroundEvaluationInitials(evaluatorLabel),
                caseCount,
                runCount,
                creatorName,
                creatorAvatarUrl: creator.avatarUrl || "",
                creatorFallback: getPlaygroundEvaluationInitials(creatorName),
                updatedAt: Number.isFinite(updatedDate.getTime()) ? updatedDate.getTime() : 0,
                canRun: caseCount === null || caseCount > 0,
                searchText: [
                  name,
                  set?.description,
                  evaluatorLabel,
                  creatorName,
                  caseCount === null ? "" : String(caseCount),
                  runCount === null ? "" : String(runCount),
                  id,
                ].filter(Boolean).join(" "),
              };
            })
            .filter((set) => set.id);

          return React.createElement(EvaluationsOverviewPage, {
            rows: evaluationOverviewRows,
            loading: evaluationBackendSyncState.status === "loading" && evaluationOverviewRows.length === 0,
            error: evaluationBackendSyncState.error || "",
            incrementalLoading: {
              hasMore: evaluationOverviewPaginationState.hasMore,
              loading: evaluationOverviewPaginationState.loadingMore,
              loadingMessage: "Loading more evaluations...",
              onLoadMore: loadMoreBackendEvaluationSets,
            },
            controlsPortalId: "playground-evaluations-overview-controls",
            onOpen: (set) => openSetDetail(set.id),
            onCreate: openEvaluationCreateModal,
            onRename: (set) => {
              const sourceSet = normalizedSets.find((candidate) => candidate.id === set.id);
              if (sourceSet) openEvaluationRenameDialog(sourceSet);
            },
            onRun: (set) => openRunEvaluationModal(set.id),
            onDelete: (set) => handleDeleteEvaluation(set.id),
            onDeleteMany: (sets) => handleDeleteEvaluations(sets.map((set) => set.id)),
          });
        }

        function renderEvaluationDetailSidebarRow(key, label, value, options = {}) {
          return React.createElement("div", {
              key,
              className: "playground-evaluations-detail-sidebar-row playground-tasks-detail-fact" + (options.className ? " " + options.className : ""),
            },
            React.createElement("span", {
              className: "playground-evaluations-detail-sidebar-label playground-tasks-detail-fact-label",
            }, label),
            React.createElement(options.control ? "div" : "span", {
              className: "playground-evaluations-detail-sidebar-value playground-tasks-detail-fact-control",
              title: options.title || (typeof value === "string" ? value : undefined),
            }, value)
          );
        }

        function renderDetail() {
          if (!activeSet) {
            return renderOverview();
          }
          const activeDetailTab = evaluationDetailTab === "cases" || evaluationDetailTab === "data"
            ? "cases"
            : (evaluationDetailTab === "settings" ? "settings" : "general");
          const creator = resolvePlaygroundEvaluationCreatorIdentity(activeSet, [currentEvaluationCreator]);
          const creatorLabel = getPlaygroundEvaluationCreatorLabel(creator) || "Unknown";
          const creatorValue = React.createElement("span", {
              className: "platform-resource-detail-sidebar__identity playground-evaluations-detail-person",
              title: creatorLabel,
            },
            React.createElement("span", { className: "platform-resource-detail-sidebar__avatar", "aria-hidden": "true" },
              creator.avatarUrl
                ? React.createElement("img", { src: creator.avatarUrl, alt: "" })
                : getPlaygroundEvaluationInitials(creatorLabel)
            ),
            React.createElement("span", { className: "platform-resource-detail-sidebar__identity-name" }, creatorLabel)
          );
          const evaluator = normalizePlaygroundEvaluationEvaluator(activeSet.evaluator);
          const evaluatorAgent = evaluator.type === "agent"
            ? getPlaygroundEvaluationAgentRecord(agentOptions, evaluator.agentId)
            : null;
          const evaluatorAgentLabel = String(
            evaluatorAgent?.name
            || evaluatorAgent?.label
            || evaluatorAgent?.title
            || getPlaygroundEvaluationEvaluatorLabel(evaluator, agentOptions)
            || "Agent evaluator"
          ).trim();
          const evaluatorAgentPhotoUrl = getPlaygroundEvaluationAgentPhotoUrl(evaluatorAgent);
          const evaluatorAgentOptions = agentOptions
            .filter((agent) => String(agent?.id || "").trim())
            .map((agent) => {
              const agentId = String(agent.id).trim();
              const agentLabel = String(agent.name || agent.label || agent.title || agentId).trim();
              const agentPhotoUrl = getPlaygroundEvaluationAgentPhotoUrl(agent);
              return {
                value: agentId,
                label: agentLabel,
                leading: React.createElement("span", {
                    className: "playground-evaluations-run-agent-avatar",
                    "aria-hidden": "true",
                  }, agentPhotoUrl
                    ? React.createElement("img", { src: agentPhotoUrl, alt: "" })
                    : getPlaygroundEvaluationInitials(agentLabel)),
              };
            });
          const evaluatorValue = evaluator.type === "agent"
            ? React.createElement(PlatformSelector, {
                value: evaluator.agentId,
                options: evaluatorAgentOptions,
                onValueChange: (nextAgentId) => updateEvaluationSet(activeSet.id, (current) => ({
                  ...current,
                  evaluator: {
                    ...normalizePlaygroundEvaluationEvaluator(current.evaluator),
                    type: "agent",
                    agentId: nextAgentId,
                  },
                })),
                ariaLabel: "Choose evaluator agent",
                label: React.createElement("span", {
                    className: "playground-evaluations-run-agent-cell playground-evaluations-detail-evaluator-value",
                    title: evaluatorAgentLabel,
                  },
                  React.createElement("span", {
                    className: "playground-evaluations-run-agent-avatar",
                    "aria-hidden": "true",
                  }, evaluatorAgentPhotoUrl
                    ? React.createElement("img", { src: evaluatorAgentPhotoUrl, alt: "" })
                    : getPlaygroundEvaluationInitials(evaluatorAgentLabel)),
                  React.createElement("span", {
                    className: "playground-evaluations-run-cell-label",
                  }, evaluatorAgentLabel)
                ),
                alignment: "end",
                popupAlignment: "right",
                popupWidth: 260,
                popupMaxHeight: "min(320px, calc(100vh - 180px))",
                className: "playground-evaluations-detail-evaluator-selector",
                triggerClassName: "playground-evaluations-detail-evaluator-trigger",
                popupClassName: "playground-evaluations-detail-evaluator-menu",
                optionClassName: "playground-evaluations-detail-evaluator-option",
              })
            : renderEvaluationSetEvaluatorCell(activeSet);
          const passThresholdLabel = React.createElement("span", {
              className: "playground-evaluations-pass-threshold-label-group",
            },
            React.createElement("span", null, "Pass Threshold"),
            React.createElement("button", {
              type: "button",
              className: "playground-evaluations-pass-threshold-help",
              "aria-label": "Pass threshold information",
              onClick: (event) => event.preventDefault(),
            },
              React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8 }),
              React.createElement("span", { className: "playground-evaluations-pass-threshold-tooltip", role: "tooltip" },
                "Minimum score a case must reach to count as passed. The run pass rate is calculated from cases at or above this threshold."
              )
            )
          );
          const evaluationOwnerModel = getEvaluationOwnerSelectorModel(activeSet);
          const evaluationProjectId = String(activeSet.projectId || "").trim();
          const properties = React.createElement(PlatformServiceDetailPropertyList, {
              className: "playground-evaluations-detail-property-list",
            },
            React.createElement(PlatformServiceDetailProperty, {
              label: "Evaluator",
              className: evaluator.type === "agent"
                ? "playground-evaluations-detail-evaluator-row is-evaluator-selector"
                : "playground-evaluations-detail-evaluator-row",
            }, evaluatorValue),
            React.createElement(PlatformServiceDetailProperty, {
              label: passThresholdLabel,
              className: "playground-evaluations-detail-pass-threshold-row",
            }, renderEvaluationPassThresholdInline(activeSet, { showLabel: false })),
            React.createElement(PlatformServiceDetailProperty, {
              label: "Creator",
              className: "platform-resource-detail-sidebar__creator-row playground-evaluations-detail-identity-row",
              title: creator.email || creatorLabel,
            }, creatorValue),
            React.createElement(PlatformServiceDetailProperty, {
              label: "Created",
            }, formatPlaygroundEvaluationDate(activeSet.createdAt)),
            React.createElement(PlatformServiceDetailProperty, {
              label: "Updated",
            }, formatPlaygroundEvaluationDate(activeSet.updatedAt || activeSet.createdAt)),
            React.createElement(PlatformServiceDetailProperty, {
              label: "Owner",
              className: "platform-resource-detail-sidebar__owner-row playground-evaluations-detail-owner-row",
            }, renderEvaluationOwnerSelector(activeSet)),
            React.createElement(PlatformButtonSelector, {
                mode: "split-action",
                buttonVariant: "primary",
                buttonSize: "small",
                fullWidth: true,
                matchTriggerWidth: true,
                popupRole: "menu",
                popupVariant: "minimal",
                popupAlignment: "right",
                label: "Run Evaluation",
                actionAriaLabel: "Run Evaluation",
                popupAriaLabel: "Evaluation run options",
                actionDisabled: getEvaluationRunnableCaseCount(activeSet) === 0,
                popupDisabled: getEvaluationRunnableCaseCount(activeSet) === 0,
                className: "playground-evaluations-detail-run-button",
                onAction: () => openRunEvaluationModal(activeSet.id),
              },
              React.createElement("button", {
                type: "button",
                role: "menuitem",
                className: "tb-popup-row",
                onClick: () => openBatchComposer({
                  name: "Run " + String(activeSet.name || "Evaluation"),
                  description: "Evaluation queued from its details page.",
                  targetKind: "evaluation_run",
                  targetResourceId: activeSet.id,
                  targetVersionId: String(activeSet.publishedVersionId || activeSet.currentVersionId || "").trim() || null,
                  definition: {
                    evaluationId: activeSet.id,
                    versionId: String(activeSet.publishedVersionId || activeSet.currentVersionId || "").trim() || null,
                    agentId: String(activeSet.targetAgentId || defaultAgentId || "").trim() || null,
                    environmentId: String(activeSet.environmentId || defaultEnvironmentId || "").trim() || null,
                  },
                  startPolicy: "manual",
                }),
              },
                React.createElement(Truck, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                React.createElement("span", null, "Add to Batches")
              )
            )
          );
          const evaluationSettings = activeDetailTab === "settings"
            ? {
                ariaLabel: "Evaluation settings",
                className: "playground-evaluations-settings-page",
                identity: {
                  icon: React.createElement(ChartColumnIncreasing, {
                    width: 24,
                    height: 24,
                    strokeWidth: 1.7,
                    "aria-hidden": "true",
                  }),
                  title: String(activeSet.name || "Evaluation"),
                  description: String(activeSet.description || ""),
                  onTitleChange: (value) => updateEvaluationSet(activeSet.id, (current) => ({
                    ...current,
                    name: String(value || ""),
                  })),
                  onDescriptionChange: (value) => updateEvaluationSet(activeSet.id, (current) => ({
                    ...current,
                    description: String(value || ""),
                  })),
                  titlePlaceholder: "Evaluation",
                  descriptionPlaceholder: "Describe the purpose, scope, and expected use of this evaluation",
                  titleAriaLabel: "Evaluation name",
                  descriptionAriaLabel: "Evaluation description",
                },
                details: {
                  variant: "standard",
                  customAttributes: [
                    {
                      id: "evaluator",
                      label: "Evaluator",
                      value: evaluatorValue,
                      className: evaluator.type === "agent"
                        ? "playground-evaluations-detail-evaluator-row is-evaluator-selector"
                        : "playground-evaluations-detail-evaluator-row",
                    },
                    {
                      id: "pass-threshold",
                      label: passThresholdLabel,
                      value: renderEvaluationPassThresholdInline(activeSet, { showLabel: false }),
                      className: "playground-evaluations-detail-pass-threshold-row",
                    },
                    {
                      id: "created",
                      label: "Created",
                      value: formatPlaygroundEvaluationDate(activeSet.createdAt),
                    },
                  ],
                  updatedAt: activeSet.updatedAt || activeSet.createdAt,
                  creator: {
                    value: String(creator.id || creator.userId || creator.email || "evaluation-creator"),
                    name: creatorLabel,
                    email: String(creator.email || ""),
                    avatarUrl: String(creator.avatarUrl || ""),
                  },
                  owner: evaluationOwnerModel.owner,
                  ownerOptions: evaluationOwnerModel.options,
                  onOwnerTransfer: evaluationOwnerModel.onTransfer,
                  ownerSelectorProps: evaluationOwnerModel.selectorProps,
                  scope: {
                    values: evaluationProjectId ? [evaluationProjectId] : [],
                    options: projectOptions
                      .filter((project) => String(project?.id || "").trim())
                      .map((project) => ({
                        value: String(project.id),
                        label: String(project.name || project.title || project.id),
                        leading: React.createElement(FolderOpen, {
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                          "aria-hidden": "true",
                        }),
                      })),
                    onValuesChange: (values) => updateEvaluationSet(activeSet.id, (current) => ({
                      ...current,
                      projectId: String(values.at(-1) || ""),
                    })),
                    ariaLabel: "Choose evaluation scope",
                  },
                  primaryActions: [
                    {
                      id: "run-evaluation",
                      label: "Run Evaluation",
                      onSelect: () => openRunEvaluationModal(activeSet.id),
                      disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
                    },
                    {
                      id: "add-to-batches",
                      label: "Add to Batches",
                      onSelect: () => openBatchComposer({
                        name: "Run " + String(activeSet.name || "Evaluation"),
                        description: "Evaluation queued from its details page.",
                        targetKind: "evaluation_run",
                        targetResourceId: activeSet.id,
                        targetVersionId: String(activeSet.publishedVersionId || activeSet.currentVersionId || "").trim() || null,
                        definition: {
                          evaluationId: activeSet.id,
                          versionId: String(activeSet.publishedVersionId || activeSet.currentVersionId || "").trim() || null,
                          agentId: String(activeSet.targetAgentId || defaultAgentId || "").trim() || null,
                          environmentId: String(activeSet.environmentId || defaultEnvironmentId || "").trim() || null,
                        },
                        startPolicy: "manual",
                      }),
                      disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
                    },
                  ],
                  className: "playground-evaluations-detail-sidebar-card",
                },
                access: renderEvaluationAccessSettings(),
                accessDetailOpen: Boolean(evaluationAccessTeamId),
                detailsSidebarCollapsed: Boolean(evaluationVersionsSidebarOpen),
                detailsSidebarAriaLabel: "Evaluation information",
                detailsSidebarClassName: "playground-evaluations-detail-sidebar playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar",
              }
            : undefined;
          const detailContent = activeDetailTab === "settings"
            ? null
            : activeDetailTab === "cases"
              ? React.createElement(React.Fragment, null,
                  renderEvaluationGuidanceEditor(activeSet),
                  renderDataTable(activeSet)
                )
              : React.createElement(React.Fragment, null,
                  renderAnalyticsCard(activeSet),
                  renderRunsTable(activeSet)
                );
          return React.createElement(EvaluationDetailPage, {
              properties,
              settings: evaluationSettings,
              sidebarCollapsed: evaluationDetailSidebarCollapsed,
            },
            detailContent
          );
        }

        function renderRun() {
          if (!activeSet || !activeRun) {
            return renderDetail();
          }
          const runStatus = String(activeRun.status || "completed").trim().toLowerCase();
          const runStatusVariant = runStatus === "completed"
            ? "green"
            : runStatus === "failed"
              ? "red"
              : runStatus === "running"
                ? "blue"
                : "gray";
          const runVersionNumber = Math.max(0, Number(activeRun.targetAgentVersionNumber || 0) || 0);
          const storedRunVersionLabel = String(activeRun.targetAgentVersionLabel || "").trim();
          const runVersionLabel = runVersionNumber > 0
            ? "V" + runVersionNumber
            : (storedRunVersionLabel
                ? storedRunVersionLabel.replace(/^Version\s+/i, "V")
                : "Current");
          const runAgentValue = React.createElement("span", {
              className: "playground-evaluations-run-agent-version-cell",
            },
            renderRunAgentCell(activeRun, activeSet),
            React.createElement(PlatformLabel, {
              variant: "gray",
              className: "playground-evaluations-run-agent-version-label",
            }, runVersionLabel)
          );
          const runTerminal = ["completed", "completed_with_errors", "failed", "cancelled"].includes(runStatus);
          const evidenceTrusted = activeRun.evidenceProvenanceVerified === true
            && activeRun.evidenceFingerprintVerified === true;
          const evidenceSelfReported = activeRun.evidenceTrustLevel === "self_reported";
          const evidenceLegacy = runTerminal && !activeRun.evidenceSchemaVersion;
          const evidenceLabel = !runTerminal
            ? "Pending"
            : evidenceTrusted
              ? "Verified worker"
              : evidenceSelfReported
                ? "Self-reported"
                : evidenceLegacy
                  ? ""
                  : "Invalid evidence";
          const evidenceVariant = !runTerminal
            ? "blue"
            : evidenceTrusted
              ? "green"
              : evidenceSelfReported || evidenceLegacy
                ? "yellow"
                : "red";
          const signatureLabel = activeRun.evidenceSignatureStatus === "kms_signed"
            ? "KMS signed"
            : runTerminal
              ? "Unsigned"
              : "Pending";
          const signatureVariant = activeRun.evidenceSignatureStatus === "kms_signed"
            ? "green"
            : runTerminal
              ? "yellow"
              : "gray";
          const compactEvidenceValue = (value) => {
            const normalized = String(value || "").trim();
            return normalized.length > 28
              ? normalized.slice(0, 16) + "…" + normalized.slice(-8)
              : normalized || "-";
          };
          const evidenceExplanation = !runTerminal
            ? "Canonical evidence will be sealed when every case reaches a terminal state."
            : evidenceTrusted
              ? "The control plane verified that the leased execution worker reported this exact result set against immutable Evaluation and Agent bindings."
              : evidenceSelfReported
                ? "An API client reported these results. This run cannot satisfy release gates that require independently verified execution evidence."
                : evidenceLegacy
                  ? "This run predates canonical evidence envelopes. Re-run it with the execution worker before using it for an Assurance decision."
                  : "The evidence envelope or its execution provenance failed verification. Treat these results as non-release evidence.";
          const evidenceCard = React.createElement(PlatformUiCard, {
              as: "section",
              cardTitle: "Execution evidence",
              className: "playground-evaluations-run-evidence-card"
                + (evidenceTrusted ? " is-trusted" : runTerminal ? " is-untrusted" : " is-pending"),
            },
            React.createElement("div", { className: "playground-evaluations-run-evidence-summary" },
              evidenceLabel
                ? React.createElement(PlatformLabel, {
                    variant: evidenceVariant,
                  }, evidenceLabel)
                : null,
              React.createElement("p", null, evidenceExplanation)
            ),
            React.createElement("dl", { className: "playground-evaluations-run-evidence-grid" },
              React.createElement("div", null,
                React.createElement("dt", null, "Evidence fingerprint"),
                React.createElement("dd", {
                  title: activeRun.evidenceFingerprint || "",
                }, compactEvidenceValue(activeRun.evidenceFingerprint))
              ),
              React.createElement("div", null,
                React.createElement("dt", null, "Worker attestation"),
                React.createElement("dd", {
                  title: activeRun.evidenceAttestationId || "",
                }, compactEvidenceValue(activeRun.evidenceAttestationId))
              ),
              React.createElement("div", null,
                React.createElement("dt", null, "Target fingerprint"),
                React.createElement("dd", {
                  title: activeRun.targetFingerprint || "",
                }, compactEvidenceValue(activeRun.targetFingerprint))
              ),
              React.createElement("div", null,
                React.createElement("dt", null, "Signature"),
                React.createElement("dd", null,
                  React.createElement(PlatformLabel, {
                    variant: signatureVariant,
                  }, signatureLabel)
                )
              )
            )
          );
          const runProperties = React.createElement("div", { className: "playground-evaluations-detail-sidebar-list" },
            renderEvaluationDetailSidebarRow("status", "Status", React.createElement(PlatformLabel, {
              variant: runStatusVariant,
            }, runStatus.replace(/_/g, " "))),
            renderEvaluationDetailSidebarRow("environment", "Environment", renderRunEnvironmentCell(activeRun, activeSet), {
              className: "is-environment",
            }),
            renderEvaluationDetailSidebarRow("evaluator", "Evaluator", renderEvaluationSetEvaluatorCell({
              ...activeSet,
              evaluator: activeRun.evaluator,
            })),
            renderEvaluationDetailSidebarRow("threshold", "Pass Threshold", formatPlaygroundEvaluationPercent(activeRun.passThreshold)),
            renderEvaluationDetailSidebarRow("cases", "Cases", String(activeRun.totalCount || activeRun.cases?.length || 0)),
            renderEvaluationDetailSidebarRow("evidence", "Evidence", React.createElement(PlatformLabel, {
              variant: evidenceVariant,
            }, evidenceLabel)),
            renderEvaluationDetailSidebarRow("signature", "Signature", React.createElement(PlatformLabel, {
              variant: signatureVariant,
            }, signatureLabel)),
            renderEvaluationDetailSidebarRow("attestation", "Attestation", compactEvidenceValue(activeRun.evidenceAttestationId), {
              title: activeRun.evidenceAttestationId || "",
            }),
            renderEvaluationDetailSidebarRow("created", "Started", formatPlaygroundEvaluationDate(activeRun.createdAt)),
            renderEvaluationDetailSidebarRow("completed", "Completed", runStatus === "running" || runStatus === "queued"
              ? "-"
              : formatPlaygroundEvaluationDate(activeRun.completedAt || activeRun.createdAt)),
            renderEvaluationDetailSidebarRow("agent", "Agent", runAgentValue, {
              className: "is-agent-version playground-evaluations-run-agent-property",
            }),
            React.createElement(PlatformButtonSelector, {
                mode: "split-action",
                buttonVariant: "primary",
                buttonSize: "small",
                fullWidth: true,
                matchTriggerWidth: true,
                popupRole: "menu",
                popupVariant: "minimal",
                popupAlignment: "left",
                label: "Run Again",
                actionAriaLabel: "Run Evaluation again",
                popupAriaLabel: "Evaluation rerun options",
                actionDisabled: getEvaluationRunnableCaseCount(activeSet) === 0,
                popupDisabled: getEvaluationRunnableCaseCount(activeSet) === 0,
                className: "playground-evaluations-run-again-button",
                onAction: () => openRunEvaluationModal(activeSet.id),
              },
              React.createElement("button", {
                type: "button",
                role: "menuitem",
                className: "tb-popup-row",
                onClick: () => openBatchComposer({
                  name: "Rerun " + String(activeSet.name || "Evaluation"),
                  description: "Evaluation rerun queued from run details.",
                  targetKind: "evaluation_run",
                  targetResourceId: activeSet.id,
                  targetVersionId: String(activeRun?.evaluationVersionId || activeSet.publishedVersionId || activeSet.currentVersionId || "").trim() || null,
                  definition: {
                    evaluationId: activeSet.id,
                    versionId: String(activeRun?.evaluationVersionId || activeSet.publishedVersionId || activeSet.currentVersionId || "").trim() || null,
                    agentId: String(activeRun?.targetAgentId || activeSet.targetAgentId || defaultAgentId || "").trim() || null,
                    environmentId: String(activeRun?.environmentId || activeSet.environmentId || defaultEnvironmentId || "").trim() || null,
                  },
                  startPolicy: "manual",
                }),
              },
                React.createElement(Truck, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                React.createElement("span", null, "Add to Batches")
              )
            )
          );
          return React.createElement(EvaluationDetailPage, {
              variant: "run",
              ariaLabel: "Evaluation run details",
              className: "playground-evaluations-run-detail-page",
              properties: runProperties,
            },
            React.createElement(React.Fragment, null,
              evidenceCard,
              renderAnalyticsCard(activeSet, activeRun),
              renderRunCasesTable(activeSet, activeRun)
            )
          );
        }

`;
