import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { createInterpolate } from "../../components/AnimationPlayer";
import type { Interpolate } from "../../components/AnimationPlayer";
import { AnchoredStack, Scrim } from "../../components/layout";
import type { Anchor } from "../schema";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

function Star({
  filled,
  color,
  delay,
  frame,
  interpolate,
}: {
  filled: boolean;
  color: string;
  delay: number;
  frame: number;
  // Passed down rather than rebuilt here: the easing belongs to the template,
  // and createInterpolate needs inputProps, which a leaf component shouldn't see.
  interpolate: Interpolate;
}) {
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
  const interpolate = createInterpolate(inputProps.animationStyle as string | undefined);
  const { width, height } = useVideoConfig();
  const rating = Math.min(5, Math.max(1, Number(inputProps.rating ?? 5)));
  const reviewText = String(inputProps.reviewText ?? "Best haircut in town!");
  const customerName = String(inputProps.customerName ?? "Happy Customer");
  const accentColor = String(inputProps.accentColor ?? "#F5A623");
  const textAnchor = (inputProps.textAnchor as Anchor) ?? "bottom-left";

  const cardY = interpolate(frame, [5, 28], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reviewOpacity = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nameOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Scrim anchor={textAnchor} opacity={cardOpacity} />

      <AnchoredStack anchor={textAnchor} width={width} height={height} gap={28}>
        {/* eyebrow — the rating itself */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            opacity: cardOpacity,
            transform: `translateY(${cardY}px)`,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} filled={i < rating} color={accentColor} delay={i * 7} frame={frame} interpolate={interpolate} />
          ))}
        </div>

        {/* headline */}
        <p
          style={{
            margin: 0,
            fontSize: "64px",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.4,
            letterSpacing: "-0.2px",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            opacity: reviewOpacity,
            transform: `translateY(${cardY}px)`,
          }}
        >
          "{reviewText}"
        </p>

        {/* attribution */}
        <div style={{ opacity: nameOpacity, display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "56px", height: "4px", background: accentColor, borderRadius: "2px", flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "46px", fontWeight: 600, color: accentColor }}>{customerName}</p>
        </div>
      </AnchoredStack>
    </AbsoluteFill>
  );
}
