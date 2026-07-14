export const ORGANIZATIONS_PAGE_IDENTITY_AND_BILLING_SCRIPT = `          const getMemberDisplayName = (member) => {
            const memberUserId = String(member?.userId || member?.user_id || member?.uid || "").trim();
            if (memberUserId && memberUserId === String(sessionState.userId || "").trim()) {
              return getTrustedDisplayName(accountName, accountEmail || sessionState.email || "") || "Me";
            }
            const email = readTeamPageIdentityEmail(member);
            const displayName = readTeamPageIdentityDisplayName(member);
            return getTrustedDisplayName(displayName, email) || email || memberUserId || "Organization member";
          };
	          const renderMemberIdentity = (member) => {
            const displayName = getMemberDisplayName(member);
            const memberUserId = String(member?.userId || member?.user_id || member?.uid || "").trim();
            const email = readTeamPageIdentityEmail(member);
            const detail = email && displayName.toLowerCase() !== email.toLowerCase()
              ? email
              : (memberUserId && memberUserId !== displayName ? memberUserId : "");
            const avatarUrl = normalizeSessionPhotoUrl(
              readTeamPageIdentityAvatarUrl(member)
              || (memberUserId === String(sessionState.userId || "").trim() ? accountAvatarUrl : "")
            );
            return React.createElement("div", { className: "playground-team-member-cell" },
              renderAccountAvatar(
                "playground-team-member-avatar",
                "playground-team-member-avatar-image",
                getAccountInitials(displayName),
                canRenderAvatarImage(avatarUrl) ? avatarUrl : ""
              ),
              React.createElement("div", { className: "playground-team-member-copy" },
                React.createElement("div", { className: "playground-team-table-title" }, displayName),
                detail ? React.createElement("div", { className: "playground-team-table-meta" }, detail) : null
              )
	            );
	          };
	          const renderOrganizationBillingMetric = (label, value, subtitle) => React.createElement("div", {
	              className: "playground-organization-billing-card",
	            },
	              React.createElement("div", { className: "playground-organization-billing-card-label" }, label),
	              React.createElement("div", null,
	                React.createElement("div", { className: "playground-organization-billing-card-value" }, value),
	                subtitle ? React.createElement("div", { className: "playground-organization-billing-card-subtitle" }, subtitle) : null
	              )
	            );
	          const renderOrganizationBillingSnapshot = () => {
	            const summary = organizationPageBillingSummary && typeof organizationPageBillingSummary === "object"
	              ? organizationPageBillingSummary
	              : null;
	            if (!summary) return null;
	            const budget = summary.budget && typeof summary.budget === "object" ? summary.budget : {};
	            const ledger = summary.ledger && typeof summary.ledger === "object" ? summary.ledger : {};
	            const reservationStats = ledger.reservationStats && typeof ledger.reservationStats === "object"
	              ? ledger.reservationStats
	              : {};
	            const ledgerEntries = Array.isArray(ledger.activity?.ledgerEntries)
	              ? ledger.activity.ledgerEntries.slice(0, 4)
	              : [];
	            const builderSeats = summary.builderSeats && typeof summary.builderSeats === "object"
	              ? summary.builderSeats
	              : null;
	            const builderSeatCapacity = builderSeats?.capacity === "unlimited"
	              ? "Unlimited"
	              : String(Math.max(0, Number(builderSeats?.capacity || 0)));
	            const reconciliationMismatch = Boolean(ledger.reconciliation?.mismatch);
	            return React.createElement("div", { className: "playground-organization-billing-snapshot" },
	              React.createElement("div", { className: "playground-organization-billing-header" },
	                React.createElement("div", null,
	                  React.createElement("h2", { className: "playground-organization-billing-title" }, "Organization balance"),
	                  React.createElement("div", { className: "playground-organization-billing-meta" },
	                    String(summary.plan?.name || formatSubscriptionTier(budget.tier))
	                      + " plan · "
	                      + (reconciliationMismatch ? "Ledger reconciliation required" : "Usage and ledger are in sync")
	                  )
	                )
	              ),
	              React.createElement("div", { className: "playground-organization-billing-grid" },
	                renderOrganizationBillingMetric("Available", formatSettingsCurrency(Number(budget.availableBudget || 0)), "Current spendable balance"),
	                renderOrganizationBillingMetric("Period usage", formatSettingsCurrency(Number(budget.currentPeriodUsage || 0)), "Current billing period"),
	                renderOrganizationBillingMetric("Top-up balance", formatSettingsCurrency(Number(budget.topUpBalance || 0)), "Purchased credit balance"),
	                builderSeats
	                  ? renderOrganizationBillingMetric(
	                      "Builder seats",
	                      builderSeats.capacity === "unlimited"
	                        ? String(builderSeats.allocated || 0)
	                        : String(builderSeats.allocated || 0) + " / " + builderSeatCapacity,
	                      String(builderSeats.active || 0) + " active · " + String(builderSeats.reserved || 0) + " reserved"
	                    )
	                  : null,
	                renderOrganizationBillingMetric(
	                  "Pending holds",
	                  formatSettingsCurrency(Number(ledger.pendingReservationHoldUsd || reservationStats.totalPendingHoldUsd || 0)),
	                  String(reservationStats.pendingCount || 0) + " pending reservation" + (Number(reservationStats.pendingCount || 0) === 1 ? "" : "s")
	                )
	              ),
	              ledgerEntries.length
	                ? React.createElement("div", { className: "playground-organization-billing-activity" },
	                    ledgerEntries.map((entry, index) => {
	                      const amount = Number(entry?.amountUsd || 0);
	                      const amountPrefix = amount > 0 ? "+" : amount < 0 ? "-" : "";
	                      const entryLabel = String(entry?.entryType || "Ledger activity")
	                        .replace(/[_-]+/g, " ")
	                        .replace(/\b\w/g, (character) => character.toUpperCase());
	                      return React.createElement("div", {
	                          key: String(entry?.id || entry?.createdAt || "billing-entry-" + index),
	                          className: "playground-organization-billing-activity-row",
	                        },
	                        React.createElement("div", { className: "playground-organization-billing-activity-copy" },
	                          React.createElement("div", { className: "playground-organization-billing-activity-title" }, entryLabel),
	                          React.createElement("div", { className: "playground-organization-billing-activity-meta" }, formatDate(entry?.createdAt) || "Recent activity")
	                        ),
	                        React.createElement("div", { className: "playground-organization-billing-activity-amount" },
	                          amountPrefix + formatSettingsCurrency(Math.abs(amount))
	                        )
	                      );
	                    })
	                  )
	                : null
	            );
	          };
	          const renderOrganizationBillingSection = () => {
	            const billingSections = [
	              { id: "costs-plans", label: "Overview" },
	              { id: "costs-plan-options", label: "Plans" },
	              { id: "costs-records", label: "Invoices" },
	            ];
	            const activeBillingSection = billingSections.some((section) => section.id === organizationPageBillingSection)
	              ? organizationPageBillingSection
	              : "costs-plans";
	            return React.createElement("section", {
	                className: "playground-team-detail-panel playground-organization-billing-panel is-consolidated",
	              },
	              React.createElement("div", {
	                  className: "playground-agents-overview-tabs playground-project-overview-tabs playground-develop-tabs playground-organization-billing-tabs",
	                },
	                React.createElement("div", { className: "playground-project-overview-chart-tabs" },
	                  billingSections.map((section) => React.createElement("button", {
	                      key: section.id,
	                      type: "button",
	                      className: "playground-project-overview-chart-tab playground-develop-tab" + (activeBillingSection === section.id ? " is-active" : ""),
	                      "aria-pressed": activeBillingSection === section.id ? "true" : "false",
	                      onClick: () => setOrganizationPageBillingSection(section.id),
	                    }, section.label)
	                  )
	                )
	              ),
	              activeBillingSection === "costs-plans" ? renderOrganizationBillingSnapshot() : null,
	              renderSettingsPage({
	                section: activeBillingSection,
	                embedded: true,
	                organizationBilling: true,
	                onSectionChange: setOrganizationPageBillingSection,
	              })
	            );
	          };
	          const renderOrganizationUsageSection = () => React.createElement("section", {
	              className: "playground-team-detail-panel playground-organization-billing-panel playground-organization-usage-panel is-consolidated",
	            },
	            renderSettingsPage({
	              section: "costs-overview",
	              embedded: true,
	              organizationBilling: true,
	            })
	          );
`;
