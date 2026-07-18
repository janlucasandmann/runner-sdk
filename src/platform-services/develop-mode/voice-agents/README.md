# Voice Agents service

`src/platform-services/develop-mode/voice-agents` is the ownership boundary for
the Develop-mode Voice Agents experience. It owns voice-agent normalization,
configuration contracts, and the specialized overview page built on the shared
Develop overview foundation.

The typed service is split into three layers:

- `client/api`: encoded API access for list, configuration, phone-number, and
  test-session operations;
- `client/domain`: normalization, editable drafts, options, and mutation
  payloads;
- `client/management`: the tested lifecycle controller that sequences saves
  before provisioning or test-session creation.

The service owns the full Voice Agents workflow. Generated threads open through
the canonical platform thread query on the single application document.
