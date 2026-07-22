import { useRef, useState, useLayoutEffect, useEffect } from "react";
import type { ReactNode } from "react";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import type { Align, TemplateDef, TemplateState } from "../templates/schema";
import { sp } from "../theme";
import { TemplateComposition } from "./TemplateComposition";
import { EditableCanvas } from "./EditableCanvas";

export interface MediaItem {
  id: string;
  src: string;
  alt: string;
}

export type MediaType = "image" | "video";

/**
 * Preview frame, matching the compositions' 9:16 canvas exactly, so the preview
 * is pixel-for-pixel what will export.
 */
export const MEDIA_W = 360;
export const MEDIA_H = 640;

/**
 * Fits the media frame into the available space at a fixed 9:16, never larger
 * than the design size.
 *
 * The frame shrinks as a whole on small viewports rather than letting flex
 * squash its height — a squashed box changes the aspect ratio and crops content
 * that sits well inside its own safe margins.
 */
function FittedFrame({
  media,
  render,
}: {
  media: MediaItem;
  render?: (size: { w: number; h: number }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setAvail({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Belt and braces: some embedded environments fail to deliver RO callbacks
    // on viewport resize, which left the frame stuck at its old size.
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const w = Math.floor(Math.min(MEDIA_W, avail.w, (avail.h * MEDIA_W) / MEDIA_H));
  const h = Math.floor((w * MEDIA_H) / MEDIA_W);

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {w > 0 && h > 0 && (
        <div
          style={{
            position: "relative",
            width: `${w}px`,
            height: `${h}px`,
            flexShrink: 0,
            borderRadius: "8px",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <img
            src={media.src}
            alt={media.alt}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {render?.({ w, h })}
        </div>
      )}
    </div>
  );
}

type PlayerProps = React.ComponentProps<typeof Player>;

/**
 * Looping playback for Play mode.
 *
 * Playback starts through the player ref rather than `autoPlay`: the modal opens
 * without a user gesture, and autoPlay alone leaves the player reporting
 * isPlaying:true with its clock pinned to frame 0. Seeking first reliably starts
 * it, with a re-check for the case where it mounts backgrounded.
 */
function LoopingPlayer(props: PlayerProps & { restartKey: string }) {
  const ref = useRef<PlayerRef>(null);
  const { restartKey, ...playerProps } = props;

  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    const start = () => {
      player.seekTo(0);
      player.play();
    };
    start();
    const check = window.setTimeout(() => {
      if (player.getCurrentFrame() === 0) start();
    }, 300);
    return () => window.clearTimeout(check);
  }, [restartKey]);

  return <Player ref={ref} {...playerProps} loop controls={false} />;
}

/**
 * The centre column: an editable canvas by default, playback on demand.
 *
 * The two cannot be one surface — a playing composition is rendered video
 * frames, so nothing in it can be clicked or dragged. Editing therefore happens
 * on a static canvas and motion is previewed, which is how Canva and every
 * motion tool resolve the same constraint.
 */
export function MediaStage({
  media,
  template,
  state,
  mediaType,
  playing,
  onTogglePlay,
  selectedId,
  onSelect,
  onMove,
  onEditText,
}: {
  media: MediaItem;
  template: TemplateDef | null;
  state: TemplateState;
  mediaType: MediaType;
  playing: boolean;
  onTogglePlay: () => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number, align: Align) => void;
  onEditText: (key: string, value: string) => void;
}) {
  const canPlay = Boolean(template) && mediaType === "video";

  return (
    <div
      style={{
        flex: 1,
        // Never let the canvas collapse. The side panels are fixed width, so a
        // flexible centre column shrinks to nothing on a narrow viewport and the
        // media disappears — the card scrolls instead, which is the same
        // never-clip rule the frame itself follows.
        minWidth: `${MEDIA_W}px`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "16px",
        background: sp.white,
        position: "relative",
      }}
    >
      <FittedFrame
        media={media}
        render={({ w, h }) => {
          if (!template) return null;

          if (!playing) {
            return (
              <EditableCanvas
                template={template}
                state={state}
                boxW={w}
                selectedId={selectedId}
                onSelect={onSelect}
                onMove={onMove}
                onEditText={onEditText}
              />
            );
          }

          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
              <LoopingPlayer
                key={template.id}
                restartKey={template.id}
                component={TemplateComposition}
                inputProps={{ templateId: template.id, state }}
                durationInFrames={template.durationInFrames}
                fps={template.fps}
                compositionWidth={template.width}
                compositionHeight={template.height}
                // Transparent so the photo underneath shows through.
                style={{ width: w, height: h, background: "transparent" }}
              />
            </div>
          );
        }}
      />

      {canPlay && (
        <button
          type="button"
          onClick={onTogglePlay}
          title={playing ? "Back to editing" : "Preview the animation"}
          style={{
            position: "absolute",
            top: "26px",
            right: "26px",
            zIndex: 3,
            height: "32px",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            borderRadius: "80px",
            border: "none",
            background: "rgba(0,0,0,0.62)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontSize: "13px",
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {playing ? "■ Stop" : "▶ Play"}
        </button>
      )}
    </div>
  );
}
