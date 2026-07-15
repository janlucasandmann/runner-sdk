export const INFERENCE_APP_RUNTIME_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (activePage !== "inference") {
            return undefined;
          }

          let cancelled = false;

          if (!hasRealAccess) {
            setSettingsLocalRunnersState({
              status: "ready",
              error: "",
              bridgeEnabled: null,
              runtimeTargets: [],
              devices: [],
              bindings: [],
              loadedAt: new Date().toISOString(),
            });
            return () => {
              cancelled = true;
            };
          }

          setSettingsLocalRunnersState((current) => ({
            ...current,
            status: "loading",
            error: "",
          }));

          void Promise.all([
            fetchJsonWithTimeout(proxyBackendBase + "/runtime-targets", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000),
            fetchJsonWithTimeout(proxyBackendBase + "/devices?limit=100", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000),
            fetchJsonWithTimeout(proxyBackendBase + "/workspace-bindings?limit=250", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000),
          ]).then(([runtimeTargetsResult, devicesResult, bindingsResult]) => {
            if (cancelled) {
              return;
            }

            if (!runtimeTargetsResult.response.ok) {
              throw new Error(runtimeTargetsResult.data?.message || runtimeTargetsResult.data?.error || "Failed to load runtime targets.");
            }

            const runtimeTargets = normalizeSettingsRuntimeTargetsPayload(runtimeTargetsResult.data);
            const bridgeEnabled = runtimeTargetsResult.data?.localBridgeEnabled === true;

            if (devicesResult.response.status === 404 || bindingsResult.response.status === 404) {
              setSettingsLocalRunnersState({
                status: "ready",
                error: "Local bridge is not enabled for this workspace yet.",
                bridgeEnabled,
                runtimeTargets,
                devices: [],
                bindings: [],
                loadedAt: new Date().toISOString(),
              });
              return;
            }

            if (!devicesResult.response.ok) {
              throw new Error(devicesResult.data?.message || devicesResult.data?.error || "Failed to load local runners.");
            }
            if (!bindingsResult.response.ok) {
              throw new Error(bindingsResult.data?.message || bindingsResult.data?.error || "Failed to load workspace bindings.");
            }

            const devices = normalizeSettingsLocalRunnerListPayload(devicesResult.data, "devices")
              .map(normalizeSettingsLocalRunnerDevice)
              .filter(Boolean);
            const bindings = normalizeSettingsLocalRunnerListPayload(bindingsResult.data, "bindings")
              .map(normalizeSettingsWorkspaceBinding)
              .filter(Boolean);

            setSettingsLocalRunnersState({
              status: "ready",
              error: "",
              bridgeEnabled,
              runtimeTargets,
              devices,
              bindings,
              loadedAt: new Date().toISOString(),
            });
          }).catch((error) => {
            if (cancelled) {
              return;
            }
            setSettingsLocalRunnersState((current) => ({
              ...current,
              status: "error",
              error: error instanceof Error ? error.message : "Failed to load local runners.",
              bridgeEnabled: current.bridgeEnabled,
              loadedAt: current.loadedAt || new Date().toISOString(),
            }));
          });

          return () => {
            cancelled = true;
          };
        }, [activePage, hasRealAccess, proxyBackendBase, requestHeaders, settingsLocalRunnersReloadToken]);
        useEffect(() => {
          if (!settingsLocalRunnerOnboardingOpen || !hasRealAccess) {
            return undefined;
          }
          const pairingToken = settingsLocalRunnerPairingState.pairingToken;
          const pairingTokenId = pairingToken && typeof pairingToken.id === "string" ? pairingToken.id : "";
          const pairingStatus = pairingToken && typeof pairingToken.status === "string" ? pairingToken.status : "";
          if (!pairingTokenId || pairingStatus !== "pending") {
            return undefined;
          }

          let cancelled = false;
          const pollPairingToken = async () => {
            try {
              const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/local-runner-pairing-tokens/" + encodeURIComponent(pairingTokenId), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders,
              }, 8000);
              if (cancelled) {
                return;
              }
              if (!response.ok) {
                setSettingsLocalRunnerPairingState((current) => ({
                  ...current,
                  status: "error",
                  error: data?.message || data?.error || "Failed to check pairing status.",
                  success: "",
                }));
                return;
              }

              const nextPairingToken = data?.pairingToken && typeof data.pairingToken === "object" && !Array.isArray(data.pairingToken)
                ? data.pairingToken
                : null;
              if (!nextPairingToken) {
                return;
              }

              setSettingsLocalRunnerPairingState((current) => {
                if (nextPairingToken.status === "completed") {
                  return {
                    ...current,
                    status: "completed",
                    pairingToken: nextPairingToken,
                    error: "",
                    success: "Local runner connected.",
                  };
                }
                if (nextPairingToken.status === "expired" || nextPairingToken.status === "revoked") {
                  return {
                    ...current,
                    status: nextPairingToken.status,
                    pairingToken: nextPairingToken,
                    error: "Pairing token expired. Generate a new token and restart the daemon command.",
                    success: "",
                  };
                }
                return {
                  ...current,
                  status: "waiting",
                  pairingToken: nextPairingToken,
                };
              });

              if (nextPairingToken.status === "completed") {
                setSettingsLocalRunnersReloadToken((current) => current + 1);
              }
            } catch (error) {
              if (!cancelled) {
                setSettingsLocalRunnerPairingState((current) => ({
                  ...current,
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to check pairing status.",
                  success: "",
                }));
              }
            }
          };

          const intervalId = window.setInterval(() => {
            void pollPairingToken();
          }, 2500);
          void pollPairingToken();

          return () => {
            cancelled = true;
            window.clearInterval(intervalId);
          };
        }, [
          hasRealAccess,
          proxyBackendBase,
          requestHeaders,
          settingsLocalRunnerOnboardingOpen,
          settingsLocalRunnerPairingState.pairingToken?.id,
          settingsLocalRunnerPairingState.pairingToken?.status,
        ]);
        useEffect(() => {
          if (!settingsLocalBindingFormOpen) {
            return;
          }
          setSettingsLocalBindingForm((current) => {
            const nextDeviceId = current.deviceId || settingsLocalRunnersState.devices[0]?.id || "";
            const nextEnvironmentId = current.environmentId || realEnvironments.find((environment) => environment?.isDefault)?.id || realEnvironments[0]?.id || "";
            if (nextDeviceId === current.deviceId && nextEnvironmentId === current.environmentId) {
              return current;
            }
            return {
              ...current,
              deviceId: nextDeviceId,
              environmentId: nextEnvironmentId,
            };
          });
        }, [realEnvironments, settingsLocalBindingFormOpen, settingsLocalRunnersState.devices]);
        const handleSettingsCreateLocalRunnerPairingToken = useCallback(async () => {
          if (!hasRealAccess) {
            setSettingsLocalRunnerPairingState((current) => ({
              ...current,
              status: "error",
              error: "Sign in to connect a local runner.",
              success: "",
            }));
            return;
          }

          setSettingsLocalRunnerPairingState({
            status: "creating",
            token: "",
            pairingToken: null,
            error: "",
            success: "",
          });

          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/local-runner-pairing-tokens", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: "Local runner",
                ttlSeconds: 600,
              }),
            }, 10000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create pairing token.");
            }
            const token = typeof data?.token === "string" ? data.token.trim() : "";
            const pairingToken = data?.pairingToken && typeof data.pairingToken === "object" && !Array.isArray(data.pairingToken)
              ? data.pairingToken
              : null;
            if (!token || !pairingToken?.id) {
              throw new Error("Pairing token response was incomplete.");
            }
            setSettingsLocalRunnerPairingState({
              status: "waiting",
              token,
              pairingToken,
              error: "",
              success: "Pairing token created. Start the daemon with the command below.",
            });
          } catch (error) {
            setSettingsLocalRunnerPairingState({
              status: "error",
              token: "",
              pairingToken: null,
              error: error instanceof Error ? error.message : "Failed to create pairing token.",
              success: "",
            });
          }
        }, [hasRealAccess, proxyBackendBase, requestHeaders]);
        const handleSettingsCreateWorkspaceBinding = useCallback(async () => {
          if (!hasRealAccess) {
            setSettingsLocalBindingError("Sign in to create a workspace binding.");
            setSettingsLocalBindingSuccess("");
            return;
          }

          const deviceId = String(settingsLocalBindingForm.deviceId || "").trim();
          const environmentId = String(settingsLocalBindingForm.environmentId || "").trim();
          const localPath = String(settingsLocalBindingForm.localPath || "").trim();
          const syncRoot = String(settingsLocalBindingForm.syncRoot || "").trim();
          if (!deviceId) {
            setSettingsLocalBindingError("Select a local runner device.");
            setSettingsLocalBindingSuccess("");
            return;
          }
          if (!environmentId) {
            setSettingsLocalBindingError("Select an environment to bind.");
            setSettingsLocalBindingSuccess("");
            return;
          }
          if (!localPath) {
            setSettingsLocalBindingError("Enter the local workspace path.");
            setSettingsLocalBindingSuccess("");
            return;
          }

          setSettingsLocalBindingSubmitting(true);
          setSettingsLocalBindingError("");
          setSettingsLocalBindingSuccess("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/workspace-bindings", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                deviceId,
                environmentId,
                projectId: String(settingsLocalBindingForm.projectId || "").trim() || null,
                name: String(settingsLocalBindingForm.name || "").trim() || undefined,
                localPath,
                syncRoot: syncRoot || localPath,
                syncMode: settingsLocalBindingForm.syncMode === "off" || settingsLocalBindingForm.syncMode === "watch"
                  ? settingsLocalBindingForm.syncMode
                  : "manual",
                executionMode: settingsLocalBindingForm.executionMode === "legacy_remote"
                  ? "legacy_remote"
                  : "bridge_local",
              }),
            }, 10000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create workspace binding.");
            }
            setSettingsLocalBindingSuccess("Workspace binding created.");
            setSettingsLocalBindingForm((current) => ({
              ...current,
              name: "",
              localPath: "",
              syncRoot: "",
            }));
            setSettingsLocalRunnersReloadToken((current) => current + 1);
          } catch (error) {
            setSettingsLocalBindingError(error instanceof Error ? error.message : "Failed to create workspace binding.");
          } finally {
            setSettingsLocalBindingSubmitting(false);
          }
        }, [hasRealAccess, proxyBackendBase, requestHeaders, settingsLocalBindingForm]);
`;
