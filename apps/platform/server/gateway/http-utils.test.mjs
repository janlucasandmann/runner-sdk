import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import {
  normalizeBackendUrl,
  normalizePlatformApiKey,
  readRequestBody,
  sendJson,
} from "./http-utils.mjs";
import { summarizeRunnerStreamChunkForLog } from "./runner-stream-utils.mjs";

test("normalizes platform transport credentials and origins", () => {
  assert.equal(normalizeBackendUrl(" https://api.example.test/// "), "https://api.example.test");
  assert.equal(normalizePlatformApiKey(" secret "), "secret");
  assert.equal(normalizePlatformApiKey("__runner_playground_session__"), "");
});

test("reads a JSON request body and rejects malformed payloads", async () => {
  const request = new EventEmitter();
  const pending = readRequestBody(request);
  request.emit("data", Buffer.from('{"value":1}'));
  request.emit("end");
  assert.deepEqual(await pending, { value: 1 });

  const malformedRequest = new EventEmitter();
  const malformedPending = readRequestBody(malformedRequest);
  malformedRequest.emit("data", Buffer.from("{"));
  malformedRequest.emit("end");
  await assert.rejects(malformedPending, /Invalid JSON body/);
});

test("writes bounded JSON responses and summarizes SSE diagnostics", () => {
  const response = {
    destroyed: false,
    writableEnded: false,
    headersSent: false,
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
      this.writableEnded = true;
    },
  };
  assert.equal(sendJson(response, 201, { ok: true }), true);
  assert.equal(response.status, 201);
  assert.equal(response.body, '{"ok":true}');
  const [summary] = summarizeRunnerStreamChunkForLog(new TextEncoder().encode(
    'data: {"type":"response","status":"running"}\n\n',
  ));
  assert.equal(summary.type, "response");
  assert.equal(summary.status, "running");
});
