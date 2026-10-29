import { useEffect, useState } from "react";
import type { Brand } from "../brand/types";
import { PlatformIcon } from "./PlatformIcon";
import { sp, space, radius, type } from "../theme";

/**
 * TODO — parked, not currently rendered.
 *
 * Shown in the Idea panel's thumbnail slot while the idea forms: the accounts
 * the analysis is drawing on, lit one at a time. Pulled back out because the
 * movement was too much next to everything else happening on the screen; the
 * slot is a plain skeleton again for now. Kept intact so picking it back up is
 * a one-line change in ContentCanvasResults.
 */
export function AccountScan({ brand, height }: { brand: Brand; height: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % brand.platforms.length), 1_400);
    return () => clearInterval(timer);
  }, [brand.platforms.length]);

  return (
    <div
      style={{
        width: "149px",
        height: `${height}px`,
        boxSizing: "border-box",
        padding: space[8],
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: space[4],
        borderRadius: radius[4],
        border: `1px solid ${sp.borderSub}`,
        background: sp.bg,
      }}
    >
      {brand.platforms.map((platform, i) => {
        const on = i === active;
        return (
          <div
            key={platform.type}
            style={{
              display: "flex",
              alignItems: "center",
              gap: space[8],
              padding: space[8],
              borderRadius: radius[4],
              background: on ? sp.white : "transparent",
              boxShadow: on ? "0px 2px 6px rgba(0,0,0,0.08)" : "none",
              opacity: on ? 1 : 0.45,
              transition: "opacity 0.3s ease-out, background 0.3s ease-out",
            }}
          >
            <PlatformIcon platform={platform.type} size={20} decorative />
            <span
              style={{
                minWidth: 0,
                fontSize: type.xs.size,
                lineHeight: type.xs.line,
                color: sp.textSecondary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {platform.handle}
            </span>
          </div>
        );
      })}
    </div>
  );
}
