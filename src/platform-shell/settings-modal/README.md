# Settings Modal

The account settings experience is a shell overlay rather than a Configure
page. This module owns its modal lifecycle, navigation contract, UI renderer,
and modal-specific styles.

The settings surface still accepts embedded sections used by organization
billing and inference. Those callers render the shared surface directly while
the profile menu opens it through the central `PlatformModal` component.

