# Platform Shell

Shell-owned UI belongs here when it coordinates global navigation, account state,
or overlays that sit above individual create, configure, and develop services.

Each shell feature owns its browser fragments, styles, and contract tests in a
dedicated subdirectory. Product pages remain under `src/platform-services`.

- `app-header` owns the App Header, Breadcrumb Bar, Account Menu, Notifications Popup, and global Search Modal.
- `app-sidebar` owns expanded and collapsed navigation, platform mode selection, thread-list UI, and sidebar layout styles.
- `settings-modal` owns the settings experience opened from the Account Menu.
