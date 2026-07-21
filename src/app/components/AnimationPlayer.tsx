import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import type { FC, ReactNode } from "react";
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

  // Below the first stop
  if (frame <= inputRange[0]) {
    if (frame === inputRange[0] || extrapolateLeft === "clamp") return outputRange[0];
    const t = (frame - inputRange[0]) / (inputRange[1] - inputRange[0]);
    return outputRange[0] + (outputRange[1] - outputRange[0]) * t;
  }

  // Above the last stop
  if (frame >= inputRange[last]) {
    if (frame === inputRange[last] || extrapolateRight === "clamp") return outputRange[last];
    const t = (frame - inputRange[last - 1]) / (inputRange[last] - inputRange[last - 1]);
    return outputRange[last - 1] + (outputRange[last] - outputRange[last - 1]) * t;
  }

  // Find the containing segment
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
 * Renders a composition at one fixed frame, with no animation loop and no
 * controls — this is what an *image* post uses.
 *
 * Compositions interpolate with `extrapolateRight: "clamp"`, so holding the
 * last frame gives the fully settled layout. Nothing in the compositions needs
 * to change to support this.
 */
export function StaticFrame({
  frame,
  fps,
  width,
  height,
  children,
}: {
  frame: number;
  fps: number;
  width: number;
  height: number;
  children: ReactNode;
}) {
  return (
    <FrameContext.Provider value={{ frame, fps, width, height }}>
      <div className="w-full h-full">{children}</div>
    </FrameContext.Provider>
  );
}

interface AnimationPlayerProps {
  component: FC<{ inputProps: Record<string, string | number> }>;
  inputProps: Record<string, string | number>;
  durationInFrames: number;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
  loop?: boolean;
  controls?: boolean;
}

export function AnimationPlayer({
  component: Component,
  inputProps,
  durationInFrames,
  fps,
  compositionWidth,
  compositionHeight,
  loop = true,
  controls = true,
}: AnimationPlayerProps) {
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
    if (playing) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, tick]);

  const togglePlay = () => setPlaying((p) => !p);
  const restart = () => {
    frameRef.current = 0;
    setFrame(0);
    lastTimeRef.current = null;
    setPlaying(true);
  };

  const scrubTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = parseInt(e.target.value);
    frameRef.current = f;
    setFrame(f);
    lastTimeRef.current = null;
  };

  const progress = frame / (durationInFrames - 1);
  const currentTime = (frame / fps).toFixed(1);
  const totalTime = (durationInFrames / fps).toFixed(1);

  return (
    <div className="flex flex-col h-full">
      {/* Composition viewport — transparent so the photo shows through */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div className="absolute inset-0">
          <FrameContext.Provider
            value={{ frame, fps, width: compositionWidth, height: compositionHeight }}
          >
            <div className="w-full h-full">
              <Component inputProps={inputProps} />
            </div>
          </FrameContext.Provider>
        </div>
      </div>

      {/* Controls */}
      {controls && (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 8px",
            borderRadius: "6px",
            background: sp.white,
            border: `1px solid ${sp.borderPrimary}`,
            marginTop: "6px",
          }}
        >
          <button
            onClick={togglePlay}
            style={{
              flexShrink: 0,
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              border: "none",
              background: sp.blue,
              cursor: "pointer",
            }}
          >
            {playing
              ? <Pause size={12} style={{ color: "#fff" }} />
              : <Play size={12} style={{ color: "#fff" }} />}
          </button>
          <button
            onClick={restart}
            style={{
              flexShrink: 0,
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              border: `1px solid ${sp.borderPrimary}`,
              background: "none",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={11} style={{ color: sp.textTertiary }} />
          </button>

          {/* Scrubber */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="range"
              min={0}
              max={durationInFrames - 1}
              value={frame}
              onChange={scrubTo}
              onMouseDown={() => setPlaying(false)}
              style={{
                flex: 1,
                height: "3px",
                appearance: "none",
                cursor: "pointer",
                borderRadius: "2px",
                background: `linear-gradient(to right, ${sp.blue} ${progress * 100}%, ${sp.track} ${progress * 100}%)`,
                accentColor: sp.blue,
                outline: "none",
              }}
            />
            <span style={{ color: sp.textTertiary, minWidth: "52px", textAlign: "right", fontSize: "11px", fontVariantNumeric: "tabular-nums" }}>
              {currentTime}s / {totalTime}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
