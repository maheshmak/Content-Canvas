import type { CSSProperties, ReactNode } from "react";
import type { Anchor } from "../templates/schema";

/**
 * Shared placement rules for every template.
 *
 * Before this existed, each composition hardcoded its own absolute positions —
 * the bottom band was consistent across all seven, but the eyebrow was
 * top-centre in three, top-left in three, and absent in one. Placement is now
 * declared as an Anchor and resolved here, so one rule governs every template
 * and new templates inherit it for free.
 */

/** Keep content clear of the canvas edges and platform UI overlays. */
export const SAFE_X = 0.075;
export const SAFE_Y = 0.055;

export function splitAnchor(anchor: Anchor): { v: "top" | "middle" | "bottom"; h: "left" | "center" | "right" } {
  const [v, h] = anchor.split("-") as ["top" | "middle" | "bottom", "left" | "center" | "right"];
  return { v, h };
}

const JUSTIFY = { top: "flex-start", middle: "center", bottom: "flex-end" } as const;
const ALIGN = { left: "flex-start", center: "center", right: "flex-end" } as const;
const TEXT_ALIGN = { left: "left", center: "center", right: "right" } as const;

/**
 * A darkening layer that follows the text block, so type stays legible against
 * whatever is behind it. Edge anchors get a gradient rising from that edge;
 * middle anchors get a soft band across the centre.
 */
export function Scrim({ anchor, opacity = 1 }: { anchor: Anchor; opacity?: number }) {
  const { v } = splitAnchor(anchor);

  const style: CSSProperties =
    v === "middle"
      ? {
          inset: 0,
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.62) 26%, rgba(0,0,0,0.62) 74%, transparent 100%)",
        }
      : v === "top"
        ? {
            top: 0,
            left: 0,
            right: 0,
            height: "58%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 48%, transparent 100%)",
          }
        : {
            bottom: 0,
            left: 0,
            right: 0,
            height: "58%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 48%, transparent 100%)",
          };

  return <div style={{ position: "absolute", pointerEvents: "none", opacity, ...style }} />;
}

/**
 * Positions the text block (eyebrow / headline / support / cta) at an anchor,
 * inside the safe margins. Children stack in reading order regardless of where
 * the block sits.
 */
export function AnchoredStack({
  anchor,
  width,
  height,
  gap = 0,
  children,
}: {
  anchor: Anchor;
  width: number;
  height: number;
  gap?: number;
  children: ReactNode;
}) {
  const { v, h } = splitAnchor(anchor);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: JUSTIFY[v],
        alignItems: ALIGN[h],
        textAlign: TEXT_ALIGN[h],
        padding: `${height * SAFE_Y}px ${width * SAFE_X}px`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Positions a single feature graphic — a discount badge, a map pin, a
 * before/after divider — independently of the text block, so it can be moved
 * off whatever matters in the photo.
 */
export function AnchoredItem({
  anchor,
  width,
  height,
  children,
  style,
}: {
  anchor: Anchor;
  width: number;
  height: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const { v, h } = splitAnchor(anchor);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: ALIGN[h],
        alignItems: JUSTIFY[v],
        padding: `${height * SAFE_Y}px ${width * SAFE_X}px`,
        pointerEvents: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
