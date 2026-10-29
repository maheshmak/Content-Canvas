import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Brand, IdeaMotif as Motif, IdeaSeed, PlatformType } from "../brand/types";
import { rankPresets, UPCOMING_MOMENTS } from "../brand/generateIdea";
import { describeBrand, parseBrandName } from "../brand/describeBrand";
import { hasHistory, ANALYTICS_WINDOW_DAYS } from "../brand/fixtures";
import { sp, space, radius, type, FONT } from "../theme";
import { prefersReducedMotion } from "../motion";
import { TextArea } from "./ds";
import { InfoIcon } from "./icons";
import { AccountAvatar } from "./AccountAvatar";
import { AiMark } from "./AiMark";
import { IdeaMotif, momentDate } from "./IdeaMotif";
import type { CalendarDate } from "./IdeaMotif";
import { useBrandLoadSequence } from "./useBrandLoadSequence";
import type { BrandLoadSequence, LoadSection } from "./useBrandLoadSequence";

import iconButtonAi from "@/assets/chrome/button-ai.svg";

/** Identity of the selected idea, for comparing against the chip row. */
function seedKey(seed: IdeaSeed | undefined): string {
  if (!seed) return "surprise";
  return seed.kind === "preset" ? `preset:${seed.presetId}` : `moment:${seed.moment}`;
}

/**
 * Post ideas is parked. With one account the canvas makes one post, and the
 * chip row was only ever a way to steer which idea that post is built on —
 * the engine's own pick stands in for it. The row, its state and `IdeaCard`
 * are all still here; flip this to bring it back (and its wait with it, via
 * `SECTIONS`).
 */
const SHOW_POST_IDEAS = false;

/**
 * "+ Add account" is parked with it — the page shows one pre-selected account
 * for now (see `PRESELECTED_PLATFORMS`), so there is nothing to add yet.
 */
const SHOW_ADD_ACCOUNT = false;

/**
 * The account(s) the page shows, ticked for the user.
 *
 * Display only. The brand still carries every connected account, and the
 * results screen still writes a post for each of them — this narrows what the
 * starting page puts in front of the user, not what gets generated.
 */
const PRESELECTED_PLATFORMS: PlatformType[] = ["facebook"];

/**
 * The post count the "About your brand" source note quotes. Fixed rather than
 * summed from the brand's analytics: those add up every connected account,
 * while the page now shows one — so the note would claim posts from accounts
 * the user can't see here.
 */
const SOURCE_POST_COUNT = 20;

/**
 * The sections in the order they arrive, which is also the order they sit on
 * the page. Accounts first: it is what the rest of the page is about, and
 * everything SoPi writes in "About your brand" is read from it.
 *
 * Module-level so the array is the same object every render —
 * `useBrandLoadSequence` restarts whenever it changes.
 */
const SECTIONS: readonly LoadSection[] = SHOW_POST_IDEAS ? ["accounts", "about", "ideas"] : ["accounts", "about"];

/**
 * Step 1 — the screen this replaces is one textarea headed "Tell us about your
 * brand", with a secondary escape and a primary button.
 *
 * So that is the shape this keeps, and the automation is stated literally: the
 * form arrives already filled in. Everything the old stats block showed (reach,
 * trend, voice) now lives inside the description, which is where the user would
 * have written it themselves.
 *
 * Two subjects live here and they stay separate: **the form is about the brand,
 * the ideas row is about the post.** Picking an idea must never disturb the
 * brand form — one button at the end acts on both.
 *
 * A brand with nothing published gets an empty description, which is precisely
 * the screen this replaces. The feature degrades to its own predecessor rather
 * than to a broken variant full of zeroes.
 */
export function BrandContextStep({
  brand,
  onRenameBrand,
  onGenerate,
}: {
  brand: Brand;
  onRenameBrand: (name: string) => void;
  onGenerate: (context: string, seed?: IdeaSeed) => void;
}) {
  const reduce = prefersReducedMotion();
  const established = hasHistory(brand);

  const inferred = useMemo(() => describeBrand(brand), [brand]);
  const [description, setDescription] = useState(inferred);

  // Two angles off the top of the same ranking the button reads, plus the
  // occasion it would otherwise pick silently. Three is the ceiling: any more
  // and the row becomes a menu to evaluate rather than a choice to make.
  const ideas = useMemo(() => {
    const angles = rankPresets(brand, description).slice(0, 2);
    const moments = UPCOMING_MOMENTS[brand.vertical] ?? [];
    return [
      ...angles.map((preset) => ({
        label: preset.label,
        motif: preset.motif,
        date: null as CalendarDate | null,
        seed: { kind: "preset", presetId: preset.id } as IdeaSeed,
      })),
      // Moments are phrased to slot into "Based on {moment}", so some are
      // lowercase fragments. Capitalise for the chip, where the same string
      // has to stand on its own as a label.
      ...(moments.length
        ? [
          {
            label: moments[0].charAt(0).toUpperCase() + moments[0].slice(1),
            motif: "date" as Motif,
            date: momentDate(moments[0]),
            seed: { kind: "moment", moment: moments[0] } as IdeaSeed,
          },
        ]
        : []),
    ];
  }, [brand, description]);

  // Default selection is the first card option (ideas[0])
  const [seed, setSeed] = useState<IdeaSeed | undefined>(() => ideas[0]?.seed);

  // Ensure first card is selected by default when ideas load
  useEffect(() => {
    if (!seed && ideas.length > 0) {
      setSeed(ideas[0].seed);
    }
  }, [ideas]);

  useEffect(() => setDescription(inferred), [inferred]);

  const handleDescriptionChange = (next: string) => {
    setDescription(next);
    const parsed = parseBrandName(next, brand.name);
    if (parsed !== brand.name) onRenameBrand(parsed);
  };

  const [mounted, setMounted] = useState(reduce);
  useEffect(() => {
    if (reduce) return;
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(timer);
  }, [brand.id, reduce]);

  const step = (index: number) => ({ mounted, reduce, delay: index * 70 });

  /**
   * Stands in for the brand's data arriving — its description derived from
   * post history, its connected accounts, its ranked idea suggestions.
   * Everything here is already sitting in a local fixture, but the real
   * screen this replaces would be scanning connected accounts, which is a
   * short, bounded read rather than the open-ended generation the results
   * screen exists to cover. That's why sections simply appear one at a time
   * rather than borrowing that screen's skeleton or toast — nobody needs a
   * progress mechanism for a wait measured in seconds; they just need to see
   * the page build itself.
   *
   * The header (brand identity) is deliberately exempt — it's who was
   * already selected, not something fetched, so it keeps the page's original
   * fast entrance instead of waiting behind the rest.
   */
  const seq = useBrandLoadSequence(brand.id, reduce, SECTIONS);

  // One tick after each section arrives — the pause `Step` needs to actually
  // animate rather than mount already at rest. `useBrandLoadSequence` owns
  // *when* a section is due; this owns how it enters. Called unconditionally,
  // same as any hook, even though only the arrived section's render path
  // ever reads the value it returns.
  const accountsRevealed = useRevealOnDone(seq.stepDone("accounts"), reduce);
  const aboutRevealed = useRevealOnDone(seq.stepDone("about"), reduce);
  const ideasRevealed = useRevealOnDone(seq.stepDone("ideas"), reduce);
  // Delayed past HINT_EXIT_MS so the button only starts fading in once
  // LoadingHint has finished fading out — see useRevealOnDone's comment.
  const buttonRevealed = useRevealOnDone(seq.allLoaded, reduce, HINT_EXIT_MS + 20);
  const hintMounted = useFadeOutUnmount(!seq.allLoaded, HINT_EXIT_MS, reduce);

  const selectedKey = seedKey(seed);
  const noAccounts = brand.platforms.length === 0;
  // Falls back to the first connected account rather than showing none, for a
  // brand that has accounts but not the pre-selected one.
  const preselected = brand.platforms.filter((p) => PRESELECTED_PLATFORMS.includes(p.type));
  const accounts = preselected.length ? preselected : brand.platforms.slice(0, 1);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        overflowY: "auto",
        padding: space[24],
        boxSizing: "border-box",
        background: sp.bg,
        fontFamily: FONT,
      }}
    >
      {/* Single card modal container. The breathing glow the results screen
          puts on its own actively-working card, here on the whole card while
          `!seq.allLoaded`. Mixed from the same colour as the border it sits
          against (`sp.borderActive`, not the more saturated `sp.blue`) —
          two different blues never merged, however low the alpha; one
          colour, softened, reads as the border's own light rather than a
          separate smear next to it. */}
      <div
        className={!seq.allLoaded ? "cc-lit" : undefined}
        style={{
          width: "800px",
          maxWidth: "100%",
          margin: "auto",
          background: sp.white,
          border: `1px solid ${!seq.allLoaded ? sp.borderActive : sp.borderSub}`,
          borderRadius: radius[16],
          padding: space[24],
          boxSizing: "border-box",
          boxShadow: !seq.allLoaded
            ? `0 0 4px 1px color-mix(in srgb, ${sp.borderActive} 35%, transparent), 0 2px 8px -2px color-mix(in srgb, ${sp.borderActive} 28%, transparent)`
            : "none",
          transition: reduce ? undefined : "border-color 0.4s ease-out, box-shadow 0.4s ease-out",
          display: "flex",
          flexDirection: "column",
          gap: space[16],
        }}
      >
        {/* The page's own heading, not the brand's — the top bar used to
            carry "Content Canvas" and is now gone entirely on this screen
            (it's the entry point, not a canvas anyone's inside yet), so this
            takes over saying where you are. Which brand this is still comes
            through immediately after, in the "About your brand" text
            itself. The mark stands in for the avatar the brand identity row
            used to carry — static, not twinkling; the loading hint below
            already carries the "still working" signal, and having it twice
            was one too many. */}
        <Step {...step(1)} style={{ display: "flex", alignItems: "center", gap: space[12] }}>
          <AiMark size={24} animated={false} />
          <h1 style={{ margin: 0, minWidth: 0, fontSize: "20px", lineHeight: "26px", fontWeight: 600, color: sp.textPrimary }}>
            Welcome to Content Canvas
          </h1>
        </Step>

        {/* Step 1: Accounts — doesn't exist until it arrives. */}
        {seq.stepDone("accounts") && (
          <Step mounted={accountsRevealed} reduce={reduce} delay={0} style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
            <label style={{ fontSize: type.s.size, lineHeight: type.s.line, fontWeight: 600, color: sp.textPrimary }}>
              Account
            </label>
            {noAccounts ? (
              <AccountsEmptyState />
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: space[8], alignItems: "center" }}>
                {[...accounts]
                  .sort((a, b) => {
                    const order: Record<string, number> = { facebook: 1, instagram: 2, twitter: 3, linkedin: 4, tiktok: 5 };
                    return (order[a.type] ?? 99) - (order[b.type] ?? 99);
                  })
                  .map((p) => (
                    <AccountRow key={p.type} brandName={brand.name} platform={p} />
                  ))}
                {SHOW_ADD_ACCOUNT && (
                  <button
                    type="button"
                    title="Adding accounts is coming soon"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: space[4],
                      padding: 0,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: sp.textSecondary,
                      fontFamily: FONT,
                      fontSize: type.s.size,
                      lineHeight: type.s.line,
                      textDecoration: "underline",
                      textDecorationColor: sp.textSecondary,
                      textUnderlineOffset: "2px",
                    }}
                  >
                    + Add account
                  </button>
                )}
              </div>
            )}
          </Step>
        )}

        {/* Step 2: About your brand */}
        {seq.stepDone("about") && (
          <Step mounted={aboutRevealed} reduce={reduce} delay={0} style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
            <div style={{ display: "flex", alignItems: "center", gap: space[4] }}>
              <label
                htmlFor="brand-description"
                style={{ fontSize: type.s.size, lineHeight: type.s.line, fontWeight: 600, color: sp.textPrimary }}
              >
                About your brand
              </label>
              {established && (
                <SourcePopover postCount={SOURCE_POST_COUNT} accountCount={accounts.length} />
              )}
            </div>
            <TextArea
              id="brand-description"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="e.g. Copperline Bakery — a neighbourhood bakery known for sourdough and early mornings"
              rows={3}
              // A little taller than the design system's 96px floor: this is
              // the one field on the page the user is invited to rewrite, and
              // the description it opens with runs to several lines.
              style={{ minHeight: "120px" }}
            />
          </Step>
        )}

        {/* Step 3: Post ideas — parked, see `SHOW_POST_IDEAS`. */}
        {SHOW_POST_IDEAS && seq.stepDone("ideas") && (
          <Step mounted={ideasRevealed} reduce={reduce} delay={0} style={{ display: "flex", flexDirection: "column", gap: space[8] }}>
            <span
              id="ideas-label"
              style={{ fontSize: type.s.size, lineHeight: type.s.line, fontWeight: 600, color: sp.textPrimary }}
            >
              Post ideas
            </span>
            <style>{`.ideas-carousel::-webkit-scrollbar { display: none; }`}</style>
            <div
              role="radiogroup"
              aria-labelledby="ideas-label"
              className="ideas-carousel"
              style={{
                display: "flex",
                gap: space[8],
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {ideas.map((idea, i) => (
                <IdeaCard
                  key={idea.label}
                  selected={selectedKey === seedKey(idea.seed)}
                  onClick={() => setSeed(idea.seed)}
                  label={idea.label}
                  motif={idea.motif}
                  date={idea.date}
                  index={i}
                />
              ))}
              <IdeaCard
                selected={selectedKey === "surprise"}
                onClick={() => setSeed(undefined)}
                label="Surprise me"
                motif="surprise"
                index={ideas.length}
              />
            </div>
          </Step>
        )}

        {/* One small "still working" cue — everything else on this page is
            plain sequential appearance with nothing marking the wait, and on
            its own that read as broken rather than in progress: nothing
            visibly happening under whatever landed last. This sits right
            below the last section that arrived (structurally, simply by
            being the next thing in the tree after the conditionally-
            rendered section blocks) and disappears the moment there's
            nothing left to wait for. */}
        {hintMounted && <LoadingHint text={loadingHintText(seq)} visible={!seq.allLoaded} reduce={reduce} />}

        {/* Step 4: Generate button — nothing left to check once the last
            section has arrived. */}
        {seq.allLoaded && (
          <Step mounted={buttonRevealed} reduce={reduce} delay={0} style={{ display: "flex", justifyContent: "flex-end", marginTop: space[4] }}>
            <button
              type="button"
              disabled={noAccounts}
              title={noAccounts ? "Connect an account before generating posts" : undefined}
              // With the idea row hidden, `seed` is only the row's default
              // highlight — a choice nobody made. Leave the pick to the engine.
              onClick={() => onGenerate(description, SHOW_POST_IDEAS ? seed : undefined)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: space[4],
                height: "32px",
                padding: `0 ${space[16]}`,
                border: "none",
                borderRadius: radius[2],
                background: noAccounts ? sp.blueDisabled : sp.blue,
                color: sp.white,
                fontFamily: FONT,
                fontSize: type.s.size,
                lineHeight: type.s.line,
                fontWeight: 400,
                whiteSpace: "nowrap",
                cursor: noAccounts ? "not-allowed" : "pointer",
              }}
            >
              <span
                aria-hidden
                style={{ width: "20px", height: "20px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img src={iconButtonAi} alt="" style={{ display: "block", width: "18.3333px", height: "18.3333px" }} />
              </span>
              Create
            </button>
          </Step>
        )}
      </div>
    </div>
  );
}

/**
 * Where the description came from.
 *
 * Opens on **click**, not hover: a native `title` tooltip doesn't exist on
 * touch devices, and this is the only thing on the screen proving the
 * description was derived from real data rather than invented. Hover-only would
 * put that proof out of reach on a phone.
 *
 * Dismissal mirrors `BrandSwitcher` — a `click` listener on the document, never
 * `pointerdown`, which unmounts the panel before an inner click can land.
 */
/**
 * Opens on hover, and on keyboard focus so it isn't mouse-only.
 *
 * Tap still toggles it, which is the whole reason the trigger stays a
 * `<button>`: hover doesn't exist on a touch screen, and this popover is the
 * only thing on the page showing that the description was written from real
 * posts rather than invented.
 */
function SourcePopover({ postCount, accountCount }: { postCount: number; accountCount: number }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-describedby={open ? "brand-source-note" : undefined}
        aria-label="Where this came from"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          border: "none",
          background: "none",
          color: sp.textTertiary,
          cursor: "pointer",
        }}
      >
        <InfoIcon width={14} height={14} />
      </button>

      {open && (
        <span
          id="brand-source-note"
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: `-${space[8]}`,
            zIndex: 20,
            width: "268px",
            padding: `${space[12]} ${space[16]}`,
            background: sp.white,
            border: `1px solid ${sp.borderSub}`,
            borderRadius: radius[8],
            boxShadow: "0px 8px 24px rgba(0,0,0,0.14)",
            fontSize: type.xs.size,
            lineHeight: type.xs.line,
            fontWeight: 400,
            color: sp.textSecondary,
          }}
        >
          Written from <strong style={{ fontWeight: 600, color: sp.textPrimary }}>{postCount} posts</strong> across your{" "}
          <strong style={{ fontWeight: 600, color: sp.textPrimary }}>
            {accountCount} {accountCount === 1 ? "account" : "accounts"}
          </strong>
          , and how far each one reached in the last {ANALYTICS_WINDOW_DAYS} days.
        </span>
      )}
    </span>
  );
}


/**
 * What to say while waiting on the section that hasn't arrived yet.
 *
 * Named for what SoPi is doing, not for the section it fills in — "finding
 * your connected account" is the work; "Account" is just the label the
 * result sits under. Read off `seq` directly rather than passed in as an
 * index, so the copy and the section it describes can never point at two
 * different steps.
 */
function loadingHintText(seq: BrandLoadSequence): string {
  if (!seq.stepDone("accounts")) return "SoPi is finding your connected account…";
  // Also the line that holds while the hint fades out. Everything is done by
  // then, so with Post ideas parked, falling through would flip the text to
  // work that was never part of the wait.
  if (!SHOW_POST_IDEAS || !seq.stepDone("about")) return "SoPi is collecting information about your brand…";
  return "SoPi is picking a few post ideas for you…";
}

/**
 * The one visible sign that the page is still doing something, while
 * sections arrive one at a time below it.
 *
 * A first pass at this removed every loading cue in favour of plain
 * sequential appearance — sections simply didn't exist until their turn. On
 * its own that was indistinguishable from broken: with three whole seconds
 * between the header and anything else, a blank card reads as a stall, not
 * as work in progress. A second pass added one generic line ("getting things
 * ready"); this one instead says what's actually happening for however long
 * that specific thing is actually happening — see `loadingHintText`.
 *
 * `visible` drives its own fade-and-collapse (via `Step`, the same block
 * every other section on this page uses to enter) rather than the caller
 * hard-unmounting it: the parent keeps this mounted for `HINT_EXIT_MS` past
 * the moment loading finishes (via `useFadeOutUnmount`) specifically so
 * `visible={false}` has time to play — both the fade and the height
 * collapsing smoothly to nothing — before the node is actually removed.
 * Without that, the message would vanish (and the layout would jump by its
 * height) on the same frame the Generate button starts appearing.
 */
function LoadingHint({ text, visible, reduce }: { text: string; visible: boolean; reduce: boolean }) {
  return (
    <Step
      mounted={visible}
      reduce={reduce}
      delay={0}
      style={{ display: "flex", alignItems: "center", gap: space[8], padding: `${space[8]} 0` }}
    >
      <span
        aria-hidden
        className="cc-spinner"
        style={{ width: "14px", height: "14px", flexShrink: 0, borderRadius: "50%", border: `2px solid ${sp.borderSub}`, borderTopColor: sp.blue }}
      />
      <span style={{ fontSize: type.s.size, lineHeight: type.s.line, color: sp.textTertiary }}>
        {text}
      </span>
    </Step>
  );
}

/**
 * One block of the entrance (or exit) sequence.
 *
 * Driven by a state flag and CSS `transition`, deliberately not a CSS
 * `animation`. An animation with `fill-mode: both` holds its `from` state —
 * `opacity: 0` — until it runs, and browsers freeze animations in hidden
 * documents; the pair renders the screen permanently blank. A transition always
 * ends at the mounted state whether or not it ever plays.
 *
 * **Height animates too, not just opacity.** Every section on this page is
 * conditionally rendered — it doesn't exist in the DOM until its turn — so
 * the moment it mounts, a plain opacity fade was fading in *within a box
 * that had already snapped to full height on the very same frame*. The card
 * visibly jumped taller, and only the pixels inside that already-jumped
 * space eased in — which is exactly the "comes suddenly" this was reported
 * as. The fix is the standard 0fr→1fr grid trick: the outer element's own
 * height is what animates, from nothing up to the content's natural size, so
 * a section grows into view instead of appearing already-sized. The inner
 * `overflow: hidden` wrapper is required for the row's interpolated height
 * to actually clip the content rather than the content just poking out.
 */
function Step({
  mounted,
  reduce,
  delay,
  style,
  children,
}: {
  mounted: boolean;
  reduce: boolean;
  delay: number;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: mounted ? "1fr" : "0fr",
        transition: reduce ? undefined : `grid-template-rows 300ms ease-out ${delay}ms`,
      }}
    >
      <div style={{ overflow: "hidden", minHeight: 0 }}>
        <div
          style={{
            ...style,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(6px)",
            transition: reduce ? undefined : `opacity 300ms ease-out ${delay}ms, transform 300ms ease-out ${delay}ms`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * True `delayMs` after `done` first becomes true — the pause `Step` needs to
 * actually animate rather than mount already at its rest state (see `Step`'s
 * own comment: a transition needs two paints to have something to move
 * between). Each checklist section calls this with its own step's resolution
 * moment, so three sections finishing at three different times each still
 * get their own brief fade rather than one shared clock forcing them to
 * snap in together.
 *
 * `delayMs` defaults to a bare minimum (just enough for the two-paint rule)
 * but the Generate button passes a longer one — see the call site — so its
 * fade-in starts only once `LoadingHint` has finished fading out, rather
 * than both happening in the same instant.
 */
function useRevealOnDone(done: boolean, reduce: boolean, delayMs = 20): boolean {
  const [revealed, setRevealed] = useState(reduce);
  useEffect(() => {
    if (reduce) return;
    if (!done) {
      setRevealed(false);
      return;
    }
    const timer = setTimeout(() => setRevealed(true), delayMs);
    return () => clearTimeout(timer);
  }, [done, reduce, delayMs]);
  return revealed;
}

/** How long `LoadingHint` takes to fade and collapse once the last section
 *  resolves (matching `Step`'s own 300ms) — shared by the hint's own exit
 *  and the delay before the Generate button starts fading in, so the two
 *  never overlap. */
const HINT_EXIT_MS = 300;

/**
 * Keeps `LoadingHint` mounted a little past the moment it should disappear,
 * so it can fade out instead of vanishing on the exact frame the last
 * section resolves. `Step` (and `useRevealOnDone` above) solve the entrance
 * half of this same problem; this is the exit half — a visible thing and an
 * unmount must not land in the same paint, whichever direction it's moving.
 */
function useFadeOutUnmount(visible: boolean, exitMs: number, reduce: boolean): boolean {
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible || reduce) {
      setMounted(visible);
      return;
    }
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [visible, exitMs, reduce]);
  return mounted;
}

/**
 * The true zero-accounts state — nothing connected yet, distinct from a
 * connected account with no posts (`copperline`'s case, which never reaches
 * this: `brand.platforms` still has entries there).
 *
 * Given a bordered box of its own, the same treatment `TextArea` uses, rather
 * than the pill row's bare wrap — this has to read as a deliberate empty
 * state, not as a row that's simply missing its content. "+ Add account" is
 * promoted from the pill row's trailing text-link to this box's one action —
 * it's still inert (`title="Adding accounts is coming soon"`); this
 * prototype has no real connect flow to hand it off to.
 */
function AccountsEmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: space[8],
        minHeight: "72px",
        padding: space[16],
        boxSizing: "border-box",
        border: `1px solid ${sp.borderInput}`,
        borderRadius: radius[2],
        background: sp.inputBg,
      }}
    >
      <span style={{ fontSize: type.s.size, lineHeight: type.s.line, color: sp.textTertiary }}>
        No accounts connected yet
      </span>
      <button
        type="button"
        title="Adding accounts is coming soon"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: space[4],
          height: "32px",
          padding: `0 ${space[16]}`,
          border: `1px solid ${sp.borderSub}`,
          borderRadius: radius[16],
          background: sp.white,
          color: sp.blue,
          fontFamily: FONT,
          fontSize: type.s.size,
          lineHeight: type.s.line,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        + Add account
      </button>
    </div>
  );
}

/**
 * The connected account, drawn the way the results screen draws it at the top
 * of a post card: the profile picture, the brand's name, the page under it —
 * with the network's mark pinned to the avatar's corner, since here nothing
 * else says which network this is.
 *
 * This replaced a pill with an × to take the account out. There is one
 * pre-selected account and nothing to choose between, so the control went with
 * the choice it existed for.
 *
 * No box around it. On the post card the border sets this row apart from the
 * post beneath it; here nothing sits beneath it but the next field, and a frame
 * would make a label look like an input. With no border to inset from, the
 * avatar also sits flush with the section label above it.
 */
function AccountRow({
  brandName,
  platform,
}: {
  brandName: string;
  // `ConnectedPlatform["type"]`, not `string` — `PlatformIcon` switches on the
  // union, so widening it here loses the exhaustiveness the icon relies on.
  platform: { type: PlatformType; handle: string };
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: space[8],
        width: "100%",
        fontFamily: FONT,
      }}
    >
      <AccountAvatar platform={platform.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: type.s.size, fontWeight: 400, color: sp.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {brandName}
        </div>
        <div style={{ fontSize: type.xs.size, color: sp.textTertiary }}>{platform.handle}</div>
      </div>
    </div>
  );
}


/**
 * Portrait Post Idea card maintaining exact original design tokens & borders.
 *
 * The artwork comes from `motif` (what job the idea does) and `index` (where
 * the card sits in the row, which picks its hue and its landscape) — never
 * from `label`, so a card is never
 * left without a drawing when the idea pool changes. See `IdeaMotif`.
 */
function IdeaCard({
  selected,
  onClick,
  label,
  motif,
  index,
  date,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  motif: Motif;
  index: number;
  date?: CalendarDate | null;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "1 1 0px",
        minWidth: "104px",
        maxWidth: "122px",
        height: "176px",
        borderRadius: radius[8],
        border: `1.5px solid ${selected ? sp.blue : hover ? sp.borderActive : sp.borderSub}`,
        background: selected ? sp.blueSubtle : sp.white,
        cursor: "pointer",
        padding: 0,
        overflow: "hidden",
        fontFamily: FONT,
        textAlign: "left",
        position: "relative",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {/* Top illustration image area */}
      <div style={{ width: "100%", height: "124px", minHeight: "124px", maxHeight: "124px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <IdeaMotif motif={motif} index={index} date={date} selected={selected} />
        {/* Selected checkmark overlay */}
        {selected && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: sp.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              zIndex: 5,
            }}
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1.5 4L3.8 6.2L8.5 1.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom text label area */}
      <div
        style={{
          width: "100%",
          height: "52px",
          minHeight: "52px",
          maxHeight: "52px",
          padding: "8px 10px",
          display: "flex",
          alignItems: "flex-start",
          fontSize: type.s.size,
          lineHeight: "15px",
          fontWeight: 400,
          color: sp.textPrimary,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
          title={label}
        >
          {label}
        </span>
      </div>
    </button>
  );
}
