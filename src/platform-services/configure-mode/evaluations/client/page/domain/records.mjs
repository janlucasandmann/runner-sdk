export const EVALUATIONS_PAGE_RECORDS_SCRIPT = String.raw`      function normalizePlaygroundEvaluationResponseArray(data, keys = []) {
        if (Array.isArray(data)) {
          return data;
        }
        if (!data || typeof data !== "object") {
          return [];
        }
        for (const key of keys) {
          if (Array.isArray(data[key])) {
            return data[key];
          }
        }
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.results)) return data.results;
        return [];
      }

      function readPlaygroundEvaluationRecordText(value) {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          return String(value).trim();
        }
        if (Array.isArray(value)) {
          return value.map((entry) => readPlaygroundEvaluationRecordText(entry)).filter(Boolean).join("\n").trim();
        }
        if (!value || typeof value !== "object") {
          return "";
        }
        const metadata = value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata) ? value.metadata : {};
        const response = value.response && typeof value.response === "object" && !Array.isArray(value.response) ? value.response : {};
        const result = value.result && typeof value.result === "object" && !Array.isArray(value.result) ? value.result : {};
        const candidates = [
          value.summary,
          value.runSummary,
          value.run_summary,
          value.output,
          value.outputText,
          value.output_text,
          value.content,
          value.text,
          value.message,
          value.body,
          response.output_text,
          response.outputText,
          response.summary,
          result.output_text,
          result.outputText,
          result.summary,
          result.text,
          metadata.summary,
          metadata.runSummary,
          metadata.run_summary,
          metadata.output,
          metadata.outputText,
          metadata.output_text,
          metadata.result,
          metadata.response,
          metadata.content,
          metadata.text,
          metadata.message,
        ];
        for (const candidate of candidates) {
          const text = readPlaygroundEvaluationRecordText(candidate);
          if (text) {
            return text;
          }
        }
        if (Object.prototype.hasOwnProperty.call(value, "score") || Object.prototype.hasOwnProperty.call(value, "reason")) {
          try {
            return JSON.stringify(value);
          } catch {}
        }
        return "";
      }

      function getPlaygroundEvaluationRecordType(record) {
        const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        return String(record?.eventType || record?.event_type || record?.stepKind || record?.step_kind || record?.type || record?.kind || metadata?.eventType || metadata?.type || "").trim().toLowerCase();
      }

      function getPlaygroundEvaluationRecordTimestamp(record) {
        return String(record?.createdAt || record?.created_at || record?.timestamp || record?.updatedAt || record?.updated_at || "").trim();
      }

      function extractPlaygroundEvaluationFinalSummaryFromRecords(records) {
        const orderedRecords = (Array.isArray(records) ? records : [])
          .filter((record) => record && typeof record === "object")
          .sort((left, right) => getPlaygroundEvaluationRecordTimestamp(left).localeCompare(getPlaygroundEvaluationRecordTimestamp(right)));
        const preferredRecords = orderedRecords.filter((record) => {
          const type = getPlaygroundEvaluationRecordType(record);
          return type === "turn_completed" || type === "run_summary" || type.includes("summary");
        });
        const candidates = preferredRecords.length > 0 ? preferredRecords : orderedRecords;
        for (let index = candidates.length - 1; index >= 0; index -= 1) {
          const text = readPlaygroundEvaluationRecordText(candidates[index]);
          if (text) {
            return text;
          }
        }
        return "";
      }

      function sleepPlaygroundEvaluation(ms) {
        return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
      }

      async function fetchPlaygroundEvaluationJson({ backendUrl, requestHeaders, path }) {
        const response = await fetch(backendUrl + path, {
          method: "GET",
          headers: requestHeaders || {},
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.message || data?.error || "Failed to load evaluation thread data."));
        }
        return data;
      }

      async function fetchPlaygroundEvaluationThreadFinalSummary({ backendUrl, requestHeaders, threadId }) {
        const normalizedThreadId = String(threadId || "").trim();
        if (!backendUrl || !normalizedThreadId) {
          return "";
        }
        const encodedThreadId = encodeURIComponent(normalizedThreadId);
        const [stepsResult, logsResult, threadResult] = await Promise.allSettled([
          fetchPlaygroundEvaluationJson({
            backendUrl,
            requestHeaders,
            path: "/threads/" + encodedThreadId + "/steps?limit=80&compact=1",
          }),
          fetchPlaygroundEvaluationJson({
            backendUrl,
            requestHeaders,
            path: "/threads/" + encodedThreadId + "/logs?compact=1&includeConversation=0&limit=80",
          }),
          fetchPlaygroundEvaluationJson({
            backendUrl,
            requestHeaders,
            path: "/threads/" + encodedThreadId,
          }),
        ]);
        const steps = stepsResult.status === "fulfilled" ? normalizePlaygroundEvaluationResponseArray(stepsResult.value, ["steps"]) : [];
        const logs = logsResult.status === "fulfilled" ? normalizePlaygroundEvaluationResponseArray(logsResult.value, ["logs"]) : [];
        const summary = extractPlaygroundEvaluationFinalSummaryFromRecords([...steps, ...logs]);
        if (summary) {
          return summary;
        }
        if (threadResult.status === "fulfilled") {
          return readPlaygroundEvaluationRecordText(threadResult.value?.thread || threadResult.value?.data || threadResult.value);
        }
        return "";
      }

`;

