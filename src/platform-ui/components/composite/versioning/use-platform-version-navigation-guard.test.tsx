// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  buildPlatformVersionNavigationGuard,
  usePlatformVersionNavigationGuard,
  type PlatformVersionNavigationGuardRegistrar,
} from "./use-platform-version-navigation-guard.js";

function VersionedResource({
  dirty,
  register,
  onDiscard,
}: {
  dirty: boolean;
  register: PlatformVersionNavigationGuardRegistrar;
  onDiscard: () => void;
}) {
  usePlatformVersionNavigationGuard({
    dirty,
    resourceId: "resource-1",
    resourceName: "Release readiness",
    resourceType: "Test",
    onDiscard,
    onNavigationGuardChange: register,
  });
  return null;
}

describe("usePlatformVersionNavigationGuard", () => {
  it("builds the shared guard copy only for dirty versioned resources", () => {
    expect(buildPlatformVersionNavigationGuard({
      dirty: false,
      resourceType: "Agent",
    })).toBeNull();

    expect(buildPlatformVersionNavigationGuard({
      dirty: true,
      resourceId: "agent-1",
      resourceName: "Researcher",
      resourceType: "Agent",
      onDiscard: vi.fn(),
    })).toMatchObject({
      id: "agent-agent-1-unsaved-version-changes",
      active: true,
      title: "Leave without saving?",
      description: "Your changes to Researcher have not been saved. If you leave now, they will be lost.",
    });
  });

  it("registers, refreshes, and clears the shell guard", () => {
    const register = vi.fn<PlatformVersionNavigationGuardRegistrar>();
    const onDiscard = vi.fn();
    const view = render(
      <VersionedResource dirty register={register} onDiscard={onDiscard} />,
    );

    const activeGuard = register.mock.calls.at(-1)?.[0];
    expect(activeGuard).toMatchObject({
      id: "test-resource-1-unsaved-version-changes",
      active: true,
    });
    activeGuard?.onDiscard();
    expect(onDiscard).toHaveBeenCalledTimes(1);

    view.rerender(
      <VersionedResource dirty={false} register={register} onDiscard={onDiscard} />,
    );
    expect(register.mock.calls.at(-1)?.[0]).toBeNull();

    view.unmount();
    expect(register.mock.calls.at(-1)?.[0]).toBeNull();
  });
});
