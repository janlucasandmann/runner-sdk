import type { ReactNode } from "react";
import { PlatformFloatingSidebar } from "../../../../../platform-ui/components/composite/floating-sidebar/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";

export interface TicketDetailPageProps {
  header?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  details: ReactNode;
  preview?: ReactNode;
  previewTitle?: ReactNode;
  previewHeaderActions?: ReactNode;
  previewPortalTarget?: Element | DocumentFragment | null;
  onPreviewClose?: () => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function TicketDetailPage({
  header,
  headerActions,
  children,
  details,
  preview,
  previewTitle = "Attachment preview",
  previewHeaderActions,
  previewPortalTarget = null,
  onPreviewClose,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Ticket details",
  className = "",
}: TicketDetailPageProps) {
  const hasPreview = preview !== undefined && preview !== null;

  return (
    <div
      className={`playground-ticket-detail-frame${hasPreview ? " has-preview" : ""}${className ? ` ${className}` : ""}`}
      data-ticket-detail-page="true"
    >
      <ResourceDetailPage
        header={header}
        headerActions={headerActions}
        sidebarCollapsed={sidebarCollapsed || hasPreview}
        sidebar={(
          <>
            <PlatformUiCard
              as="section"
              variant="sidebar"
              className="playground-ticket-detail-sidebar-section playground-ticket-detail-sidebar-details"
            >
              {details}
            </PlatformUiCard>
          </>
        )}
        ariaLabel={ariaLabel}
        sidebarAriaLabel="Ticket settings"
        className="playground-project-overview-layout playground-agents-detail-overview-layout playground-ticket-detail-page"
        headerClassName="playground-ticket-detail-header"
        contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-ticket-detail-content"
        sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
      >
        {children}
      </ResourceDetailPage>
      <PlatformFloatingSidebar
        open={hasPreview}
        title={previewTitle}
        headerActions={previewHeaderActions}
        ariaLabel="Attachment preview"
        closeButtonLabel="Close attachment preview"
        className="playground-ticket-detail-attachment-sidebar"
        bodyClassName="playground-ticket-detail-attachment-sidebar-body"
        portal={Boolean(previewPortalTarget)}
        portalTarget={previewPortalTarget}
        onClose={() => onPreviewClose?.()}
      >
        {preview}
      </PlatformFloatingSidebar>
    </div>
  );
}
