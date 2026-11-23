import { getAppConfig } from "../../config/app.js";
import {
  addMessage,
  createSession,
  deleteSession,
  getMessages,
  getSession,
  purgeExpiredSessions,
} from "./historyManager.js";

function getActiveSession(sessionId) {
  const session = getSession(sessionId);

  if (!session) {
    return null;
  }

  if (Date.now() - session.updatedAt > getAppConfig().sessionTtlMs) {
    deleteSession(sessionId);
    return null;
  }

  return session;
}

export function ensureSession(sessionId) {
  purgeExpiredSessions();

  const session = getActiveSession(sessionId);

  if (session) {
    return session;
  }

  return createSession(sessionId);
}

export function resetSession(sessionId) {
  deleteSession(sessionId);
  return createSession(sessionId);
}

export function getConversation(sessionId) {
  const session = getActiveSession(sessionId);

  if (!session) {
    return null;
  }

  return {
    sessionId: session.id,
    messages: getMessages(sessionId),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function deleteConversation(sessionId) {
  return deleteSession(sessionId);
}

export function appendExchange(sessionId, userMessage, assistantMessage) {
  addMessage(sessionId, "user", userMessage);
  addMessage(sessionId, "assistant", assistantMessage);
}
