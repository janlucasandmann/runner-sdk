export const EVALUATIONS_PAGE_SOURCE_THREADS_SCRIPT = String.raw`      function normalizePlaygroundEvaluationSourceThread(record, fallbackIndex = 0) {
        const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
        const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
        const taskPreview = runnerPlayground.taskPreview && typeof runnerPlayground.taskPreview === "object" && !Array.isArray(runnerPlayground.taskPreview)
          ? runnerPlayground.taskPreview
          : {};
        const agent = source.agent && typeof source.agent === "object" && !Array.isArray(source.agent) ? source.agent : {};
        const environment = source.environment && typeof source.environment === "object" && !Array.isArray(source.environment)
          ? source.environment
          : source.computer && typeof source.computer === "object" && !Array.isArray(source.computer)
            ? source.computer
            : {};
        const threadId = String(source.id || source.threadId || source.thread_id || "").trim();
        return {
          id: threadId,
          title: String(source.title || source.name || source.subject || taskPreview.title || "Untitled thread").trim() || "Untitled thread",
          status: String(source.status || source.state || "").trim(),
          agentId: String(source.agentId || source.agent_id || agent.id || metadata.agentId || metadata.agent_id || runnerPlayground.agentId || taskPreview.agentId || "").trim(),
          agentName: String(source.agentName || source.agent_name || agent.name || agent.label || metadata.agentName || metadata.agent_name || runnerPlayground.agentName || taskPreview.agentName || "").trim(),
          agentAvatarUrl: String(
            source.agentAvatarUrl
            || source.agent_avatar_url
            || agent.photoUrl
            || agent.photoURL
            || agent.avatarUrl
            || agent.avatarURL
            || agent.imageUrl
            || agent.imageURL
            || agent.avatar
            || metadata.agentAvatarUrl
            || metadata.agent_avatar_url
            || runnerPlayground.agentAvatarUrl
            || runnerPlayground.agent_avatar_url
            || taskPreview.agentAvatarUrl
            || taskPreview.agent_avatar_url
            || ""
          ).trim(),
          environmentId: String(source.environmentId || source.environment_id || source.computerId || source.computer_id || environment.id || metadata.environmentId || metadata.environment_id || runnerPlayground.environmentId || taskPreview.environmentId || "").trim(),
          environmentName: String(source.environmentName || source.environment_name || source.computerName || source.computer_name || environment.name || environment.label || metadata.environmentName || metadata.environment_name || runnerPlayground.environmentName || taskPreview.environmentName || "").trim(),
          createdAt: String(source.createdAt || source.created_at || "").trim(),
          updatedAt: String(source.updatedAt || source.updated_at || source.completedAt || source.completed_at || source.finishedAt || source.finished_at || source.createdAt || source.created_at || "").trim(),
          messageCount: Number.isFinite(Number(source.messageCount || source.message_count)) ? Number(source.messageCount || source.message_count) : 0,
        };
      }

      function getPlaygroundEvaluationThreadMessageRole(message) {
        const source = message && typeof message === "object" && !Array.isArray(message) ? message : {};
        const author = source.author && typeof source.author === "object" && !Array.isArray(source.author) ? source.author : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
        return String(
          source.role
          || source.senderRole
          || source.sender_role
          || source.type
          || source.kind
          || author.role
          || author.type
          || metadata.role
          || metadata.senderRole
          || ""
        ).trim().toLowerCase();
      }

      function getPlaygroundEvaluationThreadMessageText(message) {
        return readPlaygroundEvaluationRecordText(message);
      }

      function extractPlaygroundEvaluationThreadCaseInput(messages, thread) {
        const userTexts = (Array.isArray(messages) ? messages : [])
          .map((message) => ({
            role: getPlaygroundEvaluationThreadMessageRole(message),
            text: getPlaygroundEvaluationThreadMessageText(message),
          }))
          .filter((message) => {
            if (!message.text) return false;
            if (!message.role) return true;
            return message.role === "user" || message.role === "human" || message.role === "customer" || message.role === "email";
          })
          .map((message) => message.text)
          .filter(Boolean);
        if (userTexts.length === 1) {
          return userTexts[0];
        }
        if (userTexts.length > 1) {
          return userTexts.map((text, index) => "User message " + (index + 1) + ":\n" + text).join("\n\n");
        }
        return String(thread?.title || "Historical thread").trim();
      }

      async function fetchPlaygroundEvaluationThreadMessages({ backendUrl, requestHeaders, threadId }) {
        const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
        const normalizedThreadId = String(threadId || "").trim();
        if (!normalizedBackendUrl || !normalizedThreadId) {
          return [];
        }
        const data = await fetchPlaygroundEvaluationJson({
          backendUrl: normalizedBackendUrl,
          requestHeaders,
          path: "/threads/" + encodeURIComponent(normalizedThreadId) + "/messages?limit=120&compact=1",
        });
        return normalizePlaygroundEvaluationResponseArray(data, ["messages"]);
      }

      async function buildPlaygroundEvaluationDataRowFromThread({ thread, backendUrl, requestHeaders, index = 0 }) {
        const sourceThread = normalizePlaygroundEvaluationSourceThread(thread, index);
        const [messagesResult, summaryResult] = await Promise.allSettled([
          fetchPlaygroundEvaluationThreadMessages({
            backendUrl,
            requestHeaders,
            threadId: sourceThread.id,
          }),
          fetchPlaygroundEvaluationThreadFinalSummary({
            backendUrl: String(backendUrl || "").replace(/\/+$/, ""),
            requestHeaders,
            threadId: sourceThread.id,
          }),
        ]);
        const messages = messagesResult.status === "fulfilled" ? messagesResult.value : [];
        const expectedOutput = summaryResult.status === "fulfilled" ? String(summaryResult.value || "").trim() : "";
        const input = extractPlaygroundEvaluationThreadCaseInput(messages, sourceThread);
        const nowIso = new Date(Date.now() + index).toISOString();
        const sourceMetadata = {
          source: "thread",
          sourceThreadId: sourceThread.id,
          sourceThreadTitle: sourceThread.title,
          sourceAgentId: sourceThread.agentId,
          sourceAgentName: sourceThread.agentName,
          sourceEnvironmentId: sourceThread.environmentId,
          sourceEnvironmentName: sourceThread.environmentName,
          sourceCreatedAt: sourceThread.createdAt,
          sourceUpdatedAt: sourceThread.updatedAt,
          generatedAt: nowIso,
          extractionVersion: "thread_case_v1",
        };
        return normalizePlaygroundEvaluationDataRow({
          id: createPlaygroundEvaluationId("eval_case"),
          input,
          expectedOutput,
          evaluationGuidance: [
            "This case was generated from historical thread " + sourceThread.id + ".",
            "Use the expected output as the reference behavior for the historical run summary. Do not require exact wording unless the expected output or dataset guidance says exact wording matters.",
            expectedOutput ? "" : "Review this draft before running it because no historical run summary could be extracted automatically."
          ].filter(Boolean).join("\n"),
          runCount: 1,
          sourceThreadId: sourceThread.id,
          sourceThreadTitle: sourceThread.title,
          sourceAgentId: sourceThread.agentId,
          sourceAgentName: sourceThread.agentName,
          sourceEnvironmentId: sourceThread.environmentId,
          sourceEnvironmentName: sourceThread.environmentName,
          sourceCreatedAt: sourceThread.createdAt,
          sourceUpdatedAt: sourceThread.updatedAt,
          reviewStatus: "draft",
          metadata: sourceMetadata,
          createdAt: nowIso,
          updatedAt: nowIso,
        }, index);
      }

      async function waitForPlaygroundEvaluationThreadFinalSummary({ backendUrl, requestHeaders, threadId, fallback = "" }) {
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const summary = await fetchPlaygroundEvaluationThreadFinalSummary({ backendUrl, requestHeaders, threadId }).catch(() => "");
          if (summary) {
            return summary;
          }
          if (attempt < 5) {
            await sleepPlaygroundEvaluation(700 + attempt * 250);
          }
        }
        return String(fallback || "").trim();
      }

      function attachPlaygroundEvaluationThreadMetadata(threadRecord, metadata, extra = {}) {
        const source = threadRecord && typeof threadRecord === "object" && !Array.isArray(threadRecord) ? threadRecord : {};
        const sourceMetadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
        const baseEvaluation = metadata?.evaluation && typeof metadata.evaluation === "object" && !Array.isArray(metadata.evaluation) ? metadata.evaluation : {};
        const sourceEvaluation = sourceMetadata.evaluation && typeof sourceMetadata.evaluation === "object" && !Array.isArray(sourceMetadata.evaluation) ? sourceMetadata.evaluation : {};
        const baseRunnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground) ? metadata.runnerPlayground : {};
        const sourceRunnerPlayground = sourceMetadata.runnerPlayground && typeof sourceMetadata.runnerPlayground === "object" && !Array.isArray(sourceMetadata.runnerPlayground) ? sourceMetadata.runnerPlayground : {};
        return {
          ...source,
          ...extra,
          hidden: true,
          sidebarHidden: true,
          metadata: {
            ...metadata,
            ...sourceMetadata,
            evaluation: {
              ...baseEvaluation,
              ...sourceEvaluation,
              hidden: true,
            },
            runnerPlayground: {
              ...baseRunnerPlayground,
              ...sourceRunnerPlayground,
              hidden: true,
              sidebarHidden: true,
            },
          },
        };
      }

`;
