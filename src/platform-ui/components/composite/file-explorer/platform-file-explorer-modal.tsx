import { X } from "lucide-react";
import { type ImgHTMLAttributes, type ReactNode, useEffect, useState } from "react";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import {
  PlatformModal,
  PlatformModalContent,
  type PlatformModalProps,
  PlatformModalSidebar,
  PlatformModalSplitLayout,
} from "../modal/index.js";

export interface PlatformFileExplorerModalProps
  extends Omit<
    PlatformModalProps,
    "bodyClassName" | "children" | "footer" | "showBody" | "showFooter" | "showHeader" | "title"
  > {
  title: ReactNode;
  sidebarHeader?: ReactNode;
  sidebar: ReactNode;
  showSidebar?: boolean;
  contentHeader: ReactNode;
  contentNavigation?: ReactNode;
  children: ReactNode;
  preview?: ReactNode;
  previewTitle?: ReactNode;
  footer?: ReactNode;
  sidebarClassName?: string;
  sidebarBodyClassName?: string;
  contentClassName?: string;
  contentHeaderClassName?: string;
  contentNavigationClassName?: string;
  contentBodyClassName?: string;
  contentFooterClassName?: string;
  mainClassName?: string;
  previewClassName?: string;
  previewHeaderClassName?: string;
  previewBodyClassName?: string;
  previewCloseButtonLabel?: string;
  onPreviewClose?: () => void;
}

export interface PlatformFileExplorerThumbnailProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "children" | "src"> {
  src?: string | null;
  fallbackSrc?: string | null;
  fallback: ReactNode;
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

export function PlatformFileExplorerModal({
  title,
  sidebarHeader,
  sidebar,
  showSidebar = true,
  contentHeader,
  contentNavigation,
  children,
  preview,
  previewTitle = "Preview",
  footer,
  sidebarClassName = "",
  sidebarBodyClassName = "",
  contentClassName = "",
  contentHeaderClassName = "",
  contentNavigationClassName = "",
  contentBodyClassName = "",
  contentFooterClassName = "",
  mainClassName = "",
  previewClassName = "",
  previewHeaderClassName = "",
  previewBodyClassName = "",
  previewCloseButtonLabel = "Close file preview",
  onPreviewClose,
  className = "",
  closeButtonLabel = "Close file explorer",
  onClose,
  size = "full",
  ...modalProps
}: PlatformFileExplorerModalProps) {
  const showSidebarHeader = sidebarHeader !== null;

  return (
    <PlatformModal
      {...modalProps}
      title={title}
      size={size}
      className={joinClassNames(
        "platform-file-explorer-modal",
        preview != null && "has-preview",
        contentNavigation == null && "has-no-navigation",
        className,
      )}
      bodyClassName="platform-file-explorer-modal__body"
      showHeader={false}
      showFooter={false}
      closeButtonLabel={closeButtonLabel}
      onClose={onClose}
    >
      <PlatformModalSplitLayout
        className={joinClassNames("platform-file-explorer", !showSidebar && "has-no-sidebar")}
        onPointerDownCapture={(event) => {
          if (preview == null || !onPreviewClose) return;
          const target = event.target;
          if (!(target instanceof Element)) return;
          if (
            target.closest(
              ".platform-file-explorer__preview, .platform-file-explorer__content-header, [data-platform-file-preview-anchor='true']",
            )
          ) {
            return;
          }
          onPreviewClose();
        }}
      >
        {showSidebar ? (
          <PlatformModalSidebar
            title={sidebarHeader === undefined ? title : sidebarHeader}
            className={joinClassNames(
              "platform-file-explorer__sidebar",
              !showSidebarHeader && "has-no-header",
              sidebarClassName,
            )}
            titleClassName={joinClassNames(
              sidebarHeader != null && "platform-file-explorer__sidebar-header-content",
            )}
            bodyClassName={joinClassNames(
              "platform-file-explorer__sidebar-body",
              sidebarBodyClassName,
            )}
          >
            {sidebar}
          </PlatformModalSidebar>
        ) : null}
        <PlatformModalContent
          className={joinClassNames("platform-file-explorer__content", contentClassName)}
          headerClassName={joinClassNames(
            "platform-file-explorer__content-header",
            contentHeaderClassName,
          )}
          bodyClassName={joinClassNames(
            "platform-file-explorer__content-body",
            contentBodyClassName,
          )}
          footerClassName={joinClassNames(
            "platform-file-explorer__content-footer",
            contentFooterClassName,
          )}
          header={
            <div className="platform-file-explorer__content-header-layout">
              <div className="platform-file-explorer__content-header-row">
                <div className="platform-file-explorer__content-header-copy">{contentHeader}</div>
              </div>
              {contentNavigation != null ? (
                <div
                  className={joinClassNames(
                    "platform-file-explorer__content-navigation",
                    contentNavigationClassName,
                  )}
                >
                  {contentNavigation}
                </div>
              ) : null}
            </div>
          }
          footer={footer}
        >
          <div className={joinClassNames("platform-file-explorer__main", mainClassName)}>
            {children}
          </div>
        </PlatformModalContent>
        {preview != null ? (
          <aside
            className={joinClassNames("platform-file-explorer__preview", previewClassName)}
            data-platform-modal-part="preview"
          >
            <div
              className={joinClassNames(
                "platform-file-explorer__preview-header",
                previewHeaderClassName,
              )}
              data-platform-modal-pane-part="header"
            >
              <div className="platform-file-explorer__preview-title">{previewTitle}</div>
              <PlatformIconButton
                type="button"
                size="compact"
                className="platform-file-explorer__preview-close"
                aria-label={previewCloseButtonLabel}
                onClick={() => onPreviewClose?.()}
              >
                <X aria-hidden="true" strokeWidth={2} />
              </PlatformIconButton>
            </div>
            <div
              className={joinClassNames(
                "platform-file-explorer__preview-body",
                previewBodyClassName,
              )}
              data-platform-modal-pane-part="body"
            >
              {preview}
            </div>
          </aside>
        ) : null}
      </PlatformModalSplitLayout>
    </PlatformModal>
  );
}

export function PlatformFileExplorerThumbnail({
  src,
  fallbackSrc,
  fallback,
  className = "",
  alt = "",
  onError,
  ...props
}: PlatformFileExplorerThumbnailProps) {
  const [sourceFailed, setSourceFailed] = useState(false);
  const [fallbackSourceFailed, setFallbackSourceFailed] = useState(false);
  const normalizedSource = String(src || "").trim();
  const normalizedFallbackSource = String(fallbackSrc || "").trim();
  const usableFallbackSource =
    normalizedFallbackSource && normalizedFallbackSource !== normalizedSource
      ? normalizedFallbackSource
      : "";
  const effectiveSource =
    normalizedSource && !sourceFailed
      ? normalizedSource
      : usableFallbackSource && !fallbackSourceFailed
        ? usableFallbackSource
        : "";

  useEffect(() => {
    setSourceFailed(false);
    setFallbackSourceFailed(false);
  }, [normalizedFallbackSource, normalizedSource]);

  if (!effectiveSource) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...props}
      src={effectiveSource}
      alt={alt}
      className={joinClassNames("platform-file-explorer__thumbnail", className)}
      loading={props.loading ?? "lazy"}
      decoding={props.decoding ?? "async"}
      onError={(event) => {
        if (effectiveSource === normalizedSource) {
          setSourceFailed(true);
        } else {
          setFallbackSourceFailed(true);
        }
        onError?.(event);
      }}
    />
  );
}
