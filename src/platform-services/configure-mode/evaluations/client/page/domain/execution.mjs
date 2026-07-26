export const EVALUATIONS_PAGE_EXECUTION_SCRIPT = String.raw`      function parsePlaygroundEvaluationScoreFromText(value) {
        const text = String(value || "").trim();
        if (!text) {
          return null;
        }
        const fencePattern = "\\x60\\x60\\x60";
        const fencedJsonMatch = text.match(new RegExp(fencePattern + "(?:json)?\\\\s*([\\\\s\\\\S]*?)" + fencePattern, "i"));
        const objectJsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonCandidate = (fencedJsonMatch && fencedJsonMatch[1])
          || (objectJsonMatch && objectJsonMatch[0])
          || "";
        if (jsonCandidate) {
          try {
            const parsed = JSON.parse(jsonCandidate);
            const rawScore = parsed?.score ?? parsed?.grade ?? parsed?.rating ?? parsed?.result?.score;
            const numericScore = Number(rawScore);
            if (Number.isFinite(numericScore)) {
              return Math.max(0, Math.min(1, numericScore > 1 ? numericScore / 100 : numericScore));
            }
          } catch {}
        }
        const percentMatch = text.match(/(?:score|grade|rating)?\s*[:=]?\s*(100|[0-9]{1,2}(?:\.[0-9]+)?)\s*%/i);
        if (percentMatch) {
          return Math.max(0, Math.min(1, Number(percentMatch[1]) / 100));
        }
        const fractionMatch = text.match(/(?:score|grade|rating)?\s*[:=]?\s*([01](?:\.[0-9]+)?|0?\.[0-9]+)\s*\/\s*1\b/i);
        if (fractionMatch) {
          return Math.max(0, Math.min(1, Number(fractionMatch[1])));
        }
        const numberMatch = text.match(/(?:score|grade|rating)\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)/i);
        if (numberMatch) {
          const numericScore = Number(numberMatch[1]);
          if (Number.isFinite(numericScore)) {
            return Math.max(0, Math.min(1, numericScore > 1 ? numericScore / 100 : numericScore));
          }
        }
        return null;
      }

      function buildPlaygroundEvaluationAgentEvaluatorPrompt({ row, evaluationSet, run, caseRun, evaluationThreadId }) {
        return [
          "You are the evaluator for an agent evaluation run. Judge the completed evaluation thread against the expected output for the given input.",
          "Evaluation thread ID: " + String(evaluationThreadId || ""),
          "Inspect the evaluation thread directly before scoring. Use its user messages, assistant run summary, working logs, and created artifacts as the source of truth.",
          "Return only valid JSON in this exact shape: {\"score\": 0.0, \"reason\": \"short explanation\"}.",
          "The score must be a number between 0 and 1. Use 1 for a fully correct answer, 0 for a completely wrong answer, and partial values for partially correct answers.",
          "Do not solve the original task yourself. Only evaluate what happened in the evaluation thread.",
          "Evaluation set: " + (evaluationSet.name || "Untitled Evaluation"),
          "Run: " + (run.label || "Evaluation Run"),
          "Case ID: " + (caseRun.id || ""),
          "Input:\n" + String(row.input || ""),
          "Expected output:\n" + String(row.expectedOutput || "")
        ].join("\n\n");
      }

      async function createPlaygroundEvaluationHiddenThread({ backendUrl, requestHeaders, title, agentId, environmentId, projectId, metadata }) {
        const createHeaders = new Headers(requestHeaders || {});
        createHeaders.set("Content-Type", "application/json");
        const createResponse = await fetch(backendUrl + "/threads", {
          method: "POST",
          headers: createHeaders,
          body: JSON.stringify({
            title,
            appId: "runner-web-sdk-demo",
            agentId,
            environmentId,
            ...(projectId ? { projectId } : {}),
            hidden: true,
            sidebarHidden: true,
            metadata,
          }),
        });
        const createData = await readPlaygroundEvaluationJsonResponse(createResponse, "Failed to create evaluation thread.");
        const threadRecord = extractPlaygroundEvaluationThreadRecord(createData);
        if (!threadRecord?.id) {
          throw new Error("Thread creation succeeded but no thread id was returned.");
        }
        return attachPlaygroundEvaluationThreadMetadata(threadRecord, metadata);
      }

      async function runPlaygroundEvaluationThreadMessage({ backendUrl, requestHeaders, threadId, content }) {
        const messageHeaders = new Headers(requestHeaders || {});
        messageHeaders.set("Content-Type", "application/json");
        const messageResponse = await fetch(backendUrl + "/threads/" + encodeURIComponent(threadId) + "/messages", {
          method: "POST",
          headers: messageHeaders,
          body: JSON.stringify({
            content,
            task: content,
          }),
        });
        if (!messageResponse.ok) {
          const errorData = await readPlaygroundEvaluationJsonResponse(messageResponse, "Failed to start evaluation thread.");
          throw new Error(String(errorData?.message || errorData?.error || "Failed to start evaluation thread."));
        }
        const streamText = await messageResponse.text().catch(() => "");
        const streamSummary = extractPlaygroundEvaluationStreamSummary(streamText);
        return await waitForPlaygroundEvaluationThreadFinalSummary({
          backendUrl,
          requestHeaders,
          threadId,
          fallback: streamSummary,
        });
      }

      async function startPlaygroundEvaluationCaseThread(options = {}) {
        const backendUrl = String(options.backendUrl || "").replace(/\/+$/, "");
        const requestHeaders = options.requestHeaders || {};
        const evaluationSet = normalizePlaygroundEvaluationSet(options.evaluationSet);
        const run = normalizePlaygroundEvaluationRun(options.run);
        const row = normalizePlaygroundEvaluationDataRow(options.row, Number(options.index || 0));
        const caseRun = normalizePlaygroundEvaluationRunCase(options.caseRun, Number(options.index || 0));
        const agentId = String(options.agentId || evaluationSet.targetAgentId || "").trim();
        const environmentId = String(options.environmentId || evaluationSet.environmentId || "").trim();
        const projectId = String(options.projectId || evaluationSet.projectId || "").trim();
        const environmentType = String(options.environmentType || evaluationSet.environmentType || "").trim().toLowerCase() === "project" ? "project" : "computer";
        const caseNumber = Math.max(1, Number(options.index || 0) + 1);
        const title = (evaluationSet.name || "Evaluation") + " · " + (run.label || "Run") + " · Case " + caseNumber;
        if (!backendUrl) {
          throw new Error("Evaluation backend is unavailable.");
        }
        if (!agentId) {
          throw new Error("Select an agent to run this evaluation.");
        }
        if (!environmentId) {
          throw new Error(environmentType === "project" ? "Select a project with a default computer." : "Select a computer to run this evaluation.");
        }
        if (!String(row.input || "").trim()) {
          throw new Error("Evaluation input is empty.");
        }

        const metadata = {
          evaluation: {
            setId: evaluationSet.id,
            runId: run.id,
            caseId: caseRun.id,
            dataRowId: row.id,
            kind: "case",
            hidden: true,
            sidebarHidden: true,
            environmentType,
            projectId,
            environmentId,
          },
          runnerPlayground: {
            type: "evaluation_case",
            evaluationSetId: evaluationSet.id,
            evaluationRunId: run.id,
            evaluationCaseId: caseRun.id,
            evaluationDataRowId: row.id,
            evaluationKind: "case",
            hidden: true,
            sidebarHidden: true,
            environmentType,
            projectId,
            environmentId,
          },
        };
        const threadRecord = await createPlaygroundEvaluationHiddenThread({
          backendUrl,
          requestHeaders,
          title,
          agentId,
          environmentId,
          projectId,
          metadata,
        });
        if (typeof options.onThreadCreated === "function") {
          options.onThreadCreated(threadRecord);
        }

        const startedAt = Date.now();
        const actualOutput = await runPlaygroundEvaluationThreadMessage({
          backendUrl,
          requestHeaders,
          threadId: threadRecord.id,
          content: row.input,
        });
        const latencyMs = Date.now() - startedAt;
        const evaluator = normalizePlaygroundEvaluationEvaluator(evaluationSet.evaluator);
        const expected = String(row.expectedOutput || "");
        const hasComparableActual = Boolean(actualOutput.trim());
        let evaluatorThreadRecord = null;
        let evaluatorOutput = "";
        let score = null;
        let status = "invalid";
        if (evaluator.type === "exact") {
          if (expected.trim()) {
            score = hasComparableActual && normalizePlaygroundEvaluationComparable(actualOutput) === normalizePlaygroundEvaluationComparable(expected) ? 1 : 0;
            status = score >= 1 ? "passed" : "failed";
          }
        } else if (evaluator.type === "agent") {
          const evaluatorAgentId = String(evaluator.agentId || "").trim();
          if (!evaluatorAgentId) {
            throw new Error("Select an evaluator agent before running this evaluation.");
          }
          const evaluatorMetadata = {
            evaluation: {
              setId: evaluationSet.id,
              runId: run.id,
              caseId: caseRun.id,
              dataRowId: row.id,
              kind: "evaluator",
              sourceThreadId: threadRecord.id,
              hidden: true,
              sidebarHidden: true,
              environmentType,
              projectId,
              environmentId,
            },
            runnerPlayground: {
              type: "evaluation_evaluator",
              evaluationSetId: evaluationSet.id,
              evaluationRunId: run.id,
              evaluationCaseId: caseRun.id,
              evaluationDataRowId: row.id,
              evaluationKind: "evaluator",
              sourceThreadId: threadRecord.id,
              hidden: true,
              sidebarHidden: true,
              environmentType,
              projectId,
              environmentId,
            },
          };
          evaluatorThreadRecord = await createPlaygroundEvaluationHiddenThread({
            backendUrl,
            requestHeaders,
            title: title + " · Evaluator",
            agentId: evaluatorAgentId,
            environmentId,
            projectId,
            metadata: evaluatorMetadata,
          });
          if (typeof options.onThreadCreated === "function") {
            options.onThreadCreated(evaluatorThreadRecord);
          }
          evaluatorOutput = await runPlaygroundEvaluationThreadMessage({
            backendUrl,
            requestHeaders,
            threadId: evaluatorThreadRecord.id,
            content: buildPlaygroundEvaluationAgentEvaluatorPrompt({
              row,
              evaluationSet,
              run,
              caseRun,
              evaluationThreadId: threadRecord.id,
            }),
          });
          const parsedScore = parsePlaygroundEvaluationScoreFromText(evaluatorOutput);
          score = parsedScore;
          status = parsedScore === null ? "grader_error" : score >= 0.8 ? "passed" : "failed";
          if (parsedScore === null) {
            evaluatorOutput = evaluatorOutput || "The evaluator did not return a valid score.";
          }
        } else if (evaluator.type === "code") {
          evaluatorOutput = "Code evaluators require an isolated grader sandbox and are not available on this deployment.";
          score = null;
          status = "grader_error";
        }
        return {
          thread: threadRecord,
          evaluatorThread: evaluatorThreadRecord,
          casePatch: {
            threadId: threadRecord.id,
            evaluatorThreadId: evaluatorThreadRecord?.id || "",
            actualOutput: actualOutput || "Thread completed. Open the thread to inspect the run summary.",
            evaluatorOutput,
            score,
            status,
            latencyMs,
            error: ["grader_error", "infrastructure_error", "error"].includes(status) ? evaluatorOutput : "",
          },
        };
      }

`;
