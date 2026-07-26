import { Check, CreditCard, Loader2, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformModal } from "../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../platform-ui/components/ui/button/index.js";
import type { PlatformPlanGateMode } from "./platform-plan-gate-request.js";

export interface PlatformPlanGatePlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice?: number | null;
  includedUsageUsd?: number;
  selfServe?: boolean;
  features?: readonly string[];
}

export interface PlatformPlanGateModalProps {
  open: boolean;
  mode?: PlatformPlanGateMode;
  featureName?: string;
  title?: ReactNode;
  description?: ReactNode;
  requiredPlan: PlatformPlanGatePlan;
  currentPlanName?: string;
  actionLabel?: ReactNode;
  actionLoading?: boolean;
  error?: ReactNode;
  onClose: () => void;
  onPrimaryAction: () => void | Promise<void>;
  onViewPlans?: () => void;
}

function formatMonthlyPrice(plan: PlatformPlanGatePlan): string {
  if (plan.monthlyPrice == null) return "Custom pricing";
  if (plan.monthlyPrice === 0) return "Free";
  return `$${plan.monthlyPrice} / month`;
}

function getDefaultTitle(
  mode: PlatformPlanGateMode,
  featureName: string,
  planName: string,
): string {
  if (mode === "budget") return "Usage budget required";
  if (featureName) return `Unlock ${featureName}`;
  return `Upgrade to ${planName}`;
}

function getDefaultDescription(
  mode: PlatformPlanGateMode,
  featureName: string,
  planName: string,
): string {
  if (mode === "budget") {
    return "Add usage credit or adjust this organization’s billing settings to continue.";
  }
  return featureName
    ? `${featureName} is available on ${planName} and higher organization plans.`
    : `This action is available on ${planName} and higher organization plans.`;
}

export function PlatformPlanGateModal({
  open,
  mode = "feature",
  featureName = "",
  title,
  description,
  requiredPlan,
  currentPlanName = "",
  actionLabel,
  actionLoading = false,
  error,
  onClose,
  onPrimaryAction,
  onViewPlans,
}: PlatformPlanGateModalProps) {
  const normalizedFeatureName = featureName.trim();
  const resolvedTitle = title || getDefaultTitle(mode, normalizedFeatureName, requiredPlan.name);
  const resolvedDescription = description
    || getDefaultDescription(mode, normalizedFeatureName, requiredPlan.name);
  const visibleFeatures = (requiredPlan.features || []).filter(Boolean).slice(0, 5);
  const resolvedActionLabel = actionLabel
    || (mode === "budget"
      ? "Manage billing"
      : requiredPlan.selfServe === false
        ? "Contact sales"
        : `Upgrade to ${requiredPlan.name}`);

  return (
    <PlatformModal
      open={open}
      title={resolvedTitle}
      description={resolvedDescription}
      onClose={() => onClose()}
      size="medium"
      className="platform-plan-gate-modal"
      closeButtonLabel="Close plan requirement"
      closeButtonDisabled={actionLoading}
      closeOnBackdrop={!actionLoading}
      closeOnEscape={!actionLoading}
      bodyClassName="platform-plan-gate-modal__body"
      footerClassName="platform-plan-gate-modal__footer"
      footer={(
        <>
          {onViewPlans ? (
            <PlatformSecondaryButton
              size="medium"
              onClick={onViewPlans}
              disabled={actionLoading}
            >
              View plans
            </PlatformSecondaryButton>
          ) : null}
          <PlatformPrimaryButton
            size="medium"
            onClick={() => void onPrimaryAction()}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2
                className="platform-plan-gate-modal__loader"
                width={14}
                height={14}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ) : mode === "budget" ? (
              <CreditCard width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <LockKeyhole width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
            )}
            <span>{actionLoading ? "Opening..." : resolvedActionLabel}</span>
          </PlatformPrimaryButton>
        </>
      )}
    >
      <section className="platform-plan-gate-modal__plan" aria-label={`${requiredPlan.name} plan`}>
        <div className="platform-plan-gate-modal__plan-header">
          <div>
            <div className="platform-plan-gate-modal__eyebrow">Required organization plan</div>
            <div className="platform-plan-gate-modal__plan-name">{requiredPlan.name}</div>
          </div>
          <div className="platform-plan-gate-modal__price">{formatMonthlyPrice(requiredPlan)}</div>
        </div>
        {requiredPlan.description ? (
          <p className="platform-plan-gate-modal__plan-description">{requiredPlan.description}</p>
        ) : null}
        {requiredPlan.includedUsageUsd ? (
          <div className="platform-plan-gate-modal__usage">
            ${requiredPlan.includedUsageUsd} monthly usage credit included
          </div>
        ) : null}
        {visibleFeatures.length > 0 ? (
          <ul className="platform-plan-gate-modal__features">
            {visibleFeatures.map((feature) => (
              <li key={feature} className="platform-plan-gate-modal__feature">
                <Check width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      {currentPlanName ? (
        <p className="platform-plan-gate-modal__current-plan">
          Current organization plan: <span>{currentPlanName}</span>
        </p>
      ) : null}
      {error ? (
        <p className="platform-plan-gate-modal__error" role="alert">{error}</p>
      ) : null}
    </PlatformModal>
  );
}

