export const ORGANIZATIONS_LOADING_SCRIPT = `        async function loadOrganizationPageData(options = {}) {
          if (!hasRealAccess) {
            if (organizationPageLoadAbortControllerRef.current) {
              organizationPageLoadAbortControllerRef.current.abort(createFetchAbortReason("AbortError", "Organization page access changed."));
              organizationPageLoadAbortControllerRef.current = null;
            }
            setOrganizationPageOrganizations([]);
            setOrganizationPageMembers([]);
            setOrganizationPageInvitations([]);
            setOrganizationPageResources([]);
            return;
          }
          if (organizationPageLoadAbortControllerRef.current) {
            organizationPageLoadAbortControllerRef.current.abort(createFetchAbortReason("AbortError", "A newer organization page load started."));
          }
          const loadAbortController = new AbortController();
          organizationPageLoadAbortControllerRef.current = loadAbortController;
          const loadSequenceId = organizationPageLoadSequenceRef.current + 1;
          organizationPageLoadSequenceRef.current = loadSequenceId;
          const isCurrentLoad = () => (
            organizationPageLoadSequenceRef.current === loadSequenceId
            && organizationPageLoadAbortControllerRef.current === loadAbortController
          );
          const hasSelectedOrganizationIdOverride = options
            && typeof options === "object"
            && Object.prototype.hasOwnProperty.call(options, "selectedOrganizationId");
          const requestedOrganizationId = String(hasSelectedOrganizationIdOverride ? options.selectedOrganizationId : organizationPageSelectedOrganizationId || "").trim();
          const isSilent = options?.silent === true;
          const listOnly = options?.listOnly === true;
          if (!isSilent) {
            setOrganizationPageLoading(true);
          }
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/organizations", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              signal: loadAbortController.signal,
              headers: baseAuthRequestHeaders,
            }, 12000);
            if (!isCurrentLoad()) {
              return;
            }
            if (!response.ok) {
              throw new Error(getOrganizationPageApiErrorMessage(data));
            }
            const organizations = (Array.isArray(data?.data) ? data.data : Array.isArray(data?.organizations) ? data.organizations : [])
              .map((organization) => normalizeOrganizationPageRecord(organization))
              .filter((organization) => organization.id);
            setOrganizationPageOrganizations(organizations);
            if (activeOrganizationId && !organizations.some((organization) => organization.id === activeOrganizationId)) {
              setActiveOrganizationId("");
            }
            const selectedOrganization = requestedOrganizationId
              ? organizations.find((organization) => organization.id === requestedOrganizationId) || null
              : null;
            const selectedOrganizationId = selectedOrganization?.id || "";
            setOrganizationPageSelectedOrganizationId(selectedOrganizationId);
            if (!selectedOrganizationId || listOnly) {
              setOrganizationPageMembers([]);
              setOrganizationPageInvitations([]);
              setOrganizationPageResources([]);
              return;
            }
            const selectedOrganizationHeaders = {
              ...baseAuthRequestHeaders,
              [PLAYGROUND_ORGANIZATION_HEADER]: selectedOrganizationId,
            };
            const [membersResult, invitationsResult, resourcesResult] = await Promise.allSettled([
              fetchJsonWithTimeout(proxyBackendBase + "/organizations/" + encodeURIComponent(selectedOrganizationId) + "/members", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                signal: loadAbortController.signal,
                headers: baseAuthRequestHeaders,
              }, 12000),
              fetchJsonWithTimeout(proxyBackendBase + "/organizations/" + encodeURIComponent(selectedOrganizationId) + "/invitations", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                signal: loadAbortController.signal,
                headers: baseAuthRequestHeaders,
              }, 10000),
              fetchJsonWithTimeout(proxyBackendBase + "/organizations/" + encodeURIComponent(selectedOrganizationId) + "/resources", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                signal: loadAbortController.signal,
                headers: selectedOrganizationHeaders,
              }, 10000),
            ]);
            if (!isCurrentLoad()) {
              return;
            }
            if (membersResult.status === "rejected") {
              throw membersResult.reason;
            }
            if (!membersResult.value.response.ok) {
              throw new Error(getOrganizationPageApiErrorMessage(membersResult.value.data, "Failed to load organization members."));
            }
            setOrganizationPageMembers(Array.isArray(membersResult.value.data?.data) ? membersResult.value.data.data : []);
            setOrganizationPageInvitations(
              invitationsResult.status === "fulfilled"
              && invitationsResult.value.response.ok
              && Array.isArray(invitationsResult.value.data?.data)
                ? invitationsResult.value.data.data
                : []
            );
            setOrganizationPageResources(
              resourcesResult.status === "fulfilled"
              && resourcesResult.value.response.ok
              && Array.isArray(resourcesResult.value.data?.data)
                ? resourcesResult.value.data.data
                : []
            );
          } catch (error) {
            if (!isCurrentLoad() || loadAbortController.signal.aborted) {
              return;
            }
            setOrganizationPageError(getOrganizationPageApiErrorMessage({
              message: error instanceof Error ? error.message : "",
            }, isFetchAbortError(error)
              ? "Organization data is taking longer than expected to load. Refresh the organization page to try again."
              : "Failed to load organizations."));
          } finally {
            if (isCurrentLoad()) {
              if (!isSilent) {
                setOrganizationPageLoading(false);
              }
              organizationPageLoadAbortControllerRef.current = null;
            }
          }
        }
`;
