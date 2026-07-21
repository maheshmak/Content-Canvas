import { useState, useCallback, useEffect } from "react";
import type { TemplateDef, FieldValues } from "../templates/schema";
import { getDefaults } from "../templates/schema";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { CloseIcon } from "./icons";
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
function TextPanel() {
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
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", width: "100%", flexShrink: 0 }}>
        <TabLabel>Text</TabLabel>
      </div>
      <p style={{ margin: 0, padding: "0 8px", fontFamily: FONT, fontSize: "14px", lineHeight: "18px", color: sp.textTertiary }}>
        Text layers are not available yet.
      </p>
    </div>
  );
}

export function EditMediaModal({ media, mediaType, onClose, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>("templates");
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

  const title = "Edit Media";

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
          background: sp.bg,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          fontFamily: FONT,
        }}
      >
        {/* ── Header (58px, 16px padding) ── */}
        <div
          style={{
            height: "58px",
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            padding: "16px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minWidth: 0,
            }}
          >
            <TabLabel variant="header">{title}</TabLabel>
            <IconButton title="Close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        {/* ── Body: white radius-8 card, no border, inset 16px ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 16px",
            width: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              background: sp.white,
              borderRadius: "8px",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <IconRail active={activeTab} onChange={setActiveTab} />

            {activeTab === "templates" ? (
              <TemplatePanel
                activeTemplateId={template?.id ?? null}
                onSelect={handleSelect}
              />
            ) : (
              <TextPanel />
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
        </div>

        {/* ── Footer (64px) ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "16px",
            background: sp.bg,
          }}
        >
          <button
            type="button"
            disabled={!template}
            onClick={() => onSave(template, fieldValues)}
            style={{
              minWidth: "80px",
              height: "32px",
              padding: "0 16px",
              borderRadius: "2px",
              border: "none",
              background: template ? sp.blue : sp.blueDisabled,
              color: sp.white,
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "18px",
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
