import { sp, space, radius, type, FONT } from "../../theme";

import iconAddCircle from "@/assets/chrome/top-nav-add-circle.svg";
import iconSharingResume from "@/assets/chrome/top-nav-sharing-resume.svg";
import iconIntegrations from "@/assets/chrome/top-nav-integrations.svg";
import iconNotification from "@/assets/chrome/top-nav-notification.svg";
import iconWhatsNew from "@/assets/chrome/top-nav-whats-new.svg";
import iconProfile from "@/assets/chrome/top-nav-profile.svg";

/**
 * Each glyph's own fixed size, straight from the frame.
 *
 * The frame's Icon Button is a 20px container, but the artwork inside it is
 * inset by a different amount per icon — Integrations is only 12.69px, Add
 * Circle 15.83px. Sizing them all to 20px scaled each one up differently.
 * These are the SVGs' intrinsic sizes, which match Figma's boxes exactly.
 */
const GLYPHS = {
  addCircle: { w: 15.8333, h: 15.8333 },
  sharingResume: { w: 15.8333, h: 15.8333 },
  integrations: { w: 12.6921, h: 12.6921 },
  notification: { w: 12.5, h: 15.9935 },
  whatsNew: { w: 15.0114, h: 15.0193 },
  profile: { w: 15.8333, h: 15.8333 },
} as const;

type Glyph = { w: number; h: number };

/**
 * A 32px hit area around the glyph, matching the frame's Icon Button.
 *
 * The notification dot every one of these carries is `opacity-0` in the design.
 * Kept in the markup rather than dropped so switching one on later is a single
 * prop, not a re-layout.
 */
function IconButton({ src, label, glyph, dot = false }: { src: string; label: string; glyph: Glyph; dot?: boolean }) {
  return (
    <div
      title={label}
      style={{
        position: "relative",
        width: "32px",
        height: "32px",
        flexShrink: 0,
        borderRadius: radius[2],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={src} alt="" style={{ display: "block", width: `${glyph.w}px`, height: `${glyph.h}px`, flexShrink: 0 }} />
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          width: "8px",
          height: "8px",
          borderRadius: "80px",
          background: sp.blue,
          border: `1px solid ${sp.white}`,
          boxSizing: "border-box",
          opacity: dot ? 1 : 0,
        }}
      />
    </div>
  );
}

function Tab({ label, active }: { label: string; active?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space[4], height: "26px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "18px", padding: `0 ${space[8]}` }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: type.s.size,
            lineHeight: type.s.line,
            color: active ? sp.textPrimary : sp.textSecondary,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
      {active && <div style={{ width: "100%", height: "4px", background: sp.brandSecondary }} />}
    </div>
  );
}

/**
 * The product top bar.
 *
 * Presentational only, like the sidebar — the frame defines no hover or active
 * states beyond the one selected tab, and nothing here navigates yet.
 */
export function TopBar() {
  return (
    <header
      style={{
        height: "34px",
        flexShrink: 0,
        background: sp.white,
        borderBottom: `1px solid ${sp.divider}`,
        boxSizing: "border-box",
        display: "flex",
        // The tabs sit on the bar's bottom edge so their indicator meets the border.
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingLeft: space[24],
        paddingRight: "20px",
      }}
    >
      <div style={{ display: "flex", gap: space[8], alignItems: "flex-start" }}>
        <Tab label="SocialPilot" active />
        <Tab label="Reviews + Listings" />
      </div>

      <div style={{ display: "flex", gap: space[4], alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", gap: space[4], alignItems: "center", justifyContent: "center", height: "32px" }}>
          <img
            src={iconAddCircle}
            alt=""
            style={{ display: "block", width: `${GLYPHS.addCircle.w}px`, height: `${GLYPHS.addCircle.h}px`, flexShrink: 0 }}
          />
          <span style={{ fontFamily: FONT, fontSize: type.s.size, lineHeight: type.s.line, color: sp.blue, whiteSpace: "nowrap" }}>
            Create Post
          </span>
        </div>
        <IconButton src={iconSharingResume} label="Sharing resume" glyph={GLYPHS.sharingResume} />
        <IconButton src={iconIntegrations} label="Integrations" glyph={GLYPHS.integrations} />
        <div style={{ width: "2px", height: "16px", background: sp.divider, flexShrink: 0 }} />
        <IconButton src={iconNotification} label="Notifications" glyph={GLYPHS.notification} />
        <IconButton src={iconWhatsNew} label="What's new" glyph={GLYPHS.whatsNew} />
        <IconButton src={iconProfile} label="Profile" glyph={GLYPHS.profile} />
      </div>
    </header>
  );
}
