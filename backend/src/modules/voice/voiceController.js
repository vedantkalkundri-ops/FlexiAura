import { getVoiceStatus } from "./voiceService.js";

export function getStatus(req, res) {
  return res.json(getVoiceStatus());
}
