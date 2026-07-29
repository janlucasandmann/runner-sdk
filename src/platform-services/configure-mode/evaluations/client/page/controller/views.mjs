export const EVALUATIONS_PAGE_CONTROLLER_VIEWS_SCRIPT = String.raw`        function renderOverview() {
          const evaluationOverviewRows = normalizedSets
            .map((set) => {
              const id = String(set?.id || "").trim();
              const name = String(set?.name || "Untitled Evaluation").trim();
              const evaluator = normalizePlaygroundEvaluationEvaluator(set?.evaluator);
              const evaluatorAgent = evaluator.type === "agent"
                ? getPlaygroundEvaluationAgentRecord(agentOptions, evaluator.agentId)
                : null;
              const evaluatorLabel = getPlaygroundEvaluationEvaluatorLabel(evaluator, agentOptions);
              const evaluatorAvatarUrl = evaluatorAgent
                ? getPlaygroundEvaluationAgentPhotoUrl(evaluatorAgent)
                : "";
              const creator = getPlaygroundEvaluationCreatorIdentity(set);
              const creatorLabel = getPlaygroundEvaluationCreatorLabel(creator) || "Unknown";
              const updatedValue = set?.updatedAt || set?.createdAt || "";
              const updatedDate = new Date(updatedValue || "");
              const caseCount = Array.isArray(set?.dataRows) ? set.dataRows.length : 0;
              const runCount = Array.isArray(set?.runs) ? set.runs.length : 0;
              return {
                id,
                name,
                evaluatorLabel,
                evaluatorType: evaluator.type,
                evaluatorAvatarUrl,
                evaluatorFallback: getPlaygroundEvaluationInitials(evaluatorLabel),
                caseCount,
                runCount,
                creatorLabel,
                creatorAvatarUrl: creator.avatarUrl || "",
                creatorFallback: getPlaygroundEvaluationInitials(creatorLabel),
                updatedAt: Number.isFinite(updatedDate.getTime()) ? updatedDate.getTime() : 0,
                updatedLabel: formatPlaygroundEvaluationDate(updatedValue),
                updatedTitle: Number.isFinite(updatedDate.getTime()) ? updatedDate.toLocaleString() : "",
                canRun: getEvaluationRunnableCaseCount(set) > 0,
                searchText: [
                  name,
                  set?.description,
                  evaluatorLabel,
                  creatorLabel,
                  String(caseCount),
                  String(runCount),
                  id,
                ].filter(Boolean).join(" "),
              };
            })
            .filter((set) => set.id);

          return React.createElement(EvaluationsOverviewPage, {
            rows: evaluationOverviewRows,
            loading: evaluationBackendSyncState.status === "loading" && evaluationOverviewRows.length === 0,
            error: evaluationBackendSyncState.error || "",
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
          const creator = normalizePlaygroundEvaluationPersonIdentity(activeSet.creator || activeSet.createdBy || activeSet.created_by || {});
          const creatorLabel = getPlaygroundEvaluationCreatorLabel(creator) || "Unknown";
          const creatorValue = React.createElement("span", {
              className: "playground-evaluations-detail-person",
              title: creatorLabel,
            },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              creator.avatarUrl
                ? React.createElement("img", { src: creator.avatarUrl, alt: "" })
                : getPlaygroundEvaluationInitials(creatorLabel)
            ),
            React.createElement("span", null, creatorLabel)
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
          const properties = React.createElement("div", {
              className: "playground-evaluations-detail-sidebar-list playground-tasks-detail-facts-body",
            },
            renderEvaluationDetailSidebarRow("evaluator", "Evaluator", evaluatorValue, {
              className: evaluator.type === "agent" ? "is-evaluator-selector" : "",
              control: evaluator.type === "agent",
            }),
            renderEvaluationDetailSidebarRow("pass-threshold", passThresholdLabel, renderEvaluationPassThresholdInline(activeSet, { showLabel: false }), {
              className: "is-pass-threshold",
            }),
            renderEvaluationDetailSidebarRow("creator", "Creator", creatorValue),
            renderEvaluationDetailSidebarRow("cases", "Cases", String(Array.isArray(activeSet.dataRows) ? activeSet.dataRows.length : 0)),
            renderEvaluationDetailSidebarRow("runs", "Runs", String(Array.isArray(activeSet.runs) ? activeSet.runs.length : 0)),
            renderEvaluationDetailSidebarRow("created", "Created", formatPlaygroundEvaluationDate(activeSet.createdAt)),
            renderEvaluationDetailSidebarRow("updated", "Updated", formatPlaygroundEvaluationDate(activeSet.updatedAt || activeSet.createdAt)),
            renderEvaluationDetailSidebarRow("owner", "Owner", renderEvaluationOwnerSelector(activeSet), {
              className: "is-owner",
              control: true,
            }),
            React.createElement(PlatformPrimaryButton, {
                type: "button",
                size: "small",
                fullWidth: true,
                className: "playground-evaluations-detail-run-button",
                onClick: () => openRunEvaluationModal(activeSet.id),
                disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
              },
              React.createElement("span", null, "Run Evaluation")
            )
          );
          const detailContent = activeDetailTab === "settings"
            ? evaluationAccessTeamId
              ? renderEvaluationAccessSettings()
              : React.createElement(React.Fragment, null,
                  renderEvaluationDescriptionEditor(activeSet),
                  renderEvaluationAccessSettings()
                )
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
                  ? "Legacy evidence"
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
              React.createElement(PlatformLabel, {
                variant: evidenceVariant,
              }, evidenceLabel),
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
            React.createElement(PlatformPrimaryButton, {
                type: "button",
                size: "small",
                fullWidth: true,
                className: "playground-evaluations-run-again-button",
                onClick: () => openRunEvaluationModal(activeSet.id),
                disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
              },
              React.createElement("span", null, "Run Again")
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
