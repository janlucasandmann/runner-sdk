export const PLATFORM_NAVIGATION_GUARD_LIFECYCLE_SCRIPT = `        useEffect(() => {
          function handlePlatformNavigationBeforeUnload(event) {
            if (!platformNavigationGuardRef.current?.active) {
              return;
            }
            event.preventDefault();
            event.returnValue = "";
          }

          window.addEventListener("beforeunload", handlePlatformNavigationBeforeUnload);
          return () => window.removeEventListener("beforeunload", handlePlatformNavigationBeforeUnload);
        }, []);
`;
