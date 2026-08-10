export const ORGANIZATIONS_PAGE_SUBSCRIPTION_SCRIPT = `          const renderOrganizationSubscription = () => {
            const summary = organizationPageBillingSummary && typeof organizationPageBillingSummary === "object"
              ? organizationPageBillingSummary
              : {};
            const budget = summary.budget && typeof summary.budget === "object"
              ? summary.budget
              : settingsBudgetStatus && typeof settingsBudgetStatus === "object"
                ? settingsBudgetStatus
                : {};
            const summaryPlan = summary.plan && typeof summary.plan === "object"
              ? summary.plan
              : budget.organizationPlan && typeof budget.organizationPlan === "object"
                ? budget.organizationPlan
                : {};
            const planId = normalizeSettingsTierId(summaryPlan.id || budget.planId || budget.tier || settingsCurrentTierId) || "sandbox";
            const catalogPlan = SETTINGS_PLAN_CATALOG.find((plan) => plan.id === planId) || SETTINGS_PLAN_CATALOG[0] || {};
            const plan = { ...catalogPlan, ...summaryPlan, id: planId };
            const includedUsageUsd = Math.max(
              0,
              Number(plan.includedUsageUsd || 0),
              readSettingsUsdAmount(budget, ["includedCredits", "includedTierQuota", "tierQuota"])
            );
            const includedUsageCT = settingsDollarsToComputeTokens(includedUsageUsd);
            const totalUsedCT = Math.max(
              readSettingsComputeTokens(settingsUsageSummary?.totals, "totalCT", "totalCost"),
              settingsDollarsToComputeTokens(readSettingsUsdAmount(budget, ["currentPeriodUsage", "usage", "usedCredits"]))
            );
            const agentUsedCT = Math.max(0, readSettingsComputeTokens(settingsUsageSummary?.totals, "agentCT", "agentCost"));
            const environmentUsedCT = Math.max(0, readSettingsComputeTokens(settingsUsageSummary?.totals, "environmentCT", "environmentCost"));
            const resetAtValue = budget.periodEndDate || settingsUsageSummary?.endDate || "";
            const resetAt = resetAtValue ? new Date(resetAtValue) : null;
            const hasResetAt = Boolean(resetAt && !Number.isNaN(resetAt.getTime()));
            const daysUntilReset = hasResetAt
              ? Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
              : null;
            const resetLabel = plan.includedUsageCadence === "one_time"
              ? "One-time allowance"
              : daysUntilReset == null
                ? "Resets with the next billing cycle"
                : daysUntilReset === 0
                  ? "Resets today"
                  : "Resets in " + daysUntilReset + " day" + (daysUntilReset === 1 ? "" : "s");
            const payAsYouGoEnabled = Boolean(settingsBillingPreferences.usageBillingEnabled);
            const spendLimit = Math.max(0, Number(settingsBillingPreferences.monthlyResourceSpendLimit || 0));
            const spendLimitEnabled = spendLimit > 0;
            const payAsYouGoUsedUsd = Math.max(0, (totalUsedCT / SETTINGS_CT_PER_DOLLAR) - includedUsageUsd);
            const spendLimitPercentage = spendLimit > 0
              ? clampSettingsPercentage((payAsYouGoUsedUsd / spendLimit) * 100)
              : 0;
            const controlsDisabled = !canManageOrganization || !settingsCanConfigureUsageBilling || settingsPlatformConfigSaving;
            const isInitialLoading = (settingsBudgetLoading || settingsUsageLoading || settingsInvoicesLoading)
              && !settingsBudgetStatus;
            const renderUsageAllowance = (id, title, description, usedCT) => {
              const percentage = includedUsageCT > 0
                ? clampSettingsPercentage((Math.max(0, Number(usedCT || 0)) / includedUsageCT) * 100)
                : 0;
              return React.createElement("div", { key: id, className: "playground-organization-subscription-usage" },
                React.createElement("div", { className: "playground-organization-subscription-usage-copy" },
                  React.createElement("div", { className: "playground-organization-subscription-row-title" }, title),
                  React.createElement("div", { className: "playground-organization-subscription-description" }, description)
                ),
                React.createElement("div", { className: "playground-organization-subscription-usage-values" },
                  React.createElement("span", null, formatSettingsComputeTokens(usedCT)),
                  React.createElement("span", null, formatSettingsCurrency(includedUsageUsd))
                ),
                React.createElement("div", {
                    className: "playground-organization-subscription-progress",
                    role: "progressbar",
                    "aria-label": title,
                    "aria-valuemin": 0,
                    "aria-valuemax": 100,
                    "aria-valuenow": percentage,
                  },
                  React.createElement("span", {
                    className: "playground-organization-subscription-progress-value",
                    style: { width: percentage + "%" },
                  })
                ),
                React.createElement("div", { className: "playground-organization-subscription-reset" }, resetLabel)
              );
            };
            const saveUsageControls = (nextPreferences) => {
              void handleSettingsUsageBillingSave(normalizeDemoSettingsBillingPreferences(nextPreferences));
            };
            const toggleSpendLimit = (enabled) => {
              const nextPreferences = {
                ...settingsBillingPreferences,
                monthlyResourceSpendLimit: enabled
                  ? (spendLimit > 0 ? spendLimit : Math.max(5, Number(plan.defaultMonthlyOverageLimitUsd || 0)))
                  : 0,
              };
              setSettingsBillingPreferences(normalizeDemoSettingsBillingPreferences(nextPreferences));
              saveUsageControls(nextPreferences);
            };

            const isEnterprisePlan = planId === "enterprise";
            const hasPaidPlan = planId !== "sandbox";
            const isAppleManagedPlan = settingsBudgetStatus?.subscriptionSource === "apple" && hasPaidPlan;
            const currentBillingInterval = String(
              summary?.subscription?.billingInterval
              || budget?.billingInterval
              || organizationPageProviderBilling?.subscription?.billingInterval
              || "monthly"
            ).trim().toLowerCase() === "annual" ? "annual" : "monthly";
            const getIncludedBuilderSeats = (candidatePlan) => {
              const value = candidatePlan?.includedBuilderSeats;
              return value === "unlimited" ? null : Math.max(1, Math.round(Number(value || 1)));
            };
            const getPlanSeatCount = (candidatePlan) => {
              const includedSeats = getIncludedBuilderSeats(candidatePlan);
              if (includedSeats == null) return null;
              const savedSeatCount = Number(organizationSubscriptionSeatCounts?.[candidatePlan.id]);
              return Number.isFinite(savedSeatCount)
                ? Math.max(includedSeats, Math.min(500, Math.round(savedSeatCount)))
                : includedSeats;
            };
            const getCurrentPlanBuilderSeatCount = () => Math.max(
              Number(summary?.subscription?.builderSeats || budget?.builderSeats || 0),
              getIncludedBuilderSeats(plan) || 1
            );
            const updatePlanSeatCount = (candidatePlan, nextValue) => {
              const includedSeats = getIncludedBuilderSeats(candidatePlan);
              if (includedSeats == null) return;
              const normalizedValue = Math.max(includedSeats, Math.min(500, Math.round(Number(nextValue || includedSeats))));
              setOrganizationSubscriptionSeatCounts((current) => ({
                ...current,
                [candidatePlan.id]: normalizedValue,
              }));
            };
            const openSubscriptionPlanChooser = () => {
              const currentSeatCount = getCurrentPlanBuilderSeatCount();
              setOrganizationSubscriptionBillingInterval(currentBillingInterval);
              setOrganizationSubscriptionSeatCounts((current) => ({
                ...current,
                [planId]: currentSeatCount,
              }));
              setOrganizationSubscriptionPlanChooserOpen(true);
            };
            const renderSubscriptionPlanChooser = () => {
              if (!organizationSubscriptionPlanChooserOpen || typeof document === "undefined") return null;
              const selectablePlans = getSettingsPlanOptions(planId);
              const annualSavingsPercentages = selectablePlans
                .map((candidatePlan) => {
                  const monthlyPrice = Number(candidatePlan?.monthlyPrice);
                  const annualMonthlyPrice = Number(candidatePlan?.yearlyPrice);
                  return monthlyPrice > 0 && annualMonthlyPrice >= 0
                    ? Math.max(0, Math.round((1 - (annualMonthlyPrice / monthlyPrice)) * 100))
                    : 0;
                });
              const maximumAnnualSaving = Math.max(0, ...annualSavingsPercentages);
              const closePlanChooser = () => setOrganizationSubscriptionPlanChooserOpen(false);
              const renderPlanCard = (candidatePlan) => {
                const isCurrentPlan = candidatePlan.id === planId;
                const isHighlighted = Boolean(candidatePlan.highlighted);
                const includedSeats = getIncludedBuilderSeats(candidatePlan);
                const seatCount = getPlanSeatCount(candidatePlan);
                const additionalSeatPrice = organizationSubscriptionBillingInterval === "annual"
                  ? Number(candidatePlan?.price?.additionalBuilderSeatAnnualMonthlyUsd || 0)
                  : Number(candidatePlan?.price?.additionalBuilderSeatMonthlyUsd || 0);
                const baseMonthlyPrice = organizationSubscriptionBillingInterval === "annual"
                  ? candidatePlan.yearlyPrice
                  : candidatePlan.monthlyPrice;
                const additionalSeatCount = includedSeats == null || seatCount == null
                  ? 0
                  : Math.max(0, seatCount - includedSeats);
                const calculatedMonthlyPrice = baseMonthlyPrice == null
                  ? null
                  : Math.max(0, Number(baseMonthlyPrice || 0) + (additionalSeatCount * additionalSeatPrice));
                const annualTotal = calculatedMonthlyPrice == null
                  ? null
                  : calculatedMonthlyPrice * 12;
                const planFeatures = getSettingsPlanFeatures(candidatePlan.id, Number(candidatePlan.computeTokens || 0));
                const isPlanActionLoading = settingsCheckoutLoading || settingsSubscriptionActionId === candidatePlan.id;
                const canAdjustSeats = includedSeats != null
                  && additionalSeatPrice > 0
                  && candidatePlan.selfServe !== false;
                const currentPlanSeatCount = getCurrentPlanBuilderSeatCount();
                const canUpdateCurrentSeats = isCurrentPlan && candidatePlan.id === "enterprise";
                const isCurrentPlanSeatChange = canUpdateCurrentSeats && seatCount > currentPlanSeatCount;
                const seatControlDisabled = (isCurrentPlan && !canUpdateCurrentSeats)
                  || isAppleManagedPlan
                  || !canManageOrganization;
                const minimumSeatCount = isCurrentPlan ? currentPlanSeatCount : includedSeats;
                const choosePlan = () => {
                  if (isPlanActionLoading || !canManageOrganization || isAppleManagedPlan) return;
                  if (isCurrentPlan) {
                    if (!isCurrentPlanSeatChange) return;
                    void handleSettingsChangePlan(candidatePlan.id, { builderSeats: seatCount });
                    return;
                  }
                  if (hasPaidPlan) {
                    void handleSettingsChangePlan(candidatePlan.id, {
                      ...(seatCount == null ? {} : { builderSeats: seatCount }),
                    });
                    return;
                  }
                  void handleSettingsSubscribe(candidatePlan.id, {
                    billingInterval: organizationSubscriptionBillingInterval,
                    ...(seatCount == null ? {} : { builderSeats: seatCount }),
                  });
                };
                const actionLabel = isCurrentPlanSeatChange
                  ? "Update seats"
                  : isCurrentPlan
                    ? "Current plan"
                    : isAppleManagedPlan
                      ? "Manage on iPhone or iPad"
                      : isPlanActionLoading
                        ? "Loading..."
                        : hasPaidPlan
                          ? "Switch to " + candidatePlan.name
                          : "Choose " + candidatePlan.name;

                return React.createElement("article", {
                    key: candidatePlan.id,
                    className: "playground-organization-plan-chooser-card"
                      + (isHighlighted ? " is-highlighted" : "")
                      + (isCurrentPlan ? " is-current" : ""),
                  },
                  React.createElement("div", { className: "playground-organization-plan-chooser-card-accent" },
                    isHighlighted ? "Recommended" : isCurrentPlan ? "Current plan" : ""
                  ),
                  React.createElement("div", { className: "playground-organization-plan-chooser-card-body" },
                    React.createElement("div", { className: "playground-organization-plan-chooser-plan-heading" },
                      React.createElement("div", null,
                        React.createElement("h2", { className: "playground-organization-plan-chooser-plan-name" }, candidatePlan.name),
                        React.createElement("div", { className: "playground-organization-plan-chooser-plan-audience" }, candidatePlan.audience || "Computer Agents plan")
                      )
                    ),
                    React.createElement("p", { className: "playground-organization-plan-chooser-plan-description" }, candidatePlan.description),
                    React.createElement("ul", { className: "playground-organization-plan-chooser-features" },
                      planFeatures.map((feature, index) => React.createElement("li", { key: candidatePlan.id + ":" + index },
                        React.createElement(Check, { width: 14, height: 14, strokeWidth: 2, "aria-hidden": "true" }),
                        React.createElement("span", null, feature.text)
                      ))
                    ),
                    canAdjustSeats
                      ? React.createElement("div", { className: "playground-organization-plan-chooser-seats" },
                          React.createElement("span", null, "Builder seats"),
                          React.createElement("div", { className: "playground-organization-plan-chooser-stepper" },
                            React.createElement("button", {
                              type: "button",
                              onClick: () => updatePlanSeatCount(candidatePlan, seatCount - 1),
                              disabled: seatControlDisabled || seatCount <= minimumSeatCount,
                              "aria-label": "Remove one " + candidatePlan.name + " builder seat",
                            }, React.createElement(Minus, { width: 14, height: 14, strokeWidth: 1.8 })),
                            React.createElement("span", { "aria-live": "polite" }, String(seatCount)),
                            React.createElement("button", {
                              type: "button",
                              onClick: () => updatePlanSeatCount(candidatePlan, seatCount + 1),
                              disabled: seatControlDisabled || seatCount >= 500,
                              "aria-label": "Add one " + candidatePlan.name + " builder seat",
                            }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      : null,
                    React.createElement("div", { className: "playground-organization-plan-chooser-card-footer" },
                      React.createElement("div", { className: "playground-organization-plan-chooser-price" },
                        calculatedMonthlyPrice == null
                          ? React.createElement("strong", null, "Custom")
                          : React.createElement(React.Fragment, null,
                              React.createElement("strong", null, "$" + (Number.isInteger(calculatedMonthlyPrice) ? calculatedMonthlyPrice : calculatedMonthlyPrice.toFixed(2))),
                              React.createElement("span", null, " / month")
                            ),
                        organizationSubscriptionBillingInterval === "annual" && annualTotal != null
                          ? React.createElement("small", null, "Billed $" + (Number.isInteger(annualTotal) ? annualTotal : annualTotal.toFixed(2)) + " annually")
                          : null
                      ),
                      React.createElement((!isCurrentPlan || isCurrentPlanSeatChange) && !isAppleManagedPlan ? PlatformPrimaryButton : PlatformButton, {
                        variant: (!isCurrentPlan || isCurrentPlanSeatChange) && !isAppleManagedPlan ? undefined : "secondary",
                        size: "large",
                        type: "button",
                        className: "playground-organization-plan-chooser-action"
                          + (isCurrentPlan && !isCurrentPlanSeatChange ? " is-current" : ""),
                        onClick: choosePlan,
                        disabled: (!isCurrentPlanSeatChange && isCurrentPlan)
                          || isPlanActionLoading
                          || !canManageOrganization
                          || isAppleManagedPlan,
                      },
                        actionLabel,
                        ((!isCurrentPlan || isCurrentPlanSeatChange) && !isPlanActionLoading && !isAppleManagedPlan)
                          ? React.createElement(ArrowRight, { width: 15, height: 15, strokeWidth: 1.8, "aria-hidden": "true" })
                          : null
                      )
                    )
                  )
                );
              };

              return createPortal(
                React.createElement("div", {
                    className: "playground-organization-plan-chooser",
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": "organization-plan-chooser-title",
                  },
                  React.createElement("main", { className: "playground-organization-plan-chooser-main" },
                    React.createElement("section", { className: "playground-organization-plan-chooser-shell" },
                      React.createElement("aside", { className: "playground-organization-plan-chooser-intro" },
                        React.createElement("div", { className: "playground-organization-plan-chooser-intro-copy" },
                          React.createElement("img", {
                            className: "playground-organization-plan-chooser-runner-logo",
                            src: RUNNER_TRANSPARENT_LOGO_URL,
                            alt: "Computer Agents",
                          }),
                          React.createElement("h1", { id: "organization-plan-chooser-title" }, "Choose a subscription")
                        )
                      ),
                      React.createElement("div", { className: "playground-organization-plan-chooser-catalog" },
                        React.createElement("header", { className: "playground-organization-plan-chooser-catalog-header" },
                          React.createElement(PlatformSwitch, {
                            className: "playground-organization-plan-chooser-interval-switch",
                            value: organizationSubscriptionBillingInterval,
                            options: [
                              { value: "monthly", label: "Monthly" },
                              {
                                value: "annual",
                                label: maximumAnnualSaving > 0 ? "Annual -" + maximumAnnualSaving + "%" : "Annual",
                              },
                            ],
                            onValueChange: setOrganizationSubscriptionBillingInterval,
                            ariaLabel: "Subscription billing period",
                            disabled: hasPaidPlan,
                          })
                        ),
                        settingsBillingError ? renderSettingsBanner("error", settingsBillingError) : null,
                        isAppleManagedPlan
                          ? React.createElement("div", { className: "playground-organization-plan-chooser-notice" }, "This subscription is managed through your iPhone or iPad.")
                          : null,
                        React.createElement("section", { className: "playground-organization-plan-chooser-grid", "aria-label": "Available subscription plans" },
                          selectablePlans.map(renderPlanCard)
                        )
                      ),
                      React.createElement("footer", { className: "playground-organization-plan-chooser-footer" },
                        React.createElement("div", { className: "playground-organization-plan-chooser-footer-cell" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-organization-plan-chooser-back",
                            onClick: closePlanChooser,
                          },
                            React.createElement(ArrowLeft, { width: 15, height: 15, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Back")
                          )
                        ),
                        React.createElement("div", { className: "playground-organization-plan-chooser-footer-cell", "aria-hidden": "true" }),
                        React.createElement("div", { className: "playground-organization-plan-chooser-footer-cell", "aria-hidden": "true" })
                      )
                    )
                  )
                ),
                document.body
              );
            };

            return React.createElement(React.Fragment, null,
              React.createElement("section", { className: "playground-organization-subscription-card" },
              React.createElement("div", { className: "playground-organization-subscription-header" },
                React.createElement("h1", { className: "playground-organization-subscription-title" }, "Subscription")
              ),
              settingsBillingError ? renderSettingsBanner("error", settingsBillingError) : null,
              settingsPlatformConfigError ? renderSettingsBanner("error", settingsPlatformConfigError) : null,
              isInitialLoading
                ? React.createElement(PlatformLoadingState, {
                    className: "playground-organization-subscription-loading",
                    message: "Loading subscription...",
                    centered: true,
                  })
                : React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-organization-subscription-section is-plan" },
                      React.createElement("div", { className: "playground-organization-subscription-eyebrow" }, "Current plan"),
                      React.createElement("div", { className: "playground-organization-subscription-plan-row" },
                        React.createElement("div", { className: "playground-organization-subscription-plan-copy" },
                          React.createElement("div", { className: "playground-organization-subscription-plan-name" }, String(plan.name || formatSubscriptionTier(planId))),
                          React.createElement("div", { className: "playground-organization-subscription-description" },
                            String(plan.description || "Pay for what you use, billed to this organization.")
                          )
                        ),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          className: "playground-organization-subscription-upgrade",
                          onClick: openSubscriptionPlanChooser,
                        }, isEnterprisePlan ? "Manage" : "Upgrade")
                      )
                    ),
                    React.createElement("div", { className: "playground-organization-subscription-section is-allowance" },
                      React.createElement("div", { className: "playground-organization-subscription-eyebrow" }, "Included monthly allowance"),
                      React.createElement("div", { className: "playground-organization-subscription-section-description" },
                        "This allowance is included in your plan and shared across organization workloads."
                      ),
                      React.createElement("div", { className: "playground-organization-subscription-usage-list" },
                        renderUsageAllowance(
                          "agent-api",
                          "API and agent usage",
                          "Model inference, agent execution, and API workloads.",
                          agentUsedCT
                        ),
                        renderUsageAllowance(
                          "computer-runtime",
                          "Computer runtime",
                          "Cloud computers and persistent runtime resources.",
                          environmentUsedCT
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-organization-subscription-section is-payg" },
                      React.createElement("div", { className: "playground-organization-subscription-eyebrow" }, "Pay-as-you-go"),
                      React.createElement("div", { className: "playground-organization-subscription-payg-row" },
                        React.createElement("div", { className: "playground-organization-subscription-payg-copy" },
                          React.createElement("div", { className: "playground-organization-subscription-row-heading" },
                            React.createElement("span", { className: "playground-organization-subscription-row-title" }, "Pay-as-you-go"),
                            payAsYouGoEnabled
                              ? React.createElement(PlatformLabel, { variant: "green" }, "Active")
                              : React.createElement(PlatformLabel, { variant: "gray" }, "Inactive")
                          ),
                          React.createElement("div", { className: "playground-organization-subscription-description" },
                            "Continue using Computer Agents after the included allowance is exhausted."
                          )
                        ),
                        React.createElement(payAsYouGoEnabled ? PlatformSecondaryButton : PlatformPrimaryButton, {
                          size: "medium",
                          disabled: controlsDisabled,
                          onClick: () => saveUsageControls({
                            ...settingsBillingPreferences,
                            usageBillingEnabled: !payAsYouGoEnabled,
                          }),
                        }, settingsPlatformConfigSaving ? "Saving..." : payAsYouGoEnabled ? "Deactivate" : "Activate")
                      ),
                      React.createElement("div", { className: "playground-organization-subscription-divider" }),
                      React.createElement("div", { className: "playground-organization-subscription-limit-heading" },
                        React.createElement("div", { className: "playground-organization-subscription-limit-copy" },
                          React.createElement("div", { className: "playground-organization-subscription-row-title" }, "Pay-as-you-go spending limit"),
                          React.createElement("div", { className: "playground-organization-subscription-description" },
                            "Set a monthly organization limit. Usage pauses when the limit is reached."
                          )
                        ),
                        React.createElement(PlatformToggle, {
                          checked: spendLimitEnabled,
                          disabled: controlsDisabled || !payAsYouGoEnabled,
                          "aria-label": "Enable pay-as-you-go spending limit",
                          onCheckedChange: toggleSpendLimit,
                        })
                      ),
                      React.createElement("div", { className: "playground-organization-subscription-limit-controls" },
                        React.createElement("div", { className: "playground-organization-subscription-limit-meter" },
                          React.createElement("span", { className: "playground-organization-subscription-limit-current" },
                            formatSettingsCurrency(payAsYouGoUsedUsd)
                          ),
                          React.createElement("div", {
                              className: "playground-organization-subscription-progress",
                              role: "progressbar",
                              "aria-label": "Pay-as-you-go monthly spending",
                              "aria-valuemin": 0,
                              "aria-valuemax": 100,
                              "aria-valuenow": spendLimitPercentage,
                            },
                            React.createElement("span", {
                              className: "playground-organization-subscription-progress-value",
                              style: { width: spendLimitPercentage + "%" },
                            })
                          )
                        ),
                        React.createElement("label", { className: "playground-organization-subscription-limit-input-shell" },
                          React.createElement("input", {
                            type: "number",
                            min: "0",
                            step: "1",
                            className: "playground-organization-subscription-limit-input",
                            value: spendLimitEnabled ? spendLimit : "",
                            placeholder: "0",
                            disabled: controlsDisabled || !payAsYouGoEnabled || !spendLimitEnabled,
                            onChange: (event) => setSettingsBillingPreferences((current) => normalizeDemoSettingsBillingPreferences({
                              ...current,
                              monthlyResourceSpendLimit: normalizeSettingsSpendLimit(event.target.value),
                            })),
                            "aria-label": "Monthly pay-as-you-go limit",
                          }),
                          React.createElement("span", null, "USD")
                        ),
                        React.createElement(PlatformSecondaryButton, {
                          size: "medium",
                          disabled: controlsDisabled || !payAsYouGoEnabled || !spendLimitEnabled,
                          onClick: () => saveUsageControls(settingsBillingPreferences),
                        }, settingsPlatformConfigSaving ? "Updating..." : "Update limit")
                      )
                    )
                  )
              ),
              renderSubscriptionPlanChooser()
            );
          };
`;
