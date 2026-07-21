import type { LayerRenderProps } from "./schema";
import { createInterpolate } from "../components/AnimationPlayer";

/**
 * Bespoke artwork for layers that aren't plain text.
 *
 * Each is a normal layer as far as the canvas is concerned — positioned,
 * selectable and draggable like everything else. Only its innards are custom.
 * Sizes are in 1080-wide canvas units.
 */

/** Star row for Star Rating. Stars pop in staggered. */
export function RatingRow({ values, accent, frame }: LayerRenderProps) {
  const interpolate = createInterpolate(values.animationStyle as string | undefined);
  const rating = Math.min(5, Math.max(1, Number(values.rating ?? 5)));

  return (
    <div style={{ display: "flex", gap: "14px" }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const delay = i * 7;
        const scale = interpolate(frame, [delay, delay + 12], [0, 1]);
        const opacity = interpolate(frame, [delay, delay + 8], [0, 1]);
        return (
          <div key={i} style={{ transform: `scale(${scale})`, opacity, display: "inline-flex" }}>
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill={i < rating ? accent : "none"}
              stroke={accent}
              strokeWidth="1.5"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

/** The round discount badge for Offer. Pulses gently once settled. */
export function DiscountBadge({ values, accent, frame }: LayerRenderProps) {
  const interpolate = createInterpolate(values.animationStyle as string | undefined);
  const discount = Number(values.discount ?? 30);
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.06, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "440px",
        height: "440px",
        borderRadius: "50%",
        background: accent,
        boxShadow: "0 16px 60px rgba(0,0,0,0.4)",
        transform: `scale(${pulse})`,
      }}
    >
      <div style={{ fontSize: "170px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{discount}%</div>
      <div style={{ fontSize: "62px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "8px" }}>
        OFF
      </div>
    </div>
  );
}

/** Map pin for Find Us. Bobs after it lands. */
export function MapPin({ values, accent, frame }: LayerRenderProps) {
  const interpolate = createInterpolate(values.animationStyle as string | undefined);
  const bob = frame > 28 ? interpolate(frame % 60, [0, 10, 20], [0, -10, 0]) : 0;

  return (
    <div style={{ transform: `translateY(${bob}px)` }}>
      <svg width="96" height="116" viewBox="0 0 40 48" fill="none">
        <path d="M20 0C9 0 0 9 0 20C0 34 20 48 20 48C20 48 40 34 40 20C40 9 31 0 20 0Z" fill={accent} />
        <circle cx="20" cy="20" r="8" fill="white" />
      </svg>
    </div>
  );
}

/** Numbered tip badge for Pro Tip. */
export function TipBadge({ values, accent, frame }: LayerRenderProps) {
  const interpolate = createInterpolate(values.animationStyle as string | undefined);
  const tipNumber = Number(values.tipNumber ?? 1);
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.07, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "200px",
        height: "200px",
        borderRadius: "28px",
        background: accent,
        boxShadow: `0 12px 40px ${accent}60`,
        transform: `scale(${pulse})`,
      }}
    >
      <div style={{ fontSize: "30px", fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "4px" }}>
        TIP
      </div>
      <div style={{ fontSize: "94px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>#{tipNumber}</div>
    </div>
  );
}

/**
 * Confetti for Grand Opening. Ambient, not a layer: it covers the whole canvas
 * and there is nothing meaningful to select or drag, so it stays out of the
 * layer list.
 */
export function Confetti({ values, accent, frame }: LayerRenderProps) {
  const interpolate = createInterpolate(values.animationStyle as string | undefined);
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    x: 5 + i * 4.75,
    delay: i * 2,
    color: [accent, "#FFD700", "#FF6B6B", "#4ECDC4", "#fff"][i % 5],
    size: 14 + (i % 5) * 7,
  }));

  return (
    <>
      {pieces.map((c, i) => {
        const y = interpolate(frame, [c.delay, c.delay + 55], [-5, 108]);
        const opacity = interpolate(frame, [c.delay, c.delay + 15], [0, 0.9]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              pointerEvents: "none",
              left: `${c.x}%`,
              top: `${y}%`,
              opacity,
              width: `${c.size}px`,
              height: `${c.size}px`,
              background: c.color,
              borderRadius: i % 3 === 0 ? "50%" : "2px",
              transform: `rotate(${frame * (i % 2 === 0 ? 4 : -3)}deg)`,
            }}
          />
        );
      })}
    </>
  );
}
