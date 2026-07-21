import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from "react";
import { sp, space, radius, type, FONT } from "../theme";

/**
 * SocialPilot form primitives.
 *
 * These reproduce the library's Figma components (Input-Text Area, node
 * 5909:67898 — 16px padding, 2px radius, 14px/18px Body/Sm/Regular) using the
 * design tokens. They are local implementations, not imports: the
 * DesignSystemWeb kit that ships with this project is CSS-only — tokens and
 * typography classes, no React components — so there is nothing to import. If
 * SocialPilot publishes a React package, these are the seams to swap.
 */

const controlBase = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: space[16],
  borderRadius: radius[2],
  border: `1px solid ${sp.borderSub}`,
  background: sp.white,
  color: sp.textPrimary,
  fontFamily: FONT,
  fontSize: type.s.size,
  lineHeight: type.s.line,
  fontWeight: 400,
  outline: "none",
  transition: "border-color 0.12s",
};

function focusRing(e: { currentTarget: HTMLElement }) {
  e.currentTarget.style.borderColor = sp.borderActive;
}
function blurRing(e: { currentTarget: HTMLElement }) {
  e.currentTarget.style.borderColor = sp.borderSub;
}

/** Label row, with optional trailing hint (character counter, value readout). */
export function Field({
  label,
  hint,
  hintTone = "muted",
  htmlFor,
  children,
}: {
  label: string;
  hint?: ReactNode;
  hintTone?: "muted" | "danger" | "brand";
  htmlFor?: string;
  children: ReactNode;
}) {
  const hintColor =
    hintTone === "danger" ? sp.danger : hintTone === "brand" ? sp.blue : sp.textTertiary;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space[8], fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: space[8] }}>
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: type.s.size,
            lineHeight: type.s.line,
            fontWeight: 600,
            color: sp.textPrimary,
          }}
        >
          {label}
        </label>
        {hint !== undefined && (
          <span
            style={{
              fontSize: type.xs.size,
              lineHeight: type.xs.line,
              color: hintColor,
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...controlBase, resize: "none", ...props.style }}
      onFocus={(e) => { focusRing(e); props.onFocus?.(e); }}
      onBlur={(e) => { blurRing(e); props.onBlur?.(e); }}
    />
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...controlBase, ...props.style }}
      onFocus={(e) => { focusRing(e); props.onFocus?.(e); }}
      onBlur={(e) => { blurRing(e); props.onBlur?.(e); }}
    />
  );
}

/** Native select styled to the library's input treatment. */
export function Select({
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <select
        {...props}
        style={{
          ...controlBase,
          paddingRight: space[32],
          appearance: "none",
          cursor: "pointer",
          ...props.style,
        }}
        onFocus={(e) => { focusRing(e); props.onFocus?.(e); }}
        onBlur={(e) => { blurRing(e); props.onBlur?.(e); }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        style={{ position: "absolute", right: space[12], top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      >
        <path d="M2.5 4.5L6 8L9.5 4.5" stroke={sp.iconSecondary} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Colour swatch plus hex entry, sharing the input treatment. */
export function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: space[8] }}>
      <div
        style={{
          position: "relative",
          width: "40px",
          height: "40px",
          flexShrink: 0,
          borderRadius: radius[2],
          overflow: "hidden",
          border: `1px solid ${sp.borderSub}`,
        }}
      >
        <input
          type="color"
          aria-label="Colour"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
      <TextInput
        value={value.toUpperCase()}
        maxLength={7}
        aria-label="Hex value"
        onChange={(e) => {
          const v = e.target.value;
          if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v.toLowerCase());
        }}
        style={{
          flex: 1,
          minWidth: 0,
          height: "40px",
          padding: `0 ${space[12]}`,
          fontFamily: "'Courier New', monospace",
          textTransform: "uppercase",
        }}
      />
    </div>
  );
}
