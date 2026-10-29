import type { PostCopy, TemplateDef, TemplateState } from "../templates/schema";
import { getDefaults } from "../templates/schema";
import { templates } from "../templates";
import { shuffle } from "../components/shuffle";
import { IDEA_PRESETS } from "./ideaPresets";
import { allSamplePosts, hasHistory } from "./fixtures";
import { describeBrand } from "./describeBrand";
import type { Brand, GeneratedIdea, IdeaPreset, IdeaSeed } from "./types";

/**
 * Stand-in for "what's timely" — a real version would check a calendar or
 * trends feed. Keyed by vertical so the moment is at least plausible for the
 * brand it's shown against.
 */
export const UPCOMING_MOMENTS: Record<string, string[]> = {
  fitness: [
    "National Fitness Day (Aug 27)",
    "the start of a new training block",
    "back-to-school schedules opening up morning slots",
  ],
  cafe: [
    // Named days first in each list: the chip row shows `[0]`, and a proper
    // noun reads as a label where a sentence fragment doesn't.
    "National Coffee Day (Sep 29)",
    "the last week of iced-drink season",
    "the morning commute picking back up",
  ],
};

const FALLBACK_MOMENTS = ["the week ahead"];

/**
 * A keyword counts only as a whole word — `"PR"` must not be found inside
 * "practice". Without the boundary the scoring quietly matched everything and
 * the pick stopped reflecting the brand's actual history.
 */
function matchesKeyword(corpus: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(corpus);
}

function scorePreset(preset: IdeaPreset, corpus: string): number {
  return preset.keywords.reduce((score, kw) => (matchesKeyword(corpus, kw) ? score + 1 : score), 0);
}

/** Best score any in-vertical preset gets against a body of text. */
function topScore(brand: Brand, corpus: string): number {
  const scores = IDEA_PRESETS.filter((p) => p.vertical === brand.vertical).map((p) =>
    scorePreset(p, corpus),
  );
  return scores.length ? Math.max(...scores) : 0;
}

/**
 * What the scoring reads.
 *
 * With no history there are no captions, so the brief is the only real signal
 * — without it every preset ties at zero and the "pick" is a coin toss dressed
 * up as analysis.
 *
 * With history it's subtler. The box arrives pre-filled, so leaving it alone
 * means "use what you know" and the captions should decide. But a *rewritten*
 * box is the user telling us something specific, and merely adding their
 * sentence to a hundred captions buries it — a dozen caption hits outvote it
 * every time. The screen would then cite "what you told us" while visibly
 * ignoring it, which is worse than never having asked.
 *
 * So a rewrite wins outright — but only when it actually matches an angle.
 * Scoring a brief we don't understand on its own would trade a real signal for
 * a random pick, so that case falls back to captions plus the brief.
 */
function scoringCorpus(brand: Brand, context?: string): { corpus: string; drivenByBrief: boolean } {
  const brief = context?.trim() ?? "";
  if (!hasHistory(brand)) return { corpus: brief, drivenByBrief: Boolean(brief) };

  const captions = allSamplePosts(brand).map((p) => p.caption).join(" ");
  const rewritten = Boolean(brief) && brief !== describeBrand(brand).trim();
  if (rewritten && topScore(brand, brief) > 0) return { corpus: brief, drivenByBrief: true };

  return { corpus: [captions, brief].filter(Boolean).join(" "), drivenByBrief: false };
}

/**
 * Whether the user's own words actually decided the angle.
 *
 * The provenance line reads from this rather than from "did they type
 * something", because a rewrite we couldn't match falls back to the captions —
 * and crediting the user for a pick their words didn't make is the same
 * failure as citing posts that don't exist.
 */
export function briefDroveThePick(brand: Brand, context?: string): boolean {
  return scoringCorpus(brand, context).drivenByBrief;
}

/**
 * The brand's angles, best first.
 *
 * Split out so the starting-point chips and the automatic pick read from the
 * *same* ranking. If the chips ran their own scoring they could drift, and a
 * chip would end up offering an angle the button would never have chosen —
 * which would make the chips a separate feature rather than a window into it.
 */
export function rankPresets(brand: Brand, context?: string): IdeaPreset[] {
  const { corpus } = scoringCorpus(brand, context);
  return IDEA_PRESETS.filter((p) => p.vertical === brand.vertical)
    .map((preset) => ({ preset, score: scorePreset(preset, corpus) }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.preset);
}

export function pickPreset(brand: Brand, excludeId?: string, context?: string): IdeaPreset {
  const { corpus } = scoringCorpus(brand, context);
  const ranked = rankPresets(brand, context);
  // Never exclude the last remaining option — with a small pool, "try
  // another" would otherwise have nothing to return.
  const withoutExcluded = ranked.filter((p) => p.id !== excludeId);
  const candidates = withoutExcluded.length ? withoutExcluded : ranked;

  const scored = candidates.map((preset) => ({ preset, score: scorePreset(preset, corpus) }));
  const top = Math.max(...scored.map((s) => s.score));
  const best = scored.filter((s) => s.score === top).map((s) => s.preset);
  return best[Math.floor(Math.random() * best.length)];
}

export interface GeneratedResult {
  idea: GeneratedIdea;
  template: TemplateDef;
  state: TemplateState;
}

/**
 * The automatic idea engine: picks one preset from the brand's history, then
 * reuses the app's own coordinated-look randomizer (`shuffle`) to give the
 * chosen template an on-brand accent/type/motion combination — no separate
 * style engine needed, since shuffle already guarantees every result is a
 * clash-free, designed-looking combination.
 */
export function generateIdea(
  brand: Brand,
  excludePresetId?: string,
  context?: string,
  seed?: IdeaSeed,
): GeneratedResult {
  const seededPreset =
    seed?.kind === "preset" ? IDEA_PRESETS.find((p) => p.id === seed.presetId) : undefined;
  const preset = seededPreset ?? pickPreset(brand, excludePresetId, context);

  const moments = UPCOMING_MOMENTS[brand.vertical] ?? FALLBACK_MOMENTS;
  const moment =
    seed?.kind === "moment" ? seed.moment : moments[Math.floor(Math.random() * moments.length)];

  // The provenance line is the flow's one claim about *why* this idea, so it
  // has to name the real reason. Citing "your recent posts" for a brand that
  // has never posted would be false; citing them for an angle the *user* chose,
  // or for a description they rewrote, would be the flow taking credit for
  // someone else's work.
  const established = hasHistory(brand);
  // Not "did they type something" — whether their words actually chose the
  // angle. A rewrite we couldn't match falls back to the captions, and
  // crediting the user for a pick their words didn't make is the same failure
  // as citing posts that don't exist.
  const fromBrief = briefDroveThePick(brand, context);
  const reasonLabel =
    seed?.kind === "preset"
      ? "the angle you picked"
      : seed?.kind === "moment"
        ? seed.moment
        : fromBrief
          ? "what you told us about your brand"
          : established
            ? preset.reasonLabel
            : `what tends to work for a new ${brand.vertical} brand`;

  const idea: GeneratedIdea = {
    presetId: preset.id,
    direction: preset.direction,
    audience: preset.audience,
    hook: preset.hook,
    cta: preset.cta,
    templateId: preset.templateId,
    reasonLabel,
    moment,
    gapLabel: established ? preset.gapLabel : "nothing published yet — this is your opening",
    // When the reason *is* the moment, appending it again reads
    // "Based on National Fitness Day + National Fitness Day."
    provenance: reasonLabel === moment ? `Based on ${moment}.` : `Based on ${reasonLabel} + ${moment}.`,
  };

  const template = templates.find((t) => t.id === preset.templateId)!;
  const post: PostCopy = { headline: preset.hook, hook: preset.hook, cta: preset.cta };
  const state = shuffle(getDefaults(template, post), template);

  // "Now Open" binds `post.headline` to its business-name layer and
  // `post.hook` to a separate message layer directly beneath it — reusing
  // the same hook text for both, as every other template's single-headline
  // binding does, stacked two copies of the same line on top of each other.
  // The brand's own name is what that layer actually means here.
  if (template.id === "grand-opening") {
    state.values.businessName = brand.name;
  }

  return { idea, template, state };
}
