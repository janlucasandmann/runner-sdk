import type { ReactNode } from "react";

export function LogHeader(_props: {
  icon: ReactNode;
  label: string;
  title?: string | null;
  timeLabel?: string;
  meta?: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return null;
}

export function LogPanel({
  children,
}: {
  children: ReactNode;
  collapsed: boolean;
}) {
  return <div className="tb-log-card-panel">{children}</div>;
}
