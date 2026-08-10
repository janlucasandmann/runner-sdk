<!-- platform-directory-guide:v1 -->

# PlatformDataTable

## Purpose

`PlatformDataTable` is the canonical data-grid surface for the platform UI. Resource overviews, detail lists, access tables, run lists, and operational tables must configure this component instead of implementing headers, rows, sorting, selection, or action menus locally.

## Responsibilities

- Responsive grid columns and alignment
- Controlled or uncontrolled sorting, search, and selection
- Anchored `Shift+ArrowUp` and `Shift+ArrowDown` range selection that expands and contracts in visible row order
- Optional search, filter, view, leading-control, and primary-action toolbar outside the table surface
- Keyboard row activation and accessible table semantics
- Portal-based row and context menus, including multi-selection actions
- Loading, error, empty, and no-results states
- Persistent, sticky column header and row surface
- Content-sized and available-height layouts
- Controlled or uncontrolled client and server pagination
- Optional bottom-scroll incremental loading with the shared loading indicator
- Ordered, controlled or uncontrolled expandable row groups with labels, indicators, and counts
- Expandable detail rows

## Usage

```tsx
<PlatformDataTable
  rows={agents}
  getRowId={(agent) => agent.id}
  ariaLabel="Agents"
  columns={columns}
  sorting={{ value: sort, onChange: setSort }}
  selection={{ enabled: true, value: selectedIds, onChange: handleSelection }}
  toolbar={{
    title: "All Agents",
    controlsLeading: <PlatformSecondaryButton>Import</PlatformSecondaryButton>,
    search: { placeholder: "Search agents" },
    filters,
  }}
  layout="fill"
  pagination={{ defaultValue: { pageSize: 20 } }}
  getRowActions={(agent) => buildAgentActions(agent)}
  onRowActivate={openAgent}
/>
```

Use `controlsLeading` for secondary actions that must sit immediately before the search field. Use `leading` for navigation or mode controls that belong at the left edge, and `primaryAction` for the trailing primary command.
Set `primaryAction.icon` to `null` when the command intentionally has no icon;
leaving it undefined retains the default plus icon.

`layout="content"` is the default and grows with its rows. `layout="fill"` uses its intrinsic content height up to a constrained flex parent's remaining height and animates between intrinsic heights as its rendered rows change. Once that maximum is reached, only the row body scrolls; the toolbar, column header, and pagination remain outside the scroll viewport. Every parent in a fill-height chain must provide `min-height: 0`.

`variant="minimalistic-ui"` provides the flat header, borderless rows, expanded row viewport, and compact footer treatment used by resource overview pages. `ResourceOverviewPage` selects this variant by default; pass `variant="default"` in its table configuration when a resource requires the standard framed table.

`variant="catalog-ui"` is the full-screen catalog treatment: it bleeds the table surface and divider lines through the standard 24px page gutter, then restores that gutter inside the toolbar and adds the table's 8px column inset so controls and cell content stay aligned. It also provides a stacked toolbar with a full-width search field, flat surfaces, and roomier rows for logo-and-description identities. Its host must allow horizontal overflow; `ResourceOverviewPage` does this automatically for catalog tables. Override `--platform-data-table-catalog-viewport-gutter` only when a full-screen host uses a different page gutter.

Use `rowGrouping` when one table needs ordered, collapsible sections without changing its columns or toolbar. Configure the section order in `groups`, return a group ID from `getGroupId`, and use `expandedIds` with `onExpandedChange` when expansion state must be controlled. Groups are expanded by default unless `defaultExpanded` is `false`.

Passing `pagination={{}}` enables client pagination with 20 rows per page and 10, 20, and 50-row options. Use `value` and `onChange` for controlled state. For server pagination, set `manual: true` and provide `totalCount`. Resource overview pages enable pagination by default; pass `pagination={false}` through their table configuration to opt out.

Use `incrementalLoading` for cursor or offset-based lists that append rows when the table body reaches its bottom. Keep the data request in the page module; the table owns scroll detection, duplicate request suppression, and the shared loading presentation.

For embedded section tables, omit `toolbar`, set `pagination={false}`, and leave `footer` undefined. This keeps the persistent column-title row and data rows while removing the overview control strip and bottom chrome:

```tsx
<PlatformDataTable
  rows={permissions}
  columns={columns}
  getRowId={(permission) => permission.id}
  ariaLabel="Ring 1 permissions"
  variant="minimalistic-ui"
  surface="plain"
  sticky={false}
  pagination={false}
/>
```

Columns own only resource-specific accessors and cell presentation. Page modules retain data fetching, mutations, navigation, and domain-specific action definitions.

## Exclusions

Markdown-authored tables, SDK output renderers, spreadsheet previews, standalone internal reports, and purely decorative table illustrations are content rather than platform data grids. Direct platform-page exceptions are explicitly allowlisted by `scripts/platform-table-invariants.mjs`; new exceptions should be rare and documented in that script.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform-table-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
