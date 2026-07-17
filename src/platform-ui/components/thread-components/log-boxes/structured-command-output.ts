import { stripRunnerSystemTags } from "../../../../react/runner-markdown.js";

export interface StructuredCommandExecutionOutput {
  stdout: string;
  stderr: string;
  returnCodeInterpretation: string | null;
  backgroundTaskId: string | null;
  interrupted: boolean | null;
  noOutputExpected: boolean | null;
}

const STRUCTURED_COMMAND_JSON_PARSE_LIMIT = 200_000;

function decodeJsonStringFragment(fragment: string): string {
  let result = "";
  for (let index = 0; index < fragment.length; index += 1) {
    const char = fragment[index];
    if (char !== "\\") {
      result += char;
      continue;
    }

    const next = fragment[index + 1];
    if (next == null) break;
    index += 1;
    if (next === "n") {
      result += "\n";
    } else if (next === "r") {
      result += "\r";
    } else if (next === "t") {
      result += "\t";
    } else if (next === "b") {
      result += "\b";
    } else if (next === "f") {
      result += "\f";
    } else if (next === "\"" || next === "\\" || next === "/") {
      result += next;
    } else if (next === "u") {
      const hex = fragment.slice(index + 1, index + 5);
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        result += String.fromCharCode(Number.parseInt(hex, 16));
        index += 4;
      }
    } else {
      result += next;
    }
  }
  return result;
}

export function extractJsonStringFieldValue(
  source: string,
  fieldNames: string[],
): string | null {
  for (const fieldName of fieldNames) {
    const fieldPattern = new RegExp(`"${fieldName}"\\s*:\\s*"`, "i");
    const match = fieldPattern.exec(source);
    if (!match) continue;

    const start = match.index + match[0].length;
    let raw = "";
    let escaped = false;
    for (let index = start; index < source.length; index += 1) {
      const char = source[index];
      if (escaped) {
        raw += char;
        escaped = false;
        continue;
      }
      if (char === "\\") {
        raw += char;
        escaped = true;
        continue;
      }
      if (char === "\"") {
        return decodeJsonStringFragment(raw);
      }
      raw += char;
    }
    if (raw) return decodeJsonStringFragment(raw);
  }
  return null;
}

function extractJsonBooleanFieldValue(
  source: string,
  fieldNames: string[],
): boolean | null {
  for (const fieldName of fieldNames) {
    const fieldPattern = new RegExp(
      `"${fieldName}"\\s*:\\s*(true|false)`,
      "i",
    );
    const match = fieldPattern.exec(source);
    if (match?.[1]) return match[1].toLowerCase() === "true";
  }
  return null;
}

export function parseStructuredCommandExecutionOutput(
  output: unknown,
): StructuredCommandExecutionOutput | null {
  const hasEnvelopeKeys = (record: Record<string, unknown>): boolean => [
    "stdout",
    "stderr",
    "returnCodeInterpretation",
    "backgroundTaskId",
    "interrupted",
    "noOutputExpected",
    "sandboxStatus",
    "rawOutputPath",
    "persistedOutputPath",
  ].some((key) => Object.prototype.hasOwnProperty.call(record, key));

  const buildEnvelope = (
    record: Record<string, unknown>,
  ): StructuredCommandExecutionOutput => ({
    stdout: typeof record.stdout === "string" ? record.stdout : "",
    stderr: typeof record.stderr === "string" ? record.stderr : "",
    returnCodeInterpretation: (
      typeof record.returnCodeInterpretation === "string"
      && record.returnCodeInterpretation.trim()
    ) ? record.returnCodeInterpretation.trim() : null,
    backgroundTaskId: (
      typeof record.backgroundTaskId === "string"
      && record.backgroundTaskId.trim()
    ) ? record.backgroundTaskId.trim() : null,
    interrupted: typeof record.interrupted === "boolean"
      ? record.interrupted
      : null,
    noOutputExpected: typeof record.noOutputExpected === "boolean"
      ? record.noOutputExpected
      : null,
  });

  const visit = (value: unknown): StructuredCommandExecutionOutput | null => {
    if (value == null) return null;
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = visit(entry);
        if (nested) return nested;
      }
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
        return null;
      }
      if (trimmed.length <= STRUCTURED_COMMAND_JSON_PARSE_LIMIT) {
        try {
          return visit(JSON.parse(trimmed));
        } catch {
          return null;
        }
      }
      if (
        !/"(?:stdout|stderr|returnCodeInterpretation|backgroundTaskId|interrupted|noOutputExpected)"\s*:/i
          .test(trimmed)
      ) {
        return null;
      }
      return {
        stdout: extractJsonStringFieldValue(trimmed, ["stdout"]) || "",
        stderr: extractJsonStringFieldValue(trimmed, ["stderr"]) || "",
        returnCodeInterpretation: extractJsonStringFieldValue(
          trimmed,
          ["returnCodeInterpretation"],
        ),
        backgroundTaskId: extractJsonStringFieldValue(
          trimmed,
          ["backgroundTaskId"],
        ),
        interrupted: extractJsonBooleanFieldValue(trimmed, ["interrupted"]),
        noOutputExpected: extractJsonBooleanFieldValue(
          trimmed,
          ["noOutputExpected"],
        ),
      };
    }
    if (typeof value !== "object") return null;

    const record = value as Record<string, unknown>;
    if (hasEnvelopeKeys(record)) return buildEnvelope(record);
    for (const candidate of [
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
    ]) {
      const nested = visit(candidate);
      if (nested) return nested;
    }
    return null;
  };

  const structured = visit(output);
  if (structured) return structured;
  if (typeof output !== "string") return null;

  const trimmed = output.trim();
  if (
    !trimmed
    || !/"(?:stdout|stderr|returnCodeInterpretation|backgroundTaskId|interrupted|noOutputExpected)"\s*:/i
      .test(trimmed)
  ) {
    return null;
  }

  return {
    stdout: extractJsonStringFieldValue(trimmed, ["stdout"]) || "",
    stderr: extractJsonStringFieldValue(trimmed, ["stderr"]) || "",
    returnCodeInterpretation: extractJsonStringFieldValue(
      trimmed,
      ["returnCodeInterpretation"],
    ),
    backgroundTaskId: extractJsonStringFieldValue(
      trimmed,
      ["backgroundTaskId"],
    ),
    interrupted: extractJsonBooleanFieldValue(trimmed, ["interrupted"]),
    noOutputExpected: extractJsonBooleanFieldValue(
      trimmed,
      ["noOutputExpected"],
    ),
  };
}

export function resolveCommandOutputText(
  output: unknown,
  preferred: "stdout" | "combined" = "combined",
): string {
  const structured = parseStructuredCommandExecutionOutput(output);
  if (!structured) return stripRunnerSystemTags(String(output || ""));
  if (preferred === "stdout") {
    return stripRunnerSystemTags(structured.stdout || structured.stderr || "");
  }
  return stripRunnerSystemTags(
    [structured.stdout, structured.stderr].filter(Boolean).join("\n"),
  );
}
