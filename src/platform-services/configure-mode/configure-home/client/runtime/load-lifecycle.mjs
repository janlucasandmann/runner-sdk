export const CONFIGURE_HOME_NOTIFICATION_LOAD_LIFECYCLE_SCRIPT = `        useEffect(() => {
          setReadProductNotificationIds(readStoredNotificationIds(notificationReadStorageKey));
        }, [notificationReadStorageKey]);

        const notificationCenterSurfaceVisible = notificationsOpen
          || (activePage === "configure" && configureHomeTab === "notifications");

        useEffect(() => {
          if (!canFetchNotificationCenter) {
            setProductNotifications([]);
            setInboxNotifications([]);
            setTeamInvitationNotifications([]);
            setOrganizationInvitationNotifications([]);
            setTaskActivityNotifications([]);
            return;
          }

          let cancelled = false;
          let requestInFlight = false;
          let refreshQueued = false;

          const loadPrimaryNotifications = async () => {
            try {
              const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/notifications/in-app", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders,
              }, PLAYGROUND_NOTIFICATION_REQUEST_TIMEOUT_MS);
              if (!response.ok || cancelled) {
                return;
              }
              const items = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.notifications)
                  ? data.notifications
                  : [];
              const teamInvitationItems = Array.isArray(data?.teamInvitations)
                ? data.teamInvitations
                : [];
              const taskActivityItems = Array.isArray(data?.taskNotifications)
                ? data.taskNotifications
                : [];
              const inboxItems = Array.isArray(data?.inboxNotifications)
                ? data.inboxNotifications
                : [];
              setProductNotifications(
                items.map(normalizeInAppNotificationRecord).filter(Boolean)
              );
              setTeamInvitationNotifications(
                teamInvitationItems
                  .map(normalizeTeamInvitationNotificationRecord)
                  .filter(Boolean)
              );
              setTaskActivityNotifications(
                taskActivityItems
                  .map(normalizeTaskActivityNotificationRecord)
                  .filter(Boolean)
              );
              setInboxNotifications(
                inboxItems.map(normalizeNotificationInboxRecord).filter(Boolean)
              );
            } catch {}
          };

          const loadOrganizationInvitationNotifications = async () => {
            try {
              const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/organizations/invitations/pending", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: baseAuthRequestHeaders,
              }, PLAYGROUND_NOTIFICATION_REQUEST_TIMEOUT_MS);
              if (!response.ok || cancelled) {
                return;
              }
              const items = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.invitations)
                  ? data.invitations
                  : [];
              setOrganizationInvitationNotifications(
                items.map(normalizeOrganizationInvitationNotificationRecord).filter(Boolean)
              );
            } catch {}
          };

          const loadNotificationCenter = async () => {
            if (cancelled) {
              return;
            }
            if (requestInFlight) {
              refreshQueued = true;
              return;
            }
            requestInFlight = true;
            refreshQueued = false;
            try {
              await Promise.allSettled([
                loadPrimaryNotifications(),
                loadOrganizationInvitationNotifications(),
              ]);
            } finally {
              requestInFlight = false;
              if (!cancelled && refreshQueued) {
                refreshQueued = false;
                void loadNotificationCenter();
              }
            }
          };

          const refreshWhenVisible = () => {
            if (document.visibilityState === "visible") {
              void loadNotificationCenter();
            }
          };
          const handleNotificationRefreshRequest = () => {
            void loadNotificationCenter();
          };

          void loadNotificationCenter();
          const intervalId = window.setInterval(
            refreshWhenVisible,
            PLAYGROUND_NOTIFICATION_VISIBLE_REFRESH_INTERVAL_MS
          );
          window.addEventListener("focus", refreshWhenVisible);
          window.addEventListener("online", refreshWhenVisible);
          window.addEventListener(PLAYGROUND_NOTIFICATION_REFRESH_EVENT, handleNotificationRefreshRequest);
          document.addEventListener("visibilitychange", refreshWhenVisible);

          return () => {
            cancelled = true;
            window.clearInterval(intervalId);
            window.removeEventListener("focus", refreshWhenVisible);
            window.removeEventListener("online", refreshWhenVisible);
            window.removeEventListener(PLAYGROUND_NOTIFICATION_REFRESH_EVENT, handleNotificationRefreshRequest);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
          };
        }, [
          canFetchNotificationCenter,
          notificationCenterSurfaceVisible,
          proxyBackendBase,
          requestHeadersSignature,
        ]);

        useEffect(() => {
          if (!canFetchNotificationCenter) {
            setPermissionNotifications([]);
            return;
          }

          const pendingThreads = pendingPermissionNotificationThreads;

          if (pendingThreads.length === 0) {
            setPermissionNotifications([]);
            return;
          }

          let cancelled = false;
          const controller = new AbortController();

          void (async () => {
            let nextIndex = 0;
            const loadThreadPermissionNotifications = async (thread) => {
              const fallbackNotification = buildPendingPermissionNotificationFallback(thread);
              try {
                const { response, data } = await fetchJsonWithTimeout(
                  proxyBackendBase + "/threads/" + encodeURIComponent(thread.id) + "/permission-requests",
                  {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                    headers: requestHeaders,
                    signal: controller.signal,
                  },
                  3000
                );
                if (!response.ok) {
                  return fallbackNotification ? [fallbackNotification] : [];
                }
                const requests = Array.isArray(data?.data)
                  ? data.data
                  : Array.isArray(data?.requests)
                    ? data.requests
                    : [];
                const threadRequests = requests
                  .map((request) => {
                    const requestId = typeof request?.requestId === "string" ? request.requestId.trim() : "";
                    if (!requestId) {
                      return null;
                    }
                    const toolName = typeof request?.toolName === "string" && request.toolName.trim()
                      ? request.toolName.trim()
                      : "Tool access";
                    const reason = typeof request?.reason === "string" ? request.reason.trim() : "";
                    return {
                      id: "permission:" + thread.id + ":" + requestId,
                      requestId,
                      threadId: thread.id,
                      threadTitle: thread.title || "Untitled thread",
                      toolName,
                      reason,
                      createdAt: typeof request?.createdAt === "string" ? request.createdAt : "",
                    };
                  })
                  .filter(Boolean);
                if (threadRequests.length === 0) {
                  return fallbackNotification ? [fallbackNotification] : [];
                }
                const requestIds = threadRequests.map((request) => request.requestId).sort();
                const notificationId = "permission:" + thread.id + ":" + requestIds.join("|");
                const fallbackReadId = buildPermissionNotificationStatusReadId(thread);
                const latestCreatedAt = threadRequests
                  .map((request) => request.createdAt)
                  .filter(Boolean)
                  .sort((left, right) => {
                    const leftMs = Date.parse(left || "");
                    const rightMs = Date.parse(right || "");
                    return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
                  })[0] || "";
                return [{
                  id: notificationId,
                  readIds: [notificationId, fallbackReadId].filter(Boolean),
                  requestId: requestIds[0] || "",
                  requestIds,
                  requestCount: threadRequests.length,
                  threadId: thread.id,
                  threadTitle: thread.title,
                  toolName: threadRequests.length === 1
                    ? threadRequests[0].toolName
                    : String(threadRequests.length) + " permissions",
                  reason: threadRequests.map((request) => request.reason).filter(Boolean).join("\\n"),
                  createdAt: latestCreatedAt,
                }];
              } catch {
                return controller.signal.aborted ? [] : (fallbackNotification ? [fallbackNotification] : []);
              }
            };
            const workerCount = Math.min(3, pendingThreads.length);
            const workers = Array.from({ length: workerCount }, async () => {
              const notifications = [];
              while (!cancelled) {
                const currentIndex = nextIndex;
                nextIndex += 1;
                if (currentIndex >= pendingThreads.length) {
                  break;
                }
                notifications.push(...await loadThreadPermissionNotifications(pendingThreads[currentIndex]));
              }
              return notifications;
            });
            const results = await Promise.allSettled(workers);

            if (cancelled) {
              return;
            }

            const nextPermissionNotifications = results
              .flatMap((result) => result.status === "fulfilled" ? result.value : [])
              .sort((left, right) => {
                const leftMs = Date.parse(left.createdAt || "");
                const rightMs = Date.parse(right.createdAt || "");
                return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
              });
            setPermissionNotifications(nextPermissionNotifications);
          })();

          return () => {
            cancelled = true;
            controller.abort();
          };
        }, [canFetchNotificationCenter, pendingPermissionNotificationThreadKey, proxyBackendBase, requestHeaders]);
`;
