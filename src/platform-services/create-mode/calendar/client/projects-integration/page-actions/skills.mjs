export const CALENDAR_PROJECTS_PAGE_SKILLS_SCRIPT = `
        function getScheduleSystemSkillIds() {
          return normalizePlaygroundEnabledSkillIds(
            taskSystemSkillItems.map((skill) => skill?.id)
          );
        }

        function getEffectiveScheduleEnabledSkillIds(scheduleRecord = scheduleDraft) {
          const explicitSkillIds = normalizePlaygroundEnabledSkillIds(scheduleRecord?.enabledSkills);
          const metadata = scheduleRecord?.metadata && typeof scheduleRecord.metadata === "object" && !Array.isArray(scheduleRecord.metadata)
            ? scheduleRecord.metadata
            : {};
          if (explicitSkillIds.length > 0 || metadata.scheduleSkillSelectionExplicit === true) {
            return explicitSkillIds;
          }
          return getScheduleSystemSkillIds();
        }

        function updateScheduleSkillSelection(skillIds) {
          const normalizedSkillIds = normalizePlaygroundEnabledSkillIds(skillIds);
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            enabledSkills: normalizedSkillIds,
            metadata: {
              ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
              scheduleSkillSelectionExplicit: true,
            },
          }));
        }

        function toggleScheduleSkill(skillId) {
          const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0];
          if (!normalizedSkillId) {
            return;
          }
          const currentSkillIds = getEffectiveScheduleEnabledSkillIds();
          updateScheduleSkillSelection(
            currentSkillIds.includes(normalizedSkillId)
              ? currentSkillIds.filter((value) => value !== normalizedSkillId)
              : currentSkillIds.concat(normalizedSkillId)
          );
        }

        function removeScheduleSkill(skillId) {
          const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0];
          if (!normalizedSkillId) {
            return;
          }
          updateScheduleSkillSelection(
            getEffectiveScheduleEnabledSkillIds().filter((value) => value !== normalizedSkillId)
          );
        }

        function setAllScheduleSystemSkillsEnabled(enabled) {
          const systemSkillIds = getScheduleSystemSkillIds();
          const systemSkillIdSet = new Set(systemSkillIds);
          const nonSystemSkillIds = getEffectiveScheduleEnabledSkillIds()
            .filter((skillId) => !systemSkillIdSet.has(skillId));
          updateScheduleSkillSelection(enabled
            ? nonSystemSkillIds.concat(systemSkillIds)
            : nonSystemSkillIds
          );
        }

`;
