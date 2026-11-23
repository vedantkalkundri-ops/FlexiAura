function toInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toOriginList(value) {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getAppConfig() {
  return {
    port: toInteger(process.env.PORT, 3000),
    corsOrigins: toOriginList(process.env.CORS_ORIGIN),
    requestBodyLimit: process.env.REQUEST_BODY_LIMIT || "16kb",
    maxMessageLength: toInteger(process.env.MAX_MESSAGE_LENGTH, 4000),
    maxHistoryMessages: toInteger(process.env.MAX_HISTORY_MESSAGES, 40),
    maxContextMessages: toInteger(process.env.MAX_CONTEXT_MESSAGES, 20),
    maxContextChars: toInteger(process.env.MAX_CONTEXT_CHARS, 12000),
    sessionTtlMs: toInteger(process.env.SESSION_TTL_MS, 2 * 60 * 60 * 1000),
    aiTimeoutMs: toInteger(process.env.AI_TIMEOUT_MS, 30000),
    apiRateLimitWindowMs: toInteger(process.env.API_RATE_LIMIT_WINDOW_MS, 60 * 1000),
    apiRateLimitMax: toInteger(process.env.API_RATE_LIMIT_MAX, 60),
  };
}
