export const CONFIGURE_HOME_NOTIFICATION_LOAD_LIFECYCLE_SCRIPT = `        useEffect(() => {
          setReadProductNotificationIds(readStoredNotificationIds(notificationReadStorageKey));
        }, [notificationReadStorageKey]);

        useEffect(() => {
          if (!canFetchNotificationCenter) {
            setProductNotifications([]);
            setTeamInvitationNotifications([]);
            setOrganizationInvitationNotifications([]);
            return;
          }

          let cancelled = false;

          const loadProductNotifications = async () => {
            try {
              const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/notifications/in-app", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders,
              }, 2500);
              if (!response.ok) {
                if (!cancelled) {
                  setProductNotifications([]);
                  setTeamInvitationNotifications([]);
                  setOrganizationInvitationNotifications([]);
                }
                return;
              }
              const items = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.notifications)
                  ? data.notifications
                  : [];
              const normalizedItems = items.map(normalizeInAppNotificationRecord).filter(Boolean);
              const teamInvitationItems = Array.isArray(data?.teamInvitations)
                ? data.teamInvitations
                : [];
              const normalizedTeamInvitations = teamInvitationItems
                .map(normalizeTeamInvitationNotificationRecord)
                .filter(Boolean);
              let normalizedOrganizationInvitations = [];
              try {
                const { response: organizationInvitationsResponse, data: organizationInvitationsData } = await fetchJsonWithTimeout(proxyBackendBase + "/organizations/invitations/pending", {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                  headers: baseAuthRequestHeaders,
                }, 2500);
                if (organizationInvitationsResponse.ok) {
                  const organizationInvitationItems = Array.isArray(organizationInvitationsData?.data)
                    ? organizationInvitationsData.data
                    : Array.isArray(organizationInvitationsData?.invitations)
                      ? organizationInvitationsData.invitations
                      : [];
                  normalizedOrganizationInvitations = organizationInvitationItems
                    .map(normalizeOrganizationInvitationNotificationRecord)
                    .filter(Boolean);
                }
              } catch {}
              if (!cancelled) {
                setProductNotifications(normalizedItems);
                setTeamInvitationNotifications(normalizedTeamInvitations);
                setOrganizationInvitationNotifications(normalizedOrganizationInvitations);
              }
            } catch {
              if (!cancelled) {
                setProductNotifications([]);
                setTeamInvitationNotifications([]);
                setOrganizationInvitationNotifications([]);
              }
            }
          };

          void loadProductNotifications();
          const intervalId = window.setInterval(loadProductNotifications, 120000);
          return () => {
            cancelled = true;
            window.clearInterval(intervalId);
          };
        }, [baseAuthRequestHeaders, canFetchNotificationCenter, notificationsOpen, proxyBackendBase, requestHeaders]);

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
