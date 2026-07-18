export type RunnerSpreadsheetCellValue = string;

export interface RunnerSpreadsheetSheet {
  name: string;
  rows: RunnerSpreadsheetCellValue[][];
}

export interface RunnerSpreadsheetWorkbook {
  sheets: RunnerSpreadsheetSheet[];
  sourceFormat: RunnerSpreadsheetFormat;
}

export type RunnerSpreadsheetFormat =
  | "csv"
  | "tsv"
  | "xls"
  | "xlsx"
  | "xlsm"
  | "xlsb"
  | "ods"
  | "numbers"
  | "unknown";

export interface RunnerSpreadsheetSerializedResult {
  blob: Blob;
  mimeType: string;
  filename: string;
}

export interface RunnerSpreadsheetCodePreview {
  text: string;
  language: string;
}

type SheetJsModule = typeof import("xlsx");

let sheetJsModulePromise: Promise<SheetJsModule> | null = null;

function loadSheetJs(): Promise<SheetJsModule> {
  if (!sheetJsModulePromise) {
    sheetJsModulePromise = import("xlsx");
  }
  return sheetJsModulePromise;
}

export function getRunnerSpreadsheetExtension(filename?: string | null): string {
  const normalized = String(filename || "").trim().toLowerCase();
  const extension = normalized.includes(".") ? normalized.split(".").pop() || "" : "";
  return extension;
}

export function isRunnerSpreadsheetFile(filename?: string | null, mimeType?: string | null): boolean {
  const extension = getRunnerSpreadsheetExtension(filename);
  if (["csv", "tsv", "xls", "xlsx", "xlsm", "xlsb", "ods", "numbers"].includes(extension)) {
    return true;
  }

  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();
  return (
    normalizedMimeType === "text/csv" ||
    normalizedMimeType === "text/tab-separated-values" ||
    normalizedMimeType === "application/vnd.ms-excel" ||
    normalizedMimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    normalizedMimeType === "application/vnd.ms-excel.sheet.macroenabled.12" ||
    normalizedMimeType === "application/vnd.ms-excel.sheet.binary.macroenabled.12" ||
    normalizedMimeType === "application/vnd.oasis.opendocument.spreadsheet" ||
    normalizedMimeType === "application/vnd.apple.numbers" ||
    normalizedMimeType === "application/x-iwork-numbers-sffnumbers"
  );
}

export function getRunnerSpreadsheetFormat(filename?: string | null, mimeType?: string | null): RunnerSpreadsheetFormat {
  const extension = getRunnerSpreadsheetExtension(filename);
  if (["csv", "tsv", "xls", "xlsx", "xlsm", "xlsb", "ods", "numbers"].includes(extension)) {
    return extension as RunnerSpreadsheetFormat;
  }

  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();
  if (normalizedMimeType === "text/csv") return "csv";
  if (normalizedMimeType === "text/tab-separated-values") return "tsv";
  if (normalizedMimeType === "application/vnd.ms-excel") return "xls";
  if (normalizedMimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "xlsx";
  if (normalizedMimeType === "application/vnd.ms-excel.sheet.macroenabled.12") return "xlsm";
  if (normalizedMimeType === "application/vnd.ms-excel.sheet.binary.macroenabled.12") return "xlsb";
  if (normalizedMimeType === "application/vnd.oasis.opendocument.spreadsheet") return "ods";
  if (normalizedMimeType === "application/vnd.apple.numbers" || normalizedMimeType === "application/x-iwork-numbers-sffnumbers") return "numbers";
  return "unknown";
}

export function canSerializeRunnerSpreadsheetFile(filename?: string | null, mimeType?: string | null): boolean {
  return getRunnerSpreadsheetFormat(filename, mimeType) !== "numbers";
}

function normalizeSpreadsheetCellValue(value: unknown): RunnerSpreadsheetCellValue {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function normalizeSheetRows(rows: unknown[][]): RunnerSpreadsheetCellValue[][] {
  return rows.map((row) => (Array.isArray(row) ? row.map(normalizeSpreadsheetCellValue) : []));
}

export function trimRunnerSpreadsheetRows(rows: RunnerSpreadsheetCellValue[][]): RunnerSpreadsheetCellValue[][] {
  const normalizedRows = rows.map((row) => {
    const normalizedRow = Array.isArray(row) ? row.map((value) => String(value ?? "")) : [];
    let lastCellIndex = normalizedRow.length - 1;
    while (lastCellIndex >= 0 && !normalizedRow[lastCellIndex]) {
      lastCellIndex -= 1;
    }
    return normalizedRow.slice(0, lastCellIndex + 1);
  });

  let lastRowIndex = normalizedRows.length - 1;
  while (lastRowIndex >= 0 && normalizedRows[lastRowIndex].every((value) => !String(value || "").trim())) {
    lastRowIndex -= 1;
  }

  return normalizedRows.slice(0, lastRowIndex + 1);
}

export async function parseRunnerSpreadsheetBlob(
  blob: Blob,
  filename?: string | null,
  mimeType?: string | null
): Promise<RunnerSpreadsheetWorkbook> {
  const XLSX = await loadSheetJs();
  const buffer = await blob.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    dense: false,
  });

  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    }) as unknown[][];
    return {
      name: sheetName || "Sheet",
      rows: normalizeSheetRows(rows),
    };
  });

  return {
    sheets: sheets.length > 0 ? sheets : [{ name: "Sheet1", rows: [] }],
    sourceFormat: getRunnerSpreadsheetFormat(filename, mimeType),
  };
}

function getRunnerSpreadsheetSaveMimeType(format: RunnerSpreadsheetFormat): string {
  switch (format) {
    case "csv":
      return "text/csv;charset=utf-8";
    case "tsv":
      return "text/tab-separated-values;charset=utf-8";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsm":
      return "application/vnd.ms-excel.sheet.macroEnabled.12";
    case "xlsb":
      return "application/vnd.ms-excel.sheet.binary.macroEnabled.12";
    case "ods":
      return "application/vnd.oasis.opendocument.spreadsheet";
    case "xlsx":
    default:
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
}

function getRunnerSpreadsheetBookType(format: RunnerSpreadsheetFormat): string {
  switch (format) {
    case "xls":
    case "xlsm":
    case "xlsb":
    case "ods":
      return format;
    case "csv":
    case "tsv":
    case "unknown":
    default:
      return "xlsx";
  }
}

function replaceFilenameExtension(filename: string, extension: string): string {
  const normalizedFilename = String(filename || "").trim() || "spreadsheet";
  if (/\.[^/.]+$/.test(normalizedFilename)) {
    return normalizedFilename.replace(/\.[^/.]+$/, `.${extension}`);
  }
  return `${normalizedFilename}.${extension}`;
}

export async function serializeRunnerSpreadsheetWorkbook(
  workbook: RunnerSpreadsheetWorkbook,
  options: {
    filename: string;
    mimeType?: string | null;
    activeSheetIndex?: number;
  }
): Promise<RunnerSpreadsheetSerializedResult> {
  const XLSX = await loadSheetJs();
  const format = getRunnerSpreadsheetFormat(options.filename, options.mimeType);
  const sheets = workbook.sheets.length > 0 ? workbook.sheets : [{ name: "Sheet1", rows: [] }];

  if (format === "csv" || format === "tsv") {
    const activeSheet = sheets[Math.max(0, Math.min(sheets.length - 1, options.activeSheetIndex || 0))] || sheets[0];
    const worksheet = XLSX.utils.aoa_to_sheet(trimRunnerSpreadsheetRows(activeSheet.rows));
    const text = XLSX.utils.sheet_to_csv(worksheet, {
      FS: format === "tsv" ? "\t" : ",",
    });
    return {
      blob: new Blob([text], { type: getRunnerSpreadsheetSaveMimeType(format) }),
      mimeType: getRunnerSpreadsheetSaveMimeType(format),
      filename: options.filename,
    };
  }

  const nextWorkbook = XLSX.utils.book_new();
  sheets.forEach((sheet, index) => {
    const worksheet = XLSX.utils.aoa_to_sheet(trimRunnerSpreadsheetRows(sheet.rows));
    const safeName = String(sheet.name || `Sheet${index + 1}`).slice(0, 31) || `Sheet${index + 1}`;
    XLSX.utils.book_append_sheet(nextWorkbook, worksheet, safeName);
  });

  const fallbackFormat = format === "numbers" || format === "unknown" ? "xlsx" : format;
  const output = XLSX.write(nextWorkbook, {
    type: "array",
    bookType: getRunnerSpreadsheetBookType(fallbackFormat) as never,
  });
  const filename = format === "numbers" || format === "unknown"
    ? replaceFilenameExtension(options.filename, "xlsx")
    : options.filename;
  return {
    blob: new Blob([output], { type: getRunnerSpreadsheetSaveMimeType(fallbackFormat) }),
    mimeType: getRunnerSpreadsheetSaveMimeType(fallbackFormat),
    filename,
  };
}

function formatRunnerSpreadsheetDelimitedCell(value: RunnerSpreadsheetCellValue, delimiter: string): string {
  const text = String(value ?? "");
  if (text.includes("\"") || text.includes("\n") || text.includes("\r") || text.includes(delimiter)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function formatRunnerSpreadsheetDelimitedRows(rows: RunnerSpreadsheetCellValue[][], delimiter: string): string {
  return trimRunnerSpreadsheetRows(rows)
    .map((row) => row.map((value) => formatRunnerSpreadsheetDelimitedCell(value, delimiter)).join(delimiter))
    .join("\n");
}

export function formatRunnerSpreadsheetWorkbookCode(
  workbook: RunnerSpreadsheetWorkbook,
  activeSheetIndex = 0
): RunnerSpreadsheetCodePreview {
  const sheets = workbook.sheets.length > 0 ? workbook.sheets : [{ name: "Sheet1", rows: [] }];
  if (workbook.sourceFormat === "csv" || workbook.sourceFormat === "tsv") {
    const activeSheet = sheets[Math.max(0, Math.min(sheets.length - 1, activeSheetIndex))] || sheets[0];
    return {
      text: formatRunnerSpreadsheetDelimitedRows(activeSheet.rows, workbook.sourceFormat === "tsv" ? "\t" : ","),
      language: workbook.sourceFormat,
    };
  }

  return {
    text: JSON.stringify({
      sheets: sheets.map((sheet) => ({
        name: sheet.name,
        rows: trimRunnerSpreadsheetRows(sheet.rows),
      })),
    }, null, 2),
    language: "json",
  };
}

export function getRunnerSpreadsheetColumnLabel(index: number): string {
  let value = Math.max(0, index) + 1;
  let label = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label || "A";
}
