export const CONFIGURE_HOME_NOTIFICATION_STORAGE_KEY_SCRIPT = `        const notificationReadStorageKey = useMemo(
          () => buildNotificationReadStorageKey(sessionState.userId, accountEmail),
          [accountEmail, sessionState.userId]
        );
`;
