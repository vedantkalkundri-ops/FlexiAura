import { useCallback, useEffect, useRef, useState } from "react";
import {
  resetConversation,
  sendChatMessage,
} from "../services/aiService";

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createSessionId() {
  return `session-${createId()}`;
}

export function useAssistant({ initialSessionId } = {}) {
  const [sessionId, setSessionId] = useState(
    () => initialSessionId || createSessionId(),
  );
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLoadingRef = useRef(false);
  const requestRef = useRef(null);

  const sendMessage = useCallback(
    async (rawMessage) => {
      const message = rawMessage.trim();

      if (!message || isLoadingRef.current) {
        return null;
      }

      const userMessage = {
        id: createId(),
        role: "user",
        content: message,
      };

      setError(null);
      setMessages((previous) => [...previous, userMessage]);
      setIsLoading(true);
      isLoadingRef.current = true;

      const controller = new AbortController();
      requestRef.current = controller;

      try {
        const data = await sendChatMessage({
          sessionId,
          message,
          signal: controller.signal,
        });

        const assistantMessage = {
          id: createId(),
          role: "assistant",
          content: data.answer,
        };

        setMessages((previous) => [...previous, assistantMessage]);
        return assistantMessage;
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return null;
        }

        setError({
          code: requestError.code || "REQUEST_FAILED",
          message:
            requestError.message || "Something went wrong. Please try again.",
        });

        return null;
      } finally {
        if (requestRef.current === controller) {
          requestRef.current = null;
        }

        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const reset = useCallback(async () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setMessages([]);
    setError(null);

    try {
      await resetConversation(sessionId);
      return true;
    } catch (requestError) {
      setError({
        code: requestError.code || "RESET_FAILED",
        message:
          requestError.message || "Unable to reset the conversation right now.",
      });
      return false;
    }
  }, [sessionId]);

  const cancelRequest = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    isLoadingRef.current = false;
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const startNewSession = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    isLoadingRef.current = false;
    setIsLoading(false);
    setMessages([]);
    setError(null);
    setSessionId(createSessionId());
  }, []);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  return {
    sessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    reset,
    cancelRequest,
    clearError,
    startNewSession,
  };
}
