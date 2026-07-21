import { useCurrentFrame, interpolate } from "../../components/AnimationPlayer";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

function Star({ filled, color, delay, frame }: { filled: boolean; color: string; delay: number; frame: number }) {
  const scale = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ transform: `scale(${scale})`, opacity, display: "inline-flex" }}>
      <svg width="100" height="100" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    </div>
  );
}

export function StarRatingComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const rating = Math.min(5, Math.max(1, Number(inputProps.rating ?? 5)));
  const reviewText = String(inputProps.reviewText ?? "Best haircut in town!");
  const customerName = String(inputProps.customerName ?? "Happy Customer");
  const accentColor = String(inputProps.accentColor ?? "#F5A623");

  const cardY = interpolate(frame, [5, 28], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reviewOpacity = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nameOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    // Transparent root — photo shows through
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>
      {/* Bottom overlay card */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 60%, transparent 100%)",
          padding: "64px 56px 56px",
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
        }}
      >
        {/* Stars */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "28px" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} filled={i < rating} color={accentColor} delay={i * 7} frame={frame} />
          ))}
        </div>

        {/* Review text */}
        <div style={{ opacity: reviewOpacity, marginBottom: "28px" }}>
          <p style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.4,
            letterSpacing: "-0.2px",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}>
            "{reviewText}"
          </p>
        </div>

        {/* Divider + customer name */}
        <div style={{ opacity: nameOpacity, display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "56px", height: "4px", background: accentColor, borderRadius: "1px", flexShrink: 0 }} />
          <p style={{ fontSize: "46px", fontWeight: 600, color: accentColor }}>
            {customerName}
          </p>
        </div>
      </div>

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: cardOpacity,
        }}
      />
    </div>
  );
}
