<!-- platform-directory-guide:v1 -->

# Platform plan gate

## Purpose

This service owns the single contextual billing gate used across the platform.
Feature modules request a gate by entitlement or required plan through the
browser request protocol. The application shell resolves the live billing
catalog, renders `PlatformPlanGateModal`, and owns checkout or billing
navigation.

Do not create feature-specific upgrade modals. Plan marketing and organization
billing management remain separate flows; this service only handles contextual
access and budget gates.

## Client contract

Feature modules request the shared gate instead of rendering billing UI:

```ts
requestPlatformPlanGate({
  entitlement: "inference.byo",
  requiredPlan: "team",
  featureName: "custom inference endpoints",
  source: "inference",
});
```

For API-backed checks, return or forward the canonical HTTP `402` response and
call `requestPlatformPlanGateFromResponse(response, payload, defaults)`. The
global platform JSON fetch helper already does this automatically. The canonical
entitlement response uses `BILLING_ENTITLEMENT_REQUIRED` and includes
`entitlement`, `currentPlan`, and `requiredPlan`.

The shell is the only owner of modal state, live billing-catalog resolution,
checkout, contact-sales routing, and organization billing navigation.

## Verification

Run the focused checks from the repository root:

```bash
npm run plan-gate-service-test
```

Escalate to `npm run check:static` when changing generated shell composition or
public exports.
