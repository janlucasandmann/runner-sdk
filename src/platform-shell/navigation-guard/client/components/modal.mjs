export const PLATFORM_NAVIGATION_GUARD_MODAL_SCRIPT = `        function renderPlatformNavigationGuardModal() {
          return React.createElement(PlatformUnsavedChangesModal, {
            open: platformNavigationGuardDialog.open,
            title: platformNavigationGuardDialog.title,
            description: platformNavigationGuardDialog.description,
            onStay: dismissPlatformNavigationGuard,
            onLeave: confirmPlatformNavigationGuard,
          });
        }
`;
