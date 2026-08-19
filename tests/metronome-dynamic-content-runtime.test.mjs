import assert from "node:assert/strict";
import { METRONOME_PAGE_SCRIPT } from "../src/platform-services/create-mode/metronome/index.mjs";

const startMarker = "function parseMetronomeDynamicContentJsonObject";
const endMarker = "function normalizeMetronomeDataBinding";
const startIndex = METRONOME_PAGE_SCRIPT.indexOf(startMarker);
const endIndex = METRONOME_PAGE_SCRIPT.indexOf(endMarker);

assert.ok(startIndex >= 0, "dynamic content helper block start marker should exist");
assert.ok(endIndex > startIndex, "dynamic content helper block end marker should exist");

const helperSource = METRONOME_PAGE_SCRIPT.slice(startIndex, endIndex);
const nodeKindMeta = {
  action: { label: "Thread" },
  imagine: { label: "Imagine" },
  trigger: { label: "Trigger" },
  firecrawl: { label: "Firecrawl" },
  table: { label: "Table" },
  database: { label: "Database" },
  function: { label: "Function" },
  metronome: { label: "Metronome" },
  loop: { label: "Loop" },
  ticket: { label: "Ticket" },
  approval: { label: "User Approval" },
  condition: { label: "Condition" },
  end: { label: "End" },
  note: { label: "Note" },
  wait: { label: "Wait" },
};
const getMetronomeNodeDisplayLabel = (node) => {
  const data = node?.data && typeof node.data === "object" ? node.data : node || {};
  return String(data.label || node?.label || nodeKindMeta[data.kind || node?.kind || "action"]?.label || "Node");
};

const helperFactory = new Function(
  "METRONOME_NODE_KIND_META",
  "getMetronomeNodeDisplayLabel",
  helperSource + "\nreturn {\n"
    + "  buildMetronomeDynamicContentToken,\n"
    + "  parseMetronomeDynamicReferenceExpression,\n"
    + "  resolveMetronomeDynamicContentReferences,\n"
    + "  createMetronomeExecutionPayload,\n"
    + "  enrichMetronomeWorkflowDefinitionWithDynamicContent,\n"
    + "  getMetronomeNodeIOContract,\n"
    + "  getMetronomeNodeTestInputFields,\n"
    + "};"
);

const helpers = helperFactory(nodeKindMeta, getMetronomeNodeDisplayLabel);

assert.equal(
  helpers.buildMetronomeDynamicContentToken({ scope: "node", nodeId: "node-1", path: "thread.summary" }),
  "{{ nodes[\"node-1\"].outputs.thread.summary }}"
);

assert.deepEqual(
  helpers.parseMetronomeDynamicReferenceExpression("nodes[\"node-1\"].outputs.thread.json.summary"),
  {
    scope: "node",
    nodeId: "node-1",
    path: ["thread", "json", "summary"],
    expression: "nodes[\"node-1\"].outputs.thread.json.summary",
  }
);

const context = {
  trigger: { input: { prompt: "Classify this lead", files: ["lead.csv"] } },
  workflow: { context: { workflowName: "Sales qualification" } },
  last: { text: "Previous answer" },
  current: { record: { company: "Acme" } },
  nodes: {
    "node-1": {
      outputs: {
        thread: {
          text: "Qualified",
          summary: "Enterprise lead",
          json: { summary: "Enterprise lead", score: 92 },
          records: [{ id: "lead-1", score: 92 }],
        },
      },
    },
  },
};

assert.equal(
  helpers.resolveMetronomeDynamicContentReferences("Prompt: {{ trigger.input.prompt }}", context),
  "Prompt: Classify this lead"
);

assert.deepEqual(
  helpers.resolveMetronomeDynamicContentReferences("{{ nodes[\"node-1\"].outputs.thread.records }}", context),
  [{ id: "lead-1", score: 92 }]
);

assert.equal(
  helpers.resolveMetronomeDynamicContentReferences("{{ nodes[\"missing\"].outputs.thread.text }}", context),
  "{{ nodes[\"missing\"].outputs.thread.text }}"
);

const definition = {
  name: "Sales qualification",
  nodes: [
    {
      id: "node-1",
      kind: "action",
      label: "Qualify lead",
      config: {
        message: "Use {{ trigger.input.prompt }} and return score.",
        outputKey: "thread",
        outputContractJson: JSON.stringify({ summary: "", score: 0, records: [] }, null, 2),
      },
    },
  ],
  edges: [],
};

const payload = helpers.createMetronomeExecutionPayload(
  { id: "workflow-1", name: "Sales qualification" },
  definition,
  { prompt: "Run {{ workflow.context.workflowName }}" }
);

assert.equal(payload.inputs.prompt, "Run Sales qualification");
assert.equal(payload.definition.dynamicContent.version, 1);
assert.equal(payload.definition.nodes[0].dynamicReferences[0].expression, "trigger.input.prompt");
assert.ok(
  payload.definition.nodes[0].ioContract.outputs.some((field) => field.path === "thread.summary"),
  "structured contract fields should be exposed as first-class outputs"
);
assert.ok(
  payload.definition.nodes[0].ioContract.outputs.some((field) => field.path === "thread.json.summary"),
  "structured contract fields should keep raw JSON access"
);

assert.deepEqual(
  helpers.getMetronomeNodeTestInputFields({ id: "agent-1", data: { kind: "action", label: "Draft response" } }),
  [{
    id: "prompt",
    path: "prompt",
    label: "Prompt",
    control: "task-input",
    valueType: "string",
    placeholder: "Describe the input for this test run.",
    description: "",
    required: false,
    defaultValue: "",
    options: [],
  }],
  "agent node tests should ask for a prompt instead of a raw JSON fixture"
);

const functionTestFields = helpers.getMetronomeNodeTestInputFields({
  id: "function-1",
  data: {
    kind: "function",
    label: "Search customers",
    config: {
      inputSchemaJson: JSON.stringify({
        type: "object",
        required: ["query"],
        properties: {
          query: { type: "string", title: "Search query" },
          limit: { type: "integer", default: 10 },
          includeArchived: { type: "boolean", default: false },
          mode: { type: "string", enum: ["fast", "thorough"], default: "fast" },
        },
      }),
    },
  },
});
assert.deepEqual(
  functionTestFields.map(({ path, control, valueType, required, defaultValue }) => ({
    path,
    control,
    valueType,
    required,
    defaultValue,
  })),
  [
    { path: "query", control: "text", valueType: "string", required: true, defaultValue: "" },
    { path: "limit", control: "number", valueType: "number", required: false, defaultValue: 10 },
    { path: "includeArchived", control: "toggle", valueType: "boolean", required: false, defaultValue: false },
    { path: "mode", control: "selector", valueType: "string", required: false, defaultValue: "fast" },
  ],
  "function test inputs should be generated as explicit controls from the node schema"
);

assert.deepEqual(
  helpers.getMetronomeNodeTestInputFields({ id: "end-1", data: { kind: "end" } }),
  [],
  "nodes without runtime input should not render placeholder fixture controls"
);

console.log("metronome dynamic content runtime tests passed");
