import type { ReactNode } from "react";
import type { TemplateDef, FieldValues } from "../templates/schema";
import { sp, FONT } from "../theme";
import { FrameProvider, useFramePlayer, PlayerControls } from "./AnimationPlayer";

export interface MediaItem {
  id: string;
  src: string;
  alt: string;
}

export type MediaType = "image" | "video";

/** Media frame size from the design (node 5909:69156). */
const MEDIA_W = 360;
const MEDIA_H = 646;

/**
 * Compositions are authored at their full canvas size (1080x1920) using
 * absolute pixel units — 100px type, a 260px badge. They must therefore be
 * rendered at that native size and scaled down to the preview frame, exactly as
 * a video player would. Dropping them into a 360px box unscaled renders them
 * roughly 3x too large.
 */
function ScaledComposition({
  template,
  fieldValues,
  frame,
}: {
  template: TemplateDef;
  fieldValues: FieldValues;
  frame: number;
}) {
  // Cover the frame, so no letterboxing shows through against the photo.
  const scale = Math.max(MEDIA_W / template.width, MEDIA_H / template.height);

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
        >
          <template.component inputProps={fieldValues} />
        </FrameProvider>
      </div>
    </div>
  );
}

/** The 360x646 media frame: photo underneath, template overlay on top. */
function MediaFrame({ media, children }: { media: MediaItem; children?: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: `${MEDIA_W}px`,
        height: `${MEDIA_H}px`,
        flexShrink: 0,
        borderRadius: "4px",
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
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        display: "flex",
        alignItems: "flex-end",
        padding: "20px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          borderRadius: "4px",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        }}
      >
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontFamily: FONT, margin: 0 }}>
          Select a template to overlay on this image
        </p>
      </div>
    </div>
  );
}

/** Video posts: the composition plays, with a transport bar below the frame. */
function VideoPreview({
  media,
  template,
  fieldValues,
}: {
  media: MediaItem;
  template: TemplateDef;
  fieldValues: FieldValues;
}) {
  const { frame, playing, toggle, restart, seek } = useFramePlayer({
    durationInFrames: template.durationInFrames,
    fps: template.fps,
    loop: true,
  });

  return (
    <MediaFrame media={media}>
      <ScaledComposition template={template} fieldValues={fieldValues} frame={frame} />
      <PlayerControls
        frame={frame}
        playing={playing}
        durationInFrames={template.durationInFrames}
        fps={template.fps}
        onToggle={toggle}
        onRestart={restart}
        onSeek={seek}
      />
    </MediaFrame>
  );
}

/**
 * Center column. The media is contained at 360x646 as in the design — not
 * full-bleed.
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // Centred rather than padded: the content card's 1px border leaves 676px
        // of inner height against a 646px frame, so a fixed 16px padding would
        // overflow by 2px and introduce a scrollbar.
        justifyContent: "center",
        background: sp.white,
        overflow: "hidden",
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
        <MediaFrame media={media}>
          {template ? (
            // Image posts hold the last frame, where every interpolation has
            // settled, giving the finished composed look.
            <ScaledComposition
              key={template.id}
              template={template}
              fieldValues={fieldValues}
              frame={template.durationInFrames - 1}
            />
          ) : (
            <EmptyState />
          )}
        </MediaFrame>
      )}
    </div>
  );
}
