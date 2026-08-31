import { useCallback, useEffect, useMemo, useState } from "react";

import type { PlatformOwnerOption } from "../../../../../platform-ui/components/composite/owner-selector/index.js";
import {
  getDevelopResourceCreatorIdentity,
  getDevelopResourceOwnerIdentity,
  normalizeDevelopResourceIdentity,
  type DevelopResourceIdentity,
  type DevelopResourceIdentityInput,
} from "../../../shared/client/domain/index.js";
import type { SecurityRepositoryDetail } from "../domain/index.js";
import {
  getSecurityRepositoryOwnerCandidateKey,
  getSecurityRepositoryOwnerIdentityKeys,
  mergeSecurityRepositoryOwnerCandidates,
} from "../domain/index.js";

export interface SecurityRepositoryOwnerOptionData {
  candidate: DevelopResourceIdentity;
}

export interface UseSecurityRepositoryOwnerModelOptions {
  detail: SecurityRepositoryDetail;
  busy?: boolean;
  viewerIdentity?: DevelopResourceIdentityInput;
  onLoadOwnerCandidates?: () => Promise<readonly unknown[]>;
  onOwnerChange?: (owner: DevelopResourceIdentity) => void | Promise<unknown>;
}

export function getSecurityRepositoryIdentityLabel(identity: DevelopResourceIdentity): string {
  return identity.name || identity.email || identity.id || identity.userId || "Unknown";
}

/** Shared owner model for canonical repository Settings surfaces. */
export function useSecurityRepositoryOwnerModel({
  detail,
  busy = false,
  viewerIdentity = {},
  onLoadOwnerCandidates,
  onOwnerChange,
}: UseSecurityRepositoryOwnerModelOptions) {
  const repository = detail.repository;
  const creator = getDevelopResourceCreatorIdentity(repository, viewerIdentity);
  const owner = getDevelopResourceOwnerIdentity(repository, creator);
  const [ownerSelectorOpen, setOwnerSelectorOpen] = useState(false);
  const [ownerSaving, setOwnerSaving] = useState(false);
  const [ownerCandidateState, setOwnerCandidateState] = useState<{
    repositoryId: string;
    status: "idle" | "loading" | "ready";
    candidates: readonly unknown[];
  }>({ repositoryId: repository.id, status: "idle", candidates: [] });

  useEffect(() => {
    let cancelled = false;
    setOwnerSelectorOpen(false);
    setOwnerSaving(false);
    if (!onLoadOwnerCandidates) {
      setOwnerCandidateState({ repositoryId: repository.id, status: "ready", candidates: [] });
      return () => {
        cancelled = true;
      };
    }
    setOwnerCandidateState({ repositoryId: repository.id, status: "loading", candidates: [] });
    void onLoadOwnerCandidates().then(
      (candidates) => {
        if (!cancelled) {
          setOwnerCandidateState({ repositoryId: repository.id, status: "ready", candidates });
        }
      },
      () => {
        if (!cancelled) {
          setOwnerCandidateState({ repositoryId: repository.id, status: "ready", candidates: [] });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [onLoadOwnerCandidates, repository.id]);

  const candidates = ownerCandidateState.repositoryId === repository.id
    ? ownerCandidateState.candidates
    : [];
  const ownerCandidates = useMemo(
    () => mergeSecurityRepositoryOwnerCandidates([owner, creator, viewerIdentity, ...candidates]),
    [candidates, creator, owner, viewerIdentity],
  );
  const ownerCandidateByValue = useMemo(
    () => new Map(ownerCandidates.map((candidate) => [
      getSecurityRepositoryOwnerCandidateKey(candidate),
      candidate,
    ])),
    [ownerCandidates],
  );
  const ownerOptions = useMemo<PlatformOwnerOption<string, SecurityRepositoryOwnerOptionData>[]>(
    () => ownerCandidates.map((candidate) => {
      const value = getSecurityRepositoryOwnerCandidateKey(candidate);
      const label = getSecurityRepositoryIdentityLabel(candidate);
      return {
        value,
        name: label,
        avatarUrl: candidate.avatarUrl || "",
        data: { candidate },
      };
    }),
    [ownerCandidates],
  );
  const ownerKeys = useMemo(
    () => new Set(getSecurityRepositoryOwnerIdentityKeys(owner)),
    [owner],
  );
  const selectedOwnerCandidate = ownerCandidates.find((candidate) =>
    getSecurityRepositoryOwnerIdentityKeys(candidate).some((key) => ownerKeys.has(key)),
  );
  const selectedOwnerValue = selectedOwnerCandidate
    ? getSecurityRepositoryOwnerCandidateKey(selectedOwnerCandidate)
    : getSecurityRepositoryOwnerCandidateKey(owner);
  const canManageOwner = Boolean(onOwnerChange)
    && getSecurityRepositoryOwnerIdentityKeys(viewerIdentity).some((key) => ownerKeys.has(key));

  const handleOwnerChange = useCallback(async (
    nextValue: string,
    option?: PlatformOwnerOption<string, SecurityRepositoryOwnerOptionData>,
  ) => {
    const nextOwner = option?.data?.candidate
      ? normalizeDevelopResourceIdentity(option.data.candidate)
      : ownerCandidateByValue.get(nextValue);
    if (!nextOwner || !onOwnerChange || !canManageOwner) return;
    setOwnerSelectorOpen(false);
    setOwnerSaving(true);
    try {
      await onOwnerChange(nextOwner);
    } finally {
      setOwnerSaving(false);
    }
  }, [canManageOwner, onOwnerChange, ownerCandidateByValue]);

  return {
    creator,
    owner,
    ownerOptions,
    selectedOwnerValue,
    ownerSelectorOpen,
    ownerSelectorLoading: ownerCandidateState.repositoryId === repository.id
      && ownerCandidateState.status === "loading",
    ownerSelectorDisabled: busy || ownerSaving || !canManageOwner,
    onOwnerSelectorOpenChange: (open: boolean) => {
      if (!open || canManageOwner) setOwnerSelectorOpen(open);
    },
    onOwnerTransfer: handleOwnerChange,
  };
}
