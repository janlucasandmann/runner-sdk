export const PLATFORM_NAVIGATION_GUARD_NAVIGATION_SCRIPT = `        const registerPlatformNavigationGuard = useCallback((guard) => {
          const normalizedGuard = guard && guard.active !== false
            ? {
                id: String(guard.id || "navigation-guard").trim() || "navigation-guard",
                active: true,
                title: String(guard.title || "Unsaved changes").trim() || "Unsaved changes",
                description: String(
                  guard.description
                  || "Your changes have not been saved. If you leave now, they will be lost."
                ).trim(),
                onDiscard: typeof guard.onDiscard === "function" ? guard.onDiscard : null,
              }
            : null;
          platformNavigationGuardRef.current = normalizedGuard;
          if (normalizedGuard) {
            return;
          }
          platformNavigationPendingActionRef.current = null;
          setPlatformNavigationGuardDialog((current) => current.open
            ? { ...current, open: false }
            : current
          );
        }, []);

        const requestPlatformNavigation = useCallback((continuation, options = {}) => {
          if (typeof continuation !== "function") {
            return false;
          }
          const activeGuard = platformNavigationGuardRef.current;
          if (platformNavigationGuardBypassRef.current || !activeGuard?.active) {
            continuation();
            return true;
          }
          platformNavigationPendingActionRef.current = {
            continuation,
            onCancel: typeof options?.onCancel === "function" ? options.onCancel : null,
            onDiscard: typeof activeGuard.onDiscard === "function" ? activeGuard.onDiscard : null,
          };
          setPlatformNavigationGuardDialog({
            open: true,
            title: activeGuard.title || "Unsaved changes",
            description: activeGuard.description
              || "Your changes have not been saved. If you leave now, they will be lost.",
          });
          return false;
        }, []);

        const requestPlatformStateChange = useCallback((stateRef, commit, nextValue) => {
          if (!stateRef || typeof commit !== "function") {
            return false;
          }
          const currentValue = stateRef.current;
          const resolvedValue = typeof nextValue === "function"
            ? nextValue(currentValue)
            : nextValue;
          if (Object.is(currentValue, resolvedValue)) {
            return true;
          }
          return requestPlatformNavigation(() => {
            stateRef.current = resolvedValue;
            commit(resolvedValue);
          });
        }, [requestPlatformNavigation]);

        const dismissPlatformNavigationGuard = useCallback(() => {
          const pendingAction = platformNavigationPendingActionRef.current;
          platformNavigationPendingActionRef.current = null;
          setPlatformNavigationGuardDialog((current) => current.open
            ? { ...current, open: false }
            : current
          );
          if (typeof pendingAction?.onCancel === "function") {
            pendingAction.onCancel();
          }
        }, []);

        const confirmPlatformNavigationGuard = useCallback(() => {
          const pendingAction = platformNavigationPendingActionRef.current;
          platformNavigationPendingActionRef.current = null;
          setPlatformNavigationGuardDialog((current) => current.open
            ? { ...current, open: false }
            : current
          );
          if (typeof pendingAction?.continuation !== "function") {
            return;
          }
          platformNavigationGuardBypassRef.current = true;
          try {
            if (typeof pendingAction.onDiscard === "function") {
              pendingAction.onDiscard();
            }
            pendingAction.continuation();
          } finally {
            window.queueMicrotask(() => {
              platformNavigationGuardBypassRef.current = false;
            });
          }
        }, []);
`;
