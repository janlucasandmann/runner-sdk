import { Loader2, Play } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import type {
  TestPlan,
  TestRun,
  TestRunCreateInput,
  TestWorkspaceResourceOption,
} from "../domain/index.js";

interface TestRunCreateModalProps {
  open: boolean;
  plan: TestPlan | null;
  environments: readonly TestWorkspaceResourceOption[];
  agents: readonly TestWorkspaceResourceOption[];
  defaultEnvironmentId?: string;
  defaultAgentId?: string;
  onClose: () => void;
  onRun: (plan: TestPlan, input: TestRunCreateInput) => Promise<TestRun>;
}

export function TestRunCreateModal({
  open,
  plan,
  environments,
  agents,
  defaultEnvironmentId = "",
  defaultAgentId = "",
  onClose,
  onRun,
}: TestRunCreateModalProps) {
  const [environmentId, setEnvironmentId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setEnvironmentId(
      String(plan?.defaultEnvironmentId || defaultEnvironmentId || "").trim(),
    );
    setAgentId(defaultAgentId);
    setCommitSha("");
    setSubmitting(false);
    setError("");
  }, [defaultAgentId, defaultEnvironmentId, open, plan]);

  const close = () => {
    if (!submitting) onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!plan || !environmentId) {
      setError("Select an environment before starting this run.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onRun(plan, {
        environmentId,
        agentId: agentId || undefined,
        projectId: plan.projectId || undefined,
        commitSha: commitSha.trim() || undefined,
        triggerType: "manual",
      });
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to start the test run.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformModal
      open={open}
      title="Run Test Plan"
      description={plan
        ? `Execute the published version of ${plan.name} in an isolated Computer Agents environment.`
        : "Select a test plan to run."}
      as="form"
      size="medium"
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      closeButtonDisabled={submitting}
      onClose={close}
      className="tests-run-modal"
      surfaceProps={{ onSubmit: submit }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" disabled={submitting} onClick={close}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={submitting || !plan || !environmentId}
          >
            {submitting ? (
              <>
                <Loader2 className="tests-spin" width={14} height={14} aria-hidden="true" />
                Queuing
              </>
            ) : (
              <>
                <Play width={14} height={14} aria-hidden="true" />
                Run Tests
              </>
            )}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <div className="tests-form-grid">
        <div className="tests-form-field is-span-2">
          <span>Environment</span>
          <PlatformSelector
            value={environmentId}
            options={environments.map((environment) => ({
              value: environment.id,
              label: environment.name,
              description: environment.description,
            }))}
            fullWidth
            ariaLabel="Test run environment"
            disabled={submitting}
            emptyContent="No environments are available."
            onValueChange={setEnvironmentId}
          />
        </div>
        <div className="tests-form-field is-span-2">
          <span>Executor agent</span>
          <PlatformSelector
            value={agentId}
            options={[
              { value: "", label: "Platform default executor" },
              ...agents.map((agent) => ({
                value: agent.id,
                label: agent.name,
                description: agent.description,
              })),
            ]}
            fullWidth
            ariaLabel="Test executor agent"
            disabled={submitting}
            onValueChange={setAgentId}
          />
        </div>
        <label className="tests-form-field is-span-2">
          <span>Commit SHA (optional)</span>
          <input
            value={commitSha}
            maxLength={200}
            placeholder="Exact source revision under test"
            disabled={submitting}
            onChange={(event) => setCommitSha(event.currentTarget.value)}
          />
        </label>
      </div>
      {error ? <p className="tests-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}
