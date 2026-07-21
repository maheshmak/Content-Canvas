import { useCurrentFrame, interpolate } from "../../components/AnimationPlayer";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function SummerSaleComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const headline = String(inputProps.headline ?? "Summer Sale");
  const discount = Number(inputProps.discount ?? 30);
  const tagline = String(inputProps.tagline ?? "Limited time only — shop now!");
  const bgColor = String(inputProps.bgColor ?? "#FF6B35");

  const badgeScale = interpolate(frame, [5, 28], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeOpacity = interpolate(frame, [5, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineOpacity = interpolate(frame, [28, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [28, 46], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [48, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.06, 1]);

  return (
    // Transparent root
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>

      {/* "FLASH SALE" pill — top center */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center"
        style={{ paddingTop: "48px", opacity: labelOpacity }}
      >
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "14px 40px",
          borderRadius: "60px",
          background: bgColor,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          <p style={{ fontSize: "46px", fontWeight: 800, color: "#fff", letterSpacing: "5px" }}>
            FLASH SALE
          </p>
        </div>
      </div>

      {/* Center badge */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
          pointerEvents: "none",
        }}
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "440px",
          height: "440px",
          borderRadius: "50%",
          background: bgColor,
          boxShadow: `0 16px 60px rgba(0,0,0,0.4)`,
          transform: `scale(${pulse})`,
        }}>
          <div style={{ fontSize: "170px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{discount}%</div>
          <div style={{ fontSize: "62px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "8px" }}>OFF</div>
        </div>
      </div>

      {/* Bottom overlay */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          padding: "48px 56px 48px",
        }}
      >
        <div style={{ opacity: headlineOpacity, transform: `translateY(${headlineY}px)`, marginBottom: "8px" }}>
          <h2 style={{ fontSize: "104px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "1px", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            {headline}
          </h2>
        </div>
        <div style={{ opacity: taglineOpacity }}>
          <p style={{ fontSize: "52px", fontWeight: 400, color: "rgba(255,255,255,0.85)" }}>{tagline}</p>
        </div>
      </div>
    </div>
  );
}
