import { ChevronRight, CircleStop, LoaderCircle } from "lucide-react";
import { selectRunnerThreadRunWorkingLabel } from "../../thread/selectors.js";
import type { RunnerThreadProjection, RunnerThreadRun } from "../../thread/types.js";
import { isRunnerThreadRunActive } from "./run-activity-card.js";

export interface RunnerThreadActiveRunsDockProps {
  runs: RunnerThreadRun[];
  projection?: RunnerThreadProjection;
  onSelectRun?: (run: RunnerThreadRun) => void;
  onCancelRun?: (run: RunnerThreadRun) => Promise<void> | void;
}

export function RunnerThreadActiveRunsDock({
  runs,
  projection,
  onSelectRun,
  onCancelRun,
}: RunnerThreadActiveRunsDockProps) {
  const activeRuns = runs.filter(isRunnerThreadRunActive);
  if (activeRuns.length === 0) return null;

  return (
    <div className="tb-thread-active-runs" aria-label="Active runs">
      {activeRuns.map((run) => (
        <div className="tb-thread-active-run" key={run.id}>
          <button type="button" className="tb-thread-active-run-main" onClick={() => onSelectRun?.(run)}>
            <LoaderCircle className="is-spinning" strokeWidth={1.7} aria-hidden="true" />
            <span>{projection ? selectRunnerThreadRunWorkingLabel(projection, run.id) || "Working..." : "Working..."}</span>
            <ChevronRight strokeWidth={1.7} aria-hidden="true" />
          </button>
          {onCancelRun ? (
            <button type="button" className="tb-thread-active-run-cancel" onClick={() => void onCancelRun(run)} aria-label="Cancel run">
              <CircleStop strokeWidth={1.7} />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
