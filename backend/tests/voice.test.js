import test from "node:test";
import assert from "node:assert/strict";
import { startTestServer, stopTestServer } from "./testServer.js";

let server;
let baseUrl;

test.before(async () => {
  ({ server, baseUrl } = await startTestServer());
});

test.after(async () => {
  await stopTestServer(server);
});

test("voice status reports browser-based speech support", async () => {
  const response = await fetch(`${baseUrl}/api/voice/status`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.voice.speechToText.mode, "browser");
  assert.equal(body.voice.textToSpeech.mode, "browser");
  assert.equal(body.voice.speechToText.requiresBackend, false);
});

test("health endpoint reports service availability", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.service, "flexiaura-backend");
  assert.equal(typeof body.geminiKeyCount, "number");
  assert.ok(body.geminiKeyCount >= 0);
});

test("unknown conversation sessions return 404", async () => {
  const getResponse = await fetch(`${baseUrl}/api/conversation/missing-session`);
  const getBody = await getResponse.json();

  assert.equal(getResponse.status, 404);
  assert.equal(getBody.error.code, "SESSION_NOT_FOUND");

  const deleteResponse = await fetch(`${baseUrl}/api/conversation/missing-session`, {
    method: "DELETE",
  });
  const deleteBody = await deleteResponse.json();

  assert.equal(deleteResponse.status, 404);
  assert.equal(deleteBody.error.code, "SESSION_NOT_FOUND");
});

test("unknown endpoints return a structured 404", async () => {
  const response = await fetch(`${baseUrl}/api/unknown`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, "NOT_FOUND");
});
