import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PlatformSelector } from "../../platform-ui/components/ui/selector/index.js";
import type { RunnerChatOption } from "./agent-options.js";
import type { RunnerChatConnectorFetchOptions } from "./public-types.js";

export interface RunnerGithubBranchSelectorProps {
  accountId?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  fetchBranches?: (
    repoFullName: string,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatOption[]>;
  fullWidth?: boolean;
  onValueChange: (branch: string) => void;
  popupClassName?: string;
  repoFullName: string;
  triggerClassName?: string;
  value?: string | null;
}

/**
 * Shared GitHub branch picker used by file-explorer roots and persisted
 * project repository settings. Branches are fetched lazily when the popup is
 * opened, while the controlled value remains available before discovery.
 */
export function RunnerGithubBranchSelector({
  accountId,
  ariaLabel,
  className = "",
  disabled = false,
  fetchBranches,
  fullWidth = true,
  onValueChange,
  popupClassName = "",
  repoFullName,
  triggerClassName = "",
  value,
}: RunnerGithubBranchSelectorProps) {
  const normalizedRepoFullName = String(repoFullName || "").trim();
  const normalizedValue = String(value || "main").trim() || "main";
  const branchRequestContext = `${String(accountId || "").trim()}::${normalizedRepoFullName}`;
  const [branches, setBranches] = useState<RunnerChatOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestKeyRef = useRef("");

  useEffect(() => {
    requestKeyRef.current = `reset:${branchRequestContext}`;
    setBranches([]);
    setLoading(false);
    setError("");
  }, [branchRequestContext]);

  const ensureBranchesLoaded = useCallback(async () => {
    if (!normalizedRepoFullName || !fetchBranches) return;
    const requestKey = branchRequestContext;
    if (requestKeyRef.current === requestKey) return;

    requestKeyRef.current = requestKey;
    setLoading(true);
    setError("");
    try {
      const nextBranches = await fetchBranches(
        normalizedRepoFullName,
        accountId ? { accountId } : undefined,
      );
      if (requestKeyRef.current !== requestKey) return;
      setBranches(Array.isArray(nextBranches) ? nextBranches : []);
    } catch (branchError) {
      if (requestKeyRef.current !== requestKey) return;
      requestKeyRef.current = "";
      setError(
        branchError instanceof Error && branchError.message
          ? branchError.message
          : "Failed to load GitHub branches.",
      );
    } finally {
      if (requestKeyRef.current === requestKey) setLoading(false);
    }
  }, [accountId, branchRequestContext, fetchBranches, normalizedRepoFullName]);

  const options = useMemo(() => {
    const seen = new Set<string>();
    return [{ id: normalizedValue, name: normalizedValue }, ...branches].flatMap((branch) => {
      const branchValue = String(branch?.id || branch?.name || "").trim();
      if (!branchValue || seen.has(branchValue)) return [];
      seen.add(branchValue);
      return [{ value: branchValue, label: String(branch?.name || branchValue) }];
    });
  }, [branches, normalizedValue]);

  return (
    <PlatformSelector
      value={normalizedValue}
      options={options}
      ariaLabel={ariaLabel || `Select base branch for ${normalizedRepoFullName}`}
      className={className}
      alignment="start"
      popupAlignment="right"
      fullWidth={fullWidth}
      disabled={disabled || !normalizedRepoFullName}
      loading={loading}
      loadingContent="Loading branches..."
      emptyContent={error || "No branches available."}
      triggerClassName={triggerClassName}
      popupClassName={popupClassName}
      onOpenChange={(open) => {
        if (open) void ensureBranchesLoaded();
      }}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onValueChange={(branch) => onValueChange(branch)}
    />
  );
}
