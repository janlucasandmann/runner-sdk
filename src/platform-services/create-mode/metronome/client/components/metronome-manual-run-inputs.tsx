import { type ChangeEvent, useCallback } from "react";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { PlatformToggle } from "../../../../../platform-ui/components/ui/toggle/index.js";
import {
  RunnerChat,
  type RunnerChatComposerSubmitPayload,
  type RunnerChatProps,
} from "../../../../../react/index.js";
import type {
  MetronomeManualRunContract,
  MetronomeManualRunField,
} from "../manual-run-contracts.js";

export interface MetronomeManualRunInputsProps {
  contracts: readonly MetronomeManualRunContract[];
  contractId: string;
  values: Readonly<Record<string, unknown>>;
  disabled?: boolean;
  composerKey?: string;
  composerSubmitRequest?: number | null;
  threadComposerProps?: Partial<RunnerChatProps>;
  onContractChange: (contractId: string) => void;
  onValueChange: (fieldId: string, value: unknown) => void;
  onComposerSubmit: (payload: RunnerChatComposerSubmitPayload) => boolean | Promise<boolean>;
}

function ensureOption(options: RunnerChatProps["agents"], id: string, name: string) {
  const source = Array.isArray(options) ? [...options] : [];
  if (id && !source.some((option) => option.id === id)) source.unshift({ id, name: name || id });
  return source;
}

function readInputValue(value: unknown): string | number {
  return typeof value === "number" ? value : String(value ?? "");
}

function ManualRunField({
  field,
  value,
  disabled,
  onChange,
}: {
  field: MetronomeManualRunField;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
}) {
  const label = (
    <span className="metronome-manual-run-inputs__field-label">
      {field.label}
      {field.required ? <span aria-hidden="true"> *</span> : null}
    </span>
  );
  const description = field.description ? (
    <small className="metronome-manual-run-inputs__field-description">{field.description}</small>
  ) : null;
  if (field.control === "selector") {
    return (
      <div className="batches-form-field metronome-manual-run-inputs__field">
        {label}
        <PlatformSelector
          value={String(value ?? "")}
          options={field.options}
          placeholder={field.placeholder || "Select an option"}
          ariaLabel={field.label}
          disabled={disabled || field.readOnly}
          fullWidth
          triggerClassName="batches-create-modal__resource-trigger"
          popupMatchTriggerWidth="exact"
          onValueChange={onChange}
        />
        {description}
      </div>
    );
  }
  if (field.control === "toggle") {
    return (
      <div className="batches-form-field metronome-manual-run-inputs__field is-toggle">
        <div>
          {label}
          {description}
        </div>
        <PlatformToggle
          aria-label={field.label}
          checked={value === true || value === "true"}
          disabled={disabled || field.readOnly}
          onCheckedChange={onChange}
        />
      </div>
    );
  }
  if (field.control === "textarea" || field.control === "list") {
    return (
      <label className="batches-form-field metronome-manual-run-inputs__field">
        {label}
        <textarea
          value={String(value ?? "")}
          rows={field.control === "list" ? 4 : 5}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          disabled={disabled}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        {description}
      </label>
    );
  }
  const inputType =
    field.control === "number"
      ? "number"
      : field.control === "url"
        ? "url"
        : field.control === "date"
          ? "date"
          : field.control === "datetime-local"
            ? "datetime-local"
            : "text";
  return (
    <label className="batches-form-field metronome-manual-run-inputs__field">
      {label}
      <input
        type={inputType}
        value={readInputValue(value)}
        placeholder={field.placeholder}
        readOnly={field.readOnly}
        disabled={disabled}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value)}
      />
      {description}
    </label>
  );
}

export function MetronomeManualRunInputs({
  contracts,
  contractId,
  values,
  disabled = false,
  composerKey = "workflow-manual-run",
  composerSubmitRequest = null,
  threadComposerProps,
  onContractChange,
  onValueChange,
  onComposerSubmit,
}: MetronomeManualRunInputsProps) {
  const handleComposerDraftChange = useCallback(
    (value: string) => onValueChange("prompt", value),
    [onValueChange],
  );
  const contract =
    contracts.find((candidate) => candidate.id === contractId) || contracts[0] || null;
  if (!contract) return null;
  const binding = contract.composerBinding;
  const agents = binding
    ? ensureOption(threadComposerProps?.agents, binding.agentId, binding.agentName)
    : threadComposerProps?.agents;
  const environments = binding
    ? ensureOption(
        threadComposerProps?.environments,
        binding.environmentId,
        binding.environmentName,
      )
    : threadComposerProps?.environments;
  return (
    <section className="metronome-manual-run-inputs" aria-label="Workflow run input">
      {contracts.length > 1 ? (
        <div className="batches-form-field is-span-2 metronome-manual-run-inputs__trigger">
          <span>Trigger</span>
          <PlatformSelector
            value={contract.id}
            options={contracts.map((candidate) => ({
              value: candidate.id,
              label: candidate.label,
            }))}
            ariaLabel="Workflow trigger"
            disabled={disabled}
            fullWidth
            triggerClassName="batches-create-modal__resource-trigger"
            popupMatchTriggerWidth="exact"
            onValueChange={onContractChange}
          />
        </div>
      ) : null}
      {contract.mode === "composer" ? (
        <RunnerChat
          {...threadComposerProps}
          key={`${composerKey}:${contract.id}`}
          backendUrl={threadComposerProps?.backendUrl || ""}
          apiKey={threadComposerProps?.apiKey || ""}
          className="batches-create-modal__thread-composer metronome-manual-run-inputs__composer"
          initialTask={String(values.prompt ?? "")}
          inputMode="computer-agents"
          placeholder={
            contract.inputFields[0]?.placeholder || "Describe the input for this workflow run"
          }
          disabled={disabled}
          autoCreateThread={false}
          autoFocusComposer={false}
          keepFocusOnSubmit={false}
          showUsageInStatus={false}
          portalComposerSuggestions
          agentId={binding?.agentId || threadComposerProps?.agentId}
          environmentId={binding?.environmentId || threadComposerProps?.environmentId}
          projectId={binding?.projectId || null}
          agents={agents}
          environments={environments}
          hideAgentSelector={false}
          hideEnvironmentSelector={false}
          lockAgentSelector={Boolean(binding)}
          lockEnvironmentSelector={Boolean(binding)}
          onComposerDraftChange={handleComposerDraftChange}
          composerSubmitRequest={composerSubmitRequest}
          onComposerSubmit={onComposerSubmit}
        />
      ) : (
        <div className="metronome-manual-run-inputs__fields">
          {contract.inputFields.map((inputField) => (
            <ManualRunField
              key={inputField.id}
              field={inputField}
              value={values[inputField.id]}
              disabled={disabled}
              onChange={(value) => onValueChange(inputField.id, value)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
