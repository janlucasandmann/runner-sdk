export const TEAMS_TABLE_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (!teamPageRoleMembersPopover || typeof document === "undefined") {
            return undefined;
          }
          const handlePointerDown = (event) => {
            const target = event.target;
            if (target && typeof target.closest === "function" && target.closest(".playground-team-role-assigned-shell")) {
              return;
            }
            setTeamPageRoleMembersPopover("");
          };
          document.addEventListener("mousedown", handlePointerDown);
          return () => document.removeEventListener("mousedown", handlePointerDown);
        }, [teamPageRoleMembersPopover]);
	        useEffect(() => {
	          if (!teamPageMemberMenuId || typeof document === "undefined") {
	            return undefined;
	          }
          const handlePointerDown = (event) => {
            const target = event.target;
            if (target && typeof target.closest === "function" && target.closest(".playground-team-member-action-shell")) {
              return;
            }
            setTeamPageMemberMenuId("");
          };
	          document.addEventListener("mousedown", handlePointerDown);
	          return () => document.removeEventListener("mousedown", handlePointerDown);
	        }, [teamPageMemberMenuId]);
	        useEffect(() => {
	          if (!teamPageMemberToolbarPopover || typeof document === "undefined") {
	            return undefined;
	          }
	          const handlePointerDown = (event) => {
	            const target = event.target;
	            if (
	              target
	              && teamPageMemberToolbarRef.current
	              && teamPageMemberToolbarRef.current.contains(target)
	            ) {
	              return;
	            }
	            setTeamPageMemberToolbarPopover("");
	          };
	          document.addEventListener("mousedown", handlePointerDown);
	          return () => document.removeEventListener("mousedown", handlePointerDown);
	        }, [teamPageMemberToolbarPopover]);
	        useEffect(() => {
			          if (teamPageActiveTab !== "resources") {
			            setTeamPageResourceToolbarPopover("");
			            setTeamPageResourceMenuId("");
			            setSelectedTeamPageResourceIds(new Set());
			            setTeamPageResourceActionMenuState(null);
			            setTeamPageResourceActionMenuClosing(false);
			            setTeamPageResourceBulkActionMenuState(null);
			            setTeamPageResourceBulkActionMenuClosing(false);
			          }
		          if (teamPageActiveTab !== "members") {
		            setTeamPageMemberMenuId("");
		            setTeamPageMemberActionMenuState(null);
		            setTeamPageMemberActionMenuClosing(false);
		            setTeamPageMemberBulkActionMenuState(null);
		            setTeamPageMemberBulkActionMenuClosing(false);
		            setTeamPageMemberToolbarPopover("");
		            setSelectedTeamPageMemberIds(new Set());
		          }
		        }, [teamPageActiveTab]);
		        useEffect(() => {
			          setSelectedTeamPageMemberIds(new Set());
			          setSelectedTeamPageResourceIds(new Set());
			          setTeamPageResourceActionMenuState(null);
			          setTeamPageResourceActionMenuClosing(false);
			          setTeamPageResourceBulkActionMenuState(null);
			          setTeamPageResourceBulkActionMenuClosing(false);
			          setTeamPageMemberMenuId("");
		          setTeamPageMemberActionMenuState(null);
		          setTeamPageMemberActionMenuClosing(false);
		          setTeamPageMemberBulkActionMenuState(null);
		          setTeamPageMemberBulkActionMenuClosing(false);
		          setTeamPageMemberToolbarPopover("");
		        }, [teamPageSelectedTeamId]);
		        useEffect(() => () => {
		          [
		            teamPageMemberActionMenuCloseTimerRef,
		            teamPageMemberBulkActionMenuCloseTimerRef,
		            teamPageResourceActionMenuCloseTimerRef,
		            teamPageResourceBulkActionMenuCloseTimerRef,
		          ].forEach((timerRef) => {
		            if (timerRef.current !== null && typeof window !== "undefined") {
		              window.clearTimeout(timerRef.current);
		              timerRef.current = null;
		            }
		          });
		        }, []);
	        useEffect(() => {
	          if ((!teamOverviewToolbarPopover && !teamOverviewMenuId) || typeof document === "undefined") {
	            return undefined;
	          }
          const handlePointerDown = (event) => {
            const target = event.target;
            if (
              target
              && teamOverviewToolbarRef.current
              && teamOverviewToolbarRef.current.contains(target)
            ) {
              return;
            }
            if (
              target
              && typeof target.closest === "function"
              && target.closest(".playground-team-overview-action-shell")
            ) {
              return;
            }
            setTeamOverviewToolbarPopover("");
            setTeamOverviewMenuId("");
          };
	          document.addEventListener("mousedown", handlePointerDown);
	          return () => document.removeEventListener("mousedown", handlePointerDown);
	        }, [teamOverviewMenuId, teamOverviewToolbarPopover]);
`;

