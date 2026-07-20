import { Circle, Rocket, type LucideIcon } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { PlatformButtonSelector } from "../../../platform-ui/components/ui/selector/index.js";

export interface AgentPublishAction {
  id: string;
  label: ReactNode;
  icon?: LucideIcon;
  shortcut?: ReactNode;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
}

export interface AgentPublishControlProps {
  open: boolean;
  actions: readonly AgentPublishAction[];
  onOpenChange: (open: boolean) => void;
  onPublish: () => void | Promise<void>;
  rootRef?: Ref<HTMLDivElement>;
  disabled?: boolean;
  menuDisabled?: boolean;
  active?: boolean;
  label?: ReactNode;
  leading?: ReactNode;
  publishAriaLabel?: string;
  menuAriaLabel?: string;
  className?: string;
}

export function AgentPublishControl({
  open,
  actions,
  onOpenChange,
  onPublish,
  rootRef,
  disabled = false,
  menuDisabled = disabled,
  active = false,
  label = "Save & Publish",
  leading = <Rocket />,
  publishAriaLabel = "Save and publish agent changes",
  menuAriaLabel = "Version save options",
  className = "",
}: AgentPublishControlProps) {
  return (
    <PlatformButtonSelector
      mode="split-action"
      buttonVariant="primary"
      buttonSize="small"
      open={open}
      rootRef={rootRef}
      onOpenChange={onOpenChange}
      onAction={onPublish}
      label={label}
      leading={leading}
      actionAriaLabel={publishAriaLabel}
      popupAriaLabel={menuAriaLabel}
      actionDisabled={disabled}
      popupDisabled={menuDisabled}
      active={active}
      popupAlignment="right"
      popupRole="menu"
      popupWidth={268}
      popupMaxHeight="min(260px, calc(100vh - 160px))"
      className={`agent-publish-control${className ? ` ${className}` : ""}`}
      popupClassName="agent-publish-control__menu"
    >
      {actions.map((action) => {
        const ActionIcon = action.icon || Circle;
        const actionDisabled = menuDisabled || Boolean(action.disabled);
        return (
          <button
            key={action.id}
            type="button"
            className="tb-popup-row"
            role="menuitem"
            disabled={actionDisabled}
            onClick={() => {
              if (actionDisabled) return;
              onOpenChange(false);
              void action.onClick();
            }}
          >
            <ActionIcon className="tb-popup-icon" aria-hidden="true" />
            <span className="agent-publish-control__action-copy">{action.label}</span>
            {action.shortcut ? (
              <span className="agent-publish-control__shortcut" aria-hidden="true">
                {action.shortcut}
              </span>
            ) : null}
          </button>
        );
      })}
    </PlatformButtonSelector>
  );
}
