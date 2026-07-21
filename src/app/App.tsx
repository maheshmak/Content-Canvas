import { useState } from "react";
import type { TemplateDef, FieldValues } from "./templates/schema";
import { EditMediaModal } from "./components/EditMediaModal";
import type { MediaItem, MediaType } from "./components/MediaPreview";
import { sp, FONT } from "./theme";

import imgHeadphones from "@/assets/headphones.png";
import imgPancakes from "@/assets/pancakes.png";
import imgDogs from "@/assets/dogs.png";
import imgMedia4 from "@/assets/media-4.png";
import imgMedia5 from "@/assets/media-5.png";

// Sample media, standing in for the post's uploaded images.
const MEDIA_ITEMS: MediaItem[] = [
  { id: "1", src: imgHeadphones, alt: "Man with headphones" },
  { id: "2", src: imgPancakes, alt: "Pancakes" },
  { id: "3", src: imgDogs, alt: "Two dogs" },
  { id: "4", src: imgMedia4, alt: "Media 4" },
  { id: "5", src: imgMedia5, alt: "Media 5" },
];

export default function App() {
  const [open, setOpen] = useState(true);
  const [activeMediaId, setActiveMediaId] = useState("1");
  // Defaults to video so the templates' motion is visible on load. In the real
  // app this comes from the post's media type, not a toggle.
  const [mediaType, setMediaType] = useState<MediaType>("video");

  const activeMedia = MEDIA_ITEMS.find((m) => m.id === activeMediaId) ?? MEDIA_ITEMS[0];

  const handleSave = (template: TemplateDef | null, fieldValues: FieldValues) => {
    // Placeholder: the real app writes this back onto the post's media.
    console.log("save", template?.id, fieldValues);
    setOpen(false);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT,
        background: sp.bg,
      }}
    >
      {/* Harness for opening the modal — stands in for clicking a post's media. */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              height: "32px",
              padding: "0 16px",
              borderRadius: "4px",
              border: "none",
              background: sp.blue,
              color: sp.white,
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            Edit media
          </button>
          <span style={{ fontSize: "13px", color: sp.textSecondary, marginLeft: "8px" }}>
            Preview as:
          </span>
          {(["video", "image"] as MediaType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMediaType(t)}
              style={{
                height: "32px",
                padding: "0 12px",
                borderRadius: "4px",
                border: `1px solid ${mediaType === t ? sp.blueBorder : sp.borderPrimary}`,
                background: mediaType === t ? sp.blueSubtle : sp.white,
                color: mediaType === t ? sp.blue : sp.textSecondary,
                fontSize: "13px",
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {MEDIA_ITEMS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMediaId(m.id)}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "4px",
                overflow: "hidden",
                border: m.id === activeMediaId ? `2px solid ${sp.blue}` : "2px solid transparent",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <img src={m.src} alt={m.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      </div>

      {open && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "rgba(24,24,26,0.64)", zIndex: 10 }} />
          <EditMediaModal
            media={activeMedia}
            mediaType={mediaType}
            onClose={() => setOpen(false)}
            onSave={handleSave}
          />
        </>
      )}
    </div>
  );
}
