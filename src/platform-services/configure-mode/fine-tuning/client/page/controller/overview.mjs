export const FINE_TUNING_PAGE_CONTROLLER_OVERVIEW_SCRIPT = String.raw`        function renderOverview() {
          const fineTuningOverviewRows = scoredJobs
            .map((job) => {
              const normalizedJob = normalizePlaygroundFineTuningJob(job);
              const id = normalizePlaygroundFineTuningString(normalizedJob.id);
              const name = normalizePlaygroundFineTuningString(normalizedJob.name) || "Untitled Optimization";
              const agent = normalizedAgents.find((item) => (
                normalizePlaygroundFineTuningString(item?.id)
                === normalizePlaygroundFineTuningString(normalizedJob.targetAgentId || normalizedJob.agentId)
              )) || null;
              const agentLabel = normalizePlaygroundFineTuningString(
                normalizedJob.agentName
                || normalizedJob.targetAgentName
                || agent?.name
                || agent?.label
                || agent?.title
                || "Agent"
              );
              const agentAvatarUrl = normalizePlaygroundFineTuningString(
                normalizedJob.agentPhotoUrl
                || normalizedJob.targetAgentPhotoUrl
                || agent?.photoUrl
                || agent?.photoURL
                || agent?.avatarUrl
                || agent?.avatarURL
              );
              const explicitConductor = normalizePlaygroundFineTuningPersonIdentity(
                normalizedJob.conductedBy || normalizedJob.createdBy || normalizedJob.created_by || {}
              );
              const conductor = getPlaygroundFineTuningPersonLabel(explicitConductor)
                ? explicitConductor
                : currentFineTuningUser;
              const conductorLabel = getPlaygroundFineTuningPersonLabel(conductor) || "Unknown";
              const status = normalizePlaygroundFineTuningString(normalizedJob.status || "completed").toLowerCase();
              const isPlanned = status === "planned";
              const hasAfter = hasPlaygroundFineTuningAfterResult(normalizedJob);
              const isError = new Set(["error", "failed", "cancelled", "canceled"]).has(status);
              const isActive = isPlaygroundFineTuningActiveStatus(status);
              const afterLabel = hasAfter
                ? formatPlaygroundFineTuningPercent(normalizedJob.afterScore)
                : isPlanned
                  ? "Planned"
                  : isError
                    ? "Error"
                    : isActive
                      ? "Running"
                      : "Pending";
              const improvementLabel = [
                formatPlaygroundFineTuningPercent(normalizedJob.beforeScore),
                "->",
                afterLabel,
                hasAfter && !isError ? "+" + Math.round(normalizedJob.improvementScore * 100) : "",
              ].filter(Boolean).join(" ");
              const evaluationSetCount = Array.isArray(normalizedJob.evaluationSets)
                ? normalizedJob.evaluationSets.length
                : 0;
              return {
                id,
                name,
                agentLabel,
                agentAvatarUrl,
                agentFallback: getPlaygroundFineTuningInitials(agentLabel),
                evaluationSetCount,
                improvementScore: Number(normalizedJob.improvementScore || 0) || 0,
                improvementLabel,
                conductorLabel,
                conductorAvatarUrl: conductor.avatarUrl || "",
                conductorFallback: getPlaygroundFineTuningInitials(conductorLabel),
                status,
                searchText: [
                  name,
                  agentLabel,
                  conductorLabel,
                  status,
                  (Array.isArray(normalizedJob.evaluationSets) ? normalizedJob.evaluationSets : [])
                    .map((set) => set?.name)
                    .filter(Boolean)
                    .join(" "),
                  id,
                ].filter(Boolean).join(" "),
              };
            })
            .filter((job) => job.id);

          return React.createElement(FineTuningOverviewPage, {
            rows: fineTuningOverviewRows,
            loading: fineTuningJobsLoading && fineTuningOverviewRows.length === 0,
            controlsPortalId: "playground-fine-tuning-overview-controls",
            onOpen: (job) => openJob(job.id),
            onCreate: openCreateModal,
            onDelete: (job) => deleteJob(job.id),
          });
        }

`;
