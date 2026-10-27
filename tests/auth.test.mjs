import assert from "node:assert/strict";
import test from "node:test";
import { isValidApiKey } from "../lib/auth.mjs";

test("only the exact configured API key is accepted", () => {
  assert.equal(isValidApiKey("correct-key", "correct-key"), true);
  for (const key of [undefined, null, "", "wrong-key", "Correct-key", "correct-key "]) {
    assert.equal(isValidApiKey(key, "correct-key"), false);
  }
});

test("missing configuration never authorizes a request", () => {
  for (const expected of [undefined, null, ""]) {
    for (const key of [undefined, null, "", "anything"]) {
      assert.equal(isValidApiKey(key, expected), false);
    }
  }
});
