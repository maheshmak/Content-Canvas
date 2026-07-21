import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { sp } from "../theme";

interface FrameContextValue {
  frame: number;
  fps: number;
  width: number;
  height: number;
}

const FrameContext = createContext<FrameContextValue>({
  frame: 0,
  fps: 30,
  width: 1080,
  height: 1920,
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
  children,
}: FrameContextValue & { children: ReactNode }) {
  return (
    <FrameContext.Provider value={{ frame, fps, width, height }}>
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
export function interpolate(
  frame: number,
  inputRange: number[],
  outputRange: number[],
  options?: { extrapolateLeft?: "clamp" | "extend"; extrapolateRight?: "clamp" | "extend" }
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

  for (let i = 0; i < last; i++) {
    if (frame >= inputRange[i] && frame <= inputRange[i + 1]) {
      const span = inputRange[i + 1] - inputRange[i];
      const t = span === 0 ? 0 : (frame - inputRange[i]) / span;
      return outputRange[i] + (outputRange[i + 1] - outputRange[i]) * t;
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

/**
 * Transport bar. Overlaid on the bottom of the media frame rather than stacked
 * below it — the design pins the media at 360x646, and a stacked bar would push
 * past the 678px body. Rendered outside the scaled composition so it stays
 * legible at full size.
 */
export function PlayerControls({
  frame,
  playing,
  durationInFrames,
  fps,
  onToggle,
  onRestart,
  onSeek,
}: {
  frame: number;
  playing: boolean;
  durationInFrames: number;
  fps: number;
  onToggle: () => void;
  onRestart: () => void;
  onSeek: (f: number) => void;
}) {
  const progress = frame / (durationInFrames - 1);
  return (
    <div
      style={{
        position: "absolute",
        left: "8px",
        right: "8px",
        bottom: "8px",
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        borderRadius: "4px",
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(8px)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        title={playing ? "Pause" : "Play"}
        aria-label={playing ? "Pause" : "Play"}
        style={{
          flexShrink: 0, width: "28px", height: "28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "4px", border: "none", background: sp.blue, cursor: "pointer",
        }}
      >
        {playing ? <Pause size={12} color="#fff" /> : <Play size={12} color="#fff" />}
      </button>
      <button
        type="button"
        onClick={onRestart}
        title="Restart"
        aria-label="Restart"
        style={{
          flexShrink: 0, width: "28px", height: "28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "4px", border: "1px solid rgba(255,255,255,0.35)",
          background: "none", cursor: "pointer",
        }}
      >
        <RotateCcw size={11} color="rgba(255,255,255,0.9)" />
      </button>
      <input
        type="range"
        min={0}
        max={durationInFrames - 1}
        value={frame}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Seek"
        style={{
          flex: 1,
          minWidth: 0,
          height: "3px",
          appearance: "none",
          cursor: "pointer",
          borderRadius: "2px",
          background: `linear-gradient(to right, ${sp.blue} ${progress * 100}%, rgba(255,255,255,0.3) ${progress * 100}%)`,
          accentColor: sp.blue,
          outline: "none",
        }}
      />
      <span
        style={{
          color: "rgba(255,255,255,0.9)", fontSize: "11px",
          minWidth: "58px", textAlign: "right", fontVariantNumeric: "tabular-nums",
        }}
      >
        {(frame / fps).toFixed(1)}s / {(durationInFrames / fps).toFixed(1)}s
      </span>
    </div>
  );
}
