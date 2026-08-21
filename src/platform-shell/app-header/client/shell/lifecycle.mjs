export const APP_HEADER_LIFECYCLE_SCRIPT = `        useEffect(() => {
          function handleResourceAccessNavigationChange(event) {
            const detail = event?.detail && typeof event.detail === "object"
              ? event.detail
              : {};
            const sourceId = String(detail.sourceId || "").trim();
            if (!sourceId) return;

            if (detail.open !== true) {
              setResourceAccessNavigationState((current) => (
                current?.sourceId === sourceId ? null : current
              ));
              return;
            }

            const principalKind = detail.principalKind === "system" ? "system" : "team";
            const principalName = String(
              detail.principalName || (principalKind === "system" ? "Access" : "Team")
            ).trim() || (principalKind === "system" ? "Access" : "Team");
            setResourceAccessNavigationState({
              sourceId,
              principalId: String(detail.principalId || "").trim(),
              principalName,
              principalKind,
              principalProfileImageUrl: String(
                detail.principalProfileImageUrl || ""
              ).trim(),
              resourceLabel: String(detail.resourceLabel || "Resource").trim() || "Resource",
              onClose: typeof detail.onClose === "function" ? detail.onClose : null,
            });
          }

          window.addEventListener(
            "platform:resource-access-navigation-change",
            handleResourceAccessNavigationChange
          );
          return () => window.removeEventListener(
            "platform:resource-access-navigation-change",
            handleResourceAccessNavigationChange
          );
        }, []);

        useEffect(() => {
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
