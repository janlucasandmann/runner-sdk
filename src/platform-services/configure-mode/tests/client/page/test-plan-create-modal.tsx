import { FlaskConical, Loader2, Plus } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  createDefaultTestPlanDefinition,
  type TestPlan,
  type TestPlanCreateInput,
  type TestWorkspaceResourceOption,
} from "../domain/index.js";

interface TestPlanCreateModalProps {
  open: boolean;
  projects: readonly TestWorkspaceResourceOption[];
  environments: readonly TestWorkspaceResourceOption[];
  defaultProjectId?: string;
  defaultEnvironmentId?: string;
  onClose: () => void;
  onCreate: (input: TestPlanCreateInput) => Promise<TestPlan>;
}

export function TestPlanCreateModal({
  open,
  projects,
  environments,
  defaultProjectId = "",
  defaultEnvironmentId = "",
  onClose,
  onCreate,
}: TestPlanCreateModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [environmentId, setEnvironmentId] = useState(defaultEnvironmentId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const canCreate = !submitting && Boolean(name.trim());

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setProjectId(defaultProjectId);
    setEnvironmentId(defaultEnvironmentId);
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
      setError("Enter a test-plan name.");
      nameRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({
        name: normalizedName,
        description: description.trim(),
        projectId: projectId || undefined,
        targetType: projectId ? "project" : "custom",
        targetId: projectId || undefined,
        defaultEnvironmentId: environmentId || undefined,
        definition: createDefaultTestPlanDefinition(),
        publishInitialVersion: false,
      });
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create the test plan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformModal
      open={open}
      title="New Test Plan"
      headerVariant="search"
      headerSearchProps={{
        inputRef: nameRef,
        icon: FlaskConical,
        value: name,
        maxLength: 500,
        placeholder: "Test plan name",
        "aria-label": "Test plan name",
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
                Create Test Plan
              </>
            )}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <div className="tests-form-grid">
        <PlatformInstructionsEditor
          value={description}
          onChange={(nextDescription) => setDescription(nextDescription.slice(0, 10_000))}
          title="Description"
          placeholder="What this plan proves before Mission Control advances delivery."
          ariaLabel="Test plan description"
          readOnly={submitting}
          stickyHeader={false}
          historyKey="test-plan-create-description"
          variant="minimalistic-ui"
          contentVariant="text"
          className="tests-create-modal__description-editor"
        />
        <div className="tests-form-field">
          <span>Project</span>
          <PlatformSelector
            value={projectId}
            options={[
              { value: "", label: "No project" },
              ...projects.map((project) => ({
                value: project.id,
                label: project.name,
                description: project.description,
              })),
            ]}
            fullWidth
            ariaLabel="Test-plan project"
            disabled={submitting}
            onValueChange={setProjectId}
          />
        </div>
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
