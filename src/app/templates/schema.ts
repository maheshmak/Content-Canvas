import type { FC } from "react";

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
}

export interface ColorField {
  key: string;
  type: "color";
  label: string;
  default: string;
}

/**
 * Where a block sits on the canvas. Placement is data, not code: templates
 * declare which blocks are positionable and the shared layout in
 * components/layout.tsx does the positioning, so every template obeys the same
 * safe margins and scrim rules.
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

export interface AnchorField {
  key: string;
  type: "anchor";
  label: string;
  default: Anchor;
}

export type FieldDef = NumberField | TextField | ColorField | AnchorField;

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  description: string;
  previewColor: string;
  component: FC<{ inputProps: Record<string, string | number> }>;
  fields: FieldDef[];
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

export type FieldValues = Record<string, string | number>;

export function getDefaults(fields: FieldDef[]): FieldValues {
  const defaults: FieldValues = {};
  for (const field of fields) {
    defaults[field.key] = field.default;
  }
  return defaults;
}
