export const FINE_TUNING_APP_SIDEBAR_ENTRY_SCRIPT = String.raw`              {
                id: "fine-tuning",
                label: "Agent Optimization",
                Icon: TestTubeDiagonal,
                active: activePage === "fine-tuning",
                onClick: () => openFineTuningOverviewPage(),
              },
`;
