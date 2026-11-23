export function isCloudSpeechConfigured() {
  return Boolean(
    (process.env.SPEECH_PROVIDER || "").trim() &&
      (process.env.SPEECH_API_KEY || "").trim(),
  );
}

export function getSpeechProvider() {
  if (isCloudSpeechConfigured()) {
    return (process.env.SPEECH_PROVIDER || "").trim();
  }

  return "web-speech-api";
}

export async function transcribeAudio() {
  const error = new Error(
    "Cloud speech processing is not configured. Browser-native speech recognition is used in this prototype.",
  );
  error.status = 501;
  error.code = "SPEECH_NOT_CONFIGURED";
  error.expose = true;
  throw error;
}
