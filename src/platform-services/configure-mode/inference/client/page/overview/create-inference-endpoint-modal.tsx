import { Loader2, Plus } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { PlatformModal } from "../../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../../platform-ui/components/ui/selector/index.js";
import { INFERENCE_PROVIDER_OPTIONS } from "../inference-provider-options.js";

export interface CreateInferenceEndpointInput {
  name: string;
  providerType: string;
  baseUrl: string;
  apiKey: string;
  isDefault: boolean;
}

export interface CreateInferenceEndpointModalProps {
  open: boolean;
  submitting?: boolean;
  error?: string;
  existingEndpointCount?: number;
  onClose: () => void;
  onSubmit: (
    input: CreateInferenceEndpointInput,
  ) => boolean | void | Promise<boolean | void>;
}

function validateEndpointUrl(value: string): string {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? ""
      : "Endpoint URL must use HTTP or HTTPS.";
  } catch {
    return "Enter a valid inference endpoint URL.";
  }
}

export function CreateInferenceEndpointModal({
  open,
  submitting = false,
  error = "",
  existingEndpointCount = 0,
  onClose,
  onSubmit,
}: CreateInferenceEndpointModalProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [providerType, setProviderType] = useState("openai-compatible");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isDefault, setIsDefault] = useState(existingEndpointCount === 0);
  const [validationError, setValidationError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setProviderType("openai-compatible");
    setBaseUrl("");
    setApiKey("");
    setIsDefault(existingEndpointCount === 0);
    setValidationError("");
    setSubmitted(false);
  }, [existingEndpointCount, open]);

  const closeModal = () => {
    if (!submitting) onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, "");
    if (!normalizedName) {
      setValidationError("Enter a name for this inference endpoint.");
      nameInputRef.current?.focus();
      return;
    }
    const urlError = validateEndpointUrl(normalizedBaseUrl);
    if (urlError) {
      setValidationError(urlError);
      return;
    }
    setValidationError("");
    setSubmitted(true);
    const accepted = await onSubmit({
      name: normalizedName,
      providerType,
      baseUrl: normalizedBaseUrl,
      apiKey: apiKey.trim(),
      isDefault,
    });
    if (accepted !== false) onClose();
  };

  return (
    <PlatformModal
      open={open}
      title="New Inference Endpoint"
      description="Connect an OpenAI-compatible or self-hosted model endpoint to this organization."
      onClose={closeModal}
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      closeButtonDisabled={submitting}
      initialFocusRef={nameInputRef}
      as="form"
      size="medium"
      className="inference-create-endpoint-modal"
      headerClassName="inference-create-endpoint-modal__header"
      bodyClassName="inference-create-endpoint-modal__body"
      surfaceProps={{
        onSubmit: handleSubmit,
      }}
      footer={
        <>
          <PlatformSecondaryButton
            size="medium"
            type="button"
            disabled={submitting}
            onClick={closeModal}
          >
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={submitting || !name.trim() || !baseUrl.trim()}
          >
            {submitting ? (
              <>
                <Loader2
                  className="inference-create-endpoint-modal__spinner"
                  width={14}
                  height={14}
                  aria-hidden="true"
                />
                <span>Adding</span>
              </>
            ) : (
              <>
                <Plus width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
                <span>Add Endpoint</span>
              </>
            )}
          </PlatformPrimaryButton>
        </>
      }
    >
      <div className="inference-create-endpoint-modal__grid">
        <label className="inference-create-endpoint-modal__field">
          <span>Name</span>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            placeholder="Production Inference"
            autoComplete="off"
            maxLength={120}
            disabled={submitting}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="inference-create-endpoint-modal__field">
          <span>Provider</span>
          <PlatformSelector
            value={providerType}
            options={INFERENCE_PROVIDER_OPTIONS}
            onValueChange={(value) => setProviderType(value)}
            ariaLabel="Inference provider"
            fullWidth
            disabled={submitting}
            triggerClassName="inference-create-endpoint-modal__selector-trigger"
          />
        </div>

        <label className="inference-create-endpoint-modal__field is-span-2">
          <span>Endpoint URL</span>
          <input
            type="text"
            inputMode="url"
            value={baseUrl}
            placeholder="https://models.example.com/v1"
            autoComplete="url"
            disabled={submitting}
            onChange={(event) => setBaseUrl(event.target.value)}
          />
        </label>

        <label className="inference-create-endpoint-modal__field is-span-2">
          <span>
            API Key <em>optional</em>
          </span>
          <input
            type="password"
            value={apiKey}
            placeholder="sk-..."
            autoComplete="new-password"
            disabled={submitting}
            onChange={(event) => setApiKey(event.target.value)}
          />
          <small>Credentials are encrypted and never shown again after saving.</small>
        </label>
      </div>

      <label className="inference-create-endpoint-modal__default">
        <input
          type="checkbox"
          checked={isDefault}
          disabled={submitting || existingEndpointCount === 0}
          onChange={(event) => setIsDefault(event.target.checked)}
        />
        <span>
          <strong>Use as default endpoint</strong>
          <small>New external model selections will use this endpoint by default.</small>
        </span>
      </label>

      {validationError || (submitted && error) ? (
        <p className="inference-create-endpoint-modal__error" role="alert">
          {validationError || error}
        </p>
      ) : null}
    </PlatformModal>
  );
}
