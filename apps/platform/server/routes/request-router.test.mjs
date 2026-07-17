import assert from "node:assert/strict";
import { createRequestRouter } from "./request-router.mjs";
const calls = [];
const router = createRequestRouter([
    (_req, _res, url) => {
        calls.push(`first:${url.pathname}`);
        return false;
    },
    (_req, _res, url) => {
        calls.push(`second:${url.pathname}`);
        return true;
    },
    () => {
        calls.push("unreachable");
        return true;
    },
]);
assert.equal(router.handleRequest({}, {}, new URL("http://localhost/thread")), true);
assert.deepEqual(calls, ["first:/thread", "second:/thread"]);
assert.equal(createRequestRouter([]).handleRequest({}, {}, new URL("http://localhost/missing")), false);
console.log("Ordered request router contracts passed.");
