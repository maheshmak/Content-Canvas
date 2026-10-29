import type { TemplateDef, TemplateState } from "../templates/schema";
import { LayerCanvas } from "./LayerCanvas";
import { Scrim, scrimRegion } from "./layout";

import photo from "@/assets/headphones.png";

export type PosterStyle = "duotone" | "editorial";

/**
 * Which backdrop treatment to render. Switchable while we settle on one:
 * `?poster=editorial` for the flat field, anything else for duotone.
 */
export const POSTER_STYLE: PosterStyle =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("poster") === "editorial"
    ? "editorial"
    : "duotone";

/** Mix a hex toward black. `amount` is 0 (unchanged) to 1 (black). */
function darken(hex: string, amount: number): string {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  const k = 1 - amount;
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * A still render of a template at a given width, using the exact same
 * full-resolution-then-CSS-scale technique `EditableCanvas` uses for its live
 * preview — the only way to get `LayerCanvas`'s fixed-px type treatments to
 * come out at the right proportion at an arbitrary card size.
 *
 * **Why the backdrop is dark rather than the raw accent.** These templates were
 * authored to sit over a photograph, so they colour some type — a CTA line, a
 * badge — with the post's accent, trusting the photo behind it for contrast.
 * Painting the backdrop that same accent collapsed exactly that: the CTA came
 * out accent-on-accent and was effectively invisible. Both treatments below
 * therefore build on a deeply shaded accent, which restores contrast for the
 * white headline and the accent CTA at once.
 */
export function PosterPreview({
  template,
  state,
  width,
  style = POSTER_STYLE,
}: {
  template: TemplateDef;
  state: TemplateState;
  width: number;
  style?: PosterStyle;
}) {
  const scale = width / template.width;
  const height = Math.round(template.height * scale);
  const settledFrame = template.durationInFrames - 1;
  const accent = String(state.values.accentColor ?? template.previewColor);

  return (
    <div
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
        borderRadius: "8px",
        background: style === "duotone" ? accent : darken(accent, 0.58),
        flexShrink: 0,
      }}
    >
      {style === "duotone" ? (
        <>
          {/* Two-tone: a greyscale photo multiplied over the full-strength
              accent, mapping the photo's highlights to the brand hue and its
              shadows to near-black. Multiply over the saturated accent rather
              than screen over a darkened one — screening washed the hue out to
              grey, which is the opposite of brand-forward.

              The photo is a stand-in (this prototype has no brand library), but
              the treatment is what real imagery would get. */}
          <img
            src={photo}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // Lift the black point so multiply deepens the accent instead of
              // crushing the lower half to mud.
              filter: "grayscale(1) contrast(0.95) brightness(1.18)",
              mixBlendMode: "multiply",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to top, ${darken(accent, 0.82)} 0%, rgba(0,0,0,0) 58%)`,
            }}
          />
        </>
      ) : (
        /* Flat field, but composed: a warm wash off the top-left and a weighted
           base so type has a band to sit on instead of floating on dead colour. */
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: [
              `radial-gradient(120% 90% at 18% 8%, ${accent} 0%, rgba(0,0,0,0) 62%)`,
              `linear-gradient(to top, ${darken(accent, 0.86)} 0%, rgba(0,0,0,0) 62%)`,
            ].join(", "),
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${template.width}px`,
          height: `${template.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {template.scrim ? <Scrim region={scrimRegion(state)} /> : null}
        <LayerCanvas
          template={template}
          state={state}
          frame={settledFrame}
          fps={template.fps}
          width={template.width}
          height={template.height}
        />
      </div>
    </div>
  );
}
