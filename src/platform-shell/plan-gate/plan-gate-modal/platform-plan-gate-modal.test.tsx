// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlatformPlanGateModal } from "./platform-plan-gate-modal.js";
import {
  PLATFORM_PLAN_GATE_REQUEST_EVENT,
  requestPlatformPlanGate,
  requestPlatformPlanGateFromResponse,
  subscribePlatformPlanGateRequests,
} from "./platform-plan-gate-request.js";

const builderPlan = {
  id: "builder",
  name: "Builder",
  description: "Build custom agents and platform resources.",
  monthlyPrice: 24,
  includedUsageUsd: 5,
  selfServe: true,
  features: ["Custom agents", "Projects", "API access"],
};

describe("PlatformPlanGateModal", () => {
  it("renders catalog plan data and routes the primary action", () => {
    const onPrimaryAction = vi.fn();
    render(
      <PlatformPlanGateModal
        open
        featureName="custom agents"
        requiredPlan={builderPlan}
        currentPlanName="Sandbox"
        onClose={() => {}}
        onPrimaryAction={onPrimaryAction}
      />,
    );

    expect(screen.getByText("Unlock custom agents")).toBeTruthy();
    expect(screen.getByText("$24 / month")).toBeTruthy();
    expect(screen.getByText("Current organization plan:")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Upgrade to Builder" }));
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it("routes browser requests through one event contract", () => {
    const listener = vi.fn();
    const unsubscribe = subscribePlatformPlanGateRequests(listener);
    expect(requestPlatformPlanGate({
      entitlement: "inference.byo",
      requiredPlan: "team",
    })).toBe(true);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      entitlement: "inference.byo",
      requiredPlan: "team",
      mode: "feature",
    }));
    unsubscribe();
  });

  it("normalizes entitlement and budget responses", () => {
    const events: CustomEvent[] = [];
    const handleEvent = (event: Event) => events.push(event as CustomEvent);
    window.addEventListener(PLATFORM_PLAN_GATE_REQUEST_EVENT, handleEvent);

    expect(requestPlatformPlanGateFromResponse(
      { status: 402 },
      {
        code: "BILLING_ENTITLEMENT_REQUIRED",
        entitlement: "squads.use",
        requiredPlan: "team",
        featureName: "agent squads",
      },
    )).toBe(true);
    expect(events.at(-1)?.detail).toEqual(expect.objectContaining({
      mode: "feature",
      entitlement: "squads.use",
      requiredPlan: "team",
      featureName: "agent squads",
    }));

    expect(requestPlatformPlanGateFromResponse(
      { status: 402 },
      { error: "Insufficient Budget" },
    )).toBe(true);
    expect(events.at(-1)?.detail).toEqual(expect.objectContaining({
      mode: "budget",
    }));

    window.removeEventListener(PLATFORM_PLAN_GATE_REQUEST_EVENT, handleEvent);
  });
});
