export const FINE_TUNING_PAGE_JOBS_SCRIPT = String.raw`      function normalizePlaygroundFineTuningRunReference(rawReference = {}, fallbackIndex = 0) {
        const source = rawReference && typeof rawReference === "object" && !Array.isArray(rawReference) ? rawReference : {};
        return {
          evaluationSetId: normalizePlaygroundFineTuningString(source.evaluationSetId || source.evaluation_set_id),
          evaluationSetName: normalizePlaygroundFineTuningString(source.evaluationSetName || source.evaluation_set_name || "Evaluation " + (fallbackIndex + 1)),
          beforeRunId: normalizePlaygroundFineTuningString(source.beforeRunId || source.before_run_id),
          beforeRunLabel: normalizePlaygroundFineTuningString(source.beforeRunLabel || source.before_run_label || "Before"),
          beforeScore: normalizePlaygroundFineTuningScore(source.beforeScore ?? source.before_score ?? 0),
          beforeCostUsd: normalizePlaygroundFineTuningUsdCost(source.beforeCostUsd ?? source.before_cost_usd ?? 0),
          afterRunId: normalizePlaygroundFineTuningString(source.afterRunId || source.after_run_id),
          afterRunLabel: normalizePlaygroundFineTuningString(source.afterRunLabel || source.after_run_label || "After"),
          afterScore: normalizePlaygroundFineTuningScore(source.afterScore ?? source.after_score ?? 0),
          afterCostUsd: normalizePlaygroundFineTuningUsdCost(source.afterCostUsd ?? source.after_cost_usd ?? 0),
          status: normalizePlaygroundFineTuningString(source.status || "not_run") || "not_run",
        };
      }

      function normalizePlaygroundFineTuningJob(rawJob = {}, fallbackIndex = 0) {
        const source = rawJob && typeof rawJob === "object" && !Array.isArray(rawJob) ? rawJob : {};
        const metadata = readPlaygroundFineTuningPlainObject(source.metadata);
        const fineTuningMetadata = readPlaygroundFineTuningPlainObject(metadata.fineTuning);
        const runnerPlaygroundMetadata = readPlaygroundFineTuningPlainObject(metadata.runnerPlayground);
        const createdAgentVersion = isPlaygroundFineTuningPlainObject(source.createdAgentVersion)
          ? source.createdAgentVersion
          : isPlaygroundFineTuningPlainObject(source.created_agent_version)
            ? source.created_agent_version
            : null;
        const createdAgentVersionMetadata = readPlaygroundFineTuningPlainObject(createdAgentVersion?.metadata);
        const createdAgentVersionSnapshot = readPlaygroundFineTuningPlainObject(createdAgentVersion?.snapshot);
        const beforeAgentSnapshot = readFirstPlaygroundFineTuningObject(
          source.beforeAgentSnapshot,
          source.before_agent_snapshot,
          source.beforeSnapshot,
          source.before_snapshot,
          source.baseAgentSnapshot,
          source.base_agent_snapshot,
          metadata.beforeAgentSnapshot,
          metadata.before_agent_snapshot,
          metadata.beforeSnapshot,
          metadata.before_snapshot,
          metadata.baseAgentSnapshot,
          metadata.base_agent_snapshot,
          fineTuningMetadata.beforeAgentSnapshot,
          fineTuningMetadata.before_agent_snapshot,
          fineTuningMetadata.beforeSnapshot,
          fineTuningMetadata.before_snapshot,
          fineTuningMetadata.baseAgentSnapshot,
          fineTuningMetadata.base_agent_snapshot,
          createdAgentVersionMetadata.beforeAgentSnapshot,
          createdAgentVersionMetadata.before_agent_snapshot,
          createdAgentVersionMetadata.beforeSnapshot,
          createdAgentVersionMetadata.before_snapshot,
          createdAgentVersionMetadata.baseAgentSnapshot,
          createdAgentVersionMetadata.base_agent_snapshot
        );
        const afterAgentSnapshot = readFirstPlaygroundFineTuningObject(
          source.afterAgentSnapshot,
          source.after_agent_snapshot,
          source.afterSnapshot,
          source.after_snapshot,
          metadata.afterAgentSnapshot,
          metadata.after_agent_snapshot,
          metadata.afterSnapshot,
          metadata.after_snapshot,
          fineTuningMetadata.afterAgentSnapshot,
          fineTuningMetadata.after_agent_snapshot,
          fineTuningMetadata.afterSnapshot,
          fineTuningMetadata.after_snapshot,
          createdAgentVersionSnapshot,
          createdAgentVersionMetadata.afterAgentSnapshot,
          createdAgentVersionMetadata.after_agent_snapshot,
          createdAgentVersionMetadata.afterSnapshot,
          createdAgentVersionMetadata.after_snapshot
        );
        const diffFiles = readFirstPlaygroundFineTuningArray(
          source.diffFiles,
          source.diff_files,
          metadata.diffFiles,
          metadata.diff_files,
          fineTuningMetadata.diffFiles,
          fineTuningMetadata.diff_files,
          runnerPlaygroundMetadata.diffFiles,
          runnerPlaygroundMetadata.diff_files,
          createdAgentVersion?.diffFiles,
          createdAgentVersion?.diff_files,
          createdAgentVersionMetadata.diffFiles,
          createdAgentVersionMetadata.diff_files
        );
        const threadId = normalizePlaygroundFineTuningString(
          source.threadId
          || source.thread_id
          || source.fineTuningThreadId
          || source.fine_tuning_thread_id
          || source.thread?.id
          || source.thread?.threadId
          || source.thread?.thread_id
          || metadata.threadId
          || metadata.thread_id
          || metadata.fineTuningThreadId
          || metadata.fine_tuning_thread_id
          || fineTuningMetadata.threadId
          || fineTuningMetadata.thread_id
          || fineTuningMetadata.fineTuningThreadId
          || fineTuningMetadata.fine_tuning_thread_id
          || runnerPlaygroundMetadata.threadId
          || runnerPlaygroundMetadata.thread_id
          || runnerPlaygroundMetadata.fineTuningThreadId
          || runnerPlaygroundMetadata.fine_tuning_thread_id
          || createdAgentVersion?.threadId
          || createdAgentVersion?.thread_id
          || createdAgentVersion?.fineTuningThreadId
          || createdAgentVersion?.fine_tuning_thread_id
          || createdAgentVersionMetadata.threadId
          || createdAgentVersionMetadata.thread_id
          || createdAgentVersionMetadata.fineTuningThreadId
          || createdAgentVersionMetadata.fine_tuning_thread_id
        );
        const nowIso = new Date().toISOString();
        const evaluationSets = (Array.isArray(source.evaluationSets)
          ? source.evaluationSets
          : Array.isArray(source.evaluation_sets)
            ? source.evaluation_sets
            : []
        ).map((set, index) => ({
          id: normalizePlaygroundFineTuningString(set?.id || set?.evaluationSetId || set?.evaluation_set_id || "evaluation_" + (index + 1)),
          name: normalizePlaygroundFineTuningString(set?.name || set?.title || "Evaluation " + (index + 1)),
          activeVersionId: normalizePlaygroundFineTuningString(set?.activeVersionId || set?.active_version_id),
          activeVersionNumber: Math.max(0, Number(set?.activeVersionNumber || set?.active_version_number || 0) || 0),
          activeVersionLabel: normalizePlaygroundFineTuningString(set?.activeVersionLabel || set?.active_version_label),
          fineTuningRunId: normalizePlaygroundFineTuningString(set?.fineTuningRunId || set?.fine_tuning_run_id || set?.selectedRunId || set?.selected_run_id),
          fineTuningRunLabel: normalizePlaygroundFineTuningString(set?.fineTuningRunLabel || set?.fine_tuning_run_label || set?.selectedRunLabel || set?.selected_run_label),
          caseCount: Math.max(0, Number(set?.caseCount || set?.case_count || 0) || 0),
        }));
        const evaluationRuns = (Array.isArray(source.evaluationRuns)
          ? source.evaluationRuns
          : Array.isArray(source.evaluation_runs)
            ? source.evaluation_runs
            : []
        ).map((reference, index) => normalizePlaygroundFineTuningRunReference(reference, index));
        const conductedBy = getPlaygroundFineTuningConductorIdentity(source);
        const explicitVerificationCostUsd = normalizePlaygroundFineTuningUsdCost(
          source.verificationCostUsd
          ?? source.verification_cost_usd
          ?? source.evaluationCostUsd
          ?? source.evaluation_cost_usd
          ?? 0
        );
        const verificationCostUsd = explicitVerificationCostUsd
          || evaluationRuns.reduce((sum, reference) => sum + normalizePlaygroundFineTuningUsdCost(reference.afterCostUsd), 0);
        const fineTuningCostUsd = readPlaygroundFineTuningUsdCostWithLegacyCt(source, [
          "fineTuningCostUsd",
          "fine_tuning_cost_usd",
          "analysisCostUsd",
          "analysis_cost_usd",
          "threadCostUsd",
          "thread_cost_usd",
          "costUsd",
          "cost_usd",
        ]);
        const explicitTotalCostUsd = normalizePlaygroundFineTuningUsdCost(
          source.totalCostUsd
          ?? source.total_cost_usd
          ?? source.totalUsd
          ?? source.total_usd
          ?? 0
        );
        const explicitOrComponentCostUsd = explicitTotalCostUsd || fineTuningCostUsd + verificationCostUsd;
        const totalCostTokens = normalizePlaygroundFineTuningTokenCount(
          source.costTokens
          ?? source.cost_tokens
          ?? source.costCt
          ?? source.costCT
          ?? source.cost_ct
          ?? source.computeTokens
          ?? source.compute_tokens
          ?? source.totalCT
          ?? source.totalCt
          ?? source.total_ct
          ?? source.ct
        ) || normalizePlaygroundFineTuningTokenCount(explicitOrComponentCostUsd * PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
        const totalCostUsd = explicitOrComponentCostUsd || (totalCostTokens / PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
        const configuration = readPlaygroundFineTuningPlainObject(source.configuration || source.config);
        const iterations = (Array.isArray(source.iterations) ? source.iterations : []).map((iteration, index) => {
          const iterationSource = readPlaygroundFineTuningPlainObject(iteration);
          const metrics = readPlaygroundFineTuningPlainObject(iterationSource.metrics);
          const baselineMetrics = readPlaygroundFineTuningPlainObject(
            iterationSource.baselineMetrics || iterationSource.baseline_metrics
          );
          return {
            ...iterationSource,
            id: normalizePlaygroundFineTuningString(iterationSource.id || "iteration_" + index),
            number: Math.max(0, Number(iterationSource.number ?? iterationSource.iterationNumber ?? iterationSource.iteration_number ?? index) || 0),
            status: normalizePlaygroundFineTuningString(iterationSource.status || iterationSource.phase || "queued"),
            accepted: iterationSource.accepted === true,
            targetMet: iterationSource.targetMet === true || iterationSource.target_met === true,
            decision: normalizePlaygroundFineTuningString(iterationSource.decision),
            decisionReason: normalizePlaygroundFineTuningString(iterationSource.decisionReason || iterationSource.decision_reason),
            decisionEvidence: readPlaygroundFineTuningPlainObject(
              iterationSource.decisionEvidence || iterationSource.decision_evidence
            ),
            optimizerThreadId: normalizePlaygroundFineTuningString(iterationSource.optimizerThreadId || iterationSource.optimizer_thread_id),
            optimizerThreadTitle: normalizePlaygroundFineTuningString(iterationSource.optimizerThreadTitle || iterationSource.optimizer_thread_title),
            candidateVersionId: normalizePlaygroundFineTuningString(iterationSource.candidateVersionId || iterationSource.candidate_version_id),
            candidateVersion: readPlaygroundFineTuningPlainObject(iterationSource.candidateVersion || iterationSource.candidate_version),
            candidateSnapshot: readPlaygroundFineTuningPlainObject(iterationSource.candidateSnapshot || iterationSource.candidate_snapshot),
            analysisSummary: sanitizePlaygroundFineTuningAnalysisSummary(iterationSource.analysisSummary || iterationSource.analysis_summary || ""),
            metrics: {
              ...metrics,
              averageScore: normalizePlaygroundFineTuningScore(metrics.averageScore ?? metrics.average_score ?? 0),
              passRate: normalizePlaygroundFineTuningScore(metrics.passRate ?? metrics.pass_rate ?? 0),
              totalCount: Math.max(0, Number(metrics.totalCount ?? metrics.total_count ?? 0) || 0),
              passedCount: Math.max(0, Number(metrics.passedCount ?? metrics.passed_count ?? 0) || 0),
              costUsd: normalizePlaygroundFineTuningUsdCost(metrics.costUsd ?? metrics.cost_usd ?? 0),
            },
            baselineMetrics: {
              ...baselineMetrics,
              averageScore: normalizePlaygroundFineTuningScore(baselineMetrics.averageScore ?? baselineMetrics.average_score ?? 0),
              passRate: normalizePlaygroundFineTuningScore(baselineMetrics.passRate ?? baselineMetrics.pass_rate ?? 0),
              totalCount: Math.max(0, Number(baselineMetrics.totalCount ?? baselineMetrics.total_count ?? 0) || 0),
              passedCount: Math.max(0, Number(baselineMetrics.passedCount ?? baselineMetrics.passed_count ?? 0) || 0),
              costUsd: normalizePlaygroundFineTuningUsdCost(baselineMetrics.costUsd ?? baselineMetrics.cost_usd ?? 0),
            },
            evaluationRuns: Array.isArray(iterationSource.evaluationRuns)
              ? iterationSource.evaluationRuns
              : Array.isArray(iterationSource.evaluation_runs)
                ? iterationSource.evaluation_runs
                : [],
            caseComparisons: Array.isArray(iterationSource.caseComparisons)
              ? iterationSource.caseComparisons
              : Array.isArray(iterationSource.case_comparisons)
                ? iterationSource.case_comparisons
                : [],
            startedAt: normalizePlaygroundFineTuningString(iterationSource.startedAt || iterationSource.started_at),
            completedAt: normalizePlaygroundFineTuningString(iterationSource.completedAt || iterationSource.completed_at),
            costTokens: normalizePlaygroundFineTuningTokenCount(iterationSource.costTokens ?? iterationSource.cost_tokens ?? 0),
            costUsd: normalizePlaygroundFineTuningUsdCost(iterationSource.costUsd ?? iterationSource.cost_usd ?? 0),
          };
        }).sort((left, right) => left.number - right.number);
        const costLedger = Array.isArray(source.costLedger)
          ? source.costLedger
          : Array.isArray(source.cost_ledger)
            ? source.cost_ledger
            : [];
        const events = Array.isArray(source.events) ? source.events : [];
        const budgetSource = readPlaygroundFineTuningPlainObject(source.budget);
        const limitSource = readPlaygroundFineTuningPlainObject(configuration.limits);
        const spentUsd = normalizePlaygroundFineTuningUsdCost(
          budgetSource.spentUsd
            ?? budgetSource.spent_usd
            ?? costLedger.reduce((sum, entry) => sum + normalizePlaygroundFineTuningUsdCost(entry?.amountUsd ?? entry?.amount_usd), 0)
            ?? totalCostUsd
        ) || totalCostUsd;
        const limitUsd = normalizePlaygroundFineTuningUsdCost(
          budgetSource.limitUsd
            ?? budgetSource.limit_usd
            ?? limitSource.budgetUsd
            ?? limitSource.budget_usd
            ?? 0
        );
        return {
          id: normalizePlaygroundFineTuningString(source.id || source.jobId || source.job_id) || createPlaygroundFineTuningId(),
          schemaVersion: Math.max(1, Number(source.schemaVersion || source.schema_version || 1) || 1),
          kind: normalizePlaygroundFineTuningString(source.kind || "agent_optimization"),
          name: normalizePlaygroundFineTuningString(source.name || source.title || "Optimization Job " + (fallbackIndex + 1)),
          status: normalizePlaygroundFineTuningString(source.status || "completed") || "completed",
          phase: normalizePlaygroundFineTuningString(source.phase || source.executionPhase || source.execution_phase || source.status || "queued"),
          stopReason: normalizePlaygroundFineTuningString(source.stopReason || source.stop_reason),
          targetMet: source.targetMet === true || source.target_met === true,
          createdAt: normalizePlaygroundFineTuningString(source.createdAt || source.created_at || nowIso),
          updatedAt: normalizePlaygroundFineTuningString(source.updatedAt || source.updated_at || source.createdAt || source.created_at || nowIso),
          agentId: normalizePlaygroundFineTuningString(source.agentId || source.agent_id),
          targetAgentId: normalizePlaygroundFineTuningString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id),
          agentName: normalizePlaygroundFineTuningString(source.agentName || source.agent_name || "Agent"),
          targetAgentName: normalizePlaygroundFineTuningString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name || "Agent"),
          agentPhotoUrl: normalizePlaygroundFineTuningString(source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
          targetAgentPhotoUrl: normalizePlaygroundFineTuningString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
          conductedBy,
          createdBy: conductedBy,
          fineTunerAgentId: normalizePlaygroundFineTuningString(source.fineTunerAgentId || source.fine_tuner_agent_id || source.runnerAgentId || source.runner_agent_id),
          fineTunerAgentName: normalizePlaygroundFineTuningString(source.fineTunerAgentName || source.fine_tuner_agent_name || source.runnerAgentName || source.runner_agent_name),
          fineTunerAgentPhotoUrl: normalizePlaygroundFineTuningString(source.fineTunerAgentPhotoUrl || source.fine_tuner_agent_photo_url || source.runnerAgentPhotoUrl || source.runner_agent_photo_url),
          environmentId: normalizePlaygroundFineTuningString(source.environmentId || source.environment_id),
          environmentName: normalizePlaygroundFineTuningString(source.environmentName || source.environment_name || "Computer"),
          evaluationSets,
          configuration,
          iterations,
          currentIteration: Math.max(0, Number(source.currentIteration ?? source.current_iteration ?? 0) || 0),
          bestIterationId: normalizePlaygroundFineTuningString(source.bestIterationId || source.best_iteration_id),
          events,
          costLedger,
          budget: {
            ...budgetSource,
            limitUsd,
            spentUsd,
            remainingUsd: Math.max(0, Number(budgetSource.remainingUsd ?? budgetSource.remaining_usd ?? (limitUsd - spentUsd)) || 0),
            exhausted: budgetSource.exhausted === true || (limitUsd > 0 && spentUsd >= limitUsd),
          },
          execution: readPlaygroundFineTuningPlainObject(source.execution),
          description: String(
            Object.prototype.hasOwnProperty.call(source, "description")
              ? source.description ?? ""
              : metadata.description || ""
          ),
          instructions: String(source.instructions || ""),
          verifyAfter: true,
          threadId,
          threadTitle: normalizePlaygroundFineTuningString(source.threadTitle || source.thread_title || "Optimization Thread"),
          beforeScore: normalizePlaygroundFineTuningScore(source.beforeScore ?? source.before_score ?? 0),
          afterScore: normalizePlaygroundFineTuningScore(source.afterScore ?? source.after_score ?? 0),
          improvementScore: normalizePlaygroundFineTuningScore(source.improvementScore ?? source.improvement_score ?? 0),
          costTokens: totalCostTokens,
          costUsd: totalCostUsd,
          fineTuningCostUsd,
          verificationCostUsd,
          analysisSummary: sanitizePlaygroundFineTuningAnalysisSummary(source.analysisSummary || source.analysis_summary || ""),
          evaluationRuns,
          beforeAgentSnapshot,
          afterAgentSnapshot,
          diffFiles,
          createdAgentVersion,
          createdAgentVersionId: normalizePlaygroundFineTuningString(source.createdAgentVersionId || source.created_agent_version_id || createdAgentVersion?.id || createdAgentVersion?.versionId || createdAgentVersion?.version_id),
          agentVersionCreationStatus: normalizePlaygroundFineTuningString(source.agentVersionCreationStatus || source.agent_version_creation_status || createdAgentVersion?.status || "proposed") || "proposed",
          agentVersionError: normalizePlaygroundFineTuningString(source.agentVersionError || source.agent_version_error || createdAgentVersion?.error),
          publicationDecision: readPlaygroundFineTuningPlainObject(source.publicationDecision || source.publication_decision),
          completedAt: normalizePlaygroundFineTuningString(source.completedAt || source.completed_at),
          metadata,
          error: normalizePlaygroundFineTuningString(source.error || source.message),
        };
      }

      function mergePlaygroundFineTuningAgentVersionRecords(existingVersion, incomingVersion) {
        const existing = isPlaygroundFineTuningPlainObject(existingVersion) ? existingVersion : {};
        const incoming = isPlaygroundFineTuningPlainObject(incomingVersion) ? incomingVersion : {};
        if (!Object.keys(existing).length) return Object.keys(incoming).length ? incoming : null;
        if (!Object.keys(incoming).length) return existing;
        const existingMetadata = readPlaygroundFineTuningPlainObject(existing.metadata);
        const incomingMetadata = readPlaygroundFineTuningPlainObject(incoming.metadata);
        return {
          ...existing,
          ...incoming,
          id: normalizePlaygroundFineTuningString(incoming.id || incoming.versionId || incoming.version_id || existing.id || existing.versionId || existing.version_id),
          snapshot: hasPlaygroundFineTuningObjectContent(incoming.snapshot) ? incoming.snapshot : existing.snapshot,
          metadata: {
            ...existingMetadata,
            ...incomingMetadata,
          },
        };
      }

      function mergePlaygroundFineTuningJobRecords(existingJob, incomingJob) {
        const incomingSource = incomingJob && typeof incomingJob === "object" && !Array.isArray(incomingJob) ? incomingJob : {};
        const incomingHasExplicitStatus = Object.prototype.hasOwnProperty.call(incomingSource, "status")
          || Object.prototype.hasOwnProperty.call(incomingSource, "fineTuningStatus")
          || Object.prototype.hasOwnProperty.call(incomingSource, "fine_tuning_status");
        const incomingHasExplicitPhase = Object.prototype.hasOwnProperty.call(incomingSource, "phase")
          || Object.prototype.hasOwnProperty.call(incomingSource, "executionPhase")
          || Object.prototype.hasOwnProperty.call(incomingSource, "execution_phase");
        const incomingHasExplicitDescription = Object.prototype.hasOwnProperty.call(incomingSource, "description");
        const incomingHasExplicitInstructions = Object.prototype.hasOwnProperty.call(incomingSource, "instructions");
        const existing = normalizePlaygroundFineTuningJob(existingJob);
        const incoming = normalizePlaygroundFineTuningJob(incomingJob);
        const mergedVersion = mergePlaygroundFineTuningAgentVersionRecords(existing.createdAgentVersion, incoming.createdAgentVersion);
        return normalizePlaygroundFineTuningJob({
          ...existing,
          ...incoming,
          status: incomingHasExplicitStatus ? incoming.status : existing.status || incoming.status,
          phase: incomingHasExplicitPhase ? incoming.phase : existing.phase || incoming.phase,
          description: incomingHasExplicitDescription ? incoming.description : existing.description,
          instructions: incomingHasExplicitInstructions ? incoming.instructions : existing.instructions,
          metadata: {
            ...readPlaygroundFineTuningPlainObject(existing.metadata),
            ...readPlaygroundFineTuningPlainObject(incoming.metadata),
          },
          threadId: incoming.threadId || existing.threadId,
          threadTitle: incoming.threadTitle || existing.threadTitle,
          beforeAgentSnapshot: hasPlaygroundFineTuningObjectContent(incoming.beforeAgentSnapshot) ? incoming.beforeAgentSnapshot : existing.beforeAgentSnapshot,
          afterAgentSnapshot: hasPlaygroundFineTuningObjectContent(incoming.afterAgentSnapshot) ? incoming.afterAgentSnapshot : existing.afterAgentSnapshot,
          diffFiles: Array.isArray(incoming.diffFiles) && incoming.diffFiles.length ? incoming.diffFiles : existing.diffFiles,
          createdAgentVersion: mergedVersion,
          createdAgentVersionId: incoming.createdAgentVersionId || existing.createdAgentVersionId || normalizePlaygroundFineTuningString(mergedVersion?.id),
          analysisSummary: incoming.analysisSummary || existing.analysisSummary,
          evaluationRuns: Array.isArray(incoming.evaluationRuns) && incoming.evaluationRuns.length ? incoming.evaluationRuns : existing.evaluationRuns,
          configuration: Object.keys(incoming.configuration || {}).length ? incoming.configuration : existing.configuration,
          iterations: Array.isArray(incoming.iterations) && incoming.iterations.length ? incoming.iterations : existing.iterations,
          events: Array.isArray(incoming.events) && incoming.events.length ? incoming.events : existing.events,
          costLedger: Array.isArray(incoming.costLedger) && incoming.costLedger.length ? incoming.costLedger : existing.costLedger,
          execution: Object.keys(incoming.execution || {}).length ? incoming.execution : existing.execution,
          publicationDecision: Object.keys(incoming.publicationDecision || {}).length
            ? incoming.publicationDecision
            : existing.publicationDecision,
          currentIteration: Number(incoming.currentIteration || 0) > 0 ? incoming.currentIteration : existing.currentIteration,
          bestIterationId: incoming.bestIterationId || existing.bestIterationId,
        });
      }

      function hasPlaygroundFineTuningChangeArtifacts(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        if (Array.isArray(normalizedJob.diffFiles) && normalizedJob.diffFiles.length) return true;
        const beforeSnapshot = readPlaygroundFineTuningPlainObject(normalizedJob.beforeAgentSnapshot);
        const afterSnapshot = readPlaygroundFineTuningPlainObject(normalizedJob.afterAgentSnapshot);
        if (!hasPlaygroundFineTuningObjectContent(beforeSnapshot) && !hasPlaygroundFineTuningObjectContent(afterSnapshot)) return false;
        if (String(beforeSnapshot.instructions || "") !== String(afterSnapshot.instructions || "")) return true;
        return JSON.stringify({
          model: beforeSnapshot.model || "",
          enabledSkills: beforeSnapshot.enabledSkills || [],
          guardrails: beforeSnapshot.guardrails || [],
          guardrailSetIds: beforeSnapshot.guardrailSetIds || [],
          promptAdaptations: beforeSnapshot.promptAdaptations || [],
          invisiblePromptAdaptations: beforeSnapshot.invisiblePromptAdaptations || [],
        }) !== JSON.stringify({
          model: afterSnapshot.model || "",
          enabledSkills: afterSnapshot.enabledSkills || [],
          guardrails: afterSnapshot.guardrails || [],
          guardrailSetIds: afterSnapshot.guardrailSetIds || [],
          promptAdaptations: afterSnapshot.promptAdaptations || [],
          invisiblePromptAdaptations: afterSnapshot.invisiblePromptAdaptations || [],
        });
      }

      function needsPlaygroundFineTuningRuntimeDetailsHydration(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        if (!normalizedJob.id) return false;
        const status = normalizePlaygroundFineTuningString(normalizedJob.status).toLowerCase();
        const phase = normalizePlaygroundFineTuningString(normalizedJob.phase).toLowerCase();
        if (phase === "planned" || status === "planned") return false;
        if (!isPlaygroundFineTuningTerminalStatus(phase || status)) return true;
        if (!normalizedJob.threadId) return true;
        if (!normalizedJob.analysisSummary || normalizePlaygroundFineTuningString(normalizedJob.analysisSummary) === "Fine-tuning analysis is running.") return true;
        if (!hasPlaygroundFineTuningChangeArtifacts(normalizedJob)) return true;
        return !Array.isArray(normalizedJob.evaluationRuns) || normalizedJob.evaluationRuns.length === 0;
      }

      function buildPlaygroundFineTuningJobReferencePayload(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        const version = readPlaygroundFineTuningPlainObject(normalizedJob.createdAgentVersion);
        const versionMetadata = compactPlaygroundFineTuningReferenceMetadata(version.metadata);
        const metadata = compactPlaygroundFineTuningReferenceMetadata(normalizedJob.metadata);
          return {
            id: normalizedJob.id,
            schemaVersion: normalizedJob.schemaVersion,
            kind: normalizedJob.kind,
            name: normalizedJob.name,
            status: normalizedJob.status,
            phase: normalizedJob.phase,
            stopReason: normalizedJob.stopReason,
            targetMet: normalizedJob.targetMet,
          createdAt: normalizedJob.createdAt,
          updatedAt: normalizedJob.updatedAt,
          agentId: normalizedJob.agentId,
          targetAgentId: normalizedJob.targetAgentId,
          agentName: normalizedJob.agentName,
          targetAgentName: normalizedJob.targetAgentName,
          agentPhotoUrl: normalizedJob.agentPhotoUrl,
          targetAgentPhotoUrl: normalizedJob.targetAgentPhotoUrl,
          conductedBy: normalizedJob.conductedBy,
          createdBy: normalizedJob.createdBy,
          fineTunerAgentId: normalizedJob.fineTunerAgentId,
          fineTunerAgentName: normalizedJob.fineTunerAgentName,
          fineTunerAgentPhotoUrl: normalizedJob.fineTunerAgentPhotoUrl,
          environmentId: normalizedJob.environmentId,
          environmentName: normalizedJob.environmentName,
            evaluationSets: normalizedJob.evaluationSets,
            evaluationSetIds: normalizedJob.evaluationSets.map((set) => set.id).filter(Boolean),
            configuration: normalizedJob.configuration,
            iterations: normalizedJob.iterations,
            currentIteration: normalizedJob.currentIteration,
            bestIterationId: normalizedJob.bestIterationId,
            events: normalizedJob.events,
            costLedger: normalizedJob.costLedger,
            execution: normalizedJob.execution,
          description: truncatePlaygroundFineTuningReferenceText(normalizedJob.description, 4000),
          instructions: truncatePlaygroundFineTuningReferenceText(normalizedJob.instructions, 4000),
          verifyAfter: true,
          threadId: normalizedJob.threadId,
          threadTitle: normalizedJob.threadTitle,
          beforeScore: normalizedJob.beforeScore,
          afterScore: normalizedJob.afterScore,
          improvementScore: normalizedJob.improvementScore,
          costTokens: normalizedJob.costTokens,
          costUsd: normalizedJob.costUsd,
          fineTuningCostUsd: normalizedJob.fineTuningCostUsd,
          verificationCostUsd: normalizedJob.verificationCostUsd,
          analysisSummary: truncatePlaygroundFineTuningReferenceText(normalizedJob.analysisSummary, 2400),
          evaluationRuns: normalizedJob.evaluationRuns,
          createdAgentVersion: version.id ? {
            id: normalizePlaygroundFineTuningString(version.id || version.versionId || version.version_id),
            version: version.version,
            versionNumber: version.versionNumber || version.version_number,
            label: version.label,
            status: version.status,
            createdAt: version.createdAt || version.created_at,
            updatedAt: version.updatedAt || version.updated_at,
            publishedAt: version.publishedAt || version.published_at,
            metadata: {
              ...versionMetadata,
              fineTuningJobId: normalizedJob.id,
              fine_tuning_job_id: normalizedJob.id,
              threadId: normalizedJob.threadId || versionMetadata.threadId || versionMetadata.thread_id,
              thread_id: normalizedJob.threadId || versionMetadata.thread_id || versionMetadata.threadId,
              fineTuningThreadId: normalizedJob.threadId || versionMetadata.fineTuningThreadId || versionMetadata.fine_tuning_thread_id,
              fine_tuning_thread_id: normalizedJob.threadId || versionMetadata.fine_tuning_thread_id || versionMetadata.fineTuningThreadId,
            },
          } : normalizedJob.createdAgentVersion,
          createdAgentVersionId: normalizedJob.createdAgentVersionId,
          agentVersionCreationStatus: normalizedJob.agentVersionCreationStatus,
          agentVersionError: normalizedJob.agentVersionError,
          metadata: {
            ...metadata,
            fineTuningJobId: normalizedJob.id,
            fine_tuning_job_id: normalizedJob.id,
          },
          error: normalizedJob.error,
        };
      }

      function readPlaygroundFineTuningJobListFromPayload(payload) {
        const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        const candidates = [
          source.jobs,
          source.fineTuningJobs,
          source.fine_tuning_jobs,
          source.data?.jobs,
          source.data?.fineTuningJobs,
          source.data?.fine_tuning_jobs,
          source.items,
          source.data,
          source.records,
          payload,
        ];
        for (const candidate of candidates) {
          if (Array.isArray(candidate)) {
            return candidate.map((job, index) => normalizePlaygroundFineTuningJob(job, index));
          }
        }
        return [];
      }

`;
