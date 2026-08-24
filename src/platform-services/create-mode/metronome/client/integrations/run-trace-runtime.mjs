export const METRONOME_SHELL_RUNTIME_SCRIPT = `
      function getThreadMetronomeMetadata(thread) {
        const safeThread = normalizeThreadItem(thread || {});
        const metadata = safeThread?.metadata && typeof safeThread.metadata === "object" && !Array.isArray(safeThread.metadata)
          ? safeThread.metadata
          : {};
        const metronome = metadata?.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
          ? metadata.metronome
          : {};
        const workflow = metadata?.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
          ? metadata.metronomeWorkflow
          : {};
        const metronomeId = String(
          metronome.metronomeId
          || metronome.workflowId
          || metronome.id
          || workflow.metronomeId
          || workflow.workflowId
          || workflow.id
          || ""
        ).trim();
        const runId = String(
          metronome.runId
          || metronome.workflowRunId
          || workflow.runId
          || workflow.workflowRunId
          || ""
        ).trim();
        if (!metronomeId || !runId) {
          return null;
        }
        const title = String(safeThread.title || "").trim();
        const titleParts = title.match(/^([^:]{1,120}):\\s*(.+)$/);
        const workflowName = String(
          metronome.metronomeName
          || metronome.workflowName
          || metronome.name
          || workflow.metronomeName
          || workflow.workflowName
          || workflow.name
          || (titleParts ? titleParts[1] : "")
          || "Metronome"
        ).trim();
        const nodeName = String(
          metronome.nodeName
          || metronome.nodeLabel
          || metronome.nodeTitle
          || workflow.nodeName
          || workflow.nodeLabel
          || workflow.nodeTitle
          || (titleParts ? titleParts[2] : "")
          || title
          || "Thread"
        ).trim();
        return {
          metronomeId,
          runId,
          nodeId: String(metronome.nodeId || workflow.nodeId || "").trim(),
          status: String(metronome.status || workflow.status || safeThread.status || "").trim(),
          workflowName,
          nodeName,
        };
      }

      function isMetronomeOriginTriggerThread(thread) {
        const normalizedThread = normalizeThreadItem(thread || {});
        const normalizedThreadId = String(normalizedThread?.id || "").trim();
        const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
          ? thread.metadata
          : normalizedThread?.metadata && typeof normalizedThread.metadata === "object" && !Array.isArray(normalizedThread.metadata)
            ? normalizedThread.metadata
            : {};
        const metronome = metadata.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
          ? metadata.metronome
          : {};
        const workflow = metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
          ? metadata.metronomeWorkflow
          : {};
        const meta = getThreadMetronomeMetadata(normalizedThread);
        const groupKey = getSidebarMetronomeRunGroupKey(meta);
        if (!normalizedThreadId || !groupKey) {
          return false;
        }
        const nodeId = String(meta?.nodeId || workflow.nodeId || metronome.nodeId || "").trim();
        if (nodeId) {
          return false;
        }
        if (workflow.isOriginThread === false || workflow.is_origin_thread === false) {
          return false;
        }
        const originThreadIds = [
          workflow.originThreadId,
          workflow.sourceThreadId,
          workflow.triggerThreadId,
        ].map((value) => String(value || "").trim()).filter(Boolean);
        const hasMatchingOriginThreadId = originThreadIds.includes(normalizedThreadId);
        if (originThreadIds.length > 0 && !hasMatchingOriginThreadId) {
          return false;
        }
        const definitionSource = String(workflow.definitionSource || workflow.source || "").trim().toLowerCase();
        return Boolean(
          workflow.isOriginThread === true
          || workflow.is_origin_thread === true
          || hasMatchingOriginThreadId
          || String(workflow.triggerCommand || "").trim()
          || String(workflow.triggerEventId || "").trim()
          || definitionSource === "thread"
          || definitionSource === "thread_event"
        );
      }

      function findMetronomeRunOriginThread(value, availableThreads = []) {
        const entry = value && typeof value === "object" && !Array.isArray(value) ? value : {};
        const targetKey = String(
          entry.key
          || getSidebarMetronomeRunGroupKey({
            metronomeId: entry.metronomeId || entry.workflowId,
            runId: entry.runId || entry.workflowRunId,
          })
          || ""
        ).trim();
        const candidates = [
          entry.originThread,
          entry.latestThread,
          ...(Array.isArray(entry.threads) ? entry.threads : []),
          ...(Array.isArray(availableThreads) ? availableThreads : []),
        ];
        const seenThreadIds = new Set();
        for (const candidate of candidates) {
          const candidateId = String(candidate?.id || "").trim();
          if (!candidateId || seenThreadIds.has(candidateId)) continue;
          seenThreadIds.add(candidateId);
          const candidateKey = getSidebarMetronomeRunGroupKey(getThreadMetronomeMetadata(candidate));
          if (targetKey && candidateKey !== targetKey) continue;
          if (isMetronomeOriginTriggerThread(candidate)) {
            return normalizeThreadItem(candidate);
          }
        }
        return null;
      }

      function getMetronomeTaskLoopPresentation(value, options = {}) {
        const entry = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const run = entry.run && typeof entry.run === "object" && !Array.isArray(entry.run)
          ? entry.run
          : {};
        const input = entry.input && typeof entry.input === "object" && !Array.isArray(entry.input)
          ? entry.input
          : run.input && typeof run.input === "object" && !Array.isArray(run.input)
            ? run.input
            : {};
        const systemWorkflow = input.systemWorkflow
          && typeof input.systemWorkflow === "object"
          && !Array.isArray(input.systemWorkflow)
            ? input.systemWorkflow
            : {};
        const workflowName = String(
          entry.workflowName
          || entry.metronomeName
          || run.workflowName
          || run.metronomeName
          || ""
        ).trim();
        const source = String(input.source || entry.source || "").trim().toLowerCase();
        const systemWorkflowKey = String(
          systemWorkflow.key
          || input.systemWorkflowKey
          || input.system_workflow_key
          || ""
        ).trim().toLowerCase();
        const originThreadId = String(input.originThreadId || input.threadId || "").trim();
        const availableThreads = Array.isArray(options.threads) ? options.threads : [];
        const originThread = findMetronomeRunOriginThread(entry, availableThreads);
        const entryThreads = [
          originThread,
          entry.latestThread,
          ...(Array.isArray(entry.threads) ? entry.threads : []),
        ].filter(Boolean);
        if (originThreadId) {
          const referencedOriginThread = availableThreads.find((thread) => (
            String(thread?.id || "").trim() === originThreadId
          ));
          if (referencedOriginThread && !entryThreads.some((thread) => thread === referencedOriginThread)) {
            entryThreads.unshift(referencedOriginThread);
          }
        }
        const hasLoopThreadContext = entryThreads.some((thread) => {
          const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
            ? thread.metadata
            : {};
          const taskContext = metadata.taskContext && typeof metadata.taskContext === "object" && !Array.isArray(metadata.taskContext)
            ? metadata.taskContext
            : {};
          const taskPreview = typeof getThreadTaskPreview === "function"
            ? getThreadTaskPreview(thread)
            : null;
          return String(taskContext.taskType || taskPreview?.taskType || taskPreview?.type || "").trim().toLowerCase() === "loop"
            || Boolean(String(taskContext.loopRole || "").trim());
        });
        const hasMissionControlThreadContext = entryThreads.some((thread) => {
          const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
            ? thread.metadata
            : {};
          const workflowMetadata = metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
            ? metadata.metronomeWorkflow
            : {};
          const threadSystemWorkflow = metadata.systemWorkflow && typeof metadata.systemWorkflow === "object" && !Array.isArray(metadata.systemWorkflow)
            ? metadata.systemWorkflow
            : {};
          const runnerMetadata = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : {};
          const missionControl = runnerMetadata.missionControl && typeof runnerMetadata.missionControl === "object" && !Array.isArray(runnerMetadata.missionControl)
            ? runnerMetadata.missionControl
            : {};
          const threadWorkflowKey = String(
            threadSystemWorkflow.key
            || workflowMetadata.systemWorkflowKey
            || workflowMetadata.system_workflow_key
            || ""
          ).trim().toLowerCase();
          const missionControlSource = String(missionControl.source || "").trim().toLowerCase();
          return threadWorkflowKey === "system.mission-control"
            || [
              "project_backlog_mission_control",
              "project_mission_control",
              "project_mission_control_workflow",
            ].includes(missionControlSource);
        });
        const triggerCommand = String(input.triggerCommand || input.command || "").trim().toLowerCase();
        const isTaskLoop = systemWorkflowKey === "system.task-loop"
          || source === "project_ticket_loop"
          || source === "thread_command_loop"
          || triggerCommand === "/loop"
          || hasLoopThreadContext
          || (workflowName.toLowerCase() === "loop" && Boolean(input.ticketId || originThreadId));
        const isMissionControl = systemWorkflowKey === "system.mission-control"
          || source === "project_mission_control"
          || source === "project_mission_control_workflow"
          || hasMissionControlThreadContext
          || workflowName.toLowerCase() === "mission control";
        if (isMissionControl) {
          let projectId = String(
            input.projectId
            || entry.attachedProjectId
            || run.attachedProjectId
            || ""
          ).trim();
          const projects = Array.isArray(options.projects) ? options.projects : [];
          const projectRecord = projects.find((project) => (
            String(project?.id || "").trim() === projectId
          )) || null;
          let projectName = String(input.projectName || projectRecord?.name || "").trim();
          if (!projectId || !projectName) {
            for (const thread of entryThreads) {
              const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
                ? thread.metadata
                : {};
              const runnerMetadata = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
                ? metadata.runnerPlayground
                : {};
              const missionControl = runnerMetadata.missionControl && typeof runnerMetadata.missionControl === "object" && !Array.isArray(runnerMetadata.missionControl)
                ? runnerMetadata.missionControl
                : {};
              projectId = projectId || String(missionControl.projectId || missionControl.project_id || "").trim();
              projectName = projectName || String(missionControl.projectName || "").trim();
              if (projectId && projectName) break;
            }
          }
          return {
            isTaskLoop: false,
            isMissionControl: true,
            ticketId: "",
            projectId,
            projectName,
            ticketNumber: "",
            label: projectName ? "Mission Control for " + projectName : "Mission Control",
          };
        }
        if (!isTaskLoop) {
          return {
            isTaskLoop: false,
            isMissionControl: false,
            ticketId: "",
            projectId: "",
            ticketNumber: "",
            label: workflowName || "Metronome",
          };
        }

        const ticketId = String(
          input.ticketId
          || input.taskId
          || entry.attachedTicketId
          || run.attachedTicketId
          || ""
        ).trim();
        let projectId = String(
          input.projectId
          || entry.attachedProjectId
          || run.attachedProjectId
          || ""
        ).trim();
        let taskPreview = null;
        let ticketNumber = String(
          input.ticketNumber
          || input.taskTicketNumber
          || input.task_ticket_number
          || entry.ticketNumber
          || run.ticketNumber
          || ""
        ).trim();
        for (const thread of entryThreads) {
          const candidatePreview = typeof getThreadTaskPreview === "function"
            ? getThreadTaskPreview(thread)
            : null;
          if (!taskPreview && candidatePreview) taskPreview = candidatePreview;
          if (!ticketNumber) {
            const titleTicketMatch = String(thread?.title || "").trim().match(/^([A-Za-z]{1,10}-\\d{1,6})\\s+/);
            ticketNumber = String(titleTicketMatch?.[1] || "").trim();
          }
          if (!ticketNumber && typeof getSidebarThreadTitleParts === "function") {
            ticketNumber = String(getSidebarThreadTitleParts(thread)?.taskTicketNumber || "").trim();
          }
          if (ticketNumber) break;
        }
        if (!ticketNumber) {
          ticketNumber = String(taskPreview?.ticketNumber || taskPreview?.metadata?.ticketNumber || "").trim();
        }
        if (!projectId) {
          projectId = String(taskPreview?.projectId || "").trim();
        }

        const projects = Array.isArray(options.projects) ? options.projects : [];
        const projectRecord = projects.find((project) => (
          String(project?.id || "").trim() === projectId
        )) || (input.projectName || taskPreview?.projectName
          ? { id: projectId, name: String(input.projectName || taskPreview?.projectName || "").trim() }
          : null);
        const alreadyFormattedTicketNumber = /^[A-Za-z]{1,10}-\\d{1,6}$/.test(ticketNumber);
        if (
          ticketNumber
          && !alreadyFormattedTicketNumber
          && projectRecord
          && typeof formatPlaygroundProjectTicketNumber === "function"
        ) {
          ticketNumber = formatPlaygroundProjectTicketNumber(projectRecord, ticketNumber) || ticketNumber;
        }

        return {
          isTaskLoop: true,
          isMissionControl: false,
          ticketId,
          projectId,
          ticketNumber,
          label: ticketNumber || "Loop",
        };
      }

      function getSidebarMetronomeRunGroupKey(meta) {
        if (!meta?.metronomeId || !meta?.runId) {
          return "";
        }
        return meta.metronomeId + ":" + meta.runId;
      }

      function isActiveMetronomeRunStatus(status) {
        const normalizedStatus = String(status || "").trim().toLowerCase();
        return ["queued", "pending", "starting", "running", "created", "ready"].includes(normalizedStatus);
      }

      function mapMetronomeRunStatusToThreadDisplayStatus(status) {
        const normalizedStatus = String(status || "").trim().toLowerCase();
        if (["queued", "pending", "starting", "running", "created", "ready", "paused"].includes(normalizedStatus)) {
          return "running";
        }
        if (normalizedStatus === "waiting_approval") {
          return "permission_asked";
        }
        if (["completed", "failed", "cancelled"].includes(normalizedStatus)) {
          return normalizedStatus;
        }
        return "";
      }

      function isGenericMetronomeRunPromptText(value) {
        const normalized = String(value || "").replace(/\\s+/g, " ").trim().toLowerCase();
        return !normalized
          || normalized === "manual workflow run"
          || normalized === "manual trigger received.";
      }

      function readMetronomeRunPromptCandidate(value) {
        if (value === null || typeof value === "undefined") return "";
        if (typeof value === "string") {
          const trimmed = value.trim();
          return isGenericMetronomeRunPromptText(trimmed) ? "" : trimmed;
        }
        if (typeof value !== "object") {
          const trimmed = String(value || "").trim();
          return isGenericMetronomeRunPromptText(trimmed) ? "" : trimmed;
        }
        const preferredKeys = [
          "userMessage",
          "user_message",
          "displayMessage",
          "display_message",
          "triggerMessage",
          "trigger_message",
          "message",
          "prompt",
          "body",
          "text",
          "content",
        ];
        for (const key of preferredKeys) {
          const candidate = readMetronomeRunPromptCandidate(value[key]);
          if (candidate) return candidate;
        }
        for (const key of ["thread", "trigger", "event", "input", "inputs", "payload", "email"]) {
          const nested = value[key];
          if (nested && typeof nested === "object") {
            const candidate = readMetronomeRunPromptCandidate(nested);
            if (candidate) return candidate;
          }
        }
        return "";
      }

      function extractMetronomeReadableOutputText(value) {
        if (value === null || typeof value === "undefined") return "";
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (!trimmed) return "";
          try {
            return extractMetronomeReadableOutputText(JSON.parse(trimmed));
          } catch {
            return trimmed;
          }
        }
        if (typeof value !== "object") {
          return String(value || "").trim();
        }
        if (Array.isArray(value)) {
          return value
            .map((item) => extractMetronomeReadableOutputText(item))
            .filter(Boolean)
            .join("\\n\\n");
        }
        const preferredKeys = [
          "output_text",
          "outputText",
          "markdown",
          "text",
          "message",
          "summary",
          "content",
          "response",
        ];
        for (const key of preferredKeys) {
          const extracted = extractMetronomeReadableOutputText(value[key]);
          if (extracted) return extracted;
        }
        for (const key of ["result", "output", "data"]) {
          const nested = value[key];
          if (nested && typeof nested === "object" && !Array.isArray(nested)) {
            const extracted = extractMetronomeReadableOutputText(nested);
            if (extracted) return extracted;
          }
        }
        return "";
      }

      function normalizeMetronomeRunMarkdownText(value) {
        return String(value || "")
          .replace(/\\\\r\\\\n/g, "\\n")
          .replace(/\\\\n/g, "\\n")
          .replace(/\\\\r/g, "\\n")
          .replace(new RegExp("\\\\\\\\([*_\\\\x60\\\\[\\\\]\\\\(\\\\)#+\\\\-.!>])", "g"), "$1")
          .trim();
      }

      function formatMetronomeRunValue(value) {
        if (value === null || typeof value === "undefined") return "";
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (!trimmed) return "";
          try {
            return JSON.stringify(JSON.parse(trimmed), null, 2);
          } catch {
            return trimmed;
          }
        }
        try {
          return JSON.stringify(value, null, 2);
        } catch {
          return String(value || "");
        }
      }

      function getMetronomeRunPrompt(run) {
        const output = run?.output && typeof run.output === "object" ? run.output : {};
        const steps = Array.isArray(output.steps) ? output.steps : [];
        const candidates = [
          run?.prompt,
          run?.displayPrompt,
          run?.displayMessage,
          run?.userMessage,
          run?.message,
          run?.input,
          run?.inputs,
          output?.trigger,
          output?.input,
          output?.inputs,
          output?.prompt,
          output?.message,
        ];
        const triggerStep = steps.find((step) => String(step?.kind || "").toLowerCase() === "trigger") || steps[0] || null;
        if (triggerStep) {
          candidates.push(triggerStep.input, triggerStep.inputs, triggerStep.output, triggerStep.summary);
        }
        for (const candidate of candidates) {
          const prompt = readMetronomeRunPromptCandidate(candidate);
          if (prompt) return prompt;
        }
        return "Manual workflow run";
      }

      function isGenericMetronomeRunSummaryText(value) {
        const normalized = String(value || "")
          .replace(/[\u200B-\u200D\uFEFF]/g, "")
          .replace(/\\r\\n/g, "\\n")
          .replace(/\\n/g, "\\n")
          .replace(/\\s+/g, " ")
          .trim()
          .toLowerCase();
        const canonical = normalized
          .replace(/^(result|summary|message|status)\\s*:\\s*/i, "")
          .replace(/[^a-z0-9]+/g, "");
        return !normalized
          || normalized === "metronome run started."
          || normalized === "metronome run started"
          || normalized === "metronome run queued."
          || normalized === "metronome run queued"
          || normalized === "metronome run completed."
          || normalized === "metronome run completed"
          || normalized === "workflow reached the end node."
          || normalized === "workflow reached the end node"
          || canonical === "metronomerunstarted"
          || canonical === "metronomerunqueued"
          || canonical === "metronomeruncompleted"
          || canonical === "workflowreachedtheendnode";
      }

      function getMetronomeRunTraceRecord(value) {
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
      }

      function getFirstMetronomeRunTraceRecord(...values) {
        for (const value of values) {
          const record = getMetronomeRunTraceRecord(value);
          if (Object.keys(record).length) return record;
        }
        return {};
      }

      function getMetronomeRunTraceStepKind(step) {
        const safeStep = getMetronomeRunTraceRecord(step);
        return String(
          safeStep.kind
          || safeStep.nodeType
          || safeStep.node_type
          || safeStep.type
          || safeStep.subtype
          || safeStep.action
          || ""
        ).trim().toLowerCase();
      }

      function getMetronomeRunTraceStepOutputRecord(step) {
        const safeStep = getMetronomeRunTraceRecord(step);
        return getMetronomeRunTraceRecord(safeStep.output || safeStep.result || safeStep.data);
      }

      function getMetronomeRunTraceStepThreadId(step, thread) {
        const safeStep = getMetronomeRunTraceRecord(step);
        const stepOutput = getMetronomeRunTraceStepOutputRecord(safeStep);
        const outputThread = getMetronomeRunTraceRecord(stepOutput.thread || stepOutput.threadRecord || stepOutput.thread_record);
        return String(
          thread?.id
          || thread?.threadId
          || thread?.thread_id
          || safeStep.threadId
          || safeStep.thread_id
          || stepOutput.threadId
          || stepOutput.thread_id
          || outputThread.id
          || outputThread.threadId
          || outputThread.thread_id
          || ""
        ).trim();
      }

      function findMetronomeRunThreadForStep(step, threads) {
        if (!Array.isArray(threads)) return null;
        const safeStep = getMetronomeRunTraceRecord(step);
        const stepOutput = getMetronomeRunTraceStepOutputRecord(safeStep);
        const outputThread = getMetronomeRunTraceRecord(stepOutput.thread || stepOutput.threadRecord || stepOutput.thread_record);
        const threadIdCandidates = [
          safeStep.threadId,
          safeStep.thread_id,
          stepOutput.threadId,
          stepOutput.thread_id,
          outputThread.id,
          outputThread.threadId,
          outputThread.thread_id,
        ].map((value) => String(value || "").trim()).filter(Boolean);
        if (threadIdCandidates.length) {
          const matchedByThreadId = threads.find((thread) => {
            const candidateId = String(thread?.id || thread?.threadId || thread?.thread_id || "").trim();
            return candidateId && threadIdCandidates.includes(candidateId);
          });
          if (matchedByThreadId) return matchedByThreadId;
        }

        const nodeIdCandidates = [
          safeStep.nodeId,
          safeStep.node_id,
          stepOutput.nodeId,
          stepOutput.node_id,
          outputThread.nodeId,
          outputThread.node_id,
        ].map((value) => String(value || "").trim()).filter(Boolean);
        if (!nodeIdCandidates.length) return null;
        return threads.find((thread) => {
          const candidateNodeId = String(thread?.nodeId || thread?.node_id || "").trim();
          return candidateNodeId && nodeIdCandidates.includes(candidateNodeId);
        }) || null;
      }

      function isMetronomeRunTraceThreadStep(step, thread) {
        const safeStep = getMetronomeRunTraceRecord(step);
        const kind = getMetronomeRunTraceStepKind(safeStep);
        const subtype = String(safeStep.subtype || safeStep.type || safeStep.nodeSubtype || safeStep.node_subtype || "").trim().toLowerCase();
        const stepOutput = getMetronomeRunTraceStepOutputRecord(safeStep);
        const outputThread = getMetronomeRunTraceRecord(stepOutput.thread || stepOutput.threadRecord || stepOutput.thread_record);
        if (thread || getMetronomeRunTraceStepThreadId(safeStep, outputThread)) return true;
        return [
          "thread",
          "action",
          "start_thread",
          "agent",
          "agent_thread",
        ].includes(kind) || [
          "thread",
          "start_thread",
          "agent_thread",
        ].includes(subtype);
      }

      function getMetronomeRunTraceThreadRuntimeMeta(step, thread, context = {}) {
        const threadId = getMetronomeRunTraceStepThreadId(step, thread);
        const knownThreads = Array.isArray(context?.threads) ? context.threads : [];
        const agents = Array.isArray(context?.agents) ? context.agents : [];
        const environments = Array.isArray(context?.environments) ? context.environments : [];
        const knownThread = threadId
          ? knownThreads.find((item) => String(item?.id || "").trim() === threadId) || null
          : null;
        const safeThread = getMetronomeRunTraceRecord(thread);
        const safeStep = getMetronomeRunTraceRecord(step);
        const stepConfig = getMetronomeRunTraceRecord(safeStep.config);
        const stepInput = getMetronomeRunTraceRecord(safeStep.input);
        const stepOutput = getMetronomeRunTraceStepOutputRecord(safeStep);
        const stepResult = getMetronomeRunTraceRecord(safeStep.result);
        const stepData = getMetronomeRunTraceRecord(safeStep.data);
        const outputThread = getMetronomeRunTraceRecord(stepOutput.thread || stepOutput.threadRecord || stepOutput.thread_record);
        const resultThread = getMetronomeRunTraceRecord(stepResult.thread || stepResult.threadRecord || stepResult.thread_record);
        const dataThread = getMetronomeRunTraceRecord(stepData.thread || stepData.threadRecord || stepData.thread_record);
        const threadMetadata = getMetronomeRunTraceRecord(safeThread.metadata);
        const knownThreadMetadata = getMetronomeRunTraceRecord(knownThread?.metadata);
        const runnerPlayground = knownThreadMetadata.runnerPlayground && typeof knownThreadMetadata.runnerPlayground === "object" && !Array.isArray(knownThreadMetadata.runnerPlayground)
          ? knownThreadMetadata.runnerPlayground
          : {};
        const taskPreview = runnerPlayground.taskPreview && typeof runnerPlayground.taskPreview === "object" && !Array.isArray(runnerPlayground.taskPreview)
          ? runnerPlayground.taskPreview
          : {};
        const agentRecord = getFirstMetronomeRunTraceRecord(
          safeThread.agent,
          safeStep.agent,
          stepOutput.agent,
          outputThread.agent,
          resultThread.agent,
          dataThread.agent
        );
        const computerRecord = getFirstMetronomeRunTraceRecord(
          safeThread.computer,
          safeThread.environment,
          safeStep.computer,
          safeStep.environment,
          stepOutput.computer,
          stepOutput.environment,
          outputThread.computer,
          outputThread.environment,
          resultThread.computer,
          resultThread.environment,
          dataThread.computer,
          dataThread.environment
        );

        const agentId = String(
          safeThread.agentId
          || safeThread.agent_id
          || safeStep.agentId
          || safeStep.agent_id
          || stepConfig.agentId
          || stepConfig.agent_id
          || stepInput.agentId
          || stepInput.agent_id
          || stepOutput.agentId
          || stepOutput.agent_id
          || outputThread.agentId
          || outputThread.agent_id
          || resultThread.agentId
          || resultThread.agent_id
          || dataThread.agentId
          || dataThread.agent_id
          || knownThread?.agentId
          || taskPreview.agentId
          || agentRecord.id
          || ""
        ).trim();
        const computerId = String(
          safeThread.environmentId
          || safeThread.environment_id
          || safeThread.computerId
          || safeThread.computer_id
          || safeStep.environmentId
          || safeStep.environment_id
          || safeStep.computerId
          || safeStep.computer_id
          || stepConfig.environmentId
          || stepConfig.environment_id
          || stepConfig.computerId
          || stepConfig.computer_id
          || stepInput.environmentId
          || stepInput.environment_id
          || stepInput.computerId
          || stepInput.computer_id
          || stepOutput.environmentId
          || stepOutput.environment_id
          || stepOutput.computerId
          || stepOutput.computer_id
          || outputThread.environmentId
          || outputThread.environment_id
          || outputThread.computerId
          || outputThread.computer_id
          || resultThread.environmentId
          || resultThread.environment_id
          || resultThread.computerId
          || resultThread.computer_id
          || dataThread.environmentId
          || dataThread.environment_id
          || dataThread.computerId
          || dataThread.computer_id
          || knownThread?.environmentId
          || taskPreview.environmentId
          || computerRecord.id
          || ""
        ).trim();

        const agentFromId = agentId
          ? agents.find((agent) => String(agent?.id || "").trim() === agentId) || null
          : null;
        const agentNameFromId = agentFromId?.name || "";
        const computerNameFromId = computerId
          ? environments.find((environment) => String(environment?.id || "").trim() === computerId)?.name || ""
          : "";
        const explicitAgentPhotoUrl = normalizeSessionPhotoUrl(
          safeThread.agentPhotoUrl
          || safeThread.agent_photo_url
          || safeThread.agentAvatarUrl
          || safeThread.agent_avatar_url
          || threadMetadata.agentPhotoUrl
          || threadMetadata.agent_photo_url
          || threadMetadata.agentAvatarUrl
          || threadMetadata.agent_avatar_url
          || safeStep.agentPhotoUrl
          || safeStep.agent_photo_url
          || stepConfig.agentPhotoUrl
          || stepConfig.agent_photo_url
          || stepInput.agentPhotoUrl
          || stepInput.agent_photo_url
          || stepOutput.agentPhotoUrl
          || stepOutput.agent_photo_url
          || outputThread.agentPhotoUrl
          || outputThread.agent_photo_url
          || resultThread.agentPhotoUrl
          || resultThread.agent_photo_url
          || dataThread.agentPhotoUrl
          || dataThread.agent_photo_url
          || knownThread?.agentPhotoUrl
          || knownThread?.agent_photo_url
          || taskPreview.agentPhotoUrl
          || taskPreview.agent_photo_url
          || agentRecord.photoUrl
          || agentRecord.photoURL
          || agentRecord.avatarUrl
          || agentRecord.avatarURL
          || agentRecord.avatar
          || agentRecord.picture
          || ""
        );
        const agentName = String(
          safeThread.agentName
          || safeThread.agent_name
          || threadMetadata.agentName
          || threadMetadata.agent_name
          || safeStep.agentName
          || safeStep.agent_name
          || stepConfig.agentName
          || stepConfig.agent_name
          || stepInput.agentName
          || stepInput.agent_name
          || stepOutput.agentName
          || stepOutput.agent_name
          || outputThread.agentName
          || outputThread.agent_name
          || resultThread.agentName
          || resultThread.agent_name
          || dataThread.agentName
          || dataThread.agent_name
          || knownThread?.agentName
          || taskPreview.agentName
          || agentRecord.name
          || agentRecord.label
          || agentNameFromId
          || ""
        ).trim();
        const explicitComputerName = String(
          safeThread.environmentName
          || safeThread.environment_name
          || safeThread.computerName
          || safeThread.computer_name
          || threadMetadata.environmentName
          || threadMetadata.environment_name
          || threadMetadata.computerName
          || threadMetadata.computer_name
          || safeStep.environmentName
          || safeStep.environment_name
          || safeStep.computerName
          || safeStep.computer_name
          || stepConfig.environmentName
          || stepConfig.environment_name
          || stepConfig.computerName
          || stepConfig.computer_name
          || stepInput.environmentName
          || stepInput.environment_name
          || stepInput.computerName
          || stepInput.computer_name
          || stepOutput.environmentName
          || stepOutput.environment_name
          || stepOutput.computerName
          || stepOutput.computer_name
          || outputThread.environmentName
          || outputThread.environment_name
          || outputThread.computerName
          || outputThread.computer_name
          || resultThread.environmentName
          || resultThread.environment_name
          || resultThread.computerName
          || resultThread.computer_name
          || dataThread.environmentName
          || dataThread.environment_name
          || dataThread.computerName
          || dataThread.computer_name
          || knownThread?.environmentName
          || taskPreview.environmentName
          || computerRecord.name
          || computerRecord.label
          || ""
        ).trim();
        const defaultComputerName = String(
          environments.find((environment) => environment?.isDefault)?.name || ""
        ).trim();
        const looksLikeComputerId = Boolean(
          explicitComputerName
          && (
            explicitComputerName === computerId
            || explicitComputerName.startsWith("env_")
            || explicitComputerName.startsWith("computer_")
          )
        );
        const computerName = computerNameFromId
          || (!looksLikeComputerId ? explicitComputerName : "")
          || defaultComputerName
          || explicitComputerName;

        return {
          agentId,
          computerId,
          agentName: agentName || (agentId ? "Agent" : ""),
          computerName: computerName || (computerId ? "Computer" : ""),
          agentPhotoUrl: explicitAgentPhotoUrl
            || (agentFromId ? getPlaygroundAgentRunnerPhotoUrl(agentFromId) : "")
            || (Object.keys(agentRecord).length ? getPlaygroundAgentRunnerPhotoUrl(agentRecord) : ""),
        };
      }

      function renderMetronomeRunTraceThreadRuntimeMeta(meta, options = {}) {
        const agentName = String(meta?.agentName || "").trim();
        const computerName = String(meta?.computerName || "").trim();
        const showSeparator = options?.showSeparator !== false;
        if (!agentName && !computerName) return null;
        return React.createElement("span", { className: "playground-metronome-run-thread-runtime-row" },
          showSeparator
            ? React.createElement("span", { className: "playground-metronome-run-thread-runtime-separator", "aria-hidden": "true" }, "·")
            : null,
          agentName
            ? React.createElement("span", { className: "playground-metronome-run-thread-runtime-agent" },
                React.createElement("span", { className: "playground-metronome-run-thread-runtime-agent-name" }, agentName)
              )
            : null,
          computerName
            ? React.createElement("span", { className: "playground-metronome-run-thread-runtime-computer" },
                (agentName ? " on " : "On ") + computerName
              )
            : null
        );
      }

      function renderMetronomeRunTraceThreadStepAvatar(meta) {
        const agentName = String(meta?.agentName || "").trim();
        const agentPhotoUrl = normalizeSessionPhotoUrl(meta?.agentPhotoUrl || "");
        if (agentPhotoUrl) {
          return React.createElement("img", {
            className: "playground-metronome-run-thread-step-avatar",
            src: agentPhotoUrl,
            alt: "",
          });
        }
        if (!agentName) return null;
        return React.createElement("span", {
          className: "playground-metronome-run-thread-step-avatar",
          "aria-hidden": "true",
        }, getAccountInitials(agentName));
      }

      function extractMetronomeThreadReadableOutputText(step, thread) {
        const candidates = [
          step?.output,
          step?.result,
          step?.data,
          thread?.output,
          thread?.result,
          thread?.data,
          thread?.summary,
          step?.summary,
        ];
        for (const candidate of candidates) {
          const text = extractMetronomeReadableOutputText(candidate);
          if (text) return text;
        }
        return "";
      }

      function normalizeMetronomeRunTraceComparableText(value) {
        return String(value || "")
          .replace(/\\r\\n/g, "\\n")
          .replace(/\\r/g, "\\n")
          .replace(/\\\\r\\\\n/g, "\\n")
          .replace(/\\\\r/g, "\\n")
          .replace(/\\\\n/g, "\\n")
          .replace(/\\s+/g, " ")
          .trim();
      }

      function getMetronomeRunSummaryText(run) {
        const output = run?.output && typeof run.output === "object" ? run.output : {};
        const steps = Array.isArray(output.steps) ? output.steps : [];
        const threads = Array.isArray(output.threads) ? output.threads : [];
        for (let index = threads.length - 1; index >= 0; index -= 1) {
          const thread = threads[index];
          const threadText = extractMetronomeReadableOutputText(thread?.summary)
            || extractMetronomeReadableOutputText(thread?.output)
            || extractMetronomeReadableOutputText(thread?.result)
            || extractMetronomeReadableOutputText(thread?.data);
          if (threadText && !isGenericMetronomeRunSummaryText(threadText)) {
            return threadText;
          }
        }
        for (let index = steps.length - 1; index >= 0; index -= 1) {
          const step = steps[index];
          const kind = String(step?.kind || "").toLowerCase();
          const subtype = String(step?.subtype || step?.type || "").toLowerCase();
          const isThreadStep = kind === "thread" || subtype === "thread" || subtype === "start_thread";
          if (!isThreadStep) continue;
          const thread = findMetronomeRunThreadForStep(step, threads);
          const threadText = extractMetronomeThreadReadableOutputText(step, thread);
          if (threadText && !isGenericMetronomeRunSummaryText(threadText)) {
            return threadText;
          }
        }
        const candidates = [
          output.runSummary,
          output.run_summary,
          output.summary,
          output.message,
          run?.summary,
          run?.result,
          run?.error,
        ];
        for (const candidate of candidates) {
          const text = extractMetronomeReadableOutputText(candidate);
          if (text && !isGenericMetronomeRunSummaryText(text)) return text;
        }
        const finalStep = steps[steps.length - 1] || null;
        const finalStepText = extractMetronomeReadableOutputText(finalStep?.output) || String(finalStep?.summary || "").trim();
        if (finalStepText && !isGenericMetronomeRunSummaryText(finalStepText)) return finalStepText;
        const completedStepCount = steps.length;
        const threadCount = threads.length;
        if (completedStepCount || threadCount) {
          return "Workflow completed with " + completedStepCount + " step" + (completedStepCount === 1 ? "" : "s")
            + (threadCount ? " and " + threadCount + " thread" + (threadCount === 1 ? "" : "s") : "") + ".";
        }
        return "";
      }
`;
