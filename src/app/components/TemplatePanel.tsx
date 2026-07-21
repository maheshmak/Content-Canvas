import type { TemplateDef } from "../templates/schema";
import { templates } from "../templates/index";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";

// Per-template emoji, matching the design frame.
const TEMPLATE_EMOJI: Record<string, string> = {
  "five-star-rating": "🌟",
  "summer-sale": "☀️",
  "transformation": "🔄",
  "grand-opening": "🥳",
  "service-highlight": "✂️",
  "pro-tip": "💡",
  "find-us": "📍",
};

/**
 * Row per node 5909:69103 — 16px padding, 8px gap, radius 4, white fill.
 * Selection is carried entirely by the border colour: border/input-active
 * (#89B9FF) when selected, border/secondary (#F2F2F2) otherwise. The label does
 * not change weight or colour.
 */
function TemplateRow({
  template,
  isActive,
  onSelect,
}: {
  template: TemplateDef;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "16px",
        borderRadius: "4px",
        border: `1px solid ${isActive ? sp.borderActive : sp.borderSub}`,
        background: sp.white,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "16px", lineHeight: "20px", flexShrink: 0 }}>
        {TEMPLATE_EMOJI[template.id] ?? "📄"}
      </span>
      <span
        style={{
          fontSize: "14px",
          lineHeight: "18px",
          fontWeight: 400,
          color: sp.textPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {template.name}
      </span>
    </button>
  );
}

export function TemplatePanel({
  activeTemplateId,
  onSelect,
}: {
  activeTemplateId: string | null;
  onSelect: (template: TemplateDef) => void;
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
        borderRight: `1px solid ${sp.borderSub}`,
        overflow: "hidden",
      }}
    >
      {/* Header — the design's close control is opacity-0, so it is not shown. */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          width: "100%",
          flexShrink: 0,
        }}
      >
        <TabLabel>Templates</TabLabel>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {templates.map((t) => (
          <TemplateRow
            key={t.id}
            template={t}
            isActive={t.id === activeTemplateId}
            onSelect={() => onSelect(t)}
          />
        ))}
      </div>
    </div>
  );
}
