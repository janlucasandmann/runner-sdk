import { Cloud as LucideCloud } from "lucide-react";
import type { CSSProperties } from "react";
import { renderTurnAgentAvatar } from "./run-summary-presentation.js";

interface RunnerTurnIdentityProps {
  agentName: string;
  agentPhotoUrl?: string | null;
  environmentName: string;
  isGenerating?: boolean;
  onAgentClick?: () => void;
  onClick?: () => void;
  ariaLabel?: string;
  style?: CSSProperties;
}

export function RunnerTurnIdentity({
  agentName,
  agentPhotoUrl,
  environmentName,
  isGenerating = false,
  onAgentClick,
  onClick,
  ariaLabel,
  style,
}: RunnerTurnIdentityProps) {
  const normalizedAgentName = String(agentName || "").trim() || "Agent";
  const normalizedEnvironmentName = String(environmentName || "").trim() || "Environment";
  const agentContent = (
    <>
      {renderTurnAgentAvatar(normalizedAgentName, agentPhotoUrl, { isGenerating })}
      <span className="tb-turn-agent-name">{normalizedAgentName}</span>
    </>
  );

  const content = (
    <>
      {onAgentClick ? (
        <button
          type="button"
          className="tb-turn-agent tb-turn-agent-button"
          onClick={onAgentClick}
          aria-label={`Open agent details for ${normalizedAgentName}`}
          title={`Open ${normalizedAgentName}`}
        >
          {agentContent}
        </button>
      ) : (
        <div className="tb-turn-agent">{agentContent}</div>
      )}
      <div className="tb-turn-environment-pill">
        <LucideCloud className="tb-turn-environment-icon" />
        <span className="tb-turn-environment-label">{normalizedEnvironmentName}</span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="tb-turn-meta tb-turn-meta-button"
        style={style}
        onClick={onClick}
        aria-label={ariaLabel || `Open thread from ${normalizedAgentName}`}
      >
        {content}
      </button>
    );
  }

  return <div className="tb-turn-meta" style={style}>{content}</div>;
}
