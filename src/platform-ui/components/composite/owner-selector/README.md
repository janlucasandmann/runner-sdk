# Owner Selector

`PlatformOwnerSelector` is the shared ownership control for platform resources.
It renders the current owner identity, lists eligible organization members, and
requires confirmation before invoking the resource's atomic ownership transfer.

The component owns presentation and confirmation state. Resource services remain
responsible for authorization and persistence through `onTransfer`.
