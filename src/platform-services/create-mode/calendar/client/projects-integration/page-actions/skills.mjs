export const CALENDAR_PROJECTS_PAGE_SKILLS_SCRIPT = `
        function toggleScheduleSkill(skillId) {
          const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0];
          if (!normalizedSkillId) {
            return;
          }
          updateScheduleDraft((current) => {
            const currentSkillIds = getEffectivePlaygroundTaskEnabledSkillIds(current);
            return {
              ...(current || buildProjectScheduleDraft(selectedProject)),
              enabledSkills: currentSkillIds.includes(normalizedSkillId)
                ? currentSkillIds.filter((value) => value !== normalizedSkillId)
                : currentSkillIds.concat(normalizedSkillId),
            };
          });
        }

        function removeScheduleSkill(skillId) {
          const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0];
          if (!normalizedSkillId) {
            return;
          }
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            enabledSkills: getEffectivePlaygroundTaskEnabledSkillIds(current).filter((value) => value !== normalizedSkillId),
          }));
        }

`;
