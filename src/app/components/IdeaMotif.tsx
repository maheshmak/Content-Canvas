import type { CSSProperties, ReactElement } from "react";
import type { IdeaMotif as Motif } from "../brand/types";
import { TINTS, sp, type Tint } from "../theme";

/**
 * What every card draws in before you've picked one.
 *
 * Colour here was carrying two jobs that turned out to fight each other:
 * telling four cards apart, and marking which one is chosen. Once all four
 * are in colour, the selected one has nothing left to say — its blue border
 * is doing the same job its tint already did. Grey until chosen returns
 * colour to being the answer, not just decoration on every option.
 *
 * Built from the same five-step shape `tintOf` produces, out of the neutral
 * scale rather than a hue, so a card that loses its colour keeps exactly the
 * same drawing — only the palette underneath changes.
 */
const NEUTRAL_TINT: Tint = {
  wash: sp.bg,
  mid: sp.track,
  solid: sp.iconSecondary,
  shade: `color-mix(in srgb, ${sp.iconSecondary} 68%, black)`,
  paper: sp.white,
};

/**
 * The artwork on a post-idea card.
 *
 * **Why this is a system rather than a drawing per idea.** The idea pool is
 * open-ended — presets get added, verticals get added, and calendar moments
 * come from outside the codebase entirely — so anything keyed to a specific
 * idea leaves a hole the moment the pool changes. The previous version matched
 * on the card's `label` string, which meant three of eight presets and four of
 * six moments already fell through to a grey placeholder nobody had noticed.
 *
 * So the drawing is chosen by the idea's *job* (`IdeaMotif`, a closed set of
 * eight), and the colour by the card's position in the row. Every part is
 * authored; nothing is generated; and a new preset needs no new art, only a
 * `motif` value.
 *
 * **What makes the objects match the land they stand on.** The backdrop is a
 * flat scene: hard-edged silhouettes, no perspective, no gradients, and one
 * plane simply in front of another. So the objects follow the same three
 * rules, which is what keeps a row looking drawn by one hand:
 *
 * 1. *Front elevation only* — no isometric tops, no cast shadows. Either
 *    implies a viewpoint and a light source the scene doesn't have, and an
 *    object carrying one floats in front of the picture instead of standing
 *    in it.
 * 2. *One light direction* — `solid` on the face toward it, `shade` on the
 *    side turned away, which is the right-hand side of every object here.
 * 3. *The ramp is split* — the land gets `wash` and `mid`, the objects get
 *    `solid`, `shade` and `paper`. Nothing is drawn in a value its backdrop
 *    is also using.
 */
export function IdeaMotif({
  motif,
  index,
  date,
  selected = true,
}: {
  motif: Motif;
  /** Where this card sits in the row. Drives the landscape always, and the
   *  hue too once selected — see `TINTS` and `SLOPES`, both walked by
   *  position. */
  index: number;
  date?: CalendarDate | null;
  /** Whether this card's own colour shows, or the neutral stand-in does.
   *  Defaults to true so every other caller (nothing else exists yet, but
   *  this is the honest default for "no selection concept here") keeps
   *  today's always-coloured behaviour. */
  selected?: boolean;
}) {
  const tint = selected ? TINTS[index % TINTS.length] : NEUTRAL_TINT;

  return (
    <div
      aria-hidden
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Backdrop tint={tint} index={index} />
      <div style={{ position: "relative", zIndex: 2, marginTop: "6px", display: "flex" }}>
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
          {/* Every object stands on the same ground line, so a row of cards
              shares a horizon instead of each floating at its own height. */}
          <ellipse cx="27" cy="45.5" rx="16" ry="3.2" style={{ fill: tint.shade }} opacity={0.12} />
          <Object motif={motif} tint={tint} date={date} />
        </svg>
      </div>
    </div>
  );
}

/**
 * The land behind each card, in row order — back layer first.
 *
 * One landscape per position rather than one for the whole row, so four cards
 * side by side read as four places instead of the same place stamped out four
 * times. What stays fixed is the composition: a wash sky, two overlapping
 * slopes cut from `mid`, and — the part that matters — a crest that lands
 * between y74 and y80 at the centre of every one of them, which is where the
 * object stands. Vary that and the objects stop sharing a ground line.
 */
const SLOPES: [string, string][] = [
  /* 1 — angular, crest left of centre. The original. */
  ["M0 72 L48 58 L120 78 L120 120 L0 120 Z", "M0 88 L80 70 L120 82 L120 120 L0 120 Z"],
  /* 2 — rolled: the same land with its crests curved instead of folded. */
  ["M0 74 Q40 55 76 68 T120 74 L120 120 L0 120 Z", "M0 90 Q46 69 84 80 T120 84 L120 120 L0 120 Z"],
  /* 3 — steeper, with the peak carried over to the right. */
  ["M0 84 L76 54 L120 72 L120 120 L0 120 Z", "M0 94 L96 70 L120 84 L120 120 L0 120 Z"],
  /* 4 — flat-topped, with steep shoulders and a twin crest behind it.
     The back layer is the only one in the set that breaks from a single peak;
     it can, because nothing stands on it. The front keeps its plateau at y76
     so the object is still grounded like the other three. */
  ["M0 84 L26 60 L52 78 L84 58 L120 76 L120 120 L0 120 Z", "M0 100 L36 76 L84 76 L120 94 L120 120 L0 120 Z"],
];

/** What sits behind the motif: a wash sky, and two slopes cut from `mid`. */
function Backdrop({ tint, index }: { tint: Tint; index: number }) {
  const [back, front] = SLOPES[index % SLOPES.length];

  return (
    <div style={{ position: "absolute", inset: 0, background: tint.wash }}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 120 120"
        preserveAspectRatio="none"
      >
        <path d={back} style={{ fill: tint.mid }} opacity={0.5} />
        <path d={front} style={{ fill: tint.mid }} />
      </svg>
    </div>
  );
}

/**
 * The explicit `ReactElement` return type is load-bearing: it makes the switch
 * exhaustive, so adding a motif to the union without drawing it is a compile
 * error rather than a card that silently renders nothing.
 */
function Object({ motif, tint, date }: { motif: Motif; tint: Tint; date?: CalendarDate | null }): ReactElement {
  // Deliberately no `tint.mid` here. The land is drawn in `mid`, and every
  // object overlaps the front slope across its lower third — so any `mid`
  // detail low on an object dissolves into the hill behind it. Splitting the
  // ramp between the two (land takes wash + mid, objects take solid + shade +
  // paper) makes that impossible rather than something to remember.
  const lit: CSSProperties = { fill: tint.solid };
  const side: CSSProperties = { fill: tint.shade };
  const paper: CSSProperties = { fill: tint.paper };

  switch (motif) {
    /* Saying the thing that answers the question.
       This was a rising bar chart, which was wrong twice over. It read as
       *analytics* — this product's own Analytics nav icon, three vertical
       bars, sits in the sidebar on the same screen — and it only looked apt
       because one of the two presets it serves happens to say "plateau". The
       other is a promise about roast dates, where a chart means nothing. */
    case "answer":
      return (
        <g>
          <polygon points="16,32 16,43 26,32" style={lit} />
          <rect x="8" y="8" width="38" height="25" rx="6" style={lit} />
          <path d="M27 8H40A6 6 0 0 1 46 14V27A6 6 0 0 1 40 33H27Z" style={side} />
          <rect x="15" y="14.5" width="24" height="3" rx="1.5" style={paper} />
          <rect x="15" y="21.5" width="16" height="3" rx="1.5" style={paper} />
        </g>
      );

    /* A win worth marking. */
    case "celebrate":
      return (
        <g>
          <path d="M15 15h-4c-2 0-2 7 4 7" style={{ stroke: tint.shade, fill: "none" }} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M39 15h4c2 0 2 7-4 7" style={{ stroke: tint.shade, fill: "none" }} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M15 12h24v11c0 7-6 11-12 11s-12-4-12-11Z" style={lit} />
          <path d="M27 12h12v11c0 7-6 11-12 11Z" style={side} />
          <rect x="24" y="34" width="6" height="5" style={side} />
          <polygon points="17,39 37,39 39,43 15,43" style={lit} />
          <path d="M27 17.5l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4Z" style={paper} />
        </g>
      );

    /* People, not a person — the middle figure reads first. */
    case "community":
      return (
        <g>
          <circle cx="14" cy="24" r="4.4" style={side} />
          <path d="M8 43v-8a6 6 0 0 1 12 0v8Z" style={side} />
          <circle cx="40" cy="24" r="4.4" style={side} />
          <path d="M34 43v-8a6 6 0 0 1 12 0v8Z" style={side} />
          <circle cx="27" cy="19" r="5.6" style={lit} />
          <path d="M19 43v-9a8 8 0 0 1 16 0v9Z" style={lit} />
        </g>
      );

    /* Practical facts — when you can turn up.
       A signpost was aimed at the wrong half of the job: it says *where*, and
       both presets this serves are about *when* (Saturdays 9am–2pm; open daily
       7am–4pm). A clock also separates cleanly from `date` — recurring hours
       against one occasion on the calendar. */
    case "inform":
      return (
        <g>
          <circle cx="27" cy="26" r="16" style={lit} />
          <path d="M27 10A16 16 0 0 1 27 42Z" style={side} />
          <circle cx="27" cy="26" r="12.5" style={paper} />
          <rect x="25.6" y="16.5" width="2.8" height="10" rx="1.4" style={side} />
          <rect x="27" y="24.6" width="10.5" height="2.8" rx="1.4" style={side} />
          <circle cx="27" cy="26" r="1.8" style={side} />
        </g>
      );

    /* A way in, standing open.
       The arch this replaces meant the right thing but at 54px could as easily
       have been a tunnel or a window. A leaf pushed aside with light coming
       through says "door" outright — and says it flat, where a door swung open
       toward the viewer would have needed perspective the scene doesn't have. */
    case "invite":
      return (
        <g>
          <rect x="13" y="10" width="28" height="33" rx="2" style={side} />
          <rect x="16" y="13" width="9" height="30" style={paper} />
          <rect x="25" y="13" width="13" height="30" style={lit} />
          <circle cx="28" cy="30" r="1.6" style={paper} />
        </g>
      );

    /* Something new, raised where people can see it. */
    case "announce":
      return (
        <g>
          <rect x="14" y="10" width="3.4" height="33" rx="1.7" style={side} />
          <path d="M17.4 12h24l-6 8 6 8h-24Z" style={lit} />
          <path d="M29.4 12h12l-6 8 6 8h-12Z" style={side} />
          <circle cx="15.7" cy="9" r="2.6" style={lit} />
        </g>
      );

    /* A fixed point in the calendar.
       Drawn straight on rather than in the shallow isometric the other objects
       use: at this size the bevel was all that distinguished it from a plain
       block, and it read as neither. Binding rings, a banded head and a month
       above the day are what actually say "calendar".
       `date` is the real one off the moment when it names one — several
       moments ("the week ahead") don't, and those get ruled lines rather than
       a date we'd have to invent. */
    case "date":
      return (
        <g>
          <rect x="17.5" y="7" width="3" height="9" rx="1.5" style={side} />
          <rect x="33.5" y="7" width="3" height="9" rx="1.5" style={side} />
          <path d="M11 15a3 3 0 0 1 3-3h26a3 3 0 0 1 3 3v6H11Z" style={lit} />
          <path d="M11 21h32v19a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3Z" style={paper} />
          {date ? (
            <>
              <text
                x="27"
                y="19"
                textAnchor="middle"
                fontSize="6.4"
                fontWeight={700}
                letterSpacing="0.6"
                fontFamily="'Source Sans Pro', sans-serif"
                style={paper}
              >
                {date.month.toUpperCase()}
              </text>
              <text
                x="27"
                y="37.5"
                textAnchor="middle"
                fontSize="16"
                fontWeight={700}
                fontFamily="'Source Sans Pro', sans-serif"
                style={side}
              >
                {date.day}
              </text>
            </>
          ) : (
            <g style={side} opacity={0.4}>
              <rect x="16" y="27" width="22" height="2.6" rx="1.3" />
              <rect x="16" y="34" width="13" height="2.6" rx="1.3" />
            </g>
          )}
        </g>
      );

    /* Let the engine choose — the piece that fits, which the user doesn't have
       to go looking for. */
    case "surprise":
      return (
        <g>
          <rect x="13" y="14" width="28" height="28" rx="6" style={lit} />
          <path d="M27 14H35A6 6 0 0 1 41 20V36A6 6 0 0 1 35 42H27Z" style={side} />
          <g style={paper}>
            <circle cx="20" cy="21" r="2.6" />
            <circle cx="34" cy="21" r="2.6" />
            <circle cx="27" cy="28" r="2.6" />
            <circle cx="20" cy="35" r="2.6" />
            <circle cx="34" cy="35" r="2.6" />
          </g>
          {/* Drawn straight on rather than isometric, per the rules above.
              The puzzle piece that stood here said "the missing piece"; this
              card means "pick one at random", and a puzzle piece is the
              standard mark for a plugin besides. A die says chance outright. */}
          <path d="M46 7l1.1 2.4 2.4 1.1-2.4 1.1L46 14l-1.1-2.4-2.4-1.1 2.4-1.1Z" style={side} />
        </g>
      );
  }
}

export interface CalendarDate {
  /** Three letters, as printed on the calendar's head. */
  month: string;
  day: number;
}

/**
 * The date out of a calendar moment, for the `date` motif.
 *
 * Moments are free strings ("National Fitness Day (Aug 27)", "the week
 * ahead"), so this returns null whenever there isn't a real date in there —
 * the card then draws ruled lines instead of showing a date that would be
 * made up.
 */
export function momentDate(moment: string): CalendarDate | null {
  const match = moment.match(/\b([A-Z][a-z]{2,8})\s+(\d{1,2})\b/);
  if (!match) return null;
  const day = Number(match[2]);
  if (day < 1 || day > 31) return null;
  return { month: match[1].slice(0, 3), day };
}
