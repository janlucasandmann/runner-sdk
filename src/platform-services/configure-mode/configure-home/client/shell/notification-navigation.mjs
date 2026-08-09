export const CONFIGURE_HOME_NOTIFICATION_NAVIGATION_SCRIPT = `        function openNotificationsPage() {
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setSidebarWorkspaceMode("admin");
          setConfigureHomeTab("notifications");
	          setResourcesHeaderState({
	            mode: "overview",
	            title: "",
	          });
	          setActivePage("configure");
	          window.dispatchEvent(new Event(PLAYGROUND_NOTIFICATION_REFRESH_EVENT));
	        }
`;
