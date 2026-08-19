export const SETTINGS_MODAL_NAVIGATION_SCRIPT = String.raw`        function closeSettingsModal() {
          setSettingsDataControlCategory("");
          setSettingsModalOpen(false);
        }

        const loadSettingsNotificationPreferences = useCallback(async function loadSettingsNotificationPreferences() {
          const storedPreferences = readStoredSettingsNotificationPreferences(
            settingsNotificationPreferenceStorageKey
          );
          setSettingsNotificationPreferences(storedPreferences);
          setSettingsNotificationPreferencesError("");
          if (!hasRealAccess) {
            setSettingsNotificationPreferencesLoading(false);
            return storedPreferences;
          }

          setSettingsNotificationPreferencesLoading(true);
          try {
            const { response, data } = await fetchJsonWithTimeout(
              proxyBackendBase + "/notifications/preferences",
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders,
              },
              PLAYGROUND_NOTIFICATION_REQUEST_TIMEOUT_MS
            );
            if (!response.ok) {
              return storedPreferences;
            }
            const preferences = normalizeSettingsNotificationPreferences(
              data?.preferences || data?.data?.preferences || data?.data
            );
            setSettingsNotificationPreferences(preferences);
            writeStoredSettingsNotificationPreferences(
              settingsNotificationPreferenceStorageKey,
              preferences
            );
            return preferences;
          } catch {
            return storedPreferences;
          } finally {
            setSettingsNotificationPreferencesLoading(false);
          }
        }, [
          hasRealAccess,
          proxyBackendBase,
          requestHeadersSignature,
          settingsNotificationPreferenceStorageKey,
        ]);

        useEffect(() => {
          void loadSettingsNotificationPreferences();
        }, [loadSettingsNotificationPreferences]);

        const updateSettingsNotificationPreference = useCallback(async function updateSettingsNotificationPreference(key, enabled) {
          if (!SETTINGS_NOTIFICATION_PREFERENCE_KEYS.includes(key)) {
            return;
          }
          const nextPreferences = normalizeSettingsNotificationPreferences({
            ...settingsNotificationPreferences,
            [key]: Boolean(enabled),
          });
          setSettingsNotificationPreferences(nextPreferences);
          setSettingsNotificationPreferencesError("");
          writeStoredSettingsNotificationPreferences(
            settingsNotificationPreferenceStorageKey,
            nextPreferences
          );
          if (!hasRealAccess) {
            return;
          }

          setSettingsNotificationPreferenceSavingKey(key);
          try {
            const { response, data } = await fetchJsonWithTimeout(
              proxyBackendBase + "/notifications/preferences",
              {
                method: "PUT",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ preferences: { [key]: Boolean(enabled) } }),
              },
              PLAYGROUND_NOTIFICATION_REQUEST_TIMEOUT_MS
            );
            if (!response.ok) {
              return;
            }
            const synchronizedPreferences = normalizeSettingsNotificationPreferences(
              data?.preferences || data?.data?.preferences || data?.data
            );
            setSettingsNotificationPreferences(synchronizedPreferences);
            writeStoredSettingsNotificationPreferences(
              settingsNotificationPreferenceStorageKey,
              synchronizedPreferences
            );
          } catch {
            // Local persistence remains authoritative while an older control API is being upgraded.
          } finally {
            setSettingsNotificationPreferenceSavingKey("");
          }
        }, [
          hasRealAccess,
          proxyBackendBase,
          requestHeadersSignature,
          settingsNotificationPreferenceStorageKey,
          settingsNotificationPreferences,
        ]);

        const deleteSettingsDataControlCategory = useCallback(async function deleteSettingsDataControlCategory(category) {
          const normalizedCategory = String(category || "").trim();
          if (!normalizedCategory) {
            throw new Error("Choose a resource category to delete.");
          }
          if (!hasRealAccess) {
            throw new Error("Sign in to delete account resources.");
          }

          const { response, data } = await fetchJsonWithTimeout(
            proxyBackendBase + "/account/data-controls/" + encodeURIComponent(normalizedCategory),
            {
              method: "DELETE",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ confirmation: normalizedCategory }),
            },
            120000
          );
          if (!response.ok) {
            throw new Error(
              data?.message
              || data?.details
              || data?.error
              || "The selected resources could not be deleted."
            );
          }

          if (normalizedCategory === "imagine") {
            try {
              window.localStorage.removeItem("runner_demo_imagine_custom_templates_v1");
              window.localStorage.removeItem("runner_demo_imagine_favourite_template_ids_v1");
            } catch {}
            void fetch("/api/aios/user/imagine-preferences", {
              method: "DELETE",
              credentials: "include",
            }).catch(() => undefined);
          }

          const deletedCount = Math.max(0, Number(data?.deletedCount || 0));
          setSettingsDataControlCategory("");
          setSettingsDataControlSuccess(
            deletedCount === 0
              ? "The selected owned resources were permanently deleted."
              : deletedCount === 1
              ? "1 owned resource was permanently deleted."
              : deletedCount + " owned resources were permanently deleted."
          );
          window.dispatchEvent(new CustomEvent("platform:account-data-deleted", {
            detail: { category: normalizedCategory, deletedCount },
          }));
          return data;
        }, [
          hasRealAccess,
          proxyBackendBase,
          requestHeadersSignature,
        ]);

        function openSettingsModal(sectionId) {
          const requestedSectionId = typeof sectionId === "string" && sectionId.trim()
            ? sectionId.trim()
            : "profile";
          const normalizedSectionId = requestedSectionId === "api" ? "profile" : requestedSectionId;

          setAccountMenuOpen(false);
          setNotificationsOpen(false);

          if (normalizedSectionId === "inference") {
            setSettingsModalOpen(false);
            openInferencePage();
            return;
          }
          if (normalizedSectionId === "costs-overview") {
            setSettingsModalOpen(false);
            openOrganizationBillingPage("usage");
            return;
          }
          if (["costs-plans", "costs-plan-options", "costs-records"].includes(normalizedSectionId)) {
            setSettingsModalOpen(false);
            openOrganizationBillingPage("billing", normalizedSectionId);
            return;
          }
          if (normalizedSectionId === "integrations") {
            setSettingsModalOpen(false);
            openToolsView("tags");
            return;
          }
          if (normalizedSectionId === "webhooks") {
            setSettingsModalOpen(false);
            openDevelopWebhooksPage();
            return;
          }

          setSettingsSection(
            ["profile", "notifications", "password", "data-controls", "delete"].includes(normalizedSectionId)
              ? normalizedSectionId
              : "profile"
          );
          setSettingsModalOpen(true);
        }
`;
