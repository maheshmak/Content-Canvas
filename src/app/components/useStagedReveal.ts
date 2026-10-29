import { useEffect, useState } from "react";
import type { PlatformType } from "../brand/types";

/**
 * How long the whole reveal runs.
 *
 * The result itself is known synchronously — `generateIdea` returns before this
 * hook ever mounts — so nothing here is *waiting* on anything. This is the
 * stand-in for the real product's generation time, and the sequencing below is
 * the shape that time should be spent in.
 */
const DEFAULT_TOTAL_MS = 60_000;

/**
 * `?run=150` runs it as a 150-second generation.
 *
 * The long-wait handling — the notification offer, the invitation to leave —
 * only engages above 90 seconds, and a prototype pinned at 60 can never show
 * it. Rather than retune the default (which is what the pacing above was
 * balanced against), the duration is switchable the same way `?brand=` already
 * switches the fixture.
 */
export const TOTAL_MS = (() => {
  if (typeof window === "undefined") return DEFAULT_TOTAL_MS;
  const seconds = Number(new URLSearchParams(window.location.search).get("run"));
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1_000 : DEFAULT_TOTAL_MS;
})();

/**
 * When the idea resolves, as a fraction of the run.
 *
 * Half-way rather than a fixed couple of seconds. It has to be late enough
 * that the findings justifying it have all landed first — the idea is the
 * conclusion of that reasoning, not something that appears alongside it — and
 * late enough that its skeleton is actually seen. It cannot be the *whole*
 * run, though: the posts still need room to land one at a time afterwards,
 * and collapsing that into a single reveal at the end is the all-or-nothing
 * wait this design exists to avoid.
 *
 * Was a half. Pulled back to roughly a third because the idea phase is the
 * sparse one — a single panel holding four short rows — and the answer to a
 * thin stretch is to spend less time in it, not to pad it out. The back half,
 * where cards are arriving one by one, is where the screen has something to
 * look at, so it gets the larger share.
 */
const IDEA_AT = 0.35;
/**
 * The clamp that makes the whole thing survive a long run.
 *
 * Every interval here used to be a *fraction* of the total, so a longer wait
 * stretched each beat rather than adding beats. At a 200-second run that put
 * 17 seconds between idea rows and 32 between card changes — and a screen that
 * sits unchanged for more than about ten seconds reads as hung, which is
 * exactly where this design was supposed to be strongest.
 *
 * Writing an idea is roughly constant work; only the posts scale with the
 * number of accounts and the model's latency. So the idea phase is pinned to
 * an absolute window and the remainder — however large — goes to the posts,
 * which is where the time actually is.
 */
const IDEA_MIN_MS = 10_000;
const IDEA_MAX_MS = 24_000;
/** However long a post's slot is, its caption arrives within this. A 32-second
 *  slot left the card blank for 14; a caption really is written before its
 *  image, so front-loading it costs nothing in honesty. */
const CAPTION_MAX_MS = 8_000;

const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);
/**
 * A beat between the last post landing and the run being declared finished.
 *
 * Without it the final post and the "posts created" toast arrive on the same
 * tick, so the toast reads as coincident with the work rather than as its
 * result — and the last card gets no moment of being looked at.
 */
const SETTLE_MS = 600;
/** Where inside a post's slot its caption lands, ahead of its image. */
const CAPTION_AT = 0.45;
/**
 * Direction, Audience, Hook and CTA — landing one at a time rather than all at
 * once. The last one to arrive *is* the idea being ready, so the two can never
 * disagree about whether there is an idea yet.
 */
const IDEA_FIELDS = 4;

/** 0 pending · 1 caption written · 2 finished. */
export type PostStage = 0 | 1 | 2;

export interface Reveal {
  /** How many of the idea's four fields are known. */
  ideaFieldsDone: number;
  /** All four in — the idea exists. */
  ideaReady: boolean;
  stageOf: (platform: PlatformType) => PostStage;
  /** Whether SoPi has begun this account's post. A card doesn't exist on the
   *  screen until its own work starts, so the row builds up one at a time
   *  instead of arriving complete and empty. */
  hasStarted: (platform: PlatformType) => boolean;
  /** The account being worked on right now, or null once everything is done. */
  active: PlatformType | null;
  /**
   * Which post that is, counting from 1 — or 0 when none is in flight.
   *
   * Exposed rather than left to the caller, because the obvious arithmetic
   * (`doneCount + 1`) overruns. Every post is finished a beat before the run
   * is declared done, and in that gap it reads "5 of 4".
   */
  activeIndex: number;
  /** Finished posts. The progress indicator reads this and nothing else, so it
   *  cannot claim a post the screen isn't already showing. */
  doneCount: number;
  total: number;
  done: boolean;
}

/**
 * Drives the results screen filling itself in the order the work completes.
 *
 * Deliberately not a progress *animation*. Every number a caller can display
 * comes from the same state that renders the cards, so a count and the screen
 * behind it can never disagree — the failure mode of the timed progress bar
 * this replaces.
 *
 * Reduced motion is not handled here: the staging is information (what is
 * finished, what is still running), not decoration. Only the shimmer and the
 * cross-fades are suppressed, and those are CSS.
 *
 * **This lives in `App`, not in the results screen.** A run has to outlive the
 * screen that displays it — the toast tells the user they can leave the page,
 * and that has to be true. Holding it in the screen's own state made leaving
 * destroy the run and start it over on return.
 */
export function useStagedReveal(platforms: PlatformType[], runId: number): Reveal {
  const [ideaFieldsDone, setIdeaFieldsDone] = useState(0);
  const [stages, setStages] = useState<Partial<Record<PlatformType, PostStage>>>({});
  const [startedCount, setStartedCount] = useState(0);
  const [done, setDone] = useState(false);

  // Join the identities, not the array: a new array each render would restart
  // the whole sequence on every parent re-render.
  const key = platforms.join(",");

  useEffect(() => {
    setIdeaFieldsDone(0);
    setStages({});
    setStartedCount(0);
    setDone(false);

    const list = key ? (key.split(",") as PlatformType[]) : [];
    const ideaMs = clamp(IDEA_MIN_MS, TOTAL_MS * IDEA_AT, IDEA_MAX_MS);

    const slot = list.length ? (TOTAL_MS - SETTLE_MS - ideaMs) / list.length : 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < IDEA_FIELDS; i++) {
      timers.push(setTimeout(() => setIdeaFieldsDone(i + 1), ((i + 1) * ideaMs) / IDEA_FIELDS));
    }

    list.forEach((platform, i) => {
      const start = ideaMs + i * slot;
      const set = (stage: PostStage) => setStages((prev) => ({ ...prev, [platform]: stage }));
      timers.push(setTimeout(() => setStartedCount(i + 1), start));
      timers.push(setTimeout(() => set(1), start + Math.min(slot * CAPTION_AT, CAPTION_MAX_MS)));
      timers.push(setTimeout(() => set(2), start + slot));
    });

    timers.push(setTimeout(() => setDone(true), TOTAL_MS));

    return () => timers.forEach(clearTimeout);
    // `runId` is what restarts a run. The platform list and the finding count
    // are usually identical between runs, so without it a second generation
    // would quietly reuse the finished state of the first.
  }, [key, runId]);

  const stageOf = (platform: PlatformType): PostStage => stages[platform] ?? 0;
  const doneCount = platforms.filter((p) => stageOf(p) === 2).length;
  const active = platforms.find((p) => stageOf(p) !== 2) ?? null;

  return {
    ideaFieldsDone,
    ideaReady: ideaFieldsDone >= IDEA_FIELDS,
    stageOf,
    hasStarted: (platform) => platforms.indexOf(platform) < startedCount,
    active,
    activeIndex: active ? platforms.indexOf(active) + 1 : 0,
    doneCount,
    total: platforms.length,
    done,
  };
}
