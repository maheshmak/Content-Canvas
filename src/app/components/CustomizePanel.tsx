import type { TemplateDef, FieldValues } from "../templates/schema";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { IconButton } from "./IconButton";
import { FieldControl } from "./FieldControl";
import { ResetIcon } from "./icons";

/**
 * Right-hand 240px panel (node 5909:69105). Always rendered — when no template
 * is selected the body is empty, which is the design's default state.
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "8px",
        background: sp.white,
        borderLeft: `1px solid ${sp.borderSub}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          width: "100%",
          flexShrink: 0,
        }}
      >
        <TabLabel>Customize</TabLabel>
        <IconButton title="Reset to defaults" onClick={onReset} disabled={!canReset}>
          <ResetIcon />
        </IconButton>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: template ? "0 8px 8px" : 0,
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
