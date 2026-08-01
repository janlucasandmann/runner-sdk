import { X } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import {
  PlatformDetailTabBar,
  type PlatformDetailTab,
} from "../../composite/detail-tab-bar/index.js";
import { PlatformIconButton } from "../../ui/icon-button/index.js";

export interface PlatformThreadWorkbenchTab<TValue extends string = string>
  extends PlatformDetailTab<TValue> {
  icon?: ElementType | ReactNode;
}

export interface PlatformThreadWorkbenchProps<TValue extends string = string> {
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  controls?: ReactNode;
  tabs: readonly PlatformThreadWorkbenchTab<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function PlatformThreadWorkbench<TValue extends string = string>({
  title,
  subtitle,
  status,
  controls,
  tabs,
  value,
  onValueChange,
  onClose,
  children,
  className = "",
}: PlatformThreadWorkbenchProps<TValue>) {
  return (
    <div className={`platform-thread-workbench${className ? ` ${className}` : ""}`}>
      <header className="platform-thread-workbench__header">
        <div className="platform-thread-workbench__heading">
          <div className="platform-thread-workbench__eyebrow">Execution</div>
          <div className="platform-thread-workbench__title-row">
            <h2>{title}</h2>
            {status}
          </div>
          {subtitle ? <div className="platform-thread-workbench__subtitle">{subtitle}</div> : null}
        </div>
        <div className="platform-thread-workbench__header-actions">
          {controls}
          <PlatformIconButton
            size="compact"
            aria-label="Close execution details"
            title="Close"
            onClick={onClose}
          >
            <X strokeWidth={1.7} />
          </PlatformIconButton>
        </div>
      </header>
      <PlatformDetailTabBar
        tabs={tabs}
        value={value}
        onValueChange={onValueChange}
        ariaLabel="Execution detail views"
        panelId="platform-thread-workbench-panel"
        className="platform-thread-workbench__tabs"
      />
      <div
        id="platform-thread-workbench-panel"
        className="platform-thread-workbench__body"
        role="tabpanel"
      >
        {children}
      </div>
    </div>
  );
}
