export const ORGANIZATIONS_PERMISSIONS_SCRIPT = `        function applyOrganizationRolePermissionSetLocally(organizationId, roleId, permissionSet) {
          const normalizedOrganizationId = String(organizationId || "").trim();
          const normalizedRoleId = normalizePlaygroundOrganizationRoleId(roleId, "");
          if (!normalizedOrganizationId || !normalizedRoleId || normalizedRoleId === "owner") {
            return;
          }
          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "organization_role");
          setOrganizationPageOrganizations((current) => (Array.isArray(current) ? current : []).map((organization) => {
            const normalizedOrganization = normalizeOrganizationPageRecord(organization);
            if (normalizedOrganization.id !== normalizedOrganizationId) {
              return normalizedOrganization;
            }
            const rolePermissionSets = normalizePlaygroundOrganizationRolePermissionSets(normalizedOrganization.rolePermissionSets);
            const nextRolePermissionSets = {
              ...rolePermissionSets,
              [normalizedRoleId]: normalizedPermissionSet,
            };
            return normalizeOrganizationPageRecord({
              ...normalizedOrganization,
              rolePermissionSets: nextRolePermissionSets,
              metadata: {
                ...(normalizedOrganization.metadata || {}),
                organizationRolePermissionSets: nextRolePermissionSets,
              },
            });
          }));
        }

        async function persistOrganizationRolePermissionSet(organizationId, roleId, permissionSet) {
          const normalizedOrganizationId = String(organizationId || "").trim();
          const normalizedRoleId = normalizePlaygroundOrganizationRoleId(roleId, "");
          if (!normalizedOrganizationId || !normalizedRoleId || normalizedRoleId === "owner") {
            return null;
          }
          const selectedOrganization = organizationPageOrganizations.find((organization) => String(organization?.id || "") === normalizedOrganizationId) || null;
          const currentRolePermissionSets = normalizePlaygroundOrganizationRolePermissionSets(selectedOrganization?.rolePermissionSets);
          const nextRolePermissionSets = {
            ...currentRolePermissionSets,
            [normalizedRoleId]: normalizePlaygroundPermissionSet(permissionSet, "organization_role"),
          };
          const nextMetadata = {
            ...(selectedOrganization?.metadata || {}),
            organizationRolePermissionSets: nextRolePermissionSets,
          };
          const { response, data } = await fetchJsonWithTimeout(
            proxyBackendBase + "/organizations/" + encodeURIComponent(normalizedOrganizationId),
            {
              method: "PATCH",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...baseAuthRequestHeaders,
                "Content-Type": "application/json",
                [PLAYGROUND_ORGANIZATION_HEADER]: normalizedOrganizationId,
              },
              body: JSON.stringify({ metadata: nextMetadata }),
            },
            10000
          );
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to update organization role permissions.");
          }
          const updatedOrganization = normalizeOrganizationPageRecord(data?.data || data?.organization || data);
          if (updatedOrganization.id) {
            setOrganizationPageOrganizations((current) => (Array.isArray(current) ? current : []).map((organization) =>
              String(organization?.id || "") === updatedOrganization.id ? updatedOrganization : normalizeOrganizationPageRecord(organization)
            ));
          }
          return updatedOrganization;
        }

        function updateOrganizationRolePermissionSet(roleId, updater) {
          const normalizedRoleId = normalizePlaygroundOrganizationRoleId(roleId, "");
          const organizationId = String(organizationPageSelectedOrganizationId || "").trim();
          const selectedOrganization = organizationPageOrganizations.find((organization) => String(organization?.id || "") === organizationId) || null;
          if (!organizationId || !selectedOrganization || !normalizedRoleId || normalizedRoleId === "owner") {
            return;
          }
          const currentRolePermissionSets = normalizePlaygroundOrganizationRolePermissionSets(selectedOrganization.rolePermissionSets);
          const currentPermissionSet = normalizePlaygroundPermissionSet(currentRolePermissionSets[normalizedRoleId], "organization_role");
          const nextPermissionSet = normalizePlaygroundPermissionSet(
            typeof updater === "function" ? updater(currentPermissionSet) : updater,
            "organization_role"
          );
          applyOrganizationRolePermissionSetLocally(organizationId, normalizedRoleId, nextPermissionSet);
          const actionId = "organization-role-permissions:" + normalizedRoleId;
          setOrganizationPageActionId(actionId);
          setOrganizationPageError("");
          void persistOrganizationRolePermissionSet(organizationId, normalizedRoleId, nextPermissionSet)
            .catch((error) => {
              applyOrganizationRolePermissionSetLocally(organizationId, normalizedRoleId, currentPermissionSet);
              setOrganizationPageError(error instanceof Error ? error.message : "Failed to update organization role permissions.");
            })
            .finally(() => {
              setOrganizationPageActionId((current) => current === actionId ? "" : current);
            });
        }

        function updateOrganizationRolePermissionRingAccess(roleId, ringId, access) {
          updateOrganizationRolePermissionSet(roleId, (currentPermissionSet) => ({
            ...currentPermissionSet,
            rings: {
              ...(currentPermissionSet.rings || {}),
              [ringId]: {
                ...((currentPermissionSet.rings || {})[ringId] || {}),
                defaultAccess: normalizePlaygroundPermissionAccess(access),
              },
            },
          }));
        }

        function updateOrganizationRolePermissionActionRing(roleId, actionId, ringId) {
          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
          if (!actionDefinition) return;
          updateOrganizationRolePermissionSet(roleId, (currentPermissionSet) => {
            const existingAction = (currentPermissionSet.actions || {})[actionId] || {};
            return {
              ...currentPermissionSet,
              actions: {
                ...(currentPermissionSet.actions || {}),
                [actionId]: buildPlaygroundPermissionActionPolicy(
                  currentPermissionSet,
                  actionDefinition,
                  existingAction,
                  getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition),
                  ringId
                ),
              },
            };
          });
        }

        function updateOrganizationRolePermissionActionAccess(roleId, actionId, access) {
          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
          if (!actionDefinition) return;
          updateOrganizationRolePermissionSet(roleId, (currentPermissionSet) => {
            const existingAction = (currentPermissionSet.actions || {})[actionId] || {};
            return {
              ...currentPermissionSet,
              actions: {
                ...(currentPermissionSet.actions || {}),
                [actionId]: buildPlaygroundPermissionActionPolicy(
                  currentPermissionSet,
                  actionDefinition,
                  existingAction,
                  normalizePlaygroundPermissionAccess(access, "")
                ),
              },
            };
          });
        }
`;
