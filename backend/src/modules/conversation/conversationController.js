import { getConversation, deleteConversation } from "./conversationManager.js";

export function getConversationHistory(req, res) {
  const conversation = getConversation(req.params.sessionId);

  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "The requested conversation session was not found or has expired.",
      },
    });
  }

  return res.json({
    success: true,
    sessionId: conversation.sessionId,
    messages: conversation.messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}

export function removeConversation(req, res) {
  const { sessionId } = req.params;
  const deleted = deleteConversation(sessionId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "The requested conversation session was not found or has expired.",
      },
    });
  }

  return res.json({
    success: true,
    sessionId,
    message: "Conversation deleted.",
  });
}
