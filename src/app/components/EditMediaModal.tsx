import { useState, useCallback, useEffect } from "react";
import type { Align, TemplateDef, TemplateState, PostCopy } from "../templates/schema";
import { getDefaults, canHide } from "../templates/schema";
import { shuffle } from "./shuffle";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { CloseIcon } from "./icons";
import { IconButton } from "./IconButton";
import { IconRail } from "./IconRail";
import type { EditorTab } from "./IconRail";
import { TemplatePanel } from "./TemplatePanel";
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

/** Placeholder for the Text tab — not in scope this round. */
function TextPanel() {
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
        <TabLabel>Text</TabLabel>
      </div>
      <p style={{ margin: 0, padding: "0 8px", fontFamily: FONT, fontSize: "14px", lineHeight: "18px", color: sp.textTertiary }}>
        Text layers are not available yet.
      </p>
    </div>
  );
}

export function EditMediaModal({ media, mediaType, post, onClose, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>("templates");
  const [template, setTemplate] = useState<TemplateDef | null>(null);
  const [state, setState] = useState<TemplateState>({ values: {}, layers: {}, extras: [] });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

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
    setSelectedId(null);
    // The modal opens on finished media, so a chosen template plays its motion
    // straight away rather than dropping the user into an editor. Stills have
    // no motion to play, so they open ready to edit.
    setPlaying(mediaType === "video");
  }, [post, mediaType]);

  /** Returning to playback always clears the selection, so the canvas is never
   *  left showing a stale outline over a composition it can't interact with. */
  const handlePlayingChange = useCallback((p: boolean) => {
    setPlaying(p);
    if (p) setSelectedId(null);
  }, []);

  /** Selecting anything — on the canvas or from the panel list — means the user
   *  wants to work on it, so it drops out of playback into the editable canvas.
   *  A selection outline is meaningless over a running composition anyway. */
  const handleSelectLayer = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) setPlaying(false);
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
      const layer = prev.layers[id];
      if (!layer) return prev;
      return { ...prev, layers: { ...prev.layers, [id]: { ...layer, x, y, align } } };
    });
  }, []);

  /** Set a text layer's wrap width (normalised fraction of the canvas). */
  const handleResizeText = useCallback((id: string, textWidth: number) => {
    setState((prev) => {
      const layer = prev.layers[id];
      if (!layer) return prev;
      return { ...prev, layers: { ...prev.layers, [id]: { ...layer, textWidth } } };
    });
  }, []);

  const handleShuffle = useCallback(() => {
    if (template) setState((prev) => shuffle(prev));
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
              <TemplatePanel media={media} post={post} activeTemplateId={template?.id ?? null} onSelect={handleSelect} />
            ) : (
              <TextPanel />
            )}

            <MediaStage
              media={media}
              template={template}
              state={state}
              mediaType={mediaType}
              playing={playing}
              onPlayingChange={handlePlayingChange}
              selectedId={selectedId}
              onSelect={handleSelectLayer}
              onMove={handleMove}
              onEditText={handleFieldChange}
              onToggleLayer={handleToggleLayer}
              onResizeText={handleResizeText}
            />

            {activeTab === "templates" && (
              <CustomizePanel
                template={template}
                state={state}
                selectedId={selectedId}
                onSelect={handleSelectLayer}
                onFieldChange={handleFieldChange}
                onToggleLayer={handleToggleLayer}
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
