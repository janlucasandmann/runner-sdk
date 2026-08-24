export const METRONOME_APP_ORIGIN_THREADS_SCRIPT = `
        useEffect(() => {
          absorbedMetronomeTriggerThreadIdsRef.current = absorbedMetronomeTriggerThreadIds && typeof absorbedMetronomeTriggerThreadIds === "object"
            ? absorbedMetronomeTriggerThreadIds
            : {};
        }, [absorbedMetronomeTriggerThreadIds]);

        function isPrivateThreadId(threadId) {
          const normalizedThreadId = String(threadId || "").trim();
          return Boolean(normalizedThreadId && privateThreadIdsRef.current.has(normalizedThreadId));
        }

        function isAbsorbedMetronomeTriggerThread(thread) {
          const normalizedThreadId = String(thread?.id || "").trim();
          if (normalizedThreadId && absorbedMetronomeTriggerThreadIdsRef.current?.[normalizedThreadId]) {
            const meta = getThreadMetronomeMetadata(thread);
            return !meta || isMetronomeOriginTriggerThread(thread);
          }
          return isMetronomeOriginTriggerThread(thread);
        }

`;
