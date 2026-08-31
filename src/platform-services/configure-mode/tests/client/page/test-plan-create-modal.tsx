import {
  Bot,
  FlaskConical,
  FolderKanban,
  GitBranch,
  Loader2,
  Monitor,
  Plus,
  SquareFunction,
  Workflow,
  Wrench,
  type LucideIcon,
} from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import type { TestsApi } from "../api/index.js";
import {
  createDefaultTestPlanDefinition,
  inferTestTargetProjectId,
  type TestPlan,
  type TestPlanCreateInput,
  type TestTargetType,
  type TestWorkspaceResourceOption,
} from "../domain/index.js";
import { useTestTargetResources } from "./use-test-target-resources.js";

interface TestPlanCreateModalProps {
  open: boolean;
  projects: readonly TestWorkspaceResourceOption[];
  environments: readonly TestWorkspaceResourceOption[];
  agents?: readonly TestWorkspaceResourceOption[];
  api?: Pick<TestsApi, "listFunctions" | "listMetronomes">;
  defaultProjectId?: string;
  defaultEnvironmentId?: string;
  onClose: () => void;
  onCreate: (input: TestPlanCreateInput) => Promise<TestPlan>;
}

const TARGETS: Array<{
  id: TestTargetType;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  { id: "function", label: "Function", description: "Contract and behavior tests", icon: SquareFunction },
  { id: "workflow", label: "Workflow", description: "Whole-run and node scenarios", icon: Workflow },
  { id: "web_app", label: "Web app", description: "Browser and visual journeys", icon: Monitor },
  { id: "repository", label: "Repository", description: "Unit, integration, and CI tests", icon: GitBranch },
  { id: "agent", label: "Agent", description: "Tool and workflow acceptance", icon: Bot },
  { id: "project", label: "Project", description: "Cross-resource release assurance", icon: FolderKanban },
  { id: "custom", label: "Custom", description: "Compose your own scenarios", icon: Wrench },
];

export function TestPlanCreateModal({
  open,
  projects,
  environments,
  agents = [],
  api,
  defaultProjectId = "",
  defaultEnvironmentId = "",
  onClose,
  onCreate,
}: TestPlanCreateModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environmentId, setEnvironmentId] = useState(defaultEnvironmentId);
  const [targetType, setTargetType] = useState<TestTargetType>(
    defaultProjectId ? "project" : "custom",
  );
  const [targetId, setTargetId] = useState(defaultProjectId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const targetResources = useTestTargetResources(api, open);
  const selectableTargetResources = useMemo(() => (
    targetType === "function"
      ? targetResources.functions
      : targetType === "workflow"
        ? targetResources.workflows
        : targetType === "agent"
          ? agents
          : targetType === "project"
            ? projects
            : []
  ), [agents, projects, targetResources.functions, targetResources.workflows, targetType]);
  const selectedTargetResource = useMemo(
    () => selectableTargetResources.find((resource) => resource.id === targetId) || null,
    [selectableTargetResources, targetId],
  );
  const inferredProjectId = useMemo(() => inferTestTargetProjectId({
    targetType,
    targetId,
    targetResource: selectedTargetResource,
    projects,
    preferredProjectId: defaultProjectId,
  }), [defaultProjectId, projects, selectedTargetResource, targetId, targetType]);
  const targetNeedsSelection = targetType !== "custom";
  const canCreate = !submitting
    && Boolean(name.trim())
    && (!targetNeedsSelection || Boolean(targetId.trim()));

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setEnvironmentId(defaultEnvironmentId);
    setTargetType(defaultProjectId ? "project" : "custom");
    setTargetId(defaultProjectId);
    setSubmitting(false);
    setError("");
  }, [defaultEnvironmentId, defaultProjectId, open]);

  const close = () => {
    if (!submitting) onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Enter a Test name.");
      nameRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({
        name: normalizedName,
        description: description.trim(),
        projectId: inferredProjectId || undefined,
        targetType,
        targetId: targetId.trim() || undefined,
        defaultEnvironmentId: environmentId || undefined,
        definition: createDefaultTestPlanDefinition(),
        metadata: {
          testProductModelVersion: 2,
          techniques: [],
        },
        publishInitialVersion: false,
      });
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create the Test.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformModal
      open={open}
      title="New Test"
      headerVariant="search"
      headerSearchProps={{
        inputRef: nameRef,
        icon: FlaskConical,
        value: name,
        maxLength: 500,
        placeholder: "Test name",
        "aria-label": "Test name",
        autoComplete: "off",
        disabled: submitting,
        onChange: (event) => setName(event.currentTarget.value),
      }}
      as="form"
      size="large"
      maxHeight="min(720px, calc(100vh - 48px))"
      scrollable
      initialFocusRef={nameRef}
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      closeButtonDisabled={submitting}
      onClose={close}
      className="tests-create-modal"
      bodyClassName="tests-create-modal__body"
      footerClassName="tests-create-modal__footer"
      surfaceProps={{
        onSubmit: submit,
        onKeyDown: (event) => {
          if (
            (event.metaKey || event.ctrlKey)
            && event.key === "Enter"
            && canCreate
          ) {
            event.preventDefault();
            (event.currentTarget as HTMLFormElement).requestSubmit();
          }
        },
      }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" disabled={submitting} onClick={close}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={!canCreate}
          >
            {submitting ? (
              <>
                <Loader2 className="tests-spin" width={14} height={14} aria-hidden="true" />
                Creating
              </>
            ) : (
              <>
                <Plus width={14} height={14} aria-hidden="true" />
                Create Test
              </>
            )}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <div className="tests-form-grid">
        <fieldset className="tests-create-modal__targets">
          <legend>What do you want to test?</legend>
          <div className="tests-create-modal__target-grid">
            {TARGETS.map((target) => {
              const Icon = target.icon;
              return (
                <button
                  key={target.id}
                  type="button"
                  className={targetType === target.id ? "is-active" : ""}
                  aria-pressed={targetType === target.id}
                  disabled={submitting}
                  onClick={() => {
                    setTargetType(target.id);
                    setTargetId(target.id === "project" ? defaultProjectId : "");
                  }}
                >
                  <Icon width={16} height={16} aria-hidden="true" />
                  <span><strong>{target.label}</strong><small>{target.description}</small></span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <PlatformInstructionsEditor
          value={description}
          onChange={(nextDescription) => setDescription(nextDescription.slice(0, 10_000))}
          title="Description"
          placeholder="What this Test proves and when it should run."
          ariaLabel="Test description"
          readOnly={submitting}
          stickyHeader={false}
          historyKey="test-plan-create-description"
          variant="minimalistic-ui"
          contentVariant="text"
          className="tests-create-modal__description-editor"
        />
        <div className="tests-form-field">
          <span>{targetType === "project" ? "Project" : "Target"}</span>
          {targetType === "function" || targetType === "workflow" || targetType === "agent" || targetType === "project" ? (
            <PlatformSelector
              value={targetId}
              options={selectableTargetResources.map((option) => ({
                value: option.id,
                label: option.name,
                description: option.description,
              }))}
              fullWidth
              loading={targetType === "function"
                ? targetResources.functionsLoading
                : targetType === "workflow"
                  ? targetResources.workflowsLoading
                  : false}
              placeholder={`Select ${TARGETS.find((target) => target.id === targetType)?.label.toLowerCase()}`}
              emptyContent={`No ${TARGETS.find((target) => target.id === targetType)?.label.toLowerCase()} targets are available.`}
              ariaLabel={targetType === "project" ? "Test project" : "Test target"}
              disabled={submitting}
              onValueChange={setTargetId}
            />
          ) : (
            <input
              value={targetId}
              placeholder={targetType === "web_app"
                ? "https://app.example.com"
                : targetType === "repository"
                  ? "Repository URL or path"
                  : "Optional target identifier"}
              aria-label="Test target"
              disabled={submitting}
              onChange={(event) => setTargetId(event.currentTarget.value)}
            />
          )}
        </div>
        {targetType === "function" && targetResources.functionsError ? (
          <p className="tests-form-error is-span-2" role="alert">
            {targetResources.functionsError}
          </p>
        ) : null}
        {targetType === "workflow" && targetResources.workflowsError ? (
          <p className="tests-form-error is-span-2" role="alert">
            {targetResources.workflowsError}
          </p>
        ) : null}
        <div className="tests-form-field">
          <span>Environment</span>
          <PlatformSelector
            value={environmentId}
            options={[
              { value: "", label: "Select when running" },
              ...environments.map((environment) => ({
                value: environment.id,
                label: environment.name,
                description: environment.description,
              })),
            ]}
            fullWidth
            ariaLabel="Default test environment"
            disabled={submitting}
            onValueChange={setEnvironmentId}
          />
        </div>
      </div>
      {error ? <p className="tests-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}
