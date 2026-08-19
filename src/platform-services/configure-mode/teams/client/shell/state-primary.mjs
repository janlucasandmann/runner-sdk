export const TEAMS_STATE_PRIMARY_SCRIPT = `        const TEAM_SCOPED_ORGANIZATION_STORAGE_KEY = "runner_demo_team_scope_organization_id_v1";
        function readTeamPageOrganizationId() {
          try {
            return String(window.localStorage.getItem(TEAM_SCOPED_ORGANIZATION_STORAGE_KEY) || "").trim();
          } catch (error) {
            return "";
          }
        }
        function writeTeamPageOrganizationId(organizationId) {
          const normalizedOrganizationId = String(organizationId || "").trim();
          try {
            if (normalizedOrganizationId) {
              window.localStorage.setItem(TEAM_SCOPED_ORGANIZATION_STORAGE_KEY, normalizedOrganizationId);
            } else {
              window.localStorage.removeItem(TEAM_SCOPED_ORGANIZATION_STORAGE_KEY);
            }
          } catch (error) {
            // Storage is optional; team access remains request-scoped in memory.
          }
        }

        const teamPageRef = useRef(null);
        const teamPageLoadAbortControllerRef = useRef(null);
        const teamPageLoadSequenceRef = useRef(0);
        const [teamPageLoading, setTeamPageLoading] = useState(false);
        const [teamPageError, setTeamPageError] = useState("");
        const [teamPageRequiresPlan, setTeamPageRequiresPlan] = useState(false);
        const [teamPageOrganizationId, setTeamPageOrganizationId] = useState(() => readTeamPageOrganizationId());
        const [teamPageTeams, setTeamPageTeams] = useState([]);
        const [teamPageSelectedTeamId, setTeamPageSelectedTeamId] = useState("");
        const [teamPageActiveTab, setTeamPageActiveTab] = useState("members");
        const [teamPageDetailSidebarCollapsed, setTeamPageDetailSidebarCollapsed] = useState(false);
        const [teamPageActionsOpen, setTeamPageActionsOpen] = useState(false);
        const [teamPageSelectedRoleId, setTeamPageSelectedRoleId] = useState("member");
        const [teamPermissionChartAnimationKey, setTeamPermissionChartAnimationKey] = useState(0);
	        const [teamPageResourceFilter, setTeamPageResourceFilter] = useState("all");
	        const [teamPageResourceSearchQuery, setTeamPageResourceSearchQuery] = useState("");
				        const [teamPageResourceViewMode, setTeamPageResourceViewMode] = useState("list");
					        const [teamPageResourceToolbarPopover, setTeamPageResourceToolbarPopover] = useState("");
					        const [teamPageResourceMenuId, setTeamPageResourceMenuId] = useState("");
					        const [teamPageResourceSort, setTeamPageResourceSort] = useState("resource");
					        const [teamPageResourceSortDirection, setTeamPageResourceSortDirection] = useState("asc");
					        const [selectedTeamPageResourceIds, setSelectedTeamPageResourceIds] = useState(() => new Set());
					        const [teamPageResourceActionMenuState, setTeamPageResourceActionMenuState] = useState(null);
					        const [teamPageResourceActionMenuClosing, setTeamPageResourceActionMenuClosing] = useState(false);
					        const teamPageResourceActionMenuCloseTimerRef = useRef(null);
					        const [teamPageResourceBulkActionMenuState, setTeamPageResourceBulkActionMenuState] = useState(null);
					        const [teamPageResourceBulkActionMenuClosing, setTeamPageResourceBulkActionMenuClosing] = useState(false);
					        const teamPageResourceBulkActionMenuCloseTimerRef = useRef(null);
				        const [teamPageMemberMenuId, setTeamPageMemberMenuId] = useState("");
		        const [teamPageMemberActionMenuState, setTeamPageMemberActionMenuState] = useState(null);
		        const [teamPageMemberActionMenuClosing, setTeamPageMemberActionMenuClosing] = useState(false);
		        const teamPageMemberActionMenuCloseTimerRef = useRef(null);
		        const [teamPageMemberBulkActionMenuState, setTeamPageMemberBulkActionMenuState] = useState(null);
		        const [teamPageMemberBulkActionMenuClosing, setTeamPageMemberBulkActionMenuClosing] = useState(false);
		        const teamPageMemberBulkActionMenuCloseTimerRef = useRef(null);
		        const teamPageMemberToolbarRef = useRef(null);
		        const [teamPageMemberSearchQuery, setTeamPageMemberSearchQuery] = useState("");
	        const [teamPageMemberSort, setTeamPageMemberSort] = useState("user");
	        const [teamPageMemberSortDirection, setTeamPageMemberSortDirection] = useState("asc");
	        const [teamPageMemberFilter, setTeamPageMemberFilter] = useState("all");
	        const [teamPageMemberToolbarPopover, setTeamPageMemberToolbarPopover] = useState("");
	        const [selectedTeamPageMemberIds, setSelectedTeamPageMemberIds] = useState(() => new Set());
        const [teamPageMembers, setTeamPageMembers] = useState([]);
        const [teamPageInvitations, setTeamPageInvitations] = useState([]);
        const [teamPageShares, setTeamPageShares] = useState([]);
        const [teamPageProjectResourceIndexes, setTeamPageProjectResourceIndexes] = useState({});
        const [teamPageMetronomeWorkflows, setTeamPageMetronomeWorkflows] = useState([]);
        const [teamPageBatchJobs, setTeamPageBatchJobs] = useState([]);

        useEffect(() => {
          writeTeamPageOrganizationId(teamPageOrganizationId);
        }, [teamPageOrganizationId]);

        useEffect(() => {
          setTeamPageActionsOpen(false);
        }, [activePage, teamPageSelectedTeamId]);
`;
