import { useCurrentFrame, interpolate } from "../../components/AnimationPlayer";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function ServiceHighlightComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const serviceName = String(inputProps.serviceName ?? "Classic Haircut");
  const price = String(inputProps.price ?? "$35");
  const description = String(inputProps.description ?? "Precision cut, wash & style included");
  const accentColor = String(inputProps.accentColor ?? "#0EA5E9");

  const barOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = interpolate(frame, [8, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nameY = interpolate(frame, [18, 40], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nameOpacity = interpolate(frame, [18, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const priceScale = interpolate(frame, [38, 56], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const priceOpacity = interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const descOpacity = interpolate(frame, [56, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>

      {/* Top label */}
      <div
        className="absolute top-0 left-0"
        style={{ padding: "28px 36px", opacity: labelOpacity }}
      >
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 16px",
          borderRadius: "4px",
          background: accentColor,
        }}>
          <div style={{ width: "4px", height: "18px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }} />
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff", letterSpacing: "3px" }}>FEATURED SERVICE</span>
        </div>
      </div>

      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: accentColor, opacity: barOpacity }}
      />

      {/* Bottom overlay */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
          padding: "36px 44px 32px",
          opacity: barOpacity,
        }}
      >
        <div style={{ opacity: nameOpacity, transform: `translateY(${nameY}px)`, marginBottom: "8px" }}>
          <h2 style={{ fontSize: "58px", fontWeight: 900, color: "#fff", lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            {serviceName}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "14px", opacity: priceOpacity, transform: `scale(${priceScale})`, transformOrigin: "left bottom" }}>
          <span style={{ fontSize: "80px", fontWeight: 900, color: accentColor, lineHeight: 1 }}>{price}</span>
        </div>

        <p style={{
          fontSize: "28px",
          fontWeight: 400,
          color: "rgba(255,255,255,0.72)",
          opacity: descOpacity,
          borderTop: `1px solid ${accentColor}40`,
          paddingTop: "12px",
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}
