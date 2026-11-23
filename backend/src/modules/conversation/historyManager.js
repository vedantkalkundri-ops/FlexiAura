import { getAppConfig } from "../../config/app.js";
import { logger } from "../../utils/logger.js";

const sessions = new Map();

function cloneMessage(message) {
  return { ...message };
}

function trimHistory(messages, maxMessages) {
  if (messages.length <= maxMessages) {
    return;
  }

  messages.splice(0, messages.length - maxMessages);

  while (messages.length > 0 && messages[0].role !== "user") {
    messages.shift();
  }
}

export function createSession(sessionId, now = Date.now()) {
  const session = {
    id: sessionId,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function addMessage(sessionId, role, content) {
  const session = getSession(sessionId);

  if (!session) {
    return null;
  }

  if (role !== "user" && role !== "assistant") {
    throw new Error(`Unsupported conversation role: ${role}`);
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Conversation messages must contain text.");
  }

  const message = {
    role,
    content: content.trim(),
    timestamp: Date.now(),
  };

  session.messages.push(message);
  trimHistory(session.messages, getAppConfig().maxHistoryMessages);
  session.updatedAt = message.timestamp;

  return cloneMessage(message);
}

export function getMessages(sessionId) {
  const session = getSession(sessionId);
  return session ? session.messages.map(cloneMessage) : [];
}

export function clearSession(sessionId) {
  const session = getSession(sessionId);

  if (!session) {
    return false;
  }

  session.messages = [];
  session.updatedAt = Date.now();
  return true;
}

export function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

export function clearAllSessions() {
  sessions.clear();
}

export function getSessionCount() {
  return sessions.size;
}

export function purgeExpiredSessions(now = Date.now()) {
  const ttl = getAppConfig().sessionTtlMs;
  let removed = 0;

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.updatedAt > ttl) {
      sessions.delete(sessionId);
      removed += 1;
    }
  }

  if (removed > 0) {
    logger.debug(`Purged ${removed} expired conversation session(s).`);
  }

  return removed;
}
