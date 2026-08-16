export const METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT = String.raw`
        function joinMetronomeInspectorClassNames(...classNames) {
          return classNames
            .flatMap((className) => String(className || "").split(/\s+/))
            .filter(Boolean)
            .filter((className, index, allClassNames) => allClassNames.indexOf(className) === index)
            .join(" ");
        }

        function MetronomeInspectorField({ className = "", children, ...props }) {
          return React.createElement("div", {
            ...props,
            className: joinMetronomeInspectorClassNames("playground-metronome-field", className),
          }, children);
        }

        function MetronomeInspectorFieldTitle({ title, tooltip = null }) {
          return React.createElement("label", {
            className: "playground-metronome-field-label playground-metronome-field-title",
          },
            React.createElement("span", null, title),
            tooltip
          );
        }

        function MetronomeInspectorFieldHint({ as = "div", className = "", children, ...props }) {
          return React.createElement(as, {
            ...props,
            className: joinMetronomeInspectorClassNames("playground-metronome-field-hint", className),
          }, children);
        }

        const MetronomeInspectorInput = React.forwardRef(function MetronomeInspectorInput({
          onKeyDown,
          onKeyUp,
          ...props
        }, forwardedRef) {
          return React.createElement("input", {
            ...props,
            ref: forwardedRef,
            onKeyDown: onKeyDown || stopMetronomeInputKeyPropagation,
            onKeyUp: onKeyUp || stopMetronomeInputKeyPropagation,
          });
        });

        const MetronomeInspectorTextarea = React.forwardRef(function MetronomeInspectorTextarea({
          onKeyDown,
          onKeyUp,
          ...props
        }, forwardedRef) {
          return React.createElement("textarea", {
            ...props,
            ref: forwardedRef,
            onKeyDown: onKeyDown || stopMetronomeInputKeyPropagation,
            onKeyUp: onKeyUp || stopMetronomeInputKeyPropagation,
          });
        });

        const MetronomeInspectorNativeSelect = React.forwardRef(function MetronomeInspectorNativeSelect({
          onKeyDown,
          onKeyUp,
          ...props
        }, forwardedRef) {
          return React.createElement("select", {
            ...props,
            ref: forwardedRef,
            onKeyDown: onKeyDown || stopMetronomeInputKeyPropagation,
            onKeyUp: onKeyUp || stopMetronomeInputKeyPropagation,
          });
        });

        function MetronomeInspectorSwitchRow({ className = "", children, ...props }) {
          return React.createElement("div", {
            ...props,
            className: joinMetronomeInspectorClassNames("playground-metronome-switch-row", className),
          }, children);
        }

        function MetronomeInspectorSwitch({ className = "", ...props }) {
          return React.createElement("button", {
            type: "button",
            ...props,
            className: joinMetronomeInspectorClassNames("playground-metronome-switch", className),
          });
        }

        function MetronomeInspectorToolbarPopup({
          open,
          trigger,
          children,
          rootClassName = "",
          surfaceClassName = "",
          surfaceProps = {},
          animation = "down-in",
        }) {
          return React.createElement(PlatformPopup, {
            open: Boolean(open),
            variant: "minimal",
            portal: true,
            placement: "bottom-end",
            portalOffset: 6,
            portalCollisionPadding: 12,
            animation,
            rootClassName,
            surfaceClassName,
            surfaceProps,
            trigger,
          }, children);
        }
`;
