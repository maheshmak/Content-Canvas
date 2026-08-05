import { useState, useCallback, useEffect } from "react";
import type { Align, ColorRole, ExtraLayer, MotionType, SpringFeel, TemplateDef, TemplateState, TextOverrides, PostCopy } from "../templates/schema";
import { getDefaults, canHide, newExtraId } from "../templates/schema";
import { shuffle } from "./shuffle";
import { BADGES } from "./badges";
import { STICKER_REGISTRY, stickerComponentId } from "../templates/art";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { CloseIcon } from "./icons";
import { IconButton } from "./IconButton";
import { IconRail } from "./IconRail";
import type { EditorTab } from "./IconRail";
import { TemplatePanel } from "./TemplatePanel";
import { ElementsPanel } from "./ElementsPanel";
import { CustomizePanel } from "./CustomizePanel";
import { MediaStage } from "./MediaPreview";
import type { MediaItem, MediaType } from "./MediaPreview";

interface Props {
  media: MediaItem;
  mediaType: MediaType;
  /** Copy the AI already wrote for this post; bound into layers via `source`. */
  post?: PostCopy;
  onClose: () => void;
  onSave: (template: TemplateDef | null, state: TemplateState) => void;
}

/** Placeholder for a rail tab whose browse-and-insert page isn't built yet —
 *  shared by Text and Shape until each gets its real content. */
function ComingSoonPanel({ label, body }: { label: string; body: string }) {
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
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", width: "100%", height: "32px", flexShrink: 0 }}>
        <TabLabel>{label}</TabLabel>
      </div>
      <p style={{ margin: 0, padding: "0 8px", fontFamily: FONT, fontSize: "14px", lineHeight: "18px", color: sp.textTertiary }}>
        {body}
      </p>
    </div>
  );
}

function clampUnit(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function EditMediaModal({ media, post, onClose, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>("templates");
  const [template, setTemplate] = useState<TemplateDef | null>(null);
  const [state, setState] = useState<TemplateState>({ values: {}, layers: {}, extras: [] });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Escape is progressive: it clears a selection before it closes the modal,
    // so it never throws away work when the user meant "deselect".
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedId) setSelectedId(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, selectedId]);

  const handleSelect = useCallback((t: TemplateDef) => {
    setTemplate(t);
    // Post copy flows in here, so the user never meets a blank box.
    setState(getDefaults(t, post));
    // Nothing selected — picking a template is its own decision, not also a
    // decision about which element to edit. Landing on an element already
    // selected made Customize look like it required drilling into one
    // element before you could do anything, when the actual first move is
    // often just Shuffle a few times.
    setSelectedId(null);
  }, [post]);

  const handleSelectLayer = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleFieldChange = useCallback((key: string, value: string | number) => {
    setState((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }));
  }, []);

  const handleToggleLayer = useCallback((id: string) => {
    setState((prev) => {
      const layer = prev.layers[id];
      if (!layer) return prev;
      // A post can never be emptied: the last visible layer cannot be hidden.
      if (layer.visible && !canHide(prev)) return prev;
      return { ...prev, layers: { ...prev.layers, [id]: { ...layer, visible: !layer.visible } } };
    });
  }, []);

  const handleMove = useCallback((id: string, x: number, y: number, align: Align) => {
    setState((prev) => {
      if (prev.layers[id]) {
        return { ...prev, layers: { ...prev.layers, [id]: { ...prev.layers[id], x, y, align } } };
      }
      return { ...prev, extras: prev.extras.map((e) => (e.id === id ? { ...e, position: { x, y, align } } : e)) };
    });
  }, []);

  /** Set a text element's wrap width (normalised fraction of the canvas). */
  const handleResizeText = useCallback((id: string, textWidth: number) => {
    setState((prev) => {
      if (prev.layers[id]) {
        return { ...prev, layers: { ...prev.layers, [id]: { ...prev.layers[id], textWidth } } };
      }
      return {
        ...prev,
        extras: prev.extras.map((e) => (e.id === id && e.kind === "text" ? { ...e, textWidth } : e)),
      };
    });
  }, []);

  /** The typography knobs layered on top of a text element's base treatment.
   *  Every call site passes only the keys it means to change (an
   *  explicit `undefined` clears one back to the treatment's own value), so a
   *  plain merge is enough — no need to distinguish "omitted" from "cleared". */
  const handleSetTextOverrides = useCallback((id: string, patch: Partial<TextOverrides>) => {
    setState((prev) => {
      const layer = prev.layers[id];
      if (layer) {
        return { ...prev, layers: { ...prev.layers, [id]: { ...layer, overrides: { ...layer.overrides, ...patch } } } };
      }
      return {
        ...prev,
        extras: prev.extras.map((e) =>
          e.id === id && (e.kind === "text" || e.kind === "sticker")
            ? { ...e, overrides: { ...e.overrides, ...patch } }
            : e,
        ),
      };
    });
  }, []);

  /** Inline / panel edit of an added text element's own copy. */
  const handleEditExtraText = useCallback((id: string, text: string) => {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) => (e.id === id && e.kind === "text" ? { ...e, text } : e)),
    }));
  }, []);

  /** Which of a sticker's own curated variants to draw — a template layer,
   *  or a duplicated sticker extra. */
  const handleSetVariant = useCallback((id: string, variant: string) => {
    setState((prev) => {
      const layer = prev.layers[id];
      if (layer) return { ...prev, layers: { ...prev.layers, [id]: { ...layer, variant } } };
      return {
        ...prev,
        extras: prev.extras.map((e) => (e.id === id && e.kind === "sticker" ? { ...e, variant } : e)),
      };
    });
  }, []);

  /** A duplicated sticker's own editable field (a discount %, a star count,
   *  a tip number) — independent of the original's value. */
  const handleSetStickerValue = useCallback((id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) => (e.id === id && e.kind === "sticker" ? { ...e, value } : e)),
    }));
  }, []);

  /** Which of a badge-text layer's own curated frames to draw — a template
   *  layer, or a duplicated chip-text extra. */
  const handleSetFrameVariant = useCallback((id: string, frameVariant: string) => {
    setState((prev) => {
      const layer = prev.layers[id];
      if (layer) return { ...prev, layers: { ...prev.layers, [id]: { ...layer, frameVariant } } };
      return {
        ...prev,
        extras: prev.extras.map((e) => (e.id === id && e.kind === "text" ? { ...e, frameVariant } : e)),
      };
    });
  }, []);

  /** A sticker's own colour, independent of the post's overall accent —
   *  a template layer, or a duplicated sticker extra. `undefined` clears it
   *  back to following the accent. */
  const handleSetColorOverride = useCallback((id: string, colorOverride: string | undefined) => {
    setState((prev) => {
      const layer = prev.layers[id];
      if (layer) return { ...prev, layers: { ...prev.layers, [id]: { ...layer, colorOverride } } };
      return {
        ...prev,
        extras: prev.extras.map((e) => (e.id === id && e.kind === "sticker" ? { ...e, colorOverride } : e)),
      };
    });
  }, []);

  /** An element's own spring feel, independent of the post's overall motion —
   *  a template layer, or any extra (text, badge, shape, sticker) — since
   *  motion is now a per-element choice rather than one post-wide setting.
   *  `undefined` clears it back to following the post's own motion. */
  const handleSetMotionFeel = useCallback((id: string, motionFeel: SpringFeel | undefined) => {
    setState((prev) => {
      const layer = prev.layers[id];
      if (layer) return { ...prev, layers: { ...prev.layers, [id]: { ...layer, motionFeel } } };
      return {
        ...prev,
        extras: prev.extras.map((e) => (e.id === id ? { ...e, motionFeel } : e)),
      };
    });
  }, []);

  /** An element's own entrance geometry (fade / slide up / pop), independent
   *  of the post's authored default. `undefined` clears it back to that. */
  const handleSetMotionType = useCallback((id: string, motionType: MotionType | undefined) => {
    setState((prev) => {
      const layer = prev.layers[id];
      if (layer) return { ...prev, layers: { ...prev.layers, [id]: { ...layer, motionType } } };
      return {
        ...prev,
        extras: prev.extras.map((e) => (e.id === id ? { ...e, motionType } : e)),
      };
    });
  }, []);

  /** Change which sticker an added badge shows — resets to the new sticker's
   *  own default value, since a discount % and a tip number aren't the same
   *  scale. */
  const handleSetBadge = useCallback((id: string, badgeId: string) => {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) =>
        e.id === id && e.kind === "badge"
          ? { ...e, badgeId, value: BADGES.find((b) => b.id === badgeId)?.valueField?.default, text: undefined }
          : e,
      ),
    }));
  }, []);

  /** A text badge's own words ("OPEN NOW" → "OPEN LATE"). */
  const handleSetBadgeText = useCallback((id: string, text: string) => {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) => (e.id === id && e.kind === "badge" ? { ...e, text } : e)),
    }));
  }, []);

  const handleSetBadgeValue = useCallback((id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) => (e.id === id && e.kind === "badge" ? { ...e, value } : e)),
    }));
  }, []);

  /** A badge extra's own colour, independent of the post's overall accent. */
  const handleSetBadgeColorOverride = useCallback((id: string, colorOverride: string | undefined) => {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) => (e.id === id && e.kind === "badge" ? { ...e, colorOverride } : e)),
    }));
  }, []);

  const handleSetBadgeTextColorOverride = useCallback((id: string, textColorOverride: string | undefined) => {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) => (e.id === id && e.kind === "badge" ? { ...e, textColorOverride } : e)),
    }));
  }, []);

  /** Change a standalone shape element's shape/colour. */
  const handleSetShape = useCallback((id: string, patch: { shapeId?: string; color?: ColorRole }) => {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) =>
        e.id === id && e.kind === "shape" ? { ...e, shapeId: patch.shapeId ?? e.shapeId, color: patch.color ?? e.color } : e,
      ),
    }));
  }, []);

  /** Copy a text layer / text or badge extra into a new, offset instance. */
  const handleDuplicate = useCallback((id: string) => {
    const newId = newExtraId();
    let created = false;
    setState((prev) => {
      const nudge = (p: { x: number; y: number; align: Align }) => ({ ...p, x: clampUnit(p.x + 0.04), y: clampUnit(p.y + 0.04) });

      const src = prev.extras.find((e) => e.id === id);
      if (src) {
        created = true;
        const copy: ExtraLayer = { ...src, id: newId, position: nudge(src.position) };
        return { ...prev, extras: [...prev.extras, copy] };
      }

      const layer = template?.layers.find((l) => l.id === id);
      const ls = prev.layers[id];
      if (layer && layer.kind === "text" && layer.textKey && ls) {
        created = true;
        const copy: ExtraLayer = {
          id: newId,
          kind: "text",
          text: String(prev.values[layer.textKey] ?? ""),
          // A chip's background/padding lives on its treatment, not its frame
          // variant — "headline" has neither, so a duplicated "Featured"
          // label rendered as bare white text with no box at all. "label" is
          // the registered treatment closest to the template's own bespoke
          // chip style (uppercase, accent-filled pill).
          styleId: layer.frameVariants ? "label" : "headline",
          textWidth: ls.textWidth,
          // A badge-style chip's shape is part of what it looks like — drop
          // this and a duplicated "Featured" label loses its background and
          // reads as plain text with nothing carried over.
          frameVariant: layer.frameVariants ? ls.frameVariant ?? layer.defaultFrameVariant : undefined,
          overrides: ls.overrides,
          position: nudge({ x: ls.x, y: ls.y, align: ls.align }),
          motion: layer.motion,
        };
        return { ...prev, extras: [...prev.extras, copy] };
      }
      if (layer && layer.kind === "custom" && layer.render && ls) {
        const componentId = stickerComponentId(layer.render);
        const reg = componentId ? STICKER_REGISTRY[componentId] : undefined;
        if (componentId && reg) {
          created = true;
          const copy: ExtraLayer = {
            id: newId,
            kind: "sticker",
            componentId,
            variant: ls.variant ?? layer.defaultVariant,
            colorOverride: ls.colorOverride,
            overrides: ls.overrides,
            value: reg.valuesKey ? Number(prev.values[reg.valuesKey] ?? reg.valueField?.default) : undefined,
            position: nudge({ x: ls.x, y: ls.y, align: ls.align }),
            motion: layer.motion,
          };
          return { ...prev, extras: [...prev.extras, copy] };
        }
      }
      return prev;
    });
    if (created) setSelectedId(newId);
  }, [template]);

  // Every "add X to the canvas" action drops the new extra in the same spot,
  // with the same entrance — centred, popping in. Shared here so the three
  // insert handlers below don't each restate it.
  const CENTERED_POP = { position: { x: 0.5, y: 0.5, align: "center" as const }, motion: { type: "pop" as const, delay: 0 } };

  /** Drop a badge onto the canvas, centred. Deliberately doesn't select the
   *  new element — adding one should feel like every other element: it lands
   *  on the canvas, and you click it there, same as anything already on the
   *  post, to open its own options. Auto-selecting made "add" and "select"
   *  the same click, a different interaction from how everything else works. */
  const handleAddBadge = useCallback((badgeId: string) => {
    const badge = BADGES.find((b) => b.id === badgeId);
    setState((prev) => ({
      ...prev,
      extras: [
        ...prev.extras,
        { id: newExtraId(), kind: "badge", badgeId, value: badge?.valueField?.default, ...CENTERED_POP },
      ],
    }));
  }, []);

  // Sticker insertion (handleAddSticker) is paused along with the Shape
  // tab's Stickers section — see ElementsPanel.tsx — until Phase 11 rebuilds
  // Offer/Location/Rating/Tip from real SVG source. `STICKER_REGISTRY` is
  // still used elsewhere (handleDuplicate, CustomizePanel).

  /** Drop a standalone shape onto the canvas, centred — same non-selecting
   *  behaviour as `handleAddBadge`. Accent colour and a mid-size default so
   *  it's immediately visible without needing to be resized first. */
  const handleAddShape = useCallback((shapeId: string) => {
    setState((prev) => ({
      ...prev,
      extras: [
        ...prev.extras,
        { id: newExtraId(), kind: "shape", shapeId, color: "accent", size: 0.28, ...CENTERED_POP },
      ],
    }));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.extras.some((e) => e.id === id)) return prev; // template layers hide, never delete
      return { ...prev, extras: prev.extras.filter((e) => e.id !== id) };
    });
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const handleShuffle = useCallback(() => {
    if (template) setState((prev) => shuffle(prev, template));
  }, [template]);

  const handleReset = useCallback(() => {
    if (template) {
      setState(getDefaults(template, post));
      setSelectedId(null);
    }
  }, [template, post]);

  const isDirty = template
    ? JSON.stringify(state) !== JSON.stringify(getDefaults(template, post))
    : false;

  // What a newly-inserted sticker/badge/shape renders in until the user picks
  // its own colour — same fallback chain CustomizePanel uses for the element
  // currently selected.
  const accent = String(state.values.accentColor ?? template?.previewColor ?? sp.textSecondary);

  const title = "Edit Media";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          // 48 rail + 240 templates + 520 preview + 320 customize + 32 inset
          width: "1160px",
          height: "800px",
          maxWidth: "100%",
          maxHeight: "100%",
          display: "flex",
          flexDirection: "column",
          background: sp.bg,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          fontFamily: FONT,
        }}
      >
        {/* ── Header (58px, 16px padding) ── */}
        <div
          style={{
            height: "58px",
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            padding: "16px",
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
            <TabLabel variant="header">{title}</TabLabel>
            <IconButton title="Close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        {/* ── Body: white radius-8 card, inset 16px ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 16px",
            width: "100%",
          }}
        >
          <div
            className="scroll-area"
            style={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              background: sp.white,
              borderRadius: "8px",
              overflowX: "auto",
              overflowY: "auto",
            }}
          >
            <IconRail active={activeTab} onChange={setActiveTab} />

            {activeTab === "templates" ? (
              <TemplatePanel activeTemplateId={template?.id ?? null} onSelect={handleSelect} />
            ) : activeTab === "shape" ? (
              <ElementsPanel
                template={template}
                accent={accent}
                onInsertBadge={handleAddBadge}
                onInsertShape={handleAddShape}
              />
            ) : (
              <ComingSoonPanel label="Text" body="Text layers are coming soon." />
            )}

            <MediaStage
              media={media}
              template={template}
              state={state}
              selectedId={selectedId}
              onSelect={handleSelectLayer}
              onMove={handleMove}
              onEditText={handleFieldChange}
              onEditExtraText={handleEditExtraText}
              onToggleLayer={handleToggleLayer}
              onResizeText={handleResizeText}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />

            {activeTab === "templates" && (
              <CustomizePanel
                template={template}
                state={state}
                selectedId={selectedId}
                onFieldChange={handleFieldChange}
                onSetTextOverrides={handleSetTextOverrides}
                onEditExtraText={handleEditExtraText}
                onSetShape={handleSetShape}
                onSetBadge={handleSetBadge}
                onSetBadgeValue={handleSetBadgeValue}
                onSetBadgeText={handleSetBadgeText}
                onSetBadgeColorOverride={handleSetBadgeColorOverride}
                onSetBadgeTextColorOverride={handleSetBadgeTextColorOverride}
                onSetVariant={handleSetVariant}
                onSetStickerValue={handleSetStickerValue}
                onSetFrameVariant={handleSetFrameVariant}
                onSetColorOverride={handleSetColorOverride}
                onSetMotionFeel={handleSetMotionFeel}
                onSetMotionType={handleSetMotionType}
                onReset={handleReset}
                onShuffle={handleShuffle}
                canReset={isDirty}
              />
            )}
          </div>
        </div>

        {/* ── Footer (64px) ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "16px",
            background: sp.bg,
          }}
        >
          <button
            type="button"
            disabled={!template}
            onClick={() => onSave(template, state)}
            style={{
              minWidth: "80px",
              height: "32px",
              padding: "0 16px",
              borderRadius: "2px",
              border: "none",
              background: template ? sp.blue : sp.blueDisabled,
              color: sp.white,
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "18px",
              fontFamily: FONT,
              cursor: template ? "pointer" : "not-allowed",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
