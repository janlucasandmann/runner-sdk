export type MetronomeManualRunTriggerType =
  | "thread_event"
  | "email"
  | "telegram"
  | "project_ticket"
  | "periodic"
  | "function"
  | "github"
  | "resource"
  | "database_entry"
  | "auth"
  | "manual";

export type MetronomeManualRunFieldControl =
  | "text"
  | "textarea"
  | "number"
  | "url"
  | "date"
  | "datetime-local"
  | "selector"
  | "toggle"
  | "list"
  | "task-input";

export interface MetronomeManualRunOption {
  value: string;
  label: string;
}

export interface MetronomeManualRunResourceOption {
  id: string;
  name: string;
  kind?: string;
}

export interface MetronomeManualRunProjectOption extends MetronomeManualRunResourceOption {
  defaultEnvironmentId?: string | null;
  environmentId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface MetronomeManualRunField {
  id: string;
  path: string;
  label: string;
  control: MetronomeManualRunFieldControl;
  valueType: string;
  placeholder: string;
  description: string;
  required: boolean;
  readOnly?: boolean;
  defaultValue: unknown;
  options: MetronomeManualRunOption[];
}

export interface MetronomeManualRunComposerBinding {
  nodeId: string;
  agentId: string;
  agentName: string;
  environmentId: string;
  environmentName: string;
  projectId: string;
}

export interface MetronomeManualRunContract {
  id: string;
  nodeId: string;
  triggerType: MetronomeManualRunTriggerType;
  label: string;
  mode: "composer" | "structured";
  inputFields: MetronomeManualRunField[];
  composerBinding: MetronomeManualRunComposerBinding | null;
  triggerConfig: Record<string, unknown>;
}

export interface MetronomeManualRunContractOptions {
  agentOptions?: readonly MetronomeManualRunResourceOption[];
  environmentOptions?: readonly MetronomeManualRunResourceOption[];
  projectOptions?: readonly MetronomeManualRunProjectOption[];
  functionOptions?: readonly MetronomeManualRunResourceOption[];
  webAppOptions?: readonly MetronomeManualRunResourceOption[];
  databaseOptions?: readonly MetronomeManualRunResourceOption[];
  authOptions?: readonly MetronomeManualRunResourceOption[];
}

export interface MetronomeManualRunComposerPayload {
  prompt?: string | null;
  attachments?: readonly unknown[] | null;
  environmentId?: string | null;
  projectId?: string | null;
  agentId?: string | null;
}

const COMPOSER_TRIGGER_TYPES = new Set<MetronomeManualRunTriggerType>([
  "thread_event",
  "email",
  "telegram",
  "project_ticket",
  "periodic",
  "manual",
]);

const TRIGGER_LABELS: Record<MetronomeManualRunTriggerType, string> = {
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
};

const GITHUB_EVENT_OPTIONS = options([
  ["push", "Push"],
  ["pull_request", "Pull request"],
  ["issues", "Issue"],
  ["issue_comment", "Issue comment"],
  ["pull_request_review", "Pull request review"],
  ["workflow_run", "Workflow run"],
  ["release", "Release"],
  ["any", "Any event"],
]);

const RESOURCE_EVENT_OPTIONS = options([
  ["function_deployed", "Function deployed"],
  ["web_app_deployed", "Web app deployed"],
]);

const DATABASE_EVENT_OPTIONS = options([["document_created", "Document added"]]);
const AUTH_EVENT_OPTIONS = options([["user_registered", "User registered"]]);

function options(entries: ReadonlyArray<readonly [string, string]>): MetronomeManualRunOption[] {
  return entries.map(([value, label]) => ({ value, label }));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

function normalizeTriggerType(value: unknown): MetronomeManualRunTriggerType {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "thread" || normalized === "message" || normalized === "chat") {
    return "thread_event";
  }
  if (normalized === "ticket" || normalized === "project") return "project_ticket";
  if (normalized === "schedule" || normalized === "scheduled") return "periodic";
  return Object.hasOwn(TRIGGER_LABELS, normalized)
    ? (normalized as MetronomeManualRunTriggerType)
    : "manual";
}

function nodeId(node: unknown): string {
  const source = asRecord(node);
  return readString(source.id, asRecord(source.data).id);
}

function nodeKind(node: unknown): string {
  const source = asRecord(node);
  return readString(asRecord(source.data).kind, source.kind, "action");
}

function nodeSubtype(node: unknown): string {
  const source = asRecord(node);
  return readString(asRecord(source.data).subtype, source.subtype);
}

function nodeConfig(node: unknown): Record<string, unknown> {
  const source = asRecord(node);
  const data = asRecord(source.data);
  return Object.keys(asRecord(data.config)).length
    ? asRecord(data.config)
    : asRecord(source.config);
}

function field(
  path: string,
  label: string,
  settings: Partial<Omit<MetronomeManualRunField, "id" | "path" | "label">> = {},
): MetronomeManualRunField {
  return {
    id: path,
    path,
    label,
    control: settings.control || "text",
    valueType: settings.valueType || "string",
    placeholder: settings.placeholder || "",
    description: settings.description || "",
    required: settings.required === true,
    readOnly: settings.readOnly === true,
    defaultValue: settings.defaultValue ?? "",
    options: [...(settings.options || [])],
  };
}

function titleCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function parseRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return asRecord(value);
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? asRecord(parsed) : null;
  } catch {
    return null;
  }
}

function schemaFields(
  schema: Record<string, unknown>,
  prefix = "payload",
  depth = 0,
  output: MetronomeManualRunField[] = [],
): MetronomeManualRunField[] {
  if (depth > 4 || output.length >= 64) return output;
  const properties = asRecord(schema.properties);
  const source = Object.keys(properties).length ? properties : schema;
  const required = new Set(Array.isArray(schema.required) ? schema.required.map(String) : []);
  Object.entries(source).forEach(([key, rawValue]) => {
    if (output.length >= 64) return;
    const property = asRecord(rawValue);
    const propertyProperties = asRecord(property.properties);
    const value = Object.keys(properties).length
      ? (property.default ?? property.example ?? "")
      : rawValue;
    const path = `${prefix}.${key}`;
    if (Object.keys(propertyProperties).length) {
      schemaFields(property, path, depth + 1, output);
      return;
    }
    const type = readString(property.type, Array.isArray(value) ? "array" : typeof value, "string");
    const enumValues = Array.isArray(property.enum) ? property.enum : [];
    let control: MetronomeManualRunFieldControl = "text";
    if (enumValues.length) control = "selector";
    else if (type === "boolean") control = "toggle";
    else if (type === "number" || type === "integer") control = "number";
    else if (type === "array") control = "list";
    else if (property.format === "date") control = "date";
    else if (property.format === "date-time") control = "datetime-local";
    else if (property.format === "url" || property.format === "uri") control = "url";
    else if (typeof value === "string" && value.length > 80) control = "textarea";
    output.push(
      field(path, readString(property.title, titleCase(key)), {
        control,
        valueType: type,
        placeholder: readString(property.placeholder, property.description),
        description: readString(property.description),
        required: required.has(key),
        defaultValue: typeof value === "string" && value.includes("{{") ? "" : value,
        options: enumValues.map((entry) => ({ value: String(entry), label: String(entry) })),
      }),
    );
  });
  return output;
}

function functionPayloadSchema(config: Record<string, unknown>): Record<string, unknown> | null {
  const keys = [
    "payloadSchemaJson",
    "payload_schema_json",
    "payloadSchema",
    "payload_schema",
    "samplePayloadJson",
    "sample_payload_json",
    "expectedPayload",
    "expected_payload",
  ];
  for (const key of keys) {
    const parsed = parseRecord(config[key]);
    if (parsed && Object.keys(parsed).length) return parsed;
  }
  const payloadFields = Array.isArray(config.payloadFields)
    ? config.payloadFields
    : Array.isArray(config.payload_fields)
      ? config.payload_fields
      : [];
  if (!payloadFields.length) return null;
  const properties: Record<string, unknown> = {};
  payloadFields.forEach((entry) => {
    const source = asRecord(entry);
    const key = readString(source.key, source.name);
    if (!key) return;
    properties[key] = {
      type: readString(source.type, "string"),
      default: source.defaultValue ?? source.default_value ?? source.value ?? "",
    };
  });
  return { type: "object", properties };
}

function normalizeOptionValue(
  value: unknown,
  allowed: readonly MetronomeManualRunOption[],
  fallback: string,
) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return allowed.some((option) => option.value === normalized) ? normalized : fallback;
}

function structuredFields(
  triggerType: MetronomeManualRunTriggerType,
  config: Record<string, unknown>,
  contractOptions: MetronomeManualRunContractOptions,
): MetronomeManualRunField[] {
  if (triggerType === "function") {
    const schema = functionPayloadSchema(config);
    const fields = schema ? schemaFields(schema) : [];
    return fields.length
      ? fields
      : [
          field("payload.input", "Payload input", {
            required: true,
            placeholder: "Enter the value delivered to this function trigger",
          }),
        ];
  }
  if (triggerType === "github") {
    return [
      field("github.eventType", "Event", {
        control: "selector",
        required: true,
        defaultValue: normalizeOptionValue(
          config.githubEventType ?? config.github_event_type ?? config.eventType,
          GITHUB_EVENT_OPTIONS,
          "push",
        ),
        options: GITHUB_EVENT_OPTIONS,
      }),
      field("github.repositoryFullName", "Repository", {
        required: true,
        defaultValue: readString(
          config.githubRepositoryContains,
          config.github_repository_contains,
        ),
        placeholder: "organization/repository",
      }),
      field("github.branch", "Branch", {
        defaultValue: readString(config.githubBranchContains, config.github_branch_contains),
        placeholder: "main",
      }),
      field("github.action", "Action", {
        defaultValue: readString(config.githubActionContains, config.github_action_contains),
        placeholder: "opened",
      }),
      field("github.senderLogin", "Actor", {
        defaultValue: readString(config.githubActorContains, config.github_actor_contains),
        placeholder: "octocat",
      }),
      field("github.title", "Title"),
      field("github.body", "Body", { control: "textarea" }),
      field("github.url", "URL", { control: "url", placeholder: "https://github.com/…" }),
    ];
  }
  if (triggerType === "resource") {
    const eventType = normalizeOptionValue(
      config.resourceEventType ?? config.resource_event_type ?? config.eventType,
      RESOURCE_EVENT_OPTIONS,
      "function_deployed",
    );
    const resourceId = readString(
      config.resourceId,
      config.resource_id,
      config.serverId,
      config.server_id,
    );
    const resources =
      eventType === "web_app_deployed"
        ? contractOptions.webAppOptions
        : contractOptions.functionOptions;
    const resourceOptions = (resources || []).map((option) => ({
      value: option.id,
      label: option.name,
    }));
    return [
      field("resource.eventType", "Event", {
        control: "selector",
        required: true,
        defaultValue: eventType,
        options: RESOURCE_EVENT_OPTIONS,
      }),
      field("resource.resourceId", "Resource", {
        control: resourceOptions.length ? "selector" : "text",
        required: true,
        readOnly: Boolean(resourceId),
        defaultValue: resourceId,
        options: resourceOptions,
      }),
      field("resource.resourceName", "Resource name", {
        defaultValue: readString(config.resourceName, config.resource_name),
      }),
      field("resource.resourceKind", "Resource type", {
        control: "selector",
        required: true,
        defaultValue: readString(
          config.resourceKind,
          config.resource_kind,
          eventType === "web_app_deployed" ? "web_app" : "function",
        ),
        options: options([
          ["function", "Function"],
          ["web_app", "Web app"],
        ]),
      }),
      field("resource.deploymentId", "Deployment ID", { required: true }),
      field("resource.deploymentType", "Deployment type", { defaultValue: "manual" }),
      field("resource.revision", "Revision"),
      field("resource.serviceUrl", "Service URL", { control: "url" }),
    ];
  }
  if (triggerType === "database_entry") {
    const databaseId = readString(config.databaseId, config.database_id);
    const databaseOptions = (contractOptions.databaseOptions || []).map((option) => ({
      value: option.id,
      label: option.name,
    }));
    const collection = readString(
      config.databaseCollection,
      config.database_collection,
      config.collectionId,
      config.collection_id,
      config.collection,
    );
    return [
      field("databaseEntry.eventType", "Event", {
        control: "selector",
        required: true,
        defaultValue: "document_created",
        options: DATABASE_EVENT_OPTIONS,
      }),
      field("databaseEntry.databaseId", "Database", {
        control: databaseOptions.length ? "selector" : "text",
        required: true,
        readOnly: Boolean(databaseId),
        defaultValue: databaseId,
        options: databaseOptions,
      }),
      field("databaseEntry.databaseName", "Database name", {
        defaultValue: readString(config.databaseName, config.database_name),
      }),
      field("databaseEntry.collectionId", "Collection", {
        required: true,
        readOnly: Boolean(collection),
        defaultValue: collection,
        placeholder: "customers",
      }),
      field("databaseEntry.documentId", "Document ID", { required: true }),
      field("databaseEntry.collectionName", "Collection name", { defaultValue: collection }),
      field("databaseEntry.document.title", "Document title"),
      field("databaseEntry.document.content", "Document content", { control: "textarea" }),
    ];
  }
  if (triggerType === "auth") {
    const authResourceId = readString(
      config.authResourceId,
      config.auth_resource_id,
      config.resourceId,
    );
    const authOptions = (contractOptions.authOptions || []).map((option) => ({
      value: option.id,
      label: option.name,
    }));
    return [
      field("auth.eventType", "Event", {
        control: "selector",
        required: true,
        defaultValue: "user_registered",
        options: AUTH_EVENT_OPTIONS,
      }),
      field("auth.authResourceId", "Authentication resource", {
        control: authOptions.length ? "selector" : "text",
        required: true,
        readOnly: Boolean(authResourceId),
        defaultValue: authResourceId,
        options: authOptions,
      }),
      field("auth.authResourceName", "Resource name", {
        defaultValue: readString(config.authResourceName, config.auth_resource_name),
      }),
      field("auth.authUserId", "User ID", { required: true }),
      field("auth.email", "Email", {
        required: true,
        defaultValue: readString(config.authEmailContains, config.auth_email_contains),
        placeholder: "person@example.com",
      }),
      field("auth.displayName", "Display name"),
    ];
  }
  return [];
}

function projectEnvironmentId(project: MetronomeManualRunProjectOption | undefined): string {
  if (!project) return "";
  const metadata = asRecord(project.metadata);
  return readString(
    project.defaultEnvironmentId,
    project.environmentId,
    metadata.defaultEnvironmentId,
    metadata.environmentId,
  );
}

function composerBinding(
  triggerNode: unknown,
  nodes: readonly unknown[],
  edges: readonly unknown[],
  contractOptions: MetronomeManualRunContractOptions,
): MetronomeManualRunComposerBinding {
  const byId = new Map(nodes.map((node) => [nodeId(node), node]));
  const start = nodeId(triggerNode);
  const queue = start ? [start] : [];
  const visited = new Set<string>();
  let actionNode: unknown = null;
  while (queue.length) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id);
    const node = byId.get(id);
    if (node && nodeKind(node) === "action") {
      actionNode = node;
      break;
    }
    edges.forEach((rawEdge) => {
      const edge = asRecord(rawEdge);
      if (readString(edge.source) !== id) return;
      const target = readString(edge.target);
      if (target && !visited.has(target)) queue.push(target);
    });
  }
  actionNode ||= nodes.find((node) => nodeKind(node) === "action") || null;
  const config = nodeConfig(actionNode);
  const projectId = readString(config.projectId, config.project_id);
  const project = (contractOptions.projectOptions || []).find((option) => option.id === projectId);
  const environmentId = readString(
    config.environmentId,
    config.environment_id,
    config.computerId,
    config.computer_id,
    projectEnvironmentId(project),
    contractOptions.environmentOptions?.[0]?.id,
  );
  const agentId = readString(
    config.agentId,
    config.agent_id,
    contractOptions.agentOptions?.[0]?.id,
  );
  return {
    nodeId: nodeId(actionNode),
    agentId,
    agentName: readString(
      contractOptions.agentOptions?.find((option) => option.id === agentId)?.name,
      config.agentName,
      config.agent_name,
      agentId,
      "Agent",
    ),
    environmentId,
    environmentName: readString(
      contractOptions.environmentOptions?.find((option) => option.id === environmentId)?.name,
      config.environmentName,
      config.environment_name,
      environmentId,
      "Computer",
    ),
    projectId,
  };
}

export function createMetronomeManualRunContracts(
  _workflow: Record<string, unknown>,
  nodes: readonly unknown[],
  edges: readonly unknown[],
  contractOptions: MetronomeManualRunContractOptions = {},
): MetronomeManualRunContract[] {
  const triggerNodes = nodes.filter((node) => nodeKind(node) === "trigger");
  const sources: unknown[] = triggerNodes.length ? triggerNodes : [null];
  return sources.map((triggerNode) => {
    const config = nodeConfig(triggerNode);
    const triggerType = triggerNode
      ? normalizeTriggerType(config.triggerType ?? config.trigger_type ?? nodeSubtype(triggerNode))
      : "manual";
    const id = nodeId(triggerNode) || "manual";
    const mode = COMPOSER_TRIGGER_TYPES.has(triggerType) ? "composer" : "structured";
    return {
      id: `${id}:${triggerType}`,
      nodeId: id,
      triggerType,
      label: TRIGGER_LABELS[triggerType],
      mode,
      inputFields:
        mode === "composer"
          ? [
              field("prompt", triggerType === "periodic" ? "Optional prompt" : "Prompt", {
                control: "task-input",
                required: triggerType !== "periodic",
                placeholder:
                  triggerType === "periodic"
                    ? "Optionally add instructions for this scheduled run"
                    : "Describe the input for this workflow run",
              }),
            ]
          : structuredFields(triggerType, config, contractOptions),
      composerBinding:
        mode === "composer" ? composerBinding(triggerNode, nodes, edges, contractOptions) : null,
      triggerConfig: config,
    };
  });
}

function valueAtPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => asRecord(current)[segment], source);
}

function setValueAtPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".").filter(Boolean);
  let cursor = target;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }
    cursor[part] = asRecord(cursor[part]);
    cursor = cursor[part] as Record<string, unknown>;
  });
}

function valueForField(fieldDefinition: MetronomeManualRunField, value: unknown): unknown {
  if (fieldDefinition.control === "toggle" || fieldDefinition.valueType === "boolean") {
    return value === true || value === "true" || value === "1" || value === "yes";
  }
  if (
    fieldDefinition.control === "number" ||
    ["number", "integer"].includes(fieldDefinition.valueType)
  ) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (
    fieldDefinition.control === "list" ||
    ["array", "object"].includes(fieldDefinition.valueType)
  ) {
    if (typeof value !== "string") return value;
    try {
      const parsed = JSON.parse(value);
      if (fieldDefinition.valueType === "array") return Array.isArray(parsed) ? parsed : [];
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return fieldDefinition.valueType === "array"
        ? value
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
        : {};
    }
  }
  return String(value ?? "");
}

export function createMetronomeManualRunInitialValues(
  contract: MetronomeManualRunContract,
  existingInput: Record<string, unknown> = {},
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  contract.inputFields.forEach((inputField) => {
    const existing =
      inputField.path === "prompt"
        ? (existingInput.prompt ?? existingInput.message)
        : valueAtPath(existingInput, inputField.path);
    const value = existing === undefined ? inputField.defaultValue : existing;
    values[inputField.id] =
      ["array", "object"].includes(inputField.valueType) && typeof value === "object"
        ? JSON.stringify(value, null, 2)
        : value;
  });
  return values;
}

export function buildMetronomeManualRunFixture(
  contract: MetronomeManualRunContract,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const fixture: Record<string, unknown> = {};
  contract.inputFields.forEach((inputField) => {
    setValueAtPath(fixture, inputField.path, valueForField(inputField, values[inputField.id]));
  });
  return fixture;
}

export function getMetronomeManualRunValidationError(
  contract: MetronomeManualRunContract | null | undefined,
  values: Record<string, unknown>,
): string {
  if (!contract) return "Select a published Workflow first.";
  if (
    contract.mode === "composer" &&
    (!contract.composerBinding?.agentId || !contract.composerBinding?.environmentId)
  ) {
    return "This Workflow must resolve an Agent and Computer before it can be queued.";
  }
  const missing = contract.inputFields.find((inputField) => {
    if (!inputField.required) return false;
    const value = values[inputField.id];
    return value !== false && !String(value ?? "").trim();
  });
  return missing ? `${missing.label} is required.` : "";
}

function structuredPrompt(
  triggerType: MetronomeManualRunTriggerType,
  fixture: Record<string, unknown>,
) {
  if (triggerType === "function") {
    return `A function trigger was invoked with this payload:\n${JSON.stringify(fixture.payload || {}, null, 2)}`;
  }
  if (triggerType === "github") {
    const event = asRecord(fixture.github);
    return `${[
      `GitHub ${readString(event.eventType, "event")} received`,
      event.repositoryFullName ? `for ${event.repositoryFullName}` : "",
      event.branch ? `on ${event.branch}` : "",
      readString(event.title, event.body),
    ]
      .filter(Boolean)
      .join(" ")
      .trim()}.`;
  }
  if (triggerType === "resource") {
    const event = asRecord(fixture.resource);
    return `${[
      readString(event.resourceKind, "Resource"),
      readString(event.resourceName, event.resourceId),
      `received a ${readString(event.eventType, "deployment")} event`,
      event.revision ? `for revision ${event.revision}` : "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim()}.`;
  }
  if (triggerType === "database_entry") {
    const event = asRecord(fixture.databaseEntry);
    return [
      `Database document ${readString(event.eventType, "event")} received`,
      readString(event.databaseName, event.databaseId)
        ? `in ${readString(event.databaseName, event.databaseId)}`
        : "",
      readString(event.collectionName, event.collectionId)
        ? `/ ${readString(event.collectionName, event.collectionId)}`
        : "",
      event.documentId ? `for document ${event.documentId}` : "",
      `with data:\n${JSON.stringify(event.document || {}, null, 2)}`,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  if (triggerType === "auth") {
    const event = asRecord(fixture.auth);
    return `${[
      `Authentication ${readString(event.eventType, "event")} received`,
      readString(event.authResourceName, event.authResourceId)
        ? `from ${readString(event.authResourceName, event.authResourceId)}`
        : "",
      event.email ? `for ${event.email}` : "",
      event.displayName ? `(${event.displayName})` : "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim()}.`;
  }
  return "";
}

function emailAddress(workflow: Record<string, unknown>, config: Record<string, unknown>) {
  const explicit = readString(config.emailAddress, config.email_address);
  if (explicit) return explicit;
  const slug =
    readString(workflow.name, workflow.id, "workflow")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "workflow";
  return `${slug}@agent.computer-agents.com`;
}

export function buildMetronomeManualRunInput(
  workflow: Record<string, unknown>,
  contract: MetronomeManualRunContract,
  fixture: Record<string, unknown>,
  composerPayload: MetronomeManualRunComposerPayload | null = null,
): Record<string, unknown> {
  const triggerType = normalizeTriggerType(contract.triggerType);
  const prompt = readString(
    fixture.prompt,
    composerPayload?.prompt,
    structuredPrompt(triggerType, fixture),
  );
  const attachments = Array.isArray(composerPayload?.attachments)
    ? composerPayload.attachments.filter(Boolean)
    : [];
  const now = new Date().toISOString();
  const base: Record<string, unknown> = {
    source: triggerType === "manual" ? "manual_ui" : triggerType,
    triggerType,
    simulatedTriggerType: triggerType,
    simulation: { mode: "manual", triggerType, simulatedAt: now },
    ...(prompt ? { prompt, message: prompt } : {}),
    ...(attachments.length ? { attachments, files: attachments } : {}),
  };
  if (triggerType === "thread_event" || triggerType === "manual") {
    const agentId = contract.composerBinding?.agentId || composerPayload?.agentId || null;
    const environmentId =
      contract.composerBinding?.environmentId || composerPayload?.environmentId || null;
    const projectId = contract.composerBinding?.projectId || composerPayload?.projectId || null;
    return {
      ...base,
      ...(triggerType === "thread_event" ? { source: "thread_event" } : {}),
      threadId: "manual-run",
      originThreadId: "manual-run",
      sourceThreadId: "manual-run",
      messageId: null,
      originMessageId: null,
      agentId,
      environmentId,
      projectId,
      thread: { message: prompt, agentId, environmentId, projectId },
    };
  }
  if (triggerType === "email") {
    const address = emailAddress(workflow, contract.triggerConfig);
    return {
      ...base,
      source: "email",
      matchedAddress: address,
      email: {
        to: address ? [address] : [],
        from: "manual-run@computer-agents.local",
        subject: "Manual workflow run",
        text: prompt,
        body: prompt,
        attachments,
      },
    };
  }
  if (triggerType === "telegram") {
    const command = readString(
      contract.triggerConfig.telegramCommand,
      contract.triggerConfig.telegram_command,
      contract.triggerConfig.command,
      "/workflow",
    );
    return {
      ...base,
      source: "telegram",
      command,
      telegram: {
        text: prompt,
        caption: "",
        fromUsername: "manual-run",
        chatId: "manual-run",
        command,
      },
    };
  }
  if (triggerType === "project_ticket") {
    const config = contract.triggerConfig;
    return {
      ...base,
      source: "project_ticket",
      projectTicket: {
        eventType: readString(
          config.ticketEventType,
          config.ticket_event_type,
          config.eventType,
          "status_changed",
        ),
        projectId: readString(config.ticketProjectId, config.ticket_project_id, config.projectId),
        projectName: readString(
          config.ticketProjectName,
          config.ticket_project_name,
          config.projectName,
        ),
        ticketId: "manual-run",
        ticketTitle: "Manual workflow run",
        fromStatus: readString(config.ticketFromStatus, config.ticket_from_status, "todo"),
        toStatus: readString(config.ticketToStatus, config.ticket_to_status, "in_review"),
        commentBody: prompt,
        commentAuthorType: "user",
        commentAuthorName: "Manual run",
      },
    };
  }
  if (triggerType === "periodic") {
    const config = contract.triggerConfig;
    return {
      ...base,
      source: "periodic",
      schedule: {
        triggeredAt: now,
        scheduledTime: readString(config.scheduledTime, config.scheduledStartAt, now),
        scheduleType: readString(config.scheduleType, "one-time"),
        cronExpression: readString(config.cronExpression),
        timezone: readString(config.scheduleTimezone, "UTC"),
      },
    };
  }
  if (triggerType === "function") {
    return {
      ...base,
      source: "function_trigger",
      payload: asRecord(fixture.payload),
      query: {},
      receivedAt: now,
    };
  }
  if (triggerType === "github")
    return { ...base, source: "github", github: asRecord(fixture.github) };
  if (triggerType === "resource")
    return { ...base, source: "resource", resource: asRecord(fixture.resource) };
  if (triggerType === "database_entry") {
    return { ...base, source: "database_entry", databaseEntry: asRecord(fixture.databaseEntry) };
  }
  if (triggerType === "auth") return { ...base, source: "auth", auth: asRecord(fixture.auth) };
  return { ...base, ...fixture };
}
