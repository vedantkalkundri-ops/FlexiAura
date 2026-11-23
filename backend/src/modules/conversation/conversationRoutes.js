import { Router } from "express";
import {
  getConversationHistory,
  removeConversation,
} from "./conversationController.js";
import { validateSessionIdParam } from "../../middleware/validateRequest.js";

const router = Router();

router.get("/:sessionId", validateSessionIdParam, getConversationHistory);
router.delete("/:sessionId", validateSessionIdParam, removeConversation);

export default router;
