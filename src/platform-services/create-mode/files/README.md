# Files service

`src/platform-services/create-mode/files` is the ownership boundary for the
platform Files experience. `apps/platform/server/index.mjs` composes the service, but no
longer owns its browser, preview/editor behavior, file-domain model, styles, or
HTTP routing.

## Structure

- `client/domain/` owns file-kind and MIME projection, environment inventory
  normalization and tree construction, download/ZIP helpers, list URLs, and
  protected filename behavior.
- `client/components/` owns the reusable file icon and code-editor preview
  components used by Files and explicit host integrations.
- `client/page/` contains the Files React surface, split into image overlays,
  shell and workspace state, preview actions, sharing actions, filesystem
  actions, entry views, dialogs, and the final browser view.
- `client/styles/` contains cascade-preserving foundation, toolbar, content,
  preview, chat, editor, and context-menu fragments.
- `server/routes.mjs` owns environment, server, and attachment file route
  matching and upstream path translation.
- `server/html-preview.mjs` owns authenticated HTML-file loading and base-URL
  rewriting for relative workspace assets.
- `server/index.mjs` exposes the Files service factory consumed by the host.

## Host boundary

`apps/platform/server/index.mjs` remains the composition root. It provides authentication and
upstream transport adapters, mounts Files in shared navigation, supplies
environment and agent collections, and connects explicit integrations such as
Projects, Teams, Threads, and the document preview host. File browsing,
mutation, transfer, image editing, preview composition, and HTTP route matching
belong in this directory.

The browser application is currently emitted as one inline module. Files
client modules therefore expose compiled script and style fragments in their
legacy evaluation and cascade positions. This keeps runtime behavior stable
while establishing a clean migration path to a bundled standalone surface.

