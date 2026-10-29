/**
 * Mock domain types for the automatic "brand → idea → post" flow.
 *
 * Everything here is prototype data: no backend, no real social APIs. A
 * `Brand`'s `platforms[].samplePosts` stand in for posts the real product
 * already has from its existing post-creator area — this flow's whole point
 * is to read that history automatically instead of asking the user to
 * re-describe it.
 */

export type PlatformType = "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok";

export interface SamplePost {
  id: string;
  caption: string;
  postedAt: string;
  likeCount: number;
  /** People reached. The headline performance measure — likes tell you who
   *  reacted, reach tells you how far the post actually travelled. */
  reach: number;
}

/**
 * What the product's existing analytics already knows about a connected page,
 * over `ANALYTICS_WINDOW_DAYS`.
 *
 * This is the real basis for "we've got you covered": the flow isn't reading
 * the last handful of posts, it's working from everything published and how it
 * performed. Recency proves nothing on its own.
 *
 * These figures stay **per account** and are never summed into a cross-platform
 * total. Each platform defines its headline metric differently — Instagram
 * reports reach, LinkedIn impressions, TikTok views — so a sum adds unlike
 * units, and it double-counts anyone who follows the brand in two places.
 * Post counts are the exception, and the only aggregate anything displays.
 */
export interface PlatformAnalytics {
  postsPublished: number;
  reach: number;
  /** The same window, one period back — what turns a bare reach figure into
   *  "up 31%", which is the part that actually means something. */
  reachPrevious: number;
  pageViews: number;
  followers: number;
  followersGained: number;
}

export interface ConnectedPlatform {
  type: PlatformType;
  handle: string;
  analytics: PlatformAnalytics;
  /** A readable slice of the history — used for tone and for the captions that
   *  tick past while generating. The counts above cover the whole corpus. */
  samplePosts: SamplePost[];
}

export interface Brand {
  id: string;
  name: string;
  logoInitial: string;
  logoColor: string;
  /** Scopes which `IdeaPreset`s this brand can be given — a cafe must never
   *  land on a gym angle, however its captions happen to score. */
  vertical: string;
  /** The voice the analysis "found" in this brand's writing, surfaced as a
   *  finding while generating. Brand-level metadata, not idea-level. */
  toneLabel: string;
  /** What the business actually is, in the words a user would have typed into
   *  "Tell us about your brand". The one clause of the inferred description
   *  that isn't computed from analytics — empty for a brand with no history,
   *  because that is precisely what we cannot know about them. */
  descriptor: string;
  platforms: ConnectedPlatform[];
}

/**
 * One curated content angle. `keywords` are what the mock "analysis" scores
 * a brand's past captions against to pick a preset — the stand-in for real
 * post-history analysis. `templateId` points at an existing entry in
 * `templates/index.ts`.
 */
/**
 * The *job* a post idea does, which is what its card illustrates.
 *
 * Deliberately a closed set, and deliberately about the job rather than the
 * subject. An idea pool grows without bound — new presets, new verticals, a
 * calendar moment we've never seen — so art keyed to the subject ("a coffee
 * cup for the roast angle") means a missing drawing every time the pool
 * changes. The job doesn't grow: every content idea any business posts is
 * one of these. A ramen shop's "our broth takes 18 hours" is an `answer`; a
 * salon's "book your slot" is an `invite`.
 *
 * `date` and `surprise` are the two the presets never carry — the first is
 * every calendar moment, the second is the shuffle card.
 */
export type IdeaMotif =
  | "answer"
  | "celebrate"
  | "community"
  | "inform"
  | "invite"
  | "announce"
  | "date"
  | "surprise";

export interface IdeaPreset {
  id: string;
  vertical: string;
  /** Two to four words for the starting-point chips. Kept short on purpose:
   *  a chip that grows into a description turns the row back into the idea
   *  grid this flow exists to remove. */
  label: string;
  keywords: string[];
  direction: string;
  audience: string;
  hook: string;
  cta: string;
  templateId: string;
  /** Which drawing the idea card shows. See `IdeaMotif` for why this is a
   *  field on the data rather than something the card infers from `label`. */
  motif: IdeaMotif;
  /** Human-readable reason, used in the results screen's provenance line. */
  reasonLabel: string;
  /** What this brand *hasn't* covered lately — the hinge finding that makes
   *  the chosen angle feel motivated rather than arbitrary. */
  gapLabel: string;
}

/**
 * A starting point the user chose from the chip row, instead of leaving the
 * pick to the engine. Carried through generation so the post that comes back
 * is the one the chip advertised.
 */
export type IdeaSeed =
  | { kind: "preset"; presetId: string }
  | { kind: "moment"; moment: string };

/** The single idea the automatic engine committed to — never shown alongside
 *  the presets it didn't pick. */
export interface GeneratedIdea {
  presetId: string;
  direction: string;
  audience: string;
  hook: string;
  cta: string;
  templateId: string;
  /** The parts are kept separate because the generating screen surfaces them
   *  as individual findings; `provenance` is just the two composed for the
   *  results screen's callout. */
  reasonLabel: string;
  moment: string;
  gapLabel: string;
  provenance: string;
}
