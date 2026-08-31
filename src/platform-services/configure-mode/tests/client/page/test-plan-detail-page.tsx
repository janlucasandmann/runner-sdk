import {
  AlertTriangle,
  Bookmark,
  Clock3,
  Copy,
  FileJson2,
  FileUp,
  FlaskConical,
  FolderOpen,
  Monitor,
  SquarePen,
  Trash2,
  UsersRound,
} from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import {
  createPortal,
} from "react-dom";
import {
  useCallback,
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
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformOwnerSelector,
  type PlatformOwnerOption,
} from "../../../../../platform-ui/components/composite/owner-selector/index.js";
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
import {
  PlatformVersionHistorySidebar,
  usePlatformVersionNavigationGuard,
  type PlatformVersionNavigationGuardRegistrar,
} from "../../../../../platform-ui/components/composite/versioning/index.js";
import {
  PlatformPrimaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import {
  PlatformButtonSelector,
  PlatformSelector,
} from "../../../../../platform-ui/components/ui/selector/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import { PlatformToggle } from "../../../../../platform-ui/components/ui/toggle/index.js";
import {
  PlatformServiceDetailPage,
  PlatformServiceDetailProperty,
  PlatformServiceDetailPropertyList,
} from "../../../../../platform-ui/pages/details/index.js";
import { ResourceOverviewIdentityCell } from "../../../../../platform-ui/pages/overview/index.js";
import { PlatformResourceSettingsIdentity } from "../../../../../platform-ui/pages/settings/index.js";
import type { TestsApi } from "../api/index.js";
import {
  addTestCaseToDefinition,
  duplicateTestCaseInDefinition,
  getTestOwnerCandidateKey,
  getTestPersonIdentityKeys,
  getTestPlanCreatorIdentity,
  getTestPlanOwnerIdentity,
  mergeTestOwnerCandidates,
  normalizeTestPersonIdentity,
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
import { TestScenarioWorkspace } from "./test-scenario-workspace.js";
import { TestReportImportModal } from "./test-report-import-modal.js";

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
  onNavigationGuardChange?: PlatformVersionNavigationGuardRegistrar;
  onPlanChange: (plan: TestPlan) => void;
  onDeleted: (plan: TestPlan) => void;
  onReload: () => Promise<void>;
  onRun: (plan: TestPlan) => void;
  onOpenRawConfiguration?: () => void;
  onOpenRun: (run: TestRun) => void;
  onTryScenarios?: (
    definition: TestPlanDefinition,
    scenarioIds: string[],
  ) => Promise<void>;
  /** Compatibility hook for direct case routes; the consolidated workspace is primary. */
  onOpenCase?: (
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
  onNavigationGuardChange,
  onPlanChange,
  onDeleted,
  onReload,
  onRun,
  onOpenRawConfiguration,
  onOpenRun,
  onTryScenarios = async () => undefined,
}: TestPlanDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TestPlanTab>(
    plan.definition.cases.length === 0 ? "cases" : "overview",
  );
  const activePlanIdRef = useRef(plan.id);
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
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
  const [selectedShareTeamIds, setSelectedShareTeamIds] = useState<string[]>([]);
  const [shareError, setShareError] = useState("");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [reportImportOpen, setReportImportOpen] = useState(false);
  const [reportImportError, setReportImportError] = useState("");
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
    setSelectedShareTeamIds([]);
    setShareError("");
    setRenameModalOpen(false);
    setRenameError("");
    setDeleteConfirmationOpen(false);
    setReportImportOpen(false);
    setReportImportError("");
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

  const discardUnsavedChanges = useCallback(() => {
    setName(plan.name);
    setDescription(plan.description);
    setProjectId(plan.projectId || "");
    setEnvironmentId(plan.defaultEnvironmentId || "");
    setDefinition(JSON.parse(JSON.stringify(plan.definition)) as TestPlanDefinition);
    setDefinitionJson(serializeTestPlanDefinition(plan.definition));
    setDefinitionJsonError("");
    setSaveModalOpen(false);
    setSaveError("");
    setError("");
  }, [plan]);

  const dirty = (
    name.trim() !== plan.name
    || description.trim() !== plan.description
    || projectId !== (plan.projectId || "")
    || environmentId !== (plan.defaultEnvironmentId || "")
    || definitionJson !== serializeTestPlanDefinition(plan.definition)
  );
  usePlatformVersionNavigationGuard({
    dirty,
    resourceId: plan.id,
    resourceName: plan.name,
    resourceType: "Test",
    onDiscard: discardUnsavedChanges,
    onNavigationGuardChange,
  });
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

  const lastRun = runs[0] || null;
  const terminalRuns = runs.filter((run) => (
    ["passed", "failed", "completed_with_errors", "cancelled"].includes(run.status)
  ));
  const passedRuns = terminalRuns.filter((run) => run.status === "passed").length;
  const passRate = terminalRuns.length > 0
    ? Math.round((passedRuns / terminalRuns.length) * 100)
    : 0;
  const projectLabel = projects.find((project) => project.id === projectId)?.name || "Unassigned";
  const computerLabel = environments.find(
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
  const ownerOptions = useMemo<PlatformOwnerOption<string, { candidate: TestPersonIdentity }>[]>(
    () => ownerCandidates.map((candidate) => {
      const value = getTestOwnerCandidateKey(candidate);
      const label = getIdentityLabel(candidate);
      const description = candidate.email
        && label.toLowerCase() !== candidate.email.toLowerCase()
        ? candidate.email
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

  async function changeOwner(
    nextValue: string,
    option?: PlatformOwnerOption<string, { candidate: TestPersonIdentity }>,
  ) {
    const nextOwner = option?.data?.candidate
      ? normalizeTestPersonIdentity(option.data.candidate)
      : ownerCandidateByValue.get(nextValue);
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
      const normalizedError = nextError instanceof Error
        ? nextError
        : new Error("Failed to change the test plan owner.");
      setError(normalizedError.message);
      throw normalizedError;
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
        projectId: projectId || null,
        targetType: plan.targetType,
        targetId: plan.targetType === "project"
          ? projectId || null
          : plan.targetId,
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
    setTitleActionsOpen(false);
    setSelectedShareTeamIds([]);
    setShareError("");
    setShareModalOpen(true);
  }

  async function shareWithTeams(teamIds: string[]) {
    if (busyAction || dirty) return;
    const requestedTeamIds = new Set(
      teamIds.map((teamId) => String(teamId || "").trim()).filter(Boolean),
    );
    const teamsToShare = shareTeams.filter((team) => (
      requestedTeamIds.has(team.id) && !team.shared && !team.disabled
    ));
    if (teamsToShare.length === 0) {
      setShareError("Choose at least one team first.");
      return;
    }
    setBusyAction("share");
    setShareError("");
    const createdShares: Array<{ teamId: string; shareId: string }> = [];
    try {
      const metadata = asRecord(plan.metadata);
      let nextMetadata = { ...metadata };
      for (const team of teamsToShare) {
        nextMetadata = buildPlatformTeamAccessMetadata(
          nextMetadata,
          team.id,
          true,
          "test_plan_team_role",
        );
      }
      const teamRolePermissionSets = asRecord(nextMetadata.teamRolePermissionSets);
      for (const team of teamsToShare) {
        const share = await api.addTeamShare(team.id, plan.id, {
          permissionSets: asRecord(teamRolePermissionSets[team.id]),
        });
        const shareId = String(share.id || "").trim();
        if (!shareId) throw new Error(`The team share for ${team.name} did not return an ID.`);
        createdShares.push({ teamId: team.id, shareId });
      }
      const nextShareIds = { ...asRecord(metadata.teamAccessShareIds) };
      createdShares.forEach(({ teamId, shareId }) => {
        nextShareIds[teamId] = shareId;
      });
      const updated = await api.updatePlan(plan.id, {
        metadata: {
          ...nextMetadata,
          teamAccessShareIds: nextShareIds,
        },
      } as Partial<TestPlan>);
      onPlanChange({
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      });
      setSelectedShareTeamIds([]);
      setShareModalOpen(false);
    } catch (nextError) {
      await Promise.all(createdShares.map(({ teamId, shareId }) => (
        api.removeTeamShare(teamId, shareId).catch(() => undefined)
      )));
      setShareError(
        nextError instanceof Error ? nextError.message : "Failed to share the test with the selected teams.",
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
        label: "Scenarios",
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
        label: "Passed scenarios",
        values: analyticsRuns.map((run) => run.passedCount),
        color: "#9ff6ce",
        axis: "secondary" as const,
      },
    ],
  };
  const properties = (
    <PlatformServiceDetailPropertyList>
      <PlatformServiceDetailProperty
        label="Project"
        className="tests-detail-target-row"
        title={projectLabel}
      >
        <PlatformSelector
          value={projectId}
          options={[
            {
              value: "",
              label: "Unassigned",
              leading: <FolderOpen width={14} height={14} strokeWidth={1.85} />,
            },
            ...projects.map((project) => ({
              value: project.id,
              label: project.name,
              description: project.description,
              leading: <FolderOpen width={14} height={14} strokeWidth={1.85} />,
            })),
          ]}
          label={(
            <span className="tests-detail-target-selector-value">
              <FolderOpen width={14} height={14} strokeWidth={1.85} aria-hidden="true" />
              <span title={projectLabel}>{projectLabel}</span>
            </span>
          )}
          placeholder="Unassigned"
          ariaLabel="Test project"
          alignment="end"
          popupAlignment="right"
          fullWidth
          disabled={Boolean(busyAction)}
          emptyContent="No projects available."
          popupWidth="min(280px, calc(100vw - 48px))"
          popupMaxWidth="calc(100vw - 48px)"
          popupMaxHeight="min(320px, calc(100vh - 120px))"
          className="playground-tasks-detail-central-selector playground-project-overview-sidebar-selector tests-detail-target-selector"
          triggerClassName="playground-tasks-detail-central-selector-trigger playground-project-overview-sidebar-selector-trigger tests-detail-target-trigger"
          popupClassName="playground-tasks-detail-central-selector-popup playground-project-overview-sidebar-selector-popup tests-detail-target-popup"
          onValueChange={setProjectId}
        />
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty
        label="Computer"
        className="tests-detail-target-row"
        title={computerLabel}
      >
        <PlatformSelector
          value={environmentId}
          options={[
            {
              value: "",
              label: "Select when running",
              leading: <Monitor width={14} height={14} strokeWidth={1.85} />,
            },
            ...environments.map((environment) => ({
              value: environment.id,
              label: environment.name,
              description: environment.description,
              leading: <Monitor width={14} height={14} strokeWidth={1.85} />,
            })),
          ]}
          label={(
            <span className="tests-detail-target-selector-value">
              <Monitor width={14} height={14} strokeWidth={1.85} aria-hidden="true" />
              <span title={computerLabel}>{computerLabel}</span>
            </span>
          )}
          placeholder="Select when running"
          ariaLabel="Test computer"
          alignment="end"
          popupAlignment="right"
          fullWidth
          disabled={Boolean(busyAction)}
          emptyContent="No computers available."
          popupWidth="min(280px, calc(100vw - 48px))"
          popupMaxWidth="calc(100vw - 48px)"
          popupMaxHeight="min(320px, calc(100vh - 120px))"
          className="playground-tasks-detail-central-selector playground-project-overview-sidebar-selector tests-detail-target-selector"
          triggerClassName="playground-tasks-detail-central-selector-trigger playground-project-overview-sidebar-selector-trigger tests-detail-target-trigger"
          popupClassName="playground-tasks-detail-central-selector-popup playground-project-overview-sidebar-selector-popup tests-detail-target-popup"
          onValueChange={setEnvironmentId}
        />
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
        <PlatformOwnerSelector
          owner={{
            value: selectedOwnerValue,
            name: getIdentityLabel(ownerIdentity),
            email: ownerIdentity.email || "",
            avatarUrl: ownerIdentity.avatarUrl || "",
          }}
          options={ownerOptions}
          open={ownerSelectorOpen}
          onOpenChange={handleOwnerSelectorOpenChange}
          onTransfer={(nextValue, option) => changeOwner(nextValue, option)}
          ariaLabel="Choose test plan owner"
          resourceLabel="test plan"
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
      <PlatformButtonSelector
        mode="split-action"
        buttonVariant="primary"
        buttonSize="small"
        label="Run Test"
        actionAriaLabel="Run Test"
        popupAriaLabel="Run test options"
        popupAlignment="right"
        popupRole="menu"
        popupVariant="minimal"
        popupWidth={210}
        closeOnSelect
        fullWidth
        className="tests-detail-run-button"
        actionDisabled={
          Boolean(busyAction)
          || currentCases.length === 0
          || !plan.publishedVersionId
        }
        popupDisabled={Boolean(busyAction) || !onOpenRawConfiguration}
        onAction={() => onRun(plan)}
      >
        <button
          type="button"
          role="menuitem"
          className="platform-data-table__menu-item"
          onClick={() => onOpenRawConfiguration?.()}
        >
          <FileJson2
            className="platform-data-table__menu-icon"
            width={14}
            height={14}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <span className="platform-data-table__menu-copy">Raw Configuration</span>
        </button>
      </PlatformButtonSelector>
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
        <PlatformResourceActionMenuItem
          icon={<FileUp width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Import Report"
          disabled={dirty || currentCases.length === 0}
          title={dirty ? "Save test changes before importing a report." : undefined}
          onClick={() => {
            setTitleActionsOpen(false);
            setReportImportError("");
            setReportImportOpen(true);
          }}
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
        { value: "cases", label: "Scenarios" },
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
  const testIdentity = {
    icon: <FlaskConical width={24} height={24} strokeWidth={1.7} />,
    title: name,
    description,
    titlePlaceholder: "Test",
    descriptionPlaceholder: "Describe the behavior this test protects",
    titleAriaLabel: "Test name",
    descriptionAriaLabel: "Test description",
  };
  const settings = activeTab === "settings" ? {
    ariaLabel: "Test settings",
    className: "tests-settings-page",
    identity: {
      ...testIdentity,
      onTitleChange: setName,
      onDescriptionChange: setDescription,
    },
    details: {
      variant: "standard" as const,
      customAttributes: [
        {
          id: "computer",
          label: "Computer",
          title: computerLabel,
          value: (
            <PlatformSelector
              value={environmentId}
              options={[
                {
                  value: "",
                  label: "Select when running",
                  leading: <Monitor width={14} height={14} strokeWidth={1.85} />,
                },
                ...environments.map((environment) => ({
                  value: environment.id,
                  label: environment.name,
                  description: environment.description,
                  leading: <Monitor width={14} height={14} strokeWidth={1.85} />,
                })),
              ]}
              label={(
                <span className="tests-detail-target-selector-value">
                  <Monitor width={14} height={14} strokeWidth={1.85} aria-hidden="true" />
                  <span title={computerLabel}>{computerLabel}</span>
                </span>
              )}
              placeholder="Select when running"
              ariaLabel="Test computer"
              alignment="end"
              popupAlignment="right"
              fullWidth
              disabled={Boolean(busyAction)}
              emptyContent="No computers available."
              popupWidth="min(280px, calc(100vw - 48px))"
              popupMaxWidth="calc(100vw - 48px)"
              popupMaxHeight="min(320px, calc(100vh - 120px))"
              className="playground-tasks-detail-central-selector playground-project-overview-sidebar-selector tests-detail-target-selector"
              triggerClassName="playground-tasks-detail-central-selector-trigger playground-project-overview-sidebar-selector-trigger tests-detail-target-trigger"
              popupClassName="playground-tasks-detail-central-selector-popup playground-project-overview-sidebar-selector-popup tests-detail-target-popup"
              onValueChange={setEnvironmentId}
            />
          ),
        },
      ],
      updatedAt: plan.updatedAt,
      creator: {
        value: creatorIdentity.id || creatorIdentity.email || "test-creator",
        name: getIdentityLabel(creatorIdentity),
        email: creatorIdentity.email || "",
        avatarUrl: creatorIdentity.avatarUrl || "",
      },
      owner: {
        value: selectedOwnerValue,
        name: getIdentityLabel(ownerIdentity),
        email: ownerIdentity.email || "",
        avatarUrl: ownerIdentity.avatarUrl || "",
      },
      ownerOptions,
      onOwnerTransfer: changeOwner,
      ownerSelectorProps: {
        open: ownerSelectorOpen,
        onOpenChange: handleOwnerSelectorOpenChange,
        ariaLabel: "Choose test plan owner",
        resourceLabel: "test plan",
        alignment: "end" as const,
        popupAlignment: "right" as const,
        fullWidth: true,
        disabled: Boolean(busyAction) || dirty || !canManageOwner,
        loading: currentOwnerCandidateState.status === "loading",
        loadingContent: "Loading organization members...",
        emptyContent: "No organization members are available.",
        popupWidth: 260,
        popupMaxHeight: "min(320px, calc(100vh - 180px))",
        title: dirty ? "Save test plan changes before changing the owner." : undefined,
      },
      scope: {
        values: projectId ? [projectId] : [],
        options: projects.map((project) => ({
          value: project.id,
          label: project.name,
          leading: <FolderOpen width={14} height={14} strokeWidth={1.85} />,
        })),
        onValuesChange: (values: readonly string[]) => setProjectId(values.at(-1) || ""),
        ariaLabel: "Choose test plan scope",
        disabled: Boolean(busyAction),
      },
      primaryActions: [
        {
          id: "run-test",
          label: "Run Test",
          onSelect: () => onRun(plan),
          disabled: Boolean(busyAction) || currentCases.length === 0 || !plan.publishedVersionId,
        },
        {
          id: "raw-configuration",
          label: "Raw Configuration",
          onSelect: onOpenRawConfiguration,
          disabled: Boolean(busyAction) || !onOpenRawConfiguration,
        },
      ] as const,
      className: "tests-detail-sidebar-card",
    },
    additionalSections: (
      <>
        {!plan.publishedVersionId ? (
          <div className="tests-plan-state-banner is-warning" role="status">
            <AlertTriangle width={15} height={15} aria-hidden="true" />
            <span>
              <strong>Draft only</strong>
              Add scenarios, save your changes, then publish an immutable version for trusted runs.
            </span>
          </div>
        ) : null}
        {error || parsedDefinition.error ? (
          <PlatformUiCard as="div" className="tests-inline-error" role="alert">
            {error || `Definition JSON: ${parsedDefinition.error}`}
          </PlatformUiCard>
        ) : null}
        <PlatformSettingsSectionList>
          <PlatformSettingsSection
            title="Run behavior"
            className="tests-settings-detail-section tests-run-behavior-section"
            bodyPresentation="flush"
          >
            <PlatformServiceDetailPropertyList className="tests-settings-detail-list tests-run-behavior-list">
              <PlatformServiceDetailProperty label="Scenarios running at once">
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="tests-settings-detail-number-input"
                  value={definition.concurrency}
                  aria-label="Scenarios running at once"
                  title="Use 1 to run scenarios in order"
                  onChange={(event) => commitDefinition({
                    ...definition,
                    concurrency: Math.max(1, Math.min(20, Number(event.currentTarget.value) || 1)),
                  })}
                />
              </PlatformServiceDetailProperty>
              <PlatformServiceDetailProperty label="Attempts per scenario">
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="tests-settings-detail-number-input"
                  value={definition.retryPolicy.maxAttempts}
                  aria-label="Attempts per scenario"
                  title="Maximum attempts including the first run; deterministic scenarios are retried by the Test worker"
                  onChange={(event) => commitDefinition({
                    ...definition,
                    retryPolicy: {
                      ...definition.retryPolicy,
                      maxAttempts: Math.max(1, Math.min(10, Number(event.currentTarget.value) || 1)),
                    },
                  })}
                />
              </PlatformServiceDetailProperty>
              <PlatformServiceDetailProperty label="Stop remaining scenarios">
                <PlatformToggle
                  checked={definition.stopOnFailure}
                  aria-label="Stop after the first failed scenario"
                  onCheckedChange={(nextChecked) => commitDefinition({
                    ...definition,
                    stopOnFailure: nextChecked,
                  })}
                />
              </PlatformServiceDetailProperty>
            </PlatformServiceDetailPropertyList>
          </PlatformSettingsSection>
          <PlatformSettingsSection
            title="Evidence to keep"
            className="tests-settings-detail-section tests-evidence-settings-section"
            bodyPresentation="flush"
          >
            <PlatformServiceDetailPropertyList className="tests-settings-detail-list tests-evidence-policy">
              {([
                ["retainLogs", "Console logs"],
                ["retainScreenshots", "Screenshots"],
                ["retainTraces", "Execution traces"],
                ["retainArtifacts", "Files and reports"],
                ["redactSecrets", "Redact secrets"],
              ] as const).map(([key, label]) => (
                <PlatformServiceDetailProperty key={key} label={label}>
                  <PlatformToggle
                    checked={definition.evidencePolicy[key]}
                    aria-label={label}
                    onCheckedChange={(nextChecked) => commitDefinition({
                      ...definition,
                      evidencePolicy: {
                        ...definition.evidencePolicy,
                        [key]: nextChecked,
                      },
                    })}
                  />
                </PlatformServiceDetailProperty>
              ))}
            </PlatformServiceDetailPropertyList>
          </PlatformSettingsSection>
        </PlatformSettingsSectionList>
      </>
    ),
    access: (
      <TestPlanAccessSettings
        plan={plan}
        api={api}
        workspaceTeams={workspaceTeams}
        onPlanChange={onPlanChange}
        onPermissionDetailOpenChange={setAccessDetailOpen}
      />
    ),
    accessDetailOpen,
    detailsSidebarCollapsed: versionHistoryOpen,
    detailsSidebarAriaLabel: "Test plan information",
    detailsSidebarClassName: "tests-detail-sidebar playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar",
  } : undefined;

  return (
    <>
      {portalTarget ? createPortal(headerActions, portalTarget) : null}
      {titleActionsPortalTarget ? createPortal(titleActions, titleActionsPortalTarget) : null}
      {sectionControlsPortalTarget && !versionHistoryOpen
        ? createPortal(sectionSwitch, sectionControlsPortalTarget)
        : null}
      <PlatformServiceDetailPage
        settings={settings}
        properties={properties}
        sidebarCollapsed={activeTab === "cases" || accessDetailOpen || versionHistoryOpen}
        ariaLabel={`${plan.name} test plan`}
        sidebarAriaLabel="Test plan information"
        className={`tests-detail-page is-${activeTab}-tab`}
        contentClassName="tests-detail-content"
        sidebarClassName="tests-detail-sidebar"
        propertiesCardClassName="tests-detail-sidebar-card"
      >
        {activeTab === "overview" ? (
          <PlatformResourceSettingsIdentity
            {...testIdentity}
            readOnly
            className="tests-overview-identity"
          />
        ) : null}
        {!plan.publishedVersionId ? (
          <div className="tests-plan-state-banner is-warning" role="status">
            <AlertTriangle width={15} height={15} aria-hidden="true" />
            <span>
              <strong>Draft only</strong>
              Add scenarios, save your changes, then publish an immutable version for trusted runs.
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
                  description="Run the published Test to retain scenario-level verification evidence."
                  primaryAction={{ label: "Run Test", onClick: () => onRun(plan) }}
                />
              )}
            />
          </div>
        ) : null}

        {activeTab === "cases" ? (
          <div className="tests-cases-panel">
            <TestScenarioWorkspace
              plan={plan}
              definition={parsedDefinition.definition || definition}
              api={api}
              latestResultById={latestCaseResultById}
              busy={Boolean(busyAction)}
              onDefinitionChange={commitDefinition}
              onAdd={() => setCaseCreateOpen(true)}
              onDuplicate={duplicateCase}
              onRemove={removeCase}
              onTry={onTryScenarios}
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
        testTargetType={plan.targetType}
        testTargetId={plan.targetId}
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
      <TestReportImportModal
        open={reportImportOpen}
        scenarios={currentCases}
        busy={busyAction === "import-report"}
        error={reportImportError}
        onClose={() => {
          if (busyAction !== "import-report") setReportImportOpen(false);
        }}
        onImport={async (input) => {
          setBusyAction("import-report");
          setReportImportError("");
          try {
            const run = await api.importRun(plan.id, input);
            setReportImportOpen(false);
            onOpenRun(run);
          } catch (nextError) {
            setReportImportError(
              nextError instanceof Error ? nextError.message : "Failed to import the report.",
            );
          } finally {
            setBusyAction("");
          }
        }}
      />
      <PlatformResourceShareModal
        open={shareModalOpen}
        resourceLabel="Test"
        resourceName={plan.name}
        teams={shareTeams}
        loading={workspaceTeamsLoading}
        selectionMode="multiple"
        selectedTeamIds={selectedShareTeamIds}
        onSelectedTeamIdsChange={setSelectedShareTeamIds}
        onClose={() => {
          if (busyAction !== "share") setShareModalOpen(false);
        }}
        onShareTeams={shareWithTeams}
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
