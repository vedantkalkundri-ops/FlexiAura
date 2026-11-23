import { useEffect, useRef, useState } from "react";
import { useAssistant } from "../hooks/useAssistant";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { useSpeechRecognition } from "../../voice/hooks/useSpeechRecognition";
import { useTextToSpeech } from "../../voice/hooks/useTextToSpeech";
import { ListeningIndicator } from "../../voice/components/ListeningIndicator";
import { VoiceButton } from "../../voice/components/VoiceButton";
import "./AssistantPanel.css";

export function AssistantPanel() {
  const assistant = useAssistant();
  const speech = useSpeechRecognition({ lang: "en-US" });
  const textToSpeech = useTextToSpeech({ lang: "en-US" });

  const [draft, setDraft] = useState("");
  const [voiceReplies, setVoiceReplies] = useState(false);
  const lastSpokenIdRef = useRef(null);

  useEffect(() => {
    if (speech.transcript) {
      setDraft(speech.transcript);
    }
  }, [speech.transcript]);

  useEffect(() => {
    const lastMessage = assistant.messages[assistant.messages.length - 1];

    if (
      voiceReplies &&
      lastMessage?.role === "assistant" &&
      lastMessage.id !== lastSpokenIdRef.current
    ) {
      lastSpokenIdRef.current = lastMessage.id;
      textToSpeech.speak(lastMessage.content);
    }
  }, [assistant.messages, voiceReplies, textToSpeech.speak]);

  async function handleSubmit(event) {
    event.preventDefault();

    const message = draft.trim();

    if (!message || assistant.isLoading) {
      return;
    }

    speech.stopListening();
    speech.resetTranscript();
    setDraft("");
    await assistant.sendMessage(message);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  function handleVoiceToggle() {
    if (speech.isListening) {
      speech.stopListening();
      return;
    }

    speech.startListening();
  }

  async function handleReset() {
    textToSpeech.stop();
    speech.resetTranscript();
    lastSpokenIdRef.current = null;
    setDraft("");
    await assistant.reset();
  }

  function handleNewSession() {
    textToSpeech.stop();
    speech.resetTranscript();
    lastSpokenIdRef.current = null;
    setDraft("");
    assistant.startNewSession();
  }

  const error = assistant.error || speech.error || textToSpeech.error;

  return (
    <section className="fa-assistant" aria-label="FlexiAura assistant">
      <header className="fa-assistant-header">
        <div>
          <h2>FlexiAura</h2>
          <p className="fa-assistant-subtitle">
            Session: {assistant.sessionId}
          </p>
        </div>

        <div className="fa-assistant-controls">
          <button type="button" className="fa-button" onClick={handleReset}>
            Reset context
          </button>
          <button type="button" className="fa-button" onClick={handleNewSession}>
            New session
          </button>
          <button
            type="button"
            className="fa-button"
            onClick={textToSpeech.toggleMute}
            aria-pressed={textToSpeech.isMuted}
            disabled={!textToSpeech.isSupported}
          >
            {textToSpeech.isMuted ? "Unmute voice" : "Mute voice"}
          </button>
          {textToSpeech.isSpeaking && (
            <button type="button" className="fa-button" onClick={textToSpeech.stop}>
              Stop speaking
            </button>
          )}
        </div>
      </header>

      <div className="fa-assistant-messages" aria-live="polite">
        {assistant.messages.length === 0 && !assistant.isLoading && (
          <p className="fa-assistant-empty">
            Ask FlexiAura anything, by typing or using your microphone.
          </p>
        )}

        {assistant.messages.map((message) => (
          <article
            key={message.id}
            className={`fa-message fa-message-${message.role}`}
          >
            <span className="fa-message-label">
              {message.role === "user" ? "You" : "FlexiAura"}
            </span>
            {message.content}
          </article>
        ))}

        {assistant.isLoading && <ThinkingIndicator />}
      </div>

      {error && (
        <div className="fa-assistant-error" role="alert">
          <span>{error.message}</span>
          <button
            type="button"
            className="fa-button fa-button-small"
            onClick={() => {
              assistant.clearError();
              speech.clearError();
              textToSpeech.clearError();
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="fa-assistant-voice-row">
        <VoiceButton
          isListening={speech.isListening}
          isSupported={speech.isSupported}
          onClick={handleVoiceToggle}
        />
        <ListeningIndicator isListening={speech.isListening} />
        {speech.interimTranscript && (
          <span className="fa-assistant-interim">
            {speech.interimTranscript}
          </span>
        )}
        {!speech.isSupported && (
          <span className="fa-assistant-note">
            Voice input is not supported in this environment.
          </span>
        )}
      </div>

      <label className="fa-assistant-toggle">
        <input
          type="checkbox"
          checked={voiceReplies}
          onChange={(event) => setVoiceReplies(event.target.checked)}
          disabled={!textToSpeech.isSupported}
        />
        Speak AI replies aloud
      </label>

      <form className="fa-assistant-form" onSubmit={handleSubmit}>
        <textarea
          className="fa-assistant-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message, or use the voice button..."
          rows={2}
          maxLength={4000}
          aria-label="Message FlexiAura"
        />
        <button
          type="submit"
          className="fa-button fa-button-primary"
          disabled={!draft.trim() || assistant.isLoading}
        >
          {assistant.isLoading ? "Sending..." : "Send"}
        </button>
        {assistant.isLoading && (
          <button
            type="button"
            className="fa-button"
            onClick={assistant.cancelRequest}
          >
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}
