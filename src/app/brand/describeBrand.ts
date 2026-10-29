import { PLATFORM_META, hasHistory, reachChangePct, topPlatform } from "./fixtures";
import type { Brand } from "./types";

/** Separates the brand name from what the brand is, in the one merged field. */
export const NAME_SEPARATOR = " — ";

/**
 * The brand, written out the way the user would have typed it.
 *
 * This is the whole automation, made literal: the screen it replaces asks
 * "Tell us about your brand" and hands over an empty box. We hand back the
 * same box already answered — name first, then what the business is, in the
 * `Superhair - a family salon offering trendy haircuts` shape the real modal
 * already uses.
 *
 * Only the descriptor is a fixture — what the business actually is, which no
 * amount of analytics reveals. Voice and reach are computed from the same data
 * the old stats block displayed, so editing a number in `fixtures.ts` changes
 * this sentence too rather than leaving a stale claim behind.
 *
 * Returns an empty string for a brand with no history. Nothing published means
 * nothing to describe, and a confident sentence about a brand we know nothing
 * about would be the one lie on a screen whose job is trust.
 */
export function describeBrand(brand: Brand): string {
  if (!hasHistory(brand)) return "";

  const strongest = topPlatform(brand);
  const change = reachChangePct(strongest);
  const parts = [`${brand.name}${NAME_SEPARATOR}${brand.descriptor}.`];

  if (brand.toneLabel) {
    parts.push(`${brand.toneLabel.charAt(0).toUpperCase() + brand.toneLabel.slice(1)} voice.`);
  }

  parts.push(
    `Strongest on ${PLATFORM_META[strongest.type].label}, where reach is ${
      change >= 0 ? "up" : "down"
    } ${Math.abs(change).toFixed(0)}%.`,
  );

  return parts.filter(Boolean).join(" ");
}

/** Longer than this and the leading segment is a sentence, not a name. */
const MAX_NAME_LENGTH = 40;

/**
 * Reads the brand name back out of the merged field.
 *
 * The name can't only live in free prose — the results breadcrumb and the
 * "Now Open" template's `businessName` both need it as a value. So the field
 * carries it in a recognisable position (before an em dash, hyphen or colon)
 * and this pulls it back out.
 *
 * Deliberately conservative: no separator, an empty segment, or something too
 * long to be a name all fall back to the name we already hold. Guessing wrong
 * here would rename the brand behind the user's back, which is worse than not
 * picking up a rename at all.
 */
export function parseBrandName(text: string, fallback: string): string {
  const separator = text.match(/\s[—–-]\s|:\s/);
  if (!separator || separator.index === undefined) return fallback;

  const candidate = text.slice(0, separator.index).trim();
  if (!candidate || candidate.length > MAX_NAME_LENGTH) return fallback;
  return candidate;
}
