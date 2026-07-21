import type { FieldDef, Anchor } from "../templates/schema";
import { ANCHORS } from "../templates/schema";
import { sp, space, radius, type, FONT } from "../theme";
import { Field, TextInput, TextArea, Select, ColorInput } from "./ds";

/**
 * Above this length a value is prose and gets Input-Text Area; below it, a
 * single line and gets Input-Text Single. A 120px box for "Customer Name" would
 * be wrong even though both are "text".
 */
const MULTILINE_ABOVE = 40;

interface Props {
  field: FieldDef;
  value: string | number;
  onChange: (key: string, value: string | number) => void;
}

/** 3x3 grid mirroring the nine anchors, so the control reads as the canvas. */
function AnchorPicker({
  value,
  onChange,
}: {
  value: Anchor;
  onChange: (a: Anchor) => void;
}) {
  return (
    <div
      role="radiogroup"
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: space[4], width: "108px" }}
    >
      {ANCHORS.map((a) => {
        const isActive = a === value;
        return (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={a.replace("-", " ")}
            title={a.replace("-", " ")}
            onClick={() => onChange(a)}
            style={{
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              borderRadius: radius[2],
              border: `1px solid ${isActive ? sp.borderActive : sp.borderInput}`,
              background: isActive ? sp.inputActive : sp.inputBg,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "1px",
                background: isActive ? sp.blue : sp.track,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

export function FieldControl({ field, value, onChange }: Props) {
  const id = `field-${field.key}`;

  if (field.type === "anchor") {
    return (
      <Field label={field.label}>
        <AnchorPicker
          value={(value as Anchor) ?? field.default}
          onChange={(a) => onChange(field.key, a)}
        />
      </Field>
    );
  }

  if (field.type === "select") {
    return (
      <Field label={field.label} htmlFor={id}>
        <Select
          id={id}
          value={String(value ?? field.default)}
          options={field.options}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      </Field>
    );
  }

  if (field.type === "number") {
    const num = Number(value);
    const pct = ((num - field.min) / (field.max - field.min)) * 100;
    return (
      <Field label={field.label} hint={num} hintTone="brand" htmlFor={id}>
        <input
          id={id}
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
            borderRadius: radius[2],
            background: `linear-gradient(to right, ${sp.blue} ${pct}%, ${sp.track} ${pct}%)`,
            accentColor: sp.blue,
            outline: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: FONT,
            fontSize: type.xs.size,
            lineHeight: type.xs.line,
            color: sp.textTertiary,
          }}
        >
          <span>{field.min}</span>
          <span>{field.max}</span>
        </div>
      </Field>
    );
  }

  if (field.type === "text") {
    const str = String(value);
    const nearLimit = field.maxLength - str.length <= 10;
    return (
      <Field
        label={field.label}
        hint={`${str.length}/${field.maxLength}`}
        hintTone={nearLimit ? "danger" : "muted"}
        htmlFor={id}
      >
        {field.maxLength > MULTILINE_ABOVE ? (
          <TextArea
            id={id}
            value={str}
            maxLength={field.maxLength}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        ) : (
          <TextInput
            id={id}
            type="text"
            value={str}
            maxLength={field.maxLength}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        )}
      </Field>
    );
  }

  if (field.type === "color") {
    return (
      <Field label={field.label}>
        <ColorInput value={String(value)} onChange={(hex) => onChange(field.key, hex)} />
      </Field>
    );
  }

  return null;
}
