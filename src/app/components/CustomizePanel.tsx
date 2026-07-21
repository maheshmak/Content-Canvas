import { RotateCcw } from "lucide-react";
import type { TemplateDef, FieldValues } from "../templates/schema";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { IconButton } from "./IconButton";
import { FieldControl } from "./FieldControl";

/**
 * Right-hand 240px panel. Always rendered — when no template is selected the
 * body is simply empty, which is the default state in the design.
 */
export function CustomizePanel({
  template,
  fieldValues,
  onFieldChange,
  onReset,
  canReset,
}: {
  template: TemplateDef | null;
  fieldValues: FieldValues;
  onFieldChange: (key: string, value: string | number) => void;
  onReset: () => void;
  canReset: boolean;
}) {
  return (
    <div
      style={{
        width: "240px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: sp.white,
        borderLeft: `1px solid ${sp.borderPrimary}`,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "32px",
          margin: "8px",
          flexShrink: 0,
        }}
      >
        <TabLabel>Customize</TabLabel>
        <IconButton title="Reset to defaults" onClick={onReset} disabled={!canReset}>
          <RotateCcw size={15} />
        </IconButton>
      </div>

      {/* Fields */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: template ? "8px 16px 16px" : 0,
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          fontFamily: FONT,
        }}
      >
        {template?.fields.map((field) => (
          <FieldControl
            key={field.key}
            field={field}
            value={fieldValues[field.key] ?? field.default}
            onChange={onFieldChange}
          />
        ))}
      </div>
    </div>
  );
}
