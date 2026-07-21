import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import type { ReactNode } from "react";

/**
 * Animation style. Applied to the normalised progress inside every
 * interpolation, so one setting restyles a whole template without any
 * composition needing to know about it.
 */
export type EasingName = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "bouncy";

export const EASING_OPTIONS: { value: EasingName; label: string }[] = [
  { value: "ease-out", label: "Ease out" },
  { value: "ease-in", label: "Ease in" },
  { value: "ease-in-out", label: "Ease in out" },
  { value: "bouncy", label: "Bouncy" },
  { value: "linear", label: "Linear" },
];

const BACK = 1.70158;

export const EASINGS: Record<EasingName, (t: number) => number> = {
  "linear": (t) => t,
  "ease-in": (t) => t * t * t,
  "ease-out": (t) => 1 - Math.pow(1 - t, 3),
  "ease-in-out": (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  // Overshoots past 1 before settling — the "bouncy" feel.
  "bouncy": (t) => 1 + (BACK + 1) * Math.pow(t - 1, 3) + BACK * Math.pow(t - 1, 2),
};

interface FrameContextValue {
  frame: number;
  fps: number;
  width: number;
  height: number;
  easing: EasingName;
}

const FrameContext = createContext<FrameContextValue>({
  frame: 0,
  fps: 30,
  width: 1080,
  height: 1920,
  easing: "ease-out",
});

export function useCurrentFrame(): number {
  return useContext(FrameContext).frame;
}

export function useVideoConfig() {
  const { fps, width, height } = useContext(FrameContext);
  return { fps, width, height };
}

/**
 * Supplies the current frame to a composition. Compositions are pure functions
 * of this frame, so the same provider drives both a still (image posts, held at
 * a fixed frame) and playback (video posts).
 */
export function FrameProvider({
  frame,
  fps,
  width,
  height,
  easing,
  children,
}: FrameContextValue & { children: ReactNode }) {
  return (
    <FrameContext.Provider value={{ frame, fps, width, height, easing }}>
      {children}
    </FrameContext.Provider>
  );
}

/**
 * Piecewise linear interpolation across an arbitrary number of stops.
 *
 * Multi-point ranges matter: several compositions describe a there-and-back
 * pulse as `interpolate(frame % 60, [0, 30, 60], [1, 1.06, 1])`. A two-point
 * implementation silently drops the third stop and clamps at the peak, so the
 * pulse ramps up and sticks instead of easing back.
 */
export type Interpolate = (
  frame: number,
  inputRange: number[],
  outputRange: number[],
  options?: { extrapolateLeft?: "clamp" | "extend"; extrapolateRight?: "clamp" | "extend" }
) => number;

/**
 * Returns an `interpolate` bound to the template's animation style.
 *
 * Compositions call this instead of importing `interpolate` directly, so
 * changing the style field restyles every animation in the template without a
 * single call site changing shape.
 */
export function useInterpolate(): Interpolate {
  const { easing } = useContext(FrameContext);
  const ease = EASINGS[easing] ?? EASINGS["ease-out"];
  return (frame, inputRange, outputRange, options) =>
    interpolate(frame, inputRange, outputRange, { ...options, ease });
}

export function interpolate(
  frame: number,
  inputRange: number[],
  outputRange: number[],
  options?: {
    extrapolateLeft?: "clamp" | "extend";
    extrapolateRight?: "clamp" | "extend";
    ease?: (t: number) => number;
  }
): number {
  if (inputRange.length < 2 || inputRange.length !== outputRange.length) {
    throw new Error("interpolate: inputRange and outputRange must be the same length (>= 2)");
  }

  const extrapolateLeft = options?.extrapolateLeft ?? "clamp";
  const extrapolateRight = options?.extrapolateRight ?? "clamp";
  const last = inputRange.length - 1;

  if (frame <= inputRange[0]) {
    if (frame === inputRange[0] || extrapolateLeft === "clamp") return outputRange[0];
    const t = (frame - inputRange[0]) / (inputRange[1] - inputRange[0]);
    return outputRange[0] + (outputRange[1] - outputRange[0]) * t;
  }

  if (frame >= inputRange[last]) {
    if (frame === inputRange[last] || extrapolateRight === "clamp") return outputRange[last];
    const t = (frame - inputRange[last - 1]) / (inputRange[last] - inputRange[last - 1]);
    return outputRange[last - 1] + (outputRange[last] - outputRange[last - 1]) * t;
  }

  const ease = options?.ease;
  for (let i = 0; i < last; i++) {
    if (frame >= inputRange[i] && frame <= inputRange[i + 1]) {
      const span = inputRange[i + 1] - inputRange[i];
      const t = span === 0 ? 0 : (frame - inputRange[i]) / span;
      const eased = ease ? ease(t) : t;
      return outputRange[i] + (outputRange[i + 1] - outputRange[i]) * eased;
    }
  }

  return outputRange[last];
}

/**
 * Drives a frame counter off requestAnimationFrame.
 *
 * Note rAF is throttled to zero in a backgrounded tab, so playback only
 * advances while the page is actually visible.
 */
export function useFramePlayer({
  durationInFrames,
  fps,
  loop = true,
  enabled = true,
}: {
  durationInFrames: number;
  fps: number;
  loop?: boolean;
  enabled?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const playingRef = useRef(true);

  useEffect(() => { playingRef.current = playing; }, [playing]);

  const tick = useCallback((now: number) => {
    if (!playingRef.current) return;
    if (lastTimeRef.current === null) lastTimeRef.current = now;
    const elapsed = now - lastTimeRef.current;
    const frameDuration = 1000 / fps;
    if (elapsed >= frameDuration) {
      const framesToAdvance = Math.floor(elapsed / frameDuration);
      lastTimeRef.current = now - (elapsed % frameDuration);
      frameRef.current += framesToAdvance;
      if (frameRef.current >= durationInFrames) {
        if (loop) {
          frameRef.current = frameRef.current % durationInFrames;
        } else {
          frameRef.current = durationInFrames - 1;
          setPlaying(false);
        }
      }
      setFrame(frameRef.current);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [fps, durationInFrames, loop]);

  useEffect(() => {
    if (enabled && playing) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, playing, tick]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const restart = useCallback(() => {
    frameRef.current = 0;
    setFrame(0);
    lastTimeRef.current = null;
    setPlaying(true);
  }, []);

  const seek = useCallback((f: number) => {
    frameRef.current = f;
    setFrame(f);
    lastTimeRef.current = null;
    setPlaying(false);
  }, []);

  return { frame, playing, toggle, restart, seek };
}
