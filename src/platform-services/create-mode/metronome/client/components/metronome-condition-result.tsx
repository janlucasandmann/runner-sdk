import { useId } from "react";
import { Split as LucideSplit } from "lucide-react";

type UnknownRecord = Record<string, unknown>;

export interface MetronomeConditionOption {
  id: string;
  label: string;
  selected?: boolean;
}

export interface MetronomeConditionResultProps {
  conditionLabel: string;
  options: MetronomeConditionOption[];
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function normalizeText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function normalizeComparable(value: unknown): string {
  const normalized = normalizeText(value).toLowerCase();
  return normalized === "else" || normalized === "fallback" ? "default" : normalized;
}

function formatRuleLabel(value: unknown): string {
  const normalized = normalizeText(value)
    .replace(/^matched json rule:\s*/i, "")
    .replace(/^\$\.?/, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : "";
}

function readNodeLabel(node: UnknownRecord): string {
  const data = asRecord(node.data);
  const config = asRecord(data.config || node.config);
  return normalizeText(
    data.label
      || data.name
      || data.nodeName
      || config.label
      || config.name
      || node.label
      || node.name,
  );
}

function readConditionType(node: UnknownRecord): string {
  const data = asRecord(node.data);
  const config = asRecord(data.config || node.config);
  return normalizeText(
    config.conditionType
      || config.condition_type
      || data.subtype
      || node.subtype,
  ).toLowerCase();
}

function readConfiguredOptions(step: UnknownRecord, node: UnknownRecord): MetronomeConditionOption[] {
  const output = asRecord(step.output);
  const data = asRecord(node.data);
  const config = asRecord(data.config || node.config);
  const conditionType = readConditionType(node);
  const rawOptions = [
    step.conditionOptions,
    step.condition_options,
    output.conditionOptions,
    output.condition_options,
    config.conditions,
    config.branches,
  ].find(Array.isArray) as unknown[] | undefined;

  if (conditionType === "database_document_field" || conditionType === "ticket_status") {
    return [
      { id: "true", label: "True" },
      { id: "false", label: "False" },
    ];
  }

  const options = (rawOptions || []).map((candidate, index) => {
    const option = asRecord(candidate);
    const rawCandidate = normalizeText(candidate);
    const id = normalizeText(option.id || option.value) || `condition-${index + 1}`;
    const isDefault = normalizeComparable(id) === "default"
      || normalizeComparable(option.label || option.name) === "default";
    const configuredLabel = normalizeText(option.label || option.name || rawCandidate);
    const ruleLabel = formatRuleLabel(option.rule || option.expression || option.value);
    return {
      id: isDefault ? "else" : id,
      label: isDefault
        ? "Default"
        : configuredLabel || ruleLabel || `Option ${index + 1}`,
    };
  });

  if (node && Object.keys(node).length && !options.some((option) => option.id === "else")) {
    options.push({ id: "else", label: "Default" });
  }
  return options;
}

/**
 * Converts a condition execution step plus its immutable workflow node into
 * the small presentation contract consumed by MetronomeConditionResult.
 */
export function buildMetronomeConditionResultPresentation(
  rawStep: unknown,
  rawNode?: unknown,
): MetronomeConditionResultProps {
  const step = asRecord(rawStep);
  const output = asRecord(step.output);
  const branch = asRecord(output.branch);
  const node = asRecord(rawNode || step.conditionNode || step.condition_node);
  const selectedId = normalizeText(
    step.branchId
      || step.branch_id
      || output.branchId
      || output.branch_id
      || branch.id,
  );
  const selectedLabel = normalizeText(
    step.branchLabel
      || step.branch_label
      || output.branchLabel
      || output.branch_label
      || branch.label
      || output.selectedBranchLabel
      || output.selectedBranch,
  ) || "Default";
  const comparableSelectedId = normalizeComparable(selectedId);
  const comparableSelectedLabel = normalizeComparable(selectedLabel);
  const options = readConfiguredOptions(step, node);

  let didSelectOption = false;
  const normalizedOptions = options.map((option) => {
    const selected = Boolean(
      (comparableSelectedId && normalizeComparable(option.id) === comparableSelectedId)
      || (!comparableSelectedId && normalizeComparable(option.label) === comparableSelectedLabel),
    );
    if (selected) didSelectOption = true;
    return { ...option, selected };
  });

  if (!didSelectOption) {
    normalizedOptions.push({
      id: selectedId || (comparableSelectedLabel === "default" ? "else" : selectedLabel),
      label: comparableSelectedLabel === "default" ? "Default" : selectedLabel,
      selected: true,
    });
  }

  return {
    conditionLabel: readNodeLabel(node)
      || normalizeText(step.nodeLabel || step.nodeName || step.label)
      || "Condition",
    options: normalizedOptions,
  };
}

/**
 * Compact, non-technical presentation for a completed condition node.
 * It mirrors the workflow canvas node and shows every possible path without
 * exposing downstream nodes, edge identifiers, rules, or execution JSON.
 */
export function MetronomeConditionResult({
  conditionLabel,
  options,
}: MetronomeConditionResultProps) {
  const normalizedConditionLabel = normalizeText(conditionLabel) || "Condition";
  const normalizedOptions = Array.isArray(options) && options.length
    ? options
    : [{ id: "else", label: "Default", selected: true }];
  const branchRowHeight = 38;
  const branchRowGap = 12;
  const branchConnectorWidth = 40;
  const branchTrunkX = 8;
  const branchCurveEndX = 29;
  const branchEndX = 35;
  const branchHeight = normalizedOptions.length * branchRowHeight
    + Math.max(0, normalizedOptions.length - 1) * branchRowGap;
  const branchOriginY = branchHeight / 2;
  const getBranchCenterY = (index: number) => (
    branchRowHeight / 2 + index * (branchRowHeight + branchRowGap)
  );
  const getBranchPath = (index: number) => {
    const branchCenterY = getBranchCenterY(index);
    return [
      `M 0 ${branchOriginY}`,
      `H ${branchTrunkX}`,
      `C ${branchTrunkX + 8} ${branchOriginY}`,
      `${branchCurveEndX - 8} ${branchCenterY}`,
      `${branchCurveEndX} ${branchCenterY}`,
      `H ${branchEndX}`,
    ].join(" ");
  };
  const selectedOptionIndex = normalizedOptions.findIndex((option) => option.selected);
  const markerNamespace = useId().replace(/:/g, "");
  const defaultArrowId = `${markerNamespace}-condition-arrow`;
  const selectedArrowId = `${markerNamespace}-condition-arrow-selected`;

  return (
    <section
      className="playground-metronome-condition-result"
      aria-label={`Decision from ${normalizedConditionLabel}`}
    >
      <div className="playground-metronome-condition-result__condition-node">
        <span className="playground-metronome-condition-result__node-icon" aria-hidden="true">
          <LucideSplit />
        </span>
        <span className="playground-metronome-condition-result__node-title">
          {normalizedConditionLabel}
        </span>
      </div>

      <span className="playground-metronome-condition-result__connector" aria-hidden="true">
        <svg
          viewBox={`0 0 ${branchConnectorWidth} ${branchHeight}`}
          preserveAspectRatio="none"
          focusable="false"
        >
          <defs>
            <marker
              id={defaultArrowId}
              viewBox="0 0 6 6"
              refX="5.5"
              refY="3"
              markerWidth="6"
              markerHeight="6"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path
                className="playground-metronome-condition-result__branch-arrow"
                d="M 0 0.5 L 5.5 3 L 0 5.5 Z"
              />
            </marker>
            <marker
              id={selectedArrowId}
              viewBox="0 0 6 6"
              refX="5.5"
              refY="3"
              markerWidth="6"
              markerHeight="6"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path
                className="playground-metronome-condition-result__branch-arrow is-selected"
                d="M 0 0.5 L 5.5 3 L 0 5.5 Z"
              />
            </marker>
          </defs>
          {normalizedOptions.map((option, index) => (
            <path
              key={`branch-${option.id || index}`}
              className="playground-metronome-condition-result__branch-line"
              d={getBranchPath(index)}
              markerEnd={`url(#${defaultArrowId})`}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {selectedOptionIndex >= 0 ? (
            <path
              className="playground-metronome-condition-result__branch-line is-selected"
              d={getBranchPath(selectedOptionIndex)}
              markerEnd={`url(#${selectedArrowId})`}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>
      </span>

      <div className="playground-metronome-condition-result__options" aria-label="Available paths">
        {normalizedOptions.map((option, index) => (
          <div
            key={`${option.id || "option"}-${index}`}
            className={`playground-metronome-condition-result__option${option.selected ? " is-selected" : ""}`}
            aria-current={option.selected ? "step" : undefined}
          >
            <span className="playground-metronome-condition-result__option-label">
              {normalizeText(option.label) || `Option ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
