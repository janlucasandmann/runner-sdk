export const APP_HEADER_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (accountMenuAnimationTimerRef.current !== null) {
            window.clearTimeout(accountMenuAnimationTimerRef.current);
            accountMenuAnimationTimerRef.current = null;
          }

          if (accountMenuOpen) {
            setRenderedAccountMenu(true);
            setAccountMenuPhase("enter");
            accountMenuAnimationTimerRef.current = window.setTimeout(() => {
              setAccountMenuPhase("idle");
              accountMenuAnimationTimerRef.current = null;
            }, 180);
            return;
          }

          if (!renderedAccountMenu) {
            setAccountMenuPhase("idle");
            return;
          }

          setAccountMenuPhase("exit");
          accountMenuAnimationTimerRef.current = window.setTimeout(() => {
            setRenderedAccountMenu(false);
            setAccountMenuPhase("idle");
            accountMenuAnimationTimerRef.current = null;
          }, 180);
        }, [accountMenuOpen, renderedAccountMenu]);

        useEffect(() => {
          return () => {
            if (accountMenuAnimationTimerRef.current !== null) {
              window.clearTimeout(accountMenuAnimationTimerRef.current);
            }
          };
        }, []);

        useEffect(() => {
          function handleKeyDown(event) {
            if (!(event.metaKey || event.ctrlKey) || String(event.key || "").toLowerCase() !== "k") {
              return;
            }

            event.preventDefault();
            openThreadSearch();
          }

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
        }, []);

        useEffect(() => {
          const navigationTarget = consumeThreadSearchResultNavigationTarget();
          if (!navigationTarget) {
            return;
          }
          applyPlatformNavigationEntry(navigationTarget);
        }, []);

        useEffect(() => {
          if (threadSearchOpen) {
            return;
          }
          const failedModes = Object.entries(threadSearchResourceErrorByMode)
            .filter(([, error]) => Boolean(String(error || "").trim()))
            .map(([mode]) => mode);
          if (failedModes.length === 0) {
            return;
          }
          failedModes.forEach((mode) => {
            delete threadSearchResourceLoadKeysRef.current[mode];
            delete threadSearchResourceLoadedAtByModeRef.current[mode];
          });
          setThreadSearchResourceErrorByMode({});
        }, [threadSearchOpen, threadSearchResourceErrorByMode]);
`;
