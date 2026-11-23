import { randomUUID } from "node:crypto";
import { getAppConfig } from "../config/app.js";
import { createHttpError } from "../utils/errors.js";

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

function validateSessionId(value, { required }) {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw createHttpError(
        400,
        "INVALID_SESSION_ID",
        "A valid sessionId is required.",
      );
    }

    return randomUUID();
  }

  if (typeof value !== "string" || !SESSION_ID_PATTERN.test(value)) {
    throw createHttpError(
      400,
      "INVALID_SESSION_ID",
      "sessionId must be 1-100 characters using letters, numbers, hyphens or underscores.",
    );
  }

  return value;
}

function validateMessage(value) {
  const { maxMessageLength } = getAppConfig();

  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(
      400,
      "INVALID_MESSAGE",
      "message is required and must be a non-empty string.",
    );
  }

  const message = value.trim();

  if (message.length > maxMessageLength) {
    throw createHttpError(
      400,
      "MESSAGE_TOO_LONG",
      `message must be ${maxMessageLength} characters or fewer.`,
    );
  }

  return message;
}

export function validateChatRequest(req, res, next) {
  try {
    const body = req.body || {};
    const sessionId = validateSessionId(body.sessionId, { required: false });
    const message = validateMessage(body.message);

    req.validated = { sessionId, message };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateResetRequest(req, res, next) {
  try {
    const body = req.body || {};
    const sessionId = validateSessionId(body.sessionId, { required: true });

    req.validated = { sessionId };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateSessionIdParam(req, res, next) {
  try {
    validateSessionId(req.params.sessionId, { required: true });
    return next();
  } catch (error) {
    return next(error);
  }
}
