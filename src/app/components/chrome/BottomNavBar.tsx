import { sp, space, radius, FONT } from "../../theme";

import iconLibrary from "@/assets/chrome/side-nav-library.svg";
import iconPosts from "@/assets/chrome/side-nav-posts.svg";

/**
 * The floating bar at the foot of the canvas — the frame's 338×48 NavBar
 * variant (r8, 4 padding, 4 gap, `sidebar-800` ground, `sidebar-700` hairline
 * dividers, 40-tall items with a 24 glyph over a 12px label, shadow y12 r16 at
 * 16%).
 *
 * Static, like the rest of the product chrome in this prototype — and hidden
 * until the run finishes, because every one of its actions needs posts that
 * don't exist yet.
 *
 * `visibility`, not `display`: the bar keeps its space in the footer either
 * way, so the toast sitting above it holds one position for the whole run
 * instead of dropping when the bar appears.
 */
export function BottomNavBar({ hidden }: { hidden?: boolean }) {
  return (
    <div
      style={{
        width: "fit-content",
        display: "flex",
        alignItems: "center",
        gap: space[4],
        padding: space[4],
        background: sp.navbarBg,
        borderRadius: radius[8],
        boxShadow: "0px 12px 16px rgba(0,0,0,0.16)",
        fontFamily: FONT,
        visibility: hidden ? "hidden" : "visible",
      }}
      aria-hidden={hidden || undefined}
    >
      {/* BaseSideNavLibrary, per the frame — not the Content glyph this used
          to borrow. Exported from the vector rather than approximated. */}
      <Item label="Media" icon={<img src={iconLibrary} alt="" style={{ display: "block", width: "21px", height: "18px" }} />} />
      <Divider />
      {/* Drawn rather than imported: the exported BaseAddCircle is the top
          bar's blue one, and an `<img>` can't be recoloured for a dark ground. */}
      <Item
        label="Create Post"
        icon={
          <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
            <circle cx="12" cy="12" r="9" stroke={sp.white} strokeWidth="1.6" />
            <path d="M12 8.4v7.2M8.4 12h7.2" stroke={sp.white} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        }
      />
      <Divider />
      <Item label="Posts" icon={<img src={iconPosts} alt="" style={{ display: "block", width: "20px", height: "20px" }} />} />
    </div>
  );
}

function Item({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: space[4],
        height: "40px",
        padding: `0 ${space[8]} 0 ${space[4]}`,
        borderRadius: radius[4],
        color: sp.white,
        fontSize: "12px",
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </span>
      {label}
    </span>
  );
}

function Divider() {
  return <span aria-hidden style={{ width: "1px", height: "24px", flexShrink: 0, background: sp.sidebarDivider }} />;
}
