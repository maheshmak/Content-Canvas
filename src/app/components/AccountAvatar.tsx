import type { PlatformType } from "../brand/types";
import { sp } from "../theme";
import { PlatformIcon } from "./PlatformIcon";

import iconAvatar from "@/assets/chrome/base-avatar.svg";

/**
 * The account's profile picture slot on a post card — the frame's
 * `Avatar (Type=Icon, Size=Large, Online=False)`: a 32px `black-100` circle
 * holding the `BaseAvatar` person glyph at 20, in `#777A80`.
 *
 * **Why a person here and a storefront elsewhere.** `BrandAvatar` deliberately
 * uses a shopfront, because on the brand screen the subject is a business and a
 * face read as somebody's profile photo. This slot is the opposite case: it
 * stands in for the connected account's actual profile picture, which is
 * exactly what a face belongs to. Same reasoning, opposite answer.
 *
 * Pass `platform` to pin that network's mark to the bottom-right corner — for
 * places where nothing else on the row says which network the account is on.
 * A post card doesn't: its header already names the network.
 */
export function AccountAvatar({ size = 32, platform }: { size?: number; platform?: PlatformType }) {
  const circle = (
    <span
      aria-hidden
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        borderRadius: "50%",
        background: sp.bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={iconAvatar} alt="" style={{ display: "block", width: "13px", height: "13px" }} />
    </span>
  );

  if (!platform) return circle;

  return (
    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      {circle}
      {/* A white ring lifts the mark off the grey circle it overlaps. */}
      <span
        style={{
          position: "absolute",
          right: "-5px",
          bottom: "-5px",
          display: "inline-flex",
          padding: "1.5px",
          borderRadius: "50%",
          background: sp.white,
        }}
      >
        <PlatformIcon platform={platform} size={14} />
      </span>
    </span>
  );
}
