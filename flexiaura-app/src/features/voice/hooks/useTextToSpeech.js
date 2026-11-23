import { useCallback, useEffect, useState } from "react";
import {
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from "../services/voiceService";

export function useTextToSpeech({ lang = "en-US", rate = 1, pitch = 1 } = {}) {
  const isSupported = isSpeechSynthesisSupported();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);

  const speak = useCallback(
    (text) => {
      if (isMuted || !text?.trim()) {
        return null;
      }

      if (!isSupported) {
        setError("Speech output is not supported in this environment.");
        return null;
      }

      setError(null);

      return speakText(text, {
        lang,
        rate,
        pitch,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => {
          setError("Unable to play the spoken response.");
          setIsSpeaking(false);
        },
      });
    },
    [isMuted, isSupported, lang, pitch, rate],
  );

  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((previous) => {
      if (!previous) {
        stopSpeaking();
        setIsSpeaking(false);
      }

      return !previous;
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return {
    isSupported,
    isSpeaking,
    isMuted,
    error,
    speak,
    stop,
    toggleMute,
    clearError,
  };
}
