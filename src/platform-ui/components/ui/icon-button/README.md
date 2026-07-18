# Platform icon button

`PlatformIconButton` is the shared icon-only action control. Its default `small` size matches the controls in the expanded app-sidebar header: a 28px hit area, 14px icon, 5px radius, white/70 foreground, and white/7.5 hover surface.

Every instance requires an `aria-label`. Use the native `title` prop for a concise visual tooltip when the action is not already obvious from nearby context.

The `compact`, `small`, and `medium` sizes provide 24px, 28px, and 32px controls. Semantic danger styling deliberately does not belong to this primitive; destructive actions should communicate risk in a confirmation flow rather than changing the hover treatment of the toolbar icon.
