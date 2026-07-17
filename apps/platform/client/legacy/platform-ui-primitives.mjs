export const PLATFORM_UI_PRIMITIVES_CSS = String.raw``;

export const PLATFORM_UI_PRIMITIVES_SCRIPT = String.raw`
      const PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS = 60;

      function joinPlaygroundPlatformClassNames(...classNames) {
        return classNames
          .flatMap((className) => Array.isArray(className) ? className : [className])
          .filter((className) => typeof className === "string" && className.trim())
          .map((className) => className.trim())
          .join(" ");
      }

      function renderPlaygroundPlatformModal({
        open,
        closing = false,
        onClose,
        closeOnBackdrop = true,
        closeOnEscape = true,
        as = "div",
        size = "medium",
        width,
        maxWidth,
        maxHeight,
        scrollable = false,
        lockScroll = true,
        backdropClassName = "",
        className = "",
        role = "dialog",
        ariaLabel = "",
        title,
        description,
        headerVariant,
        headerSearchProps,
        headerActions,
        footer,
        showHeader = true,
        showBody = true,
        showFooter = true,
        bodyClassName = "",
        footerClassName = "",
        bodyProps = {},
        footerProps = {},
        closeButtonLabel,
        closeButtonDisabled = false,
        portal = true,
        surfaceProps = {},
        children,
      } = {}) {
        return React.createElement(PlatformModal, {
          open: Boolean(open) && !closing,
          animationDurationMs: PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS,
          onClose: typeof onClose === "function" ? () => onClose() : undefined,
          closeOnBackdrop,
          closeOnEscape,
          as,
          size,
          width,
          maxWidth,
          maxHeight,
          scrollable,
          lockScroll,
          backdropClassName,
          className,
          role,
          ariaLabel,
          title,
          description,
          headerVariant,
          headerSearchProps,
          headerActions,
          footer,
          showHeader,
          showBody,
          showFooter,
          bodyClassName,
          footerClassName,
          bodyProps,
          footerProps,
          closeButtonLabel,
          closeButtonDisabled,
          portal,
          surfaceProps,
        }, children);
      }

      function getPlaygroundPlatformPopupMenuClassName(className = "", options = {}) {
        const animationClassName = options.animationClassName || "";
        return joinPlaygroundPlatformClassNames(
          "playground-tasks-toolbar-popup-menu",
          "playground-platform-popup-menu",
          animationClassName,
          className
        );
      }

      function renderPlaygroundPlatformPopup({
        open,
        shellRef,
        shellClassName = "",
        trigger,
        menuClassName = "",
        menuProps = {},
        children,
      } = {}) {
        const {
          animate,
          animationClassName,
          className: menuPropsClassName = "",
          ...restMenuProps
        } = menuProps || {};
        return React.createElement(PlatformPopup, {
            open: Boolean(open),
            rootRef: shellRef || undefined,
            rootClassName: joinPlaygroundPlatformClassNames(
              "playground-platform-popup-shell",
              "playground-tasks-toolbar-popup-shell",
              shellClassName
            ),
            trigger,
            surfaceClassName: getPlaygroundPlatformPopupMenuClassName(
              joinPlaygroundPlatformClassNames(menuClassName, menuPropsClassName),
              { animationClassName }
            ),
            surfaceProps: restMenuProps,
            animation: animate === false ? false : (animationClassName ? undefined : "down-in"),
          }, children);
      }

      const PlaygroundPlatformModal = renderPlaygroundPlatformModal;
      const PlaygroundPlatformPopup = renderPlaygroundPlatformPopup;
`;
