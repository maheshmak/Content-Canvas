import type { TemplateDef, TemplateState } from "../templates/schema";
import { canHide } from "../templates/schema";
import { sp, space, type, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { IconButton } from "./IconButton";
import { ResetIcon } from "./icons";
import { FieldControl } from "./FieldControl";

/**
 * Supporting options for whatever is selected on the canvas.
 *
 * The canvas is where work happens — click an element, drag it, type into it.
 * This panel holds what the canvas cannot express: style, colour, motion, and a
 * list of everything on the post so an element hidden behind another can still
 * be reached.
 */
export function CustomizePanel({
  template,
  state,
  selectedId,
  onSelect,
  onFieldChange,
  onToggleLayer,
  onReset,
  onTidy,
  onShuffle,
  onAutoPlace,
  canReset,
}: {
  template: TemplateDef | null;
  state: TemplateState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onFieldChange: (key: string, value: string | number) => void;
  onToggleLayer: (id: string) => void;
  onReset: () => void;
  onTidy: () => void;
  onShuffle: () => void;
  onAutoPlace: () => void;
  canReset: boolean;
}) {
  const selected = template?.layers.find((l) => l.id === selectedId) ?? null;
  const hideAllowed = canHide(state);

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
        <div style={{ display: "flex", alignItems: "center", gap: space[4] }}>
          {/* One tap for a different look — the option that removes a decision
              rather than adding one. */}
          <IconButton title="Shuffle the look" onClick={onShuffle} disabled={!template}>
            <span style={{ fontSize: "16px" }}>✨</span>
          </IconButton>
          <IconButton title="Reset to defaults" onClick={onReset} disabled={!canReset}>
            <ResetIcon />
          </IconButton>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: template ? `0 ${space[8]} ${space[8]}` : 0,
          display: "flex",
          flexDirection: "column",
          gap: space[24],
          fontFamily: FONT,
        }}
      >
        {!template ? (
          <p style={{ margin: 0, padding: `0 ${space[8]}`, fontSize: type.s.size, lineHeight: type.s.line, color: sp.textTertiary }}>
            Select an option to customize
          </p>
        ) : (
          <>
            {/* Selected element's own options */}
            {selected && (
              <Section label={`Selected · ${selected.label}`}>
                {selected.fields.map((field) => (
                  <FieldControl
                    key={field.key}
                    field={field}
                    value={state.values[field.key] ?? field.default}
                    onChange={onFieldChange}
                  />
                ))}
                <SecondaryButton onClick={onAutoPlace}>
                  ✨ Auto-place on the quiet part
                </SecondaryButton>
                <Muted>Drag it on the canvas, or double-click text to edit it there.</Muted>
              </Section>
            )}

            {/* Everything on this post */}
            <Section label="On this post">
              <div style={{ display: "flex", flexDirection: "column", gap: space[4] }}>
                {template.layers.map((layer) => {
                  const st = state.layers[layer.id];
                  const isSelected = layer.id === selectedId;
                  const visible = st?.visible !== false;
                  return (
                    <div
                      key={layer.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: space[8],
                        padding: `0 ${space[4]} 0 ${space[8]}`,
                        height: "40px",
                        borderRadius: "4px",
                        border: `1px solid ${isSelected ? sp.borderActive : "transparent"}`,
                        background: isSelected ? sp.bg : "transparent",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(isSelected ? null : layer.id)}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: space[8],
                          border: "none",
                          background: "none",
                          padding: 0,
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: FONT,
                          fontSize: type.s.size,
                          lineHeight: type.s.line,
                          color: visible ? sp.textPrimary : sp.textDisabled,
                        }}
                      >
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>{layer.icon}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {layer.label}
                        </span>
                      </button>
                      <IconButton
                        title={visible ? "Hide" : "Show"}
                        onClick={() => onToggleLayer(layer.id)}
                        disabled={visible && !hideAllowed}
                      >
                        <EyeIcon off={!visible} />
                      </IconButton>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Everything */}
            <Section label="Everything">
              {template.globalFields.map((field) => (
                <FieldControl
                  key={field.key}
                  field={field}
                  value={state.values[field.key] ?? field.default}
                  onChange={onFieldChange}
                />
              ))}
              <SecondaryButton onClick={onTidy}>Tidy up</SecondaryButton>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space[12] }}>
      <p
        style={{
          margin: 0,
          fontSize: type.xs.size,
          lineHeight: type.xs.line,
          fontWeight: 600,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          color: sp.textTertiary,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: "32px",
        borderRadius: "2px",
        border: `1px solid ${sp.borderInput}`,
        background: sp.inputBg,
        color: sp.textPrimary,
        fontFamily: FONT,
        fontSize: type.s.size,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: type.s.size, lineHeight: type.s.line, color: sp.textTertiary }}>
      {children}
    </p>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" strokeLinecap="round" />}
    </svg>
  );
}
