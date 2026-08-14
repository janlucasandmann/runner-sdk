# External agent triggers

This module exposes organization-scoped Jira and Linear webhook installation,
routing, requester identity mapping, and event operations inside connector
details. Provider payload handling and orchestration remain owned by
`apps/platform/server/integrations/external-agents`; this client module only
consumes its management contract.
