import { GoogleGenAI } from "@google/genai";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

const clients = new Map();

function parseKeyList(value) {
  return (value || "")
    .split(/[,\n;]+/)
    .map((key) => key.trim())
    .filter(Boolean);
}

export function getGeminiApiKeys() {
  const multipleKeys = parseKeyList(process.env.GEMINI_API_KEYS);
  const singleKey = (process.env.GEMINI_API_KEY || "").trim();

  if (multipleKeys.length > 0) {
    return [...new Set(multipleKeys)];
  }

  return singleKey ? [singleKey] : [];
}

export function getGeminiApiKey() {
  return getGeminiApiKeys()[0] || "";
}

export function getGeminiModel() {
  return (process.env.GEMINI_MODEL || "").trim() || DEFAULT_GEMINI_MODEL;
}

export function isGeminiConfigured() {
  return getGeminiApiKeys().length > 0;
}

export function getGeminiClient(apiKey = getGeminiApiKey()) {
  if (!apiKey) {
    const error = new Error(
      "The AI service is not configured. Add GEMINI_API_KEY or GEMINI_API_KEYS to the backend .env file.",
    );
    error.status = 503;
    error.code = "AI_NOT_CONFIGURED";
    error.expose = true;
    throw error;
  }

  if (!clients.has(apiKey)) {
    clients.set(apiKey, new GoogleGenAI({ apiKey }));
  }

  return clients.get(apiKey);
}

export function resetGeminiClients() {
  clients.clear();
}

export function resetGeminiClient() {
  resetGeminiClients();
}
