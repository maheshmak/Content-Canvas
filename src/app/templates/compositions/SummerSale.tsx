import { useCurrentFrame, interpolate, useVideoConfig } from "../../components/AnimationPlayer";
import { AnchoredStack, AnchoredItem, Scrim } from "../../components/layout";
import type { Anchor } from "../schema";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function SummerSaleComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const headline = String(inputProps.headline ?? "Summer Sale");
  const discount = Number(inputProps.discount ?? 30);
  const tagline = String(inputProps.tagline ?? "Limited time only — shop now!");
  const bgColor = String(inputProps.bgColor ?? "#FF6B35");
  const textAnchor = (inputProps.textAnchor as Anchor) ?? "bottom-left";
  const badgeAnchor = (inputProps.badgeAnchor as Anchor) ?? "middle-center";

  const badgeScale = interpolate(frame, [5, 28], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeOpacity = interpolate(frame, [5, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineOpacity = interpolate(frame, [28, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [28, 46], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [48, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.06, 1]);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>
      <Scrim anchor={textAnchor} opacity={headlineOpacity} />

      {/* Feature: the discount badge, placed independently of the copy. */}
      <AnchoredItem anchor={badgeAnchor} width={width} height={height}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "440px",
            height: "440px",
            borderRadius: "50%",
            background: bgColor,
            boxShadow: "0 16px 60px rgba(0,0,0,0.4)",
            opacity: badgeOpacity,
            transform: `scale(${badgeScale * pulse})`,
          }}
        >
          <div style={{ fontSize: "170px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{discount}%</div>
          <div style={{ fontSize: "62px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "8px" }}>OFF</div>
        </div>
      </AnchoredItem>

      <AnchoredStack anchor={textAnchor} width={width} height={height} gap={20}>
        {/* eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "14px 40px",
            borderRadius: "60px",
            background: bgColor,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            opacity: labelOpacity,
          }}
        >
          <p style={{ margin: 0, fontSize: "46px", fontWeight: 800, color: "#fff", letterSpacing: "5px" }}>
            FLASH SALE
          </p>
        </div>

        {/* headline */}
        <h2
          style={{
            margin: 0,
            fontSize: "104px",
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "1px",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
          }}
        >
          {headline}
        </h2>

        {/* support */}
        <p
          style={{
            margin: 0,
            fontSize: "52px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.85)",
            opacity: taglineOpacity,
          }}
        >
          {tagline}
        </p>
      </AnchoredStack>
    </div>
  );
}
