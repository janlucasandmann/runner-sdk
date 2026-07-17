import type { RunnerQuotedSelectionSource } from "./turn-types.js";

export function selectionNodeToElement(node: Node | null): Element | null {
  if (!node) return null;
  return node instanceof Element ? node : node.parentElement;
}

export function findQuotedSelectionContainer(
  node: Node | null,
  root: HTMLElement | null,
): HTMLElement | null {
  const element = selectionNodeToElement(node);
  if (!element || !root) {
    return null;
  }
  const container = element.closest(
    ".agent-step-content, .tb-turn-summary, .tb-btw-turn-response",
  );
  if (!container || !root.contains(container)) {
    return null;
  }
  if (
    element.closest(
      ".tb-user-turn-shell, .tb-input-shell, .tb-selection-popup",
    )
  ) {
    return null;
  }
  return container as HTMLElement;
}

export function getQuotedSelectionSourceType(
  container: HTMLElement,
): RunnerQuotedSelectionSource {
  return container.matches(".tb-turn-summary, .tb-btw-turn-response")
    ? "run_summary"
    : "working_log";
}
