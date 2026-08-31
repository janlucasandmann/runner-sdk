export const FINE_TUNING_PAGE_CONTROLLER_OVERVIEW_SCRIPT = String.raw`        function renderOverview() {
          const normalizedFineTuningOverviewScope = fineTuningOverviewScope === "created"
            ? "created"
            : fineTuningOverviewScope === "shared"
              ? "shared"
              : "all";
          const currentFineTuningUserKeys = new Set(getFineTuningIdentityKeys(currentFineTuningUser));
          const currentFineTuningUserName = normalizePlaygroundFineTuningString(currentFineTuningUser?.name).toLowerCase();
          const isFineTuningJobCreatedByCurrentUser = (job) => {
            const creator = getPlaygroundFineTuningConductorIdentity(job);
            const creatorKeys = getFineTuningIdentityKeys(creator);
            if (creatorKeys.some((key) => currentFineTuningUserKeys.has(key))) return true;
            if (creatorKeys.length) return false;
            const creatorName = normalizePlaygroundFineTuningString(creator?.name).toLowerCase();
            if (!creatorName || ["unknown", "you", "me", "current user"].includes(creatorName)) return true;
            return Boolean(currentFineTuningUserName && creatorName === currentFineTuningUserName);
          };
          const scopedFineTuningJobs = normalizedFineTuningOverviewScope === "all"
            ? scoredJobs
            : scoredJobs.filter((job) => {
                const createdByCurrentUser = isFineTuningJobCreatedByCurrentUser(job);
                return normalizedFineTuningOverviewScope === "created"
                  ? createdByCurrentUser
                  : !createdByCurrentUser;
              });
          const fineTuningOverviewRows = scopedFineTuningJobs
            .map((job) => {
              const normalizedJob = normalizePlaygroundFineTuningJob(job);
              const id = normalizePlaygroundFineTuningString(normalizedJob.id);
              const name = normalizePlaygroundFineTuningString(normalizedJob.name) || "Untitled Optimization";
              const description = normalizePlaygroundFineTuningString(normalizedJob.description);
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
              const resolvedConductor = resolvePlaygroundFineTuningConductorIdentity(
                normalizedJob,
                [currentFineTuningUser, ...normalizedAgents]
              );
              const conductor = getPlaygroundFineTuningPersonLabel(resolvedConductor)
                ? resolvedConductor
                : currentFineTuningUser;
              const creatorName = getPlaygroundFineTuningPersonLabel(conductor) || "Unknown";
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
                description,
                agentLabel,
                agentAvatarUrl,
                agentFallback: getPlaygroundFineTuningInitials(agentLabel),
                evaluationSetCount,
                improvementScore: Number(normalizedJob.improvementScore || 0) || 0,
                improvementLabel,
                creatorName,
                creatorAvatarUrl: conductor.avatarUrl || "",
                creatorFallback: getPlaygroundFineTuningInitials(creatorName),
                updatedAt: Date.parse(normalizedJob.updatedAt || normalizedJob.createdAt || "") || 0,
                status,
                searchText: [
                  name,
                  agentLabel,
                  creatorName,
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
            onDelete: (jobs) => deleteJobs(
              (Array.isArray(jobs) ? jobs : []).map((job) => job?.id)
            ),
          });
        }

`;
