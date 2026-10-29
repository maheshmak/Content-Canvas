import { StorefrontIcon } from "../icons";
import { sp, space, type, FONT } from "../../theme";

/**
 * The page header bar's left side on a canvas, exactly as the Figma frame
 * draws it (7052:587293 › Body › Preview Scroll › Title):
 *
 *   [ ⌂ Green-Z ⌄ ]  /  Content Canvas  /  Limited edition release announcements
 *
 * A 32-tall fully-rounded pill for the brand, then two separators and two
 * labels. The separators are tertiary, "Content Canvas" is secondary, and the
 * canvas's own name is primary — the graded weight is what makes the last item
 * read as where you are rather than as one more link.
 */
export function CanvasBreadcrumb({ brandName, canvasName }: { brandName: string; canvasName: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: space[8], minWidth: 0, fontFamily: FONT }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: space[4],
          height: "32px",
          flexShrink: 0,
          padding: `0 ${space[16]}`,
          boxSizing: "border-box",
          // 48 in the frame — past half the height, so it renders as a pill.
          borderRadius: "48px",
          border: `1px solid ${sp.borderSub}`,
          background: sp.white,
        }}
      >
        <StorefrontIcon width={20} height={20} style={{ color: sp.iconSecondary }} />
        <span style={{ fontSize: type.s.size, lineHeight: type.s.line, color: sp.textPrimary, whiteSpace: "nowrap" }}>
          {brandName}
        </span>
        <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: "block", flexShrink: 0 }}>
          <path d="M5.5 8L10 12.5L14.5 8" stroke={sp.textSecondary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <Separator />
      <span style={{ flexShrink: 0, fontSize: type.s.size, lineHeight: type.s.line, color: sp.textSecondary }}>Content Canvas</span>
      <Separator />
      <span
        style={{
          minWidth: 0,
          fontSize: type.s.size,
          lineHeight: type.s.line,
          color: sp.textPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {canvasName}
      </span>
    </div>
  );
}

function Separator() {
  return <span style={{ flexShrink: 0, fontSize: type.s.size, lineHeight: type.s.line, color: sp.textTertiary }}>/</span>;
}
