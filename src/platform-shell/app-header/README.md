# App Header

Application-shell ownership for the persistent top navigation and its overlays.

- `client/components/app-header.mjs` owns the App Header controls and layout.
- `client/components/breadcrumb-bar.mjs` owns breadcrumb normalization, icons, and navigation.
- `client/components/account-menu.mjs` owns the Account Menu opened from the profile button.
- `client/components/notifications-popup.mjs` owns the shell-level Notifications Popup UI.
- `client/components/search-modal.mjs` owns the global Search Modal UI.
- `client/shell` owns shared overlay state, refs, navigation, and lifecycle behavior.
- `client/runtime` owns search result projection over host-provided thread and file data.
- `client/styles` owns the App Header and overlay presentation.

Feature services continue to own their data and actions. Configure Home, for example, owns notification loading and mutations while App Header owns their global presentation.
