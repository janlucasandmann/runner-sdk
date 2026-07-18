// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Monitor } from "lucide-react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformSearch } from "./platform-search.js";

afterEach(cleanup);

describe("PlatformSearch", () => {
  it("uses the shared 300px width contract", () => {
    const css = readFileSync(
      path.join(process.cwd(), "src/platform-ui/components/ui/search/search.css"),
      "utf8",
    );

    expect(css).toMatch(/\.platform-search\s*\{[\s\S]*width:\s*300px;[\s\S]*min-width:\s*300px;/);
  });

  it("renders the shared search surface and emits input changes", () => {
    const onChange = vi.fn();
    render(<PlatformSearch aria-label="Search agents" value="" onChange={onChange} />);

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

  it("supports a custom Lucide icon without changing the input contract", () => {
    render(<PlatformSearch icon={Monitor} placeholder="New Computer" />);

    const search = screen.getByRole("searchbox", { name: "New Computer" });
    expect(search.closest(".platform-search")?.querySelector(".lucide-monitor")).not.toBeNull();
    expect(search.closest(".platform-search")?.querySelector(".lucide-search")).toBeNull();
  });

  it("forwards its input ref and disabled state", () => {
    const ref = createRef<HTMLInputElement>();
    render(<PlatformSearch ref={ref} aria-label="Search" disabled />);

    expect(ref.current).toBe(screen.getByRole("searchbox", { name: "Search" }));
    expect(ref.current?.disabled).toBe(true);
    expect(ref.current?.closest(".platform-search")?.classList.contains("is-disabled")).toBe(true);
  });
});
