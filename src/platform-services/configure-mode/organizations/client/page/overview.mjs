const ORGANIZATIONS_PAGE_OVERVIEW_TEMPLATE = `          const organizationOverviewRows = (Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : [])
            .map((organization) => {
              const id = String(organization?.id || "").trim();
              const name = getOrganizationPageDisplayName(organization);
              const roleLabel = formatRole(organization?.role || organization?.membership?.role);
              const type = String(organization?.type || "").trim().toLowerCase() === "personal"
                ? "personal"
                : "company";
              const typeLabel = formatOrganizationType(type);
              const isActive = isOrganizationPageActiveOrganization(organization);
              const roleId = normalizeOrganizationRoleId(
                organization?.role || organization?.membership?.role,
                "member",
              );
              const ownerUserId = String(
                organization?.ownerUserId
                || organization?.owner_user_id
                || organization?.ownerId
                || organization?.owner_id
                || "",
              ).trim();
              const canRename = roleId === "owner"
                || roleId === "admin"
                || (ownerUserId && ownerUserId === String(sessionState.userId || "").trim());
              return {
                id,
                name,
                roleLabel,
                type,
                typeLabel,
                isActive,
                canRename,
                searchText: [name, roleLabel, typeLabel, isActive ? "Current" : "Available", id]
                  .filter(Boolean)
                  .join(" "),
              };
            })
            .filter((organization) => organization.id);

          const renderOverview = () => React.createElement(React.Fragment, null,
            React.createElement(OrganizationsOverviewPage, {
              rows: organizationOverviewRows,
              loading: organizationPageLoading && organizationOverviewRows.length === 0,
              error: organizationPageError,
              controlsPortalId: "playground-organizations-overview-controls",
              onOpen: (organization) => openOrganizationDetail(organization.id),
              onCreate: () => setOrganizationPageCreateModalOpen(true),
              onActivate: (organization) => {
                const sourceOrganization = organizationPageOrganizations.find((item) => (
                  String(item?.id || "").trim() === String(organization?.id || "").trim()
                ));
                if (sourceOrganization) {
                  setActiveOrganizationFromRecord(sourceOrganization);
                }
              },
              onRename: (organization) => {
                setOrganizationPageSelectedOrganizationId(String(organization?.id || ""));
                setOrganizationPageRenameName(organization?.name || "");
                setOrganizationPageRenameModalOpen(true);
              },
              onOpenDocumentation: () => window.open(__ORGANIZATIONS_DOCUMENTATION_URL__, "_blank", "noopener,noreferrer"),
            }),
            renderOrganizationCreateModal(),
            renderOrganizationRenameModal()
          );
`;

export function createOrganizationsPageOverviewScript(documentationUrl) {
  return ORGANIZATIONS_PAGE_OVERVIEW_TEMPLATE.replace(
    "__ORGANIZATIONS_DOCUMENTATION_URL__",
    JSON.stringify(String(documentationUrl || "").trim()),
  );
}
