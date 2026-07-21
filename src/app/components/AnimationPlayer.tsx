import { Easing, interpolate } from "remotion";

/**
 * Animation style, applied to every interpolation in a template.
 *
 * The frame clock, the player and `interpolate` itself now come from Remotion.
 * What remains here is the mapping from our user-facing style names onto
 * Remotion's easing curves, plus the factory that binds one to a template.
 */
export type EasingName = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "bouncy";

export const EASING_OPTIONS: { value: EasingName; label: string }[] = [
  { value: "ease-out", label: "Ease out" },
  { value: "ease-in", label: "Ease in" },
  { value: "ease-in-out", label: "Ease in out" },
  { value: "bouncy", label: "Bouncy" },
  { value: "linear", label: "Linear" },
];

const EASINGS: Record<EasingName, (t: number) => number> = {
  "linear": Easing.linear,
  "ease-in": Easing.in(Easing.cubic),
  "ease-out": Easing.out(Easing.cubic),
  "ease-in-out": Easing.inOut(Easing.cubic),
  // Overshoots past the target before settling — the "bouncy" feel.
  "bouncy": Easing.out(Easing.back(1.7)),
};

export type Interpolate = (
  frame: number,
  inputRange: number[],
  outputRange: number[],
  options?: { extrapolateLeft?: "clamp" | "extend"; extrapolateRight?: "clamp" | "extend" }
) => number;

/**
 * Returns an `interpolate` bound to a template's animation style, with the
 * clamping every composition wants by default.
 *
 * Remotion's `interpolate` is a plain function rather than a hook, so the style
 * cannot be injected through context the way it was before. Each composition
 * calls this once at the top instead — same ergonomics at the call sites, and
 * nothing composition-specific has to change when a new curve is added.
 */
export function createInterpolate(style: string | undefined): Interpolate {
  const easing = EASINGS[(style as EasingName) ?? "ease-out"] ?? EASINGS["ease-out"];
  return (frame, inputRange, outputRange, options) =>
    interpolate(frame, inputRange, outputRange, {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      ...options,
    });
}
