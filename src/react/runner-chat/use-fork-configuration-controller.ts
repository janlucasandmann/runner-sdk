import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { orderOptionsWithPinnedTop, type RunnerChatOption } from "./agent-options.js";
import type { LocalAttachment } from "./attachment-types.js";
import type {
  RunnerForkExistingEnvironmentFileCopyMode,
  RunnerForkFileCopyMode,
  RunnerForkTarget,
} from "./thread-api.js";
import type { RunnerQuotedSelection, RunnerTurn } from "./turn-types.js";

export interface RunnerPendingForkConfiguration {
  source: "message" | "thread";
  sourceThreadId: string;
  stagedPrompt: string;
  attachments?: LocalAttachment[];
  quotedSelection?: RunnerQuotedSelection | null;
  turn?: RunnerTurn;
  restoreSelectedEnvironmentId?: string | null;
}

interface OpenRunnerThreadForkOptions {
  attachments: LocalAttachment[];
  initialExistingEnvironmentFileCopyMode?: RunnerForkExistingEnvironmentFileCopyMode;
  preselectedTargetEnvironmentId?: string | null;
  quotedSelection?: RunnerQuotedSelection | null;
  restoreSelectedEnvironmentId?: string | null;
  sourceThreadId: string;
  stagedPrompt: string;
}

export interface UseRunnerForkConfigurationControllerOptions {
  availableEnvironments: RunnerChatOption[];
  defaultEnvironmentId?: string | null;
  displayedEnvironmentLabel?: string | null;
  selectedEnvironmentId?: string | null;
  selectedEnvironmentName?: string | null;
  sourceEnvironmentId?: string | null;
  sourceEnvironmentName?: string | null;
}

export function useRunnerForkConfigurationController({
  availableEnvironments,
  defaultEnvironmentId,
  displayedEnvironmentLabel,
  selectedEnvironmentId,
  selectedEnvironmentName,
  sourceEnvironmentId,
  sourceEnvironmentName,
}: UseRunnerForkConfigurationControllerOptions) {
  const [forkingTurnId, setForkingTurnId] = useState<string | null>(null);
  const [pendingForkConfiguration, setPendingForkConfiguration] =
    useState<RunnerPendingForkConfiguration | null>(null);
  const [forkTarget, setForkTarget] = useState<RunnerForkTarget>("existing_environment");
  const [forkTargetEnvironmentId, setForkTargetEnvironmentId] = useState<string>(
    defaultEnvironmentId || "",
  );
  const [forkNewEnvironmentName, setForkNewEnvironmentName] = useState("");
  const [forkNewEnvironmentFileCopyMode, setForkNewEnvironmentFileCopyMode] =
    useState<RunnerForkFileCopyMode>("all");
  const [forkExistingEnvironmentFileCopyMode, setForkExistingEnvironmentFileCopyMode] =
    useState<RunnerForkExistingEnvironmentFileCopyMode>("none");
  const [showForkEnvironmentPopup, setShowForkEnvironmentPopup] = useState(false);
  const [forkDialogError, setForkDialogError] = useState<string | null>(null);
  const environmentPopupRef = useRef<HTMLDivElement | null>(null);

  const getDefaultTargetEnvironmentId = useCallback(
    () => sourceEnvironmentId || selectedEnvironmentId || defaultEnvironmentId || "",
    [defaultEnvironmentId, selectedEnvironmentId, sourceEnvironmentId],
  );
  const buildSuggestedEnvironmentName = useCallback(() => {
    const baseName =
      sourceEnvironmentName ||
      selectedEnvironmentName ||
      displayedEnvironmentLabel ||
      "Environment";
    return `${baseName} Fork`;
  }, [displayedEnvironmentLabel, selectedEnvironmentName, sourceEnvironmentName]);

  const resetConfigurationFields = useCallback(
    (
      targetEnvironmentId = getDefaultTargetEnvironmentId(),
      existingCopyMode: RunnerForkExistingEnvironmentFileCopyMode = "none",
    ) => {
      setForkTarget("existing_environment");
      setForkTargetEnvironmentId(targetEnvironmentId);
      setForkNewEnvironmentName(buildSuggestedEnvironmentName());
      setForkNewEnvironmentFileCopyMode("all");
      setForkExistingEnvironmentFileCopyMode(existingCopyMode);
      setShowForkEnvironmentPopup(false);
      setForkDialogError(null);
    },
    [buildSuggestedEnvironmentName, getDefaultTargetEnvironmentId],
  );

  const resetForkConfiguration = useCallback(() => {
    setPendingForkConfiguration(null);
    resetConfigurationFields();
  }, [resetConfigurationFields]);

  const openMessageForkConfiguration = useCallback(
    (sourceThreadId: string, turn: RunnerTurn) => {
      setPendingForkConfiguration({
        source: "message",
        sourceThreadId,
        stagedPrompt: turn.prompt,
        quotedSelection: turn.quotedSelection || null,
        turn,
      });
      resetConfigurationFields();
    },
    [resetConfigurationFields],
  );

  const openThreadForkConfiguration = useCallback(
    ({
      attachments,
      initialExistingEnvironmentFileCopyMode = "none",
      preselectedTargetEnvironmentId,
      quotedSelection,
      restoreSelectedEnvironmentId,
      sourceThreadId,
      stagedPrompt,
    }: OpenRunnerThreadForkOptions) => {
      setPendingForkConfiguration({
        source: "thread",
        sourceThreadId,
        stagedPrompt,
        attachments,
        quotedSelection: quotedSelection || null,
        restoreSelectedEnvironmentId: restoreSelectedEnvironmentId ?? null,
      });
      resetConfigurationFields(
        preselectedTargetEnvironmentId || getDefaultTargetEnvironmentId(),
        initialExistingEnvironmentFileCopyMode,
      );
    },
    [getDefaultTargetEnvironmentId, resetConfigurationFields],
  );

  const cancelPendingForkConfiguration = useCallback(() => {
    const restoreSelectedEnvironmentId = pendingForkConfiguration?.restoreSelectedEnvironmentId;
    resetForkConfiguration();
    return typeof restoreSelectedEnvironmentId === "string" ? restoreSelectedEnvironmentId : null;
  }, [pendingForkConfiguration, resetForkConfiguration]);

  useEffect(() => {
    if (!showForkEnvironmentPopup) return;

    const handlePointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (environmentPopupRef.current && target && !environmentPopupRef.current.contains(target)) {
        setShowForkEnvironmentPopup(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showForkEnvironmentPopup]);

  const selectedExistingEnvironment =
    availableEnvironments.find((environment) => environment.id === forkTargetEnvironmentId) ||
    (sourceEnvironmentId && sourceEnvironmentId === forkTargetEnvironmentId
      ? {
          id: sourceEnvironmentId,
          name: sourceEnvironmentName || "Current Environment",
        }
      : null);
  const orderedTargetEnvironments = useMemo(
    () =>
      orderOptionsWithPinnedTop(
        availableEnvironments,
        forkTargetEnvironmentId || sourceEnvironmentId || null,
      ),
    [availableEnvironments, forkTargetEnvironmentId, sourceEnvironmentId],
  );
  const showExistingEnvironmentCopyOptions =
    forkTarget === "existing_environment" &&
    Boolean(forkTargetEnvironmentId) &&
    Boolean(sourceEnvironmentId) &&
    forkTargetEnvironmentId !== sourceEnvironmentId;

  return {
    buildSuggestedForkEnvironmentName: buildSuggestedEnvironmentName,
    cancelPendingForkConfiguration,
    forkDialogError,
    forkEnvironmentPopupRef: environmentPopupRef,
    forkExistingEnvironmentFileCopyMode,
    forkingTurnId,
    forkNewEnvironmentFileCopyMode,
    forkNewEnvironmentName,
    forkTarget,
    forkTargetEnvironmentId,
    openMessageForkConfiguration,
    openThreadForkConfiguration,
    orderedForkTargetEnvironments: orderedTargetEnvironments,
    pendingForkConfiguration,
    resetForkConfiguration,
    selectedForkExistingEnvironment: selectedExistingEnvironment,
    setForkDialogError,
    setForkExistingEnvironmentFileCopyMode,
    setForkingTurnId,
    setForkNewEnvironmentFileCopyMode,
    setForkNewEnvironmentName,
    setForkTarget,
    setForkTargetEnvironmentId,
    setShowForkEnvironmentPopup,
    shouldShowForkExistingEnvironmentCopyOptions: showExistingEnvironmentCopyOptions,
    showForkEnvironmentPopup,
  };
}
