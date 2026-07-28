export const THREAD_ORCHESTRATOR_FUNCTIONAL_AGENT_ROLE =
  "thread_orchestrator";
export const THREAD_COMMUNICATOR_FUNCTIONAL_AGENT_ROLE =
  "thread_communicator";

export type ThreadFunctionalAgentRole =
  | typeof THREAD_ORCHESTRATOR_FUNCTIONAL_AGENT_ROLE
  | typeof THREAD_COMMUNICATOR_FUNCTIONAL_AGENT_ROLE;

export function isThreadFunctionalAgentRole(
  value: unknown,
): value is ThreadFunctionalAgentRole {
  return (
    value === THREAD_ORCHESTRATOR_FUNCTIONAL_AGENT_ROLE ||
    value === THREAD_COMMUNICATOR_FUNCTIONAL_AGENT_ROLE
  );
}
