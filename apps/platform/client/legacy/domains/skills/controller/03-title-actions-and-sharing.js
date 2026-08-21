          const [titleActionsContainer, setTitleActionsContainer] = useState(null);
          const [skillSendTeamModalOpen, setSkillSendTeamModalOpen] = useState(false);
          const [skillSendTeamPickerValue, setSkillSendTeamPickerValue] = useState("");
          const [skillSendTeamError, setSkillSendTeamError] = useState("");
          const [skillSendTeamSaving, setSkillSendTeamSaving] = useState(false);

          useLayoutEffect(() => {
            if (!titleActionsPortalId || typeof document === "undefined") {
              setTitleActionsContainer((current) => current === null ? current : null);
              return;
            }
            const nextContainer = document.getElementById(titleActionsPortalId);
            setTitleActionsContainer((current) => current === nextContainer ? current : nextContainer);
          });

          const availableSkillShareTeams = useMemo(() => (
            (Array.isArray(workspaceTeams) ? workspaceTeams : [])
              .map((team) => {
                const source = team && typeof team === "object" && !Array.isArray(team)
                  ? team
                  : {};
                const id = String(source.id || source.teamId || source.team_id || "").trim();
                if (!id) return null;
                const roleId = normalizePlaygroundTeamRoleId(
                  source.roleId
                  || source.role
                  || source.membershipRole
                  || source.membership_role
                  || source.currentUserRole
                  || source.current_user_role,
                  "member"
                );
                return {
                  ...source,
                  id,
                  name: String(source.name || source.title || source.displayName || "Team").trim() || "Team",
                  roleId,
                  roleLabel: roleId
                    ? roleId.charAt(0).toUpperCase() + roleId.slice(1)
                    : "Team",
                };
              })
              .filter((team) => team && ["admin", "owner"].includes(team.roleId))
          ), [workspaceTeams]);

          useEffect(() => {
            if (!skillSendTeamModalOpen) return;
            const sharedTeamIds = new Set(getPlatformSharedTeamIds(selectedSkill?.metadata));
            const currentTeamIsAvailable = availableSkillShareTeams.some(
              (team) => team.id === skillSendTeamPickerValue
            );
            if (currentTeamIsAvailable) return;
            setSkillSendTeamPickerValue(
              availableSkillShareTeams.find((team) => !sharedTeamIds.has(team.id))?.id
              || availableSkillShareTeams[0]?.id
              || ""
            );
          }, [
            availableSkillShareTeams,
            selectedSkill?.id,
            selectedSkill?.metadata,
            skillSendTeamModalOpen,
            skillSendTeamPickerValue,
          ]);

          function openSelectedSkillCopy(targetSkill = selectedSkill) {
            if (!targetSkill?.id || skillSaveState.isSaving) return;
            const sourceFiles = normalizeSkillCodeFiles(targetSkill.codeFiles);
            const activeFileId = String(skillCodeEditorState.fileId || "");
            const copiedFiles = sourceFiles.map((file) => (
              file.id === activeFileId
                ? { ...file, content: skillCodeEditorState.value }
                : { ...file }
            ));
            const copiedSkill = normalizeSkillRecord({
              id: PLAYGROUND_CUSTOM_SKILL_DRAFT_ID,
              projectId: targetSkill.projectId || baseSkillProjectId || "__runner_playground__",
              name: (String(targetSkill.name || "").trim() || "Skill") + " Copy",
              description: String(targetSkill.description || ""),
              markdown: String(targetSkill.markdown || ""),
              codeFiles: copiedFiles,
              icon: targetSkill.icon || "code",
              category: targetSkill.category || "custom",
              metadata: {},
              permissionSet: null,
              accessControl: null,
              isActive: targetSkill.isActive !== false,
              isDraft: true,
            });
            setLoadedSkills((current) => [
              copiedSkill,
              ...current.filter((skill) => skill.id !== PLAYGROUND_CUSTOM_SKILL_DRAFT_ID),
            ]);
            setSkillListMode("custom");
            setSkillOverviewScope("created");
            setSelectedSkillId(PLAYGROUND_CUSTOM_SKILL_DRAFT_ID);
            setSkillTitleDraft(copiedSkill.name);
            setSkillDetailTab("code");
            setSkillActionsPopoverOpen(false);
            setSkillSaveState({ isSaving: false, error: "" });
            setSkillsPageMode("detail");
          }

          function openSkillSendToTeamModal() {
            if (
              !selectedSkill?.id
              || !selectedSkill.isCustom
              || selectedSkill.isDraft
              || skillSaveState.isSaving
            ) {
              return;
            }
            const sharedTeamIds = new Set(getPlatformSharedTeamIds(selectedSkill.metadata));
            setSkillActionsPopoverOpen(false);
            setSkillSendTeamError("");
            setSkillSendTeamPickerValue(
              availableSkillShareTeams.find((team) => !sharedTeamIds.has(team.id))?.id
              || availableSkillShareTeams[0]?.id
              || ""
            );
            setSkillSendTeamModalOpen(true);
          }

          function closeSkillSendToTeamModal() {
            if (skillSendTeamSaving) return;
            setSkillSendTeamModalOpen(false);
            setSkillSendTeamPickerValue("");
            setSkillSendTeamError("");
          }

          async function handleSkillSendToTeamSubmit(event) {
            event.preventDefault();
            if (!selectedSkill?.id || !selectedSkill.isCustom || selectedSkill.isDraft) {
              setSkillSendTeamError("Save this skill before sharing it with a team.");
              return;
            }
            const teamId = String(skillSendTeamPickerValue || "").trim();
            const team = availableSkillShareTeams.find((candidate) => candidate.id === teamId);
            if (!team) {
              setSkillSendTeamError("Choose a team you can manage.");
              return;
            }
            if (getPlatformSharedTeamIds(selectedSkill.metadata).includes(teamId)) {
              setSkillSendTeamError("This skill is already shared with that team.");
              return;
            }

            const nextMetadata = buildPlatformTeamAccessMetadata(
              selectedSkill.metadata,
              teamId,
              true,
              "skill_team_role",
              PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id)
            );
            const skillSnapshot = {
              id: selectedSkill.id,
              name: selectedSkill.name || "Skill",
              description: selectedSkill.description || "",
              icon: selectedSkill.icon || "code",
              category: selectedSkill.category || "custom",
              projectId: selectedSkill.projectId || selectedSkillProjectId,
            };
            setSkillSendTeamSaving(true);
            setSkillSendTeamError("");
            try {
              const { response, data } = await fetchJsonWithTimeout(
                backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
                {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    resourceType: "skill",
                    resourceId: selectedSkill.id,
                    resourceName: skillSnapshot.name,
                    accessLevel: "use",
                    title: skillSnapshot.name,
                    description: skillSnapshot.description,
                    metadata: {
                      resourceType: "skill",
                      resourceKind: "skill",
                      sharedTeamId: team.id,
                      sharedTeamName: team.name,
                      permissionSet: getPlatformTeamPermissionSet(
                        nextMetadata,
                        team.id,
                        "skill_team_role"
                      ),
                      rolePermissionSets: getPlatformTeamRolePermissionSets(
                        nextMetadata,
                        team.id,
                        "skill_team_role",
                        PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id)
                      ),
                      skill: skillSnapshot,
                    },
                  }),
                },
                8000
              );
              if (!response.ok && Number(response.status || 0) !== 409) {
                throw new Error(data?.message || data?.error || "Failed to share skill with team.");
              }
              await patchSelectedSkillFields({ metadata: nextMetadata });
              setSkillSendTeamSaving(false);
              setSkillSendTeamModalOpen(false);
              setSkillSendTeamPickerValue("");
            } catch (error) {
              setSkillSendTeamSaving(false);
              setSkillSendTeamError(
                error instanceof Error ? error.message : "Failed to share skill with team."
              );
            }
          }

          function renderSkillTitleActions() {
            if (
              !titleActionsContainer
              || skillsPageMode !== "detail"
              || !selectedSkill
              || skillVersionChangesState
            ) {
              return null;
            }
            const deleteDisabled = Boolean(
              skillSaveState.isSaving
              || selectedSkill.isSystem
            );
            const shareDisabled = Boolean(
              skillSaveState.isSaving
              || selectedSkill.isSystem
              || selectedSkill.isDraft
            );
            const openSkillVersionHistory = () => {
              setSkillActionsPopoverOpen(false);
              setSkillVersionsOpen(true);
            };
            const deleteSelectedSkill = () => {
              setSkillActionsPopoverOpen(false);
              if (selectedSkill.isDraft) {
                handleBackToSkillsOverview();
                return;
              }
              void handleDeleteSelectedSkill(selectedSkill);
            };
            return createPortal(
              React.createElement(PlatformResourceHeaderActions, null,
                React.createElement(PlatformResourceActionsMenu, {
                  open: skillActionsPopoverOpen,
                  onOpenChange: setSkillActionsPopoverOpen,
                  resourceLabel: "Skill",
                  disabled: skillSaveState.isSaving,
                  shortcutActions: {
                    share: {
                      onInvoke: openSkillSendToTeamModal,
                      disabled: shareDisabled,
                    },
                    delete: {
                      onInvoke: deleteSelectedSkill,
                      disabled: deleteDisabled,
                    },
                  },
                },
                React.createElement(PlatformResourceActionsInformation, {
                  resourceLabel: "Skill",
                  items: [
                    {
                      id: "id",
                      label: "ID",
                      value: selectedSkill.isDraft ? "Unsaved skill" : selectedSkill.id,
                      title: selectedSkill.isDraft ? "Unsaved skill" : selectedSkill.id,
                      monospace: true,
                      copyValue: selectedSkill.isDraft ? undefined : selectedSkill.id,
                      copyAriaLabel: selectedSkill.isDraft ? undefined : "Copy Skill ID",
                    },
                    {
                      id: "created",
                      label: "Created",
                      value: formatPlaygroundFileDate(selectedSkill.createdAt),
                    },
                    {
                      id: "updated",
                      label: "Updated",
                      value: formatPlaygroundFileDate(selectedSkill.updatedAt),
                    },
                  ],
                }),
                selectedSkill.isCustom && !selectedSkill.isDraft
                  ? React.createElement(PlatformResourceVersionHistoryMenuItem, {
                      onClick: openSkillVersionHistory,
                    })
                  : null,
                React.createElement(PlatformResourceActionsDivider),
                React.createElement(PlatformResourceActionMenuItem, {
                  icon: React.createElement(UsersRound, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                  label: "Send to Team",
                  shortcut: "share",
                  onClick: openSkillSendToTeamModal,
                  disabled: shareDisabled,
                }),
                React.createElement(PlatformResourceActionMenuItem, {
                  icon: React.createElement(Split, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                  label: "Copy Skill",
                  onClick: () => openSelectedSkillCopy(selectedSkill),
                  disabled: skillSaveState.isSaving,
                }),
                React.createElement(PlatformResourceActionsDivider),
                React.createElement(PlatformResourceActionMenuItem, {
                  icon: React.createElement(Trash2, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                  label: "Delete",
                  shortcut: "delete",
                  onClick: deleteSelectedSkill,
                  disabled: deleteDisabled,
                })
                )
              ),
              titleActionsContainer
            );
          }

          function renderSkillSendToTeamModal() {
            const selectedTeam = availableSkillShareTeams.find(
              (team) => team.id === skillSendTeamPickerValue
            ) || null;
            const selectedTeamAlreadyShared = Boolean(
              selectedTeam
              && getPlatformSharedTeamIds(selectedSkill?.metadata).includes(selectedTeam.id)
            );
            return React.createElement(PlatformModal, {
              open: skillSendTeamModalOpen,
              onClose: closeSkillSendToTeamModal,
              as: "form",
              size: "medium",
              title: "Share with Team",
              backdropClassName: "playground-agents-send-team-modal-backdrop",
              className: "playground-agents-send-team-modal playground-skills-send-team-modal",
              bodyClassName: "playground-agents-send-team-modal-body",
              footerClassName: "playground-agents-send-team-actions",
              closeButtonDisabled: skillSendTeamSaving,
              closeButtonLabel: "Close team selector",
              ariaLabel: "Share skill with team",
              surfaceProps: {
                onSubmit: (event) => {
                  void handleSkillSendToTeamSubmit(event);
                },
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: closeSkillSendToTeamModal,
                  disabled: skillSendTeamSaving,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: skillSendTeamSaving || !selectedTeam || selectedTeamAlreadyShared,
                }, skillSendTeamSaving ? "Sharing..." : "Share")
              ),
              children: React.createElement(React.Fragment, null,
                availableSkillShareTeams.length
                  ? React.createElement("div", {
                      className: "playground-agents-send-team-list",
                      role: "radiogroup",
                      "aria-label": "Teams",
                    },
                      availableSkillShareTeams.map((team) => {
                        const isSelected = team.id === skillSendTeamPickerValue;
                        const isShared = getPlatformSharedTeamIds(selectedSkill?.metadata).includes(team.id);
                        return React.createElement("button", {
                            key: team.id,
                            type: "button",
                            className: "playground-agents-send-team-option"
                              + (isSelected ? " is-selected" : "")
                              + (isShared ? " is-shared" : ""),
                            onClick: () => setSkillSendTeamPickerValue(team.id),
                            disabled: skillSendTeamSaving,
                            role: "radio",
                            "aria-checked": isSelected ? "true" : "false",
                          },
                          React.createElement("span", {
                            className: "playground-agents-send-team-option-icon",
                            "aria-hidden": "true",
                          },
                            React.createElement(UsersRound, {
                              width: 15,
                              height: 15,
                              strokeWidth: 1.85,
                            })
                          ),
                          React.createElement("span", {
                            className: "playground-agents-send-team-option-copy",
                          },
                            React.createElement("span", {
                              className: "playground-agents-send-team-option-title",
                            }, team.name),
                            React.createElement("span", {
                              className: "playground-agents-send-team-option-meta",
                            }, isShared ? "Already shared" : team.roleLabel)
                          ),
                          isSelected
                            ? React.createElement(Check, {
                                width: 14,
                                height: 14,
                                strokeWidth: 1.8,
                              })
                            : null
                        );
                      })
                    )
                  : React.createElement("div", {
                      className: "playground-agents-send-team-empty",
                    }, "No teams are available yet."),
                skillSendTeamError
                  ? React.createElement("div", {
                      className: "playground-tasks-project-modal-error",
                      role: "alert",
                    }, skillSendTeamError)
                  : null
              )
            });
          }
