import { useRef, useState, useLayoutEffect, useEffect } from "react";
import type { ReactNode } from "react";
import { Player, Thumbnail } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import type { TemplateDef, FieldValues } from "../templates/schema";
import { sp } from "../theme";

export interface MediaItem {
  id: string;
  src: string;
  alt: string;
}

export type MediaType = "image" | "video";

/**
 * Preview frame, matching the compositions' 9:16 canvas exactly.
 *
 * The design specifies 360x646, which is ~1% off 9:16 and would letterbox
 * inside the player. 360x640 is an exact match, so the preview is
 * pixel-for-pixel what will export. Six pixels, invisible.
 */
const MEDIA_W = 360;
const MEDIA_H = 640;

/**
 * Fits the media frame into whatever space the column has, at a fixed 9:16,
 * never larger than the design size.
 *
 * The edge rule this enforces: the frame shrinks *as a whole* on small
 * viewports instead of letting flex layout squash its height. A squashed box
 * changes the aspect ratio, which crops composition content that sits well
 * inside its own safe margins. Fixed ratio means nothing is ever clipped, and
 * the column's 16px padding stays intact at every size.
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

/** Wrapper holding the composition above the photo. */
const overlayStyle = {
  position: "absolute" as const,
  inset: 0,
  zIndex: 2,
};

type PlayerProps = React.ComponentProps<typeof Player>;

/**
 * Looping preview for video posts.
 *
 * Playback is started through the player ref rather than the `autoPlay` prop:
 * the modal opens without a user gesture, and `autoPlay` alone leaves the
 * player parked on frame 0. Re-runs when the template changes so a freshly
 * mounted player starts moving too.
 */
function LoopingPlayer(props: PlayerProps & { templateId: string }) {
  const ref = useRef<PlayerRef>(null);
  const { templateId, ...playerProps } = props;

  useEffect(() => {
    const player = ref.current;
    if (!player) return;

    // `autoPlay` alone, and even play() alone, can leave the player reporting
    // isPlaying:true while its clock stays pinned to frame 0 — the internal
    // loop never gets going. Seeking first reliably kicks it awake.
    const start = () => {
      player.seekTo(0);
      player.play();
    };
    start();

    // If the frame still hasn't moved shortly after, start it again: the modal
    // can mount while the tab is backgrounded, and the first attempt is lost.
    const check = window.setTimeout(() => {
      if (player.getCurrentFrame() === 0) start();
    }, 300);

    return () => window.clearTimeout(check);
  }, [templateId]);

  return <Player ref={ref} {...playerProps} loop controls={false} />;
}

/**
 * Center column (node 5909:68171): 16px padding, media centred at 360 wide.
 *
 * Remotion's Player and Thumbnail scale the 1080x1920 composition into the
 * frame themselves, so there is no manual transform maths here — they take the
 * composition's true dimensions and the box size, and do the fitting.
 */
export function MediaPreview({
  media,
  template,
  fieldValues,
  mediaType,
}: {
  media: MediaItem;
  template: TemplateDef | null;
  fieldValues: FieldValues;
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
          // No template selected: the photo alone. The prompt to pick one
          // lives in the Customize panel.
          if (!template) return null;
          const shared = {
            component: template.component,
            // Nested deliberately: Remotion spreads inputProps as the
            // component's props, and our compositions take a single
            // `inputProps` prop. Flattened in the layer-model phase, where the
            // prop type widens anyway.
            inputProps: { inputProps: fieldValues },
            durationInFrames: template.durationInFrames,
            fps: template.fps,
            compositionWidth: template.width,
            compositionHeight: template.height,
            // Transparent so the photo underneath shows through; Remotion's
            // default render background is opaque.
            style: { width: w, height: h, background: "transparent" },
          };
          return (
            <div style={overlayStyle}>
              {mediaType === "video" ? (
                <LoopingPlayer {...shared} key={template.id} templateId={template.id} />
              ) : (
                // Image posts hold the last frame, where every interpolation
                // has settled, giving the finished composed look.
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
