export const ASSURANCE_APP_TOP_NAVIGATION_SCRIPT = `        function renderAssurancePageNav() {
          const isOverview = assurancePageMode === "overview";
          const pathItems = [
            { label: "Configure" },
            {
              label: "Assurance",
              onClick: openAssuranceOverviewPage,
            },
          ];
          if (assurancePageMode === "detail" || assurancePageMode === "run") {
            pathItems.push({
              label: selectedAssurancePolicyName || "Assurance Policy",
              onClick: assurancePageMode === "run"
                ? () => openAssurancePolicyDetailPage(
                    selectedAssurancePolicyId,
                    selectedAssurancePolicyName
                  )
                : undefined,
            });
          }
          if (assurancePageMode === "run") {
            pathItems.push({
              label: selectedAssuranceRunName || "Assurance Run",
            });
          }
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems,
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: isOverview
                ? "playground-assurance-overview-controls"
                : "playground-assurance-nav-actions",
              className: isOverview
                ? "playground-tools-overview-controls-slot"
                : "playground-assurance-nav-actions",
            }),
          });
        }

`;
