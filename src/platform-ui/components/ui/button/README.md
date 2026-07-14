# Platform button

`PlatformButton` owns the shared action-button contract used across the platform. The primary variant follows the blue New Issue action; the secondary variant follows the transparent Mission Control action.

Use `PlatformPrimaryButton` and `PlatformSecondaryButton` when the action hierarchy is static. Use `PlatformButton` when the variant is selected dynamically.

Available sizes are `compact`, `small` (default), `medium`, and `large`. Native button props, refs, custom width/min-width, full-width layout, disabled state, and active state are supported.

Import `@computer-agents/runner-web-sdk/platform-ui/components/ui/button/styles.css` once in applications that consume the button package directly. RunnerChat and the platform demo bundle the stylesheet automatically.
