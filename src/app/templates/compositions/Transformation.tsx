import { useCurrentFrame, interpolate } from "../../components/AnimationPlayer";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function TransformationComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const beforeLabel = String(inputProps.beforeLabel ?? "Before");
  const afterLabel = String(inputProps.afterLabel ?? "After");
  const resultText = String(inputProps.resultText ?? "See the difference!");
  const accentColor = String(inputProps.accentColor ?? "#27AE60");

  // Left "Before" label fades in, then right "After" wipes in with a vertical divider
  const beforeOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dividerX = interpolate(frame, [20, 60], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const afterOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arrowScale = interpolate(frame, [40, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bottomOpacity = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>

      {/* Before label — top-left quadrant */}
      <div
        className="absolute top-0 left-0"
        style={{
          padding: "28px 32px",
          opacity: beforeOpacity,
        }}
      >
        <div style={{
          display: "inline-block",
          padding: "8px 20px",
          borderRadius: "6px",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}>
          <p style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "2px" }}>{beforeLabel}</p>
        </div>
      </div>

      {/* After label — reveals on the right */}
      <div
        className="absolute top-0 right-0"
        style={{
          padding: "28px 32px",
          opacity: afterOpacity,
        }}
      >
        <div style={{
          display: "inline-block",
          padding: "8px 20px",
          borderRadius: "6px",
          background: accentColor,
          boxShadow: `0 4px 16px ${accentColor}60`,
        }}>
          <p style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "2px" }}>{afterLabel}</p>
        </div>
      </div>

      {/* Vertical divider line */}
      <div
        className="absolute inset-y-0 w-0.5"
        style={{
          left: `${dividerX}%`,
          background: "#fff",
          boxShadow: "0 0 16px rgba(255,255,255,0.9)",
          opacity: afterOpacity,
        }}
      />

      {/* Arrow knob on the divider */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: `${dividerX}%`,
          top: "50%",
          transform: `translate(-50%, -50%) scale(${arrowScale})`,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          opacity: afterOpacity,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* Bottom result text */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          padding: "28px 40px",
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
          opacity: bottomOpacity,
        }}
      >
        <p style={{ fontSize: "40px", fontWeight: 700, color: accentColor, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {resultText}
        </p>
      </div>
    </div>
  );
}
