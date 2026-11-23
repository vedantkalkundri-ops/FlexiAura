import { Router } from "express";
import { getStatus } from "./voiceController.js";

const router = Router();

router.get("/status", getStatus);

export default router;
