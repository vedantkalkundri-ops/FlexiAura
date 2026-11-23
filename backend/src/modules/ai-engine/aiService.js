import { getAppConfig } from "../../config/app.js";
import {
  getGeminiApiKeys,
  getGeminiClient,
  getGeminiModel,
} from "../../config/gemini.js";
import { logger } from "../../utils/logger.js";

let nextKeyIndex = 0;

export function buildKeyAttemptOrder(apiKeys, startIndex = 0) {
  if (apiKeys.length === 0) {
    return [];
  }

  const start =
    ((startIndex % apiKeys.length) + apiKeys.length) % apiKeys.length;

  return [...apiKeys.slice(start), ...apiKeys.slice(0, start)];
}

export function resetKeyRotation() {
  nextKeyIndex = 0;
}

function createAiError(code, message, status = 502) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.expose = true;
  return error;
}

function isRetryableWithAnotherKey(error) {
  const code = String(error.code || "").toUpperCase();
  const message = String(error.message || "").toUpperCase();

  if (
    code.includes("API_KEY") ||
    code.includes("UNAUTHENTICATED") ||
    code.includes("PERMISSION_DENIED") ||
    code.includes("RESOURCE_EXHAUSTED") ||
    message.includes("API KEY") ||
    message.includes("QUOTA") ||
    message.includes("RATE LIMIT")
  ) {
    return true;
  }

  const status = Number(error.status);

  if (Number.isFinite(status)) {
    return (
      status === 401 ||
      status === 403 ||
      status === 429 ||
      status >= 500
    );
  }

  if (
    code.includes("INVALID_ARGUMENT") ||
    code.includes("NOT_FOUND") ||
    code.includes("FAILED_PRECONDITION")
  ) {
    return false;
  }

  return true;
}

export async function generateResponse({ contents, systemInstruction }) {
  const apiKeys = getGeminiApiKeys();

  if (apiKeys.length === 0) {
    throw createAiError(
      "AI_NOT_CONFIGURED",
      "The AI service is not configured. Add GEMINI_API_KEY or GEMINI_API_KEYS to the backend .env file.",
      503,
    );
  }

  const model = getGeminiModel();
  const timeoutMs = getAppConfig().aiTimeoutMs;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const startIndex = nextKeyIndex % apiKeys.length;
  nextKeyIndex = (startIndex + 1) % apiKeys.length;
  const keyOrder = buildKeyAttemptOrder(apiKeys, startIndex);

  try {
    for (let index = 0; index < keyOrder.length; index += 1) {
      try {
        const client = getGeminiClient(keyOrder[index]);
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 2048,
            abortSignal: controller.signal,
          },
        });

        const text = response.text?.trim();

        if (!text) {
          throw createAiError(
            "AI_EMPTY_RESPONSE",
            "The AI service returned an empty response. Please try again.",
          );
        }

        return {
          text,
          model,
          usage: response.usageMetadata || null,
        };
      } catch (error) {
        if (controller.signal.aborted) {
          logger.warn(`Gemini request timed out after ${timeoutMs}ms.`);
          throw createAiError(
            "AI_TIMEOUT",
            "The AI service took too long to respond. Please try again.",
            504,
          );
        }

        if (error.code === "AI_EMPTY_RESPONSE") {
          throw error;
        }

        const hasAnotherKey = index < keyOrder.length - 1;

        if (hasAnotherKey && isRetryableWithAnotherKey(error)) {
          logger.warn(
            `Gemini request failed with key ${index + 1}/${keyOrder.length}; trying the next key.`,
          );
          continue;
        }

        logger.error(`Gemini request failed: ${error.message}`);
        throw createAiError(
          "AI_SERVICE_ERROR",
          "The AI service is temporarily unavailable. Please try again.",
        );
      }
    }
  } finally {
    clearTimeout(timeout);
  }

  throw createAiError(
    "AI_SERVICE_ERROR",
    "The AI service is temporarily unavailable. Please try again.",
  );
}
