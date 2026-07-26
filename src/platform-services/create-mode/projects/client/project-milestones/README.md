# Project Milestones

This project-scoped module renders milestone delivery state on the project home page.

The runtime fragment:

- reads the canonical project `releases` collection;
- derives ticket completion from loaded project tasks, with release aggregates as a fallback;
- exposes milestone status, dates, progress, and success-criteria coverage;
- delegates create and edit behavior to the existing milestone composer.

Milestones remain the single source of truth for delivery targets and success criteria. This module does not introduce a second milestone state path.
