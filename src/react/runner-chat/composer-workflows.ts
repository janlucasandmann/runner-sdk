import type { RunnerChatWorkflowTriggerOption } from "./public-types.js";

export function normalizeRunnerWorkflowTriggerCommand(value: unknown): string {
  const command = String(value || "").trim();
  if (!command) return "";
  return command.startsWith("@") ? command : `@${command}`;
}

export function normalizeRunnerWorkflowTriggerOptions(
  options: readonly RunnerChatWorkflowTriggerOption[] | null | undefined,
): RunnerChatWorkflowTriggerOption[] {
  const normalized: RunnerChatWorkflowTriggerOption[] = [];
  const seenCommands = new Set<string>();

  for (const option of options || []) {
    const workflowId = String(option?.workflowId || option?.id || "").trim();
    const id = String(option?.id || workflowId).trim();
    const name = String(option?.name || "").trim();
    const command = normalizeRunnerWorkflowTriggerCommand(option?.command);
    const commandKey = command.toLowerCase();
    if (!id || !workflowId || !name || !command || command === "@" || seenCommands.has(commandKey)) {
      continue;
    }
    seenCommands.add(commandKey);
    normalized.push({
      ...option,
      id,
      workflowId,
      name,
      command,
      description: String(option.description || "").trim(),
      ...(String(option.nodeId || "").trim()
        ? { nodeId: String(option.nodeId || "").trim() }
        : {}),
    });
  }

  return normalized;
}

export function filterRunnerWorkflowTriggerOptions(
  options: readonly RunnerChatWorkflowTriggerOption[],
  query: string,
): RunnerChatWorkflowTriggerOption[] {
  const normalizedQuery = String(query || "").trim().toLowerCase().replace(/^@/, "");
  if (!normalizedQuery) return [...options];

  return options.filter((option) => [
    option.name,
    option.command.replace(/^@/, ""),
    option.description,
  ].join(" ").toLowerCase().includes(normalizedQuery));
}
