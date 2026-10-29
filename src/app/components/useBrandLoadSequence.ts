import { useEffect, useState } from "react";

/** The starting page's sections, by name — the page decides which it shows and
 *  in what order; this hook only paces their arrival. */
export type LoadSection = "accounts" | "about" | "ideas";

/**
 * How long each section waits behind the one before it.
 *
 * Slower than the fetch it's standing in for would actually be — on purpose,
 * so the sequence is genuinely visible rather than a blink. 4s a section.
 */
const SECTION_MS: Record<LoadSection, number> = {
  accounts: 4_000,
  about: 4_000,
  ideas: 4_000,
};

export interface BrandLoadSequence {
  /** Whether this section has arrived. A section that isn't part of the
   *  sequence never does. */
  stepDone: (section: LoadSection) => boolean;
  /** Every section in the sequence arrived — gates the Generate button. */
  allLoaded: boolean;
}

/**
 * Paces the starting page's sections arriving one at a time, in the order
 * given — the sibling of `useStagedReveal`, which paces the results screen's
 * cards. That one runs a generation that can last minutes across an unbounded
 * number of posts; this one runs a few fixed sections that are always done
 * inside a few seconds.
 *
 * Takes the sections as an argument rather than hard-coding them, so hiding
 * one (Post ideas, for now) removes its wait as well as its markup. The array
 * must be stable between renders — a module-level constant, not a literal at
 * the call site — or the sequence restarts every render.
 *
 * Deliberately not a checklist. An earlier version of this surfaced a
 * spinner/checkmark per section, which read as more machinery than a
 * few-second wait warranted. This is the plainer version of the same idea:
 * a section simply doesn't exist until its turn, then it's there.
 *
 * Restarts on `brandId` change, so switching brands doesn't inherit the
 * previous one's already-arrived sections. Reduced motion resolves every
 * section immediately: the sequencing here is decorative pacing, not
 * information the page depends on, unlike the results screen's staging.
 */
export function useBrandLoadSequence(
  brandId: string,
  reduce: boolean,
  sections: readonly LoadSection[],
): BrandLoadSequence {
  const [doneCount, setDoneCount] = useState(reduce ? sections.length : 0);

  useEffect(() => {
    if (reduce) {
      setDoneCount(sections.length);
      return;
    }
    setDoneCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    sections.forEach((section, i) => {
      elapsed += SECTION_MS[section];
      timers.push(setTimeout(() => setDoneCount(i + 1), elapsed));
    });
    return () => timers.forEach(clearTimeout);
  }, [brandId, reduce, sections]);

  return {
    stepDone: (section) => {
      const index = sections.indexOf(section);
      return index !== -1 && index < doneCount;
    },
    allLoaded: doneCount >= sections.length,
  };
}
