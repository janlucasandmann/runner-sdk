import { Bot, Loader2, Play, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  getTestPlanExecutionProfile,
  type TestPlanDefinition,
  type TestPlan,
  type TestRun,
  type TestRunCreateInput,
  type TestWorkspaceResourceOption,
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
  const publishedVersion = useMemo(() => (
    plan?.versions?.find((version) => version.id === plan.publishedVersionId) || null
  ), [plan]);
  const publishedDefinition = useMemo(() => {
    const snapshot = publishedVersion?.snapshot;
    const candidate = snapshot && typeof snapshot === "object"
      ? (snapshot as Record<string, unknown>).definition
      : null;
    return candidate && typeof candidate === "object" && !Array.isArray(candidate)
      ? candidate as TestPlanDefinition
      : plan?.definition || null;
  }, [plan, publishedVersion]);
  const executionProfile = publishedDefinition
    ? getTestPlanExecutionProfile(publishedDefinition)
    : null;
  const enabledCaseCount = publishedDefinition?.cases.filter(
    (testCase) => testCase.enabled !== false,
  ).length || 0;
  const requiresEnvironment = executionProfile?.requiresEnvironment !== false;

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
    if (!plan?.publishedVersionId || !publishedVersion) {
      setError("Publish an immutable test-plan version before starting this run.");
      return;
    }
    if (enabledCaseCount === 0) {
      setError("The published version has no enabled test cases.");
      return;
    }
    if (requiresEnvironment && !environmentId) {
      setError("Select an environment for this agent-executed run.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onRun(plan, {
        versionId: publishedVersion.id,
        environmentId: requiresEnvironment ? environmentId || undefined : undefined,
        agentId: requiresEnvironment ? agentId || undefined : undefined,
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
        ? `Run the exact published snapshot of ${plan.name}. Draft and unsaved changes are excluded.`
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
            disabled={
              submitting
              || !plan
              || !publishedVersion
              || enabledCaseCount === 0
              || (requiresEnvironment && !environmentId)
            }
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
      {plan ? (
        <div className="tests-run-contract-summary">
          <div>
            <span>Version</span>
            <strong>{publishedVersion ? `v${publishedVersion.version} · ${publishedVersion.label}` : "Not published"}</strong>
          </div>
          <div>
            <span>Enabled cases</span>
            <strong>{enabledCaseCount}</strong>
          </div>
        </div>
      ) : null}
      {executionProfile ? (
        <div className={`tests-run-trust-card is-${executionProfile.trust}`}>
          {executionProfile.trust === "verified_worker" ? (
            <ShieldCheck width={17} height={17} aria-hidden="true" />
          ) : (
            <Bot width={17} height={17} aria-hidden="true" />
          )}
          <span>
            <strong>{executionProfile.label}</strong>
            {executionProfile.description}
          </span>
        </div>
      ) : null}
      <div className="tests-form-grid">
        {requiresEnvironment ? (
          <>
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
          </>
        ) : null}
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
