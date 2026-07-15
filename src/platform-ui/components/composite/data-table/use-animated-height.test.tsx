// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAnimatedHeight } from "./use-animated-height.js";

function AnimatedHeightFixture({
  enabled = true,
  height,
  heightKey,
}: {
  enabled?: boolean;
  height: number;
  heightKey: string;
}) {
  const ref = useAnimatedHeight<HTMLDivElement>({
    enabled,
    changeKey: heightKey,
  });
  return <div ref={ref} data-test-height={height} />;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
});

describe("useAnimatedHeight", () => {
  it("animates from the previous intrinsic height to the next height", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function getRect(this: HTMLElement) {
      const height = Number(this.dataset.testHeight || 0);
      return {
        x: 0,
        y: 0,
        top: 0,
        right: 100,
        bottom: height,
        left: 0,
        width: 100,
        height,
        toJSON: () => ({}),
      };
    });
    const cancel = vi.fn();
    const animate = vi.fn(() => ({
      cancel,
      oncancel: null,
      onfinish: null,
    } as unknown as Animation));
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: animate,
    });

    const { rerender } = render(
      <AnimatedHeightFixture height={140} heightKey="agents" />,
    );
    expect(animate).not.toHaveBeenCalled();

    rerender(<AnimatedHeightFixture height={240} heightKey="squads" />);

    expect(animate).toHaveBeenCalledWith(
      [{ height: "140px" }, { height: "240px" }],
      {
        duration: 180,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "none",
      },
    );
  });

  it("does not animate when the behavior is disabled", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function getRect(this: HTMLElement) {
      const height = Number(this.dataset.testHeight || 0);
      return {
        x: 0,
        y: 0,
        top: 0,
        right: 100,
        bottom: height,
        left: 0,
        width: 100,
        height,
        toJSON: () => ({}),
      };
    });
    const animate = vi.fn(() => ({ cancel: vi.fn() } as unknown as Animation));
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: animate,
    });

    const { rerender } = render(
      <AnimatedHeightFixture enabled={false} height={140} heightKey="agents" />,
    );
    rerender(<AnimatedHeightFixture enabled={false} height={240} heightKey="squads" />);

    expect(animate).not.toHaveBeenCalled();
  });
});
