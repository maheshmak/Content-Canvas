import type { ReactNode } from "react";
import type { Brand, ConnectedPlatform, GeneratedIdea } from "../brand/types";
import type { TemplateDef, TemplateState } from "../templates/schema";
import type { PostStage } from "./useStagedReveal";
import { PLATFORM_META } from "../brand/fixtures";
import { platformCaption } from "../brand/platformCopy";
import { PosterPreview } from "./PosterPreview";
import { PlatformIcon } from "./PlatformIcon";
import { AccountAvatar } from "./AccountAvatar";
import { SparkleIcon } from "./icons";
import { sp, space, radius, type, FONT } from "../theme";

/* Geometry from the Figma frame (7052:587293). The column is 392 with 16 of
   padding, so everything inside is 360 wide. */
export const COLUMN_W = 392;

/**
 * The ground an image develops out of: the post's own accent, held back to a
 * wash. The colour is real — it is decided at the same moment the idea is — so
 * the placeholder previews the post rather than standing in for it, but at a
 * fifth strength it stays a surface instead of becoming a statement.
 */
export function mediaTint(accent: string): string {
  return `color-mix(in srgb, ${accent} 18%, white)`;
}
const INNER_W = 360;
const ACCOUNT_H = 66;
const CAPTION_H = 88;

/**
 * One connected account's post.
 *
 * **The whole point of this component is that its two states are the same
 * size.** The frame draws the media box at 360×480; our posters are 9:16, so
 * the height is derived from the template instead of pinned to 480 — cropping
 * to the frame's box would cut off the CTA line these templates put at the
 * bottom. What matters is that the *pending* and *ready* states both use that
 * one derived number, so nothing reflows when a post lands. A reveal that
 * shoves the page around is worse than no reveal.
 */
export function PostColumn({
  brand,
  platform,
  idea,
  template,
  state,
  stage,
  focus,
  revealDelayMs = 0,
  onEditImage,
}: {
  brand: Brand;
  platform: ConnectedPlatform;
  idea: GeneratedIdea;
  template: TemplateDef;
  state: TemplateState;
  stage: PostStage;
  /**
   * Where this card sits in the run — which is what the row uses to show
   * progress now that every card is present from the start.
   *
   * `done` is deliberately not held back. A finished post is finished: it can
   * be read, edited and scheduled, and dimming it to keep the spotlight tidy
   * would say the opposite about work the user can already use. Only `queued`
   * recedes, because that card genuinely has nothing in it yet.
   */
  focus: "queued" | "active" | "done";
  /** Staggers the row's entrance. Cadence, not sequence — see the call site. */
  revealDelayMs?: number;
  onEditImage: () => void;
}) {
  const meta = PLATFORM_META[platform.type];
  const mediaH = Math.round((INNER_W * template.height) / template.width);
  const accent = String(state.values.accentColor ?? template.previewColor);
  const captionReady = stage >= 1;
  const imageReady = stage === 2;

  return (
    // Two elements, because one cannot hold both. `cc-genie` fills forwards,
    // so its final keyframe keeps applying `opacity: 1` for the rest of the
    // run — on a single element that silently wins over the focus dimming
    // below and no queued card ever recedes. The entrance owns the wrapper;
    // the card owns its state.
    <div
      className="cc-genie"
      style={{
        willChange: "transform, opacity",
        animationDelay: `${revealDelayMs}ms`,
        width: `${COLUMN_W}px`,
        flexShrink: 0,
      }}
    >
    <section
      // `cc-lit` animates the shadow; the inline value below is its static
      // resting frame, standing in for reduced-motion (animation off).
      className={focus === "active" ? "cc-focus cc-lit" : "cc-focus"}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: space[16],
        display: "flex",
        flexDirection: "column",
        gap: space[16],
        background: sp.white,
        // The lit card. A ring plus a soft lift rather than a heavier border,
        // so the card's own geometry never changes as focus moves along the
        // row — the highlight is entirely outside the border box. The glow
        // is mixed from the same colour as this border (`sp.borderActive`),
        // not the more saturated `sp.blue` — see the note in index.css.
        border: `1px solid ${focus === "active" ? sp.borderActive : sp.borderSub}`,
        boxShadow:
          focus === "active"
            ? `0 0 4px 1px color-mix(in srgb, ${sp.borderActive} 35%, transparent), 0 2px 8px -2px color-mix(in srgb, ${sp.borderActive} 28%, transparent)`
            : "none",
        opacity: focus === "queued" ? 0.55 : 1,
        borderRadius: radius[8],
      }}
    >
      {/* Known at t=0 — this comes from the connected account, not from
          generation. Showing it immediately is what tells the user how many
          posts are coming and who they're for. */}
      <header style={{ display: "flex", alignItems: "center", gap: space[8], height: "32px" }}>
        <PlatformIcon platform={platform.type} size={24} decorative />
        <span style={{ flex: 1, minWidth: 0, fontSize: type.s.size, fontWeight: 600, color: sp.textPrimary }}>{meta.label}</span>
        <button
          type="button"
          disabled={!imageReady}
          onClick={onEditImage}
          style={{
            display: "flex",
            alignItems: "center",
            gap: space[4],
            height: "32px",
            padding: `0 ${space[8]}`,
            border: "none",
            borderRadius: radius[2],
            background: "none",
            color: imageReady ? sp.blue : sp.textDisabled,
            fontFamily: FONT,
            fontSize: type.s.size,
            cursor: imageReady ? "pointer" : "default",
          }}
        >
          <SparkleIcon width={16} height={16} />
          Create
        </button>
      </header>

      <div style={{ border: `1px solid ${sp.borderSub}`, borderRadius: radius[8], overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: space[8], height: `${ACCOUNT_H}px`, padding: `0 ${space[16]}`, boxSizing: "border-box" }}>
          <AccountAvatar />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: type.s.size, fontWeight: 600, color: sp.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {brand.name}
            </div>
            <div style={{ fontSize: type.xs.size, color: sp.textTertiary }}>{platform.handle}</div>
          </div>
        </div>

        {/* Luma's treatment, which is three things and not one: a flat, quiet
            tile with no shimmer at all; a small label in the corner naming
            what's happening; and the image resolving *from blur in place*
            rather than being swapped in.

            The flatness is the part that's easy to miss. Shimmer is a device
            for "this will be a second" — on a tile that sits for ten seconds
            it reads as fidgeting. A still tile with a word on it reads as
            something being worked on.

            The tile is a *wash* of the post's own accent — the colour at
            about a fifth strength. Full-strength was a slab, and a dark tile
            was heavier still: both fight a light page, and a 360×640 block is
            far too large a surface to carry a saturated colour. Held back to a
            tint it stays quiet, still previews the post's palette, and gives
            the blur something to resolve *out of* rather than onto. */}
        <div style={{ position: "relative", width: `${INNER_W}px`, height: `${mediaH}px`, overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: mediaTint(accent) }} />
          {captionReady && (
            <div
              className="cc-develop"
              style={{
                position: "absolute",
                inset: 0,
                filter: imageReady ? "blur(0px) saturate(1)" : "blur(20px) saturate(0.75)",
                opacity: imageReady ? 1 : 0.85,
                // Scaled a touch while soft, so the blur's edges don't reveal
                // the tile behind it as a halo.
                transform: imageReady ? "none" : "scale(1.06)",
              }}
            >
              <PosterPreview template={template} state={state} width={INNER_W} />
            </div>
          )}

          {/* Only on the card actually being worked on. A queued card carries
              no label at all — the dimming already says it is waiting, and
              labelling it as well was two words for one fact. */}
          {!captionReady && focus === "active" && (
            <span
              style={{
                position: "absolute",
                left: space[12],
                // Top, not bottom. Luma can sit this in the corner because
                // their tiles are small landscape thumbnails; ours is a 9:16
                // poster over 600px tall, so a bottom-left label lands below
                // the fold and the one word explaining the tile is unread.
                top: space[12],
                fontSize: type.xs.size,
                lineHeight: type.xs.line,
                color: sp.textSecondary,
              }}
            >
              Creating…
            </span>
          )}
        </div>

        <div
          style={{
            height: `${CAPTION_H}px`,
            padding: space[16],
            boxSizing: "border-box",
            borderTop: `1px solid ${sp.borderSub}`,
            overflow: "hidden",
          }}
        >
          {captionReady ? (
            <p
              className="cc-reveal"
              style={{ margin: 0, fontSize: type.xs.size, lineHeight: type.xs.line, color: sp.textSecondary, whiteSpace: "pre-wrap" }}
            >
              {platformCaption(idea, platform.type)}
            </p>
          ) : (
            <Placeholder>
              {/* Static on a queued card. Shimmer means "being worked on"; on
                  three cards at once it means nothing at all. */}
              <span style={{ display: "flex", flexDirection: "column", gap: space[8], width: "100%" }}>
                <Bar width="100%" busy={focus === "active"} />
                <Bar width="72%" busy={focus === "active"} />
              </span>
            </Placeholder>
          )}
        </div>
      </div>
    </section>
    </div>
  );
}

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: space[16], boxSizing: "border-box" }}>
      {children}
    </div>
  );
}

function Bar({ width, busy = true }: { width: string; busy?: boolean }) {
  return (
    <span
      className={busy ? "cc-shimmer" : undefined}
      style={{ display: "block", width, height: "10px", borderRadius: radius[4], background: busy ? undefined : sp.track }}
    />
  );
}


