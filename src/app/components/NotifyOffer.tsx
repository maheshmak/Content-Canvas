import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { notificationPermission, notificationsSupported } from "./useCompletionNotice";
import { sp, space, radius, type, FONT } from "../theme";

/** Below this, the wait is short enough to watch and the offer is just one more
 *  thing to dismiss. Offering notifications for a one-minute job is how people
 *  learn to reflexively decline them. */
export const NOTIFY_MIN_MS = 90_000;
/** How far into the run before it appears. Cursor, Replit and Runway all raise
 *  theirs once the work is visibly under way — asking at t=0 competes with the
 *  thing the user actually came to watch. */
const OFFER_AFTER_MS = 8_000;

/**
 * The offer to be told when it's finished.
 *
 * **Why a pre-prompt rather than the browser dialog.** Calling
 * `Notification.requestPermission()` unasked is the classic way to get
 * permanently blocked: a denial is final and the API can never ask again. This
 * row absorbs the "no" instead — `Not now` never touches the browser at all, so
 * the real permission prompt is only ever shown to somebody who has already
 * said yes to us.
 */
export function NotifyOffer({
  running,
  totalMs,
  onPermissionChange,
}: {
  /** Only offered while a run is in flight. */
  running: boolean;
  totalMs: number;
  onPermissionChange: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [asking, setAsking] = useState(false);

  const worthOffering = running && totalMs >= NOTIFY_MIN_MS && notificationPermission() === "default";

  useEffect(() => {
    if (!worthOffering) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), OFFER_AFTER_MS);
    return () => clearTimeout(timer);
  }, [worthOffering]);

  if (!visible || !worthOffering || declined) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: space[8], fontFamily: FONT }}>
      <span style={{ fontSize: type.xs.size, lineHeight: type.xs.line, color: sp.textSecondary }}>
        Get notified when your posts are ready
      </span>
      <TertiaryAction
        onClick={async () => {
          if (!notificationsSupported() || asking) return;
          setAsking(true);
          try {
            await Notification.requestPermission();
          } finally {
            setAsking(false);
            setDeclined(true);
            onPermissionChange();
          }
        }}
        tone="primary"
      >
        Enable
      </TertiaryAction>
      {/* Dismisses without ever calling the browser — see the note above. */}
      <TertiaryAction onClick={() => setDeclined(true)}>Not now</TertiaryAction>
    </div>
  );
}

/** The same borderless treatment the panels' actions use, so the footer reads
 *  as one surface rather than acquiring a second button language. */
function TertiaryAction({
  children,
  onClick,
  tone = "muted",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "primary" | "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "24px",
        padding: `0 ${space[8]}`,
        border: "none",
        borderRadius: radius[2],
        background: "none",
        color: tone === "primary" ? sp.blue : sp.textSecondary,
        fontFamily: FONT,
        fontSize: type.xs.size,
        fontWeight: tone === "primary" ? 600 : 400,
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
