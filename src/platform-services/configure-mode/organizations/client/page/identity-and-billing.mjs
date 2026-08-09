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
              : "";
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

          const openOrganizationBillingProviderUrl = (value) => {
            const url = String(value || "").trim();
            if (!url) {
              setSettingsBillingError("The Lemon Squeezy billing portal is not available for this organization yet.");
              return;
            }
            setSettingsBillingError("");
            window.open(url, "_blank", "noopener,noreferrer");
          };

          const getOrganizationBillingDocumentStatus = (document) => {
            const status = String(document?.status || "unknown").trim().toLowerCase();
            if (["paid", "succeeded", "complete", "completed"].includes(status)) {
              return { label: String(document?.statusFormatted || "Paid"), variant: "green" };
            }
            if (["failed", "refunded", "void", "cancelled", "canceled"].includes(status) || document?.refunded) {
              return { label: document?.refunded ? "Refunded" : String(document?.statusFormatted || status || "Failed"), variant: "red" };
            }
            if (["pending", "open", "past_due"].includes(status)) {
              return { label: String(document?.statusFormatted || status || "Pending"), variant: "yellow" };
            }
            return { label: String(document?.statusFormatted || status || "Unknown"), variant: "gray" };
          };

          const formatOrganizationBillingDocumentReference = (document) => {
            const reference = String(document?.reference || document?.id || "").trim();
            if (!reference) return "Billing document";
            const readableReference = reference.length > 18
              ? reference.slice(0, 8) + "..." + reference.slice(-6)
              : reference;
            return document?.documentType === "order_receipt"
              ? "Receipt " + readableReference
              : "Invoice " + readableReference;
          };

          const renderOrganizationBillingInformationCell = ({ title, description, actionLabel, onAction, children, className = "" }) => (
            React.createElement("section", {
                className: "playground-organization-billing-information-cell" + (className ? " " + className : ""),
              },
              React.createElement("div", { className: "playground-organization-billing-information-heading" },
                React.createElement("h3", { className: "playground-organization-billing-section-title" }, title),
                actionLabel
                  ? React.createElement(PlatformSecondaryButton, {
                      size: "small",
                      type: "button",
                      onClick: onAction,
                      disabled: !canManageOrganization,
                    }, actionLabel)
                  : null
              ),
              description
                ? React.createElement("div", { className: "playground-organization-billing-information-description" }, description)
                : null,
              children
            )
          );

          const renderOrganizationBillingSection = () => {
            const summary = organizationPageBillingSummary && typeof organizationPageBillingSummary === "object"
              ? organizationPageBillingSummary
              : {};
            const budget = summary.budget && typeof summary.budget === "object"
              ? summary.budget
              : settingsBudgetStatus && typeof settingsBudgetStatus === "object"
                ? settingsBudgetStatus
                : {};
            const providerBilling = organizationPageProviderBilling && typeof organizationPageProviderBilling === "object"
              ? organizationPageProviderBilling
              : {};
            const customer = providerBilling.customer && typeof providerBilling.customer === "object"
              ? providerBilling.customer
              : null;
            const paymentMethod = providerBilling.paymentMethod && typeof providerBilling.paymentMethod === "object"
              ? providerBilling.paymentMethod
              : null;
            const portalUrl = String(providerBilling.portalUrl || customer?.portalUrl || paymentMethod?.portalUrl || "").trim();
            const paymentMethodUrl = String(paymentMethod?.updateUrl || portalUrl || "").trim();
            const documents = Array.isArray(organizationPageBillingDocuments)
              ? organizationPageBillingDocuments
              : [];
            const getOrganizationBillingDocumentId = (document) => [
              String(document?.documentType || "document"),
              String(document?.id || document?.reference || "billing-document"),
            ].join(":");
            const getOrganizationBillingDocumentType = (document) => document?.documentType === "order_receipt"
              ? "Credit purchase"
              : "Subscription";
            const getOrganizationBillingDocumentTotal = (document) => String(document?.totalFormatted || "").trim()
              || formatSettingsCurrency(Number(document?.total || 0) / 100);
            const organizationBillingDocumentColumns = [
              {
                id: "invoice",
                header: "Invoice",
                accessor: formatOrganizationBillingDocumentReference,
                sortable: true,
                width: "minmax(160px, 1.35fr)",
                cell: ({ row }) => React.createElement("span", {
                  className: "playground-organization-billing-document-reference",
                  title: String(row?.reference || row?.id || "Billing document"),
                }, formatOrganizationBillingDocumentReference(row)),
              },
              {
                id: "type",
                header: "Type",
                accessor: getOrganizationBillingDocumentType,
                sortable: true,
                width: "minmax(130px, 0.72fr)",
                hideBelow: 840,
              },
              {
                id: "date",
                header: "Date",
                accessor: (document) => String(document?.createdAt || ""),
                sortable: true,
                sortDescFirst: true,
                width: "minmax(115px, 0.62fr)",
                hideBelow: 680,
                cell: ({ row }) => formatSettingsDate(row?.createdAt),
              },
              {
                id: "amount",
                header: "Amount",
                accessor: (document) => Number(document?.total || 0),
                sortable: true,
                sortDescFirst: true,
                width: "minmax(90px, 0.5fr)",
                hideBelow: 480,
                cell: ({ row }) => getOrganizationBillingDocumentTotal(row),
              },
              {
                id: "status",
                header: "Status",
                accessor: (document) => getOrganizationBillingDocumentStatus(document).label,
                sortable: true,
                width: "minmax(95px, 0.48fr)",
                hideBelow: 600,
                cell: ({ row }) => {
                  const status = getOrganizationBillingDocumentStatus(row);
                  return React.createElement(PlatformLabel, { variant: status.variant }, status.label);
                },
              },
              {
                id: "download",
                header: "",
                width: "105px",
                ariaLabel: "Download invoice",
                cell: ({ row }) => {
                  const downloadUrl = String(row?.downloadUrl || row?.invoiceUrl || "").trim();
                  return React.createElement(PlatformSecondaryButton, {
                      size: "small",
                      type: "button",
                      disabled: !downloadUrl,
                      onClick: () => openOrganizationBillingProviderUrl(downloadUrl),
                    },
                    "Download",
                    React.createElement(Download, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })
                  );
                },
              },
            ];
            const organizationBillingDocumentsEmptyState = React.createElement(PlatformEmptyState, {
              className: "playground-organization-billing-documents-empty",
              icon: ReceiptText,
              title: "No invoices yet",
              description: "Subscription invoices and credit purchase receipts will appear here.",
            });
            const locality = [customer?.city, customer?.region, customer?.countryFormatted || customer?.country]
              .map((value) => String(value || "").trim())
              .filter((value, index, values) => value && values.indexOf(value) === index)
              .join(", ");
            const billingIdentityLines = [customer?.name, customer?.email, locality]
              .map((value) => String(value || "").trim())
              .filter(Boolean);
            const creditBalance = Number(
              budget.topUpBalanceUsd ?? budget.topUpBalance ?? budget.availableBudgetUsd ?? budget.availableBudget ?? 0
            );
            const automaticBillingEnabled = Boolean(settingsBillingPreferences.usageBillingEnabled);
            const isInitialLoading = (settingsInvoicesLoading || settingsBudgetLoading)
              && !organizationPageProviderBilling
              && !organizationPageBillingSummary
              && documents.length === 0;

            return React.createElement("div", { className: "playground-organization-billing-page" },
              settingsBillingError ? renderSettingsBanner("error", settingsBillingError) : null,
              settingsBillingSuccess ? renderSettingsBanner("success", settingsBillingSuccess) : null,
              React.createElement("section", { className: "playground-organization-billing-surface" },
                React.createElement("header", { className: "playground-organization-billing-page-header" },
                  React.createElement("h1", { className: "playground-organization-billing-page-title" }, "Billing")
                ),
                React.createElement("div", { className: "playground-organization-billing-payment-section" },
                  React.createElement("div", { className: "playground-organization-billing-section-heading" },
                    React.createElement("h2", { className: "playground-organization-billing-section-title" }, "Payment methods"),
                    React.createElement(PlatformSecondaryButton, {
                        size: "medium",
                        type: "button",
                        disabled: !canManageOrganization || (!paymentMethodUrl && !portalUrl),
                        onClick: () => openOrganizationBillingProviderUrl(paymentMethodUrl || portalUrl),
                      },
                      React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                      "Add payment method"
                    )
                  ),
                  isInitialLoading
                    ? React.createElement(PlatformLoadingState, {
                        className: "playground-organization-billing-payment-loading",
                        message: "Loading payment methods...",
                        centered: true,
                      })
                    : paymentMethod
                      ? React.createElement("div", { className: "playground-organization-billing-payment-row" },
                          React.createElement("div", { className: "playground-organization-billing-payment-identity" },
                            React.createElement("span", { className: "playground-organization-billing-card-brand" }, String(paymentMethod.brand || "Card").toUpperCase()),
                            React.createElement("span", { className: "playground-organization-billing-payment-label" },
                              String(paymentMethod.brand || "Card") + " ending in " + String(paymentMethod.lastFour || "")
                            ),
                            React.createElement(PlatformLabel, { variant: "blue" }, "Default")
                          ),
                          React.createElement(PlatformIconButton, {
                              size: "small",
                              "aria-label": "Manage payment method",
                              tooltip: "Manage payment method",
                              disabled: !canManageOrganization || !portalUrl,
                              onClick: () => openOrganizationBillingProviderUrl(portalUrl),
                            },
                            React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })
                          )
                        )
                      : React.createElement("div", { className: "playground-organization-billing-payment-empty" },
                          React.createElement("div", { className: "playground-organization-billing-payment-empty-title" }, "No payment method on file"),
                          React.createElement("div", { className: "playground-organization-billing-payment-empty-description" },
                            "Add a payment method in the secure Lemon Squeezy billing portal."
                          )
                        )
                ),
                React.createElement("div", { className: "playground-organization-billing-information-grid" },
                  renderOrganizationBillingInformationCell({
                    title: "Billing information",
                    actionLabel: "Update",
                    onAction: () => openOrganizationBillingProviderUrl(portalUrl),
                    children: billingIdentityLines.length
                      ? React.createElement("div", { className: "playground-organization-billing-address" },
                          billingIdentityLines.map((line, index) => React.createElement("div", { key: "billing-line-" + index }, line))
                        )
                      : React.createElement("div", { className: "playground-organization-billing-information-description" },
                          "Billing identity is managed securely in Lemon Squeezy."
                        ),
                  }),
                  renderOrganizationBillingInformationCell({
                    title: "Billing portal",
                    description: "Manage billing identity, tax details, payment methods, and receipts in Lemon Squeezy.",
                    actionLabel: "Open",
                    onAction: () => openOrganizationBillingProviderUrl(portalUrl),
                  }),
                  renderOrganizationBillingInformationCell({
                    title: "Credits",
                    actionLabel: "Add",
                    onAction: () => {
                      setSettingsBillingError("");
                      setSettingsTopUpModalOpen(true);
                    },
                    children: React.createElement("div", { className: "playground-organization-billing-credit-balance" },
                      formatSettingsCurrency(creditBalance)
                    ),
                  }),
                  renderOrganizationBillingInformationCell({
                    title: "Automatic billing",
                    description: "Continue workloads automatically after prepaid credits are exhausted, within your organization limit.",
                    actionLabel: "Update",
                    onAction: () => openOrganizationAdminPage("subscription"),
                    children: React.createElement(PlatformLabel, {
                      variant: automaticBillingEnabled ? "green" : "gray",
                    }, automaticBillingEnabled ? "Active" : "Inactive"),
                  })
                )
              ),
              React.createElement(PlatformDataTable, {
                rows: documents,
                columns: organizationBillingDocumentColumns,
                getRowId: getOrganizationBillingDocumentId,
                ariaLabel: "Organization invoices",
                className: "playground-organization-billing-documents playground-organization-billing-invoices-table",
                surface: "plain",
                variant: "minimalistic-ui",
                sticky: false,
                rowMinHeight: 62,
                sorting: {
                  defaultValue: { id: "date", direction: "desc" },
                },
                toolbar: {
                  title: "Invoices",
                },
                pagination: {
                  defaultValue: { pageIndex: 0, pageSize: 5 },
                  pageSizeOptions: [5, 10, 20],
                },
                loading: settingsInvoicesLoading && documents.length === 0,
                emptyState: organizationBillingDocumentsEmptyState,
                noResultsState: organizationBillingDocumentsEmptyState,
              })
            );
          };

          const renderOrganizationUsageSection = () => React.createElement("section", {
              className: "playground-team-detail-panel playground-organization-billing-panel playground-organization-usage-panel is-consolidated",
            },
            renderSettingsSurface({
              section: "costs-overview",
              embedded: true,
              organizationBilling: true,
            })
          );
`;
