import { sp } from "../theme";

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
 */
export function AccountAvatar({ size = 32 }: { size?: number }) {
  return (
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
}
