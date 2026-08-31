import { Plus, Trash2 } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformIconButton } from "../../../../../platform-ui/components/ui/icon-button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";

export type TestAssertionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "matches"
  | "exists"
  | "truthy"
  | "gte"
  | "lte";

export interface TestAssertionDraft {
  id: string;
  path: string;
  operator: TestAssertionOperator;
  expected: string;
}

export interface TestAssertionBuilderProps {
  value: readonly unknown[];
  onChange: (assertions: unknown[]) => void;
  disabled?: boolean;
  className?: string;
}

const OPERATOR_OPTIONS: readonly {
  value: TestAssertionOperator;
  label: string;
  description: string;
}[] = [
  { value: "equals", label: "Equals", description: "The value must equal the expected JSON value." },
  { value: "not_equals", label: "Does not equal", description: "The value must differ from the expected JSON value." },
  { value: "contains", label: "Contains", description: "A string or array must contain the expected value." },
  { value: "matches", label: "Matches", description: "The string value must match a safe regular expression." },
  { value: "exists", label: "Exists", description: "The path must be present." },
  { value: "truthy", label: "Is truthy", description: "The resolved value must be truthy." },
  { value: "gte", label: "Greater than or equal", description: "The numeric value must meet the minimum." },
  { value: "lte", label: "Less than or equal", description: "The numeric value must not exceed the maximum." },
] as const;

const OPERATORS = new Set(OPERATOR_OPTIONS.map((option) => option.value));

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function formatExpected(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "";
  return JSON.stringify(value);
}

function parseExpected(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

export function toTestAssertionDrafts(value: readonly unknown[]): TestAssertionDraft[] {
  return value.map((entry, index) => {
    const assertion = asRecord(entry);
    const shorthand = OPERATOR_OPTIONS.find((option) => (
      Object.hasOwn(assertion, option.value)
    ))?.value;
    const candidate = String(assertion.operator || shorthand || "equals").toLowerCase();
    const operator = OPERATORS.has(candidate as TestAssertionOperator)
      ? candidate as TestAssertionOperator
      : "equals";
    const expected = Object.hasOwn(assertion, "expected")
      ? assertion.expected
      : shorthand
        ? assertion[shorthand]
        : undefined;
    return {
      id: `assertion-${index}-${String(assertion.path || "root")}`,
      path: String(assertion.path || ""),
      operator,
      expected: formatExpected(expected),
    };
  });
}

export function fromTestAssertionDrafts(value: readonly TestAssertionDraft[]): unknown[] {
  return value.map((assertion) => ({
    path: assertion.path.trim(),
    operator: assertion.operator,
    ...(["exists", "truthy"].includes(assertion.operator)
      ? {}
      : { expected: parseExpected(assertion.expected) }),
  }));
}

export function TestAssertionBuilder({
  value,
  onChange,
  disabled = false,
  className = "",
}: TestAssertionBuilderProps) {
  const drafts = toTestAssertionDrafts(value);

  function commit(next: TestAssertionDraft[]) {
    onChange(fromTestAssertionDrafts(next));
  }

  function update(index: number, patch: Partial<TestAssertionDraft>) {
    commit(drafts.map((assertion, candidateIndex) => (
      candidateIndex === index ? { ...assertion, ...patch } : assertion
    )));
  }

  function addAssertion() {
    commit([
      ...drafts,
      {
        id: `assertion-new-${Date.now()}`,
        path: "",
        operator: "equals",
        expected: "",
      },
    ]);
  }

  return (
    <div className={`tests-assertion-builder ${className}`.trim()}>
      <div className="tests-assertion-builder__header" aria-hidden="true">
        <span>Path</span>
        <span>Operator</span>
        <span>Expected value</span>
        <span />
      </div>
      <div className="tests-assertion-builder__rows">
        {drafts.length === 0 ? (
          <div className="tests-assertion-builder__empty">
            No assertions yet. A contract without assertions passes when its target completes successfully.
          </div>
        ) : drafts.map((assertion, index) => {
          const expectedDisabled = ["exists", "truthy"].includes(assertion.operator);
          return (
            <div className="tests-assertion-builder__row" key={assertion.id}>
              <input
                value={assertion.path}
                placeholder="status"
                aria-label={`Assertion ${index + 1} path`}
                disabled={disabled}
                onChange={(event) => update(index, { path: event.currentTarget.value })}
              />
              <PlatformSelector
                value={assertion.operator}
                options={OPERATOR_OPTIONS}
                ariaLabel={`Assertion ${index + 1} operator`}
                fullWidth
                disabled={disabled}
                onValueChange={(operator) => update(index, { operator })}
              />
              <input
                value={expectedDisabled ? "" : assertion.expected}
                placeholder={expectedDisabled ? "Not required" : "ready"}
                aria-label={`Assertion ${index + 1} expected value`}
                disabled={disabled || expectedDisabled}
                onChange={(event) => update(index, { expected: event.currentTarget.value })}
              />
              <PlatformIconButton
                size="compact"
                aria-label={`Remove assertion ${index + 1}`}
                disabled={disabled}
                onClick={() => commit(drafts.filter((_, candidateIndex) => candidateIndex !== index))}
              >
                <Trash2 width={13} height={13} aria-hidden="true" />
              </PlatformIconButton>
            </div>
          );
        })}
      </div>
      <PlatformSecondaryButton
        size="compact"
        disabled={disabled}
        onClick={addAssertion}
      >
        <Plus width={13} height={13} aria-hidden="true" />
        Add assertion
      </PlatformSecondaryButton>
    </div>
  );
}
