export const ORGANIZATIONS_ROLE_LIFECYCLE_SCRIPT = `	        useEffect(() => {
	          if (organizationPageActiveTab !== "roles") {
	            return undefined;
	          }
	          const frameId = window.requestAnimationFrame(() => {
	            const scrollNode = organizationPageRef.current;
	            if (scrollNode && typeof scrollNode.scrollTop === "number") {
	              scrollNode.scrollTop = 0;
	            }
	            setOrganizationPermissionChartAnimationKey((current) => current + 1);
	          });
	          return () => window.cancelAnimationFrame(frameId);
	        }, [organizationPageActiveTab, organizationPageSelectedRoleId, organizationPageSelectedOrganizationId]);
	        useEffect(() => {
	          setOrganizationResourceToolbarPopover("");
	          if (organizationPageActiveTab !== "members") {
	            setOrganizationMemberToolbarPopover("");
	            setOrganizationMemberMenuId("");
	            setSelectedOrganizationMemberIds(new Set());
	          }
	        }, [organizationPageActiveTab]);
`;
