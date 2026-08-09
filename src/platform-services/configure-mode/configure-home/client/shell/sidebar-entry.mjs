export const CONFIGURE_HOME_SIDEBAR_ENTRY_SCRIPT = `              {
                id: "configure-home",
                label: "Home",
                Icon: House,
                active: activePage === "configure" && configureHomeTab !== "notifications",
                onClick: () => openConfigureHome(),
              },
`;

export const CONFIGURE_HOME_ADMIN_SIDEBAR_ENTRY_SCRIPT = `              {
                id: "admin-notifications",
                label: "Notifications",
                Icon: Bell,
                active: activePage === "configure" && configureHomeTab === "notifications",
                onClick: openNotificationsPage,
              },
`;
