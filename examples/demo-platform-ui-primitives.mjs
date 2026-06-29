export const PLATFORM_UI_PRIMITIVES_CSS = String.raw`
      .playground-platform-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 10020;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        transition: background-color 75ms linear !important;
      }

      .playground-platform-modal-backdrop.is-visible {
        background: rgba(0, 0, 0, 0.5);
      }

      .playground-platform-modal {
        --tb-runner-input-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        overflow: visible;
        border: 0 !important;
        border-radius: 25px;
        background: rgba(30, 30, 30, 0.5) !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        transform-origin: center;
        opacity: 0.5;
        transform: scale(0.5);
        transition: opacity 75ms linear, transform 75ms linear !important;
        will-change: opacity, transform;
      }

      .playground-platform-modal.is-visible {
        opacity: 1;
        transform: scale(1);
      }

      .playground-platform-modal::before {
        content: "" !important;
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        display: block !important;
        border-radius: inherit;
        padding: 1px;
        background: var(--tb-task-input-border, var(--tb-runner-input-border));
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-platform-modal::after {
        content: none !important;
        display: none !important;
      }

      .playground-platform-popup-shell {
        position: relative;
        z-index: 31;
      }

      .playground-platform-popup-shell.is-open {
        z-index: 120;
      }

      .playground-platform-popup-shell .playground-platform-popup-menu {
        --playground-platform-popup-border: var(--tb-task-input-border, var(--tb-runner-input-border, linear-gradient(-10deg, rgba(200, 200, 200, 0.25), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.375))));
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
        border: 0;
        border-radius: 25px;
        background: rgba(30, 30, 30, 0.5);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);
      }

      .playground-platform-popup-shell .playground-platform-popup-menu::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-platform-popup-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-platform-popup-shell .playground-platform-popup-menu > * {
        position: relative;
        z-index: 6;
      }
`;

export const PLATFORM_UI_PRIMITIVES_SCRIPT = String.raw`
      const PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS = 75;

      function joinPlaygroundPlatformClassNames(...classNames) {
        return classNames
          .flatMap((className) => Array.isArray(className) ? className : [className])
          .filter((className) => typeof className === "string" && className.trim())
          .map((className) => className.trim())
          .join(" ");
      }

      function getPlaygroundPlatformModalBackdropClassName({ className = "", visible = false, closing = false } = {}) {
        return joinPlaygroundPlatformClassNames(
          "playground-platform-modal-backdrop",
          className,
          visible ? "is-visible" : "",
          closing ? "is-closing" : ""
        );
      }

      function getPlaygroundPlatformModalClassName({ className = "", visible = false, closing = false } = {}) {
        return joinPlaygroundPlatformClassNames(
          "playground-platform-modal",
          className,
          visible ? "is-visible" : "",
          closing ? "is-closing" : ""
        );
      }

      function renderPlaygroundPlatformModal({
        open,
        visible = false,
        closing = false,
        onClose,
        closeOnBackdrop = true,
        as = "div",
        backdropClassName = "",
        className = "",
        role = "dialog",
        ariaLabel = "",
        portal = true,
        surfaceProps = {},
        children,
      } = {}) {
        if (!open) {
          return null;
        }
        const SurfaceElement = as || "div";
        const modalElement = React.createElement("div", {
            className: getPlaygroundPlatformModalBackdropClassName({ className: backdropClassName, visible, closing }),
            onClick: closeOnBackdrop && typeof onClose === "function" ? () => onClose() : undefined,
          },
          React.createElement(SurfaceElement, {
              ...(surfaceProps || {}),
              className: getPlaygroundPlatformModalClassName({ className, visible, closing }),
              role,
              "aria-modal": "true",
              "aria-label": ariaLabel || undefined,
              onClick: (event) => {
                event.stopPropagation();
                if (typeof surfaceProps?.onClick === "function") {
                  surfaceProps.onClick(event);
                }
              },
            },
            children
          )
        );
        return portal && typeof document !== "undefined" && document.body
          ? createPortal(modalElement, document.body)
          : modalElement;
      }

      function getPlaygroundPlatformPopupMenuClassName(className = "", options = {}) {
        const animationClassName = options.animate === false
          ? ""
          : options.animationClassName || "playground-tasks-toolbar-popup-menu-animate-down-in";
        return joinPlaygroundPlatformClassNames(
          "tb-popup-menu",
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
        return React.createElement("div", {
            className: joinPlaygroundPlatformClassNames(
              "playground-platform-popup-shell",
              "playground-tasks-toolbar-popup-shell",
              shellClassName,
              open ? "is-open" : ""
            ),
            ref: shellRef || undefined,
          },
          typeof trigger === "function" ? trigger({ open: Boolean(open) }) : trigger,
          open
            ? React.createElement("div", {
                ...restMenuProps,
                className: getPlaygroundPlatformPopupMenuClassName(
                  joinPlaygroundPlatformClassNames(menuClassName, menuPropsClassName),
                  { animate, animationClassName }
                ),
              }, children)
            : null
        );
      }

      const PlaygroundPlatformModal = renderPlaygroundPlatformModal;
      const PlaygroundPlatformPopup = renderPlaygroundPlatformPopup;
`;
