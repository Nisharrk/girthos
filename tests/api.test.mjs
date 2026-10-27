import assert from "node:assert/strict";
import test from "node:test";
import { requestJson } from "../lib/api.mjs";

test("JSON requests preserve useful errors and reject invalid server responses", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await assert.rejects(requestJson("/api/measurements"), (err) => err.message === "Unauthorized" && err.status === 401);
    globalThis.fetch = async () => new Response("<html>failure</html>", { status: 500 });
    await assert.rejects(requestJson("/api/measurements"), /Request failed/);
    globalThis.fetch = async () => new Response("bad JSON", { status: 200 });
    await assert.rejects(requestJson("/api/measurements"), /invalid response/);
    globalThis.fetch = async () => new Response("[]", { status: 200 });
    assert.deepEqual(await requestJson("/api/measurements"), []);
  } finally {
    globalThis.fetch = original;
  }
});
