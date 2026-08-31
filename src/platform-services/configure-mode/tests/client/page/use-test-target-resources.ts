import { useEffect, useState } from "react";
import type { TestsApi } from "../api/index.js";
import type { TestWorkspaceResourceOption } from "../domain/index.js";

type TestTargetResourceApi = Partial<Pick<TestsApi, "listFunctions" | "listMetronomes">>;

export interface TestTargetResourcesState {
  functions: TestWorkspaceResourceOption[];
  workflows: TestWorkspaceResourceOption[];
  functionsLoading: boolean;
  workflowsLoading: boolean;
  functionsError: string;
  workflowsError: string;
}

const EMPTY_STATE: TestTargetResourcesState = {
  functions: [],
  workflows: [],
  functionsLoading: false,
  workflowsLoading: false,
  functionsError: "",
  workflowsError: "",
};

function errorMessage(error: unknown, resource: string): string {
  return error instanceof Error
    ? error.message
    : `Failed to load ${resource}.`;
}

export function useTestTargetResources(
  api: TestTargetResourceApi | null | undefined,
  enabled = true,
): TestTargetResourcesState {
  const [state, setState] = useState<TestTargetResourcesState>(EMPTY_STATE);

  useEffect(() => {
    if (!enabled || !api) {
      setState(EMPTY_STATE);
      return undefined;
    }
    let active = true;
    setState((current) => ({
      ...current,
      functionsLoading: true,
      workflowsLoading: true,
      functionsError: "",
      workflowsError: "",
    }));
    const functionRequest = typeof api.listFunctions === "function"
      ? api.listFunctions()
      : Promise.resolve([]);
    const workflowRequest = typeof api.listMetronomes === "function"
      ? api.listMetronomes()
      : Promise.resolve([]);
    void Promise.allSettled([
      functionRequest,
      workflowRequest,
    ]).then(([functionResult, workflowResult]) => {
      if (!active) return;
      setState({
        functions: functionResult.status === "fulfilled" ? functionResult.value : [],
        workflows: workflowResult.status === "fulfilled" ? workflowResult.value : [],
        functionsLoading: false,
        workflowsLoading: false,
        functionsError: functionResult.status === "rejected"
          ? errorMessage(functionResult.reason, "Functions")
          : "",
        workflowsError: workflowResult.status === "rejected"
          ? errorMessage(workflowResult.reason, "Metronome workflows")
          : "",
      });
    });
    return () => {
      active = false;
    };
  }, [api, enabled]);

  return state;
}
