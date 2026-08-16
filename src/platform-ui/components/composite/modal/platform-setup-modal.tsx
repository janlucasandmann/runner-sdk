import type { CSSProperties, ElementType, ReactNode, RefObject } from "react";
import {
  PlatformModal,
  type PlatformModalCloseReason,
  type PlatformModalProps,
} from "./platform-modal.js";

export interface PlatformSetupModalFeature {
  id: string;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
}

export interface PlatformSetupModalProps
  extends Omit<
    PlatformModalProps,
    | "as"
    | "children"
    | "description"
    | "footer"
    | "headerMedia"
    | "headerVariant"
    | "initialFocusRef"
    | "onClose"
    | "showBody"
    | "showFooter"
    | "showHeader"
    | "title"
  > {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  features?: readonly PlatformSetupModalFeature[];
  introFooter?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose: (reason: PlatformModalCloseReason) => void;
  busy?: boolean;
  as?: ElementType;
  initialFocusRef?: RefObject<HTMLElement | null>;
  accentColor?: CSSProperties["color"];
}

export interface PlatformSetupModalStepProps {
  number: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
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

export function PlatformSetupModal({
  open,
  title,
  description,
  features = [],
  introFooter,
  children,
  footer,
  onClose,
  busy = false,
  as = "div",
  initialFocusRef,
  accentColor,
  className = "",
  closeButtonLabel = "Close setup",
  closeButtonDisabled,
  closeOnBackdrop,
  closeOnEscape,
  size = "wide",
  surfaceProps,
  ...modalProps
}: PlatformSetupModalProps) {
  return (
    <PlatformModal
      {...modalProps}
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      as={as}
      size={size}
      className={joinClassNames("platform-setup-modal", className)}
      headerVariant="media"
      closeButtonLabel={closeButtonLabel}
      closeButtonDisabled={closeButtonDisabled ?? busy}
      closeOnBackdrop={closeOnBackdrop ?? !busy}
      closeOnEscape={closeOnEscape ?? !busy}
      initialFocusRef={initialFocusRef}
      showBody={false}
      showFooter={false}
      surfaceProps={surfaceProps}
      headerMedia={
        <div
          className="platform-setup-modal__layout"
          style={
            accentColor
              ? ({ "--platform-setup-modal-accent": accentColor } as CSSProperties)
              : undefined
          }
        >
          <section className="platform-setup-modal__intro" aria-label="Setup overview">
            <div className="platform-setup-modal__intro-copy">
              <div className="platform-setup-modal__title" aria-hidden="true">
                {title}
              </div>
              {description != null ? (
                <div className="platform-setup-modal__description" aria-hidden="true">
                  {description}
                </div>
              ) : null}
              {features.length > 0 ? (
                <div className="platform-setup-modal__features">
                  {features.map((feature) => (
                    <div className="platform-setup-modal__feature" key={feature.id}>
                      {feature.icon != null ? (
                        <span className="platform-setup-modal__feature-icon" aria-hidden="true">
                          {feature.icon}
                        </span>
                      ) : null}
                      <div className="platform-setup-modal__feature-copy">
                        <div className="platform-setup-modal__feature-title">{feature.title}</div>
                        {feature.description != null ? (
                          <div className="platform-setup-modal__feature-description">
                            {feature.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            {introFooter != null ? (
              <div className="platform-setup-modal__intro-footer">{introFooter}</div>
            ) : null}
          </section>
          <section className="platform-setup-modal__workspace" aria-label="Setup steps">
            <div className="platform-setup-modal__workspace-body">{children}</div>
            {footer != null ? (
              <div className="platform-setup-modal__workspace-footer">{footer}</div>
            ) : null}
          </section>
        </div>
      }
    />
  );
}

export function PlatformSetupModalStep({
  number,
  title,
  description,
  children,
  className = "",
}: PlatformSetupModalStepProps) {
  return (
    <section className={joinClassNames("platform-setup-modal-step", className)}>
      <div className="platform-setup-modal-step__header">
        <span className="platform-setup-modal-step__number" aria-hidden="true">
          {number}.
        </span>
        <div className="platform-setup-modal-step__copy">
          <h3 className="platform-setup-modal-step__title">{title}</h3>
          {description != null ? (
            <p className="platform-setup-modal-step__description">{description}</p>
          ) : null}
        </div>
      </div>
      {children != null ? (
        <div className="platform-setup-modal-step__content">{children}</div>
      ) : null}
    </section>
  );
}
