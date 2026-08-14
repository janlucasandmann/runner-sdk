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
            : state.editorMode === "settings" ? "settings" : state.editorMode === "code" ? "code" : "edit";
          const options = isReadOnly
            ? [
                { value: "edit", label: "Details" },
                { value: "code", label: "Code" },
              ]
            : [
                { value: "edit", label: "Edit" },
                { value: "code", label: "Code" },
                { value: "settings", label: "Settings" },
              ];
          return React.createElement(PlatformSwitch, {
            value: activeMode,
            options,
            onValueChange: (nextMode) => metronomeTopNavActionsRef.current?.setMode?.(nextMode),
            ariaLabel: "Metronome modes",
            className: "playground-metronome-top-nav-switch",
          });
        }

`;
