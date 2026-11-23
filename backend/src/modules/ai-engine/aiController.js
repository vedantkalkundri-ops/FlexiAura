import {
  appendExchange,
  ensureSession,
  resetSession,
} from "../conversation/conversationManager.js";
import { buildContents } from "../conversation/contextManager.js";
import { getMessages } from "../conversation/historyManager.js";
import { generateResponse } from "./aiService.js";
import { buildSystemPrompt } from "./promptBuilder.js";

export async function chat(req, res, next) {
  try {
    const { sessionId, message } = req.validated;

    ensureSession(sessionId);

    const history = getMessages(sessionId);
    const contents = buildContents(history, message);

    const result = await generateResponse({
      contents,
      systemInstruction: buildSystemPrompt(),
    });

    appendExchange(sessionId, message, result.text);

    return res.json({
      success: true,
      answer: result.text,
      sessionId,
      model: result.model,
    });
  } catch (error) {
    return next(error);
  }
}

export function reset(req, res) {
  const { sessionId } = req.validated;
  resetSession(sessionId);

  return res.json({
    success: true,
    sessionId,
    message: "Conversation context reset.",
  });
}
