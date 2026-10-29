import { sp, space, radius } from "../../theme";

import logo from "@/assets/chrome/socialpilot-logo.svg";
import iconDashboard from "@/assets/chrome/side-nav-dashboard.svg";
import iconPosts from "@/assets/chrome/side-nav-posts.svg";
import iconCalendar from "@/assets/chrome/side-nav-calendar.svg";
import iconAnalytics from "@/assets/chrome/side-nav-analytics.svg";
import iconInbox from "@/assets/chrome/side-nav-inbox.svg";
import iconContent from "@/assets/chrome/side-nav-content.svg";
import iconAi from "@/assets/chrome/side-nav-ai.svg";
import iconAccounts from "@/assets/chrome/side-nav-accounts.svg";
import iconGroups from "@/assets/chrome/side-nav-groups.svg";
import iconSetup from "@/assets/chrome/side-nav-setup.svg";
import iconResources from "@/assets/chrome/side-nav-resources.svg";
import iconScheduleCall from "@/assets/chrome/side-nav-schedule-call.svg";

/** One entry, or a rule between groups. `spacer` is explained below. */
type Item = { src: string; label: string; w: number; h: number } | "divider" | "spacer";

/**
 * Order, grouping and glyph dimensions read straight off the frame.
 *
 * Every icon carries its own fixed `w`/`h` because in Figma the artwork sits
 * *inset* within its 24px container by a different amount per icon — Dashboard
 * is 17×17, the AI sparkle 22×22, Calendar 17×19.1152. Sizing them all to the
 * container would scale every glyph up by a different factor, which is exactly
 * the mismatch this replaced. These numbers are the SVGs' own intrinsic sizes,
 * which match Figma's boxes precisely.
 *
 * `spacer` stands in for an item the design ships at `opacity-0` purely to open
 * the gap before the bottom group. An invisible icon is how Figma expresses
 * that; an explicit empty box of the same height is how code should — same
 * pixels, without a phantom glyph in the markup.
 */
const ITEMS: Item[] = [
  { src: iconDashboard, label: "Dashboard", w: 17, h: 17 },
  { src: iconPosts, label: "Posts", w: 17, h: 17 },
  { src: iconCalendar, label: "Calendar", w: 17, h: 19.1152 },
  { src: iconAnalytics, label: "Analytics", w: 19, h: 17 },
  { src: iconInbox, label: "Inbox", w: 17, h: 17 },
  { src: iconContent, label: "Content", w: 18.9443, h: 18.527 },
  { src: iconAi, label: "AI", w: 22, h: 22 },
  "divider",
  { src: iconAccounts, label: "Accounts", w: 19.8444, h: 19 },
  { src: iconGroups, label: "Groups", w: 19, h: 19 },
  { src: iconSetup, label: "Setup", w: 17.9971, h: 19 },
  "spacer",
  "divider",
  { src: iconResources, label: "Resources", w: 16.4868, h: 16.3845 },
  { src: iconScheduleCall, label: "Schedule a call", w: 19, h: 17 },
];

const SLOT = 40;
const LOGO = { w: 23.4651, h: 22.4833 };

/**
 * The collapsed product sidebar.
 *
 * Presentational only — nothing here navigates, and there is no hover or active
 * treatment, because the frame this came from defines none. Rendered as `div`s
 * rather than `button`s for exactly that reason: a button would announce itself
 * as actionable to assistive tech and then do nothing.
 */
export function SideNav() {
  return (
    <nav
      aria-label="Main"
      style={{
        width: "90px",
        flexShrink: 0,
        background: sp.sidebarBg,
        display: "flex",
        justifyContent: "center",
        padding: `${space[16]} ${space[24]} ${space[24]}`,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: space[24], alignItems: "center", width: SLOT }}>
        <img
          src={logo}
          alt="SocialPilot"
          style={{ display: "block", flexShrink: 0, width: `${LOGO.w}px`, height: `${LOGO.h}px` }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: space[16], alignItems: "center", width: "100%" }}>
          {ITEMS.map((item, i) => {
            if (item === "divider") {
              return <div key={`d${i}`} style={{ width: "100%", height: "1px", background: sp.sidebarDivider, flexShrink: 0 }} />;
            }
            if (item === "spacer") {
              return <div key={`s${i}`} aria-hidden style={{ height: `${SLOT}px`, flexShrink: 0 }} />;
            }
            return (
              <div
                key={item.label}
                title={item.label}
                style={{
                  width: "100%",
                  height: `${SLOT}px`,
                  flexShrink: 0,
                  borderRadius: radius[2],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={item.src}
                  alt=""
                  style={{ display: "block", width: `${item.w}px`, height: `${item.h}px`, flexShrink: 0 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
