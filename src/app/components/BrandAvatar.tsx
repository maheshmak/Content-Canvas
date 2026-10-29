import type { Brand } from "../brand/types";
import { sp } from "../theme";
import { StorefrontIcon } from "./icons";

/** Glyph size inside the ring. The ring sizes itself around this. */
const ICON = 24;
/** Breathing room between the glyph and the ring, per side. */
const PAD = 8;

/**
 * The mark standing in for the brand.
 *
 * A storefront rather than the person silhouette this replaced: the subject
 * here is a business, not a user, and a face on a gym's row of accounts read
 * as somebody's profile picture.
 *
 * Neutral by design — a bordered ring in the design system's own greys, not
 * the brand's colour. This sits directly beside a real avatar row (the
 * platform marks, which carry strong brand colour of their own), and a
 * saturated circle competed with them.
 */
export function BrandAvatar({ brand, size = ICON + PAD * 2 }: { brand: Brand; size?: number }) {
  return (
    <span
      title={brand.name}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        borderRadius: "50%",
        border: `1px solid ${sp.borderSub}`,
        background: sp.white,
        color: sp.iconSecondary,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <StorefrontIcon width={ICON} height={ICON} />
    </span>
  );
}
