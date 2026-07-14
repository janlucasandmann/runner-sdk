export const TEAMS_ROLE_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (teamPageActiveTab !== "roles" && teamPageActiveTab !== "permissions") {
            return undefined;
          }
          const frameId = window.requestAnimationFrame(() => {
            const scrollNode = teamPageRef.current;
            if (scrollNode && typeof scrollNode.scrollTop === "number") {
              scrollNode.scrollTop = 0;
            }
            setTeamPermissionChartAnimationKey((current) => current + 1);
          });
          return () => window.cancelAnimationFrame(frameId);
	        }, [teamPageActiveTab, teamPageSelectedRoleId, teamPageSelectedTeamId]);
`;

