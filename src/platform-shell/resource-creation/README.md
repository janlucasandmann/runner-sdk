# Resource Creation

Resource creation is a shell-owned overlay so callers can open creation flows
without changing the active page. The shell stores a typed creation request,
exposes navigation-safe open and close actions, and mounts the existing Agent
or Computer controller in creation-only mode.

The resource controllers continue to own their forms and persistence logic.
This module owns only cross-page lifecycle and composition, keeping overview,
home, search, and team pages independent from those implementation details.
