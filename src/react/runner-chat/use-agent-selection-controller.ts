import { useEffect, useRef, useState } from "react";

import {
  getRunnerAgentSelectorMode,
  getRunnerPreferredDefaultAgentOption,
  normalizeRunnerReasoningEffort,
  type RunnerChatOption,
} from "./agent-options.js";
import type { RunnerAgentSelectorMode, RunnerReasoningEffortId } from "./voice-audio.js";

export interface UseRunnerAgentSelectionControllerOptions {
  activePopup: string | null;
  agentId?: string | null;
  agents: readonly RunnerChatOption[];
  controlledReasoningEffort?: unknown;
}

export function useRunnerAgentSelectionController({
  activePopup,
  agentId,
  agents,
  controlledReasoningEffort,
}: UseRunnerAgentSelectionControllerOptions) {
  const [selectedAgentId, setSelectedAgentId] = useState(() => {
    if (agentId) return agentId;
    return getRunnerPreferredDefaultAgentOption([...agents])?.id || "";
  });
  const [agentPopupMode, setAgentPopupMode] = useState<RunnerAgentSelectorMode>(() =>
    getRunnerAgentSelectorMode(
      agents.find((agent) => agent.id === agentId) ||
        getRunnerPreferredDefaultAgentOption([...agents]),
    ),
  );
  const [selectedReasoningEffort, setSelectedReasoningEffort] = useState<RunnerReasoningEffortId>(
    () => normalizeRunnerReasoningEffort(controlledReasoningEffort),
  );
  const [initialAgentTopId, setInitialAgentTopId] = useState<string | null>(null);
  const initializedOpenPopupModeRef = useRef(false);

  useEffect(() => {
    if (!agents.length) return;
    setSelectedAgentId((current) => {
      if (agentId && agents.some((agent) => agent.id === agentId)) {
        return agentId;
      }
      if (current && agents.some((agent) => agent.id === current)) {
        return current;
      }
      return getRunnerPreferredDefaultAgentOption([...agents])?.id || "";
    });
  }, [agentId, agents]);

  useEffect(() => {
    if (controlledReasoningEffort === undefined) return;
    setSelectedReasoningEffort(normalizeRunnerReasoningEffort(controlledReasoningEffort));
  }, [controlledReasoningEffort]);

  useEffect(() => {
    if (!agents.length) {
      setInitialAgentTopId(null);
      return;
    }
    if (initialAgentTopId && agents.some((agent) => agent.id === initialAgentTopId)) {
      return;
    }
    if (agentId && agents.some((agent) => agent.id === agentId)) {
      setInitialAgentTopId(agentId);
      return;
    }
    if (selectedAgentId && agents.some((agent) => agent.id === selectedAgentId)) {
      setInitialAgentTopId(selectedAgentId);
      return;
    }
    setInitialAgentTopId(getRunnerPreferredDefaultAgentOption([...agents])?.id || null);
  }, [agentId, agents, initialAgentTopId, selectedAgentId]);

  useEffect(() => {
    if (activePopup !== "agent" && activePopup !== "agent-reasoning") {
      initializedOpenPopupModeRef.current = false;
      return;
    }
    if (initializedOpenPopupModeRef.current) return;

    initializedOpenPopupModeRef.current = true;
    const nextSelectedAgent =
      agents.find((agent) => agent.id === selectedAgentId) ||
      (agentId ? agents.find((agent) => agent.id === agentId) : null) ||
      getRunnerPreferredDefaultAgentOption([...agents]) ||
      null;
    setAgentPopupMode(getRunnerAgentSelectorMode(nextSelectedAgent));
  }, [activePopup, agentId, agents, selectedAgentId]);

  return {
    agentPopupMode,
    initialAgentTopId,
    selectedAgentId,
    selectedReasoningEffort,
    setAgentPopupMode,
    setSelectedAgentId,
    setSelectedReasoningEffort,
  };
}
