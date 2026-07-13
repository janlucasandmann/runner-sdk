# PlatformDataTable

`PlatformDataTable` is the canonical data-grid surface for the platform UI. Resource overviews, detail lists, access tables, run lists, and operational tables must configure this component instead of implementing headers, rows, sorting, selection, or action menus locally.

## Responsibilities

- Responsive grid columns and alignment
- Controlled or uncontrolled sorting, search, and selection
- Shared search, filter, view, and primary-action toolbar controls
- Keyboard row activation and accessible table semantics
- Portal-based row and context menus, including multi-selection actions
- Loading, error, empty, and no-results states
- Sticky toolbar and column headers
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
  toolbar={{ search: { placeholder: "Search agents" }, showSort: true }}
  getRowActions={(agent) => buildAgentActions(agent)}
  onRowActivate={openAgent}
/>
```

Columns own only resource-specific accessors and cell presentation. Page modules retain data fetching, mutations, navigation, and domain-specific action definitions.

## Exclusions

Markdown-authored tables, SDK output renderers, spreadsheet previews, standalone internal reports, and purely decorative table illustrations are content rather than platform data grids. Direct platform-page exceptions are explicitly allowlisted by `scripts/platform-table-invariants.mjs`; new exceptions should be rare and documented in that script.
