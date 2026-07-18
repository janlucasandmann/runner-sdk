import { useCallback, useEffect, useState } from "react";

import {
  areStringArraysEqual,
  defaultEnabledSkillIds,
  loadPersistedEnabledSkillIds,
  normalizeRunnerSkillId,
  persistEnabledSkillIds,
  type RunnerChatSkill,
} from "./skill-configuration.js";

export interface UseRunnerEnabledSkillsControllerOptions {
  controlledEnabledSkillIds: readonly string[] | null;
  normalizedSkills: readonly RunnerChatSkill[];
  onChange?: (skillIds: string[]) => void;
  storageKey: string;
}

export function useRunnerEnabledSkillsController({
  controlledEnabledSkillIds,
  normalizedSkills,
  onChange,
  storageKey,
}: UseRunnerEnabledSkillsControllerOptions) {
  const [enabledSkillIds, setEnabledSkillIds] = useState<string[]>(() => {
    if (controlledEnabledSkillIds !== null) {
      return [...controlledEnabledSkillIds];
    }
    const persisted = loadPersistedEnabledSkillIds(storageKey);
    if (persisted !== null) return persisted;
    return defaultEnabledSkillIds([...normalizedSkills]);
  });

  useEffect(() => {
    if (controlledEnabledSkillIds !== null) return;
    const persisted = loadPersistedEnabledSkillIds(storageKey);
    const nextEnabledSkillIds =
      persisted !== null ? persisted : defaultEnabledSkillIds([...normalizedSkills]);
    setEnabledSkillIds((current) =>
      areStringArraysEqual(current, nextEnabledSkillIds) ? current : nextEnabledSkillIds,
    );
  }, [controlledEnabledSkillIds, normalizedSkills, storageKey]);

  useEffect(() => {
    if (controlledEnabledSkillIds === null) return;
    const nextEnabledSkillIds = [...controlledEnabledSkillIds];
    setEnabledSkillIds((current) =>
      areStringArraysEqual(current, nextEnabledSkillIds) ? current : nextEnabledSkillIds,
    );
  }, [controlledEnabledSkillIds]);

  useEffect(() => {
    persistEnabledSkillIds(storageKey, enabledSkillIds);
  }, [enabledSkillIds, storageKey]);

  const toggleSkill = useCallback(
    (skillId: string) => {
      const normalizedSkillId = normalizeRunnerSkillId(skillId);
      if (!normalizedSkillId) return;
      setEnabledSkillIds((current) => {
        const next = current.includes(normalizedSkillId)
          ? current.filter((id) => id !== normalizedSkillId)
          : [...current, normalizedSkillId];
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  return {
    enabledSkillIds,
    toggleSkill,
  };
}
