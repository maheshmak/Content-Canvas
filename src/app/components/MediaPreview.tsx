import { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { Align, TemplateDef, TemplateState } from "../templates/schema";
import { sp } from "../theme";
import { EditableCanvas } from "./EditableCanvas";

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
          data-frame
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
 * The centre column.
 *
 * The canvas is always editable — click, drag, type straight away. There is
 * no explicit Play/Pause control: playback is a gesture. Clicking any empty
 * area — the padding around the frame, or empty canvas inside it — toggles
 * playback; clicking an element always selects it (pausing first, if it was
 * playing). Play is real spring motion computed by the same renderer the
 * export uses, so what you preview is what you get.
 */

export function MediaStage({
  media,
  template,
  state,
  selectedId,
  onSelect,
  onMove,
  onEditText,
  onEditExtraText,
  onToggleLayer,
  onResizeText,
  onDuplicate,
  onDelete,
}: {
  media: MediaItem;
  template: TemplateDef | null;
  state: TemplateState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number, align: Align) => void;
  onEditText: (key: string, value: string | number) => void;
  onEditExtraText: (id: string, text: string) => void;
  onToggleLayer: (id: string) => void;
  onResizeText: (id: string, textWidth: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [previewFrame, setPreviewFrame] = useState<number | null>(null);
  const [soloId, setSoloId] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopPreview = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPreviewFrame(null);
    setSoloId(null);
  }, []);

  /** Loops indefinitely — the post plays on repeat until a click on the
   *  canvas interrupts it (`stopPreview`), never settling into a single
   *  static frame on its own. Pass `solo` to play only that one element's
   *  entrance while everything else stays on its settled frame — used for
   *  previewing a single element's own Motion change in isolation, rather
   *  than replaying the whole post around it. `startFrame` skips the loop
   *  ahead — soloing an element authored with a long stagger delay (it plays
   *  well after frame 0 in the full post) otherwise meant watching a long
   *  wait before anything happened; starting right at its own delay makes an
   *  edit read as instant regardless of where it sits in the original
   *  stagger. */
  const play = useCallback((solo?: string | null, startFrame = 0) => {
    if (!template) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const total = template.durationInFrames;
    const fps = template.fps;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.floor(((now - startedAt) / 1000) * fps);
      setPreviewFrame((elapsed + startFrame) % total);
      rafRef.current = requestAnimationFrame(tick);
    };
    setSoloId(solo ?? null);
    setPreviewFrame(startFrame % total);
    rafRef.current = requestAnimationFrame(tick);
  }, [template]);

  // Choosing a template plays its motion straight away, on a loop — the modal
  // opens on the finished thing, so the default is to watch it happen, not to
  // be dropped straight into a static editor. A stale RAF from the previous
  // template is stopped first so switching templates never ticks against old
  // data.
  useEffect(() => {
    stopPreview();
    if (template) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]);

  // Changing the Motion setting mid-loop should read as an immediate change,
  // not one that only shows up once the current cycle happens to wrap back to
  // frame 0. Restart the loop from frame 0 right away, but only while a
  // preview is actually running — a paused, settled frame has nothing to
  // instantly reflect.
  const isPreviewingRef = useRef(false);
  isPreviewingRef.current = previewFrame != null;
  useEffect(() => {
    if (isPreviewingRef.current) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.values.animationStyle]);

  // Motion is per-element now, and the edit canvas otherwise sits on the
  // settled last frame — an entrance already finished has nothing to show,
  // so picking a new Entrance or Feel for the selected element looked like
  // it did nothing. Unlike the post-wide restart above, this one plays even
  // from a paused state: there's no other way to see a per-element motion
  // change land. Only fires for an actual value change on the *same*
  // selection — switching to a different element (which naturally has a
  // different signature) must not itself trigger a replay. Solos the replay
  // to just that element: the rest of the post stays settled, so editing one
  // element's motion isn't a whole-canvas replay to watch for the one part
  // that changed.
  const selectedMotionSignature = (() => {
    if (!selectedId) return null;
    const ls = state.layers[selectedId];
    const extra = state.extras.find((e) => e.id === selectedId);
    return `${ls?.motionFeel ?? ""}|${ls?.motionType ?? ""}|${extra?.motionFeel ?? ""}|${extra?.motionType ?? ""}`;
  })();
  const prevMotionRef = useRef<{ id: string | null; signature: string | null }>({ id: null, signature: null });
  useEffect(() => {
    const prev = prevMotionRef.current;
    if (selectedId && prev.id === selectedId && prev.signature !== null && prev.signature !== selectedMotionSignature) {
      const delay = template?.layers.find((l) => l.id === selectedId)?.motion.delay
        ?? state.extras.find((e) => e.id === selectedId)?.motion.delay
        ?? 0;
      play(selectedId, delay);
    }
    prevMotionRef.current = { id: selectedId, signature: selectedMotionSignature };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selectedMotionSignature]);

  // Clicks that land on the padding around the frame (not inside it — the
  // frame and EditableCanvas handle their own clicks) toggle playback, same
  // as an empty-canvas click does inside the frame. This is what makes "any
  // area of the Canvas section" — padding included — part of the gesture. It
  // also deselects, same as an empty-canvas click: without this, a selection
  // could only ever be cleared by a click that happened to land inside the
  // frame, leaving Customize stuck showing the last-selected element's
  // controls after a click anywhere else on the stage.
  const handleStagePointerDown = (e: React.PointerEvent) => {
    if (!template) return;
    if ((e.target as HTMLElement).closest("[data-frame]")) return;
    onSelect(null);
    // A solo preview auto-started from a Motion edit, not a deliberate play
    // gesture — moving on from it should show the finished post playing, not
    // silently stop (the ordinary toggle below is for a real play/pause click).
    if (soloId) { play(); return; }
    if (previewFrame != null) stopPreview();
    else play();
  };

  return (
    <div
      onPointerDown={handleStagePointerDown}
      style={{
        flex: 1,
        // Never let the canvas collapse. The side panels are fixed width, so a
        // flexible centre column shrinks to nothing on a narrow viewport and the
        // media disappears — the card scrolls instead, which is the same
        // never-clip rule the frame itself follows.
        minWidth: `${MEDIA_W}px`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "16px",
        background: sp.white,
        position: "relative",
      }}
    >
      <FittedFrame
        media={media}
        render={({ w, h }) => {
          if (!template) return null;
          return (
            <EditableCanvas
              template={template}
              state={state}
              boxW={w}
              boxH={h}
              selectedId={selectedId}
              onSelect={onSelect}
              onMove={onMove}
              onEditText={onEditText}
              onEditExtraText={onEditExtraText}
              onToggleLayer={onToggleLayer}
              onResizeText={onResizeText}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              previewFrame={previewFrame}
              onCancelPreview={stopPreview}
              onEmptyClick={() => play()}
              soloId={soloId}
            />
          );
        }}
      />
    </div>
  );
}
