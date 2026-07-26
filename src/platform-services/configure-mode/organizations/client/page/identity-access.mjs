export const ORGANIZATIONS_PAGE_IDENTITY_ACCESS_SCRIPT = `
          const renderOrganizationIdentityAccess = () => React.createElement(
            OrganizationAccessControlPage,
            {
              organizationId: String(selectedOrganization?.id || ""),
              organizationName: String(selectedOrganization?.name || "Organization"),
              apiBase: proxyBackendBase,
              requestHeaders: {
                ...baseAuthRequestHeaders,
                [PLAYGROUND_ORGANIZATION_HEADER]: String(selectedOrganization?.id || ""),
              },
              resources: organizationPageResources,
              canManage: canManageOrganization,
            }
          );
`;
