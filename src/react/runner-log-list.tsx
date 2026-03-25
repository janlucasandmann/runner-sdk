import { RunnerLog } from "../types.js";

export interface RunnerLogListProps {
  logs: RunnerLog[];
  className?: string;
  emptyText?: string;
}

export function RunnerLogList({ logs, className, emptyText = "No logs yet." }: RunnerLogListProps) {
  if (!logs.length) {
    return <div className={className}>{emptyText}</div>;
  }

  return (
    <div className={className}>
      {logs.map((log, index) => (
        <div key={`${log.time}-${index}`} data-event-type={log.eventType} data-log-type={log.type}>
          <strong>[{log.time}]</strong> {log.message}
        </div>
      ))}
    </div>
  );
}

