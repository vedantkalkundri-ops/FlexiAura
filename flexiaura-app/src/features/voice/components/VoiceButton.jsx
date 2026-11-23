const baseStyle = {
  border: "1px solid currentColor",
  borderRadius: 999,
  padding: "8px 16px",
  cursor: "pointer",
  fontWeight: 600,
  background: "transparent",
  color: "inherit",
};

export function VoiceButton({
  isListening = false,
  isSupported = true,
  disabled = false,
  onClick,
  children,
}) {
  const isDisabled = disabled || !isSupported;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isListening}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      style={{
        ...baseStyle,
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        background: isListening ? "rgba(220, 38, 38, 0.12)" : "transparent",
        borderColor: isListening ? "#dc2626" : "currentColor",
        color: isListening ? "#dc2626" : "inherit",
      }}
    >
      {children || (isListening ? "Stop listening" : "Voice input")}
    </button>
  );
}
