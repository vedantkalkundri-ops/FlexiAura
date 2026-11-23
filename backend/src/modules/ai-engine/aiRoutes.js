import { Router } from "express";
import { chat, reset } from "./aiController.js";
import {
  validateChatRequest,
  validateResetRequest,
} from "../../middleware/validateRequest.js";

const router = Router();

router.post("/chat", validateChatRequest, chat);
router.post("/reset", validateResetRequest, reset);

export default router;
