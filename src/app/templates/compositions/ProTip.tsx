import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { createInterpolate } from "../../components/AnimationPlayer";
import { AnchoredStack, AnchoredItem, Scrim } from "../../components/layout";
import type { Anchor } from "../schema";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function ProTipComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const interpolate = createInterpolate(inputProps.animationStyle as string | undefined);
  const { width, height } = useVideoConfig();
  const tipNumber = Number(inputProps.tipNumber ?? 1);
  const tipText = String(inputProps.tipText ?? "Always use heat protectant before styling your hair");
  const ctaText = String(inputProps.ctaText ?? "Follow for more tips!");
  const accentColor = String(inputProps.accentColor ?? "#10B981");
  const textAnchor = (inputProps.textAnchor as Anchor) ?? "bottom-left";
  const badgeAnchor = (inputProps.badgeAnchor as Anchor) ?? "top-left";

  const badgeScale = interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textOpacity = interpolate(frame, [26, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textY = interpolate(frame, [26, 48], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [52, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.07, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Scrim anchor={textAnchor} opacity={textOpacity} />

      {/* Feature: the numbered tip badge. */}
      <AnchoredItem anchor={badgeAnchor} width={width} height={height}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "200px",
            height: "200px",
            borderRadius: "28px",
            background: accentColor,
            boxShadow: `0 12px 40px ${accentColor}60`,
            opacity: badgeOpacity,
            transform: `scale(${badgeScale * pulse})`,
          }}
        >
          <div style={{ fontSize: "30px", fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "4px" }}>TIP</div>
          <div style={{ fontSize: "94px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>#{tipNumber}</div>
        </div>
      </AnchoredItem>

      <AnchoredStack anchor={textAnchor} width={width} height={height} gap={32}>
        {/* headline */}
        <p
          style={{
            margin: 0,
            fontSize: "60px",
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1.45,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          {tipText}
        </p>

        {/* cta */}
        <span
          style={{
            display: "inline-block",
            fontSize: "44px",
            fontWeight: 600,
            color: accentColor,
            padding: "14px 34px",
            borderRadius: "40px",
            border: `3px solid ${accentColor}`,
            background: `${accentColor}15`,
            opacity: ctaOpacity,
          }}
        >
          {ctaText}
        </span>
      </AnchoredStack>
    </AbsoluteFill>
  );
}
