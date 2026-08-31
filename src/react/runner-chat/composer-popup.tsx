import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import {
  PlatformPopupSurface,
  renderPlatformAnchoredPopupPortal,
  usePlatformAnchoredPopupStyle,
  type PlatformPopupSurfaceProps,
} from "../../platform-ui/components/composite/popup/index.js";

export const POPUP_ANIMATION_DURATION_MS = 180;
export const RUNNER_COMPOSER_POPUP_OPEN_EVENT =
  "tb-runner-composer-popup-open";

export type InputPopupId =
  | "main"
  | "context"
  | "skills"
  | "agent"
  | "agent-reasoning"
  | "environment"
  | "organization"
  | "github"
  | "notion"
  | "google-drive"
  | "one-drive"
  | "schedule"
  | "attach-files";

export type MainPopupRenderId =
  | "main"
  | "context"
  | "agent"
  | "environment"
  | "organization";
export type SidePopupRenderId = Exclude<InputPopupId, MainPopupRenderId>;
export type PopupAnimationPhase = "idle" | "enter" | "exit";
export type SidePopupExitDirection = "left" | "down";
export type ComposerPopupPlacement =
  | "above-start"
  | "above-end"
  | "below-start"
  | "side-end";
export type ComposerPopupAnchorRef<T extends HTMLElement = HTMLElement> = {
  current: T | null;
};

export interface ComposerAnchoredPopupOptions {
  open: boolean;
  anchorRef: ComposerPopupAnchorRef;
  verticalAnchorRef?: ComposerPopupAnchorRef;
  popupRef: ComposerPopupAnchorRef;
  placement?: ComposerPopupPlacement;
  gap?: number;
  viewportPadding?: number;
  offsetX?: number;
  offsetY?: number;
  matchAnchorWidth?: boolean;
}

export type RunnerComposerPopupSurfaceProps = Omit<
  PlatformPopupSurfaceProps,
  "variant"
>;

/**
 * Canonical surface for every popup owned by the task-input composer.
 *
 * Composer features still own their content and stacked-popup state, while
 * presentation is locked to the same centralized minimal popup variant used
 * by project detail selectors.
 */
export const RunnerComposerPopupSurface = forwardRef<
  HTMLDivElement,
  RunnerComposerPopupSurfaceProps
>(function RunnerComposerPopupSurface(props, ref: Ref<HTMLDivElement>) {
  return <PlatformPopupSurface {...props} ref={ref} variant="minimal" />;
});

export function emitRunnerComposerPopupOpen(sourceId: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RUNNER_COMPOSER_POPUP_OPEN_EVENT, {
    detail: { sourceId },
  }));
}

export function getRunnerComposerPopupEventSource(event: Event): string {
  if (!(event instanceof CustomEvent)) return "";
  return typeof event.detail?.sourceId === "string"
    ? event.detail.sourceId
    : "";
}

export function useComposerAnchoredPopupStyle(
  options: ComposerAnchoredPopupOptions,
): CSSProperties | null {
  return usePlatformAnchoredPopupStyle(options);
}

export function renderComposerPopupPortal(
  content: ReactNode,
  style: CSSProperties | null,
): ReactNode {
  return renderPlatformAnchoredPopupPortal(content, style);
}

export function isPlusPopupId(
  popup: InputPopupId | null,
): popup is Exclude<
  InputPopupId,
  "context" | "agent" | "agent-reasoning" | "environment" | "organization"
> {
  return popup === "main"
    || popup === "skills"
    || popup === "github"
    || popup === "notion"
    || popup === "google-drive"
    || popup === "one-drive"
    || popup === "schedule"
    || popup === "attach-files";
}

export function getMainPopupRenderId(
  popup: InputPopupId | null,
): MainPopupRenderId | null {
  if (popup === "agent-reasoning") return "agent";
  if (
    popup === "context"
    || popup === "agent"
    || popup === "environment"
    || popup === "organization"
  ) {
    return popup;
  }
  return isPlusPopupId(popup) ? "main" : null;
}

export function getSidePopupRenderId(
  popup: InputPopupId | null,
): SidePopupRenderId | null {
  if (
    !popup
    || popup === "main"
    || popup === "context"
    || popup === "agent"
    || popup === "environment"
    || popup === "organization"
  ) {
    return null;
  }
  return popup;
}
