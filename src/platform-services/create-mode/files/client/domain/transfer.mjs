export const FILES_TRANSFER_DOMAIN_SCRIPT = `
      function buildPlaygroundEnvironmentDownloadUrl(backendUrl, environmentId, filePath) {
        if (!backendUrl || !environmentId || !filePath) return "";
        const encodedPath = normalizeHistoryPath(filePath)
          .split("/")
          .filter(Boolean)
          .map((segment) => encodeURIComponent(segment))
          .join("/");
        return backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/files/download/" + encodedPath;
      }

      function buildPlaygroundEnvironmentThumbnailUrl(backendUrl, environmentId, filePath, size = 64) {
        if (!backendUrl || !environmentId || !filePath) return "";
        const normalizedSize = Math.max(16, Math.min(256, Number.parseInt(String(size || 64), 10) || 64));
        const encodedPath = normalizeHistoryPath(filePath)
          .split("/")
          .filter(Boolean)
          .map((segment) => encodeURIComponent(segment))
          .join("/");
        return backendUrl
          + "/environments/"
          + encodeURIComponent(environmentId)
          + "/files/thumbnail/"
          + encodedPath
          + "?w="
          + normalizedSize
          + "&h="
          + normalizedSize;
      }

      function buildPlaygroundEnvironmentHtmlPreviewUrl(backendUrl, environmentId, filePath) {
        if (!backendUrl || !environmentId || !filePath) return "";
        const encodedPath = normalizeHistoryPath(filePath)
          .split("/")
          .filter(Boolean)
          .map((segment) => encodeURIComponent(segment))
          .join("/");
        return backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/files/preview-html/" + encodedPath;
      }

      const PLAYGROUND_ZIP_CRC_TABLE = (() => {
        const table = new Uint32Array(256);
        for (let index = 0; index < 256; index += 1) {
          let value = index;
          for (let bit = 0; bit < 8; bit += 1) {
            value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
          }
          table[index] = value >>> 0;
        }
        return table;
      })();

      function calculatePlaygroundZipCrc32(bytes) {
        let crc = 0xffffffff;
        for (let index = 0; index < bytes.length; index += 1) {
          crc = PLAYGROUND_ZIP_CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
        }
        return (crc ^ 0xffffffff) >>> 0;
      }

      function getPlaygroundZipDosDateTime(value) {
        const date = value instanceof Date && Number.isFinite(value.getTime()) ? value : new Date();
        const year = Math.min(Math.max(date.getFullYear(), 1980), 2107);
        return {
          dosDate: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
          dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
        };
      }

      function normalizePlaygroundZipPath(value, isDirectory = false) {
        const normalizedPath = String(value || "")
          .replace(/\\\\/g, "/")
          .split("/")
          .filter((segment) => segment && segment !== "." && segment !== "..")
          .join("/");
        return isDirectory && normalizedPath ? normalizedPath.replace(/\\/+$/g, "") + "/" : normalizedPath.replace(/\\/+$/g, "");
      }

      function createPlaygroundZipHeader(size, writer) {
        const bytes = new Uint8Array(size);
        const view = new DataView(bytes.buffer);
        writer(view, bytes);
        return bytes;
      }

      function createPlaygroundZipLocalHeader(entry) {
        const fileName = new TextEncoder().encode(entry.path);
        const dateTime = getPlaygroundZipDosDateTime(entry.modifiedAt);
        return createPlaygroundZipHeader(30 + fileName.length, (view, bytes) => {
          view.setUint32(0, 0x04034b50, true);
          view.setUint16(4, 20, true);
          view.setUint16(6, 0x0800, true);
          view.setUint16(8, 0, true);
          view.setUint16(10, dateTime.dosTime, true);
          view.setUint16(12, dateTime.dosDate, true);
          view.setUint32(14, entry.crc32 >>> 0, true);
          view.setUint32(18, entry.size >>> 0, true);
          view.setUint32(22, entry.size >>> 0, true);
          view.setUint16(26, fileName.length, true);
          view.setUint16(28, 0, true);
          bytes.set(fileName, 30);
        });
      }

      function createPlaygroundZipCentralHeader(entry) {
        const fileName = new TextEncoder().encode(entry.path);
        const dateTime = getPlaygroundZipDosDateTime(entry.modifiedAt);
        return createPlaygroundZipHeader(46 + fileName.length, (view, bytes) => {
          view.setUint32(0, 0x02014b50, true);
          view.setUint16(4, 20, true);
          view.setUint16(6, 20, true);
          view.setUint16(8, 0x0800, true);
          view.setUint16(10, 0, true);
          view.setUint16(12, dateTime.dosTime, true);
          view.setUint16(14, dateTime.dosDate, true);
          view.setUint32(16, entry.crc32 >>> 0, true);
          view.setUint32(20, entry.size >>> 0, true);
          view.setUint32(24, entry.size >>> 0, true);
          view.setUint16(28, fileName.length, true);
          view.setUint16(30, 0, true);
          view.setUint16(32, 0, true);
          view.setUint16(34, 0, true);
          view.setUint16(36, 0, true);
          view.setUint32(38, entry.isDirectory ? 0x10 : 0, true);
          view.setUint32(42, entry.offset >>> 0, true);
          bytes.set(fileName, 46);
        });
      }

      function createPlaygroundZipEndRecord(entryCount, centralDirectorySize, centralDirectoryOffset) {
        return createPlaygroundZipHeader(22, (view) => {
          view.setUint32(0, 0x06054b50, true);
          view.setUint16(4, 0, true);
          view.setUint16(6, 0, true);
          view.setUint16(8, entryCount, true);
          view.setUint16(10, entryCount, true);
          view.setUint32(12, centralDirectorySize >>> 0, true);
          view.setUint32(16, centralDirectoryOffset >>> 0, true);
          view.setUint16(20, 0, true);
        });
      }

      function createPlaygroundZipBlob(sourceEntries) {
        const entries = [];
        const parts = [];
        let offset = 0;
        for (const sourceEntry of sourceEntries) {
          const path = normalizePlaygroundZipPath(sourceEntry.path, sourceEntry.isDirectory);
          if (!path) continue;
          const data = sourceEntry.isDirectory ? new Uint8Array(0) : sourceEntry.data;
          if (data.length > 0xffffffff || offset > 0xffffffff) {
            throw new Error("Folder is too large to download as a zip archive.");
          }
          const entry = {
            path,
            data,
            size: data.length,
            crc32: sourceEntry.isDirectory ? 0 : calculatePlaygroundZipCrc32(data),
            offset,
            isDirectory: Boolean(sourceEntry.isDirectory),
            modifiedAt: sourceEntry.modifiedAt || new Date(),
          };
          const localHeader = createPlaygroundZipLocalHeader(entry);
          parts.push(localHeader);
          offset += localHeader.length;
          if (data.length > 0) {
            parts.push(data);
            offset += data.length;
          }
          entries.push(entry);
        }
        const centralDirectoryOffset = offset;
        for (const entry of entries) {
          const centralHeader = createPlaygroundZipCentralHeader(entry);
          parts.push(centralHeader);
          offset += centralHeader.length;
        }
        const centralDirectorySize = offset - centralDirectoryOffset;
        if (entries.length > 65535 || offset > 0xffffffff || centralDirectorySize > 0xffffffff) {
          throw new Error("Folder is too large to download as a zip archive.");
        }
        parts.push(createPlaygroundZipEndRecord(entries.length, centralDirectorySize, centralDirectoryOffset));
        return new Blob(parts, { type: "application/zip" });
      }

      function triggerPlaygroundBlobDownload(blob, filename) {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename || "download";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }

      function buildPlaygroundThreadPreviewAttachment(backendUrl, environmentId, filePath) {
        const normalizedEnvironmentId = String(environmentId || "").trim();
        const normalizedPath = normalizeHistoryPath(filePath);
        if (!backendUrl || !normalizedEnvironmentId || !normalizedPath) {
          return null;
        }

        const filename = normalizedPath.split("/").filter(Boolean).pop() || normalizedPath;
        const mimeType = getPlaygroundPreviewMimeType({
          name: filename,
          path: normalizedPath,
          mimeType: "",
          isFolder: false,
        }) || "application/octet-stream";
        const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, normalizedEnvironmentId, normalizedPath);
        if (!downloadUrl) {
          return null;
        }

        return {
          id: "thread-preview:" + normalizedEnvironmentId + ":" + normalizedPath,
          filename,
          mimeType,
          type: mimeType.startsWith("image/") ? "image" : "document",
          environmentId: normalizedEnvironmentId,
          url: downloadUrl,
          previewUrl: downloadUrl,
          htmlPreviewUrl: mimeType === "text/html"
            ? buildPlaygroundEnvironmentHtmlPreviewUrl(backendUrl, normalizedEnvironmentId, normalizedPath)
            : undefined,
          workspacePath: normalizedPath,
        };
      }
`;
