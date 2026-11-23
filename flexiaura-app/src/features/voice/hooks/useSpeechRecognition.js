import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
} from "../services/voiceService";

function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was denied. Allow microphone access to use voice input.";
    case "no-speech":
      return "No speech was detected. Please try again.";
    case "audio-capture":
      return "No microphone was found. Check your microphone and try again.";
    case "network":
      return "Speech recognition needs a network connection.";
    case "language-not-supported":
      return "The selected language is not supported for speech recognition.";
    default:
      return "Speech recognition stopped unexpectedly. Please try again.";
  }
}

export function useSpeechRecognition({
  lang = "en-US",
  continuous = false,
  interimResults = true,
} = {}) {
  const isSupported = isSpeechRecognitionSupported();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    if (!isSupported) {
      return undefined;
    }

    const recognition = createSpeechRecognition({
      lang,
      continuous,
      interimResults,
    });

    if (!recognition) {
      return undefined;
    }

    recognition.onstart = () => {
      setError(null);
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript || "";

        if (result.isFinal) {
          finalText += `${text} `;
        } else {
          interimText += text;
        }
      }

      if (finalText.trim()) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalText}`
          .replace(/\s+/g, " ")
          .trim();
        setTranscript(finalTranscriptRef.current);
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") {
        return;
      }

      setError(getErrorMessage(event.error));
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort?.();
      recognitionRef.current = null;
    };
  }, [lang, continuous, interimResults, isSupported]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setError("Speech recognition is not supported in this environment.");
      return false;
    }

    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setError(null);

    try {
      recognition.start();
      return true;
    } catch (startError) {
      setError(
        startError.name === "InvalidStateError"
          ? "Speech recognition is already listening."
          : "Unable to start speech recognition. Please try again.",
      );
      return false;
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
  };
}
