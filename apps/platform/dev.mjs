import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createServer as createViteServer } from "vite";
import {
  createPlatformBackendWatchRoots,
  shouldReloadPlatformBackend,
} from "./development/backend-reload-policy.mjs";

const platformRoot = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(platformRoot, "../..");
const backendPort = Number(process.env.PLATFORM_API_PORT || process.env.PORT || 4177);
const vitePort = Number(process.env.PLATFORM_VITE_PORT || 5173);
const appOrigin = String(
  process.env.PLATFORM_APP_ORIGIN || `http://localhost:${backendPort}`,
).replace(/\/+$/, "");
const viteOrigin = `http://127.0.0.1:${vitePort}`;
const backendEntry = path.join(platformRoot, "server", "index.mjs");
const viteConfig = path.join(platformRoot, "vite.config.mjs");

const vite = await createViteServer({
  configFile: viteConfig,
});
await vite.listen();

let hasStartedBackend = false;
let backend = null;
let shuttingDown = false;
let restartingBackend = false;
let restartAgain = false;
let restartTimer = null;
const intentionallyStoppedBackends = new WeakSet();

function startBackend() {
  const child = spawn(process.execPath, [backendEntry], {
    cwd: packageRoot,
    env: {
      ...process.env,
      NODE_ENV: "development",
      PORT: String(backendPort),
      PLATFORM_API_PORT: String(backendPort),
      PLATFORM_APP_ORIGIN: appOrigin,
      PLATFORM_VITE_ORIGIN: viteOrigin,
      PLATFORM_VITE_PORT: String(vitePort),
    },
    stdio: ["inherit", "pipe", "pipe"],
  });
  backend = child;
  forwardOutput(child.stdout, process.stdout, true);
  forwardOutput(child.stderr, process.stderr);
  child.on("exit", async (code, signal) => {
    if (
      shuttingDown
      || intentionallyStoppedBackends.has(child)
      || child !== backend
    ) {
      return;
    }
    console.error(`[platform:dev] Platform server exited (${signal || code || 0}).`);
    await shutdown("SIGTERM", code || 1);
  });
  return child;
}

function forwardOutput(stream, target, inspectReadiness = false) {
  let buffered = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    target.write(chunk);
    if (!inspectReadiness) return;
    buffered = `${buffered}${chunk}`.slice(-4096);
    if (!buffered.includes(`Platform listening at http://localhost:${backendPort}`)) {
      return;
    }
    buffered = "";
    if (hasStartedBackend) {
      vite.ws.send({ type: "full-reload", path: "*" });
    }
    hasStartedBackend = true;
  });
}

function stopBackend(child, signal = "SIGTERM") {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  intentionallyStoppedBackends.add(child);
  return new Promise((resolve) => {
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      clearTimeout(forceStopTimer);
      resolve();
    };
    const forceStopTimer = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGKILL");
      }
      settle();
    }, 5_000);
    forceStopTimer.unref();
    child.once("exit", settle);
    child.kill(signal);
  });
}

async function restartBackend() {
  if (shuttingDown) return;
  if (restartingBackend) {
    restartAgain = true;
    return;
  }
  restartingBackend = true;
  const child = backend;
  await stopBackend(child);
  if (!shuttingDown) {
    startBackend();
  }
  restartingBackend = false;
  if (restartAgain) {
    restartAgain = false;
    void restartBackend();
  }
}

const backendWatchRoots = createPlatformBackendWatchRoots(packageRoot);
vite.watcher.add(backendWatchRoots);
vite.watcher.on("all", (eventName, changedPath) => {
  if (
    shuttingDown
    || !["add", "change", "unlink"].includes(eventName)
    || !shouldReloadPlatformBackend(packageRoot, changedPath)
  ) {
    return;
  }
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    console.log(
      `[platform:dev] Reloading compatibility runtime after ${path.relative(packageRoot, changedPath)} changed.`,
    );
    void restartBackend();
  }, 80);
});

startBackend();

console.log(`[platform:dev] App:  ${appOrigin}`);
console.log(`[platform:dev] HMR:  ${viteOrigin}`);
console.log("[platform:dev] React and CSS source changes update without a build.");

async function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearTimeout(restartTimer);
  await stopBackend(backend, signal);
  await vite.close();
  process.exit(exitCode);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
