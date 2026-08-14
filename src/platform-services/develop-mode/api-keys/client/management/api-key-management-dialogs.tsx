import { Check, Copy, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import type { CreateApiKeyInput } from "../api/api-key-repository.js";
import {
  API_KEY_SCOPE_PRESETS,
  getApiKeyScopePreset,
  type ApiKeyScopePresetId,
} from "../domain/api-key-scope-presets.js";
import type { ApiKeyRevealState } from "./use-api-key-management.js";

export interface ApiKeyCreateDialogProps {
  open: boolean;
  submitting: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (input: CreateApiKeyInput) => Promise<boolean> | boolean;
}

export function ApiKeyCreateDialog({
  open,
  submitting,
  error = "",
  onClose,
  onSubmit,
}: ApiKeyCreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scopePresetId, setScopePresetId] = useState<ApiKeyScopePresetId>("full");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setScopePresetId("full");
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const scope = getApiKeyScopePreset(scopePresetId);
    void onSubmit({
      name,
      description,
      permissions: scope.permissions,
    });
  };

  return (
    <PlatformModal
      open={open}
      title="Create API Key"
      description="Create a scoped key for SDKs, automation, or external apps."
      onClose={() => {
        if (!submitting) onClose();
      }}
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      closeButtonDisabled={submitting}
      initialFocusRef={nameInputRef}
      as="form"
      size="medium"
      className="platform-api-key-management-modal"
      bodyClassName="platform-api-key-management-modal__body"
      surfaceProps={{
        onSubmit: handleSubmit,
      }}
      footer={
        <>
          <PlatformSecondaryButton
            size="medium"
            type="button"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton size="medium" type="submit" disabled={submitting || !name.trim()}>
            {submitting ? (
              <>
                <Loader2
                  className="platform-api-key-management-modal__spinner"
                  width={14}
                  height={14}
                  aria-hidden="true"
                />
                Creating
              </>
            ) : (
              "Create Key"
            )}
          </PlatformPrimaryButton>
        </>
      }
    >
      <label className="platform-api-key-management-field">
        <span>Name</span>
        <input
          ref={nameInputRef}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Development Key"
          autoComplete="off"
          required
        />
      </label>
      <label className="platform-api-key-management-field">
        <span>
          Description <em>optional</em>
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. For local development and testing"
        />
      </label>
      <fieldset className="platform-api-key-management-scopes">
        <legend>Permissions</legend>
        {API_KEY_SCOPE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`playground-settings-scope-option${scopePresetId === preset.id ? " is-active" : ""}`}
            aria-pressed={scopePresetId === preset.id}
            onClick={() => setScopePresetId(preset.id)}
          >
            <strong>{preset.label}</strong>
            <span>{preset.description}</span>
          </button>
        ))}
      </fieldset>
      {error ? (
        <p className="platform-api-key-management-modal__error" role="alert">
          {error}
        </p>
      ) : null}
    </PlatformModal>
  );
}

export interface ApiKeyRevealDialogProps {
  state: ApiKeyRevealState | null;
  onClose: () => void;
  onCopy: () => Promise<void> | void;
}

export function ApiKeyRevealDialog({ state, onClose, onCopy }: ApiKeyRevealDialogProps) {
  return (
    <PlatformModal
      open={Boolean(state)}
      title={state?.name || "API Key"}
      onClose={onClose}
      size="medium"
      className="platform-api-key-management-modal playground-api-key-reveal-modal"
      closeButtonLabel="Close API key"
    >
      {state?.loading ? (
        <div className="platform-api-key-management-modal__loading" role="status">
          <Loader2
            className="platform-api-key-management-modal__spinner"
            width={16}
            height={16}
            aria-hidden="true"
          />
          <span>Loading API key</span>
        </div>
      ) : state?.key ? (
        <>
          <div className="playground-settings-code-row">
            <input
              type="text"
              className="playground-settings-code playground-settings-code-input"
              value={state.key}
              readOnly
              aria-label="API key"
            />
            <button
              type="button"
              className="playground-settings-icon-button playground-settings-code-copy"
              onClick={() => void onCopy()}
              aria-label="Copy API key"
            >
              {state.copied ? (
                <Check width={14} height={14} aria-hidden="true" />
              ) : (
                <Copy width={14} height={14} aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="platform-api-key-management-modal__notice">
            Keep this key private. Anyone with it can access resources allowed by its permissions.
          </p>
        </>
      ) : state ? (
        <p className="platform-api-key-management-modal__error" role="alert">
          {state.error || "The API key value is unavailable."}
        </p>
      ) : null}
    </PlatformModal>
  );
}
