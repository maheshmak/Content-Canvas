import type { CSSProperties } from "react";
import { sp, space } from "../theme";

/**
 * The loading card's border — a blue ring with a yellow band chasing round it.
 *
 * Two backgrounds on one element: a flat white fill clipped to the padding box,
 * and a conic gradient clipped to the border box. The border itself is
 * transparent, so the gradient shows only where the border is. The gradient's
 * start angle is `--cc-ring-angle`, a registered custom property that
 * `.cc-ring` (src/styles/index.css) animates through a full turn — which is
 * the only way to rotate a gradient without rotating the card with it.
 *
 * Spread onto a card whose resting look is a 1px border and `padding` of
 * padding (`space[16]` unless told otherwise). The ring is 2px, so the padding
 * gives one back: the card's outer size and its content stay exactly where
 * they were when the ring comes and goes, which matters because focus moves
 * along a row of equal-width cards.
 */
export const RING_CLASS = "cc-ring";

export function ringStyle(lit: boolean, padding: string = space[16]): CSSProperties {
  if (!lit) return { border: `1px solid ${sp.borderSub}`, padding };
  return {
    border: "2px solid transparent",
    padding: `calc(${padding} - 1px)`,
    background: `linear-gradient(${sp.white}, ${sp.white}) padding-box, conic-gradient(from var(--cc-ring-angle), #0f67ea 25%, #ffcb00, #0f67ea 90%, #0f67ea) border-box`,
    boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 10px",
  };
}
