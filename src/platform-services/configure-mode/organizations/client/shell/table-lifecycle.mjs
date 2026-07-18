export const ORGANIZATIONS_TABLE_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if ((!organizationMemberToolbarPopover && !organizationMemberMenuId) || typeof document === "undefined") {
            return undefined;
          }
          const handlePointerDown = (event) => {
            const target = event.target;
            if (
              target
              && organizationMemberToolbarRef.current
              && organizationMemberToolbarRef.current.contains(target)
            ) {
              return;
            }
            if (
              target
              && typeof target.closest === "function"
              && target.closest(".playground-organization-member-action-shell")
            ) {
              return;
            }
            setOrganizationMemberToolbarPopover("");
            setOrganizationMemberMenuId("");
          };
          document.addEventListener("mousedown", handlePointerDown);
          return () => document.removeEventListener("mousedown", handlePointerDown);
        }, [organizationMemberMenuId, organizationMemberToolbarPopover]);
`;
