# Instructions editor

`PlatformInstructionsEditor` is the canonical instruction-writing surface for agents and other configurable resources. It owns:

- Markdown preview rendering and safe underline compatibility
- Bold, italic, underline, list, ordered-list, code, and link controls
- Undo and redo history
- Keyboard shortcuts
- Edit/preview behavior and textarea sizing
- Read-only presentation

Consumers provide a controlled value and persist changes through `onChange`; they must not duplicate Markdown toolbar or renderer logic.
