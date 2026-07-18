import {
  Bookmark,
  Clapperboard,
  Code2,
  FileText,
  Flame,
  HardDrive,
  Metronome,
  Play,
  RefreshCw,
  Split,
  Square,
  StickyNote,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { Fragment } from "react";
import { RunnerMarkdown } from "../shared/runner-markdown.js";
import type { RunnerLog } from "../../../../types.js";
import { CompactActionLogLine } from "./compact-action-log-line.js";
import {
  buildMetronomeWorkflowBranchMiniMap,
  buildMetronomeWorkflowLinearPath,
  buildMetronomeWorkflowPathAroundActive,
  getMetronomeWorkflowRecord,
  getMetronomeWorkflowStepNodeIds,
  normalizeMetronomeWorkflowMiniMap,
} from "./metronome-workflow-state.js";

function getMetronomeWorkflowMiniNodeIcon(kind: string): ReactNode {
  const normalizedKind = String(kind || "").toLowerCase();
  if (normalizedKind === "trigger") {
    return <Zap className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "thread" || normalizedKind === "action") {
    return <Play className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "condition") {
    return <Split className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "imagine") {
    return <Clapperboard className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "function") {
    return <Code2 className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "firecrawl") {
    return <Flame className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "database") {
    return <HardDrive className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "metronome") {
    return <Metronome className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "loop") {
    return <RefreshCw className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "ticket") {
    return <Bookmark className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "note") {
    return <StickyNote className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  if (normalizedKind === "end") {
    return <Square className="tb-log-card-small-icon" strokeWidth={1.8} />;
  }
  return <FileText className="tb-log-card-small-icon" strokeWidth={1.8} />;
}

export function MetronomeWorkflowLogBox({ log }: { log: RunnerLog; timeLabel?: string }) {
  const workflow = getMetronomeWorkflowRecord(log);
  const workflowTitle = String(workflow?.metronomeName || "").trim() || "Workflow";
  const userMessage = String(
    workflow?.userMessage || workflow?.displayMessage || workflow?.inputPrompt || "",
  ).trim();
  const workflowId = String(workflow?.metronomeId || workflow?.workflowId || "").trim();
  const runId = String(workflow?.runId || "").trim();
  const { nodes, edges, startNodeId } = normalizeMetronomeWorkflowMiniMap(workflow);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const stepNodeIds = getMetronomeWorkflowStepNodeIds(workflow);
  const activeNodeId =
    String(workflow?.activeNodeId || "").trim() ||
    stepNodeIds[stepNodeIds.length - 1] ||
    startNodeId ||
    null;
  let path = buildMetronomeWorkflowLinearPath({
    nodes,
    edges,
    startNodeId,
    stepNodeIds,
  });
  if (activeNodeId && !path.includes(activeNodeId)) {
    path = buildMetronomeWorkflowPathAroundActive({
      activeNodeId,
      edges,
    });
  }
  const branchMiniMap = buildMetronomeWorkflowBranchMiniMap({
    activeNodeId,
    path,
    nodes,
    edges,
  });
  const activeIndex = activeNodeId ? Math.max(0, path.indexOf(activeNodeId)) : 0;
  const rawSlots = [-2, -1, 0, 1, 2].map((offset) => {
    const id = path[activeIndex + offset];
    return {
      node: id ? nodeById.get(id) || null : null,
      offset,
    };
  });
  const firstVisibleSlotIndex = rawSlots.findIndex((slot) => slot.node);
  const lastVisibleSlotIndex =
    rawSlots.length -
    1 -
    rawSlots
      .slice()
      .reverse()
      .findIndex((slot) => slot.node);
  const slots =
    firstVisibleSlotIndex === -1
      ? rawSlots
      : rawSlots.slice(firstVisibleSlotIndex, lastVisibleSlotIndex + 1);
  const edgeExistsBetween = (source?: string, target?: string) => {
    if (!source || !target) return false;
    return (
      edges.some((edge) => edge.source === source && edge.target === target) ||
      stepNodeIds.some((nodeId, index) => nodeId === source && stepNodeIds[index + 1] === target)
    );
  };
  const openWorkflowRuns = () => {
    if (!workflowId || typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("playground:open-metronome-workflow", {
        detail: {
          workflowId,
          runId,
          mode: "runs",
        },
      }),
    );
  };

  if (!nodes.length) {
    return (
      <CompactActionLogLine
        icon={<Metronome className="tb-log-card-small-icon" strokeWidth={1.5} />}
        title={workflowTitle}
        detail="Workflow triggered"
      />
    );
  }

  return (
    <div className="tb-log-card tb-log-card-metronome-workflow">
      <button
        type="button"
        className="tb-log-metronome-workflow-link"
        onClick={openWorkflowRuns}
        disabled={!workflowId}
        title={workflowId ? "Open Metronome runs" : undefined}
      >
        <span className="tb-log-metronome-workflow-header">
          <span className="tb-log-compact-action-icon" aria-hidden="true">
            <Metronome className="tb-log-card-small-icon" strokeWidth={1.5} />
          </span>
          <span className="tb-log-compact-action-title">{workflowTitle}</span>
        </span>
        <span
          className="tb-log-metronome-minimap"
          role="img"
          aria-label="Metronome workflow progress"
        >
          {branchMiniMap ? (
            <span
              className="tb-log-metronome-minimap-branch"
              style={{
                width: branchMiniMap.width,
                height: branchMiniMap.height,
              }}
            >
              <svg
                className="tb-log-metronome-minimap-branch-lines"
                width={branchMiniMap.width}
                height={branchMiniMap.height}
                viewBox={`0 0 ${branchMiniMap.width} ${branchMiniMap.height}`}
                aria-hidden="true"
              >
                {branchMiniMap.links.map((link) => {
                  const delta = Math.max(
                    24,
                    Math.min(60, Math.abs(link.targetX - link.sourceX) * 0.45),
                  );
                  return (
                    <path
                      key={`${link.source}->${link.target}`}
                      d={`M ${link.sourceX} ${link.sourceY} C ${link.sourceX + delta} ${link.sourceY}, ${link.targetX - delta} ${link.targetY}, ${link.targetX} ${link.targetY}`}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
              {branchMiniMap.items.map(({ node, x, y }) => (
                <span
                  key={node.id}
                  className={`tb-log-metronome-minimap-slot is-branch-node ${
                    node.id === branchMiniMap.condition.id ? "is-condition-slot" : ""
                  }`.trim()}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <span
                    className={`tb-log-metronome-minimap-node ${
                      node.id === activeNodeId ? "is-active" : ""
                    }`.trim()}
                  >
                    <span
                      className={`tb-log-metronome-minimap-node-icon is-${node.kind}`}
                      aria-hidden="true"
                    >
                      {getMetronomeWorkflowMiniNodeIcon(node.kind)}
                    </span>
                    <span className="tb-log-metronome-minimap-node-title" title={node.label}>
                      {node.label}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          ) : (
            <span className="tb-log-metronome-minimap-track">
              {slots.map(({ node, offset }, index) => {
                const previousNode = index > 0 ? slots[index - 1]?.node : null;
                const connector =
                  index > 0 ? (
                    <span
                      key={`connector-${offset}`}
                      className={`tb-log-metronome-minimap-connector ${
                        edgeExistsBetween(previousNode?.id, node?.id) ? "" : "is-empty"
                      }`.trim()}
                      aria-hidden="true"
                    />
                  ) : null;
                return (
                  <Fragment key={`slot-${offset}`}>
                    {connector}
                    <span className="tb-log-metronome-minimap-slot">
                      {node ? (
                        <span
                          className={`tb-log-metronome-minimap-node ${
                            node.id === activeNodeId ? "is-active" : ""
                          }`.trim()}
                        >
                          <span
                            className={`tb-log-metronome-minimap-node-icon is-${node.kind}`}
                            aria-hidden="true"
                          >
                            {getMetronomeWorkflowMiniNodeIcon(node.kind)}
                          </span>
                          <span className="tb-log-metronome-minimap-node-title" title={node.label}>
                            {node.label}
                          </span>
                        </span>
                      ) : (
                        <span
                          className="tb-log-metronome-minimap-node is-placeholder"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </Fragment>
                );
              })}
            </span>
          )}
        </span>
      </button>
      {userMessage ? (
        <div className="task-prompt-in-session-context tb-log-metronome-user-message">
          <RunnerMarkdown
            content={userMessage}
            className="tb-message-markdown tb-message-markdown-user tb-log-metronome-user-message-markdown"
            softBreaks
            disallowHeadings
          />
        </div>
      ) : null}
    </div>
  );
}
