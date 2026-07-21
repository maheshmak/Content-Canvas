import { useRef, useState, useLayoutEffect } from "react";
import type { ReactNode } from "react";
import type { TemplateDef, FieldValues } from "../templates/schema";
import { sp } from "../theme";
import { FrameProvider, useFramePlayer } from "./AnimationPlayer";
import type { EasingName } from "./AnimationPlayer";

export interface MediaItem {
  id: string;
  src: string;
  alt: string;
}

export type MediaType = "image" | "video";

/** Media frame size from the design (node 5918:69156). */
const MEDIA_W = 360;
const MEDIA_H = 646;

/**
 * Compositions are authored on their full export canvas (1080x1920) in absolute
 * pixels — 100px type, a 260px badge. They must render at that native size and
 * be scaled to the preview frame, the way a video player does.
 */
function ScaledComposition({
  template,
  fieldValues,
  frame,
  boxW,
  boxH,
}: {
  template: TemplateDef;
  fieldValues: FieldValues;
  frame: number;
  boxW: number;
  boxH: number;
}) {
  if (!boxW || !boxH) return null;
  const scale = Math.max(boxW / template.width, boxH / template.height);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 2 }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: `${template.width}px`,
          height: `${template.height}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <FrameProvider
          frame={frame}
          fps={template.fps}
          width={template.width}
          height={template.height}
          easing={(fieldValues.animationStyle as EasingName) ?? "ease-out"}
        >
          <template.component inputProps={fieldValues} />
        </FrameProvider>
      </div>
    </div>
  );
}

/**
 * Fits the media frame into whatever space the column has, at the design's
 * fixed 360:646 aspect ratio, never larger than 360x646.
 *
 * The edge rule this enforces: the frame shrinks *as a whole* on small
 * viewports instead of letting flex layout squash its height. A squashed box
 * changes the aspect ratio, and the cover-scaled overlay then crops the canvas
 * top and bottom — cutting through composition content that sits well inside
 * its own safe margins. Keeping the ratio fixed means cover-scale is exact-fit
 * and nothing is ever clipped; the column's 16px padding stays intact around
 * the frame at every size.
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

  // Largest 360:646 box that fits the available space, capped at design size.
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

/**
 * Video posts: the composition loops continuously. There is deliberately no
 * transport bar — it sat on top of the artwork and competed with it.
 */
function VideoPreview({
  media,
  template,
  fieldValues,
}: {
  media: MediaItem;
  template: TemplateDef;
  fieldValues: FieldValues;
}) {
  const { frame } = useFramePlayer({
    durationInFrames: template.durationInFrames,
    fps: template.fps,
    loop: true,
  });

  return (
    <FittedFrame
      media={media}
      render={({ w, h }) => (
        <ScaledComposition
          template={template}
          fieldValues={fieldValues}
          frame={frame}
          boxW={w}
          boxH={h}
        />
      )}
    />
  );
}

/** Center column (node 5909:68171): 16px padding, media centred at 360 wide. */
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
      {template && mediaType === "video" ? (
        <VideoPreview
          key={template.id}
          media={media}
          template={template}
          fieldValues={fieldValues}
        />
      ) : (
        <FittedFrame
          media={media}
          render={({ w, h }) =>
            template ? (
              // Image posts hold the last frame, where every interpolation has
              // settled, giving the finished composed look.
              <ScaledComposition
                key={template.id}
                template={template}
                fieldValues={fieldValues}
                frame={template.durationInFrames - 1}
                boxW={w}
                boxH={h}
              />
            ) : null
          }
        />
      )}
    </div>
  );
}
