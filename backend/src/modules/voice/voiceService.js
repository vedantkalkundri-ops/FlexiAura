import {
  getSpeechProvider,
  isCloudSpeechConfigured,
} from "./speechProcessor.js";

export function getVoiceStatus() {
  return {
    success: true,
    voice: {
      speechToText: {
        provider: getSpeechProvider(),
        mode: isCloudSpeechConfigured() ? "cloud" : "browser",
        requiresBackend: isCloudSpeechConfigured(),
        cloudConfigured: isCloudSpeechConfigured(),
      },
      textToSpeech: {
        provider: "web-speech-api",
        mode: "browser",
        requiresBackend: false,
      },
      supportedBrowsers: ["Chromium-based browsers with Web Speech API support"],
    },
  };
}
