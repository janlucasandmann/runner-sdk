import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Play } from "lucide-react";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformOwnerSelector,
  type PlatformOwnerOption,
} from "../../../../../platform-ui/components/composite/owner-selector/index.js";
import { PlatformPrimaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { ResourceOverviewIdentityCell } from "../../../../../platform-ui/pages/overview/index.js";
import {
  getDevelopResourceCreatorIdentity,
  getDevelopResourceOwnerIdentity,
  normalizeDevelopResourceIdentity,
  type DevelopResourceIdentity,
  type DevelopResourceIdentityInput,
} from "../../../shared/client/domain/index.js";
import type { SecurityRepositoryDetail } from "../domain/index.js";
import {
  formatSecurityTimestamp,
  getSecurityRepositoryOwnerCandidateKey,
  getSecurityRepositoryOwnerIdentityKeys,
  mergeSecurityRepositoryOwnerCandidates,
} from "../domain/index.js";

interface RepositorySidebarRowProps {
  label: string;
  valueLabel: string;
  className?: string;
  valueClassName?: string;
  control?: boolean;
  children: ReactNode;
}

function getIdentityLabel(identity: DevelopResourceIdentity): string {
  return (
    identity.name ||
    identity.email ||
    identity.id ||
    identity.userId ||
    "Unknown"
  );
}

function getIdentityInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "A";
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "A"
  );
}

function RepositorySidebarRow({
  label,
  valueLabel,
  className = "",
  valueClassName = "",
  control = false,
  children,
}: RepositorySidebarRowProps) {
  const ValueElement = control ? "div" : "span";
  return (
    <div
      className={`playground-project-overview-sidebar-row${className ? ` ${className}` : ""}`}
      aria-label={`${label}: ${valueLabel}`}
    >
      <span className="playground-project-overview-sidebar-row-label">
        {label}
      </span>
      <ValueElement
        className={`playground-project-overview-sidebar-row-value${valueClassName ? ` ${valueClassName}` : ""}`}
        title={valueLabel}
      >
        {children}
      </ValueElement>
    </div>
  );
}

function RepositoryCreator({
  identity,
}: {
  identity: DevelopResourceIdentity;
}) {
  const label = getIdentityLabel(identity);
  return (
    <ResourceOverviewIdentityCell
      title={label}
      imageUrl={identity.avatarUrl}
      fallback={getIdentityInitials(label)}
      size="compact"
    />
  );
}

export interface SecurityRepositorySidebarProps {
  detail: SecurityRepositoryDetail;
  busy?: boolean;
  viewerIdentity?: DevelopResourceIdentityInput;
  onLoadOwnerCandidates?: () => Promise<readonly unknown[]>;
  onOwnerChange?: (owner: DevelopResourceIdentity) => void | Promise<unknown>;
  onRunScan?: () => void;
}

export function SecurityRepositorySidebar({
  detail,
  busy = false,
  viewerIdentity = {},
  onLoadOwnerCandidates,
  onOwnerChange,
  onRunScan,
}: SecurityRepositorySidebarProps) {
  const repository = detail.repository;
  const creator = getDevelopResourceCreatorIdentity(repository, viewerIdentity);
  const owner = getDevelopResourceOwnerIdentity(repository, creator);
  const creatorLabel = getIdentityLabel(creator);
  const ownerLabel = getIdentityLabel(owner);
  const lastScan = formatSecurityTimestamp(repository.lastRunAt, "Never");
  const nextScan = formatSecurityTimestamp(repository.nextScanAt, "Disabled");
  const [ownerSelectorOpen, setOwnerSelectorOpen] = useState(false);
  const [ownerSaving, setOwnerSaving] = useState(false);
  const [ownerCandidateState, setOwnerCandidateState] = useState<{
    repositoryId: string;
    status: "idle" | "loading" | "ready";
    candidates: readonly unknown[];
  }>({
    repositoryId: repository.id,
    status: "idle",
    candidates: [],
  });
  const currentOwnerCandidateState =
    ownerCandidateState.repositoryId === repository.id
      ? ownerCandidateState
      : {
          repositoryId: repository.id,
          status: "idle" as const,
          candidates: [],
        };
  const ownerCandidates = useMemo(
    () =>
      mergeSecurityRepositoryOwnerCandidates([
        owner,
        creator,
        viewerIdentity,
        ...currentOwnerCandidateState.candidates,
      ]),
    [creator, currentOwnerCandidateState.candidates, owner, viewerIdentity],
  );
  const ownerCandidateByValue = useMemo(
    () =>
      new Map(
        ownerCandidates.map((candidate) => [
          getSecurityRepositoryOwnerCandidateKey(candidate),
          candidate,
        ]),
      ),
    [ownerCandidates],
  );
  const ownerOptions = useMemo<PlatformOwnerOption<string, { candidate: DevelopResourceIdentity }>[]>(
    () =>
      ownerCandidates.map((candidate) => {
        const value = getSecurityRepositoryOwnerCandidateKey(candidate);
        const label = getIdentityLabel(candidate);
        const description =
          candidate.email &&
          label.toLowerCase() !== candidate.email.toLowerCase()
            ? candidate.email
            : candidate.teamNames.length
              ? candidate.teamNames.join(", ")
              : undefined;
        return {
          value,
          name: label,
          email: candidate.email || "",
          avatarUrl: candidate.avatarUrl || "",
          description,
          ariaLabel: description ? `${label}, ${description}` : label,
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
    getSecurityRepositoryOwnerIdentityKeys(candidate).some((key) =>
      ownerKeys.has(key),
    ),
  );
  const selectedOwnerValue = selectedOwnerCandidate
    ? getSecurityRepositoryOwnerCandidateKey(selectedOwnerCandidate)
    : getSecurityRepositoryOwnerCandidateKey(owner);
  const canManageOwner =
    Boolean(onOwnerChange) &&
    getSecurityRepositoryOwnerIdentityKeys(viewerIdentity).some((key) =>
      ownerKeys.has(key),
    );

  useEffect(() => {
    setOwnerSelectorOpen(false);
    setOwnerSaving(false);
  }, [repository.id]);

  const loadOwnerCandidates = useCallback(async () => {
    const repositoryId = repository.id;
    if (
      !onLoadOwnerCandidates ||
      currentOwnerCandidateState.status !== "idle"
    ) {
      return;
    }
    setOwnerCandidateState({
      repositoryId,
      status: "loading",
      candidates: currentOwnerCandidateState.candidates,
    });
    try {
      const candidates = await onLoadOwnerCandidates();
      setOwnerCandidateState((current) =>
        current.repositoryId === repositoryId
          ? { repositoryId, status: "ready", candidates }
          : current,
      );
    } catch {
      setOwnerCandidateState((current) =>
        current.repositoryId === repositoryId
          ? { repositoryId, status: "ready", candidates: [] }
          : current,
      );
    }
  }, [
    currentOwnerCandidateState.candidates,
    currentOwnerCandidateState.status,
    onLoadOwnerCandidates,
    repository.id,
  ]);

  const handleOwnerSelectorOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && !canManageOwner) return;
      setOwnerSelectorOpen(nextOpen);
      if (nextOpen) void loadOwnerCandidates();
    },
    [canManageOwner, loadOwnerCandidates],
  );

  const handleOwnerChange = useCallback(
    async (
      nextValue: string,
      option?: PlatformOwnerOption<string, { candidate: DevelopResourceIdentity }>,
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
    },
    [canManageOwner, onOwnerChange, ownerCandidateByValue],
  );

  return (
    <PlatformUiCard
      as="section"
      variant="sidebar"
      className="playground-project-overview-sidebar-card playground-server-detail-properties-card playground-security-agent-detail-properties-card"
    >
      <div className="playground-project-overview-sidebar-rows">
        <RepositorySidebarRow label="Status" valueLabel={repository.status}>
          <PlatformLabel
            variant={
              repository.status === "active"
                ? "green"
                : repository.status === "paused"
                  ? "yellow"
                  : "red"
            }
          >
            {repository.status}
          </PlatformLabel>
        </RepositorySidebarRow>
        <RepositorySidebarRow
          label="Creator"
          valueLabel={creatorLabel}
          valueClassName="playground-server-detail-sidebar-identity-cell"
        >
          <RepositoryCreator identity={creator} />
        </RepositorySidebarRow>
        <RepositorySidebarRow
          label="Visibility"
          valueLabel={repository.private ? "Private" : "Public"}
        >
          {repository.private ? "Private" : "Public"}
        </RepositorySidebarRow>
        <RepositorySidebarRow
          label="Default branch"
          valueLabel={repository.defaultBranch}
        >
          <code>{repository.defaultBranch}</code>
        </RepositorySidebarRow>
        <RepositorySidebarRow label="Last scan" valueLabel={lastScan}>
          {lastScan}
        </RepositorySidebarRow>
        <RepositorySidebarRow label="Next scan" valueLabel={nextScan}>
          {nextScan}
        </RepositorySidebarRow>
        <RepositorySidebarRow label="Checkout" valueLabel="Exact SHA">
          Exact SHA
        </RepositorySidebarRow>
        <RepositorySidebarRow label="Worker" valueLabel="Disposable">
          Disposable
        </RepositorySidebarRow>
        <RepositorySidebarRow
          label="Publication"
          valueLabel="Draft PR after approval"
        >
          Draft PR after approval
        </RepositorySidebarRow>
        <RepositorySidebarRow
          label="Owner"
          valueLabel={ownerLabel}
          className="is-owner playground-server-detail-sidebar-owner-row"
          valueClassName="playground-server-detail-sidebar-owner-cell"
          control
        >
          <PlatformOwnerSelector
            owner={{
              value: selectedOwnerValue,
              name: ownerLabel,
              email: owner.email || "",
              avatarUrl: owner.avatarUrl || "",
            }}
            options={ownerOptions}
            open={ownerSelectorOpen}
            onOpenChange={handleOwnerSelectorOpenChange}
            onTransfer={(nextValue, option) => handleOwnerChange(nextValue, option)}
            ariaLabel="Choose repository owner"
            resourceLabel="security repository"
            alignment="end"
            popupAlignment="right"
            disabled={busy || ownerSaving || !canManageOwner}
            loading={currentOwnerCandidateState.status === "loading"}
            loadingContent="Loading team members..."
            emptyContent="No human team members are available."
            popupWidth={260}
            popupMaxHeight="min(320px, calc(100vh - 180px))"
            className="playground-evaluations-detail-owner-selector"
            triggerClassName="playground-evaluations-detail-owner-trigger"
            popupClassName="playground-agents-detail-owner-menu playground-evaluations-detail-owner-menu"
            optionClassName="playground-agents-detail-owner-option"
          />
        </RepositorySidebarRow>
      </div>
      {onRunScan ? (
        <PlatformPrimaryButton
          className="develop-security-repository-run-scan"
          disabled={busy || repository.status !== "active"}
          onClick={onRunScan}
        >
          <Play width={14} height={14} aria-hidden="true" />
          Run scan
        </PlatformPrimaryButton>
      ) : null}
    </PlatformUiCard>
  );
}
