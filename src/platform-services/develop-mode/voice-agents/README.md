# Voice Agents service

`src/platform-services/develop-mode/voice-agents` is the ownership boundary for
the Develop-mode Voice Agents experience. It owns voice-agent normalization,
configuration contracts, and the specialized overview page built on the shared
Develop overview foundation.

The typed client is split into three layers:

- `client/api`: encoded API access for list, configuration, phone-number, and
  test-session operations;
- `client/domain`: normalization, editable drafts, options, and mutation
  payloads;
- `client/management`: the tested lifecycle controller that sequences saves
  before provisioning or test-session creation.

The route owns the full Voice Agents workflow. Opening a generated thread is
the only remaining compatibility handoff because the typed thread route does
not yet accept a thread identifier.
