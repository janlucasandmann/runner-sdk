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

        function isMetronomeOriginTriggerThread(thread) {
          const normalizedThread = normalizeThreadItem(thread || {});
          const normalizedThreadId = String(normalizedThread?.id || "").trim();
          const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
            ? thread.metadata
            : normalizedThread?.metadata && typeof normalizedThread.metadata === "object" && !Array.isArray(normalizedThread.metadata)
              ? normalizedThread.metadata
              : {};
          const metronome = metadata.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
            ? metadata.metronome
            : {};
          const workflow = metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
            ? metadata.metronomeWorkflow
            : {};
          const meta = getThreadMetronomeMetadata(normalizedThread);
          const groupKey = getSidebarMetronomeRunGroupKey(meta);
          if (!normalizedThreadId || !groupKey) {
            return false;
          }
          const nodeId = String(meta?.nodeId || workflow.nodeId || metronome.nodeId || "").trim();
          if (nodeId) {
            return false;
          }
          if (workflow.isOriginThread === false || workflow.is_origin_thread === false) {
            return false;
          }
          const originThreadIds = [
            workflow.originThreadId,
            workflow.sourceThreadId,
            workflow.triggerThreadId,
          ].map((value) => String(value || "").trim()).filter(Boolean);
          const hasMatchingOriginThreadId = originThreadIds.includes(normalizedThreadId);
          const hasDifferentOriginThreadId = originThreadIds.length > 0 && !hasMatchingOriginThreadId;
          if (hasDifferentOriginThreadId) {
            return false;
          }
          const definitionSource = String(workflow.definitionSource || workflow.source || "").trim().toLowerCase();
          const hasThreadTriggerMarker = Boolean(
            workflow.isOriginThread === true
            || workflow.is_origin_thread === true
            || hasMatchingOriginThreadId
            || String(workflow.triggerCommand || "").trim()
            || String(workflow.triggerEventId || "").trim()
            || definitionSource === "thread"
            || definitionSource === "thread_event"
          );
          return hasThreadTriggerMarker;
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
