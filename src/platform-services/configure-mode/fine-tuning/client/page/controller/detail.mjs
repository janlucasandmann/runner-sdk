export const FINE_TUNING_PAGE_CONTROLLER_DETAIL_SCRIPT = String.raw`        function getFineTuningPhaseLabel(value) {
          return normalizePlaygroundFineTuningString(value || "queued")
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (character) => character.toUpperCase()) || "Queued";
        }

        function getFineTuningPhaseVariant(value) {
          const phase = normalizePlaygroundFineTuningString(value).toLowerCase();
          if (phase === "completed_target_met" || phase === "published") return "green";
          if (phase === "failed" || phase === "error" || phase === "cancelled" || phase === "canceled") return "red";
          if (isPlaygroundFineTuningActiveStatus(phase)) return "blue";
          return "gray";
        }

        function getFineTuningBestIteration(job) {
          const iterations = Array.isArray(job?.iterations) ? job.iterations : [];
          const candidates = iterations.filter((iteration) => Number(iteration?.number || 0) > 0);
          const bestIterationId = normalizePlaygroundFineTuningString(job?.bestIterationId);
          return candidates.find((iteration) => normalizePlaygroundFineTuningString(iteration?.id) === bestIterationId)
            || candidates
              .filter((iteration) => iteration?.accepted === true)
              .slice()
              .sort((left, right) => (
                Number(right?.metrics?.averageScore || 0) - Number(left?.metrics?.averageScore || 0)
                || Number(right?.number || 0) - Number(left?.number || 0)
              ))[0]
            || candidates.slice().sort((left, right) => Number(right?.number || 0) - Number(left?.number || 0))[0]
            || null;
        }

        function getFineTuningTargetPolicy(job) {
          const configuration = readPlaygroundFineTuningPlainObject(job?.configuration);
          const objective = readPlaygroundFineTuningPlainObject(configuration.objective);
          const objectivePolicy = readPlaygroundFineTuningPlainObject(
            objective.successPolicy || objective.success_policy
          );
          if (normalizePlaygroundFineTuningString(objective.mode).toLowerCase() === "custom") {
            return {
              score: normalizePlaygroundFineTuningScore(
                objectivePolicy.minimumAverageScore
                  ?? objectivePolicy.minimum_average_score
                  ?? objectivePolicy.targetScore
                  ?? objectivePolicy.target_score
                  ?? 0.8
              ),
              passRate: normalizePlaygroundFineTuningScore(
                objectivePolicy.requiredPassRate
                  ?? objectivePolicy.required_pass_rate
                  ?? objectivePolicy.targetPassRate
                  ?? objectivePolicy.target_pass_rate
                  ?? 0.8
              ),
            };
          }
          const targets = Array.isArray(configuration.evaluationTargets)
            ? configuration.evaluationTargets
            : Array.isArray(configuration.evaluation_targets)
              ? configuration.evaluation_targets
              : [];
          if (!targets.length) return { score: 0.8, passRate: 0.8 };
          const policies = targets.map((target) => {
            const policy = readPlaygroundFineTuningPlainObject(target?.successPolicy || target?.success_policy);
            const threshold = normalizePlaygroundFineTuningScore(
              target?.passThreshold ?? target?.pass_threshold ?? 0.8
            );
            return {
              score: normalizePlaygroundFineTuningScore(
                policy.minimumAverageScore ?? policy.minimum_average_score ?? threshold
              ),
              passRate: normalizePlaygroundFineTuningScore(
                policy.requiredPassRate ?? policy.required_pass_rate ?? threshold
              ),
            };
          });
          return {
            score: policies.reduce((sum, policy) => sum + policy.score, 0) / policies.length,
            passRate: policies.reduce((sum, policy) => sum + policy.passRate, 0) / policies.length,
          };
        }

        function getFineTuningCaseComparisonRows(job) {
          const bestIteration = getFineTuningBestIteration(job);
          return (Array.isArray(bestIteration?.caseComparisons) ? bestIteration.caseComparisons : [])
            .flatMap((group, groupIndex) => (
              (Array.isArray(group?.cases) ? group.cases : []).map((caseItem, caseIndex) => ({
                ...caseItem,
                id: normalizePlaygroundFineTuningString(
                  caseItem?.id || caseItem?.dataRowId || caseItem?.data_row_id
                ) || "case_" + groupIndex + "_" + caseIndex,
                evaluationSetId: normalizePlaygroundFineTuningString(
                  group?.evaluationSetId || group?.evaluation_set_id
                ),
                evaluationSetName: normalizePlaygroundFineTuningString(
                  group?.evaluationSetName || group?.evaluation_set_name || "Evaluation"
                ),
                baselineScore: normalizePlaygroundFineTuningScore(
                  caseItem?.baselineScore ?? caseItem?.baseline_score ?? caseItem?.baseline?.averageScore ?? 0
                ),
                candidateScore: normalizePlaygroundFineTuningScore(
                  caseItem?.candidateScore ?? caseItem?.candidate_score ?? caseItem?.candidate?.averageScore ?? 0
                ),
              }))
            ));
        }

        function getFineTuningStatisticalEvidenceRows(job) {
          const bestIteration = getFineTuningBestIteration(job);
          const decisionResults = Array.isArray(bestIteration?.decisionEvidence?.results)
            ? bestIteration.decisionEvidence.results
            : [];
          return (Array.isArray(bestIteration?.caseComparisons) ? bestIteration.caseComparisons : [])
            .map((group, index) => {
              const evaluationSetId = normalizePlaygroundFineTuningString(
                group?.evaluationSetId || group?.evaluation_set_id
              );
              const comparison = readPlaygroundFineTuningPlainObject(
                group?.statisticalComparison || group?.statistical_comparison
              );
              if (!comparison.schemaVersion) return null;
              const decision = decisionResults.find((item) => (
                normalizePlaygroundFineTuningString(item?.evaluationSetId || item?.evaluation_set_id) === evaluationSetId
              )) || {};
              const gate = readPlaygroundFineTuningPlainObject(
                decision?.statisticalGate || decision?.statistical_gate
              );
              const efficiencyGate = readPlaygroundFineTuningPlainObject(
                decision?.efficiencyGate || decision?.efficiency_gate
              );
              return {
                id: evaluationSetId || "statistical_evidence_" + index,
                evaluationSetId,
                evaluationSetName: normalizePlaygroundFineTuningString(
                  group?.evaluationSetName || group?.evaluation_set_name || "Evaluation"
                ),
                pairedCount: Math.max(0, Number(comparison.pairedCount || 0) || 0),
                pairedTrialCount: Math.max(0, Number(comparison.pairedTrialCount || 0) || 0),
                pairedCoverage: Math.max(0, Math.min(1, Number(comparison.pairedCoverage || 0) || 0)),
                confidenceLevel: Math.max(0, Math.min(1, Number(comparison.confidenceLevel || 0) || 0)),
                meanDelta: Number(comparison.meanDelta),
                scoreDeltaInterval: readPlaygroundFineTuningPlainObject(comparison.scoreDeltaInterval),
                passRateDeltaInterval: readPlaygroundFineTuningPlainObject(comparison.passRateDeltaInterval),
                accepted: decision.accepted === true,
                gateAvailable: Object.keys(decision).length > 0,
                statisticalAccepted: gate.accepted === true,
                costGate: readPlaygroundFineTuningPlainObject(efficiencyGate.cost),
                latencyGate: readPlaygroundFineTuningPlainObject(efficiencyGate.latency),
                regressedSliceIds: Array.isArray(gate.regressedSliceIds) ? gate.regressedSliceIds : [],
              };
            })
            .filter(Boolean);
        }

        function renderKpiCard(job) {
          const iterations = Array.isArray(job?.iterations) ? job.iterations : [];
          const baselineIteration = iterations.find((iteration) => Number(iteration?.number || 0) === 0) || null;
          const bestIteration = getFineTuningBestIteration(job);
          const comparisonRows = getFineTuningCaseComparisonRows(job);
          const targetPolicy = getFineTuningTargetPolicy(job);
          const beforeScore = normalizePlaygroundFineTuningScore(
            bestIteration?.baselineMetrics?.averageScore
              ?? baselineIteration?.metrics?.averageScore
              ?? job?.beforeScore
              ?? 0
          );
          const afterScore = normalizePlaygroundFineTuningScore(
            bestIteration?.metrics?.averageScore
              ?? job?.afterScore
              ?? beforeScore
          );
          const budget = readPlaygroundFineTuningPlainObject(job?.budget);
          const limitUsd = normalizePlaygroundFineTuningUsdCost(
            budget.budgetUsd ?? budget.limitUsd ?? job?.configuration?.limits?.budgetUsd ?? 0
          );
          const spentUsd = normalizePlaygroundFineTuningUsdCost(budget.spentUsd ?? job?.costUsd ?? 0);
          const chartIterations = iterations.filter((iteration) => (
            Number(iteration?.metrics?.totalCount || 0) > 0
            || Number(iteration?.metrics?.averageScore || 0) > 0
          ));
          const visibleComparisons = comparisonRows.slice(0, 24);
          const analytics = {
            ariaLabel: "Fine-tuning performance analytics",
            hasData: visibleComparisons.length > 0 || chartIterations.length > 0,
            metrics: [
              { id: "before", label: "Baseline Score", value: formatPlaygroundFineTuningPercent(beforeScore), color: "#8fc4ff" },
              { id: "after", label: "Best Score", value: bestIteration ? formatPlaygroundFineTuningPercent(afterScore) : "Pending", color: "#4da3ff" },
              { id: "target", label: "Score Target", value: formatPlaygroundFineTuningPercent(targetPolicy.score), color: "#7657ff" },
              {
                id: "cost",
                label: "Budget",
                value: limitUsd > 0
                  ? formatPlaygroundFineTuningUsdCost(spentUsd) + " / " + formatPlaygroundFineTuningUsdCost(limitUsd)
                  : formatPlaygroundFineTuningUsdCost(spentUsd),
                color: "#9ff6ce",
              },
            ],
            labels: visibleComparisons.length
              ? visibleComparisons.map((caseItem, index) => "Case " + (index + 1))
              : chartIterations.map((iteration) => (
                  Number(iteration?.number || 0) === 0
                    ? "Baseline"
                    : "Iteration " + iteration.number
                )),
            series: visibleComparisons.length
              ? [
                  {
                    id: "baseline",
                    label: "Before",
                    values: visibleComparisons.map((caseItem) => Math.round(caseItem.baselineScore * 100)),
                    color: "#8fc4ff",
                    type: "bar",
                    valueKind: "percent",
                  },
                  {
                    id: "candidate",
                    label: "After",
                    values: visibleComparisons.map((caseItem) => Math.round(caseItem.candidateScore * 100)),
                    color: "#4da3ff",
                    type: "bar",
                    valueKind: "percent",
                  },
                ]
              : [
                  {
                    id: "score",
                    label: "Evaluation score",
                    values: chartIterations.map((iteration) => (
                      Math.round(normalizePlaygroundFineTuningScore(iteration?.metrics?.averageScore || 0) * 100)
                    )),
                    color: "#4da3ff",
                    valueKind: "percent",
                    fill: true,
                  },
                ],
          };
          return React.createElement(PlatformAnalyticsSection, {
            variant: "default",
            analytics,
            chartType: visibleComparisons.length ? "bar" : "line",
            className: "playground-fine-tuning-kpi-card",
          });
        }

        function renderFineTuningInstructionsEditor(job) {
          return React.createElement(PlatformInstructionsEditor, {
            value: String(job?.instructions || ""),
            onChange: (value) => patchFineTuningJob(job.id, (current) => ({
              ...current,
              instructions: String(value || ""),
            }), { persist: true, delayMs: 450 }),
            title: "Optimization Instructions",
            placeholder: "Add instructions that guide how the target agent should be improved.",
            ariaLabel: "Fine-tuning instructions",
            stickyHeader: true,
            historyKey: "fine-tuning-instructions:" + job.id,
            className: "playground-fine-tuning-instructions-section",
          });
        }

        function renderEvaluationRunReferences(job) {
          return React.createElement(PlatformDataTable, {
              rows: job.evaluationRuns,
              getRowId: (reference) => reference.evaluationSetId,
              ariaLabel: "Fine-tuning evaluation runs",
              className: "playground-fine-tuning-reference-platform-table",
              variant: "minimalistic-ui",
              sticky: false,
              rowMinHeight: 46,
              emptyState: "No evaluation runs captured.",
              toolbar: {
                title: "Evaluation Runs",
              },
              columns: [
                {
                  id: "evaluation",
                  header: "Evaluation",
                  accessor: (reference) => reference.evaluationSetName || "",
                  width: "minmax(170px, 1fr)",
                  cell: ({ row: reference }) => React.createElement("span", { title: reference.evaluationSetName }, reference.evaluationSetName),
                },
                {
                  id: "before",
                  header: "Before",
                  accessor: (reference) => reference.beforeRunLabel || reference.beforeRunId || "",
                  width: "minmax(120px, 0.75fr)",
                  cell: ({ row: reference }) => reference.beforeRunId && typeof onOpenEvaluationRun === "function"
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-fine-tuning-reference-link",
                        onClick: () => onOpenEvaluationRun(reference.evaluationSetId, reference.beforeRunId, {
                          page: "fine-tuning",
                          fineTuneJobId: job.id,
                        }),
                      }, reference.beforeRunLabel || reference.beforeRunId)
                    : React.createElement("span", { className: "playground-guardrails-table-muted" }, reference.beforeRunLabel || "-"),
                },
                {
                  id: "after",
                  header: "After",
                  accessor: (reference) => reference.afterRunLabel || reference.afterRunId || "",
                  width: "minmax(120px, 0.75fr)",
                  cell: ({ row: reference }) => reference.afterRunId && typeof onOpenEvaluationRun === "function"
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-fine-tuning-reference-link",
                        onClick: () => onOpenEvaluationRun(reference.evaluationSetId, reference.afterRunId, {
                          page: "fine-tuning",
                          fineTuneJobId: job.id,
                        }),
                      }, reference.afterRunLabel || reference.afterRunId)
                    : React.createElement("span", { className: "playground-guardrails-table-muted" }, reference.status === "not_run" ? "Not run" : (reference.afterRunLabel || "-")),
                },
                {
                  id: "delta",
                  header: "Delta",
                  accessor: (reference) => Number(reference.afterScore || 0) - Number(reference.beforeScore || 0),
                  width: "minmax(90px, 0.5fr)",
                  align: "end",
                  cell: ({ row: reference }) => !hasPlaygroundFineTuningAfterResult({ status: job.status, evaluationRuns: [reference] })
                    ? "-"
                    : "+" + Math.max(0, Math.round((reference.afterScore - reference.beforeScore) * 100)) + " pts",
                },
              ],
            });
        }

        function renderFineTuningExecutionProgress(job) {
          const phase = normalizePlaygroundFineTuningString(job?.phase || job?.status || "queued").toLowerCase();
          const phaseLabel = getFineTuningPhaseLabel(phase);
          const configuration = readPlaygroundFineTuningPlainObject(job?.configuration);
          const limits = readPlaygroundFineTuningPlainObject(configuration.limits);
          const maxIterations = Math.max(1, Number(limits.maxIterations ?? limits.max_iterations ?? 1) || 1);
          const currentIteration = Math.max(0, Number(job?.currentIteration || 0) || 0);
          const planned = phase === "planned";
          const active = isPlaygroundFineTuningActiveStatus(phase);
          const stageProgress = {
            queued: 3,
            snapshotting: 6,
            baseline_queued: 8,
            baseline_running: 14,
            optimizing: 28,
            candidate_ready: 48,
            verification_queued: 52,
            verifying: 68,
            assessing: 86,
            publishing: 95,
          };
          const iterationOffset = currentIteration > 0
            ? Math.min(18, ((currentIteration - 1) / maxIterations) * 18)
            : 0;
          const progressPercent = active
            ? Math.min(98, Number(stageProgress[phase] || 4) + iterationOffset)
            : planned
              ? 0
              : 100;
          const events = Array.isArray(job?.events) ? job.events : [];
          const latestEvent = events.length ? events[events.length - 1] : null;
          const message = normalizePlaygroundFineTuningString(
            latestEvent?.message
              || (job?.stopReason ? getFineTuningPhaseLabel(job.stopReason) : "")
              || (planned
                ? "Optimization is planned and waiting for its delivery gate."
                : active
                  ? "Fine-tuning is in progress."
                  : "Fine-tuning is complete.")
          );
          return React.createElement(PlatformUiCard, {
              as: "section",
              className: "playground-fine-tuning-execution-card",
            },
            React.createElement("div", { className: "playground-fine-tuning-execution-header" },
              React.createElement("div", { className: "playground-fine-tuning-execution-copy" },
                React.createElement("span", { className: "playground-fine-tuning-execution-title" }, "Job Progress"),
                React.createElement("span", { className: "playground-fine-tuning-execution-message" }, message)
              ),
              React.createElement(PlatformLabel, {
                variant: getFineTuningPhaseVariant(phase),
              }, phaseLabel)
            ),
            React.createElement("div", {
                className: "playground-fine-tuning-execution-progress",
                role: "progressbar",
                "aria-label": "Fine-tuning progress",
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                "aria-valuenow": Math.round(progressPercent),
              },
              React.createElement("span", {
                className: "playground-fine-tuning-execution-progress-value",
                style: { width: progressPercent + "%" },
              })
            ),
            React.createElement("div", { className: "playground-fine-tuning-execution-meta" },
              React.createElement("span", null,
                currentIteration > 0
                  ? "Iteration " + currentIteration + " of " + maxIterations
                  : "Baseline"
              ),
              job?.stopReason
                ? React.createElement("span", null, "Stop reason: " + getFineTuningPhaseLabel(job.stopReason))
                : null
            )
          );
        }

        function renderFineTuningIterations(job) {
          const iterations = Array.isArray(job?.iterations) ? job.iterations : [];
          return React.createElement(PlatformDataTable, {
            rows: iterations,
            getRowId: (iteration) => normalizePlaygroundFineTuningString(iteration?.id) || "iteration_" + iteration.number,
            ariaLabel: "Fine-tuning iterations",
            className: "playground-fine-tuning-iterations-table",
            variant: "minimalistic-ui",
            sticky: false,
            rowMinHeight: 46,
            pagination: false,
            toolbar: {
              title: "Iterations",
            },
            onRowActivate: (iteration) => {
              const optimizerThreadId = normalizePlaygroundFineTuningString(iteration?.optimizerThreadId);
              if (optimizerThreadId && typeof onOpenThread === "function") onOpenThread(optimizerThreadId);
            },
            emptyState: React.createElement(PlatformEmptyState, {
              icon: ChartColumnIncreasing,
              title: "No iterations yet",
              description: "The baseline and optimization iterations will appear as the job progresses.",
            }),
            columns: [
              {
                id: "iteration",
                header: "Iteration",
                accessor: (iteration) => Number(iteration?.number || 0),
                width: "minmax(130px, 0.8fr)",
                sortable: true,
                cell: ({ row: iteration }) => Number(iteration?.number || 0) === 0
                  ? "Baseline"
                  : "Iteration " + iteration.number,
              },
              {
                id: "status",
                header: "Status",
                accessor: (iteration) => iteration?.status || "",
                width: "minmax(130px, 0.75fr)",
                cell: ({ row: iteration }) => React.createElement(PlatformLabel, {
                  variant: getFineTuningPhaseVariant(iteration?.status),
                }, getFineTuningPhaseLabel(iteration?.status)),
              },
              {
                id: "score",
                header: "Score",
                accessor: (iteration) => Number(iteration?.metrics?.averageScore || 0),
                width: "minmax(90px, 0.55fr)",
                sortable: true,
                cell: ({ row: iteration }) => formatPlaygroundFineTuningPercent(
                  iteration?.metrics?.averageScore || 0
                ),
              },
              {
                id: "passRate",
                header: "Pass Rate",
                accessor: (iteration) => Number(iteration?.metrics?.passRate || 0),
                width: "minmax(100px, 0.6fr)",
                sortable: true,
                cell: ({ row: iteration }) => formatPlaygroundFineTuningPercent(
                  iteration?.metrics?.passRate || 0
                ),
              },
              {
                id: "candidate",
                header: "Candidate",
                accessor: (iteration) => iteration?.candidateVersion?.label || iteration?.candidateVersionId || "",
                width: "minmax(150px, 1fr)",
                cell: ({ row: iteration }) => Number(iteration?.number || 0) === 0
                  ? "-"
                  : normalizePlaygroundFineTuningString(
                      iteration?.candidateVersion?.label
                        || iteration?.candidateVersionId
                        || "Pending"
                    ),
              },
              {
                id: "cost",
                header: "Cost",
                accessor: (iteration) => Number(iteration?.costUsd || 0),
                width: "minmax(90px, 0.55fr)",
                sortable: true,
                cell: ({ row: iteration }) => formatPlaygroundFineTuningUsdCost(iteration?.costUsd || 0),
              },
            ],
          });
        }

        function renderFineTuningCaseComparisons(job) {
          const rows = getFineTuningCaseComparisonRows(job);
          return React.createElement(PlatformDataTable, {
            rows,
            getRowId: (caseItem) => caseItem.evaluationSetId + ":" + caseItem.id,
            ariaLabel: "Fine-tuning case comparisons",
            className: "playground-fine-tuning-case-comparison-table",
            variant: "minimalistic-ui",
            sticky: false,
            rowMinHeight: 46,
            pagination: false,
            toolbar: {
              title: "Case Performance",
            },
            emptyState: React.createElement(PlatformEmptyState, {
              icon: ChartColumnIncreasing,
              title: "No case comparison yet",
              description: "Per-case before and after scores will appear after the first verified candidate.",
            }),
            columns: [
              {
                id: "evaluation",
                header: "Evaluation",
                accessor: (caseItem) => caseItem.evaluationSetName || "",
                width: "minmax(160px, 0.9fr)",
              },
              {
                id: "case",
                header: "Case",
                accessor: (caseItem) => caseItem.input || caseItem.id,
                width: "minmax(220px, 1.5fr)",
                cell: ({ row: caseItem, rowIndex }) => React.createElement("span", {
                  title: normalizePlaygroundFineTuningString(caseItem.input || caseItem.id),
                }, normalizePlaygroundFineTuningString(caseItem.input || ("Case " + (rowIndex + 1)))),
              },
              {
                id: "before",
                header: "Before",
                accessor: (caseItem) => caseItem.baselineScore,
                width: "minmax(85px, 0.45fr)",
                sortable: true,
                cell: ({ row: caseItem }) => formatPlaygroundFineTuningPercent(caseItem.baselineScore),
              },
              {
                id: "after",
                header: "After",
                accessor: (caseItem) => caseItem.candidateScore,
                width: "minmax(85px, 0.45fr)",
                sortable: true,
                cell: ({ row: caseItem }) => formatPlaygroundFineTuningPercent(caseItem.candidateScore),
              },
              {
                id: "delta",
                header: "Delta",
                accessor: (caseItem) => caseItem.candidateScore - caseItem.baselineScore,
                width: "minmax(85px, 0.45fr)",
                sortable: true,
                cell: ({ row: caseItem }) => {
                  const points = Math.round((caseItem.candidateScore - caseItem.baselineScore) * 100);
                  return (points > 0 ? "+" : "") + points + " pts";
                },
              },
              {
                id: "result",
                header: "Result",
                accessor: (caseItem) => caseItem.status || "",
                width: "minmax(90px, 0.5fr)",
                cell: ({ row: caseItem }) => React.createElement(PlatformLabel, {
                  variant: caseItem.status === "passed" ? "green" : "gray",
                }, caseItem.status === "passed" ? "Passed" : "Failed"),
              },
            ],
          });
        }

        function renderFineTuningStatisticalEvidence(job) {
          const rows = getFineTuningStatisticalEvidenceRows(job);
          if (!rows.length) return null;
          const formatInterval = (interval) => {
            const lower = Number(interval?.lower);
            const upper = Number(interval?.upper);
            if (!Number.isFinite(lower) || !Number.isFinite(upper)) return "Unavailable";
            const lowerPoints = Math.round(lower * 100);
            const upperPoints = Math.round(upper * 100);
            return (lowerPoints > 0 ? "+" : "") + lowerPoints + " to "
              + (upperPoints > 0 ? "+" : "") + upperPoints + " pts";
          };
          const formatEfficiencyGate = (gate) => {
            if (gate?.enabled !== true) {
              return React.createElement(PlatformLabel, { variant: "gray" }, "Not set");
            }
            if (gate?.evidenceMet !== true) {
              return React.createElement(PlatformLabel, { variant: "red" }, "No evidence");
            }
            const increaseRatio = gate?.increaseRatio === null || gate?.increaseRatio === undefined
              ? Number.NaN
              : Number(gate.increaseRatio);
            const maximumIncreaseRatio = gate?.maximumIncreaseRatio === null
              || gate?.maximumIncreaseRatio === undefined
              ? Number.NaN
              : Number(gate.maximumIncreaseRatio);
            const ratioLabel = Number.isFinite(increaseRatio)
              ? (increaseRatio > 0 ? "+" : "") + Math.round(increaseRatio * 100) + "%"
              : "";
            const limitLabel = Number.isFinite(maximumIncreaseRatio)
              ? " / max " + Math.round(maximumIncreaseRatio * 100) + "%"
              : "";
            return React.createElement(
              PlatformLabel,
              { variant: gate?.accepted === true ? "green" : "red" },
              (ratioLabel || (gate?.accepted === true ? "Verified" : "Rejected")) + limitLabel
            );
          };
          return React.createElement(PlatformDataTable, {
            rows,
            getRowId: (row) => row.id,
            ariaLabel: "Optimization statistical evidence",
            variant: "minimalistic-ui",
            sticky: false,
            rowMinHeight: 46,
            pagination: false,
            toolbar: {
              title: "Statistical Evidence",
            },
            columns: [
              {
                id: "evaluation",
                header: "Evaluation",
                accessor: (row) => row.evaluationSetName,
                width: "minmax(160px, 1fr)",
              },
              {
                id: "paired",
                header: "Paired rows",
                accessor: (row) => row.pairedCount,
                width: "minmax(100px, 0.55fr)",
                cell: ({ row }) => row.pairedCount + " (" + row.pairedTrialCount + " trials)",
              },
              {
                id: "coverage",
                header: "Coverage",
                accessor: (row) => row.pairedCoverage,
                width: "minmax(90px, 0.45fr)",
                cell: ({ row }) => formatPlaygroundFineTuningPercent(row.pairedCoverage),
              },
              {
                id: "score_interval",
                header: "Score delta CI",
                accessor: (row) => row.meanDelta,
                width: "minmax(155px, 0.8fr)",
                cell: ({ row }) => formatInterval(row.scoreDeltaInterval),
              },
              {
                id: "pass_interval",
                header: "Pass-rate delta CI",
                accessor: (row) => Number(row.passRateDeltaInterval?.lower),
                width: "minmax(175px, 0.9fr)",
                cell: ({ row }) => formatInterval(row.passRateDeltaInterval),
              },
              {
                id: "cost_gate",
                header: "Cost gate",
                accessor: (row) => row.costGate?.accepted === true ? "accepted" : "rejected",
                width: "minmax(125px, 0.65fr)",
                cell: ({ row }) => formatEfficiencyGate(row.costGate),
              },
              {
                id: "latency_gate",
                header: "Latency gate",
                accessor: (row) => row.latencyGate?.accepted === true ? "accepted" : "rejected",
                width: "minmax(125px, 0.65fr)",
                cell: ({ row }) => formatEfficiencyGate(row.latencyGate),
              },
              {
                id: "decision",
                header: "Decision",
                accessor: (row) => row.accepted ? "accepted" : "rejected",
                width: "minmax(110px, 0.55fr)",
                cell: ({ row }) => React.createElement(
                  PlatformLabel,
                  { variant: row.accepted ? "green" : "red" },
                  row.gateAvailable
                    ? (row.accepted ? "Accepted" : "Rejected")
                    : "Pending"
                ),
              },
            ],
          });
        }

        function renderAnalysis(analysisSummary) {
          return React.createElement(PlatformUiCard, {
              as: "section",
              className: "playground-fine-tuning-analysis-section playground-fine-tuning-tab-panel",
            },
            React.createElement("h2", { className: "playground-fine-tuning-content-title" }, "Analysis"),
            analysisSummary
              ? (typeof PlaygroundTaskDescriptionMarkdown === "function"
                  ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                      content: analysisSummary,
                      className: "playground-fine-tuning-analysis-content tb-message-markdown",
                    })
                  : React.createElement("div", { className: "playground-fine-tuning-analysis-content tb-message-markdown" }, analysisSummary))
              : React.createElement(PlatformEmptyState, {
                  icon: ChartColumnIncreasing,
                  title: "No analysis available yet",
                  description: "The optimization analysis will appear here after the job has produced a result.",
                })
          );
        }

        function renderDiff(job, options = {}) {
          const files = buildPlaygroundFineTuningDiffFiles(job);
          const showHeader = options.showHeader !== false;
          return React.createElement("section", { className: "playground-fine-tuning-changes-section playground-fine-tuning-tab-panel" },
            showHeader
              ? React.createElement("div", { className: "playground-plugins-section-header" },
                  React.createElement("div", { className: "playground-plugins-section-copy" },
                    React.createElement("h3", { className: "playground-plugins-section-title" }, "Agent Changes")
                  )
                )
              : null,
            files.length
              ? React.createElement("div", { className: "playground-fine-tuning-diff-list" },
                  files.map((file) =>
                    React.createElement("div", { key: file.id || file.filePath, className: "playground-version-changes-file-card" },
                      React.createElement(RunnerFileDiffSurface, {
                        filePath: file.filePath,
                        diffContent: file.diffContent || "",
                        fileContent: file.fileContent || file.afterContent || "",
                        additions: file.additions,
                        deletions: file.deletions,
                        emptyMessage: "No diff is available for this file.",
                      })
                    )
                  )
                )
              : React.createElement("div", { className: "playground-version-changes-empty" }, "No changes captured.")
          );
        }

        function renderDetail() {
          if (!selectedJob) {
            return renderOverview();
          }
          const job = normalizePlaygroundFineTuningJob(selectedJob);
          const analysisSummary = sanitizePlaygroundFineTuningAnalysisSummary(job.analysisSummary);
          const phase = normalizePlaygroundFineTuningString(job.phase || job.status || "queued").toLowerCase();
          const statusLabel = getFineTuningPhaseLabel(phase);
          const statusVariant = getFineTuningPhaseVariant(phase);
          const bestIteration = getFineTuningBestIteration(job);
          const targetPolicy = getFineTuningTargetPolicy(job);
          const limits = readPlaygroundFineTuningPlainObject(job?.configuration?.limits);
          const maxIterations = Math.max(1, Number(limits.maxIterations ?? limits.max_iterations ?? 1) || 1);
          const budget = readPlaygroundFineTuningPlainObject(job?.budget);
          const budgetLimitUsd = normalizePlaygroundFineTuningUsdCost(
            budget.budgetUsd ?? budget.limitUsd ?? limits.budgetUsd ?? limits.budget_usd ?? 0
          );
          const budgetSpentUsd = normalizePlaygroundFineTuningUsdCost(budget.spentUsd ?? job.costUsd ?? 0);
          const version = job.createdAgentVersion || {};
          const publicationDecision = readPlaygroundFineTuningPlainObject(
            job.publicationDecision
          );
          const canApprovePublication = phase === "awaiting_review"
            && normalizePlaygroundFineTuningString(
              publicationDecision.status
            ).toLowerCase() === "pending"
            && Boolean(normalizePlaygroundFineTuningString(
              publicationDecision.evidenceFingerprint
                || publicationDecision.evidence_fingerprint
            ));
          const isApprovingPublication = fineTuningApproveJobId === job.id;
          const versionValue = version.version
            ? "Version " + version.version
            : isPlaygroundFineTuningAgentVersionReady(job.agentVersionCreationStatus || version.status)
              ? "Saved"
              : "Pending";
          const agent = normalizedAgents.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizePlaygroundFineTuningString(job.targetAgentId || job.agentId)) || null;
          const agentName = normalizePlaygroundFineTuningString(job.agentName || job.targetAgentName || agent?.name || agent?.label || agent?.title || "Agent");
          const agentPhotoUrl = normalizePlaygroundFineTuningString(job.agentPhotoUrl || job.targetAgentPhotoUrl || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL);
          const environmentName = normalizePlaygroundFineTuningString(job.environmentName || "Computer");
          const threadId = normalizePlaygroundFineTuningString(
            job.threadId
              || bestIteration?.optimizerThreadId
              || (Array.isArray(job.iterations) ? job.iterations.slice().reverse().find((iteration) => iteration?.optimizerThreadId)?.optimizerThreadId : "")
          );
          const renderSidebarRow = (key, label, value, options = {}) => React.createElement("div", {
              key,
              className: "playground-fine-tuning-detail-sidebar-row playground-tasks-detail-fact" + (options.className ? " " + options.className : ""),
            },
            React.createElement("span", {
              className: "playground-fine-tuning-detail-sidebar-label playground-tasks-detail-fact-label",
            }, label),
            React.createElement(options.control ? "div" : "span", {
              className: "playground-fine-tuning-detail-sidebar-value playground-tasks-detail-fact-control",
              title: options.title || (typeof value === "string" ? value : undefined),
            }, value)
          );
          const agentValue = React.createElement("span", { className: "playground-fine-tuning-detail-person", title: agentName },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              agentPhotoUrl
                ? React.createElement("img", { src: agentPhotoUrl, alt: "" })
                : getPlaygroundFineTuningInitials(agentName)
            ),
            React.createElement("span", null, agentName)
          );
          const environmentValue = React.createElement("span", { className: "playground-fine-tuning-detail-environment", title: environmentName },
            React.createElement(Monitor, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" }),
            React.createElement("span", null, environmentName)
          );
          const showStopButton = canStopPlaygroundFineTuningJob(job);
          const isStopping = fineTuningStopJobId === job.id;
          const batchEvaluationSetIds = (Array.isArray(job.evaluationSets) ? job.evaluationSets : [])
            .map((set) => normalizePlaygroundFineTuningString(set?.id))
            .filter(Boolean);
          const batchAgentId = normalizePlaygroundFineTuningString(job.targetAgentId || job.agentId);
          const canAddOptimizationToBatches = Boolean(job?.id) && (
            phase === "planned"
            || (
              isPlaygroundFineTuningTerminalStatus(phase || job.status)
              && Boolean(batchAgentId)
              && batchEvaluationSetIds.length > 0
            )
          );
          const batchDefinition = phase === "planned"
            ? { jobId: job.id }
            : {
                agentId: batchAgentId,
                environmentId: normalizePlaygroundFineTuningString(job.environmentId) || null,
                evaluationSetIds: batchEvaluationSetIds,
                fineTunerAgentId: normalizePlaygroundFineTuningString(
                  job.fineTunerAgentId || job?.conductedBy?.id
                ) || null,
                instructions: String(job.instructions || ""),
                name: "Optimize " + agentName,
                metadata: {
                  fineTuningOrchestrationState: {
                    schemaVersion: Math.max(2, Number(job.schemaVersion || 2) || 2),
                    kind: "agent_optimization",
                    phase: "queued",
                    configuration: readPlaygroundFineTuningPlainObject(job.configuration),
                  },
                },
              };
          const sidebarActions = threadId && typeof onOpenThread === "function" || showStopButton || canAddOptimizationToBatches
            ? React.createElement("div", {
                className: "platform-service-detail-page__sidebar-actions playground-fine-tuning-detail-sidebar-actions",
              },
              threadId && typeof onOpenThread === "function"
                ? React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    size: "small",
                    fullWidth: true,
                    className: "playground-fine-tuning-detail-sidebar-action",
                    onClick: () => onOpenThread(threadId),
                  },
                  React.createElement(MessageSquare, { width: 14, height: 14, strokeWidth: 1.85, "aria-hidden": "true" }),
                  React.createElement("span", null, "Open Thread")
                )
                : null,
              showStopButton
                ? React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    size: "small",
                    fullWidth: true,
                    className: "playground-fine-tuning-detail-sidebar-action",
                    onClick: () => stopFineTuningJob(job),
                    disabled: isStopping,
                  },
                  isStopping
                    ? React.createElement(Loader2, { className: "is-spinning", width: 14, height: 14, strokeWidth: 1.85, "aria-hidden": "true" })
                    : React.createElement(Square, { width: 13, height: 13, strokeWidth: 1.85, "aria-hidden": "true" }),
                  React.createElement("span", null, isStopping ? "Stopping" : "Stop Job")
                )
                : null,
              canAddOptimizationToBatches
                ? React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    size: "small",
                    fullWidth: true,
                    className: "playground-fine-tuning-detail-sidebar-action",
                    onClick: () => openBatchComposer({
                      name: (phase === "planned" ? "Optimize " : "Optimize again: ") + agentName,
                      description: phase === "planned"
                        ? "Agent Optimization queued from its details page."
                        : "A new Agent Optimization run based on this completed definition.",
                      targetKind: "agent_optimization",
                      targetResourceId: phase === "planned" ? job.id : null,
                      definition: batchDefinition,
                      startPolicy: "manual",
                    }),
                  },
                  React.createElement(Truck, { width: 14, height: 14, strokeWidth: 1.85, "aria-hidden": "true" }),
                  React.createElement("span", null, "Add to Batches")
                )
                : null
            )
            : null;
          const properties = React.createElement("div", {
              className: "playground-fine-tuning-detail-sidebar-list playground-tasks-detail-facts-body",
            },
            renderSidebarRow("status", "Status", React.createElement(PlatformLabel, { variant: statusVariant }, statusLabel)),
            renderSidebarRow("agent", "Agent", agentValue),
            renderSidebarRow("environment", "Environment", environmentValue),
            renderSidebarRow("version", "Version", versionValue),
            renderSidebarRow("iteration", "Iteration", Math.max(0, Number(job.currentIteration || 0) || 0) + " / " + maxIterations),
            renderSidebarRow("target", "Target", formatPlaygroundFineTuningPercent(targetPolicy.score) + " score · " + formatPlaygroundFineTuningPercent(targetPolicy.passRate) + " pass"),
            renderSidebarRow("sets", "Evaluation Sets", String(Array.isArray(job.evaluationSets) ? job.evaluationSets.length : 0)),
            renderSidebarRow("budget", "Budget", budgetLimitUsd > 0
              ? formatPlaygroundFineTuningUsdCost(budgetSpentUsd) + " / " + formatPlaygroundFineTuningUsdCost(budgetLimitUsd)
              : formatPlaygroundFineTuningUsdCost(budgetSpentUsd)),
            job.stopReason
              ? renderSidebarRow("stopReason", "Stop Reason", getFineTuningPhaseLabel(job.stopReason))
              : null,
            renderSidebarRow("created", "Created", formatPlaygroundFineTuningDateTime(job.createdAt)),
            renderSidebarRow("updated", "Updated", formatPlaygroundFineTuningDateTime(job.updatedAt || job.createdAt)),
            renderSidebarRow("owner", "Owner", renderFineTuningOwnerSelector(job), {
              className: "is-owner playground-fine-tuning-detail-owner-row",
              control: true,
            }),
            sidebarActions
          );
          const fineTuningSettings = fineTuningDetailTab === "settings"
            ? {
                ariaLabel: "Agent Optimization settings",
                className: "playground-fine-tuning-settings-page",
                identity: {
                  icon: React.createElement(TestTubeDiagonal, {
                    width: 24,
                    height: 24,
                    strokeWidth: 1.7,
                    "aria-hidden": "true",
                  }),
                  title: String(job.name || "Agent Optimization"),
                  description: String(job.description || ""),
                  onTitleChange: (value) => patchFineTuningJob(job.id, (current) => ({
                    ...current,
                    name: String(value || ""),
                  }), { persist: true, delayMs: 450 }),
                  onDescriptionChange: (value) => patchFineTuningJob(job.id, (current) => ({
                    ...current,
                    description: String(value || ""),
                  }), { persist: true, delayMs: 450 }),
                  titlePlaceholder: "Agent Optimization",
                  descriptionPlaceholder: "Describe the purpose, scope, and expected outcome of this optimization",
                  titleAriaLabel: "Agent Optimization name",
                  descriptionAriaLabel: "Agent Optimization description",
                },
                details: {
                  children: properties,
                  className: "playground-fine-tuning-detail-sidebar-card",
                },
                additionalSections: renderFineTuningInstructionsEditor(job),
                access: renderFineTuningAccessSettings(job),
                accessDetailOpen: Boolean(fineTuningAccessTeamId),
                detailsSidebarAriaLabel: "Agent Optimization information",
                detailsSidebarClassName: "playground-fine-tuning-detail-sidebar playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar",
              }
            : undefined;
          const detailContent = fineTuningDetailTab === "analysis"
            ? React.createElement(React.Fragment, null,
                renderAnalysis(analysisSummary),
                renderEvaluationRunReferences(job)
              )
            : fineTuningDetailTab === "changes"
              ? renderDiff(job, { showHeader: false })
              : fineTuningDetailTab === "settings"
                ? null
                : React.createElement(React.Fragment, null,
                    renderKpiCard(job),
                    renderFineTuningExecutionProgress(job),
                    renderFineTuningIterations(job),
                    renderFineTuningStatisticalEvidence(job),
                    renderFineTuningCaseComparisons(job)
                  );
          const topNavActions = fineTuningTopNavActionsContainer && typeof createPortal === "function"
            ? createPortal(
              React.createElement("div", {
                  className: "playground-fine-tuning-detail-topnav-actions",
                },
                fineTuningApprovalError
                  ? React.createElement("span", {
                      className: "playground-fine-tuning-publication-error",
                      role: "alert",
                      title: fineTuningApprovalError,
                    }, fineTuningApprovalError)
                  : null,
                canApprovePublication
                  ? React.createElement(PlatformPrimaryButton, {
                      type: "button",
                      size: "small",
                      onClick: () => approveFineTuningPublication(job),
                      disabled: isApprovingPublication,
                      "aria-busy": isApprovingPublication || undefined,
                    }, isApprovingPublication ? "Publishing..." : "Approve & Publish")
                  : null,
                React.createElement(PlatformLabel, { variant: statusVariant }, statusLabel)
              ),
              fineTuningTopNavActionsContainer
            )
            : null;
          return React.createElement(React.Fragment, null,
            React.createElement(FineTuningDetailPage, {
              properties,
              settings: fineTuningSettings,
              sidebarCollapsed: Boolean(fineTuningAccessTeamId),
            },
              detailContent
            ),
            topNavActions
          );
        }

`;
