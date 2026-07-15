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
          if (!threadSearchOpen) {
            return;
          }

          const focusFrame = window.requestAnimationFrame(() => {
            if (threadSearchInputRef.current) {
              threadSearchInputRef.current.focus();
              threadSearchInputRef.current.select();
            }
          });

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              event.preventDefault();
              closeThreadSearch();
            }
          }

          window.addEventListener("keydown", handleKeyDown);
          return () => {
            window.cancelAnimationFrame(focusFrame);
            window.removeEventListener("keydown", handleKeyDown);
          };
        }, [threadSearchOpen]);

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
`;
