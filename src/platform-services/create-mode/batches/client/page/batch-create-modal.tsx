import { Bookmark, Check, Loader2, Play, Plus, SlidersHorizontal, Truck } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPopup,
  PlatformPopupSearchHeader,
} from "../../../../../platform-ui/components/composite/popup/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  RunnerChat,
  type RunnerChatComposerSubmitPayload,
  type RunnerChatProps,
} from "../../../../../react/index.js";
import { MetronomeManualRunInputs } from "../../../metronome/client/components/metronome-manual-run-inputs.js";
import {
  buildMetronomeManualRunFixture,
  buildMetronomeManualRunInput,
  createMetronomeManualRunContracts,
  createMetronomeManualRunInitialValues,
  getMetronomeManualRunValidationError,
} from "../../../metronome/client/manual-run-contracts.js";
import { buildBatchThreadJobDraft } from "../batch-thread-draft.js";
import type {
  BatchJobDraft,
  BatchMetronomeManualRunContext,
  BatchProjectOption,
  BatchProjectTicketOption,
  BatchSelectableTargetKind,
  BatchStartPolicy,
  BatchTargetKind,
  BatchTargetResourceOption,
} from "../batches-types.js";

export interface BatchCreateModalProps {
  open: boolean;
  draft?: BatchJobDraft | null;
  mode?: "create" | "edit" | "view";
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (
    draft: BatchJobDraft & { name: string; targetKind: BatchTargetKind },
    intent: BatchModalSubmitIntent,
  ) => boolean | undefined | Promise<boolean | undefined>;
  threadComposerProps?: BatchThreadComposerProps;
  loadTargetResources?: (
    targetKind: BatchSelectableTargetKind,
  ) => Promise<readonly BatchTargetResourceOption[]>;
  loadMetronomeManualRunContext?: (
    metronomeId: string,
    versionId?: string | null,
  ) => Promise<BatchMetronomeManualRunContext>;
  loadProjects?: () => Promise<readonly BatchProjectOption[]>;
  loadProjectTickets?: (projectId: string) => Promise<readonly BatchProjectTicketOption[]>;
}

export type BatchModalSubmitIntent = "save" | "start";

export type BatchThreadComposerProps = Pick<RunnerChatProps, "backendUrl" | "apiKey"> &
  Partial<
    Pick<
      RunnerChatProps,
      | "speechToTextUrl"
      | "fetchCustomSkills"
      | "requestHeaders"
      | "resolveRequestHeaders"
      | "environmentId"
      | "projectId"
      | "agentId"
      | "agents"
      | "isAgentSelectionBlocked"
      | "onBlockedAgentSelect"
      | "reasoningEffort"
      | "onReasoningEffortChange"
      | "environments"
      | "skills"
      | "enabledSkillIds"
      | "skillDefaults"
      | "computerAgents"
      | "uploadFiles"
      | "mapFileToAttachment"
      | "onAgentChange"
      | "onEnvironmentChange"
      | "onSkillsChange"
      | "onOpenPluginsOverview"
      | "onOpenPromptSearch"
      | "onOpenKnowledgeSearch"
      | "onOpenThreadSearch"
      | "onOpenPlansBudget"
    >
  >;

const TARGET_OPTIONS = [
  { value: "thread_run", label: "Thread", description: "Run a message on a managed computer." },
  {
    value: "metronome_run",
    label: "Workflow",
    description: "Run a published Workflow version.",
  },
  {
    value: "evaluation_run",
    label: "Evaluation",
    description: "Create and dispatch an Evaluation run.",
  },
  {
    value: "agent_optimization",
    label: "Agent Optimization",
    description: "Queue an existing or new optimization run.",
  },
  {
    value: "project_ticket_action",
    label: "Project ticket",
    description: "Execute a prepared ticket thread.",
  },
] satisfies Array<{ value: BatchTargetKind; label: string; description: string }>;

const POLICY_OPTIONS = [
  {
    value: "manual",
    label: "Keep on shelf",
    description: "Run this job once when you explicitly start it.",
  },
  {
    value: "stay_on_shelf",
    label: "Stay on shelf",
    description: "After a successful run, return this job to the shelf for another manual start.",
  },
  {
    value: "when_capacity_available",
    label: "Start when capacity is free",
    description: "The scheduler starts it as soon as the runtime admits more work.",
  },
] satisfies Array<{ value: BatchStartPolicy; label: string; description: string }>;

const RESOURCE_TARGET_DETAILS: Record<
  BatchSelectableTargetKind,
  {
    label: string;
    placeholder: string;
    emptyContent: string;
  }
> = {
  metronome_run: {
    label: "Workflow",
    placeholder: "Select a Workflow",
    emptyContent: "No Workflows are available.",
  },
  evaluation_run: {
    label: "Evaluation",
    placeholder: "Select an Evaluation",
    emptyContent: "No Evaluations are available.",
  },
  agent_optimization: {
    label: "Agent Optimization",
    placeholder: "Select an Agent Optimization",
    emptyContent: "No Agent Optimizations are available.",
  },
};

function isSelectableTargetKind(
  targetKind: BatchTargetKind,
): targetKind is BatchSelectableTargetKind {
  return (
    targetKind === "metronome_run" ||
    targetKind === "evaluation_run" ||
    targetKind === "agent_optimization"
  );
}

function asDefinitionRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function updateDefinitionResource(
  definitionJson: string,
  targetKind: BatchSelectableTargetKind,
  resource: BatchTargetResourceOption,
): string {
  let definition: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(definitionJson || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      definition = parsed as Record<string, unknown>;
    }
  } catch {
    return definitionJson;
  }
  if (targetKind === "metronome_run") {
    definition.metronomeId = resource.id;
    if (resource.versionId) definition.versionId = resource.versionId;
    else delete definition.versionId;
    if (!definition.input || typeof definition.input !== "object") definition.input = {};
  } else if (targetKind === "evaluation_run") {
    definition.evaluationId = resource.id;
    if (resource.versionId) definition.versionId = resource.versionId;
    else delete definition.versionId;
  } else {
    definition.jobId = resource.id;
  }
  return JSON.stringify(definition, null, 2);
}

function updateProjectTicketDefinition(
  definitionJson: string,
  projectId: string,
  ticketId = "",
): string {
  let definition: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(definitionJson || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      definition = parsed as Record<string, unknown>;
    }
  } catch {
    return definitionJson;
  }
  definition.projectId = projectId;
  if (ticketId) definition.ticketId = ticketId;
  else delete definition.ticketId;
  delete definition.threadId;
  delete definition.preparedThreadId;
  return JSON.stringify(definition, null, 2);
}

export function BatchCreateModal({
  open,
  draft,
  mode = "create",
  submitting = false,
  error = "",
  onClose,
  onSubmit,
  threadComposerProps,
  loadTargetResources,
  loadMetronomeManualRunContext,
  loadProjects,
  loadProjectTickets,
}: BatchCreateModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const submitIntentRef = useRef<BatchModalSubmitIntent>("save");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetKind, setTargetKind] = useState<BatchTargetKind>("thread_run");
  const [targetResourceId, setTargetResourceId] = useState("");
  const [targetVersionId, setTargetVersionId] = useState("");
  const [sourceProjectId, setSourceProjectId] = useState("");
  const [sourceTicketId, setSourceTicketId] = useState("");
  const [startPolicy, setStartPolicy] = useState<BatchStartPolicy>("manual");
  const [definitionJson, setDefinitionJson] = useState("{}");
  const [threadPrompt, setThreadPrompt] = useState("");
  const [composerSubmitRequest, setComposerSubmitRequest] = useState<number | null>(null);
  const [workflowContext, setWorkflowContext] = useState<BatchMetronomeManualRunContext | null>(
    null,
  );
  const [workflowContextLoading, setWorkflowContextLoading] = useState(false);
  const [workflowContextError, setWorkflowContextError] = useState("");
  const [workflowContractId, setWorkflowContractId] = useState("");
  const [workflowInputValues, setWorkflowInputValues] = useState<Record<string, unknown>>({});
  const [workflowComposerSubmitRequest, setWorkflowComposerSubmitRequest] = useState<number | null>(
    null,
  );
  const [jsonError, setJsonError] = useState("");
  const [targetMenuOpen, setTargetMenuOpen] = useState(false);
  const [targetResources, setTargetResources] = useState<BatchTargetResourceOption[]>([]);
  const [targetResourcesLoading, setTargetResourcesLoading] = useState(false);
  const [targetResourcesError, setTargetResourcesError] = useState("");
  const [targetResourceQuery, setTargetResourceQuery] = useState("");
  const [projects, setProjects] = useState<BatchProjectOption[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [projectQuery, setProjectQuery] = useState("");
  const [projectTickets, setProjectTickets] = useState<BatchProjectTicketOption[]>([]);
  const [projectTicketsLoading, setProjectTicketsLoading] = useState(false);
  const [projectTicketsError, setProjectTicketsError] = useState("");
  const [ticketQuery, setTicketQuery] = useState("");
  const [submissionIntent, setSubmissionIntent] = useState<BatchModalSubmitIntent | null>(null);
  const readOnly = mode === "view";
  const fieldsDisabled = submitting || readOnly;
  const typeLocked = mode !== "create";
  const existingManualJob =
    mode === "edit" &&
    (draft?.startPolicy === "manual" || draft?.startPolicy === "stay_on_shelf");
  const projectTargetLocked = typeLocked && targetKind === "project_ticket_action";
  const workflowContracts = useMemo(() => {
    if (!workflowContext) return [];
    return createMetronomeManualRunContracts(
      workflowContext.workflow,
      workflowContext.nodes,
      workflowContext.edges,
      {
        agentOptions: threadComposerProps?.agents,
        environmentOptions: threadComposerProps?.environments,
        projectOptions: threadComposerProps?.computerAgents?.projects?.items,
        functionOptions: workflowContext.functionOptions,
        webAppOptions: workflowContext.webAppOptions,
        databaseOptions: workflowContext.databaseOptions,
        authOptions: workflowContext.authOptions,
      },
    );
  }, [
    threadComposerProps?.agents,
    threadComposerProps?.computerAgents?.projects?.items,
    threadComposerProps?.environments,
    workflowContext,
  ]);
  const activeWorkflowContract =
    workflowContracts.find((contract) => contract.id === workflowContractId) ||
    workflowContracts[0] ||
    null;
  const workflowValidationError = getMetronomeManualRunValidationError(
    activeWorkflowContract,
    workflowInputValues,
  );
  const threadTargetIncomplete = targetKind === "thread_run" && !threadPrompt.trim();
  const resourceTargetIncomplete = isSelectableTargetKind(targetKind) && !targetResourceId.trim();
  const projectTargetIncomplete =
    targetKind === "project_ticket_action" && (!sourceProjectId.trim() || !sourceTicketId.trim());
  const workflowTargetIncomplete =
    targetKind === "metronome_run" &&
    (workflowContextLoading || Boolean(workflowContextError) || Boolean(workflowValidationError));

  useEffect(() => {
    if (!open) return;
    setName(String(draft?.name || ""));
    setDescription(String(draft?.description || ""));
    setTargetKind(draft?.targetKind || "thread_run");
    setTargetResourceId(String(draft?.targetResourceId || ""));
    setTargetVersionId(String(draft?.targetVersionId || ""));
    setSourceProjectId(String(draft?.sourceProjectId || ""));
    setSourceTicketId(String(draft?.sourceTicketId || ""));
    setStartPolicy(draft?.startPolicy || "manual");
    setDefinitionJson(JSON.stringify(draft?.definition || {}, null, 2));
    setThreadPrompt(
      String(
        draft?.definition?.message || draft?.definition?.content || draft?.definition?.task || "",
      ),
    );
    setJsonError("");
    setTargetMenuOpen(false);
    setTargetResourceQuery("");
    setProjectQuery("");
    setTicketQuery("");
    setComposerSubmitRequest(null);
    setWorkflowContext(null);
    setWorkflowContextLoading(false);
    setWorkflowContextError("");
    setWorkflowContractId("");
    setWorkflowInputValues({});
    setWorkflowComposerSubmitRequest(null);
    submitIntentRef.current = "save";
    setSubmissionIntent(null);
  }, [draft, open]);

  useEffect(() => {
    if (!open || !isSelectableTargetKind(targetKind) || !loadTargetResources) {
      setTargetResources([]);
      setTargetResourcesLoading(false);
      setTargetResourcesError("");
      return undefined;
    }
    let cancelled = false;
    setTargetResourcesLoading(true);
    setTargetResourcesError("");
    void loadTargetResources(targetKind)
      .then((resources) => {
        if (cancelled) return;
        setTargetResources(resources.filter((resource) => resource.targetKind === targetKind));
      })
      .catch((loadError) => {
        if (cancelled) return;
        setTargetResources([]);
        setTargetResourcesError(
          loadError instanceof Error ? loadError.message : "Resources could not be loaded.",
        );
      })
      .finally(() => {
        if (!cancelled) setTargetResourcesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadTargetResources, open, targetKind]);

  useEffect(() => {
    if (!open || targetKind !== "metronome_run" || !targetResourceId) {
      setWorkflowContext(null);
      setWorkflowContextLoading(false);
      setWorkflowContextError("");
      return undefined;
    }
    let cancelled = false;
    const selectedResource = targetResources.find((resource) => resource.id === targetResourceId);
    const fallbackContext = selectedResource?.definition
      ? ({
          workflow: {
            id: selectedResource.id,
            name: selectedResource.name,
            definition: selectedResource.definition,
          },
          definition: selectedResource.definition,
          versionId: selectedResource.versionId || targetVersionId,
          nodes: selectedResource.nodes || [],
          edges: selectedResource.edges || [],
          functionOptions: [],
          webAppOptions: [],
          databaseOptions: [],
          authOptions: [],
        } satisfies BatchMetronomeManualRunContext)
      : null;
    setWorkflowContextLoading(true);
    setWorkflowContextError("");
    const request = loadMetronomeManualRunContext
      ? loadMetronomeManualRunContext(
          targetResourceId,
          targetVersionId || selectedResource?.versionId,
        )
      : fallbackContext
        ? Promise.resolve(fallbackContext)
        : Promise.reject(new Error("The published Workflow inputs could not be loaded."));
    void request
      .then((context) => {
        if (cancelled) return;
        setWorkflowContext(context);
        if (context.versionId && context.versionId !== targetVersionId) {
          setTargetVersionId(context.versionId);
          setDefinitionJson((current) => {
            try {
              return JSON.stringify(
                { ...JSON.parse(current || "{}"), versionId: context.versionId },
                null,
                2,
              );
            } catch {
              return current;
            }
          });
        }
      })
      .catch((loadError) => {
        if (cancelled) return;
        setWorkflowContext(null);
        setWorkflowContextError(
          loadError instanceof Error ? loadError.message : "Workflow inputs could not be loaded.",
        );
      })
      .finally(() => {
        if (!cancelled) setWorkflowContextLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    loadMetronomeManualRunContext,
    open,
    targetKind,
    targetResourceId,
    targetResources,
    targetVersionId,
  ]);

  useEffect(() => {
    if (!workflowContext || !workflowContracts.length) {
      setWorkflowContractId("");
      setWorkflowInputValues({});
      return;
    }
    const existingInput =
      draft?.targetKind === "metronome_run" ? asDefinitionRecord(draft.definition?.input) : {};
    const existingTriggerType = String(
      existingInput.simulatedTriggerType || existingInput.triggerType || "",
    );
    const contract =
      workflowContracts.find((candidate) => candidate.triggerType === existingTriggerType) ||
      workflowContracts[0];
    setWorkflowContractId(contract.id);
    setWorkflowInputValues(createMetronomeManualRunInitialValues(contract, existingInput));
    setWorkflowComposerSubmitRequest(null);
  }, [draft, workflowContext, workflowContracts]);

  useEffect(() => {
    if (!open || targetKind !== "project_ticket_action" || !loadProjects) {
      setProjects([]);
      setProjectsLoading(false);
      setProjectsError("");
      return undefined;
    }
    let cancelled = false;
    setProjectsLoading(true);
    setProjectsError("");
    void loadProjects()
      .then((nextProjects) => {
        if (!cancelled) setProjects([...nextProjects]);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setProjects([]);
        setProjectsError(
          loadError instanceof Error ? loadError.message : "Projects could not be loaded.",
        );
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadProjects, open, targetKind]);

  useEffect(() => {
    if (
      !open ||
      targetKind !== "project_ticket_action" ||
      !sourceProjectId ||
      !loadProjectTickets
    ) {
      setProjectTickets([]);
      setProjectTicketsLoading(false);
      setProjectTicketsError("");
      return undefined;
    }
    let cancelled = false;
    setProjectTicketsLoading(true);
    setProjectTicketsError("");
    void loadProjectTickets(sourceProjectId)
      .then((tickets) => {
        if (!cancelled) {
          setProjectTickets(tickets.filter((ticket) => ticket.projectId === sourceProjectId));
        }
      })
      .catch((loadError) => {
        if (cancelled) return;
        setProjectTickets([]);
        setProjectTicketsError(
          loadError instanceof Error ? loadError.message : "Tickets could not be loaded.",
        );
      })
      .finally(() => {
        if (!cancelled) setProjectTicketsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadProjectTickets, open, sourceProjectId, targetKind]);

  useEffect(() => {
    if (!targetMenuOpen) return undefined;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setTargetMenuOpen(false);
      nameRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", handleEscape, true);
    return () => document.removeEventListener("keydown", handleEscape, true);
  }, [targetMenuOpen]);

  const updateWorkflowInputValue = useCallback((fieldId: string, value: unknown) => {
    setWorkflowInputValues((current) =>
      Object.is(current[fieldId], value) ? current : { ...current, [fieldId]: value },
    );
  }, []);

  const submitDraft = async (
    nextDraft: BatchJobDraft & { name: string; targetKind: BatchTargetKind },
  ): Promise<boolean> => {
    const intent = submitIntentRef.current;
    try {
      const result = await onSubmit(nextDraft, intent);
      return result !== false;
    } finally {
      submitIntentRef.current = "save";
      setSubmissionIntent(null);
    }
  };

  const submitWorkflowBatch = async (
    payload: RunnerChatComposerSubmitPayload | null,
  ): Promise<boolean> => {
    if (
      !name.trim() ||
      !targetResourceId.trim() ||
      !workflowContext ||
      !activeWorkflowContract ||
      getMetronomeManualRunValidationError(activeWorkflowContract, workflowInputValues)
    ) {
      return false;
    }
    const fixture = buildMetronomeManualRunFixture(activeWorkflowContract, workflowInputValues);
    if (payload?.prompt !== undefined) fixture.prompt = payload.prompt.trim();
    const input = buildMetronomeManualRunInput(
      workflowContext.workflow,
      activeWorkflowContract,
      fixture,
      payload,
    );
    const inheritedDefinition =
      draft?.targetKind === "metronome_run" ? asDefinitionRecord(draft.definition) : {};
    const result = await submitDraft({
      ...draft,
      name: name.trim(),
      description: description.trim(),
      targetKind: "metronome_run",
      targetResourceId: targetResourceId.trim(),
      targetVersionId: (workflowContext.versionId || targetVersionId).trim() || null,
      sourceProjectId: null,
      sourceTicketId: null,
      startPolicy,
      definition: {
        ...inheritedDefinition,
        metronomeId: targetResourceId.trim(),
        ...((workflowContext.versionId || targetVersionId).trim()
          ? { versionId: (workflowContext.versionId || targetVersionId).trim() }
          : {}),
        input,
      },
    });
    return result !== false;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || projectTargetIncomplete || resourceTargetIncomplete) return;
    if (targetKind === "thread_run") {
      if (!threadPrompt.trim()) return;
      setSubmissionIntent(submitIntentRef.current);
      setComposerSubmitRequest((current) => (current ?? 0) + 1);
      return;
    }
    if (targetKind === "metronome_run") {
      if (workflowTargetIncomplete || !activeWorkflowContract) return;
      setSubmissionIntent(submitIntentRef.current);
      if (
        activeWorkflowContract.mode === "composer" &&
        (activeWorkflowContract.triggerType !== "periodic" ||
          String(workflowInputValues.prompt || "").trim())
      ) {
        setWorkflowComposerSubmitRequest((current) => (current ?? 0) + 1);
      } else {
        void submitWorkflowBatch(null);
      }
      return;
    }
    let definition: Record<string, unknown>;
    try {
      const parsed = JSON.parse(definitionJson || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Definition must be a JSON object.");
      }
      definition = parsed as Record<string, unknown>;
      setJsonError("");
    } catch (parseError) {
      setJsonError(parseError instanceof Error ? parseError.message : "Invalid JSON definition.");
      return;
    }
    setSubmissionIntent(submitIntentRef.current);
    const normalizedTargetResourceId = targetResourceId.trim();
    const normalizedDefinition =
      targetKind === "project_ticket_action" &&
      normalizedTargetResourceId &&
      !String(definition.threadId || definition.preparedThreadId || "").trim()
        ? { ...definition, preparedThreadId: normalizedTargetResourceId }
        : definition;
    void submitDraft({
      ...draft,
      name: name.trim(),
      description: description.trim(),
      targetKind,
      targetResourceId: normalizedTargetResourceId || null,
      targetVersionId: targetVersionId.trim() || null,
      sourceProjectId: sourceProjectId.trim() || null,
      sourceTicketId: sourceTicketId.trim() || null,
      startPolicy,
      definition: normalizedDefinition,
    });
  };

  const submitThreadBatch = async (payload: RunnerChatComposerSubmitPayload): Promise<boolean> => {
    if (!name.trim() || !payload.prompt.trim()) return false;
    const preservedThreadId = draft?.targetKind === "thread_run" ? targetResourceId.trim() : "";
    const result = await submitDraft(buildBatchThreadJobDraft(payload, {
      draft,
      name: name.trim(),
      description: description.trim(),
      targetResourceId: preservedThreadId,
      startPolicy,
    }));
    return result !== false;
  };

  const activeTargetOption =
    TARGET_OPTIONS.find((option) => option.value === targetKind) ?? TARGET_OPTIONS[0];
  const targetControl = (
    <PlatformPopup
      open={targetMenuOpen}
      variant="minimal"
      portal
      placement="bottom-end"
      animation="down-in"
      rootClassName="batches-create-modal__type-anchor"
      surfaceClassName="batches-create-modal__type-menu"
      surfaceProps={{
        role: "menu",
        "aria-label": "Batch work type",
        width: 250,
      }}
      trigger={
        <PlatformSecondaryButton
          type="button"
          size="small"
          className="batches-create-modal__type-button"
          active={targetMenuOpen}
          disabled={submitting || typeLocked}
          onClick={() => setTargetMenuOpen((current) => !current)}
          aria-label={`Batch work type: ${activeTargetOption.label}`}
          aria-haspopup="menu"
          aria-expanded={targetMenuOpen}
        >
          <SlidersHorizontal width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
          <span>{activeTargetOption.label}</span>
        </PlatformSecondaryButton>
      }
    >
      {TARGET_OPTIONS.map((option) => {
        const selected = option.value === targetKind;
        return (
          <button
            key={option.value}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            className={`tb-popup-row${selected ? " is-selected" : ""}`}
            onClick={() => {
              if (option.value !== targetKind) {
                setTargetKind(option.value);
                setTargetResourceId("");
                setTargetVersionId("");
                setSourceProjectId("");
                setSourceTicketId("");
                setDefinitionJson("{}");
                setTargetResources([]);
                setTargetResourcesError("");
                setTargetResourceQuery("");
                setProjects([]);
                setProjectsError("");
                setProjectQuery("");
                setProjectTickets([]);
                setProjectTicketsError("");
                setTicketQuery("");
                setWorkflowContext(null);
                setWorkflowContextError("");
                setWorkflowContractId("");
                setWorkflowInputValues({});
                setWorkflowComposerSubmitRequest(null);
              }
              setJsonError("");
              setTargetMenuOpen(false);
              nameRef.current?.focus({ preventScroll: true });
            }}
          >
            <span className="tb-popup-check-slot" aria-hidden="true">
              {selected ? (
                <Check className="tb-popup-check" width={13} height={13} strokeWidth={1.8} />
              ) : null}
            </span>
            <span className="batches-create-modal__type-option-copy">
              <span>{option.label}</span>
              <span>{option.description}</span>
            </span>
          </button>
        );
      })}
    </PlatformPopup>
  );

  const actionPending = submitting || submissionIntent !== null;
  const actionDisabled =
    actionPending ||
    !name.trim() ||
    (!["thread_run", "metronome_run"].includes(targetKind) && Boolean(jsonError)) ||
    projectTargetIncomplete ||
    resourceTargetIncomplete ||
    threadTargetIncomplete ||
    workflowTargetIncomplete;

  return (
    <PlatformModal
      open={open}
      title={mode === "create" ? "New Batch" : mode === "edit" ? "Edit Batch" : "Batch"}
      headerVariant="search"
      headerSearchProps={{
        inputRef: nameRef,
        value: name,
        maxLength: 500,
        placeholder: "Batch name",
        "aria-label": "Name",
        icon: Truck,
        disabled: fieldsDisabled,
        onChange: (event) => setName(event.currentTarget.value),
      }}
      headerActions={targetControl}
      as="form"
      size="large"
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting && !targetMenuOpen}
      closeButtonDisabled={submitting}
      onClose={onClose}
      className="batches-create-modal"
      headerClassName="batches-create-modal__header"
      bodyClassName="batches-create-modal__body"
      footerClassName="batches-create-modal__footer"
      surfaceProps={{
        onSubmit: submit,
        onClick: (event) => {
          const target = event.target instanceof Element ? event.target : null;
          if (
            targetMenuOpen &&
            !target?.closest(".batches-create-modal__type-anchor, .batches-create-modal__type-menu")
          ) {
            setTargetMenuOpen(false);
          }
        },
      }}
      footer={
        <>
          <div className="batches-create-modal__footer-policy">
            <span>Start policy</span>
            <PlatformSelector
              value={startPolicy}
              options={POLICY_OPTIONS}
              ariaLabel="Batch start policy"
              disabled={fieldsDisabled}
              popupWidth={280}
              onValueChange={setStartPolicy}
            />
          </div>
          <div className="batches-create-modal__footer-actions">
            {existingManualJob ? (
              <PlatformSecondaryButton
                size="medium"
                type="submit"
                disabled={actionDisabled}
                onClick={() => {
                  submitIntentRef.current = "save";
                }}
              >
                {submissionIntent === "save" ? (
                  <>
                    <Loader2 className="batches-spin" width={14} height={14} aria-hidden="true" />
                    Saving
                  </>
                ) : (
                  <>
                    <Bookmark width={14} height={14} aria-hidden="true" />
                    Save Changes
                  </>
                )}
              </PlatformSecondaryButton>
            ) : (
              <PlatformSecondaryButton size="medium" disabled={submitting} onClick={onClose}>
                {mode === "view" ? "Close" : "Cancel"}
              </PlatformSecondaryButton>
            )}
            {mode !== "view" ? (
              <PlatformPrimaryButton
                size="medium"
                type="submit"
                disabled={actionDisabled}
                onClick={() => {
                  submitIntentRef.current = existingManualJob ? "start" : "save";
                }}
              >
                {submissionIntent === "start" ? (
                  <>
                    <Loader2 className="batches-spin" width={14} height={14} aria-hidden="true" />
                    Starting
                  </>
                ) : existingManualJob ? (
                  <>
                    <Play width={14} height={14} aria-hidden="true" />
                    Start Job
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 className="batches-spin" width={14} height={14} aria-hidden="true" />
                    {mode === "edit" ? "Saving" : "Adding"}
                  </>
                ) : mode === "edit" ? (
                  <>
                    <Check width={14} height={14} aria-hidden="true" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus width={14} height={14} aria-hidden="true" />
                    Add Job
                  </>
                )}
              </PlatformPrimaryButton>
            ) : null}
          </div>
        </>
      }
    >
      <div className="batches-form-grid">
        <PlatformInstructionsEditor
          value={description}
          onChange={(nextDescription) => setDescription(nextDescription.slice(0, 4_000))}
          title="Description"
          placeholder="Why this work is queued and what success means."
          ariaLabel="Batch description"
          readOnly={fieldsDisabled}
          stickyHeader={false}
          historyKey={`batch-description:${draft?.idempotencyKey || "new"}`}
          variant="minimalistic-ui"
          className="batches-create-modal__description-editor"
        />
        {isSelectableTargetKind(targetKind)
          ? (() => {
              const details = RESOURCE_TARGET_DETAILS[targetKind];
              const selectedResource = targetResources.find(
                (resource) => resource.id === targetResourceId,
              );
              const fallbackResource =
                targetResourceId && !selectedResource
                  ? ({
                      id: targetResourceId,
                      targetKind,
                      name: String(
                        draft?.metadata?.resourceName ||
                          draft?.metadata?.resource_name ||
                          draft?.name ||
                          targetResourceId,
                      ),
                      description: "Currently selected resource",
                      status: null,
                      versionId: targetVersionId || null,
                    } satisfies BatchTargetResourceOption)
                  : null;
              const resolvedResources = fallbackResource
                ? [fallbackResource, ...targetResources]
                : targetResources;
              const normalizedResourceQuery = targetResourceQuery.trim().toLocaleLowerCase();
              const visibleResources = normalizedResourceQuery
                ? resolvedResources.filter((resource) =>
                    [resource.name, resource.description, resource.status, resource.id]
                      .filter(Boolean)
                      .some((value) =>
                        String(value).toLocaleLowerCase().includes(normalizedResourceQuery),
                      ),
                  )
                : resolvedResources;
              return (
                <div className="batches-form-field is-span-2 batches-create-modal__resource-field">
                  <span>{details.label}</span>
                  <PlatformSelector
                    value={targetResourceId}
                    options={visibleResources.map((resource) => ({
                      value: resource.id,
                      label: resource.name,
                      description: resource.description,
                      trailing: resource.status ? (
                        <span className="batches-create-modal__resource-status">
                          {resource.status.replace(/_/g, " ")}
                        </span>
                      ) : undefined,
                    }))}
                    fullWidth
                    ariaLabel={`${details.label} resource`}
                    placeholder={details.placeholder}
                    loading={targetResourcesLoading}
                    loadingContent={`Loading ${details.label} resources…`}
                    emptyContent={
                      targetResourcesError ||
                      (normalizedResourceQuery
                        ? `No ${details.label} resources match “${targetResourceQuery.trim()}”.`
                        : details.emptyContent)
                    }
                    disabled={fieldsDisabled}
                    popupHeader={
                      <PlatformPopupSearchHeader
                        value={targetResourceQuery}
                        placeholder={`Search ${details.label}`}
                        aria-label={`Search ${details.label} resources`}
                        showSearchIcon
                        autoFocus
                        onChange={(event) => setTargetResourceQuery(event.currentTarget.value)}
                      />
                    }
                    popupHeaderClassName="is-search-header"
                    popupMaxHeight="min(360px, calc(100vh - 64px))"
                    popupMatchTriggerWidth="exact"
                    triggerClassName="batches-create-modal__resource-trigger"
                    popupClassName="batches-create-modal__resource-popup"
                    onOpenChange={(nextOpen) => {
                      if (!nextOpen) setTargetResourceQuery("");
                    }}
                    onValueChange={(resourceId) => {
                      const resource = resolvedResources.find(
                        (candidate) => candidate.id === resourceId,
                      );
                      if (!resource) return;
                      setTargetResourceId(resource.id);
                      setTargetVersionId(resource.versionId || "");
                      if (targetKind === "metronome_run") {
                        setWorkflowContext(null);
                        setWorkflowContextError("");
                        setWorkflowContractId("");
                        setWorkflowInputValues({});
                        setWorkflowComposerSubmitRequest(null);
                      }
                      setDefinitionJson((current) =>
                        updateDefinitionResource(current, targetKind, resource),
                      );
                      setJsonError("");
                    }}
                  />
                  {targetResourcesError ? (
                    <small className="is-error" role="alert">
                      {targetResourcesError}
                    </small>
                  ) : selectedResource?.versionId || fallbackResource?.versionId ? (
                    <small>The published resource version will be pinned automatically.</small>
                  ) : null}
                </div>
              );
            })()
          : null}
        {targetKind === "project_ticket_action"
          ? (() => {
              const selectedProject = projects.find((project) => project.id === sourceProjectId);
              const fallbackProject =
                sourceProjectId && !selectedProject
                  ? ({
                      id: sourceProjectId,
                      name: String(
                        draft?.metadata?.projectName ||
                          draft?.metadata?.project_name ||
                          "Selected Project",
                      ),
                      description: "Currently selected project",
                      status: null,
                    } satisfies BatchProjectOption)
                  : null;
              const resolvedProjects = fallbackProject ? [fallbackProject, ...projects] : projects;
              const normalizedProjectQuery = projectQuery.trim().toLocaleLowerCase();
              const visibleProjects = normalizedProjectQuery
                ? resolvedProjects.filter((project) =>
                    [project.name, project.description, project.status, project.id]
                      .filter(Boolean)
                      .some((value) =>
                        String(value).toLocaleLowerCase().includes(normalizedProjectQuery),
                      ),
                  )
                : resolvedProjects;

              const selectedTicket = projectTickets.find((ticket) => ticket.id === sourceTicketId);
              const fallbackTicket =
                sourceTicketId && !selectedTicket
                  ? ({
                      id: sourceTicketId,
                      projectId: sourceProjectId,
                      name: String(
                        draft?.metadata?.ticketNumber ||
                          draft?.metadata?.ticket_number ||
                          draft?.name ||
                          "Selected Ticket",
                      ),
                      description: "Currently selected ticket",
                      status: null,
                      ticketNumber:
                        String(
                          draft?.metadata?.ticketNumber || draft?.metadata?.ticket_number || "",
                        ) || null,
                      disabled: false,
                    } satisfies BatchProjectTicketOption)
                  : null;
              const resolvedTickets = fallbackTicket
                ? [fallbackTicket, ...projectTickets]
                : projectTickets;
              const normalizedTicketQuery = ticketQuery.trim().toLocaleLowerCase();
              const visibleTickets = normalizedTicketQuery
                ? resolvedTickets.filter((ticket) =>
                    [ticket.name, ticket.description, ticket.status, ticket.ticketNumber, ticket.id]
                      .filter(Boolean)
                      .some((value) =>
                        String(value).toLocaleLowerCase().includes(normalizedTicketQuery),
                      ),
                  )
                : resolvedTickets;

              return (
                <>
                  <div className="batches-form-field batches-create-modal__resource-field">
                    <span>Project</span>
                    <PlatformSelector
                      value={sourceProjectId}
                      options={visibleProjects.map((project) => ({
                        value: project.id,
                        label: project.name,
                        description: project.description,
                        trailing: project.status ? (
                          <span className="batches-create-modal__resource-status">
                            {project.status.replace(/_/g, " ")}
                          </span>
                        ) : undefined,
                      }))}
                      fullWidth
                      ariaLabel="Batch Project"
                      placeholder="Select a Project"
                      loading={projectsLoading}
                      loadingContent="Loading Projects…"
                      emptyContent={
                        projectsError ||
                        (normalizedProjectQuery
                          ? `No Projects match “${projectQuery.trim()}”.`
                          : "No Projects are available.")
                      }
                      disabled={fieldsDisabled || projectTargetLocked}
                      popupHeader={
                        <PlatformPopupSearchHeader
                          value={projectQuery}
                          placeholder="Search Projects"
                          aria-label="Search Projects"
                          showSearchIcon
                          autoFocus
                          onChange={(event) => setProjectQuery(event.currentTarget.value)}
                        />
                      }
                      popupHeaderClassName="is-search-header"
                      popupMaxHeight="min(360px, calc(100vh - 64px))"
                      popupMatchTriggerWidth="exact"
                      triggerClassName="batches-create-modal__resource-trigger"
                      popupClassName="batches-create-modal__resource-popup"
                      onOpenChange={(nextOpen) => {
                        if (!nextOpen) setProjectQuery("");
                      }}
                      onValueChange={(projectId) => {
                        setSourceProjectId(projectId);
                        setSourceTicketId("");
                        setTargetResourceId("");
                        setTargetVersionId("");
                        setProjectTickets([]);
                        setProjectTicketsError("");
                        setTicketQuery("");
                        setDefinitionJson((current) =>
                          updateProjectTicketDefinition(current, projectId),
                        );
                        setJsonError("");
                      }}
                    />
                    {projectsError ? (
                      <small className="is-error" role="alert">
                        {projectsError}
                      </small>
                    ) : null}
                  </div>
                  <div className="batches-form-field batches-create-modal__resource-field">
                    <span>Ticket</span>
                    <PlatformSelector
                      value={sourceTicketId}
                      options={visibleTickets.map((ticket) => ({
                        value: ticket.id,
                        label: ticket.name,
                        description: ticket.description,
                        disabled: ticket.disabled,
                        trailing: ticket.status ? (
                          <span className="batches-create-modal__resource-status">
                            {ticket.status.replace(/_/g, " ")}
                          </span>
                        ) : undefined,
                      }))}
                      fullWidth
                      ariaLabel="Batch Project Ticket"
                      placeholder={sourceProjectId ? "Select a Ticket" : "Select a Project first"}
                      loading={projectTicketsLoading}
                      loadingContent="Loading Tickets…"
                      emptyContent={
                        projectTicketsError ||
                        (normalizedTicketQuery
                          ? `No Tickets match “${ticketQuery.trim()}”.`
                          : "No Tickets are available for this Project.")
                      }
                      disabled={fieldsDisabled || projectTargetLocked || !sourceProjectId}
                      popupHeader={
                        <PlatformPopupSearchHeader
                          value={ticketQuery}
                          placeholder="Search Tickets"
                          aria-label="Search Tickets"
                          showSearchIcon
                          autoFocus
                          onChange={(event) => setTicketQuery(event.currentTarget.value)}
                        />
                      }
                      popupHeaderClassName="is-search-header"
                      popupMaxHeight="min(360px, calc(100vh - 64px))"
                      popupMatchTriggerWidth="exact"
                      triggerClassName="batches-create-modal__resource-trigger"
                      popupClassName="batches-create-modal__resource-popup"
                      onOpenChange={(nextOpen) => {
                        if (!nextOpen) setTicketQuery("");
                      }}
                      onValueChange={(ticketId) => {
                        setSourceTicketId(ticketId);
                        setTargetResourceId("");
                        setTargetVersionId("");
                        setDefinitionJson((current) =>
                          updateProjectTicketDefinition(current, sourceProjectId, ticketId),
                        );
                        setJsonError("");
                      }}
                    />
                    {projectTicketsError ? (
                      <small className="is-error" role="alert">
                        {projectTicketsError}
                      </small>
                    ) : null}
                  </div>
                </>
              );
            })()
          : null}
        {targetKind === "thread_run" ? (
          <RunnerChat
            {...threadComposerProps}
            backendUrl={threadComposerProps?.backendUrl || ""}
            apiKey={threadComposerProps?.apiKey || ""}
            className="batches-create-modal__thread-composer"
            initialTask={String(
              draft?.definition?.message ||
                draft?.definition?.content ||
                draft?.definition?.task ||
                threadPrompt,
            )}
            inputMode="computer-agents"
            placeholder="Describe the work this Batch should perform"
            disabled={fieldsDisabled}
            autoCreateThread={false}
            autoFocusComposer={false}
            keepFocusOnSubmit={false}
            showUsageInStatus={false}
            portalComposerSuggestions
            onComposerDraftChange={setThreadPrompt}
            composerSubmitRequest={composerSubmitRequest}
            onComposerSubmit={submitThreadBatch}
          />
        ) : null}
        {targetKind === "metronome_run" ? (
          workflowContextLoading ? (
            <div className="batches-create-modal__workflow-loading" role="status">
              <Loader2 className="batches-spin" width={14} height={14} aria-hidden="true" />
              Loading Workflow inputs…
            </div>
          ) : workflowContextError ? (
            <p className="batches-create-modal__workflow-error" role="alert">
              {workflowContextError}
            </p>
          ) : workflowContext ? (
            <MetronomeManualRunInputs
              contracts={workflowContracts}
              contractId={activeWorkflowContract?.id || ""}
              values={workflowInputValues}
              disabled={fieldsDisabled}
              composerKey={`batch-workflow:${targetResourceId}:${workflowContext.versionId}`}
              composerSubmitRequest={workflowComposerSubmitRequest}
              threadComposerProps={threadComposerProps}
              onContractChange={(contractId) => {
                const contract = workflowContracts.find((candidate) => candidate.id === contractId);
                if (!contract) return;
                setWorkflowContractId(contract.id);
                setWorkflowInputValues(createMetronomeManualRunInitialValues(contract));
                setWorkflowComposerSubmitRequest(null);
              }}
              onValueChange={updateWorkflowInputValue}
              onComposerSubmit={(payload) => submitWorkflowBatch(payload)}
            />
          ) : null
        ) : null}
      </div>
      {jsonError || error ? (
        <p className="batches-form-error" role="alert">
          {jsonError || error}
        </p>
      ) : null}
    </PlatformModal>
  );
}
