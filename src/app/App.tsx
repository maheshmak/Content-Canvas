import { useState } from "react";
import type { TemplateDef, TemplateState, PostCopy } from "./templates/schema";
import { EditMediaModal } from "./components/EditMediaModal";
import type { MediaItem, MediaType } from "./components/MediaPreview";
import { sp, FONT } from "./theme";

import imgHeadphones from "@/assets/headphones.png";

// Stand-in for the post's uploaded media. In the real app both of these come
// from the post being edited.
const MEDIA: MediaItem = { id: "1", src: imgHeadphones, alt: "Man with headphones" };
const MEDIA_TYPE: MediaType = "video";

/**
 * Copy the AI already wrote for this post, upstream in the content canvas.
 * Templates bind their main line to this, so the editor never asks the user to
 * write something that already exists. Hardcoded here as a stand-in.
 */
const POST: PostCopy = {
  headline: "Limited edition release",
  hook: "The best pieces sell out in hours",
  cta: "Let's Go",
};

export default function App() {
  const [open, setOpen] = useState(true);

  const handleSave = (template: TemplateDef | null, state: TemplateState) => {
    // Placeholder: the real app writes this back onto the post's media.
    console.log("save", template?.id, state);
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
            post={POST}
            onClose={() => setOpen(false)}
            onSave={handleSave}
          />
        </>
      )}
    </div>
  );
}
