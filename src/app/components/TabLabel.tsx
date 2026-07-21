import { sp, FONT } from "../theme";

/**
 * The SocialPilot "Tab Base" active treatment used for the modal title and each
 * panel heading in the design: 14px semibold text with a gold underline.
 */
export function TabLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "26px",
        paddingBottom: "4px",
        borderBottom: `2px solid ${sp.gold}`,
        fontFamily: FONT,
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: "18px",
        color: sp.textPrimary,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
