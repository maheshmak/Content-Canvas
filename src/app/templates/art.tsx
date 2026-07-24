import { useId } from "react";
import type { CSSProperties, FC } from "react";
import type { LayerRenderProps, NumberField, TextOverrides, VariantOption } from "./schema";
import { createInterpolate } from "../components/AnimationPlayer";
import { shapePathD } from "../components/shapes";

/**
 * Bespoke artwork for layers that aren't plain text — stickers, in the split
 * this app draws between the two kinds of element a template can contain:
 * text (typography controls) and stickers (pre-composed content like a
 * rating, a pin, a badge). Each is a normal layer as far as the canvas is
 * concerned — positioned, selectable and draggable like everything else.
 *
 * Every sticker here owns a small, curated set of rendering variants — never
 * the general shape library. A star can be drawn outline, filled or bold; it
 * never becomes a hexagon. That is what keeps "customize this sticker" safe
 * to hand to someone who isn't a designer.
 *
 * Sizes are in 1080-wide canvas units.
 */

/** Applies typography overrides to a sticker's own internal text — the same
 *  idea as text elements' overrides, scoped to the one or two numbers/words a
 *  sticker shows. Only present keys apply. */
function applyTextOverrides(style: CSSProperties, ov?: TextOverrides): CSSProperties {
  if (!ov) return style;
  const next: CSSProperties = { ...style };
  if (ov.fontFamily) next.fontFamily = ov.fontFamily;
  if (ov.fontWeight) next.fontWeight = ov.fontWeight;
  if (ov.italic) next.fontStyle = "italic";
  if (ov.color) next.color = ov.color;
  if (ov.sizePct) {
    const base = parseFloat(String(style.fontSize ?? "")) || 0;
    if (base) next.fontSize = `${(base * ov.sizePct) / 100}px`;
  }
  return next;
}

export const RATING_VARIANTS: VariantOption[] = [
  { id: "outline", label: "Outline" },
  { id: "filled", label: "Filled" },
  { id: "bold", label: "Bold" },
  { id: "gradient", label: "Gradient" },
  { id: "soft", label: "Soft" },
];

/**
 * Star row for Star Rating. Stars pop in staggered.
 *
 * Each variant changes something structural — shape, stroke, or a genuine
 * two-colour fill — rather than a subtle opacity or shadow tweak. At the
 * size these render in a variant swatch, a faint drop-shadow or a 55%-opacity
 * gradient stop is invisible; a different outline weight, a different star
 * geometry, or a colour that visibly changes across the shape all still read
 * at a glance.
 */
export function RatingRow({ values, accent, frame, variant = "filled" }: LayerRenderProps) {
  const interpolate = createInterpolate(values.animationStyle as string | undefined);
  const rating = Math.min(5, Math.max(1, Number(values.rating ?? 5)));
  const gradId = useId();
  const starPath = shapePathD(variant === "soft" ? "star-soft" : "star");
  const softFill = `color-mix(in srgb, ${accent} 55%, white)`;

  return (
    <div style={{ display: "flex", gap: "14px" }}>
      {variant === "gradient" && (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={accent} />
            </linearGradient>
          </defs>
        </svg>
      )}
      {[0, 1, 2, 3, 4].map((i) => {
        const delay = i * 7;
        const scale = interpolate(frame, [delay, delay + 12], [0, 1]);
        const opacity = interpolate(frame, [delay, delay + 8], [0, 1]);
        const active = i < rating;
        const fill =
          variant === "outline"
            ? "none"
            : variant === "gradient"
              ? active
                ? `url(#${gradId})`
                : "rgba(255,255,255,0.25)"
              : variant === "soft"
                ? active
                  ? softFill
                  : "rgba(255,255,255,0.25)"
                : active
                  ? accent
                  : "rgba(255,255,255,0.25)";
        const strokeWidth = variant === "outline" ? 5 : variant === "bold" && active ? 9 : active ? 0 : 2;
        const stroke = variant === "bold" ? "rgba(0,0,0,0.55)" : accent;
        return (
          <div key={i} style={{ transform: `scale(${scale})`, opacity, display: "inline-flex" }}>
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin={variant === "soft" ? "round" : "miter"}
            >
              <path d={starPath} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export const BADGE_FRAME_VARIANTS: VariantOption[] = [
  { id: "circle", label: "Circle" },
  { id: "squircle", label: "Squircle" },
  { id: "hexagon", label: "Hexagon" },
  { id: "diamond", label: "Diamond" },
  { id: "octagon", label: "Octagon" },
];

/** Flat CSS clip-paths for the frames a plain border-radius can't make. */
const BADGE_CLIP: Record<string, string> = {
  hexagon: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  octagon: "polygon(29% 3%, 71% 3%, 97% 29%, 97% 71%, 71% 97%, 29% 97%, 3% 71%, 3% 29%)",
};

/**
 * How much inner padding each frame needs before its own text stops reading
 * as cramped against the edge. A circle's usable interior is nearly the full
 * box; a diamond tapers to a point on all four sides, so the same box leaves
 * far less room before a corner clips a letter. Padding alone isn't enough
 * for the pointiest frames though — the two-line "30% / OFF" block is tall
 * enough that most of it sits well away from a diamond's one full-width row
 * at dead centre, so `BADGE_TEXT_SCALE` below shrinks the type itself for
 * those shapes too. Padding still shrinks the available flex area on top of
 * that; the box stays the frame's own fixed size either way.
 */
const BADGE_INSET: Record<string, string> = {
  circle: "0px",
  squircle: "14px",
  hexagon: "30px",
  diamond: "30px",
  octagon: "22px",
};

/** How much to shrink the badge's own type, per frame — see `BADGE_INSET`. */
const BADGE_TEXT_SCALE: Record<string, number> = {
  circle: 1,
  squircle: 0.94,
  hexagon: 0.72,
  diamond: 0.46,
  octagon: 0.8,
};

/** The round discount badge for Offer. Pulses gently once settled. */
export function DiscountBadge({ values, accent, frame, variant = "circle", overrides }: LayerRenderProps) {
  const interpolate = createInterpolate(values.animationStyle as string | undefined);
  const discount = Number(values.discount ?? 30);
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.06, 1]);
  const clip = BADGE_CLIP[variant];
  const frameStyle: CSSProperties = clip ? { clipPath: clip } : { borderRadius: variant === "squircle" ? "22%" : "50%" };
  const textScale = BADGE_TEXT_SCALE[variant] ?? 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        width: "440px",
        height: "440px",
        padding: BADGE_INSET[variant] ?? "0px",
        background: accent,
        boxShadow: "0 16px 60px rgba(0,0,0,0.4)",
        transform: `scale(${pulse})`,
        ...frameStyle,
      }}
    >
      <div
        style={applyTextOverrides(
          { fontSize: `${170 * textScale}px`, fontWeight: 900, color: "#fff", lineHeight: 1 },
          overrides,
        )}
      >
        {discount}%
      </div>
      <div
        style={applyTextOverrides(
          { fontSize: `${62 * textScale}px`, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "8px" },
          overrides,
        )}
      >
        OFF
      </div>
    </div>
  );
}

export const PIN_VARIANTS: VariantOption[] = [
  { id: "classic", label: "Classic" },
  { id: "outline", label: "Outline" },
  { id: "bold", label: "Bold" },
  { id: "gradient", label: "Gradient" },
  { id: "ring", label: "Ring" },
];

/**
 * Map pin for Find Us. Bobs after it lands.
 *
 * Drawn from the shared "pin" shape rather than a hand-coded path — a pin is
 * a shape, not a sticker's fixed content; only the sticker's own variants are
 * exposed here, never the general shape library.
 */
export function MapPin({ values, accent, frame, variant = "classic" }: LayerRenderProps) {
  const interpolate = createInterpolate(values.animationStyle as string | undefined);
  const bob = frame > 28 ? interpolate(frame % 60, [0, 10, 20], [0, -10, 0]) : 0;
  const pinPath = shapePathD("pin");
  const gradId = useId();

  const fill = variant === "gradient" ? `url(#${gradId})` : variant === "outline" ? "white" : accent;

  return (
    <div style={{ transform: `translateY(${bob}px)` }}>
      <svg width="96" height="116" viewBox="0 0 100 100">
        {variant === "gradient" && (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={accent} />
            </linearGradient>
          </defs>
        )}
        <path
          d={pinPath}
          fill={fill}
          stroke={variant === "outline" ? accent : variant === "bold" ? "rgba(0,0,0,0.55)" : "none"}
          strokeWidth={variant === "outline" ? 4 : variant === "bold" ? 6 : 0}
        />
        {variant === "ring" ? (
          <circle cx="50" cy="38" r="10" fill="none" stroke="white" strokeWidth="5" />
        ) : (
          <circle cx="50" cy="38" r={variant === "bold" ? 14 : 10} fill={variant === "outline" ? accent : "white"} />
        )}
      </svg>
    </div>
  );
}

export const NUMBER_VARIANTS: VariantOption[] = [
  { id: "plain", label: "Plain" },
  { id: "circled", label: "Circled" },
  { id: "boxed", label: "Boxed" },
  { id: "diamond", label: "Diamond" },
  { id: "ringed", label: "Ringed" },
];

/**
 * The tip number, in the corner — bold and in the template's accent colour,
 * carrying a tip's identity without a caption chip.
 *
 * A near-transparent fill (as this once was) reads as "not rendered" more
 * often than it reads as "subtle": on a dark or high-contrast patch of photo
 * it can vanish entirely, and at a size that spans half the canvas it either
 * dominates the frame or is invisible — never both readable and restrained.
 * Solid colour with the same two-layer shadow every coloured style here uses
 * is legible on any photo at a size that reads as a corner badge, not a
 * watermark. The framed variants trade that for a small solid frame instead.
 */
export function TipNumeral({ values, accent, variant = "plain", overrides }: LayerRenderProps) {
  const tipNumber = Number(values.tipNumber ?? 1);

  if (variant === "plain") {
    return (
      <div
        style={applyTextOverrides(
          {
            fontSize: "220px",
            fontWeight: 900,
            lineHeight: 1,
            color: accent,
            textShadow: "0 1px 3px rgba(0,0,0,0.6), 0 4px 18px rgba(0,0,0,0.45)",
          },
          overrides,
        )}
      >
        {tipNumber}
      </div>
    );
  }

  if (variant === "ringed") {
    return (
      <div
        style={{
          width: "180px",
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: `8px solid ${accent}`,
        }}
      >
        <div style={applyTextOverrides({ fontSize: "110px", fontWeight: 900, lineHeight: 1, color: accent }, overrides)}>
          {tipNumber}
        </div>
      </div>
    );
  }

  const frameStyle: CSSProperties =
    variant === "diamond"
      ? { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }
      : { borderRadius: variant === "circled" ? "50%" : "22%" };
  // The diamond tapers to a point on all four sides — the same box a circle
  // or rounded square fills comfortably needs both a smaller digit and real
  // inset here, or the digit's corners graze the frame.
  const inset = variant === "diamond" ? "36px" : "0px";
  const digitScale = variant === "diamond" ? 0.78 : 1;

  return (
    <div
      style={{
        width: "180px",
        height: "180px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        padding: inset,
        background: accent,
        boxShadow: "0 10px 36px rgba(0,0,0,0.4)",
        ...frameStyle,
      }}
    >
      <div
        style={applyTextOverrides(
          { fontSize: `${110 * digitScale}px`, fontWeight: 900, lineHeight: 1, color: "#fff" },
          overrides,
        )}
      >
        {tipNumber}
      </div>
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

/**
 * Every built-in sticker, keyed by a stable string id rather than the
 * component reference itself — a duplicated sticker becomes a plain
 * `ExtraLayer` (see `newExtraId`/schema.ts) that must stay JSON-serialisable
 * like every other extra, so it stores this key and looks the component back
 * up here at render time instead of carrying a function around in state.
 *
 * `valuesKey` names the one field a sticker reads out of the post's
 * `values` (e.g. `rating`, `discount`) — a duplicate snapshots that into its
 * own `value` so the copy is independent, the same way duplicated text gets
 * its own copy of the string instead of staying bound to the original.
 */
export const STICKER_REGISTRY: Record<
  string,
  {
    render: FC<LayerRenderProps>;
    variants: VariantOption[];
    defaultVariant: string;
    hasInternalText?: boolean;
    valuesKey?: string;
    valueField?: Omit<NumberField, "key" | "type">;
    /** Matches the same component's `LayerDef.previewScale`, so a duplicated
     *  sticker's variant swatches are sized the same as the original's. */
    previewScale?: number;
  }
> = {
  rating: {
    render: RatingRow,
    variants: RATING_VARIANTS,
    defaultVariant: "filled",
    valuesKey: "rating",
    valueField: { label: "Stars", default: 5, min: 1, max: 5 },
  },
  "discount-badge": {
    render: DiscountBadge,
    variants: BADGE_FRAME_VARIANTS,
    defaultVariant: "circle",
    hasInternalText: true,
    valuesKey: "discount",
    valueField: { label: "Discount %", default: 30, min: 5, max: 90 },
    previewScale: 0.1,
  },
  pin: {
    render: MapPin,
    variants: PIN_VARIANTS,
    defaultVariant: "classic",
    previewScale: 0.5,
  },
  "tip-numeral": {
    render: TipNumeral,
    variants: NUMBER_VARIANTS,
    defaultVariant: "plain",
    hasInternalText: true,
    valuesKey: "tipNumber",
    valueField: { label: "Number", default: 1, min: 1, max: 9 },
    previewScale: 0.3,
  },
};

/** Reverse lookup — which registry entry a template layer's own `render`
 *  function corresponds to, so duplicating a built-in sticker layer can
 *  store the portable string id instead of the function. */
export function stickerComponentId(render: FC<LayerRenderProps>): string | undefined {
  return Object.keys(STICKER_REGISTRY).find((key) => STICKER_REGISTRY[key].render === render);
}
