import type { ReactNode } from "react";
import { sp, FONT } from "../../theme";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import { PageHeaderBar } from "./PageHeaderBar";

/**
 * The product chrome the page sits inside.
 *
 * Built with flex rather than the absolute positioning the Figma export uses:
 * the frame is a fixed 1440×900 canvas, but a real page has to survive any
 * window. Only the sidebar keeps a fixed width; everything else fills what is
 * left, so this is pixel-identical at 1440 and still correct either side of it.
 */
export function AppShell({
  pageTitle,
  children,
}: {
  /** Omit to hide the page header bar entirely. A node rather than a
   *  string so a canvas can put its breadcrumb here. */
  pageTitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: sp.bg, fontFamily: FONT, overflow: "hidden" }}>
      <SideNav />

      {/* `minWidth: 0` so long content shrinks this column instead of pushing
          the whole page into a horizontal scroll. */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar />
        {pageTitle !== undefined && <PageHeaderBar title={pageTitle} />}
        <main style={{ flex: 1, minHeight: 0 }}>{children}</main>
      </div>
    </div>
  );
}
