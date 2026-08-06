import { Plug } from "lucide-react";
import type { ReactNode } from "react";
import { ConnectionIdentityIcon } from "../../platform-resources/shared/connections/connection-identity-icon.js";
import { resolveRunnerMessageConnectorOptions } from "./composer-connectors.js";
import type { RunnerChatConnectorOption } from "./public-types.js";

const RUNNER_CHAT_TAG_CONNECTOR_IDS = new Set(["discord", "email", "telegram"]);

function getRunnerChatConnectorIdentityKind(option: RunnerChatConnectorOption): "tags" | "plugins" {
  if (
    option.kind === "tag" ||
    (option.kind !== "plugin" && RUNNER_CHAT_TAG_CONNECTOR_IDS.has(option.id))
  ) {
    return "tags";
  }
  return "plugins";
}

export interface RunnerMessageConnectorChipsProps {
  availableOptions?: readonly RunnerChatConnectorOption[] | null;
  metadata?: Record<string, unknown> | null;
}

export function RunnerMessageConnectorChips({
  availableOptions,
  metadata,
}: RunnerMessageConnectorChipsProps) {
  const connectorOptions = resolveRunnerMessageConnectorOptions(metadata, availableOptions);
  if (connectorOptions.length === 0) return null;

  return (
    <fieldset className="tb-user-turn-connectors" aria-label="Message connectors">
      {connectorOptions.map((option) => (
        <span key={option.id} className="tb-user-turn-connector" title={option.name}>
          <ConnectionIdentityIcon
            kind={getRunnerChatConnectorIdentityKind(option)}
            connectionId={option.id}
            logoUrl={option.logoUrl}
            logoClassName="tb-user-turn-connector-logo"
            variant="catalog"
            className="tb-user-turn-connector-icon-shell"
            icon={<Plug className="tb-user-turn-connector-icon" strokeWidth={1.7} />}
          />
          <span className="tb-user-turn-connector-name">{option.name}</span>
        </span>
      ))}
    </fieldset>
  );
}

export interface RunnerUserMessageContentProps {
  availableConnectorOptions?: readonly RunnerChatConnectorOption[] | null;
  children: ReactNode;
  metadata?: Record<string, unknown> | null;
}

/** Shared presentation for optimistic, legacy-hydrated, and canonical messages. */
export function RunnerUserMessageContent({
  availableConnectorOptions,
  children,
  metadata,
}: RunnerUserMessageContentProps) {
  if (resolveRunnerMessageConnectorOptions(metadata, availableConnectorOptions).length === 0) {
    return <>{children}</>;
  }
  return (
    <div className="tb-user-turn-prompt-with-connectors">
      <RunnerMessageConnectorChips
        metadata={metadata}
        availableOptions={availableConnectorOptions}
      />
      <div className="tb-user-turn-prompt-copy">{children}</div>
    </div>
  );
}
