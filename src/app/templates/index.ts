import type { CSSProperties } from "react";
import type { FieldDef, TemplateDef } from "./schema";
import { DEFAULT_FEEL, FEEL_OPTIONS } from "../components/AnimationPlayer";
import { BADGE_TEXT_FRAME_VARIANTS } from "../components/LayerCanvas";
import {
  RatingRow, RATING_VARIANTS,
  DiscountBadge, BADGE_FRAME_VARIANTS,
  MapPin, PIN_VARIANTS,
  TipNumeral, NUMBER_VARIANTS,
  Confetti,
} from "./art";

/**
 * Templates are visual treatments, not content.
 *
 * This modal opens on media the AI has already produced, for a post whose copy
 * the AI has already written. A template's job is to decide how type sits on
 * that media — where, how bold, what emphasis, how it animates. Layers marked
 * with `source` take their words from the post, so the user never meets a blank
 * box; the rest are the template's own small fixed bits.
 *
 * Every layer is independently positioned, which is what makes the canvas
 * directly editable: an element can be selected, dragged and typed into because
 * it is described rather than hardcoded.
 *
 * Every template puts its type directly on the photo. Real reference apps
 * (Veed, CapCut, Vimeo) never float a drop-shadowed card or banner over the
 * media — either bold type sits straight on it with just enough shadow to
 * read, or a badge gets a small flat chip sized to its own text. Difference
 * between templates comes from position and hierarchy, not added surfaces.
 */

/* Shared text treatments, in 1080-wide canvas units. */
// `white-space: pre-wrap` on every style below: `normal` (the CSS default)
// collapses a typed line break to a space, so pressing Enter while editing
// would look like it worked and then silently vanish from the result.
// `pre-wrap` keeps a manual break as a break while still wrapping long lines
// at the safe-area edge exactly as before.

const headline = (): CSSProperties => ({
  fontSize: "96px",
  fontWeight: 900,
  color: "#fff",
  lineHeight: 1.1,
  textShadow: "0 2px 12px rgba(0,0,0,0.55)",
  whiteSpace: "pre-wrap",
  margin: 0,
});

const support = (): CSSProperties => ({
  fontSize: "50px",
  fontWeight: 400,
  color: "rgba(255,255,255,0.85)",
  lineHeight: 1.4,
  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
  whiteSpace: "pre-wrap",
  margin: 0,
});

const chip = (accent: string): CSSProperties => ({
  display: "inline-block",
  fontSize: "40px",
  fontWeight: 700,
  letterSpacing: "6px",
  textTransform: "uppercase",
  color: "#fff",
  background: accent,
  padding: "12px 36px",
  borderRadius: "60px",
  whiteSpace: "pre-wrap",
  margin: 0,
});

const pricePill = (accent: string): CSSProperties => ({
  display: "inline-block",
  fontSize: "110px",
  fontWeight: 900,
  color: accent,
  lineHeight: 1,
  textShadow: "0 2px 10px rgba(0,0,0,0.45)",
  whiteSpace: "pre-wrap",
  margin: 0,
});

const accentLine = (accent: string): CSSProperties => ({
  fontSize: "46px",
  fontWeight: 600,
  color: accent,
  // Coloured (not white) foreground needs its own legibility net wherever it
  // lands on the photo — two layers, a tight dark core plus a soft spread.
  textShadow: "0 1px 3px rgba(0,0,0,0.6), 0 2px 14px rgba(0,0,0,0.45)",
  whiteSpace: "pre-wrap",
  margin: 0,
});

const motionStyleField: FieldDef = {
  key: "animationStyle",
  type: "select",
  label: "Motion",
  default: DEFAULT_FEEL,
  options: FEEL_OPTIONS,
  variant: "pills",
};

const accentField = (defaultColor: string): FieldDef => ({
  key: "accentColor",
  type: "color",
  label: "Accent Colour",
  default: defaultColor,
});

export const templates: TemplateDef[] = [
  {
    id: "five-star-rating",
    name: "Star Rating",
    category: "Reviews",
    description: "A customer review, with the rating up front",
    previewColor: "#F5A623",
    icon: "⭐",
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    scrim: true,
    globalFields: [motionStyleField, accentField("#F5A623")],
    layers: [
      {
        id: "rating",
        label: "Rating",
        icon: "⭐",
        kind: "custom",
        render: RatingRow,
        variants: RATING_VARIANTS,
        defaultVariant: "filled",
        fields: [{ key: "rating", type: "number", label: "Stars", default: 5, min: 1, max: 5 }],
        position: { x: 0.5, y: 0.62, align: "center" },
        motion: { type: "fade", delay: 5 },
      },
      {
        id: "review",
        label: "Review",
        icon: "💬",
        kind: "text",
        source: "post.headline",
        textKey: "reviewText",
        style: headline,
        fields: [
          { key: "reviewText", type: "text", label: "Review", default: "Best haircut in town!", maxLength: 80 },
        ],
        // Centred, not the bottom-left stack every other template uses — the
        // one thing that makes a review actually read as a quote.
        position: { x: 0.5, y: 0.7, align: "center" },
        motion: { type: "slide-up", delay: 28 },
      },
      {
        id: "customer",
        label: "Customer name",
        icon: "👤",
        kind: "text",
        textKey: "customerName",
        style: accentLine,
        fields: [
          { key: "customerName", type: "text", label: "Customer name", default: "Happy Customer", maxLength: 30 },
        ],
        position: { x: 0.5, y: 0.86, align: "center" },
        motion: { type: "fade", delay: 50 },
      },
    ],
  },

  {
    id: "summer-sale",
    name: "Offer",
    category: "Offers",
    description: "A discount badge over the media",
    previewColor: "#FF6B35",
    icon: "🏷️",
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    scrim: true,
    globalFields: [motionStyleField, accentField("#FF6B35")],
    layers: [
      {
        id: "label",
        label: "Label",
        icon: "🏷️",
        kind: "text",
        textKey: "label",
        style: chip,
        frameVariants: BADGE_TEXT_FRAME_VARIANTS,
        defaultFrameVariant: "pill",
        fields: [{ key: "label", type: "text", label: "Label", default: "Flash Sale", maxLength: 20 }],
        position: { x: 0.5, y: 0.08, align: "center" },
        motion: { type: "fade", delay: 0 },
      },
      {
        id: "badge",
        label: "Discount badge",
        icon: "💯",
        kind: "custom",
        render: DiscountBadge,
        variants: BADGE_FRAME_VARIANTS,
        defaultVariant: "circle",
        previewScale: 0.1,
        hasInternalText: true,
        fields: [{ key: "discount", type: "number", label: "Discount %", default: 30, min: 5, max: 90 }],
        position: { x: 0.5, y: 0.42, align: "center" },
        motion: { type: "pop", delay: 5 },
      },
      {
        id: "headline",
        label: "Headline",
        icon: "📣",
        kind: "text",
        source: "post.headline",
        textKey: "headline",
        style: headline,
        fields: [{ key: "headline", type: "text", label: "Headline", default: "Summer Sale", maxLength: 24 }],
        position: { x: 0.075, y: 0.78, align: "left" },
        motion: { type: "slide-up", delay: 28 },
      },
      {
        id: "tagline",
        label: "Tagline",
        icon: "💬",
        kind: "text",
        source: "post.cta",
        textKey: "tagline",
        style: support,
        fields: [
          { key: "tagline", type: "text", label: "Tagline", default: "Limited time only — shop now!", maxLength: 50 },
        ],
        position: { x: 0.075, y: 0.89, align: "left" },
        motion: { type: "fade", delay: 48 },
      },
    ],
  },

  {
    id: "grand-opening",
    name: "Grand Opening",
    category: "Announcements",
    description: "A celebratory announcement with confetti",
    previewColor: "#8B5CF6",
    icon: "🎉",
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    scrim: true,
    ambient: Confetti,
    globalFields: [motionStyleField, accentField("#8B5CF6")],
    layers: [
      {
        id: "badge",
        label: "Badge",
        icon: "🏷️",
        kind: "text",
        textKey: "badge",
        style: chip,
        frameVariants: BADGE_TEXT_FRAME_VARIANTS,
        defaultFrameVariant: "pill",
        fields: [{ key: "badge", type: "text", label: "Badge", default: "Now Open", maxLength: 20 }],
        position: { x: 0.5, y: 0.07, align: "center" },
        motion: { type: "pop", delay: 12 },
      },
      {
        id: "business",
        label: "Business name",
        icon: "🏪",
        kind: "text",
        source: "post.headline",
        textKey: "businessName",
        style: headline,
        fields: [
          { key: "businessName", type: "text", label: "Business name", default: "The Corner Cafe", maxLength: 30 },
        ],
        // Dead centre, under the badge — the confetti and the centring are
        // what carry this template's identity, not a graphic device.
        position: { x: 0.5, y: 0.5, align: "center" },
        motion: { type: "pop", delay: 20 },
      },
      {
        id: "message",
        label: "Message",
        icon: "💬",
        kind: "text",
        source: "post.hook",
        textKey: "message",
        style: support,
        fields: [
          { key: "message", type: "text", label: "Message", default: "Join us for our grand opening!", maxLength: 50 },
        ],
        position: { x: 0.5, y: 0.605, align: "center" },
        motion: { type: "fade", delay: 40 },
      },
      {
        id: "date",
        label: "Date",
        icon: "📅",
        kind: "text",
        textKey: "date",
        style: chip,
        frameVariants: BADGE_TEXT_FRAME_VARIANTS,
        defaultFrameVariant: "pill",
        fields: [{ key: "date", type: "text", label: "Date", default: "July 28, 2025", maxLength: 30 }],
        position: { x: 0.5, y: 0.69, align: "center" },
        motion: { type: "fade", delay: 54 },
      },
    ],
  },

  {
    id: "service-highlight",
    name: "Service Spotlight",
    category: "Services & Prices",
    description: "One service, its price up front",
    previewColor: "#0EA5E9",
    icon: "🌟",
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    scrim: true,
    globalFields: [motionStyleField, accentField("#0EA5E9")],
    layers: [
      {
        id: "label",
        label: "Label",
        icon: "🏷️",
        kind: "text",
        textKey: "label",
        style: chip,
        frameVariants: BADGE_TEXT_FRAME_VARIANTS,
        defaultFrameVariant: "pill",
        fields: [{ key: "label", type: "text", label: "Label", default: "Featured", maxLength: 20 }],
        position: { x: 0.075, y: 0.07, align: "left" },
        motion: { type: "fade", delay: 8 },
      },
      {
        id: "price",
        label: "Price",
        icon: "💷",
        kind: "text",
        textKey: "price",
        style: pricePill,
        // A short corner tag, not a wrapping paragraph — without its own
        // width it defaulted to the same near-full-canvas box "label" gets,
        // which put both layers' hit areas on top of each other even though
        // they render in opposite corners.
        textWidth: 0.3,
        // A price tag in the opposite corner from the label, rather than
        // buried in the bottom stack — the number is this template's point.
        position: { x: 0.925, y: 0.065, align: "right" },
        fields: [
          { key: "price", type: "text", label: "Price", default: "$35", maxLength: 12, showCount: false },
        ],
        motion: { type: "pop", delay: 12 },
      },
      {
        id: "service",
        label: "Service name",
        icon: "✂️",
        kind: "text",
        source: "post.headline",
        textKey: "serviceName",
        style: headline,
        fields: [
          { key: "serviceName", type: "text", label: "Service name", default: "Classic Haircut", maxLength: 30 },
        ],
        position: { x: 0.075, y: 0.78, align: "left" },
        motion: { type: "slide-up", delay: 30 },
      },
      {
        id: "description",
        label: "Description",
        icon: "📝",
        kind: "text",
        source: "post.cta",
        textKey: "description",
        style: support,
        fields: [
          {
            key: "description",
            type: "text",
            label: "Description",
            default: "Precision cut, wash & style included",
            maxLength: 60,
          },
        ],
        position: { x: 0.075, y: 0.9, align: "left" },
        motion: { type: "fade", delay: 50 },
      },
    ],
  },

  {
    id: "pro-tip",
    name: "Pro Tip",
    category: "Tips",
    description: "A numbered tip with a follow prompt",
    previewColor: "#10B981",
    icon: "💡",
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    scrim: true,
    globalFields: [motionStyleField, accentField("#10B981")],
    layers: [
      {
        id: "numeral",
        label: "Number",
        icon: "🔢",
        kind: "custom",
        render: TipNumeral,
        variants: NUMBER_VARIANTS,
        defaultVariant: "plain",
        previewScale: 0.3,
        hasInternalText: true,
        fields: [{ key: "tipNumber", type: "number", label: "Tip number", default: 1, min: 1, max: 99 }],
        position: { x: 0.92, y: 0.03, align: "right" },
        motion: { type: "fade", delay: 0 },
      },
      {
        id: "tip",
        label: "Tip",
        icon: "💡",
        kind: "text",
        source: "post.headline",
        textKey: "tipText",
        style: headline,
        fields: [
          {
            key: "tipText",
            type: "text",
            label: "Tip",
            default: "Always use heat protectant before styling",
            maxLength: 80,
          },
        ],
        position: { x: 0.5, y: 0.46, align: "center" },
        motion: { type: "slide-up", delay: 26 },
      },
      {
        id: "cta",
        label: "Call to action",
        icon: "👉",
        kind: "text",
        source: "post.cta",
        textKey: "ctaText",
        style: accentLine,
        fields: [
          { key: "ctaText", type: "text", label: "Call to action", default: "Follow for more tips!", maxLength: 40 },
        ],
        // Close under the tip, inside the scrim's actual dark band rather
        // than out past where it's already faded to transparent.
        position: { x: 0.5, y: 0.64, align: "center" },
        motion: { type: "fade", delay: 52 },
      },
    ],
  },

  {
    id: "find-us",
    name: "Find Us",
    category: "Hours & Location",
    description: "Where you are and when you're open",
    previewColor: "#F59E0B",
    icon: "📍",
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    scrim: true,
    globalFields: [motionStyleField, accentField("#F59E0B")],
    layers: [
      {
        id: "pin",
        label: "Map pin",
        icon: "📍",
        kind: "custom",
        render: MapPin,
        variants: PIN_VARIANTS,
        defaultVariant: "classic",
        previewScale: 0.5,
        fields: [],
        position: { x: 0.5, y: 0.6, align: "center" },
        motion: { type: "slide-up", delay: 0 },
      },
      {
        id: "address",
        label: "Address",
        icon: "🏠",
        kind: "text",
        source: "post.headline",
        textKey: "address",
        style: headline,
        fields: [
          { key: "address", type: "text", label: "Address", default: "123 Main Street, Downtown", maxLength: 50 },
        ],
        position: { x: 0.075, y: 0.7, align: "left" },
        motion: { type: "slide-up", delay: 20 },
      },
      {
        id: "phone",
        label: "Phone",
        icon: "📞",
        kind: "text",
        textKey: "phone",
        style: accentLine,
        // Left column of a two-column row — the split itself is what makes
        // this read as an info line rather than another stacked caption.
        textWidth: 0.4,
        fields: [
          { key: "phone", type: "text", label: "Phone", default: "(555) 123-4567", maxLength: 20, showCount: false },
        ],
        position: { x: 0.075, y: 0.865, align: "left" },
        motion: { type: "fade", delay: 34 },
      },
      {
        id: "hours",
        label: "Hours",
        icon: "🕐",
        kind: "text",
        textKey: "hours",
        style: support,
        // Right column of the same row.
        textWidth: 0.4,
        fields: [
          { key: "hours", type: "text", label: "Hours", default: "Mon–Sat  9am – 7pm", maxLength: 40 },
        ],
        position: { x: 0.52, y: 0.865, align: "left" },
        motion: { type: "fade", delay: 42 },
      },
    ],
  },
];

export const templatesByCategory = templates.reduce<Record<string, TemplateDef[]>>((acc, t) => {
  if (!acc[t.category]) acc[t.category] = [];
  acc[t.category].push(t);
  return acc;
}, {});
