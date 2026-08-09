export const ORGANIZATIONS_IDENTITY_SCRIPT = `        function getOrganizationPageApiErrorMessage(data, fallback = "Failed to load organizations.") {
          const rawMessage = String(data?.message || data?.error || fallback || "").trim();
          const normalizedMessage = rawMessage.toLowerCase();
          if (
            normalizedMessage.includes("<!doctype html")
            || normalizedMessage.includes("<html")
            || ["get", "post", "patch", "put", "delete"].some((method) =>
              normalizedMessage.includes("cannot " + method + " /organizations")
            )
          ) {
            return "Organization API is not available on this backend yet. Redeploy the backend, then refresh this page.";
          }
          if (
            normalizedMessage.includes("signal is aborted")
            || normalizedMessage.includes("aborted without reason")
            || normalizedMessage.includes("aborterror")
          ) {
            return "The organization data request was interrupted. Refresh the organization page to try again.";
          }
          if (normalizedMessage.includes("timeouterror") || normalizedMessage.includes("request timed out")) {
            return "Organization data is taking longer than expected to load. Refresh the organization page to try again.";
          }
          return rawMessage || fallback;
        }

        function normalizeOrganizationPageRecord(organization) {
          const source = organization && typeof organization === "object" && !Array.isArray(organization) ? organization : {};
          const membership = source.membership && typeof source.membership === "object" && !Array.isArray(source.membership)
            ? source.membership
            : {};
          const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
            ? source.metadata
            : {};
          return {
            ...source,
            id: String(source.id || source.organizationId || source.organization_id || "").trim(),
            name: String(source.name || source.title || source.slug || "Organization").trim(),
            type: String(source.type || "company").trim().toLowerCase() || "company",
            role: (() => {
              const role = String(source.role || source.currentUserRole || source.viewerRole || membership.role || "member").trim().toLowerCase();
              return ["owner", "admin", "billing", "developer", "member", "viewer"].includes(role) ? role : "member";
            })(),
            membership,
            metadata,
            rolePermissionSets: normalizePlaygroundOrganizationRolePermissionSets(
              source.rolePermissionSets
              || source.rolePermissions
              || metadata.organizationRolePermissionSets
              || metadata.rolePermissionSets
            ),
          };
        }

        function isOrganizationPagePersonalOrganization(organization) {
          const normalizedOrganization = normalizeOrganizationPageRecord(organization);
          const metadata = normalizedOrganization.metadata && typeof normalizedOrganization.metadata === "object"
            ? normalizedOrganization.metadata
            : {};
          return normalizedOrganization.type === "personal"
            || normalizedOrganization.isPersonal === true
            || metadata.isPersonal === true
            || /^org_personal(?:_|$)/i.test(normalizedOrganization.id);
        }

        function getOrganizationPagePersonalOrganization(organizations) {
          const list = Array.isArray(organizations) ? organizations : [];
          return list.find((organization) => isOrganizationPagePersonalOrganization(organization))
            || list.find((organization) => String(organization?.ownerUserId || "") === String(sessionState.userId || ""))
            || list[0]
            || null;
        }

        function getOrganizationPageDisplayName(organization) {
          const normalizedOrganization = normalizeOrganizationPageRecord(organization);
          const name = normalizedOrganization.name || "Organization";
          if (isOrganizationPagePersonalOrganization(normalizedOrganization) && name.trim().toLowerCase() === "personal") {
            return "Personal Organization";
          }
          return name;
        }

        function isOrganizationPageActiveOrganization(organization) {
          const organizationId = String(organization?.id || "").trim();
          if (!organizationId) {
            return false;
          }
          const explicitActiveOrganizationId = String(activeOrganizationId || "").trim();
          if (explicitActiveOrganizationId) {
            return organizationId === explicitActiveOrganizationId;
          }
          return organizationId === String(getOrganizationPagePersonalOrganization(organizationPageOrganizations)?.id || "").trim();
        }

        function setActiveOrganizationFromRecord(organization) {
          const normalizedOrganization = normalizeOrganizationPageRecord(organization);
          if (!normalizedOrganization.id) {
            return;
          }
          setActiveOrganizationId(isOrganizationPagePersonalOrganization(normalizedOrganization) ? "" : normalizedOrganization.id);
        }

        function getComposerOrganizationOptions() {
          const organizations = Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : [];
          if (!organizations.length) {
            return [{ id: "__personal_workspace__", name: "Personal Workspace", description: "Workspace", isDefault: true }];
          }
          return organizations
            .map((organization) => {
              const normalizedOrganization = normalizeOrganizationPageRecord(organization);
              if (!normalizedOrganization.id) {
                return null;
              }
              return {
                id: normalizedOrganization.id,
                name: getOrganizationPageDisplayName(normalizedOrganization),
                description: isOrganizationPagePersonalOrganization(normalizedOrganization) ? "Personal Organization" : "Company",
                isDefault: isOrganizationPageActiveOrganization(normalizedOrganization),
              };
            })
            .filter(Boolean);
        }

        function getActiveComposerOrganizationId() {
          const organizations = Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : [];
          const activeOrganization = organizations.find((organization) => isOrganizationPageActiveOrganization(organization))
            || getOrganizationPagePersonalOrganization(organizations);
          return String(activeOrganization?.id || "__personal_workspace__").trim();
        }

        function readOrganizationPageAvatarUrl(organization) {
          const source = organization && typeof organization === "object" && !Array.isArray(organization) ? organization : {};
          const directAvatarUrl = String(
            source.avatarUrl
            || source.avatarURL
            || source.photoUrl
            || source.photoURL
            || source.logoUrl
            || source.logoURL
            || source.imageUrl
            || source.imageURL
            || source.picture
            || ""
          ).trim();
          if (directAvatarUrl) {
            return directAvatarUrl;
          }
          const nestedProfile = source.profile && typeof source.profile === "object" && !Array.isArray(source.profile)
            ? source.profile
            : {};
          const nestedBrand = source.brand && typeof source.brand === "object" && !Array.isArray(source.brand)
            ? source.brand
            : {};
          return String(
            nestedProfile.avatarUrl
            || nestedProfile.photoUrl
            || nestedBrand.logoUrl
            || nestedBrand.avatarUrl
            || ""
          ).trim();
        }

        function getActiveSidebarOrganizationDisplay() {
          const organizations = Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : [];
          const activeOrganization = organizations.find((organization) => isOrganizationPageActiveOrganization(organization))
            || getOrganizationPagePersonalOrganization(organizations);
          const normalizedOrganization = activeOrganization ? normalizeOrganizationPageRecord(activeOrganization) : null;
          const name = hasShellAccess
            ? (normalizedOrganization ? getOrganizationPageDisplayName(normalizedOrganization) : "Personal Organization")
            : "Sign in";
          const avatarUrl = normalizeSessionPhotoUrl(
            readOrganizationPageAvatarUrl(activeOrganization)
            || accountAvatarUrl
          );
          return {
            name,
            initials: getAccountInitials(name),
            avatarUrl: canRenderAvatarImage(avatarUrl) ? avatarUrl : "",
          };
        }

        function handleComposerOrganizationChange(organizationId) {
          const normalizedOrganizationId = String(organizationId || "").trim();
          const organization = (Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : [])
            .find((entry) => String(entry?.id || "").trim() === normalizedOrganizationId);
          if (!organization) {
            return;
          }
          setActiveOrganizationFromRecord(organization);
        }
`;
