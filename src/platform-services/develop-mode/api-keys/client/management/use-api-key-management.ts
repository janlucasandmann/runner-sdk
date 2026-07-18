import { useCallback, useEffect, useRef, useState } from "react";

import type { ApiKeyRepository, CreateApiKeyInput } from "../api/api-key-repository.js";

export interface ApiKeyRevealTarget {
  id: string;
  name: string;
}

export interface ApiKeyRevealState extends ApiKeyRevealTarget {
  key: string;
  loading: boolean;
  error: string;
  copied: boolean;
}

export interface ApiKeyCreatedState {
  id: string;
  key: string;
  copied: boolean;
}

export interface UseApiKeyManagementOptions {
  repository: ApiKeyRepository;
  onChanged: () => Promise<void> | void;
  onRefreshError?: (message: string) => void;
}

function readErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function copySecret(value: string): Promise<void> {
  if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
    throw new Error("Clipboard access is unavailable.");
  }
  await navigator.clipboard.writeText(value);
}

export function useApiKeyManagement({
  repository,
  onChanged,
  onRefreshError,
}: UseApiKeyManagementOptions) {
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [created, setCreated] = useState<ApiKeyCreatedState | null>(null);
  const [reveal, setReveal] = useState<ApiKeyRevealState | null>(null);
  const revealRequestRef = useRef<AbortController | null>(null);
  const revealedKeysRef = useRef(new Map<string, string>());

  useEffect(
    () => () => {
      revealRequestRef.current?.abort();
      revealedKeysRef.current.clear();
    },
    [],
  );

  const openCreate = useCallback(() => {
    setCreateError("");
    setCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    if (creating) return;
    setCreateOpen(false);
    setCreateError("");
  }, [creating]);

  const submitCreate = useCallback(
    async (input: CreateApiKeyInput) => {
      const name = String(input.name || "").trim();
      if (!name) {
        setCreateError("Enter a name for the API key.");
        return false;
      }
      setCreating(true);
      setCreateError("");
      try {
        const result = await repository.create({
          ...input,
          name,
        });
        if (result.id && result.key) {
          revealedKeysRef.current.set(result.id, result.key);
        }
        setCreateOpen(false);
        setCreated(
          result.key
            ? {
                id: result.id,
                key: result.key,
                copied: false,
              }
            : null,
        );
        if (!result.key) {
          onRefreshError?.("The API key was created, but its secret was not returned.");
        }
        try {
          await onChanged();
        } catch (refreshError) {
          onRefreshError?.(
            readErrorMessage(
              refreshError,
              "The API key was created, but the list could not be refreshed.",
            ),
          );
        }
        return true;
      } catch (error) {
        setCreateError(readErrorMessage(error, "Failed to create API key."));
        return false;
      } finally {
        setCreating(false);
      }
    },
    [onChanged, onRefreshError, repository],
  );

  const closeReveal = useCallback(() => {
    revealRequestRef.current?.abort();
    revealRequestRef.current = null;
    setReveal(null);
  }, []);

  const openReveal = useCallback(
    async (target: ApiKeyRevealTarget) => {
      const keyId = String(target.id || "").trim();
      if (!keyId) return;
      revealRequestRef.current?.abort();
      const cachedKey = revealedKeysRef.current.get(keyId) || "";
      setReveal({
        id: keyId,
        name: String(target.name || "").trim() || "API Key",
        key: cachedKey,
        loading: !cachedKey,
        error: "",
        copied: false,
      });
      if (cachedKey) return;

      const controller = new AbortController();
      revealRequestRef.current = controller;
      try {
        const key = await repository.reveal(keyId, controller.signal);
        if (controller.signal.aborted) return;
        revealedKeysRef.current.set(keyId, key);
        setReveal((current) =>
          current?.id === keyId
            ? {
                ...current,
                key,
                loading: false,
                error: "",
              }
            : current,
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setReveal((current) =>
          current?.id === keyId
            ? {
                ...current,
                loading: false,
                error: readErrorMessage(error, "Failed to reveal API key."),
              }
            : current,
        );
      } finally {
        if (revealRequestRef.current === controller) {
          revealRequestRef.current = null;
        }
      }
    },
    [repository],
  );

  const copyCreated = useCallback(async () => {
    if (!created?.key) return;
    await copySecret(created.key);
    setCreated((current) => (current ? { ...current, copied: true } : current));
  }, [created]);

  const copyRevealed = useCallback(async () => {
    if (!reveal?.key) return;
    await copySecret(reveal.key);
    setReveal((current) => (current ? { ...current, copied: true } : current));
  }, [reveal]);

  const dismissCreated = useCallback(() => {
    setCreated(null);
  }, []);

  const forgetKey = useCallback((keyId: string) => {
    revealedKeysRef.current.delete(String(keyId || "").trim());
  }, []);

  return {
    createOpen,
    creating,
    createError,
    created,
    reveal,
    openCreate,
    closeCreate,
    submitCreate,
    openReveal,
    closeReveal,
    copyCreated,
    copyRevealed,
    dismissCreated,
    forgetKey,
  };
}
