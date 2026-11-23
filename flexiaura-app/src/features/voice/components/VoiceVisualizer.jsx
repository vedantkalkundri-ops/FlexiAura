export function VoiceVisualizer({ isActive = false, barCount = 5 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: 4,
        height: 24,
      }}
    >
      {Array.from({ length: barCount }).map((_, index) => {
        const height = isActive ? 8 + ((index * 7) % 16) : 6;

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              width: 4,
              height,
              borderRadius: 999,
              background: isActive ? "#dc2626" : "currentColor",
              opacity: isActive ? 1 : 0.3,
              transition: "height 180ms ease, opacity 180ms ease",
            }}
          />
        );
      })}
    </div>
  );
}
