import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  FlaskConical,
  Play,
  Plus,
  SquarePen,
  Trash2,
  UsersRound,
} from "lucide-react";
import {
  createPortal,
} from "react-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildPlatformTeamAccessMetadata,
  getPlatformSharedTeamIds,
} from "../../../../../platform-resources/access-control/index.js";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformResourceRenameModal,
  PlatformResourceShareModal,
  type PlatformResourceShareTeam,
} from "../../../../../platform-ui/components/composite/resource-action-modals/index.js";
import {
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "../../../../../platform-ui/components/composite/settings-section/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformResourceActionMenuItem,
  PlatformResourceActionsDivider,
  PlatformResourceActionsInformation,
  PlatformResourceActionsMenu,
  PlatformResourceHeaderActions,
  PlatformResourceVersionLabel,
  PlatformResourceVersionHistoryMenuItem,
} from "../../../../../platform-ui/components/composite/resource-header-actions/index.js";
import { PlatformVersionHistorySidebar } from "../../../../../platform-ui/components/composite/versioning/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import {
  PlatformSelector,
  type PlatformSelectorOption,
} from "../../../../../platform-ui/components/ui/selector/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import { PlatformCheckbox } from "../../../../../platform-ui/components/ui/checkbox/index.js";
import {
  PlatformServiceDetailPage,
  PlatformServiceDetailProperty,
  PlatformServiceDetailPropertyList,
} from "../../../../../platform-ui/pages/details/index.js";
import { ResourceOverviewIdentityCell } from "../../../../../platform-ui/pages/overview/index.js";
import type { TestsApi } from "../api/index.js";
import {
  addTestCaseToDefinition,
  duplicateTestCaseInDefinition,
  getTestCaseCategoryLabel,
  getTestCaseExecutionLabel,
  getTestCaseTargetSummary,
  getTestOwnerCandidateKey,
  getTestPersonIdentityKeys,
  getTestPlanCreatorIdentity,
  getTestPlanOwnerIdentity,
  mergeTestOwnerCandidates,
  normalizeTestPersonIdentity,
  parseTestPlanDefinition,
  removeTestCaseFromDefinition,
  serializeTestPlanDefinition,
  setTestPlanOwnerMetadata,
  type TestCaseDefinition,
  type TestPersonIdentity,
  type TestPersonIdentityInput,
  type TestPlan,
  type TestPlanDefinition,
  type TestPlanVersion,
  type TestRun,
  type TestWorkspaceResourceOption,
} from "../domain/index.js";
import {
  normalizeTestAccessTeam,
  TestPlanAccessSettings,
  type TestAccessTeam,
} from "./test-plan-access-settings.js";
import { TestCaseCreateModal } from "./test-case-create-modal.js";
import {
  TestPlanSaveModal,
  type TestPlanSaveOutcome,
} from "./test-plan-save-modal.js";

type TestPlanTab = "overview" | "cases" | "settings";

interface TestPlanDetailPageProps {
  plan: TestPlan;
  api: TestsApi;
  projects: readonly TestWorkspaceResourceOption[];
  environments: readonly TestWorkspaceResourceOption[];
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  workspaceTeamsRequiresPlan?: boolean;
  onWorkspaceTeamsRequest?: () => void;
  activeOrganizationId?: string;
  currentUser?: TestPersonIdentityInput;
  controlsPortalId?: string;
  sectionControlsPortalId?: string;
  titleActionsPortalId?: string;
  versionsDrawerPortalId?: string;
  onVersionsSidebarOpenChange?: (open: boolean) => void;
  onPlanChange: (plan: TestPlan) => void;
  onDeleted: (plan: TestPlan) => void;
  onReload: () => Promise<void>;
  onRun: (plan: TestPlan) => void;
  onOpenRun: (run: TestRun) => void;
  onOpenCase: (
    testCase: TestCaseDefinition,
    definition: TestPlanDefinition,
  ) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getIdentityLabel(identity: TestPersonIdentity): string {
  return identity.name || identity.email || identity.userId || identity.id || "Unknown";
}

function getIdentityInitials(identity: TestPersonIdentity): string {
  const label = getIdentityLabel(identity);
  const parts = label.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "U";
}

function TestPlanIdentity({ identity }: { identity: TestPersonIdentity }) {
  return (
    <ResourceOverviewIdentityCell
      title={getIdentityLabel(identity)}
      imageUrl={identity.avatarUrl}
      fallback={getIdentityInitials(identity)}
      size="compact"
    />
  );
}

function TestPlanOwnerOptionAvatar({ identity }: { identity: TestPersonIdentity }) {
  return (
    <span className="tests-detail-owner-option-avatar" aria-hidden="true">
      {identity.avatarUrl ? (
        <img src={identity.avatarUrl} alt="" />
      ) : getIdentityInitials(identity)}
    </span>
  );
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function formatDuration(value: number | null | undefined): string {
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration <= 0) return "—";
  if (duration < 1_000) return `${duration} ms`;
  if (duration < 60_000) return `${(duration / 1_000).toFixed(1)} s`;
  return `${Math.floor(duration / 60_000)}m ${Math.round((duration % 60_000) / 1_000)}s`;
}

function formatStatus(value: string): string {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusLabelVariant(value: string): PlatformLabelVariant {
  if (value === "passed" || value === "active") return "green";
  if (["failed", "error", "completed_with_errors"].includes(value)) return "red";
  if (value === "running" || value === "queued") return "blue";
  if (value === "warning") return "yellow";
  return "gray";
}

function usePortalTarget(id: string | undefined): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!id || typeof document === "undefined") {
      setTarget(null);
      return undefined;
    }
    const resolve = () => setTarget(document.getElementById(id));
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [id]);
  return target;
}

export function TestPlanDetailPage({
  plan,
  api,
  projects,
  environments,
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  workspaceTeamsRequiresPlan = false,
  onWorkspaceTeamsRequest,
  activeOrganizationId = "",
  currentUser = {},
  controlsPortalId,
  sectionControlsPortalId,
  titleActionsPortalId,
  versionsDrawerPortalId,
  onVersionsSidebarOpenChange,
  onPlanChange,
  onDeleted,
  onReload,
  onRun,
  onOpenRun,
  onOpenCase,
}: TestPlanDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TestPlanTab>(
    plan.definition.cases.length === 0 ? "cases" : "overview",
  );
  const activePlanIdRef = useRef(plan.id);
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [status, setStatus] = useState(plan.status);
  const [projectId, setProjectId] = useState(plan.projectId || "");
  const [environmentId, setEnvironmentId] = useState(plan.defaultEnvironmentId || "");
  const [definition, setDefinition] = useState<TestPlanDefinition>(() => (
    JSON.parse(JSON.stringify(plan.definition)) as TestPlanDefinition
  ));
  const [definitionJson, setDefinitionJson] = useState(
    serializeTestPlanDefinition(plan.definition),
  );
  const [definitionJsonError, setDefinitionJsonError] = useState("");
  const [caseCreateOpen, setCaseCreateOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [accessDetailOpen, setAccessDetailOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [titleActionsOpen, setTitleActionsOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedShareTeamId, setSelectedShareTeamId] = useState("");
  const [shareError, setShareError] = useState("");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [ownerSelectorOpen, setOwnerSelectorOpen] = useState(false);
  const [ownerCandidateState, setOwnerCandidateState] = useState<{
    planId: string;
    status: "idle" | "loading" | "ready";
    candidates: TestPersonIdentity[];
  }>({
    planId: plan.id,
    status: "idle",
    candidates: [],
  });
  const portalTarget = usePortalTarget(controlsPortalId);
  const sectionControlsPortalTarget = usePortalTarget(sectionControlsPortalId);
  const titleActionsPortalTarget = usePortalTarget(titleActionsPortalId);
  const versionsDrawerPortalTarget = usePortalTarget(versionsDrawerPortalId);
  const parsedDefinition = useMemo(() => ({
    definition: definitionJsonError ? null : definition,
    error: definitionJsonError,
  }), [definition, definitionJsonError]);

  useEffect(() => {
    setName(plan.name);
    setDescription(plan.description);
    setStatus(plan.status);
    setProjectId(plan.projectId || "");
    setEnvironmentId(plan.defaultEnvironmentId || "");
    setDefinition(JSON.parse(JSON.stringify(plan.definition)) as TestPlanDefinition);
    setDefinitionJson(serializeTestPlanDefinition(plan.definition));
    setDefinitionJsonError("");
    setCaseCreateOpen(false);
    setSaveModalOpen(false);
    setSaveError("");
    if (activePlanIdRef.current !== plan.id) {
      activePlanIdRef.current = plan.id;
      setActiveTab(plan.definition.cases.length === 0 ? "cases" : "overview");
    }
    setError("");
    setAccessDetailOpen(false);
    setVersionHistoryOpen(false);
    setTitleActionsOpen(false);
    setShareModalOpen(false);
    setSelectedShareTeamId("");
    setShareError("");
    setRenameModalOpen(false);
    setRenameError("");
    setDeleteConfirmationOpen(false);
    setOwnerSelectorOpen(false);
    setOwnerCandidateState({
      planId: plan.id,
      status: "idle",
      candidates: [],
    });
  }, [plan.id, plan.updatedAt]);

  useEffect(() => {
    if (activeTab !== "settings") setAccessDetailOpen(false);
  }, [activeTab]);

  useEffect(() => {
    onVersionsSidebarOpenChange?.(versionHistoryOpen);
  }, [onVersionsSidebarOpenChange, versionHistoryOpen]);

  useEffect(() => (
    () => onVersionsSidebarOpenChange?.(false)
  ), [onVersionsSidebarOpenChange]);

  const dirty = (
    name.trim() !== plan.name
    || description.trim() !== plan.description
    || status !== plan.status
    || projectId !== (plan.projectId || "")
    || environmentId !== (plan.defaultEnvironmentId || "")
    || definitionJson !== serializeTestPlanDefinition(plan.definition)
  );
  const currentCases = parsedDefinition.definition?.cases || plan.definition.cases || [];
  const runs = Array.isArray(plan.runs) ? plan.runs : [];
  const versions = Array.isArray(plan.versions) ? plan.versions : [];
  const latestVersion = versions.reduce<TestPlanVersion | null>((latest, version) => (
    !latest || Number(version.version) > Number(latest.version) ? version : latest
  ), null);
  const currentVersion = versions.find(
    (version) => version.id === plan.publishedVersionId,
  ) || latestVersion;
  const sharedTeamIds = useMemo(
    () => new Set(getPlatformSharedTeamIds(plan.metadata)),
    [plan.metadata],
  );
  const shareTeams = useMemo<PlatformResourceShareTeam[]>(
    () => workspaceTeams
      .map(normalizeTestAccessTeam)
      .filter((team): team is TestAccessTeam => Boolean(team))
      .filter((team) => ["admin", "owner"].includes(team.roleId))
      .map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        roleLabel: team.roleLabel,
        profileImageUrl: team.profileImageUrl,
        shared: sharedTeamIds.has(team.id),
      })),
    [sharedTeamIds, workspaceTeams],
  );

  useEffect(() => {
    if (!shareModalOpen || selectedShareTeamId || shareTeams.length === 0) return;
    const defaultTeam = shareTeams.find((team) => !team.shared && !team.disabled)
      || shareTeams[0];
    setSelectedShareTeamId(defaultTeam?.id || "");
  }, [selectedShareTeamId, shareModalOpen, shareTeams]);
  const lastRun = runs[0] || null;
  const terminalRuns = runs.filter((run) => (
    ["passed", "failed", "completed_with_errors", "cancelled"].includes(run.status)
  ));
  const passedRuns = terminalRuns.filter((run) => run.status === "passed").length;
  const passRate = terminalRuns.length > 0
    ? Math.round((passedRuns / terminalRuns.length) * 100)
    : 0;
  const projectLabel = projects.find((project) => project.id === projectId)?.name || "Unassigned";
  const environmentLabel = environments.find(
    (environment) => environment.id === environmentId,
  )?.name || "Select when running";
  const viewerIdentity = useMemo(
    () => normalizeTestPersonIdentity(currentUser),
    [currentUser],
  );
  const creatorIdentity = useMemo(
    () => getTestPlanCreatorIdentity(plan, viewerIdentity),
    [plan, viewerIdentity],
  );
  const ownerIdentity = useMemo(
    () => getTestPlanOwnerIdentity(plan, creatorIdentity),
    [creatorIdentity, plan],
  );
  const currentOwnerCandidateState = ownerCandidateState.planId === plan.id
    ? ownerCandidateState
    : {
        planId: plan.id,
        status: "idle" as const,
        candidates: [],
      };
  const ownerCandidates = useMemo(
    () => mergeTestOwnerCandidates([
      ownerIdentity,
      creatorIdentity,
      viewerIdentity,
      ...currentOwnerCandidateState.candidates,
    ]),
    [
      creatorIdentity,
      currentOwnerCandidateState.candidates,
      ownerIdentity,
      viewerIdentity,
    ],
  );
  const ownerCandidateByValue = useMemo(
    () => new Map(ownerCandidates.map((candidate) => [
      getTestOwnerCandidateKey(candidate),
      candidate,
    ])),
    [ownerCandidates],
  );
  const ownerOptions = useMemo<PlatformSelectorOption<string>[]>(
    () => ownerCandidates.map((candidate) => {
      const value = getTestOwnerCandidateKey(candidate);
      const label = getIdentityLabel(candidate);
      const description = candidate.email
        && label.toLowerCase() !== candidate.email.toLowerCase()
        ? candidate.email
        : undefined;
      return {
        value,
        label,
        description,
        ariaLabel: description ? `${label}, ${description}` : label,
        leading: <TestPlanOwnerOptionAvatar identity={candidate} />,
      };
    }),
    [ownerCandidates],
  );
  const ownerKeys = useMemo(
    () => new Set(getTestPersonIdentityKeys(ownerIdentity)),
    [ownerIdentity],
  );
  const selectedOwnerCandidate = ownerCandidates.find((candidate) => (
    getTestPersonIdentityKeys(candidate).some((key) => ownerKeys.has(key))
  ));
  const selectedOwnerValue = selectedOwnerCandidate
    ? getTestOwnerCandidateKey(selectedOwnerCandidate)
    : getTestOwnerCandidateKey(ownerIdentity);
  const canManageOwner = getTestPersonIdentityKeys(viewerIdentity).some(
    (key) => ownerKeys.has(key),
  );

  function commitDefinition(nextDefinition: TestPlanDefinition) {
    setDefinition(nextDefinition);
    setDefinitionJson(serializeTestPlanDefinition(nextDefinition));
    setDefinitionJsonError("");
  }

  function editAdvancedDefinition(nextValue: string) {
    setDefinitionJson(nextValue);
    const parsed = parseTestPlanDefinition(nextValue);
    setDefinitionJsonError(parsed.error);
    if (parsed.definition) setDefinition(parsed.definition);
  }

  async function loadOwnerCandidates() {
    const planId = plan.id;
    if (currentOwnerCandidateState.status !== "idle") return;
    if (!activeOrganizationId) {
      setOwnerCandidateState({ planId, status: "ready", candidates: [] });
      return;
    }
    setOwnerCandidateState({
      planId,
      status: "loading",
      candidates: currentOwnerCandidateState.candidates,
    });
    try {
      const candidates = await api.listOrganizationMembers(activeOrganizationId);
      setOwnerCandidateState((current) => current.planId === planId
        ? {
            planId,
            status: "ready",
            candidates: candidates.map((candidate) => (
              normalizeTestPersonIdentity(candidate)
            )),
          }
        : current);
    } catch (nextError) {
      setOwnerCandidateState((current) => current.planId === planId
        ? { planId, status: "ready", candidates: [] }
        : current);
      setError(nextError instanceof Error
        ? nextError.message
        : "Failed to load organization members.");
    }
  }

  function handleOwnerSelectorOpenChange(nextOpen: boolean) {
    if (nextOpen && (!canManageOwner || dirty || Boolean(busyAction))) return;
    setOwnerSelectorOpen(nextOpen);
    if (nextOpen) void loadOwnerCandidates();
  }

  async function changeOwner(nextValue: string) {
    const nextOwner = ownerCandidateByValue.get(nextValue);
    if (!nextOwner || !canManageOwner || dirty || busyAction) return;
    setOwnerSelectorOpen(false);
    setBusyAction("owner");
    setError("");
    try {
      const updated = await api.updatePlan(plan.id, {
        metadata: setTestPlanOwnerMetadata(
          plan.metadata,
          nextOwner,
          creatorIdentity,
        ),
      } as Partial<TestPlan>);
      onPlanChange({
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      });
    } catch (nextError) {
      setError(nextError instanceof Error
        ? nextError.message
        : "Failed to change the test plan owner.");
    } finally {
      setBusyAction("");
    }
  }

  async function savePlan(outcome: TestPlanSaveOutcome, versionDescription: string) {
    if (!dirty || !parsedDefinition.definition || busyAction) return;
    setBusyAction("save");
    setError("");
    setSaveError("");
    try {
      const updated = await api.updatePlan(plan.id, {
        name: name.trim(),
        description: description.trim(),
        status,
        projectId: projectId || null,
        targetType: projectId ? "project" : plan.targetType,
        targetId: projectId || plan.targetId,
        defaultEnvironmentId: environmentId || null,
        definition: parsedDefinition.definition,
      } as Partial<TestPlan>);
      const mergedPlan = {
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      };
      if (outcome === "draft") onPlanChange(mergedPlan);
      if (outcome !== "draft") {
        const version = await api.createVersion(plan.id, {
          label: `Version ${versions.length + 1}`,
          description: versionDescription || "Saved from the Tests service.",
        });
        if (outcome === "publish") {
          await api.publishVersion(plan.id, version.id);
        }
        await onReload();
      }
      setSaveModalOpen(false);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to save the test plan.";
      setError(message);
      setSaveError(message);
    } finally {
      setBusyAction("");
    }
  }

  async function createVersion() {
    if (dirty || busyAction) return;
    setBusyAction("version");
    setError("");
    try {
      await api.createVersion(plan.id, {
        label: `Version ${versions.length + 1}`,
        description: "Saved from the Tests service.",
      });
      await onReload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create a version.");
    } finally {
      setBusyAction("");
    }
  }

  async function publishVersion(version: TestPlanVersion) {
    if (busyAction || version.id === plan.publishedVersionId) return;
    setBusyAction(`publish:${version.id}`);
    setError("");
    try {
      await api.publishVersion(plan.id, version.id);
      await onReload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to publish the version.");
    } finally {
      setBusyAction("");
    }
  }

  async function copyPlanId() {
    setTitleActionsOpen(false);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }
      await navigator.clipboard.writeText(plan.id);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to copy the test ID.");
    }
  }

  function openShareModal() {
    onWorkspaceTeamsRequest?.();
    const defaultTeam = shareTeams.find((team) => !team.shared && !team.disabled)
      || shareTeams[0]
      || null;
    setTitleActionsOpen(false);
    setSelectedShareTeamId(defaultTeam?.id || "");
    setShareError("");
    setShareModalOpen(true);
  }

  async function shareWithTeam(teamId: string) {
    const team = shareTeams.find((candidate) => candidate.id === teamId);
    if (!team || team.shared || team.disabled || busyAction || dirty) return;
    setBusyAction("share");
    setShareError("");
    let createdShareId = "";
    try {
      const metadata = asRecord(plan.metadata);
      const withTeam = buildPlatformTeamAccessMetadata(
        metadata,
        team.id,
        true,
        "test_plan_team_role",
      );
      const teamRolePermissionSets = asRecord(withTeam.teamRolePermissionSets);
      const share = await api.addTeamShare(team.id, plan.id, {
        permissionSets: asRecord(teamRolePermissionSets[team.id]),
      });
      createdShareId = String(share.id || "").trim();
      const updated = await api.updatePlan(plan.id, {
        metadata: {
          ...withTeam,
          teamAccessShareIds: {
            ...asRecord(metadata.teamAccessShareIds),
            [team.id]: createdShareId,
          },
        },
      } as Partial<TestPlan>);
      onPlanChange({
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      });
      setShareModalOpen(false);
    } catch (nextError) {
      if (createdShareId) {
        await api.removeTeamShare(team.id, createdShareId).catch(() => undefined);
      }
      setShareError(
        nextError instanceof Error ? nextError.message : "Failed to share the test with the team.",
      );
    } finally {
      setBusyAction("");
    }
  }

  function openRenameModal() {
    setTitleActionsOpen(false);
    setRenameError("");
    setRenameModalOpen(true);
  }

  async function renamePlan(nextName: string) {
    if (!nextName.trim() || nextName.trim() === plan.name || busyAction || dirty) return;
    setBusyAction("rename");
    setRenameError("");
    try {
      const updated = await api.updatePlan(plan.id, { name: nextName.trim() });
      onPlanChange({
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      });
      setRenameModalOpen(false);
    } catch (nextError) {
      setRenameError(
        nextError instanceof Error ? nextError.message : "Failed to rename the test.",
      );
    } finally {
      setBusyAction("");
    }
  }

  function removeCase(testCase: TestCaseDefinition) {
    commitDefinition(removeTestCaseFromDefinition(definition, testCase.id));
  }

  function addCase(testCase: TestCaseDefinition) {
    commitDefinition(addTestCaseToDefinition(definition, testCase));
  }

  function duplicateCase(testCase: TestCaseDefinition) {
    commitDefinition(duplicateTestCaseInDefinition(definition, testCase));
  }

  const latestCaseResultById = useMemo(() => {
    const resultById = new Map<string, NonNullable<TestRun["results"]>[number]>();
    for (const run of runs) {
      for (const result of run.results || []) {
        if (!resultById.has(result.caseId)) resultById.set(result.caseId, result);
      }
    }
    return resultById;
  }, [runs]);

  const caseColumns = useMemo<PlatformDataTableColumn<TestCaseDefinition>[]>(
    () => [
      {
        id: "name",
        header: "Case",
        accessor: "name",
        sortable: true,
        width: "minmax(220px, 1.25fr)",
        cell: ({ row }) => (
          <span className="tests-table-identity">
            <span>
              <strong>{row.name}</strong>
            </span>
          </span>
        ),
      },
      {
        id: "execution",
        header: "Execution",
        accessor: (row) => getTestCaseExecutionLabel(row),
        sortable: true,
        width: "minmax(150px, .7fr)",
      },
      {
        id: "category",
        header: "Category",
        accessor: (row) => getTestCaseCategoryLabel(row),
        sortable: true,
        width: "minmax(120px, .55fr)",
      },
      {
        id: "target",
        header: "Target",
        accessor: (row) => getTestCaseTargetSummary(row),
        width: "minmax(190px, .9fr)",
        cell: ({ row }) => (
          <span className="tests-table-truncated-value" title={getTestCaseTargetSummary(row)}>
            {getTestCaseTargetSummary(row)}
          </span>
        ),
      },
      {
        id: "status",
        header: "State",
        accessor: (row) => row.enabled ? "Enabled" : "Disabled",
        sortable: true,
        width: "minmax(110px, .5fr)",
      },
      {
        id: "result",
        header: "Last result",
        accessor: (row) => latestCaseResultById.get(row.id)?.status || "Not run",
        width: "minmax(120px, .55fr)",
        cell: ({ row }) => {
          const value = latestCaseResultById.get(row.id)?.status;
          return value ? (
            <PlatformLabel variant={statusLabelVariant(value)}>{formatStatus(value)}</PlatformLabel>
          ) : "Not run";
        },
      },
    ],
    [latestCaseResultById],
  );
  const runColumns = useMemo<PlatformDataTableColumn<TestRun>[]>(
    () => [
      {
        id: "run",
        header: "Run",
        accessor: "id",
        width: "minmax(220px, 1.15fr)",
        cell: ({ row }) => (
          <span className="tests-table-identity">
            <span>
              <strong>{row.id}</strong>
              <small>{formatTimestamp(row.createdAt)}</small>
            </span>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(150px, .7fr)",
        cell: ({ row }) => (
          <PlatformLabel variant={statusLabelVariant(row.status)}>
            {formatStatus(row.status)}
          </PlatformLabel>
        ),
      },
      {
        id: "results",
        header: "Results",
        accessor: (row) => row.passedCount,
        width: "minmax(140px, .65fr)",
        cell: ({ row }) => `${row.passedCount} passed · ${row.failedCount + row.errorCount} failed`,
      },
      {
        id: "duration",
        header: "Duration",
        accessor: (row) => row.durationMs || 0,
        sortable: true,
        width: "minmax(110px, .5fr)",
        cell: ({ row }) => formatDuration(row.durationMs),
      },
    ],
    [],
  );
  const versionColumns = useMemo<PlatformDataTableColumn<TestPlanVersion>[]>(
    () => [
      {
        id: "version",
        header: "Version",
        accessor: "version",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(170px, .8fr)",
        cell: ({ row }) => (
          <span className="tests-version-label">
            v{row.version}
            {row.id === plan.publishedVersionId ? <em>Published</em> : null}
          </span>
        ),
      },
      {
        id: "label",
        header: "Label",
        accessor: "label",
        width: "minmax(190px, 1fr)",
      },
      {
        id: "created",
        header: "Created",
        accessor: (row) => Date.parse(row.createdAt) || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(180px, .85fr)",
        cell: ({ row }) => formatTimestamp(row.createdAt),
      },
    ],
    [plan.publishedVersionId],
  );

  const analyticsRuns = runs.slice().reverse();
  const planAnalytics = {
    ariaLabel: "Test plan analytics",
    metrics: [
      {
        id: "pass-rate",
        label: "Pass Rate",
        value: terminalRuns.length > 0 ? `${passRate}%` : "—",
        color: "#8fc4ff",
      },
      {
        id: "cases",
        label: "Cases",
        value: String(currentCases.length),
        color: "#7657ff",
      },
      {
        id: "runs",
        label: "Runs",
        value: String(runs.length),
        color: "#7effff",
      },
      {
        id: "duration",
        label: "Last Duration",
        value: formatDuration(lastRun?.durationMs),
        color: "#9ff6ce",
      },
    ],
    labels: analyticsRuns.map((run, index) => (
      `Run ${index + 1}`
    )),
    hasData: analyticsRuns.length > 0,
    series: [
      {
        id: "pass-rate",
        label: "Pass rate",
        values: analyticsRuns.map((run) => (
          run.totalCount > 0
            ? Math.round((run.passedCount / run.totalCount) * 100)
            : 0
        )),
        color: "#8fc4ff",
        valueKind: "percent" as const,
      },
      {
        id: "passed",
        label: "Passed cases",
        values: analyticsRuns.map((run) => run.passedCount),
        color: "#9ff6ce",
        axis: "secondary" as const,
      },
    ],
  };
  const properties = (
    <PlatformServiceDetailPropertyList>
      <PlatformServiceDetailProperty label="Status">
        <PlatformLabel variant={statusLabelVariant(plan.status)}>
          {formatStatus(plan.status)}
        </PlatformLabel>
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty
        label="Project"
        className="tests-detail-truncated-property"
        title={projectLabel}
      >
        <span className="tests-detail-truncated-property__value">{projectLabel}</span>
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty
        label="Environment"
        className="tests-detail-truncated-property"
        title={environmentLabel}
      >
        <span className="tests-detail-truncated-property__value">{environmentLabel}</span>
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Updated">
        {formatTimestamp(plan.updatedAt)}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty
        label="Creator"
        className="tests-detail-identity-row"
        title={creatorIdentity.email || getIdentityLabel(creatorIdentity)}
      >
        <TestPlanIdentity identity={creatorIdentity} />
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty
        label="Owner"
        className="tests-detail-owner-row"
        title={ownerIdentity.email || getIdentityLabel(ownerIdentity)}
      >
        <PlatformSelector
          value={selectedOwnerValue}
          options={ownerOptions}
          open={ownerSelectorOpen}
          onOpenChange={handleOwnerSelectorOpenChange}
          onValueChange={(nextValue) => void changeOwner(nextValue)}
          ariaLabel="Choose test plan owner"
          label={<TestPlanIdentity identity={ownerIdentity} />}
          alignment="end"
          popupAlignment="right"
          fullWidth
          disabled={Boolean(busyAction) || dirty || !canManageOwner}
          loading={currentOwnerCandidateState.status === "loading"}
          loadingContent="Loading organization members..."
          emptyContent="No organization members are available."
          popupWidth={260}
          popupMaxHeight="min(320px, calc(100vh - 180px))"
          className="tests-detail-owner-selector"
          triggerClassName="tests-detail-owner-trigger"
          popupClassName="tests-detail-owner-menu"
          optionClassName="tests-detail-owner-option"
          title={dirty ? "Save test plan changes before changing the owner." : undefined}
        />
      </PlatformServiceDetailProperty>
      <PlatformPrimaryButton
        size="small"
        fullWidth
        className="tests-detail-run-button"
        disabled={
          Boolean(busyAction)
          || status === "archived"
          || currentCases.length === 0
          || !plan.publishedVersionId
        }
        title={!plan.publishedVersionId
          ? "Publish an immutable version before starting a run."
          : undefined}
        onClick={() => onRun(plan)}
      >
        <Play width={14} height={14} aria-hidden="true" />
        Run Tests
      </PlatformPrimaryButton>
    </PlatformServiceDetailPropertyList>
  );
  const titleActions = (
    <PlatformResourceHeaderActions>
      {currentVersion ? (
        <PlatformResourceVersionLabel
          resourceLabel="test"
          version={currentVersion.version}
          latestVersion={latestVersion?.version}
          disabled={Boolean(busyAction)}
          onOpenVersionHistory={() => {
            setTitleActionsOpen(false);
            setVersionHistoryOpen(true);
          }}
        />
      ) : null}
      <PlatformResourceActionsMenu
        open={titleActionsOpen}
        onOpenChange={setTitleActionsOpen}
        resourceLabel="Test"
        disabled={Boolean(busyAction)}
        shortcutActions={{
          share: {
            onInvoke: openShareModal,
            disabled: dirty || shareModalOpen || renameModalOpen || deleteConfirmationOpen,
          },
          rename: {
            onInvoke: openRenameModal,
            disabled: dirty || shareModalOpen || renameModalOpen || deleteConfirmationOpen,
          },
          delete: {
            onInvoke: () => setDeleteConfirmationOpen(true),
            disabled: shareModalOpen || renameModalOpen || deleteConfirmationOpen,
          },
        }}
      >
        <PlatformResourceActionsInformation
          resourceLabel="Test"
          items={[
            {
              id: "id",
              label: "ID",
              value: plan.id,
              title: plan.id,
              monospace: true,
              copyValue: plan.id,
              copyAriaLabel: "Copy Test ID",
            },
            {
              id: "created",
              label: "Created",
              value: formatTimestamp(plan.createdAt),
            },
            {
              id: "updated",
              label: "Updated",
              value: formatTimestamp(plan.updatedAt),
            },
          ]}
        />
        <PlatformResourceVersionHistoryMenuItem
          onClick={() => {
            setTitleActionsOpen(false);
            setVersionHistoryOpen(true);
          }}
        />
        <PlatformResourceActionsDivider />
        <PlatformResourceActionMenuItem
          icon={<UsersRound width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Share"
          shortcut="share"
          disabled={dirty}
          title={dirty ? "Save test changes before sharing." : undefined}
          onClick={openShareModal}
        />
        <PlatformResourceActionMenuItem
          icon={<Copy width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Copy Test ID"
          onClick={() => void copyPlanId()}
        />
        <PlatformResourceActionsDivider />
        <PlatformResourceActionMenuItem
          icon={<SquarePen width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Rename"
          shortcut="rename"
          disabled={dirty}
          title={dirty ? "Save test changes before renaming." : undefined}
          onClick={openRenameModal}
        />
        <PlatformResourceActionMenuItem
          icon={<Trash2 width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Delete"
          shortcut="delete"
          onClick={() => {
            setTitleActionsOpen(false);
            setDeleteConfirmationOpen(true);
          }}
        />
      </PlatformResourceActionsMenu>
    </PlatformResourceHeaderActions>
  );
  const headerActions = (
    <PlatformPrimaryButton
      size="small"
      disabled={Boolean(busyAction) || !dirty || !parsedDefinition.definition}
      onClick={() => {
        setSaveError("");
        setSaveModalOpen(true);
      }}
    >
      <Bookmark width={14} height={14} aria-hidden="true" />
      {busyAction === "save" ? "Saving…" : "Save Changes"}
    </PlatformPrimaryButton>
  );
  const sectionSwitch = (
    <PlatformSwitch
      className="tests-detail-header-switch"
      value={activeTab}
      options={[
        { value: "overview", label: "Overview" },
        { value: "cases", label: "Cases" },
        { value: "settings", label: "Settings" },
      ]}
      onValueChange={(nextTab) => setActiveTab(
        nextTab === "cases"
          ? "cases"
          : nextTab === "settings"
            ? "settings"
            : "overview",
      )}
      ariaLabel="Test plan section"
    />
  );

  return (
    <>
      {portalTarget ? createPortal(headerActions, portalTarget) : null}
      {titleActionsPortalTarget ? createPortal(titleActions, titleActionsPortalTarget) : null}
      {sectionControlsPortalTarget && !versionHistoryOpen
        ? createPortal(sectionSwitch, sectionControlsPortalTarget)
        : null}
      <PlatformServiceDetailPage
        properties={properties}
        sidebarCollapsed={activeTab === "cases" || accessDetailOpen || versionHistoryOpen}
        ariaLabel={`${plan.name} test plan`}
        sidebarAriaLabel="Test plan information"
        className="tests-detail-page"
        contentClassName="tests-detail-content"
        sidebarClassName="tests-detail-sidebar"
        propertiesCardClassName="tests-detail-sidebar-card"
      >
        {!plan.publishedVersionId ? (
          <div className="tests-plan-state-banner is-warning" role="status">
            <AlertTriangle width={15} height={15} aria-hidden="true" />
            <span>
              <strong>Draft only</strong>
              Add cases, save your changes, then publish an immutable version before running this plan.
            </span>
          </div>
        ) : dirty ? (
          <div className="tests-plan-state-banner" role="status">
            <AlertTriangle width={15} height={15} aria-hidden="true" />
            <span>
              <strong>Unsaved changes</strong>
              Runs continue to use the published immutable version until these changes are saved and published.
            </span>
          </div>
        ) : null}
        {error || parsedDefinition.error ? (
          <PlatformUiCard as="div" className="tests-inline-error" role="alert">
            {error || `Definition JSON: ${parsedDefinition.error}`}
          </PlatformUiCard>
        ) : null}

        {activeTab === "overview" ? (
          <div className="tests-detail-stack">
            <PlatformAnalyticsSection
              variant="default"
              title="Analytics"
              analytics={planAnalytics}
              className="tests-detail-analytics"
              showXAxisLabels={false}
            />
            <PlatformDataTable
              rows={runs}
              columns={runColumns}
              getRowId={(run) => run.id}
              ariaLabel="Test runs"
              className="tests-runs-table"
              variant="minimalistic-ui"
              surface="plain"
              sticky={false}
              pagination={{ defaultValue: { pageIndex: 0, pageSize: 20 } }}
              toolbar={{
                title: "Run History",
                search: {
                  placeholder: "Search runs",
                  getSearchText: (run) =>
                    `${run.id} ${run.status} ${run.commitSha || ""} ${run.triggerType}`,
                },
              }}
              onRowActivate={onOpenRun}
              getRowAriaLabel={(run) => `Open test run ${run.id}`}
              emptyState={(
                <PlatformEmptyState
                  icon={Clock3}
                  title="No test runs yet"
                  description="Run the published plan to retain case-level verification evidence."
                  primaryAction={{ label: "Run Tests", onClick: () => onRun(plan) }}
                />
              )}
            />
          </div>
        ) : null}

        {activeTab === "cases" ? (
          <div className="tests-cases-panel">
            <PlatformDataTable
              rows={currentCases}
              columns={caseColumns}
              getRowId={(testCase) => testCase.id}
              ariaLabel="Test cases"
              className="tests-cases-table"
              variant="minimalistic-ui"
              surface="plain"
              sticky={false}
              pagination={false}
              toolbar={{
                title: "All Cases",
                search: {
                  placeholder: "Search cases",
                  getSearchText: (testCase) => [
                    testCase.name,
                    getTestCaseExecutionLabel(testCase),
                    getTestCaseCategoryLabel(testCase),
                    getTestCaseTargetSummary(testCase),
                    testCase.enabled ? "enabled" : "disabled",
                  ].join(" "),
                },
                primaryAction: {
                  label: "Add Case",
                  icon: Plus,
                  onClick: () => setCaseCreateOpen(true),
                },
              }}
              getRowActions={(testCase): readonly PlatformDataTableAction<TestCaseDefinition>[] => [
                {
                  id: "open",
                  label: "Open",
                  icon: ChevronRight,
                  onSelect: () => onOpenCase(
                    testCase,
                    parsedDefinition.definition || plan.definition,
                  ),
                },
                {
                  id: "duplicate",
                  label: "Duplicate",
                  icon: Copy,
                  onSelect: () => duplicateCase(testCase),
                },
                {
                  id: "remove",
                  label: "Remove",
                  icon: Trash2,
                  danger: true,
                  separatorBefore: true,
                  onSelect: () => removeCase(testCase),
                },
              ]}
              onRowActivate={(testCase) => onOpenCase(
                testCase,
                parsedDefinition.definition || plan.definition,
              )}
              getRowAriaLabel={(testCase) => `Open test case ${testCase.name}`}
              emptyState={(
                <PlatformEmptyState
                  icon={FlaskConical}
                  title="No test cases"
                  description="Choose an execution method and add the first case to this draft plan."
                  primaryAction={{ label: "Add Case", onClick: () => setCaseCreateOpen(true) }}
                />
              )}
            />
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div className="tests-detail-stack">
            <PlatformSettingsSectionList>
              <PlatformSettingsSection
                title="Plan execution"
                description="Configure plan-wide lifecycle steps, scheduling, retries, and retained evidence."
              >
                <div className="tests-form-grid">
                  <label className="tests-form-field is-span-2">
                    <span>Setup command (optional)</span>
                    <input
                      value={String(asRecord(definition.setup).command || "")}
                      placeholder="Runs once before the first case"
                      onChange={(event) => commitDefinition({
                        ...definition,
                        setup: event.currentTarget.value.trim()
                          ? { ...asRecord(definition.setup), command: event.currentTarget.value }
                          : null,
                      })}
                    />
                  </label>
                  <label className="tests-form-field is-span-2">
                    <span>Teardown command (optional)</span>
                    <input
                      value={String(asRecord(definition.teardown).command || "")}
                      placeholder="Runs once after the final case"
                      onChange={(event) => commitDefinition({
                        ...definition,
                        teardown: event.currentTarget.value.trim()
                          ? { ...asRecord(definition.teardown), command: event.currentTarget.value }
                          : null,
                      })}
                    />
                  </label>
                  <label className="tests-form-field">
                    <span>Concurrency</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={definition.concurrency}
                      onChange={(event) => commitDefinition({
                        ...definition,
                        concurrency: Math.max(1, Math.min(20, Number(event.currentTarget.value) || 1)),
                      })}
                    />
                  </label>
                  <label className="tests-form-field">
                    <span>Maximum attempts</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={definition.retryPolicy.maxAttempts}
                      onChange={(event) => commitDefinition({
                        ...definition,
                        retryPolicy: {
                          ...definition.retryPolicy,
                          maxAttempts: Math.max(1, Math.min(10, Number(event.currentTarget.value) || 1)),
                        },
                      })}
                    />
                  </label>
                  <label className="tests-form-field">
                    <span>Retry backoff (ms)</span>
                    <input
                      type="number"
                      min={0}
                      max={300000}
                      value={definition.retryPolicy.backoffMs}
                      onChange={(event) => commitDefinition({
                        ...definition,
                        retryPolicy: {
                          ...definition.retryPolicy,
                          backoffMs: Math.max(0, Math.min(300_000, Number(event.currentTarget.value) || 0)),
                        },
                      })}
                    />
                  </label>
                  <div className="tests-form-field tests-form-checkbox-field">
                    <span>Failure behavior</span>
                    <label>
                      <PlatformCheckbox
                        checked={definition.stopOnFailure}
                        aria-label="Stop on first failure"
                        onClick={() => commitDefinition({
                          ...definition,
                          stopOnFailure: !definition.stopOnFailure,
                        })}
                      />
                      Stop on first failure
                    </label>
                  </div>
                </div>
                <div className="tests-evidence-policy">
                  <strong>Evidence retention</strong>
                  {([
                    ["retainLogs", "Logs"],
                    ["retainScreenshots", "Screenshots"],
                    ["retainTraces", "Traces"],
                    ["retainArtifacts", "Artifacts"],
                    ["redactSecrets", "Redact secrets"],
                  ] as const).map(([key, label]) => (
                    <label key={key}>
                      <PlatformCheckbox
                        checked={definition.evidencePolicy[key]}
                        aria-label={label}
                        onClick={() => commitDefinition({
                          ...definition,
                          evidencePolicy: {
                            ...definition.evidencePolicy,
                            [key]: !definition.evidencePolicy[key],
                          },
                        })}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </PlatformSettingsSection>
              <PlatformSettingsSection
                title="Properties"
                description="Connect this verification contract to the project and environment it protects."
              >
                <div className="tests-form-grid">
                  <label className="tests-form-field">
                    <span>Name</span>
                    <input value={name} onChange={(event) => setName(event.currentTarget.value)} />
                  </label>
                  <div className="tests-form-field">
                    <span>Status</span>
                    <PlatformSelector
                      value={status}
                      options={[
                        { value: "draft", label: "Draft" },
                        { value: "active", label: "Active" },
                        { value: "archived", label: "Archived" },
                      ]}
                      fullWidth
                      ariaLabel="Test-plan status"
                      onValueChange={setStatus}
                    />
                  </div>
                  <label className="tests-form-field is-span-2">
                    <span>Description</span>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.currentTarget.value)}
                    />
                  </label>
                  <div className="tests-form-field">
                    <span>Project</span>
                    <PlatformSelector
                      value={projectId}
                      options={[
                        { value: "", label: "Unassigned" },
                        ...projects.map((project) => ({
                          value: project.id,
                          label: project.name,
                          description: project.description,
                        })),
                      ]}
                      fullWidth
                      ariaLabel="Test-plan project"
                      onValueChange={setProjectId}
                    />
                  </div>
                  <div className="tests-form-field">
                    <span>Default environment</span>
                    <PlatformSelector
                      value={environmentId}
                      options={[
                        { value: "", label: "Select when running" },
                        ...environments.map((environment) => ({
                          value: environment.id,
                          label: environment.name,
                          description: environment.description,
                        })),
                      ]}
                      fullWidth
                      ariaLabel="Default test environment"
                      onValueChange={setEnvironmentId}
                    />
                  </div>
                </div>
              </PlatformSettingsSection>
              <PlatformSettingsSection
                title="Advanced definition"
                description="Edit the canonical plan contract directly. Invalid JSON cannot be saved."
              >
                <details className="tests-advanced-definition">
                  <summary>Open JSON editor</summary>
                  <textarea
                    className="tests-definition-editor"
                    aria-label="Strict test-plan definition JSON"
                    spellCheck={false}
                    value={definitionJson}
                    onChange={(event) => editAdvancedDefinition(event.currentTarget.value)}
                  />
                </details>
              </PlatformSettingsSection>
              <PlatformSettingsSection
                title="Version history"
                description="New runs always pin the currently published immutable version."
                actions={(
                  <PlatformSecondaryButton
                    size="compact"
                    disabled={dirty || Boolean(busyAction)}
                    onClick={() => void createVersion()}
                  >
                    <Plus width={13} height={13} aria-hidden="true" />
                    Save Version
                  </PlatformSecondaryButton>
                )}
                bodyPresentation="flush"
              >
                <PlatformDataTable
                  rows={versions}
                  columns={versionColumns}
                  getRowId={(version) => version.id}
                  ariaLabel="Test-plan versions"
                  variant="minimalistic-ui"
                  surface="plain"
                  sticky={false}
                  pagination={false}
                  getRowActions={(version) => [
                    {
                      id: "publish",
                      label: version.id === plan.publishedVersionId ? "Published" : "Publish",
                      icon: CheckCircle2,
                      disabled: version.id === plan.publishedVersionId || Boolean(busyAction),
                      onSelect: () => void publishVersion(version),
                    },
                  ]}
                  emptyState="No saved versions."
                />
              </PlatformSettingsSection>
              <PlatformSettingsSection
                title="Execution boundary"
                description="Tests execute only from immutable published snapshots inside Computer Agents environments."
              >
                <dl className="tests-evidence-identity">
                  <div><dt>Execution</dt><dd>Computer Agents environment</dd></div>
                  <div><dt>Definition</dt><dd>Immutable published snapshot</dd></div>
                  <div><dt>Secrets</dt><dd>References only · redacted</dd></div>
                  <div><dt>Evidence</dt><dd>Server fingerprinted</dd></div>
                </dl>
              </PlatformSettingsSection>
            </PlatformSettingsSectionList>
            <TestPlanAccessSettings
              plan={plan}
              api={api}
              workspaceTeams={workspaceTeams}
              onPlanChange={onPlanChange}
              onPermissionDetailOpenChange={setAccessDetailOpen}
            />
          </div>
        ) : null}
      </PlatformServiceDetailPage>
      {(!versionsDrawerPortalId || versionsDrawerPortalTarget) ? (
        <PlatformVersionHistorySidebar<TestPlanVersion>
          open={versionHistoryOpen}
          title="Version history"
          sectionTitle="All Versions"
          className="playground-agents-versions-sidebar tests-version-history-sidebar"
          width="var(--playground-thread-task-detail-width)"
          portal={Boolean(versionsDrawerPortalTarget)}
          portalTarget={versionsDrawerPortalTarget}
          versions={versions}
          activeVersionId={plan.publishedVersionId || ""}
          selectedVersionId={currentVersion?.id || ""}
          emptyDescription="Save a version to start this test's version history."
          busy={Boolean(busyAction) || dirty}
          onClose={() => setVersionHistoryOpen(false)}
          onCreateVersion={() => createVersion()}
          onPublishVersion={(_versionId, version) => publishVersion(version)}
          canPublishVersion={(version) => version.id !== plan.publishedVersionId}
          getVersionCreatedAt={(version) => formatTimestamp(
            version.createdAt || version.updatedAt || version.publishedAt,
          )}
        />
      ) : null}
      <TestCaseCreateModal
        open={caseCreateOpen}
        existingCases={definition.cases}
        onClose={() => setCaseCreateOpen(false)}
        onCreate={addCase}
      />
      <TestPlanSaveModal
        open={saveModalOpen}
        planName={name.trim() || plan.name}
        nextVersion={versions.length + 1}
        caseCount={definition.cases.filter((testCase) => testCase.enabled !== false).length}
        hasPublishedVersion={Boolean(plan.publishedVersionId)}
        busy={busyAction === "save"}
        error={saveError}
        onClose={() => {
          if (busyAction !== "save") setSaveModalOpen(false);
        }}
        onSave={({ outcome, description: versionDescription }) => (
          savePlan(outcome, versionDescription)
        )}
      />
      <PlatformResourceShareModal
        open={shareModalOpen}
        resourceLabel="Test"
        resourceName={plan.name}
        teams={shareTeams}
        loading={workspaceTeamsLoading}
        selectedTeamId={selectedShareTeamId}
        onSelectedTeamIdChange={setSelectedShareTeamId}
        onClose={() => {
          if (busyAction !== "share") setShareModalOpen(false);
        }}
        onShare={shareWithTeam}
        busy={busyAction === "share"}
        error={shareError}
        emptyMessage={workspaceTeamsRequiresPlan
          ? "Teams are not available on this workspace plan."
          : "No teams you can manage are available."}
      />
      <PlatformResourceRenameModal
        open={renameModalOpen}
        resourceLabel="Test"
        initialName={plan.name}
        onClose={() => {
          if (busyAction !== "rename") setRenameModalOpen(false);
        }}
        onRename={renamePlan}
        busy={busyAction === "rename"}
        error={renameError}
      />
      <PlatformConfirmationModal
        open={deleteConfirmationOpen}
        title="Delete Test?"
        description={`This permanently deletes ${plan.name}, its versions, runs, results, and retained artifacts.`}
        confirmLabel="Delete Test"
        confirmingLabel="Deleting…"
        tone="destructive"
        onCancel={() => setDeleteConfirmationOpen(false)}
        onConfirm={async () => {
          await api.deletePlan(plan.id);
          setDeleteConfirmationOpen(false);
          onDeleted(plan);
        }}
      />
    </>
  );
}
