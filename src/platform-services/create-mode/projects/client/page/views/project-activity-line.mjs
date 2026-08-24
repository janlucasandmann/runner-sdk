export const PROJECT_ACTIVITY_LINE_SCRIPT = String.raw`
        function decodeSharedProjectActivityFieldValue(value, keys = []) {
          let decodedValue = value;
          if (typeof value === "string" && /^[{[]/.test(value.trim())) {
            try {
              decodedValue = JSON.parse(value);
            } catch {
              decodedValue = value;
            }
          }
          if (decodedValue && typeof decodedValue === "object" && !Array.isArray(decodedValue)) {
            for (const key of keys) {
              const candidate = decodedValue[key];
              if (candidate !== null && candidate !== undefined && String(candidate).trim()) {
                return String(candidate).trim();
              }
            }
          }
          return decodedValue === null || decodedValue === undefined
            ? ""
            : String(decodedValue).trim();
        }

        function renderSharedProjectActivityPriorityReference(value) {
          const normalizedValue = decodeSharedProjectActivityFieldValue(value, ["id", "priority", "value"]).toLowerCase();
          const label = typeof getPlaygroundTaskPriorityLabel === "function"
            ? getPlaygroundTaskPriorityLabel(normalizedValue)
            : normalizedValue || "Medium";
          return React.createElement("span", {
              className: "playground-project-activity-line__priority",
              title: label,
            },
            typeof renderPlaygroundTaskPriorityIcon === "function"
              ? renderPlaygroundTaskPriorityIcon(normalizedValue)
              : null,
            React.createElement("span", null, label)
          );
        }

        function renderSharedProjectActivityStatusReference(value) {
          const normalizedValue = decodeSharedProjectActivityFieldValue(value, ["id", "status", "value"]).toLowerCase();
          const label = typeof getPlaygroundTaskStatusLabel === "function"
            ? getPlaygroundTaskStatusLabel(normalizedValue)
            : normalizedValue || "Unknown";
          return React.createElement("span", {
              className: "playground-project-activity-line__status",
              title: label,
            },
            typeof renderPlaygroundTaskStatusGlyph === "function"
              ? renderPlaygroundTaskStatusGlyph(normalizedValue)
              : null,
            React.createElement("span", null, label)
          );
        }

        /**
         * Canonical compact task-activity line used by both the project
         * progress feed and a ticket's filtered activity feed. Callers resolve
         * data-source-specific identities; this function owns all wording,
         * task references, icons, spacing, and interaction behavior.
         */
        function renderSharedProjectTaskActivityLine(event, options = {}) {
          const source = event?.source || event || {};
          const task = options.task || source.task || null;
          const taskId = String(options.taskId || source.taskId || task?.id || "").trim();
          const ticketNumber = String(
            options.ticketNumber
              || source.ticketNumber
              || task?.ticketNumber
              || ""
          ).trim();
          const ticketTitle = [ticketNumber, task?.title || ""].filter(Boolean).join(" ");
          const taskType = typeof normalizePlaygroundTaskType === "function"
            ? normalizePlaygroundTaskType(options.taskType || task?.taskType || task?.type)
            : "task";
          const TaskTypeIcon = typeof getPlaygroundTaskTypeIcon === "function"
            ? getPlaygroundTaskTypeIcon(taskType)
            : null;
          const sourceEventType = String(source.eventType || "").trim().toLowerCase();
          const sourceFieldName = String(source.fieldName || "").trim();
          const normalizedFieldName = sourceFieldName.toLowerCase();
          const isMilestoneChange = sourceEventType === "field_changed"
            && ["releaseid", "milestoneid"].includes(normalizedFieldName);
          const isAssigneeChange = sourceEventType === "field_changed"
            && ["assigneeagentid", "assigneeid"].includes(normalizedFieldName);
          const isIssueCreation = sourceEventType === "created";
          const isTitleChange = sourceEventType === "field_changed" && normalizedFieldName === "title";
          const isPriorityChange = sourceEventType === "field_changed" && normalizedFieldName === "priority";
          const isStatusChange = sourceEventType === "status_changed"
            || (sourceEventType === "field_changed" && normalizedFieldName === "status");
          const actorName = String(options.actorName || source.actorName || "Someone").trim() || "Someone";
          const actorAvatar = options.actorAvatar || null;
          const assignmentTarget = options.assignmentTarget || null;
          const milestoneName = String(options.milestoneName || "").trim();
          const renamedTitle = String(source.nextValue || "").trim();
          const timeLabel = String(options.timeLabel || "").trim();

          const taskReference = options.showTaskReference !== false && ticketNumber
            ? React.createElement("span", {
                className: "playground-project-activity-line__subject",
                title: ticketTitle,
              },
              TaskTypeIcon
                ? React.createElement("span", {
                    className: "playground-tasks-lane-card-type-badge is-" + taskType,
                    "aria-hidden": "true",
                  }, React.createElement(TaskTypeIcon, { width: 12, height: 12, strokeWidth: 1.8 }))
                : null,
              React.createElement("span", null, ticketNumber)
            )
            : null;
          const milestoneReference = milestoneName
            ? React.createElement("span", {
                className: "playground-project-activity-line__milestone",
                title: milestoneName,
              },
              React.createElement("span", {
                className: "playground-project-activity-rich-card__kind-icon is-milestone",
                "aria-hidden": "true",
              }, React.createElement(Milestone, { width: 12, height: 12, strokeWidth: 1.8 })),
              React.createElement("span", null, milestoneName)
            )
            : null;
          const assignmentTargetReference = assignmentTarget
            ? React.createElement("span", {
                className: "playground-project-activity-line__assignee",
                title: assignmentTarget.name,
              },
              assignmentTarget.avatar
                ? React.createElement("span", { className: "playground-project-activity-line__avatar-shell" }, assignmentTarget.avatar)
                : null,
              React.createElement("span", null, assignmentTarget.name)
            )
            : null;
          const previousPriorityReference = isPriorityChange
            ? renderSharedProjectActivityPriorityReference(source.previousValue)
            : null;
          const nextPriorityReference = isPriorityChange
            ? renderSharedProjectActivityPriorityReference(source.nextValue)
            : null;
          const previousStatusReference = isStatusChange
            ? renderSharedProjectActivityStatusReference(source.previousValue)
            : null;
          const nextStatusReference = isStatusChange
            ? renderSharedProjectActivityStatusReference(source.nextValue)
            : null;
          const summary = isMilestoneChange
            ? React.createElement(React.Fragment, null, React.createElement("strong", null, actorName), " changed milestone on ")
            : isAssigneeChange && assignmentTarget
              ? React.createElement(React.Fragment, null, React.createElement("strong", null, actorName), " assigned ")
              : isIssueCreation
                ? React.createElement(React.Fragment, null, React.createElement("strong", null, actorName), " created ")
                : isTitleChange
                  ? React.createElement(React.Fragment, null, React.createElement("strong", null, actorName), " renamed ")
                  : isPriorityChange
                    ? React.createElement(React.Fragment, null, React.createElement("strong", null, actorName), " changed priority on ")
                    : isStatusChange
                      ? React.createElement(React.Fragment, null, React.createElement("strong", null, actorName), " moved ")
                      : options.fallbackSummary
                        || React.createElement(React.Fragment, null, React.createElement("strong", null, actorName), " updated ");
          const onActivate = typeof options.onActivate === "function" ? options.onActivate : undefined;

          return React.createElement("div", {
              key: event?.id || source?.id,
              className: "playground-project-activity-line"
                + (actorAvatar ? " has-avatar" : "")
                + (onActivate ? " is-interactive" : ""),
              role: onActivate ? "button" : undefined,
              tabIndex: onActivate ? 0 : undefined,
              onClick: onActivate,
              onKeyDown: onActivate
                ? (keyboardEvent) => {
                    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                      keyboardEvent.preventDefault();
                      onActivate();
                    }
                  }
                : undefined,
            },
            React.createElement("div", { className: "playground-project-activity-line__leading" },
              actorAvatar
                ? React.createElement("span", { className: "playground-project-activity-line__avatar-shell" }, actorAvatar)
                : null
            ),
            React.createElement("div", { className: "playground-project-activity-line__body" },
              React.createElement("div", { className: "playground-project-activity-line__summary" }, summary),
              taskReference,
              isAssigneeChange && assignmentTargetReference
                ? React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "playground-project-activity-line__assignee-separator" }, " to "),
                    assignmentTargetReference
                  )
                : null,
              isTitleChange && renamedTitle
                ? React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "playground-project-activity-line__rename-separator" }, " to "),
                    React.createElement("strong", { className: "playground-project-activity-line__renamed-title" }, renamedTitle)
                  )
                : null,
              isPriorityChange
                ? React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "playground-project-activity-line__priority-separator" }, " from "),
                    previousPriorityReference,
                    React.createElement("span", { className: "playground-project-activity-line__priority-separator" }, " to "),
                    nextPriorityReference
                  )
                : null,
              isStatusChange
                ? React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "playground-project-activity-line__status-separator" }, " from "),
                    previousStatusReference,
                    React.createElement("span", { className: "playground-project-activity-line__status-separator" }, " to "),
                    nextStatusReference
                  )
                : null,
              isMilestoneChange && milestoneReference
                ? React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "playground-project-activity-line__milestone-separator" }, " to "),
                    milestoneReference
                  )
                : null,
              timeLabel
                ? React.createElement("span", { className: "playground-project-activity-line__time" }, " · ", timeLabel)
                : null
            )
          );
        }
`;
