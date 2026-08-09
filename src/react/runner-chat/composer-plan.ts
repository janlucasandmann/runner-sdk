import {
  Star as LucideStar,
  UsersRound as LucideUsersRound,
  type LucideIcon,
} from "lucide-react";

export type RunnerComposerPlanTier =
  | "sandbox"
  | "builder"
  | "team"
  | "enterprise";

export function normalizeRunnerComposerPlanTier(
  value: unknown,
): RunnerComposerPlanTier {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (
    normalized === "enterprise"
    || normalized === "enterprise_plan"
    || normalized === "organization"
    || normalized === "org"
  ) {
    return "enterprise";
  }
  if (normalized === "business" || normalized === "business_plan") {
    return "enterprise";
  }
  if (
    normalized === "team"
    || normalized === "team_plan"
    || normalized === "scale"
  ) {
    return "team";
  }
  if (
    normalized === "builder"
    || normalized === "builder_plan"
    || normalized === "pro"
    || normalized === "pro_plan"
    || normalized === "individual"
    || normalized === "individual_plan"
    || normalized === "paid"
  ) {
    return "builder";
  }
  return "sandbox";
}

export function getRunnerComposerPlanDisplay(
  tierId: unknown,
): { label: string; Icon: LucideIcon } {
  switch (normalizeRunnerComposerPlanTier(tierId)) {
    case "enterprise":
      return { label: "Enterprise Plan", Icon: LucideStar };
    case "team":
      return { label: "Team Plan", Icon: LucideUsersRound };
    case "builder":
      return { label: "Builder Plan", Icon: LucideStar };
    default:
      return { label: "Upgrade to Builder", Icon: LucideStar };
  }
}
