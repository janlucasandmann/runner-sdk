export type RunnerLogType = "info" | "error" | "success" | "warning";

export type RunnerEventType =
  | "user_message"
  | "agent_message"
  | "reasoning"
  | "subagent_invocation"
  | "command_execution"
  | "mcp_tool_call"
  | "mcp_log"
  | "file_change"
  | "todo_list"
  | "action_summary"
  | "setup"
  | "startup"
  | "turn_completed"
  | "planning"
  | "llm_response"
  | "deep_research"
  | "metronome_workflow"
  | "permission_request";

export interface RunnerUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  totalTokens: number;
  costUsd?: number;
  costCt?: number;
}

export interface RunnerTeamExecutionMember {
  agentId: string;
  agentName: string;
  claudeAgentName: string;
}

export interface RunnerTeamExecutionMetadata {
  mode: "team";
  teamAgentId: string;
  teamAgentName: string;
  orchestrator: RunnerTeamExecutionMember;
  subagents: RunnerTeamExecutionMember[];
}

export interface RunnerLogActorMetadata {
  kind: "orchestrator" | "subagent";
  agentId: string;
  agentName: string;
  teamAgentId: string;
  teamAgentName: string;
  claudeAgentName: string;
  subagentType: string;
  parentToolUseId?: string;
  invocationId?: string;
}

export interface RunnerSubagentInvocationMetadata {
  invocationId: string;
  parentToolUseId: string;
  toolName: string;
  agentId: string;
  agentName: string;
  teamAgentId: string;
  teamAgentName: string;
  claudeAgentName: string;
  subagentType: string;
  message?: string;
  description?: string;
  status?: "started" | "completed" | "failed";
}

export interface RunnerLog {
  createdAt?: string;
  time: string;
  message: string;
  type: RunnerLogType;
  eventType?: RunnerEventType;
  isActionSummary?: boolean;
  isReasoning?: boolean;
  isPlanning?: boolean;
  isLLMResponse?: boolean;
  metadata?: {
    actor?: RunnerLogActorMetadata;
    delegatedTo?: RunnerLogActorMetadata;
    teamExecution?: RunnerTeamExecutionMetadata;
    subagentInvocation?: RunnerSubagentInvocationMetadata;
    parentToolUseId?: string;
    source?: string;
    command?: string;
    exitCode?: number;
    status?: "running" | "completed" | "failed" | "started" | "output" | "pending" | "approved" | "denied";
    output?: string;
    serverName?: string;
    toolName?: string;
    toolId?: string;
    isToolStarted?: boolean;
    toolInput?: Record<string, unknown>;
    result?: unknown;
    error?: unknown;
    durationMs?: number;
    args?: unknown;
    savedImagePath?: string;
    isImageGeneration?: boolean;
    savedVideoPath?: string;
    isVideoGeneration?: boolean;
    filePaths?: string[];
    changeKinds?: Array<"created" | "modified" | "deleted">;
    diffs?: Record<
      string,
      {
        diff?: string;
        changes?: string;
        additions?: number;
        deletions?: number;
      }
    >;
    fileContents?: Record<string, string>;
    todos?: Array<{ text: string; completed: boolean }>;
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
    totalTokens?: number;
    costUsd?: number;
    costCt?: number;
    costCT?: number;
    computeTokens?: number;
    model?: string;
    modelName?: string;
    provider?: string;
    providerName?: string;
    runId?: string;
    actionsCount?: number;
    deepResearch?: {
      sessionId?: string;
      event: string;
      topic?: string;
      interactionId?: string;
      thinkingSummary?: string;
      thinkingPhase?: string;
      reportFile?: string;
      reportManifestFile?: string;
      sourcesCount?: number;
      sources?: string[];
      elapsedSeconds?: number;
      errorMessage?: string;
      runtimePath?: string;
      resumeAttempt?: number;
      reportLength?: number;
      timestamp?: string;
    };
    metronomeWorkflow?: unknown;
    actionType?: "compact" | "clear" | "fork" | "btw" | "revert" | "reapply" | "voice";
    isPending?: boolean;
    failed?: boolean;
    revertedChangeStepId?: string | null;
    revertedFilePath?: string | null;
    revertedFileName?: string | null;
    quotedSelection?: {
      text: string;
      sourceType: "working_log" | "run_summary";
    };
    permissionRequestId?: string;
    permissionRing?: 1 | 2 | 3;
    permissionRingId?: string;
    permissionRingLabel?: string;
    permissionRingShortLabel?: string;
    permissionRingDescription?: string;
    permissionActionId?: string;
    permissionActionLabel?: string;
    permissionActionDescription?: string;
    permissionAccess?: string;
    currentMode?: string;
    requiredMode?: string;
    reason?: string;
    input?: string;
    decision?: "approved" | "denied" | "pending" | string;
  };
}

export interface RunnerDeepResearchThinkingSummary {
  timestamp: string;
  phase: string;
  summary: string;
}

export interface RunnerDeepResearchSession {
  id: string;
  threadId: string;
  userId: string;
  interactionId: string | null;
  topic: string;
  status: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  elapsedSeconds: number | null;
  thinkingSummaries: RunnerDeepResearchThinkingSummary[];
  reportPath: string | null;
  reportLength: number | null;
  sourcesCount: number | null;
  reportManifestPath?: string | null;
  sources?: string[];
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
}

export interface RunnerRunRequest {
  url: string;
  body: unknown;
  method?: "POST" | "PUT";
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  organizationId?: string | null;
}

export interface RunnerPrepareRequest {
  url: string;
  body: unknown;
  method?: "POST" | "PUT";
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  organizationId?: string | null;
  buildRunRequest?: (preparePayload: unknown, currentRunRequest: RunnerRunRequest) => RunnerRunRequest;
  getSetupLogs?: (preparePayload: unknown) => RunnerLog[];
}

export interface RunnerExecuteOptions {
  run: RunnerRunRequest;
  prepare?: RunnerPrepareRequest;
  organizationId?: string | null;
  signal?: AbortSignal;
  throwOnError?: boolean;
  onRawEvent?: (event: RawRunnerEvent) => void;
  onLog?: (log: RunnerLog) => void;
  onSetupComplete?: () => void;
}

export interface RunnerExecuteResult {
  durationSeconds: number;
  usage?: RunnerUsage;
  cancelled: boolean;
}

export interface RunnerEventHandleResult {
  logs: RunnerLog[];
  usage?: RunnerUsage;
  setupComplete?: boolean;
  cancelled?: boolean;
  streamError?: Error;
}

export type RawRunnerEvent = {
  type: string;
  [key: string]: unknown;
};

export interface RunnerApiRequestOptions {
  backendUrl: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  organizationId?: string | null;
}

export type RunnerAgentVoiceMode = "off" | "web" | "phone" | "web_and_phone" | string;
export type RunnerAgentVoiceProvider = "xai" | string;

export interface RunnerAgentCreateInput {
  name: string;
  instructions?: string;
  description?: string;
  model?: string;
  guardrailSetIds?: string[];
  voiceMode?: RunnerAgentVoiceMode;
  voiceProvider?: RunnerAgentVoiceProvider;
  voiceModel?: string | null;
  voiceId?: string | null;
  voiceInstructions?: string | null;
  voiceLanguageHint?: string | null;
  voiceTurnDetection?: Record<string, unknown> | null;
  voicePronunciationReplacements?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerAgentUpdateInput {
  name?: string;
  instructions?: string;
  description?: string;
  model?: string;
  guardrailSetIds?: string[];
  voiceMode?: RunnerAgentVoiceMode;
  voiceProvider?: RunnerAgentVoiceProvider;
  voiceModel?: string | null;
  voiceId?: string | null;
  voiceInstructions?: string | null;
  voiceLanguageHint?: string | null;
  voiceTurnDetection?: Record<string, unknown> | null;
  voicePronunciationReplacements?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerGuardrailPrompt {
  id?: string;
  title: string;
  prompt: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerGuardrailSet {
  id: string;
  name: string;
  description?: string;
  prompts: RunnerGuardrailPrompt[];
  source?: "default" | "custom" | string;
  isDefault?: boolean;
  readOnly?: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerGuardrailSetCreateInput {
  name: string;
  description?: string;
  prompts?: RunnerGuardrailPrompt[];
  metadata?: Record<string, unknown> | null;
}

export interface RunnerGuardrailSetUpdateInput {
  name?: string;
  description?: string;
  prompts?: RunnerGuardrailPrompt[];
  metadata?: Record<string, unknown> | null;
}

export type RunnerResourceVersionStatus = "saved" | "active" | "published" | "superseded" | "unpublished" | string;

export interface RunnerResourceVersionSnapshot {
  [key: string]: unknown;
}

export interface RunnerResourceVersion<TSnapshot extends RunnerResourceVersionSnapshot = RunnerResourceVersionSnapshot> {
  id: string;
  version: number;
  label?: string;
  name?: string;
  description?: string | null;
  status?: RunnerResourceVersionStatus;
  lifecycleState?: string;
  lifecycle_state?: string;
  revisionId?: string;
  revision_id?: string;
  baseRevisionId?: string;
  base_revision_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  publishedAt?: string | null;
  published_at?: string | null;
  unpublishedAt?: string | null;
  unpublished_at?: string | null;
  snapshot?: TSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerResourceVersionCreateInput<TSnapshot extends RunnerResourceVersionSnapshot = RunnerResourceVersionSnapshot> {
  label?: string;
  name?: string;
  description?: string | null;
  status?: RunnerResourceVersionStatus;
  snapshot?: TSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerResourceVersionUpdateInput<TSnapshot extends RunnerResourceVersionSnapshot = RunnerResourceVersionSnapshot> {
  label?: string;
  name?: string;
  description?: string | null;
  status?: RunnerResourceVersionStatus;
  snapshot?: TSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerResourceVersionDiffFile {
  id?: string;
  filePath: string;
  label?: string;
  beforeContent?: string;
  afterContent?: string;
  fileContent?: string;
  diffContent?: string;
  diff?: string;
  additions?: number;
  deletions?: number;
  [key: string]: unknown;
}

export interface RunnerResourceVersionCompareResult<TFile extends RunnerResourceVersionDiffFile = RunnerResourceVersionDiffFile> {
  resourceId?: string;
  baseVersionId?: string;
  targetVersionId?: string;
  files: TFile[];
  additions?: number;
  deletions?: number;
  [key: string]: unknown;
}

export interface RunnerGuardrailVersionSnapshot extends RunnerResourceVersionSnapshot {
  name?: string;
  description?: string | null;
  prompts?: RunnerGuardrailPrompt[];
  metadata?: Record<string, unknown> | null;
}

export type RunnerGuardrailVersionStatus = RunnerResourceVersionStatus;
export type RunnerGuardrailVersion = RunnerResourceVersion<RunnerGuardrailVersionSnapshot>;
export interface RunnerGuardrailVersionCreateInput extends RunnerResourceVersionCreateInput<RunnerGuardrailVersionSnapshot> {
  guardrail?: RunnerGuardrailSet;
  set?: RunnerGuardrailSet;
}
export type RunnerGuardrailVersionUpdateInput = RunnerResourceVersionUpdateInput<RunnerGuardrailVersionSnapshot>;
export type RunnerGuardrailVersionDiffFile = RunnerResourceVersionDiffFile;
export interface RunnerGuardrailVersionCompareResult extends RunnerResourceVersionCompareResult<RunnerGuardrailVersionDiffFile> {
  guardrailId?: string;
}

export interface RunnerEvaluationCase {
  id?: string;
  name?: string;
  input: string;
  expectedOutput?: string;
  rubric?: string;
  weight?: number;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerEvaluationSet {
  id: string;
  name: string;
  description?: string | null;
  cases: RunnerEvaluationCase[];
  createdAt?: string;
  updatedAt?: string;
  publishedVersionId?: string | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerEvaluationSetCreateInput {
  name: string;
  description?: string | null;
  cases?: RunnerEvaluationCase[];
  metadata?: Record<string, unknown> | null;
}

export interface RunnerEvaluationSetUpdateInput {
  name?: string;
  description?: string | null;
  cases?: RunnerEvaluationCase[];
  metadata?: Record<string, unknown> | null;
}

export interface RunnerEvaluationRunCreateInput {
  evaluationId: string;
  agentId: string;
  computerId?: string;
  environmentId?: string;
  versionId?: string;
  label?: string;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerEvaluationRun {
  id: string;
  evaluationId?: string;
  evaluationSetId?: string;
  agentId?: string;
  environmentId?: string;
  versionId?: string | null;
  status?: "queued" | "running" | "completed" | "failed" | "cancelled" | string;
  averageScore?: number;
  passRate?: number;
  costCt?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerEvaluationVersionSnapshot extends RunnerResourceVersionSnapshot {
  name?: string;
  description?: string | null;
  cases?: RunnerEvaluationCase[];
  metadata?: Record<string, unknown> | null;
}

export type RunnerEvaluationVersionStatus = RunnerResourceVersionStatus;
export type RunnerEvaluationVersion = RunnerResourceVersion<RunnerEvaluationVersionSnapshot>;
export interface RunnerEvaluationVersionCreateInput extends RunnerResourceVersionCreateInput<RunnerEvaluationVersionSnapshot> {
  evaluation?: RunnerEvaluationSet;
  set?: RunnerEvaluationSet;
}
export type RunnerEvaluationVersionUpdateInput = RunnerResourceVersionUpdateInput<RunnerEvaluationVersionSnapshot>;
export type RunnerEvaluationVersionDiffFile = RunnerResourceVersionDiffFile;
export interface RunnerEvaluationVersionCompareResult extends RunnerResourceVersionCompareResult<RunnerEvaluationVersionDiffFile> {
  evaluationId?: string;
}

export interface RunnerFineTuningJobEvaluationReference {
  evaluationSetId: string;
  beforeRunId?: string | null;
  afterRunId?: string | null;
  beforeScore?: number | null;
  afterScore?: number | null;
  status?: string;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerFineTuningJob {
  id: string;
  name?: string;
  agentId: string;
  environmentId?: string;
  computerId?: string;
  evaluationSetIds: string[];
  instructions?: string;
  status?: "queued" | "running" | "verifying" | "completed" | "failed" | "cancelled" | string;
  threadId?: string | null;
  createdAgentVersionId?: string | null;
  beforeScore?: number | null;
  afterScore?: number | null;
  improvementScore?: number | null;
  costUsd?: number | null;
  fineTuningCostUsd?: number | null;
  verificationCostUsd?: number | null;
  costCt?: number | null;
  evaluationRuns?: RunnerFineTuningJobEvaluationReference[];
  threadTitle?: string | null;
  targetAgentId?: string | null;
  fineTunerAgentId?: string | null;
  createdAgentVersion?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  [key: string]: unknown;
}

export interface RunnerFineTuningJobCreateInput {
  agentId: string;
  targetAgentId?: string;
  fineTunerAgentId?: string;
  computerId?: string;
  environmentId?: string;
  evaluationSetIds: string[];
  evaluationSets?: unknown[];
  instructions?: string;
  name?: string;
  metadata?: Record<string, unknown> | null;
}

export type RunnerMetronomeNodeKind =
  | "trigger"
  | "condition"
  | "action"
  | "ticket"
  | "imagine"
  | "function"
  | "firecrawl"
  | "table"
  | "database"
  | "metronome"
  | "loop"
  | "approval"
  | "end"
  | "note"
  | string;

export type RunnerMetronomeFunctionMode = "computer_agents_function" | "external_api";
export type RunnerMetronomeHttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
export type RunnerMetronomeTriggerType =
  | "thread_event"
  | "periodic"
  | "email"
  | "telegram"
  | "function"
  | "github"
  | "project_ticket"
  | "resource"
  | "database_entry"
  | "auth"
  | string;
export type RunnerMetronomePayloadFieldType = "string" | "number" | "boolean" | "array" | "object";

export interface RunnerMetronomeFunctionTriggerPayloadField {
  id?: string;
  key: string;
  name?: string;
  type?: RunnerMetronomePayloadFieldType;
  value?: unknown;
  defaultValue?: unknown;
  description?: string;
  required?: boolean;
  [key: string]: unknown;
}

export interface RunnerMetronomeTriggerNodeConfig {
  triggerType?: RunnerMetronomeTriggerType;
  threadCommand?: string;
  promptExtension?: string;
  /**
   * Function trigger settings. When `triggerType` is `function`, publishing the workflow
   * should deploy a Computer Agents cloud function that forwards requests to this workflow.
   */
  functionTriggerType?: "cloud_function" | string;
  functionName?: string;
  functionSlug?: string;
  functionTriggerSlug?: string;
  functionEndpointUrl?: string;
  functionEndpointPath?: string;
  endpointUrl?: string;
  endpointPath?: string;
  functionRequireApiKey?: boolean;
  requireApiKey?: boolean;
  requiresApiKey?: boolean;
  authentication?: "api_key" | "public" | string;
  payloadFields?: RunnerMetronomeFunctionTriggerPayloadField[];
  payloadSchemaJson?: string;
  samplePayloadJson?: string;
  expectedPayload?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RunnerMetronomeFunctionHeader {
  id?: string;
  name: string;
  valueType?: "text" | "secret";
  value?: string;
  secretRef?: string;
  secretVaultId?: string;
  secretVaultName?: string;
  secretId?: string;
  secretName?: string;
  [key: string]: unknown;
}

export interface RunnerMetronomeFunctionNodeConfig {
  /**
   * `computer_agents_function` invokes a deployed Computer Agents function resource.
   * `external_api` invokes an arbitrary HTTP API from the Metronome executor.
   */
  functionMode?: RunnerMetronomeFunctionMode;
  functionId?: string;
  functionName?: string;
  httpMethod?: RunnerMetronomeHttpMethod;
  method?: RunnerMetronomeHttpMethod;
  url?: string;
  requestUrl?: string;
  endpoint?: string;
  /**
   * JSON object or JSON string. Supports Metronome dynamic content tokens such as `{{ input }}`.
   */
  headers?: Record<string, string> | RunnerMetronomeFunctionHeader[] | string;
  requestHeaders?: RunnerMetronomeFunctionHeader[];
  headersJson?: string;
  requestHeadersJson?: string;
  /**
   * JSON object or JSON string. Supports Metronome dynamic content tokens such as `{{ input }}`.
   */
  payload?: unknown;
  payloadJson?: string;
  outputKey?: string;
  [key: string]: unknown;
}

export interface RunnerMetronomeNode<TConfig extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  kind: RunnerMetronomeNodeKind;
  subtype?: string;
  label?: string;
  description?: string;
  config?: TConfig;
  position?: { x: number; y: number } | Record<string, unknown>;
  style?: Record<string, unknown>;
  parentId?: string;
  extent?: string;
  [key: string]: unknown;
}

export interface RunnerMetronomeFunctionNode extends RunnerMetronomeNode<RunnerMetronomeFunctionNodeConfig> {
  kind: "function";
  subtype?: "invoke_function" | string;
}

export interface RunnerMetronomeTriggerNode extends RunnerMetronomeNode<RunnerMetronomeTriggerNodeConfig> {
  kind: "trigger";
  subtype?: RunnerMetronomeTriggerType;
}

export type RunnerMetronomeWorkflowNode = RunnerMetronomeTriggerNode | RunnerMetronomeFunctionNode | RunnerMetronomeNode;

export interface RunnerMetronomeEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  [key: string]: unknown;
}

export interface RunnerMetronomeDefinition {
  version?: number;
  name?: string;
  description?: string | null;
  nodes: RunnerMetronomeWorkflowNode[];
  edges: RunnerMetronomeEdge[];
  metadata?: Record<string, unknown> | null;
  dynamicContent?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RunnerMetronomeWorkflow {
  id: string;
  name?: string;
  description?: string | null;
  status?: string;
  triggerSummary?: string;
  projectId?: string | null;
  projectName?: string | null;
  definition?: RunnerMetronomeDefinition | Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  [key: string]: unknown;
}

export interface RunnerMetronomeWorkflowCreateInput {
  name: string;
  description?: string | null;
  status?: string;
  triggerSummary?: string;
  projectId?: string | null;
  projectName?: string | null;
  definition: RunnerMetronomeDefinition | Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export type RunnerMetronomeWorkflowUpdateInput = Partial<RunnerMetronomeWorkflowCreateInput>;

export interface RunnerMetronomeRunCreateInput {
  definition?: RunnerMetronomeDefinition | Record<string, unknown>;
  inputs?: Record<string, unknown>;
  prompt?: string;
  dynamicContent?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RunnerMetronomeFunctionTriggerInvokeInput {
  metronomeId?: string;
  trigger?: string;
  endpointUrl?: string;
  payload?: Record<string, unknown>;
  apiKey?: string;
  [key: string]: unknown;
}

export interface RunnerMetronomeRun {
  id: string;
  metronomeId?: string;
  triggerType?: string;
  status?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string | Record<string, unknown> | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface RunnerMetronomeVersionSnapshot extends RunnerResourceVersionSnapshot {
  name?: string;
  description?: string | null;
  nodes?: RunnerMetronomeWorkflowNode[];
  edges?: RunnerMetronomeEdge[];
  connections?: RunnerMetronomeEdge[] | unknown[];
  metadata?: Record<string, unknown> | null;
}

export type RunnerMetronomeVersionStatus = RunnerResourceVersionStatus;
export type RunnerMetronomeVersion = RunnerResourceVersion<RunnerMetronomeVersionSnapshot>;
export interface RunnerMetronomeVersionCreateInput extends RunnerResourceVersionCreateInput<RunnerMetronomeVersionSnapshot> {
  metronome?: Record<string, unknown>;
  workflow?: Record<string, unknown>;
}
export type RunnerMetronomeVersionUpdateInput = RunnerResourceVersionUpdateInput<RunnerMetronomeVersionSnapshot>;
export type RunnerMetronomeVersionDiffFile = RunnerResourceVersionDiffFile;
export interface RunnerMetronomeVersionCompareResult extends RunnerResourceVersionCompareResult<RunnerMetronomeVersionDiffFile> {
  metronomeId?: string;
}

export interface RunnerGuardrailPromptAdaptation {
  id: string;
  title: string;
  content: string;
  prompt: string;
  guardrailSetId: string;
  guardrailSetName: string;
  source?: "guardrail" | string;
}

export interface RunnerAgentRecord {
  id: string;
  name?: string;
  instructions?: string;
  model?: string;
  voiceMode?: RunnerAgentVoiceMode;
  voiceProvider?: RunnerAgentVoiceProvider;
  voiceModel?: string | null;
  voiceId?: string | null;
  voiceInstructions?: string | null;
  voiceLanguageHint?: string | null;
  voiceTurnDetection?: Record<string, unknown> | null;
  voicePronunciationReplacements?: Record<string, unknown> | null;
  guardrailSetIds?: string[];
  guardrails?: RunnerGuardrailSet[];
  promptAdaptations?: RunnerGuardrailPromptAdaptation[];
  invisiblePromptAdaptations?: RunnerGuardrailPromptAdaptation[];
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerVoiceAgentPhoneNumber {
  id: string;
  status?: string;
  origin?: "xai_provisioned" | "byo_trunk" | string;
  phoneNumber?: string | null;
  sipUri?: string | null;
  provider?: RunnerAgentVoiceProvider;
  channel?: "phone" | string;
  lastError?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RunnerVoiceSession {
  id: string;
  agentId?: string;
  threadId?: string | null;
  bindingId?: string | null;
  provider?: RunnerAgentVoiceProvider;
  channel?: "web" | "phone" | string;
  status?: string;
  xaiCallId?: string | null;
  xaiSessionId?: string | null;
  fromNumber?: string | null;
  toNumber?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerVoiceAgentRecord {
  agent: RunnerAgentRecord;
  voice?: {
    mode?: RunnerAgentVoiceMode;
    provider?: RunnerAgentVoiceProvider;
    model?: string | null;
    voiceId?: string | null;
    languageHint?: string | null;
    enabled?: boolean;
    [key: string]: unknown;
  };
  phoneNumber?: RunnerVoiceAgentPhoneNumber | null;
  recentSessions?: RunnerVoiceSession[];
  [key: string]: unknown;
}

export interface RunnerVoiceAgentPhoneNumberInput {
  origin?: "xai_provisioned" | "byo_trunk";
  name?: string;
  phoneNumber?: string;
  webhookUrl?: string;
  webhookName?: string;
  sipAuth?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerVoiceAgentSessionCreateInput {
  threadId?: string;
  environmentId?: string;
  title?: string;
  [key: string]: unknown;
}

export interface RunnerVoiceAgentSessionCreateResult {
  voiceSession: RunnerVoiceSession;
  thread?: Record<string, unknown>;
  xai: {
    realtimeUrl: string;
    clientSecret: {
      value: string;
      expiresAt: number;
      [key: string]: unknown;
    };
    websocketProtocol: string;
    sessionUpdate: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type RunnerAgentVersionStatus = "saved" | "active" | "superseded" | "unpublished" | string;

export interface RunnerAgentVersionSnapshot {
  name?: string;
  description?: string;
  model?: string;
  instructions?: string;
  guardrailSetIds?: string[];
  guardrails?: RunnerGuardrailSet[];
  promptAdaptations?: RunnerGuardrailPromptAdaptation[];
  invisiblePromptAdaptations?: RunnerGuardrailPromptAdaptation[];
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerAgentVersion {
  id: string;
  version: number;
  label?: string;
  description?: string;
  status?: RunnerAgentVersionStatus;
  lifecycleState?: string;
  lifecycle_state?: string;
  revisionId?: string;
  revision_id?: string;
  baseRevisionId?: string;
  base_revision_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  publishedAt?: string;
  published_at?: string;
  unpublishedAt?: string;
  unpublished_at?: string;
  snapshot?: RunnerAgentVersionSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerAgentVersionCreateInput {
  label?: string;
  name?: string;
  description?: string;
  status?: RunnerAgentVersionStatus;
  snapshot?: RunnerAgentVersionSnapshot;
  agent?: RunnerAgentRecord;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerAgentVersionUpdateInput {
  label?: string;
  name?: string;
  description?: string;
  status?: RunnerAgentVersionStatus;
  snapshot?: RunnerAgentVersionSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerAgentVersionDiffFile {
  id?: string;
  filePath: string;
  label?: string;
  beforeContent?: string;
  afterContent?: string;
  fileContent?: string;
  diffContent: string;
  additions?: number;
  deletions?: number;
  [key: string]: unknown;
}

export interface RunnerAgentVersionCompareResult {
  agentId?: string;
  baseVersionId?: string;
  targetVersionId?: string;
  files: RunnerAgentVersionDiffFile[];
  additions?: number;
  deletions?: number;
  [key: string]: unknown;
}

export type RunnerEnvironmentVersionStatus = "saved" | "active" | "superseded" | "unpublished" | string;

export interface RunnerEnvironmentVersionSnapshot {
  name?: string;
  description?: string;
  computeProfile?: string;
  runtimes?: Record<string, string>;
  packages?: Record<string, unknown>;
  environmentVariables?: unknown[];
  secrets?: unknown[];
  setupScripts?: string[];
  mcpServers?: unknown[];
  documentation?: unknown[];
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerEnvironmentVersion {
  id: string;
  version: number;
  label?: string;
  description?: string;
  status?: RunnerEnvironmentVersionStatus;
  lifecycleState?: string;
  lifecycle_state?: string;
  revisionId?: string;
  revision_id?: string;
  baseRevisionId?: string;
  base_revision_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  publishedAt?: string;
  published_at?: string;
  unpublishedAt?: string;
  unpublished_at?: string;
  snapshot?: RunnerEnvironmentVersionSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerEnvironmentVersionCreateInput {
  label?: string;
  name?: string;
  description?: string;
  status?: RunnerEnvironmentVersionStatus;
  snapshot?: RunnerEnvironmentVersionSnapshot;
  environment?: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerEnvironmentVersionUpdateInput {
  label?: string;
  name?: string;
  description?: string;
  status?: RunnerEnvironmentVersionStatus;
  snapshot?: RunnerEnvironmentVersionSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerEnvironmentVersionDiffFile {
  id?: string;
  filePath: string;
  label?: string;
  beforeContent?: string;
  afterContent?: string;
  fileContent?: string;
  diffContent: string;
  additions?: number;
  deletions?: number;
  [key: string]: unknown;
}

export interface RunnerEnvironmentVersionCompareResult {
  environmentId?: string;
  baseVersionId?: string;
  targetVersionId?: string;
  files: RunnerEnvironmentVersionDiffFile[];
  additions?: number;
  deletions?: number;
  [key: string]: unknown;
}

export type RunnerServerVersionStatus = "saved" | "active" | "superseded" | "unpublished" | string;

export interface RunnerServerVersionSnapshot {
  name?: string;
  description?: string;
  kind?: string;
  sourceType?: string;
  sourceEnvironmentId?: string | null;
  sourcePath?: string;
  region?: string;
  runtime?: string;
  authMode?: string;
  template?: string;
  templateAgentId?: string;
  templateEnvironmentId?: string;
  databaseMode?: string;
  databaseId?: string;
  databaseName?: string;
  databaseDescription?: string;
  databaseLocation?: string;
  customDomain?: string;
  sourceFiles?: unknown[];
  sourceFileContents?: Record<string, string>;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerServerVersion {
  id: string;
  version: number;
  label?: string;
  description?: string;
  status?: RunnerServerVersionStatus;
  lifecycleState?: string;
  lifecycle_state?: string;
  revisionId?: string;
  revision_id?: string;
  baseRevisionId?: string;
  base_revision_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  publishedAt?: string;
  published_at?: string;
  unpublishedAt?: string;
  unpublished_at?: string;
  snapshot?: RunnerServerVersionSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerServerVersionCreateInput {
  label?: string;
  name?: string;
  description?: string;
  status?: RunnerServerVersionStatus;
  snapshot?: RunnerServerVersionSnapshot;
  server?: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerServerVersionUpdateInput {
  label?: string;
  name?: string;
  description?: string;
  status?: RunnerServerVersionStatus;
  snapshot?: RunnerServerVersionSnapshot;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerServerVersionDiffFile {
  id?: string;
  filePath: string;
  label?: string;
  beforeContent?: string;
  afterContent?: string;
  fileContent?: string;
  diffContent: string;
  additions?: number;
  deletions?: number;
  [key: string]: unknown;
}

export interface RunnerServerVersionCompareResult {
  serverId?: string;
  baseVersionId?: string;
  targetVersionId?: string;
  files: RunnerServerVersionDiffFile[];
  additions?: number;
  deletions?: number;
  [key: string]: unknown;
}

export interface RunnerThreadStep {
  id: string;
  threadId: string;
  environmentId: string;
  sequence: number;
  sourceMessageId: string | null;
  stepKind: string;
  eventType: string | null;
  title: string;
  snapshotBeforeId: string | null;
  snapshotAfterId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RunnerEnvironmentSnapshot {
  id: string;
  environmentId: string;
  sourceThreadId: string | null;
  sourceStepId: string | null;
  parentSnapshotId: string | null;
  ledgerCommitSha: string;
  changedPaths: string[];
  additions: number;
  deletions: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RunnerSnapshotDiff {
  fromCommitSha: string | null;
  toCommitSha: string;
  path: string | null;
  diff: string;
  changedPaths: string[];
  additions: number;
  deletions: number;
}

export interface RunnerSnapshotFileEntry {
  path: string;
  name: string;
  type: "file" | "directory";
  size: number | null;
}

export interface RunnerThreadStepDiffResult extends RunnerSnapshotDiff {
  threadId: string;
  stepId: string;
  sequence: number;
  snapshotBeforeId: string | null;
  snapshotAfterId: string | null;
}

export interface RunnerThreadStepFileResult {
  path: string;
  snapshotId: string;
  stepId: string;
  content: string;
}

export interface RunnerEnvironmentSnapshotDiffResult extends RunnerSnapshotDiff {
  environmentId: string;
  snapshotId: string;
  parentSnapshotId: string | null;
}

export interface RunnerEnvironmentSnapshotFileResult {
  path: string;
  snapshotId: string;
  content: string;
}

export interface RunnerThreadFileHistoryEntry {
  threadId: string;
  path: string;
  changedPath: string;
  stepId: string;
  sequence: number;
  title: string;
  eventType: string | null;
  snapshotBeforeId: string | null;
  snapshotAfterId: string | null;
  changeKind: "created" | "modified" | "deleted" | null;
  createdAt: string;
}

export interface RunnerThreadFileHistoryResult {
  object: "list";
  threadId: string;
  path: string;
  data: RunnerThreadFileHistoryEntry[];
  total_count: number;
  has_more: boolean;
}

export interface RunnerEnvironmentSnapshotInitializeResult {
  environmentId: string;
  snapshot: RunnerEnvironmentSnapshot;
}

export interface RunnerThreadForkResult {
  thread: Record<string, unknown>;
  environmentId: string;
  environmentName?: string | null;
  snapshotId: string | null;
  messagesCopied: number;
  forkMode: "latest" | "historical" | "current_environment" | "existing_environment";
}

export interface RunnerThreadRevertResult {
  thread: Record<string, unknown>;
  environmentId: string;
  snapshotId: string | null;
  revertStepId: string;
  revertedToStepId: string;
  revertedChangeStepId?: string | null;
}

export interface RunnerEnvironmentForkResult {
  environment: Record<string, unknown>;
  snapshot: RunnerEnvironmentSnapshot | null;
  sourceSnapshotId: string;
}
