// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  PlatformButton,
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "./platform-button.js";

afterEach(cleanup);

describe("PlatformButton", () => {
  it("defaults to the secondary small button contract", () => {
    render(<PlatformButton>Mission Control</PlatformButton>);

    const button = screen.getByRole("button", { name: "Mission Control" });
    expect(button.classList.contains("platform-button")).toBe(true);
    expect(button.classList.contains("is-secondary")).toBe(true);
    expect(button.classList.contains("is-size-small")).toBe(true);
    expect(button.getAttribute("type")).toBe("button");
  });

  it("provides explicit primary and secondary convenience components", () => {
    render(
      <>
        <PlatformPrimaryButton>New Issue</PlatformPrimaryButton>
        <PlatformSecondaryButton>Mission Control</PlatformSecondaryButton>
      </>
    );

    expect(screen.getByRole("button", { name: "New Issue" }).dataset.platformButtonVariant).toBe("primary");
    expect(screen.getByRole("button", { name: "Mission Control" }).dataset.platformButtonVariant).toBe("secondary");
  });

  it("supports sizing, width, active state, and native button attributes", () => {
    render(
      <PlatformButton
        variant="primary"
        size="large"
        fullWidth
        active
        width="320px"
        minWidth={180}
        disabled
      >
        Save
      </PlatformButton>
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button.classList.contains("is-size-large")).toBe(true);
    expect(button.classList.contains("is-full-width")).toBe(true);
    expect(button.classList.contains("is-active")).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.style.width).toBe("320px");
    expect(button.style.minWidth).toBe("180px");
  });
});
