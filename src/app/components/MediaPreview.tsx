import { useRef, useState, useLayoutEffect, useEffect } from "react";
import type { ReactNode } from "react";
import { Player, Thumbnail } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import type { TemplateDef, TemplateState } from "../templates/schema";
import { sp } from "../theme";
import { TemplateComposition } from "./TemplateComposition";

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
export function FittedFrame({
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
 * it, with a re-check for the case where the modal mounts backgrounded.
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
 * Play mode only. Edit mode renders through EditableCanvas instead, because a
 * playing composition is rendered video frames and nothing in it is clickable.
 */
export function MediaPlayback({
  media,
  template,
  state,
  mediaType,
}: {
  media: MediaItem;
  template: TemplateDef | null;
  state: TemplateState;
  mediaType: MediaType;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "16px",
        background: sp.white,
      }}
    >
      <FittedFrame
        media={media}
        render={({ w, h }) => {
          if (!template) return null;
          const shared = {
            component: TemplateComposition,
            inputProps: { templateId: template.id, state },
            durationInFrames: template.durationInFrames,
            fps: template.fps,
            compositionWidth: template.width,
            compositionHeight: template.height,
            // Transparent so the photo underneath shows through.
            style: { width: w, height: h, background: "transparent" },
          };
          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
              {mediaType === "video" ? (
                <LoopingPlayer {...shared} key={template.id} restartKey={template.id} />
              ) : (
                <Thumbnail
                  {...shared}
                  key={template.id}
                  frameToDisplay={template.durationInFrames - 1}
                />
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
