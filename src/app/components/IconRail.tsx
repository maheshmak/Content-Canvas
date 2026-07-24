import { sp } from "../theme";
import { TextIcon, ShapesIcon, TemplatesIcon } from "./icons";

export type EditorTab = "text" | "shape" | "templates";

const TABS: { id: EditorTab; label: string; Icon: typeof TextIcon }[] = [
  { id: "text", label: "Text", Icon: TextIcon },
  { id: "shape", label: "Shape", Icon: ShapesIcon },
  { id: "templates", label: "Templates", Icon: TemplatesIcon },
];

/**
 * Far-left rail (node 5909:68162). 48px wide: a 32px icon button with 8px
 * padding either side. The active row takes a surface-primary fill and a 2px
 * brand-blue left edge.
 */
export function IconRail({
  active,
  onChange,
}: {
  active: EditorTab;
  onChange: (tab: EditorTab) => void;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        height: "100%",
        padding: "8px 0",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        background: sp.white,
        borderRight: `1px solid ${sp.borderSub}`,
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            title={label}
            aria-label={label}
            aria-pressed={isActive}
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 8px",
              border: "none",
              background: isActive ? sp.bg : "transparent",
              cursor: "pointer",
            }}
          >
            {/* Overlaid rather than a border, so the 2px edge does not widen
                the rail past the design's 48px. */}
            {isActive && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "2px",
                  background: sp.blue,
                }}
              />
            )}
            <span
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "2px",
                color: isActive ? sp.blue : sp.iconSecondary,
              }}
            >
              <Icon />
            </span>
          </button>
        );
      })}
    </div>
  );
}
