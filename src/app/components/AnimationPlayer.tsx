import { Easing, interpolate } from "remotion";

/**
 * How elements enter the frame — one choice for the whole template.
 *
 * Four options, each with a distinct feel. Names describe what you see, not
 * easing curves. Old saved values map forward through `normalizeAnimationStyle`.
 */
export type EasingName = "fade" | "slide-up" | "pop" | "bounce" | "zoom" | "none";

export const EASING_OPTIONS: { value: EasingName; label: string }[] = [
  { value: "fade", label: "Fade in" },
  { value: "slide-up", label: "Slide up" },
  { value: "pop", label: "Pop in" },
  { value: "bounce", label: "Bounce" },
  { value: "zoom", label: "Zoom" },
  { value: "none", label: "None" },
];

const KNOWN: EasingName[] = ["fade", "slide-up", "pop", "bounce", "zoom", "none"];

const LEGACY_STYLE_MAP: Record<string, EasingName> = {
  "smooth-rise": "slide-up",
  "quick-pop": "pop",
  "soft-fade": "fade",
  drift: "slide-up",
};

export function normalizeAnimationStyle(style: string | undefined): EasingName {
  if (style && KNOWN.includes(style as EasingName)) return style as EasingName;
  if (style && LEGACY_STYLE_MAP[style]) return LEGACY_STYLE_MAP[style];
  return DEFAULT_ANIMATION_STYLE;
}

const EASINGS: Record<Exclude<EasingName, "none">, (t: number) => number> = {
  fade: Easing.inOut(Easing.cubic),
  "slide-up": Easing.out(Easing.cubic),
  pop: Easing.out(Easing.back(2.4)),
  // A settle-with-overshoot for Bounce, and a firm ease-out for the Zoom reveal.
  bounce: Easing.out(Easing.back(3.2)),
  zoom: Easing.out(Easing.cubic),
};

export const DEFAULT_ANIMATION_STYLE: EasingName = "slide-up";

export type Interpolate = (
  frame: number,
  inputRange: number[],
  outputRange: number[],
  options?: { extrapolateLeft?: "clamp" | "extend"; extrapolateRight?: "clamp" | "extend" }
) => number;

export function createInterpolate(style: string | undefined): Interpolate {
  const name = normalizeAnimationStyle(style);
  const easing = name === "none" ? Easing.linear : EASINGS[name];
  return (frame, inputRange, outputRange, options) =>
    interpolate(frame, inputRange, outputRange, {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      ...options,
    });
}
