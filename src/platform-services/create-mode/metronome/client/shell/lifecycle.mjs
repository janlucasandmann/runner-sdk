export const METRONOME_APP_LIFECYCLE_SCRIPT = `
        useEffect(() => {
          if (activePage === "metronome") {
            return;
          }
          setMetronomeTopNavState(null);
          setMetronomeTopNavMenuOpen(false);
          setMetronomeBreadcrumbVersionMenuOpen(false);
          setIsMetronomeNodeDetailOpen(false);
          metronomeTopNavActionsRef.current = {
            edit: null,
            rename: null,
            duplicate: null,
            share: null,
            delete: null,
            publish: null,
            run: null,
            goOverview: null,
            setMode: null,
            selectVersion: null,
            createVersion: null,
            openVersionHistory: null,
          };
        }, [activePage]);

        useEffect(() => {
          if (!metronomeTopNavMenuOpen) {
            return;
          }
          const handleMetronomeTopNavMenuPointerDown = (event) => {
            const target = event.target;
            if (
              metronomeTopNavMenuRef.current
              && target
              && !metronomeTopNavMenuRef.current.contains(target)
            ) {
              setMetronomeTopNavMenuOpen(false);
            }
          };
          document.addEventListener("mousedown", handleMetronomeTopNavMenuPointerDown);
          return () => {
            document.removeEventListener("mousedown", handleMetronomeTopNavMenuPointerDown);
          };
        }, [metronomeTopNavMenuOpen]);

        useEffect(() => {
          if (!metronomeBreadcrumbVersionMenuOpen) {
            return;
          }
          const handleMetronomeBreadcrumbVersionMenuPointerDown = (event) => {
            const target = event.target;
            if (
              metronomeBreadcrumbVersionMenuRef.current
              && target
              && !metronomeBreadcrumbVersionMenuRef.current.contains(target)
            ) {
              setMetronomeBreadcrumbVersionMenuOpen(false);
            }
          };
          document.addEventListener("mousedown", handleMetronomeBreadcrumbVersionMenuPointerDown);
          return () => {
            document.removeEventListener("mousedown", handleMetronomeBreadcrumbVersionMenuPointerDown);
          };
        }, [metronomeBreadcrumbVersionMenuOpen]);

        useEffect(() => {
          setMetronomeBreadcrumbVersionMenuOpen(false);
        }, [metronomeTopNavState?.workflowId]);

        useEffect(() => {
          if (!isMetronomeNodeDetailOpen || !sidebarOpen) {
            return;
          }
          setSidebarOpen(false);
        }, [isMetronomeNodeDetailOpen, sidebarOpen]);

        useEffect(() => {
          const isVisualEditorOpen = activePage === "metronome"
            && metronomeTopNavState?.mode === "editor"
            && (metronomeTopNavState?.editorMode || "edit") === "edit";
          if (isVisualEditorOpen && !wasMetronomeVisualEditorOpenRef.current) {
            setSidebarOpen(false);
          }
          wasMetronomeVisualEditorOpenRef.current = Boolean(isVisualEditorOpen);
        }, [activePage, metronomeTopNavState?.mode, metronomeTopNavState?.editorMode, metronomeTopNavState?.workflowId]);

`;
