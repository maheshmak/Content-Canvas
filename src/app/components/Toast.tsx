import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { PlatformType } from "../brand/types";
import { PlatformIcon } from "./PlatformIcon";
import { AiMark } from "./AiMark";
import { sp, space, radius, type, FONT } from "../theme";

export type ToastTone = "progress" | "success";

/**
 * What the icon slot shows while SoPi is working.
 *
 * Before there is an idea there is no subject yet, so it is the AI mark alone.
 * Once SoPi is on a specific account, that account's mark takes the slot — the
 * text already says "your Facebook post", and an icon that disagreed with the
 * text beside it was the weakest thing in the toast.
 *
 * **The sparkle does not leave, it becomes a badge.** Two reasons. The mark is
 * what says *SoPi* is doing this; a bare Facebook roundel on a pale blue toast
 * starts to read as a notification *from* Facebook rather than from us. And it
 * keeps the motion on our own glyph — animating someone else's logo is the kind
 * of thing brand guidelines exist to stop.
 */
function ProgressMark({ platform }: { platform?: PlatformType }) {
  if (!platform) return <AiMark />;
  return (
    <span style={{ position: "relative", display: "block", width: "20px", height: "20px", flexShrink: 0 }}>
      <PlatformIcon platform={platform} size={20} decorative />
      <span
        style={{
          position: "absolute",
          right: "-4px",
          bottom: "-4px",
          display: "flex",
          padding: "1px",
          borderRadius: "50%",
          // A ring in the toast's own ground, so the badge reads as sitting on
          // top of the mark rather than merging into it.
          background: sp.white,
        }}
      >
        <AiMark size={11} />
      </span>
    </span>
  );
}

/**
 * The frame's toast (7052:587293 › Toast — 266×40, r8, 8/16 padding, gap 8,
 * drop shadow y8 r12 at 12%), doing double duty.
 *
 * Both of the component set's shapes are here: `Title=No` (266×40, one line)
 * and `Title=Yes` (311×58, a SemiBold title over a Regular description). The
 * `progress` is the set's own `Type=Info` variant: `surface/info-subtle` ground
 * and the `BaseAIFilled` sparkle where Success puts its tick. A spinner sat
 * there before, which was both duller and not what the design says. The sparkle
 * twinkles rather than spins, so the liveness the spinner provided is kept
 * without borrowing a component the design doesn't use.
 *
 * **Why status lives here rather than on the cards.** Progress text sitting in
 * each card's image area was describing the same one job four times over, in
 * the place the result was about to appear. One line at the foot of the screen
 * says what is happening once, and leaves the cards to be cards.
 */
export function Toast({
  message,
  description,
  tone,
  platform,
}: {
  message: ReactNode;
  /** The frame's `Title=Yes` variant: a second, constant line under the
   *  changing one. Omit it and the toast is the 40px single-line form. */
  description?: string;
  tone: ToastTone;
  /** The account being worked on, if the run has reached that stage. Its mark
   *  replaces the bare sparkle so the icon agrees with the words beside it. */
  platform?: PlatformType;
}) {
  const [dismissed, setDismissed] = useState(false);

  /**
   * Success clears after five seconds — five seconds of being *on screen*.
   *
   * A plain `setTimeout` would burn the whole five while the tab is in the
   * background, which is the one case this screen is built around: we invite
   * people to leave and come back, and someone who does that would return to a
   * finished page with no confirmation that anything had happened. So the
   * countdown only runs while the page is visible, and starts fresh if it
   * wasn't. Either way nobody looking at it waits longer than five seconds.
   */
  useEffect(() => {
    if (tone !== "success") return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      clearTimeout(timer);
      if (document.hidden) return;
      timer = setTimeout(() => setDismissed(true), 5_000);
    };

    run();
    document.addEventListener("visibilitychange", run);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", run);
    };
  }, [tone]);

  // A new run re-arms it.
  useEffect(() => setDismissed(false), [tone]);

  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="cc-reveal"
      style={{
        width: "fit-content",
        maxWidth: "calc(100% - 32px)",
        display: "flex",
        alignItems: "center",
        gap: space[8],
        // 40 for the single-line variant, 58 for Title=Yes — both straight
        // off the component set.
        height: description ? "58px" : "40px",
        padding: `0 ${space[16]}`,
        boxSizing: "border-box",
        background: tone === "success" ? sp.successWash : sp.white,
        // The border carries the toast's type — `border/info` on the working
        // state, per the frame. It was `border/secondary` before: #F2F2F2
        // against a pale fill, which is why it looked as though the toast had
        // no border at all.
        border: `1px solid ${tone === "success" ? sp.success : sp.borderInfo}`,
        borderRadius: radius[8],
        boxShadow: "0px 8px 12px rgba(0,0,0,0.12)",
        fontFamily: FONT,
        fontSize: type.s.size,
        lineHeight: type.s.line,
        color: sp.textPrimary,
      }}
    >
      {tone === "success" ? (
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="7.5" fill={sp.success} />
          <path d="M4.6 8.3L6.9 10.6L11.4 5.8" stroke={sp.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <ProgressMark platform={platform} />
      )}

      {description ? (
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{message}</span>
          <span style={{ fontSize: type.xs.size, lineHeight: type.xs.line, color: sp.textSecondary, whiteSpace: "nowrap" }}>
            {description}
          </span>
        </span>
      ) : (
        <span style={{ whiteSpace: "nowrap" }}>{message}</span>
      )}

    </div>
  );
}

