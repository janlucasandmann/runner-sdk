import { Loader2, Plus } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
      description="Create a draft plan first. You can add cases, review the execution boundary, and publish an immutable version when it is ready."
      as="form"
      size="large"
      initialFocusRef={nameRef}
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      closeButtonDisabled={submitting}
      onClose={close}
      className="tests-create-modal"
      bodyClassName="tests-create-modal__body"
      surfaceProps={{ onSubmit: submit }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" disabled={submitting} onClick={close}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={submitting || !name.trim()}
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
        <label className="tests-form-field">
          <span>Name</span>
          <input
            ref={nameRef}
            value={name}
            maxLength={500}
            placeholder="Release verification"
            disabled={submitting}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <label className="tests-form-field is-span-2">
          <span>Description</span>
          <textarea
            value={description}
            rows={3}
            maxLength={10_000}
            placeholder="What this plan proves before Mission Control advances delivery."
            disabled={submitting}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </label>
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
