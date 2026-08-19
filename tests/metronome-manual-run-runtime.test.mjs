import assert from "node:assert/strict";

import { METRONOME_TRIGGERS_03_FRAGMENT } from "../src/platform-services/create-mode/metronome/client/runtime/triggers-and-contracts/03-manual-run-contracts.mjs";

const dependencies = {
  getMetronomeNodeConfigRecord(node) {
    return node?.data?.config && typeof node.data.config === "object" ? node.data.config : {};
  },
  getMetronomeNodeSubtypeValue(node) {
    return String(node?.data?.subtype || "");
  },
  getMetronomeNodeKindValue(node) {
    return String(node?.data?.kind || "");
  },
  getMetronomeProjectEnvironmentId(project) {
    return String(project?.environmentId || "");
  },
  createMetronomeNodeTestInputField(path, label, options = {}) {
    return {
      id: path,
      path,
      label,
      control: options.control || "text",
      valueType: options.valueType || "string",
      required: options.required === true,
      defaultValue: options.defaultValue ?? "",
      placeholder: options.placeholder || "",
      description: options.description || "",
      options: (options.options || []).map((option) => ({
        value: String(option?.value ?? option?.id ?? option ?? ""),
        label: String(option?.label ?? option ?? ""),
      })),
    };
  },
  getMetronomeNodeTestInputObject() {
    return null;
  },
  buildMetronomeFunctionTriggerPayloadSchema() {
    return { type: "object", properties: {} };
  },
  normalizeMetronomeFunctionTriggerPayloadFields() {
    return [];
  },
  collectMetronomeNodeTestInputFields() {
    return [];
  },
  buildDefaultMetronomeGitHubTriggerConfig(config = {}) {
    return {
      githubEventType: config.githubEventType || "push",
      githubRepositoryContains: config.githubRepositoryContains || "",
      githubBranchContains: "",
      githubActionContains: "",
      githubActorContains: "",
    };
  },
  METRONOME_GITHUB_EVENT_OPTIONS: [{ id: "push", label: "Push" }],
  buildDefaultMetronomeResourceTriggerConfig(config = {}) {
    return {
      resourceEventType: config.resourceEventType || "function_deployed",
      resourceId: config.resourceId || "",
      resourceName: "",
      resourceKind: "function",
    };
  },
  normalizeMetronomeResourceEventType(value) {
    return value || "function_deployed";
  },
  METRONOME_RESOURCE_EVENT_OPTIONS: [{ id: "function_deployed", label: "Function deployed" }],
  buildDefaultMetronomeDatabaseEntryTriggerConfig(config = {}) {
    return {
      databaseEventType: "document_created",
      databaseId: config.databaseId || "",
      databaseName: "",
      databaseCollection: config.databaseCollection || "",
    };
  },
  METRONOME_DATABASE_ENTRY_EVENT_OPTIONS: [{ id: "document_created", label: "Document added" }],
  buildDefaultMetronomeAuthTriggerConfig(config = {}) {
    return {
      authEventType: "user_registered",
      authResourceId: config.authResourceId || "",
      authResourceName: "",
      authEmailContains: "",
    };
  },
  METRONOME_AUTH_EVENT_OPTIONS: [{ id: "user_registered", label: "User registered" }],
  buildDefaultMetronomeEmailTriggerConfig() {
    return { emailAddress: "workflow@agent.computer-agents.com" };
  },
  buildDefaultMetronomeTelegramTriggerConfig() {
    return { telegramCommand: "/workflow" };
  },
  buildDefaultMetronomeProjectTicketTriggerConfig() {
    return {
      ticketEventType: "comment_added",
      ticketProjectId: "project_1",
      ticketProjectName: "Launch",
      ticketFromStatus: "in_progress",
      ticketToStatus: "in_review",
    };
  },
  buildDefaultMetronomeScheduleConfig() {
    return {
      scheduledTime: "2026-08-18T12:00:00.000Z",
      scheduleType: "recurring",
      cronExpression: "0 12 * * *",
      scheduleTimezone: "Europe/Berlin",
    };
  },
};

const dependencyNames = Object.keys(dependencies);
const helperFactory = new Function(
  ...dependencyNames,
  METRONOME_TRIGGERS_03_FRAGMENT
    + "\nreturn { createMetronomeManualRunContracts, buildMetronomeManualRunInput };",
);
const helpers = helperFactory(...dependencyNames.map((name) => dependencies[name]));

const createWorkflow = (triggerSubtype) => ({
  id: "met_1",
  name: "Customer intake",
  nodes: [
    {
      id: "trigger_1",
      data: { kind: "trigger", subtype: triggerSubtype, config: {} },
    },
    {
      id: "action_1",
      data: {
        kind: "action",
        subtype: "thread",
        config: { agentId: "agent_1", environmentId: "computer_1" },
      },
    },
  ],
  edges: [{ source: "trigger_1", target: "action_1" }],
});

for (const triggerType of ["thread_event", "email", "telegram", "project_ticket", "periodic"]) {
  const workflow = createWorkflow(triggerType);
  const [contract] = helpers.createMetronomeManualRunContracts(
    workflow,
    workflow.nodes,
    workflow.edges,
    {
      agentOptions: [{ id: "agent_1", name: "Support agent" }],
      environmentOptions: [{ id: "computer_1", name: "Support computer" }],
      projectOptions: [],
    },
  );
  assert.equal(contract.mode, "composer", `${triggerType} should use the task-input composer`);
  assert.equal(contract.composerBinding.agentId, "agent_1");
  assert.equal(contract.composerBinding.environmentId, "computer_1");
  assert.equal(contract.inputFields[0].control, "task-input");
  assert.equal(contract.inputFields[0].required, triggerType !== "periodic");
}

const githubWorkflow = createWorkflow("github");
githubWorkflow.nodes[0].data.config = {
  githubEventType: "push",
  githubRepositoryContains: "computer-agents/platform",
};
const [githubContract] = helpers.createMetronomeManualRunContracts(
  githubWorkflow,
  githubWorkflow.nodes,
  githubWorkflow.edges,
  {},
);
assert.equal(githubContract.mode, "structured");
assert.deepEqual(
  githubContract.inputFields.slice(0, 2).map((field) => [field.path, field.control]),
  [["github.eventType", "selector"], ["github.repositoryFullName", "text"]],
);

const githubInput = helpers.buildMetronomeManualRunInput(githubContract, {
  github: {
    eventType: "push",
    repositoryFullName: "computer-agents/platform",
    branch: "main",
  },
});
assert.equal(githubInput.triggerType, "github");
assert.equal(githubInput.github.repositoryFullName, "computer-agents/platform");
assert.match(githubInput.prompt, /GitHub push received/);

const emailWorkflow = createWorkflow("email");
const [emailContract] = helpers.createMetronomeManualRunContracts(
  emailWorkflow,
  emailWorkflow.nodes,
  emailWorkflow.edges,
  {
    agentOptions: [{ id: "agent_1", name: "Support agent" }],
    environmentOptions: [{ id: "computer_1", name: "Support computer" }],
  },
);
const emailInput = helpers.buildMetronomeManualRunInput(
  emailContract,
  { prompt: "Please triage this request" },
  { prompt: "Please triage this request", attachments: [{ id: "file_1" }] },
);
assert.equal(emailInput.source, "email");
assert.equal(emailInput.simulation.mode, "manual");
assert.equal(emailInput.email.text, "Please triage this request");
assert.deepEqual(emailInput.email.attachments, [{ id: "file_1" }]);

const threadWorkflow = createWorkflow("thread_event");
const [threadContract] = helpers.createMetronomeManualRunContracts(
  threadWorkflow,
  threadWorkflow.nodes,
  threadWorkflow.edges,
  {
    agentOptions: [{ id: "agent_1", name: "Support agent" }],
    environmentOptions: [{ id: "computer_1", name: "Support computer" }],
  },
);
const threadInput = helpers.buildMetronomeManualRunInput(
  threadContract,
  { prompt: "Investigate the incident" },
  { prompt: "Investigate the incident", attachments: [] },
);
assert.equal(threadInput.source, "thread_event");
assert.equal(threadInput.agentId, "agent_1");
assert.equal(threadInput.environmentId, "computer_1");
assert.equal(threadInput.message, "Investigate the incident");

const structuredTriggerFixtures = {
  function: { payload: { customerId: "customer_1" } },
  resource: {
    resource: {
      eventType: "function_deployed",
      resourceId: "function_1",
      resourceKind: "function",
      deploymentId: "deployment_1",
    },
  },
  database_entry: {
    databaseEntry: {
      eventType: "document_created",
      databaseId: "database_1",
      collectionId: "customers",
      documentId: "customer_1",
      document: { name: "Ada" },
    },
  },
  auth: {
    auth: {
      eventType: "user_registered",
      authResourceId: "auth_1",
      authUserId: "user_1",
      email: "ada@example.com",
    },
  },
};

for (const [triggerType, fixture] of Object.entries(structuredTriggerFixtures)) {
  const workflow = createWorkflow(triggerType);
  const [contract] = helpers.createMetronomeManualRunContracts(
    workflow,
    workflow.nodes,
    workflow.edges,
    {},
  );
  assert.equal(contract.mode, "structured", `${triggerType} should use structured inputs`);
  const structuredInput = helpers.buildMetronomeManualRunInput(contract, fixture);
  assert.equal(
    structuredInput.source,
    triggerType === "function" ? "function_trigger" : triggerType,
  );
  assert.equal(structuredInput.simulation.triggerType, triggerType);
}

console.log("metronome manual run runtime tests passed");
