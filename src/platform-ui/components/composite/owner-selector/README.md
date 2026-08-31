<!-- platform-directory-guide:v1 -->

# Owner selector

## Purpose

`PlatformOwnerSelector` is the shared ownership control for platform resources.
It renders the current owner identity, combines resource-specific candidates
with the active organization member directory, and requires confirmation before
invoking the resource's atomic ownership transfer.

The organization directory is loaded in the background as soon as the selector
mounts and is cached and request-deduplicated by its provider. The popup always
starts with the centralized search row and presents compact profile images with
user names only; email addresses remain identity-matching data and are not
rendered as option subtitles or labels.

## Working in this directory

Keep ownership authorization and persistence in the resource service and pass
the mutation through `onTransfer`. This directory owns identity normalization,
organization-directory merging, search, selection, and confirmation behavior.
Update the colocated tests whenever loading, identity presentation, or transfer
semantics change.

## Verification

```bash
npx vitest run src/platform-ui/components/composite/owner-selector
npm run platform-component-invariants
```

## Related documentation

- [Resource detail sidebars](../resource-detail-sidebar/README.md)
- [Resource Settings page](../../../pages/settings/README.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
