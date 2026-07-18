import { useCallback, useEffect, useRef, useState } from "react";

import type { RunnerChatSkill } from "./skill-configuration.js";

export interface UseRunnerCustomSkillsControllerOptions {
  active: boolean;
  fetchCustomSkills?: () => Promise<RunnerChatSkill[]>;
}

export function useRunnerCustomSkillsController({
  active,
  fetchCustomSkills,
}: UseRunnerCustomSkillsControllerOptions) {
  const [customSkills, setCustomSkills] = useState<RunnerChatSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fetchCustomSkillsRef = useRef(fetchCustomSkills);

  useEffect(() => {
    if (!active || !fetchCustomSkills || loaded) return;

    let cancelled = false;
    setLoading(true);
    void fetchCustomSkills()
      .then((skills) => {
        if (cancelled) return;
        setCustomSkills((skills || []).filter((skill) => skill.isCustom));
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setCustomSkills([]);
        setLoaded(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active, fetchCustomSkills, loaded]);

  useEffect(() => {
    if (fetchCustomSkillsRef.current === fetchCustomSkills) return;
    fetchCustomSkillsRef.current = fetchCustomSkills;
    setCustomSkills([]);
    setLoaded(false);
  }, [fetchCustomSkills]);

  const acceptLoadedSkills = useCallback(
    (skills: RunnerChatSkill[] | null | undefined, succeeded: boolean) => {
      if (succeeded && skills) {
        setCustomSkills(skills);
        setLoaded(true);
        return;
      }
      setLoaded(false);
    },
    [],
  );

  return {
    acceptLoadedSkills,
    customSkills,
    loaded,
    loading,
  };
}
