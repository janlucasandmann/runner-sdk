# Activity Timeline

`PlatformActivityTimeline` renders an ascending audit trail with optional actor
avatars, semantic event icons, trailing status content, rich comment bodies,
persisted one-level replies, clickable entries, and inline composers. The main
composer can accept local file attachments and exposes them to the domain
submit handler without owning persistence.

Domain pages are responsible for converting their audit records into
`PlatformActivityItem` values. This keeps event wording and navigation outside
the presentation component while preserving one timeline and composer design.

Inspector layouts can place compact controls beside the list title through
`titleActions` and wider controls such as search on the far right through
`headerActions`.
