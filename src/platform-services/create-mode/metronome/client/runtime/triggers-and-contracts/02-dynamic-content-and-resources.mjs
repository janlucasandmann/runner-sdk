export const METRONOME_TRIGGERS_02_FRAGMENT = String.raw`        function normalizeMetronomeImagineMediaMode(value) {
          return String(value || "").trim().toLowerCase() === "video" ? "video" : "image";
        }

        function getMetronomeImagineModelOptions(mediaMode) {
          return normalizeMetronomeImagineMediaMode(mediaMode) === "video"
            ? METRONOME_IMAGINE_VIDEO_MODEL_OPTIONS
            : METRONOME_IMAGINE_IMAGE_MODEL_OPTIONS;
        }

        function normalizeMetronomeImagineModelId(mediaMode, modelId) {
          const options = getMetronomeImagineModelOptions(mediaMode);
          const normalizedModelId = String(modelId || "").trim();
          return (options.find((option) => option.id === normalizedModelId) || options[0]).id;
        }

        function readMetronomeCustomImagineTemplateOptions() {
          if (typeof window === "undefined" || !window.localStorage) {
            return [];
          }
          try {
            const parsed = JSON.parse(window.localStorage.getItem(METRONOME_IMAGINE_CUSTOM_TEMPLATE_STORAGE_KEY) || "[]");
            if (!Array.isArray(parsed)) {
              return [];
            }
            return parsed.map((template) => {
              const id = String(template?.id || "").trim();
              const title = String(template?.title || template?.name || "").trim();
              if (!id || !title) {
                return null;
              }
              const hasVideo = Boolean(template?.videoUrl) || (Array.isArray(template?.assets) && template.assets.some((asset) => String(asset?.type || "").toLowerCase() === "video" || String(asset?.videoUrl || "").trim()));
              return {
                id,
                title,
                mediaType: hasVideo ? "video" : "image",
                prompt: String(template?.prompt || template?.placeholder || title || "").trim(),
              };
            }).filter(Boolean);
          } catch (_error) {
            return [];
          }
        }

        function getMetronomeImagineTemplateOptions() {
          const seen = new Set();
          return METRONOME_IMAGINE_BUILT_IN_TEMPLATE_OPTIONS.concat(readMetronomeCustomImagineTemplateOptions())
            .filter((template) => {
              const id = String(template?.id || "").trim();
              if (!id || seen.has(id)) {
                return false;
              }
              seen.add(id);
              return true;
            });
        }

        function normalizeMetronomeInputContextScope(value) {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[_\s-]+/g, "_");
          return normalized === "latest" || normalized === "latest_only" || normalized === "recent"
            ? "latest"
            : "all";
        }

        const METRONOME_WORKFLOW_DATA_BINDING_OPTIONS = [
          { id: "last.text", label: "Previous node text" },
          { id: "last.json", label: "Previous node JSON" },
          { id: "last.urls", label: "Previous node URLs" },
          { id: "last.documents", label: "Previous node documents" },
          { id: "last.records", label: "Previous node records" },
          { id: "last.files", label: "Previous node files" },
          { id: "previous.table.batches", label: "Previous table batches" },
          { id: "previous.thread.records", label: "Previous thread records" },
          { id: "current.records", label: "Current loop records" },
          { id: "current.record", label: "Current loop record" },
          { id: "current.batch", label: "Current loop batch" },
          { id: "workflow.context", label: "Full workflow context" },
          { id: "trigger.input", label: "Trigger input" },
        ];

        const METRONOME_THREAD_OUTPUT_FIELDS = ["text", "json", "urls", "files", "records", "artifacts"];

        function parseMetronomeDynamicContentJsonObject(value) {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            return value;
          }
          const rawValue = String(value || "").trim();
          if (!rawValue) return null;
          try {
            const parsed = JSON.parse(rawValue);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
          } catch (_error) {
            return null;
          }
        }

        function normalizeMetronomeDynamicContentOutputKey(value, fallback = "output") {
          const normalized = String(value || "").trim();
          if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(normalized)) {
            return normalized;
          }
          const sanitized = normalized
            .replace(/[^A-Za-z0-9_$]+/g, "_")
            .replace(/^([^A-Za-z_$])/, "_$1")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "");
          return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(sanitized)
            ? sanitized
            : String(fallback || "output");
        }

        function splitMetronomeDynamicContentPath(path) {
          return String(path || "")
            .split(".")
            .map((part) => String(part || "").trim())
            .filter(Boolean);
        }

        function formatMetronomeDynamicContentPathExpression(path) {
          const parts = splitMetronomeDynamicContentPath(path);
          if (!parts.length) return "";
          return parts.map((part) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(part)
            ? "." + part
            : "[" + JSON.stringify(part) + "]"
          ).join("");
        }

        function buildMetronomeDynamicContentToken(item) {
          if (!item || typeof item !== "object") return "";
          const scope = String(item.scope || "").trim();
          const path = String(item.path || "").trim();
          if (!path) return "";
          if (scope === "global") {
            return "{{ " + path + " }}";
          }
          const nodeId = String(item.nodeId || "").trim();
          if (!nodeId) return "{{ " + path + " }}";
          return "{{ nodes[" + JSON.stringify(nodeId) + "].outputs" + formatMetronomeDynamicContentPathExpression(path) + " }}";
        }

        function titleCaseMetronomeDynamicContentPathPart(value) {
          const normalized = String(value || "").trim().replace(/[_-]+/g, " ");
          if (!normalized) return "Value";
          return normalized.charAt(0).toUpperCase() + normalized.slice(1);
        }

        function addMetronomeDynamicContentField(fields, seen, path, label, type = "value", description = "") {
          const normalizedPath = splitMetronomeDynamicContentPath(path).join(".");
          if (!normalizedPath || seen.has(normalizedPath)) return;
          seen.add(normalizedPath);
          fields.push({
            path: normalizedPath,
            label: String(label || titleCaseMetronomeDynamicContentPathPart(normalizedPath.split(".").pop())).trim(),
            type: String(type || "value").trim(),
            description: String(description || "").trim(),
          });
        }

        function collectMetronomeDynamicContentJsonPaths(value, prefix = "", depth = 0, output = []) {
          if (!value || typeof value !== "object" || depth > 4 || output.length >= 48) {
            return output;
          }
          if (Array.isArray(value)) {
            const sample = value.find((item) => item && typeof item === "object");
            if (sample) collectMetronomeDynamicContentJsonPaths(sample, prefix, depth + 1, output);
            return output;
          }
          Object.entries(value).forEach(([key, childValue]) => {
            if (output.length >= 48) return;
            const normalizedKey = String(key || "").trim();
            if (!normalizedKey) return;
            const nextPath = prefix ? prefix + "." + normalizedKey : normalizedKey;
            const type = Array.isArray(childValue)
              ? "array"
              : childValue && typeof childValue === "object"
                ? "object"
                : typeof childValue || "value";
            output.push({ path: nextPath, label: titleCaseMetronomeDynamicContentPathPart(normalizedKey), type });
            if (childValue && typeof childValue === "object") {
              collectMetronomeDynamicContentJsonPaths(childValue, nextPath, depth + 1, output);
            }
          });
          return output;
        }

        function getMetronomeDynamicContentNodeOutputFields(node) {
          const data = node?.data && typeof node.data === "object" ? node.data : {};
          const kind = String(data.kind || node?.kind || "action").trim() || "action";
          const config = data.config && typeof data.config === "object"
            ? data.config
            : node?.config && typeof node.config === "object"
              ? node.config
              : {};
          const fields = [];
          const seen = new Set();
          const addField = (path, label, type, description) => addMetronomeDynamicContentField(fields, seen, path, label, type, description);
          if (kind === "trigger") {
            const triggerType = String(config.triggerType || data.subtype || node?.subtype || "").trim();
            addField("input", "Trigger input", "object", "The payload that started this workflow.");
            addField("input.prompt", "Prompt", "text", "Prompt or message that started the run.");
            addField("input.files", "Files", "array", "Files included with the trigger.");
            addField("input.subject", "Subject", "text", "Subject from message or email triggers.");
            addField("input.from", "Sender", "text", "Sender from message or email triggers.");
            addField("input.body", "Body", "text", "Body text from message or email triggers.");
            if (triggerType === "function") {
              const payloadFields = normalizeMetronomeFunctionTriggerPayloadFields(config.payloadFields || config.payload_fields || config.payloadSchemaJson || config.payload_schema_json || config.expectedPayload || config.expected_payload);
              addField("payload", "Function payload", "object", "Payload received by the callable function trigger.");
              payloadFields.forEach((field) => {
                const key = String(field?.key || field?.name || "").trim();
                if (!key) return;
                const type = normalizeMetronomeFunctionTriggerPayloadType(field?.type);
                addField("payload." + key, titleCaseMetronomeDynamicContentPathPart(key), type, "Field from the function trigger payload.");
                addField("input." + key, titleCaseMetronomeDynamicContentPathPart(key), type, "Top-level field from the function trigger payload.");
              });
            }
            return fields;
          }
          if (kind === "action") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "thread");
            addField(outputKey + ".text", "Thread text", "text", "The assistant response text.");
            addField(outputKey + ".json", "Thread JSON", "object", "Structured response JSON.");
            addField(outputKey + ".urls", "URLs", "array", "URLs extracted or returned by the thread.");
            addField(outputKey + ".files", "Files", "array", "Files attached or produced by the thread.");
            addField(outputKey + ".records", "Records", "array", "Structured records returned by the thread.");
            addField(outputKey + ".artifacts", "Artifacts", "array", "Generated artifacts from the thread.");
            collectMetronomeDynamicContentJsonPaths(parseMetronomeDynamicContentJsonObject(config.outputContractJson || config.output_contract_json))
              .forEach((field) => {
                addField(outputKey + "." + field.path, field.label, field.type, "Field from this node's structured output contract.");
                addField(outputKey + ".json." + field.path, field.label, field.type, "Field from this node's structured output contract JSON.");
              });
            return fields;
          }
          if (kind === "imagine") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "imagine");
            addField(outputKey + ".summary", "Summary", "text", "Summary of the Imagine generation.");
            addField(outputKey + ".image", "Image", "file", "Generated image output.");
            addField(outputKey + ".video", "Video", "file", "Generated video output.");
            addField(outputKey + ".artifacts", "Artifacts", "array", "Generated media artifacts.");
            addField(outputKey + ".thread", "Thread", "object", "Imagine thread metadata.");
            return fields;
          }
          if (kind === "firecrawl") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "firecrawl");
            addField(outputKey + ".text", "Text", "text", "Readable text extracted from web or document content.");
            addField(outputKey + ".markdown", "Markdown", "text", "Markdown extracted from web or document content.");
            addField(outputKey + ".urls", "URLs", "array", "Discovered or scraped URLs.");
            addField(outputKey + ".documents", "Documents", "array", "Parsed document results.");
            addField(outputKey + ".records", "Records", "array", "Structured extraction records.");
            addField(outputKey + ".artifacts", "Artifacts", "array", "Saved Firecrawl artifacts.");
            collectMetronomeDynamicContentJsonPaths(parseMetronomeDynamicContentJsonObject(config.schemaJson || config.schema_json))
              .forEach((field) => addField(outputKey + ".records." + field.path, field.label, field.type, "Field from this Firecrawl extraction schema."));
            return fields;
          }
          if (kind === "table") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "table");
            addField(outputKey + ".records", "Records", "array", "Parsed table rows.");
            addField(outputKey + ".batches", "Batches", "array", "Rows grouped for loop or batch processing.");
            addField(outputKey + ".columns", "Columns", "array", "Detected table columns.");
            addField(outputKey + ".files", "Files", "array", "Source or generated files.");
            return fields;
          }
          if (kind === "database") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "database");
            addField(outputKey + ".document", "Document", "object", "Single database document result.");
            addField(outputKey + ".documents", "Documents", "array", "Multiple database documents.");
            addField(outputKey + ".records", "Records", "array", "Database records affected or returned.");
            addField(outputKey + ".count", "Count", "number", "Number of affected records.");
            collectMetronomeDynamicContentJsonPaths(parseMetronomeDynamicContentJsonObject(config.documentJson || config.document_json))
              .forEach((field) => addField(outputKey + ".document." + field.path, field.label, field.type, "Field from this database document shape."));
            return fields;
          }
          if (kind === "function") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "function");
            addField(outputKey + ".response", "Response", "object", "Full function response.");
            addField(outputKey + ".body", "Response body", "object", "Function response body.");
            addField(outputKey + ".text", "Text", "text", "Text response from the function.");
            addField(outputKey + ".json", "JSON", "object", "JSON response from the function.");
            addField(outputKey + ".status", "Status", "number", "Function response status.");
            return fields;
          }
          if (kind === "metronome") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "metronome");
            addField(outputKey + ".summary", "Summary", "text", "Summary from the nested workflow run.");
            addField(outputKey + ".output", "Output", "object", "Nested workflow output.");
            addField(outputKey + ".run", "Run", "object", "Nested workflow run metadata.");
            return fields;
          }
          if (kind === "loop") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "loop");
            addField(outputKey + ".items", "Items", "array", "Items iterated by the loop.");
            addField(outputKey + ".records", "Records", "array", "Records emitted by loop iterations.");
            addField(outputKey + ".results", "Results", "array", "Results collected from loop iterations.");
            return fields;
          }
          if (kind === "ticket") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "ticket");
            addField(outputKey + ".ticket", "Ticket", "object", "Ticket created or updated by this node.");
            addField(outputKey + ".status", "Status", "text", "Ticket status after this node runs.");
            addField(outputKey + ".comment", "Comment", "text", "Comment written by this node.");
            return fields;
          }
          if (kind === "approval") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "approval");
            addField(outputKey + ".decision", "Decision", "text", "Approval decision.");
            addField(outputKey + ".reason", "Reason", "text", "Human review reason or note.");
            addField(outputKey + ".payload", "Payload", "object", "Payload returned by the reviewer.");
            return fields;
          }
          addField("output", "Output", "object", "Node output.");
          return fields;
        }

        function getMetronomeDynamicContentGlobalItems(selectedNode) {
          const selectedData = selectedNode?.data && typeof selectedNode.data === "object" ? selectedNode.data : {};
          const isInsideLoop = Boolean(selectedNode?.parentId || selectedData.parentId);
          const items = [
            { scope: "global", path: "trigger.input", label: "Trigger input", type: "object", description: "The payload that started this workflow." },
            { scope: "global", path: "trigger.payload", label: "Trigger payload", type: "object", description: "The request payload that started this workflow." },
            { scope: "global", path: "trigger.input.prompt", label: "Trigger prompt", type: "text", description: "The original user message or prompt." },
            { scope: "global", path: "trigger.input.files", label: "Trigger files", type: "array", description: "Files included with the trigger." },
            { scope: "global", path: "workflow.context", label: "Workflow context", type: "object", description: "Full accumulated workflow context." },
            { scope: "global", path: "last.text", label: "Previous node text", type: "text", description: "Text from the latest upstream node." },
            { scope: "global", path: "last.json", label: "Previous node JSON", type: "object", description: "JSON from the latest upstream node." },
            { scope: "global", path: "last.records", label: "Previous node records", type: "array", description: "Records from the latest upstream node." },
          ];
          if (isInsideLoop) {
            items.push(
              { scope: "global", path: "current.record", label: "Current loop record", type: "object", description: "The current loop item." },
              { scope: "global", path: "current.records", label: "Current loop records", type: "array", description: "All records in the current loop batch." },
              { scope: "global", path: "current.batch", label: "Current loop batch", type: "array", description: "The current loop batch." }
            );
          }
          return items.map((item) => ({ ...item, token: buildMetronomeDynamicContentToken(item) }));
        }

        function buildMetronomeDynamicContentGroups(nodes, edges, selectedNodeId) {
          const workflowNodes = Array.isArray(nodes) ? nodes : [];
          const workflowEdges = Array.isArray(edges) ? edges : [];
          const selectedId = String(selectedNodeId || "").trim();
          const nodeById = new Map(workflowNodes.map((node) => [String(node?.id || ""), node]).filter(([id]) => id));
          const selectedNode = nodeById.get(selectedId) || null;
          const groups = [
            {
              id: "workflow",
              title: "Workflow",
              subtitle: "Run context",
              items: getMetronomeDynamicContentGlobalItems(selectedNode),
            },
          ];
          if (!selectedNode) {
            return groups;
          }
          const incomingByTarget = new Map();
          workflowEdges.forEach((edge) => {
            const source = String(edge?.source || "").trim();
            const target = String(edge?.target || "").trim();
            if (!source || !target) return;
            if (!incomingByTarget.has(target)) incomingByTarget.set(target, []);
            incomingByTarget.get(target).push(source);
          });
          const upstreamIds = new Set();
          const stack = [...(incomingByTarget.get(selectedId) || [])];
          while (stack.length) {
            const upstreamId = stack.pop();
            if (!upstreamId || upstreamIds.has(upstreamId) || upstreamId === selectedId) continue;
            upstreamIds.add(upstreamId);
            (incomingByTarget.get(upstreamId) || []).forEach((sourceId) => stack.push(sourceId));
          }
          let parentId = String(selectedNode.parentId || selectedNode?.data?.parentId || "").trim();
          while (parentId && !upstreamIds.has(parentId)) {
            upstreamIds.add(parentId);
            const parentNode = nodeById.get(parentId);
            parentId = String(parentNode?.parentId || parentNode?.data?.parentId || "").trim();
          }
          if (!upstreamIds.size) {
            const selectedIndex = workflowNodes.findIndex((node) => String(node?.id || "") === selectedId);
            workflowNodes.slice(0, selectedIndex >= 0 ? selectedIndex : 0).forEach((node) => {
              const id = String(node?.id || "").trim();
              if (id && id !== selectedId) upstreamIds.add(id);
            });
          }
          workflowNodes
            .filter((node) => upstreamIds.has(String(node?.id || "")))
            .forEach((node) => {
              const nodeContract = getMetronomeNodeIOContract(node);
              const outputFields = Array.isArray(nodeContract.outputs) ? nodeContract.outputs : [];
              if (!outputFields.length) return;
              const nodeId = String(node.id || "").trim();
              groups.push({
                id: "node:" + nodeId,
                title: nodeContract.label || getMetronomeNodeDisplayLabel(node),
                subtitle: nodeContract.kindLabel || titleCaseMetronomeDynamicContentPathPart(nodeContract.kind),
                items: outputFields.map((field) => {
                  const item = {
                    scope: "node",
                    nodeId,
                    path: field.path,
                    label: field.label,
                    type: field.type,
                    description: field.description,
                  };
                  return { ...item, token: buildMetronomeDynamicContentToken(item) };
                }),
              });
            });
          return groups;
        }

        const METRONOME_DYNAMIC_REFERENCE_RUNTIME_VERSION = 1;
        const METRONOME_DYNAMIC_REFERENCE_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;

        function getMetronomeNodeConfigRecord(node) {
          const data = node?.data && typeof node.data === "object" ? node.data : {};
          return data.config && typeof data.config === "object"
            ? data.config
            : node?.config && typeof node.config === "object"
              ? node.config
              : {};
        }

        function getMetronomeNodeKindValue(node) {
          const data = node?.data && typeof node.data === "object" ? node.data : {};
          return String(data.kind || node?.kind || "action").trim() || "action";
        }

        function getMetronomeNodeSubtypeValue(node) {
          const data = node?.data && typeof node.data === "object" ? node.data : {};
          return String(data.subtype || node?.subtype || "").trim();
        }

        function inferMetronomeDynamicContentValueType(value) {
          if (Array.isArray(value)) return "array";
          if (value && typeof value === "object") return "object";
          if (typeof value === "number") return "number";
          if (typeof value === "boolean") return "boolean";
          if (value === null) return "null";
          return "string";
        }

        function createMetronomeDynamicContentContractField(path, label, type = "value", description = "") {
          return {
            path: splitMetronomeDynamicContentPath(path).join("."),
            label: String(label || titleCaseMetronomeDynamicContentPathPart(String(path || "").split(".").pop())).trim(),
            type: String(type || "value").trim(),
            description: String(description || "").trim(),
          };
        }

        function getMetronomeDynamicContentNodeInputFields(node) {
          const kind = getMetronomeNodeKindValue(node);
          const config = getMetronomeNodeConfigRecord(node);
          const fields = [];
          const addInput = (path, label, type = "value", binding = "") => fields.push({
            path,
            label,
            type,
            binding: String(binding || config[path] || config[path.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase())] || "").trim(),
          });
          if (kind === "action") {
            addInput("message", "Prompt adaption", "text");
            addInput("inputContextScope", "Input context scope", "enum");
            return fields;
          }
          if (kind === "firecrawl") {
            addInput("inputBinding", "Input binding", "binding", config.inputBinding || config.input_binding);
            addInput("query", "Fallback query", "text");
            addInput("url", "Fallback URL", "url");
            addInput("filePath", "Fallback file path", "path");
            addInput("prompt", "Extraction prompt", "text");
            addInput("schemaJson", "Output schema", "json");
            return fields;
          }
          if (kind === "table") {
            addInput("inputBinding", "Table source", "binding", config.inputBinding || config.input_binding);
            addInput("filePath", "Fallback file path or URL", "path");
            return fields;
          }
          if (kind === "database") {
            addInput("inputBinding", "Input binding", "binding", config.inputBinding || config.input_binding);
            addInput("recordsBinding", "Records binding", "binding", config.recordsBinding || config.records_binding);
            addInput("documentJson", "Document template", "json");
            addInput("documentTemplateJson", "Bulk document template", "json");
            return fields;
          }
          if (kind === "function") {
            addInput("inputBinding", "Input binding", "binding", config.inputBinding || config.input_binding);
            addInput("inputJson", "Function input", "json");
            return fields;
          }
          if (kind === "ticket") {
            addInput("adaptationInstructions", "Adaptation instructions", "text");
            addInput("comment", "Comment", "text");
            addInput("subtaskInstructions", "Subtask instructions", "text");
            addInput("workInstructions", "Work instructions", "text");
            addInput("fieldsJson", "Ticket fields", "json");
            return fields;
          }
          if (kind === "imagine") {
            addInput("prompt", "Prompt adaption", "text");
            return fields;
          }
          if (kind === "metronome") {
            addInput("inputBinding", "Input binding", "binding", config.inputBinding || config.input_binding);
            addInput("inputJson", "Workflow input", "json");
            return fields;
          }
          if (kind === "condition") {
            addInput("conditions", "Branch conditions", "rules");
            return fields;
          }
          if (kind === "approval") {
            addInput("message", "Approval message", "text");
            return fields;
          }
          return fields;
        }

        function getMetronomeNodeIOContract(node) {
          const nodeId = String(node?.id || "").trim();
          const kind = getMetronomeNodeKindValue(node);
          const subtype = getMetronomeNodeSubtypeValue(node);
          const config = getMetronomeNodeConfigRecord(node);
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          const outputs = getMetronomeDynamicContentNodeOutputFields(node).map((field) => createMetronomeDynamicContentContractField(
            field.path,
            field.label,
            field.type,
            field.description
          ));
          const outputKey = outputs.length
            ? splitMetronomeDynamicContentPath(outputs[0].path)[0] || ""
            : normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, kind === "action" ? "thread" : kind || "output");
          return {
            version: METRONOME_DYNAMIC_REFERENCE_RUNTIME_VERSION,
            nodeId,
            kind,
            subtype,
            label: getMetronomeNodeDisplayLabel(node),
            kindLabel: meta?.label || titleCaseMetronomeDynamicContentPathPart(kind),
            outputKey,
            inputs: getMetronomeDynamicContentNodeInputFields(node),
            outputs,
          };
        }

        function createMetronomeNodeTestInputField(path, label, options = {}) {
          const normalizedPath = splitMetronomeDynamicContentPath(path).join(".");
          return {
            id: normalizedPath || String(options.id || "input"),
            path: normalizedPath || String(options.id || "input"),
            label: String(label || titleCaseMetronomeDynamicContentPathPart(normalizedPath)).trim(),
            control: String(options.control || "text").trim(),
            valueType: String(options.valueType || "string").trim(),
            placeholder: String(options.placeholder || "").trim(),
            description: String(options.description || "").trim(),
            required: options.required === true,
            defaultValue: options.defaultValue ?? "",
            options: Array.isArray(options.options)
              ? options.options.map((option) => ({
                  value: String(option?.value ?? option?.id ?? option ?? ""),
                  label: String(option?.label ?? option ?? ""),
                }))
              : [],
          };
        }

        function getMetronomeNodeTestInputControl(type, value, schema = {}) {
          const declaredType = Array.isArray(type) ? type.find((entry) => entry !== "null") : type;
          const normalizedType = String(declaredType || inferMetronomeDynamicContentValueType(value) || "string").toLowerCase();
          const enumValues = Array.isArray(schema?.enum) ? schema.enum : [];
          if (enumValues.length) {
            return {
              control: "selector",
              valueType: normalizedType === "number" || normalizedType === "integer" ? "number" : "string",
              options: enumValues.map((entry) => ({ value: entry, label: entry })),
            };
          }
          if (normalizedType === "boolean") return { control: "toggle", valueType: "boolean" };
          if (normalizedType === "number" || normalizedType === "integer") return { control: "number", valueType: "number" };
          if (normalizedType === "array") return { control: "list", valueType: "array" };
          const format = String(schema?.format || "").toLowerCase();
          if (format === "date") return { control: "date", valueType: "string" };
          if (format === "date-time" || format === "datetime") return { control: "datetime-local", valueType: "string" };
          if (format === "uri" || format === "url") {
            return { control: "url", valueType: "string" };
          }
          return {
            control: typeof value === "string" && value.length > 80 ? "textarea" : "text",
            valueType: "string",
          };
        }

        function collectMetronomeNodeTestInputFields(value, options = {}, output = [], prefix = "", depth = 0) {
          if (!value || typeof value !== "object" || Array.isArray(value) || output.length >= 64 || depth > 4) {
            return output;
          }
          const properties = value.properties && typeof value.properties === "object" && !Array.isArray(value.properties)
            ? value.properties
            : null;
          const source = properties || value;
          const requiredFields = new Set(Array.isArray(value.required) ? value.required.map((entry) => String(entry || "")) : []);
          Object.entries(source).forEach(([key, rawValue]) => {
            if (output.length >= 64) return;
            const propertySchema = properties && rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)
              ? rawValue
              : {};
            const propertyValue = properties
              ? propertySchema.default ?? propertySchema.example ?? ""
              : rawValue;
            const path = prefix ? prefix + "." + key : key;
            const nestedProperties = propertySchema.properties && typeof propertySchema.properties === "object"
              ? propertySchema
              : propertyValue && typeof propertyValue === "object" && !Array.isArray(propertyValue)
                ? propertyValue
                : null;
            if (nestedProperties) {
              collectMetronomeNodeTestInputFields(nestedProperties, options, output, path, depth + 1);
              return;
            }
            const type = propertySchema.type || inferMetronomeDynamicContentValueType(propertyValue) || "string";
            const control = getMetronomeNodeTestInputControl(type, propertyValue, propertySchema);
            const configuredDefault = typeof propertyValue === "string" && propertyValue.includes("{{")
              ? ""
              : propertyValue;
            output.push(createMetronomeNodeTestInputField(path, propertySchema.title || titleCaseMetronomeDynamicContentPathPart(key), {
              ...control,
              placeholder: propertySchema.placeholder || propertySchema.description || "",
              description: propertySchema.description || "",
              required: requiredFields.has(key),
              defaultValue: configuredDefault ?? "",
            }));
          });
          return output;
        }

        function getMetronomeNodeTestInputObject(config, keys) {
          for (const key of keys) {
            const snakeKey = key.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase());
            const parsed = parseMetronomeDynamicContentJsonObject(config[key] ?? config[snakeKey]);
            if (parsed && Object.keys(parsed).length) return parsed;
          }
          return null;
        }

        function getMetronomeNodeTestInputFields(node) {
          const kind = getMetronomeNodeKindValue(node);
          const subtype = getMetronomeNodeSubtypeValue(node).toLowerCase();
          const config = getMetronomeNodeConfigRecord(node);
          const field = (path, label, options) => createMetronomeNodeTestInputField(path, label, options);
          const promptField = (label = "Prompt") => field("prompt", label, {
            control: "task-input",
            placeholder: "Describe the input for this test run.",
          });

          if (kind === "action" || kind === "imagine") {
            return [promptField()];
          }
          if (kind === "trigger") {
            if (subtype.includes("email")) {
              return [
                field("from", "Sender", { placeholder: "sender@example.com" }),
                field("subject", "Subject"),
                field("body", "Message", { control: "textarea" }),
              ];
            }
            return [promptField("Trigger input")];
          }
          if (kind === "function") {
            const shape = getMetronomeNodeTestInputObject(config, [
              "inputSchema", "inputSchemaJson", "parameters", "inputJson", "payloadJson", "bodyJson",
            ]);
            const fields = collectMetronomeNodeTestInputFields(shape);
            return fields.length ? fields : [field("input", "Input", {
              control: "textarea",
              placeholder: "Enter the value passed to this function.",
            })];
          }
          if (kind === "database") {
            const operation = String(config.operation || config.action || subtype || "").toLowerCase();
            const fields = [];
            if (/get|read|update|delete|archive/.test(operation) && !(config.documentId || config.document_id)) {
              fields.push(field("documentId", "Document ID"));
            }
            const shape = getMetronomeNodeTestInputObject(config, [
              "documentSchema", "documentJson", "documentTemplateJson", "recordSchema", "fieldsJson",
            ]);
            collectMetronomeNodeTestInputFields(shape, {}, fields);
            if (!fields.length && /list|query|search/.test(operation)) {
              fields.push(field("query", "Query", { placeholder: "Enter the records to find." }));
            }
            return fields.length ? fields : [field("record", "Record", {
              control: "textarea",
              placeholder: "Enter the record content for this test.",
            })];
          }
          if (kind === "firecrawl") {
            const operation = String(config.operation || config.action || subtype || "scrape").toLowerCase();
            const fields = operation === "search"
              ? [field("query", "Search query", { required: true })]
              : [field("url", "URL", { control: "url", required: true, placeholder: "https://example.com" })];
            if (operation === "extract") fields.push(promptField("Extraction prompt"));
            return fields;
          }
          if (kind === "table") {
            return [field("content", "Table content", {
              control: "textarea",
              placeholder: "Paste CSV or tab-separated rows.",
            })];
          }
          if (kind === "metronome") {
            const shape = getMetronomeNodeTestInputObject(config, ["inputSchema", "inputSchemaJson", "inputJson"]);
            const fields = collectMetronomeNodeTestInputFields(shape);
            return fields.length ? fields : [promptField("Workflow input")];
          }
          if (kind === "ticket") {
            return [
              field("title", "Title"),
              field("description", "Description", { control: "textarea" }),
            ];
          }
          if (kind === "condition") {
            return [field("value", "Value to evaluate", { placeholder: "Enter the value used by this condition." })];
          }
          if (kind === "loop") {
            return [field("items", "Items", {
              control: "list",
              valueType: "array",
              placeholder: "Enter one item per line.",
            })];
          }
          if (kind === "approval") {
            return [field("message", "Approval message", { control: "textarea" })];
          }
          if (kind === "end" || kind === "note" || kind === "wait") {
            return [];
          }
          return [field("input", "Input", { control: "textarea" })];
        }

        function parseMetronomeDynamicContentPathExpression(expression) {
          const text = String(expression || "").trim();
          const parts = [];
          let index = 0;
          while (index < text.length) {
            if (text[index] === ".") {
              index += 1;
              const start = index;
              while (index < text.length && /[A-Za-z0-9_$-]/.test(text[index])) index += 1;
              const part = text.slice(start, index).trim();
              if (part) parts.push(part);
              continue;
            }
            if (text[index] === "[") {
              const quote = text[index + 1];
              if (quote === "\"" || quote === "'") {
                let cursor = index + 2;
                let raw = "";
                while (cursor < text.length) {
                  if (text[cursor] === "\\" && cursor + 1 < text.length) {
                    raw += text[cursor + 1];
                    cursor += 2;
                    continue;
                  }
                  if (text[cursor] === quote && text[cursor + 1] === "]") {
                    parts.push(raw);
                    index = cursor + 2;
                    break;
                  }
                  raw += text[cursor];
                  cursor += 1;
                }
                if (index !== cursor + 2) break;
                continue;
              }
              const closeIndex = text.indexOf("]", index);
              if (closeIndex === -1) break;
              const part = text.slice(index + 1, closeIndex).trim();
              if (part) parts.push(part);
              index = closeIndex + 1;
              continue;
            }
            const start = index;
            while (index < text.length && text[index] !== "." && text[index] !== "[") index += 1;
            const part = text.slice(start, index).trim();
            if (part) parts.push(part);
          }
          return parts;
        }

        function parseMetronomeDynamicReferenceExpression(expression) {
          const normalized = String(expression || "").trim();
          if (!normalized) return null;
          const bracketNodeMatch = normalized.match(/^nodes\[(["'])(.*?)\1\]\.outputs(.*)$/);
          if (bracketNodeMatch) {
            return {
              scope: "node",
              nodeId: bracketNodeMatch[2],
              path: parseMetronomeDynamicContentPathExpression(bracketNodeMatch[3] || ""),
              expression: normalized,
            };
          }
          const dotNodeMatch = normalized.match(/^nodes\.([A-Za-z0-9_$-]+)\.outputs(.*)$/);
          if (dotNodeMatch) {
            return {
              scope: "node",
              nodeId: dotNodeMatch[1],
              path: parseMetronomeDynamicContentPathExpression(dotNodeMatch[2] || ""),
              expression: normalized,
            };
          }
          const parts = normalized.split(".").map((part) => part.trim()).filter(Boolean);
          if (!parts.length) return null;
          return {
            scope: parts[0],
            path: parts.slice(1),
            expression: normalized,
          };
        }

        function getMetronomeDynamicContentValueAtPath(value, path) {
          const parts = Array.isArray(path) ? path : splitMetronomeDynamicContentPath(path);
          let current = value;
          for (const part of parts) {
            if (current === undefined || current === null) return undefined;
            if (Array.isArray(current)) {
              const index = Number(part);
              if (!Number.isInteger(index) || index < 0 || index >= current.length) return undefined;
              current = current[index];
              continue;
            }
            if (typeof current !== "object") return undefined;
            if (!Object.prototype.hasOwnProperty.call(current, part)) return undefined;
            current = current[part];
          }
          return current;
        }

        function resolveMetronomeDynamicReferenceValue(parsedReference, context = {}) {
          if (!parsedReference) return undefined;
          const scope = String(parsedReference.scope || "").trim();
          if (scope === "node") {
            const node = context.nodes && typeof context.nodes === "object"
              ? context.nodes[String(parsedReference.nodeId || "")]
              : undefined;
            const outputs = node && typeof node === "object" && Object.prototype.hasOwnProperty.call(node, "outputs")
              ? node.outputs
              : node;
            return getMetronomeDynamicContentValueAtPath(outputs, parsedReference.path || []);
          }
          const source = Object.prototype.hasOwnProperty.call(context, scope)
            ? context[scope]
            : undefined;
          return getMetronomeDynamicContentValueAtPath(source, parsedReference.path || []);
        }

        function stringifyMetronomeDynamicReferenceValue(value) {
          if (value === undefined || value === null) return "";
          if (typeof value === "string") return value;
          if (typeof value === "number" || typeof value === "boolean") return String(value);
          try {
            return JSON.stringify(value);
          } catch (_error) {
            return String(value);
          }
        }

        function resolveMetronomeDynamicContentReferences(value, context = {}, options = {}) {
          if (typeof value === "string") {
            const matches = [...value.matchAll(METRONOME_DYNAMIC_REFERENCE_PATTERN)];
            if (!matches.length) return value;
            const keepUnresolved = options.keepUnresolved !== false;
            if (matches.length === 1 && matches[0].index === 0 && matches[0][0].length === value.length) {
              const parsed = parseMetronomeDynamicReferenceExpression(matches[0][1]);
              const resolved = resolveMetronomeDynamicReferenceValue(parsed, context);
              return resolved === undefined && keepUnresolved ? matches[0][0] : resolved;
            }
            return value.replace(METRONOME_DYNAMIC_REFERENCE_PATTERN, (token, expression) => {
              const parsed = parseMetronomeDynamicReferenceExpression(expression);
              const resolved = resolveMetronomeDynamicReferenceValue(parsed, context);
              return resolved === undefined && keepUnresolved
                ? token
                : stringifyMetronomeDynamicReferenceValue(resolved);
            });
          }
          if (Array.isArray(value)) {
            return value.map((item) => resolveMetronomeDynamicContentReferences(item, context, options));
          }
          if (value && typeof value === "object") {
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [
              key,
              resolveMetronomeDynamicContentReferences(item, context, options),
            ]));
          }
          return value;
        }

        function extractMetronomeDynamicContentReferences(value, path = [], output = []) {
          if (typeof value === "string") {
            [...value.matchAll(METRONOME_DYNAMIC_REFERENCE_PATTERN)].forEach((match) => {
              const expression = String(match[1] || "").trim();
              const parsed = parseMetronomeDynamicReferenceExpression(expression);
              if (!parsed) return;
              output.push({
                expression,
                token: match[0],
                path: path.join("."),
                scope: parsed.scope,
                nodeId: parsed.nodeId || "",
                valuePath: Array.isArray(parsed.path) ? parsed.path.join(".") : "",
              });
            });
            return output;
          }
          if (Array.isArray(value)) {
            value.forEach((item, index) => extractMetronomeDynamicContentReferences(item, path.concat(String(index)), output));
            return output;
          }
          if (value && typeof value === "object") {
            Object.entries(value).forEach(([key, item]) => extractMetronomeDynamicContentReferences(item, path.concat(key), output));
          }
          return output;
        }

        function createMetronomeInitialReferenceContext(workflow, definition, inputs = {}) {
          const safeInputs = inputs && typeof inputs === "object" ? inputs : { value: inputs };
          const triggerPayload = safeInputs.payload && typeof safeInputs.payload === "object"
            ? safeInputs.payload
            : safeInputs;
          const workflowContext = {
            workflowId: String(workflow?.id || definition?.id || "").trim(),
            workflowName: String(workflow?.name || definition?.name || "Metronome").trim(),
            input: safeInputs,
            trigger: safeInputs,
            payload: triggerPayload,
          };
          return {
            input: safeInputs,
            trigger: { input: safeInputs, payload: triggerPayload },
            workflow: { context: workflowContext },
            current: {},
            previous: {},
            last: {},
            nodes: {},
          };
        }

        function enrichMetronomeWorkflowDefinitionWithDynamicContent(definition, workflow = null, inputs = {}) {
          const safeDefinition = definition && typeof definition === "object" ? definition : { nodes: [], edges: [] };
          const definitionNodes = Array.isArray(safeDefinition.nodes) ? safeDefinition.nodes : [];
          const enrichedNodes = definitionNodes.map((node) => {
            const config = getMetronomeNodeConfigRecord(node);
            const ioContract = getMetronomeNodeIOContract(node);
            return {
              ...node,
              ioContract,
              dynamicReferences: extractMetronomeDynamicContentReferences(config),
            };
          });
          const nodeContracts = Object.fromEntries(enrichedNodes.map((node) => [String(node.id || ""), node.ioContract]).filter(([id]) => id));
          const references = enrichedNodes.flatMap((node) =>
            (Array.isArray(node.dynamicReferences) ? node.dynamicReferences : []).map((reference) => ({
              ...reference,
              nodeId: String(node.id || ""),
              nodeLabel: getMetronomeNodeDisplayLabel(node),
            }))
          );
          return {
            ...safeDefinition,
            nodes: enrichedNodes,
            dynamicContent: {
              version: METRONOME_DYNAMIC_REFERENCE_RUNTIME_VERSION,
              syntax: "mustache-expression-v1",
              supportedScopes: ["trigger", "workflow", "nodes", "last", "previous", "current", "input", "record"],
              nodeContracts,
              references,
              initialReferenceContext: createMetronomeInitialReferenceContext(workflow, safeDefinition, inputs),
            },
          };
        }

        function createMetronomeExecutionPayload(workflow, definition, inputs = {}, extra = {}) {
          const context = createMetronomeInitialReferenceContext(workflow, definition, inputs);
          const resolvedInputs = resolveMetronomeDynamicContentReferences(inputs, context, { keepUnresolved: true });
          const enrichedDefinition = enrichMetronomeWorkflowDefinitionWithDynamicContent(definition, workflow, resolvedInputs);
          return {
            ...extra,
            definition: enrichedDefinition,
            inputs: resolvedInputs,
            dynamicContent: {
              version: METRONOME_DYNAMIC_REFERENCE_RUNTIME_VERSION,
              syntax: "mustache-expression-v1",
              resolvedInputReferences: extractMetronomeDynamicContentReferences(inputs),
            },
          };
        }

        function normalizeMetronomeDataBinding(value, fallback = "last.text") {
          const normalized = String(value || "").trim();
          if (normalized === "trigger.input.csvContent") return "workflow.trigger.input.csvContent";
          if (normalized) return normalized;
          return String(fallback || "last.text");
        }

        function normalizeMetronomeFirecrawlOperation(value) {
          const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
          return ["web_search", "scrape_url", "parse_document", "extract_data"].includes(normalized)
            ? normalized
            : "web_search";
        }

        function normalizeMetronomeTableOperation(value) {
          const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
          return ["parse_csv", "parse_tsv"].includes(normalized)
            ? normalized
            : "parse_csv";
        }

        function normalizeMetronomeFunctionMode(value, fallback = "computer_agents_function") {
          const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
          if (["external_api", "api", "http", "http_request", "webhook"].includes(normalized)) return "external_api";
          if (["computer_agents_function", "computer_agent_function", "computer_agents", "function", "server_function"].includes(normalized)) {
            return "computer_agents_function";
          }
          return fallback === "external_api" ? "external_api" : "computer_agents_function";
        }

        function normalizeMetronomeFunctionHttpMethod(value) {
          const normalized = String(value || "").trim().toUpperCase();
          return ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"].includes(normalized) ? normalized : "POST";
        }

        function createMetronomeHeaderRow(overrides = {}) {
          const rawValue = String(overrides.value || "").trim();
          const explicitValueType = String(overrides.valueType || overrides.value_type || overrides.type || "").trim();
          const valueType = explicitValueType === "secret" || rawValue.startsWith("secrets:") ? "secret" : "text";
          const secretRef = String(overrides.secretRef || overrides.secret_ref || rawValue || "").trim();
          const parsedSecretRef = valueType === "secret" ? parseMetronomeSecretCredentialRef(secretRef) : { vaultId: "", secretId: "" };
          return {
            id: String(overrides.id || "header_" + Math.random().toString(36).slice(2, 10)),
            name: String(overrides.name || overrides.key || ""),
            valueType,
            value: valueType === "secret" ? "" : String(overrides.value || ""),
            secretRef: valueType === "secret" ? secretRef : "",
            secretVaultId: String(overrides.secretVaultId || overrides.secret_vault_id || parsedSecretRef.vaultId || ""),
            secretVaultName: String(overrides.secretVaultName || overrides.secret_vault_name || ""),
            secretId: String(overrides.secretId || overrides.secret_id || parsedSecretRef.secretId || ""),
            secretName: String(overrides.secretName || overrides.secret_name || ""),
          };
        }

        function normalizeMetronomeFunctionHeaderRows(value) {
          const rows = [];
          const preserveBlankRows = Array.isArray(value);
          const addRow = (row) => {
            const normalizedRow = createMetronomeHeaderRow(row);
            if (!preserveBlankRows && !normalizedRow.name && !normalizedRow.value && !normalizedRow.secretRef) return;
            rows.push(normalizedRow);
          };
          if (Array.isArray(value)) {
            value.forEach(addRow);
          } else if (value && typeof value === "object") {
            Object.entries(value).forEach(([name, rawValue]) => {
              if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
                addRow({ name, ...rawValue });
              } else {
                addRow({ name, value: String(rawValue ?? "") });
              }
            });
          } else {
            const text = String(value || "").trim();
            if (text) {
              try {
                const parsed = JSON.parse(text);
                return normalizeMetronomeFunctionHeaderRows(parsed);
              } catch {
                rows.push(createMetronomeHeaderRow());
              }
            }
          }
          return rows.length ? rows : [createMetronomeHeaderRow()];
        }

        function serializeMetronomeFunctionHeaderRows(rows) {
          const headers = {};
          (Array.isArray(rows) ? rows : []).forEach((row) => {
            const name = String(row?.name || "").trim();
            if (!name) return;
            if (String(row?.valueType || "") === "secret") {
              const secretRef = String(row?.secretRef || "").trim();
              if (secretRef) headers[name] = secretRef;
              return;
            }
            const value = String(row?.value || "");
            if (value) headers[name] = value;
          });
          return JSON.stringify(headers, null, 2);
        }

        function createDefaultMetronomeFunctionConfig(overrides = {}) {
          const inferredFallbackMode = (overrides.url || overrides.requestUrl || overrides.endpoint)
            ? "external_api"
            : "computer_agents_function";
          const functionMode = normalizeMetronomeFunctionMode(
            overrides.functionMode || overrides.function_mode || overrides.mode || overrides.type,
            inferredFallbackMode
          );
          const httpMethod = normalizeMetronomeFunctionHttpMethod(overrides.httpMethod || overrides.http_method || overrides.method);
          const rawHeaders = overrides.requestHeaders || overrides.request_headers || overrides.headersRows || overrides.headers_rows || overrides.requestHeadersJson || overrides.request_headers_json || overrides.headersJson || overrides.headers_json || overrides.headers;
          const rawPayload = overrides.payloadJson !== undefined
            ? overrides.payloadJson
            : overrides.payload_json !== undefined
              ? overrides.payload_json
              : overrides.payload;
          const requestHeaders = normalizeMetronomeFunctionHeaderRows(rawHeaders);
          const requestHeadersJson = rawHeaders && typeof rawHeaders === "object"
            ? serializeMetronomeFunctionHeaderRows(requestHeaders)
            : String(rawHeaders || serializeMetronomeFunctionHeaderRows(requestHeaders));
          const payloadJson = rawPayload !== null && typeof rawPayload === "object"
            ? JSON.stringify(rawPayload, null, 2)
            : rawPayload === undefined || rawPayload === null
              ? ""
              : String(rawPayload);
          const outputKey = String(overrides.outputKey || overrides.output_key || "function");
          return {
            functionMode,
            functionId: String(overrides.functionId || overrides.function_id || ""),
            functionName: String(overrides.functionName || overrides.function_name || ""),
            httpMethod,
            method: httpMethod,
            url: String(overrides.url || overrides.requestUrl || overrides.request_url || overrides.endpoint || ""),
            ...overrides,
            functionMode,
            httpMethod,
            method: httpMethod,
            requestHeaders,
            requestHeadersJson,
            payloadJson,
            outputKey,
          };
        }

        function createDefaultMetronomeThreadOutputConfig(overrides = {}) {
          const outputMode = String(overrides.outputMode || overrides.output_mode || "").trim() === "structured"
            ? "structured"
            : "text";
          return {
            outputMode,
            requireJsonOutput: Boolean(overrides.requireJsonOutput || overrides.require_json_output),
            outputFieldsJson: String(overrides.outputFieldsJson || overrides.output_fields_json || JSON.stringify(METRONOME_THREAD_OUTPUT_FIELDS, null, 2)),
            outputContractJson: String(overrides.outputContractJson || overrides.output_contract_json || "{\n  \"summary\": \"\",\n  \"urls\": [],\n  \"records\": [],\n  \"artifacts\": []\n}"),
            outputKey: String(overrides.outputKey || overrides.output_key || "thread"),
          };
        }

        function createDefaultMetronomeFirecrawlConfig(operation, overrides = {}) {
          const normalizedOperation = normalizeMetronomeFirecrawlOperation(operation || overrides.operation);
          const base = {
            operation: normalizedOperation,
            credentialRef: String(overrides.credentialRef || overrides.credential_ref || "workspace:FIRECRAWL_API_KEY"),
            credentialVaultId: String(overrides.credentialVaultId || overrides.credential_vault_id || ""),
            credentialVaultName: String(overrides.credentialVaultName || overrides.credential_vault_name || ""),
            credentialSecretId: String(overrides.credentialSecretId || overrides.credential_secret_id || ""),
            credentialSecretName: String(overrides.credentialSecretName || overrides.credential_secret_name || ""),
            inputBinding: normalizeMetronomeDataBinding(overrides.inputBinding || overrides.input_binding, normalizedOperation === "web_search" ? "last.text" : "last.urls"),
            query: String(overrides.query || ""),
            url: String(overrides.url || ""),
            filePath: String(overrides.filePath || overrides.file_path || ""),
            prompt: String(overrides.prompt || ""),
            schemaJson: String(overrides.schemaJson || overrides.schema_json || "{\n  \"type\": \"object\",\n  \"properties\": {}\n}"),
            limit: Number.isFinite(Number(overrides.limit)) ? Number(overrides.limit) : 5,
            formats: String(overrides.formats || "markdown,html"),
            saveArtifacts: overrides.saveArtifacts === undefined && overrides.save_artifacts === undefined ? true : Boolean(overrides.saveArtifacts ?? overrides.save_artifacts),
            outputKey: String(overrides.outputKey || overrides.output_key || "firecrawl"),
            ...overrides,
          };
          return {
            ...base,
            operation: normalizedOperation,
            inputBinding: normalizeMetronomeDataBinding(base.inputBinding, normalizedOperation === "web_search" ? "last.text" : "last.urls"),
          };
        }

        function createDefaultMetronomeTableConfig(operation, overrides = {}) {
          const normalizedOperation = normalizeMetronomeTableOperation(operation || overrides.operation);
          return {
            operation: normalizedOperation,
            inputBinding: normalizeMetronomeDataBinding(overrides.inputBinding || overrides.input_binding, "trigger.input.files"),
            filePath: String(overrides.filePath || overrides.file_path || ""),
            delimiter: String(overrides.delimiter || (normalizedOperation === "parse_tsv" ? "\\t" : "")),
            hasHeader: overrides.hasHeader === undefined && overrides.has_header === undefined ? true : Boolean(overrides.hasHeader ?? overrides.has_header),
            batchSize: Number.isFinite(Number(overrides.batchSize || overrides.batch_size)) ? Number(overrides.batchSize || overrides.batch_size) : 5,
            outputKey: String(overrides.outputKey || overrides.output_key || "table"),
            ...overrides,
            operation: normalizedOperation,
          };
        }

        function createDefaultMetronomeDatabaseConfig(operation, overrides = {}) {
          const normalizedOperation = String(operation || overrides.operation || "insert_document").trim() || "insert_document";
          const isBulk = normalizedOperation === "insert_many_documents" || normalizedOperation === "upsert_many_documents";
          return {
            operation: normalizedOperation,
            databaseId: "",
            databaseName: "",
            collection: "",
            documentId: "",
            documentJson: "{\n  \"source\": \"metronome\",\n  \"payload\": \"{{ input }}\"\n}",
            inputBinding: normalizeMetronomeDataBinding(overrides.inputBinding || overrides.input_binding, isBulk ? "last.records" : "last.json"),
            recordsBinding: normalizeMetronomeDataBinding(overrides.recordsBinding || overrides.records_binding, "last.records"),
            documentTemplateJson: String(overrides.documentTemplateJson || overrides.document_template_json || "{\n  \"source\": \"metronome\",\n  \"record\": \"{{ record }}\"\n}"),
            upsertKey: String(overrides.upsertKey || overrides.upsert_key || "id"),
            ...overrides,
            operation: normalizedOperation,
          };
        }

        function isMetronomeDatabasePlainObject(value) {
          return Boolean(value && typeof value === "object" && !Array.isArray(value));
        }

        function parseMetronomeDatabaseDocumentObject(value) {
          try {
            const parsed = typeof value === "string" ? JSON.parse(value || "{}") : value;
            return isMetronomeDatabasePlainObject(parsed) ? parsed : null;
          } catch (_error) {
            return null;
          }
        }

        function cloneMetronomeDatabaseValue(value) {
          if (Array.isArray(value)) {
            return value.map((item) => cloneMetronomeDatabaseValue(item));
          }
          if (isMetronomeDatabasePlainObject(value)) {
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneMetronomeDatabaseValue(item)]));
          }
          return value;
        }

        function formatMetronomeDatabaseDocumentJson(value) {
          try {
            return JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);
          } catch (_error) {
            return "{\n}";
          }
        }

        function getMetronomeDatabasePathKey(path) {
          return (Array.isArray(path) ? path : []).map((part) => String(part)).join(".");
        }

        function getMetronomeDatabaseFieldType(value) {
          if (value === null) return "null";
          if (Array.isArray(value)) return "array";
          if (isMetronomeDatabasePlainObject(value)) return "map";
          if (typeof value === "number") return "number";
          if (typeof value === "boolean") return "boolean";
          return "string";
        }

        function getMetronomeDatabaseValueAtPath(rootValue, path) {
          let current = rootValue;
          for (const part of Array.isArray(path) ? path : []) {
            if (!current || typeof current !== "object") return undefined;
            current = current[part];
          }
          return current;
        }

        function setMetronomeDatabaseValueAtPath(rootValue, path, nextValue) {
          const nextRoot = cloneMetronomeDatabaseValue(rootValue || {});
          const normalizedPath = Array.isArray(path) ? path : [];
          if (!normalizedPath.length) return nextValue;
          let current = nextRoot;
          normalizedPath.slice(0, -1).forEach((part) => {
            if (!current[part] || typeof current[part] !== "object") {
              current[part] = {};
            }
            current = current[part];
          });
          current[normalizedPath[normalizedPath.length - 1]] = nextValue;
          return nextRoot;
        }

        function deleteMetronomeDatabaseValueAtPath(rootValue, path) {
          const nextRoot = cloneMetronomeDatabaseValue(rootValue || {});
          const normalizedPath = Array.isArray(path) ? path : [];
          if (!normalizedPath.length) return nextRoot;
          let current = nextRoot;
          normalizedPath.slice(0, -1).forEach((part) => {
            current = current && typeof current === "object" ? current[part] : null;
          });
          if (current && typeof current === "object") {
            delete current[normalizedPath[normalizedPath.length - 1]];
          }
          return nextRoot;
        }

        function createMetronomeDatabaseFieldValue(type, rawValue = "") {
          const normalizedType = String(type || "string").toLowerCase();
          if (normalizedType === "number") {
            const trimmedValue = String(rawValue || "").trim();
            if (!trimmedValue) return 0;
            const numericValue = Number(trimmedValue);
            if (!Number.isFinite(numericValue)) {
              throw new Error("Number value is invalid.");
            }
            return numericValue;
          }
          if (normalizedType === "boolean") return String(rawValue || "").trim() === "true";
          if (normalizedType === "null") return null;
          if (normalizedType === "array") return [];
          if (normalizedType === "map" || normalizedType === "object") return {};
          return String(rawValue || "");
        }

        function coerceMetronomeDatabaseFieldValue(previousValue, rawValue) {
          const previousType = getMetronomeDatabaseFieldType(previousValue);
          if (previousType === "number") {
            const nextNumber = Number(rawValue);
            return Number.isFinite(nextNumber) ? nextNumber : 0;
          }
          if (previousType === "boolean") {
            return String(rawValue) === "true";
          }
          if (previousType === "null") {
            return null;
          }
          return String(rawValue || "");
        }

        function formatMetronomeDatabaseFieldPreview(value) {
          const type = getMetronomeDatabaseFieldType(value);
          if (type === "array") return value.length + " item" + (value.length === 1 ? "" : "s");
          if (type === "map") {
            const count = Object.keys(value || {}).length;
            return count + " field" + (count === 1 ? "" : "s");
          }
          if (type === "null") return "null";
          if (type === "boolean") return value ? "true" : "false";
          if (type === "number") return String(value);
          const text = String(value || "");
          return text.length > 72 ? text.slice(0, 69) + "..." : text;
        }
`;
