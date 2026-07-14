// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { PlatformSearch } from "./platform-search.js";

afterEach(cleanup);

describe("PlatformSearch", () => {
  it("renders the shared search surface and emits input changes", () => {
    const onChange = vi.fn();
    render(
      <PlatformSearch
        aria-label="Search agents"
        value=""
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("searchbox", { name: "Search agents" });
    expect(input.closest("[data-platform-search='true']")).not.toBeNull();
    expect(input.closest(".platform-search")?.querySelector(".lucide-search")).not.toBeNull();

    fireEvent.change(input, { target: { value: "spark" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("uses the placeholder as its accessible fallback label", () => {
    render(<PlatformSearch placeholder="Search computers" />);

    expect(screen.getByRole("searchbox", { name: "Search computers" })).not.toBeNull();
  });

  it("forwards its input ref and disabled state", () => {
    const ref = createRef<HTMLInputElement>();
    render(<PlatformSearch ref={ref} aria-label="Search" disabled />);

    expect(ref.current).toBe(screen.getByRole("searchbox", { name: "Search" }));
    expect(ref.current?.disabled).toBe(true);
    expect(ref.current?.closest(".platform-search")?.classList.contains("is-disabled")).toBe(true);
  });
});
