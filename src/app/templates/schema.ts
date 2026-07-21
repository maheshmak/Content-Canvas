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

export type FieldDef = NumberField | TextField | ColorField;

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
