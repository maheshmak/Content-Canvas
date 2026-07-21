import { X } from "lucide-react";
import type { TemplateDef } from "../templates/schema";
import { templates } from "../templates/index";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { IconButton } from "./IconButton";

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
        height: "52px",
        flexShrink: 0,
        padding: "0 16px",
        borderRadius: "4px",
        border: `1px solid ${isActive ? sp.blueBorder : sp.borderSub}`,
        borderLeft: `3px solid ${isActive ? sp.blue : sp.borderSub}`,
        background: isActive ? sp.blueSubtle : sp.white,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
      }}
    >
      <span style={{ fontSize: "16px", lineHeight: "20px", flexShrink: 0 }}>
        {TEMPLATE_EMOJI[template.id] ?? "📄"}
      </span>
      <span
        style={{
          fontSize: "14px",
          lineHeight: "18px",
          fontWeight: isActive ? 600 : 400,
          color: isActive ? sp.blue : sp.textPrimary,
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
  onClose,
}: {
  activeTemplateId: string | null;
  onSelect: (template: TemplateDef) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        width: "240px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: sp.white,
        borderRight: `1px solid ${sp.borderPrimary}`,
        overflow: "hidden",
      }}
    >
      {/* Header row — 224 wide, inset 8 */}
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
        <TabLabel>Templates</TabLabel>
        <IconButton title="Close templates" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </div>

      {/* Options list — starts at y=56 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "8px",
          paddingTop: "8px",
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
