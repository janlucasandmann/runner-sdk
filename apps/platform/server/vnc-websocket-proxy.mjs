import { WebSocket, WebSocketServer } from "ws";

function normalizeWebSocketTarget(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    return ["ws:", "wss:"].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function createVncWebSocketProxy({
  userAgent = "computer-agents-platform-vnc-proxy",
} = {}) {
  const websocketServer = new WebSocketServer({
    noServer: true,
    perMessageDeflate: false,
  });

  websocketServer.on("connection", (clientSocket, _request, upstreamTarget) => {
    const normalizedTarget = normalizeWebSocketTarget(upstreamTarget);
    if (!normalizedTarget) {
      clientSocket.close(1008, "Invalid desktop target");
      return;
    }

    const upstreamSocket = new WebSocket(normalizedTarget, {
      perMessageDeflate: false,
      headers: {
        "User-Agent": userAgent,
      },
    });

    const closeUpstream = () => {
      if (
        upstreamSocket.readyState === WebSocket.OPEN
        || upstreamSocket.readyState === WebSocket.CONNECTING
      ) {
        upstreamSocket.close();
      }
    };

    const closeClient = (code = 1011, reason = "Desktop proxy failed") => {
      if (
        clientSocket.readyState === WebSocket.OPEN
        || clientSocket.readyState === WebSocket.CONNECTING
      ) {
        clientSocket.close(code, reason);
      }
    };

    upstreamSocket.on("message", (data, isBinary) => {
      if (clientSocket.readyState !== WebSocket.OPEN) {
        closeUpstream();
        return;
      }
      clientSocket.send(data, { binary: isBinary });
    });

    upstreamSocket.on("error", () => {
      closeClient(1011, "Desktop stream failed");
    });

    upstreamSocket.on("close", (code, reason) => {
      if (
        clientSocket.readyState === WebSocket.OPEN
        || clientSocket.readyState === WebSocket.CONNECTING
      ) {
        clientSocket.close(
          code || 1000,
          reason?.toString() || "Desktop stream ended",
        );
      }
    });

    clientSocket.on("message", (data, isBinary) => {
      if (upstreamSocket.readyState === WebSocket.OPEN) {
        upstreamSocket.send(data, { binary: isBinary });
      }
    });

    clientSocket.on("error", closeUpstream);
    clientSocket.on("close", closeUpstream);
  });

  return Object.freeze({
    handleUpgrade(req, socket, head, { port = 4177 } = {}) {
      const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
      if (requestUrl.pathname !== "/api/real/ws/vnc") {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.destroy();
        return;
      }

      const upstreamTarget = normalizeWebSocketTarget(
        requestUrl.searchParams.get("upstream"),
      );
      if (!upstreamTarget) {
        socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
        socket.destroy();
        return;
      }

      websocketServer.handleUpgrade(req, socket, head, (clientSocket) => {
        websocketServer.emit("connection", clientSocket, req, upstreamTarget);
      });
    },
  });
}
