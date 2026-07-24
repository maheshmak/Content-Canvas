import type { TemplateDef, TemplateState } from "../templates/schema";
import { SAFE_X, SAFE_Y } from "../templates/schema";
import { FEEL_OPTIONS } from "./AnimationPlayer";
import type { SpringFeel } from "../templates/schema";

/**
 * Re-rolls the look into another good-looking combination.
 *
 * The point is to remove a decision, not to offer more of them. Someone with
 * ninety seconds between customers cannot evaluate a colour wheel, but they can
 * tap a button until they like what they see — so every possible result has to
 * be acceptable. A shuffle rolls a coordinated *look* — accent, motion feel and
 * shape family move together as one curated combination, never independently —
 * plus the group's placement. Three rules make every result acceptable:
 *
 *   1. Colours, feels and shape families come from a curated `LOOKS` table,
 *      never assembled from independent random picks that could clash.
 *   2. The group moves as a whole, preserving each element's offset from the
 *      others. The template's composition is the part that was designed; only
 *      where it sits changes.
 *   3. Shapes (pure decoration, no fixed meaning) are fair game to re-roll.
 *      Stickers (`OPEN NOW`, a discount %) carry the post's actual message, so
 *      shuffle never changes *which* sticker is showing — only its colour and
 *      placement, same as any other element.
 */

/** A curated shape family, so several shapes on one post read as one choice
 *  rather than a random assortment. */
const SHAPE_FAMILIES: string[][] = [
  ["circle", "squircle", "oval", "pill", "clamshell", "bun"],
  ["square", "triangle", "diamond", "pentagon", "hexagon", "gem", "slanted"],
  ["star", "burst", "soft-burst", "sunny", "very-sunny", "cookie-6", "cookie-9", "clover-4", "clover-8", "flower", "puffy", "boom", "soft-boom"],
];

/** A look = the handful of choices that have to agree with each other for a
 *  shuffle result to feel designed rather than assembled. */
interface Look {
  accent: string;
  family: string[];
  feel: SpringFeel;
}

const LOOKS: Look[] = [
  { accent: "#F5A623", family: SHAPE_FAMILIES[0], feel: "spatial" },
  { accent: "#FF6B35", family: SHAPE_FAMILIES[1], feel: "snappy" },
  { accent: "#8B5CF6", family: SHAPE_FAMILIES[2], feel: "spatial" },
  { accent: "#0EA5E9", family: SHAPE_FAMILIES[0], feel: "gentle" },
  { accent: "#10B981", family: SHAPE_FAMILIES[1], feel: "gentle" },
  { accent: "#EC4899", family: SHAPE_FAMILIES[2], feel: "snappy" },
  { accent: "#14B8A6", family: SHAPE_FAMILIES[0], feel: "spatial" },
  { accent: "#6366F1", family: SHAPE_FAMILIES[1], feel: "spatial" },
];

/** Extra horizontal variety for centre-anchored elements — a left/right-
 *  anchored element (Service Spotlight's price, say) already sits at its
 *  align's safe margin and stays there; this only nudges the elements that
 *  are free to move, so a shuffle isn't just "top or bottom" forever. Modest
 *  enough that even a full-width centred line stays inside the safe margins. */
const X_BIAS = [-0.08, 0, 0.08] as const;

function pickDifferent<T>(options: readonly T[], current: T): T {
  const others = options.filter((o) => o !== current);
  if (!others.length) return current;
  return others[Math.floor(Math.random() * others.length)];
}

export function shuffle(state: TemplateState, template: TemplateDef): TemplateState {
  const values = { ...state.values };

  const look = pickDifferent(
    LOOKS,
    LOOKS.find((l) => l.accent === state.values.accentColor) ?? LOOKS[0],
  );
  values.accentColor = look.accent;
  values.animationStyle = FEEL_OPTIONS.find((o) => o.value === look.feel)!.value;

  // Shapes are pure decoration — re-roll each to a different shape from the
  // look's family, so several on one post still read as one coordinated
  // choice. A shape's `color` is a role (accent/white/dark), not a hex, so an
  // "accent" shape already follows the new accent above with no touch needed.
  // Stickers keep their content; only colour/placement follow below.
  const extras = state.extras.map((extra) =>
    extra.kind === "shape" ? { ...extra, shapeId: pickDifferent(look.family, extra.shapeId) } : extra,
  );

  // Move the group, keeping its internal arrangement intact.
  const visible = Object.entries(state.layers).filter(([, l]) => l.visible);
  const layers = { ...state.layers };

  // A sticker's own curated variant, and a badge-text layer's own curated
  // frame, are as much "which shape is this" as the standalone shapes above —
  // re-roll them too so a shuffle covers every combination the template
  // offers, not just placement. Manually-set colour/text overrides are left
  // alone: those are the user's own choices, not part of the coordinated look.
  for (const layer of template.layers) {
    const current = layers[layer.id];
    if (!current) continue;
    if (layer.variants?.length) {
      const ids = layer.variants.map((v) => v.id);
      const from = current.variant ?? layer.defaultVariant ?? ids[0];
      layers[layer.id] = { ...current, variant: pickDifferent(ids, from) };
    }
    if (layer.frameVariants?.length) {
      const ids = layer.frameVariants.map((v) => v.id);
      const from = layers[layer.id].frameVariant ?? layer.defaultFrameVariant ?? ids[0];
      layers[layer.id] = { ...layers[layer.id], frameVariant: pickDifferent(ids, from) };
    }
  }

  if (visible.length) {
    // A template like Service Spotlight already has a header cluster near
    // the top and a footer cluster near the bottom — together they span
    // almost the whole canvas, so treating "every visible layer" as one
    // rigid block left the block's own height eating up nearly all the
    // headroom: "move to top" and "move to bottom" collapsed to nearly the
    // same position, which is what read as "shuffle does nothing." Splitting
    // by each layer's *authored* half (from the template, not the current,
    // already-shuffled position) keeps a header a header and a footer a
    // footer, and gives each cluster its own real room to move within its
    // own half.
    const clusters: Record<"top" | "bottom", [string, { x: number; y: number; align: string }][]> = {
      top: [],
      bottom: [],
    };
    for (const [id, ls] of visible) {
      const authoredY = template.layers.find((l) => l.id === id)?.position.y ?? ls.y;
      clusters[authoredY < 0.5 ? "top" : "bottom"].push([id, ls]);
    }

    for (const half of ["top", "bottom"] as const) {
      const members = clusters[half];
      if (!members.length) continue;

      const ys = members.map(([, l]) => l.y);
      const top = Math.min(...ys);
      const bottom = Math.max(...ys);
      const height = bottom - top;

      const candidates =
        half === "top"
          ? [SAFE_Y, Math.max(SAFE_Y, 0.5 - height - 0.04)]
          : [Math.min(1 - SAFE_Y - height, 0.5 + 0.04), 1 - SAFE_Y - height];

      const current = candidates.reduce((a, b) => (Math.abs(b - top) < Math.abs(a - top) ? b : a));
      const target = pickDifferent(candidates, current);
      const shift = target - top;

      for (const [id, layer] of members) {
        // Base off `layers[id]`, not the destructured `layer` — the sticker
        // variant/frame reroll above already wrote into `layers`, and
        // spreading the original pre-reroll object here would silently
        // discard it.
        layers[id] = { ...layers[id], y: clamp(layer.y + shift, SAFE_Y, 1 - SAFE_Y) };
      }
    }

    // Horizontal variety, on top of vertical: nudge centre-anchored elements
    // to a different bias so the group isn't always dead-centre — left- and
    // right-anchored elements keep their own alignment's margin untouched.
    const centerLayers = visible.filter(([, l]) => l.align === "center");
    if (centerLayers.length) {
      const currentBias = centerLayers[0][1].x - 0.5;
      const currentSnap = X_BIAS.reduce((a, b) => (Math.abs(b - currentBias) < Math.abs(a - currentBias) ? b : a));
      const nextBias = pickDifferent(X_BIAS, currentSnap);
      const xShift = nextBias - currentBias;
      for (const [id] of centerLayers) {
        layers[id] = { ...layers[id], x: clamp(layers[id].x + xShift, SAFE_X, 1 - SAFE_X) };
      }
    }
  }

  return { ...state, values, layers, extras };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
