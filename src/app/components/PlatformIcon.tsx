import type { PlatformType } from "../brand/types";
import { PLATFORM_META } from "../brand/fixtures";

import iconTwitter from "@/assets/platform/twitter.svg";
import iconInstagram from "@/assets/platform/instagram.svg";
import iconFacebook from "@/assets/platform/facebook.svg";

/**
 * The real exported marks, for the networks we have them for.
 *
 * These replaced hand-drawn approximations. Used as files rather than inlined
 * so the committed bytes are exactly what was exported — and so Instagram's two
 * radial gradients keep their own ids per file instead of colliding when the
 * icon renders more than once on a page.
 */
const ASSETS: Partial<Record<PlatformType, string>> = {
  twitter: iconTwitter,
  instagram: iconInstagram,
  facebook: iconFacebook,
};

/**
 * Each network's mark.
 *
 * `decorative` is the difference between the two places this appears. Beside a
 * handle (`@bruteforcegym`) the icon is the only thing naming the network, so
 * it carries a label; on a results card the network name is already in text
 * next to it, and labelling it too would just read the same word twice.
 */
export function PlatformIcon({
  platform,
  size = 16,
  decorative = false,
}: {
  platform: PlatformType;
  size?: number;
  decorative?: boolean;
}) {
  const label = PLATFORM_META[platform].label;
  const asset = ASSETS[platform];

  if (asset) {
    return (
      <img
        src={asset}
        alt={decorative ? "" : label}
        aria-hidden={decorative || undefined}
        style={{ display: "block", flexShrink: 0, width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  // No exported asset for these two yet. Drawn as circular badges so they sit
  // in the same shape language as the real marks above rather than reading as
  // a different icon set — swap in the real exports when they arrive.
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    style: { flexShrink: 0, display: "block" },
    ...(decorative ? { "aria-hidden": true } : { role: "img" as const, "aria-label": label }),
  };

  if (platform === "linkedin") {
    return (
      <svg {...common}>
        <rect width="16" height="16" rx="8" fill="#0A66C2" />
        <circle cx="5.1" cy="5.2" r="1.1" fill="#FFFFFF" />
        <rect x="4.1" y="6.9" width="2" height="5.4" fill="#FFFFFF" />
        <path
          d="M7.4 6.9h1.9v.8c.27-.47.94-.94 1.87-.94 1.47 0 2.03.94 2.03 2.47v3.1h-2V9.6c0-.73-.27-1.2-.94-1.2s-1 .47-1 1.2v2.73h-1.9V6.9Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect width="16" height="16" rx="8" fill="#030303" />
      <path
        d="M10.6 3.1H9.05v8.06a1.4 1.4 0 1 1-1.14-1.38V8.2a3.2 3.2 0 1 0 2.9 3.19V6.75a3.85 3.85 0 0 0 2.2.7V5.78a2.2 2.2 0 0 1-2.2-2.16V3.1Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
