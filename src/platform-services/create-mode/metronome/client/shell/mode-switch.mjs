export const METRONOME_APP_MODE_SWITCH_SCRIPT = `
        function renderMetronomeModeSwitch() {
          const state = metronomeTopNavState && metronomeTopNavState.mode === "editor"
            ? metronomeTopNavState
            : null;
          if (!state) {
            return null;
          }
          const isReadOnly = Boolean(state.readOnly);
          const activeMode = isReadOnly
            ? (state.editorMode === "code" ? "code" : "edit")
            : state.editorMode === "runs" ? "runs" : state.editorMode === "code" ? "code" : "edit";
          const tabs = isReadOnly
            ? [
                { id: "edit", label: "Details" },
                { id: "code", label: "Code" },
              ]
            : [
                { id: "edit", label: "Edit" },
                { id: "code", label: "Code" },
                { id: "runs", label: "Runs" },
              ];
          return React.createElement("div", { className: "content-mode-switch playground-thread-mode-switch playground-metronome-top-nav-switch", role: "tablist", "aria-label": "Metronome modes" },
            tabs.map((tab) =>
              React.createElement("button", {
                key: tab.id,
                type: "button",
                role: "tab",
                className: "content-mode-button" + (activeMode === tab.id ? " is-active" : ""),
                "aria-selected": activeMode === tab.id ? "true" : "false",
                onClick: () => metronomeTopNavActionsRef.current?.setMode?.(tab.id),
              }, tab.label)
            )
          );
        }

`;
