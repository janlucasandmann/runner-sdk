import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "get_account",
    description: "Get the connected Stripe account and capabilities.",
    access: "read-only",
  },
  {
    id: "list_customers",
    description: "List or search Stripe customers.",
    access: "read-only",
    properties: {
      email: stringField("Optional customer email filter."),
      ...paginationFields,
    },
  },
  {
    id: "get_customer",
    description: "Get a Stripe customer.",
    access: "read-only",
    properties: { customerId: stringField("Stripe customer ID.") },
    required: ["customerId"],
  },
  {
    id: "list_products",
    description: "List Stripe products and prices.",
    access: "read-only",
    properties: {
      active: stringField("Active-state filter.", { enum: ["true", "false"] }),
      ...paginationFields,
    },
  },
  {
    id: "list_subscriptions",
    description: "List Stripe subscriptions.",
    access: "read-only",
    properties: {
      customerId: stringField("Optional customer ID."),
      status: stringField("Optional subscription status."),
      ...paginationFields,
    },
  },
  {
    id: "list_invoices",
    description: "List Stripe invoices.",
    access: "read-only",
    properties: {
      customerId: stringField("Optional customer ID."),
      status: stringField("Optional invoice status."),
      ...paginationFields,
    },
  },
  {
    id: "get_payment_intent",
    description: "Get a Stripe PaymentIntent.",
    access: "read-only",
    properties: { paymentIntentId: stringField("Stripe PaymentIntent ID.") },
    required: ["paymentIntentId"],
  },
  {
    id: "create_customer",
    description: "Create a Stripe customer.",
    access: "interactive",
    properties: {
      email: stringField("Customer email."),
      name: stringField("Customer name."),
      description: stringField("Customer description."),
    },
  },
  {
    id: "update_customer",
    description: "Update a Stripe customer.",
    access: "interactive",
    properties: {
      customerId: stringField("Stripe customer ID."),
      email: stringField("Updated email."),
      name: stringField("Updated name."),
      description: stringField("Updated description."),
    },
    required: ["customerId"],
  },
  {
    id: "create_invoice",
    description: "Create a draft Stripe invoice for a customer.",
    access: "interactive",
    properties: {
      customerId: stringField("Stripe customer ID."),
      description: stringField("Invoice description."),
      collectionMethod: stringField("Collection method.", {
        enum: ["charge_automatically", "send_invoice"],
      }),
    },
    required: ["customerId"],
  },
  {
    id: "finalize_invoice",
    description: "Finalize a draft Stripe invoice.",
    access: "interactive",
    properties: { invoiceId: stringField("Stripe invoice ID.") },
    required: ["invoiceId"],
  },
  {
    id: "cancel_subscription",
    description: "Cancel a Stripe subscription.",
    access: "interactive",
    properties: {
      subscriptionId: stringField("Stripe subscription ID."),
      atPeriodEnd: stringField("Cancel at period end.", {
        enum: ["true", "false"],
      }),
    },
    required: ["subscriptionId"],
  },
  {
    id: "create_refund",
    description: "Create a refund for a Stripe charge or PaymentIntent.",
    access: "interactive",
    properties: {
      paymentIntentId: stringField("Stripe PaymentIntent ID."),
      chargeId: stringField("Stripe charge ID."),
      amount: stringField("Optional refund amount in the smallest currency unit."),
      reason: stringField("Refund reason.", {
        enum: ["duplicate", "fraudulent", "requested_by_customer"],
      }),
    },
  },
]);

export const STRIPE_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "stripe",
  label: "Stripe",
  shortLabel: "ST",
  description: "Inspect Stripe commerce data and perform approved billing operations.",
  category: "Payments",
  logoUrl: "/img/plugins/stripe.png",
  authentication: "api-key",
  authenticationLabel: "Restricted API key",
  functionsLabel: "Inspect, Reconcile, Operate",
  samplePrompt: "Review failed invoices and prepare the approved customer follow-ups.",
  whenToUse: "Use Stripe for tightly governed billing and customer operations.",
  websiteUrl: "https://stripe.com/",
  termsUrl: "https://stripe.com/legal/ssa",
  privacyUrl: "https://stripe.com/privacy",
}, capabilities);
