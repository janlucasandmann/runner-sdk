<!-- platform-directory-guide:v1 -->

# Connector configuration

## Purpose

`PlatformConnectorConfiguration` is the canonical card for one connected
provider resource. It owns the shared title row, metadata, scoped action menu,
and configuration-row layout while product pages retain provider state and
persistence.

Use `PlatformConnectorConfigurationRow` for each editable preference. Pass a
page-owned `onDisconnect` callback to remove the resource from the current
scope without revoking its organization-level credential.

## Verification

Run the focused component test and the consuming resource tests:

```bash
npx vitest run src/platform-ui/components/composite/connector-configuration/platform-connector-configuration.test.tsx
```
