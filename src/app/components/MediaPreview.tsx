import type { TemplateDef, FieldValues } from "../templates/schema";
import { sp, FONT } from "../theme";
import { AnimationPlayer, StaticFrame } from "./AnimationPlayer";

export interface MediaItem {
  id: string;
  src: string;
  alt: string;
}

export type MediaType = "image" | "video";

/**
 * Center column. The media is *contained* at 360x646 as in the design — not
 * full-bleed. The photo sits underneath and the selected template renders as a
 * transparent overlay on top of it.
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
        justifyContent: "center",
        padding: "16px 0",
        background: sp.bg,
        overflow: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "360px",
          height: "646px",
          flexShrink: 0,
          borderRadius: "4px",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* 1. The photo */}
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

        {/* 2. Template overlay — transparent root, sits on top of the photo */}
        {template && (
          <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
            {mediaType === "image" ? (
              <StaticFrame
                key={template.id}
                frame={template.durationInFrames - 1}
                fps={template.fps}
                width={template.width}
                height={template.height}
              >
                <template.component inputProps={fieldValues} />
              </StaticFrame>
            ) : (
              <AnimationPlayer
                key={template.id}
                component={template.component}
                inputProps={fieldValues}
                durationInFrames={template.durationInFrames}
                fps={template.fps}
                compositionWidth={template.width}
                compositionHeight={template.height}
                loop
                controls
              />
            )}
          </div>
        )}

        {/* Empty state */}
        {!template && (
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
                borderRadius: "6px",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
              }}
            >
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontFamily: FONT, margin: 0 }}>
                Select a template to overlay on this image
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
