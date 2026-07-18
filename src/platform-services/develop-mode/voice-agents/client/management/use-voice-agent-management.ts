import { useCallback, useMemo, useState } from "react";
import type { VoiceAgentRepository } from "../api/voice-agent-repository.js";
import {
  createDevelopVoiceAgentOverviewRows,
  createVoiceAgentDraft,
  createVoiceAgentUpdatePayload,
  type DevelopVoiceAgentDraft,
  type DevelopVoiceAgentMutationState,
  type DevelopVoiceAgentOverviewRow,
  getVoiceAgentRecordId,
  unwrapVoiceAgentRecord,
} from "../domain/index.js";

type VoiceAgentEditablePatch = Partial<
  Pick<DevelopVoiceAgentOverviewRow, "instructions" | "languageHint" | "mode" | "model" | "voiceId">
>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function createDraftsById(records: readonly unknown[]): Record<string, DevelopVoiceAgentDraft> {
  return Object.fromEntries(
    createDevelopVoiceAgentOverviewRows(records).map((row) => [row.id, createVoiceAgentDraft(row)]),
  );
}

function mergeVoiceAgentRecord(
  existing: unknown,
  response: unknown,
  agentId: string,
): Record<string, unknown> {
  const current = asRecord(existing);
  const incoming = unwrapVoiceAgentRecord(response);
  return {
    ...current,
    ...incoming,
    agent: {
      ...asRecord(current.agent),
      ...asRecord(incoming.agent),
      id: agentId,
    },
    voice: {
      ...asRecord(current.voice),
      ...asRecord(incoming.voice),
    },
    ...(incoming.phoneNumber !== undefined ? { phoneNumber: incoming.phoneNumber } : {}),
  };
}

export interface RunnerVoiceAgentManagement {
  rows: readonly DevelopVoiceAgentOverviewRow[];
  loading: boolean;
  error: string;
  message: string;
  load: (signal?: AbortSignal) => Promise<void>;
  updateDraft: (row: DevelopVoiceAgentOverviewRow, patch: VoiceAgentEditablePatch) => void;
  save: (row: DevelopVoiceAgentOverviewRow) => Promise<boolean>;
  test: (row: DevelopVoiceAgentOverviewRow) => Promise<boolean>;
  provision: (row: DevelopVoiceAgentOverviewRow) => Promise<boolean>;
  disablePhone: (row: DevelopVoiceAgentOverviewRow) => Promise<boolean>;
}

export function useVoiceAgentManagement(
  repository: VoiceAgentRepository,
): RunnerVoiceAgentManagement {
  const [records, setRecords] = useState<readonly unknown[]>([]);
  const [draftsById, setDraftsById] = useState<Record<string, DevelopVoiceAgentDraft>>({});
  const [sessionResultsById, setSessionResultsById] = useState<Record<string, unknown>>({});
  const [mutationState, setMutationState] = useState<DevelopVoiceAgentMutationState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const nextRecords = await repository.list(signal);
        if (signal?.aborted) return;
        setRecords(nextRecords);
        setDraftsById(createDraftsById(nextRecords));
      } catch (loadError) {
        if (!signal?.aborted) {
          setError(readErrorMessage(loadError, "Failed to load voice agents."));
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [repository],
  );

  const updateDraft = useCallback(
    (row: DevelopVoiceAgentOverviewRow, patch: VoiceAgentEditablePatch) => {
      setDraftsById((current) => {
        const draft = current[row.id] || createVoiceAgentDraft(row);
        return {
          ...current,
          [row.id]: {
            ...draft,
            ...(patch.mode !== undefined ? { voiceMode: patch.mode } : {}),
            ...(patch.model !== undefined ? { voiceModel: patch.model } : {}),
            ...(patch.voiceId !== undefined ? { voiceId: patch.voiceId } : {}),
            ...(patch.languageHint !== undefined ? { voiceLanguageHint: patch.languageHint } : {}),
            ...(patch.instructions !== undefined ? { voiceInstructions: patch.instructions } : {}),
          },
        };
      });
      setError("");
      setMessage("");
    },
    [],
  );

  const commitResponse = useCallback((agentId: string, response: unknown) => {
    setRecords((current) => {
      const existingIndex = current.findIndex(
        (record) => getVoiceAgentRecordId(record) === agentId,
      );
      if (existingIndex < 0) {
        return [...current, mergeVoiceAgentRecord({}, response, agentId)];
      }
      return current.map((record, index) =>
        index === existingIndex ? mergeVoiceAgentRecord(record, response, agentId) : record,
      );
    });
  }, []);

  const save = useCallback(
    async (row: DevelopVoiceAgentOverviewRow) => {
      setMutationState((current) => ({
        ...current,
        savingAgentId: row.id,
      }));
      setError("");
      setMessage("");
      try {
        const response = await repository.update(row.id, createVoiceAgentUpdatePayload(row));
        commitResponse(row.id, response);
        setMessage("Voice configuration saved.");
        return true;
      } catch (saveError) {
        setError(readErrorMessage(saveError, "Failed to save voice configuration."));
        return false;
      } finally {
        setMutationState((current) => ({
          ...current,
          savingAgentId: "",
        }));
      }
    },
    [commitResponse, repository],
  );

  const test = useCallback(
    async (row: DevelopVoiceAgentOverviewRow) => {
      if (!(await save(row))) return false;
      setMutationState((current) => ({
        ...current,
        testingAgentId: row.id,
      }));
      setError("");
      setMessage("");
      try {
        const response = await repository.createTestSession(row.id);
        setSessionResultsById((current) => ({
          ...current,
          [row.id]: response,
        }));
        setMessage("Web voice session created.");
        return true;
      } catch (sessionError) {
        setError(readErrorMessage(sessionError, "Failed to create voice session."));
        return false;
      } finally {
        setMutationState((current) => ({
          ...current,
          testingAgentId: "",
        }));
      }
    },
    [repository, save],
  );

  const provision = useCallback(
    async (row: DevelopVoiceAgentOverviewRow) => {
      if (!(await save(row))) return false;
      setMutationState((current) => ({
        ...current,
        provisioningAgentId: row.id,
      }));
      setError("");
      setMessage("");
      try {
        const response = await repository.provisionPhoneNumber(row.id);
        commitResponse(row.id, response);
        setMessage("Phone number provisioned.");
        return true;
      } catch (provisionError) {
        setError(readErrorMessage(provisionError, "Failed to provision phone number."));
        return false;
      } finally {
        setMutationState((current) => ({
          ...current,
          provisioningAgentId: "",
        }));
      }
    },
    [commitResponse, repository, save],
  );

  const disablePhone = useCallback(
    async (row: DevelopVoiceAgentOverviewRow) => {
      setMutationState((current) => ({
        ...current,
        disablingAgentId: row.id,
      }));
      setError("");
      setMessage("");
      try {
        const response = await repository.disablePhoneNumber(row.id);
        commitResponse(row.id, response);
        setMessage("Phone number disabled.");
        return true;
      } catch (disableError) {
        setError(readErrorMessage(disableError, "Failed to disable phone number."));
        return false;
      } finally {
        setMutationState((current) => ({
          ...current,
          disablingAgentId: "",
        }));
      }
    },
    [commitResponse, repository],
  );

  const rows = useMemo(
    () =>
      createDevelopVoiceAgentOverviewRows(records, draftsById, mutationState, sessionResultsById),
    [draftsById, mutationState, records, sessionResultsById],
  );

  return {
    rows,
    loading,
    error,
    message,
    load,
    updateDraft,
    save,
    test,
    provision,
    disablePhone,
  };
}
