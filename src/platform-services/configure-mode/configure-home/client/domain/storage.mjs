export const CONFIGURE_HOME_NOTIFICATION_STORAGE_SCRIPT = `      function normalizeNotificationStorageId(value) {
        return typeof value === "string" && value.trim() ? value.trim() : "";
      }

      function readStoredNotificationIds(key, storageType = "local") {
        try {
          const storage = storageType === "session" ? sessionStorage : localStorage;
          const raw = storage.getItem(key);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed)
            ? parsed.map(normalizeNotificationStorageId).filter(Boolean)
            : [];
        } catch {
          return [];
        }
      }

      function writeStoredNotificationIds(key, ids, storageType = "local") {
        try {
          const storage = storageType === "session" ? sessionStorage : localStorage;
          const uniqueIds = Array.from(new Set((Array.isArray(ids) ? ids : []).map(normalizeNotificationStorageId).filter(Boolean)));
          storage.setItem(key, JSON.stringify(uniqueIds.slice(0, 500)));
        } catch {}
      }

      function buildNotificationReadStorageKey(userId, email) {
        const accountKey = String(userId || email || "anonymous")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9._:-]+/g, "_")
          .slice(0, 160) || "anonymous";
        return PLAYGROUND_NOTIFICATION_READ_STORAGE_PREFIX + ":" + accountKey;
      }
`;
