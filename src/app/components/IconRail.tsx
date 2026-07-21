import { Type, Images } from "lucide-react";
import { sp } from "../theme";

export type EditorTab = "text" | "templates";

const TABS: { id: EditorTab; label: string; Icon: typeof Type }[] = [
  { id: "text", label: "Text", Icon: Type },
  { id: "templates", label: "Templates", Icon: Images },
];

/**
 * 48px rail on the far left of the modal body. Two 48x48 slots, each holding a
 * 32x32 icon button.
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
        width: "48px",
        flexShrink: 0,
        borderRight: `1px solid ${sp.borderPrimary}`,
        background: sp.white,
        paddingTop: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === active;
        return (
          <div
            key={id}
            style={{
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: `3px solid ${isActive ? sp.blue : "transparent"}`,
            }}
          >
            <button
              type="button"
              onClick={() => onChange(id)}
              title={label}
              aria-label={label}
              aria-pressed={isActive}
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "-3px",
                border: "none",
                borderRadius: "4px",
                background: isActive ? sp.blueSubtle : "none",
                color: isActive ? sp.blue : sp.textTertiary,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <Icon size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
