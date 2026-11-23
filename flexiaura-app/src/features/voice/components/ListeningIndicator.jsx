import { VoiceVisualizer } from "./VoiceVisualizer";

export function ListeningIndicator({ isListening = false }) {
  if (!isListening) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "#dc2626",
        fontWeight: 600,
      }}
    >
      <VoiceVisualizer isActive />
      <span>Listening...</span>
    </div>
  );
}
