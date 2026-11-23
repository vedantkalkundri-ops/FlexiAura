import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { getAppConfig } from "./config/app.js";
import {
  getGeminiApiKeys,
  getGeminiModel,
  isGeminiConfigured,
} from "./config/gemini.js";
import aiRoutes from "./modules/ai-engine/aiRoutes.js";
import conversationRoutes from "./modules/conversation/conversationRoutes.js";
import voiceRoutes from "./modules/voice/voiceRoutes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

const currentFilePath = fileURLToPath(import.meta.url);
const backendRoot = path.resolve(path.dirname(currentFilePath), "..");

dotenv.config({ path: path.join(backendRoot, ".env"), quiet: true });

const config = getAppConfig();

export const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isConfigured = config.corsOrigins.includes(origin);
      const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isTauri = origin === "tauri://localhost" || origin === "http://tauri.localhost";

      if (isConfigured || isLocalDev || isTauri) {
        return callback(null, true);
      }

      const error = new Error("Origin is not allowed by CORS.");
      error.status = 403;
      error.code = "CORS_NOT_ALLOWED";
      error.expose = true;
      return callback(error);
    },
  }),
);

app.use(express.json({ limit: config.requestBodyLimit }));

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`,
    );
  });

  next();
});

const apiLimiter = rateLimit({
  windowMs: config.apiRateLimitWindowMs,
  limit: config.apiRateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait a moment and try again.",
      },
    });
  },
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "flexiaura-backend",
    aiConfigured: isGeminiConfigured(),
    model: isGeminiConfigured() ? getGeminiModel() : null,
    geminiKeyCount: getGeminiApiKeys().length,
  });
});

app.use("/api", apiLimiter);
app.use("/api/ai", aiRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/voice", voiceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(currentFilePath);

if (isMainModule) {
  app.listen(config.port, () => {
    logger.info(`FlexiAura backend listening on http://localhost:${config.port}`);

    if (isGeminiConfigured()) {
      logger.info(`Gemini model configured: ${getGeminiModel()}`);
    } else {
      logger.warn(
        "GEMINI_API_KEY is not set. AI chat requests will return 503 until it is configured.",
      );
    }
  });
}
