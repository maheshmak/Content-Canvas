import { useRef, useState, useLayoutEffect, useEffect } from "react";
import type { ReactNode } from "react";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import type { Align, TemplateDef, TemplateState } from "../templates/schema";
import { sp } from "../theme";
import { TemplateComposition } from "./TemplateComposition";
import { EditableCanvas } from "./EditableCanvas";
import { PencilIcon } from "./icons";

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
          data-frame
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
 * The centre column.
 *
 * The post's motion plays as soon as a template is chosen — the modal opens on
 * the finished thing, so the default is to watch it, not to be dropped into an
 * editor. Hovering the frame reveals a single "Edit" affordance; taking it
 * freezes the composition into the interactive canvas (a playing composition is
 * rendered video frames, so nothing in it is clickable — edit and play cannot
 * be the same surface). Clicking off the frame hands it back to playback. There
 * is no mode switch to hunt for; the surface itself offers the one next step.
 */

/** The hover-revealed way into edit mode, laid over the playing composition. */
function EditOverlay({ onEdit }: { onEdit: () => void }) {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        onClick={onEdit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: "40px",
          padding: "0 20px",
          borderRadius: "999px",
          border: "none",
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: "14px",
          fontFamily: "inherit",
          cursor: "pointer",
          opacity: hovering ? 1 : 0,
          transform: hovering ? "scale(1)" : "scale(0.96)",
          transition: "opacity 140ms, transform 140ms",
        }}
      >
        <PencilIcon /> Edit
      </button>
    </div>
  );
}

export function MediaStage({
  media,
  template,
  state,
  mediaType,
  playing,
  onPlayingChange,
  selectedId,
  onSelect,
  onMove,
  onEditText,
  onToggleLayer,
  onResizeText,
}: {
  media: MediaItem;
  template: TemplateDef | null;
  state: TemplateState;
  mediaType: MediaType;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number, align: Align) => void;
  onEditText: (key: string, value: string | number) => void;
  onToggleLayer: (id: string) => void;
  onResizeText: (id: string, textWidth: number) => void;
}) {
  const canPlay = Boolean(template) && mediaType === "video";

  // In edit mode, a click that lands off the frame — on the surrounding stage —
  // returns to playback. Clicks inside the frame belong to the canvas (select,
  // drag, deselect) and must not trigger it.
  const handleStagePointerDown = (e: React.PointerEvent) => {
    if (!playing && canPlay && !(e.target as HTMLElement).closest("[data-frame]")) {
      onPlayingChange(true);
    }
  };

  return (
    <div
      onPointerDown={handleStagePointerDown}
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
                boxH={h}
                selectedId={selectedId}
                onSelect={onSelect}
                onMove={onMove}
                onEditText={onEditText}
                onToggleLayer={onToggleLayer}
                onResizeText={onResizeText}
              />
            );
          }

          return (
            <>
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
              <EditOverlay onEdit={() => onPlayingChange(false)} />
            </>
          );
        }}
      />
    </div>
  );
}
