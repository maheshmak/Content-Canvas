import { useCurrentFrame, interpolate } from "../../components/AnimationPlayer";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function ProTipComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const tipNumber = Number(inputProps.tipNumber ?? 1);
  const tipText = String(inputProps.tipText ?? "Always use heat protectant before styling your hair");
  const ctaText = String(inputProps.ctaText ?? "Follow for more tips!");
  const accentColor = String(inputProps.accentColor ?? "#10B981");

  const badgeScale = interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textOpacity = interpolate(frame, [26, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textY = interpolate(frame, [26, 48], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [52, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.07, 1]);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>

      {/* Top-left badge */}
      <div
        className="absolute top-0 left-0"
        style={{
          padding: "28px 36px",
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          transformOrigin: "top left",
        }}
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "120px",
          height: "120px",
          borderRadius: "16px",
          background: accentColor,
          boxShadow: `0 12px 40px ${accentColor}60`,
          transform: `scale(${pulse})`,
        }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "2px" }}>TIP</div>
          <div style={{ fontSize: "56px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>#{tipNumber}</div>
        </div>
      </div>

      {/* Bottom overlay */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
          padding: "32px 40px 28px",
        }}
      >
        <div style={{ opacity: textOpacity, transform: `translateY(${textY}px)`, marginBottom: "20px" }}>
          <p style={{
            fontSize: "36px",
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1.45,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}>
            {tipText}
          </p>
        </div>

        <div style={{ opacity: ctaOpacity }}>
          <span style={{
            display: "inline-block",
            fontSize: "26px",
            fontWeight: 600,
            color: accentColor,
            padding: "8px 20px",
            borderRadius: "40px",
            border: `2px solid ${accentColor}`,
            background: `${accentColor}15`,
          }}>
            {ctaText}
          </span>
        </div>
      </div>
    </div>
  );
}
