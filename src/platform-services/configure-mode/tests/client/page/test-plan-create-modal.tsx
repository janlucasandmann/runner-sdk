import { Loader2, Plus } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import type {
  TestCaseKind,
  TestPlan,
  TestPlanCreateInput,
  TestWorkspaceResourceOption,
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

const CASE_KIND_OPTIONS: readonly { value: TestCaseKind; label: string; description: string }[] = [
  { value: "command", label: "Command", description: "Execute a real shell command and verify its exit code." },
  { value: "contract", label: "Contract", description: "Verify an API or data contract." },
  { value: "integration", label: "Integration", description: "Verify multiple components working together." },
  { value: "browser", label: "Browser", description: "Verify a user flow in a browser." },
  { value: "agent", label: "Agent", description: "Verify an agent workflow or tool boundary." },
  { value: "security", label: "Security", description: "Verify a security control or negative case." },
  { value: "custom", label: "Custom", description: "Execute custom verification instructions." },
] as const;

function slugify(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "test-case";
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
  const [caseName, setCaseName] = useState("Smoke test");
  const [caseKind, setCaseKind] = useState<TestCaseKind>("command");
  const [command, setCommand] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setProjectId(defaultProjectId);
    setEnvironmentId(defaultEnvironmentId);
    setCaseName("Smoke test");
    setCaseKind("command");
    setCommand("");
    setSubmitting(false);
    setError("");
  }, [defaultEnvironmentId, defaultProjectId, open]);

  const close = () => {
    if (!submitting) onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedCaseName = caseName.trim();
    const normalizedCommand = command.trim();
    if (!normalizedName) {
      setError("Enter a test-plan name.");
      nameRef.current?.focus();
      return;
    }
    if (!normalizedCaseName) {
      setError("Enter a name for the first test case.");
      return;
    }
    if (caseKind === "command" && !normalizedCommand) {
      setError("Enter the command that the first test case should execute.");
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
        definition: {
          cases: [
            {
              id: slugify(normalizedCaseName),
              name: normalizedCaseName,
              description: "",
              kind: caseKind,
              command: normalizedCommand,
              workingDirectory: "",
              timeoutMs: 300_000,
              retries: 0,
              env: {},
              secretRefs: [],
              request: {},
              assertions: [],
              agentId: "",
              enabled: true,
              tags: ["smoke"],
            },
          ],
          concurrency: 1,
          stopOnFailure: false,
        },
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
      description="Define an executable verification contract for a project component or workflow."
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
            disabled={submitting || !name.trim() || !caseName.trim()}
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

      <div className="tests-create-modal__case">
        <div>
          <span className="tests-section-kicker">Initial Case</span>
          <h3>Executable smoke test</h3>
        </div>
        <div className="tests-form-grid">
          <label className="tests-form-field">
            <span>Case name</span>
            <input
              value={caseName}
              maxLength={500}
              disabled={submitting}
              onChange={(event) => setCaseName(event.currentTarget.value)}
            />
          </label>
          <div className="tests-form-field">
            <span>Case type</span>
            <PlatformSelector
              value={caseKind}
              options={CASE_KIND_OPTIONS}
              fullWidth
              ariaLabel="Test case type"
              disabled={submitting}
              onValueChange={setCaseKind}
            />
          </div>
          <label className="tests-form-field is-span-2">
            <span>{caseKind === "command" ? "Command" : "Execution instructions"}</span>
            <textarea
              value={command}
              rows={4}
              placeholder={
                caseKind === "command"
                  ? "npm test -- --runInBand"
                  : "Describe the concrete verification steps and assertions."
              }
              disabled={submitting}
              onChange={(event) => setCommand(event.currentTarget.value)}
            />
          </label>
        </div>
      </div>
      {error ? <p className="tests-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}
