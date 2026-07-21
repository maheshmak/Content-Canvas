import { useCurrentFrame, useInterpolate, useVideoConfig } from "../../components/AnimationPlayer";
import { AnchoredStack, Scrim, splitAnchor } from "../../components/layout";
import type { Anchor } from "../schema";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function ServiceHighlightComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const interpolate = useInterpolate();
  const { width, height } = useVideoConfig();
  const serviceName = String(inputProps.serviceName ?? "Classic Haircut");
  const price = String(inputProps.price ?? "$35");
  const description = String(inputProps.description ?? "Precision cut, wash & style included");
  const accentColor = String(inputProps.accentColor ?? "#0EA5E9");
  const textAnchor = (inputProps.textAnchor as Anchor) ?? "bottom-left";

  const barOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = interpolate(frame, [8, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nameY = interpolate(frame, [18, 40], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nameOpacity = interpolate(frame, [18, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const priceScale = interpolate(frame, [38, 56], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const priceOpacity = interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const descOpacity = interpolate(frame, [56, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // The accent rule hugs whichever edge the copy is aligned to.
  const { h } = splitAnchor(textAnchor);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>
      <Scrim anchor={textAnchor} opacity={barOpacity} />

      {h !== "center" && (
        <div
          className="absolute top-0 bottom-0"
          style={{
            [h]: 0,
            width: "10px",
            background: accentColor,
            opacity: barOpacity,
          }}
        />
      )}

      <AnchoredStack anchor={textAnchor} width={width} height={height} gap={18}>
        {/* eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            borderRadius: "6px",
            background: accentColor,
            opacity: labelOpacity,
          }}
        >
          <div style={{ width: "7px", height: "30px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }} />
          <span style={{ fontSize: "34px", fontWeight: 700, color: "#fff", letterSpacing: "5px" }}>FEATURED SERVICE</span>
        </div>

        {/* headline */}
        <h2
          style={{
            margin: 0,
            fontSize: "96px",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            opacity: nameOpacity,
            transform: `translateY(${nameY}px)`,
          }}
        >
          {serviceName}
        </h2>

        {/* support — the price */}
        <span
          style={{
            fontSize: "132px",
            fontWeight: 900,
            color: accentColor,
            lineHeight: 1,
            opacity: priceOpacity,
            transform: `scale(${priceScale})`,
          }}
        >
          {price}
        </span>

        {/* cta */}
        <p
          style={{
            margin: 0,
            fontSize: "46px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.72)",
            opacity: descOpacity,
            borderTop: `1px solid ${accentColor}40`,
            paddingTop: "18px",
          }}
        >
          {description}
        </p>
      </AnchoredStack>
    </div>
  );
}
