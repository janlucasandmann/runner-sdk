import { ReceiptText } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const PAYMENTS_RESOURCE_DEFINITION = Object.freeze({
  kind: "payments",
  singular: "Payments Resource",
  plural: "Payments",
  resourceCountKey: "payments",
  documentationPath: "/developers/libraries/payments",
  icon: ReceiptText,
  activityMetrics: [
    { id: "payment-checkouts", key: "paymentCheckoutSessions", label: "Checkout Sessions", color: "#8fc4ff" },
  ],
} satisfies DevelopResourceDefinition);
