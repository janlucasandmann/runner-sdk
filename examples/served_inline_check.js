
      import React, { useCallback, useEffect, useMemo, useState } from "react";
      import { createRoot } from "react-dom/client";
      import { Clock3, Ellipsis, Layers, PanelLeftClose, PanelLeftOpen, Pin, Settings2, SlidersHorizontal, SquarePen } from "lucide-react";
      import { RunnerClient } from "/dist/index.js";
      import { RunnerChat } from "/dist/react/index.js";
      import { openGoogleDrivePicker } from "/examples/google-drive-picker.mjs";

      const STATUS_INDICATOR_PENDING_STORAGE_KEY = "runner_demo_pending_status_indicators_v1";
      const INTEGRATION_STATUS_STORAGE_KEY = "runner_demo_integration_status_v1";

      function readPendingStatusIndicatorIds() {
        try {
          const raw = sessionStorage.getItem(STATUS_INDICATOR_PENDING_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
        } catch {
          return [];
        }
      }

      function writePendingStatusIndicatorIds(ids) {
        try {
          sessionStorage.setItem(STATUS_INDICATOR_PENDING_STORAGE_KEY, JSON.stringify(ids));
        } catch {}
      }

      function addPendingStatusIndicatorId(id) {
        const current = readPendingStatusIndicatorIds();
        if (current.includes(id)) return;
        writePendingStatusIndicatorIds([...current, id]);
      }

      function removePendingStatusIndicatorId(id) {
        const current = readPendingStatusIndicatorIds();
        if (!current.includes(id)) return;
        writePendingStatusIndicatorIds(current.filter((value) => value !== id));
      }

      function readCachedIntegrationStatuses() {
        try {
          const raw = localStorage.getItem(INTEGRATION_STATUS_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : {};
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
          return {};
        }
      }

      function readCachedIntegrationStatus(id) {
        const cachedStatuses = readCachedIntegrationStatuses();
        const cachedStatus = cachedStatuses[id];
        if (!cachedStatus || typeof cachedStatus !== "object") {
          return { connected: false };
        }

        return {
          connected: Boolean(cachedStatus.connected),
          profile: cachedStatus.profile && typeof cachedStatus.profile === "object" ? cachedStatus.profile : undefined,
        };
      }

      function writeCachedIntegrationStatus(id, status) {
        try {
          const cachedStatuses = readCachedIntegrationStatuses();
          if (status?.connected) {
            cachedStatuses[id] = {
              connected: true,
              profile: status.profile && typeof status.profile === "object" ? status.profile : undefined,
            };
          } else {
            delete cachedStatuses[id];
          }
          localStorage.setItem(INTEGRATION_STATUS_STORAGE_KEY, JSON.stringify(cachedStatuses));
        } catch {}
      }

      function isUnauthorizedStatus(status) {
        return status === 401 || status === 403;
      }

      function buildStatusIndicatorItem(id, profile) {
        if (id === "google-drive") {
          return {
            id: "google-drive",
            title: "Google Drive connected",
            copy: profile?.email || profile?.username || "Successfully connected",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
          };
        }

        if (id === "one-drive") {
          return {
            id: "one-drive",
            title: "OneDrive connected",
            copy: profile?.email || profile?.username || "Successfully connected",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Microsoft_Office_OneDrive_%282019%E2%80%932025%29.svg",
          };
        }

        if (id === "github") {
          return {
            id: "github",
            title: "GitHub connected",
            copy: profile?.email || profile?.login || profile?.name || "Successfully connected",
            brand: "github",
          };
        }

        if (id === "notion") {
          return {
            id: "notion",
            title: "Notion connected",
            copy: profile?.workspaceName || profile?.name || profile?.email || "Successfully connected",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
          };
        }

        return null;
      }

      function StatusIndicatorCloseIcon() {
        return React.createElement("svg", {
          className: "status-indicator-close-icon",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true"
        },
          React.createElement("path", { d: "M18 6 6 18" }),
          React.createElement("path", { d: "m6 6 12 12" })
        );
      }

      function StatusIndicatorGithubLogo() {
        return React.createElement("svg", {
          className: "status-indicator-logo",
          viewBox: "0 0 24 24",
          fill: "currentColor",
          "aria-hidden": "true"
        },
          React.createElement("path", {
            d: "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
          })
        );
      }

      function StatusIndicator({ title, copy, logoUrl, brand, onDismiss }) {
        const [isVisible, setIsVisible] = useState(false);
        const [isExiting, setIsExiting] = useState(false);

        useEffect(() => {
          const frameId = window.requestAnimationFrame(() => setIsVisible(true));
          return () => window.cancelAnimationFrame(frameId);
        }, []);

        function handleDismiss() {
          setIsExiting(true);
          window.setTimeout(() => {
            onDismiss?.();
          }, 180);
        }

        return React.createElement("div", {
          className: "status-indicator" + (isVisible && !isExiting ? " is-visible" : "") + (isExiting ? " is-exiting" : "")
        },
          (logoUrl || brand)
            ? React.createElement("div", { className: "status-indicator-media" },
                brand === "github"
                  ? React.createElement(StatusIndicatorGithubLogo)
                  :
                React.createElement("img", {
                  className: "status-indicator-logo",
                  src: logoUrl,
                  alt: "",
                  "aria-hidden": "true",
                  draggable: false
                })
              )
            : null,
          React.createElement("div", { className: "status-indicator-body" },
            React.createElement("div", { className: "status-indicator-title" }, title),
            React.createElement("div", { className: "status-indicator-copy" }, copy)
          ),
          React.createElement("button", {
            type: "button",
            className: "status-indicator-close",
            onClick: handleDismiss,
            "aria-label": "Dismiss " + title
          }, React.createElement(StatusIndicatorCloseIcon))
        );
      }

      function StatusIndicatorStack({ items, emptyText, dismissedIds, onDismiss }) {
        const visibleItems = items.filter((item) => !dismissedIds.includes(item.id));
        if (visibleItems.length === 0) {
          return null;
        }

        return React.createElement("div", { className: "status-indicator-stack" },
          React.createElement("div", { className: "status-indicator-list" },
            visibleItems.map((item) =>
              React.createElement(StatusIndicator, {
                key: item.id,
                title: item.title,
                copy: item.copy,
                logoUrl: item.logoUrl,
                brand: item.brand,
                onDismiss: () => onDismiss(item.id)
              })
            )
          )
        );
      }

      const DEMO_PINNED_THREADS = [
        { id: "pin_runner_playground", title: "Improve runner playground sidebar", positive: "+2", negative: "-1", ageLabel: "2 H" },
        { id: "pin_sdk_foundation", title: "Runner SDK foundation cleanup", positive: "+4", negative: "-0", ageLabel: "1 D" }
      ];

      const DEMO_RECENT_THREADS = [
        { id: "demo_thread_sidebar", title: "on localhost:4177 we have this runner playground sample application running", messageCount: 12, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: "demo_thread_settings", title: "Plan improved aiOS settings modal structure", messageCount: 3, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: "demo_thread_context", title: "Build thread context operations popup and slash command staging", messageCount: 6, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
        { id: "demo_thread_files", title: "Unify file explorer integrations for Google Drive, OneDrive, GitHub, and Notion", messageCount: 8, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() },
        { id: "demo_thread_speech", title: "Ship speech to text and microphone states in runner task input", messageCount: 5, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString() }
      ];

      const DEMO_SCHEDULED_THREADS = [
        { id: "demo_scheduled_publish", title: "Publish runner SDK changelog", messageCount: 2, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), isScheduled: true },
        { id: "demo_scheduled_review", title: "Review open playground polish tasks", messageCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), isScheduled: true }
      ];

      function formatRelativeThreadTime(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        const diffMs = Math.max(0, Date.now() - date.getTime());
        const minuteMs = 60 * 1000;
        const hourMs = 60 * minuteMs;
        const dayMs = 24 * hourMs;
        const weekMs = 7 * dayMs;
        const monthMs = 30 * dayMs;

        if (diffMs < hourMs) return Math.max(1, Math.round(diffMs / minuteMs)) + " M";
        if (diffMs < dayMs) return Math.max(1, Math.round(diffMs / hourMs)) + " H";
        if (diffMs < weekMs) return Math.max(1, Math.round(diffMs / dayMs)) + " D";
        if (diffMs < monthMs) return Math.max(1, Math.round(diffMs / weekMs)) + " W";
        return Math.max(1, Math.round(diffMs / monthMs)) + " M";
      }

      function normalizeThreadItem(thread) {
        return {
          id: thread.id,
          title: thread.title || "Untitled thread",
          status: thread.status || "",
          messageCount: Number.isFinite(thread.messageCount) ? thread.messageCount : 0,
          createdAt: thread.createdAt || "",
          updatedAt: thread.updatedAt || "",
          nextRunAt: thread.nextRunAt || thread.scheduledTime || "",
          isScheduled: Boolean(thread.nextRunAt || thread.scheduledTime),
        };
      }

      function threadMetaLabel(thread) {
        if (thread.nextRunAt) {
          return "Scheduled";
        }
        return "";
      }

      function normalizeHistoryPath(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        let normalized = raw.split("\\").join("/");
        while (normalized.startsWith("/")) {
          normalized = normalized.slice(1);
        }
        if (normalized.startsWith("workspace/")) {
          normalized = normalized.slice("workspace/".length);
        }
        return normalized;
      }

      function historyPathsMatch(left, right) {
        return normalizeHistoryPath(left) === normalizeHistoryPath(right);
      }

      function uniqueHistoryPaths(values) {
        const seen = new Set();
        return values
          .map(normalizeHistoryPath)
          .filter((value) => {
            if (!value || seen.has(value)) return false;
            seen.add(value);
            return true;
          });
      }

      function formatHistoryTimestamp(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(date);
      }

      function extractStepChangedPaths(step) {
        const metadata = step && step.metadata && typeof step.metadata === "object" ? step.metadata : {};
        const values = [];
        if (Array.isArray(metadata.changedPaths)) values.push(...metadata.changedPaths);
        if (Array.isArray(metadata.filePaths)) values.push(...metadata.filePaths);
        if (typeof metadata.path === "string") values.push(metadata.path);
        return uniqueHistoryPaths(values);
      }

      function getPreferredHistoryStep(steps) {
        if (!Array.isArray(steps) || steps.length === 0) return null;
        return (
          steps.find((step) => extractStepChangedPaths(step).length > 0 && (step.snapshotAfterId || step.snapshotBeforeId))
          || steps.find((step) => step.snapshotAfterId || step.snapshotBeforeId)
          || steps[0]
          || null
        );
      }

      function getPreferredFilePath(entries, changedPaths) {
        const changedSet = new Set(uniqueHistoryPaths(changedPaths));
        const files = entries.filter((entry) => entry.type === "file");
        const changedMatch = files.find((entry) => changedSet.has(normalizeHistoryPath(entry.path)));
        return changedMatch?.path || files[0]?.path || "";
      }

      function ThreadChangesView({ threadId, threadTitle, backendUrl, apiKey, upstreamUrl }) {
        const client = useMemo(() => new RunnerClient(), []);
        const historyHeaders = useMemo(() => ({
          ...(apiKey.trim() ? { "X-API-Key": apiKey.trim() } : {}),
          "X-Runner-Upstream-Url": upstreamUrl,
        }), [apiKey, upstreamUrl]);

        const [steps, setSteps] = useState([]);
        const [stepsLoading, setStepsLoading] = useState(false);
        const [stepsError, setStepsError] = useState("");
        const [selectedStepId, setSelectedStepId] = useState("");
        const [stepFiles, setStepFiles] = useState([]);
        const [stepDiffSummary, setStepDiffSummary] = useState(null);
        const [stepDataLoading, setStepDataLoading] = useState(false);
        const [stepDataError, setStepDataError] = useState("");
        const [selectedFilePath, setSelectedFilePath] = useState("");
        const [selectedFileContent, setSelectedFileContent] = useState("");
        const [selectedFileDiff, setSelectedFileDiff] = useState(null);
        const [filePreviewLoading, setFilePreviewLoading] = useState(false);
        const [filePreviewError, setFilePreviewError] = useState("");

        const sortedSteps = useMemo(() => {
          return [...steps].sort((left, right) => right.sequence - left.sequence);
        }, [steps]);

        const selectedStep = useMemo(() => {
          return sortedSteps.find((step) => step.id === selectedStepId) || null;
        }, [selectedStepId, sortedSteps]);

        const changedPaths = useMemo(() => {
          return uniqueHistoryPaths([
            ...(selectedStep ? extractStepChangedPaths(selectedStep) : []),
            ...(Array.isArray(stepDiffSummary?.changedPaths) ? stepDiffSummary.changedPaths : []),
          ]);
        }, [selectedStep, stepDiffSummary]);

        const selectedFileEntry = useMemo(() => {
          return stepFiles.find((entry) => historyPathsMatch(entry.path, selectedFilePath)) || null;
        }, [selectedFilePath, stepFiles]);

        useEffect(() => {
          let cancelled = false;

          setSteps([]);
          setStepsError("");
          setSelectedStepId("");
          setStepFiles([]);
          setStepDiffSummary(null);
          setStepDataError("");
          setSelectedFilePath("");
          setSelectedFileContent("");
          setSelectedFileDiff(null);
          setFilePreviewError("");

          if (!threadId) {
            setStepsLoading(false);
            return () => {
              cancelled = true;
            };
          }

          if (!apiKey.trim()) {
            setStepsLoading(false);
            setStepsError("Changes view is available for real API-backed threads only.");
            return () => {
              cancelled = true;
            };
          }

          setStepsLoading(true);

          client.listThreadSteps({
            backendUrl,
            threadId,
            limit: 500,
            headers: historyHeaders,
          }).then((items) => {
            if (cancelled) return;
            setSteps(Array.isArray(items) ? items : []);
          }).catch((error) => {
            if (cancelled) return;
            setSteps([]);
            setStepsError(error instanceof Error ? error.message : "Failed to load thread changes.");
          }).finally(() => {
            if (!cancelled) {
              setStepsLoading(false);
            }
          });

          return () => {
            cancelled = true;
          };
        }, [apiKey, backendUrl, client, historyHeaders, threadId]);

        useEffect(() => {
          if (sortedSteps.length === 0) {
            setSelectedStepId("");
            return;
          }

          if (selectedStepId && sortedSteps.some((step) => step.id === selectedStepId)) {
            return;
          }

          const preferredStep = getPreferredHistoryStep(sortedSteps);
          setSelectedStepId(preferredStep?.id || "");
        }, [selectedStepId, sortedSteps]);

        useEffect(() => {
          let cancelled = false;

          setStepFiles([]);
          setStepDiffSummary(null);
          setStepDataError("");
          setSelectedFilePath("");

          if (!selectedStep) {
            setStepDataLoading(false);
            return () => {
              cancelled = true;
            };
          }

          if (!selectedStep.snapshotAfterId && !selectedStep.snapshotBeforeId) {
            setStepDataLoading(false);
            return () => {
              cancelled = true;
            };
          }

          setStepDataLoading(true);

          Promise.allSettled([
            client.listThreadStepFiles({
              backendUrl,
              threadId,
              stepId: selectedStep.id,
              headers: historyHeaders,
            }),
            client.getThreadStepDiff({
              backendUrl,
              threadId,
              stepId: selectedStep.id,
              headers: historyHeaders,
            }),
          ]).then((results) => {
            if (cancelled) return;
            const [filesResult, diffResult] = results;
            const nextFiles = filesResult.status === "fulfilled" && Array.isArray(filesResult.value)
              ? [...filesResult.value].sort((left, right) => {
                  if (left.type !== right.type) {
                    return left.type === "directory" ? -1 : 1;
                  }
                  return left.path.localeCompare(right.path);
                })
              : [];
            setStepFiles(nextFiles);
            setStepDiffSummary(diffResult.status === "fulfilled" ? diffResult.value : null);

            if (filesResult.status === "rejected" && diffResult.status === "rejected") {
              setStepDataError("Failed to load step state.");
            }
          }).finally(() => {
            if (!cancelled) {
              setStepDataLoading(false);
            }
          });

          return () => {
            cancelled = true;
          };
        }, [backendUrl, client, historyHeaders, selectedStep, threadId]);

        useEffect(() => {
          const currentFileStillExists = stepFiles.some((entry) => entry.type === "file" && historyPathsMatch(entry.path, selectedFilePath));
          if (currentFileStillExists) {
            return;
          }
          setSelectedFilePath(getPreferredFilePath(stepFiles, changedPaths));
        }, [changedPaths, selectedFilePath, stepFiles]);

        useEffect(() => {
          let cancelled = false;

          setSelectedFileContent("");
          setSelectedFileDiff(null);
          setFilePreviewError("");

          if (!selectedStep || !selectedFileEntry || selectedFileEntry.type !== "file") {
            setFilePreviewLoading(false);
            return () => {
              cancelled = true;
            };
          }

          setFilePreviewLoading(true);

          Promise.allSettled([
            client.getThreadStepFile({
              backendUrl,
              threadId,
              stepId: selectedStep.id,
              path: selectedFileEntry.path,
              headers: historyHeaders,
            }),
            client.getThreadStepDiff({
              backendUrl,
              threadId,
              stepId: selectedStep.id,
              path: selectedFileEntry.path,
              headers: historyHeaders,
            }),
          ]).then((results) => {
            if (cancelled) return;
            const [fileResult, diffResult] = results;

            if (fileResult.status === "fulfilled") {
              setSelectedFileContent(typeof fileResult.value?.content === "string" ? fileResult.value.content : "");
            }

            if (diffResult.status === "fulfilled") {
              setSelectedFileDiff(diffResult.value);
            }

            if (fileResult.status === "rejected" && diffResult.status === "rejected") {
              setFilePreviewError("Failed to load file preview for this step.");
            }
          }).finally(() => {
            if (!cancelled) {
              setFilePreviewLoading(false);
            }
          });

          return () => {
            cancelled = true;
          };
        }, [backendUrl, client, historyHeaders, selectedFileEntry, selectedStep, threadId]);

        const changedPathSet = useMemo(() => new Set(uniqueHistoryPaths(changedPaths)), [changedPaths]);
        const selectedFileChanged = selectedFileEntry ? changedPathSet.has(normalizeHistoryPath(selectedFileEntry.path)) : false;
        const detailTitle = selectedFileEntry?.path || selectedStep?.title || "Changes";
        const additions = Number.isFinite(selectedFileDiff?.additions) ? selectedFileDiff.additions : Number.isFinite(stepDiffSummary?.additions) ? stepDiffSummary.additions : 0;
        const deletions = Number.isFinite(selectedFileDiff?.deletions) ? selectedFileDiff.deletions : Number.isFinite(stepDiffSummary?.deletions) ? stepDiffSummary.deletions : 0;
        const diffPreview = typeof selectedFileDiff?.diff === "string" && selectedFileDiff.diff.trim()
          ? selectedFileDiff.diff
          : selectedFileChanged
            ? "No stored diff is available for this file at the selected step."
            : "This file did not change in the selected step.";
        const filePreview = typeof selectedFileContent === "string" && selectedFileContent.length > 0
          ? selectedFileContent
          : selectedFileEntry && selectedFileEntry.type === "file"
            ? "No file content is available for the selected step."
            : "Select a file to inspect its content at this step.";

        if (!threadId) {
          return React.createElement("div", { className: "changes-view" },
            React.createElement("section", { className: "changes-panel", style: { gridColumn: "1 / -1" } },
              React.createElement("div", { className: "changes-empty-state" }, "Select a thread to inspect its changes.")
            )
          );
        }

        return React.createElement("div", { className: "changes-view" },
          React.createElement("section", { className: "changes-panel" },
            React.createElement("div", { className: "changes-panel-header" },
              React.createElement("div", { className: "changes-panel-title" }, "Thread Steps"),
              React.createElement("div", { className: "changes-panel-subtitle" }, sortedSteps.length > 0 ? sortedSteps.length + " steps" : "")
            ),
            React.createElement("div", { className: "changes-panel-body" },
              stepsLoading
                ? React.createElement("div", { className: "changes-loading-state" }, "Loading thread steps…")
                : stepsError
                  ? React.createElement("div", { className: "changes-empty-state" }, stepsError)
                  : sortedSteps.length === 0
                    ? React.createElement("div", { className: "changes-empty-state" }, "No step history has been recorded for this thread yet.")
                    : React.createElement("div", { className: "changes-step-list" },
                        sortedSteps.map((step) => {
                          const stepChangedCount = extractStepChangedPaths(step).length;
                          return React.createElement("button", {
                            key: step.id,
                            type: "button",
                            className: "changes-step-item" + (selectedStepId === step.id ? " is-active" : ""),
                            onClick: () => setSelectedStepId(step.id),
                          },
                            React.createElement("div", { className: "changes-step-main" },
                              React.createElement("div", { className: "changes-step-title" }, step.title || step.stepKind || "Step"),
                              React.createElement("div", { className: "changes-step-meta" }, formatHistoryTimestamp(step.createdAt))
                            ),
                            React.createElement("div", { className: "changes-step-sequence" }, stepChangedCount > 0 ? stepChangedCount + " files" : "#" + step.sequence)
                          );
                        })
                      )
            )
          ),
          React.createElement("section", { className: "changes-panel" },
            React.createElement("div", { className: "changes-panel-header" },
              React.createElement("div", { className: "changes-panel-title" }, "Files at Step"),
              React.createElement("div", { className: "changes-panel-subtitle" }, selectedStep ? "Step #" + selectedStep.sequence : threadTitle)
            ),
            React.createElement("div", { className: "changes-panel-body" },
              stepDataLoading
                ? React.createElement("div", { className: "changes-loading-state" }, "Loading file state…")
                : stepDataError
                  ? React.createElement("div", { className: "changes-empty-state" }, stepDataError)
                  : selectedStep && !selectedStep.snapshotAfterId && !selectedStep.snapshotBeforeId
                    ? React.createElement("div", { className: "changes-empty-state" }, "This step does not carry a file-state snapshot.")
                    : stepFiles.length === 0
                      ? React.createElement("div", { className: "changes-empty-state" }, "No files are available for the selected step.")
                      : React.createElement("div", { className: "changes-file-list" },
                          stepFiles.map((entry) => {
                            const isChanged = changedPathSet.has(normalizeHistoryPath(entry.path));
                            return React.createElement("button", {
                              key: entry.path,
                              type: "button",
                              className: "changes-file-item" + (selectedFileEntry && historyPathsMatch(selectedFileEntry.path, entry.path) ? " is-active" : ""),
                              onClick: () => setSelectedFilePath(entry.path),
                            },
                              React.createElement("div", { className: "changes-file-main" },
                                React.createElement("div", { className: "changes-file-path" }, entry.path),
                                React.createElement("div", { className: "changes-file-meta" }, entry.type === "directory" ? "Directory" : (entry.size ?? 0) > 0 ? entry.size + " bytes" : "File")
                              ),
                              React.createElement("div", {
                                className:
                                  "changes-file-badge"
                                  + (entry.type === "directory" ? " is-directory" : "")
                                  + (isChanged ? " is-changed" : "")
                              }, entry.type === "directory" ? "Dir" : isChanged ? "Changed" : "File")
                            );
                          })
                        )
            )
          ),
          React.createElement("section", { className: "changes-panel" },
            React.createElement("div", { className: "changes-detail-header" },
              React.createElement("div", { className: "changes-detail-path-row" },
                React.createElement("div", { className: "changes-detail-path" }, detailTitle),
                React.createElement("div", { className: "changes-diff-stats" },
                  React.createElement("span", { className: "changes-diff-stat additions" }, "+" + additions),
                  React.createElement("span", { className: "changes-diff-stat deletions" }, "-" + deletions)
                )
              ),
              React.createElement("div", { className: "changes-detail-meta" },
                selectedStep
                  ? React.createElement("span", { className: "changes-detail-pill" }, "Step #" + selectedStep.sequence)
                  : null,
                selectedStep
                  ? React.createElement("span", { className: "changes-detail-pill" }, formatHistoryTimestamp(selectedStep.createdAt))
                  : null,
                React.createElement("span", { className: "changes-detail-pill" }, threadTitle)
              )
            ),
            React.createElement("div", { className: "changes-panel-body" },
              filePreviewLoading
                ? React.createElement("div", { className: "changes-loading-state" }, "Loading preview…")
                : filePreviewError
                  ? React.createElement("div", { className: "changes-empty-state" }, filePreviewError)
                  : React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "changes-detail-section" },
                        React.createElement("div", { className: "changes-detail-section-header" }, "Diff"),
                        React.createElement("pre", {
                          className: "changes-code-block" + (selectedFileEntry ? "" : " is-empty")
                        }, selectedFileEntry && selectedFileEntry.type === "file" ? diffPreview : "Select a file to inspect its diff at the selected step.")
                      ),
                      React.createElement("div", { className: "changes-detail-section" },
                        React.createElement("div", { className: "changes-detail-section-header" }, "File at this step"),
                        React.createElement("pre", {
                          className: "changes-code-block" + (selectedFileEntry && selectedFileEntry.type === "file" ? "" : " is-empty")
                        }, selectedFileEntry && selectedFileEntry.type === "file" ? filePreview : "Select a file to inspect its full content at the selected step.")
                      )
                    )
            )
          )
        );
      }

      function DemoApp() {
        const [sidebarOpen, setSidebarOpen] = useState(true);
        const [settingsOpen, setSettingsOpen] = useState(false);
        const [threadListMode, setThreadListMode] = useState("threads");
        const [runnerRenderKey, setRunnerRenderKey] = useState(0);
        const [threadDisplayCount, setThreadDisplayCount] = useState(10);
        const [upstreamUrl, setUpstreamUrl] = useState(() => {
          try {
            return localStorage.getItem("runner_demo_upstream")
              || sessionStorage.getItem("runner_demo_upstream")
              || "https://api.computer-agents.com";
          } catch {
            return "https://api.computer-agents.com";
          }
        });
        const [apiKey, setApiKey] = useState(() => localStorage.getItem("runner_demo_api_key") || "");
        const [projectId, setProjectId] = useState(() => {
          try {
            return localStorage.getItem("runner_demo_project_id") || "";
          } catch {
            return "";
          }
        });
        const [environmentId, setEnvironmentId] = useState("");
        const [agentId, setAgentId] = useState("");
        const [currentThreadId, setCurrentThreadId] = useState("");
        const [contentMode, setContentMode] = useState("chat");
        const [computerAgentsMode, setComputerAgentsMode] = useState(() => {
          try {
            return localStorage.getItem("runner_demo_computer_agents_mode") === "true";
          } catch {
            return false;
          }
        });
        const [realThreads, setRealThreads] = useState([]);
        const [isThreadsLoading, setIsThreadsLoading] = useState(false);
        const [realThreadsHasMore, setRealThreadsHasMore] = useState(false);
        const [realAgents, setRealAgents] = useState([]);
        const [realEnvironments, setRealEnvironments] = useState([]);
        const [githubStatus, setGithubStatus] = useState(() => readCachedIntegrationStatus("github"));
        const [notionStatus, setNotionStatus] = useState(() => readCachedIntegrationStatus("notion"));
        const [googleDriveStatus, setGoogleDriveStatus] = useState(() => readCachedIntegrationStatus("google-drive"));
        const [oneDriveStatus, setOneDriveStatus] = useState(() => readCachedIntegrationStatus("one-drive"));
        const [notionDatabases, setNotionDatabases] = useState([]);
        const [statusIndicatorItems, setStatusIndicatorItems] = useState([]);
        const [dismissedStatusIndicatorIds, setDismissedStatusIndicatorIds] = useState([]);

        const proxyBackendBase = window.location.origin + "/api/real";
        const demoAgents = [
          { id: "agent_default", name: "Developer" },
          { id: "agent_research", name: "Research Agent" },
          { id: "agent_growth", name: "Growth Agent" }
        ];
        const demoEnvironments = [
          { id: "env_default", name: "Default", isDefault: true },
          { id: "env_staging", name: "Staging" },
          { id: "env_marketing", name: "Marketing Site" }
        ];
        const demoSkills = [
          { id: "image_generation", name: "Image Generation", enabled: true },
          { id: "web_search", name: "Web Search", enabled: true },
          { id: "research", name: "Research", enabled: true },
          { id: "pdf", name: "PDF Processing", enabled: true },
          { id: "frontend_design", name: "Frontend Design", enabled: true },
          { id: "pptx", name: "PowerPoint/PPTX", enabled: true },
          { id: "memory", name: "Memory", enabled: true }
        ];
        const hasApiKey = apiKey.trim().length > 0;

        function buildAiosLoginUrl() {
          const loginUrl = new URL("/login", "http://localhost:3000");
          loginUrl.searchParams.set("redirect", window.location.href);
          return loginUrl.toString();
        }

        function createGithubRepoFolderId(repoFullName) {
          return "github-repo:" + repoFullName;
        }

        function createGithubNodeId(repoFullName, path) {
          return "github-node:" + repoFullName + ":" + (path || "");
        }

        function parseGithubFolderId(folderId) {
          if (!folderId || folderId === "root") {
            return { repoFullName: "", path: "", isRoot: true };
          }

          if (folderId.startsWith("github-repo:")) {
            return {
              repoFullName: folderId.slice("github-repo:".length),
              path: "",
              isRoot: false,
            };
          }

          if (folderId.startsWith("github-node:")) {
            const value = folderId.slice("github-node:".length);
            const separatorIndex = value.indexOf(":");
            if (separatorIndex === -1) {
              return { repoFullName: value, path: "", isRoot: false };
            }
            return {
              repoFullName: value.slice(0, separatorIndex),
              path: value.slice(separatorIndex + 1),
              isRoot: false,
            };
          }

          return { repoFullName: "", path: "", isRoot: true };
        }

        async function refreshGithubStatus(options = {}) {
          const { clearPendingOnFailure = false } = options;
          try {
            const response = await fetch("/api/aios/github/user", {
              method: "GET",
              credentials: "include",
            });

            if (!response.ok) {
              setGithubStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("github");
              }
              return;
            }

            const data = await response.json();
            setGithubStatus({ connected: !!data.connected, profile: data.profile });
          } catch {
            setGithubStatus({ connected: false });
            if (clearPendingOnFailure) {
              removePendingStatusIndicatorId("github");
            }
          }
        }

        async function refreshGoogleDriveStatus(options = {}) {
          const { clearPendingOnFailure = false } = options;
          try {
            const response = await fetch("/api/aios/google-drive/user", {
              method: "GET",
              credentials: "include",
            });

            if (!response.ok) {
              setGoogleDriveStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("google-drive");
              }
              return;
            }

            const data = await response.json();
            setGoogleDriveStatus({ connected: !!data.connected, profile: data.profile });
          } catch {
            setGoogleDriveStatus({ connected: false });
            if (clearPendingOnFailure) {
              removePendingStatusIndicatorId("google-drive");
            }
          }
        }

        async function refreshOneDriveStatus(options = {}) {
          const { clearPendingOnFailure = false } = options;
          try {
            const response = await fetch("/api/aios/onedrive/user", {
              method: "GET",
              credentials: "include",
            });

            if (!response.ok) {
              setOneDriveStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("one-drive");
              }
              return;
            }

            const data = await response.json();
            setOneDriveStatus({ connected: !!data.connected, profile: data.profile });
          } catch {
            setOneDriveStatus({ connected: false });
            if (clearPendingOnFailure) {
              removePendingStatusIndicatorId("one-drive");
            }
          }
        }

        async function refreshNotionStatus(options = {}) {
          const { clearPendingOnFailure = false } = options;
          try {
            const response = await fetch("/api/aios/notion/user", {
              method: "GET",
              credentials: "include",
            });

            if (!response.ok) {
              setNotionStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("notion");
              }
              return;
            }

            const data = await response.json();
            setNotionStatus({
              connected: !!data.connected,
              profile: {
                ...(data.profile || {}),
                workspaceName: data.workspace?.name || "",
              },
            });
          } catch {
            setNotionStatus({ connected: false });
            if (clearPendingOnFailure) {
              removePendingStatusIndicatorId("notion");
            }
          }
        }

        async function handleGoogleDriveAuthConnect() {
          try {
            addPendingStatusIndicatorId("google-drive");
            const response = await fetch("/api/aios/google-drive/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                redirectTo: window.location.href,
              }),
            });

            if (response.status === 401) {
              window.location.href = buildAiosLoginUrl();
              return;
            }

            if (!response.ok) {
              removePendingStatusIndicatorId("google-drive");
              const data = await response.json().catch(() => ({}));
              console.error("Google Drive login failed:", data.error || response.status);
              return;
            }

            const data = await response.json();
            if (!data.authUrl) {
              removePendingStatusIndicatorId("google-drive");
              console.error("Google Drive auth URL is missing.");
              return;
            }
            window.location.href = data.authUrl;
          } catch (error) {
            removePendingStatusIndicatorId("google-drive");
            console.error("Failed to initiate Google Drive auth:", error);
          }
        }

        async function handleGoogleDriveAuthDisconnect() {
          await fetch("/api/aios/google-drive/disconnect", {
            method: "POST",
            credentials: "include",
          });
          removePendingStatusIndicatorId("google-drive");
          setGoogleDriveStatus({ connected: false });
          setStatusIndicatorItems((current) => current.filter((item) => item.id !== "google-drive"));
        }

        async function handleGithubAuthConnect() {
          try {
            addPendingStatusIndicatorId("github");
            const response = await fetch("/api/aios/github/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                redirectTo: window.location.href,
              }),
            });

            if (response.status === 401) {
              window.location.href = buildAiosLoginUrl();
              return;
            }

            if (!response.ok) {
              removePendingStatusIndicatorId("github");
              const data = await response.json().catch(() => ({}));
              console.error("GitHub login failed:", data.error || response.status);
              return;
            }

            const data = await response.json();
            if (!data.authUrl) {
              removePendingStatusIndicatorId("github");
              console.error("GitHub auth URL is missing.");
              return;
            }
            window.location.href = data.authUrl;
          } catch (error) {
            removePendingStatusIndicatorId("github");
            console.error("Failed to initiate GitHub auth:", error);
          }
        }

        async function handleGithubAuthDisconnect() {
          await fetch("/api/aios/github/disconnect", {
            method: "POST",
            credentials: "include",
          });
          removePendingStatusIndicatorId("github");
          setGithubStatus({ connected: false });
          setStatusIndicatorItems((current) => current.filter((item) => item.id !== "github"));
        }

        async function handleOneDriveAuthConnect() {
          try {
            addPendingStatusIndicatorId("one-drive");
            const response = await fetch("/api/aios/onedrive/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                redirectTo: window.location.href,
              }),
            });

            if (response.status === 401) {
              window.location.href = buildAiosLoginUrl();
              return;
            }

            if (!response.ok) {
              removePendingStatusIndicatorId("one-drive");
              const data = await response.json().catch(() => ({}));
              console.error("OneDrive login failed:", data.error || response.status);
              return;
            }

            const data = await response.json();
            if (!data.authUrl) {
              removePendingStatusIndicatorId("one-drive");
              console.error("OneDrive auth URL is missing.");
              return;
            }
            window.location.href = data.authUrl;
          } catch (error) {
            removePendingStatusIndicatorId("one-drive");
            console.error("Failed to initiate OneDrive auth:", error);
          }
        }

        async function handleOneDriveAuthDisconnect() {
          await fetch("/api/aios/onedrive/disconnect", {
            method: "POST",
            credentials: "include",
          });
          removePendingStatusIndicatorId("one-drive");
          setOneDriveStatus({ connected: false });
          setStatusIndicatorItems((current) => current.filter((item) => item.id !== "one-drive"));
        }

        async function handleNotionAuthConnect() {
          try {
            addPendingStatusIndicatorId("notion");
            const response = await fetch("/api/aios/notion/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                redirectTo: window.location.href,
              }),
            });

            if (response.status === 401) {
              window.location.href = buildAiosLoginUrl();
              return;
            }

            if (!response.ok) {
              removePendingStatusIndicatorId("notion");
              const data = await response.json().catch(() => ({}));
              console.error("Notion login failed:", data.error || response.status);
              return;
            }

            const data = await response.json();
            if (!data.authUrl) {
              removePendingStatusIndicatorId("notion");
              console.error("Notion auth URL is missing.");
              return;
            }
            window.location.href = data.authUrl;
          } catch (error) {
            removePendingStatusIndicatorId("notion");
            console.error("Failed to initiate Notion auth:", error);
          }
        }

        async function handleNotionAuthDisconnect() {
          await fetch("/api/aios/notion/disconnect", {
            method: "POST",
            credentials: "include",
          });
          removePendingStatusIndicatorId("notion");
          setNotionStatus({ connected: false });
          setNotionDatabases([]);
          setStatusIndicatorItems((current) => current.filter((item) => item.id !== "notion"));
        }

        async function handleGoogleDriveFetchItems(folderId) {
          const response = await fetch("/api/aios/google-drive/files?folderId=" + encodeURIComponent(folderId), {
            method: "GET",
            credentials: "include",
          });

          const data = await response.json();
          if (!response.ok) {
            if (isUnauthorizedStatus(response.status)) {
              setGoogleDriveStatus({ connected: false });
            }
            throw new Error(data.error || "Failed to fetch Google Drive files");
          }

          return (data.files || []).map((file) => ({
            id: file.id,
            name: file.name,
            path: file.id,
            isFolder: file.isFolder || file.mimeType === "application/vnd.google-apps.folder",
            size: file.size,
            modifiedTime: file.modifiedTime,
            createdTime: file.createdTime,
            mimeType: file.mimeType,
            previewUrl: file.thumbnailLink || undefined,
          }));
        }

        async function handleOneDriveFetchItems(folderId) {
          const response = await fetch("/api/aios/onedrive/files?folderId=" + encodeURIComponent(folderId), {
            method: "GET",
            credentials: "include",
          });

          const data = await response.json();
          if (!response.ok) {
            if (isUnauthorizedStatus(response.status)) {
              setOneDriveStatus({ connected: false });
            }
            throw new Error(data.error || "Failed to fetch OneDrive files");
          }

          return (data.files || []).map((file) => ({
            id: file.id,
            name: file.name,
            path: file.id,
            isFolder: !!file.isFolder,
            size: file.size,
            modifiedTime: file.modifiedTime,
            createdTime: file.createdTime,
            mimeType: file.mimeType,
            previewUrl: file.thumbnailLink || undefined,
          }));
        }

        async function handleGithubFetchItems(folderId) {
          const parsedFolder = parseGithubFolderId(folderId);

          if (parsedFolder.isRoot) {
            const response = await fetch("/api/aios/github/repos?per_page=100", {
              method: "GET",
              credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setGithubStatus({ connected: false });
              }
              throw new Error(data.error || "Failed to fetch GitHub repositories");
            }

            return (data.repos || []).map((repo) => ({
              id: createGithubRepoFolderId(repo.full_name),
              name: repo.name,
              path: "",
              isFolder: true,
              repoFullName: repo.full_name,
              ref: repo.default_branch || undefined,
            }));
          }

          const response = await fetch(
            "/api/aios/github/repos/" + parsedFolder.repoFullName + "/contents" + (parsedFolder.path ? "?path=" + encodeURIComponent(parsedFolder.path) : ""),
            {
              method: "GET",
              credentials: "include",
            }
          );

          const data = await response.json();
          if (!response.ok) {
            if (isUnauthorizedStatus(response.status)) {
              setGithubStatus({ connected: false });
            }
            throw new Error(data.error || "Failed to fetch GitHub files");
          }

          const items = Array.isArray(data) ? data : data.contents || [];
          return items.map((item) => ({
            id: item.type === "dir" ? createGithubNodeId(parsedFolder.repoFullName, item.path) : createGithubNodeId(parsedFolder.repoFullName, item.path),
            name: item.name,
            path: item.path,
            isFolder: item.type === "dir",
            size: item.size || 0,
            mimeType: undefined,
            repoFullName: parsedFolder.repoFullName,
            ref: data.ref || undefined,
          }));
        }

        async function handleGithubFetchFileContent(file) {
          if (!file.repoFullName || !file.path) {
            throw new Error("Missing GitHub file metadata");
          }

          const response = await fetch(
            "/api/aios/github/repos/" + file.repoFullName + "/download?path=" + encodeURIComponent(file.path),
            {
              method: "GET",
              credentials: "include",
            }
          );

          const data = await response.json();
          if (!response.ok) {
            if (isUnauthorizedStatus(response.status)) {
              setGithubStatus({ connected: false });
            }
            throw new Error(data.error || "Failed to load GitHub file preview");
          }

          return {
            content: data.content || "",
            mimeType: data.mimeType,
            encoding: data.encoding || "base64",
          };
        }

        async function handleGoogleDriveManageAccess() {
          const response = await fetch("/api/aios/google-drive/picker-config", {
            method: "GET",
            credentials: "include",
          });

          const config = await response.json();
          if (!response.ok) {
            if (isUnauthorizedStatus(response.status)) {
              setGoogleDriveStatus({ connected: false });
            }
            throw new Error(config.error || "Failed to open Google Drive picker");
          }

          await openGoogleDrivePicker({
            accessToken: config.accessToken,
            apiKey: config.apiKey,
            appId: config.appId,
            multiSelect: true,
            includeFolders: true,
            selectFolderEnabled: true,
            title: "Select files to share with Testbase",
          });
        }

        const handleNotionFetchDatabases = useCallback(async function handleNotionFetchDatabases() {
          const response = await fetch("/api/aios/notion/databases", {
            method: "GET",
            credentials: "include",
          });

          const data = await response.json();
          if (!response.ok) {
            if (isUnauthorizedStatus(response.status)) {
              setNotionStatus({ connected: false });
            }
            throw new Error(data.error || "Failed to fetch Notion databases");
          }

          const databases = data.databases || [];
          setNotionDatabases(databases);
          return databases;
        }, []);

        const resolvedUpstreamUrl = useMemo(() => {
          const trimmed = String(upstreamUrl || "").trim();
          return trimmed || "https://api.computer-agents.com";
        }, [upstreamUrl]);

        const handleFetchCustomSkills = useCallback(async function handleFetchCustomSkills() {
          const normalizeSkills = (items) => (items || [])
            .filter((skill) => !skill.isDefault && !skill.isSystem)
            .map((skill) => ({
              id: skill.id,
              name: skill.name,
              description: skill.description || "",
              icon: typeof skill.icon === "string" ? skill.icon : null,
              isCustom: true,
              enabled: true,
            }));

          const requestUrl = new URL("/api/playground/custom-skills", window.location.origin);
          if (projectId.trim()) {
            requestUrl.searchParams.set("projectId", projectId.trim());
          }

          const response = await fetch(requestUrl.toString(), {
            method: "GET",
            credentials: "include",
            headers: {
              ...(apiKey.trim() ? { "X-API-Key": apiKey.trim() } : {}),
              "X-Runner-Upstream-Url": resolvedUpstreamUrl,
            },
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || data.error || "Failed to fetch custom skills");
          }

          return normalizeSkills(data.data || data.skills || []);
        }, [apiKey, projectId, resolvedUpstreamUrl]);

        useEffect(() => {
          const pendingIds = readPendingStatusIndicatorIds();
          if (pendingIds.includes("github")) {
            void refreshGithubStatus({ clearPendingOnFailure: true });
          }
          if (pendingIds.includes("notion")) {
            void refreshNotionStatus({ clearPendingOnFailure: true });
          }
          if (pendingIds.includes("google-drive")) {
            void refreshGoogleDriveStatus({ clearPendingOnFailure: true });
          }
          if (pendingIds.includes("one-drive")) {
            void refreshOneDriveStatus({ clearPendingOnFailure: true });
          }
        }, []);

        useEffect(() => {
          if (!githubStatus.connected) {
            return;
          }

          const pendingIds = readPendingStatusIndicatorIds();
          if (!pendingIds.includes("github")) {
            return;
          }

          const nextItem = buildStatusIndicatorItem("github", githubStatus.profile);
          removePendingStatusIndicatorId("github");
          if (!nextItem) {
            return;
          }

          setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "github"));
          setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
        }, [githubStatus]);

        useEffect(() => {
          try {
            localStorage.setItem("runner_demo_api_key", apiKey);
          } catch {}
        }, [apiKey]);

        useEffect(() => {
          try {
            localStorage.setItem("runner_demo_upstream", upstreamUrl);
          } catch {}
          try {
            sessionStorage.setItem("runner_demo_upstream", upstreamUrl);
          } catch {}
        }, [upstreamUrl]);

        useEffect(() => {
          try {
            localStorage.setItem("runner_demo_project_id", projectId);
          } catch {}
        }, [projectId]);

        useEffect(() => {
          writeCachedIntegrationStatus("github", githubStatus);
        }, [githubStatus]);

        useEffect(() => {
          writeCachedIntegrationStatus("notion", notionStatus);
        }, [notionStatus]);

        useEffect(() => {
          writeCachedIntegrationStatus("google-drive", googleDriveStatus);
        }, [googleDriveStatus]);

        useEffect(() => {
          writeCachedIntegrationStatus("one-drive", oneDriveStatus);
        }, [oneDriveStatus]);

        useEffect(() => {
          try {
            localStorage.setItem("runner_demo_computer_agents_mode", computerAgentsMode ? "true" : "false");
          } catch {}
        }, [computerAgentsMode]);

        useEffect(() => {
          if (!notionStatus.connected) {
            return;
          }

          const pendingIds = readPendingStatusIndicatorIds();
          if (!pendingIds.includes("notion")) {
            return;
          }

          const nextItem = buildStatusIndicatorItem("notion", notionStatus.profile);
          removePendingStatusIndicatorId("notion");
          if (!nextItem) {
            return;
          }

          setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "notion"));
          setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
        }, [notionStatus]);

        useEffect(() => {
          if (!googleDriveStatus.connected) {
            return;
          }

          const pendingIds = readPendingStatusIndicatorIds();
          if (!pendingIds.includes("google-drive")) {
            return;
          }

          const nextItem = buildStatusIndicatorItem("google-drive", googleDriveStatus.profile);
          removePendingStatusIndicatorId("google-drive");
          if (!nextItem) {
            return;
          }

          setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "google-drive"));
          setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
        }, [googleDriveStatus]);

        useEffect(() => {
          if (!oneDriveStatus.connected) {
            return;
          }

          const pendingIds = readPendingStatusIndicatorIds();
          if (!pendingIds.includes("one-drive")) {
            return;
          }

          const nextItem = buildStatusIndicatorItem("one-drive", oneDriveStatus.profile);
          removePendingStatusIndicatorId("one-drive");
          if (!nextItem) {
            return;
          }

          setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "one-drive"));
          setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
        }, [oneDriveStatus]);

        const demoComputerAgents = useMemo(() => ({
          github: {
            connected: githubStatus.connected,
            onConnect: handleGithubAuthConnect,
            onDisconnect: handleGithubAuthDisconnect,
            fetchItems: handleGithubFetchItems,
            fetchFileContent: handleGithubFetchFileContent,
          },
          notion: {
            connected: notionStatus.connected,
            databases: notionDatabases,
            onConnect: handleNotionAuthConnect,
            onDisconnect: handleNotionAuthDisconnect,
            fetchDatabases: handleNotionFetchDatabases,
          },
          googleDrive: {
            connected: googleDriveStatus.connected,
            rootLabel: "My Drive",
            onConnect: handleGoogleDriveAuthConnect,
            onDisconnect: handleGoogleDriveAuthDisconnect,
            onManageAccess: handleGoogleDriveManageAccess,
            fetchItems: handleGoogleDriveFetchItems
          },
          oneDrive: {
            connected: oneDriveStatus.connected,
            rootLabel: "OneDrive",
            onConnect: handleOneDriveAuthConnect,
            onDisconnect: handleOneDriveAuthDisconnect,
            fetchItems: handleOneDriveFetchItems
          },
          workspace: {
            items: [
              { id: "ws_file_runner", name: "src/react/runner-chat.tsx", mimeType: "text/typescript" },
              { id: "ws_file_css", name: "src/react/runner-chat.css", mimeType: "text/css" },
              { id: "ws_file_demo", name: "examples/demo-server.mjs", mimeType: "text/javascript" }
            ]
          },
          schedule: {
            enabled: false,
            presets: [
              { id: "daily", label: "Every day", cron: "0 9 * * *" },
              { id: "weekdays", label: "Every weekday", cron: "0 9 * * 1-5" },
              { id: "weekly", label: "Every week", cron: "0 9 * * 1" }
            ]
          }
        }), [githubStatus.connected, googleDriveStatus.connected, hasApiKey, notionDatabases, notionStatus.connected, oneDriveStatus.connected]);

        const requestHeaders = useMemo(() => {
          return {
            "X-Runner-Upstream-Url": resolvedUpstreamUrl,
          };
        }, [resolvedUpstreamUrl]);
        const runtimeEnvironments = useMemo(() => {
          if (hasApiKey) {
            return realEnvironments;
          }
          return demoEnvironments;
        }, [demoEnvironments, hasApiKey, realEnvironments]);
        const runtimeAgents = useMemo(() => {
          if (hasApiKey) {
            return realAgents;
          }
          return demoAgents;
        }, [demoAgents, hasApiKey, realAgents]);
        const resolvedEnvironmentId = useMemo(() => {
          if (environmentId.trim()) {
            return environmentId.trim();
          }
          if (hasApiKey && realEnvironments.length > 0) {
            const defaultEnvironment = realEnvironments.find((environment) => environment.isDefault) || realEnvironments[0];
            return defaultEnvironment?.id || "";
          }
          return hasApiKey ? "" : computerAgentsMode ? "env_default" : "";
        }, [computerAgentsMode, environmentId, hasApiKey, realEnvironments]);
        const resolvedAgentId = useMemo(() => {
          if (agentId.trim()) {
            return agentId.trim();
          }
          if (hasApiKey && realAgents.length > 0) {
            const defaultAgent = realAgents.find((agent) => agent.isDefault) || realAgents[0];
            return defaultAgent?.id || "";
          }
          return hasApiKey ? "" : computerAgentsMode ? "agent_default" : "";
        }, [agentId, computerAgentsMode, hasApiKey, realAgents]);
        const speechToTextUrl = useMemo(() => {
          try {
            const url = new URL(resolvedUpstreamUrl);
            url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
            url.pathname = "/ws/speech-to-text";
            url.search = "";
            url.hash = "";
            return url.toString();
          } catch {
            return "";
          }
        }, [resolvedUpstreamUrl]);
        const threadFetchLimit = useMemo(() => Math.max(20, threadDisplayCount + 10), [threadDisplayCount]);

        const refreshThreads = useCallback(async function refreshThreads() {
          if (!hasApiKey) {
            setRealThreads([]);
            setRealThreadsHasMore(false);
            return;
          }

          setIsThreadsLoading(true);
          try {
            const response = await fetch(proxyBackendBase + "/threads?limit=" + encodeURIComponent(String(threadFetchLimit)), {
              method: "GET",
              headers: {
                "X-API-Key": apiKey.trim(),
                "X-Runner-Upstream-Url": resolvedUpstreamUrl,
              },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              setRealThreads([]);
              setRealThreadsHasMore(false);
              return;
            }

            const items = Array.isArray(data?.data) ? data.data : Array.isArray(data?.threads) ? data.threads : [];
            setRealThreads(items.map(normalizeThreadItem));
            setRealThreadsHasMore(Boolean(data?.has_more) || items.length >= threadFetchLimit);
          } catch {
            setRealThreads([]);
            setRealThreadsHasMore(false);
          } finally {
            setIsThreadsLoading(false);
          }
        }, [apiKey, hasApiKey, proxyBackendBase, resolvedUpstreamUrl, threadFetchLimit]);

        function handleNewThread() {
          setCurrentThreadId("");
          setContentMode("chat");
          setThreadListMode("threads");
          setRunnerRenderKey((current) => current + 1);
        }

        function handleThreadSelect(threadId) {
          if (!threadId) return;
          setCurrentThreadId(threadId);
          setThreadListMode("threads");
          setRunnerRenderKey((current) => current + 1);
        }

        function handleOpenSkillsShortcut() {
          window.open("http://localhost:3000/skills", "_blank", "noopener,noreferrer");
        }

        function renderSettingsFields() {
          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "settings-section" },
              React.createElement("h3", { className: "settings-section-title" }, "Runtime"),
              React.createElement("div", { className: "toggle-row" },
                React.createElement("div", { className: "toggle-copy" },
                  React.createElement("strong", null, "Computer Agents Mode"),
                  React.createElement("span", null, "Show the full aiOS-style task input bar.")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "toggle-button",
                  "data-active": computerAgentsMode ? "true" : "false",
                  onClick: () => setComputerAgentsMode((current) => !current),
                  "aria-pressed": computerAgentsMode ? "true" : "false"
                })
              ),
              React.createElement("div", { className: "field" },
                React.createElement("label", null, "Current Thread ID"),
                React.createElement("div", { className: "readonly-value" }, currentThreadId || "No thread yet")
              )
            ),
            React.createElement("div", { className: "settings-section" },
              React.createElement("h3", { className: "settings-section-title" }, "Real API Configuration"),
              React.createElement("div", { className: "field" },
                React.createElement("label", { htmlFor: "settings-upstream" }, "Upstream Backend URL"),
                React.createElement("input", {
                  id: "settings-upstream",
                  value: upstreamUrl,
                  onChange: (event) => {
                    const value = event.target.value;
                    setUpstreamUrl(value);
                  },
                  placeholder: "https://api.computer-agents.com"
                })
              ),
              React.createElement("div", { className: "field" },
                React.createElement("label", { htmlFor: "settings-apikey" }, "API Key"),
                React.createElement("input", {
                  id: "settings-apikey",
                  type: "password",
                  value: apiKey,
                  onChange: (event) => setApiKey(event.target.value),
                  placeholder: "Paste your real API key"
                })
              ),
              React.createElement("div", { className: "field" },
                React.createElement("label", { htmlFor: "settings-project-id" }, "Project ID (for custom skills)"),
                React.createElement("input", {
                  id: "settings-project-id",
                  value: projectId,
                  onChange: (event) => setProjectId(event.target.value),
                  placeholder: "project_xxx"
                })
              ),
              React.createElement("div", { className: "field" },
                React.createElement("label", { htmlFor: "settings-environment" }, "Environment ID (optional)"),
                React.createElement("input", {
                  id: "settings-environment",
                  value: environmentId,
                  onChange: (event) => setEnvironmentId(event.target.value),
                  placeholder: "env_xxx"
                })
              ),
              React.createElement("div", { className: "field" },
                React.createElement("label", { htmlFor: "settings-agent" }, "Agent ID (optional)"),
                React.createElement("input", {
                  id: "settings-agent",
                  value: agentId,
                  onChange: (event) => setAgentId(event.target.value),
                  placeholder: "agent_xxx"
                })
              ),
              React.createElement("div", { className: "hint" },
                "This page renders the actual React RunnerChat component from the SDK.",
                React.createElement("br"),
                "Calls are proxied through ", React.createElement("code", null, "/api/real/*"), " to avoid local CORS issues while still hitting your real backend.",
                React.createElement("br"),
                computerAgentsMode
                  ? "The input bar is currently using the SDK's full computer-agents mode."
                  : "The input bar is currently using the SDK's minimal mode."
              )
            )
          );
        }

        useEffect(() => {
          if (!hasApiKey) {
            setRealEnvironments([]);
            return;
          }

          const controller = new AbortController();
          fetch(proxyBackendBase + "/environments", {
            method: "GET",
            headers: {
              "X-API-Key": apiKey.trim(),
              "X-Runner-Upstream-Url": resolvedUpstreamUrl,
            },
            signal: controller.signal,
          })
            .then(async (response) => {
              const parseResponse = async (input) => {
                const text = await input.text();
                let parsed = {};
                try {
                  parsed = text ? JSON.parse(text) : {};
                } catch {
                  parsed = {};
                }
                return parsed;
              };

              if (response.ok) {
                const parsed = await parseResponse(response);
                const items = Array.isArray(parsed?.data) ? parsed.data : [];
                setRealEnvironments(items.map((environment) => ({
                  id: environment.id,
                  name: environment.name,
                  isDefault: Boolean(environment.isDefault),
                })));
                return;
              }

              const fallbackResponse = await fetch(proxyBackendBase + "/environments/default", {
                method: "GET",
                headers: {
                  "X-API-Key": apiKey.trim(),
                  "X-Runner-Upstream-Url": resolvedUpstreamUrl,
                },
                signal: controller.signal,
              });

              if (!fallbackResponse.ok) {
                setRealEnvironments([]);
                return;
              }

              const parsed = await parseResponse(fallbackResponse);
              const fallbackEnvironment = parsed?.id ? [{
                id: parsed.id,
                name: parsed.name || "Default",
                isDefault: true,
              }] : [];
              setRealEnvironments(fallbackEnvironment);
            })
            .catch(() => {
              if (!controller.signal.aborted) {
                setRealEnvironments([]);
              }
            });

          return () => controller.abort();
        }, [apiKey, hasApiKey, proxyBackendBase, resolvedUpstreamUrl]);

        useEffect(() => {
          if (!hasApiKey) {
            setRealAgents([]);
            return;
          }

          const controller = new AbortController();
          fetch(proxyBackendBase + "/agents", {
            method: "GET",
            headers: {
              "X-API-Key": apiKey.trim(),
              "X-Runner-Upstream-Url": resolvedUpstreamUrl,
            },
            signal: controller.signal,
          })
            .then(async (response) => {
              const text = await response.text();
              let parsed = {};
              try {
                parsed = text ? JSON.parse(text) : {};
              } catch {
                parsed = {};
              }

              if (!response.ok) {
                setRealAgents([]);
                return;
              }

              const items = Array.isArray(parsed?.data) ? parsed.data : [];
              setRealAgents(items.map((agent) => ({
                id: agent.id,
                name: agent.name,
                isDefault: Boolean(agent.isDefault),
              })));
            })
            .catch(() => {
              if (!controller.signal.aborted) {
                setRealAgents([]);
              }
            });

          return () => controller.abort();
        }, [apiKey, hasApiKey, proxyBackendBase, resolvedUpstreamUrl]);

        useEffect(() => {
          void refreshThreads();
        }, [refreshThreads]);

        useEffect(() => {
          setThreadDisplayCount(10);
        }, [threadListMode]);

        const baseThreadItems = useMemo(() => {
          const fallbackThreads = [...DEMO_RECENT_THREADS].map(normalizeThreadItem);
          const threads = realThreads.length > 0 ? realThreads : fallbackThreads;

          if (!currentThreadId || threads.some((thread) => thread.id === currentThreadId)) {
            return threads;
          }

          return [
            normalizeThreadItem({
              id: currentThreadId,
              title: "Current thread",
              messageCount: 0,
              createdAt: new Date().toISOString(),
            }),
            ...threads,
          ];
        }, [currentThreadId, realThreads]);

        const pinnedThreadItems = useMemo(() => {
          if (realThreads.length > 0) {
            return baseThreadItems.slice(0, 2);
          }
          return DEMO_PINNED_THREADS;
        }, [baseThreadItems, realThreads]);

        const scheduledThreadItems = useMemo(() => {
          if (realThreads.length > 0) {
            return realThreads.filter((thread) => thread.isScheduled);
          }
          return DEMO_SCHEDULED_THREADS.map(normalizeThreadItem);
        }, [realThreads]);

        const recentThreadItems = useMemo(() => {
          const pinnedIds = new Set(pinnedThreadItems.map((thread) => thread.id));
          return baseThreadItems.filter((thread) => !pinnedIds.has(thread.id));
        }, [baseThreadItems, pinnedThreadItems]);

        const selectedThreadTitle = useMemo(() => {
          if (!currentThreadId) {
            return "New Thread";
          }
          const allKnownThreads = [...pinnedThreadItems, ...baseThreadItems, ...scheduledThreadItems];
          const selectedThread = allKnownThreads.find((thread) => thread.id === currentThreadId);
          return selectedThread?.title || "Current thread";
        }, [baseThreadItems, currentThreadId, pinnedThreadItems, scheduledThreadItems]);

        const visibleThreadItems = threadListMode === "scheduled" ? scheduledThreadItems : recentThreadItems;
        const displayedThreadItems = visibleThreadItems.slice(0, threadDisplayCount);
        const hasMoreThreadItems =
          displayedThreadItems.length < visibleThreadItems.length ||
          (threadListMode === "threads" && realThreadsHasMore);

        return (
          React.createElement(React.Fragment, null,
            !sidebarOpen
              ? React.createElement("button", {
                  type: "button",
                  className: "sidebar-show-button",
                  onClick: () => setSidebarOpen(true),
                  "aria-label": "Show sidebar"
                }, React.createElement(PanelLeftOpen, { className: "sidebar-toggle-icon", strokeWidth: 1.75 }))
              : null,
            settingsOpen
              ? React.createElement("div", {
                  className: "settings-modal-scrim",
                  onClick: () => setSettingsOpen(false)
                },
                  React.createElement("div", {
                    className: "settings-modal",
                    onClick: (event) => event.stopPropagation()
                  },
                    React.createElement("div", { className: "settings-modal-header" },
                      React.createElement("div", { className: "settings-modal-title" }, "Runner Settings"),
                      React.createElement("button", {
                        type: "button",
                        className: "settings-modal-close",
                        onClick: () => setSettingsOpen(false),
                        "aria-label": "Close settings"
                      }, React.createElement(PanelLeftClose, { className: "sidebar-toggle-icon", strokeWidth: 1.75 }))
                    ),
                    React.createElement("div", { className: "settings-modal-body" }, renderSettingsFields())
                  )
                )
              : null,
            React.createElement("div", { className: "playground-shell" + (sidebarOpen ? "" : " sidebar-collapsed") },
              sidebarOpen
                ? React.createElement("aside", { className: "playground-sidebar" },
                    React.createElement("div", { className: "playground-sidebar-top" },
                      React.createElement("button", {
                        type: "button",
                        className: "sidebar-hide-button",
                        onClick: () => setSidebarOpen(false),
                        "aria-label": "Hide sidebar"
                      }, React.createElement(PanelLeftClose, { className: "sidebar-toggle-icon", strokeWidth: 1.75 }))
                    ),
                    React.createElement("div", { className: "sidebar-action-list" },
                      React.createElement("button", {
                        type: "button",
                        className: "sidebar-action-button",
                        onClick: handleNewThread
                      },
                        React.createElement(SquarePen, { className: "sidebar-action-icon", strokeWidth: 1.75 }),
                        React.createElement("span", null, "New Thread")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "sidebar-action-button" + (threadListMode === "scheduled" ? " is-active" : ""),
                        onClick: () => setThreadListMode((current) => current === "scheduled" ? "threads" : "scheduled")
                      },
                        React.createElement(Clock3, { className: "sidebar-action-icon", strokeWidth: 1.75 }),
                        React.createElement("span", null, "Scheduled Threads")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "sidebar-action-button",
                        onClick: handleOpenSkillsShortcut
                      },
                        React.createElement(Layers, { className: "sidebar-action-icon", strokeWidth: 1.75 }),
                        React.createElement("span", null, "Skills")
                      )
                    ),
                    React.createElement("div", { className: "sidebar-pinned-list" },
                      pinnedThreadItems.map((thread) =>
                        React.createElement("button", {
                          key: thread.id,
                          type: "button",
                          className: "sidebar-pinned-button" + (currentThreadId === thread.id ? " is-active" : ""),
                          onClick: () => handleThreadSelect(thread.id)
                        },
                          React.createElement(Pin, { className: "sidebar-pin-icon", strokeWidth: 1.75 }),
                          React.createElement("div", { className: "sidebar-thread-content" },
                            React.createElement("span", { className: "sidebar-thread-title" }, thread.title),
                            React.createElement("span", { className: "sidebar-thread-meta" },
                              thread.positive ? React.createElement("span", { className: "sidebar-thread-meta-positive" }, thread.positive) : null,
                              thread.negative ? React.createElement("span", { className: "sidebar-thread-meta-negative" }, thread.negative) : null,
                              React.createElement("span", { className: "sidebar-thread-meta-neutral" }, thread.ageLabel || formatRelativeThreadTime(thread.createdAt || thread.updatedAt))
                            )
                          )
                        )
                      )
                    ),
                    React.createElement("div", { className: "sidebar-thread-section" },
                      React.createElement("div", { className: "sidebar-thread-section-header" },
                        React.createElement("div", { className: "sidebar-thread-section-title" }, threadListMode === "scheduled" ? "Scheduled Threads" : "Threads"),
                        React.createElement("div", { className: "sidebar-thread-section-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "sidebar-thread-section-button",
                            onClick: () => setSettingsOpen(true),
                            "aria-label": "Open thread sidebar settings"
                          }, React.createElement(SlidersHorizontal, { className: "sidebar-thread-header-icon", strokeWidth: 1.75 }))
                        )
                      ),
                      React.createElement("div", { className: "sidebar-thread-scroll" },
                        isThreadsLoading
                          ? React.createElement("div", { className: "sidebar-empty-state" }, "Loading threads…")
                          : displayedThreadItems.length === 0
                            ? React.createElement("div", { className: "sidebar-empty-state" }, threadListMode === "scheduled" ? "No scheduled threads yet." : "No threads yet.")
                            : React.createElement("div", { className: "sidebar-thread-list" },
                                displayedThreadItems.map((thread) =>
                                  React.createElement("button", {
                                    key: thread.id,
                                    type: "button",
                                    className: "sidebar-thread-item" + (currentThreadId === thread.id ? " is-active" : ""),
                                    onClick: () => handleThreadSelect(thread.id)
                                  },
                                    React.createElement("div", { className: "sidebar-thread-content" },
                                      React.createElement("span", { className: "sidebar-thread-title" }, thread.title),
                                      React.createElement("span", { className: "sidebar-thread-meta" },
                                        threadMetaLabel(thread)
                                          ? React.createElement("span", { className: "sidebar-thread-meta-neutral" }, threadMetaLabel(thread))
                                          : null,
                                        React.createElement("span", { className: "sidebar-thread-meta-neutral" }, formatRelativeThreadTime(thread.nextRunAt || thread.createdAt || thread.updatedAt))
                                      )
                                    )
                                  )
                                ),
                                hasMoreThreadItems
                                  ? React.createElement("button", {
                                      type: "button",
                                      className: "sidebar-show-more",
                                      onClick: () => setThreadDisplayCount((current) => current + 10)
                                    }, "Show more threads")
                                  : null
                              )
                      )
                    ),
                    React.createElement("div", { className: "sidebar-footer" },
                      React.createElement(StatusIndicatorStack, {
                        items: statusIndicatorItems,
                        emptyText: "No cloud integrations connected",
                        dismissedIds: dismissedStatusIndicatorIds,
                        onDismiss: (id) => setDismissedStatusIndicatorIds((current) => current.includes(id) ? current : [...current, id])
                      }),
                      React.createElement("button", {
                        type: "button",
                        className: "sidebar-settings-button",
                        onClick: () => setSettingsOpen(true)
                      },
                        React.createElement(Settings2, { className: "sidebar-settings-icon", strokeWidth: 1.75 }),
                        React.createElement("span", null, "Settings")
                      )
                    )
                  )
                : null,
              React.createElement("main", { className: "playground-main" },
                React.createElement("div", { className: "playground-content-shell" },
                  React.createElement("div", { className: "playground-content-nav" },
                    React.createElement("div", { className: "playground-content-title" }, selectedThreadTitle),
                    React.createElement("div", { className: "playground-content-nav-center" },
                      React.createElement("div", { className: "content-mode-switch" },
                        React.createElement("button", {
                          type: "button",
                          className: "content-mode-button" + (contentMode === "chat" ? " is-active" : ""),
                          onClick: () => setContentMode("chat")
                        }, "Chat"),
                        React.createElement("button", {
                          type: "button",
                          className: "content-mode-button" + (contentMode === "changes" ? " is-active" : ""),
                          onClick: () => {
                            if (!currentThreadId) return;
                            setContentMode("changes");
                          },
                          disabled: !currentThreadId
                        }, "Changes")
                      )
                    ),
                    React.createElement("div", { className: "playground-content-nav-right" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-content-menu-button",
                        "aria-label": "Thread actions"
                      }, React.createElement(Ellipsis, { className: "playground-content-menu-icon", strokeWidth: 1.75 }))
                    )
                  ),
                  React.createElement("div", { className: "playground-content-body" },
                    React.createElement("div", { className: "playground-view-pane" + (contentMode === "chat" ? "" : " is-hidden") },
                      React.createElement("div", { className: "runner-host" },
                        React.createElement(RunnerChat, {
                          key: runnerRenderKey,
                          backendUrl: proxyBackendBase,
                          apiKey: apiKey,
                          fetchCustomSkills: computerAgentsMode ? handleFetchCustomSkills : undefined,
                          speechToTextUrl: speechToTextUrl || undefined,
                          requestHeaders,
                          appId: "runner-web-sdk-demo",
                          threadId: currentThreadId || undefined,
                          inputMode: computerAgentsMode ? "computer-agents" : "minimal",
                          computerAgents: computerAgentsMode ? demoComputerAgents : undefined,
                          environments: computerAgentsMode ? runtimeEnvironments.map((environment) => ({
                            ...environment,
                            ...(resolvedEnvironmentId && environment.id === resolvedEnvironmentId ? { isDefault: true } : {})
                          })) : undefined,
                          agents: computerAgentsMode ? runtimeAgents.map((agent) => ({
                            ...agent,
                            ...(resolvedAgentId && agent.id === resolvedAgentId ? { isDefault: true } : {})
                          })) : undefined,
                          skills: computerAgentsMode ? demoSkills : undefined,
                          environmentId: resolvedEnvironmentId || undefined,
                          agentId: resolvedAgentId || undefined,
                          showUsageInStatus: false,
                          placeholder: "What would you like me to do?",
                          onThreadIdChange: (threadId) => {
                            setCurrentThreadId(threadId);
                            void refreshThreads();
                          },
                          onRunStart: (threadId) => {
                            setCurrentThreadId(threadId);
                          },
                          onRunFinish: (result, threadId) => {
                            setCurrentThreadId(threadId);
                            void refreshThreads();
                          }
                        })
                      )
                    ),
                    React.createElement("div", { className: "playground-view-pane" + (contentMode === "changes" ? "" : " is-hidden") },
                      React.createElement(ThreadChangesView, {
                        threadId: currentThreadId,
                        threadTitle: selectedThreadTitle,
                        backendUrl: proxyBackendBase,
                        apiKey: apiKey,
                        upstreamUrl: resolvedUpstreamUrl
                      })
                    )
                  )
                )
              )
            ))
        );
      }

      const root = createRoot(document.getElementById("app"));
      root.render(React.createElement(DemoApp));
    