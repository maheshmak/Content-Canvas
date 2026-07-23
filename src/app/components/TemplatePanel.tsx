import { useMemo } from "react";
import type { PostCopy, TemplateDef } from "../templates/schema";
import { getDefaults } from "../templates/schema";
import { templates } from "../templates/index";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { LayerCanvas } from "./LayerCanvas";
import { Scrim, scrimRegion } from "./layout";
import type { MediaItem } from "./MediaPreview";

/** Thumbnail canvas size — 2 columns in the 240px panel, at the 9:16 ratio. */
const THUMB_W = 100;
const THUMB_H = (THUMB_W * 1920) / 1080;

/**
 * A live preview of the template applied to this post's actual photo, rather
 * than an emoji and a name. Picking a visual treatment from a glance is a
 * different, faster decision than reading two words like "Pro Tip" — this is
 * the pattern GoDaddy Studio and Canva converge on for the same choice.
 */
function TemplateThumb({
  template,
  media,
  post,
  isActive,
  onSelect,
}: {
  template: TemplateDef;
  media: MediaItem;
  post: PostCopy | undefined;
  isActive: boolean;
  onSelect: () => void;
}) {
  // Rendered at the template's finished frame — the same still every template
  // row in the picker settles into once its entrance motion has played.
  const frame = template.durationInFrames - 1;
  const state = useMemo(() => getDefaults(template, post), [template, post]);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      title={template.name}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: 0,
        border: "none",
        background: "none",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${THUMB_W}px`,
          height: `${THUMB_H}px`,
          borderRadius: "4px",
          overflow: "hidden",
          border: `${isActive ? 2 : 1}px solid ${isActive ? sp.borderActive : sp.borderSub}`,
          background: "#000",
        }}
      >
        <img
          src={media.src}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${template.width}px`,
            height: `${template.height}px`,
            transform: `scale(${THUMB_W / template.width})`,
            transformOrigin: "top left",
          }}
        >
          {template.scrim ? <Scrim region={scrimRegion(state)} /> : null}
          <LayerCanvas template={template} state={state} frame={frame} width={template.width} height={template.height} />
        </div>
      </div>
      <span
        style={{
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 400,
          color: isActive ? sp.textPrimary : sp.textSecondary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {template.name}
      </span>
    </button>
  );
}

export function TemplatePanel({
  media,
  post,
  activeTemplateId,
  onSelect,
}: {
  media: MediaItem;
  post: PostCopy | undefined;
  activeTemplateId: string | null;
  onSelect: (template: TemplateDef) => void;
}) {
  return (
    <div
      style={{
        width: "240px",
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "8px",
        background: sp.white,
        borderRight: `1px solid ${sp.borderSub}`,
        overflow: "hidden",
      }}
    >
      {/* Header — the design's close control is opacity-0, so it is not shown. */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          width: "100%",
          height: "32px",
          flexShrink: 0,
        }}
      >
        <TabLabel>Templates</TabLabel>
      </div>

      <div
        className="scroll-area"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px 8px",
          alignContent: "start",
        }}
      >
        {templates.map((t) => (
          <TemplateThumb
            key={t.id}
            template={t}
            media={media}
            post={post}
            isActive={t.id === activeTemplateId}
            onSelect={() => onSelect(t)}
          />
        ))}
      </div>
    </div>
  );
}
