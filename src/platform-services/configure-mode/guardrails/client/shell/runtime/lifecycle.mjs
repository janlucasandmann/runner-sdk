export const GUARDRAILS_APP_LIFECYCLE_SCRIPT_BEFORE_EVALUATIONS = `        useEffect(() => () => {
          guardrailPersistTimersRef.current.forEach((timer) => {
            if (typeof window !== "undefined") {
              window.clearTimeout(timer);
            } else {
              clearTimeout(timer);
            }
          });
          guardrailPersistTimersRef.current.clear();
        }, []);
        useEffect(() => {
          if (!guardrailPublishMenuOpen) {
            return undefined;
          }

          function handleGuardrailPublishMenuPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !guardrailPublishMenuRef.current || guardrailPublishMenuRef.current.contains(target)) {
              return;
            }
            setGuardrailPublishMenuOpen(false);
          }

          function handleGuardrailPublishMenuEscape(event) {
            if (event.key === "Escape") {
              setGuardrailPublishMenuOpen(false);
            }
          }

          document.addEventListener("mousedown", handleGuardrailPublishMenuPointerDown);
          window.addEventListener("keydown", handleGuardrailPublishMenuEscape);
          return () => {
            document.removeEventListener("mousedown", handleGuardrailPublishMenuPointerDown);
            window.removeEventListener("keydown", handleGuardrailPublishMenuEscape);
          };
        }, [guardrailPublishMenuOpen]);
        useEffect(() => {
          if (!guardrailSetActionMenuId && !guardrailDetailActionsMenuOpen) {
            return undefined;
          }

          function handleGuardrailActionsPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target) {
              return;
            }
            const activeRowShell = guardrailSetActionMenuRef.current;
            const detailShell = guardrailDetailActionsMenuRef.current;
            if (
              (activeRowShell && activeRowShell.contains(target))
              || (detailShell && detailShell.contains(target))
            ) {
              return;
            }
            setGuardrailSetActionMenuId("");
            setGuardrailDetailActionsMenuOpen(false);
          }

          function handleGuardrailActionsEscape(event) {
            if (event.key !== "Escape") {
              return;
            }
            setGuardrailSetActionMenuId("");
            setGuardrailDetailActionsMenuOpen(false);
          }

          document.addEventListener("mousedown", handleGuardrailActionsPointerDown);
          window.addEventListener("keydown", handleGuardrailActionsEscape);
          return () => {
            document.removeEventListener("mousedown", handleGuardrailActionsPointerDown);
            window.removeEventListener("keydown", handleGuardrailActionsEscape);
          };
        }, [guardrailDetailActionsMenuOpen, guardrailSetActionMenuId]);
        useEffect(() => {
          if (selectedGuardrailSetId && allGuardrailSets.some((set) => set.id === selectedGuardrailSetId)) {
            return;
          }
          setSelectedGuardrailSetId(allGuardrailSets[0]?.id || "");
        }, [allGuardrailSets, selectedGuardrailSetId]);
        useEffect(() => {
          const normalizedSetId = String(selectedGuardrailSetId || "").trim();
          const needsVersionSurface = guardrailVersionsSidebarOpen
            || guardrailPublishMenuOpen
            || guardrailVersionsHeaderMenuOpen
            || Boolean(guardrailVersionChangesState)
            || Boolean(guardrailVersionModal)
            || Boolean(openGuardrailVersionMenuId);
          if (activePage !== "guardrails" || guardrailsPageMode !== "detail" || !normalizedSetId || !needsVersionSurface) {
            return undefined;
          }
          if (guardrailDetailsLoadedRef.current.has(normalizedSetId)) {
            return undefined;
          }
          const selectedSet = allGuardrailSets.find((set) => set?.id === normalizedSetId) || null;
          if (!selectedSet || isPlaygroundDefaultGuardrailSet(selectedSet)) {
            return undefined;
          }
          let cancelled = false;
          void reloadBackendGuardrailSet(normalizedSetId, {
            select: false,
            rememberBaseline: !guardrailVersionDraftTouchedRef.current,
          }).catch((error) => {
            if (cancelled) return;
            setGuardrailsBackendSyncState({ status: "error", error: error?.message || String(error) });
          });
          return () => {
            cancelled = true;
          };
        }, [
          activePage,
          allGuardrailSets,
          guardrailPublishMenuOpen,
          guardrailVersionChangesState,
          guardrailVersionModal,
          guardrailVersionsHeaderMenuOpen,
          guardrailVersionsSidebarOpen,
          guardrailsPageMode,
          openGuardrailVersionMenuId,
          selectedGuardrailSetId,
        ]);
        useEffect(() => {
          const isGuardrailDetailContext = activePage === "guardrails" && guardrailsPageMode === "detail";
          if (isGuardrailDetailContext) {
            return;
          }
          const hasOpenGuardrailVersionSurface = guardrailVersionsSidebarOpen
            || guardrailPublishMenuOpen
            || guardrailVersionsHeaderMenuOpen
            || guardrailDetailActionsMenuOpen
            || Boolean(guardrailVersionChangesState)
            || Boolean(openGuardrailVersionMenuId)
            || Boolean(guardrailVersionModal);
          if (!hasOpenGuardrailVersionSurface) {
            return;
          }
          resetGuardrailVersionTransientState();
        }, [
          activePage,
          guardrailDetailActionsMenuOpen,
          guardrailPublishMenuOpen,
          guardrailVersionChangesState,
          guardrailVersionModal,
          guardrailVersionsHeaderMenuOpen,
          guardrailVersionsSidebarOpen,
          guardrailsPageMode,
          openGuardrailVersionMenuId,
        ]);
        useEffect(() => {
          if (activePage === "guardrails" || !guardrailSetActionMenuId) {
            return;
          }
          setGuardrailSetActionMenuId("");
        }, [activePage, guardrailSetActionMenuId]);
`;

export const GUARDRAILS_APP_LIFECYCLE_SCRIPT_BETWEEN_EVALUATIONS_AND_FINE_TUNING = ``;

export const GUARDRAILS_APP_LIFECYCLE_SCRIPT_BEFORE_FINE_TUNING =
  GUARDRAILS_APP_LIFECYCLE_SCRIPT_BEFORE_EVALUATIONS
  + GUARDRAILS_APP_LIFECYCLE_SCRIPT_BETWEEN_EVALUATIONS_AND_FINE_TUNING;

export const GUARDRAILS_APP_LIFECYCLE_SCRIPT_AFTER_FINE_TUNING = `        useLayoutEffect(() => {
          if (guardrailsPageMode !== "detail") {
            return;
          }
          resizeGuardrailsDescriptionTextarea(guardrailsDescriptionTextareaRef.current);
        }, [allGuardrailSets, guardrailsPageMode, selectedGuardrailSetId]);
        useEffect(() => {
          if (!guardrailsToolbarPopover) return undefined;

          function handleGuardrailsToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !guardrailsToolbarRef.current || guardrailsToolbarRef.current.contains(target)) {
              return;
            }
            setGuardrailsToolbarPopover("");
          }

          document.addEventListener("mousedown", handleGuardrailsToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleGuardrailsToolbarPointerDown);
        }, [guardrailsToolbarPopover]);
`;

export const GUARDRAILS_APP_LIFECYCLE_SCRIPT =
  GUARDRAILS_APP_LIFECYCLE_SCRIPT_BEFORE_FINE_TUNING
  + GUARDRAILS_APP_LIFECYCLE_SCRIPT_AFTER_FINE_TUNING;
