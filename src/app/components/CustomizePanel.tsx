import type { ColorRole, FieldDef, LayerRenderProps, NumberField, TemplateDef, TemplateState, TextOverrides } from "../templates/schema";
import { sp, space, type, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { ResetIcon } from "./icons";
import { FieldControl } from "./FieldControl";
import { Field, PillSelect, Select, ColorInput } from "./ds";
import { BADGES } from "./badges";
import type { Badge } from "./badges";
import { STICKER_REGISTRY } from "../templates/art";
import { SHAPES, COLOR_ROLE_OPTIONS, shapePathD } from "./shapes";

/** Editing an added text element's own copy, via the standard text control. */
const EXTRA_TEXT_FIELD: FieldDef = { key: "__extraText__", type: "text", label: "Text", default: "", maxLength: 240 };

/**
 * Raw typography controls — the only text customisation surface, no separate
 * named-preset picker in front of it. No web fonts are loaded in this app, so
 * "font family" stays a small, curated set of system-safe stacks rather than
 * a picker that promises fonts the browser doesn't actually have.
 */
const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Default" },
  { value: "Georgia, 'Times New Roman', serif", label: "Serif" },
  { value: "ui-rounded, 'SF Pro Rounded', 'Segoe UI', sans-serif", label: "Rounded" },
  { value: "'SF Mono', 'Courier New', monospace", label: "Mono" },
  { value: "'Arial Narrow', sans-serif", label: "Condensed" },
  { value: "'Brush Script MT', cursive", label: "Script" },
];

const WEIGHT_OPTIONS = [
  { value: "400", label: "Regular" },
  { value: "600", label: "Medium" },
  { value: "800", label: "Bold" },
];

const STYLE_OPTIONS = [
  { value: "normal", label: "Regular" },
  { value: "italic", label: "Italic" },
];

const SIZE_FIELD: NumberField = { key: "__sizePct__", type: "number", label: "Size", default: 100, min: 50, max: 200 };

/**
 * Supporting options for whatever is selected on the canvas.
 *
 * The canvas is where work happens — click an element, drag it, type into it.
 * This panel follows the selection: empty (just Motion + Accent) until
 * something is selected, then only that element's controls — a text element
 * gets typography, a sticker gets its own curated shape variants — so the
 * user is never shown a wall of options for things they aren't touching.
 * Motion is common architecture for the whole post, not a per-element choice,
 * so it only ever appears here as one global setting. Duplicate/hide/delete
 * live only on the canvas's own selection toolbar — not duplicated here.
 */
export function CustomizePanel({
  template,
  state,
  selectedId,
  onFieldChange,
  onEditExtraText,
  onSetShape,
  onSetBadge,
  onSetBadgeValue,
  onSetBadgeText,
  onSetBadgeColorOverride,
  onSetTextOverrides,
  onSetVariant,
  onSetStickerValue,
  onSetFrameVariant,
  onSetColorOverride,
  onAddBadge: _onAddBadge,
  onReset,
  onShuffle,
  canReset,
}: {
  template: TemplateDef | null;
  state: TemplateState;
  selectedId: string | null;
  onFieldChange: (key: string, value: string | number) => void;
  onEditExtraText: (id: string, text: string) => void;
  onSetShape: (id: string, patch: { shapeId?: string; color?: ColorRole }) => void;
  onSetBadge: (id: string, badgeId: string) => void;
  onSetBadgeValue: (id: string, value: number) => void;
  onSetBadgeText: (id: string, text: string) => void;
  onSetBadgeColorOverride: (id: string, colorOverride: string | undefined) => void;
  onSetTextOverrides: (id: string, patch: Partial<TextOverrides>) => void;
  onSetVariant: (id: string, variant: string) => void;
  onSetStickerValue: (id: string, value: number) => void;
  onSetFrameVariant: (id: string, frameVariant: string) => void;
  onSetColorOverride: (id: string, colorOverride: string | undefined) => void;
  onAddBadge: (badgeId: string) => void;
  onReset: () => void;
  onShuffle: () => void;
  canReset: boolean;
}) {
  const selLayer = selectedId ? template?.layers.find((l) => l.id === selectedId) ?? null : null;
  const selExtra = selectedId ? state.extras.find((e) => e.id === selectedId) ?? null : null;
  const hasSelection = Boolean(selLayer || selExtra);
  const accent = String(state.values.accentColor ?? template?.previewColor ?? sp.textSecondary);

  return (
    <div
      style={{
        width: "320px",
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
      {/* Title row, with the post-wide actions parked at its right edge. */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          width: "100%",
          height: "32px",
          flexShrink: 0,
        }}
      >
        <TabLabel>Customize</TabLabel>
        <div style={{ display: "flex", alignItems: "center", gap: space[8] }}>
          <HeaderActionButton label="Shuffle" title="Shuffle the look" onClick={onShuffle} disabled={!template}>
            <span style={{ fontSize: "16px", color: "initial" }}>✨</span>
          </HeaderActionButton>
          <HeaderActionButton label="Reset" title="Reset to the template" onClick={onReset} disabled={!canReset}>
            <ResetIcon width={32} height={32} />
          </HeaderActionButton>
        </div>
      </div>

      <div
        className="scroll-area"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: template ? `0 ${space[8]} ${space[8]}` : 0,
          display: "flex",
          flexDirection: "column",
          gap: space[16],
          fontFamily: FONT,
        }}
      >
        {!template ? (
          <Muted style={{ padding: `0 ${space[8]}` }}>Select an option to customize</Muted>
        ) : hasSelection ? (
          <Inspector
            state={state}
            selectedId={selectedId!}
            selLayer={selLayer}
            selExtra={selExtra}
            onFieldChange={onFieldChange}
            onEditExtraText={onEditExtraText}
            onSetShape={onSetShape}
            onSetBadge={onSetBadge}
            onSetBadgeValue={onSetBadgeValue}
            onSetBadgeText={onSetBadgeText}
            onSetBadgeColorOverride={onSetBadgeColorOverride}
            onSetTextOverrides={onSetTextOverrides}
            onSetVariant={onSetVariant}
            onSetStickerValue={onSetStickerValue}
            onSetFrameVariant={onSetFrameVariant}
            onSetColorOverride={onSetColorOverride}
            accent={accent}
          />
        ) : (
          <Overview template={template} state={state} onFieldChange={onFieldChange} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ overview */

/** Nothing selected: the post-wide settings, plus a minimal way to drop a
 *  sticker onto the canvas. This is a stand-in for a proper browse-and-insert
 *  workflow (an Elements tab, categorised, etc.) — deliberately the simplest
 *  thing that lets a sticker get added at all; the fuller version is a
 *  later, separate pass. */
function Overview({
  template,
  state,
  onFieldChange,
}: {
  template: TemplateDef;
  state: TemplateState;
  onFieldChange: (key: string, value: string | number) => void;
}) {
  return (
    <>
      {template.globalFields.map((field) => (
        <FieldControl
          key={field.key}
          field={field}
          value={state.values[field.key] ?? field.default}
          onChange={onFieldChange}
        />
      ))}
    </>
  );
}

/* ----------------------------------------------------------------- inspector */

/**
 * Something selected: only that element's controls, no heading and no
 * "Done" — clicking anywhere else on the canvas already deselects, so a
 * dedicated close affordance would just be a second way to do the same thing.
 */
function Inspector({
  state,
  selectedId,
  selLayer,
  selExtra,
  onFieldChange,
  onEditExtraText,
  onSetShape,
  onSetBadge,
  onSetBadgeValue,
  onSetBadgeText,
  onSetBadgeColorOverride,
  onSetTextOverrides,
  onSetVariant,
  onSetStickerValue,
  onSetFrameVariant,
  onSetColorOverride,
  accent,
}: {
  state: TemplateState;
  selectedId: string;
  selLayer: TemplateDef["layers"][number] | null;
  selExtra: TemplateState["extras"][number] | null;
  onFieldChange: (key: string, value: string | number) => void;
  onEditExtraText: (id: string, text: string) => void;
  onSetShape: (id: string, patch: { shapeId?: string; color?: ColorRole }) => void;
  onSetBadge: (id: string, badgeId: string) => void;
  onSetBadgeValue: (id: string, value: number) => void;
  onSetBadgeText: (id: string, text: string) => void;
  onSetBadgeColorOverride: (id: string, colorOverride: string | undefined) => void;
  onSetTextOverrides: (id: string, patch: Partial<TextOverrides>) => void;
  onSetVariant: (id: string, variant: string) => void;
  onSetStickerValue: (id: string, value: number) => void;
  onSetFrameVariant: (id: string, frameVariant: string) => void;
  onSetColorOverride: (id: string, colorOverride: string | undefined) => void;
  accent: string;
}) {
  // A duplicated built-in sticker (`kind: "sticker"`) is a portable copy of
  // the same component a template layer draws — everything below treats the
  // two uniformly by resolving one shared descriptor here rather than
  // branching selLayer/selExtra separately in every section.
  const stickerReg = selExtra?.kind === "sticker" ? STICKER_REGISTRY[selExtra.componentId] : undefined;

  const isShape = selExtra?.kind === "shape";
  const isBadge = selExtra?.kind === "badge";
  const isText = selLayer?.kind === "text" || selExtra?.kind === "text";
  const isSticker = Boolean(selLayer?.variants?.length) || Boolean(stickerReg);
  const isChipText = Boolean(selLayer?.frameVariants?.length);
  const hasInternalText = Boolean(selLayer?.hasInternalText) || Boolean(stickerReg?.hasInternalText);

  const stickerRender = selLayer?.render ?? stickerReg?.render;
  const stickerVariants = selLayer?.variants ?? stickerReg?.variants;
  const stickerCurrentVariant = selLayer
    ? state.layers[selLayer.id]?.variant ?? selLayer.defaultVariant
    : selExtra?.kind === "sticker"
      ? selExtra.variant ?? stickerReg?.defaultVariant
      : undefined;
  const stickerScale = selLayer?.previewScale ?? stickerReg?.previewScale;
  const stickerColorOverride = selLayer
    ? state.layers[selLayer.id]?.colorOverride
    : selExtra?.kind === "sticker"
      ? selExtra.colorOverride
      : undefined;

  const overrides: TextOverrides =
    (selLayer
      ? state.layers[selLayer.id]?.overrides
      : selExtra?.kind === "text" || selExtra?.kind === "sticker"
        ? selExtra.overrides
        : undefined) ?? {};

  return (
    <>
      {/* Content: a template layer's fields, an added text element's copy,
          or a duplicated sticker's own editable field. A field whose label
          just repeats the layer's own name (e.g. the "Label" field on a
          layer called "Label") showed no label at all, which read as a
          stray unlabelled box — generic "Text" instead, so the first
          control always has something naming it. */}
      {selLayer?.fields.map((field) => {
        const generic = field.type === "text" && sameLabel(field.label, selLayer.label);
        return (
          <FieldControl
            key={field.key}
            field={generic ? { ...field, label: "Text" } : field}
            value={state.values[field.key] ?? field.default}
            onChange={onFieldChange}
          />
        );
      })}
      {selExtra?.kind === "text" && (
        <FieldControl
          field={EXTRA_TEXT_FIELD}
          value={selExtra.text}
          onChange={(_, v) => onEditExtraText(selExtra.id, String(v))}
        />
      )}
      {selExtra?.kind === "sticker" && stickerReg?.valueField && (
        <FieldControl
          field={{ key: "__stickerValue__", type: "number", ...stickerReg.valueField }}
          value={selExtra.value ?? stickerReg.valueField.default}
          onChange={(_, v) => onSetStickerValue(selectedId, Number(v))}
        />
      )}

      {/* A badge-style text layer's own curated background frame — labelled
          "Shape" like every other shape-choosing section, and shown right
          after content, ahead of Style, same as a sticker's own Shape below. */}
      {isChipText && selLayer?.frameVariants && (
        <div style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
          <SectionLabel>Shape</SectionLabel>
          <PillSelect
            value={state.layers[selLayer.id]?.frameVariant ?? selLayer.defaultFrameVariant ?? selLayer.frameVariants[0].id}
            options={selLayer.frameVariants.map((v) => ({ value: v.id, label: v.label }))}
            onChange={(v) => onSetFrameVariant(selLayer.id, v)}
          />
        </div>
      )}

      {/* A built-in sticker (rating, pin, badge, numeral) — its own curated
          shape variants only, never the general shape library. A star stays
          a star. Shown right after content, ahead of Style — "which shape"
          is the more central choice for a sticker than its internal text.
          Works the same whether this is the template's own layer or a
          duplicated copy of it. */}
      {isSticker && stickerRender && stickerVariants && (
        <div style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
          <SectionLabel>Shape</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: space[4] }}>
            {stickerVariants.map((v) => (
              <StickerVariantSwatch
                key={v.id}
                render={stickerRender}
                variant={v.id}
                label={v.label}
                accent={accent}
                scale={stickerScale}
                selected={stickerCurrentVariant === v.id}
                onClick={() => onSetVariant(selectedId, v.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Style — flat typography controls, font/weight/style/size/colour.
          Also opts in a sticker's own internal text (a discount's "%", a tip
          numeral's digit) — the same controls, scoped to that text only. */}
      {(isText || hasInternalText) && (
        <div style={{ display: "flex", flexDirection: "column", gap: space[12] }}>
          <Field label="Type">
            <Select
              value={overrides.fontFamily ?? ""}
              options={FONT_OPTIONS}
              onChange={(e) => onSetTextOverrides(selectedId, { fontFamily: e.target.value || undefined })}
            />
          </Field>
          <FieldControl
            field={SIZE_FIELD}
            value={overrides.sizePct ?? 100}
            onChange={(_, v) => onSetTextOverrides(selectedId, { sizePct: Number(v) })}
          />
          <Field label="Weight">
            <PillSelect
              value={String(overrides.fontWeight ?? 400)}
              options={WEIGHT_OPTIONS}
              onChange={(v) => onSetTextOverrides(selectedId, { fontWeight: Number(v) })}
            />
          </Field>
          <Field label="Style">
            <PillSelect
              value={overrides.italic ? "italic" : "normal"}
              options={STYLE_OPTIONS}
              onChange={(v) => onSetTextOverrides(selectedId, { italic: v === "italic" || undefined })}
            />
          </Field>
          {/* Plain text's own colour lives here; a sticker's internal text
              instead gets paired with the sticker's shape colour below, so
              the two read as "shape colour, text colour" rather than two
              unlabelled colour rows with no visible relationship. */}
          {!hasInternalText && (
            <Field label="Color">
              <div style={{ display: "flex", alignItems: "center", gap: space[8] }}>
                <div style={{ flex: 1 }}>
                  <ColorInput
                    value={overrides.color ?? "#ffffff"}
                    onChange={(hex) => onSetTextOverrides(selectedId, { color: hex })}
                  />
                </div>
                {overrides.color && (
                  <button
                    type="button"
                    title="Reset to the default colour"
                    onClick={() => onSetTextOverrides(selectedId, { color: undefined })}
                    style={linkButtonStyle}
                  >
                    Reset
                  </button>
                )}
              </div>
            </Field>
          )}
        </div>
      )}

      {/* A sticker's own colour, independent of the post's overall accent —
          the template's own layer, or a duplicated copy of it. A sticker
          with its own internal text (a discount's "%", a tip's digit) gets
          both colours side by side, each under its own label — two colour
          rows with nothing distinguishing them just read as "two colours,
          why" otherwise. */}
      {(selLayer?.kind === "custom" || selExtra?.kind === "sticker") && (
        <div style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
          {hasInternalText ? (
            <div style={{ display: "flex", gap: space[8], width: "100%" }}>
              <div style={{ flex: "1 1 0px", minWidth: 0, display: "flex", flexDirection: "column", gap: space[4] }}>
                <SectionLabel>Shape Color</SectionLabel>
                <ColorInput
                  value={stickerColorOverride ?? accent}
                  onChange={(hex) => onSetColorOverride(selectedId, hex)}
                />
              </div>
              <div style={{ flex: "1 1 0px", minWidth: 0, display: "flex", flexDirection: "column", gap: space[4] }}>
                <SectionLabel>Text Color</SectionLabel>
                <ColorInput
                  value={overrides.color ?? "#ffffff"}
                  onChange={(hex) => onSetTextOverrides(selectedId, { color: hex })}
                />
              </div>
            </div>
          ) : (
            <>
            <SectionLabel>Colour</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: space[8] }}>
              <div style={{ flex: 1 }}>
                <ColorInput
                  value={stickerColorOverride ?? accent}
                  onChange={(hex) => onSetColorOverride(selectedId, hex)}
                />
              </div>
              {stickerColorOverride && (
                <button
                  type="button"
                  title="Match the overall accent colour"
                  onClick={() => onSetColorOverride(selectedId, undefined)}
                  style={linkButtonStyle}
                >
                  Reset
                </button>
              )}
            </div>
            </>
          )}
        </div>
      )}

      {/* A standalone shape — which shape, and what fills it. Pure decoration,
          so the full shape library is fair game (unlike a sticker above). */}
      {isShape && (
        <div style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
          <SectionLabel>Shape</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: space[4] }}>
            {SHAPES.map((s) => (
              <ShapeSwatch
                key={s.id}
                shapeId={s.id}
                selected={selExtra.shapeId === s.id}
                onClick={() => onSetShape(selectedId, { shapeId: s.id })}
              />
            ))}
          </div>
          <PillSelect
            value={selExtra.color}
            options={COLOR_ROLE_OPTIONS}
            onChange={(v) => onSetShape(selectedId, { color: v as ColorRole })}
          />
        </div>
      )}

      {/* A text sticker's own words ("OPEN NOW" → "OPEN LATE") — content
          comes first here too, same as every other element's own field. */}
      {isBadge &&
        (() => {
          const badge = BADGES.find((b) => b.id === selExtra.badgeId);
          if (badge?.defaultText === undefined) return null;
          return (
            <FieldControl
              field={{ key: "__badgeText__", type: "text", label: "Text", default: badge.defaultText, maxLength: 24 }}
              value={selExtra.text ?? badge.defaultText}
              onChange={(_, v) => onSetBadgeText(selectedId, String(v))}
            />
          );
        })()}

      {/* A sticker — which one, and its embedded value if it has one. Labelled
          "Shape" like every other shape-choosing section, not "Sticker" —
          one word for "which form is this" everywhere it shows up. */}
      {isBadge && (
        <div style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
          <SectionLabel>Shape</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: space[4] }}>
            {BADGES.map((b) => (
              <BadgeSwatch
                key={b.id}
                badge={b}
                accent={accent}
                selected={selExtra.badgeId === b.id}
                onClick={() => onSetBadge(selectedId, b.id)}
              />
            ))}
          </div>
          {(() => {
            const badge = BADGES.find((b) => b.id === selExtra.badgeId);
            if (!badge?.valueField) return null;
            const field: NumberField = {
              key: "__badgeValue__",
              type: "number",
              label: badge.valueField.label,
              default: badge.valueField.default,
              min: badge.valueField.min,
              max: badge.valueField.max,
            };
            return (
              <FieldControl
                field={field}
                value={selExtra.value ?? badge.valueField.default}
                onChange={(_, v) => onSetBadgeValue(selectedId, Number(v))}
              />
            );
          })()}
        </div>
      )}

      {/* This instance's own colour, independent of the post's overall
          accent — without this, selecting an inserted badge showed nothing
          beyond the same picker used to add it in the first place, which
          read as "selecting did nothing." */}
      {isBadge && (
        <div style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
          <SectionLabel>Colour</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: space[8] }}>
            <div style={{ flex: 1 }}>
              <ColorInput
                value={selExtra.colorOverride ?? accent}
                onChange={(hex) => onSetBadgeColorOverride(selectedId, hex)}
              />
            </div>
            {selExtra.colorOverride && (
              <button
                type="button"
                title="Match the overall accent colour"
                onClick={() => onSetBadgeColorOverride(selectedId, undefined)}
                style={linkButtonStyle}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------- pieces */

function HeaderActionButton({
  label,
  title,
  disabled,
  onClick,
  children,
}: {
  label: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        height: "32px",
        display: "flex",
        alignItems: "center",
        gap: space[4],
        padding: 0,
        border: "none",
        background: "none",
        color: disabled ? sp.textDisabled : sp.blue,
        fontFamily: FONT,
        fontSize: type.s.size,
        lineHeight: type.s.line,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        style={{
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: disabled ? sp.textDisabled : sp.blue,
        }}
      >
        {children}
      </span>
      <span>{label}</span>
    </button>
  );
}

/** A live, scaled-down preview of a sticker, so picking one is recognition,
 *  not label-reading — the badges render real (large) markup, so the preview
 *  shrinks it into a fixed swatch and clips whatever spills over. */
function BadgeSwatch({
  badge,
  accent,
  selected,
  onClick,
}: {
  badge: Badge;
  accent: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={badge.label}
      aria-label={badge.label}
      onClick={onClick}
      style={{
        width: "68px",
        height: "44px",
        padding: "6px",
        borderRadius: "8px",
        border: `2px solid ${selected ? sp.blue : sp.borderSub}`,
        background: "none",
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <div style={{ transform: `scale(${badge.previewScale ?? 0.16})`, flexShrink: 0 }}>
        <badge.render accent={accent} value={badge.valueField?.default} text={badge.defaultText} />
      </div>
    </button>
  );
}

/** A live preview of one of a sticker's own curated variants — same rendering
 *  pattern as `BadgeSwatch`, driven off the layer's real render function so
 *  the swatch is never out of sync with what selecting it actually produces. */
function StickerVariantSwatch({
  render: Render,
  variant,
  label,
  accent,
  scale,
  selected,
  onClick,
}: {
  render: React.FC<LayerRenderProps>;
  variant: string;
  label: string;
  accent: string;
  /** Sticker components have very different intrinsic footprints (a pin is
   *  a fraction of a badge's size) — falls back to a scale tuned for a
   *  mid-size sticker when the layer doesn't specify its own. */
  scale?: number;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      style={{
        width: "60px",
        height: "60px",
        borderRadius: "8px",
        border: `2px solid ${selected ? sp.blue : sp.borderSub}`,
        background: "none",
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div style={{ transform: `scale(${scale ?? 0.095})`, flexShrink: 0 }}>
        <Render values={{}} accent={accent} frame={999} width={1080} height={1920} variant={variant} />
      </div>
    </button>
  );
}

function ShapeSwatch({
  shapeId,
  selected,
  onClick,
}: {
  shapeId: string;
  selected?: boolean;
  onClick: () => void;
}) {
  const shape = SHAPES.find((s) => s.id === shapeId);
  return (
    <button
      type="button"
      title={shape?.label ?? shapeId}
      aria-label={shape?.label ?? shapeId}
      onClick={onClick}
      style={{
        width: "38px",
        height: "38px",
        padding: "6px",
        borderRadius: "8px",
        border: `2px solid ${selected ? sp.blue : sp.borderSub}`,
        background: "none",
        cursor: "pointer",
        color: sp.textSecondary,
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d={shapePathD(shapeId)} fill="currentColor" />
      </svg>
    </button>
  );
}

function sameLabel(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const linkButtonStyle: React.CSSProperties = {
  border: "none",
  background: "none",
  padding: 0,
  cursor: "pointer",
  color: sp.blue,
  fontFamily: FONT,
  fontSize: type.s.size,
  lineHeight: type.s.line,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: type.s.size, lineHeight: type.s.line, fontWeight: 400, color: sp.textPrimary }}>
      {children}
    </p>
  );
}

function Muted({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ margin: 0, fontSize: type.s.size, lineHeight: type.s.line, color: sp.textTertiary, ...style }}>
      {children}
    </p>
  );
}
