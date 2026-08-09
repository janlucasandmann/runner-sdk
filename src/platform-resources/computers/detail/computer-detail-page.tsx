import type { ReactNode } from "react";
import { ResourceDetailPage } from "../../../platform-ui/pages/details/index.js";

export type ComputerDetailTab = "general" | "runtime" | "settings";

export interface ComputerDetailPageProps {
  header: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function ComputerDetailPage({
  header,
  children,
  ariaLabel = "Computer details",
  className = "",
}: ComputerDetailPageProps) {
  return (
    <ResourceDetailPage
      header={header}
      ariaLabel={ariaLabel}
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-computer-detail-overview-layout${className ? ` ${className}` : ""}`}
      contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-computer-detail-overview-main"
    >
      {children}
    </ResourceDetailPage>
  );
}
