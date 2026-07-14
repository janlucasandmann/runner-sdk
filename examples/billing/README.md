# Playground billing adapter

`playground-billing-catalog.mjs` is the billing boundary for the demo platform. It contains
the resilient UI fallback catalog, injects catalog hydration into the browser bundle, and
maps billing proxy routes to the cloud API.

The backend `GET /billing/catalog` response is authoritative. Do not add plan prices,
entitlements, or legacy tier aliases directly to `demo-server.mjs`; extend the backend
catalog and keep only the matching offline fallback in this directory.

Checkout requests must include the active organization id. Subscription and top-up
responses are therefore credited to the same organization whose resources the user is
viewing.

