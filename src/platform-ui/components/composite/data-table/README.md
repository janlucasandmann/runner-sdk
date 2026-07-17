# PlatformDataTable

`PlatformDataTable` is the canonical data-grid surface for the platform UI. Resource overviews, detail lists, access tables, run lists, and operational tables must configure this component instead of implementing headers, rows, sorting, selection, or action menus locally.

## Responsibilities

- Responsive grid columns and alignment
- Controlled or uncontrolled sorting, search, and selection
- Optional search, filter, view, leading-control, and primary-action toolbar outside the table surface
- Keyboard row activation and accessible table semantics
- Portal-based row and context menus, including multi-selection actions
- Loading, error, empty, and no-results states
- Persistent, sticky column header and row surface
- Content-sized and available-height layouts
- Controlled or uncontrolled client and server pagination
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

`layout="content"` is the default and grows with its rows. `layout="fill"` uses its intrinsic content height up to a constrained flex parent's remaining height and animates between intrinsic heights as its rendered rows change. Once that maximum is reached, only the row body scrolls; the toolbar, column header, and pagination remain outside the scroll viewport. Every parent in a fill-height chain must provide `min-height: 0`.

`variant="minimalistic-ui"` provides the flat header, borderless rows, expanded row viewport, and compact footer treatment used by resource overview pages. `ResourceOverviewPage` selects this variant by default; pass `variant="default"` in its table configuration when a resource requires the standard framed table.

Passing `pagination={{}}` enables client pagination with 20 rows per page and 10, 20, and 50-row options. Use `value` and `onChange` for controlled state. For server pagination, set `manual: true` and provide `totalCount`. Resource overview pages enable pagination by default; pass `pagination={false}` through their table configuration to opt out.

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
