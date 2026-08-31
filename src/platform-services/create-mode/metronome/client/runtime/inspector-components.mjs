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

        function MetronomeInspectorInfoTooltip({
          ariaLabel = "More information",
          description,
          placement = "left-start",
          runtime = null,
          title = null,
        }) {
          if (!description) return null;
          return React.createElement(PlatformInfoTooltip, {
            ariaLabel,
            className: "playground-metronome-inspector-info-tooltip",
            description,
            placement,
            runtime,
            title,
          });
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

        function normalizeMetronomeInspectorSelectorOption(option) {
          const source = option && typeof option === "object" && !React.isValidElement(option)
            ? option
            : { value: option, label: option };
          const value = String(source.value ?? source.id ?? "").trim();
          const label = source.label ?? source.name ?? source.title ?? source.id ?? source.value ?? "";
          return {
            ...source,
            value,
            label: label || value,
            description: source.description || source.copy || source.subtitle || "",
          };
        }

        function readMetronomeInspectorOptionLabel(children) {
          return React.Children.toArray(children).map((child) => {
            if (typeof child === "string" || typeof child === "number") return String(child);
            if (React.isValidElement(child)) return readMetronomeInspectorOptionLabel(child.props?.children);
            return "";
          }).join("").trim();
        }

        function collectMetronomeInspectorNativeOptions(children, output = []) {
          React.Children.toArray(children).forEach((child) => {
            if (!React.isValidElement(child)) return;
            if (child.type === "option") {
              const value = String(child.props?.value ?? "").trim();
              output.push({
                value,
                label: readMetronomeInspectorOptionLabel(child.props?.children) || value,
                disabled: Boolean(child.props?.disabled),
              });
              return;
            }
            if (child.props?.children != null) {
              collectMetronomeInspectorNativeOptions(child.props.children, output);
            }
          });
          return output;
        }

        const MetronomeInspectorSelect = React.forwardRef(function MetronomeInspectorSelect({
          value,
          options = [],
          onValueChange,
          onOpenChange,
          ariaLabel = "Select option",
          placeholder = "Select...",
          searchPlaceholder = "Search options...",
          disabled = false,
          className = "",
          triggerClassName = "",
          popupClassName = "",
          popupWidth = "min(280px, calc(100vw - 48px))",
          popupMaxWidth = "calc(100vw - 48px)",
          popupMaxHeight = "min(320px, calc(100vh - 120px))",
          onKeyDown,
          onKeyUp,
          ...props
        }, forwardedRef) {
          const [open, setOpen] = React.useState(false);
          const [query, setQuery] = React.useState("");
          const normalizedOptions = React.useMemo(() => {
            const seenValues = new Set();
            return (Array.isArray(options) ? options : []).map(normalizeMetronomeInspectorSelectorOption).filter((option) => {
              if (seenValues.has(option.value)) return false;
              seenValues.add(option.value);
              return Boolean(option.value || option.label);
            });
          }, [options]);
          const selectedValue = String(value ?? "").trim();
          const selectedOption = normalizedOptions.find((option) => option.value === selectedValue) || null;
          const selectedLabel = selectedOption?.leading
            ? React.createElement("span", { className: "playground-metronome-inspector-selector-selection" },
                React.createElement("span", {
                  className: "playground-metronome-inspector-selector-selection-leading",
                  "aria-hidden": "true",
                }, selectedOption.leading),
                React.createElement("span", {
                  className: "playground-metronome-inspector-selector-selection-label",
                }, selectedOption.label)
              )
            : selectedOption?.label || placeholder;
          const normalizedQuery = query.trim().toLowerCase();
          const filteredOptions = normalizedOptions.filter((option) => {
            if (!normalizedQuery) return true;
            return [option.label, option.description, option.value]
              .map((part) => String(part || ""))
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);
          });
          return React.createElement(PlatformSelector, {
            ...props,
            ref: forwardedRef,
            value: selectedValue,
            options: filteredOptions,
            onValueChange,
            ariaLabel,
            label: selectedLabel,
            placeholder,
            disabled,
            open,
            onOpenChange: (nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) setQuery("");
              if (typeof onOpenChange === "function") onOpenChange(nextOpen);
            },
            alignment: "end",
            popupAlignment: "right",
            fullWidth: true,
            emptyContent: "No matching options.",
            popupSearch: {
              value: query,
              onChange: (event) => setQuery(event.target.value),
              placeholder: searchPlaceholder,
              autoFocus: open,
              "aria-label": searchPlaceholder,
            },
            popupWidth,
            popupMaxWidth,
            popupMaxHeight,
            className: joinMetronomeInspectorClassNames(
              "playground-metronome-inspector-central-selector",
              className
            ),
            triggerClassName: joinMetronomeInspectorClassNames(
              "playground-metronome-inspector-central-selector-trigger",
              triggerClassName
            ),
            popupClassName: joinMetronomeInspectorClassNames(
              "playground-metronome-inspector-central-selector-popup",
              popupClassName
            ),
            onKeyDown: onKeyDown || stopMetronomeInputKeyPropagation,
            onKeyUp: onKeyUp || stopMetronomeInputKeyPropagation,
          });
        });

        const MetronomeInspectorNativeSelect = React.forwardRef(function MetronomeInspectorNativeSelect({
          children,
          value,
          defaultValue,
          onChange,
          className = "",
          disabled = false,
          placeholder,
          searchPlaceholder,
          name = "",
          title = "",
          "aria-label": ariaLabel,
          onKeyDown,
          onKeyUp,
          ...props
        }, forwardedRef) {
          const options = collectMetronomeInspectorNativeOptions(children);
          const selectedValue = String(value ?? defaultValue ?? "").trim();
          const selectedOption = options.find((option) => option.value === selectedValue) || null;
          const resolvedPlaceholder = String(
            placeholder
              || options.find((option) => !option.value)?.label
              || selectedOption?.label
              || "Select..."
          );
          const resolvedAriaLabel = String(ariaLabel || title || name || "Select option");
          return React.createElement(MetronomeInspectorSelect, {
            ...props,
            ref: forwardedRef,
            value: selectedValue,
            options,
            onValueChange: (nextValue) => {
              if (typeof onChange !== "function") return;
              const changeTarget = { value: nextValue, name };
              onChange({
                type: "change",
                target: changeTarget,
                currentTarget: changeTarget,
              });
            },
            ariaLabel: resolvedAriaLabel,
            placeholder: resolvedPlaceholder,
            searchPlaceholder: searchPlaceholder || "Search options...",
            disabled,
            className: joinMetronomeInspectorClassNames(
              "playground-metronome-inspector-native-selector",
              className
            ),
            triggerClassName: joinMetronomeInspectorClassNames(
              "playground-metronome-inspector-native-selector-trigger"
            ),
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
          searchHeader = null,
          animation = "down-in",
          placement = "bottom-end",
          portalOffset = 6,
          portalCollisionPadding = 12,
          portalAnchorPoint = null,
        }) {
          return React.createElement(PlatformPopup, {
            open: Boolean(open),
            variant: "minimal",
            portal: true,
            placement,
            portalOffset,
            portalCollisionPadding,
            portalAnchorPoint,
            animation,
            searchHeader,
            rootClassName,
            surfaceClassName,
            surfaceProps,
            trigger,
          }, children);
        }

        function MetronomeInspectorPickerPopup({
          open,
          trigger,
          title,
          description = "",
          onClose,
          showHeader = true,
          searchHeader = null,
          children,
          rootClassName = "",
          surfaceClassName = "",
          surfaceProps = {},
          placement = "left-start",
          portalAnchorPoint = null,
          animation = "down-in",
        }) {
          return React.createElement(MetronomeInspectorToolbarPopup, {
            open,
            trigger,
            placement,
            portalAnchorPoint,
            animation,
            portalOffset: 12,
            portalCollisionPadding: 12,
            rootClassName,
            surfaceClassName: joinMetronomeInspectorClassNames(
              "playground-metronome-inspector-picker",
              surfaceClassName
            ),
            surfaceProps: {
              role: "dialog",
              "aria-label": title,
              width: "min(360px, calc(100vw - 24px))",
              maxHeight: "min(520px, calc(100dvh - 24px))",
              onMouseDown: (event) => event.stopPropagation(),
              onPointerDown: (event) => event.stopPropagation(),
              ...surfaceProps,
            },
            searchHeader: searchHeader
              ? {
                  ...searchHeader,
                  containerClassName: joinMetronomeInspectorClassNames(
                    "playground-metronome-inspector-picker-search",
                    searchHeader.containerClassName
                  ),
                }
              : null,
          },
            showHeader
              ? React.createElement("div", { className: "playground-metronome-inspector-picker-header" },
                  React.createElement("div", { className: "playground-metronome-inspector-picker-heading" },
                    React.createElement("div", { className: "playground-metronome-inspector-picker-title" }, title),
                    description
                      ? React.createElement("div", { className: "playground-metronome-inspector-picker-description" }, description)
                      : null
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-inspector-picker-close",
                    onMouseDown: (event) => event.preventDefault(),
                    onClick: onClose,
                    title: "Close",
                    "aria-label": "Close " + String(title || "picker").toLowerCase(),
                  }, React.createElement(X, { width: 14, height: 14, strokeWidth: 2.4 }))
                )
              : null,
            children
          );
        }

        function MetronomeInspectorPickerRow({
          className = "",
          label,
          description = "",
          trailing = null,
          ...props
        }) {
          return React.createElement("button", {
            type: "button",
            ...props,
            className: joinMetronomeInspectorClassNames(
              "playground-metronome-inspector-picker-row",
              className
            ),
          },
            React.createElement("span", { className: "playground-metronome-inspector-picker-row-main" },
              React.createElement("span", { className: "playground-metronome-inspector-picker-row-label" }, label),
              description
                ? React.createElement("span", { className: "playground-metronome-inspector-picker-row-description" }, description)
                : null
            ),
            trailing == null
              ? null
              : React.createElement("span", { className: "playground-metronome-inspector-picker-row-trailing" }, trailing)
          );
        }

        function MetronomeInspectorPickerState({ className = "", children }) {
          return React.createElement("div", {
            className: joinMetronomeInspectorClassNames(
              "playground-metronome-inspector-picker-state",
              className
            ),
          }, children);
        }
`;
