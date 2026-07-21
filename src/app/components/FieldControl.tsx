import type { FieldDef } from "../templates/schema";
import { sp, FONT } from "../theme";

interface Props {
  field: FieldDef;
  value: string | number;
  onChange: (key: string, value: string | number) => void;
}

export function FieldControl({ field, value, onChange }: Props) {
  if (field.type === "number") {
    const num = Number(value);
    const pct = ((num - field.min) / (field.max - field.min)) * 100;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: sp.textPrimary, lineHeight: "18px" }}>
            {field.label}
          </label>
          <span style={{ fontSize: "13px", fontWeight: 600, color: sp.blue, lineHeight: "18px", fontVariantNumeric: "tabular-nums" }}>
            {num}
          </span>
        </div>
        <input
          type="range"
          min={field.min}
          max={field.max}
          value={num}
          onChange={(e) => onChange(field.key, Number(e.target.value))}
          style={{
            width: "100%",
            height: "4px",
            appearance: "none",
            cursor: "pointer",
            borderRadius: "2px",
            background: `linear-gradient(to right, ${sp.blue} ${pct}%, ${sp.track} ${pct}%)`,
            accentColor: sp.blue,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: sp.textTertiary }}>
          <span>{field.min}</span>
          <span>{field.max}</span>
        </div>
      </div>
    );
  }

  if (field.type === "text") {
    const str = String(value);
    const nearLimit = (field.maxLength - str.length) <= 10;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: sp.textPrimary, lineHeight: "18px" }}>
            {field.label}
          </label>
          <span style={{ fontSize: "11px", color: nearLimit ? sp.danger : sp.textTertiary, fontVariantNumeric: "tabular-nums" }}>
            {str.length}/{field.maxLength}
          </span>
        </div>
        <textarea
          value={str}
          maxLength={field.maxLength}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={str.length > 40 ? 3 : 2}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: "4px",
            border: `1px solid ${sp.borderPrimary}`,
            background: sp.white,
            color: sp.textPrimary,
            fontSize: "13px",
            lineHeight: "18px",
            fontFamily: FONT,
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.12s",
          }}
          onFocus={(e) => { e.target.style.borderColor = sp.blueBorder; }}
          onBlur={(e) => { e.target.style.borderColor = sp.borderPrimary; }}
        />
      </div>
    );
  }

  if (field.type === "color") {
    const str = String(value);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontFamily: FONT }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: sp.textPrimary, lineHeight: "18px" }}>
          {field.label}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Color swatch */}
          <div
            style={{
              position: "relative",
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              overflow: "hidden",
              border: `1px solid ${sp.borderPrimary}`,
              flexShrink: 0,
            }}
          >
            <input
              type="color"
              value={str}
              onChange={(e) => onChange(field.key, e.target.value)}
              style={{
                position: "absolute",
                inset: "-4px",
                width: "calc(100% + 8px)",
                height: "calc(100% + 8px)",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            />
          </div>
          {/* Hex input */}
          <input
            type="text"
            value={str.toUpperCase()}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) onChange(field.key, val.toLowerCase());
            }}
            maxLength={7}
            style={{
              flex: 1,
              // Flex items default to min-width:auto, which would hold the input
              // at its intrinsic size and push it past the 240px panel.
              minWidth: 0,
              height: "32px",
              padding: "0 10px",
              borderRadius: "4px",
              border: `1px solid ${sp.borderPrimary}`,
              background: sp.white,
              color: sp.textPrimary,
              fontSize: "13px",
              fontFamily: "'Courier New', monospace",
              outline: "none",
              textTransform: "uppercase",
            }}
            onFocus={(e) => { e.target.style.borderColor = sp.blueBorder; }}
            onBlur={(e) => { e.target.style.borderColor = sp.borderPrimary; }}
          />
        </div>
      </div>
    );
  }

  return null;
}
