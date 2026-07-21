import { useCurrentFrame, interpolate, useVideoConfig } from "../../components/AnimationPlayer";
import { AnchoredStack, Scrim, splitAnchor, SAFE_X, SAFE_Y } from "../../components/layout";
import type { Anchor } from "../schema";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function TransformationComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const beforeLabel = String(inputProps.beforeLabel ?? "Before");
  const afterLabel = String(inputProps.afterLabel ?? "After");
  const resultText = String(inputProps.resultText ?? "See the difference!");
  const accentColor = String(inputProps.accentColor ?? "#27AE60");
  const textAnchor = (inputProps.textAnchor as Anchor) ?? "bottom-left";
  const labelAnchor = (inputProps.labelAnchor as Anchor) ?? "top-center";

  const beforeOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dividerX = interpolate(frame, [20, 60], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const afterOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arrowScale = interpolate(frame, [40, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bottomOpacity = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // The before/after pair is inherently a left-right split, so only the
  // vertical half of its anchor is meaningful.
  const { v: labelV } = splitAnchor(labelAnchor);
  const labelJustify = labelV === "top" ? "flex-start" : labelV === "bottom" ? "flex-end" : "center";

  const pill = {
    display: "inline-block",
    padding: "14px 34px",
    borderRadius: "10px",
  } as const;

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>
      <Scrim anchor={textAnchor} opacity={bottomOpacity} />

      {/* Feature: the wipe divider and its knob. */}
      <div
        className="absolute inset-y-0"
        style={{
          left: `${dividerX}%`,
          width: "4px",
          background: "#fff",
          boxShadow: "0 0 16px rgba(255,255,255,0.9)",
          opacity: afterOpacity,
        }}
      />
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: `${dividerX}%`,
          top: "50%",
          transform: `translate(-50%, -50%) scale(${arrowScale})`,
          width: "84px",
          height: "84px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          opacity: afterOpacity,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* Feature: the before/after label pair. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: labelJustify,
          justifyContent: "space-between",
          padding: `${height * SAFE_Y}px ${width * SAFE_X}px`,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            ...pill,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.2)",
            opacity: beforeOpacity,
          }}
        >
          <p style={{ margin: 0, fontSize: "54px", fontWeight: 700, color: "#fff", letterSpacing: "3px" }}>{beforeLabel}</p>
        </div>
        <div
          style={{
            ...pill,
            background: accentColor,
            boxShadow: `0 4px 16px ${accentColor}60`,
            opacity: afterOpacity,
          }}
        >
          <p style={{ margin: 0, fontSize: "54px", fontWeight: 700, color: "#fff", letterSpacing: "3px" }}>{afterLabel}</p>
        </div>
      </div>

      <AnchoredStack anchor={textAnchor} width={width} height={height}>
        <p
          style={{
            margin: 0,
            fontSize: "68px",
            fontWeight: 700,
            color: accentColor,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            opacity: bottomOpacity,
          }}
        >
          {resultText}
        </p>
      </AnchoredStack>
    </div>
  );
}
