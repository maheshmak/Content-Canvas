import type { CSSProperties, FC } from "react";

/* ------------------------------------------------------------------ fields */

export interface NumberField {
  key: string;
  type: "number";
  label: string;
  default: number;
  min: number;
  max: number;
}

export interface TextField {
  key: string;
  type: "text";
  label: string;
  default: string;
  maxLength: number;
  /** Hide the n/max counter — for short structured values (price, phone). */
  showCount?: boolean;
}

export interface ColorField {
  key: string;
  type: "color";
  label: string;
  default: string;
}

export interface SelectField {
  key: string;
  type: "select";
  label: string;
  default: string;
  options: { value: string; label: string }[];
  /** Show options as pills instead of a dropdown. */
  variant?: "dropdown" | "pills";
}

export type FieldDef = NumberField | TextField | ColorField | SelectField;

/* --------------------------------------------------------------- placement */

export type Align = "left" | "center" | "right";

/**
 * A point on the canvas, normalised 0–1 so it survives any preview size.
 *
 * `align` decides what `x` refers to — the element's left edge, centre, or
 * right edge. That is what lets several independently positioned lines share an
 * edge and still read as a designed group.
 */
export interface Position {
  x: number;
  y: number;
  align: Align;
}

/**
 * The nine named positions. No longer a layout mode — every element is freely
 * positioned now. These survive as snap targets while dragging, as the preset
 * buttons in the panel, and as the vocabulary Auto-place chooses from.
 */
export type Anchor =
  | "top-left"    | "top-center"    | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export const ANCHORS: Anchor[] = [
  "top-left",    "top-center",    "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

/** Keep content clear of the canvas edges and platform UI overlays. */
export const SAFE_X = 0.075;
export const SAFE_Y = 0.055;

/** Where each named anchor sits, in normalised canvas space. */
export function anchorToPosition(anchor: Anchor): Position {
  const [v, h] = anchor.split("-") as ["top" | "middle" | "bottom", Align];
  const x = h === "left" ? SAFE_X : h === "right" ? 1 - SAFE_X : 0.5;
  const y = v === "top" ? SAFE_Y : v === "bottom" ? 1 - SAFE_Y : 0.5;
  return { x, y, align: h };
}

/** Nearest named anchor to a position — used to label the current placement. */
export function positionToAnchor(pos: Position): Anchor {
  const h = pos.x < 0.34 ? "left" : pos.x > 0.66 ? "right" : "center";
  const v = pos.y < 0.34 ? "top" : pos.y > 0.66 ? "bottom" : "middle";
  return `${v}-${h}` as Anchor;
}

/* ------------------------------------------------------------------ motion */

export type MotionType = "fade" | "slide-up" | "pop" | "none";

export interface Motion {
  type: MotionType;
  /** Frame at which this element starts animating in. */
  delay: number;
}

/* ------------------------------------------------------------------ layers */

export interface LayerRenderProps {
  /** Resolved values for this layer's fields, plus the template's globals. */
  values: FieldValues;
  accent: string;
  frame: number;
  /** Canvas dimensions, for anything that needs to size against them. */
  width: number;
  height: number;
}

/**
 * One addressable element of a template.
 *
 * Templates used to be hand-written JSX, which cannot be dragged — you can't
 * move a piece of hardcoded markup to an arbitrary point. Describing each
 * element instead makes selection, dragging, inline editing and add/remove all
 * fall out of the same data.
 */
export interface LayerDef {
  id: string;
  /** Shown in the layer list and as the panel heading. */
  label: string;
  icon: string;
  kind: "text" | "custom";
  /**
   * Binds this layer's text to copy the AI already wrote for the post, so the
   * user never meets a blank box. Falls back to the field default when the post
   * has nothing to offer.
   */
  source?: "post.headline" | "post.hook" | "post.cta";
  /** The field holding this layer's text, for `kind: "text"`. */
  textKey?: string;
  /** Visual treatment for `kind: "text"`. */
  style?: (accent: string) => CSSProperties;
  /** Bespoke artwork — a badge, a map pin — for `kind: "custom"`. */
  render?: FC<LayerRenderProps>;
  /** Fields this layer owns, surfaced when it is selected. */
  fields: FieldDef[];
  position: Position;
  motion: Motion;
}

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  description: string;
  previewColor: string;
  /** Applies to the whole template: animation style, accent colour. */
  globalFields: FieldDef[];
  layers: LayerDef[];
  /** Ambient effects that are not addressable elements (e.g. confetti). */
  ambient?: FC<LayerRenderProps>;
  /** Whether to darken behind the busiest region so type stays legible. */
  scrim?: boolean;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

/* ------------------------------------------------------------------- state */

export type FieldValues = Record<string, string | number>;

export interface LayerState {
  visible: boolean;
  x: number;
  y: number;
  align: Align;
  /** Normalised wrap width for text layers, as a fraction of canvas width. */
  textWidth?: number;
}

export type ExtraLayer =
  | { id: string; kind: "text"; text: string; styleId: string; position: Position; motion: Motion }
  | { id: string; kind: "badge"; badgeId: string; position: Position; motion: Motion };

/**
 * Everything the editor knows about the current template.
 *
 * This whole object travels in Remotion's `inputProps` — the serialisation
 * boundary to the renderer. Anything kept outside it would be missing from an
 * exported MP4, so hidden layers would silently reappear.
 */
export interface TemplateState {
  values: FieldValues;
  layers: Record<string, LayerState>;
  extras: ExtraLayer[];
}

/** Copy the AI produced for this post, bound into layers via `source`. */
export interface PostCopy {
  headline?: string;
  hook?: string;
  cta?: string;
}

function resolveSource(layer: LayerDef, post: PostCopy | undefined): string | undefined {
  if (!layer.source || !post) return undefined;
  const key = layer.source.split(".")[1] as keyof PostCopy;
  const value = post[key];
  return value && value.trim() ? value : undefined;
}

export function getDefaults(template: TemplateDef, post?: PostCopy): TemplateState {
  const values: FieldValues = {};
  for (const field of template.globalFields) values[field.key] = field.default;

  const layers: Record<string, LayerState> = {};
  for (const layer of template.layers) {
    for (const field of layer.fields) values[field.key] = field.default;

    // Post copy wins over the template's placeholder, so no blank boxes and no
    // asking the user to rewrite what the AI already produced.
    const fromPost = resolveSource(layer, post);
    if (fromPost && layer.textKey) values[layer.textKey] = fromPost;

    layers[layer.id] = {
      visible: true,
      ...layer.position,
      ...(layer.kind === "text" ? { textWidth: 1 - 2 * SAFE_X } : {}),
    };
  }

  return { values, layers, extras: [] };
}

/** Reset placement only — the "Tidy up" action. Text and visibility survive. */
export function tidyPositions(template: TemplateDef, state: TemplateState): TemplateState {
  const layers: Record<string, LayerState> = {};
  for (const layer of template.layers) {
    layers[layer.id] = {
      visible: state.layers[layer.id]?.visible ?? true,
      ...layer.position,
      textWidth: state.layers[layer.id]?.textWidth,
    };
  }
  return { ...state, layers };
}

/** Layers a post cannot lose — the last visible one cannot be hidden. */
export function canHide(state: TemplateState): boolean {
  return Object.values(state.layers).filter((l) => l.visible).length > 1;
}
