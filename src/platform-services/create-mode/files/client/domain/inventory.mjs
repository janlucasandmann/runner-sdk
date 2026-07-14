export const FILES_INVENTORY_DOMAIN_SCRIPT = `
      function buildPlaygroundSyntheticFolderEntry(folderPath, currentEntry = null, childEntries = null) {
        const normalizedFolderPath = normalizeHistoryPath(folderPath);
        if (!normalizedFolderPath) return null;
        const name = normalizedFolderPath.split("/").filter(Boolean).pop() || normalizedFolderPath;
        return {
          id: normalizedFolderPath,
          name,
          path: normalizedFolderPath,
          isFolder: true,
          size: 0,
          createdTime: currentEntry?.createdTime || "",
          modifiedTime: currentEntry?.modifiedTime || "",
          mimeType: "",
          hasChildren: Array.isArray(childEntries) ? childEntries.length > 0 : Boolean(currentEntry?.hasChildren),
        };
      }

      function mergePlaygroundEnvironmentInventory(inventory, nextEntries, folderPath) {
        const normalizedFolderPath = normalizeHistoryPath(folderPath);
        const existingEntries = Array.isArray(inventory) ? inventory.filter(Boolean) : [];
        const normalizedNextEntries = Array.isArray(nextEntries) ? nextEntries.filter(Boolean) : [];
        const nextEntriesByPath = new Map(
          normalizedNextEntries
            .map((entry) => [normalizeHistoryPath(entry?.path), entry])
            .filter(([path]) => Boolean(path))
        );
        const existingDirectChildPaths = existingEntries
          .map((entry) => normalizeHistoryPath(entry?.path))
          .filter((entryPath) => getPlaygroundEntryParentPath(entryPath) === normalizedFolderPath);
        const removedDirectChildPaths = existingDirectChildPaths.filter((entryPath) => !nextEntriesByPath.has(entryPath));
        const preservedEntries = existingEntries.filter((entry) => {
          const entryPath = normalizeHistoryPath(entry?.path);
          if (!entryPath) return false;
          if (getPlaygroundEntryParentPath(entryPath) === normalizedFolderPath) {
            return false;
          }
          return !removedDirectChildPaths.some((removedPath) => entryPath.startsWith(removedPath + "/"));
        });
        const mergedEntriesByPath = new Map(
          preservedEntries
            .map((entry) => [normalizeHistoryPath(entry?.path), entry])
            .filter(([path]) => Boolean(path))
        );

        normalizedNextEntries.forEach((entry) => {
          mergedEntriesByPath.set(normalizeHistoryPath(entry.path), entry);
        });

        if (normalizedFolderPath) {
          const currentFolderEntry = mergedEntriesByPath.get(normalizedFolderPath) || existingEntries.find((entry) =>
            historyPathsMatch(entry?.path, normalizedFolderPath)
          ) || null;
          const syntheticFolderEntry = buildPlaygroundSyntheticFolderEntry(
            normalizedFolderPath,
            currentFolderEntry,
            normalizedNextEntries
          );
          if (syntheticFolderEntry) {
            mergedEntriesByPath.set(normalizedFolderPath, syntheticFolderEntry);
          }
        }

        return Array.from(mergedEntriesByPath.values());
      }

      function buildPlaygroundEnvironmentEntries(inventory, currentPath) {
        const entryMap = new Map();
        const normalizedCurrentPath = normalizeHistoryPath(currentPath);

        for (const item of inventory) {
          const itemPath = normalizeHistoryPath(item?.path);
          if (!itemPath) continue;

          if (normalizedCurrentPath) {
            if (!itemPath.startsWith(normalizedCurrentPath + "/") && itemPath !== normalizedCurrentPath) {
              continue;
            }

            const relativePath = itemPath === normalizedCurrentPath ? "" : itemPath.slice(normalizedCurrentPath.length + 1);
            const relativeParts = relativePath.split("/").filter(Boolean);
            if (relativeParts.length === 0) {
              continue;
            }

            if (relativeParts.length > 1) {
              const folderName = relativeParts[0];
              const folderPath = normalizedCurrentPath + "/" + folderName;
              if (!entryMap.has(folderPath)) {
                entryMap.set(folderPath, {
                  id: folderPath,
                  name: folderName,
                  path: folderPath,
                  isFolder: true,
                  size: 0,
                  modifiedTime: item.modifiedTime || "",
                  mimeType: "",
                });
              }
              continue;
            }

            entryMap.set(itemPath, {
              ...item,
              id: item.isFolder ? itemPath : itemPath,
              name: relativeParts[0],
            });
            continue;
          }

          const pathParts = itemPath.split("/").filter(Boolean);
          if (pathParts.length === 0) {
            continue;
          }

          if (pathParts.length > 1) {
            const folderName = pathParts[0];
            if (!entryMap.has(folderName)) {
              entryMap.set(folderName, {
                id: folderName,
                name: folderName,
                path: folderName,
                isFolder: true,
                size: 0,
                modifiedTime: item.modifiedTime || "",
                mimeType: "",
              });
            }
            continue;
          }

          entryMap.set(itemPath, {
            ...item,
            id: itemPath,
            name: pathParts[0],
          });
        }

        return Array.from(entryMap.values()).sort((left, right) => {
          if (left.isFolder !== right.isFolder) {
            return left.isFolder ? -1 : 1;
          }
          return left.name.localeCompare(right.name);
        });
      }

      function getPlaygroundEnvironmentEntryTimestamp(entry) {
        if (!entry?.modifiedTime) return 0;
        const timestamp = new Date(entry.modifiedTime).getTime();
        return Number.isFinite(timestamp) ? timestamp : 0;
      }

      function comparePlaygroundEnvironmentEntries(left, right, sortMode = "name-asc") {
        if (left.isFolder !== right.isFolder) {
          return left.isFolder ? -1 : 1;
        }

        if (sortMode === "name-desc") {
          return String(right.name || "").localeCompare(String(left.name || ""));
        }

        if (sortMode === "modified-desc" || sortMode === "modified-asc") {
          const direction = sortMode === "modified-desc" ? -1 : 1;
          const leftTimestamp = getPlaygroundEnvironmentEntryTimestamp(left);
          const rightTimestamp = getPlaygroundEnvironmentEntryTimestamp(right);
          if (leftTimestamp !== rightTimestamp) {
            return (leftTimestamp - rightTimestamp) * direction;
          }
        }

        if (sortMode === "size-desc" || sortMode === "size-asc") {
          const direction = sortMode === "size-desc" ? -1 : 1;
          const leftSize = Number.isFinite(left?.size) ? left.size : 0;
          const rightSize = Number.isFinite(right?.size) ? right.size : 0;
          if (leftSize !== rightSize) {
            return (leftSize - rightSize) * direction;
          }
        }

        return String(left.name || "").localeCompare(String(right.name || ""));
      }

      function sortPlaygroundEnvironmentEntries(entries, sortMode = "name-asc") {
        return [...(Array.isArray(entries) ? entries : [])].sort((left, right) =>
          comparePlaygroundEnvironmentEntries(left, right, sortMode)
        );
      }

      function matchesPlaygroundEnvironmentEntryFilter(entry, filterMode = "all") {
        if (filterMode === "folders") return Boolean(entry?.isFolder);
        if (filterMode === "images") return !entry?.isFolder && getPlaygroundFileKind(entry) === "image";
        if (filterMode === "files") return !entry?.isFolder;
        return true;
      }

      function matchesPlaygroundEnvironmentEntryProjectFilter(entry, projectLinkedPaths) {
        const normalizedPath = normalizeHistoryPath(entry?.path);
        if (!normalizedPath || !(projectLinkedPaths instanceof Set) || projectLinkedPaths.size === 0) {
          return false;
        }
        if (!entry?.isFolder) {
          return projectLinkedPaths.has(normalizedPath);
        }
        for (const linkedPath of projectLinkedPaths) {
          if (linkedPath === normalizedPath || linkedPath.startsWith(normalizedPath + "/")) {
            return true;
          }
        }
        return false;
      }

      function buildPlaygroundEnvironmentTree(inventory) {
        const root = {
          id: "",
          name: "Root",
          path: "",
          isFolder: true,
          hasChildren: true,
          size: 0,
          createdTime: "",
          modifiedTime: "",
          mimeType: "",
          children: [],
        };
        const nodesByPath = new Map([[root.path, root]]);

        for (const item of Array.isArray(inventory) ? inventory : []) {
          const normalizedPath = normalizeHistoryPath(item?.path);
          if (!normalizedPath) continue;

          const parts = normalizedPath.split("/").filter(Boolean);
          let parentNode = root;

          for (let index = 0; index < parts.length; index += 1) {
            const part = parts[index];
            const nodePath = parts.slice(0, index + 1).join("/");
            const isLeaf = index === parts.length - 1;
            let node = nodesByPath.get(nodePath);

            if (!node) {
              node = {
                id: nodePath,
                name: part,
                path: nodePath,
                isFolder: isLeaf ? Boolean(item.isFolder) : true,
                hasChildren: isLeaf ? Boolean(item.hasChildren) : true,
                size: isLeaf && Number.isFinite(item.size) ? item.size : 0,
                createdTime: isLeaf ? item.createdTime || "" : "",
                modifiedTime: isLeaf ? item.modifiedTime || "" : "",
                mimeType: isLeaf ? item.mimeType || "" : "",
                children: isLeaf && !item.isFolder ? null : [],
              };
              nodesByPath.set(nodePath, node);
              if (Array.isArray(parentNode.children) && !parentNode.children.some((child) => child.path === nodePath)) {
                parentNode.children.push(node);
              }
            } else if (isLeaf) {
              node.id = nodePath;
              node.name = part;
              node.path = nodePath;
              node.isFolder = Boolean(item.isFolder);
              node.hasChildren = item.isFolder
                ? (Boolean(item.hasChildren) || (Array.isArray(node.children) && node.children.length > 0))
                : false;
              node.size = Number.isFinite(item.size) ? item.size : 0;
              node.createdTime = item.createdTime || "";
              node.modifiedTime = item.modifiedTime || "";
              node.mimeType = item.mimeType || "";
              node.children = item.isFolder ? (Array.isArray(node.children) ? node.children : []) : null;
            }

            parentNode = node;
          }
        }

        const sortNodeChildren = (node) => {
          if (!Array.isArray(node.children)) return;
          node.children = sortPlaygroundEnvironmentEntries(node.children);
          node.children.forEach(sortNodeChildren);
        };

        sortNodeChildren(root);
        return { root, nodesByPath };
      }

      function buildPlaygroundEnvironmentVisibleRows(tree, currentPath, expandedFolders, sortMode = "name-asc") {
        const normalizedCurrentPath = normalizeHistoryPath(currentPath);
        const startNode = (tree?.nodesByPath && tree.nodesByPath.get(normalizedCurrentPath || "")) || tree?.root || null;
        const rows = [];

        function walk(entries, level) {
          for (const entry of sortPlaygroundEnvironmentEntries(entries, sortMode)) {
            rows.push({ entry, level });
            if (entry.isFolder && expandedFolders.has(entry.path) && Array.isArray(entry.children) && entry.children.length > 0) {
              walk(entry.children, level + 1);
            }
          }
        }

        if (startNode && Array.isArray(startNode.children)) {
          walk(startNode.children, 0);
        }

        return rows;
      }

      function getPlaygroundEntryParentPath(path) {
        const normalizedPath = normalizeHistoryPath(path);
        if (!normalizedPath) return "";
        const parts = normalizedPath.split("/").filter(Boolean);
        if (parts.length <= 1) return "";
        return parts.slice(0, -1).join("/");
      }

      function buildPlaygroundEnvironmentSearchRows(inventory, searchValue, options = {}) {
        const normalizedSearchValue = String(searchValue || "").trim().toLowerCase();
        if (!normalizedSearchValue) {
          return [];
        }

        const entries = Array.isArray(inventory) ? inventory : [];
        const filesOnly = options.filesOnly === true;
        const matchingFolderPaths = new Set();

        entries.forEach((entry) => {
          if (!entry?.isFolder) return;
          const path = normalizeHistoryPath(entry.path);
          if (!path) return;
          const name = String(entry.name || "").toLowerCase();
          const normalizedPath = path.toLowerCase();
          if (name.includes(normalizedSearchValue) || normalizedPath.includes(normalizedSearchValue)) {
            matchingFolderPaths.add(path);
          }
        });

        const matchesFolderContext = (path) => {
          for (const folderPath of matchingFolderPaths) {
            if (path.startsWith(folderPath + "/")) {
              return true;
            }
          }
          return false;
        };

        return sortPlaygroundEnvironmentEntries(
          entries.filter((entry) => {
            const path = normalizeHistoryPath(entry?.path);
            if (!path) return false;

            const name = String(entry.name || "").toLowerCase();
            const normalizedPath = path.toLowerCase();
            const directMatch = name.includes(normalizedSearchValue) || normalizedPath.includes(normalizedSearchValue);

            if (filesOnly && entry.isFolder) {
              return false;
            }

            return directMatch || (!entry.isFolder && matchesFolderContext(path));
          })
        ).map((entry) => ({ entry, level: 0, searchMatch: true }));
      }

      function getPlaygroundTopLevelSelectionPaths(paths) {
        const normalizedPaths = Array.from(
          new Set((Array.isArray(paths) ? paths : []).map((value) => normalizeHistoryPath(value)).filter(Boolean))
        );
        return normalizedPaths.filter(
          (candidate) => !normalizedPaths.some((other) => other !== candidate && candidate.startsWith(other + "/"))
        );
      }

      function buildPlaygroundEnvironmentBreadcrumbs(currentPath) {
        const normalizedPath = normalizeHistoryPath(currentPath);
        if (!normalizedPath) {
          return [{ id: "", name: "Root" }];
        }

        const parts = normalizedPath.split("/").filter(Boolean);
        return [{ id: "", name: "Root" }].concat(
          parts.map((part, index) => ({
            id: parts.slice(0, index + 1).join("/"),
            name: part,
          }))
        );
      }
`;
