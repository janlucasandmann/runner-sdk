export const ORGANIZATIONS_STATE_DIALOGS_SCRIPT = `        const [organizationPageCreateName, setOrganizationPageCreateName] = useState("");
        const [organizationPageCreateModalOpen, setOrganizationPageCreateModalOpen] = useState(false);
        const [organizationPageRenameModalOpen, setOrganizationPageRenameModalOpen] = useState(false);
        const [organizationPageRenameName, setOrganizationPageRenameName] = useState("");
        const [organizationPageRenameDraftOrganizationId, setOrganizationPageRenameDraftOrganizationId] = useState("");
        const [organizationPageDeleteModalOpen, setOrganizationPageDeleteModalOpen] = useState(false);
        const [organizationPageInviteModalOpen, setOrganizationPageInviteModalOpen] = useState(false);
	        const [organizationSubscriptionPlanChooserOpen, setOrganizationSubscriptionPlanChooserOpen] = useState(false);
	        const [organizationSubscriptionBillingInterval, setOrganizationSubscriptionBillingInterval] = useState("monthly");
	        const [organizationSubscriptionSeatCounts, setOrganizationSubscriptionSeatCounts] = useState({});
	        const [organizationPageInviteEmail, setOrganizationPageInviteEmail] = useState("");
	        const [organizationPageInviteRole, setOrganizationPageInviteRole] = useState("member");
	        const [organizationPageActionId, setOrganizationPageActionId] = useState("");
	        const organizationMemberToolbarRef = useRef(null);
	        const [organizationMemberSearchQuery, setOrganizationMemberSearchQuery] = useState("");
	        const [organizationMemberSort, setOrganizationMemberSort] = useState("user");
	        const [organizationMemberSortDirection, setOrganizationMemberSortDirection] = useState("asc");
	        const [organizationMemberFilter, setOrganizationMemberFilter] = useState("active");
	        const [organizationMemberToolbarPopover, setOrganizationMemberToolbarPopover] = useState("");
		        const [organizationMemberMenuId, setOrganizationMemberMenuId] = useState("");
		        const [selectedOrganizationMemberIds, setSelectedOrganizationMemberIds] = useState(() => new Set());

	        useEffect(() => {
	          if (!organizationSubscriptionPlanChooserOpen || typeof document === "undefined") return undefined;
	          const previousOverflow = document.body.style.overflow;
	          const closeOnEscape = (event) => {
	            if (event.key === "Escape") setOrganizationSubscriptionPlanChooserOpen(false);
	          };
	          document.body.style.overflow = "hidden";
	          window.addEventListener("keydown", closeOnEscape);
	          return () => {
	            document.body.style.overflow = previousOverflow;
	            window.removeEventListener("keydown", closeOnEscape);
	          };
	        }, [organizationSubscriptionPlanChooserOpen]);
`;
