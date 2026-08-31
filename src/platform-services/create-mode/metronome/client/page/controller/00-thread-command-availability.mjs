export const METRONOME_CONTROLLER_THREAD_COMMAND_AVAILABILITY_FRAGMENT = String.raw`
          const selectedMetronomeThreadCommand = useMemo(() => {
            if (!selectedNode || selectedNode.data?.kind !== "trigger") return "";
            const selectedConfig = selectedNode.data?.config && typeof selectedNode.data.config === "object"
              ? selectedNode.data.config
              : {};
            const selectedType = String(selectedConfig.triggerType || selectedNode.data?.subtype || "").trim().toLowerCase();
            if (selectedType !== "thread_event" && selectedType !== "thread") return "";
            return String(selectedConfig.threadCommand || "@metronome").trim();
          }, [selectedNode]);
          useEffect(() => {
            const command = selectedMetronomeThreadCommand;
            if (!command) {
              setMetronomeThreadCommandAvailability({ command: "", status: "idle", message: "Commands must start with @.", conflictWorkflowId: "" });
              return undefined;
            }
            if (!command.startsWith("@")) {
              setMetronomeThreadCommandAvailability({ command, status: "invalid", message: "Commands must start with @.", conflictWorkflowId: "" });
              return undefined;
            }
            if (command === "@") {
              setMetronomeThreadCommandAvailability({ command, status: "invalid", message: "Enter a command after @.", conflictWorkflowId: "" });
              return undefined;
            }
            const localTriggers = listMetronomeThreadTriggerOptions([{
              id: activeWorkflowId || "current-workflow",
              name: activeWorkflow?.name || "This workflow",
              status: "active",
              nodes,
            }], { activeOnly: false, dedupe: false });
            const localConflict = localTriggers.find((trigger) => (
              trigger.command.toLowerCase() === command.toLowerCase()
              && String(trigger.nodeId || "") !== String(selectedNodeId || "")
            ));
            if (localConflict) {
              setMetronomeThreadCommandAvailability({
                command,
                status: "taken",
                message: command + " is already used by another trigger in this workflow.",
                conflictWorkflowId: activeWorkflowId || "current-workflow",
              });
              return undefined;
            }

            let cancelled = false;
            setMetronomeThreadCommandAvailability({ command, status: "checking", message: "Checking command availability…", conflictWorkflowId: "" });
            const timer = window.setTimeout(() => {
              void fetchMetronomeWorkflowsFromApi("", {
                apiKey,
                backendUrl,
                requestHeaders,
                limit: 250,
              }).then((availableWorkflows) => {
                if (cancelled) return;
                const conflict = listMetronomeThreadTriggerOptions(availableWorkflows, {
                  activeOnly: true,
                  dedupe: false,
                  excludeWorkflowId: activeWorkflowId,
                }).find((trigger) => trigger.command.toLowerCase() === command.toLowerCase());
                setMetronomeThreadCommandAvailability(conflict
                  ? {
                      command,
                      status: "taken",
                      message: command + " is already used by “" + conflict.name + "”.",
                      conflictWorkflowId: conflict.workflowId,
                    }
                  : { command, status: "available", message: "Command is available.", conflictWorkflowId: "" }
                );
              }).catch(() => {
                if (cancelled) return;
                setMetronomeThreadCommandAvailability({
                  command,
                  status: "error",
                  message: "Command availability could not be checked. Publishing will verify it again.",
                  conflictWorkflowId: "",
                });
              });
            }, 250);
            return () => {
              cancelled = true;
              window.clearTimeout(timer);
            };
          }, [activeWorkflow?.name, activeWorkflowId, apiKey, backendUrl, nodes, requestHeaders, selectedMetronomeThreadCommand, selectedNodeId]);
`;
