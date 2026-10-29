import type { Brand, ConnectedPlatform, PlatformType, SamplePost } from "./types";

/** How each network is named in copy. The mark itself lives in
 *  `components/PlatformIcon.tsx`, which replaced the emoji stand-ins these
 *  used to carry. */
export const PLATFORM_META: Record<PlatformType, { label: string }> = {
  twitter: { label: "X" },
  instagram: { label: "Instagram" },
  linkedin: { label: "LinkedIn" },
  facebook: { label: "Facebook" },
  tiktok: { label: "TikTok" },
};

/** Every figure on the brand screen is measured over this window, and says so —
 *  a growth number without a named period doesn't mean anything. */
export const ANALYTICS_WINDOW_DAYS = 90;

/**
 * Below this, the brand gets the cold-start screen instead of the recap.
 *
 * Not a zero check on purpose. A brand with three posts technically has a
 * history, but a voice inferred from three captions is noise and a hero
 * reading "3 posts published" says nothing worth saying. This is the floor at
 * which the recap's claims are actually backed by something.
 */
export const MIN_POSTS_FOR_HISTORY = 5;

export function hasHistory(brand: Brand): boolean {
  return brandAnalytics(brand).postsPublished >= MIN_POSTS_FOR_HISTORY;
}

/**
 * Seeded brands with the analytics the product already holds per connected
 * page, plus a readable slice of their posts.
 *
 * BruteForce and Nova Yoga share a vertical deliberately: their captions lean
 * on different keywords, so the same preset pool has to resolve them to
 * different angles. That is what demonstrates the scoring is reading the
 * history rather than picking at random. Solstice sits in another vertical
 * entirely, and so can never be handed a gym angle.
 */
const ALL_BRANDS: Brand[] = [
  {
    id: "bruteforce",
    name: "BruteForce",
    logoInitial: "B",
    logoColor: "#E8622C",
    vertical: "fitness",
    toneLabel: "direct, encouraging",
    descriptor: "a strength gym for lifters chasing PRs",
    // Ordered the way the canvas shows them: Facebook, Instagram, X, TikTok.
    platforms: [
      {
        type: "facebook",
        handle: "BruteForce Gym",
        analytics: { postsPublished: 38, reach: 27800, reachPrevious: 23700, pageViews: 16400, followers: 6900, followersGained: 290 },
        samplePosts: [
          { id: "fb-1", caption: "New member spotlight: three months in and already hitting bodyweight squats.", postedAt: "2026-07-14", likeCount: 130, reach: 6600 },
          { id: "fb-2", caption: "Saturday open gym hours are back — come test your max, 9am to 2pm.", postedAt: "2026-06-27", likeCount: 97, reach: 4900 },
          { id: "fb-3", caption: "How we built a coaching culture around consistency, not intensity.", postedAt: "2026-06-11", likeCount: 88, reach: 4200 },
        ],
      },
      {
        type: "instagram",
        handle: "@bruteforce.strength",
        analytics: { postsPublished: 48, reach: 82600, reachPrevious: 63000, pageViews: 41000, followers: 12800, followersGained: 1980 },
        samplePosts: [
          { id: "ig-1", caption: "Five real wins from members who showed up even on the hard days.", postedAt: "2026-07-22", likeCount: 892, reach: 24100 },
          { id: "ig-2", caption: "Chalk up, lock in, lift heavy. Community over ego, every session.", postedAt: "2026-07-09", likeCount: 654, reach: 18300 },
          // Carried over when the LinkedIn page was dropped: these two lines are
          // what make this brand read as plateau-focused, and losing them would
          // have quietly changed which angle the whole demo picks.
          { id: "ig-3", caption: "Behind every plateau is a program that needs adjusting — not a lifter who needs to quit.", postedAt: "2026-06-30", likeCount: 604, reach: 15900 },
        ],
      },
      {
        type: "twitter",
        handle: "@bruteforcegym",
        analytics: { postsPublished: 34, reach: 18400, reachPrevious: 16100, pageViews: 9200, followers: 4100, followersGained: 320 },
        samplePosts: [
          { id: "tw-1", caption: "Your lift stopped moving? That's not failure — that's where strength actually builds.", postedAt: "2026-07-18", likeCount: 214, reach: 5200 },
          { id: "tw-2", caption: "PR day hits different when the whole gym is cheering you on.", postedAt: "2026-07-02", likeCount: 341, reach: 7800 },
        ],
      },
      {
        // Captions here are deliberately about technique, which none of the
        // idea presets score against. A fourth account should widen the
        // account list without quietly re-deciding which angle the demo picks.
        type: "tiktok",
        handle: "@bruteforce",
        analytics: { postsPublished: 22, reach: 54200, reachPrevious: 47000, pageViews: 31500, followers: 9400, followersGained: 2600 },
        samplePosts: [
          { id: "tt-1", caption: "Three setup cues that fix your bracing before the bar even moves.", postedAt: "2026-07-19", likeCount: 1840, reach: 31200 },
          { id: "tt-2", caption: "What a proper warm-up actually looks like, start to finish.", postedAt: "2026-07-03", likeCount: 1120, reach: 19800 },
        ],
      },
    ],
  },

  {
    id: "nova-yoga",
    name: "Nova Yoga Studio",
    logoInitial: "N",
    logoColor: "#7C5CD6",
    vertical: "fitness",
    toneLabel: "calm, welcoming",
    descriptor: "a neighbourhood yoga studio for beginners and regulars alike",
    platforms: [
      {
        type: "instagram",
        handle: "@novayoga",
        analytics: { postsPublished: 41, reach: 54200, reachPrevious: 48900, pageViews: 26000, followers: 8600, followersGained: 940 },
        samplePosts: [
          { id: "nv-ig-1", caption: "Saturday open studio is back — drop in any time between 8am and 1pm.", postedAt: "2026-07-20", likeCount: 402, reach: 11200 },
          { id: "nv-ig-2", caption: "New to the mat? Your first week with us is completely free.", postedAt: "2026-07-05", likeCount: 517, reach: 14800 },
        ],
      },
      {
        type: "facebook",
        handle: "Nova Yoga Studio",
        analytics: { postsPublished: 26, reach: 15800, reachPrevious: 15100, pageViews: 9100, followers: 3400, followersGained: 180 },
        samplePosts: [
          { id: "nv-fb-1", caption: "Find us on the corner of 5th and Elm — parking is free after 6pm.", postedAt: "2026-07-11", likeCount: 88, reach: 3900 },
          { id: "nv-fb-2", caption: "Member spotlight: six months of practice and her first full backbend.", postedAt: "2026-06-24", likeCount: 143, reach: 5100 },
        ],
      },
      {
        type: "tiktok",
        handle: "@novayogastudio",
        analytics: { postsPublished: 19, reach: 96400, reachPrevious: 63400, pageViews: 88000, followers: 5200, followersGained: 1180 },
        samplePosts: [
          { id: "nv-tt-1", caption: "Come join us for sunrise flow — no experience needed, just show up.", postedAt: "2026-07-16", likeCount: 1204, reach: 38600 },
        ],
      },
    ],
  },

  {
    id: "solstice-coffee",
    name: "Solstice Coffee",
    logoInitial: "S",
    logoColor: "#0F7B6C",
    vertical: "cafe",
    toneLabel: "warm, unhurried",
    descriptor: "a specialty coffee roaster and cafe",
    platforms: [
      {
        type: "instagram",
        handle: "@solsticecoffee",
        analytics: { postsPublished: 37, reach: 41300, reachPrevious: 37900, pageViews: 19800, followers: 6400, followersGained: 520 },
        samplePosts: [
          { id: "sc-ig-1", caption: "This week's single origin: a washed Ethiopian with peach and jasmine.", postedAt: "2026-07-21", likeCount: 733, reach: 19400 },
          { id: "sc-ig-2", caption: "Every bag we roast is on the shelf within 48 hours. That's the whole trick.", postedAt: "2026-07-06", likeCount: 611, reach: 16200 },
        ],
      },
      {
        type: "facebook",
        handle: "Solstice Coffee Roasters",
        analytics: { postsPublished: 21, reach: 12600, reachPrevious: 11650, pageViews: 7400, followers: 2900, followersGained: 150 },
        samplePosts: [
          { id: "sc-fb-1", caption: "The patio is open again — come sit with a cortado and watch the afternoon go by.", postedAt: "2026-07-13", likeCount: 156, reach: 5300 },
          { id: "sc-fb-2", caption: "Regulars know: the pastry case is best before 9am.", postedAt: "2026-06-29", likeCount: 121, reach: 4100 },
        ],
      },
    ],
  },

  // Accounts connected, nothing published. Exists so the cold-start path is a
  // real, clickable case rather than a branch nobody ever sees.
  {
    id: "copperline",
    name: "Copperline Bakery",
    logoInitial: "C",
    logoColor: "#B5541F",
    vertical: "cafe",
    toneLabel: "",
    descriptor: "",
    platforms: [
      {
        type: "instagram",
        handle: "@copperlinebakery",
        analytics: { postsPublished: 0, reach: 0, reachPrevious: 0, pageViews: 0, followers: 84, followersGained: 84 },
        samplePosts: [],
      },
      {
        type: "facebook",
        handle: "Copperline Bakery",
        analytics: { postsPublished: 0, reach: 0, reachPrevious: 0, pageViews: 0, followers: 31, followersGained: 31 },
        samplePosts: [],
      },
    ],
  },

  // No accounts connected at all — distinct from Copperline's "connected but
  // nothing published". Exists so the true zero-account empty state and the
  // Generate-button gating are real, clickable cases rather than branches
  // nobody ever sees.
  {
    id: "day-one",
    name: "Day One Fitness",
    logoInitial: "D",
    logoColor: "#1F8FCE",
    vertical: "fitness",
    toneLabel: "",
    descriptor: "",
    platforms: [],
  },
];

/**
 * What the app actually offers: one brand.
 *
 * Multi-brand switching is deferred, and with a single entry `BrandSwitcher`
 * renders nothing — the name becomes an editable field instead. The other
 * fixtures stay in `ALL_BRANDS` and are reachable via `?brand=<id>`, so the
 * cold-start path and its honesty fixes stay exercisable rather than rotting
 * behind a branch nothing ever takes.
 */
export const SAMPLE_BRANDS: Brand[] = ALL_BRANDS.filter((b) => b.id === "bruteforce");

export function findBrand(id: string | null | undefined): Brand | undefined {
  return id ? ALL_BRANDS.find((b) => b.id === id) : undefined;
}

export function allSamplePosts(brand: Brand): (SamplePost & { platform: PlatformType })[] {
  return brand.platforms.flatMap((p) => p.samplePosts.map((post) => ({ ...post, platform: p.type })));
}

/**
 * The brand's furthest-travelling post, or null when there is nothing to rank.
 *
 * Nullable deliberately: `reduce` without a seed throws on an empty array, and
 * a brand that has never posted is a real case, not a defensive one.
 */
export function topPost(brand: Brand): (SamplePost & { platform: PlatformType }) | null {
  const posts = allSamplePosts(brand);
  if (!posts.length) return null;
  return posts.reduce((best, post) => (post.reach > best.reach ? post : best));
}

/** Where the brand's work actually lands — the connected account carrying the
 *  most reach. Used to turn the headline figures into a read rather than
 *  leaving them as bare totals. */
export function topPlatform(brand: Brand): ConnectedPlatform {
  return brand.platforms.reduce((best, p) => (p.analytics.reach > best.analytics.reach ? p : best));
}

/**
 * Only the aggregates that survive scrutiny.
 *
 * Reach, impressions and views are deliberately absent: each platform defines
 * its headline metric differently, so a cross-account total adds unlike units
 * and double-counts anyone following in two places. Follower totals have the
 * same double-counting problem. A post count has neither — it is plain
 * addition — so it is the only figure summed anywhere in the UI. Everything
 * else is read per account via `topPlatform` / `reachChangePct`.
 */
export interface BrandAnalytics {
  platformCount: number;
  postsPublished: number;
}

export function brandAnalytics(brand: Brand): BrandAnalytics {
  return {
    platformCount: brand.platforms.length,
    postsPublished: brand.platforms.reduce((sum, p) => sum + p.analytics.postsPublished, 0),
  };
}

/** How one account's reach moved against the window before it. */
export function reachChangePct(platform: ConnectedPlatform): number {
  const previous = platform.analytics.reachPrevious;
  if (previous <= 0) return 0;
  return ((platform.analytics.reach - previous) / previous) * 100;
}

/**
 * Compact figures: 142, 24.1K, 140K, 1.2M. Drops the decimal once the leading
 * part reaches three digits, so a value never runs wider than four characters.
 *
 * `unitFrom` fixes the unit and decimal places against a *reference* value
 * rather than the one being formatted. A hero figure counting up from zero
 * would otherwise cross unit boundaries on the way — "0", "12.3K", "82.6K" —
 * and a centred number that changes width every frame visibly jitters. Passing
 * the target as the reference keeps it "0.0K → 82.6K" at a steady width.
 */
export function formatCompact(value: number, unitFrom: number = value): string {
  const reference = Math.abs(unitFrom);
  const [divisor, suffix] =
    reference >= 1_000_000 ? [1_000_000, "M"] : reference >= 1_000 ? [1_000, "K"] : [1, ""];
  const decimals = divisor === 1 || reference / divisor >= 100 ? 0 : 1;
  return (value / divisor).toFixed(decimals).replace(/\.0$/, "") + suffix;
}
