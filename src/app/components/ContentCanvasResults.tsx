import { useState } from "react";
import type { ReactNode } from "react";
import type { Brand, GeneratedIdea } from "../brand/types";
import type { TemplateDef, TemplateState } from "../templates/schema";
import { PosterPreview } from "./PosterPreview";
import { PostColumn, mediaTint } from "./PostColumn";
import { Toast } from "./Toast";
import { NotifyOffer } from "./NotifyOffer";
import { useCompletionNotice, notificationPermission } from "./useCompletionNotice";
import { BottomNavBar } from "./chrome/BottomNavBar";
import { StepStatus } from "./StepStatus";
import type { StepState } from "./StepStatus";
import { PLATFORM_META } from "../brand/fixtures";
import type { Reveal } from "./useStagedReveal";
import { TOTAL_MS } from "./useStagedReveal";
import { sp, space, radius, type, FONT } from "../theme";

/**
 * Step 3 — the results screen, built to the Figma frame (7052:587293), and the
 * thing that now covers the generation wait instead of a separate loader.
 *
 * **Why there is no skeleton of this screen.** A skeleton is a promise about
 * duration: it exists to stop layout shift on sub-second fetches, and people
 * read shimmer as "almost there". Over the twenty-plus seconds this takes, that
 * promise breaks repeatedly, which irritates more than the wait itself. It also
 * throws away the two best things a slow job has going for it:
 *
 *   - **Facts already known at t=0.** The accounts come from the brand's
 *     connections, not from generation. Every column is labelled with its real
 *     mark, name and handle before any work starts, so the user can see how
 *     many posts are coming and who they're for.
 *   - **Partial completion.** The posts finish independently, one account at a
 *     time. Each lands on its own and is usable straight away, rather than
 *     everything unlocking at the end.
 *
 * The Schedule panel is deliberately never covered: "No shortlisted or
 * scheduled posts yet" is a real empty state, not a loading state, and greying
 * it out would turn a clear message into an ambiguous one.
 */
/* R1's panels, from the frame. The thumbnail slot is 149×208 there; our
   posters are 9:16, so at the full 149 wide one would stand 265 tall and push
   the panel past its height. Fit it to the slot instead — the whole poster,
   smaller — rather than cropping off the CTA line at its foot. */
const PANEL_MAX_H = 282;
const THUMB = { w: 149, h: 208 };

/**
 * How long to tell people it takes, derived from the constant that decides it.
 *
 * Written out by hand once, and it went stale the moment the phase around it
 * was rewritten — the ETA line was deleted with the block it lived in and
 * nobody noticed for several rounds. Reading it off `TOTAL_MS` means the
 * promise and the behaviour cannot drift apart again.
 */
function durationPhrase(totalMs: number): string {
  if (totalMs < 90_000) return "about a minute";
  return `about ${Math.round(totalMs / 60_000)} minutes`;
}

export function ContentCanvasResults({
  brand,
  idea,
  template,
  state,
  reveal,
  runId,
  onEditImage,
}: {
  brand: Brand;
  idea: GeneratedIdea;
  template: TemplateDef;
  state: TemplateState;
  /** Owned by `App`, so a run survives this screen being unmounted — which is
   *  what makes "you can leave this page" a true statement rather than a
   *  hopeful one. */
  reveal: Reveal;
  /** Identifies the run, so a completion notification fires once per run
   *  rather than once per mount. */
  runId: number;
  onEditImage: () => void;
}) {
  const thumbW = Math.min(THUMB.w, Math.round((THUMB.h * template.width) / template.height));
  const thumbH = Math.round((thumbW * template.height) / template.width);

  // `Notification.permission` is a browser global, not React state, so granting
  // it changes nothing on screen by itself. The offer row reports back and this
  // re-reads it — which is how the toast's promise can tighten the moment we
  // are actually able to keep it.
  const [permission, setPermission] = useState(notificationPermission);
  const willNotify = permission === "granted";

  useCompletionNotice({
    done: reveal.done,
    runId,
    title: "Your posts are ready",
    body: `SoPi finished ${reveal.total} post${reveal.total === 1 ? "" : "s"} for ${brand.name}.`,
  });

  return (
    <div
      style={{
        // A column, so the floating footer below can be pushed to the bottom
        // when the page is short — which it now is while the idea forms and
        // nothing else on the screen exists yet.
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        background: sp.bg,
        fontFamily: FONT,
      }}
    >
      {/* The header bar is the page chrome's, not this screen's — see
          `CanvasBreadcrumb`, passed through `AppShell`. */}
      <div style={{ display: "flex", flexDirection: "column", gap: space[24], padding: space[16] }}>
        {/* R1 — Idea (800) beside Schedule Post (502), gap 16. */}
        <div style={{ display: "flex", gap: space[16], alignItems: "stretch" }}>
          <Panel title="Idea" flex={800}>
            {/* Centred against the thumbnail: the four rows fill only the top
                third of a 282 panel, and left-aligned to the top they read as
                an unfinished page rather than a composed one. */}
            <div style={{ display: "flex", gap: space[16], alignItems: reveal.ideaReady ? "flex-start" : "center" }}>
              <div style={{ width: `${THUMB.w}px`, flexShrink: 0 }}>
                {/* Same treatment as the post cards: a dark tile the poster
                    develops out of. It starts resolving once half the idea's
                    fields are known — the picture and the words arrive by the
                    same clock rather than the thumbnail sitting inert until
                    the very end. Blur is scaled to the thumbnail's width, so
                    it reads as the same amount of softness as the 360-wide
                    cards rather than a heavier one. */}
                <div
                  style={{
                    position: "relative",
                    width: `${thumbW}px`,
                    height: `${thumbH}px`,
                    overflow: "hidden",
                    borderRadius: radius[4],
                    background: mediaTint(String(state.values.accentColor ?? template.previewColor)),
                  }}
                >
                  {reveal.ideaFieldsDone >= 2 && (
                    <div
                      className="cc-develop"
                      style={{
                        position: "absolute",
                        inset: 0,
                        filter: reveal.ideaReady ? "blur(0px) saturate(1)" : "blur(7px) saturate(0.75)",
                        opacity: reveal.ideaReady ? 1 : 0.85,
                        transform: reveal.ideaReady ? "none" : "scale(1.06)",
                      }}
                    >
                      <PosterPreview template={template} state={state} width={thumbW} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {reveal.ideaReady ? (
                  <div className="cc-reveal" style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
                    <Row label="Direction" value={idea.direction} />
                    <Row label="Audience" value={idea.audience} />
                    <Row label="Hook" value={`“${idea.hook}”`} />
                    <Row label="CTA" value={`“${idea.cta}”`} />
                  </div>
                ) : (
                  // The same four rows the result uses, with their values still
                  // to come. The panel now keeps one shape from start to finish
                  // instead of showing a checklist and then swapping it for
                  // something structurally unrelated.
                  <div style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
                    {[
                      { label: "Direction", value: idea.direction, widths: ["100%"] },
                      { label: "Audience", value: idea.audience, widths: ["100%"] },
                      { label: "Hook", value: `“${idea.hook}”`, widths: ["86%"] },
                      { label: "CTA", value: `“${idea.cta}”`, widths: ["74%"] },
                    ].map((row, i) => (
                      <StepRow
                        key={row.label}
                        {...row}
                        state={i < reveal.ideaFieldsDone ? "done" : i === reveal.ideaFieldsDone ? "active" : "pending"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {reveal.ideaReady && (
          <Panel
            title="Schedule Post"
            flex={502}
            action={
              <PanelButton disabled icon={<CalendarIcon />}>
                Schedule Now
              </PanelButton>
            }
          >
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: type.s.size, color: sp.textTertiary }}>No shortlisted or scheduled posts yet</span>
            </div>
          </Panel>
          )}
        </div>

        {/* R2 — one 392 column per account, scrolling horizontally. */}
        <style>{`.cc-columns::-webkit-scrollbar { display: none; }`}</style>
        <div
          className="cc-columns"
          style={{
            display: "flex",
            gap: space[16],
            overflowX: "auto",
            // Room for the focused card's shadow to exist in.
            //
            // `overflow-x: auto` is not a one-axis declaration: it forces the
            // computed `overflow-y` to `auto` as well, so this scroller was
            // cropping the highlight flat against its own top and bottom
            // edges. Padding gives the shadow somewhere to land, and the
            // matching negative margin keeps every card exactly where it was
            // — the scroll area simply now runs to the page edge, which is
            // what a carousel should do anyway.
            // Deeper vertically than horizontally, because the shadow is
            // offset downward: at the glow's peak it reaches 19px below the
            // card but only 14 to either side. 16 was enough for the hard
            // ring and would now shave the soft edge off the bottom.
            padding: `${space[24]} ${space[16]}`,
            // `calc`, not a leading minus: these are custom properties, and
            // `-var(--sp-space-16)` is not valid CSS — it parses to nothing
            // and the compensation silently does not happen.
            margin: `calc(-1 * ${space[24]}) calc(-1 * ${space[16]})`,
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {/* The whole row arrives together, once there is an idea for it to
              be about. Building it up card by card hid the scope of the job —
              on a long run the user could not tell whether two more posts were
              coming or six — and made the row reflow under them repeatedly.
              All four are up front now, and *focus* carries the progress: the
              card being written is lit, the ones still queued are held back.

              The stagger is 60ms, which is cadence rather than sequence: the
              row unfurls left to right inside a quarter second and reads as
              one movement. */}
          {reveal.ideaReady && brand.platforms.map((platform, i) => (
            <PostColumn
              key={platform.type}
              brand={brand}
              platform={platform}
              idea={idea}
              template={template}
              state={state}
              stage={reveal.stageOf(platform.type)}
              focus={
                !reveal.hasStarted(platform.type)
                  ? "queued"
                  : reveal.stageOf(platform.type) === 2
                    ? "done"
                    : "active"
              }
              revealDelayMs={i * 60}
              onEditImage={onEditImage}
            />
          ))}
        </div>
      </div>

      {/* Floating footer: pinned to the foot of the viewport when the page is
          short, and sticking there once it scrolls. */}
      <div
        style={{
          marginTop: "auto",
          position: "sticky",
          bottom: 0,
          zIndex: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: space[16],
          padding: `${space[16]} 0 ${space[24]}`,
        }}
      >
        {/* One status line for the whole screen. Everything it says is read off
            the same state the cards render from, so it can never narrate work
            that isn't visibly happening. */}
        <Toast
          tone={reveal.done ? "success" : "progress"}
          description={
            reveal.done
              ? undefined
              : willNotify
                // Copy follows capability: once the browser will actually tell
                // them, stop asking them to remember to come back.
                ? `This usually takes ${durationPhrase(TOTAL_MS)}. We'll notify you when they're ready.`
                : `This usually takes ${durationPhrase(TOTAL_MS)}. Feel free to leave and come back anytime.`
          }
          platform={!reveal.done && reveal.ideaReady ? (reveal.active ?? undefined) : undefined}
        message={
          reveal.done
            ? "SoPi created your posts successfully"
            : !reveal.ideaReady
              ? "SoPi is creating your idea…"
              : reveal.active ? (
                <>
                  SoPi is writing your {PLATFORM_META[reveal.active].label} post{" "}
                  {/* Bracketed and held back: the count is an aside to the
                      sentence, not part of it. */}
                  <span style={{ fontWeight: 400, color: sp.textSecondary }}>
                    ({reveal.activeIndex} of {reveal.total})
                  </span>
                </>
              ) : (
                // Every post has landed but the run hasn't been declared done.
                // Previously this branch fell through to the writing message,
                // which named a platform that had finished long before and
                // counted one past the total.
                "SoPi is finishing up…"
              )
          }
        />

        {/* What makes "feel free to leave" worth acting on: something that
            reaches the user once they have. Only raised on runs long enough to
            warrant it — see `NOTIFY_MIN_MS`. */}
        <NotifyOffer
          running={!reveal.done}
          totalMs={TOTAL_MS}
          onPermissionChange={() => setPermission(notificationPermission())}
        />

        <BottomNavBar hidden={!reveal.done} />
      </div>

      <style>{`
        /* The payoff — a genie, after the Dock's un-minimise. A real genie is
           a mesh warp with curved sides, which CSS can't express; what carries
           the impression is the *funnel*: a narrow sliver rising from a point
           below, widening as it goes and overshooting a touch before it
           settles. Anchored at bottom centre, so it unfurls upward. */
        /* A genie, but a local one — the card unfurls upward from its own
           foot rather than flying in from the toast.

           Flying from the toast read badly for three reasons, and none of them
           were tuning problems. The travel is up to 760px for the outer cards,
           so a full-height card sweeps laterally across everything already on
           screen. Starting at 6% means a 392×900 card spends most of the
           animation as an illegible speck. And a 900px card "emerging from" a
           58px toast is a scale mismatch the eye simply rejects — the Dock
           genie works because both ends are warped along one funnel, which is
           the part CSS can't do.

           What actually ties the card to the toast is that the toast names the
           platform at the instant the card appears. That connection is made by
           timing and language; it did not need the motion to carry it. */
        @keyframes cc-genie {
          0%   { opacity: 0; transform: translateY(28px) scale(0.42, 0.72); }
          30%  { opacity: 1; }
          100% { opacity: 1; transform: translateY(0) scale(1, 1); }
        }
        @keyframes cc-pulse { 50% { opacity: 0.35; } }
        .cc-develop { transition: filter 0.75s ease-out, opacity 0.75s ease-out, transform 0.75s ease-out; }
        .cc-genie {
          transform-origin: bottom center;
          backface-visibility: hidden;
          animation: cc-genie 0.52s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .cc-pulse { animation: cc-pulse 1.2s ease-in-out infinite; }
        /* Focus moves along the row rather than jumping: the previous card
           dims out as the next lights up, which is what makes the highlight
           read as a position in a queue instead of four separate flashes. */
        .cc-focus { transition: opacity 0.4s ease-out, border-color 0.4s ease-out, box-shadow 0.4s ease-out; }
        /* .cc-shimmer, .cc-spinner/@keyframes cc-spin, .cc-reveal,
           .cc-ai-major/.cc-ai-minor, and .cc-lit — their keyframes,
           gradients and reduced-motion fallbacks — now live in
           src/styles/index.css, shared with the starting page's own
           checklist, heading mark, and loading glow. */
        @media (prefers-reduced-motion: reduce) {
          /* The sequencing stays — it reports what is finished and what is
             still running. Only the decoration goes. */
          .cc-genie, .cc-pulse { animation: none; }
          .cc-develop, .cc-focus { transition: none; }
        }
      `}</style>
    </div>
  );
}

function Panel({ title, flex, action, children }: { title: string; flex: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section
      style={{
        flex: `${flex} 1 0`,
        minWidth: 0,
        maxHeight: `${PANEL_MAX_H}px`,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: space[16],
        display: "flex",
        flexDirection: "column",
        gap: space[8],
        background: sp.white,
        border: `1px solid ${sp.borderSub}`,
        borderRadius: radius[8],
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: space[16], height: "32px" }}>
        {/* Tab Base / Modal Header from the frame: 14px **Regular** — not
            semibold — with 8 of horizontal padding, then a 4 gap and a 1px
            indicator running the tab's full width.

            The indicator is `brand/secondary-500` (#FFDC53), which is *not*
            the yellow the top nav's tab uses (#FFCB00, `ai/yellow-500`). The
            two are a well-set trap in this design system; see tokens.css. */}
        <span style={{ display: "inline-flex", flexDirection: "column", gap: space[4] }}>
          <span
            style={{
              padding: `0 ${space[8]}`,
              fontSize: type.s.size,
              lineHeight: type.s.line,
              fontWeight: 400,
              color: sp.textPrimary,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
          <span aria-hidden style={{ height: "1px", background: sp.gold }} />
        </span>
        {action ? <span style={{ marginLeft: "auto" }}>{action}</span> : null}
      </div>
      {children}
    </section>
  );
}

/**
 * A tertiary action, the same treatment the post cards use for "Create": no
 * container, icon then label, blue when live and greyed when not. One action
 * style across the page rather than one per panel.
 */
function PanelButton({ children, icon, disabled }: { children: ReactNode; icon: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: space[4],
        height: "32px",
        padding: `0 ${space[8]}`,
        border: "none",
        borderRadius: radius[2],
        background: "none",
        color: disabled ? sp.textDisabled : sp.blue,
        fontFamily: FONT,
        fontSize: type.s.size,
        whiteSpace: "nowrap",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * One of the idea's four fields while it is still being written.
 *
 * Carries the marker treatment the findings checklist used — tick, spinner,
 * hollow ring — because that was the part that read as *working*. Same label
 * column and line box as the finished `Row`, so nothing shifts underneath as
 * the values arrive.
 */
function StepRow({
  label,
  value,
  widths,
  state,
}: {
  label: string;
  value: string;
  widths: string[];
  state: StepState;
}) {
  return (
    <div style={{ display: "flex", gap: space[8] }}>
      <StepStatus state={state} />
      <span style={{ flexShrink: 0, width: "76px", fontSize: type.s.size, lineHeight: "20px", color: sp.textTertiary }}>{label}</span>
      {state === "done" ? (
        <span className="cc-reveal" style={{ flex: 1, minWidth: 0, fontSize: type.s.size, lineHeight: "20px", color: sp.textPrimary }}>
          {value}
        </span>
      ) : (
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: space[4], paddingTop: "5px" }}>
          {widths.map((w, i) => (
            <span key={i} className="cc-shimmer" style={{ display: "block", width: w, height: "10px", borderRadius: radius[4] }} />
          ))}
        </span>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: space[8] }}>
      <span style={{ flexShrink: 0, width: "76px", fontSize: type.s.size, color: sp.textTertiary }}>{label}</span>
      <span style={{ fontSize: type.s.size, lineHeight: type.s.line, color: sp.textPrimary }}>{value}</span>
    </div>
  );
}
