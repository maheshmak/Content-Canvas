/**
 * Whether the user has asked the OS to reduce motion.
 *
 * Read at render rather than subscribed to: every caller uses it to decide
 * whether to *start* an animation, and someone changing the setting mid-run is
 * not a case worth a listener.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
