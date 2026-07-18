# RunnerChat styles

RunnerChat's editable CSS is an ordered set of feature sources composed by
`scripts/runner-chat-style-sources.mjs`. Production asset generation and the
Vite development runtime consume that same manifest, so the cascade must be
changed there rather than by importing CSS from React modules.

## Ownership

- `../../runner-chat.css`: shell, conversation, turn, and run-summary layout.
- `message-and-attachments.css`: markdown, command staging, task options, and
  composer attachment chips.
- `composer.css`: composer controls and popup surfaces.
- `dialogs-and-file-browser.css`: compatibility workflow dialogs and the file
  browser.
- `../../../platform-ui/components/thread-components/log-boxes/*.css`:
  activity and tool-log presentation.
- `../../../platform-ui/components/thread-components/document-preview/document-preview.css`:
  the document-preview drawer and specialized preview surfaces.
- `../../thread/runner-thread.css`: canonical Thread v2 surfaces.

The manifest order is part of the public visual contract. Keep files below the
architecture line budget, preserve selector scoping, and add new styles to the
smallest owning feature source.
