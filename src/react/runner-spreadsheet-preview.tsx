import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import {
  LoaderCircle as LucideLoaderCircle,
  Table2 as LucideTable2,
} from "lucide-react";
import {
  canSerializeRunnerSpreadsheetFile,
  formatRunnerSpreadsheetWorkbookCode,
  getRunnerSpreadsheetColumnLabel,
  parseRunnerSpreadsheetBlob,
  serializeRunnerSpreadsheetWorkbook,
  type RunnerSpreadsheetCodePreview,
  type RunnerSpreadsheetCellValue,
  type RunnerSpreadsheetSheet,
  type RunnerSpreadsheetWorkbook,
} from "./runner-spreadsheet-utils.js";

export interface RunnerSpreadsheetSaveOptions {
  filename: string;
  mimeType: string;
  workbook?: RunnerSpreadsheetWorkbook;
}

export interface RunnerSpreadsheetPreviewControls {
  canRedo: boolean;
  canRevert: boolean;
  canSave: boolean;
  canUndo: boolean;
  codeLanguage: string;
  codeText: string;
  isDirty: boolean;
  isSaving: boolean;
  saveMessage: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onRedo: () => void;
  onRevert: () => void;
  onSave: () => void;
  onUndo: () => void;
}

export interface RunnerSpreadsheetPreviewProps {
  blob?: Blob | null;
  filename: string;
  mimeType?: string | null;
  editable?: boolean;
  className?: string;
  onSave?: (blob: Blob, options: RunnerSpreadsheetSaveOptions) => Promise<void> | void;
  onControlsChange?: (controls: RunnerSpreadsheetPreviewControls | null) => void;
}

interface RunnerSpreadsheetLoadState {
  status: "idle" | "loading" | "ready" | "error";
  workbook: RunnerSpreadsheetWorkbook | null;
  error: string;
}

const RUNNER_SPREADSHEET_MIN_VISIBLE_ROWS = 36;
const RUNNER_SPREADSHEET_MIN_VISIBLE_COLUMNS = 12;
const RUNNER_SPREADSHEET_EXTRA_ROWS = 24;
const RUNNER_SPREADSHEET_EXTRA_COLUMNS = 8;
const RUNNER_SPREADSHEET_MAX_RENDERED_ROWS = 1500;
const RUNNER_SPREADSHEET_MAX_RENDERED_COLUMNS = 120;

function cloneRunnerSpreadsheetSheets(sheets: RunnerSpreadsheetSheet[]): RunnerSpreadsheetSheet[] {
  return sheets.map((sheet) => ({
    name: sheet.name,
    rows: sheet.rows.map((row) => [...row]),
  }));
}

function serializeRunnerSpreadsheetSheetsForComparison(sheets: RunnerSpreadsheetSheet[]): string {
  return JSON.stringify(sheets.map((sheet) => ({
    name: sheet.name,
    rows: sheet.rows,
  })));
}

function getRunnerSpreadsheetSheetColumnCount(sheet: RunnerSpreadsheetSheet | null): number {
  if (!sheet) return RUNNER_SPREADSHEET_MIN_VISIBLE_COLUMNS;
  return sheet.rows.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
}

function splitSpreadsheetClipboardRows(text: string): string[][] {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((row, index, rows) => index < rows.length - 1 || row.length > 0)
    .map((row) => row.split("\t"));
}

export function RunnerSpreadsheetPreview({
  blob,
  filename,
  mimeType,
  editable = false,
  className,
  onSave,
  onControlsChange,
}: RunnerSpreadsheetPreviewProps) {
  const [loadState, setLoadState] = useState<RunnerSpreadsheetLoadState>({
    status: "idle",
    workbook: null,
    error: "",
  });
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [draftSheets, setDraftSheets] = useState<RunnerSpreadsheetSheet[]>([]);
  const [initialSheets, setInitialSheets] = useState<RunnerSpreadsheetSheet[]>([]);
  const [saveState, setSaveState] = useState<{
    status: "idle" | "saving" | "saved" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });
  const gridRef = useRef<HTMLDivElement | null>(null);
  const spreadsheetHistoryRef = useRef<{
    past: RunnerSpreadsheetSheet[][];
    future: RunnerSpreadsheetSheet[][];
    current: RunnerSpreadsheetSheet[];
    isApplying: boolean;
  }>({
    past: [],
    future: [],
    current: [],
    isApplying: false,
  });
  const [spreadsheetHistoryAvailability, setSpreadsheetHistoryAvailability] = useState({
    canUndo: false,
    canRedo: false,
  });

  function updateSpreadsheetHistoryAvailability() {
    const history = spreadsheetHistoryRef.current;
    setSpreadsheetHistoryAvailability({
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    });
  }

  function resetSpreadsheetHistory(sheets: RunnerSpreadsheetSheet[]) {
    spreadsheetHistoryRef.current = {
      past: [],
      future: [],
      current: cloneRunnerSpreadsheetSheets(sheets),
      isApplying: false,
    };
    setSpreadsheetHistoryAvailability({
      canUndo: false,
      canRedo: false,
    });
  }

  function recordSpreadsheetHistorySheets(nextSheets: RunnerSpreadsheetSheet[]) {
    const history = spreadsheetHistoryRef.current;
    if (history.isApplying) {
      return;
    }
    const currentSerialized = serializeRunnerSpreadsheetSheetsForComparison(history.current);
    const nextSerialized = serializeRunnerSpreadsheetSheetsForComparison(nextSheets);
    if (currentSerialized === nextSerialized) {
      return;
    }
    history.past = [...history.past, cloneRunnerSpreadsheetSheets(history.current)].slice(-200);
    history.future = [];
    history.current = cloneRunnerSpreadsheetSheets(nextSheets);
    updateSpreadsheetHistoryAvailability();
  }

  function applySpreadsheetHistorySheets(nextSheets: RunnerSpreadsheetSheet[]) {
    const normalizedSheets = cloneRunnerSpreadsheetSheets(nextSheets);
    const history = spreadsheetHistoryRef.current;
    history.current = cloneRunnerSpreadsheetSheets(normalizedSheets);
    history.isApplying = true;
    setDraftSheets(normalizedSheets);
    setSaveState({ status: "idle", message: "" });
    window.requestAnimationFrame(() => {
      history.isApplying = false;
      updateSpreadsheetHistoryAvailability();
    });
  }

  useEffect(() => {
    let cancelled = false;

    if (!blob) {
      setLoadState({
        status: "error",
        workbook: null,
        error: "Spreadsheet preview unavailable.",
      });
      onControlsChange?.(null);
      return;
    }

    onControlsChange?.(null);
    setLoadState({
      status: "loading",
      workbook: null,
      error: "",
    });
    setDraftSheets([]);
    setInitialSheets([]);
    setActiveSheetIndex(0);
    setSaveState({ status: "idle", message: "" });
    resetSpreadsheetHistory([]);

    void parseRunnerSpreadsheetBlob(blob, filename, mimeType)
      .then((workbook) => {
        if (cancelled) return;
        const nextSheets = cloneRunnerSpreadsheetSheets(workbook.sheets);
        setLoadState({
          status: "ready",
          workbook,
          error: "",
        });
        setDraftSheets(nextSheets);
        setInitialSheets(cloneRunnerSpreadsheetSheets(nextSheets));
        resetSpreadsheetHistory(nextSheets);
        setActiveSheetIndex(0);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadState({
          status: "error",
          workbook: null,
          error: error instanceof Error ? error.message : "Failed to parse spreadsheet.",
        });
        onControlsChange?.(null);
      });

    return () => {
      cancelled = true;
    };
  }, [blob, filename, mimeType, onControlsChange]);

  const activeSheet = draftSheets[Math.max(0, Math.min(draftSheets.length - 1, activeSheetIndex))] || null;
  const canSave = Boolean(editable && onSave && canSerializeRunnerSpreadsheetFile(filename, mimeType));
  const isDirty = useMemo(
    () => serializeRunnerSpreadsheetSheetsForComparison(draftSheets) !== serializeRunnerSpreadsheetSheetsForComparison(initialSheets),
    [draftSheets, initialSheets]
  );
  const sourceWorkbook = useMemo<RunnerSpreadsheetWorkbook | null>(() => {
    if (!loadState.workbook) return null;
    return {
      ...loadState.workbook,
      sheets: draftSheets,
    };
  }, [draftSheets, loadState.workbook]);

  const visibleRowCount = activeSheet
    ? Math.min(
        RUNNER_SPREADSHEET_MAX_RENDERED_ROWS,
        Math.max(RUNNER_SPREADSHEET_MIN_VISIBLE_ROWS, activeSheet.rows.length + RUNNER_SPREADSHEET_EXTRA_ROWS)
      )
    : RUNNER_SPREADSHEET_MIN_VISIBLE_ROWS;
  const visibleColumnCount = activeSheet
    ? Math.min(
        RUNNER_SPREADSHEET_MAX_RENDERED_COLUMNS,
        Math.max(
          RUNNER_SPREADSHEET_MIN_VISIBLE_COLUMNS,
          getRunnerSpreadsheetSheetColumnCount(activeSheet) + RUNNER_SPREADSHEET_EXTRA_COLUMNS
        )
      )
    : RUNNER_SPREADSHEET_MIN_VISIBLE_COLUMNS;
  const isRenderedRangeLimited = Boolean(
    activeSheet &&
    (
      activeSheet.rows.length + RUNNER_SPREADSHEET_EXTRA_ROWS > RUNNER_SPREADSHEET_MAX_RENDERED_ROWS ||
      getRunnerSpreadsheetSheetColumnCount(activeSheet) + RUNNER_SPREADSHEET_EXTRA_COLUMNS > RUNNER_SPREADSHEET_MAX_RENDERED_COLUMNS
    )
  );

  const updateCell = useCallback((rowIndex: number, columnIndex: number, value: RunnerSpreadsheetCellValue) => {
    if (!editable) return;
    setDraftSheets((currentSheets) => {
      const nextSheets = cloneRunnerSpreadsheetSheets(currentSheets);
      const targetSheet = nextSheets[activeSheetIndex];
      if (!targetSheet) return currentSheets;
      while (targetSheet.rows.length <= rowIndex) {
        targetSheet.rows.push([]);
      }
      const row = [...(targetSheet.rows[rowIndex] || [])];
      while (row.length <= columnIndex) {
        row.push("");
      }
      row[columnIndex] = String(value ?? "");
      targetSheet.rows[rowIndex] = row;
      recordSpreadsheetHistorySheets(nextSheets);
      return nextSheets;
    });
    setSaveState({ status: "idle", message: "" });
  }, [activeSheetIndex, editable]);

  const updateCellsFromClipboard = useCallback((startRowIndex: number, startColumnIndex: number, values: string[][]) => {
    if (!editable || values.length === 0) return;
    setDraftSheets((currentSheets) => {
      const nextSheets = cloneRunnerSpreadsheetSheets(currentSheets);
      const targetSheet = nextSheets[activeSheetIndex];
      if (!targetSheet) return currentSheets;
      values.forEach((valueRow, valueRowIndex) => {
        const rowIndex = startRowIndex + valueRowIndex;
        while (targetSheet.rows.length <= rowIndex) {
          targetSheet.rows.push([]);
        }
        const row = [...(targetSheet.rows[rowIndex] || [])];
        valueRow.forEach((value, valueColumnIndex) => {
          const columnIndex = startColumnIndex + valueColumnIndex;
          while (row.length <= columnIndex) {
            row.push("");
          }
          row[columnIndex] = value;
        });
        targetSheet.rows[rowIndex] = row;
      });
      recordSpreadsheetHistorySheets(nextSheets);
      return nextSheets;
    });
    setSaveState({ status: "idle", message: "" });
  }, [activeSheetIndex, editable]);

  function focusCell(rowIndex: number, columnIndex: number) {
    const grid = gridRef.current;
    if (!grid) return;
    const nextInput = grid.querySelector<HTMLInputElement>(
      `[data-runner-spreadsheet-cell="${rowIndex}:${columnIndex}"]`
    );
    nextInput?.focus();
    nextInput?.select();
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) {
    if (event.key === "Enter") {
      event.preventDefault();
      focusCell(Math.max(0, rowIndex + (event.shiftKey ? -1 : 1)), columnIndex);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const direction = event.shiftKey ? -1 : 1;
      const nextColumnIndex = columnIndex + direction;
      if (nextColumnIndex < 0) {
        focusCell(Math.max(0, rowIndex - 1), Math.max(0, visibleColumnCount - 1));
      } else if (nextColumnIndex >= visibleColumnCount) {
        focusCell(rowIndex + 1, 0);
      } else {
        focusCell(rowIndex, nextColumnIndex);
      }
    }
  }

  function handleCellPaste(event: ClipboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) {
    const text = event.clipboardData.getData("text/plain");
    if (!text || (!text.includes("\t") && !text.includes("\n") && !text.includes("\r"))) {
      return;
    }
    event.preventDefault();
    updateCellsFromClipboard(rowIndex, columnIndex, splitSpreadsheetClipboardRows(text));
  }

  const spreadsheetCodePreview = useMemo<RunnerSpreadsheetCodePreview>(() => {
    if (!sourceWorkbook) {
      return { text: "", language: "json" };
    }
    return formatRunnerSpreadsheetWorkbookCode(sourceWorkbook, activeSheetIndex);
  }, [activeSheetIndex, sourceWorkbook]);

  const handleRevert = useCallback(() => {
    setDraftSheets(cloneRunnerSpreadsheetSheets(initialSheets));
    resetSpreadsheetHistory(initialSheets);
    setSaveState({ status: "idle", message: "" });
  }, [initialSheets]);

  const handleUndo = useCallback(() => {
    const history = spreadsheetHistoryRef.current;
    const previousSheets = history.past.pop();
    if (!previousSheets) {
      updateSpreadsheetHistoryAvailability();
      return;
    }
    history.future.push(cloneRunnerSpreadsheetSheets(history.current));
    applySpreadsheetHistorySheets(previousSheets);
  }, []);

  const handleRedo = useCallback(() => {
    const history = spreadsheetHistoryRef.current;
    const nextSheets = history.future.pop();
    if (!nextSheets) {
      updateSpreadsheetHistoryAvailability();
      return;
    }
    history.past.push(cloneRunnerSpreadsheetSheets(history.current));
    applySpreadsheetHistorySheets(nextSheets);
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave || !sourceWorkbook || saveState.status === "saving") {
      return;
    }

    setSaveState({ status: "saving", message: "" });

    try {
      const serialized = await serializeRunnerSpreadsheetWorkbook(sourceWorkbook, {
        filename,
        mimeType,
        activeSheetIndex,
      });
      await Promise.resolve(onSave?.(serialized.blob, {
        filename: serialized.filename,
        mimeType: serialized.mimeType,
        workbook: sourceWorkbook,
      }));
      setInitialSheets(cloneRunnerSpreadsheetSheets(draftSheets));
      setSaveState({ status: "saved", message: "Saved" });
    } catch (error) {
      setSaveState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to save spreadsheet.",
      });
    }
  }, [activeSheetIndex, canSave, draftSheets, filename, mimeType, onSave, saveState.status, sourceWorkbook]);

  useEffect(() => {
    if (!onControlsChange || loadState.status !== "ready" || !activeSheet) {
      if (onControlsChange && loadState.status !== "ready") {
        onControlsChange(null);
      }
      return;
    }

    onControlsChange({
      canRedo: spreadsheetHistoryAvailability.canRedo && saveState.status !== "saving",
      canRevert: isDirty && saveState.status !== "saving",
      canSave,
      canUndo: spreadsheetHistoryAvailability.canUndo && saveState.status !== "saving",
      codeLanguage: spreadsheetCodePreview.language,
      codeText: spreadsheetCodePreview.text,
      isDirty,
      isSaving: saveState.status === "saving",
      saveMessage: saveState.message,
      saveStatus: saveState.status,
      onRedo: handleRedo,
      onRevert: handleRevert,
      onSave: () => {
        void handleSave();
      },
      onUndo: handleUndo,
    });
  }, [
    activeSheet,
    canSave,
    handleRedo,
    handleRevert,
    handleSave,
    handleUndo,
    isDirty,
    loadState.status,
    onControlsChange,
    saveState.message,
    saveState.status,
    spreadsheetHistoryAvailability.canRedo,
    spreadsheetHistoryAvailability.canUndo,
    spreadsheetCodePreview.language,
    spreadsheetCodePreview.text,
  ]);

  if (loadState.status === "loading" || loadState.status === "idle") {
    return (
      <div className="tb-attachment-preview-state">
        <LucideLoaderCircle className="tb-attachment-preview-state-icon tb-context-action-notice-icon-spinner" strokeWidth={1.8} />
        <span>Preparing spreadsheet…</span>
      </div>
    );
  }

  if (loadState.status === "error" || !activeSheet) {
    return (
      <div className="tb-attachment-preview-state tb-attachment-preview-state-error">
        <LucideTable2 className="tb-attachment-preview-state-icon" strokeWidth={1.8} />
        <span>{loadState.error || "Failed to load spreadsheet."}</span>
      </div>
    );
  }

  return (
    <div className={["tb-attachment-preview-spreadsheet", className].filter(Boolean).join(" ")}>
      {isRenderedRangeLimited || !canSerializeRunnerSpreadsheetFile(filename, mimeType) || saveState.message ? (
        <div className="tb-attachment-preview-spreadsheet-notices">
          {isRenderedRangeLimited ? (
            <span className="tb-attachment-preview-spreadsheet-note">Large sheet preview is windowed</span>
          ) : null}
          {!canSerializeRunnerSpreadsheetFile(filename, mimeType) ? (
            <span className="tb-attachment-preview-spreadsheet-note">Numbers files are preview-only</span>
          ) : null}
          {saveState.message ? (
            <span className={`tb-attachment-preview-spreadsheet-save-message is-${saveState.status}`}>{saveState.message}</span>
          ) : null}
        </div>
      ) : null}
      <div ref={gridRef} className="tb-attachment-preview-spreadsheet-grid" role="grid" aria-label={filename}>
        <table className="tb-attachment-preview-spreadsheet-table">
          <thead>
            <tr>
              <th className="tb-attachment-preview-spreadsheet-corner" aria-label="Spreadsheet corner" />
              {Array.from({ length: visibleColumnCount }, (_, columnIndex) => (
                <th key={`column:${columnIndex}`} className="tb-attachment-preview-spreadsheet-column-header" scope="col">
                  {getRunnerSpreadsheetColumnLabel(columnIndex)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: visibleRowCount }, (_, rowIndex) => {
              const row = activeSheet.rows[rowIndex] || [];
              return (
                <tr key={`row:${rowIndex}`}>
                  <th className="tb-attachment-preview-spreadsheet-row-header" scope="row">{rowIndex + 1}</th>
                  {Array.from({ length: visibleColumnCount }, (_, columnIndex) => {
                    const cellValue = row[columnIndex] ?? "";
                    return (
                      <td key={`cell:${rowIndex}:${columnIndex}`} className="tb-attachment-preview-spreadsheet-cell">
                        <input
                          data-runner-spreadsheet-cell={`${rowIndex}:${columnIndex}`}
                          className="tb-attachment-preview-spreadsheet-input"
                          value={cellValue}
                          readOnly={!editable}
                          onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
                          onKeyDown={(event) => handleCellKeyDown(event, rowIndex, columnIndex)}
                          onPaste={(event) => handleCellPaste(event, rowIndex, columnIndex)}
                          spellCheck={false}
                          aria-label={`${getRunnerSpreadsheetColumnLabel(columnIndex)}${rowIndex + 1}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
