import { Loader2, Play } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useState, type FormEvent } from "react";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import type {
  AssurancePolicy,
  AssuranceRun,
  AssuranceRunCreateInput,
} from "../domain/index.js";

interface AssuranceRunCreateModalProps {
  open: boolean;
  policy: AssurancePolicy | null;
  onClose: () => void;
  onCreate: (
    policy: AssurancePolicy,
    input: AssuranceRunCreateInput,
  ) => Promise<AssuranceRun>;
}

function parseIds(value: string): string[] {
  return Array.from(new Set(
    String(value || "")
      .split(/[\s,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean),
  ));
}

export function AssuranceRunCreateModal({
  open,
  policy,
  onClose,
  onCreate,
}: AssuranceRunCreateModalProps) {
  const [releaseId, setReleaseId] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [testRunIds, setTestRunIds] = useState("");
  const [evaluationRunIds, setEvaluationRunIds] = useState("");
  const [optimizationJobIds, setOptimizationJobIds] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setReleaseId("");
    setCommitSha("");
    setTestRunIds("");
    setEvaluationRunIds("");
    setOptimizationJobIds("");
    setSubmitting(false);
    setError("");
  }, [open]);

  const close = () => {
    if (!submitting) onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!policy) return;
    if (!policy.publishedVersionId) {
      setError("Publish an Assurance Policy version before starting a run.");
      return;
    }
    if (
      policy.definition.testGates.some((gate) => gate.requireCommitSha)
      && !commitSha.trim()
    ) {
      setError("Enter the exact commit SHA required by this policy.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate(policy, {
        policyVersionId: policy.publishedVersionId,
        projectId: policy.projectId || undefined,
        releaseId: releaseId.trim() || undefined,
        commitSha: commitSha.trim() || undefined,
        evidenceReferences: {
          testRunIds: parseIds(testRunIds),
          evaluationRunIds: parseIds(evaluationRunIds),
          optimizationJobIds: parseIds(optimizationJobIds),
        },
        metadata: {
          source: "assurance_service",
        },
      });
      onClose();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Failed to start the Assurance Run.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformModal
      open={open}
      title="Run Assurance"
      description="Reference canonical service run IDs. The control plane loads and verifies their authoritative evidence."
      as="form"
      size="large"
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      closeButtonDisabled={submitting}
      onClose={close}
      className="assurance-create-modal"
      bodyClassName="assurance-create-modal__body"
      surfaceProps={{ onSubmit: submit }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" disabled={submitting} onClick={close}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={submitting || !policy?.publishedVersionId}
          >
            {submitting ? (
              <>
                <Loader2 className="assurance-spin" width={14} height={14} aria-hidden="true" />
                Evaluating
              </>
            ) : (
              <>
                <Play width={14} height={14} aria-hidden="true" />
                Start Run
              </>
            )}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <div className="assurance-form-grid">
        <label className="assurance-form-field">
          <span>Release ID</span>
          <input
            value={releaseId}
            placeholder="Optional milestone or release"
            disabled={submitting}
            onChange={(event) => setReleaseId(event.currentTarget.value)}
          />
        </label>
        <label className="assurance-form-field">
          <span>Commit SHA</span>
          <input
            value={commitSha}
            placeholder="Exact source revision"
            disabled={submitting}
            onChange={(event) => setCommitSha(event.currentTarget.value)}
          />
        </label>
        <label className="assurance-form-field is-span-2">
          <span>Test Run IDs</span>
          <textarea
            value={testRunIds}
            rows={3}
            placeholder="test_run_123, test_run_456"
            disabled={submitting}
            onChange={(event) => setTestRunIds(event.currentTarget.value)}
          />
        </label>
        <label className="assurance-form-field is-span-2">
          <span>Evaluation Run IDs</span>
          <textarea
            value={evaluationRunIds}
            rows={3}
            placeholder="evaluation_run_123"
            disabled={submitting}
            onChange={(event) => setEvaluationRunIds(event.currentTarget.value)}
          />
        </label>
        <label className="assurance-form-field is-span-2">
          <span>Agent Optimization Job IDs</span>
          <textarea
            value={optimizationJobIds}
            rows={3}
            placeholder="fine_tune_job_123"
            disabled={submitting}
            onChange={(event) => setOptimizationJobIds(event.currentTarget.value)}
          />
        </label>
      </div>
      {error ? <p className="assurance-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}
