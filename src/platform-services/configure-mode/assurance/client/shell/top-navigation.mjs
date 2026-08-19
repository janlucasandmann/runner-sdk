export const ASSURANCE_APP_TOP_NAVIGATION_SCRIPT = `        function renderAssurancePageNav() {
          const isOverview = assurancePageMode === "overview";
          const pathItems = [
            { label: "Configure" },
            {
              label: "Assurance",
              onClick: () => requestPlatformNavigation(openAssuranceOverviewPage),
            },
          ];
          if (assurancePageMode === "detail" || assurancePageMode === "run") {
            pathItems.push({
              label: selectedAssurancePolicyName || "Assurance Policy",
              onClick: assurancePageMode === "run"
                ? () => requestPlatformNavigation(() => (
                    openAssurancePolicyDetailPage(
                      selectedAssurancePolicyId,
                      selectedAssurancePolicyName
                    )
                  ))
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
            center: isOverview
              ? React.createElement(PlatformSwitch, {
                  className: "playground-assurance-overview-scope-switch",
                  value: assuranceOverviewScope === "created"
                    ? "created"
                    : assuranceOverviewScope === "shared"
                      ? "shared"
                      : "all",
                  options: [
                    { value: "all", label: "All Policies" },
                    { value: "created", label: "Created by me" },
                    { value: "shared", label: "Shared with me" },
                  ],
                  onValueChange: (nextScope) => setAssuranceOverviewScope(
                    nextScope === "created" || nextScope === "shared" ? nextScope : "all"
                  ),
                  ariaLabel: "Assurance policy scope",
                })
              : assurancePageMode === "detail"
                ? React.createElement("div", {
                    id: "playground-assurance-section-controls",
                    className: "playground-assurance-section-controls",
                  })
                : null,
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
