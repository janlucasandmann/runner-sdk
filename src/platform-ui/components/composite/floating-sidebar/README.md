# Floating sidebar

`PlatformFloatingSidebar` is the shared shell for application sidebars that slide in from the right. It owns mounting and exit transitions, an app-style header with a required close action, keyboard dismissal, optional portal rendering, sizing, and the standard translucent surface.

Domain components should provide only their body, optional header actions, and optional footer. Use a page-local portal target when the sidebar should align with a platform content shell.
