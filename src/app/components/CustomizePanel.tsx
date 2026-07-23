import type { TemplateDef, TemplateState } from "../templates/schema";
import { canHide } from "../templates/schema";
import { sp, space, type, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { IconButton } from "./IconButton";
import { ResetIcon, EyeIcon } from "./icons";
import { FieldControl } from "./FieldControl";

/**
 * Supporting options for whatever is selected on the canvas.
 *
 * The canvas is where work happens — click an element, drag it, type into it.
 * This panel is the overview and the fallback: a list of everything on the
 * post, each row opening its own fields in place so the controls sit with the
 * layer they belong to rather than in a detached block. Post-wide actions
 * (shuffle, reset) live up in the title row; per-post settings sit at the foot.
 */
export function CustomizePanel({
  template,
  state,
  selectedId,
  onSelect,
  onFieldChange,
  onToggleLayer,
  onReset,
  onShuffle,
  canReset,
}: {
  template: TemplateDef | null;
  state: TemplateState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onFieldChange: (key: string, value: string | number) => void;
  onToggleLayer: (id: string) => void;
  onReset: () => void;
  onShuffle: () => void;
  canReset: boolean;
}) {
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
          // One rhythm for the whole column: Elements, Animation style and
          // Accent Colour are peers, so the gap above each is the same.
          gap: space[16],
          fontFamily: FONT,
        }}
      >
        {!template ? (
          <p style={{ margin: 0, padding: `0 ${space[8]}`, fontSize: type.s.size, lineHeight: type.s.line, color: sp.textTertiary }}>
            Select an option to customize
          </p>
        ) : (
          <>
            {/* Everything on this post. Each row opens its own fields in place,
                so clicking a layer here — or selecting it on the canvas — lands
                the controls right under the thing they change. */}
            <div style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
              <SectionLabel>Elements</SectionLabel>

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
                        flexDirection: "column",
                        borderRadius: "6px",
                        border: `1px solid ${isSelected ? sp.borderActive : sp.borderSub}`,
                        background: "transparent",
                        overflow: "hidden",
                      }}
                    >
                      {/* Row header: name + visibility */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: space[8],
                          padding: `0 ${space[4]} 0 ${space[8]}`,
                          height: "40px",
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

                      {/* The selected layer's fields, in place under its row. */}
                      {isSelected && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: space[12],
                            padding: `${space[4]} ${space[8]} ${space[12]}`,
                          }}
                        >
                          {layer.fields.length > 0 ? (
                            layer.fields.map((field) => (
                              <FieldControl
                                key={field.key}
                                field={field}
                                value={state.values[field.key] ?? field.default}
                                onChange={onFieldChange}
                                hideLabel={sameLabel(field.label, layer.label)}
                              />
                            ))
                          ) : (
                            <Muted>Drag it on the canvas to reposition it.</Muted>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-post settings, each its own section on the same rhythm as
                Elements above rather than bunched together. */}
            {template.globalFields.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                value={state.values[field.key] ?? field.default}
                onChange={onFieldChange}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

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

function sameLabel(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: type.s.size,
        lineHeight: type.s.line,
        fontWeight: 400,
        color: sp.textPrimary,
      }}
    >
      {children}
    </p>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: type.s.size, lineHeight: type.s.line, color: sp.textTertiary }}>
      {children}
    </p>
  );
}
