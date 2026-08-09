import type { RunnerThreadParticipant, RunnerThreadProjection, RunnerThreadRun } from "./types.js";

const INTERNAL_ASSISTANT_KINDS = new Set(["communicator", "observer"]);

export function isRunnerInternalAssistantParticipant(
  participant?: RunnerThreadParticipant | null,
): boolean {
  return INTERNAL_ASSISTANT_KINDS.has(
    String(participant?.kind || "")
      .trim()
      .toLowerCase(),
  );
}

export function isRunnerPublicConversationRun(run: RunnerThreadRun): boolean {
  return (
    String(run.runKind || "")
      .trim()
      .toLowerCase() !== "observer"
  );
}

function findPublicWorkerParticipant(
  projection: RunnerThreadProjection,
  participant: RunnerThreadParticipant | null,
  fallbackAgentName: string,
): RunnerThreadParticipant | null {
  const workers = Object.values(projection.participantsById).filter(
    (candidate) =>
      String(candidate.kind || "")
        .trim()
        .toLowerCase() === "worker",
  );
  if (participant?.agentId) {
    const matchingAgent = workers.find((candidate) => candidate.agentId === participant.agentId);
    if (matchingAgent) return matchingAgent;
  }
  if (fallbackAgentName) {
    const matchingName = workers.find(
      (candidate) => candidate.displayName.trim().toLowerCase() === fallbackAgentName.toLowerCase(),
    );
    if (matchingName) return matchingName;
  }
  return workers.find((candidate) => candidate.active !== false) || workers[0] || null;
}

/**
 * Converts internal communicator and observer identities into the public agent
 * identity without mutating the canonical projection used for audit or routing.
 */
export function resolveRunnerPublicThreadParticipant(
  projection: RunnerThreadProjection,
  participant?: RunnerThreadParticipant | null,
  fallbackAgentName?: string | null,
): RunnerThreadParticipant | null {
  if (!participant || !isRunnerInternalAssistantParticipant(participant)) {
    return participant || null;
  }

  const normalizedFallbackName = String(fallbackAgentName || "").trim();
  const worker = findPublicWorkerParticipant(projection, participant, normalizedFallbackName);
  return {
    ...(worker || {}),
    id: worker?.id || `${participant.id}:public-agent`,
    threadId: worker?.threadId || participant.threadId || projection.threadId,
    kind: "worker",
    displayName: normalizedFallbackName || worker?.displayName?.trim() || "Agent",
    agentId: worker?.agentId || participant.agentId || null,
    avatarUrl: worker?.avatarUrl || null,
    active: worker?.active ?? true,
    metadata: worker?.metadata || null,
  };
}
