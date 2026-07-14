export const MARKETPLACE_PREVIEW_DATABASE_SCRIPT = `      function getPlaygroundResourceTemplatePreviewDatabaseDocuments(template) {
        const templateId = String(template?.id || "").trim();
        if (templateId === "investor-metrics-database") {
          return {
            monthly_metrics: [
              {
                id: "2026_05",
                data: {
                  month: "2026-05",
                  recurringRevenue: 184000,
                  grossMargin: 0.74,
                  burnMultiple: 1.8,
                  activeCustomers: 128,
                  notes: "Expansion revenue offset slower new sales.",
                },
              },
              {
                id: "2026_06_forecast",
                data: {
                  month: "2026-06",
                  recurringRevenue: 203000,
                  grossMargin: 0.76,
                  burnMultiple: 1.6,
                  activeCustomers: 141,
                  notes: "Forecast assumes two enterprise upgrades.",
                },
              },
            ],
            assumptions: [
              {
                id: "pricing",
                data: {
                  owner: "Finance",
                  topic: "Pricing assumptions",
                  basePlan: 499,
                  enterpriseExpansionRate: 0.18,
                  confidence: "medium",
                },
              },
            ],
            updates: [
              {
                id: "investor_update_draft",
                data: {
                  title: "June investor update",
                  status: "draft",
                  highlights: ["Revenue ahead of plan", "Churn stable", "Pipeline quality improving"],
                  nextSteps: ["Validate forecast", "Attach cohort chart"],
                },
              },
            ],
          };
        }
        return {
          accounts: [
            {
              id: "acme_corp",
              data: {
                name: "Acme Corp",
                segment: "Enterprise",
                status: "active",
                owner: "Sales",
                health: "green",
                annualValue: 84000,
              },
            },
            {
              id: "northstar_lab",
              data: {
                name: "Northstar Lab",
                segment: "Mid-market",
                status: "trial",
                owner: "Customer Success",
                health: "yellow",
                annualValue: 24000,
              },
            },
          ],
          contacts: [
            {
              id: "jordan_acme",
              data: {
                accountId: "acme_corp",
                name: "Jordan Lee",
                email: "jordan@example.com",
                role: "VP Operations",
                lastContactedAt: "2026-06-07",
              },
            },
          ],
          follow_ups: [
            {
              id: "renewal_check_in",
              data: {
                accountId: "acme_corp",
                dueAt: "2026-06-21",
                priority: "high",
                summary: "Prepare renewal plan and QBR notes.",
                done: false,
              },
            },
          ],
        };
      }

`;
