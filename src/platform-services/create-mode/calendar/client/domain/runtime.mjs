export const CALENDAR_DOMAIN_RUNTIME_SCRIPT = `
      function buildPlaygroundDailyCronExpression(value) {
        const date = new Date(value || Date.now());
        if (Number.isNaN(date.getTime())) {
          return "0 9 * * *";
        }
        return String(date.getMinutes()) + " " + String(date.getHours()) + " * * *";
      }

      function formatPlaygroundScheduleClockTime(value) {
        const date = value instanceof Date ? new Date(value) : new Date(value || "");
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      }

      function startOfPlaygroundDay(value) {
        const date = value instanceof Date ? new Date(value) : new Date(value || Date.now());
        if (Number.isNaN(date.getTime())) {
          return null;
        }
        date.setHours(0, 0, 0, 0);
        return date;
      }

      function endOfPlaygroundDay(value) {
        const date = startOfPlaygroundDay(value);
        if (!date) {
          return null;
        }
        date.setHours(23, 59, 59, 999);
        return date;
      }

      function addPlaygroundDays(value, amount) {
        const date = value instanceof Date ? new Date(value) : new Date(value || Date.now());
        if (Number.isNaN(date.getTime())) {
          return null;
        }
        date.setDate(date.getDate() + Number(amount || 0));
        return date;
      }

      function buildPlaygroundCalendarVisibleRange(value, calendarView) {
        const referenceDate = value instanceof Date ? new Date(value) : new Date(value || Date.now());
        if (Number.isNaN(referenceDate.getTime())) {
          const fallback = new Date();
          return {
            start: startOfPlaygroundDay(fallback),
            end: endOfPlaygroundDay(fallback),
          };
        }

        if (calendarView === "day") {
          return {
            start: startOfPlaygroundDay(referenceDate),
            end: endOfPlaygroundDay(referenceDate),
          };
        }

        if (calendarView === "week") {
          const start = startOfPlaygroundDay(referenceDate);
          start.setDate(start.getDate() - start.getDay());
          return {
            start,
            end: endOfPlaygroundDay(addPlaygroundDays(start, 6)),
          };
        }

        const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
        const start = startOfPlaygroundDay(monthStart);
        const end = endOfPlaygroundDay(monthEnd);
        start.setDate(start.getDate() - start.getDay());
        end.setDate(end.getDate() + (6 - end.getDay()));
        return { start, end };
      }

      const PLAYGROUND_CRON_MONTH_ALIASES = {
        JAN: 1,
        FEB: 2,
        MAR: 3,
        APR: 4,
        MAY: 5,
        JUN: 6,
        JUL: 7,
        AUG: 8,
        SEP: 9,
        OCT: 10,
        NOV: 11,
        DEC: 12,
      };

      const PLAYGROUND_CRON_WEEKDAY_ALIASES = {
        SUN: 0,
        MON: 1,
        TUE: 2,
        WED: 3,
        THU: 4,
        FRI: 5,
        SAT: 6,
      };

      function parsePlaygroundCronTokenValue(rawValue, aliasMap) {
        const normalized = String(rawValue || "").trim().toUpperCase();
        if (!normalized) {
          return Number.NaN;
        }
        if (aliasMap && Object.prototype.hasOwnProperty.call(aliasMap, normalized)) {
          return aliasMap[normalized];
        }
        const numericValue = Number.parseInt(normalized, 10);
        return Number.isFinite(numericValue) ? numericValue : Number.NaN;
      }

      function normalizePlaygroundRecurringExpression(expression) {
        const normalized = String(expression || "").trim();
        if (!normalized) {
          return "";
        }
        const cronWrapperMatch = normalized.match(/^cron\((.+)\)$/i);
        if (cronWrapperMatch) {
          return String(cronWrapperMatch[1] || "").trim();
        }
        const timezonePrefixMatch = normalized.match(/^(?:CRON_TZ|TZ)=\\S+\\s+(.+)$/i);
        if (timezonePrefixMatch) {
          return String(timezonePrefixMatch[1] || "").trim();
        }
        return normalized;
      }

      function parsePlaygroundRecurringRateExpression(expression) {
        const normalized = normalizePlaygroundRecurringExpression(expression);
        const alias = normalized.toLowerCase();
        if (alias === "@hourly") {
          return { step: 1, unit: "hour" };
        }
        if (alias === "@daily" || alias === "@midnight") {
          return { step: 1, unit: "day" };
        }
        if (alias === "@weekly") {
          return { step: 1, unit: "week" };
        }
        if (alias === "@monthly") {
          return { step: 1, unit: "month" };
        }
        if (alias === "@yearly" || alias === "@annually") {
          return { step: 1, unit: "year" };
        }

        const rateMatch = normalized.match(/^rate\(\\s*(\\d+)\\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\\s*\)$/i);
        if (!rateMatch) {
          return null;
        }

        const step = Number.parseInt(rateMatch[1], 10);
        const unit = String(rateMatch[2] || "").toLowerCase().replace(/s$/, "");
        if (!Number.isFinite(step) || step <= 0 || !unit) {
          return null;
        }

        return { step, unit };
      }

      function addPlaygroundRecurringInterval(value, step, unit) {
        const date = value instanceof Date ? new Date(value) : new Date(value || Date.now());
        if (Number.isNaN(date.getTime())) {
          return null;
        }
        const amount = Number(step || 0);
        if (!Number.isFinite(amount) || amount === 0) {
          return date;
        }

        if (unit === "minute") {
          date.setMinutes(date.getMinutes() + amount);
          return date;
        }
        if (unit === "hour") {
          date.setHours(date.getHours() + amount);
          return date;
        }
        if (unit === "day") {
          date.setDate(date.getDate() + amount);
          return date;
        }
        if (unit === "week") {
          date.setDate(date.getDate() + amount * 7);
          return date;
        }
        if (unit === "month") {
          date.setMonth(date.getMonth() + amount);
          return date;
        }
        if (unit === "year") {
          date.setFullYear(date.getFullYear() + amount);
          return date;
        }
        return null;
      }

      function expandPlaygroundCronFieldValues(field, min, max, options = {}) {
        const normalized = String(field || "").trim();
        if (!normalized) {
          return {
            isValid: false,
            isWildcard: false,
            values: [],
          };
        }

        const wildcardValues = options.allowQuestionMarkWildcard ? new Set(["*", "?"]) : new Set(["*"]);
        if (wildcardValues.has(normalized)) {
          return {
            isValid: true,
            isWildcard: true,
            values: [],
          };
        }

        const normalizeValue = typeof options.normalizeValue === "function"
          ? options.normalizeValue
          : (value) => value;
        const parseValue = typeof options.parseValue === "function"
          ? options.parseValue
          : (value) => {
              const numericValue = Number.parseInt(String(value || "").trim(), 10);
              return Number.isFinite(numericValue) ? numericValue : Number.NaN;
            };
        const values = new Set();
        const segments = normalized.split(",");

        for (const rawSegment of segments) {
          const segment = String(rawSegment || "").trim();
          if (!segment) {
            return {
              isValid: false,
              isWildcard: false,
              values: [],
            };
          }

          const [baseSegment, stepSegment] = segment.split("/");
          const step = stepSegment ? Number.parseInt(stepSegment, 10) : 1;
          if (!Number.isFinite(step) || step <= 0) {
            return {
              isValid: false,
              isWildcard: false,
              values: [],
            };
          }

          let rangeStart = min;
          let rangeEnd = max;
          if (baseSegment && baseSegment !== "*") {
            if (baseSegment.includes("-")) {
              const [rawStart, rawEnd] = baseSegment.split("-");
              rangeStart = parseValue(rawStart);
              rangeEnd = parseValue(rawEnd);
            } else {
              rangeStart = parseValue(baseSegment);
              rangeEnd = rangeStart;
            }
          }

          if (!Number.isFinite(rangeStart) || !Number.isFinite(rangeEnd) || rangeStart > rangeEnd) {
            return {
              isValid: false,
              isWildcard: false,
              values: [],
            };
          }

          for (let valueIndex = rangeStart; valueIndex <= rangeEnd; valueIndex += step) {
            const normalizedValue = normalizeValue(valueIndex);
            if (!Number.isFinite(normalizedValue) || normalizedValue < min || normalizedValue > max) {
              return {
                isValid: false,
                isWildcard: false,
                values: [],
              };
            }
            values.add(normalizedValue);
          }
        }

        return {
          isValid: true,
          isWildcard: false,
          values: Array.from(values).sort((left, right) => left - right),
        };
      }

      function parsePlaygroundCalendarCronExpression(expression) {
        const normalizedExpression = normalizePlaygroundRecurringExpression(expression);
        const parts = normalizedExpression.split(/\\s+/).filter(Boolean);
        let normalizedParts = parts;
        if (parts.length === 6) {
          normalizedParts = parts.slice(1);
        } else if (parts.length === 7) {
          normalizedParts = parts.slice(1, 6);
        }
        if (normalizedParts.length !== 5) {
          return null;
        }

        const minuteField = expandPlaygroundCronFieldValues(normalizedParts[0], 0, 59);
        const hourField = expandPlaygroundCronFieldValues(normalizedParts[1], 0, 23);
        const dayOfMonthField = expandPlaygroundCronFieldValues(normalizedParts[2], 1, 31, {
          allowQuestionMarkWildcard: true,
        });
        const monthField = expandPlaygroundCronFieldValues(normalizedParts[3], 1, 12, {
          parseValue: (value) => parsePlaygroundCronTokenValue(value, PLAYGROUND_CRON_MONTH_ALIASES),
        });
        const dayOfWeekField = expandPlaygroundCronFieldValues(normalizedParts[4], 0, 7, {
          allowQuestionMarkWildcard: true,
          parseValue: (value) => parsePlaygroundCronTokenValue(value, PLAYGROUND_CRON_WEEKDAY_ALIASES),
          normalizeValue: (value) => value === 7 ? 0 : value,
        });

        if (!minuteField.isValid || !hourField.isValid || !dayOfMonthField.isValid || !monthField.isValid || !dayOfWeekField.isValid) {
          return null;
        }

        if (minuteField.isWildcard || hourField.isWildcard || minuteField.values.length > 12 || hourField.values.length > 12) {
          return null;
        }

        return {
          minutes: minuteField.values,
          hours: hourField.values,
          months: monthField.isWildcard ? null : new Set(monthField.values),
          daysOfMonth: dayOfMonthField.isWildcard ? null : new Set(dayOfMonthField.values),
          daysOfWeek: dayOfWeekField.isWildcard ? null : new Set(dayOfWeekField.values),
          hasExplicitDayOfMonth: !dayOfMonthField.isWildcard,
          hasExplicitDayOfWeek: !dayOfWeekField.isWildcard,
        };
      }

      function matchesPlaygroundCalendarCronDate(date, cronPattern) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime()) || !cronPattern) {
          return false;
        }

        const month = date.getMonth() + 1;
        if (cronPattern.months && !cronPattern.months.has(month)) {
          return false;
        }

        const dayOfMonthMatches = cronPattern.daysOfMonth ? cronPattern.daysOfMonth.has(date.getDate()) : true;
        const dayOfWeekMatches = cronPattern.daysOfWeek ? cronPattern.daysOfWeek.has(date.getDay()) : true;

        if (cronPattern.hasExplicitDayOfMonth && cronPattern.hasExplicitDayOfWeek) {
          return dayOfMonthMatches || dayOfWeekMatches;
        }

        return dayOfMonthMatches && dayOfWeekMatches;
      }

      function buildPlaygroundScheduleCalendarEvents(schedule, visibleRange) {
        if (!schedule || !visibleRange?.start || !visibleRange?.end) {
          return [];
        }

        const title = schedule.name || schedule.task || "Untitled schedule";
        const durationMs = 60 * 60 * 1000;
        const rangeStart = visibleRange.start instanceof Date ? visibleRange.start : new Date(visibleRange.start);
        const rangeEnd = visibleRange.end instanceof Date ? visibleRange.end : new Date(visibleRange.end);
        if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
          return [];
        }

        const isRecurringSchedule = schedule.scheduleType === "recurring"
          || (typeof schedule.cronExpression === "string" && schedule.cronExpression.trim().length > 0);

        if (isRecurringSchedule && !schedule.enabled) {
          return [];
        }

        const eventByStartIso = new Map();
        function appendScheduleEvent(startValue) {
          const start = startValue instanceof Date ? new Date(startValue) : new Date(startValue || "");
          if (Number.isNaN(start.getTime()) || start < rangeStart || start > rangeEnd) {
            return;
          }
          const key = start.toISOString();
          if (eventByStartIso.has(key)) {
            return;
          }
          eventByStartIso.set(key, {
            id: schedule.id + ":" + key,
            title,
            start,
            end: new Date(start.getTime() + durationMs),
            resource: schedule,
          });
        }

        const explicitOccurrences = Array.isArray(schedule.occurrences)
          ? schedule.occurrences
            .map((occurrence) => new Date(occurrence))
            .filter((occurrence) => occurrence instanceof Date && !Number.isNaN(occurrence.getTime()))
          : [];
        explicitOccurrences.forEach((occurrence) => appendScheduleEvent(occurrence));

        if (isRecurringSchedule) {
          const recurringRate = parsePlaygroundRecurringRateExpression(schedule.cronExpression);
          if (recurringRate) {
            const anchorValue = schedule.scheduledTime || schedule.createdAt || schedule.nextRunAt || "";
            const anchor = new Date(anchorValue);
            if (!Number.isNaN(anchor.getTime())) {
              let occurrence = new Date(anchor);
              let guard = 0;

              while (occurrence > rangeStart && guard < 2000) {
                const previousOccurrence = addPlaygroundRecurringInterval(occurrence, -recurringRate.step, recurringRate.unit);
                if (!(previousOccurrence instanceof Date) || Number.isNaN(previousOccurrence.getTime()) || previousOccurrence.getTime() === occurrence.getTime()) {
                  break;
                }
                occurrence = previousOccurrence;
                guard += 1;
              }

              while (occurrence < rangeStart && guard < 4000) {
                const nextOccurrence = addPlaygroundRecurringInterval(occurrence, recurringRate.step, recurringRate.unit);
                if (!(nextOccurrence instanceof Date) || Number.isNaN(nextOccurrence.getTime()) || nextOccurrence.getTime() === occurrence.getTime()) {
                  break;
                }
                occurrence = nextOccurrence;
                guard += 1;
              }

              while (occurrence <= rangeEnd && guard < 6000) {
                appendScheduleEvent(occurrence);
                const nextOccurrence = addPlaygroundRecurringInterval(occurrence, recurringRate.step, recurringRate.unit);
                if (!(nextOccurrence instanceof Date) || Number.isNaN(nextOccurrence.getTime()) || nextOccurrence.getTime() === occurrence.getTime()) {
                  break;
                }
                occurrence = nextOccurrence;
                guard += 1;
              }

              return Array.from(eventByStartIso.values()).sort((left, right) => left.start.getTime() - right.start.getTime());
            }
          }

          const cronPattern = parsePlaygroundCalendarCronExpression(schedule.cronExpression);
          if (cronPattern) {
            const anchorValue = schedule.scheduledTime || schedule.createdAt || "";
            const anchorDate = new Date(anchorValue || Date.now());
            const anchor = anchorValue && !Number.isNaN(anchorDate.getTime()) ? anchorDate : null;
            const dayCursorStart = startOfPlaygroundDay(rangeStart);
            const dayCursorEnd = startOfPlaygroundDay(rangeEnd);

            for (let dayCursor = dayCursorStart; dayCursor && dayCursorEnd && dayCursor <= dayCursorEnd; dayCursor = addPlaygroundDays(dayCursor, 1)) {
              if (!matchesPlaygroundCalendarCronDate(dayCursor, cronPattern)) {
                continue;
              }

              for (const hour of cronPattern.hours) {
                for (const minute of cronPattern.minutes) {
                  const start = new Date(
                    dayCursor.getFullYear(),
                    dayCursor.getMonth(),
                    dayCursor.getDate(),
                    hour,
                    minute,
                    0,
                    0
                  );
                  if ((anchor && start < anchor) || start < rangeStart || start > rangeEnd) {
                    continue;
                  }
                  appendScheduleEvent(start);
                }
              }
            }

            return Array.from(eventByStartIso.values()).sort((left, right) => left.start.getTime() - right.start.getTime());
          }
        }

        if (eventByStartIso.size === 0) {
          const anchorValue = !isRecurringSchedule
            ? schedule.scheduledTime || schedule.nextRunAt || ""
            : schedule.nextRunAt || schedule.scheduledTime || "";
          appendScheduleEvent(anchorValue);
        }

        return Array.from(eventByStartIso.values()).sort((left, right) => left.start.getTime() - right.start.getTime());
      }

      const PLAYGROUND_TASK_CALENDAR_BLOCK_MS = 30 * 60 * 1000;
      const PLAYGROUND_TASK_SCHEDULE_PRESETS = [
        { id: "daily", label: "Every day", cron: "0 9 * * *" },
        { id: "weekdays", label: "Every weekday", cron: "0 9 * * 1-5" },
        { id: "weekly", label: "Every week", cron: "0 9 * * 1" },
      ];

      function buildPlaygroundCronExpressionForPreset(presetId, startValue) {
        const preset = getPlaygroundTaskSchedulePreset(presetId);
        const date = new Date(startValue || Date.now());
        if (Number.isNaN(date.getTime())) {
          return preset.cron;
        }
        const minute = String(date.getMinutes());
        const hour = String(date.getHours());
        if (preset.id === "weekdays") {
          return minute + " " + hour + " * * 1-5";
        }
        if (preset.id === "weekly") {
          return minute + " " + hour + " * * " + String(date.getDay());
        }
        return minute + " " + hour + " * * *";
      }

      function normalizePlaygroundTaskScheduleCronParts(expression) {
        const normalizedExpression = normalizePlaygroundRecurringExpression(expression);
        const parts = normalizedExpression.split(/\\s+/).filter(Boolean);
        if (parts.length === 6) {
          return parts.slice(1);
        }
        if (parts.length === 7) {
          return parts.slice(1, 6);
        }
        return parts.length === 5 ? parts : [];
      }

      function getPlaygroundTaskScheduleRecurringBaseLabel(cronExpression) {
        const presetLabel = PLAYGROUND_TASK_SCHEDULE_PRESETS.find((preset) => preset.cron === cronExpression)?.label || "";
        if (presetLabel) return presetLabel;
        const parts = normalizePlaygroundTaskScheduleCronParts(cronExpression);
        if (parts.length === 5) {
          const dayOfMonth = String(parts[2] || "").trim();
          const month = String(parts[3] || "").trim();
          const dayOfWeek = String(parts[4] || "").trim();
          if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") return "Every day";
          if (dayOfMonth === "*" && month === "*" && dayOfWeek === "1-5") return "Every weekday";
          if (dayOfMonth === "*" && month === "*" && dayOfWeek && dayOfWeek !== "*") return "Every week";
        }
        return "Recurring";
      }

      function formatPlaygroundRecurringScheduleTimeLabel(cronExpression, fallbackValue) {
        const cronPattern = parsePlaygroundCalendarCronExpression(cronExpression);
        if (cronPattern && cronPattern.hours?.length === 1 && cronPattern.minutes?.length === 1) {
          const date = new Date();
          date.setHours(cronPattern.hours[0], cronPattern.minutes[0], 0, 0);
          return formatPlaygroundScheduleClockTime(date);
        }
        return formatPlaygroundScheduleClockTime(fallbackValue);
      }

      function getPlaygroundTaskSchedulePresetId(cronExpression) {
        const normalizedCronExpression = typeof cronExpression === "string" ? cronExpression.trim() : "";
        const exactPresetId = PLAYGROUND_TASK_SCHEDULE_PRESETS.find((preset) => preset.cron === normalizedCronExpression)?.id || "";
        if (exactPresetId) return exactPresetId;
        const parts = normalizePlaygroundTaskScheduleCronParts(normalizedCronExpression);
        if (parts.length === 5) {
          const dayOfMonth = String(parts[2] || "").trim();
          const month = String(parts[3] || "").trim();
          const dayOfWeek = String(parts[4] || "").trim();
          if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") return "daily";
          if (dayOfMonth === "*" && month === "*" && dayOfWeek === "1-5") return "weekdays";
          if (dayOfMonth === "*" && month === "*" && dayOfWeek && dayOfWeek !== "*") return "weekly";
        }
        return "";
      }

      function getPlaygroundTaskSchedulePreset(presetId) {
        const normalizedPresetId = typeof presetId === "string" ? presetId.trim() : "";
        return PLAYGROUND_TASK_SCHEDULE_PRESETS.find((preset) => preset.id === normalizedPresetId) || PLAYGROUND_TASK_SCHEDULE_PRESETS[0];
      }

      function getPlaygroundTaskScheduleConfig(task) {
        const normalizedTask = normalizePlaygroundTaskRecord(task);
        const scheduleType = normalizedTask.scheduleType === "recurring" || normalizedTask.cronExpression
          ? "recurring"
          : "one-time";
        return {
          scheduleType,
          scheduledStartAt: normalizedTask.scheduledStartAt || null,
          cronExpression: typeof normalizedTask.cronExpression === "string" && normalizedTask.cronExpression.trim()
            ? normalizedTask.cronExpression.trim()
            : null,
          timezone: typeof normalizedTask.scheduleTimezone === "string" && normalizedTask.scheduleTimezone.trim()
            ? normalizedTask.scheduleTimezone.trim()
            : "UTC",
          enabled: normalizedTask.scheduleEnabled !== false,
        };
      }

      function buildPlaygroundTaskCalendarEvents(task, ticketNumber, visibleRange) {
        if (!task?.id || !visibleRange?.start || !visibleRange?.end) {
          return [];
        }

        const normalizedTask = normalizePlaygroundTaskRecord(task);
        const scheduleConfig = getPlaygroundTaskScheduleConfig(normalizedTask);
        const taskTitle = (ticketNumber ? ticketNumber + " " : "") + (normalizedTask.title || "Untitled Task");
        const taskType = normalizePlaygroundTaskType(normalizedTask.taskType);
        const taskPriority = normalizedTask.priority || "medium";
        const taskColor = getPlaygroundTaskColorId(normalizedTask.taskColor);

        if (scheduleConfig.scheduleType === "recurring" && scheduleConfig.cronExpression) {
          return buildPlaygroundScheduleCalendarEvents({
            id: normalizedTask.id,
            name: taskTitle,
            task: normalizedTask.description || normalizedTask.title || "Untitled Task",
            scheduleType: "recurring",
            scheduledTime: scheduleConfig.scheduledStartAt || normalizedTask.createdAt || null,
            cronExpression: scheduleConfig.cronExpression,
            timezone: scheduleConfig.timezone,
            enabled: scheduleConfig.enabled,
            createdAt: normalizedTask.createdAt || null,
          }, visibleRange).map((event) => ({
            ...event,
            id: "task-calendar:" + normalizedTask.id + ":" + event.start.toISOString(),
            title: taskTitle,
            resource: {
              kind: "task",
              taskId: normalizedTask.id,
              taskColor: taskColor,
              taskType,
              priority: taskPriority,
            },
          }));
        }

        if (!scheduleConfig.scheduledStartAt) {
          return [];
        }

        const start = new Date(scheduleConfig.scheduledStartAt);
        if (Number.isNaN(start.getTime())) {
          return [];
        }

        const rangeStart = visibleRange.start instanceof Date ? visibleRange.start : new Date(visibleRange.start);
        const rangeEnd = visibleRange.end instanceof Date ? visibleRange.end : new Date(visibleRange.end);
        if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
          return [];
        }

        const end = new Date(start.getTime() + PLAYGROUND_TASK_CALENDAR_BLOCK_MS);

        if (end < rangeStart || start > rangeEnd) {
          return [];
        }

        return [{
          id: "task-calendar:" + normalizedTask.id,
          title: taskTitle,
          start,
          end,
          resource: {
            kind: "task",
            taskId: normalizedTask.id,
            taskColor: taskColor,
            taskType,
            priority: taskPriority,
          },
        }];
      }

      function getPlaygroundMetronomeListArray(data) {
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.metronomes)) return data.metronomes;
        if (Array.isArray(data?.workflows)) return data.workflows;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data)) return data;
        return [];
      }

      function getPlaygroundMetronomeWorkflowDefinition(workflow) {
        const source = workflow && typeof workflow === "object" ? workflow : {};
        const definition = source.definition && typeof source.definition === "object" ? source.definition : {};
        const metadataDefinition = source.metadata?.definition && typeof source.metadata.definition === "object" ? source.metadata.definition : {};
        const metadataWorkflow = source.metadata?.workflow && typeof source.metadata.workflow === "object" ? source.metadata.workflow : {};
        const metadataWorkflowDefinition = metadataWorkflow.definition && typeof metadataWorkflow.definition === "object" ? metadataWorkflow.definition : {};
        const graphSnapshot = source.graphSnapshot && typeof source.graphSnapshot === "object"
          ? source.graphSnapshot
          : source.workflowGraphSnapshot && typeof source.workflowGraphSnapshot === "object"
            ? source.workflowGraphSnapshot
            : source.metadata?.graphSnapshot && typeof source.metadata.graphSnapshot === "object"
              ? source.metadata.graphSnapshot
              : source.metadata?.workflowGraphSnapshot && typeof source.metadata.workflowGraphSnapshot === "object"
                ? source.metadata.workflowGraphSnapshot
                : {};
        return {
          nodes: Array.isArray(source.nodes)
            ? source.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : Array.isArray(metadataDefinition.nodes)
                ? metadataDefinition.nodes
                : Array.isArray(metadataWorkflow.nodes)
                  ? metadataWorkflow.nodes
                  : Array.isArray(metadataWorkflowDefinition.nodes)
                    ? metadataWorkflowDefinition.nodes
                    : Array.isArray(graphSnapshot.nodes)
                      ? graphSnapshot.nodes
                      : [],
          edges: Array.isArray(source.edges)
            ? source.edges
            : Array.isArray(definition.edges)
              ? definition.edges
              : Array.isArray(metadataDefinition.edges)
                ? metadataDefinition.edges
                : Array.isArray(metadataWorkflow.edges)
                  ? metadataWorkflow.edges
                  : Array.isArray(metadataWorkflowDefinition.edges)
                    ? metadataWorkflowDefinition.edges
                    : Array.isArray(graphSnapshot.edges)
                      ? graphSnapshot.edges
                      : [],
        };
      }

      function normalizePlaygroundCalendarMetronomeWorkflow(rawWorkflow) {
        const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
        const definition = getPlaygroundMetronomeWorkflowDefinition(workflow);
        const metadata = workflow.metadata && typeof workflow.metadata === "object" ? workflow.metadata : {};
        return {
          id: String(workflow.id || "").trim(),
          name: String(workflow.name || "Untitled Metronome").trim() || "Untitled Metronome",
          status: workflow.status === "active" ? "active" : workflow.status === "paused" ? "paused" : "draft",
          projectId: String(workflow.projectId || workflow.project_id || metadata.projectId || metadata.project_id || "").trim(),
          projectName: String(workflow.projectName || workflow.project_name || metadata.projectName || metadata.project_name || "").trim(),
          nodes: definition.nodes,
          edges: definition.edges,
          createdAt: String(workflow.createdAt || workflow.created_at || "").trim(),
          updatedAt: String(workflow.updatedAt || workflow.updated_at || "").trim(),
        };
      }

      function getPlaygroundMetronomePeriodicTrigger(workflow) {
        const normalized = normalizePlaygroundCalendarMetronomeWorkflow(workflow);
        if (!normalized.id || normalized.status !== "active") {
          return null;
        }
        const triggerNode = (Array.isArray(normalized.nodes) ? normalized.nodes : [])
          .find((node) => {
            const data = node?.data && typeof node.data === "object" ? node.data : node;
            const kind = String(data?.kind || "").trim();
            const subtype = String(data?.subtype || "").trim();
            const config = data?.config && typeof data.config === "object" ? data.config : {};
            const triggerType = String(config.triggerType || subtype || "").trim();
            return kind === "trigger" && triggerType === "periodic";
          });
        if (!triggerNode) {
          return null;
        }
        const triggerData = triggerNode?.data && typeof triggerNode.data === "object" ? triggerNode.data : triggerNode;
        const config = triggerData?.config && typeof triggerData.config === "object" ? triggerData.config : {};
        const scheduleType = config.scheduleType === "recurring" ? "recurring" : "one-time";
        const scheduledTime = String(config.scheduledTime || config.scheduledStartAt || config.nextRunAt || "").trim();
        const cronExpression = String(config.cronExpression || "").trim();
        if (!scheduledTime && !(scheduleType === "recurring" && cronExpression)) {
          return null;
        }
        return {
          workflow: normalized,
          config: {
            scheduleType,
            scheduledTime,
            cronExpression,
            timezone: String(config.scheduleTimezone || config.timezone || "UTC").trim() || "UTC",
          },
        };
      }

      function buildPlaygroundMetronomeCalendarEvents(workflow, visibleRange) {
        const periodicTrigger = getPlaygroundMetronomePeriodicTrigger(workflow);
        if (!periodicTrigger) {
          return [];
        }
        const { workflow: normalized, config } = periodicTrigger;
        return buildPlaygroundScheduleCalendarEvents({
          id: "metronome:" + normalized.id,
          name: normalized.name,
          task: normalized.name,
          kind: "metronome",
          scheduleType: config.scheduleType,
          scheduledTime: config.scheduledTime || normalized.createdAt || new Date().toISOString(),
          cronExpression: config.scheduleType === "recurring" ? config.cronExpression : null,
          timezone: config.timezone,
          enabled: true,
          createdAt: normalized.createdAt || null,
        }, visibleRange).map((event) => ({
          ...event,
          id: "metronome-calendar:" + normalized.id + ":" + event.start.toISOString(),
          title: normalized.name,
          resource: {
            kind: "metronome",
            workflowId: normalized.id,
            workflowName: normalized.name,
            projectId: normalized.projectId,
            projectName: normalized.projectName,
            scheduleType: config.scheduleType,
          },
        }));
      }

      function formatPlaygroundTaskDateTime(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      }

      function formatPlaygroundTaskScheduleSummary(taskRecord) {
        const scheduleConfig = getPlaygroundTaskScheduleConfig(taskRecord);
        if (scheduleConfig.scheduleType === "recurring") {
          const baseLabel = getPlaygroundTaskScheduleRecurringBaseLabel(scheduleConfig.cronExpression);
          const timeLabel = formatPlaygroundRecurringScheduleTimeLabel(scheduleConfig.cronExpression, scheduleConfig.scheduledStartAt);
          return timeLabel ? baseLabel + " at " + timeLabel : baseLabel;
        }
        const startLabel = formatPlaygroundTaskDateTime(scheduleConfig.scheduledStartAt);
        return startLabel || "";
      }

      function formatPlaygroundScheduleDateTime(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      }

      function buildPlaygroundWelcomeCalendarRange(value) {
        const referenceDate = value instanceof Date ? new Date(value) : new Date(value || Date.now());
        if (Number.isNaN(referenceDate.getTime())) {
          return buildPlaygroundWelcomeCalendarRange(new Date());
        }

        const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
        const start = startOfPlaygroundDay(monthStart);
        const end = endOfPlaygroundDay(monthEnd);
        const startOffset = (start.getDay() + 6) % 7;
        const endOffset = (6 - ((end.getDay() + 6) % 7));
        start.setDate(start.getDate() - startOffset);
        end.setDate(end.getDate() + endOffset);
        return { start, end };
      }

      function buildPlaygroundWelcomeCalendarWeekdayLabels() {
        const labels = [];
        const mondayReference = new Date(Date.UTC(2024, 0, 1));
        for (let index = 0; index < 7; index += 1) {
          const date = new Date(mondayReference);
          date.setUTCDate(mondayReference.getUTCDate() + index);
          const label = new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(date);
          labels.push(String(label || "").slice(0, 1).toUpperCase() || "");
        }
        return labels;
      }

      function buildPlaygroundWelcomeCalendarMonthLabel(value) {
        const date = value instanceof Date ? new Date(value) : new Date(value || Date.now());
        if (Number.isNaN(date.getTime())) {
          return "";
        }
        return new Intl.DateTimeFormat(undefined, { month: "long" }).format(date).toUpperCase();
      }

      function buildPlaygroundWelcomeCalendarCells(value, eventDateKeys = new Set()) {
        const referenceDate = value instanceof Date ? new Date(value) : new Date(value || Date.now());
        if (Number.isNaN(referenceDate.getTime())) {
          return [];
        }

        const year = referenceDate.getFullYear();
        const month = referenceDate.getMonth();
        const monthStart = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const leadingOffset = (monthStart.getDay() + 6) % 7;
        const totalCells = Math.ceil((leadingOffset + daysInMonth) / 7) * 7;
        const todayKey = new Date().toISOString().slice(0, 10);
        const cells = [];

        for (let index = 0; index < totalCells; index += 1) {
          const dayNumber = index - leadingOffset + 1;
          if (dayNumber < 1 || dayNumber > daysInMonth) {
            cells.push({
              key: "empty:" + index,
              value: "",
              isEmpty: true,
              isToday: false,
              hasEvents: false,
            });
            continue;
          }

          const date = new Date(year, month, dayNumber);
          const key = date.toISOString().slice(0, 10);
          cells.push({
            key,
            value: String(dayNumber),
            isEmpty: false,
            isToday: key === todayKey,
            hasEvents: eventDateKeys instanceof Set ? eventDateKeys.has(key) : false,
          });
        }

        return cells;
      }

      function choosePlaygroundWelcomeProject(projects, preferredProjectId) {
        const normalizedProjects = Array.isArray(projects) ? projects.filter((project) => project?.id) : [];
        const preferredId = String(preferredProjectId || "").trim();
        if (preferredId) {
          const matchedProject = normalizedProjects.find((project) => project.id === preferredId);
          if (matchedProject) {
            return matchedProject;
          }
        }

        return normalizedProjects
          .slice()
          .sort((left, right) => {
            const rightUpdatedAt = Date.parse(right?.updatedAt || right?.createdAt || 0) || 0;
            const leftUpdatedAt = Date.parse(left?.updatedAt || left?.createdAt || 0) || 0;
            return rightUpdatedAt - leftUpdatedAt;
          })[0] || null;
      }

	      function buildPlaygroundWelcomeTaskRows(tasks, ticketNumbersById) {
	        const normalizedTasks = (Array.isArray(tasks) ? tasks : [])
	          .filter((task) => task?.id)
	          .map((task) => normalizePlaygroundTaskRecord(task))
	          .filter((task) => task.status !== "done")
	          .slice()
	          .sort((left, right) => {
	            const leftNeedsHuman = isPlaygroundHumanAttentionTask(left) ? 1 : 0;
	            const rightNeedsHuman = isPlaygroundHumanAttentionTask(right) ? 1 : 0;
	            if (leftNeedsHuman !== rightNeedsHuman) {
              return rightNeedsHuman - leftNeedsHuman;
	            }
	            const leftUpdatedAt = Date.parse(left?.updatedAt || left?.createdAt || 0) || 0;
	            const rightUpdatedAt = Date.parse(right?.updatedAt || right?.createdAt || 0) || 0;
            if (leftUpdatedAt !== rightUpdatedAt) {
              return rightUpdatedAt - leftUpdatedAt;
            }
            const leftTicketNumber = parsePlaygroundTaskTicketNumber(ticketNumbersById?.[left.id] || left?.ticketNumber);
            const rightTicketNumber = parsePlaygroundTaskTicketNumber(ticketNumbersById?.[right.id] || right?.ticketNumber);
            return rightTicketNumber - leftTicketNumber;
          });

	        return normalizedTasks.slice(0, 3).map((task) => {
	          const label = String(task.title || "").trim() || (ticketNumbersById?.[task.id] || task.ticketNumber || "Untitled Task");
	          return {
	            id: task.id,
	            label,
	            priority: task.priority,
	            isSubtask: isPlaygroundSubtaskRecord(task),
	            ticketNumber: ticketNumbersById?.[task.id] || task.ticketNumber || "",
	            task,
	          };
	        });
	      }

      function formatPlaygroundWelcomeWeekdayLabel(value) {
        const date = value instanceof Date ? value : new Date(value || "");
        if (Number.isNaN(date.getTime())) {
          return "";
        }
        return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
      }

      function formatPlaygroundWelcomeMonthDayLabel(value) {
        const date = value instanceof Date ? value : new Date(value || "");
        if (Number.isNaN(date.getTime())) {
          return "";
        }
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
      }

      function formatPlaygroundWelcomeTimeLabel(value) {
        const date = value instanceof Date ? value : new Date(value || "");
        if (Number.isNaN(date.getTime())) {
          return "";
        }
        return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
      }

      function buildPlaygroundWelcomeTodayState(referenceDate, schedules, projectRecord, tasks = [], ticketNumbersById = {}) {
        const now = referenceDate instanceof Date ? new Date(referenceDate) : new Date(referenceDate || Date.now());
        if (Number.isNaN(now.getTime())) {
          return buildPlaygroundWelcomeTodayState(new Date(), schedules, projectRecord, tasks, ticketNumbersById);
        }

        const projectName = typeof projectRecord?.name === "string" && projectRecord.name.trim()
          ? projectRecord.name.trim()
          : "Project calendar";
        const todayStart = startOfPlaygroundDay(now);
        const todayEnd = endOfPlaygroundDay(now);
        const todayEvents = [];

        (Array.isArray(schedules) ? schedules : []).forEach((schedule) => {
          buildPlaygroundScheduleCalendarEvents(schedule, { start: todayStart, end: todayEnd }).forEach((event) => {
            const start = event?.start instanceof Date ? event.start : new Date(event?.start || "");
            if (Number.isNaN(start.getTime())) {
              return;
            }
            todayEvents.push({
              id: event?.id || schedule?.id || "",
              start,
              title: typeof event?.title === "string" && event.title.trim()
                ? event.title.trim()
                : (schedule?.name || schedule?.task || "Scheduled run"),
              schedule: normalizePlaygroundScheduleRecord(event?.resource || schedule),
              kind: "schedule",
            });
          });
        });

        (Array.isArray(tasks) ? tasks : []).forEach((task) => {
          const normalizedTask = normalizePlaygroundTaskRecord(task);
          if (!normalizedTask?.id || String(normalizedTask.status || "").trim() === "done") {
            return;
          }
          const ticketNumber = ticketNumbersById?.[normalizedTask.id] || normalizedTask.ticketNumber || "";
          buildPlaygroundTaskCalendarEvents(
            normalizedTask,
            ticketNumber,
            { start: todayStart, end: todayEnd }
          ).forEach((event) => {
            const start = event?.start instanceof Date ? event.start : new Date(event?.start || "");
            if (Number.isNaN(start.getTime())) {
              return;
            }
            todayEvents.push({
              id: event?.id || ("task-calendar:" + normalizedTask.id + ":" + start.toISOString()),
              start,
              title: typeof event?.title === "string" && event.title.trim()
                ? event.title.trim()
                : normalizedTask.title || "Scheduled task",
              schedule: null,
              task: normalizedTask,
              kind: "task",
            });
          });
        });

        todayEvents.sort((left, right) => left.start.getTime() - right.start.getTime());

        const upcomingSchedule = todayEvents[0] || (Array.isArray(schedules) ? schedules : [])
          .map((schedule) => {
            const normalizedSchedule = normalizePlaygroundScheduleRecord(schedule);
            const anchorValue = normalizedSchedule.scheduleType === "one-time"
              ? normalizedSchedule.scheduledTime || normalizedSchedule.nextRunAt || ""
              : normalizedSchedule.nextRunAt || normalizedSchedule.scheduledTime || "";
            const start = new Date(anchorValue);
            if (Number.isNaN(start.getTime()) || start.getTime() < now.getTime()) {
              return null;
            }
            return {
              id: normalizedSchedule.id,
              start,
              title: normalizedSchedule.name || normalizedSchedule.task || "Scheduled run",
              schedule: normalizedSchedule,
            };
          })
          .filter(Boolean)
          .sort((left, right) => left.start.getTime() - right.start.getTime())[0] || null;

        const dailyBriefingDate = new Date(now);
        dailyBriefingDate.setHours(7, 0, 0, 0);
        const visibleScheduleEvents = todayEvents.slice(0, 2);
        const primaryEvent = todayEvents[0] || upcomingSchedule || null;
        const eventCountToday = todayEvents.length;
        const primaryDate = primaryEvent?.start || now;
        const primarySchedule = primaryEvent?.schedule || null;
        const locationLabel = String(
          primarySchedule?.environmentName
          || primarySchedule?.contextName
          || primarySchedule?.metadata?.projectName
          || projectName
          || "Project calendar"
        ).trim() || "Project calendar";

        const copy = eventCountToday > 0
          ? "You have " + eventCountToday + " scheduled event" + (eventCountToday === 1 ? "" : "s") + " today — don't miss " + (eventCountToday === 1 ? "it" : "them") + "!"
          : primaryEvent
            ? "Your next scheduled event is coming up."
            : "No scheduled events today in this project.";

        const dailyBriefingItem = {
          id: "daily-briefing",
          kind: "briefing",
          title: "Daily Briefing",
          locationLabel: "Default",
          timeLabel: formatPlaygroundWelcomeTimeLabel(dailyBriefingDate),
        };
        const scheduleItems = visibleScheduleEvents.map((event) => {
          const scheduleRecord = normalizePlaygroundScheduleRecord(event?.schedule);
          return {
            id: event.id || scheduleRecord.id || generateId("schedule"),
            kind: event.kind === "task" ? "task" : "schedule",
            title: event.title || "Scheduled run",
            locationLabel: String(
              scheduleRecord?.environmentName
              || scheduleRecord?.contextName
              || scheduleRecord?.metadata?.projectName
              || projectName
              || "Project calendar"
            ).trim() || "Project calendar",
            timeLabel: formatPlaygroundWelcomeTimeLabel(event.start),
          };
        });
        const isReferenceToday = toPlaygroundDateInputValue(now) === toPlaygroundDateInputValue(new Date());
        const items = scheduleItems.concat(isReferenceToday ? [dailyBriefingItem] : []).slice(0, 2);

        return {
          hasEventToday: eventCountToday > 0,
          eventCountToday,
          title: primaryEvent?.title || "No event scheduled",
          copy,
          items,
          locationLabel,
          timeLabel: primaryEvent ? formatPlaygroundWelcomeTimeLabel(primaryDate) : "Free today",
          weekdayLabel: formatPlaygroundWelcomeWeekdayLabel(now),
          monthDayLabel: formatPlaygroundWelcomeMonthDayLabel(now),
          actionLabel: "Open Calendar",
        };
      }

      function parsePlaygroundWelcomeDateKey(value) {
        const normalizedDateKey = String(value || "").trim();
        const parsedDate = /^\\d{4}-\\d{2}-\\d{2}$/.test(normalizedDateKey)
          ? new Date(normalizedDateKey + "T12:00:00")
          : new Date();
        return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      }

      function buildPlaygroundWelcomeCalendarWidgetView(selectedDateKey, schedules, projectRecord, tasks = [], ticketNumbersById = {}) {
        const selectedDate = parsePlaygroundWelcomeDateKey(selectedDateKey);
        const selectedKey = toPlaygroundDateInputValue(selectedDate);
        const todayState = buildPlaygroundWelcomeTodayState(selectedDate, schedules, projectRecord, tasks, ticketNumbersById);
        const todayKey = toPlaygroundDateInputValue(new Date());
        const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(selectedDate);
        const weekStart = new Date(selectedDate);
        weekStart.setHours(12, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        const days = Array.from({ length: 7 }, (_, index) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + index);
          const dateKey = toPlaygroundDateInputValue(date);
          return {
            date,
            dateKey,
            weekdayLabel: weekdayLabels[date.getDay()] || "",
            dayNumber: String(date.getDate()),
            isSelected: dateKey === selectedKey,
            isToday: dateKey === todayKey,
            ariaLabel: "Show schedule for " + new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date),
          };
        });
        const items = (Array.isArray(todayState.items) ? todayState.items : []).slice(0, 2);
        return {
          selectedDate,
          selectedKey,
          monthLabel,
          days,
          items,
        };
      }

      function buildPlaygroundWelcomeCalendarEventDateKeys(referenceDate, tasks, schedules, ticketNumbersById) {
        const visibleRange = buildPlaygroundWelcomeCalendarRange(referenceDate);
        const nextKeys = new Set();

        (Array.isArray(schedules) ? schedules : []).forEach((schedule) => {
          buildPlaygroundScheduleCalendarEvents(schedule, visibleRange).forEach((event) => {
            const start = event?.start instanceof Date ? event.start : new Date(event?.start || "");
            if (Number.isNaN(start.getTime())) return;
            nextKeys.add(start.toISOString().slice(0, 10));
          });
        });

        (Array.isArray(tasks) ? tasks : []).forEach((task) => {
          buildPlaygroundTaskCalendarEvents(
            task,
            ticketNumbersById?.[task.id] || task.ticketNumber || "",
            visibleRange
          ).forEach((event) => {
            const start = event?.start instanceof Date ? event.start : new Date(event?.start || "");
            if (Number.isNaN(start.getTime())) return;
            nextKeys.add(start.toISOString().slice(0, 10));
          });
        });

        return nextKeys;
      }

`;
