import { Copy, Share2, SquarePen, Trash2 } from "../../components/ui/hugeicons-compat.js";
import type {
  PlatformDataTableAction,
  PlatformDataTableRowActionState,
} from "../../components/composite/data-table/index.js";

export type ResourceOverviewCanonicalActionId =
  | "edit"
  | "duplicate"
  | "share"
  | "delete";

export interface CreateResourceOverviewRowActionsOptions<TData> {
  row: TData;
  state: PlatformDataTableRowActionState<TData>;
  actions?: readonly PlatformDataTableAction<TData>[];
  onEdit?: (row: TData) => void;
  disabled?: boolean;
}

interface ResourceOverviewCanonicalActionSpec {
  id: ResourceOverviewCanonicalActionId;
  label: string;
  selectedLabel: string;
  icon: typeof SquarePen;
  danger?: boolean;
}

const CANONICAL_ACTION_SPECS: Record<
  ResourceOverviewCanonicalActionId,
  ResourceOverviewCanonicalActionSpec
> = {
  edit: {
    id: "edit",
    label: "Edit",
    selectedLabel: "Edit selected",
    icon: SquarePen,
  },
  duplicate: {
    id: "duplicate",
    label: "Duplicate",
    selectedLabel: "Duplicate selected",
    icon: Copy,
  },
  share: {
    id: "share",
    label: "Share",
    selectedLabel: "Share selected",
    icon: Share2,
  },
  delete: {
    id: "delete",
    label: "Delete",
    selectedLabel: "Delete selected",
    icon: Trash2,
    danger: true,
  },
};

function isActionIdMatch(actionId: string, candidate: string): boolean {
  const normalizedActionId = actionId.trim().toLowerCase();
  return (
    normalizedActionId === candidate ||
    normalizedActionId.startsWith(`${candidate}-`) ||
    normalizedActionId.startsWith(`${candidate}_`)
  );
}

function isSuppressedLegacyAction<TData>(
  action: PlatformDataTableAction<TData>,
): boolean {
  if (
    isActionIdMatch(action.id, "open") ||
    isActionIdMatch(action.id, "rename")
  ) {
    return true;
  }

  if (typeof action.label !== "string") return false;
  return /^(?:open|rename)(?:\b|$)/i.test(action.label.trim());
}

function createUnavailableAction<TData>(
  spec: ResourceOverviewCanonicalActionSpec,
): PlatformDataTableAction<TData> {
  return {
    id: spec.id,
    label: spec.label,
    icon: spec.icon,
    danger: spec.danger,
    separatorBefore: spec.id === "delete",
    disabled: true,
    onSelect: () => undefined,
    selectedRows: {
      label: spec.selectedLabel,
      icon: spec.icon,
      danger: spec.danger,
      separatorBefore: spec.id === "delete",
      disabled: true,
      onSelect: () => undefined,
    },
  };
}

function normalizeCanonicalAction<TData>(
  action: PlatformDataTableAction<TData>,
  spec: ResourceOverviewCanonicalActionSpec,
  disabled: boolean,
): PlatformDataTableAction<TData> {
  return {
    ...action,
    id: spec.id,
    label: spec.label,
    icon: spec.icon,
    danger: spec.danger,
    separatorBefore: spec.id === "delete",
    disabled: disabled || action.disabled,
    selectedRows: action.selectedRows
      ? {
          ...action.selectedRows,
          label: spec.selectedLabel,
          icon: spec.icon,
          danger: spec.danger,
          separatorBefore: spec.id === "delete",
          disabled: disabled || action.selectedRows.disabled,
        }
      : {
          label: spec.selectedLabel,
          icon: spec.icon,
          danger: spec.danger,
          separatorBefore: spec.id === "delete",
          disabled: true,
          onSelect: () => undefined,
        },
  };
}

/**
 * Builds the minimum resource action set shared by overview row menus. Domain
 * callbacks remain owned by each resource; aliases such as Open, Copy, and
 * Rename are promoted into the canonical Edit/Duplicate slots. Legacy Open and
 * Rename rows are suppressed even when a dedicated Edit action exists. Missing
 * domain capabilities remain visible but disabled so every catalog has a
 * predictable action layout without inventing mutations.
 */
export function createResourceOverviewRowActions<TData>({
  row,
  state,
  actions = [],
  onEdit,
  disabled = false,
}: CreateResourceOverviewRowActionsOptions<TData>): readonly PlatformDataTableAction<TData>[] {
  const consumedActionIndexes = new Set<number>();
  const findAction = (candidates: readonly string[]) => {
    for (const candidate of candidates) {
      const actionIndex = actions.findIndex(
        (action, index) =>
          !consumedActionIndexes.has(index) &&
          !action.hidden &&
          isActionIdMatch(action.id, candidate),
      );
      if (actionIndex >= 0) {
        consumedActionIndexes.add(actionIndex);
        return actions[actionIndex];
      }
    }
    return undefined;
  };

  const editSpec = CANONICAL_ACTION_SPECS.edit;
  const editSource =
    findAction(["edit"]) ||
    findAction(["open", "view"]) ||
    (onEdit
      ? {
          id: editSpec.id,
          label: editSpec.label,
          onSelect: () => onEdit(row),
        }
      : findAction(["rename"]));
  const duplicateSource = findAction(["duplicate", "copy", "clone"]);
  const shareSource = findAction(["share"]);
  const deleteSource = findAction(["delete"]);

  const canonicalAction = (
    source: PlatformDataTableAction<TData> | undefined,
    spec: ResourceOverviewCanonicalActionSpec,
  ) =>
    source
      ? normalizeCanonicalAction(source, spec, disabled)
      : createUnavailableAction<TData>(spec);

  const extraActions = actions.filter(
    (action, index) =>
      !consumedActionIndexes.has(index) &&
      !isSuppressedLegacyAction(action),
  );

  return [
    canonicalAction(editSource, editSpec),
    canonicalAction(duplicateSource, CANONICAL_ACTION_SPECS.duplicate),
    canonicalAction(shareSource, CANONICAL_ACTION_SPECS.share),
    ...extraActions,
    canonicalAction(deleteSource, CANONICAL_ACTION_SPECS.delete),
  ].map((action) => {
    if (state.targetRows.length <= 1 || action.selectedRows) return action;
    return {
      ...action,
      selectedRows: {
        label: action.label,
        icon: action.icon,
        danger: action.danger,
        separatorBefore: action.separatorBefore,
        disabled: true,
        onSelect: () => undefined,
      },
    };
  });
}
