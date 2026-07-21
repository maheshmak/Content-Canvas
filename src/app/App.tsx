import { useState } from "react";
import type { TemplateDef, FieldValues } from "./templates/schema";
import { EditMediaModal } from "./components/EditMediaModal";
import type { MediaItem, MediaType } from "./components/MediaPreview";
import { sp, FONT } from "./theme";

import imgHeadphones from "@/assets/headphones.png";

// Stand-in for the post's uploaded media. In the real app both of these come
// from the post being edited.
const MEDIA: MediaItem = { id: "1", src: imgHeadphones, alt: "Man with headphones" };
const MEDIA_TYPE: MediaType = "video";

export default function App() {
  const [open, setOpen] = useState(true);

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
      {open && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "rgba(24,24,26,0.64)", zIndex: 10 }} />
          <EditMediaModal
            media={MEDIA}
            mediaType={MEDIA_TYPE}
            onClose={() => setOpen(false)}
            onSave={handleSave}
          />
        </>
      )}
    </div>
  );
}
