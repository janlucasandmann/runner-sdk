import {
  PlatformComposerSuggestionPopup,
  type PlatformComposerSuggestionPopupPlacement,
  type PlatformComposerSuggestionPopupProps,
} from "../../platform-ui/components/composite/popup/index.js";

export type RunnerComposerSuggestionPopupPlacement =
  PlatformComposerSuggestionPopupPlacement;
export type RunnerComposerSuggestionPopupProps =
  PlatformComposerSuggestionPopupProps;

/** Compatibility export for runner-chat consumers of the centralized popup. */
export const RunnerComposerSuggestionPopup = PlatformComposerSuggestionPopup;
