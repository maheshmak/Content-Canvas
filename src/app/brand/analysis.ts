import { brandAnalytics, topPlatform, reachChangePct, formatCompact, hasHistory, PLATFORM_META } from "./fixtures";
import type { GeneratedResult } from "./generateIdea";
import type { Brand } from "./types";

export interface Finding {
  id: string;
  /** Short category shown ahead of the value, e.g. "Tone". */
  label: string;
  value: string;
}

/**
 * What the generating screen shows it found, one finding per stage.
 *
 * Every value is computed from the brand's own analytics or the idea just
 * chosen — nothing here is a canned string. That matters because this list is
 * the only evidence the user ever sees that the pick was reasoned: the idea
 * grid they used to choose from is gone, so the findings have to carry it.
 *
 * The first four are observations about the history and how it performed. The
 * last two are the hinge — what's coming up and what the brand hasn't covered —
 * so the chosen angle lands as a conclusion rather than an announcement.
 */
export function deriveFindings(brand: Brand, result: GeneratedResult): Finding[] {
  const stats = brandAnalytics(brand);
  const strongest = topPlatform(brand);
  const change = reachChangePct(strongest);

  // Nothing published means nothing read. Running the normal six here would
  // print "0 posts" and a tone inferred from no writing at all — the loading
  // screen asserting work it didn't do.
  if (!hasHistory(brand)) {
    return [
      { id: "accounts", label: "Connected", value: `${stats.platformCount} accounts ready to publish` },
      { id: "brief", label: "Read", value: "the brief you gave us" },
      { id: "moment", label: "Coming up", value: result.idea.moment },
      { id: "angle", label: "Angle", value: result.idea.gapLabel },
    ];
  }

  return [
    // One fact per finding. Two facts joined by a dash inside a row that
    // already uses a dash to separate label from value reads as a run-on.
    //
    // Every reach figure names the account it came from. Nothing here sums
    // reach or followers across platforms — see the note in fixtures.ts.
    {
      id: "corpus",
      label: "Read",
      value: `${stats.postsPublished} posts across ${stats.platformCount} accounts`,
    },
    {
      id: "strongest",
      label: "Strongest",
      value: `${formatCompact(strongest.analytics.reach)} reached on ${PLATFORM_META[strongest.type].label}, ${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(0)}%`,
    },
    // "Top post" used to sit here. It said the same thing as "Strongest" —
    // a reach figure attached to an account — so the two read as one fact
    // stated twice, and dropping it costs the argument nothing.
    {
      id: "tone",
      label: "Tone",
      value: brand.toneLabel,
    },
    {
      id: "moment",
      label: "Coming up",
      value: result.idea.moment,
    },
    {
      id: "gap",
      label: "Angle",
      value: result.idea.gapLabel,
    },
  ];
}
