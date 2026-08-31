import { Loader2, Plus, ShieldCheck } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import type {
  AssurancePolicy,
  AssurancePolicyCreateInput,
  AssuranceWorkspaceOption,
} from "../domain/index.js";

interface AssurancePolicyCreateModalProps {
  open: boolean;
  projects: readonly AssuranceWorkspaceOption[];
  testPlans: readonly AssuranceWorkspaceOption[];
  defaultProjectId?: string;
  onClose: () => void;
  onCreate: (input: AssurancePolicyCreateInput) => Promise<AssurancePolicy>;
}

function slugify(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "release-test";
}

export function AssurancePolicyCreateModal({
  open,
  projects,
  testPlans,
  defaultProjectId = "",
  onClose,
  onCreate,
}: AssurancePolicyCreateModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [testPlanId, setTestPlanId] = useState("");
  const [approvalMode, setApprovalMode] = useState<"none" | "manual">("manual");
  const [maxAgeHours, setMaxAgeHours] = useState("24");
  const [maximumCostUsd, setMaximumCostUsd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const canCreate = !submitting && Boolean(name.trim()) && Boolean(testPlanId);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setProjectId(defaultProjectId);
    setTestPlanId("");
    setApprovalMode("manual");
    setMaxAgeHours("24");
    setMaximumCostUsd("");
    setSubmitting(false);
    setError("");
  }, [defaultProjectId, open]);

  const close = () => {
    if (!submitting) onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedName = name.trim();
    const testPlan = testPlans.find((candidate) => candidate.id === testPlanId);
    const age = Number(maxAgeHours);
    const maximumCost = maximumCostUsd.trim() ? Number(maximumCostUsd) : null;
    if (!normalizedName) {
      setError("Enter an Assurance Policy name.");
      nameRef.current?.focus();
      return;
    }
    if (!testPlan?.id || !testPlan.publishedVersionId) {
      setError("Select a Test Plan with a published version.");
      return;
    }
    if (!Number.isFinite(age) || age <= 0) {
      setError("Evidence freshness must be greater than zero hours.");
      return;
    }
    if (maximumCost !== null && (!Number.isFinite(maximumCost) || maximumCost < 0)) {
      setError("Maximum cost must be a positive number.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({
        name: normalizedName,
        description: description.trim(),
        projectId: projectId || undefined,
        status: "active",
        definition: {
          schemaVersion: "computer_agents_assurance_policy_v1",
          testGates: [{
            id: slugify(testPlan.name),
            testPlanId: testPlan.id,
            versionId: testPlan.publishedVersionId,
            requireCommitSha: true,
            maxAgeHours: age,
          }],
          evaluationGates: [],
          optimizationGates: [],
          approval: { mode: approvalMode },
          budget: { maximumTotalCostUsd: maximumCost },
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
          : "Failed to create the Assurance Policy.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformModal
      open={open}
      title="New Assurance Policy"
      headerVariant="search"
      headerSearchProps={{
        inputRef: nameRef,
        icon: ShieldCheck,
        value: name,
        maxLength: 500,
        placeholder: "Assurance Policy name",
        "aria-label": "Assurance Policy name",
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
      className="assurance-create-modal"
      bodyClassName="assurance-create-modal__body"
      footerClassName="assurance-create-modal__footer"
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
                <Loader2 className="assurance-spin" width={14} height={14} aria-hidden="true" />
                Creating
              </>
            ) : (
              <>
                <Plus width={14} height={14} aria-hidden="true" />
                Create Policy
              </>
            )}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <div className="assurance-form-grid">
        <PlatformInstructionsEditor
          value={description}
          onChange={(nextDescription) => setDescription(nextDescription.slice(0, 10_000))}
          title="Description"
          placeholder="What must be proven before this project or release can be completed."
          ariaLabel="Assurance Policy description"
          readOnly={submitting}
          stickyHeader={false}
          historyKey="assurance-policy-create-description"
          variant="minimalistic-ui"
          contentVariant="text"
          className="assurance-create-modal__description-editor"
        />
        <div className="assurance-form-field">
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
            ariaLabel="Assurance Policy project"
            disabled={submitting}
            onValueChange={setProjectId}
          />
        </div>
        <div className="assurance-form-field">
          <span>Published Test Plan</span>
          <PlatformSelector
            value={testPlanId}
            options={testPlans
              .filter((plan) => Boolean(plan.publishedVersionId))
              .map((plan) => ({
                value: plan.id,
                label: plan.name,
                description: plan.description,
              }))}
            placeholder="Select Test Plan"
            fullWidth
            ariaLabel="Initial Assurance Test gate"
            disabled={submitting}
            onValueChange={setTestPlanId}
          />
        </div>
        <div className="assurance-form-field">
          <span>Approval</span>
          <PlatformSelector
            value={approvalMode}
            options={[
              {
                value: "manual",
                label: "Manual approval",
                description: "Require a human approval bound to current evidence.",
              },
              {
                value: "none",
                label: "Automatic",
                description: "Pass immediately when every technical gate passes.",
              },
            ]}
            fullWidth
            ariaLabel="Assurance approval mode"
            disabled={submitting}
            onValueChange={setApprovalMode}
          />
        </div>
        <label className="assurance-form-field">
          <span>Evidence freshness · hours</span>
          <input
            type="number"
            min="1"
            step="1"
            value={maxAgeHours}
            disabled={submitting}
            onChange={(event) => setMaxAgeHours(event.currentTarget.value)}
          />
        </label>
        <label className="assurance-form-field">
          <span>Maximum evidence cost · USD</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={maximumCostUsd}
            placeholder="No budget gate"
            disabled={submitting}
            onChange={(event) => setMaximumCostUsd(event.currentTarget.value)}
          />
        </label>
      </div>
      {!testPlans.some((plan) => Boolean(plan.publishedVersionId)) ? (
        <p className="assurance-form-notice">
          Create and publish a Test Plan before creating an Assurance Policy.
        </p>
      ) : null}
      {error ? <p className="assurance-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}
