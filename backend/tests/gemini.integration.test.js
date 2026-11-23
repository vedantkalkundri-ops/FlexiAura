import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import {
  getGeminiModel,
  isGeminiConfigured,
} from "../src/config/gemini.js";
import { generateResponse } from "../src/modules/ai-engine/aiService.js";

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

dotenv.config({ path: path.join(backendRoot, ".env"), quiet: true });

const shouldRun =
  process.env.RUN_GEMINI_INTEGRATION === "1" && isGeminiConfigured();

test(
  "Gemini integration returns a real response",
  {
    skip: shouldRun
      ? false
      : "Set RUN_GEMINI_INTEGRATION=1 and a Gemini key to run this test.",
  },
  async () => {
    const result = await generateResponse({
      contents: [
        {
          role: "user",
          parts: [{ text: "Reply with the single word: ready" }],
        },
      ],
      systemInstruction: "You are a concise integration test assistant.",
    });

    assert.equal(typeof result.text, "string");
    assert.ok(result.text.length > 0);
    assert.equal(result.model, getGeminiModel());
  },
);
