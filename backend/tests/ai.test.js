import test from "node:test";
import assert from "node:assert/strict";
import {
  FLEXIAURA_SYSTEM_PROMPT,
  buildSystemPrompt,
} from "../src/modules/ai-engine/promptBuilder.js";
import { getGeminiApiKeys } from "../src/config/gemini.js";
import { buildKeyAttemptOrder } from "../src/modules/ai-engine/aiService.js";
import { startTestServer, stopTestServer } from "./testServer.js";

let server;
let baseUrl;

test.before(async () => {
  ({ server, baseUrl } = await startTestServer());
});

test.after(async () => {
  await stopTestServer(server);
});

test("system prompt defines FlexiAura identity and safety boundaries", () => {
  assert.match(FLEXIAURA_SYSTEM_PROMPT, /FlexiAura/);
  assert.match(FLEXIAURA_SYSTEM_PROMPT, /cannot directly execute/);
  assert.equal(buildSystemPrompt(), FLEXIAURA_SYSTEM_PROMPT);
});

test("key attempt order rotates and wraps around the key list", () => {
  assert.deepEqual(buildKeyAttemptOrder(["a", "b", "c"], 0), ["a", "b", "c"]);
  assert.deepEqual(buildKeyAttemptOrder(["a", "b", "c"], 1), ["b", "c", "a"]);
  assert.deepEqual(buildKeyAttemptOrder(["a", "b", "c"], 3), ["a", "b", "c"]);
  assert.deepEqual(buildKeyAttemptOrder([], 0), []);
});

test("chat rejects an empty message", async () => {
  const response = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: "session-001", message: "   " }),
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "INVALID_MESSAGE");
});

test("chat rejects an invalid session id", async () => {
  const response = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "invalid session id!",
      message: "Hello FlexiAura",
    }),
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_SESSION_ID");
});

test("Gemini keys support a single key or a comma-separated failover list", () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalKeys = process.env.GEMINI_API_KEYS;

  try {
    delete process.env.GEMINI_API_KEYS;
    process.env.GEMINI_API_KEY = "single-key";
    assert.deepEqual(getGeminiApiKeys(), ["single-key"]);

    process.env.GEMINI_API_KEYS = " key-1, key-2,key-1 ";
    assert.deepEqual(getGeminiApiKeys(), ["key-1", "key-2"]);
  } finally {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalKey;
    }

    if (originalKeys === undefined) {
      delete process.env.GEMINI_API_KEYS;
    } else {
      process.env.GEMINI_API_KEYS = originalKeys;
    }
  }
});

test("chat returns 503 when Gemini is not configured", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalKeys = process.env.GEMINI_API_KEYS;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEYS;

  try {
    const response = await fetch(`${baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "session-001",
        message: "Hello FlexiAura",
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "AI_NOT_CONFIGURED");
  } finally {
    if (originalKey !== undefined) {
      process.env.GEMINI_API_KEY = originalKey;
    }

    if (originalKeys !== undefined) {
      process.env.GEMINI_API_KEYS = originalKeys;
    }
  }
});

test("reset requires a session id", async () => {
  const response = await fetch(`${baseUrl}/api/ai/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_SESSION_ID");
});

test("reset creates an empty session that can be read and deleted", async () => {
  const sessionId = "session-reset-test";

  const resetResponse = await fetch(`${baseUrl}/api/ai/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  const resetBody = await resetResponse.json();

  assert.equal(resetResponse.status, 200);
  assert.equal(resetBody.success, true);

  const historyResponse = await fetch(
    `${baseUrl}/api/conversation/${sessionId}`,
  );
  const historyBody = await historyResponse.json();

  assert.equal(historyResponse.status, 200);
  assert.deepEqual(historyBody.messages, []);

  const deleteResponse = await fetch(
    `${baseUrl}/api/conversation/${sessionId}`,
    { method: "DELETE" },
  );
  const deleteBody = await deleteResponse.json();

  assert.equal(deleteResponse.status, 200);
  assert.equal(deleteBody.success, true);

  const missingResponse = await fetch(
    `${baseUrl}/api/conversation/${sessionId}`,
  );

  assert.equal(missingResponse.status, 404);
});
