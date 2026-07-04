export const VERSIONING_CORE_SCRIPT = String.raw`
      function stringifyPlaygroundVersionComparableValue(value) {
        if (value === null || typeof value !== "object") {
          return JSON.stringify(value);
        }
        if (Array.isArray(value)) {
          return "[" + value.map((entry) => stringifyPlaygroundVersionComparableValue(entry)).join(",") + "]";
        }
        return "{" + Object.keys(value).sort().map((key) => (
          JSON.stringify(key) + ":" + stringifyPlaygroundVersionComparableValue(value[key])
        )).join(",") + "}";
      }

      function normalizePlaygroundVersionComparableList(value) {
        return (Array.isArray(value) ? value : [])
          .map((entry) => String(entry || "").trim())
          .filter(Boolean)
          .sort((left, right) => left.localeCompare(right));
      }

      function formatPlaygroundVersionDiffContent(value) {
        if (value == null) {
          return "";
        }
        if (typeof value === "string") {
          return value;
        }
        try {
          return JSON.stringify(value, null, 2) + "\n";
        } catch {
          return String(value);
        }
      }

      function normalizePlaygroundVersionDiffPath(value) {
        return String(value || "version.txt").replace(/[\r\n]+/g, " ").trim() || "version.txt";
      }

      function splitPlaygroundVersionDiffLines(value) {
        const content = String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        if (!content) {
          return [];
        }
        const lines = content.split("\n");
        if (lines.length > 1 && lines[lines.length - 1] === "") {
          lines.pop();
        }
        return lines;
      }

      function buildPlaygroundVersionLineDiffRows(beforeLines, afterLines) {
        const oldLines = Array.isArray(beforeLines) ? beforeLines : [];
        const newLines = Array.isArray(afterLines) ? afterLines : [];
        const oldLength = oldLines.length;
        const newLength = newLines.length;
        if (oldLength * newLength > 4000000) {
          return oldLines.map((line) => ({ type: "delete", line }))
            .concat(newLines.map((line) => ({ type: "add", line })));
        }
        const table = Array.from({ length: oldLength + 1 }, () => Array(newLength + 1).fill(0));
        for (let oldIndex = oldLength - 1; oldIndex >= 0; oldIndex -= 1) {
          for (let newIndex = newLength - 1; newIndex >= 0; newIndex -= 1) {
            table[oldIndex][newIndex] = oldLines[oldIndex] === newLines[newIndex]
              ? table[oldIndex + 1][newIndex + 1] + 1
              : Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1]);
          }
        }
        const rows = [];
        let oldIndex = 0;
        let newIndex = 0;
        while (oldIndex < oldLength && newIndex < newLength) {
          if (oldLines[oldIndex] === newLines[newIndex]) {
            rows.push({ type: "context", line: oldLines[oldIndex] });
            oldIndex += 1;
            newIndex += 1;
          } else if (table[oldIndex + 1][newIndex] >= table[oldIndex][newIndex + 1]) {
            rows.push({ type: "delete", line: oldLines[oldIndex] });
            oldIndex += 1;
          } else {
            rows.push({ type: "add", line: newLines[newIndex] });
            newIndex += 1;
          }
        }
        while (oldIndex < oldLength) {
          rows.push({ type: "delete", line: oldLines[oldIndex] });
          oldIndex += 1;
        }
        while (newIndex < newLength) {
          rows.push({ type: "add", line: newLines[newIndex] });
          newIndex += 1;
        }
        return rows;
      }

      function buildPlaygroundVersionUnifiedDiff(filePath, beforeContent, afterContent) {
        const normalizedPath = normalizePlaygroundVersionDiffPath(filePath);
        if (String(beforeContent ?? "") === String(afterContent ?? "")) {
          return {
            diffContent: "",
            additions: 0,
            deletions: 0,
          };
        }
        const beforeLines = splitPlaygroundVersionDiffLines(beforeContent);
        const afterLines = splitPlaygroundVersionDiffLines(afterContent);
        const rows = buildPlaygroundVersionLineDiffRows(beforeLines, afterLines);
        const additions = rows.filter((row) => row.type === "add").length;
        const deletions = rows.filter((row) => row.type === "delete").length;
        if (additions === 0 && deletions === 0) {
          return {
            diffContent: "",
            additions: 0,
            deletions: 0,
          };
        }
        const oldCount = beforeLines.length;
        const newCount = afterLines.length;
        const diffLines = [
          "diff --git a/" + normalizedPath + " b/" + normalizedPath,
          "--- a/" + normalizedPath,
          "+++ b/" + normalizedPath,
          "@@ -" + (oldCount ? "1," + oldCount : "0,0") + " +" + (newCount ? "1," + newCount : "0,0") + " @@",
        ].concat(rows.map((row) => {
          if (row.type === "add") return "+" + row.line;
          if (row.type === "delete") return "-" + row.line;
          return " " + row.line;
        }));
        return {
          diffContent: diffLines.join("\n") + "\n",
          additions,
          deletions,
        };
      }

      function createPlaygroundVersionDiffFile(config = {}) {
        const filePath = normalizePlaygroundVersionDiffPath(config.path || config.filePath || config.label || "version.txt");
        const beforeContent = formatPlaygroundVersionDiffContent(config.before ?? config.beforeContent);
        const afterContent = formatPlaygroundVersionDiffContent(config.after ?? config.afterContent);
        const diff = buildPlaygroundVersionUnifiedDiff(filePath, beforeContent, afterContent);
        if (!diff.diffContent && !config.includeUnchanged) {
          return null;
        }
        return {
          id: String(config.id || filePath).trim() || filePath,
          filePath,
          label: String(config.label || filePath).trim() || filePath,
          beforeContent,
          afterContent,
          fileContent: afterContent,
          diffContent: diff.diffContent,
          additions: diff.additions,
          deletions: diff.deletions,
        };
      }

      function renderPlaygroundVersionChangesPage(props = {}) {
        const files = (Array.isArray(props.files) ? props.files : [])
          .filter((file) => file && (String(file.diffContent || "").trim() || String(file.fileContent || "").trim()));
        const BackIcon = props.backIcon || ArrowLeft;
        const title = String(props.title || "Changes").trim() || "Changes";
        const subtitle = String(props.subtitle || "").trim();
        const leftLabel = String(props.leftLabel || "").trim();
        const rightLabel = String(props.rightLabel || "").trim();
        const compareControls = props.compareControls || null;
        const fileCountLabel = files.length + " " + (files.length === 1 ? "file" : "files");
        const totalAdditions = files.reduce((total, file) => total + Math.max(0, Number(file.additions || 0)), 0);
        const totalDeletions = files.reduce((total, file) => total + Math.max(0, Number(file.deletions || 0)), 0);

        return React.createElement("section", {
            className: "playground-version-changes-page" + (props.className ? " " + props.className : ""),
          },
          React.createElement("div", { className: "playground-version-changes-header" },
            React.createElement("button", {
              type: "button",
              className: "playground-resource-detail-back-button playground-version-changes-back-button",
              onClick: props.onBack,
              "aria-label": props.backLabel || "Back",
            },
              React.createElement(BackIcon, { width: 12, height: 12, strokeWidth: 1.8 }),
              React.createElement("span", null, props.backText || "Back")
            ),
            React.createElement("div", { className: "playground-version-changes-title-row" },
              React.createElement("div", { className: "playground-version-changes-title-copy" },
                React.createElement("h2", { className: "playground-version-changes-title" }, title),
                subtitle
                  ? React.createElement("div", { className: "playground-version-changes-subtitle" }, subtitle)
                  : null
              ),
              React.createElement("div", { className: "playground-version-changes-summary" },
                React.createElement("span", null, fileCountLabel),
                React.createElement("span", { className: "is-additions" }, "+" + totalAdditions),
                React.createElement("span", { className: "is-deletions" }, "-" + totalDeletions)
              )
            ),
            compareControls
              ? React.createElement("div", { className: "playground-version-changes-compare-selectors" }, compareControls)
              : leftLabel || rightLabel
              ? React.createElement("div", { className: "playground-version-changes-compare-labels" },
                  leftLabel ? React.createElement("span", null, leftLabel) : null,
                  leftLabel && rightLabel ? React.createElement("span", { "aria-hidden": "true" }, "→") : null,
                  rightLabel ? React.createElement("span", null, rightLabel) : null
                )
              : null
          ),
          files.length
            ? React.createElement("div", { className: "playground-version-changes-file-list" },
                files.map((file) =>
                  React.createElement("div", { key: file.id || file.filePath, className: "playground-version-changes-file-card" },
                    React.createElement(RunnerFileDiffSurface, {
                      filePath: file.filePath,
                      diffContent: file.diffContent || "",
                      fileContent: file.fileContent || "",
                      additions: file.additions,
                      deletions: file.deletions,
                      emptyMessage: "No diff is available for this file.",
                    })
                  )
                )
              )
            : React.createElement("div", { className: "playground-version-changes-empty" }, props.emptyMessage || "No differences found.")
        );
      }

      function createPlaygroundVersionController(config = {}) {
        const controller = {
          getMetadata(resource) {
            const getMetadata = typeof config.getMetadata === "function" ? config.getMetadata : null;
            const metadata = getMetadata
              ? getMetadata(resource)
              : resource?.metadata;
            return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
          },

          readVersions(resource) {
            return typeof config.readVersions === "function" ? config.readVersions(resource) : [];
          },

          normalizeVersions(versions) {
            return typeof config.normalizeVersions === "function" ? config.normalizeVersions(versions) : (Array.isArray(versions) ? versions : []);
          },

          getActiveVersion(resource) {
            const versions = controller.readVersions(resource);
            const metadata = controller.getMetadata(resource);
            const activeId = typeof config.getActiveVersionId === "function"
              ? String(config.getActiveVersionId(metadata, resource) || "").trim()
              : String(metadata.activeVersionId || metadata.active_version_id || "").trim();
            return versions.find((version) => version.id === activeId)
              || versions.find((version) => String(version.status || "").toLowerCase() === "active")
              || null;
          },

          getSelectedVersion(resource) {
            const versions = controller.readVersions(resource);
            const metadata = controller.getMetadata(resource);
            const activeVersion = controller.getActiveVersion(resource);
            const selectedId = typeof config.getSelectedVersionId === "function"
              ? String(config.getSelectedVersionId(metadata, activeVersion, resource) || "").trim()
              : String(metadata.restoredFromVersionId || metadata.restored_from_version_id || activeVersion?.id || "").trim();
            return versions.find((version) => version.id === selectedId)
              || activeVersion
              || versions[0]
              || null;
          },

          buildSnapshot(resource) {
            return typeof config.buildSnapshot === "function" ? config.buildSnapshot(resource) : {};
          },

          buildComparableSnapshot(snapshot) {
            return typeof config.buildComparableSnapshot === "function" ? config.buildComparableSnapshot(snapshot) : snapshot;
          },

          getSnapshotSignature(snapshot) {
            return stringifyPlaygroundVersionComparableValue(controller.buildComparableSnapshot(snapshot));
          },

          getCurrentSnapshotSignature(resource) {
            return controller.getSnapshotSignature(controller.buildSnapshot(resource));
          },

          getBaselineKey(resource) {
            const normalizedResourceId = String(resource?.id || "").trim();
            if (!normalizedResourceId) {
              return "";
            }
            const selectedVersion = controller.getSelectedVersion(resource);
            return normalizedResourceId + "::" + String(selectedVersion?.id || "").trim();
          },

          rememberBaseline(resource, baselineRef, options = {}) {
            if (!resource || !baselineRef) {
              return false;
            }
            const baselineKey = controller.getBaselineKey(resource);
            if (!baselineKey) {
              return false;
            }
            if (!options.force && baselineRef.current?.key === baselineKey && baselineRef.current?.signature) {
              return false;
            }
            baselineRef.current = {
              key: baselineKey,
              signature: controller.getCurrentSnapshotSignature(resource),
            };
            return true;
          },

          hasDraftChanges(resource, baselineRef, options = {}) {
            if (!resource) {
              return false;
            }
            if (options.requireTouched !== false && !options.touched) {
              return false;
            }
            const currentBaselineKey = controller.getBaselineKey(resource);
            const baseline = baselineRef?.current || {};
            if (baseline.key && baseline.key === currentBaselineKey && baseline.signature) {
              return controller.getCurrentSnapshotSignature(resource) !== baseline.signature;
            }
            const selectedVersion = controller.getSelectedVersion(resource);
            if (!selectedVersion) {
              return true;
            }
            return controller.getCurrentSnapshotSignature(resource) !== controller.getSnapshotSignature(selectedVersion.snapshot);
          },

          withVersionList(resource, versions, preferredSelectedId = "") {
            return typeof config.withVersionList === "function"
              ? config.withVersionList(resource, versions, preferredSelectedId)
              : resource;
          },

          fromVersionSnapshot(resource, version, versions, preferredSelectedId = "") {
            return typeof config.fromVersionSnapshot === "function"
              ? config.fromVersionSnapshot(resource, version, versions, preferredSelectedId)
              : resource;
          },

          createVersion(resource, existingVersions = [], options = {}) {
            return typeof config.createVersion === "function"
              ? config.createVersion(resource, existingVersions, options)
              : null;
          },

          updateVersionFromResource(version, resource, options = {}) {
            if (typeof config.updateVersionFromResource === "function") {
              return config.updateVersionFromResource(version, resource, options);
            }
            const now = new Date().toISOString();
            return {
              ...version,
              status: String(options.status || version?.status || "saved").trim().toLowerCase() === "active" ? "active" : "saved",
              updatedAt: now,
              updated_at: now,
              snapshot: controller.buildSnapshot(resource),
            };
          },

          buildSaveCurrentResource(resource, options = {}) {
            const versions = controller.readVersions(resource);
            const selectedVersion = controller.getSelectedVersion(resource);
            const nextVersion = selectedVersion
              ? controller.updateVersionFromResource(selectedVersion, resource, { status: "saved", ...options })
              : controller.createVersion(resource, versions, { status: "saved", ...options });
            const nextVersions = selectedVersion
              ? controller.normalizeVersions(versions.map((version) => version.id === selectedVersion.id ? nextVersion : version))
              : controller.normalizeVersions([nextVersion, ...versions].filter(Boolean));
            return {
              version: nextVersion,
              versions: nextVersions,
              resource: controller.withVersionList(resource, nextVersions, nextVersion?.id || ""),
            };
          },

          buildNewVersionResource(resource, options = {}) {
            const versions = controller.readVersions(resource);
            const nextVersion = controller.createVersion(resource, versions, { status: "saved", ...options });
            const nextVersions = controller.normalizeVersions([nextVersion, ...versions].filter(Boolean));
            return {
              version: nextVersion,
              versions: nextVersions,
              resource: controller.withVersionList(resource, nextVersions, nextVersion?.id || ""),
            };
          },

          buildVersionMetadataResource(resource, versionId, details = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            const versions = controller.readVersions(resource);
            const targetVersion = versions.find((version) => version.id === normalizedVersionId);
            if (!targetVersion) {
              return null;
            }
            const now = new Date().toISOString();
            const label = String(details.label || "").trim() || String(targetVersion.label || ("Version " + targetVersion.version)).trim();
            const description = String(details.description || "").trim();
            const nextVersions = controller.normalizeVersions(versions.map((version) => (
              version.id === targetVersion.id
                ? (
                    typeof config.updateVersionMetadata === "function"
                      ? config.updateVersionMetadata(version, { ...details, label, description, updatedAt: now })
                      : {
                          ...version,
                          label,
                          description,
                          updatedAt: now,
                          updated_at: now,
                        }
                  )
                : version
            )));
            const metadata = controller.getMetadata(resource);
            const selectedVersionId = typeof config.getSelectedVersionId === "function"
              ? String(config.getSelectedVersionId(metadata, controller.getActiveVersion(resource), resource) || targetVersion.id || "").trim()
              : String(metadata.restoredFromVersionId || metadata.restored_from_version_id || metadata.activeVersionId || metadata.active_version_id || targetVersion.id || "").trim();
            return {
              version: nextVersions.find((version) => version.id === targetVersion.id) || targetVersion,
              versions: nextVersions,
              resource: controller.withVersionList(resource, nextVersions, selectedVersionId),
            };
          },

          buildPublishSelectedResource(resource, options = {}) {
            const selectedVersion = controller.getSelectedVersion(resource);
            if (!selectedVersion) {
              return null;
            }
            return controller.buildPublishVersionResource(resource, selectedVersion.id, options);
          },

          buildPublishVersionResource(resource, versionId, options = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            const versions = controller.readVersions(resource);
            const targetVersion = versions.find((version) => version.id === normalizedVersionId);
            if (!targetVersion) {
              return null;
            }
            const now = new Date().toISOString();
            const shouldUpdateTargetSnapshot = Boolean(options.updateFromResource) || (
              options.snapshot && typeof options.snapshot === "object" && !Array.isArray(options.snapshot)
            );
            const updatedTargetVersion = shouldUpdateTargetSnapshot
              ? (
                  options.snapshot && typeof options.snapshot === "object" && !Array.isArray(options.snapshot)
                    ? {
                        ...targetVersion,
                        snapshot: options.snapshot,
                        updatedAt: now,
                        updated_at: now,
                      }
                    : controller.updateVersionFromResource(targetVersion, options.resource || resource, {
                        ...options,
                        status: "active",
                        updatedAt: now,
                        publishedAt: now,
                      })
                )
              : targetVersion;
            const nextVersions = controller.normalizeVersions(versions.map((version) => {
              if (version.id === targetVersion.id) {
                return typeof config.publishVersion === "function"
                  ? config.publishVersion(updatedTargetVersion, { ...options, publishedAt: now })
                  : {
                      ...updatedTargetVersion,
                      status: "active",
                      lifecycleState: "published",
                      lifecycle_state: "published",
                      publishedAt: now,
                      published_at: now,
                      updatedAt: now,
                      updated_at: now,
                    };
              }
              return String(version.status || "").toLowerCase() === "active"
                ? (
                    typeof config.supersedeVersion === "function"
                      ? config.supersedeVersion(version, { ...options, supersededAt: now })
                      : { ...version, status: "superseded" }
                  )
                : version;
            }));
            const publishedVersion = nextVersions.find((version) => version.id === targetVersion.id) || targetVersion;
            return {
              version: publishedVersion,
              versions: nextVersions,
              resource: controller.fromVersionSnapshot(resource, publishedVersion, nextVersions, publishedVersion.id),
            };
          },

          buildRestoreVersionResource(resource, versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            const versions = controller.readVersions(resource);
            const targetVersion = versions.find((version) => version.id === normalizedVersionId);
            if (!targetVersion) {
              return null;
            }
            return {
              version: targetVersion,
              versions,
              resource: controller.fromVersionSnapshot(resource, targetVersion, versions, targetVersion.id),
            };
          },

          buildDeleteVersionResource(resource, versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            const versions = controller.readVersions(resource);
            if (versions.length <= 1) {
              return null;
            }
            const targetVersion = versions.find((version) => version.id === normalizedVersionId);
            if (!targetVersion) {
              return null;
            }
            const nextVersions = versions.filter((version) => version.id !== targetVersion.id);
            return {
              version: targetVersion,
              versions: nextVersions,
              resource: controller.withVersionList(resource, nextVersions),
            };
          },

          buildUnpublishActiveResource(resource, options = {}) {
            const activeVersion = controller.getActiveVersion(resource);
            if (!activeVersion) {
              return null;
            }
            const now = new Date().toISOString();
            const nextVersions = controller.normalizeVersions(controller.readVersions(resource).map((version) => (
              version.id === activeVersion.id || String(version.status || "").toLowerCase() === "active"
                ? (
                    typeof config.unpublishVersion === "function"
                      ? config.unpublishVersion(version, { ...options, unpublishedAt: now })
                      : {
                          ...version,
                          status: "unpublished",
                          lifecycleState: "unpublished",
                          lifecycle_state: "unpublished",
                          updatedAt: now,
                          updated_at: now,
                          unpublishedAt: now,
                          unpublished_at: now,
                        }
                  )
                : version
            )));
            const baseResource = controller.withVersionList(resource, nextVersions);
            const nextResource = typeof config.applyUnpublishMetadata === "function"
              ? config.applyUnpublishMetadata(baseResource, { version: activeVersion, versions: nextVersions, unpublishedAt: now })
              : baseResource;
            return {
              version: activeVersion,
              versions: nextVersions,
              resource: nextResource,
            };
          },
        };

        return controller;
      }
`;
