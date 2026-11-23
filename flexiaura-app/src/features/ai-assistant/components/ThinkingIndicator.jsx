export function ThinkingIndicator({ label = "FlexiAura is thinking" }) {
  return (
    <div
      className="fa-thinking"
      role="status"
      aria-live="polite"
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <span>{label}</span>
      <span aria-hidden="true" className="fa-thinking-dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}
