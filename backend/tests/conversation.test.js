import test from "node:test";
import assert from "node:assert/strict";
import {
  addMessage,
  clearAllSessions,
  getMessages,
  getSession,
  clearSession,
} from "../src/modules/conversation/historyManager.js";
import {
  appendExchange,
  deleteConversation,
  ensureSession,
  getConversation,
  resetSession,
} from "../src/modules/conversation/conversationManager.js";
import { buildContents } from "../src/modules/conversation/contextManager.js";

test.beforeEach(() => {
  clearAllSessions();
});

test("messages stay in order and are isolated per session", () => {
  ensureSession("session-a");
  ensureSession("session-b");

  appendExchange("session-a", "My name is Alex.", "Nice to meet you, Alex!");
  addMessage("session-b", "user", "Different session");

  const sessionA = getMessages("session-a");
  const sessionB = getMessages("session-b");

  assert.deepEqual(
    sessionA.map((message) => message.role),
    ["user", "assistant"],
  );
  assert.equal(sessionA[0].content, "My name is Alex.");
  assert.equal(sessionB.length, 1);
  assert.equal(sessionB[0].content, "Different session");
});

test("context includes history and the current message", () => {
  const history = [
    { role: "user", content: "My name is Alex." },
    { role: "assistant", content: "Nice to meet you, Alex!" },
  ];

  const contents = buildContents(history, "What is my name?");

  assert.deepEqual(
    contents.map((content) => content.role),
    ["user", "model", "user"],
  );
  assert.equal(contents[2].parts[0].text, "What is my name?");
});

test("context merges consecutive messages from the same role", () => {
  const contents = buildContents(
    [
      { role: "user", content: "First message." },
      { role: "user", content: "Second message." },
    ],
    "Third message.",
  );

  assert.equal(contents.length, 1);
  assert.equal(contents[0].role, "user");
  assert.match(contents[0].parts[0].text, /First message\.\n\nSecond message\./);
});

test("context never starts with a model message", () => {
  const contents = buildContents(
    [{ role: "assistant", content: "Welcome back!" }],
    "Hello",
  );

  assert.deepEqual(
    contents.map((content) => content.role),
    ["user"],
  );
});

test("reset clears the conversation but keeps the session usable", () => {
  ensureSession("session-001");
  appendExchange("session-001", "Hello", "Hi there!");

  resetSession("session-001");

  assert.deepEqual(getMessages("session-001"), []);
  assert.ok(getSession("session-001"));
});

test("clear session keeps session metadata", () => {
  ensureSession("session-001");
  addMessage("session-001", "user", "Hello");

  assert.equal(clearSession("session-001"), true);
  assert.deepEqual(getMessages("session-001"), []);
});

test("delete conversation removes the session", () => {
  ensureSession("session-001");
  addMessage("session-001", "user", "Hello");

  assert.equal(deleteConversation("session-001"), true);
  assert.equal(getConversation("session-001"), null);
  assert.equal(deleteConversation("session-001"), false);
});

test("expired sessions are replaced with a fresh session", () => {
  ensureSession("session-001");
  addMessage("session-001", "user", "Old message");

  const session = getSession("session-001");
  session.updatedAt = Date.now() - 24 * 60 * 60 * 1000;

  ensureSession("session-001");

  assert.deepEqual(getMessages("session-001"), []);
});

test("history is trimmed and begins with a user message", () => {
  ensureSession("session-001");

  for (let index = 0; index < 45; index += 1) {
    addMessage(
      "session-001",
      index % 2 === 0 ? "user" : "assistant",
      `Message ${index}`,
    );
  }

  const messages = getMessages("session-001");

  assert.ok(messages.length <= 40);
  assert.equal(messages[0].role, "user");
});
