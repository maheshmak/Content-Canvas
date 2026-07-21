import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import type { TemplateDef, FieldValues } from "../templates/schema";
import { getDefaults } from "../templates/schema";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { IconButton } from "./IconButton";
import { IconRail } from "./IconRail";
import type { EditorTab } from "./IconRail";
import { TemplatePanel } from "./TemplatePanel";
import { CustomizePanel } from "./CustomizePanel";
import { MediaPreview } from "./MediaPreview";
import type { MediaItem, MediaType } from "./MediaPreview";

interface Props {
  media: MediaItem;
  mediaType: MediaType;
  onClose: () => void;
  onSave: (template: TemplateDef | null, fieldValues: FieldValues) => void;
}

/** Placeholder for the Text tab — not in scope this round. */
function TextPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        width: "240px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: sp.white,
        borderRight: `1px solid ${sp.borderPrimary}`,
      }}
    >
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
        <TabLabel>Text</TabLabel>
        <IconButton title="Close text" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </div>
      <div style={{ padding: "16px", fontFamily: FONT, fontSize: "13px", color: sp.textTertiary }}>
        Text layers are not available yet.
      </div>
    </div>
  );
}

export function EditMediaModal({ media, mediaType, onClose, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>("templates");
  const [panelOpen, setPanelOpen] = useState(true);
  const [template, setTemplate] = useState<TemplateDef | null>(null);
  const [fieldValues, setFieldValues] = useState<FieldValues>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSelect = useCallback((t: TemplateDef) => {
    setTemplate(t);
    setFieldValues(getDefaults(t.fields));
  }, []);

  const handleFieldChange = useCallback((key: string, value: string | number) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    if (template) setFieldValues(getDefaults(template.fields));
  }, [template]);

  const isDirty = template
    ? template.fields.some((f) => fieldValues[f.key] !== f.default)
    : false;

  const title = mediaType === "video" ? "Edit Video" : "Edit Image";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width: "1080px",
          height: "800px",
          maxWidth: "100%",
          maxHeight: "100%",
          display: "flex",
          flexDirection: "column",
          // Modal chrome is surface-primary (#F8F9FA); the body content sits on
          // a white card inset 16px, per the design.
          background: sp.bg,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          fontFamily: FONT,
        }}
      >
        {/* ── Header (58px) ── */}
        <div
          style={{
            height: "58px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 10px",
          }}
        >
          <TabLabel>{title}</TabLabel>
          <IconButton title="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>

        {/* ── Body (678px) — four columns summing to 1048 ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            margin: "0 16px",
            background: sp.white,
            border: `1px solid ${sp.borderSub}`,
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <IconRail
            active={activeTab}
            onChange={(tab) => { setActiveTab(tab); setPanelOpen(true); }}
          />

          {panelOpen && activeTab === "templates" && (
            <TemplatePanel
              activeTemplateId={template?.id ?? null}
              onSelect={handleSelect}
              onClose={() => setPanelOpen(false)}
            />
          )}
          {panelOpen && activeTab === "text" && (
            <TextPanel onClose={() => setPanelOpen(false)} />
          )}

          <MediaPreview
            media={media}
            template={template}
            fieldValues={fieldValues}
            mediaType={mediaType}
          />

          <CustomizePanel
            template={template}
            fieldValues={fieldValues}
            onFieldChange={handleFieldChange}
            onReset={handleReset}
            canReset={isDirty}
          />
        </div>

        {/* ── Footer (64px) ── */}
        <div
          style={{
            height: "64px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "16px",
          }}
        >
          <button
            type="button"
            disabled={!template}
            onClick={() => onSave(template, fieldValues)}
            style={{
              width: "80px",
              height: "32px",
              borderRadius: "4px",
              border: "none",
              background: template ? sp.blue : sp.blueDisabled,
              color: sp.white,
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: FONT,
              cursor: template ? "pointer" : "not-allowed",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
