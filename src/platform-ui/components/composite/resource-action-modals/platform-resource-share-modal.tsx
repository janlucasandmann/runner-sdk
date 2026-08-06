import { Check, UsersRound } from "lucide-react";
import { useMemo, useRef } from "react";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformCheckbox } from "../../ui/checkbox/index.js";
import { PlatformEmptyState } from "../empty-state/index.js";
import { PlatformLoadingState } from "../loading-state/index.js";
import { PlatformModal, type PlatformModalCloseReason } from "../modal/index.js";

export interface PlatformResourceShareTeam {
  id: string;
  name: string;
  description?: string;
  roleLabel?: string;
  profileImageUrl?: string;
  shared?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export interface PlatformResourceShareModalProps {
  open: boolean;
  resourceLabel: string;
  resourceName?: string;
  teams: readonly PlatformResourceShareTeam[];
  selectionMode?: "single" | "multiple";
  selectedTeamId?: string;
  selectedTeamIds?: readonly string[];
  onSelectedTeamIdChange?: (teamId: string) => void;
  onSelectedTeamIdsChange?: (teamIds: string[]) => void;
  onClose: () => void;
  onShare?: (teamId: string) => void | Promise<void>;
  onShareTeams?: (teamIds: string[]) => void | Promise<void>;
  busy?: boolean;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  portal?: boolean;
  portalTarget?: Element | DocumentFragment | null;
}

function getTeamMeta(team: PlatformResourceShareTeam): string {
  if (team.shared) return "Already shared";
  if (team.disabledReason) return team.disabledReason;
  return team.description || team.roleLabel || "Team";
}

export function PlatformResourceShareModal({
  open,
  resourceLabel,
  teams,
  selectionMode = "single",
  selectedTeamId = "",
  selectedTeamIds = [],
  onSelectedTeamIdChange = () => {},
  onSelectedTeamIdsChange = () => {},
  onClose,
  onShare = () => {},
  onShareTeams = () => {},
  busy = false,
  loading = false,
  error = "",
  emptyMessage = "No teams are available yet.",
  portal = true,
  portalTarget,
}: PlatformResourceShareModalProps) {
  const firstTeamRef = useRef<HTMLElement | null>(null);
  const isMultiple = selectionMode === "multiple";
  const normalizedSelectedTeamIds = useMemo(
    () =>
      Array.from(
        new Set(selectedTeamIds.map((teamId) => String(teamId || "").trim()).filter(Boolean)),
      ),
    [selectedTeamIds],
  );
  const selectedTeamIdSet = useMemo(
    () => new Set(normalizedSelectedTeamIds),
    [normalizedSelectedTeamIds],
  );
  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) || null,
    [selectedTeamId, teams],
  );
  const selectedTeams = useMemo(
    () => teams.filter((team) => selectedTeamIdSet.has(team.id)),
    [selectedTeamIdSet, teams],
  );
  const initialTeamId =
    (isMultiple ? selectedTeams[0]?.id : selectedTeam?.id) ||
    teams.find((team) => !team.disabled)?.id ||
    "";
  const normalizedResourceLabel = String(resourceLabel || "Resource").trim() || "Resource";
  const shareableSelectedTeams = selectedTeams.filter((team) => !team.shared && !team.disabled);
  const canShare = isMultiple
    ? Boolean(shareableSelectedTeams.length && !busy)
    : Boolean(selectedTeam && !selectedTeam.shared && !selectedTeam.disabled && !busy);

  const toggleTeam = (teamId: string) => {
    const nextTeamIds = new Set(normalizedSelectedTeamIds);
    if (nextTeamIds.has(teamId)) {
      nextTeamIds.delete(teamId);
    } else {
      nextTeamIds.add(teamId);
    }
    onSelectedTeamIdsChange(Array.from(nextTeamIds));
  };

  const handleClose = (_reason?: PlatformModalCloseReason) => {
    if (!busy) onClose();
  };

  return (
    <PlatformModal
      open={open}
      title={isMultiple ? "Share with Teams" : "Share with Team"}
      ariaLabel={`Share ${normalizedResourceLabel.toLowerCase()} with ${isMultiple ? "teams" : "team"}`}
      onClose={handleClose}
      as="form"
      size="medium"
      portal={portal}
      portalTarget={portalTarget}
      className="platform-resource-share-modal"
      bodyClassName="platform-resource-share-modal__body"
      footerClassName="platform-resource-share-modal__footer"
      closeButtonDisabled={busy}
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      initialFocusRef={firstTeamRef}
      surfaceProps={{
        onSubmit: (event) => {
          event.preventDefault();
          if (!canShare) return;
          if (isMultiple) {
            void onShareTeams(shareableSelectedTeams.map((team) => team.id));
          } else if (selectedTeam) {
            void onShare(selectedTeam.id);
          }
        },
      }}
      footer={
        <>
          <PlatformSecondaryButton type="button" size="medium" onClick={onClose} disabled={busy}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton type="submit" size="medium" disabled={!canShare}>
            {busy
              ? "Sharing…"
              : isMultiple && shareableSelectedTeams.length > 1
                ? `Share with ${shareableSelectedTeams.length} Teams`
                : "Share"}
          </PlatformPrimaryButton>
        </>
      }
    >
      {loading && teams.length === 0 ? (
        <PlatformLoadingState
          centered
          message="Loading teams…"
          className="platform-resource-share-modal__loading"
        />
      ) : teams.length > 0 ? (
        <fieldset className="platform-resource-share-modal__team-list" aria-label="Teams">
          {teams.map((team) => {
            const selected = isMultiple
              ? selectedTeamIdSet.has(team.id)
              : team.id === selectedTeamId;
            const teamMeta = getTeamMeta(team);
            const TeamRow = isMultiple ? "div" : "label";
            return (
              <TeamRow
                key={team.id}
                className={`platform-resource-share-modal__team${selected ? " is-selected" : ""}${team.shared ? " is-shared" : ""}`}
                title={team.disabledReason}
              >
                {isMultiple ? null : (
                  <input
                    ref={
                      team.id === initialTeamId
                        ? (node) => {
                            firstTeamRef.current = node;
                          }
                        : undefined
                    }
                    className="platform-resource-share-modal__team-radio"
                    type="radio"
                    name="platform-resource-share-team"
                    value={team.id}
                    aria-label={`${team.name} ${teamMeta}`.trim()}
                    checked={selected}
                    disabled={busy || team.disabled}
                    onChange={() => onSelectedTeamIdChange(team.id)}
                  />
                )}
                <span className="platform-resource-share-modal__team-icon" aria-hidden="true">
                  {team.profileImageUrl ? (
                    <img src={team.profileImageUrl} alt="" />
                  ) : (
                    <UsersRound width={16} height={16} strokeWidth={1.8} />
                  )}
                </span>
                <span className="platform-resource-share-modal__team-copy">
                  <span className="platform-resource-share-modal__team-name">{team.name}</span>
                  <span className="platform-resource-share-modal__team-meta">{teamMeta}</span>
                </span>
                {isMultiple ? (
                  <PlatformCheckbox
                    ref={
                      team.id === initialTeamId
                        ? (node) => {
                            firstTeamRef.current = node;
                          }
                        : undefined
                    }
                    aria-label={`${selected ? "Deselect" : "Select"} ${team.name}${teamMeta ? `, ${teamMeta}` : ""}`}
                    checked={selected}
                    disabled={busy || team.disabled || team.shared}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleTeam(team.id);
                    }}
                  />
                ) : selected ? (
                  <Check
                    className="platform-resource-share-modal__team-check"
                    width={15}
                    height={15}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                ) : null}
              </TeamRow>
            );
          })}
        </fieldset>
      ) : (
        <PlatformEmptyState
          icon={UsersRound}
          title={emptyMessage}
          className="platform-resource-share-modal__empty"
          iconSize={18}
        />
      )}
      {error ? (
        <p className="platform-resource-action-modal__error" role="alert">
          {error}
        </p>
      ) : null}
    </PlatformModal>
  );
}
