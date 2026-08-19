export const METRONOME_TRIGGERS_03_FRAGMENT = String.raw`
        const METRONOME_MANUAL_RUN_COMPOSER_TRIGGER_TYPES = new Set([
          "thread_event",
          "email",
          "telegram",
          "project_ticket",
          "periodic",
          "manual",
        ]);

        const METRONOME_MANUAL_RUN_TRIGGER_LABELS = Object.freeze({
          thread_event: "Thread event",
          email: "Email received",
          telegram: "Telegram message",
          project_ticket: "Project ticket event",
          periodic: "Periodic schedule",
          function: "Function payload",
          github: "GitHub event",
          resource: "Resource event",
          database_entry: "Database entry added",
          auth: "Auth event",
          manual: "Manual input",
        });

        function normalizeMetronomeManualRunTriggerType(value) {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
          if (normalized === "thread" || normalized === "message" || normalized === "chat") return "thread_event";
          if (normalized === "ticket" || normalized === "project") return "project_ticket";
          if (normalized === "schedule" || normalized === "scheduled") return "periodic";
          return METRONOME_MANUAL_RUN_TRIGGER_LABELS[normalized] ? normalized : "manual";
        }

        function getMetronomeManualRunNodeId(node) {
          return String(node?.id || node?.data?.id || "").trim();
        }

        function getMetronomeManualRunTriggerType(node) {
          const config = getMetronomeNodeConfigRecord(node);
          return normalizeMetronomeManualRunTriggerType(
            config.triggerType
            || config.trigger_type
            || getMetronomeNodeSubtypeValue(node)
          );
        }

        function findMetronomeManualRunComposerNode(triggerNode, nodes, edges) {
          const sourceNodes = Array.isArray(nodes) ? nodes : [];
          const sourceEdges = Array.isArray(edges) ? edges : [];
          const nodesById = new Map(sourceNodes.map((node) => [getMetronomeManualRunNodeId(node), node]));
          const triggerNodeId = getMetronomeManualRunNodeId(triggerNode);
          const queue = triggerNodeId ? [triggerNodeId] : [];
          const visited = new Set();
          while (queue.length) {
            const nodeId = queue.shift();
            if (!nodeId || visited.has(nodeId)) continue;
            visited.add(nodeId);
            const node = nodesById.get(nodeId);
            if (node && getMetronomeNodeKindValue(node) === "action") return node;
            sourceEdges.forEach((edge) => {
              if (String(edge?.source || "").trim() !== nodeId) return;
              const targetId = String(edge?.target || "").trim();
              if (targetId && !visited.has(targetId)) queue.push(targetId);
            });
          }
          return sourceNodes.find((node) => getMetronomeNodeKindValue(node) === "action") || null;
        }

        function resolveMetronomeManualRunComposerBinding(triggerNode, nodes, edges, options = {}) {
          const composerNode = findMetronomeManualRunComposerNode(triggerNode, nodes, edges);
          const config = getMetronomeNodeConfigRecord(composerNode);
          const agentOptions = Array.isArray(options.agentOptions) ? options.agentOptions : [];
          const environmentOptions = Array.isArray(options.environmentOptions) ? options.environmentOptions : [];
          const projectOptions = Array.isArray(options.projectOptions) ? options.projectOptions : [];
          const projectId = String(config.projectId || config.project_id || "").trim();
          const project = projectOptions.find((option) => String(option?.id || "") === projectId) || null;
          const configuredEnvironmentId = String(
            config.environmentId
            || config.environment_id
            || config.computerId
            || config.computer_id
            || ""
          ).trim();
          const environmentId = configuredEnvironmentId
            || getMetronomeProjectEnvironmentId(project)
            || String(environmentOptions[0]?.id || "").trim();
          const agentId = String(
            config.agentId
            || config.agent_id
            || agentOptions[0]?.id
            || ""
          ).trim();
          return {
            nodeId: getMetronomeManualRunNodeId(composerNode),
            agentId,
            agentName: String(
              agentOptions.find((option) => String(option?.id || "") === agentId)?.name
              || config.agentName
              || config.agent_name
              || agentId
              || "Agent"
            ).trim(),
            environmentId,
            environmentName: String(
              environmentOptions.find((option) => String(option?.id || "") === environmentId)?.name
              || config.environmentName
              || config.environment_name
              || environmentId
              || "Computer"
            ).trim(),
            projectId,
          };
        }

        function prefixMetronomeManualRunFields(fields, prefix) {
          return (Array.isArray(fields) ? fields : []).map((field) => ({
            ...field,
            id: prefix + "." + field.id,
            path: prefix + "." + field.path,
          }));
        }

        function createMetronomeManualRunStructuredFields(workflow, triggerNode, triggerType, options = {}) {
          const config = getMetronomeNodeConfigRecord(triggerNode);
          const field = (path, label, fieldOptions = {}) => createMetronomeNodeTestInputField(path, label, fieldOptions);
          if (triggerType === "function") {
            const shape = getMetronomeNodeTestInputObject(config, [
              "payloadSchemaJson",
              "payload_schema_json",
              "payloadSchema",
              "payload_schema",
              "samplePayloadJson",
              "sample_payload_json",
              "expectedPayload",
              "expected_payload",
            ]) || buildMetronomeFunctionTriggerPayloadSchema(
              normalizeMetronomeFunctionTriggerPayloadFields(config.payloadFields || config.payload_fields)
            );
            const fields = collectMetronomeNodeTestInputFields(shape);
            return fields.length
              ? prefixMetronomeManualRunFields(fields, "payload")
              : [field("payload.input", "Payload input", {
                  required: true,
                  placeholder: "Enter the value delivered to this function trigger",
                })];
          }
          if (triggerType === "github") {
            const defaults = buildDefaultMetronomeGitHubTriggerConfig(config);
            return [
              field("github.eventType", "Event", {
                control: "selector",
                required: true,
                defaultValue: defaults.githubEventType,
                options: METRONOME_GITHUB_EVENT_OPTIONS,
              }),
              field("github.repositoryFullName", "Repository", {
                required: true,
                defaultValue: defaults.githubRepositoryContains,
                placeholder: "organization/repository",
              }),
              field("github.branch", "Branch", { defaultValue: defaults.githubBranchContains, placeholder: "main" }),
              field("github.action", "Action", { defaultValue: defaults.githubActionContains, placeholder: "opened" }),
              field("github.senderLogin", "Actor", { defaultValue: defaults.githubActorContains, placeholder: "octocat" }),
              field("github.title", "Title"),
              field("github.body", "Body", { control: "textarea" }),
              field("github.url", "URL", { control: "url", placeholder: "https://github.com/..." }),
            ];
          }
          if (triggerType === "resource") {
            const defaults = buildDefaultMetronomeResourceTriggerConfig(config);
            const eventType = normalizeMetronomeResourceEventType(defaults.resourceEventType);
            const resourceOptions = eventType === "function_deployed"
              ? options.functionOptions
              : options.webAppOptions;
            const normalizedResourceOptions = (Array.isArray(resourceOptions) ? resourceOptions : []).map((option) => ({
              value: option.id,
              label: option.name || option.id,
            }));
            const fixedResource = Boolean(defaults.resourceId);
            return [
              field("resource.eventType", "Event", {
                control: "selector",
                required: true,
                defaultValue: eventType,
                options: METRONOME_RESOURCE_EVENT_OPTIONS,
              }),
              {
                ...field("resource.resourceId", "Resource", {
                  control: normalizedResourceOptions.length ? "selector" : "text",
                  required: true,
                  defaultValue: defaults.resourceId,
                  options: normalizedResourceOptions,
                }),
                readOnly: fixedResource,
              },
              field("resource.resourceName", "Resource name", { defaultValue: defaults.resourceName }),
              field("resource.resourceKind", "Resource type", {
                control: "selector",
                required: true,
                defaultValue: defaults.resourceKind || (eventType === "function_deployed" ? "function" : "web_app"),
                options: [{ value: "function", label: "Function" }, { value: "web_app", label: "Web app" }],
              }),
              field("resource.deploymentId", "Deployment ID", { required: true }),
              field("resource.deploymentType", "Deployment type", { defaultValue: "manual" }),
              field("resource.revision", "Revision"),
              field("resource.serviceUrl", "Service URL", { control: "url" }),
            ];
          }
          if (triggerType === "database_entry") {
            const defaults = buildDefaultMetronomeDatabaseEntryTriggerConfig(config);
            const databaseOptions = (Array.isArray(options.databaseOptions) ? options.databaseOptions : []).map((option) => ({
              value: option.id,
              label: option.name || option.id,
            }));
            return [
              field("databaseEntry.eventType", "Event", {
                control: "selector",
                required: true,
                defaultValue: defaults.databaseEventType,
                options: METRONOME_DATABASE_ENTRY_EVENT_OPTIONS,
              }),
              {
                ...field("databaseEntry.databaseId", "Database", {
                  control: databaseOptions.length ? "selector" : "text",
                  required: true,
                  defaultValue: defaults.databaseId,
                  options: databaseOptions,
                }),
                readOnly: Boolean(defaults.databaseId),
              },
              field("databaseEntry.databaseName", "Database name", { defaultValue: defaults.databaseName }),
              {
                ...field("databaseEntry.collectionId", "Collection", {
                  required: true,
                  defaultValue: defaults.databaseCollection,
                  placeholder: "customers",
                }),
                readOnly: Boolean(defaults.databaseCollection),
              },
              field("databaseEntry.documentId", "Document ID", { required: true }),
              field("databaseEntry.collectionName", "Collection name", { defaultValue: defaults.databaseCollection }),
              field("databaseEntry.document.title", "Document title"),
              field("databaseEntry.document.content", "Document content", { control: "textarea" }),
            ];
          }
          if (triggerType === "auth") {
            const defaults = buildDefaultMetronomeAuthTriggerConfig(config);
            const authOptions = (Array.isArray(options.authOptions) ? options.authOptions : []).map((option) => ({
              value: option.id,
              label: option.name || option.id,
            }));
            return [
              field("auth.eventType", "Event", {
                control: "selector",
                required: true,
                defaultValue: defaults.authEventType,
                options: METRONOME_AUTH_EVENT_OPTIONS,
              }),
              {
                ...field("auth.authResourceId", "Authentication resource", {
                  control: authOptions.length ? "selector" : "text",
                  required: true,
                  defaultValue: defaults.authResourceId,
                  options: authOptions,
                }),
                readOnly: Boolean(defaults.authResourceId),
              },
              field("auth.authResourceName", "Resource name", { defaultValue: defaults.authResourceName }),
              field("auth.authUserId", "User ID", { required: true }),
              field("auth.email", "Email", {
                required: true,
                defaultValue: defaults.authEmailContains,
                placeholder: "person@example.com",
              }),
              field("auth.displayName", "Display name"),
            ];
          }
          return [];
        }

        function createMetronomeManualRunContract(workflow, triggerNode, nodes, edges, options = {}) {
          const triggerType = triggerNode ? getMetronomeManualRunTriggerType(triggerNode) : "manual";
          const nodeId = getMetronomeManualRunNodeId(triggerNode) || "manual";
          const label = METRONOME_MANUAL_RUN_TRIGGER_LABELS[triggerType] || "Manual input";
          const composerMode = METRONOME_MANUAL_RUN_COMPOSER_TRIGGER_TYPES.has(triggerType);
          const inputFields = composerMode
            ? [createMetronomeNodeTestInputField("prompt", triggerType === "periodic" ? "Optional prompt" : "Prompt", {
                control: "task-input",
                required: triggerType !== "periodic",
                placeholder: triggerType === "periodic"
                  ? "Optionally add instructions for this scheduled run"
                  : "Describe the input for this workflow run",
              })]
            : createMetronomeManualRunStructuredFields(workflow, triggerNode, triggerType, options);
          return {
            id: nodeId + ":" + triggerType,
            nodeId,
            triggerType,
            label,
            mode: composerMode ? "composer" : "structured",
            inputFields,
            composerBinding: composerMode
              ? resolveMetronomeManualRunComposerBinding(triggerNode, nodes, edges, options)
              : null,
            triggerConfig: triggerNode ? getMetronomeNodeConfigRecord(triggerNode) : {},
          };
        }

        function createMetronomeManualRunContracts(workflow, nodes, edges, options = {}) {
          const triggerNodes = (Array.isArray(nodes) ? nodes : [])
            .filter((node) => getMetronomeNodeKindValue(node) === "trigger");
          const source = triggerNodes.length ? triggerNodes : [null];
          return source.map((triggerNode) => createMetronomeManualRunContract(
            workflow,
            triggerNode,
            nodes,
            edges,
            options
          ));
        }

        function buildMetronomeManualRunStructuredPrompt(triggerType, fixture = {}) {
          const safeJson = (value) => {
            try {
              return JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);
            } catch (_error) {
              return "{}";
            }
          };
          if (triggerType === "function") {
            return "A function trigger was invoked with this payload:\n" + safeJson(fixture.payload);
          }
          if (triggerType === "github") {
            const event = fixture.github || {};
            return [
              "GitHub " + String(event.eventType || "event") + " received",
              event.repositoryFullName ? "for " + event.repositoryFullName : "",
              event.branch ? "on " + event.branch : "",
              event.title || event.body || "",
            ].filter(Boolean).join(" ").trim() + ".";
          }
          if (triggerType === "resource") {
            const event = fixture.resource || {};
            return [
              String(event.resourceKind || "Resource"),
              event.resourceName || event.resourceId || "",
              "received a " + String(event.eventType || "deployment") + " event",
              event.revision ? "for revision " + event.revision : "",
            ].filter(Boolean).join(" ").trim() + ".";
          }
          if (triggerType === "database_entry") {
            const event = fixture.databaseEntry || {};
            return [
              "Database document " + String(event.eventType || "event") + " received",
              event.databaseName || event.databaseId ? "in " + String(event.databaseName || event.databaseId) : "",
              event.collectionName || event.collectionId ? "/ " + String(event.collectionName || event.collectionId) : "",
              event.documentId ? "for document " + event.documentId : "",
              "with data:\n" + safeJson(event.document),
            ].filter(Boolean).join(" ").trim();
          }
          if (triggerType === "auth") {
            const event = fixture.auth || {};
            return [
              "Authentication " + String(event.eventType || "event") + " received",
              event.authResourceName || event.authResourceId ? "from " + String(event.authResourceName || event.authResourceId) : "",
              event.email ? "for " + event.email : "",
              event.displayName ? "(" + event.displayName + ")" : "",
            ].filter(Boolean).join(" ").trim() + ".";
          }
          return "";
        }

        function buildMetronomeManualRunInput(contract, fixture = {}, composerPayload = null) {
          const triggerType = normalizeMetronomeManualRunTriggerType(contract?.triggerType);
          const triggerConfig = contract?.triggerConfig && typeof contract.triggerConfig === "object"
            ? contract.triggerConfig
            : {};
          const prompt = String(
            fixture?.prompt
            || composerPayload?.prompt
            || buildMetronomeManualRunStructuredPrompt(triggerType, fixture)
            || ""
          ).trim();
          const attachments = Array.isArray(composerPayload?.attachments)
            ? composerPayload.attachments.filter(Boolean)
            : [];
          const now = new Date().toISOString();
          const input = {
            source: triggerType === "manual" ? "manual_ui" : triggerType,
            triggerType,
            simulatedTriggerType: triggerType,
            simulation: {
              mode: "manual",
              triggerType,
              simulatedAt: now,
            },
            ...(prompt ? { prompt, message: prompt } : {}),
            ...(attachments.length ? { attachments, files: attachments } : {}),
          };
          if (triggerType === "thread_event" || triggerType === "manual") {
            const agentId = contract?.composerBinding?.agentId || null;
            const environmentId = contract?.composerBinding?.environmentId || null;
            const projectId = contract?.composerBinding?.projectId || null;
            return {
              ...input,
              ...(triggerType === "thread_event" ? { source: "thread_event" } : {}),
              threadId: "manual-run",
              originThreadId: "manual-run",
              sourceThreadId: "manual-run",
              messageId: null,
              originMessageId: null,
              agentId,
              environmentId,
              projectId,
              thread: {
                message: prompt,
                agentId,
                environmentId,
                projectId,
              },
            };
          }
          if (triggerType === "email") {
            const emailConfig = buildDefaultMetronomeEmailTriggerConfig({}, null, triggerConfig);
            return {
              ...input,
              source: "email",
              matchedAddress: emailConfig.emailAddress,
              email: {
                to: emailConfig.emailAddress ? [emailConfig.emailAddress] : [],
                from: "manual-run@computer-agents.local",
                subject: "Manual workflow run",
                text: prompt,
                body: prompt,
                attachments,
              },
            };
          }
          if (triggerType === "telegram") {
            const telegramConfig = buildDefaultMetronomeTelegramTriggerConfig({}, null, triggerConfig);
            return {
              ...input,
              source: "telegram",
              command: telegramConfig.telegramCommand,
              telegram: {
                text: prompt,
                caption: "",
                fromUsername: "manual-run",
                chatId: "manual-run",
                command: telegramConfig.telegramCommand,
              },
            };
          }
          if (triggerType === "project_ticket") {
            const ticketConfig = buildDefaultMetronomeProjectTicketTriggerConfig(triggerConfig);
            return {
              ...input,
              source: "project_ticket",
              projectTicket: {
                eventType: ticketConfig.ticketEventType,
                projectId: ticketConfig.ticketProjectId,
                projectName: ticketConfig.ticketProjectName,
                ticketId: "manual-run",
                ticketTitle: "Manual workflow run",
                fromStatus: ticketConfig.ticketFromStatus,
                toStatus: ticketConfig.ticketToStatus,
                commentBody: prompt,
                commentAuthorType: "user",
                commentAuthorName: "Manual run",
              },
            };
          }
          if (triggerType === "periodic") {
            const scheduleConfig = buildDefaultMetronomeScheduleConfig(triggerConfig);
            return {
              ...input,
              source: "periodic",
              schedule: {
                triggeredAt: now,
                scheduledTime: scheduleConfig.scheduledTime,
                scheduleType: scheduleConfig.scheduleType,
                cronExpression: scheduleConfig.cronExpression,
                timezone: scheduleConfig.scheduleTimezone,
              },
            };
          }
          if (triggerType === "function") {
            return {
              ...input,
              source: "function_trigger",
              payload: fixture.payload && typeof fixture.payload === "object" ? fixture.payload : {},
              query: {},
              receivedAt: now,
            };
          }
          if (triggerType === "github") return { ...input, source: "github", github: fixture.github || {} };
          if (triggerType === "resource") return { ...input, source: "resource", resource: fixture.resource || {} };
          if (triggerType === "database_entry") return { ...input, source: "database_entry", databaseEntry: fixture.databaseEntry || {} };
          if (triggerType === "auth") return { ...input, source: "auth", auth: fixture.auth || {} };
          return { ...input, ...fixture };
        }
`;
