export const METRONOME_EXECUTION_RUNTIME_SCRIPT = String.raw`
        function normalizeMetronomeRun(rawRun) {
          const raw = rawRun && typeof rawRun === "object" ? rawRun : {};
          const output = raw.output && typeof raw.output === "object" ? raw.output : {};
          const input = raw.input && typeof raw.input === "object"
            ? raw.input
            : raw.inputs && typeof raw.inputs === "object"
              ? raw.inputs
              : {};
          const steps = Array.isArray(output.steps)
            ? output.steps.map((step, index) => ({
                id: String(step?.id || "step_" + (index + 1)),
                index: Number(step?.index || index + 1) || index + 1,
                nodeId: String(step?.nodeId || "").trim(),
                edgeId: String(step?.edgeId || "").trim(),
                selectedEdgeId: String(step?.selectedEdgeId || step?.output?.selectedEdgeId || "").trim(),
                kind: String(step?.kind || "").trim(),
                label: String(step?.label || "Step " + (index + 1)).trim(),
                status: String(step?.status || raw.status || "completed").trim(),
                summary: String(step?.summary || step?.message || "").trim(),
                branchId: String(step?.branchId || step?.output?.branchId || step?.output?.branch?.id || "").trim(),
                branchLabel: String(step?.branchLabel || step?.output?.branchLabel || step?.output?.branch?.label || "").trim(),
                branchRule: String(step?.branchRule || step?.output?.branchRule || step?.output?.branch?.rule || "").trim(),
                branchMatched: Boolean(step?.branchMatched || step?.output?.branchMatched || step?.output?.branch?.matched),
                branchReason: String(step?.branchReason || step?.output?.branchReason || step?.output?.branch?.reason || "").trim(),
                startedAt: String(step?.startedAt || raw.startedAt || raw.createdAt || "").trim(),
                completedAt: String(step?.completedAt || raw.completedAt || "").trim(),
                input: step?.input && typeof step.input === "object"
                  ? step.input
                  : step?.inputs && typeof step.inputs === "object"
                    ? step.inputs
                    : step?.inputSummary || step?.input_summary || null,
                output: step?.output && typeof step.output === "object" ? step.output : {},
              }))
            : [];
          const logs = Array.isArray(output.logs)
            ? output.logs.map((log, index) => ({
                id: String(log?.id || "log_" + (index + 1)),
                level: String(log?.level || "info").trim(),
                nodeId: String(log?.nodeId || "").trim(),
                edgeId: String(log?.edgeId || "").trim(),
                message: String(log?.message || "").trim(),
                createdAt: String(log?.createdAt || raw.createdAt || "").trim(),
              }))
            : steps.map((step) => ({
                id: "log_" + step.id,
                level: "info",
                nodeId: step.nodeId,
                edgeId: step.edgeId,
                message: step.summary,
                createdAt: step.completedAt || step.startedAt || raw.createdAt || "",
              }));
          const threads = Array.isArray(output.threads)
            ? output.threads.map((thread, index) => ({
                id: String(thread?.id || "thread_preview_" + (index + 1)),
                nodeId: String(thread?.nodeId || "").trim(),
                title: String(thread?.title || "Thread").trim(),
                prompt: String(thread?.prompt || "").trim(),
                agentName: String(thread?.agentName || "Computer Agent").trim(),
                computerName: String(thread?.computerName || "Default").trim(),
                projectName: String(thread?.projectName || "").trim(),
                status: String(thread?.status || "planned").trim(),
                summary: thread?.summary || "",
                output: thread?.output || thread?.result || thread?.data || null,
              }))
            : [];
          const completedNodeIds = Array.isArray(output.completedNodeIds)
            ? output.completedNodeIds.map((id) => String(id || "").trim()).filter(Boolean)
            : steps.map((step) => step.nodeId).filter(Boolean);
          const completedEdgeIds = Array.isArray(output.completedEdgeIds)
            ? output.completedEdgeIds.map((id) => String(id || "").trim()).filter(Boolean)
            : steps.flatMap((step) => [step.edgeId, step.selectedEdgeId]).filter(Boolean);
          steps.forEach((step) => {
            if (step.selectedEdgeId && !completedEdgeIds.includes(step.selectedEdgeId)) {
              completedEdgeIds.push(step.selectedEdgeId);
            }
          });
          return {
            id: String(raw.id || "").trim(),
            metronomeId: String(raw.metronomeId || raw.metronome_id || "").trim(),
            snapshotId: String(raw.snapshotId || raw.snapshot_id || "").trim(),
            versionId: String(raw.versionId || raw.version_id || "").trim(),
            runKind: String(raw.runKind || raw.run_kind || "workflow").trim(),
            invocationSource: String(raw.invocationSource || raw.invocation_source || "").trim(),
            effectMode: String(raw.effectMode || raw.effect_mode || "execute").trim(),
            executionSelection: raw.executionSelection && typeof raw.executionSelection === "object"
              ? raw.executionSelection
              : raw.execution_selection && typeof raw.execution_selection === "object"
                ? raw.execution_selection
                : null,
            triggerType: String(raw.triggerType || raw.trigger_type || "").trim(),
            status: String(raw.status || "completed").trim(),
            input,
            output: {
              ...output,
              message: String(output.message || "").trim(),
              prompt: String(output.prompt || input.prompt || "").trim(),
              steps,
              logs,
              threads,
              completedNodeIds,
              completedEdgeIds,
              activeNodeId: output.activeNodeId ? String(output.activeNodeId).trim() : "",
              activeEdgeId: output.activeEdgeId ? String(output.activeEdgeId).trim() : "",
            },
            error: raw.error || "",
            startedAt: String(raw.startedAt || raw.started_at || "").trim(),
            completedAt: String(raw.completedAt || raw.completed_at || "").trim(),
            createdAt: String(raw.createdAt || raw.created_at || new Date().toISOString()).trim(),
            updatedAt: String(raw.updatedAt || raw.updated_at || "").trim(),
          };
        }

        async function fetchMetronomeRunsApi(workflowId, limit = 50) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return [];
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/runs?limit=" + encodeURIComponent(String(limit || 50)), {
            method: "GET",
            credentials: "same-origin",
          });
          const data = await readMetronomeApiJson(response, "Failed to load Metronome runs.");
          const rawItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          return rawItems.map(normalizeMetronomeRun).filter((run) => run.id);
        }

        async function fetchMetronomeDeploymentsApi(workflowId, limit = 20) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return [];
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/deployments?limit=" + encodeURIComponent(String(limit || 20)), {
            method: "GET",
            credentials: "same-origin",
          });
          const data = await readMetronomeApiJson(response, "Failed to load deployment history");
          const rawItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.deployments)
              ? data.deployments
              : Array.isArray(data?.events)
                ? data.events
                : Array.isArray(data)
                  ? data
                  : [];
          return normalizeMetronomeDeploymentEvents(rawItems);
        }

        function normalizeMetronomeTriggerEvent(rawEvent) {
          const raw = rawEvent && typeof rawEvent === "object" ? rawEvent : {};
          return {
            id: String(raw.id || "").trim(),
            metronomeId: String(raw.metronomeId || raw.metronome_id || "").trim(),
            runId: String(raw.runId || raw.run_id || "").trim(),
            triggerType: String(raw.triggerType || raw.trigger_type || "unknown").trim(),
            status: String(raw.status || "ignored").trim().toLowerCase(),
            sourceEventId: String(raw.sourceEventId || raw.source_event_id || "").trim(),
            summary: String(raw.summary || "").trim(),
            reason: String(raw.reason || "").trim(),
            payload: raw.payload && typeof raw.payload === "object" ? raw.payload : null,
            createdAt: String(raw.createdAt || raw.created_at || new Date().toISOString()).trim(),
          };
        }

        async function fetchMetronomeTriggerEventsApi(workflowId, limit = 20) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return [];
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/trigger-events?limit=" + encodeURIComponent(String(limit || 20)), {
            method: "GET",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to load Metronome trigger diagnostics.");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          return rawItems.map(normalizeMetronomeTriggerEvent).filter((event) => event.id);
        }

        function createMetronomeExecutionRequestPayload(workflowId, {
          definition,
          versionId,
          prompt,
          inputs,
          selection,
          fixture,
          idempotencyKey,
        } = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const runInputs = {
            ...(inputs && typeof inputs === "object" ? inputs : {}),
            ...(prompt !== undefined ? { prompt: String(prompt || "").trim() } : {}),
          };
          const basePayload = definition && typeof definition === "object"
            ? createMetronomeExecutionPayload(
                { id: normalizedWorkflowId, name: definition?.name || "Metronome" },
                definition,
                runInputs
              )
            : { inputs: runInputs };
          return {
            ...basePayload,
            ...(String(versionId || "").trim() ? { versionId: String(versionId).trim() } : {}),
            ...(selection && typeof selection === "object" ? { selection } : {}),
            ...(fixture !== undefined ? { fixture } : {}),
            ...(String(idempotencyKey || "").trim() ? { idempotencyKey: String(idempotencyKey).trim() } : {}),
          };
        }

        async function createMetronomeRunApi(workflowId, { definition, versionId, prompt, inputs, idempotencyKey } = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Save this Metronome before running it.");
          const executionPayload = createMetronomeExecutionRequestPayload(normalizedWorkflowId, {
            definition,
            versionId,
            prompt,
            idempotencyKey,
            inputs: {
              source: "manual_chat",
              ...(inputs && typeof inputs === "object" ? inputs : {}),
            },
          });
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/runs", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(executionPayload),
          });
          const data = await readMetronomeApiJson(response, "Failed to start Metronome run.");
          return normalizeMetronomeRun(data?.data || data);
        }

        async function createMetronomeThreadCommandRunApi(workflowId, { command, prompt, inputs, idempotencyKey } = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedCommand = normalizeMetronomeThreadTriggerCommand(command);
          if (!normalizedWorkflowId) throw new Error("This workflow command is no longer available.");
          if (!normalizedCommand || normalizedCommand === "@") throw new Error("Choose a valid workflow command.");
          const normalizedPrompt = String(prompt || "").trim() || normalizedCommand;
          const normalizedIdempotencyKey = String(idempotencyKey || "").trim();
          const triggerInputs = {
            ...(inputs && typeof inputs === "object" ? inputs : {}),
            source: "composer_thread_trigger",
            triggerType: "thread_event",
            command: normalizedCommand,
            triggerCommand: normalizedCommand,
            message: normalizedPrompt,
          };
          let response = await fetch(
            "/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/triggers/thread-command",
            {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                command: normalizedCommand,
                prompt: normalizedPrompt,
                inputs: triggerInputs,
                ...(normalizedIdempotencyKey
                  ? { idempotencyKey: normalizedIdempotencyKey }
                  : {}),
              }),
            }
          );
          // Keep the composer functional while a control-plane deployment is
          // rolling from the established run route to the trigger-native route.
          // A genuine workflow lookup failure is still returned by the fallback.
          if (response.status === 404) {
            response = await fetch(
              "/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/runs",
              {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createMetronomeExecutionRequestPayload(normalizedWorkflowId, {
                  prompt: normalizedPrompt,
                  inputs: triggerInputs,
                  idempotencyKey: normalizedIdempotencyKey,
                })),
              }
            );
          }
          const data = await readMetronomeApiJson(response, "Failed to start workflow command.");
          return normalizeMetronomeRun(data?.data?.run || data?.data || data);
        }

        async function previewMetronomeTestRunApi(workflowId, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Save this Metronome before testing it.");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/test-runs/preview", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeExecutionRequestPayload(normalizedWorkflowId, options)),
          });
          const data = await readMetronomeApiJson(response, "Failed to preview this workflow test.");
          return data?.data || data;
        }

        async function createMetronomeTestRunApi(workflowId, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Save this Metronome before testing it.");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/test-runs", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeExecutionRequestPayload(normalizedWorkflowId, options)),
          });
          const data = await readMetronomeApiJson(response, "Failed to start this workflow test.");
          return {
            run: normalizeMetronomeRun(data?.data || data),
            preview: data?.preview || null,
          };
        }

        async function deleteMetronomeRunApi(workflowId, runId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedWorkflowId || !normalizedRunId) throw new Error("Missing Metronome run id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/runs/" + encodeURIComponent(normalizedRunId), {
            method: "DELETE",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw createMetronomeApiError("Failed to delete Metronome run.", response);
          }
          return true;
        }

        function createMetronomeWorkflowDefinition(workflow, nodes, edges) {
          const metadata = stripMetronomeDeploymentMetadata(buildMetronomeWorkflowProjectMetadata(workflow));
          const inferenceBudgetPolicy = readMetronomeWorkflowInferenceBudgetPolicy(workflow);
          const definitionNodes = (Array.isArray(nodes) ? nodes : []).map((node) => {
            const data = node?.data && typeof node.data === "object" ? node.data : {};
            const kind = String(data.kind || node?.kind || "action");
            const subtype = String(data.subtype || node?.subtype || "");
            const definitionNode = {
              id: String(node?.id || ""),
              kind,
              subtype,
              label: getMetronomeNodeDisplayLabel({ ...node, data: { ...data, kind, subtype } }),
              description: String(data.description || node?.description || ""),
              config: data.config && typeof data.config === "object"
                ? data.config
                : node?.config && typeof node.config === "object"
                  ? node.config
                  : {},
              position: node?.position && typeof node.position === "object" ? node.position : undefined,
              style: node?.style && typeof node.style === "object" ? node.style : undefined,
              parentId: node?.parentId || node?.parentNode ? String(node.parentId || node.parentNode) : undefined,
              extent: node?.extent ? String(node.extent) : undefined,
            };
            if (kind === "trigger" && String(definitionNode.config?.triggerType || subtype || "").trim() === "function") {
              definitionNode.config = buildDefaultMetronomeFunctionTriggerConfig(workflow, node, definitionNode.config);
            }
            return {
              ...definitionNode,
              config: { ...definitionNode.config },
            };
          });
          const definition = {
            version: 1,
            name: String(workflow?.name || "Untitled Metronome"),
            ...(metadata.projectId ? { projectId: metadata.projectId, project_id: metadata.projectId } : {}),
            ...(metadata.projectName ? { projectName: metadata.projectName, project_name: metadata.projectName } : {}),
            ...(metadata.wallpaperId ? { wallpaperId: metadata.wallpaperId, workflowWallpaperId: metadata.workflowWallpaperId || metadata.wallpaperId } : {}),
            ...(inferenceBudgetPolicy ? { inferenceBudgetPolicy } : {}),
            metadata,
            nodes: definitionNodes,
            edges: normalizeMetronomeEdges(edges).map((edge) => ({
              id: String(edge?.id || ""),
              source: String(edge?.source || ""),
              sourceHandle: edge?.sourceHandle ? String(edge.sourceHandle) : undefined,
              target: String(edge?.target || ""),
              targetHandle: edge?.targetHandle ? String(edge.targetHandle) : undefined,
            })),
          };
          return enrichMetronomeWorkflowDefinitionWithDynamicContent(definition, workflow);
        }

        function escapeMetronomePythonString(value) {
          return JSON.stringify(String(value || ""));
        }

        function metronomePythonLiteral(value, indentLevel = 0) {
          const indent = " ".repeat(indentLevel);
          const nextIndent = " ".repeat(indentLevel + 4);
          if (value === null || value === undefined) return "None";
          if (typeof value === "string") return JSON.stringify(value);
          if (typeof value === "number") return Number.isFinite(value) ? String(value) : "None";
          if (typeof value === "boolean") return value ? "True" : "False";
          if (Array.isArray(value)) {
            if (!value.length) return "[]";
            return "[\n"
              + value.map((item) => nextIndent + metronomePythonLiteral(item, indentLevel + 4) + ",").join("\n")
              + "\n" + indent + "]";
          }
          if (typeof value === "object") {
            const entries = Object.entries(value).filter(([, item]) => item !== undefined);
            if (!entries.length) return "{}";
            return "{\n"
              + entries.map(([key, item]) => nextIndent + JSON.stringify(key) + ": " + metronomePythonLiteral(item, indentLevel + 4) + ",").join("\n")
              + "\n" + indent + "}";
          }
          return "None";
        }

        function getMetronomePythonNodeClass(kind) {
          const normalizedKind = String(kind || "").toLowerCase();
          if (normalizedKind === "trigger") return "TriggerNode";
          if (normalizedKind === "condition") return "ConditionNode";
          if (normalizedKind === "action") return "ThreadNode";
          if (normalizedKind === "ticket") return "TicketNode";
          if (normalizedKind === "imagine") return "ImagineNode";
          if (normalizedKind === "function") return "FunctionNode";
          if (normalizedKind === "firecrawl") return "FirecrawlNode";
          if (normalizedKind === "table") return "TableNode";
          if (normalizedKind === "database") return "DatabaseNode";
          if (normalizedKind === "metronome") return "MetronomeRunNode";
          if (normalizedKind === "loop") return "LoopNode";
          if (normalizedKind === "approval") return "EndNode";
          if (normalizedKind === "end") return "EndNode";
          if (normalizedKind === "note") return "NoteNode";
          return "MetronomeNode";
        }

        function getMetronomePythonNodeSubtypeArgument(kind, subtype) {
          const normalizedKind = String(kind || "").toLowerCase();
          const normalizedSubtype = String(subtype || "").trim();
          if (normalizedKind === "trigger") return ["trigger_type", normalizedSubtype || "manual"];
          if (normalizedKind === "ticket") return ["operation", normalizeMetronomeTicketOperation(normalizedSubtype)];
          if (normalizedKind === "imagine") return ["operation", normalizedSubtype || "start_imagine"];
          if (normalizedKind === "firecrawl") return ["operation", normalizeMetronomeFirecrawlOperation(normalizedSubtype)];
          if (normalizedKind === "table") return ["operation", normalizeMetronomeTableOperation(normalizedSubtype)];
          if (normalizedKind === "database") return ["operation", normalizedSubtype || "insert_document"];
          if (normalizedKind === "metronome") return ["operation", normalizedSubtype || "run_workflow"];
          if (normalizedKind === "loop") return ["loop_type", normalizeMetronomeLoopType(normalizedSubtype)];
          return null;
        }

        function createMetronomePythonCall(className, args, indentLevel = 8) {
          const indent = " ".repeat(indentLevel);
          const closingIndent = " ".repeat(Math.max(0, indentLevel - 4));
          const lines = [className + "("];
          args.forEach(([key, value]) => {
            if (value === undefined) return;
            lines.push(indent + key + "=" + metronomePythonLiteral(value, indentLevel) + ",");
          });
          lines.push(closingIndent + ")");
          return lines.join("\n");
        }

        function createMetronomePythonConfigReader(config) {
          const rest = config && typeof config === "object" && !Array.isArray(config) ? { ...config } : {};
          const take = (...keys) => {
            for (const key of keys) {
              if (!Object.prototype.hasOwnProperty.call(rest, key)) continue;
              const value = rest[key];
              delete rest[key];
              if (value !== undefined && value !== null && value !== "") return value;
            }
            return undefined;
          };
          const remove = (...keys) => keys.forEach((key) => delete rest[key]);
          return { take, remove, rest };
        }

        function createMetronomePythonNodeCall(node) {
          const kind = String(node?.kind || "action");
          const className = getMetronomePythonNodeClass(kind);
          const subtypeArg = getMetronomePythonNodeSubtypeArgument(kind, node?.subtype);
          const configReader = createMetronomePythonConfigReader(node?.config);
          const args = [["id", String(node?.id || "")]];
          if (subtypeArg) args.push(subtypeArg);
          if (className === "MetronomeNode") {
            args.push(["kind", kind]);
            if (node?.subtype) args.push(["subtype", node.subtype]);
          }
	          if (className === "ConditionNode") {
            args.push(["condition_type", configReader.take("conditionType", "condition_type")]);
            args.push(["conditions", configReader.take("conditions")]);
	            args.push(["database_id", configReader.take("databaseId", "database_id")]);
            args.push(["database_name", configReader.take("databaseName", "database_name")]);
            args.push(["database_collection", configReader.take("databaseCollection", "database_collection", "collection")]);
	            args.push(["database_document_id", configReader.take("databaseDocumentId", "database_document_id")]);
            args.push(["database_field_path", configReader.take("databaseFieldPath", "database_field_path")]);
	            args.push(["database_operator", configReader.take("databaseOperator", "database_operator")]);
            args.push(["database_compare_value", configReader.take("databaseCompareValue", "database_compare_value")]);
            args.push(["ticket_project_id", configReader.take("ticketProjectId", "ticket_project_id")]);
            args.push(["ticket_project_name", configReader.take("ticketProjectName", "ticket_project_name")]);
            args.push(["ticket_id", configReader.take("ticketId", "ticket_id")]);
            args.push(["ticket_status_operator", configReader.take("ticketStatusOperator", "ticket_status_operator")]);
            args.push(["ticket_status", configReader.take("ticketStatusValue", "ticket_status", "status")]);
          } else if (className === "ThreadNode") {
            args.push(["message", configReader.take("message", "prompt")]);
            args.push(["agent_id", configReader.take("agentId", "agent_id")]);
            args.push(["agent_name", configReader.take("agentName", "agent_name")]);
            args.push(["computer_id", configReader.take("environmentId", "computerId", "computer_id")]);
            args.push(["computer_name", configReader.take("environmentName", "computerName", "computer_name")]);
            args.push(["project_id", configReader.take("projectId", "project_id")]);
            args.push(["project_name", configReader.take("projectName", "project_name")]);
            args.push(["input_context_scope", configReader.take("inputContextScope", "input_context_scope", "contextScope", "context_scope")]);
            args.push(["output_mode", configReader.take("outputMode", "output_mode")]);
            args.push(["output_key", configReader.take("outputKey", "output_key")]);
            args.push(["require_json_output", configReader.take("requireJsonOutput", "require_json_output")]);
            args.push(["output_fields", configReader.take("outputFieldsJson", "output_fields_json", "outputFields", "output_fields")]);
            args.push(["output_contract", configReader.take("outputContractJson", "output_contract_json", "outputContract", "output_contract", "jsonOutputSchema", "json_output_schema")]);
            configReader.remove("contextType", "resource");
          } else if (className === "TicketNode") {
            args.push(["project_id", configReader.take("projectId", "project_id")]);
            args.push(["project_name", configReader.take("projectName", "project_name")]);
            args.push(["ticket_id", configReader.take("ticketId", "ticket_id")]);
            args.push(["title", configReader.take("ticketTitle", "title")]);
            args.push(["status", configReader.take("ticketStatus", "ticket_status", "status")]);
            args.push(["comment", configReader.take("comment")]);
            args.push(["adaptation_instructions", configReader.take("adaptationInstructions", "adaptation_instructions", "instructions")]);
            args.push(["subtask_title", configReader.take("subtaskTitle", "subtask_title")]);
            args.push(["subtask_instructions", configReader.take("subtaskInstructions", "subtask_instructions")]);
            args.push(["work_instructions", configReader.take("workInstructions", "work_instructions")]);
            args.push(["agent_id", configReader.take("agentId", "agent_id")]);
            args.push(["agent_name", configReader.take("agentName", "agent_name")]);
            args.push(["computer_id", configReader.take("environmentId", "computerId", "computer_id")]);
            args.push(["computer_name", configReader.take("environmentName", "computerName", "computer_name")]);
            args.push(["fields", configReader.take("fieldsJson", "fields_json", "fields")]);
            configReader.remove("operation");
          } else if (className === "ImagineNode") {
            args.push(["media_mode", configReader.take("mediaMode", "media_mode")]);
            args.push(["model_id", configReader.take("modelId", "model_id")]);
            args.push(["image_model_id", configReader.take("imageModelId", "image_model_id")]);
            args.push(["video_model_id", configReader.take("videoModelId", "video_model_id")]);
            args.push(["template_id", configReader.take("templateId", "template_id")]);
            args.push(["template_name", configReader.take("templateName", "template_name")]);
            args.push(["prompt", configReader.take("prompt", "message")]);
            args.push(["attachments", configReader.take("attachments", "attachmentsJson", "attachments_json")]);
            args.push(["project_id", configReader.take("projectId", "project_id")]);
            args.push(["project_name", configReader.take("projectName", "project_name")]);
            args.push(["agent_id", configReader.take("agentId", "agent_id")]);
            args.push(["agent_name", configReader.take("agentName", "agent_name")]);
            args.push(["computer_id", configReader.take("environmentId", "computerId", "computer_id")]);
            args.push(["computer_name", configReader.take("environmentName", "computerName", "computer_name")]);
            args.push(["input_context_scope", configReader.take("inputContextScope", "input_context_scope", "contextScope", "context_scope")]);
            args.push(["aspect_ratio", configReader.take("aspectRatio", "aspect_ratio")]);
            configReader.remove("contextType", "resource", "outputKey", "output_key");
          } else if (className === "FunctionNode") {
            args.push(["function_mode", configReader.take("functionMode", "function_mode", "mode", "type")]);
            args.push(["function_id", configReader.take("functionId", "function_id")]);
            args.push(["function_name", configReader.take("functionName", "function_name")]);
            args.push(["method", configReader.take("httpMethod", "http_method", "method")]);
            args.push(["url", configReader.take("url", "requestUrl", "request_url", "endpoint")]);
            args.push(["headers", configReader.take("requestHeaders", "request_headers", "headersRows", "headers_rows", "requestHeadersJson", "request_headers_json", "headersJson", "headers_json", "headers")]);
            args.push(["payload", configReader.take("payload", "payloadJson", "payload_json")]);
            args.push(["output_key", configReader.take("outputKey", "output_key")]);
          } else if (className === "FirecrawlNode") {
            configReader.remove("operation");
            args.push(["credential_ref", configReader.take("credentialRef", "credential_ref")]);
            args.push(["input_binding", configReader.take("inputBinding", "input_binding")]);
            args.push(["query", configReader.take("query")]);
            args.push(["url", configReader.take("url")]);
            args.push(["file_path", configReader.take("filePath", "file_path")]);
            args.push(["prompt", configReader.take("prompt")]);
            args.push(["schema", configReader.take("schemaJson", "schema_json", "schema")]);
            args.push(["limit", configReader.take("limit")]);
            args.push(["formats", configReader.take("formats")]);
            args.push(["save_artifacts", configReader.take("saveArtifacts", "save_artifacts")]);
            args.push(["output_key", configReader.take("outputKey", "output_key")]);
          } else if (className === "TableNode") {
            configReader.remove("operation");
            args.push(["input_binding", configReader.take("inputBinding", "input_binding")]);
            args.push(["file_path", configReader.take("filePath", "file_path")]);
            args.push(["delimiter", configReader.take("delimiter")]);
            args.push(["has_header", configReader.take("hasHeader", "has_header")]);
            args.push(["batch_size", configReader.take("batchSize", "batch_size")]);
            args.push(["output_key", configReader.take("outputKey", "output_key")]);
          } else if (className === "DatabaseNode") {
            configReader.remove("operation");
            args.push(["database_id", configReader.take("databaseId", "database_id")]);
            args.push(["database_name", configReader.take("databaseName", "database_name")]);
            args.push(["collection", configReader.take("collection", "collectionName", "collection_name")]);
            args.push(["document_id", configReader.take("documentId", "document_id")]);
            args.push(["document", configReader.take("document", "documentJson", "document_json")]);
            args.push(["input_binding", configReader.take("inputBinding", "input_binding")]);
            args.push(["records_binding", configReader.take("recordsBinding", "records_binding")]);
            args.push(["document_template", configReader.take("documentTemplateJson", "document_template_json", "documentTemplate", "document_template")]);
            args.push(["upsert_key", configReader.take("upsertKey", "upsert_key")]);
            configReader.remove("outputKey", "output_key");
          } else if (className === "MetronomeRunNode") {
            args.push(["workflow_id", configReader.take("workflowId", "workflow_id")]);
            args.push(["workflow_name", configReader.take("workflowName", "workflow_name")]);
            configReader.remove("inputJson", "input", "payload", "payload_json", "outputKey", "output_key");
          } else if (className === "LoopNode") {
            args.push(["iterations", configReader.take("iterations", "count")]);
            args.push(["max_iterations", configReader.take("maxIterations", "max_iterations")]);
            args.push(["input_binding", configReader.take("inputBinding", "input_binding")]);
            args.push(["context_contains", configReader.take("contextContainsText", "context_contains", "contextContains")]);
            args.push(["project_id", configReader.take("projectId", "project_id")]);
            args.push(["project_name", configReader.take("projectName", "project_name")]);
            args.push(["ticket_status", configReader.take("ticketStatusValue", "ticket_status", "status")]);
            args.push(["database_id", configReader.take("databaseId", "database_id")]);
            args.push(["database_name", configReader.take("databaseName", "database_name")]);
            args.push(["database_collection", configReader.take("databaseCollection", "database_collection", "collection")]);
            args.push(["database_field_path", configReader.take("databaseFieldPath", "database_field_path")]);
            args.push(["database_operator", configReader.take("databaseOperator", "database_operator")]);
            args.push(["database_compare_value", configReader.take("databaseCompareValue", "database_compare_value")]);
            args.push(["database_limit", configReader.take("databaseLimit", "database_limit")]);
            args.push(["break_condition", configReader.take("rule", "breakCondition", "break_condition")]);
		          } else if (className === "NoteNode") {
            args.push(["text", configReader.take("message", "text")]);
          }
          if (node?.label) args.push(["label", node.label]);
          if (node?.description) args.push(["description", node.description]);
          configReader.remove("outputTypes", "output_types");
          const remainingConfig = Object.fromEntries(
            Object.entries(configReader.rest).filter(([, value]) => value !== undefined)
          );
          if (Object.keys(remainingConfig).length || className === "MetronomeNode") {
            args.push(["config", remainingConfig]);
          }
          if (node?.position && typeof node.position === "object") {
            args.push(["position", node.position]);
          }
          return createMetronomePythonCall(className, args);
        }

        function createMetronomePythonEdgeCall(edge) {
          const args = [
            ["id", String(edge?.id || "")],
            ["source", String(edge?.source || "")],
            ["target", String(edge?.target || "")],
          ];
          if (edge?.sourceHandle) args.push(["source_handle", String(edge.sourceHandle)]);
          if (edge?.targetHandle) args.push(["target_handle", String(edge.targetHandle)]);
          return createMetronomePythonCall("MetronomeEdge", args);
        }

        function generateMetronomePythonSdkFiles(workflow, nodes, edges) {
          const definition = createMetronomeWorkflowDefinition(workflow, nodes, edges);
          const workflowName = escapeMetronomePythonString(workflow?.name || "Untitled Metronome");
          const workflowId = String(workflow?.id || "").trim();
          const nodeLines = [
            "from computer_agents import (",
            "    TriggerNode,",
            "    ThreadNode,",
            "    TicketNode,",
            "    ConditionNode,",
            "    ImagineNode,",
            "    FunctionNode,",
            "    FirecrawlNode,",
            "    TableNode,",
            "    DatabaseNode,",
            "    MetronomeRunNode,",
            "    LoopNode,",
            "    EndNode,",
            "    NoteNode,",
            ")",
            "",
            "",
            "def build_nodes():",
            "    return [",
            ...(definition.nodes || []).map((node) => createMetronomePythonNodeCall(node).split("\n").map((line) => "        " + line).join("\n") + ","),
            "    ]",
          ];
          const edgeLines = [
            "from computer_agents import MetronomeEdge",
            "",
            "",
            "def build_edges():",
            "    return [",
            ...(definition.edges || []).map((edge) => createMetronomePythonEdgeCall(edge).split("\n").map((line) => "        " + line).join("\n") + ","),
            "    ]",
          ];
          const mainLines = [
            "from computer_agents import ComputerAgentsClient, MetronomeWorkflow",
            "",
            "from nodes import build_nodes",
            "from edges import build_edges",
            "",
            "",
            "client = ComputerAgentsClient()",
            "",
            "",
            "def build_workflow():",
            "    return MetronomeWorkflow(",
            "        name=" + workflowName + ",",
            "        nodes=build_nodes(),",
            "        edges=build_edges(),",
            "    )",
            "",
            "",
            "workflow_definition = build_workflow()",
            "",
            "",
            "def deploy_workflow():",
            "    workflow = client.metronomes.upsert(",
            "        name=workflow_definition.name,",
          ];
          if (workflowId) {
            mainLines.push("        metronome_id=" + escapeMetronomePythonString(workflowId) + ",");
          }
          mainLines.push(
            "        status=\"draft\",",
            "        definition=workflow_definition,",
            "    )",
            "    return workflow",
            "",
            "# Publish the workflow when you are ready for it to react to real events.",
            "# client.metronomes.publish(deploy_workflow()[\"id\"])",
            "",
            "# Test-run with a sample payload before publishing.",
            "def test_workflow():",
            "    workflow = deploy_workflow()",
            "    return client.metronomes.test_run(",
            "        workflow[\"id\"],",
            "        inputs={},",
            "        definition=workflow_definition,",
            "    )",
            "",
            "",
            "if __name__ == \"__main__\":",
            "    print(test_workflow())"
          );
          return [
            { path: "main.py", language: "python", value: mainLines.join("\n") },
            { path: "nodes.py", language: "python", value: nodeLines.join("\n") },
            { path: "edges.py", language: "python", value: edgeLines.join("\n") },
            { path: "requirements.txt", language: "plaintext", value: "computer-agents\n" },
          ];
        }

        function generateMetronomePythonSdkCode(workflow, nodes, edges) {
          return generateMetronomePythonSdkFiles(workflow, nodes, edges).find((file) => file.path === "main.py")?.value || "";
        }

        function createMetronomePythonExpressionParser(source) {
          const input = String(source || "");
          let index = 0;

          const isWhitespace = (char) => /\s/.test(char || "");
          const isIdentifierStart = (char) => /[A-Za-z_]/.test(char || "");
          const isIdentifierPart = (char) => /[A-Za-z0-9_]/.test(char || "");

          const skip = () => {
            while (index < input.length) {
              const char = input[index];
              if (isWhitespace(char)) {
                index += 1;
                continue;
              }
              if (char === "#") {
                while (index < input.length && input[index] !== "\n") index += 1;
                continue;
              }
              break;
            }
          };

          const readIdentifier = () => {
            skip();
            if (!isIdentifierStart(input[index])) return "";
            const start = index;
            index += 1;
            while (index < input.length && isIdentifierPart(input[index])) index += 1;
            return input.slice(start, index);
          };

          const parseString = () => {
            const quote = input[index];
            index += 1;
            let value = "";
            while (index < input.length) {
              const char = input[index];
              if (char === "\\") {
                const next = input[index + 1];
                if (next === "n") value += "\n";
                else if (next === "t") value += "\t";
                else if (next === "r") value += "\r";
                else value += next || "";
                index += 2;
                continue;
              }
              if (char === quote) {
                index += 1;
                return value;
              }
              value += char;
              index += 1;
            }
            throw new Error("Unterminated string literal.");
          };

          const parseNumber = () => {
            const start = index;
            if (input[index] === "-") index += 1;
            while (/[0-9]/.test(input[index] || "")) index += 1;
            if (input[index] === ".") {
              index += 1;
              while (/[0-9]/.test(input[index] || "")) index += 1;
            }
            const value = Number(input.slice(start, index));
            if (!Number.isFinite(value)) throw new Error("Invalid number literal.");
            return value;
          };

          const parseList = () => {
            const items = [];
            index += 1;
            while (index < input.length) {
              skip();
              if (input[index] === "]") {
                index += 1;
                return items;
              }
              items.push(parseExpression());
              skip();
              if (input[index] === ",") {
                index += 1;
                continue;
              }
              if (input[index] === "]") continue;
              throw new Error("Expected comma or closing bracket in list.");
            }
            throw new Error("Unterminated list literal.");
          };

          const parseDict = () => {
            const object = {};
            index += 1;
            while (index < input.length) {
              skip();
              if (input[index] === "}") {
                index += 1;
                return object;
              }
              const key = parseExpression();
              skip();
              if (input[index] !== ":") throw new Error("Expected colon in dictionary.");
              index += 1;
              object[String(key)] = parseExpression();
              skip();
              if (input[index] === ",") {
                index += 1;
                continue;
              }
              if (input[index] === "}") continue;
              throw new Error("Expected comma or closing brace in dictionary.");
            }
            throw new Error("Unterminated dictionary literal.");
          };

          const parseIdentifierOrCall = () => {
            const identifier = readIdentifier();
            if (!identifier) throw new Error("Expected identifier.");
            if (identifier === "True") return true;
            if (identifier === "False") return false;
            if (identifier === "None") return null;
            skip();
            if (input[index] !== "(") {
              return { __identifier: identifier };
            }
            index += 1;
            const positional = [];
            const kwargs = {};
            while (index < input.length) {
              skip();
              if (input[index] === ")") {
                index += 1;
                return { __call: identifier, args: positional, kwargs };
              }
              const beforeArgument = index;
              const maybeKey = readIdentifier();
              skip();
              if (maybeKey && input[index] === "=") {
                index += 1;
                kwargs[maybeKey] = parseExpression();
              } else {
                index = beforeArgument;
                positional.push(parseExpression());
              }
              skip();
              if (input[index] === ",") {
                index += 1;
                continue;
              }
              if (input[index] === ")") continue;
              throw new Error("Expected comma or closing parenthesis in call.");
            }
            throw new Error("Unterminated call expression.");
          };

          function parseExpression() {
            skip();
            const char = input[index];
            if (char === "\"" || char === "'") return parseString();
            if (char === "[") return parseList();
            if (char === "{") return parseDict();
            if (char === "-" || /[0-9]/.test(char || "")) return parseNumber();
            return parseIdentifierOrCall();
          }

          return {
            parseExpressionAt(position) {
              index = Math.max(0, Number(position) || 0);
              return parseExpression();
            },
          };
        }

        function getMetronomePythonCallKeyword(call, key, fallback = undefined) {
          return call && call.kwargs && Object.prototype.hasOwnProperty.call(call.kwargs, key)
            ? call.kwargs[key]
            : fallback;
        }

        function parseMetronomePythonSdkCode(source) {
          const input = String(source || "");
          const assignmentIndex = input.indexOf("workflow_definition");
          const searchStart = assignmentIndex >= 0 ? assignmentIndex : 0;
          const callIndex = input.indexOf("MetronomeWorkflow(", searchStart);
          if (callIndex < 0) {
            throw new Error("Could not find workflow_definition = MetronomeWorkflow(...).");
          }
          const parser = createMetronomePythonExpressionParser(input);
          const workflowCall = parser.parseExpressionAt(callIndex);
          if (!workflowCall || workflowCall.__call !== "MetronomeWorkflow") {
            throw new Error("Expected a MetronomeWorkflow constructor.");
          }
          const workflowName = String(getMetronomePythonCallKeyword(workflowCall, "name", "Untitled Metronome") || "Untitled Metronome");
          const nodeCalls = getMetronomePythonCallKeyword(workflowCall, "nodes", []);
          const edgeCalls = getMetronomePythonCallKeyword(workflowCall, "edges", []);
          if (!Array.isArray(nodeCalls)) throw new Error("MetronomeWorkflow nodes must be a list.");
          if (!Array.isArray(edgeCalls)) throw new Error("MetronomeWorkflow edges must be a list.");

          const nodeClassToKind = {
            TriggerNode: "trigger",
            ConditionNode: "condition",
            ThreadNode: "action",
            TicketNode: "ticket",
            ImagineNode: "imagine",
            FunctionNode: "function",
            FirecrawlNode: "firecrawl",
            TableNode: "table",
            DatabaseNode: "database",
            MetronomeRunNode: "metronome",
            LoopNode: "loop",
            EndNode: "end",
            NoteNode: "note",
          };
          const subtypeKeywordByClass = {
            TriggerNode: "trigger_type",
            TicketNode: "operation",
            ImagineNode: "operation",
            FirecrawlNode: "operation",
            TableNode: "operation",
            DatabaseNode: "operation",
            MetronomeRunNode: "operation",
            LoopNode: "loop_type",
          };
          const normalizeConfigObject = (value) => value && typeof value === "object" && !Array.isArray(value) && !value.__call
            ? { ...value }
            : {};
          const nodes = nodeCalls.map((nodeCall, nodeIndex) => {
            if (!nodeCall || typeof nodeCall !== "object" || !nodeCall.__call) {
              throw new Error("Each workflow node must be a node constructor.");
            }
            const className = nodeCall.__call;
            const kind = className === "MetronomeNode"
              ? String(getMetronomePythonCallKeyword(nodeCall, "kind", "action") || "action")
              : nodeClassToKind[className] || "action";
            const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
            const config = normalizeConfigObject(getMetronomePythonCallKeyword(nodeCall, "config", {}));
            const subtypeKeyword = subtypeKeywordByClass[className];
            let subtype = String(
              subtypeKeyword
                ? getMetronomePythonCallKeyword(nodeCall, subtypeKeyword, "")
                : getMetronomePythonCallKeyword(nodeCall, "subtype", "")
              || meta.subtypes[0]?.id
              || kind
            );
            if (className === "TicketNode") {
              subtype = normalizeMetronomeTicketOperation(subtype);
              config.operation = subtype;
            }
            if (className === "ConditionNode") {
              const parsedConditionType = normalizeMetronomeConditionType(
                getMetronomePythonCallKeyword(nodeCall, "condition_type", config.conditionType || subtype)
              );
              subtype = parsedConditionType;
              config.conditionType = parsedConditionType;
              config.conditions = normalizeMetronomeConditionBranches(
                getMetronomePythonCallKeyword(nodeCall, "conditions", config.conditions),
                parsedConditionType
              );
	              const databaseId = getMetronomePythonCallKeyword(nodeCall, "database_id", undefined);
              const databaseName = getMetronomePythonCallKeyword(nodeCall, "database_name", undefined);
              const databaseCollection = getMetronomePythonCallKeyword(nodeCall, "database_collection", getMetronomePythonCallKeyword(nodeCall, "collection", undefined));
	              const databaseDocumentId = getMetronomePythonCallKeyword(nodeCall, "database_document_id", undefined);
              const databaseFieldPath = getMetronomePythonCallKeyword(nodeCall, "database_field_path", undefined);
              const databaseOperator = getMetronomePythonCallKeyword(nodeCall, "database_operator", undefined);
              const databaseCompareValue = getMetronomePythonCallKeyword(nodeCall, "database_compare_value", undefined);
              const ticketProjectId = getMetronomePythonCallKeyword(nodeCall, "ticket_project_id", undefined);
              const ticketProjectName = getMetronomePythonCallKeyword(nodeCall, "ticket_project_name", undefined);
              const ticketId = getMetronomePythonCallKeyword(nodeCall, "ticket_id", undefined);
              const ticketStatusOperator = getMetronomePythonCallKeyword(nodeCall, "ticket_status_operator", undefined);
              const ticketStatusValue = getMetronomePythonCallKeyword(nodeCall, "ticket_status", undefined);
              if (databaseId !== undefined) config.databaseId = databaseId;
              if (databaseName !== undefined) config.databaseName = databaseName;
              if (databaseCollection !== undefined) config.databaseCollection = databaseCollection;
	              if (databaseDocumentId !== undefined) config.databaseDocumentId = databaseDocumentId;
              if (databaseFieldPath !== undefined) config.databaseFieldPath = databaseFieldPath;
              if (databaseOperator !== undefined) config.databaseOperator = databaseOperator;
              if (databaseCompareValue !== undefined) config.databaseCompareValue = databaseCompareValue;
              if (ticketProjectId !== undefined) config.ticketProjectId = ticketProjectId;
              if (ticketProjectName !== undefined) config.ticketProjectName = ticketProjectName;
              if (ticketId !== undefined) config.ticketId = ticketId;
              if (ticketStatusOperator !== undefined) config.ticketStatusOperator = ticketStatusOperator;
              if (ticketStatusValue !== undefined) config.ticketStatusValue = ticketStatusValue;
            }
            if (className === "ThreadNode") {
              const message = getMetronomePythonCallKeyword(nodeCall, "message", undefined);
              const agentId = getMetronomePythonCallKeyword(nodeCall, "agent_id", undefined);
              const agentName = getMetronomePythonCallKeyword(nodeCall, "agent_name", undefined);
              const computerId = getMetronomePythonCallKeyword(nodeCall, "computer_id", undefined);
              const computerName = getMetronomePythonCallKeyword(nodeCall, "computer_name", undefined);
              const projectId = getMetronomePythonCallKeyword(nodeCall, "project_id", undefined);
              const projectName = getMetronomePythonCallKeyword(nodeCall, "project_name", undefined);
              const inputContextScope = getMetronomePythonCallKeyword(nodeCall, "input_context_scope", undefined);
              const outputMode = getMetronomePythonCallKeyword(nodeCall, "output_mode", undefined);
              const outputKey = getMetronomePythonCallKeyword(nodeCall, "output_key", undefined);
              const requireJsonOutput = getMetronomePythonCallKeyword(nodeCall, "require_json_output", undefined);
              const outputFields = getMetronomePythonCallKeyword(nodeCall, "output_fields", undefined);
              const outputContract = getMetronomePythonCallKeyword(nodeCall, "output_contract", undefined);
              if (message !== undefined) config.message = message;
              if (agentId !== undefined) config.agentId = agentId;
              if (agentName !== undefined) config.agentName = agentName;
              if (computerId !== undefined) config.environmentId = computerId;
              if (computerName !== undefined) config.environmentName = computerName;
              if (projectId !== undefined) config.projectId = projectId;
              if (projectName !== undefined) config.projectName = projectName;
              if (inputContextScope !== undefined) config.inputContextScope = normalizeMetronomeInputContextScope(inputContextScope);
              if (outputMode !== undefined) config.outputMode = outputMode;
              if (outputKey !== undefined) config.outputKey = outputKey;
              if (requireJsonOutput !== undefined) config.requireJsonOutput = Boolean(requireJsonOutput);
              if (outputFields !== undefined) config.outputFieldsJson = typeof outputFields === "string" ? outputFields : JSON.stringify(outputFields, null, 2);
              if (outputContract !== undefined) config.outputContractJson = typeof outputContract === "string" ? outputContract : JSON.stringify(outputContract, null, 2);
              if (projectId || projectName) config.contextType = "project";
            }
            if (className === "TicketNode") {
              const projectId = getMetronomePythonCallKeyword(nodeCall, "project_id", undefined);
              const projectName = getMetronomePythonCallKeyword(nodeCall, "project_name", undefined);
              const ticketId = getMetronomePythonCallKeyword(nodeCall, "ticket_id", undefined);
              const title = getMetronomePythonCallKeyword(nodeCall, "title", undefined);
              const status = getMetronomePythonCallKeyword(nodeCall, "status", undefined);
              const comment = getMetronomePythonCallKeyword(nodeCall, "comment", undefined);
              const fields = getMetronomePythonCallKeyword(nodeCall, "fields", undefined);
              const adaptationInstructions = getMetronomePythonCallKeyword(nodeCall, "adaptation_instructions", getMetronomePythonCallKeyword(nodeCall, "instructions", undefined));
              const subtaskTitle = getMetronomePythonCallKeyword(nodeCall, "subtask_title", undefined);
              const subtaskInstructions = getMetronomePythonCallKeyword(nodeCall, "subtask_instructions", undefined);
              const workInstructions = getMetronomePythonCallKeyword(nodeCall, "work_instructions", undefined);
              const agentId = getMetronomePythonCallKeyword(nodeCall, "agent_id", undefined);
              const agentName = getMetronomePythonCallKeyword(nodeCall, "agent_name", undefined);
              const computerId = getMetronomePythonCallKeyword(nodeCall, "computer_id", undefined);
              const computerName = getMetronomePythonCallKeyword(nodeCall, "computer_name", undefined);
              if (projectId !== undefined) config.projectId = projectId;
              if (projectName !== undefined) config.projectName = projectName;
              if (ticketId !== undefined) config.ticketId = ticketId;
              if (title !== undefined) config.ticketTitle = title;
              if (status !== undefined) config.ticketStatus = status;
              if (comment !== undefined) config.comment = comment;
              if (fields !== undefined) config.fieldsJson = fields;
              if (adaptationInstructions !== undefined) config.adaptationInstructions = adaptationInstructions;
              if (subtaskTitle !== undefined) config.subtaskTitle = subtaskTitle;
              if (subtaskInstructions !== undefined) config.subtaskInstructions = subtaskInstructions;
              if (workInstructions !== undefined) config.workInstructions = workInstructions;
              if (agentId !== undefined) config.agentId = agentId;
              if (agentName !== undefined) config.agentName = agentName;
              if (computerId !== undefined) config.environmentId = computerId;
              if (computerName !== undefined) config.environmentName = computerName;
            }
            if (className === "ImagineNode") {
              const mediaMode = getMetronomePythonCallKeyword(nodeCall, "media_mode", undefined);
              const modelId = getMetronomePythonCallKeyword(nodeCall, "model_id", undefined);
              const imageModelId = getMetronomePythonCallKeyword(nodeCall, "image_model_id", undefined);
              const videoModelId = getMetronomePythonCallKeyword(nodeCall, "video_model_id", undefined);
              const templateId = getMetronomePythonCallKeyword(nodeCall, "template_id", undefined);
              const templateName = getMetronomePythonCallKeyword(nodeCall, "template_name", undefined);
              const prompt = getMetronomePythonCallKeyword(nodeCall, "prompt", undefined);
              const attachments = getMetronomePythonCallKeyword(nodeCall, "attachments", undefined);
              const projectId = getMetronomePythonCallKeyword(nodeCall, "project_id", undefined);
              const projectName = getMetronomePythonCallKeyword(nodeCall, "project_name", undefined);
              const agentId = getMetronomePythonCallKeyword(nodeCall, "agent_id", undefined);
              const agentName = getMetronomePythonCallKeyword(nodeCall, "agent_name", undefined);
              const computerId = getMetronomePythonCallKeyword(nodeCall, "computer_id", undefined);
              const computerName = getMetronomePythonCallKeyword(nodeCall, "computer_name", undefined);
              const inputContextScope = getMetronomePythonCallKeyword(nodeCall, "input_context_scope", undefined);
              const aspectRatio = getMetronomePythonCallKeyword(nodeCall, "aspect_ratio", undefined);
              if (mediaMode !== undefined) config.mediaMode = mediaMode;
              if (modelId !== undefined) config.modelId = modelId;
              if (imageModelId !== undefined) config.imageModelId = imageModelId;
              if (videoModelId !== undefined) config.videoModelId = videoModelId;
              if (templateId !== undefined) config.templateId = templateId;
              if (templateName !== undefined) config.templateName = templateName;
              if (prompt !== undefined) config.prompt = prompt;
              if (attachments !== undefined) config.attachmentsJson = attachments;
              if (projectId !== undefined) config.projectId = projectId;
              if (projectName !== undefined) config.projectName = projectName;
              if (agentId !== undefined) config.agentId = agentId;
              if (agentName !== undefined) config.agentName = agentName;
              if (computerId !== undefined) config.environmentId = computerId;
              if (computerName !== undefined) config.environmentName = computerName;
              if (inputContextScope !== undefined) config.inputContextScope = inputContextScope;
              if (aspectRatio !== undefined) config.aspectRatio = aspectRatio;
            }
            if (className === "FunctionNode") {
              const functionMode = getMetronomePythonCallKeyword(nodeCall, "function_mode", getMetronomePythonCallKeyword(nodeCall, "mode", undefined));
              const functionId = getMetronomePythonCallKeyword(nodeCall, "function_id", undefined);
              const functionName = getMetronomePythonCallKeyword(nodeCall, "function_name", undefined);
              const method = getMetronomePythonCallKeyword(nodeCall, "method", getMetronomePythonCallKeyword(nodeCall, "http_method", undefined));
              const url = getMetronomePythonCallKeyword(nodeCall, "url", getMetronomePythonCallKeyword(nodeCall, "request_url", getMetronomePythonCallKeyword(nodeCall, "endpoint", undefined)));
              const headers = getMetronomePythonCallKeyword(nodeCall, "headers", getMetronomePythonCallKeyword(nodeCall, "request_headers", undefined));
              const payload = getMetronomePythonCallKeyword(nodeCall, "payload", undefined);
              const outputKey = getMetronomePythonCallKeyword(nodeCall, "output_key", undefined);
              if (functionMode !== undefined) config.functionMode = normalizeMetronomeFunctionMode(functionMode);
              if (functionId !== undefined) config.functionId = functionId;
              if (functionName !== undefined) config.functionName = functionName;
              if (method !== undefined) {
                config.httpMethod = normalizeMetronomeFunctionHttpMethod(method);
                config.method = config.httpMethod;
              }
              if (url !== undefined) config.url = url;
              if (headers !== undefined) {
                config.requestHeaders = normalizeMetronomeFunctionHeaderRows(headers);
                config.requestHeadersJson = serializeMetronomeFunctionHeaderRows(config.requestHeaders);
              }
              if (payload !== undefined) config.payloadJson = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
              if (outputKey !== undefined) config.outputKey = outputKey;
              Object.assign(config, createDefaultMetronomeFunctionConfig(config));
            }
            if (className === "FirecrawlNode") {
              subtype = normalizeMetronomeFirecrawlOperation(subtype);
              config.operation = subtype;
              const credentialRef = getMetronomePythonCallKeyword(nodeCall, "credential_ref", undefined);
              const inputBinding = getMetronomePythonCallKeyword(nodeCall, "input_binding", undefined);
              const query = getMetronomePythonCallKeyword(nodeCall, "query", undefined);
              const url = getMetronomePythonCallKeyword(nodeCall, "url", undefined);
              const filePath = getMetronomePythonCallKeyword(nodeCall, "file_path", undefined);
              const prompt = getMetronomePythonCallKeyword(nodeCall, "prompt", undefined);
              const schema = getMetronomePythonCallKeyword(nodeCall, "schema", undefined);
              const limit = getMetronomePythonCallKeyword(nodeCall, "limit", undefined);
              const formats = getMetronomePythonCallKeyword(nodeCall, "formats", undefined);
              const saveArtifacts = getMetronomePythonCallKeyword(nodeCall, "save_artifacts", undefined);
              const outputKey = getMetronomePythonCallKeyword(nodeCall, "output_key", undefined);
              if (credentialRef !== undefined) config.credentialRef = credentialRef;
              if (inputBinding !== undefined) config.inputBinding = inputBinding;
              if (query !== undefined) config.query = query;
              if (url !== undefined) config.url = url;
              if (filePath !== undefined) config.filePath = filePath;
              if (prompt !== undefined) config.prompt = prompt;
              if (schema !== undefined) config.schemaJson = typeof schema === "string" ? schema : JSON.stringify(schema, null, 2);
              if (limit !== undefined) config.limit = limit;
              if (formats !== undefined) config.formats = formats;
              if (saveArtifacts !== undefined) config.saveArtifacts = Boolean(saveArtifacts);
              if (outputKey !== undefined) config.outputKey = outputKey;
            }
            if (className === "TableNode") {
              subtype = normalizeMetronomeTableOperation(subtype);
              config.operation = subtype;
              const inputBinding = getMetronomePythonCallKeyword(nodeCall, "input_binding", undefined);
              const filePath = getMetronomePythonCallKeyword(nodeCall, "file_path", undefined);
              const delimiter = getMetronomePythonCallKeyword(nodeCall, "delimiter", undefined);
              const hasHeader = getMetronomePythonCallKeyword(nodeCall, "has_header", undefined);
              const batchSize = getMetronomePythonCallKeyword(nodeCall, "batch_size", undefined);
              const outputKey = getMetronomePythonCallKeyword(nodeCall, "output_key", undefined);
              if (inputBinding !== undefined) config.inputBinding = inputBinding;
              if (filePath !== undefined) config.filePath = filePath;
              if (delimiter !== undefined) config.delimiter = delimiter;
              if (hasHeader !== undefined) config.hasHeader = Boolean(hasHeader);
              if (batchSize !== undefined) config.batchSize = batchSize;
              if (outputKey !== undefined) config.outputKey = outputKey;
            }
            if (className === "DatabaseNode") {
              const databaseId = getMetronomePythonCallKeyword(nodeCall, "database_id", undefined);
              const databaseName = getMetronomePythonCallKeyword(nodeCall, "database_name", undefined);
              const collection = getMetronomePythonCallKeyword(nodeCall, "collection", undefined);
              const documentId = getMetronomePythonCallKeyword(nodeCall, "document_id", undefined);
              const document = getMetronomePythonCallKeyword(nodeCall, "document", undefined);
              const inputBinding = getMetronomePythonCallKeyword(nodeCall, "input_binding", undefined);
              const recordsBinding = getMetronomePythonCallKeyword(nodeCall, "records_binding", undefined);
              const documentTemplate = getMetronomePythonCallKeyword(nodeCall, "document_template", undefined);
              const upsertKey = getMetronomePythonCallKeyword(nodeCall, "upsert_key", undefined);
              if (databaseId !== undefined) config.databaseId = databaseId;
              if (databaseName !== undefined) config.databaseName = databaseName;
              if (collection !== undefined) config.collection = collection;
              if (documentId !== undefined) config.documentId = documentId;
              if (document !== undefined) config.document = document;
              if (inputBinding !== undefined) config.inputBinding = inputBinding;
              if (recordsBinding !== undefined) config.recordsBinding = recordsBinding;
              if (documentTemplate !== undefined) config.documentTemplateJson = typeof documentTemplate === "string" ? documentTemplate : JSON.stringify(documentTemplate, null, 2);
              if (upsertKey !== undefined) config.upsertKey = upsertKey;
            }
            if (className === "MetronomeRunNode") {
              const workflowId = getMetronomePythonCallKeyword(nodeCall, "workflow_id", undefined);
              const workflowName = getMetronomePythonCallKeyword(nodeCall, "workflow_name", undefined);
              if (workflowId !== undefined) config.workflowId = workflowId;
              if (workflowName !== undefined) config.workflowName = workflowName;
            }
            if (className === "LoopNode") {
              const loopType = normalizeMetronomeLoopType(
                getMetronomePythonCallKeyword(nodeCall, "loop_type", config.loopType || subtype)
              );
              subtype = loopType;
              config.loopType = loopType;
              const iterations = getMetronomePythonCallKeyword(nodeCall, "iterations", undefined);
              const maxIterations = getMetronomePythonCallKeyword(nodeCall, "max_iterations", undefined);
              const inputBinding = getMetronomePythonCallKeyword(nodeCall, "input_binding", undefined);
              const contextContains = getMetronomePythonCallKeyword(nodeCall, "context_contains", undefined);
              const projectId = getMetronomePythonCallKeyword(nodeCall, "project_id", undefined);
              const projectName = getMetronomePythonCallKeyword(nodeCall, "project_name", undefined);
              const ticketStatus = getMetronomePythonCallKeyword(nodeCall, "ticket_status", undefined);
              const databaseId = getMetronomePythonCallKeyword(nodeCall, "database_id", undefined);
              const databaseName = getMetronomePythonCallKeyword(nodeCall, "database_name", undefined);
              const databaseCollection = getMetronomePythonCallKeyword(nodeCall, "database_collection", getMetronomePythonCallKeyword(nodeCall, "collection", undefined));
              const databaseFieldPath = getMetronomePythonCallKeyword(nodeCall, "database_field_path", undefined);
              const databaseOperator = getMetronomePythonCallKeyword(nodeCall, "database_operator", undefined);
              const databaseCompareValue = getMetronomePythonCallKeyword(nodeCall, "database_compare_value", undefined);
              const databaseLimit = getMetronomePythonCallKeyword(nodeCall, "database_limit", undefined);
              if (iterations !== undefined) config.iterations = iterations;
              if (maxIterations !== undefined) config.maxIterations = maxIterations;
              if (inputBinding !== undefined) config.inputBinding = inputBinding;
              if (contextContains !== undefined) config.contextContainsText = contextContains;
              if (projectId !== undefined) config.projectId = projectId;
              if (projectName !== undefined) config.projectName = projectName;
              if (ticketStatus !== undefined) config.ticketStatusValue = ticketStatus;
              if (databaseId !== undefined) config.databaseId = databaseId;
              if (databaseName !== undefined) config.databaseName = databaseName;
              if (databaseCollection !== undefined) config.databaseCollection = databaseCollection;
              if (databaseFieldPath !== undefined) config.databaseFieldPath = databaseFieldPath;
              if (databaseOperator !== undefined) config.databaseOperator = databaseOperator;
              if (databaseCompareValue !== undefined) config.databaseCompareValue = databaseCompareValue;
              if (databaseLimit !== undefined) config.databaseLimit = databaseLimit;
              const breakCondition = getMetronomePythonCallKeyword(nodeCall, "break_condition", undefined);
              if (breakCondition !== undefined) config.rule = breakCondition;
            }
            if (className === "NoteNode") {
              const text = getMetronomePythonCallKeyword(nodeCall, "text", undefined);
              if (text !== undefined) config.message = text;
            }
            const position = getMetronomePythonCallKeyword(nodeCall, "position", null);
            const normalizedPosition = position && typeof position === "object" && !Array.isArray(position)
              ? { x: Number(position.x) || 120 + nodeIndex * 280, y: Number(position.y) || 160 }
              : { x: 120 + nodeIndex * 280, y: 160 };
            return {
              id: String(getMetronomePythonCallKeyword(nodeCall, "id", "node_" + (nodeIndex + 1)) || "node_" + (nodeIndex + 1)),
              type: "metronome",
              position: normalizedPosition,
              data: {
                kind,
                subtype,
                label: String(getMetronomePythonCallKeyword(nodeCall, "label", meta.label) || meta.label),
                description: String(getMetronomePythonCallKeyword(nodeCall, "description", getMetronomeSubtypeLabel(kind, subtype)) || ""),
                config,
              },
            };
          });
          const edges = normalizeMetronomeEdges(edgeCalls.map((edgeCall, edgeIndex) => {
            if (!edgeCall || typeof edgeCall !== "object" || edgeCall.__call !== "MetronomeEdge") {
              throw new Error("Each workflow edge must be a MetronomeEdge constructor.");
            }
            return {
              id: String(getMetronomePythonCallKeyword(edgeCall, "id", "edge_" + (edgeIndex + 1)) || "edge_" + (edgeIndex + 1)),
              source: String(getMetronomePythonCallKeyword(edgeCall, "source", "") || ""),
              target: String(getMetronomePythonCallKeyword(edgeCall, "target", "") || ""),
              sourceHandle: getMetronomePythonCallKeyword(edgeCall, "source_handle", undefined) || undefined,
              targetHandle: getMetronomePythonCallKeyword(edgeCall, "target_handle", undefined) || undefined,
            };
          }));
          return { name: workflowName, nodes, edges };
        }

        function extractMetronomeReturnedListSource(source, functionName) {
          const input = String(source || "");
          const normalizedFunctionName = String(functionName || "").trim();
          if (!normalizedFunctionName) throw new Error("Missing function name.");
          const functionIndex = input.indexOf("def " + normalizedFunctionName + "(");
          if (functionIndex < 0) throw new Error("Could not find " + normalizedFunctionName + "().");
          const returnIndex = input.indexOf("return", functionIndex);
          if (returnIndex < 0) throw new Error("Could not find return statement in " + normalizedFunctionName + "().");
          const listStart = input.indexOf("[", returnIndex);
          if (listStart < 0) throw new Error(normalizedFunctionName + "() must return a list.");
          let depth = 0;
          let quote = "";
          let escaped = false;
          let inComment = false;
          for (let index = listStart; index < input.length; index += 1) {
            const char = input[index];
            if (inComment) {
              if (char === "\n") inComment = false;
              continue;
            }
            if (quote) {
              if (escaped) {
                escaped = false;
                continue;
              }
              if (char === "\\") {
                escaped = true;
                continue;
              }
              if (char === quote) quote = "";
              continue;
            }
            if (char === "#") {
              inComment = true;
              continue;
            }
            if (char === "\"" || char === "'") {
              quote = char;
              continue;
            }
            if (char === "[") depth += 1;
            if (char === "]") {
              depth -= 1;
              if (depth === 0) {
                return input.slice(listStart, index + 1);
              }
            }
          }
          throw new Error("Could not parse list returned by " + normalizedFunctionName + "().");
        }

        function parseMetronomeWorkflowNameFromMainFile(source, fallbackName = "Untitled Metronome") {
          const input = String(source || "");
          const callIndex = input.indexOf("MetronomeWorkflow(");
          if (callIndex >= 0) {
            try {
              const parser = createMetronomePythonExpressionParser(input);
              const workflowCall = parser.parseExpressionAt(callIndex);
              const parsedName = getMetronomePythonCallKeyword(workflowCall, "name", "");
              if (parsedName) return String(parsedName);
            } catch (_error) {}
          }
          return String(fallbackName || "Untitled Metronome");
        }

        function getMetronomeCodeFileSource(files, path) {
          const normalizedPath = String(path || "").trim();
          const file = (Array.isArray(files) ? files : []).find((entry) => String(entry?.path || entry?.name || "").trim() === normalizedPath);
          return String(file?.value || "");
        }

        function parseMetronomePythonSdkFiles(files, fallbackName = "Untitled Metronome") {
          const mainSource = getMetronomeCodeFileSource(files, "main.py");
          const nodesSource = getMetronomeCodeFileSource(files, "nodes.py");
          const edgesSource = getMetronomeCodeFileSource(files, "edges.py");
          if (nodesSource && edgesSource) {
            const workflowName = parseMetronomeWorkflowNameFromMainFile(mainSource, fallbackName);
            const nodeListSource = extractMetronomeReturnedListSource(nodesSource, "build_nodes");
            const edgeListSource = extractMetronomeReturnedListSource(edgesSource, "build_edges");
            return parseMetronomePythonSdkCode([
              "workflow_definition = MetronomeWorkflow(",
              "    name=" + escapeMetronomePythonString(workflowName) + ",",
              "    nodes=" + nodeListSource + ",",
              "    edges=" + edgeListSource + ",",
              ")",
            ].join("\n"));
          }
          if (mainSource) return parseMetronomePythonSdkCode(mainSource);
          throw new Error("Metronome code must include main.py, nodes.py, and edges.py.");
        }

        function replaceMetronomeWorkflow(workflows, nextWorkflow) {
          const normalized = normalizeMetronomeWorkflow(nextWorkflow);
          if (!normalized.id) return workflows;
          const seen = new Set();
          const next = workflows.map((workflow) => {
            if (workflow.id !== normalized.id) return workflow;
            seen.add(normalized.id);
            return mergeMetronomeWorkflowGraphFallback(workflow, normalized);
          });
          return seen.has(normalized.id) ? next : [normalized, ...next];
        }

        function replaceMetronomeWorkflowById(workflows, oldWorkflowId, nextWorkflow) {
          const normalized = normalizeMetronomeWorkflow(nextWorkflow);
          if (!normalized.id) return workflows;
          const oldId = String(oldWorkflowId || "").trim();
          let replaced = false;
          let inserted = false;
          const next = (Array.isArray(workflows) ? workflows : []).reduce((items, workflow) => {
            const workflowId = String(workflow?.id || "").trim();
            if (workflowId === oldId || workflowId === normalized.id) {
              replaced = true;
              if (!inserted) {
                items.push(mergeMetronomeWorkflowGraphFallback(workflow, normalized));
                inserted = true;
              }
              return items;
            }
            items.push(workflow);
            return items;
          }, []);
          return replaced ? next : [normalized, ...next];
        }

        function hasMetronomeWorkflowGraphEdges(workflow) {
          const source = workflow && typeof workflow === "object" ? workflow : {};
          const definition = source.definition && typeof source.definition === "object" ? source.definition : {};
          const edges = Array.isArray(source.edges)
            ? source.edges
            : Array.isArray(definition.edges)
              ? definition.edges
              : [];
          return edges.length > 0;
        }

        function hasMetronomeWorkflowGraphNodes(workflow) {
          const source = workflow && typeof workflow === "object" ? workflow : {};
          const definition = source.definition && typeof source.definition === "object" ? source.definition : {};
          const nodes = Array.isArray(source.nodes)
            ? source.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : [];
          return nodes.length > 0;
        }

        function mergeMetronomeWorkflowGraphFallback(previousWorkflow, nextWorkflow) {
          const next = normalizeMetronomeWorkflow(nextWorkflow);
          if (!next.id) return next;
          const previous = previousWorkflow ? normalizeMetronomeWorkflow(previousWorkflow) : null;
          if (!previous || previous.id !== next.id || hasMetronomeWorkflowGraphEdges(next) || !hasMetronomeWorkflowGraphEdges(previous)) {
            return next;
          }
          const fallbackNodes = hasMetronomeWorkflowGraphNodes(next) ? next.nodes : previous.nodes;
          const fallbackEdges = normalizeMetronomeEdgesForNodes(previous.edges, fallbackNodes);
          if (!fallbackEdges.length) return next;
          return normalizeMetronomeWorkflow({
            ...next,
            nodes: fallbackNodes,
            edges: fallbackEdges,
          });
        }

        function mergeMetronomeTeamSharedWorkflowGraphSnapshot(sharedWorkflow, loadedWorkflow) {
          const shared = normalizeMetronomeWorkflow(sharedWorkflow || {});
          const loaded = normalizeMetronomeWorkflow(loadedWorkflow || {});
          if (!shared.id) return loaded.id ? loaded : null;
          if (!loaded.id) return shared;
          const sharedMetadata = readMetronomeWorkflowMetadata(sharedWorkflow || shared);
          const loadedMetadata = readMetronomeWorkflowMetadata(loadedWorkflow || loaded);
          const nodes = hasMetronomeWorkflowGraphNodes(loaded) ? loaded.nodes : shared.nodes;
          const edges = hasMetronomeWorkflowGraphEdges(loaded) ? loaded.edges : shared.edges;
          const creator = normalizeMetronomeWorkflowCreator(sharedWorkflow, sharedMetadata)
            || normalizeMetronomeWorkflowCreator(loadedWorkflow, loadedMetadata);
          const deployments = Array.isArray(loaded.deployments) && loaded.deployments.length
            ? loaded.deployments
            : Array.isArray(shared.deployments)
              ? shared.deployments
              : [];
          const activeDeploymentId = String(
            loaded.activeDeploymentId
            || loadedMetadata.activeDeploymentId
            || loadedMetadata.active_deployment_id
            || shared.activeDeploymentId
            || sharedMetadata.activeDeploymentId
            || sharedMetadata.active_deployment_id
            || ""
          ).trim();
          const activeDeploymentVersion = Number(
            loaded.activeDeploymentVersion
            || loadedMetadata.activeDeploymentVersion
            || loadedMetadata.active_deployment_version
            || shared.activeDeploymentVersion
            || sharedMetadata.activeDeploymentVersion
            || sharedMetadata.active_deployment_version
            || 0
          ) || 0;
          const publishedAt = String(
            loaded.publishedAt
            || loadedMetadata.publishedAt
            || loadedMetadata.published_at
            || shared.publishedAt
            || sharedMetadata.publishedAt
            || sharedMetadata.published_at
            || ""
          ).trim();
          const teamShare = sharedMetadata.teamShare
            || sharedMetadata.team_share
            || loadedMetadata.teamShare
            || loadedMetadata.team_share
            || null;
          const metadata = {
            ...loadedMetadata,
            ...sharedMetadata,
            ...buildMetronomeWorkflowCreatorMetadata(creator),
            deployments,
            metronomeDeployments: deployments,
            resourceType: "metronome_workflow",
            resourceKind: "metronome_workflow",
            sharedViaTeam: true,
            shared_via_team: true,
            ...(teamShare ? { teamShare } : {}),
            ...(activeDeploymentId ? { activeDeploymentId, active_deployment_id: activeDeploymentId } : {}),
            ...(activeDeploymentVersion ? { activeDeploymentVersion, active_deployment_version: activeDeploymentVersion } : {}),
            ...(publishedAt ? { publishedAt, published_at: publishedAt } : {}),
          };
          return normalizeMetronomeWorkflow({
            ...loaded,
            ...shared,
            id: shared.id || loaded.id,
            name: shared.name || loaded.name || "Untitled Metronome",
            description: shared.description || loaded.description || "",
            status: sharedWorkflow?.status || sharedMetadata.status || loaded.status || shared.status || "draft",
            triggerSummary: loaded.triggerSummary || shared.triggerSummary || deriveMetronomeTriggerSummary(nodes),
            lastRunAt: loaded.lastRunAt || shared.lastRunAt || "",
            runsToday: loaded.runsToday || shared.runsToday || 0,
            waitingApprovals: loaded.waitingApprovals || shared.waitingApprovals || 0,
            projectId: shared.projectId || loaded.projectId || "",
            projectName: shared.projectName || loaded.projectName || "",
            ...(creator ? { creator } : {}),
            metadata,
            deployments,
            activeDeploymentId,
            activeDeploymentVersion,
            publishedAt,
            nodes,
            edges,
            createdAt: shared.createdAt || loaded.createdAt || "",
            updatedAt: loaded.updatedAt || shared.updatedAt || "",
          });
        }

        function mergeMetronomeWorkflowListPreservingGraphs(nextWorkflows, currentWorkflows, fallbackWorkflows = []) {
          const previousById = new Map();
          [...(Array.isArray(fallbackWorkflows) ? fallbackWorkflows : []), ...(Array.isArray(currentWorkflows) ? currentWorkflows : [])]
            .forEach((workflow) => {
              const workflowId = String(workflow?.id || "").trim();
              if (workflowId) previousById.set(workflowId, workflow);
            });
          return (Array.isArray(nextWorkflows) ? nextWorkflows : []).map((workflow) => {
            const workflowId = String(workflow?.id || "").trim();
            return mergeMetronomeWorkflowGraphFallback(previousById.get(workflowId), workflow);
          });
        }

        function formatMetronomeDate(value) {
          if (!value) return "Never";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "Never";
          return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        }
`;
