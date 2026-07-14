export const FILES_FILENAME_DOMAIN_SCRIPT = `
      function splitPlaygroundProtectedFilename(name, isFolder = false) {
        const normalizedName = String(name || "").trim();
        if (!normalizedName || isFolder) {
          return { basename: normalizedName, extension: "" };
        }
        const lastDotIndex = normalizedName.lastIndexOf(".");
        const hasExtension = lastDotIndex > 0 && lastDotIndex < normalizedName.length - 1;
        if (!hasExtension) {
          return { basename: normalizedName, extension: "" };
        }
        return {
          basename: normalizedName.slice(0, lastDotIndex),
          extension: normalizedName.slice(lastDotIndex),
        };
      }

      function buildPlaygroundProtectedFilename(originalName, nextBasename, isFolder = false) {
        const parts = splitPlaygroundProtectedFilename(originalName, isFolder);
        let basename = String(nextBasename || "").trim().replace(/[\\/]+/g, "-");
        if (parts.extension) {
          if (basename.toLowerCase().endsWith(parts.extension.toLowerCase())) {
            basename = basename.slice(0, -parts.extension.length).trim();
          }
          basename = basename.replace(/\\.+$/g, "").trim();
        }
        if (!basename) {
          return "";
        }
        return basename + parts.extension;
      }
`;
