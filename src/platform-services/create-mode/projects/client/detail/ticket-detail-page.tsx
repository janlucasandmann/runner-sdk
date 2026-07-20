import type { ReactNode } from "react";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";

export interface TicketDetailPageProps {
  header: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  details: ReactNode;
  detailsActions?: ReactNode;
  threads: ReactNode;
  preview?: ReactNode;
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
  detailsActions,
  threads,
  preview,
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
        sidebarCollapsed={sidebarCollapsed}
        sidebar={(
          <>
            <PlatformUiCard
              as="section"
              variant="sidebar"
              cardTitle="Details"
              headerActions={detailsActions}
              className="playground-ticket-detail-sidebar-section playground-ticket-detail-sidebar-details"
            >
              {details}
            </PlatformUiCard>
            <PlatformUiCard
              as="section"
              variant="sidebar"
              cardTitle="Threads"
              className="playground-ticket-detail-sidebar-section playground-ticket-detail-sidebar-threads"
            >
              {threads}
            </PlatformUiCard>
          </>
        )}
        ariaLabel={ariaLabel}
        sidebarAriaLabel="Ticket settings and threads"
        className="playground-project-overview-layout playground-agents-detail-overview-layout playground-ticket-detail-page"
        headerClassName="playground-ticket-detail-header"
        contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-ticket-detail-content"
        sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
      >
        {children}
      </ResourceDetailPage>
      {hasPreview ? (
        <aside className="playground-ticket-detail-preview" aria-label="Attachment preview">
          {preview}
        </aside>
      ) : null}
    </div>
  );
}
