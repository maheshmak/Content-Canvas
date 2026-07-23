import type { TemplateState } from "../templates/schema";
import { SAFE_Y } from "../templates/schema";
import { EASING_OPTIONS, normalizeAnimationStyle } from "./AnimationPlayer";

/**
 * Re-rolls the look into another good-looking combination.
 *
 * The point is to remove a decision, not to offer more of them. Someone with
 * ninety seconds between customers cannot evaluate a colour wheel, but they can
 * tap a button until they like what they see — so every possible result has to
 * be acceptable. Two rules make that true:
 *
 *   1. Colours come from a curated palette, never random hex. Random colour is
 *      how you get illegible mustard type on a beige wall.
 *   2. The group moves as a whole, preserving each element's offset from the
 *      others. The template's composition is the part that was designed; only
 *      where it sits changes.
 */

/** Saturated enough to hold up over a photo, dark enough for white type on top. */
const PALETTE = [
  "#F5A623", // amber
  "#FF6B35", // orange
  "#E5484D", // red
  "#8B5CF6", // violet
  "#0EA5E9", // sky
  "#10B981", // emerald
  "#F59E0B", // gold
  "#EC4899", // pink
  "#14B8A6", // teal
  "#6366F1", // indigo
];

/** Where the whole group can sit. Middle is excluded — it covers the subject. */
const REGIONS = [
  { y: SAFE_Y, label: "top" },
  { y: 1 - SAFE_Y, label: "bottom" },
] as const;

function pickDifferent<T>(options: readonly T[], current: T): T {
  const others = options.filter((o) => o !== current);
  if (!others.length) return current;
  return others[Math.floor(Math.random() * others.length)];
}

export function shuffle(state: TemplateState): TemplateState {
  const values = { ...state.values };

  values.accentColor = pickDifferent(PALETTE, String(state.values.accentColor));
  values.animationStyle = pickDifferent(
    EASING_OPTIONS.map((o) => o.value),
    normalizeAnimationStyle(String(state.values.animationStyle)),
  );

  // Move the group, keeping its internal arrangement intact.
  const visible = Object.entries(state.layers).filter(([, l]) => l.visible);
  const layers = { ...state.layers };

  if (visible.length) {
    const ys = visible.map(([, l]) => l.y);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const height = bottom - top;

    const currentRegion = top < 0.4 ? "top" : "bottom";
    const target = pickDifferent(REGIONS, REGIONS.find((r) => r.label === currentRegion)!);

    // Anchor the group's leading edge to the target, so a tall group stays on
    // canvas rather than running off the bottom.
    const newTop = target.label === "top" ? SAFE_Y : 1 - SAFE_Y - height;
    const shift = newTop - top;

    for (const [id, layer] of visible) {
      layers[id] = { ...layer, y: clamp(layer.y + shift, SAFE_Y, 1 - SAFE_Y) };
    }
  }

  return { ...state, values, layers };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
