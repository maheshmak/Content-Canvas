import { useCurrentFrame, interpolate } from "../../components/AnimationPlayer";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function GrandOpeningComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const businessName = String(inputProps.businessName ?? "The Corner Cafe");
  const date = String(inputProps.date ?? "July 28, 2025");
  const message = String(inputProps.message ?? "Join us for our grand opening!");
  const accentColor = String(inputProps.accentColor ?? "#8B5CF6");

  const confetti = Array.from({ length: 20 }, (_, i) => ({
    x: 5 + i * 4.75,
    delay: i * 2,
    color: [accentColor, "#FFD700", "#FF6B6B", "#4ECDC4", "#fff"][i % 5],
    size: 8 + (i % 5) * 4,
  }));

  const overlayOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleScale = interpolate(frame, [12, 36], [0.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [12, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const msgOpacity = interpolate(frame, [36, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dateOpacity = interpolate(frame, [54, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>

      {/* Confetti particles */}
      {confetti.map((c, i) => {
        const y = interpolate(frame, [c.delay, c.delay + 55], [-5, 108], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const opacity = interpolate(frame, [c.delay, c.delay + 15], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${c.x}%`,
              top: `${y}%`,
              opacity,
              width: `${c.size}px`,
              height: `${c.size}px`,
              background: c.color,
              borderRadius: i % 3 === 0 ? "50%" : "2px",
              transform: `rotate(${frame * (i % 2 === 0 ? 4 : -3)}deg)`,
            }}
          />
        );
      })}

      {/* "NOW OPEN" top pill */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center"
        style={{ paddingTop: "28px", opacity: titleOpacity }}
      >
        <div style={{
          padding: "6px 24px",
          borderRadius: "60px",
          background: accentColor,
          boxShadow: `0 8px 32px ${accentColor}60`,
        }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "5px" }}>NOW OPEN</span>
        </div>
      </div>

      {/* Bottom content overlay */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
          padding: "36px 40px 32px",
          opacity: overlayOpacity,
        }}
      >
        <div style={{ transform: `scale(${titleScale})`, transformOrigin: "left bottom", opacity: titleOpacity, marginBottom: "10px" }}>
          <h1 style={{ fontSize: "60px", fontWeight: 900, color: "#fff", lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            {businessName}
          </h1>
        </div>

        <div style={{ opacity: msgOpacity, marginBottom: "16px" }}>
          <p style={{ fontSize: "30px", color: "rgba(255,255,255,0.82)", lineHeight: 1.4 }}>{message}</p>
        </div>

        <div style={{ opacity: dateOpacity }}>
          <span style={{
            display: "inline-block",
            padding: "8px 24px",
            borderRadius: "40px",
            background: accentColor,
            fontSize: "28px",
            fontWeight: 700,
            color: "#fff",
          }}>
            {date}
          </span>
        </div>
      </div>
    </div>
  );
}
