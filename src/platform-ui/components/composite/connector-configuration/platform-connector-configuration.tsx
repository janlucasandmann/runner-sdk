import { Ellipsis, Unplug } from "../../ui/hugeicons-compat.js";
import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformPopup } from "../popup/index.js";

export interface PlatformConnectorConfigurationProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  metadata?: ReactNode;
  children?: ReactNode;
  surface?: "contained" | "plain";
  showHeader?: boolean;
  actionLabel?: string;
  disconnectLabel?: string;
  onDisconnect?: () => void | Promise<void>;
}

export interface PlatformConnectorConfigurationRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  pending?: boolean;
  pendingLabel?: string;
}

export interface PlatformConnectorConfigurationSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

/**
 * Canonical configuration surface for one connected provider resource.
 *
 * Product pages own connection state and persistence. This component owns the
 * shared card hierarchy, setting rows, and the scoped connector action menu.
 */
export function PlatformConnectorConfiguration({
  title,
  metadata,
  children,
  surface = "contained",
  showHeader = true,
  actionLabel = "Connector actions",
  disconnectLabel = "Disconnect connector",
  onDisconnect,
  className = "",
  ...props
}: PlatformConnectorConfigurationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);
  const menuSurfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return undefined;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuAnchorRef.current?.contains(target) || menuSurfaceRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [menuOpen]);

  async function disconnect() {
    if (!onDisconnect || disconnecting) return;
    setMenuOpen(false);
    setDisconnecting(true);
    try {
      await onDisconnect();
    } catch (error) {
      // Persistence errors belong to the owning page, but the shared control
      // must still settle and remain usable after a rejected callback.
      console.error("Failed to disconnect connector.", error);
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <section
      {...props}
      className={joinClassNames(
        "platform-connector-configuration",
        surface === "plain" && "is-plain",
        className,
      )}
      data-platform-connector-configuration="true"
      data-platform-connector-configuration-surface={surface}
    >
      {showHeader ? (
        <header className="platform-connector-configuration__header">
          <div className="platform-connector-configuration__identity">{title}</div>
          <div className="platform-connector-configuration__header-actions">
            {metadata ? (
              <div className="platform-connector-configuration__metadata">{metadata}</div>
            ) : null}
            {onDisconnect ? (
              <PlatformPopup
                open={menuOpen}
                variant="minimal"
                portal
                placement="bottom-end"
                animation="down-in"
                rootRef={menuAnchorRef}
                surfaceRef={menuSurfaceRef}
                rootClassName="platform-connector-configuration__menu-anchor"
                surfaceClassName="platform-connector-configuration__menu"
                surfaceProps={{
                  role: "menu",
                  "aria-label": actionLabel,
                  width: 214,
                }}
                trigger={({ open }) => (
                  <PlatformIconButton
                    type="button"
                    size="compact"
                    active={open}
                    aria-label={actionLabel}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    disabled={disconnecting}
                    onClick={() => setMenuOpen((current) => !current)}
                  >
                    <Ellipsis aria-hidden="true" />
                  </PlatformIconButton>
                )}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="tb-popup-row"
                  disabled={disconnecting}
                  onClick={() => void disconnect()}
                >
                  <Unplug className="tb-popup-icon" aria-hidden="true" />
                  <span className="tb-popup-label">
                    {disconnecting ? "Disconnecting..." : disconnectLabel}
                  </span>
                </button>
              </PlatformPopup>
            ) : null}
          </div>
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function PlatformConnectorConfigurationRow({
  title,
  description,
  children,
  pending = false,
  pendingLabel = "Synchronizing connector",
  className = "",
  ...props
}: PlatformConnectorConfigurationRowProps) {
  return (
    <div
      {...props}
      className={joinClassNames("platform-connector-configuration__row", className)}
      data-platform-connector-configuration-row="true"
    >
      <div className="platform-connector-configuration__copy">
        <strong>{title}</strong>
        {description ? (
          <div className="platform-connector-configuration__description">{description}</div>
        ) : null}
      </div>
      {children || pending ? (
        <div className="platform-connector-configuration__control">
          {pending ? (
            <img
              className="platform-connector-configuration__sync-spinner"
              src="/img/spinner.svg"
              alt={pendingLabel}
            />
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Semantic group for one coherent connector policy domain. The section owns
 * hierarchy and spacing while rows continue to own individual controls.
 */
export function PlatformConnectorConfigurationSection({
  title,
  description,
  children,
  className = "",
  ...props
}: PlatformConnectorConfigurationSectionProps) {
  return (
    <section
      {...props}
      className={joinClassNames(
        "platform-connector-configuration__section",
        className,
      )}
      data-platform-connector-configuration-section="true"
    >
      <header className="platform-connector-configuration__section-heading">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="platform-connector-configuration__section-content">
        {children}
      </div>
    </section>
  );
}
