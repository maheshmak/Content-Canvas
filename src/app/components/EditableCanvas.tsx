import { useRef, useState, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import type { TemplateDef, TemplateState, Align } from "../templates/schema";
import { SAFE_X, SAFE_Y } from "../templates/schema";
import { sp } from "../theme";
import { LayerCanvas } from "./LayerCanvas";
import { Scrim, scrimRegion } from "./layout";

/**
 * The canvas as a place to work, rather than a preview to look at.
 *
 * Click an element to select it, drag it anywhere, double-click text to type
 * into it. This is only possible because layers are data: positions are known
 * without measuring, so hit-testing, dragging and outlining all reduce to
 * reading and writing `x/y/align`.
 *
 * Rendered without Remotion, at a settled frame. A playing composition is
 * rendered video frames and nothing in it is clickable, which is why edit and
 * play are separate modes rather than one surface.
 */

/** How close (in normalised units) a drag must get before it snaps. */
const SNAP = 0.03;

/** Snap targets: the safe margins and the centre lines. */
const SNAP_X: { v: number; align: Align }[] = [
  { v: SAFE_X, align: "left" },
  { v: 0.5, align: "center" },
  { v: 1 - SAFE_X, align: "right" },
];
const SNAP_Y = [SAFE_Y, 0.5, 1 - SAFE_Y];

interface DragState {
  id: string;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
}

export function EditableCanvas({
  template,
  state,
  boxW,
  selectedId,
  onSelect,
  onMove,
  onEditText,
}: {
  template: TemplateDef;
  state: TemplateState;
  boxW: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number, align: Align) => void;
  onEditText: (key: string, value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const scale = boxW / template.width;
  // Everything has animated in by the last frame, so the canvas shows the
  // finished composition rather than a half-played one.
  const frame = template.durationInFrames - 1;

  const layerRect = useCallback((id: string) => {
    const container = containerRef.current;
    const el = container?.querySelector<HTMLElement>(`[data-layer-id="${id}"]`);
    if (!container || !el) return null;
    const c = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { left: r.left - c.left, top: r.top - c.top, width: r.width, height: r.height };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-layer-id]");
      if (!target) {
        onSelect(null);
        setEditingId(null);
        return;
      }
      const id = target.dataset.layerId!;
      const current = state.layers[id];
      if (!current) return;

      onSelect(id);
      // Capture keeps the drag alive if the pointer leaves the canvas, but it
      // throws for any pointer id the browser doesn't recognise. Losing capture
      // degrades the drag; losing the drag entirely is worse.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* not a live pointer — drag still works, just without capture */
      }
      setDrag({
        id,
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        startX: current.x,
        startY: current.y,
      });
    },
    [onSelect, state.layers],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      const dx = (e.clientX - drag.startPointerX) / scale / template.width;
      const dy = (e.clientY - drag.startPointerY) / scale / template.height;

      let x = clamp(drag.startX + dx, 0, 1);
      let y = clamp(drag.startY + dy, 0, 1);
      let align = state.layers[drag.id]?.align ?? "left";
      const shown: { x?: number; y?: number } = {};

      // Snap, so tidy placement is easy without making exact placement
      // impossible — release outside the pull radius and it stays put.
      const nearX = SNAP_X.find((s) => Math.abs(x - s.v) < SNAP);
      if (nearX) {
        x = nearX.v;
        align = nearX.align;
        shown.x = nearX.v;
      }
      const nearY = SNAP_Y.find((v) => Math.abs(y - v) < SNAP);
      if (nearY !== undefined) {
        y = nearY;
        shown.y = nearY;
      }

      setGuides(shown);
      onMove(drag.id, x, y, align);
    },
    [drag, onMove, scale, state.layers, template.width, template.height],
  );

  const endDrag = useCallback(() => {
    setDrag(null);
    setGuides({});
  }, []);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-layer-id]");
      if (!target) return;
      const id = target.dataset.layerId!;
      const layer = template.layers.find((l) => l.id === id);
      if (layer?.kind === "text" && layer.textKey) setEditingId(id);
    },
    [template.layers],
  );

  const selectedRect = selectedId ? layerRect(selectedId) : null;
  const editingLayer = editingId ? template.layers.find((l) => l.id === editingId) : null;
  const editingRect = editingId ? layerRect(editingId) : null;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={handleDoubleClick}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        overflow: "hidden",
        cursor: drag ? "grabbing" : "default",
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${template.width}px`,
          height: `${template.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {template.scrim ? <Scrim region={scrimRegion(state)} /> : null}
        <LayerCanvas
          template={template}
          state={state}
          frame={frame}
          width={template.width}
          height={template.height}
          interactive
        />
      </div>

      {/* Snap guides, only while they are doing something */}
      {guides.x !== undefined && <Guide style={{ left: `${guides.x * 100}%`, top: 0, bottom: 0, width: "1px" }} />}
      {guides.y !== undefined && <Guide style={{ top: `${guides.y * 100}%`, left: 0, right: 0, height: "1px" }} />}

      {/* Selection outline */}
      {selectedRect && !editingId && (
        <div
          style={{
            position: "absolute",
            left: selectedRect.left - 4,
            top: selectedRect.top - 4,
            width: selectedRect.width + 8,
            height: selectedRect.height + 8,
            border: `2px solid ${sp.blue}`,
            borderRadius: "3px",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Inline text editing, sized and coloured to match what it replaces */}
      {editingLayer?.textKey && editingRect && (
        <InlineEditor
          rect={editingRect}
          scale={scale}
          layerId={editingId!}
          container={containerRef.current}
          value={String(state.values[editingLayer.textKey] ?? "")}
          onChange={(v) => onEditText(editingLayer.textKey!, v)}
          onDone={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

function Guide({ style }: { style: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        background: sp.blue,
        opacity: 0.9,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

/**
 * Types where the text already is, at the size it renders, so the user is
 * editing the artwork rather than a form field that happens to affect it.
 */
function InlineEditor({
  rect,
  scale,
  layerId,
  container,
  value,
  onChange,
  onDone,
}: {
  rect: { left: number; top: number; width: number; height: number };
  scale: number;
  layerId: string;
  container: HTMLDivElement | null;
  value: string;
  onChange: (v: string) => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [font, setFont] = useState<CSSProperties>({});

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
    // Copy the real styling off the rendered layer so typing looks like the
    // result, rather than like a form field floating over it.
    //
    // Specifically the *styled* element, two levels down: the layer wrapper
    // holds position, its child holds the entrance animation, and only the
    // grandchild carries the type. Reading the wrapper gets inherited 16px.
    const el = container?.querySelector<HTMLElement>(`[data-layer-id="${layerId}"] > div > div`);
    if (!el) return;
    const cs = getComputedStyle(el);
    setFont({
      fontSize: `${parseFloat(cs.fontSize) * scale}px`,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight === "normal" ? "1.2" : `${parseFloat(cs.lineHeight) * scale}px`,
      color: cs.color,
      textAlign: cs.textAlign as CSSProperties["textAlign"],
      letterSpacing: cs.letterSpacing === "normal" ? undefined : `${parseFloat(cs.letterSpacing) * scale}px`,
    });
  }, [container, layerId, scale]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onDone}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onDone();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onDone();
        }
        // Stop the native event too, or the modal's window listener sees the
        // same Escape and closes everything mid-edit.
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
      style={{
        position: "absolute",
        left: rect.left - 6,
        top: rect.top - 6,
        width: rect.width + 12,
        height: rect.height + 12,
        padding: "2px 4px",
        margin: 0,
        border: `2px solid ${sp.blue}`,
        borderRadius: "3px",
        background: "rgba(0,0,0,0.55)",
        resize: "none",
        outline: "none",
        overflow: "hidden",
        ...font,
      }}
    />
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
