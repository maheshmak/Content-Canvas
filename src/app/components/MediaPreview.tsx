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

/** Media frame width from the design (node 5918:69156); height fills the column. */
const MEDIA_W = 360;

/**
 * Compositions are authored on their full export canvas (1080x1920) in absolute
 * pixels — 100px type, a 260px badge. They must render at that native size and
 * be scaled to the preview frame, the way a video player does. Dropping them in
 * unscaled renders them roughly 3x oversized.
 *
 * The frame's height comes from flex layout, so the scale is measured rather
 * than assumed — that keeps the overlay correct when the modal is clamped on a
 * short viewport.
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

/** Measures its own box so the overlay can be scaled to it. */
function MediaFrame({
  media,
  render,
}: {
  media: MediaItem;
  render?: (size: { w: number; h: number }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: `${MEDIA_W}px`,
        flex: 1,
        minHeight: 0,
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
      {render?.({ w: size.w, h: size.h })}
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
    <MediaFrame
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
        <MediaFrame
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
