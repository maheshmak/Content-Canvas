import type { ReactNode } from "react";
import { sp, space, radius, type, FONT } from "../../theme";

import iconHelp from "@/assets/chrome/help.svg";

/** The help glyph's own size from the frame — inset inside its 20px container,
 *  not filling it. */
const GLYPH = { w: 16.6667, h: 16.6667 };

/** The page's own bar, between the top nav and the page body. */
export function PageHeaderBar({ title }: { title: ReactNode }) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: sp.white,
        border: `1px solid ${sp.borderSub}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: space[16],
      }}
    >
      {typeof title === "string" ? (
        <span style={{ fontFamily: FONT, fontSize: type.s.size, lineHeight: type.s.line, color: sp.textPrimary, whiteSpace: "nowrap" }}>
          {title}
        </span>
      ) : (
        <div style={{ minWidth: 0 }}>{title}</div>
      )}

      <div
        title="Help"
        style={{
          width: "32px",
          height: "32px",
          flexShrink: 0,
          borderRadius: radius[2],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={iconHelp} alt="" style={{ display: "block", width: `${GLYPH.w}px`, height: `${GLYPH.h}px`, flexShrink: 0 }} />
      </div>
    </div>
  );
}
