export const TEAMS_DIALOG_LIFECYCLE_SCRIPT = `	        useEffect(() => {
          if ((!teamPageResourceToolbarPopover && !teamPageResourceMenuId) || typeof document === "undefined") {
            return undefined;
          }
          const handlePointerDown = (event) => {
            const target = event.target;
            if (
              target
              && typeof target.closest === "function"
              && target.closest(".playground-project-resources-new-shell, .playground-project-resources-filter-shell, .playground-project-resources-action-shell")
            ) {
              return;
            }
            setTeamPageResourceToolbarPopover("");
            setTeamPageResourceMenuId("");
          };
          document.addEventListener("mousedown", handlePointerDown);
          return () => document.removeEventListener("mousedown", handlePointerDown);
        }, [teamPageResourceMenuId, teamPageResourceToolbarPopover]);
        useEffect(() => {
          if (!teamPageRenameModalOpen) {
            return undefined;
          }
          if (teamPageRenameModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(teamPageRenameModalCloseTimerRef.current);
            teamPageRenameModalCloseTimerRef.current = null;
          }
          setTeamPageRenameModalClosing(false);
          setTeamPageRenameModalVisible(false);
          const frameId = window.requestAnimationFrame(() => setTeamPageRenameModalVisible(true));
          return () => window.cancelAnimationFrame(frameId);
        }, [teamPageRenameModalOpen]);
        useEffect(() => {
          if (!teamPageInviteModalOpen) {
            return undefined;
          }
          if (teamPageInviteModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(teamPageInviteModalCloseTimerRef.current);
            teamPageInviteModalCloseTimerRef.current = null;
          }
          setTeamPageInviteModalClosing(false);
          setTeamPageInviteModalVisible(false);
          const frameId = window.requestAnimationFrame(() => setTeamPageInviteModalVisible(true));
          return () => window.cancelAnimationFrame(frameId);
        }, [teamPageInviteModalOpen]);
        useEffect(() => {
          if (!teamPageShareModalOpen) {
            return undefined;
          }
          if (teamPageShareModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(teamPageShareModalCloseTimerRef.current);
            teamPageShareModalCloseTimerRef.current = null;
          }
          setTeamPageShareModalClosing(false);
          setTeamPageShareModalVisible(false);
          const frameId = window.requestAnimationFrame(() => setTeamPageShareModalVisible(true));
          return () => window.cancelAnimationFrame(frameId);
        }, [teamPageShareModalOpen]);
        useEffect(() => () => {
          if (typeof window === "undefined") {
            return;
          }
          if (teamPageRenameModalCloseTimerRef.current) {
            window.clearTimeout(teamPageRenameModalCloseTimerRef.current);
          }
          if (teamPageInviteModalCloseTimerRef.current) {
            window.clearTimeout(teamPageInviteModalCloseTimerRef.current);
          }
          if (teamPageShareModalCloseTimerRef.current) {
            window.clearTimeout(teamPageShareModalCloseTimerRef.current);
          }
          if (teamPageLoadAbortControllerRef.current) {
            teamPageLoadAbortControllerRef.current.abort(createFetchAbortReason("AbortError", "Team page unmounted."));
            teamPageLoadAbortControllerRef.current = null;
          }
        }, []);

        function closeTeamPageRenameModal(options = {}) {
          if (!options.force && (teamPageActionId === "rename-team" || teamPageActionId === "delete-team")) {
            return;
          }
          if (teamPageRenameModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(teamPageRenameModalCloseTimerRef.current);
          }
          setTeamPageRenameModalVisible(false);
          setTeamPageRenameModalClosing(true);
          if (typeof window === "undefined") {
            setTeamPageRenameModalOpen(false);
            setTeamPageRenameModalClosing(false);
            return;
          }
          teamPageRenameModalCloseTimerRef.current = window.setTimeout(() => {
            setTeamPageRenameModalOpen(false);
            setTeamPageRenameModalClosing(false);
            teamPageRenameModalCloseTimerRef.current = null;
          }, 75);
        }

        function closeTeamPageInviteModal(options = {}) {
          if (!options.force && teamPageActionId === "invite") {
            return;
          }
          if (teamPageInviteModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(teamPageInviteModalCloseTimerRef.current);
          }
          setTeamPageInviteModalVisible(false);
          setTeamPageInviteModalClosing(true);
          if (typeof window === "undefined") {
            setTeamPageInviteModalOpen(false);
            setTeamPageInviteModalClosing(false);
            return;
          }
          teamPageInviteModalCloseTimerRef.current = window.setTimeout(() => {
            setTeamPageInviteModalOpen(false);
            setTeamPageInviteModalClosing(false);
            teamPageInviteModalCloseTimerRef.current = null;
          }, 75);
        }

        function closeTeamPageShareModal(options = {}) {
          if (!options.force && teamPageActionId === "share") {
            return;
          }
          setTeamPageShareResourcePickerOpen(false);
          setTeamPageShareAccessPickerOpen(false);
          if (teamPageShareModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(teamPageShareModalCloseTimerRef.current);
          }
          setTeamPageShareModalVisible(false);
          setTeamPageShareModalClosing(true);
          if (typeof window === "undefined") {
            setTeamPageShareModalOpen(false);
            setTeamPageShareModalClosing(false);
            return;
          }
          teamPageShareModalCloseTimerRef.current = window.setTimeout(() => {
            setTeamPageShareModalOpen(false);
            setTeamPageShareModalClosing(false);
            teamPageShareModalCloseTimerRef.current = null;
          }, 75);
        }
`;

