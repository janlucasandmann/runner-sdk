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
          if (!guardrailSetActionMenuId) {
            return undefined;
          }

          function handleGuardrailActionsPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target) {
              return;
            }
            const activeRowShell = guardrailSetActionMenuRef.current;
            if (activeRowShell && activeRowShell.contains(target)) {
              return;
            }
            setGuardrailSetActionMenuId("");
          }

          function handleGuardrailActionsEscape(event) {
            if (event.key !== "Escape") {
              return;
            }
            setGuardrailSetActionMenuId("");
          }

          document.addEventListener("mousedown", handleGuardrailActionsPointerDown);
          window.addEventListener("keydown", handleGuardrailActionsEscape);
          return () => {
            document.removeEventListener("mousedown", handleGuardrailActionsPointerDown);
            window.removeEventListener("keydown", handleGuardrailActionsEscape);
          };
        }, [guardrailSetActionMenuId]);
        useEffect(() => {
          if (selectedGuardrailSetId && allGuardrailSets.some((set) => set.id === selectedGuardrailSetId)) {
            return;
          }
          setSelectedGuardrailSetId(allGuardrailSets[0]?.id || "");
        }, [allGuardrailSets, selectedGuardrailSetId]);
        useEffect(() => {
          const selectedSet = allGuardrailSets.find((set) => set?.id === selectedGuardrailSetId) || null;
          const prompts = Array.isArray(selectedSet?.prompts) ? selectedSet.prompts : [];
          if (guardrailActivePromptId && prompts.some((prompt) => prompt?.id === guardrailActivePromptId)) {
            return;
          }
          setGuardrailActivePromptId(String(prompts[0]?.id || ""));
        }, [allGuardrailSets, guardrailActivePromptId, selectedGuardrailSetId]);
        useEffect(() => {
          if (guardrailVersionsSidebarOpen) {
            if (guardrailDetailSidebarCollapsedBeforeVersionsRef.current === null) {
              guardrailDetailSidebarCollapsedBeforeVersionsRef.current = Boolean(guardrailDetailSidebarCollapsed);
            }
            if (!guardrailDetailSidebarCollapsed) {
              setGuardrailDetailSidebarCollapsed(true);
            }
            return;
          }

          if (guardrailDetailSidebarCollapsedBeforeVersionsRef.current !== null) {
            const shouldRestoreCollapsed = Boolean(guardrailDetailSidebarCollapsedBeforeVersionsRef.current);
            guardrailDetailSidebarCollapsedBeforeVersionsRef.current = null;
            setGuardrailDetailSidebarCollapsed(shouldRestoreCollapsed);
          }
        }, [guardrailVersionsSidebarOpen, guardrailDetailSidebarCollapsed]);
        useEffect(() => {
          const normalizedSetId = String(selectedGuardrailSetId || "").trim();
          const needsVersionSurface = guardrailVersionsSidebarOpen
            || guardrailPublishMenuOpen
            || guardrailVersionsHeaderMenuOpen
            || Boolean(guardrailDetailTopNavActionsContainer)
            || Boolean(guardrailVersionChangesState)
            || Boolean(guardrailVersionSaveDialog)
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
          guardrailDetailTopNavActionsContainer,
          guardrailPublishMenuOpen,
          guardrailVersionChangesState,
          guardrailVersionSaveDialog,
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
            || Boolean(guardrailVersionSaveDialog)
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
          guardrailVersionSaveDialog,
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
        useLayoutEffect(() => {
          const isGuardrailDetail = activePage === "guardrails" && guardrailsPageMode === "detail";
          if (!isGuardrailDetail || typeof document === "undefined") {
            setGuardrailDetailTopNavActionsContainer(null);
            return undefined;
          }
          const updateContainer = () => {
            setGuardrailDetailTopNavActionsContainer(
              document.getElementById("playground-guardrails-detail-publish-controls")
            );
          };
          updateContainer();
          const frame = window.requestAnimationFrame(updateContainer);
          return () => window.cancelAnimationFrame(frame);
        }, [
          activePage,
          guardrailVersionChangesState,
          guardrailVersionsSidebarOpen,
          guardrailsPageMode,
          selectedGuardrailSetId,
        ]);
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
