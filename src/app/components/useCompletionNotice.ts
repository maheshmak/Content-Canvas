import { useEffect, useRef } from "react";

/** Whether this browser exposes the Notification API at all. It is absent on
 *  insecure origins and in some embedded contexts, so every call site has to
 *  tolerate its absence rather than assume it. */
export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/**
 * Tells the user their posts are ready — when they aren't looking.
 *
 * The point of a two-minute wait is that nobody should sit through it. That
 * only works if something reaches them once they've walked away, which is what
 * this is: the browser notification that closes the loop the "feel free to
 * leave" copy opens.
 *
 * **Only when the tab is hidden.** Announcing a result the user is already
 * looking at is noise, and it is the fastest way to teach someone to turn
 * notifications off. The screen itself already says so, loudly, in the toast.
 *
 * Fires once per run: `sent` is keyed to the run, so a re-render after
 * completion can't post a second copy.
 */
export function useCompletionNotice({
  done,
  runId,
  title,
  body,
}: {
  done: boolean;
  runId: number;
  title: string;
  body: string;
}) {
  const sentFor = useRef<number | null>(null);

  useEffect(() => {
    if (!done || sentFor.current === runId) return;
    if (!notificationsSupported() || Notification.permission !== "granted") return;
    if (!document.hidden) return;

    sentFor.current = runId;
    // Wrapped: the constructor throws on some platforms (older mobile Safari
    // requires a service worker), and a failed courtesy notification must
    // never take the page down with it.
    try {
      new Notification(title, { body, tag: `content-canvas-${runId}` });
    } catch {
      /* no-op — the on-screen toast is the primary channel regardless. */
    }
  }, [done, runId, title, body]);
}
