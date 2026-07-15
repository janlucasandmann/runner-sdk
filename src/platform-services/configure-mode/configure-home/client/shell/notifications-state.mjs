export const CONFIGURE_HOME_NOTIFICATIONS_STATE_SCRIPT = `        const [productNotifications, setProductNotifications] = useState([]);
        const [readProductNotificationIds, setReadProductNotificationIds] = useState([]);
        const [teamInvitationNotifications, setTeamInvitationNotifications] = useState([]);
        const [readTeamInvitationNotificationIds, setReadTeamInvitationNotificationIds] = useState([]);
        const [organizationInvitationNotifications, setOrganizationInvitationNotifications] = useState([]);
        const [readOrganizationInvitationNotificationIds, setReadOrganizationInvitationNotificationIds] = useState([]);
        const [permissionNotifications, setPermissionNotifications] = useState([]);
	        const [readPermissionNotificationIds, setReadPermissionNotificationIds] = useState(() => (
	          readStoredNotificationIds(PLAYGROUND_PERMISSION_NOTIFICATION_READ_STORAGE_KEY, "session")
	        ));
	        const [readHumanTaskNotificationIds, setReadHumanTaskNotificationIds] = useState(() => (
	          readStoredNotificationIds(PLAYGROUND_HUMAN_TASK_NOTIFICATION_READ_STORAGE_KEY)
	        ));
	        const [emailVerificationNotificationDismissed, setEmailVerificationNotificationDismissed] = useState(false);
        const [notificationsPageSearchQuery, setNotificationsPageSearchQuery] = useState("");
        const [notificationsPageFilter, setNotificationsPageFilter] = useState("all");
        const [notificationsPageSort, setNotificationsPageSort] = useState("newest");
        const [notificationsPageToolbarPopover, setNotificationsPageToolbarPopover] = useState("");
`;
