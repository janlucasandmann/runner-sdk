export const ORGANIZATIONS_REQUEST_SCOPE_SCRIPT = `        const authRequestHeaders = useMemo(() => ({
          ...baseAuthRequestHeaders,
          ...(String(activeOrganizationId || "").trim()
            ? { [PLAYGROUND_ORGANIZATION_HEADER]: String(activeOrganizationId || "").trim() }
            : {}),
        }), [activeOrganizationId, baseAuthRequestHeaders]);
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
