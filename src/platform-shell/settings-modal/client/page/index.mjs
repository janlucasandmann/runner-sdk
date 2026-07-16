export function createSettingsModalPageScript(options = {}) {
  const inferencePageCaseScript = typeof options.inferencePageCaseScript === "string"
    ? options.inferencePageCaseScript
    : "";
  const apiKeysLegacySettingsCase = typeof options.apiKeysLegacySettingsCase === "string"
    ? options.apiKeysLegacySettingsCase
    : "";
  const webhooksDocumentationUrl = typeof options.webhooksDocumentationUrl === "string"
    ? options.webhooksDocumentationUrl
    : "";

  return String.raw`        function renderSettingsSurface(options = {}) {
          const isEmbeddedSettingsPage = options.embedded === true;
          const isOrganizationBillingSurface = options.organizationBilling === true;
          const requestedSettingsSection = options.section || settingsSection;
          const normalizedSettingsSection = requestedSettingsSection === "password" || requestedSettingsSection === "delete"
            ? "profile"
            : requestedSettingsSection;
	          const billingSectionIds = ["costs-plans", "costs-plan-options", "costs-records", "costs-overview"];
          const effectiveSettingsSection = normalizedSettingsSection === "api"
            ? "profile"
            : !isOrganizationBillingSurface && billingSectionIds.includes(normalizedSettingsSection)
              ? "profile"
              : normalizedSettingsSection;
	          const navigateSettingsSection = typeof options.onSectionChange === "function"
	            ? options.onSectionChange
	            : setSettingsSection;
	          const settingsTabs = [
	            { id: "profile", label: "Profile", title: "Profile" },
	          ];

	          const selectedSection = effectiveSettingsSection === "inference"
              ? { id: "inference", label: "Inference", title: "Inference" }
              : effectiveSettingsSection === "costs-overview"
                ? { id: "costs-overview", label: "Usage", title: "Usage Details" }
              : settingsTabs.find((item) => item.id === effectiveSettingsSection) || settingsTabs[0];

          const settingsDiscordAccountLabel = settingsDiscordStatus?.discordUsername || "";
          const settingsTelegramAccountLabel = getSettingsTelegramDisplayName(settingsTelegramStatus);

          const renderSettingsPlanTable = () => {
            const fallbackTierInfo = {
              id: "sandbox",
              name: "Sandbox",
              monthlyPrice: 0,
              computeTokens: 100,
              description: "Get started with basic usage. Perfect for trying out the platform.",
            };
            const userTier = settingsCurrentTierId || "sandbox";
            const currentTierInfo = SETTINGS_PLAN_CATALOG.find((tier) => tier.id === userTier) || fallbackTierInfo;
            const outlinedTierId = userTier === "sandbox" ? "builder" : userTier;
            const hasPaidActiveSubscription = settingsSubscriptions.some((subscription) =>
              ["active", "on_trial", "past_due"].includes(String(subscription.status || "").toLowerCase()) && !subscription.cancelled
            );

            return React.createElement("div", { className: "playground-settings-plan-table" },
              getSettingsPlanOptions(userTier).map((plan) => {
                const isCurrentTier = plan.id === userTier;
                const isOutlined = plan.id === outlinedTierId;
                const hasMonthlyPrice = typeof plan.monthlyPrice === "number" && Number.isFinite(plan.monthlyPrice);
                const planFeatures = getSettingsPlanFeatures(plan.id, Number(plan.computeTokens || 0));
                const activeSubscription = settingsSubscriptions.find((subscription) =>
                  normalizeSettingsTierId(subscription.tier) === plan.id
                  && ["active", "on_trial", "past_due"].includes(String(subscription.status || "").toLowerCase())
                  && !subscription.cancelled
                );
                const cancelledSubscription = settingsSubscriptions.find((subscription) =>
                  normalizeSettingsTierId(subscription.tier) === plan.id
                  && subscription.cancelled
                  && subscription.endsAt
                  && new Date(subscription.endsAt) > new Date()
                );
                const currentPrice = Number(currentTierInfo.monthlyPrice || 0);
                const isUpgrade = Number(plan.monthlyPrice || 0) > currentPrice;
                let actionContent = null;

                if (settingsBudgetStatus?.subscriptionSource === "apple" && userTier !== "sandbox") {
                  actionContent = isCurrentTier
                    ? React.createElement("div", { className: "playground-settings-plan-card-cta-static" }, "Current Plan")
                    : React.createElement("div", { className: "playground-settings-plan-card-cta-static is-apple" }, "Manage on your iPhone or iPad");
                } else if (isCurrentTier && activeSubscription) {
                  actionContent = React.createElement("button", {
                      type: "button",
                      onClick: () => {
                        void handleSettingsCancelSubscription(activeSubscription.id);
                      },
                      disabled: settingsSubscriptionActionId === activeSubscription.id,
                      className: "playground-settings-plan-card-cta-button is-danger",
                    },
                      settingsSubscriptionActionId === activeSubscription.id
                        ? React.createElement("span", null, "Cancelling...")
                        : "Cancel Subscription"
                    );
                } else if (isCurrentTier && cancelledSubscription) {
                  actionContent = React.createElement("button", {
                      type: "button",
                      onClick: () => {
                        void handleSettingsReactivateSubscription(cancelledSubscription.id);
                      },
                      disabled: settingsSubscriptionActionId === cancelledSubscription.id,
                      className: "playground-settings-plan-card-cta-button is-light",
                    },
                      settingsSubscriptionActionId === cancelledSubscription.id
                        ? React.createElement("span", null, "Reactivating...")
                        : "Resubscribe"
                    );
                } else if (isCurrentTier) {
                  actionContent = React.createElement("div", { className: "playground-settings-plan-card-cta-static" }, "Current Plan");
                } else if (plan.id === "enterprise") {
                  actionContent = React.createElement(PlatformButton, {
                    variant: "secondary",
                    size: "medium",
                    type: "button",
                    onClick: openSettingsContactSales,
                    className: "playground-settings-plan-card-cta-button is-light",
                  }, "Contact Sales");
                } else if (hasPaidActiveSubscription) {
                  actionContent = React.createElement("button", {
                      type: "button",
                      onClick: () => {
                        void handleSettingsChangePlan(plan.id);
                      },
                      disabled: settingsSubscriptionActionId === plan.id,
                      className: isUpgrade
                        ? "playground-settings-plan-card-cta-button is-light"
                        : "playground-settings-plan-card-cta-button is-muted",
                    },
                      settingsSubscriptionActionId === plan.id
                        ? React.createElement("span", null, "Loading...")
                        : (isUpgrade ? "Upgrade to " + plan.name : "Downgrade to " + plan.name)
                    );
                } else {
                  actionContent = React.createElement(PlatformButton, {
                    variant: plan.id === "builder" ? "primary" : "secondary",
                    size: "medium",
                      type: "button",
                      onClick: () => {
                        void handleSettingsSubscribe(plan.id);
                      },
                      disabled: settingsCheckoutLoading,
                      className: plan.id === "builder"
                        ? "playground-settings-plan-card-cta-button is-primary"
                        : "playground-settings-plan-card-cta-button is-light",
                    },
                      settingsCheckoutLoading
                        ? React.createElement("span", null, "Loading...")
                        : "Start with " + plan.name
                    );
                }

                return React.createElement("section", {
                    key: plan.id,
                    className: "playground-settings-plan-table-card" + (isOutlined ? " is-outlined" : ""),
                  },
                    React.createElement("div", { className: "playground-settings-plan-table-heading" },
                      React.createElement("div", { className: "playground-settings-plan-table-name" }, plan.name),
                      isCurrentTier && cancelledSubscription
                        ? React.createElement("span", { className: "playground-settings-plan-table-badge is-current" }, "Cancels " + formatSettingsDate(cancelledSubscription.endsAt))
                        : isCurrentTier
                          ? React.createElement("span", { className: "playground-settings-plan-table-badge is-current" }, "Current")
                          : userTier === "sandbox" && plan.id === "builder"
                            ? React.createElement("span", { className: "playground-settings-plan-table-badge" }, "Recommended")
                            : null
                    ),
                    React.createElement("div", { className: "playground-settings-plan-table-price" },
                      hasMonthlyPrice ? "$" + plan.monthlyPrice : "Custom",
                      hasMonthlyPrice
                        ? React.createElement("span", { className: "playground-settings-plan-table-price-unit" }, " " + (plan.billingLabel || "/ month"))
                        : null
                    ),
                    React.createElement("div", { className: "playground-settings-plan-table-description" }, plan.description),
                    React.createElement("div", { className: "playground-settings-plan-table-cta" }, actionContent),
                    React.createElement("ul", { className: "playground-settings-plan-table-features" },
                      planFeatures.map((feature, index) => {
                        const FeatureIcon = feature.icon;
                        return React.createElement("li", {
                            key: plan.id + ":plan-table-feature:" + index,
                            className: "playground-settings-plan-table-feature" + (index === 0 ? " is-emphasis" : ""),
                          },
                            React.createElement(FeatureIcon, { className: "playground-settings-plan-table-feature-icon", strokeWidth: 1.8 }),
                            React.createElement("span", null, feature.text)
                          );
                      })
                    )
                  );
              })
            );
          };

          let detailContent = null;

          switch (effectiveSettingsSection) {
            case "costs-plans":
              detailContent = (() => {
                const fallbackTierInfo = {
                  id: "sandbox",
                  name: "Sandbox",
                  monthlyPrice: 0,
                  computeTokens: 100,
                  description: "Get started with basic usage. Perfect for trying out the platform.",
                };
                const userTier = settingsCurrentTierId;
                const tierInfo = SETTINGS_PLAN_CATALOG.find((tier) => tier.id === userTier) || fallbackTierInfo;
                const includedTierQuotaCT = Math.max(
                  settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["includedCredits", "includedTierQuota"])),
                  settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["tierQuota"])),
                  Number(tierInfo.computeTokens || fallbackTierInfo.computeTokens)
                );
                const topUpBalanceCT = Math.max(0, settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["topUpBalance", "topUpCredits"])));
                const hasTopUpBalance = topUpBalanceCT > 0;
                const totalUsedCT = Math.max(
                  Number(settingsUsageSummary?.totals?.totalCT || 0),
                  settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["currentPeriodUsage", "usage", "usedCredits"]))
                );
                const remainingPlanCT = Math.max(0, includedTierQuotaCT - totalUsedCT);
                const totalRemainingCT = remainingPlanCT + topUpBalanceCT;
                const totalBudgetCT = Math.max(totalRemainingCT, includedTierQuotaCT + topUpBalanceCT, 1);
                const remainingPercent = totalBudgetCT > 0 ? clampSettingsPercentage((totalRemainingCT / totalBudgetCT) * 100) : 0;
                const usagePercent = includedTierQuotaCT > 0 ? Math.round((totalUsedCT / includedTierQuotaCT) * 100) : 0;
                const selectedTopUpPackage = SETTINGS_TOP_UP_CATALOG.find((pkg) => pkg.id === settingsSelectedTopUpId) || SETTINGS_TOP_UP_CATALOG[1] || SETTINGS_TOP_UP_CATALOG[0] || null;
                const periodStartDate = settingsBudgetStatus?.periodStartDate ? new Date(settingsBudgetStatus.periodStartDate) : null;
                const periodEndDate = settingsBudgetStatus?.periodEndDate ? new Date(settingsBudgetStatus.periodEndDate) : null;
                const hasValidPeriodDates = Boolean(
                  periodStartDate
                  && periodEndDate
                  && !Number.isNaN(periodStartDate.getTime())
                  && !Number.isNaN(periodEndDate.getTime())
                );
                const budgetPeriodLabel = new Date().toLocaleDateString("en-US", { month: "long" }) + " Budget";
                const daysUntilRefresh = hasValidPeriodDates
                  ? Math.max(0, Math.ceil((periodEndDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                  : null;
                const resetCopy = hasValidPeriodDates
                  ? (daysUntilRefresh <= 0
                    ? tierInfo.name + " Plan, refreshing today."
                    : tierInfo.name + " Plan, refreshing in " + daysUntilRefresh + " day" + (daysUntilRefresh === 1 ? "" : "s") + ".")
                  : tierInfo.name + " Plan, refreshing with your next billing cycle.";
                const hasPaidActiveSubscription = settingsSubscriptions.some((subscription) =>
                  ["active", "on_trial", "past_due"].includes(String(subscription.status || "").toLowerCase()) && !subscription.cancelled
                );
                const currentCancelledSubscription = settingsSubscriptions.find((subscription) =>
                  normalizeSettingsTierId(subscription?.tier) === userTier
                  && subscription?.cancelled
                  && (!subscription?.endsAt || new Date(subscription.endsAt) > new Date())
                ) || null;
                const currentCancelledSubscriptionCopy = currentCancelledSubscription?.endsAt
                  ? "Your " + tierInfo.name + " subscription has been cancelled and remains active until " + formatSettingsDate(currentCancelledSubscription.endsAt) + "."
                  : "Your " + tierInfo.name + " subscription has been cancelled and remains active until the end of the current billing period.";

                const renderPlanCards = React.createElement("div", { className: "playground-settings-plan-grid" },
                  getSettingsPlanOptions(userTier).map((plan) => {
                    const isCurrentTier = plan.id === userTier;
                    const isHighlighted = Boolean(plan.highlighted);
                    const hasMonthlyPrice = typeof plan.monthlyPrice === "number" && Number.isFinite(plan.monthlyPrice);
                    const planFeatures = getSettingsPlanFeatures(plan.id, Number(plan.computeTokens || 0));
                    const activeSubscription = settingsSubscriptions.find((subscription) =>
                      normalizeSettingsTierId(subscription.tier) === plan.id
                      && ["active", "on_trial", "past_due"].includes(String(subscription.status || "").toLowerCase())
                      && !subscription.cancelled
                    );
                    const cancelledSubscription = settingsSubscriptions.find((subscription) =>
                      normalizeSettingsTierId(subscription.tier) === plan.id
                      && subscription.cancelled
                      && subscription.endsAt
                      && new Date(subscription.endsAt) > new Date()
                    );
                    const currentPrice = Number(tierInfo.monthlyPrice || 0);
                    const isUpgrade = Number(plan.monthlyPrice || 0) > currentPrice;
                    let actionContent = null;

                    if (settingsBudgetStatus?.subscriptionSource === "apple" && userTier !== "sandbox") {
                      actionContent = isCurrentTier
                        ? React.createElement("div", { className: "playground-settings-plan-card-cta-static" }, "Current Plan")
                        : React.createElement("div", { className: "playground-settings-plan-card-cta-static is-apple" }, "Manage on your iPhone or iPad");
                    } else if (isCurrentTier && activeSubscription) {
                      actionContent = React.createElement("button", {
                          type: "button",
                          onClick: () => {
                            setSettingsChangePlanModalOpen(false);
                            void handleSettingsCancelSubscription(activeSubscription.id);
                          },
                          disabled: settingsSubscriptionActionId === activeSubscription.id,
                          className: "playground-settings-plan-card-cta-button is-danger",
                        },
                          settingsSubscriptionActionId === activeSubscription.id
                            ? React.createElement("span", null, "Cancelling...")
                            : "Cancel Subscription"
                        );
                    } else if (isCurrentTier && cancelledSubscription) {
                      actionContent = React.createElement("button", {
                          type: "button",
                          onClick: () => {
                            setSettingsChangePlanModalOpen(false);
                            void handleSettingsReactivateSubscription(cancelledSubscription.id);
                          },
                          disabled: settingsSubscriptionActionId === cancelledSubscription.id,
                          className: "playground-settings-plan-card-cta-button is-light",
                        },
                          settingsSubscriptionActionId === cancelledSubscription.id
                            ? React.createElement("span", null, "Reactivating...")
                            : "Resubscribe"
                        );
                    } else if (isCurrentTier) {
                      actionContent = React.createElement("div", { className: "playground-settings-plan-card-cta-static" }, "Current Plan");
                    } else if (plan.id === "enterprise") {
                      actionContent = React.createElement(PlatformButton, {
                        variant: "secondary",
                        size: "medium",
                        type: "button",
                        onClick: () => {
                          setSettingsChangePlanModalOpen(false);
                          openSettingsContactSales();
                        },
                        className: "playground-settings-plan-card-cta-button is-light",
                      }, "Contact Sales");
                    } else if (hasPaidActiveSubscription) {
                      const actionClassName = isUpgrade
                        ? (isHighlighted ? "playground-settings-plan-card-cta-button is-primary" : "playground-settings-plan-card-cta-button is-light")
                        : "playground-settings-plan-card-cta-button is-muted";
                      actionContent = React.createElement("button", {
                          type: "button",
                          onClick: () => {
                            setSettingsChangePlanModalOpen(false);
                            void handleSettingsChangePlan(plan.id);
                          },
                          disabled: settingsSubscriptionActionId === plan.id,
                          className: actionClassName,
                        },
                          settingsSubscriptionActionId === plan.id
                            ? React.createElement("span", null, "Loading...")
                            : (isUpgrade ? "Upgrade to " + plan.name : "Downgrade to " + plan.name)
                        );
                    } else {
                      actionContent = React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                          type: "button",
                          onClick: () => {
                            setSettingsChangePlanModalOpen(false);
                            void handleSettingsSubscribe(plan.id);
                          },
                          disabled: settingsCheckoutLoading,
                          className: isHighlighted
                            ? "playground-settings-plan-card-cta-button is-primary"
                            : "playground-settings-plan-card-cta-button is-light",
                        },
                          settingsCheckoutLoading
                            ? React.createElement("span", null, "Loading...")
                            : "Start with " + plan.name
                        );
                    }

                    return React.createElement("div", {
                        key: plan.id,
                        className: "playground-settings-plan-card-app"
                          + (isHighlighted ? " is-highlighted" : "")
                          + (isCurrentTier ? " is-current" : ""),
                      },
                        React.createElement("div", { className: "playground-settings-plan-card-header" },
                          React.createElement("span", { className: "playground-settings-plan-card-title" }, plan.name),
                          isCurrentTier && cancelledSubscription
                            ? React.createElement("span", { className: "playground-settings-plan-card-badge is-cancelled" }, "Cancels " + formatSettingsDate(cancelledSubscription.endsAt))
                            : isCurrentTier
                              ? React.createElement("span", { className: "playground-settings-plan-card-badge" }, "Current Plan")
                              : null
                        ),
                        React.createElement("div", { className: "playground-settings-plan-card-price" },
                          hasMonthlyPrice ? "$" + plan.monthlyPrice : "Custom",
                          hasMonthlyPrice
                            ? React.createElement("span", { className: "playground-settings-plan-card-price-unit" }, " " + (plan.billingLabel || "/ month"))
                            : null
                        ),
                        React.createElement("div", { className: "playground-settings-plan-card-description" }, plan.description),
                        React.createElement("div", { className: "playground-settings-plan-card-cta" }, actionContent),
                        React.createElement("ul", { className: "playground-settings-plan-card-features" },
                          planFeatures.map((feature, index) => {
                            const FeatureIcon = feature.icon;
                            return React.createElement("li", {
                                key: plan.id + ":" + index,
                                className: "playground-settings-plan-card-feature" + (index === 0 ? " is-emphasis" : ""),
                              },
                                React.createElement(FeatureIcon, { className: "playground-settings-plan-card-feature-icon", width: 16, height: 16, strokeWidth: 1.8 }),
                                React.createElement("span", null, feature.text)
                              );
                          })
                        )
                      );
                  })
                );

                const plansMenu = React.createElement("div", {
                    className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-settings-plans-menu-anchor",
                    ref: settingsPlansMenuRef,
                  },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-content-menu-button",
                      "aria-label": "Plan settings",
                      "aria-expanded": settingsPlansMenuOpen ? "true" : "false",
                      onClick: () => setSettingsPlansMenuOpen((current) => !current),
                    }, React.createElement(Settings2, { className: "playground-content-menu-icon", strokeWidth: 1.75 })),
                    settingsPlansMenuOpen
                      ? React.createElement(PlatformPopupSurface, {
                          className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                          onClick: (event) => event.stopPropagation(),
                        },
                          React.createElement("button", {
                            type: "button",
                            className: "tb-popup-row",
                            onClick: () => {
                              setSettingsPlansMenuOpen(false);
                              navigateSettingsSection("costs-plan-options");
                            },
                          },
                            React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, "Plans")
                            )
                          )
                        )
                      : null
                  );

                const changePlanModal = settingsChangePlanModalOpen
                  ? React.createElement(PlatformModalBackdrop, {
                      className: "playground-settings-modal-backdrop",
                      onClick: () => setSettingsChangePlanModalOpen(false),
                    },
                        React.createElement(PlatformModalSurface, {
                          className: "playground-settings-modal is-plan-selector",
                          onClick: (event) => event.stopPropagation(),
                        },
                        React.createElement("div", { className: "playground-settings-modal-header" },
                          React.createElement("div", null,
                            React.createElement("div", { className: "playground-settings-card-title" }, "Change Plan"),
                            React.createElement("div", { className: "playground-settings-muted-copy", style: { marginTop: "4px" } }, "Choose the subscription that fits your monthly compute budget.")
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-settings-icon-button",
                            onClick: () => setSettingsChangePlanModalOpen(false),
                          }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.8 }))
                        ),
                        renderSettingsBanner("error", settingsBillingError),
                        renderSettingsBanner("success", settingsBillingSuccess),
                        settingsBudgetStatus?.subscriptionSource === "apple" && settingsCurrentTierId !== "sandbox"
                          ? React.createElement("div", { className: "playground-settings-plan-system-note", style: { marginBottom: "16px" } },
                              React.createElement("div", { className: "playground-settings-plan-system-note-icon" }, "IOS"),
                              React.createElement("div", null,
                                React.createElement("div", { className: "playground-settings-plan-system-note-title" }, "Subscription managed through iPhone or iPad"),
                                React.createElement("div", { className: "playground-settings-plan-system-note-copy" }, "To change or cancel your plan, open Agentic Compute Platform on your iPhone or iPad.")
                              )
                            )
                          : null,
                        renderPlanCards
                      )
                    )
                  : null;

                const topUpModal = settingsTopUpModalOpen && selectedTopUpPackage
                  ? React.createElement(PlatformModalBackdrop, {
                      className: "playground-tasks-project-modal-backdrop playground-settings-topup-modal-backdrop",
                      onClick: () => setSettingsTopUpModalOpen(false),
                    },
                      React.createElement(PlatformModalSurface, {
                          as: "form",
                          className: "playground-tasks-project-modal playground-agent-composer-modal playground-settings-topup-modal",
                          onClick: (event) => event.stopPropagation(),
                          onSubmit: (event) => {
                            event.preventDefault();
                            setSettingsTopUpModalOpen(false);
                            void handleSettingsBuyTopUp(selectedTopUpPackage.id);
                          },
                        },
                        React.createElement("div", { className: "playground-tasks-project-modal-top" },
                          React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                            React.createElement("div", {
                              className: "playground-tasks-project-modal-icon-trigger",
                              "aria-hidden": "true",
                            }, React.createElement(Coins, { width: 18, height: 18, strokeWidth: 1.9 })),
                            React.createElement("div", { className: "playground-settings-topup-modal-title-shell" },
                              React.createElement("div", { className: "playground-settings-topup-modal-title" }, "Add USD credits"),
                              React.createElement("div", { className: "playground-settings-topup-modal-subtitle" }, "Buy a one-time USD credit add-on without changing your subscription.")
                            )
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-settings-icon-button playground-tasks-project-modal-close",
                            onClick: () => setSettingsTopUpModalOpen(false),
                            title: "Close",
                            disabled: settingsTopUpActionId === selectedTopUpPackage.id,
                          }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                        ),
                        React.createElement("div", { className: "playground-agent-composer-modal-body playground-settings-topup-modal-body" },
                          renderSettingsBanner("error", settingsBillingError),
                          renderSettingsBanner("success", settingsBillingSuccess),
                          React.createElement("div", { className: "playground-settings-topup-note" }, "Purchased add-ons are consumed only after your included monthly plan credits are exhausted."),
                          React.createElement("div", { className: "playground-settings-topup-package-grid" },
                          SETTINGS_TOP_UP_CATALOG.map((pkg) => {
                            const isSelected = pkg.id === selectedTopUpPackage.id;
                            const packageCreditsUsd = readSettingsTopUpCreditsUsd(pkg);
                            return React.createElement("button", {
                                key: pkg.id,
                                type: "button",
                                onClick: () => setSettingsSelectedTopUpId(pkg.id),
                                className: "playground-settings-topup-package-card" + (isSelected ? " is-selected" : ""),
                                disabled: settingsTopUpActionId === selectedTopUpPackage.id,
                              },
                                React.createElement("span", { className: "playground-settings-topup-package-card-name" }, pkg.name),
                                React.createElement("span", { className: "playground-settings-topup-package-card-tokens" }, formatSettingsUsdCredits(packageCreditsUsd) + " credits"),
                                React.createElement("span", { className: "playground-settings-topup-package-card-price" }, "$" + pkg.price + " one-time"),
                                React.createElement("span", { className: "playground-settings-topup-package-card-copy" }, pkg.description)
                              );
                          })
                          ),
                          React.createElement("div", { className: "playground-settings-topup-summary" },
                            React.createElement("div", { className: "playground-settings-topup-summary-copy" },
                              React.createElement("div", { className: "playground-settings-topup-summary-label" }, "Selected purchase"),
                              React.createElement("div", { className: "playground-settings-topup-summary-value" }, formatSettingsUsdCredits(readSettingsTopUpCreditsUsd(selectedTopUpPackage)) + " credits for $" + selectedTopUpPackage.price),
                              React.createElement("div", { className: "playground-settings-topup-summary-description" }, selectedTopUpPackage.description)
                            ),
                            React.createElement("div", { className: "playground-settings-topup-summary-badge" },
                              React.createElement(Coins, { width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("span", null, "One-time add-on")
                            )
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button",
                            onClick: () => setSettingsTopUpModalOpen(false),
                            disabled: settingsTopUpActionId === selectedTopUpPackage.id,
                          }, "Cancel"),
                          React.createElement(PlatformPrimaryButton, {
                            size: "medium",
                              type: "submit",
                              className: "playground-environments-action-button is-primary",
                              disabled: settingsTopUpActionId === selectedTopUpPackage.id,
                            },
                              settingsTopUpActionId === selectedTopUpPackage.id
                                ? React.createElement("span", null, "Loading...")
                                : "Buy USD credits"
                            )
                          ),
                      )
                    )
                  : null;

                const renderSettingsModalPortal = (content) => {
                  if (!content) {
                    return null;
                  }
                  if (typeof document === "undefined" || !document.body) {
                    return content;
                  }
                  return createPortal(content, document.body);
                };

                const settingsQuickLinks = [
                  {
                    id: "browse-models",
                    title: "Browse Models",
                    Icon: Grid3x3,
                    onClick: () => {
                      openModelsPage();
                    },
                  },
                  {
                    id: "configure-inference",
                    title: "Configure Inference",
                    Icon: HardDrive,
                    onClick: openInferencePage,
                  },
                  {
                    id: "change-plan",
                    title: "Plans",
                    Icon: DollarSign,
                    onClick: () => navigateSettingsSection("costs-plan-options"),
                  },
                  {
                    id: "api-reference",
                    title: "API Reference",
                    Icon: FileText,
                    onClick: () => window.open("https://developers.computer-agents.com", "_blank", "noopener,noreferrer"),
                  },
                  {
                    id: "pricing-overview",
                    title: "Pricing Overview",
                    Icon: ReceiptText,
                    onClick: () => window.open("https://computer-agents.com/pricing", "_blank", "noopener,noreferrer"),
                  },
                ];

                return React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-settings-plans-navbar" },
                    React.createElement("div", { className: "playground-environments-editor-navbar-title" },
                      React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                        React.createElement("div", { className: "playground-settings-plans-title" }, tierInfo.name + " Plan")
                      )
                    ),
                    React.createElement("div", { className: "playground-content-nav-center" }),
                    React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions" }, plansMenu)
                  ),
                  React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                    settingsBudgetLoading
                      ? React.createElement("div", { className: "playground-settings-loading-state" },
                          React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 }),
                          React.createElement("span", { className: "playground-settings-muted-copy" }, "Loading")
                        )
                      : React.createElement("div", { className: "playground-settings-plan-app-shell" },
                          renderSettingsBanner("error", settingsBillingError),
                          renderSettingsBanner("success", settingsBillingSuccess),
                          currentCancelledSubscription
                            ? React.createElement("div", { className: "playground-settings-plan-system-note is-cancelled" },
                                React.createElement("div", { className: "playground-settings-plan-system-note-icon" }, "$"),
                                React.createElement("div", null,
                                  React.createElement("div", { className: "playground-settings-plan-system-note-title" }, "Subscription cancelled"),
                                  React.createElement("div", { className: "playground-settings-plan-system-note-copy" }, currentCancelledSubscriptionCopy)
                                )
                              )
                            : null,
                          React.createElement("div", { className: "playground-settings-plans-overview-grid" },
                            React.createElement("section", { className: "playground-settings-plans-overview-section" },
                              React.createElement("div", { className: "playground-settings-plans-overview-heading" }, "Usage"),
                              React.createElement("div", { className: "playground-settings-plans-budget-card playground-computer-details-card" },
                                React.createElement("div", { className: "playground-settings-plans-budget-card-top" },
                                  React.createElement("div", { className: "playground-settings-plans-budget-copy" },
                                    React.createElement("div", { className: "playground-settings-plans-budget-value" },
                                      React.createElement("span", null, formatSettingsComputeTokens(totalRemainingCT))
                                    )
                                  ),
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-settings-plans-budget-icon-button is-plain",
                                    onClick: () => openOrganizationBillingPage("usage"),
                                    "aria-label": "View usage",
                                  }, React.createElement(ChartNoAxesColumnIncreasing, { width: 16, height: 16, strokeWidth: 1.8 }))
                                ),
                                React.createElement("div", { className: "playground-settings-usage-balance-track" },
                                  React.createElement("span", {
                                    className: "playground-settings-usage-balance-fill is-neutral",
                                    style: { width: String(remainingPercent) + "%" },
                                  })
                                ),
                                React.createElement("div", { className: "playground-settings-plans-budget-reset" }, resetCopy),
                                React.createElement("div", { className: "playground-settings-plans-budget-actions" },
                                  React.createElement(PlatformPrimaryButton, {
                                    size: "medium",
                                    type: "button",
                                    className: "playground-settings-plans-budget-action is-primary",
                                    onClick: () => navigateSettingsSection("costs-plan-options"),
                                  },
                                    React.createElement(DollarSign, { width: 14, height: 14, strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Change Plan")
                                  ),
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-settings-plans-budget-action",
                                    onClick: () => setSettingsTopUpModalOpen(true),
                                  },
                                    React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }),
                                    React.createElement("span", null, "Add credits")
                                  ),
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-settings-plans-budget-icon-button is-plain is-trailing",
                                    onClick: () => navigateSettingsSection("costs-records"),
                                    "aria-label": "Billing records",
                                  }, React.createElement(ReceiptText, { width: 15, height: 15, strokeWidth: 1.8 }))
                                )
                              )
                            ),
                            React.createElement("section", { className: "playground-settings-plans-overview-section" },
                              React.createElement("div", { className: "playground-settings-plans-overview-heading" }, "Quick Links"),
                              React.createElement("div", { className: "playground-settings-plans-quick-links-grid" },
                                settingsQuickLinks.map((link) =>
                                  React.createElement("button", {
                                    key: link.id,
                                    type: "button",
                                    className: "playground-settings-plans-quick-link",
                                    onClick: link.onClick,
                                  },
                                    React.createElement(getPlaygroundSafeIconComponent(link.Icon, Circle), { className: "playground-settings-plans-quick-link-icon", strokeWidth: 1.8 }),
                                    React.createElement("span", { className: "playground-settings-plans-quick-link-label" }, link.title)
                                  )
                                )
                              )
                            )
                          ),
                          React.createElement("div", {
                            className: "playground-settings-detail-stack",
                            style: { marginTop: "4px" },
                          },
                            renderSettingsBanner("error", settingsPlatformConfigError),
                            React.createElement("section", { className: "playground-settings-plans-resource-cap-section" },
                              React.createElement("div", { className: "playground-settings-plans-resource-cap-heading" }, "Configure Usage Limits"),
                              React.createElement("div", { className: "playground-tasks-detail-facts playground-settings-plans-resource-cap-facts" },
                                React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" },
                                      React.createElement("div", { className: "playground-settings-plans-resource-cap-label", ref: settingsResourceCapInfoRef },
                                        React.createElement("span", null, "Resource Usage Limit"),
                                        React.createElement("button", {
                                          type: "button",
                                          className: "playground-settings-plans-resource-cap-info-trigger",
                                          onClick: () => setSettingsResourceCapInfoOpen((current) => !current),
                                          "aria-label": "What does Resource Usage Limit mean?",
                                          "aria-expanded": settingsResourceCapInfoOpen ? "true" : "false",
                                        }, React.createElement(CircleHelp, { width: 14, height: 14, strokeWidth: 1.9 })),
                                        settingsResourceCapInfoOpen
                                          ? React.createElement(PlatformPopupSurface, { className: "playground-settings-plans-resource-cap-info-popover" },
                                              "Limits how much persistent resources like servers, functions, databases, and environments can spend each month, so more budget remains available for active agent threads."
                                            )
                                          : null
                                      )
                                    ),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                      React.createElement("div", { className: "playground-settings-plans-resource-cap-control" },
                                        React.createElement("input", {
                                          id: "settings-resource-spend-cap",
                                          type: "number",
                                          min: "0",
                                          step: "1",
                                          className: "playground-settings-input playground-settings-plans-resource-cap-input",
                                          value: settingsBillingPreferences.monthlyResourceSpendLimit > 0 ? settingsBillingPreferences.monthlyResourceSpendLimit : "",
                                          onChange: (event) => {
                                            const nextPreferences = {
                                              ...settingsBillingPreferences,
                                              monthlyResourceSpendLimit: normalizeSettingsSpendLimit(event.target.value),
                                            };
                                            queueSettingsResourceCapAutosave(nextPreferences, false);
                                          },
                                          disabled: !settingsCanConfigureUsageBilling || settingsPlatformConfigSaving,
                                          placeholder: "None",
                                        }),
                                        React.createElement("span", { className: "playground-settings-plans-resource-cap-suffix" }, "USD / month")
                                      )
                                    )
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Pause resources when the cap is reached"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-environments-toggle" + (settingsBillingPreferences.pauseOnLimit ? " is-active" : ""),
                                        onClick: () => {
                                          if (!settingsCanConfigureUsageBilling || settingsPlatformConfigSaving) {
                                            return;
                                          }
                                          const nextPreferences = {
                                            ...settingsBillingPreferences,
                                            pauseOnLimit: !settingsBillingPreferences.pauseOnLimit,
                                          };
                                          queueSettingsResourceCapAutosave(nextPreferences, true);
                                        },
                                        disabled: !settingsCanConfigureUsageBilling || settingsPlatformConfigSaving,
                                        "aria-pressed": settingsBillingPreferences.pauseOnLimit,
                                      }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                                    )
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Send email alerts before you hit the limit"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-environments-toggle" + (settingsBillingPreferences.emailAlerts ? " is-active" : ""),
                                        onClick: () => {
                                          if (!settingsCanConfigureUsageBilling || settingsPlatformConfigSaving) {
                                            return;
                                          }
                                          const nextPreferences = {
                                            ...settingsBillingPreferences,
                                            emailAlerts: !settingsBillingPreferences.emailAlerts,
                                          };
                                          queueSettingsResourceCapAutosave(nextPreferences, true);
                                        },
                                        disabled: !settingsCanConfigureUsageBilling || settingsPlatformConfigSaving,
                                        "aria-pressed": settingsBillingPreferences.emailAlerts,
                                      }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                                    )
                                  )
                                )
                              )
                            )
                          ),
                          usagePercent >= 100 && !hasTopUpBalance
                            ? React.createElement("div", { className: "playground-settings-plan-action-warning" },
                                React.createElement("strong", null, "Action Required:"),
                                " You've used all your included credits. Upgrade your plan or buy a one-time add-on to continue using agents."
                              )
                            : null,
                          settingsBudgetStatus?.subscriptionSource === "apple" && settingsCurrentTierId !== "sandbox"
                            ? React.createElement("div", { className: "playground-settings-plan-system-note" },
                                React.createElement("div", { className: "playground-settings-plan-system-note-icon" }, "IOS"),
                                React.createElement("div", null,
                                  React.createElement("div", { className: "playground-settings-plan-system-note-title" }, "Subscription managed through iPhone or iPad"),
                                  React.createElement("div", { className: "playground-settings-plan-system-note-copy" }, "To change or cancel your plan, open Agentic Compute Platform on your iPhone or iPad.")
                                )
                              )
                            : null,
                        )
                  ),
                  renderSettingsModalPortal(changePlanModal),
                  renderSettingsModalPortal(topUpModal)
                );
              })();
              break;
            case "costs-plan-options":
              detailContent = (() => {
                return React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                  React.createElement("div", { className: "playground-settings-plan-app-shell" },
                    renderSettingsBanner("error", settingsBillingError),
                    renderSettingsBanner("success", settingsBillingSuccess),
                    settingsBudgetStatus?.subscriptionSource === "apple" && settingsCurrentTierId !== "sandbox"
                      ? React.createElement("div", { className: "playground-settings-plan-system-note" },
                          React.createElement("div", { className: "playground-settings-plan-system-note-icon" }, "IOS"),
                          React.createElement("div", null,
                            React.createElement("div", { className: "playground-settings-plan-system-note-title" }, "Subscription managed through iPhone or iPad"),
                            React.createElement("div", { className: "playground-settings-plan-system-note-copy" }, "To change or cancel your plan, open Agentic Compute Platform on your iPhone or iPad.")
                          )
                        )
                      : null,
                    renderSettingsPlanTable()
                  )
                );
              })();
              break;
${inferencePageCaseScript}            case "costs-records":
              detailContent = React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-settings-plans-navbar" },
                  React.createElement("div", { className: "playground-environments-editor-navbar-title" },
                    React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                      React.createElement("div", { className: "playground-settings-plans-title" }, "Billing Records")
                    )
                  ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions" })
                ),
                React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll is-plans" },
                  React.createElement("div", { className: "playground-settings-records-shell" },
                    React.createElement(PlatformDataTable, {
                      rows: settingsInvoices,
                      getRowId: (invoice) => invoice.id,
                      ariaLabel: "Billing records",
                      className: "playground-settings-records-platform-table",
                      surface: "plain",
                      loading: settingsInvoicesLoading,
                      emptyState: "No invoices yet. Invoices will appear here when you subscribe to a plan.",
                      columns: [
                        {
                          id: "date",
                          header: "Date",
                          accessor: (invoice) => invoice.createdAt || "",
                          width: "minmax(110px, 0.9fr)",
                          cell: ({ row: invoice }) => new Date(invoice.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
                        },
                        {
                          id: "description",
                          header: "Description",
                          accessor: (invoice) => invoice.variantName || invoice.productName || "Subscription invoice",
                          width: "minmax(220px, 2fr)",
                          cell: ({ row: invoice }) => {
                            const billingReason = formatSettingsBillingReason(invoice.billingReason);
                            return React.createElement("div", null,
                              React.createElement("div", { className: "playground-settings-records-description-title" }, invoice.variantName || invoice.productName || "Subscription invoice"),
                              billingReason ? React.createElement("div", { className: "playground-settings-records-description-copy" }, billingReason) : null
                            );
                          },
                        },
                        {
                          id: "status",
                          header: "Status",
                          accessor: (invoice) => invoice.refunded ? "Refunded" : (invoice.statusFormatted || invoice.status || "Unknown"),
                          width: "minmax(100px, 0.8fr)",
                          cell: ({ row: invoice }) => React.createElement("span", {
                            className: "playground-settings-records-status-badge" + (invoice.status === "paid" ? " is-success" : invoice.refunded ? " is-warning" : ""),
                          }, invoice.refunded ? "Refunded" : (invoice.statusFormatted || invoice.status || "Unknown")),
                        },
                        {
                          id: "amount",
                          header: "Amount",
                          accessor: (invoice) => Number(invoice.total || 0),
                          width: "minmax(100px, 0.8fr)",
                          align: "end",
                          cell: ({ row: invoice }) => React.createElement("span", { className: "playground-settings-records-amount" }, invoice.totalFormatted || formatSettingsCurrency((Number(invoice.total) || 0) / 100)),
                        },
                        {
                          id: "invoice",
                          header: "Invoice",
                          width: "minmax(80px, 0.6fr)",
                          align: "end",
                          cell: ({ row: invoice }) => invoice.invoiceUrl
                            ? React.createElement("a", { href: invoice.invoiceUrl, target: "_blank", rel: "noopener noreferrer", className: "playground-settings-records-link" }, "View")
                            : null,
                        },
                      ],
                    })
                  )
                )
              );
              break;
            case "costs-overview": {
              detailContent = React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-settings-plans-navbar" },
                  React.createElement("div", { className: "playground-environments-editor-navbar-title" },
                    React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                      React.createElement("div", { className: "playground-settings-plans-title" }, "Usage Details")
                    )
                  ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions" })
                ),
                React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll is-usage" },
                (() => {
                  const periodStart = settingsUsageSummary?.startDate ? new Date(settingsUsageSummary.startDate) : new Date();
                  const periodEnd = settingsUsageSummary?.endDate ? new Date(settingsUsageSummary.endDate) : new Date();
                  const formatPeriodDate = (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  const safeByDay = Array.isArray(settingsUsageSummary?.byDay) ? settingsUsageSummary.byDay : [];
                  const safeTotals = settingsUsageSummary?.totals || { totalCT: 0, agentCT: 0, environmentCT: 0, totalThreads: 0 };
                  const byDayMap = new Map();
                  safeByDay.forEach((day) => {
                    if (!day?.date) {
                      return;
                    }

                    byDayMap.set(day.date, {
                      totalCT: Number(day.totalCT || 0),
                      agentCT: Number(day.agentCT || 0),
                      environmentCT: Number(day.environmentCT || 0),
                    });
                  });
                  const threadByDayMap = new Map();
                  safeByDay.forEach((day) => {
                    if (!day?.date) {
                      return;
                    }

                    threadByDayMap.set(day.date, Number(day.threadCount || 0));
                  });

                  const rawPeriodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
                  const daysToShow = Math.max(1, Math.min(rawPeriodDays || 1, 31));
                  const todayKey = new Date().toISOString().split("T")[0];
                  const dailyData = [];
                  for (let index = 0; index < daysToShow; index += 1) {
                    const date = new Date(periodStart);
                    date.setDate(date.getDate() + index);
                    const dateKey = date.toISOString().split("T")[0];
                    const dayData = byDayMap.get(dateKey);
                    dailyData.push({
                      date: dateKey,
                      dailyCT: Number(dayData?.totalCT || 0),
                      aiCT: Number(dayData?.agentCT || 0),
                      runtimeCT: Number(dayData?.environmentCT || 0),
                      threadCount: Number(threadByDayMap.get(dateKey) || 0),
                      isFuture: dateKey > todayKey,
                    });
                  }

                  const totalUsedCT = Number(safeTotals.totalCT || 0);
                  const attributedSourceItems = [...settingsUsageBreakdown]
                    .map((item) => ({
                      ...item,
                      totalCT: Number(item.totalCT || 0),
                      channel: getSettingsSourceChannel(item.id),
                      displayName: getSettingsSourceLabel(item.id),
                    }))
                    .filter((item) => item.totalCT > 0);
                  const attributedCT = attributedSourceItems.reduce((sum, item) => sum + item.totalCT, 0);
                  const unattributedCT = Math.max(0, totalUsedCT - attributedCT);
                  const sourceItems = [
                    ...attributedSourceItems,
                    ...(unattributedCT > 0 ? [{
                      id: "unattributed",
                      name: "Unattributed",
                      totalCT: unattributedCT,
                      channel: "unattributed",
                      displayName: "Unattributed",
                    }] : []),
                  ].sort((left, right) => right.totalCT - left.totalCT);
                  const dailyLabels = dailyData.map((day) => {
                    const date = new Date(day.date);
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  });
                  const resourceResidualSeries = dailyData.map((day) => Math.max(0, day.dailyCT - day.aiCT - day.runtimeCT));
                  const resourceSeries = [
                    {
                      id: "inference",
                      label: "LLM Inference",
                      color: "rgb(143,196,255)",
                      values: dailyData.map((day) => day.aiCT),
                    },
                    {
                      id: "runtime",
                      label: "Computers",
                      color: "rgb(103,80,255)",
                      values: dailyData.map((day) => day.runtimeCT),
                    },
                  ];
                  if (resourceResidualSeries.some((value) => value > 0)) {
                    resourceSeries.push({
                      id: "other",
                      label: "Other Runtime",
                      color: "rgb(94,234,212)",
                      values: resourceResidualSeries,
                    });
                  }

                  const averageCtPerThreadValues = dailyData.map((day) =>
                    day.threadCount > 0 ? Math.round(day.dailyCT / day.threadCount) : 0
                  );
                  const averageCtPerThreadOverall = safeTotals.totalThreads > 0
                    ? Math.round(totalUsedCT / safeTotals.totalThreads)
                    : 0;
                  const maxAverageCtPerThread = Math.max(...averageCtPerThreadValues, 1);
                  const resourceUsageRows = Array.isArray(settingsUsageResourceItems)
                    ? [...settingsUsageResourceItems]
                      .map((item) => ({
                        ...item,
                        totalCT: Number(item?.totalCT || 0),
                        displayKind: formatSettingsUsageResourceKind(item?.kind || item?.resourceKind || item?.resourceType),
                      }))
                      .filter((item) => item.totalCT > 0)
                      .sort((left, right) => right.totalCT - left.totalCT)
                    : [];
	                  const normalizeUsageChartLabel = (value, fallback) => {
	                    const label = String(value || fallback || "Unknown").trim();
	                    if (label.length <= 22) {
	                      return label;
	                    }
	                    return label.slice(0, 19).trimEnd() + "...";
	                  };
	                  const agentNameById = new Map(
	                    (Array.isArray(realAgents) ? realAgents : [])
	                      .map((agent) => [
	                        String(agent?.id || "").trim(),
	                        String(agent?.name || agent?.displayName || agent?.id || "").trim(),
	                      ])
	                      .filter(([id, name]) => id && name)
	                  );
	                  const environmentNameById = new Map(
	                    (Array.isArray(realEnvironments) ? realEnvironments : [])
	                      .map((environment) => [
	                        String(environment?.id || "").trim(),
	                        String(environment?.name || environment?.displayName || environment?.id || "").trim(),
	                      ])
	                      .filter(([id, name]) => id && name)
	                  );
	                  const resolveUsageEntityLabel = (item, lookupMap, fallbackLabel) => {
	                    const candidateIds = [
	                      item?.id,
	                      item?.agentId,
	                      item?.environmentId,
	                      item?.resourceId,
	                    ].map((value) => String(value || "").trim()).filter(Boolean);
	                    for (const candidateId of candidateIds) {
	                      const resolvedName = lookupMap.get(candidateId);
	                      if (resolvedName) {
	                        return resolvedName;
	                      }
	                    }
	                    return item?.displayName || item?.name || fallbackLabel || "Usage";
	                  };
	                  const readUsageRowComponent = (item, component, options = {}) => {
	                    const totalCT = Math.max(0, Number(item?.totalCT || 0));
	                    const agentCT = Math.max(0, Number(item?.agentCT || 0));
                    const environmentCT = Math.max(0, Number(item?.environmentCT || 0));
                    if (component === "agent") {
                      return agentCT > 0 ? agentCT : (options.fallbackToTotal === false ? 0 : totalCT);
                    }
                    if (component === "environment") {
                      return environmentCT;
                    }
                    if (component === "resource") {
                      return environmentCT > 0 ? environmentCT : totalCT;
                    }
                    if (component === "skill") {
                      return agentCT > 0 ? agentCT : totalCT;
                    }
                    return totalCT;
                  };
                  const buildUsageRows = (items, fallbackLabel, options = {}) => (Array.isArray(items) ? items : [])
	                    .map((item) => {
	                      const component = options.component || "total";
	                      const value = readUsageRowComponent(item, component, options);
	                      const resolvedLabel = typeof options.resolveLabel === "function"
	                        ? options.resolveLabel(item)
	                        : (item?.displayName || item?.name || item?.id);
	                      const agentCT = component === "agent" || component === "skill"
	                        ? value
	                        : Math.max(0, Number(item?.agentCT || 0));
                      const environmentCT = component === "environment" || component === "resource"
                        ? value
                        : Math.max(0, Number(item?.environmentCT || 0));
	                      return {
	                        id: String(item?.id || item?.resourceId || item?.name || fallbackLabel || "usage"),
	                        label: normalizeUsageChartLabel(resolvedLabel, fallbackLabel),
	                        fullLabel: resolvedLabel || fallbackLabel || "Usage",
	                        totalCT: value,
	                        agentCT,
	                        environmentCT,
                        threadCount: Math.max(0, Number(item?.threadCount || 0)),
                      };
                    })
                    .filter((item) => item.totalCT > 0 || item.threadCount > 0)
                    .sort((left, right) => right.totalCT - left.totalCT);
                  const buildUsageBreakdownSeries = (rows, options = {}) => {
                    const inferenceValues = rows.map((row) => Math.max(0, Number(row.agentCT || 0)));
                    const computerValues = rows.map((row) => Math.max(0, Number(row.environmentCT || 0)));
                    const otherValues = rows.map((row) => Math.max(0, Number(row.totalCT || 0) - Number(row.agentCT || 0) - Number(row.environmentCT || 0)));
                    return [
                      {
                        id: "inference",
                        label: options.inferenceLabel || "Inference",
                        color: "rgb(143,196,255)",
                        values: inferenceValues,
                      },
                      {
                        id: "computers",
                        label: options.environmentLabel || "Computers",
                        color: "rgb(103,80,255)",
                        values: computerValues,
                      },
                      {
                        id: "other",
                        label: "Other Runtime",
                        color: "rgb(94,234,212)",
                        values: otherValues,
                      },
                    ].filter((entry) => entry.values.some((value) => Number(value || 0) > 0));
                  };
                  const getSkillUsageCategory = (item) => {
                    const haystack = String([
                      item?.id,
                      item?.name,
                      item?.displayName,
                    ].filter(Boolean).join(" ")).toLowerCase();
                    if (/(image|gpt-image|imagen|nanobanana|dall[-_ ]?e)/.test(haystack)) {
                      return { id: "image_generation", label: "Image Generation" };
                    }
                    if (/(video|seedance|grok[_ -]?imagine|text[_ -]?to[_ -]?video|image[_ -]?to[_ -]?video)/.test(haystack)) {
                      return { id: "video_generation", label: "Video Generation" };
                    }
                    if (/(firecrawl|web[_ -]?search|scrape|crawl|parse|document)/.test(haystack)) {
                      return { id: "web_search", label: "Web Search & Scraping" };
                    }
                    if (/(deep[_ -]?research|research)/.test(haystack)) {
                      return { id: "deep_research", label: "Deep Research" };
                    }
                    if (/(mcp|tool|skill)/.test(haystack)) {
                      return { id: "tools", label: "Tools" };
                    }
                    return { id: "other_skills", label: "Other Skills" };
                  };
                  const skillUsageMap = new Map();
                  sourceItems.forEach((item) => {
                    const category = getSkillUsageCategory(item);
                    if (category.id === "other_skills") {
                      return;
                    }
                    const existing = skillUsageMap.get(category.id) || {
                      id: category.id,
                      name: category.label,
                      displayName: category.label,
                      totalCT: 0,
                      agentCT: 0,
                      environmentCT: 0,
                      threadCount: 0,
                    };
                    existing.totalCT += Number(item.totalCT || 0);
                    existing.agentCT += Number(item.agentCT || 0) > 0 || Number(item.environmentCT || 0) > 0
                      ? Number(item.agentCT || 0)
                      : Number(item.totalCT || 0);
                    existing.environmentCT += Number(item.environmentCT || 0);
                    existing.threadCount += Number(item.threadCount || 0);
                    skillUsageMap.set(category.id, existing);
                  });
                  resourceUsageRows.forEach((item) => {
                    const kind = String(item?.kind || item?.resourceKind || item?.resourceType || "").trim().toLowerCase();
                    if (kind !== "mcp") {
                      return;
                    }
                    const existing = skillUsageMap.get("tools") || {
                      id: "tools",
                      name: "Tools",
                      displayName: "Tools",
                      totalCT: 0,
                      agentCT: 0,
                      environmentCT: 0,
                      threadCount: 0,
                    };
                    const ctAmount = Number(item.agentCT || item.totalCT || 0);
                    existing.totalCT += ctAmount;
                    existing.agentCT += ctAmount;
                    existing.threadCount += Number(item.threadCount || 0);
                    skillUsageMap.set("tools", existing);
                  });
	                  const agentUsageRows = buildUsageRows(settingsUsageAgentItems, "Agent", {
	                    component: "agent",
	                    resolveLabel: (item) => resolveUsageEntityLabel(item, agentNameById, "Agent"),
	                  });
	                  const computerUsageRows = buildUsageRows(settingsUsageEnvironmentItems, "Computer", {
	                    component: "environment",
	                    fallbackToTotal: false,
	                    resolveLabel: (item) => resolveUsageEntityLabel(item, environmentNameById, "Computer"),
	                  });
                  const resourceChartRows = buildUsageRows(
                    resourceUsageRows.filter((item) => {
                      const kind = String(item?.kind || item?.resourceKind || item?.resourceType || "").trim().toLowerCase();
                      return !["llm", "thread_runtime", "computer", "mcp"].includes(kind);
                    }),
                    "Resource",
                    { component: "resource" }
                  );
                  const skillUsageRows = buildUsageRows(Array.from(skillUsageMap.values()), "Skill", { component: "skill" });
                  const getUsageSeriesMax = (labels, series) => Math.max(1, ...labels.map((_, index) =>
                    series.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
                  ));
                  const buildUsageChartTab = (tab) => ({
                    ...tab,
                    yMax: getUsageSeriesMax(tab.labels, tab.series),
                  });
                  const usageChartTabs = [
                    buildUsageChartTab({
                      id: "overall",
                      label: "Overall usage cost",
                      value: formatSettingsComputeTokens(totalUsedCT),
                      title: "Overall usage cost",
                      labels: dailyLabels,
                      series: resourceSeries,
                      emptyText: "No usage in this period",
                      ariaLabel: "Overall usage cost by day",
                    }),
                    buildUsageChartTab({
                      id: "agents",
                      label: "Usage by Agents",
                      value: formatSettingsComputeTokens(Number(safeTotals.agentCT || 0) || agentUsageRows.reduce((sum, item) => sum + item.totalCT, 0)),
                      title: "Usage by Agents",
                      labels: agentUsageRows.map((item) => item.label),
                      series: buildUsageBreakdownSeries(agentUsageRows, { inferenceLabel: "Inference" }),
                      emptyText: "No agent usage in this period",
                      ariaLabel: "Compute token usage by agent",
                    }),
                    buildUsageChartTab({
                      id: "computers",
                      label: "Usage by Computers",
                      value: formatSettingsComputeTokens(computerUsageRows.reduce((sum, item) => sum + item.totalCT, 0)),
                      title: "Usage by Computers",
                      labels: computerUsageRows.map((item) => item.label),
                      series: buildUsageBreakdownSeries(computerUsageRows, { environmentLabel: "Computers" }),
                      emptyText: "No computer usage in this period",
                      ariaLabel: "Compute token usage by computer",
                    }),
                    buildUsageChartTab({
                      id: "resources",
                      label: "Usage by Resources",
                      value: formatSettingsComputeTokens(resourceChartRows.reduce((sum, item) => sum + item.totalCT, 0)),
                      title: "Usage by Resources",
                      labels: resourceChartRows.map((item) => item.label),
                      series: buildUsageBreakdownSeries(resourceChartRows, { environmentLabel: "Resources" }),
                      emptyText: "No resource usage in this period",
                      ariaLabel: "Compute token usage by resource",
                    }),
                    buildUsageChartTab({
                      id: "skills",
                      label: "Usage by Skills",
                      value: formatSettingsComputeTokens(skillUsageRows.reduce((sum, item) => sum + item.totalCT, 0)),
                      title: "Usage by Skills",
                      labels: skillUsageRows.map((item) => item.label),
                      series: buildUsageBreakdownSeries(skillUsageRows, { inferenceLabel: "Skills" }),
                      emptyText: "No skill usage in this period",
                      ariaLabel: "Compute token usage by skill",
                    }),
                  ];
                  const activeUsageChart = usageChartTabs.find((tab) => tab.id === settingsUsageChartTab) || usageChartTabs[0];
                  const renderSettingsUsagePeriodControls = (className) =>
                    React.createElement("div", { className },
                      React.createElement("div", { className: "playground-settings-usage-period-heading" },
                        React.createElement("div", { className: "playground-settings-usage-app-period" },
                          formatPeriodDate(periodStart) + " - " + formatPeriodDate(periodEnd)
                        )
                      ),
                      React.createElement("div", { className: "playground-settings-usage-nav" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-usage-nav-button",
                          onClick: () => setSettingsBillingPeriodOffset((current) => current - 1),
                          title: "Previous period",
                        }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-usage-nav-current",
                          onClick: () => setSettingsBillingPeriodOffset(0),
                          disabled: settingsBillingPeriodOffset === 0,
                        }, "Current"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-usage-nav-button",
                          onClick: () => setSettingsBillingPeriodOffset((current) => Math.min(0, current + 1)),
                          disabled: settingsBillingPeriodOffset >= 0,
                          title: "Next period",
                        }, React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.8 }))
                      )
                    );

                  return React.createElement("div", { className: "playground-settings-usage-app-shell" },
                        React.createElement("div", { className: "playground-settings-usage-top-chart playground-environments-home-metrics" },
                          React.createElement("div", { className: "playground-tasks-detail-facts" },
                            React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                              React.createElement("div", { className: "playground-database-overview" },
                                React.createElement("div", { className: "playground-database-overview-chart-block playground-settings-usage-chart-block" },
                                  React.createElement("div", { className: "playground-project-overview-summary-kpis playground-project-overview-chart-kpis playground-settings-usage-chart-kpis" },
                                    usageChartTabs.map((tab) =>
                                      React.createElement("button", {
                                        key: tab.id,
                                        type: "button",
                                        className: "playground-project-overview-summary-kpi playground-settings-usage-chart-kpi" + (activeUsageChart.id === tab.id ? " is-active" : ""),
                                        onClick: () => setSettingsUsageChartTab(tab.id),
                                      },
                                        React.createElement("div", { className: "playground-project-overview-summary-kpi-heading" },
                                          React.createElement("div", { className: "playground-project-overview-summary-kpi-label" }, tab.label)
                                        ),
                                        React.createElement("div", { className: "playground-project-overview-summary-kpi-value" }, tab.value)
                                      )
                                    )
                                  ),
                                  React.createElement("div", { className: "playground-settings-usage-chart-panel" },
                                    React.createElement("div", { className: "playground-settings-usage-card-header" },
                                      React.createElement("div", null,
                                        React.createElement("div", { className: "playground-settings-usage-card-title" }, activeUsageChart.title)
                                      )
                                    ),
                                    settingsUsageLoading
                                      ? React.createElement("div", { className: "playground-settings-loading-state playground-settings-usage-chart-loading-frame" },
                                          React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                                        )
                                      : renderSettingsUsageMultiStackedChart({
                                          labels: activeUsageChart.labels,
                                          series: activeUsageChart.series,
                                          yMax: activeUsageChart.yMax,
                                          tickFormatter: formatSettingsAxisComputeTokens,
                                          tall: true,
                                          ariaLabel: activeUsageChart.ariaLabel,
                                          emptyText: activeUsageChart.emptyText,
                                        }),
                                    React.createElement("div", {
                                      className: "playground-settings-usage-inline-legend",
                                      style: { justifyContent: "flex-start" },
                                    },
                                      activeUsageChart.series.map((entry) =>
                                        React.createElement("div", { key: entry.id, className: "playground-settings-usage-legend-item" },
                                          React.createElement("span", {
                                            className: "playground-settings-usage-legend-swatch",
                                            style: { background: entry.color },
                                          }),
                                          React.createElement("span", null, entry.label)
                                        )
                                      )
                                    )
                                  ),
                                  renderSettingsUsagePeriodControls("playground-settings-usage-period-header is-chart-footer")
                                )
                              )
                            )
                          )
                        ),
                        React.createElement("section", { className: "playground-settings-usage-resource-table-wrap" },
                          React.createElement("div", { className: "playground-settings-usage-card-header" },
                            React.createElement("div", null,
                              React.createElement("div", { className: "playground-settings-usage-card-title" }, "Consumers")
                            )
                          ),
                          React.createElement(PlatformDataTable, {
                            rows: resourceUsageRows,
                            getRowId: (item) => String(item.id),
                            ariaLabel: "Usage consumers",
                            className: "playground-settings-usage-platform-table",
                            surface: "plain",
                            sticky: false,
                            loading: settingsUsageLoading,
                            emptyState: "No measured usage in this period.",
                            columns: [
                              {
                                id: "resource",
                                header: "Resource",
                                accessor: (item) => item.name || "Unknown",
                                width: "minmax(220px, 2fr)",
                                cell: ({ row: item }) => React.createElement("div", { className: "playground-settings-usage-resource-name-cell" },
                                  React.createElement("span", { className: "playground-settings-usage-resource-name" }, item.name || "Unknown"),
                                  item.resourceId ? React.createElement("span", { className: "playground-settings-usage-resource-meta" }, item.resourceId) : null
                                ),
                              },
                              { id: "type", header: "Type", accessor: (item) => item.displayKind, width: "minmax(120px, 1fr)" },
                              {
                                id: "cost",
                                header: "Cost",
                                accessor: (item) => Number(item.totalCT || 0),
                                width: "minmax(100px, 0.8fr)",
                                align: "end",
                                cell: ({ row: item }) => formatSettingsComputeTokens(item.totalCT),
                              },
                            ],
                          })
                        )
                      );
                })()
                )
              );
              break;
            }
            case "integrations":
              detailContent = React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                React.createElement("div", { className: "playground-settings-integrations-shell" },
                  React.createElement("h3", { className: "playground-settings-integrations-title" }, "Integrations"),
                  React.createElement("p", { className: "playground-settings-integrations-subtitle" }, "Connect external services to your account"),
                  React.createElement("div", { className: "playground-settings-integration-stack" },
                    React.createElement("div", { className: "playground-settings-integration-card" },
                      React.createElement("div", { className: "playground-settings-integration-card-row" },
                        React.createElement("img", {
                          src: "/img/logos/mailicon.webp",
                          className: "playground-settings-integration-logo is-email",
                          alt: "Email",
                        }),
                        React.createElement("div", { className: "playground-settings-integration-main" },
                          React.createElement("div", { className: "playground-settings-integration-top" },
                            React.createElement("h4", { className: "playground-settings-integration-title" }, "Email"),
                            settingsEmailStatus?.linked && settingsEmailStatus?.verified
                              ? React.createElement("div", { className: "playground-settings-integration-account-group" },
                                  React.createElement("span", { className: "playground-settings-integration-account" },
                                    React.createElement(Mail, { width: 12, height: 12, strokeWidth: 1.8 }),
                                    React.createElement("span", null, settingsEmailStatus.email)
                                  ),
                                  React.createElement("button", {
                                    type: "button",
                                    onClick: () => {
                                      void handleSettingsUnlinkEmail();
                                    },
                                    disabled: settingsIsUnlinkingEmail,
                                    className: "playground-settings-integration-unlink",
                                  },
                                    settingsIsUnlinkingEmail
                                      ? React.createElement(Loader2, { className: "playground-settings-records-spinner", strokeWidth: 1.8 })
                                      : React.createElement(React.Fragment, null,
                                          React.createElement(Unlink, { width: 12, height: 12, strokeWidth: 1.8 }),
                                          React.createElement("span", null, "Unlink Email")
                                        )
                                  )
                                )
                              : settingsEmailStatus?.linked && !settingsEmailStatus?.verified
                                ? React.createElement("span", { className: "playground-settings-records-status-badge is-warning" }, "Pending Verification")
                                : null
                          ),
                          React.createElement("p", { className: "playground-settings-integration-copy" }, "Link your email to run tasks, upload files, and receive notifications via email."),
                          settingsEmailLoading
                            ? React.createElement("div", { className: "playground-settings-integration-loading" },
                                React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                              )
                            : settingsEmailStatus?.linked && settingsEmailStatus?.verified
                              ? React.createElement("div", { className: "playground-settings-integration-body" },
                                  React.createElement("p", { className: "playground-settings-integration-section-label" }, "Send emails to:"),
                                  React.createElement("p", { className: "playground-settings-integration-email-address" }, "[agent-name]@agent.computer-agents.com"),
                                  React.createElement("p", { className: "playground-settings-integration-section-label", style: { marginTop: "12px" } }, "What you can do:"),
                                  React.createElement("ul", { className: "playground-settings-integration-list" },
                                    React.createElement("li", null, "Send a task in the subject or body"),
                                    React.createElement("li", null, "Attach files to include in your task"),
                                    React.createElement("li", null, "Reply to continue a conversation"),
                                    React.createElement("li", null, 'Type "help" in the body for commands')
                                  )
                                )
                              : settingsShowEmailVerificationInput || (settingsEmailStatus?.linked && !settingsEmailStatus?.verified)
                                ? React.createElement("div", { className: "playground-settings-integration-body" },
                                    React.createElement("div", { className: "playground-settings-integration-notice is-warning" }, "A verification code has been sent to your email. Enter it below to complete linking."),
                                    React.createElement("div", { className: "playground-settings-field", style: { marginTop: "12px" } },
                                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-email-verification-code" }, "Verification Code"),
                                      React.createElement("div", { className: "playground-settings-integration-form-row" },
                                        React.createElement("input", {
                                          id: "settings-email-verification-code",
                                          type: "text",
                                          value: settingsEmailVerificationCodeInput,
                                          onChange: (event) => setSettingsEmailVerificationCodeInput(event.target.value),
                                          placeholder: "Enter 6-digit code",
                                          maxLength: 6,
                                          className: "playground-settings-integration-input is-code",
                                        }),
                                        React.createElement("button", {
                                          type: "button",
                                          onClick: () => {
                                            void handleSettingsVerifyEmailCode();
                                          },
                                          disabled: settingsIsVerifyingEmail || !settingsEmailVerificationCodeInput,
                                          className: "playground-settings-integration-button is-email",
                                        },
                                          settingsIsVerifyingEmail
                                            ? React.createElement(Loader2, { className: "playground-settings-records-spinner", strokeWidth: 1.8 })
                                            : React.createElement("span", null, "Verify")
                                        )
                                      )
                                    ),
                                    React.createElement("button", {
                                      type: "button",
                                      onClick: () => {
                                        void handleSettingsCancelEmailVerification();
                                      },
                                      className: "playground-settings-integration-secondary-link",
                                    }, "Cancel and try a different email")
                                  )
                                : React.createElement("div", { className: "playground-settings-integration-body" },
                                    React.createElement("div", { className: "playground-settings-field" },
                                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-email-address-link" }, "Email Address"),
                                      React.createElement("div", { className: "playground-settings-integration-form-row" },
                                        React.createElement("input", {
                                          id: "settings-email-address-link",
                                          type: "email",
                                          value: settingsEmailInput,
                                          onChange: (event) => setSettingsEmailInput(event.target.value),
                                          placeholder: "you@example.com",
                                          className: "playground-settings-integration-input is-email",
                                        }),
                                        React.createElement("button", {
                                          type: "button",
                                          onClick: () => {
                                            void handleSettingsLinkEmail();
                                          },
                                          disabled: settingsIsLinkingEmail || !settingsEmailInput,
                                          className: "playground-settings-integration-button is-email",
                                        },
                                          settingsIsLinkingEmail
                                            ? React.createElement(Loader2, { className: "playground-settings-records-spinner", strokeWidth: 1.8 })
                                            : React.createElement(React.Fragment, null,
                                                React.createElement(Link2, { width: 14, height: 14, strokeWidth: 1.8 }),
                                                React.createElement("span", null, "Link")
                                              )
                                        )
                                      ),
                                      React.createElement("p", { className: "playground-settings-integration-helper" }, "If this matches your account email, it will be linked automatically.")
                                    )
                                  ),
                          renderSettingsIntegrationMessage("error", settingsEmailError),
                          renderSettingsIntegrationMessage("success", settingsEmailSuccess)
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-settings-integration-card" },
                      React.createElement("div", { className: "playground-settings-integration-card-row" },
                        React.createElement("div", { className: "playground-settings-integration-icon is-discord" },
                          React.createElement("img", {
                            src: "/img/logos/discord.svg",
                            className: "playground-settings-integration-logo is-discord",
                            alt: "Discord",
                          })
                        ),
                        React.createElement("div", { className: "playground-settings-integration-main" },
                          React.createElement("div", { className: "playground-settings-integration-top" },
                            React.createElement("h4", { className: "playground-settings-integration-title" }, "Discord"),
                            settingsDiscordStatus?.linked && settingsDiscordStatus?.verified
                              ? React.createElement("div", { className: "playground-settings-integration-account-group" },
                                  React.createElement("span", { className: "playground-settings-integration-account" },
                                    React.createElement("span", { className: "playground-settings-integration-account-mark" }, "@"),
                                    React.createElement("span", null, settingsDiscordAccountLabel)
                                  ),
                                  React.createElement("button", {
                                    type: "button",
                                    onClick: () => {
                                      void handleSettingsUnlinkDiscord();
                                    },
                                    disabled: settingsIsUnlinkingDiscord,
                                    className: "playground-settings-integration-unlink",
                                  },
                                    settingsIsUnlinkingDiscord
                                      ? React.createElement(Loader2, { className: "playground-settings-records-spinner", strokeWidth: 1.8 })
                                      : React.createElement(React.Fragment, null,
                                          React.createElement(Unlink, { width: 12, height: 12, strokeWidth: 1.8 }),
                                          React.createElement("span", null, "Unlink Discord")
                                        )
                                  )
                                )
                              : null
                          ),
                          React.createElement("p", { className: "playground-settings-integration-copy" }, "Link your Discord to run tasks and receive notifications via Discord slash commands."),
                          settingsDiscordLoading
                            ? React.createElement("div", { className: "playground-settings-integration-loading" },
                                React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                              )
                            : settingsDiscordStatus?.linked && settingsDiscordStatus?.verified
                              ? React.createElement("div", { className: "playground-settings-integration-body" },
                                  React.createElement("p", { className: "playground-settings-integration-section-label" }, "Available commands:"),
                                  React.createElement("ul", { className: "playground-settings-integration-list" },
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/run"),
                                      " task:your task - Run a task with an agent"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/status"),
                                      " - Check your running tasks"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/runs"),
                                      " - List recent task runs"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/agents"),
                                      " - List your available agents"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/envs"),
                                      " - List your environments"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/help"),
                                      " - Show all available commands"
                                    )
                                  ),
                                  settingsDiscordStatus?.verifiedAt
                                    ? React.createElement("p", { className: "playground-settings-integration-helper" }, "Connected on " + new Date(settingsDiscordStatus.verifiedAt).toLocaleDateString())
                                    : null
                                )
                              : React.createElement("div", { className: "playground-settings-integration-body" },
                                  React.createElement("div", { className: "playground-settings-integration-actions" },
                                    React.createElement("button", {
                                      type: "button",
                                      onClick: () => {
                                        void handleSettingsLinkDiscord();
                                      },
                                      disabled: settingsIsLinkingDiscord,
                                      className: "playground-settings-integration-button is-discord",
                                    },
                                      settingsIsLinkingDiscord
                                        ? React.createElement(Loader2, { className: "playground-settings-records-spinner", strokeWidth: 1.8 })
                                        : React.createElement(React.Fragment, null,
                                            React.createElement(ExternalLink, { width: 14, height: 14, strokeWidth: 1.8 }),
                                            React.createElement("span", null, "Connect Discord")
                                          )
                                    )
                                  ),
                                  React.createElement("p", { className: "playground-settings-integration-helper" }, "You'll be redirected to Discord to authorize the connection.")
                                ),
                          renderSettingsIntegrationMessage("error", settingsDiscordError),
                          renderSettingsIntegrationMessage("success", settingsDiscordSuccess)
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-settings-integration-card" },
                      React.createElement("div", { className: "playground-settings-integration-card-row" },
                        React.createElement("div", { className: "playground-settings-integration-icon is-telegram" },
                          React.createElement("img", {
                            src: "/img/logos/telegram.svg",
                            className: "playground-settings-integration-logo is-telegram",
                            alt: "Telegram",
                          })
                        ),
                        React.createElement("div", { className: "playground-settings-integration-main" },
                          React.createElement("div", { className: "playground-settings-integration-top" },
                            React.createElement("h4", { className: "playground-settings-integration-title" }, "Telegram"),
                            settingsTelegramStatus?.linked && settingsTelegramStatus?.verified
                              ? React.createElement("div", { className: "playground-settings-integration-account-group" },
                                  React.createElement("span", { className: "playground-settings-integration-account" },
                                    React.createElement("span", { className: "playground-settings-integration-account-mark" }, "@"),
                                    React.createElement("span", null, settingsTelegramAccountLabel)
                                  ),
                                  React.createElement("button", {
                                    type: "button",
                                    onClick: () => {
                                      void handleSettingsUnlinkTelegram();
                                    },
                                    disabled: settingsIsUnlinkingTelegram,
                                    className: "playground-settings-integration-unlink",
                                  },
                                    settingsIsUnlinkingTelegram
                                      ? React.createElement(Loader2, { className: "playground-settings-records-spinner", strokeWidth: 1.8 })
                                      : React.createElement(React.Fragment, null,
                                          React.createElement(Unlink, { width: 12, height: 12, strokeWidth: 1.8 }),
                                          React.createElement("span", null, "Unlink Telegram")
                                        )
                                  )
                                )
                              : null
                          ),
                          React.createElement("p", { className: "playground-settings-integration-copy" }, "Link your Telegram to run tasks and receive notifications via Telegram bot commands."),
                          settingsTelegramLoading
                            ? React.createElement("div", { className: "playground-settings-integration-loading" },
                                React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                              )
                            : settingsTelegramStatus?.linked && settingsTelegramStatus?.verified
                              ? React.createElement("div", { className: "playground-settings-integration-body" },
                                  React.createElement("p", { className: "playground-settings-integration-section-label" }, "Available commands:"),
                                  React.createElement("ul", { className: "playground-settings-integration-list" },
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/run"),
                                      " task - Run a task with an agent"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/status"),
                                      " - Check your running tasks"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/runs"),
                                      " - List recent task runs"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/agents"),
                                      " - List your available agents"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/envs"),
                                      " - List your environments"
                                    ),
                                    React.createElement("li", null,
                                      React.createElement("code", { className: "playground-settings-integration-inline-code" }, "/help"),
                                      " - Show all available commands"
                                    )
                                  ),
                                  settingsTelegramStatus?.verifiedAt
                                    ? React.createElement("p", { className: "playground-settings-integration-helper" }, "Connected on " + new Date(settingsTelegramStatus.verifiedAt).toLocaleDateString())
                                    : null
                                )
                              : React.createElement("div", { className: "playground-settings-integration-body" },
                                  React.createElement("p", { className: "playground-settings-integration-section-label" }, "To link your Telegram:"),
                                  React.createElement("ol", { className: "playground-settings-integration-steps" },
                                    React.createElement("li", null, "Open Telegram and search for ", React.createElement("code", null, "@aios_agent_bot")),
                                    React.createElement("li", null, "Send ", React.createElement("code", null, "/link"), " to the bot"),
                                    React.createElement("li", null, "Enter the verification code below")
                                  ),
                                  React.createElement("div", { className: "playground-settings-integration-form-row", style: { marginTop: "12px" } },
                                    React.createElement("input", {
                                      type: "text",
                                      value: settingsTelegramVerificationCode,
                                      onChange: (event) => setSettingsTelegramVerificationCode(event.target.value),
                                      placeholder: "Enter verification code",
                                      className: "playground-settings-integration-input",
                                      maxLength: 6,
                                      onKeyDown: (event) => {
                                        if (event.key === "Enter") {
                                          void handleSettingsVerifyTelegramCode();
                                        }
                                      },
                                    }),
                                    React.createElement("button", {
                                      type: "button",
                                      onClick: () => {
                                        void handleSettingsVerifyTelegramCode();
                                      },
                                      disabled: settingsIsVerifyingTelegram || !settingsTelegramVerificationCode.trim(),
                                      className: "playground-settings-integration-button is-telegram",
                                    },
                                      settingsIsVerifyingTelegram
                                        ? React.createElement(Loader2, { className: "playground-settings-records-spinner", strokeWidth: 1.8 })
                                        : React.createElement("span", null, "Verify")
                                    )
                                  )
                                ),
                          renderSettingsIntegrationMessage("error", settingsTelegramError),
                          renderSettingsIntegrationMessage("success", settingsTelegramSuccess)
                        )
                      )
                    )
                  )
                )
              );
              break;
            case "webhooks": {
              const canCreateSettingsTrigger = Boolean(
                String(settingsTriggerForm.name || "").trim()
                && String(settingsTriggerForm.event || "").trim()
                && String(settingsTriggerForm.environmentId || "").trim()
                && String(settingsTriggerForm.message || "").trim()
                && (settingsTriggerForm.source !== "github" || githubStatus.connected)
              );

              const settingsTriggerComposerDialog = settingsCreatingTrigger
                ? React.createElement(PlatformModalBackdrop, {
                    className: "playground-tasks-project-modal-backdrop",
                    onClick: closeSettingsTriggerComposer,
                  },
                    React.createElement(PlatformModalSurface, {
                        as: "form",
                        className: "playground-tasks-project-modal playground-agent-composer-modal playground-environment-composer-modal playground-settings-trigger-composer-modal",
                        onClick: (event) => event.stopPropagation(),
                        onKeyDown: handleComposerSubmitShortcut,
                        onSubmit: (event) => {
                          event.preventDefault();
                          void handleSettingsCreateTrigger();
                        },
                      },
                      React.createElement("div", { className: "playground-tasks-project-modal-top" },
                        React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                          React.createElement("div", {
                            className: "playground-tasks-project-modal-icon-trigger",
                            "aria-hidden": "true",
                          }, React.createElement(Webhook, { width: 18, height: 18, strokeWidth: 1.9 })),
                          React.createElement("input", {
                            className: "playground-tasks-project-modal-name-input",
                            value: settingsTriggerForm.name,
                            onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, name: event.target.value })),
                            placeholder: "Webhook name",
                            autoFocus: true,
                            disabled: settingsTriggerSubmitting,
                          })
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-icon-button playground-tasks-project-modal-close",
                          onClick: closeSettingsTriggerComposer,
                          title: "Close",
                          disabled: settingsTriggerSubmitting,
                        }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                      ),
                      React.createElement("div", { className: "playground-agent-composer-modal-body" },
                        React.createElement("div", { className: "playground-settings-trigger-connect-card", style: { marginBottom: "4px" } },
                          React.createElement("div", { className: "playground-environments-muted" }, "Need help setting up GitHub, GitLab, or webhook delivery?"),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button",
                            onClick: () => {
                              window.open(${JSON.stringify(webhooksDocumentationUrl)}, "_blank", "noopener,noreferrer");
                            },
                            disabled: settingsTriggerSubmitting,
                          },
                            React.createElement(ExternalLink, { width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Open Docs")
                          )
                        ),
                        React.createElement("div", { className: "playground-environment-composer-runtime-facts" },
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Source"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              React.createElement("select", {
                                className: "playground-environments-select playground-tasks-detail-fact-select playground-tasks-detail-priority-select",
                                value: settingsTriggerForm.source,
                                disabled: settingsTriggerSubmitting,
                                onChange: (event) => setSettingsTriggerForm((current) => {
                                  const nextSource = event.target.value;
                                  const nextActionType = isSettingsTriggerActionSupportedForSource(nextSource, current.actionType)
                                    ? current.actionType
                                    : "send_message";
                                  return {
                                    ...current,
                                    source: nextSource,
                                    event: getSettingsTriggerDefaultEvent(nextSource, nextActionType),
                                    actionType: nextActionType,
                                    filterRepo: "",
                                    filterBranch: "",
                                  };
                                }),
                              },
                                SETTINGS_TRIGGER_SOURCE_OPTIONS.map((option) =>
                                  React.createElement("option", { key: option.value, value: option.value }, option.label)
                                )
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Event"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              settingsTriggerForm.source === "github" || settingsTriggerForm.source === "gitlab"
                                ? React.createElement("select", {
                                    className: "playground-environments-select playground-tasks-detail-fact-select playground-tasks-detail-priority-select",
                                    value: settingsTriggerForm.event,
                                    disabled: settingsTriggerSubmitting,
                                    onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, event: event.target.value })),
                                  },
                                    getSettingsTriggerEventOptions(settingsTriggerForm.source, settingsTriggerForm.actionType).map((eventName) =>
                                      React.createElement("option", { key: eventName, value: eventName }, eventName)
                                    )
                                  )
                                : React.createElement("input", {
                                    type: "text",
                                    className: "playground-environments-input playground-tasks-detail-fact-select",
                                    value: settingsTriggerForm.event,
                                    disabled: settingsTriggerSubmitting,
                                    onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, event: event.target.value })),
                                    placeholder: "event_callback",
                                  })
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Computer"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              React.createElement("select", {
                                className: "playground-environments-select playground-tasks-detail-fact-select playground-tasks-detail-priority-select",
                                value: settingsTriggerForm.environmentId,
                                disabled: settingsTriggerSubmitting,
                                onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, environmentId: event.target.value })),
                              },
                                React.createElement("option", { value: "" }, "Select computer"),
                                runtimeEnvironments.map((environment) =>
                                  React.createElement("option", { key: environment.id, value: environment.id }, environment.name || environment.id)
                                )
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Action"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              React.createElement("select", {
                                className: "playground-environments-select playground-tasks-detail-fact-select playground-tasks-detail-priority-select",
                                value: settingsTriggerForm.actionType,
                                disabled: settingsTriggerSubmitting,
                                onChange: (event) => setSettingsTriggerForm((current) => {
                                  const nextActionType = event.target.value;
                                  return {
                                    ...current,
                                    actionType: nextActionType,
                                    event: getSettingsTriggerDefaultEvent(current.source, nextActionType),
                                  };
                                }),
                              },
                                SETTINGS_TRIGGER_ACTION_OPTIONS
                                  .filter((option) => isSettingsTriggerActionSupportedForSource(settingsTriggerForm.source, option.value))
                                  .map((option) =>
                                    React.createElement("option", { key: option.value, value: option.value }, option.label)
                                  )
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Agent"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              React.createElement("select", {
                                className: "playground-environments-select playground-tasks-detail-fact-select playground-tasks-detail-priority-select",
                                value: settingsTriggerForm.agentId,
                                disabled: settingsTriggerSubmitting,
                                onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, agentId: event.target.value })),
                              },
                                React.createElement("option", { value: "" }, "Default agent"),
                                runtimeAgents.map((agent) =>
                                  React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.id)
                                )
                              )
                            )
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-modal-description" },
                          React.createElement("div", { className: "playground-tasks-detail-section-header" },
                            React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Prompt"),
                            React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                              [
                                { id: "bold", label: "Bold", icon: Bold },
                                { id: "italic", label: "Italic", icon: Italic },
                                { id: "underline", label: "Underline", icon: Underline },
                                { id: "list", label: "List", icon: List },
                              ].map((action) =>
                                React.createElement("button", {
                                  key: "settings-trigger-" + action.id,
                                  type: "button",
                                  className: "playground-tasks-detail-format-button",
                                  title: action.label,
                                  "aria-label": action.label,
                                  disabled: settingsTriggerSubmitting,
                                  onMouseDown: (event) => event.preventDefault(),
                                  onClick: () => handleSettingsTriggerPromptMarkdownFormat(action.id),
                                }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isSettingsTriggerPromptEditing ? " is-editing" : " is-preview") },
                            !isSettingsTriggerPromptEditing
                              ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                                  String(settingsTriggerForm.message || "").trim()
                                    ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                        content: settingsTriggerForm.message,
                                        className: "playground-tasks-detail-description-preview tb-message-markdown",
                                      })
                                    : React.createElement("div", {
                                        className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                      }, getSettingsTriggerPromptPlaceholder(settingsTriggerForm.source, settingsTriggerForm.actionType))
                                )
                              : null,
                            React.createElement("textarea", {
                              ref: settingsTriggerPromptTextareaRef,
                              className: "playground-tasks-detail-description-input " + (isSettingsTriggerPromptEditing ? "is-editing" : "is-preview"),
                              rows: 1,
                              placeholder: isSettingsTriggerPromptEditing
                                ? getSettingsTriggerPromptPlaceholder(settingsTriggerForm.source, settingsTriggerForm.actionType)
                                : "",
                              value: settingsTriggerForm.message,
                              disabled: settingsTriggerSubmitting,
                              onFocus: () => setIsSettingsTriggerPromptEditing(true),
                              onChange: (event) => {
                                updateSettingsTriggerPromptField(event.target.value);
                                resizeSettingsTriggerPromptTextarea(event.currentTarget);
                              },
                              onBlur: () => setIsSettingsTriggerPromptEditing(false),
                            })
                          ),
                          settingsTriggerForm.actionType === "comment_pull_request"
                            ? React.createElement("div", { className: "playground-environments-muted", style: { marginTop: 8 } }, "The assistant response will be posted back to the matching GitHub pull request as a comment.")
                            : settingsTriggerForm.actionType === "comment_merge_request"
                              ? React.createElement("div", { className: "playground-environments-muted", style: { marginTop: 8 } }, "The assistant response will be posted back to the matching GitLab merge request as a comment.")
                            : null
                        ),
                        settingsTriggerForm.source === "github"
                          ? React.createElement("div", { className: "playground-tasks-project-modal-field" },
                              React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Filters"),
                              !githubStatus.connected
                                ? React.createElement("div", { className: "playground-settings-trigger-connect-card" },
                                    React.createElement("div", { className: "playground-environments-muted" }, "Connect GitHub to choose one of your repositories for this webhook."),
                                    React.createElement(PlatformPrimaryButton, {
                                      size: "medium",
                                      type: "button",
                                      className: "playground-environments-action-button is-primary",
                                      onClick: () => {
                                        void handleGithubAuthConnect();
                                      },
                                      disabled: settingsTriggerSubmitting,
                                    },
                                      React.createElement("span", null, "Connect GitHub")
                                    )
                                  )
                                : React.createElement(React.Fragment, null,
                                    React.createElement("div", { className: "playground-settings-trigger-connect-card", style: { marginBottom: 8 } },
                                      React.createElement("div", { className: "playground-environments-muted" }, "GitHub is connected. Choose a repository or log out of GitHub for this webhook."),
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-environments-action-button",
                                        onClick: () => {
                                          void handleGithubAuthDisconnect();
                                        },
                                        disabled: settingsTriggerSubmitting,
                                      },
                                        React.createElement("span", null, "Log out of GitHub")
                                      )
                                    ),
                                    React.createElement("div", { className: "playground-environment-composer-runtime-facts" },
                                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                                        React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Repository"),
                                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                          React.createElement("select", {
                                            className: "playground-environments-select playground-tasks-detail-fact-select playground-tasks-detail-priority-select",
                                            value: settingsTriggerForm.filterRepo,
                                            disabled: settingsTriggerSubmitting || settingsTriggerGithubReposLoading,
                                            onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, filterRepo: event.target.value })),
                                          },
                                            React.createElement("option", { value: "" },
                                              settingsTriggerGithubReposLoading
                                                ? "Loading repositories..."
                                                : settingsTriggerGithubRepos.length === 0
                                                  ? "No repositories found"
                                                  : "Any connected repo"
                                            ),
                                            settingsTriggerGithubRepos.map((repo) =>
                                              React.createElement("option", { key: repo.id, value: repo.fullName }, repo.fullName)
                                            )
                                          )
                                        )
                                      ),
                                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                                        React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Branch Filter"),
                                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                          React.createElement("input", {
                                            type: "text",
                                            className: "playground-environments-input playground-tasks-detail-fact-select",
                                            value: settingsTriggerForm.filterBranch,
                                            disabled: settingsTriggerSubmitting,
                                            onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, filterBranch: event.target.value })),
                                            placeholder: "main",
                                          })
                                        )
                                      ),
                                      settingsTriggerGithubReposError
                                        ? React.createElement("div", { className: "playground-environments-muted", style: { color: "#ffb0b0" } }, settingsTriggerGithubReposError)
                                        : null
                                    )
                                  )
                            )
                          : settingsTriggerForm.source === "gitlab"
                            ? React.createElement("div", { className: "playground-tasks-project-modal-field" },
                                React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Filters"),
                                React.createElement("div", { className: "playground-settings-trigger-connect-card", style: { marginBottom: 8 } },
                                  React.createElement("div", { className: "playground-environments-muted" }, "Set a GitLab webhook secret in ACP, then configure the project webhook in GitLab. Add a GITLAB_TOKEN secret on the selected computer if you want ACP to comment back on merge requests.")
                                ),
                                React.createElement("div", { className: "playground-environment-composer-runtime-facts" },
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Project Filter"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                      React.createElement("input", {
                                        type: "text",
                                        className: "playground-environments-input playground-tasks-detail-fact-select",
                                        value: settingsTriggerForm.filterRepo,
                                        disabled: settingsTriggerSubmitting,
                                        onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, filterRepo: event.target.value })),
                                        placeholder: "group/project",
                                      })
                                    )
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Branch Filter"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                      React.createElement("input", {
                                        type: "text",
                                        className: "playground-environments-input playground-tasks-detail-fact-select",
                                        value: settingsTriggerForm.filterBranch,
                                        disabled: settingsTriggerSubmitting,
                                        onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, filterBranch: event.target.value })),
                                        placeholder: "main",
                                      })
                                    )
                                  )
                                )
                              )
                          : null
                      ),
                      settingsTriggersError
                        ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, settingsTriggersError)
                        : null,
                      React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: closeSettingsTriggerComposer,
                          disabled: settingsTriggerSubmitting,
                        }, "Cancel"),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "submit",
                          className: "playground-environments-action-button is-primary",
                          disabled: settingsTriggerSubmitting || !canCreateSettingsTrigger,
                        }, settingsTriggerSubmitting ? "Creating..." : "Create Webhook")
                      )
                    )
                  )
                : null;

              detailContent = React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                renderSettingsDetailHeader(
                  "Webhooks",
                  "Create triggers that launch agent work automatically when external events arrive.",
                  React.createElement(React.Fragment, null,
                    settingsSelectedTrigger
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: () => {
                            setSettingsSelectedTriggerId("");
                            setSettingsShowTriggerSecret(false);
                          },
                        }, React.createElement("span", null, "Back to List"))
                      : React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                          type: "button",
                          className: "playground-environments-action-button is-primary",
                          onClick: openSettingsTriggerComposer,
                        },
                          React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "New Webhook")
                        ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: () => {
                        void loadSettingsTriggers();
                      },
                    },
                      React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Refresh")
                    )
                  )
                ),
                renderSettingsBanner("error", settingsTriggersError),
                renderSettingsBanner("success", settingsTriggersSuccess),
                settingsSelectedTrigger
                  ? (() => {
                        const sourceMeta = getSettingsTriggerSourceMeta(settingsSelectedTrigger.source);
                        const TriggerIcon = sourceMeta.icon;
                        return React.createElement(React.Fragment, null,
                          renderSettingsSectionCard(
                            settingsSelectedTrigger.name || "Webhook",
                            sourceMeta.label + " · " + (settingsSelectedTrigger.event || "event") + " · " + getSettingsTriggerActionLabel(settingsSelectedTrigger.action),
                            React.createElement("div", { className: "playground-settings-card-stack" },
                              React.createElement("div", { className: "playground-settings-inline-row" },
                                React.createElement("div", { className: "playground-settings-inline-row-main" },
                                  React.createElement("div", { className: "playground-settings-empty-icon is-inline" },
                                    React.createElement(TriggerIcon, { width: 18, height: 18, strokeWidth: 1.8 })
                                  ),
                                  React.createElement("div", null,
                                    React.createElement("div", { className: "playground-settings-emphasis" }, settingsSelectedTrigger.name || "Webhook"),
                                    React.createElement("div", { className: "playground-settings-muted-copy" },
                                      settingsSelectedTrigger.lastTriggeredAt
                                        ? "Last triggered " + formatSettingsDateTime(settingsSelectedTrigger.lastTriggeredAt)
                                        : "No runs yet"
                                    )
                                  )
                                ),
                                React.createElement("div", { className: "playground-settings-chip-row" },
                                  renderSettingsChip(settingsSelectedTrigger.enabled ? "Enabled" : "Disabled", settingsSelectedTrigger.enabled ? "success" : "muted")
                                )
                              ),
                              React.createElement("div", { className: "playground-settings-form-grid" },
                                React.createElement("div", { className: "playground-settings-field" },
                                  React.createElement("label", { className: "playground-settings-label" }, "Webhook URL"),
                                  React.createElement("div", { className: "playground-settings-code-row" },
                                    React.createElement("code", { className: "playground-settings-code" }, settingsSelectedTrigger.webhookUrl || "Unavailable"),
                                    React.createElement("button", {
                                      type: "button",
                                      className: "playground-settings-icon-button",
                                      onClick: () => {
                                        void handleSettingsCopyField(settingsSelectedTrigger.webhookUrl, "trigger-url");
                                      },
                                    }, settingsCopiedField === "trigger-url" ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }) : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }))
                                  )
                                ),
                                React.createElement("div", { className: "playground-settings-field" },
                                  React.createElement("label", { className: "playground-settings-label" }, "Webhook Secret"),
                                  React.createElement("div", { className: "playground-settings-code-row" },
                                    React.createElement("code", { className: "playground-settings-code" }, settingsShowTriggerSecret ? (settingsSelectedTrigger.webhookSecret || "Unavailable") : "••••••••••••••••••••"),
                                    React.createElement("button", {
                                      type: "button",
                                      className: "playground-settings-icon-button",
                                      onClick: () => setSettingsShowTriggerSecret((current) => !current),
                                    }, settingsShowTriggerSecret ? React.createElement(EyeOff, { width: 14, height: 14, strokeWidth: 1.8 }) : React.createElement(Eye, { width: 14, height: 14, strokeWidth: 1.8 })),
                                    React.createElement("button", {
                                      type: "button",
                                      className: "playground-settings-icon-button",
                                      onClick: () => {
                                        void handleSettingsCopyField(settingsSelectedTrigger.webhookSecret, "trigger-secret");
                                      },
                                    }, settingsCopiedField === "trigger-secret" ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }) : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }))
                                  )
                                )
                              )
                            ),
                            React.createElement("div", { className: "playground-settings-form-actions" },
                              React.createElement("button", {
                                type: "button",
                                className: "playground-environments-action-button",
                                disabled: settingsTriggerActionId === settingsSelectedTrigger.id,
                                onClick: () => {
                                  void handleSettingsToggleTrigger(settingsSelectedTrigger);
                                },
                              }, React.createElement("span", null, settingsTriggerActionId === settingsSelectedTrigger.id && settingsTriggerActionType === "toggle" ? "Updating..." : (settingsSelectedTrigger.enabled ? "Disable" : "Enable"))),
                              React.createElement(PlatformPrimaryButton, {
                                size: "medium",
                                type: "button",
                                className: "playground-environments-action-button is-primary",
                                disabled: settingsTriggerActionId === settingsSelectedTrigger.id,
                                onClick: () => {
                                  void handleSettingsTestTrigger(settingsSelectedTrigger);
                                },
                              }, React.createElement("span", null, settingsTriggerActionId === settingsSelectedTrigger.id && settingsTriggerActionType === "test" ? "Testing..." : "Test Fire")),
                              React.createElement("button", {
                                type: "button",
                                className: "playground-environments-action-button playground-settings-danger-action",
                                disabled: settingsTriggerActionId === settingsSelectedTrigger.id,
                                onClick: () => {
                                  void handleSettingsDeleteTrigger(settingsSelectedTrigger);
                                },
                              }, React.createElement("span", null, settingsTriggerActionId === settingsSelectedTrigger.id && settingsTriggerActionType === "delete" ? "Deleting..." : "Delete"))
                            )
                          )
                        );
                      })()
                    : renderSettingsSectionCard(
                        "Webhook triggers",
                        "Route GitHub, GitLab, Slack, and raw webhook events into agent executions.",
                  settingsTriggersLoading
                    ? React.createElement("div", { className: "playground-settings-loading-state" },
                        React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                      )
                    : visibleTriggers.length === 0
                      ? (
                        settingsTriggers.length === 0
                          ? renderWebhookEmptyState()
                          : React.createElement("div", { className: "playground-plugins-empty" }, "No webhooks match your search.")
                      )
                      : React.createElement("div", { className: "playground-settings-listing" },
                          visibleTriggers.map((trigger) => {
                                  const sourceMeta = getSettingsTriggerSourceMeta(trigger.source);
                                  const TriggerIcon = sourceMeta.icon;
                                  return React.createElement("button", {
                                      key: trigger.id,
                                      type: "button",
                                      className: "playground-settings-trigger-card",
                                      onClick: () => setSettingsSelectedTriggerId(trigger.id),
                                    },
                                      React.createElement("div", { className: "playground-settings-inline-row" },
                                        React.createElement("div", { className: "playground-settings-inline-row-main" },
                                          React.createElement("div", { className: "playground-settings-empty-icon is-inline" },
                                            React.createElement(TriggerIcon, { width: 18, height: 18, strokeWidth: 1.8 })
                                          ),
                                          React.createElement("div", null,
                                            React.createElement("div", { className: "playground-settings-emphasis" }, trigger.name || "Webhook"),
                                            React.createElement("div", { className: "playground-settings-muted-copy" },
                                              sourceMeta.label + " · " + (trigger.event || "event") + " · " + getSettingsTriggerActionLabel(trigger.action) + (trigger.lastTriggeredAt ? " · " + formatSettingsDate(trigger.lastTriggeredAt) : "")
                                            )
                                          )
                                        ),
                                        React.createElement("div", { className: "playground-settings-chip-row" },
                                          renderSettingsChip(trigger.enabled ? "Active" : "Inactive", trigger.enabled ? "success" : "muted")
                                        )
                                      )
                                    );
                                })
                              )
                      ),
                settingsTriggerComposerDialog
              );
              break;
            }
${apiKeysLegacySettingsCase}            case "design":
              detailContent = React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                renderSettingsDetailHeader(
                  "Design",
                  "Visual and interaction settings that change how the playground renders the Runner surface.",
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => setSidebarOpen((current) => !current),
                  }, React.createElement("span", null, sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"))
                ),
                React.createElement("div", { className: "playground-environments-summary-grid" },
                  renderSettingsSummaryCard("Runner Surface", [
                    { label: "Input Mode", value: "Computer Agents" },
                    { label: "Sidebar", value: sidebarOpen ? "Expanded" : "Collapsed" },
                    { label: "Content Mode", value: contentMode === "changes" ? "Changes" : "Thread" },
                    { label: "Welcome State", value: showInitialThreadWelcome ? "Visible" : "Hidden" },
                  ]),
                  React.createElement("div", { className: "playground-environments-summary-card" },
                    React.createElement("div", { className: "playground-environments-summary-title" }, "Composer Mode"),
                    React.createElement("div", { className: "playground-environments-toggle-row" },
                      React.createElement("div", { className: "playground-environments-toggle-copy" },
                        React.createElement("div", { className: "playground-environments-subtitle" }, "Computer Agents Mode"),
                        React.createElement("div", { className: "playground-environments-muted" }, "The playground always uses the full cloud-style task input bar with agent and environment selectors.")
                      ),
                      React.createElement("div", {
                        className: "playground-environments-toggle is-active",
                        "aria-hidden": "true",
                      }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                    )
                  )
                ),
                renderSettingsNote(
                  "Presentation only",
                  React.createElement("span", null,
                    "These controls only affect how the local playground shell renders Runner. They do not change saved agents, environments, or billing."
                  )
                )
              );
              break;
	            case "profile":
	              detailContent = React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
	                React.createElement("div", { className: "playground-settings-account-shell is-wide" },
	                  React.createElement("div", { className: "playground-settings-account-block" },
	                    React.createElement("div", { className: "playground-settings-field", style: { maxWidth: "42rem" } },
	                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-profile-email-address" }, "Email address"),
	                      React.createElement("input", {
                        id: "settings-profile-email-address",
                        type: "email",
                        className: "playground-settings-input",
                        value: accountEmail || "",
                        placeholder: "No email address available",
                        disabled: true,
                        style: { color: "rgba(255, 255, 255, 0.56)", cursor: "not-allowed" },
                      }),
                      accountEmail
                        ? React.createElement("div", { className: "playground-settings-account-inline" },
                            sessionState.emailVerified
                              ? React.createElement(React.Fragment, null,
                                  React.createElement(Check, { width: 12, height: 12, strokeWidth: 1.9 }),
                                  React.createElement("span", null, "Email verified")
                                )
                              : React.createElement(React.Fragment, null,
                                  React.createElement(AlertCircle, { width: 12, height: 12, strokeWidth: 1.9 }),
                                  React.createElement("span", null, "Email not verified"),
                                  React.createElement("span", { className: "playground-settings-account-bullet" }, "•"),
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-settings-account-link",
                                    onClick: () => {
                                      void handleSettingsResendVerificationEmail();
                                    },
                                    disabled: settingsVerificationResending || settingsVerificationResent,
                                  }, settingsVerificationResending
                                    ? "Sending..."
                                    : (settingsVerificationResent ? "Sent!" : "Resend verification email"))
                                )
                          )
                        : React.createElement("div", { className: "playground-settings-muted-copy" }, "No email address is linked to this session.")
                    ),
                    accountEmail && !sessionState.emailVerified
                      ? React.createElement("div", {
                          className: "playground-settings-integration-notice is-warning",
                          style: { maxWidth: "42rem" },
                        },
                          React.createElement("div", { style: { fontWeight: 600, marginBottom: "4px" } }, "Verify your email address"),
                          React.createElement("div", null, "Your account email is not verified yet. Verify it to secure your account and restore email-based actions."),
                          settingsVerificationError
                            ? React.createElement("div", {
                                className: "playground-settings-inline-status is-error",
                                style: { marginTop: "10px" },
                              },
                                React.createElement(AlertCircle, { width: 12, height: 12, strokeWidth: 1.9 }),
                                React.createElement("span", null, settingsVerificationError)
                              )
                            : null
                        )
                      : null,
                    React.createElement("div", { className: "playground-settings-field", style: { maxWidth: "42rem" } },
                      React.createElement("label", { className: "playground-settings-label" }, "Marketing Emails"),
                      React.createElement("div", { className: "playground-settings-muted-copy" }, "Get occasional product updates, launch announcements, and offer emails. You can unsubscribe anytime."),
                      React.createElement("div", { className: "playground-settings-choice-row" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-choice-button" + (settingsMarketingConsentStatus === "opted_in" ? " is-active" : ""),
                          disabled: settingsMarketingConsentSaving || settingsMarketingConsentLoading,
                          onClick: () => {
                            void updateSettingsMarketingConsent("opted_in");
                          },
                        }, "Subscribed"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-choice-button" + (settingsMarketingConsentStatus === "opted_out" ? " is-active" : ""),
                          disabled: settingsMarketingConsentSaving || settingsMarketingConsentLoading,
                          onClick: () => {
                            void updateSettingsMarketingConsent("opted_out");
                          },
                        }, "Not subscribed"),
                        settingsMarketingConsentLoading || settingsMarketingConsentSaving
                          ? React.createElement("span", { className: "playground-settings-choice-loading" },
                              React.createElement(Loader2, { width: 12, height: 12, strokeWidth: 1.8, className: "playground-settings-records-spinner" }),
                              React.createElement("span", null, "Saving...")
                            )
                          : null
                      )
                    ),
                    !accountEmail && settingsVerificationError
                      ? renderSettingsInlineStatus("error", settingsVerificationError)
                      : null,
                    renderSettingsInlineStatus("error", settingsMarketingConsentError),
                    renderSettingsInlineStatus("success", settingsMarketingConsentSuccess),
	                    React.createElement("div", { className: "playground-settings-account-divider" },
	                      React.createElement("h3", { className: "playground-settings-records-title" }, "Password"),
	                      React.createElement("p", { className: "playground-settings-records-subtitle" }, "Update your account password")
	                    ),
	                    React.createElement("div", { className: "playground-settings-field", style: { maxWidth: "32rem" } },
	                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-password-current" }, "Current Password"),
	                      React.createElement("input", {
	                        id: "settings-password-current",
	                        type: "password",
	                        className: "playground-settings-input",
	                        value: settingsPasswordForm.currentPassword,
	                        onChange: (event) => setSettingsPasswordForm((current) => ({ ...current, currentPassword: event.target.value })),
	                        placeholder: "••••••••",
	                      })
	                    ),
	                    React.createElement("div", { className: "playground-settings-field", style: { maxWidth: "32rem" } },
	                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-password-new" }, "New Password"),
	                      React.createElement("input", {
	                        id: "settings-password-new",
	                        type: "password",
	                        className: "playground-settings-input",
	                        value: settingsPasswordForm.newPassword,
	                        onChange: (event) => setSettingsPasswordForm((current) => ({ ...current, newPassword: event.target.value })),
	                        placeholder: "••••••••",
	                      })
	                    ),
	                    React.createElement("div", { className: "playground-settings-field", style: { maxWidth: "32rem" } },
	                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-password-confirm" }, "Confirm New Password"),
	                      React.createElement("input", {
	                        id: "settings-password-confirm",
	                        type: "password",
	                        className: "playground-settings-input",
	                        value: settingsPasswordForm.confirmPassword,
	                        onChange: (event) => setSettingsPasswordForm((current) => ({ ...current, confirmPassword: event.target.value })),
	                        placeholder: "••••••••",
	                      })
	                    ),
	                    renderSettingsInlineStatus("error", settingsPasswordError),
	                    renderSettingsInlineStatus("success", settingsPasswordSuccess),
	                    React.createElement(PlatformPrimaryButton, {
	                      size: "large",
	                      type: "button",
	                      className: "playground-settings-app-primary-button",
	                      disabled: settingsPasswordLoading || !settingsPasswordForm.currentPassword || !settingsPasswordForm.newPassword || !settingsPasswordForm.confirmPassword,
	                      onClick: () => {
	                        void handleSettingsPasswordChange();
	                      },
	                    }, settingsPasswordLoading
	                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-settings-records-spinner" })
	                      : "Update Password"),
	                    React.createElement("div", { className: "playground-settings-account-divider" },
	                      React.createElement("h3", { className: "playground-settings-records-title" }, "Delete Account"),
	                      React.createElement("p", { className: "playground-settings-records-subtitle" }, "Permanently remove the signed-in account and purge associated cloud data")
	                    ),
	                    renderSettingsNote(
	                      "Warning",
	                      React.createElement("span", null,
	                        "This action permanently deletes threads, integrations, billing references, and account data. It cannot be undone."
	                      ),
	                      null,
	                      { isDanger: true }
	                    ),
	                    renderSettingsBanner("error", settingsDeleteError),
	                    React.createElement("div", { className: "playground-environments-summary-grid" },
	                      renderSettingsSectionCard(
	                        "Delete this account",
	                        "Confirm the account password and type DELETE to continue.",
	                        React.createElement("div", { className: "playground-settings-card-stack" },
	                          React.createElement("div", { className: "playground-settings-field" },
	                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-delete-confirm" }, "Type DELETE"),
	                            React.createElement("input", {
	                              id: "settings-delete-confirm",
	                              className: "playground-settings-input playground-settings-input-danger",
	                              value: settingsDeleteConfirmation,
	                              onChange: (event) => setSettingsDeleteConfirmation(event.target.value),
	                              placeholder: "DELETE",
	                            })
	                          ),
	                          React.createElement("div", { className: "playground-settings-field" },
	                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-delete-password" }, "Account Password"),
	                            React.createElement("input", {
	                              id: "settings-delete-password",
	                              type: "password",
	                              className: "playground-settings-input playground-settings-input-danger",
	                              value: settingsDeletePassword,
	                              onChange: (event) => setSettingsDeletePassword(event.target.value),
	                              placeholder: "••••••••",
	                            })
	                          )
	                        ),
	                        React.createElement("button", {
	                          type: "button",
	                          className: "playground-settings-danger-button",
	                          disabled: settingsDeleteLoading,
	                          onClick: () => {
	                            void handleSettingsDeleteAccount();
	                          },
	                        }, settingsDeleteLoading ? "Deleting..." : "Delete My Account")
	                      ),
	                      renderSettingsSummaryCard("Account at Risk", [
	                        { label: "Name", value: accountName || "Unknown account" },
	                        { label: "Email", value: accountEmail || "No email on file" },
	                        { label: "Plan", value: formatSubscriptionTier(settingsCurrentTierId) },
	                        { label: "Project", value: activeProjectId || "No project selected" },
	                      ])
	                    )
	                  )
	                )
	              );
              break;
            case "password":
              detailContent = React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                React.createElement("div", { className: "playground-settings-account-shell" },
                  React.createElement("div", null,
                    React.createElement("h3", { className: "playground-settings-records-title" }, "Change Password"),
                    React.createElement("p", { className: "playground-settings-records-subtitle" }, "Update your account password")
                  ),
                  React.createElement("div", { className: "playground-settings-account-block" },
                    React.createElement("div", { className: "playground-settings-field", style: { maxWidth: "32rem" } },
                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-password-current" }, "Current Password"),
                      React.createElement("input", {
                        id: "settings-password-current",
                        type: "password",
                        className: "playground-settings-input",
                        value: settingsPasswordForm.currentPassword,
                        onChange: (event) => setSettingsPasswordForm((current) => ({ ...current, currentPassword: event.target.value })),
                        placeholder: "••••••••",
                      })
                    ),
                    React.createElement("div", { className: "playground-settings-field", style: { maxWidth: "32rem" } },
                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-password-new" }, "New Password"),
                      React.createElement("input", {
                        id: "settings-password-new",
                        type: "password",
                        className: "playground-settings-input",
                        value: settingsPasswordForm.newPassword,
                        onChange: (event) => setSettingsPasswordForm((current) => ({ ...current, newPassword: event.target.value })),
                        placeholder: "••••••••",
                      })
                    ),
                    React.createElement("div", { className: "playground-settings-field", style: { maxWidth: "32rem" } },
                      React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-password-confirm" }, "Confirm New Password"),
                      React.createElement("input", {
                        id: "settings-password-confirm",
                        type: "password",
                        className: "playground-settings-input",
                        value: settingsPasswordForm.confirmPassword,
                        onChange: (event) => setSettingsPasswordForm((current) => ({ ...current, confirmPassword: event.target.value })),
                        placeholder: "••••••••",
                      })
                    ),
                    renderSettingsInlineStatus("error", settingsPasswordError),
                    renderSettingsInlineStatus("success", settingsPasswordSuccess),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "button",
                      className: "playground-settings-app-primary-button",
                      disabled: settingsPasswordLoading || !settingsPasswordForm.currentPassword || !settingsPasswordForm.newPassword || !settingsPasswordForm.confirmPassword,
                      onClick: () => {
                        void handleSettingsPasswordChange();
                      },
                    }, settingsPasswordLoading
                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-settings-records-spinner" })
                      : "Update Password")
                  )
                )
              );
              break;
            case "delete":
              detailContent = React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                renderSettingsDetailHeader(
                  "Delete Account",
                  "Permanently remove the signed-in account and purge the associated cloud data.",
                  hasSessionAuth
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: handleSignOutFromComputerAgents,
                      },
                        React.createElement(LogOut, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Sign Out")
                      )
                    : null
                ),
                renderSettingsNote(
                  "Warning",
                  React.createElement("span", null,
                    "This action permanently deletes threads, integrations, billing references, and account data. It cannot be undone."
                  ),
                  null,
                  { isDanger: true }
                ),
                renderSettingsBanner("error", settingsDeleteError),
                React.createElement("div", { className: "playground-environments-summary-grid" },
                  renderSettingsSectionCard(
                    "Delete this account",
                    "Confirm the account password and type DELETE to continue.",
                    React.createElement("div", { className: "playground-settings-card-stack" },
                      React.createElement("div", { className: "playground-settings-field" },
                        React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-delete-confirm" }, "Type DELETE"),
                        React.createElement("input", {
                          id: "settings-delete-confirm",
                          className: "playground-settings-input playground-settings-input-danger",
                          value: settingsDeleteConfirmation,
                          onChange: (event) => setSettingsDeleteConfirmation(event.target.value),
                          placeholder: "DELETE",
                        })
                      ),
                      React.createElement("div", { className: "playground-settings-field" },
                        React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-delete-password" }, "Account Password"),
                        React.createElement("input", {
                          id: "settings-delete-password",
                          type: "password",
                          className: "playground-settings-input playground-settings-input-danger",
                          value: settingsDeletePassword,
                          onChange: (event) => setSettingsDeletePassword(event.target.value),
                          placeholder: "••••••••",
                        })
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-danger-button",
                      disabled: settingsDeleteLoading,
                      onClick: () => {
                        void handleSettingsDeleteAccount();
                      },
                    }, settingsDeleteLoading ? "Deleting..." : "Delete My Account")
                  ),
                  renderSettingsSummaryCard("Account at Risk", [
                    { label: "Name", value: accountName || "Unknown account" },
                    { label: "Email", value: accountEmail || "No email on file" },
                    { label: "Plan", value: formatSubscriptionTier(settingsCurrentTierId) },
                    { label: "Project", value: activeProjectId || "No project selected" },
                  ])
                )
              );
              break;
            default:
              detailContent = React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                renderSettingsDetailHeader("Settings", "Select a settings area from the sidebar.")
              );
          }

	          const settingsHeader = React.createElement("div", { className: "playground-settings-overview-header" },
	            React.createElement("div", { className: "playground-environments-home-hero-title playground-settings-overview-title" }, selectedSection.title),
	            !isEmbeddedSettingsPage && settingsTabs.length > 1
                ? React.createElement("div", { className: "playground-agents-overview-tabs playground-resources-overview-tabs playground-settings-overview-tabs" },
                    React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                      settingsTabs.map((tab) =>
                        React.createElement("button", {
                          key: tab.id,
                          type: "button",
                          className: "playground-project-overview-chart-tab" + (effectiveSettingsSection === tab.id ? " is-active" : ""),
	                          onClick: () => navigateSettingsSection(tab.id),
                          "aria-pressed": effectiveSettingsSection === tab.id ? "true" : "false",
                        }, tab.label)
                      )
                    )
                  )
                : null
	          );
	          const normalizeSettingsDetailNodes = (content) => {
	            const nodes = React.Children.toArray(content?.type === React.Fragment ? content.props.children : content);
	            const filteredNodes = nodes.filter((node) =>
	              !String(node?.props?.className || "").includes("playground-settings-plans-navbar")
	            );
	            if (filteredNodes.length === 1) {
	              const onlyNode = filteredNodes[0];
	              if (String(onlyNode?.props?.className || "").includes("playground-settings-detail-scroll")) {
	                return React.Children.toArray(onlyNode.props.children);
	              }
	            }
	            return filteredNodes;
	          };
	          const settingsScrollClassName = "playground-environments-detail-scroll playground-settings-detail-scroll"
	            + (effectiveSettingsSection === "costs-overview" ? " is-usage" : "");

	          return React.createElement("div", { className: "playground-settings-page" + (isEmbeddedSettingsPage ? " is-embedded" : "") },
	            React.createElement("div", { className: settingsScrollClassName },
	              isEmbeddedSettingsPage ? null : settingsHeader,
	              normalizeSettingsDetailNodes(detailContent)
	            )
	          );
        }


        function renderSettingsModal() {
          return React.createElement(PlatformModal, {
              open: settingsModalOpen,
              onClose: closeSettingsModal,
              size: "large",
              maxWidth: "900px",
              maxHeight: "calc(100dvh - 48px)",
              className: "playground-shell-settings-modal",
              title: "Settings",
              closeButtonLabel: "Close settings",
            },
            React.createElement(PlatformModalBody, { className: "playground-shell-settings-modal-body" },
              renderSettingsSurface({
                embedded: true,
                section: settingsSection,
              })
            )
          );
        }
`;
}
