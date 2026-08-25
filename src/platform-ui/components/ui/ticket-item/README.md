<!-- platform-directory-guide:v1 -->

# Ticket item

## Purpose

`PlatformTicketItem` is the shared presentation primitive for project tickets.

- `list` preserves the backlog row contract and is used in compact ticket lists.
- `card` preserves the board card contract.
- Both variants own the same pointer-positioned minimal action menu. Cards open
  it on right click; list rows can additionally opt into click and keyboard
  activation with `openTicketActionMenuOnClick`.
- `appearance="minimalistic-ui"` removes the list surface, border, blur, and
  horizontal padding for tickets nested inside an existing container.

The component owns ticket layout while callers retain domain behavior through
slots for status controls, assignees, actions, priority, and editable titles.
Callers provide domain action rows through `ticketActionMenu`; positioning, collision
handling, outside-click dismissal, and Escape dismissal stay centralized here.

The legacy class aliases are intentional while project surfaces move onto this
primitive; they preserve the established backlog and board presentation without
duplicating those styles inside each consuming page.

Import the component stylesheet through
`@computer-agents/platform/platform-ui/components/ui/ticket-item/styles.css`
when consuming the primitive outside the aggregate platform page styles.

## Working in this directory

Keep ticket layout domain-neutral. Resource fetching, status mutations, drag
ordering, and navigation remain caller responsibilities and enter through the
component's slots and native element props.

## Verification

Run the focused component test from the repository root:

```bash
npx vitest run src/platform-ui/components/ui/ticket-item
```

## Related documentation

- [UI component guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
