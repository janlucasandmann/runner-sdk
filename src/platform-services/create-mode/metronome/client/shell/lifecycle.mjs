export const METRONOME_APP_LIFECYCLE_SCRIPT = `
        useEffect(() => {
          if (activePage === "metronome") {
            return;
          }
          setMetronomeTopNavState(null);
          setMetronomeTopNavMenuOpen(false);
          setMetronomeTopNavPublishMenuOpen(false);
          setIsMetronomeNodeDetailOpen(false);
          metronomeTopNavActionsRef.current = {
            edit: null,
            rename: null,
            duplicate: null,
            share: null,
            delete: null,
            publish: null,
            revertVersion: null,
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
          setMetronomeTopNavPublishMenuOpen(false);
        }, [metronomeTopNavState?.workflowId]);

        useEffect(() => {
          if (!metronomeTopNavState?.showPublish) {
            setMetronomeTopNavPublishMenuOpen(false);
          }
        }, [metronomeTopNavState?.showPublish]);

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
