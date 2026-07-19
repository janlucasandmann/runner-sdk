<!-- platform-directory-guide:v1 -->

# Files service

## Purpose

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

The single platform document still composes ordered Files script and style
fragments in their legacy evaluation and cascade positions. This keeps runtime
behavior stable while typed modules replace those fragments incrementally.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run files-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
