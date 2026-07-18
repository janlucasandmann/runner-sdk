# Shared thread presentation

This directory owns presentation helpers used by multiple thread features:
entry animation metadata, deferred media mounting, and grounded Markdown
rendering.

Runner compatibility entry points under `src/react` re-export these
implementations. New platform UI code must import this owned module directly.
