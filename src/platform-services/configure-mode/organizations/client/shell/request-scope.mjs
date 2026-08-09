export const ORGANIZATIONS_REQUEST_SCOPE_SCRIPT = `        const requestOrganizationId = String(
          activePage === "team"
            ? (teamPageOrganizationId || activeOrganizationId || "")
            : activeOrganizationId || "",
        ).trim();
        const authRequestHeaders = useMemo(() => ({
          ...baseAuthRequestHeaders,
          ...(requestOrganizationId
            ? { [PLAYGROUND_ORGANIZATION_HEADER]: requestOrganizationId }
            : {}),
        }), [baseAuthRequestHeaders, requestOrganizationId]);
        // The teams collection is user-scoped, not organization-scoped. Keep
        // its request headers independent from the currently selected
        // organization so switching organizations cannot hide teams that the
        // user belongs to in another organization.
        const teamListRequestHeaders = useMemo(() => ({
          ...baseAuthRequestHeaders,
        }), [baseAuthRequestHeaders]);
        const billingOrganizationId = String(
          activePage === "organization" && organizationPageSelectedOrganizationId
            ? organizationPageSelectedOrganizationId
            : activeOrganizationId || "",
        ).trim();
        const billingAuthRequestHeaders = useMemo(() => ({
          ...baseAuthRequestHeaders,
          ...(billingOrganizationId
            ? { [PLAYGROUND_ORGANIZATION_HEADER]: billingOrganizationId }
            : {}),
        }), [baseAuthRequestHeaders, billingOrganizationId]);
`;
