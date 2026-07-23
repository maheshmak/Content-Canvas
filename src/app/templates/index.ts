import type { CSSProperties } from "react";
import type { FieldDef, TemplateDef } from "./schema";
import { DEFAULT_ANIMATION_STYLE, EASING_OPTIONS } from "../components/AnimationPlayer";
import { RatingRow, DiscountBadge, MapPin, TipBadge, Confetti } from "./art";

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
 */

/* Shared text treatments, in 1080-wide canvas units. */
const headline = (): CSSProperties => ({
  fontSize: "96px",
  fontWeight: 900,
  color: "#fff",
  lineHeight: 1.1,
  textShadow: "0 2px 12px rgba(0,0,0,0.55)",
  margin: 0,
});

const support = (): CSSProperties => ({
  fontSize: "50px",
  fontWeight: 400,
  color: "rgba(255,255,255,0.85)",
  lineHeight: 1.4,
  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
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
  margin: 0,
});

const pricePill = (accent: string): CSSProperties => ({
  display: "inline-block",
  fontSize: "110px",
  fontWeight: 900,
  color: accent,
  lineHeight: 1,
  textShadow: "0 2px 10px rgba(0,0,0,0.45)",
  margin: 0,
});

const accentLine = (accent: string): CSSProperties => ({
  fontSize: "46px",
  fontWeight: 600,
  color: accent,
  margin: 0,
});

const motionStyleField: FieldDef = {
  key: "animationStyle",
  type: "select",
  label: "Animation style",
  default: DEFAULT_ANIMATION_STYLE,
  options: EASING_OPTIONS,
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
        fields: [{ key: "rating", type: "number", label: "Stars", default: 5, min: 1, max: 5 }],
        position: { x: 0.075, y: 0.6, align: "left" },
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
        position: { x: 0.075, y: 0.72, align: "left" },
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
        position: { x: 0.075, y: 0.88, align: "left" },
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
        position: { x: 0.075, y: 0.72, align: "left" },
        motion: { type: "pop", delay: 12 },
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
        position: { x: 0.075, y: 0.83, align: "left" },
        motion: { type: "fade", delay: 36 },
      },
      {
        id: "date",
        label: "Date",
        icon: "📅",
        kind: "text",
        textKey: "date",
        style: chip,
        fields: [{ key: "date", type: "text", label: "Date", default: "July 28, 2025", maxLength: 30 }],
        position: { x: 0.075, y: 0.92, align: "left" },
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
        fields: [{ key: "label", type: "text", label: "Label", default: "Featured", maxLength: 20 }],
        position: { x: 0.075, y: 0.07, align: "left" },
        motion: { type: "fade", delay: 8 },
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
        position: { x: 0.075, y: 0.7, align: "left" },
        motion: { type: "slide-up", delay: 18 },
      },
      {
        id: "price",
        label: "Price",
        icon: "💷",
        kind: "text",
        textKey: "price",
        style: pricePill,
        fields: [
          { key: "price", type: "text", label: "Price", default: "$35", maxLength: 12, showCount: false },
        ],
        position: { x: 0.075, y: 0.81, align: "left" },
        motion: { type: "pop", delay: 38 },
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
        position: { x: 0.075, y: 0.92, align: "left" },
        motion: { type: "fade", delay: 56 },
      },
    ],
  },

  {
    id: "pro-tip",
    name: "Pro Tip",
    category: "Tips",
    description: "A numbered tip with a follow prompt",
    previewColor: "#10B981",
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    scrim: true,
    globalFields: [motionStyleField, accentField("#10B981")],
    layers: [
      {
        id: "badge",
        label: "Tip number",
        icon: "🔢",
        kind: "custom",
        render: TipBadge,
        fields: [{ key: "tipNumber", type: "number", label: "Tip number", default: 1, min: 1, max: 99 }],
        position: { x: 0.075, y: 0.08, align: "left" },
        motion: { type: "pop", delay: 0 },
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
        position: { x: 0.075, y: 0.74, align: "left" },
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
        position: { x: 0.075, y: 0.9, align: "left" },
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
        fields: [],
        position: { x: 0.5, y: 0.1, align: "center" },
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
        position: { x: 0.075, y: 0.72, align: "left" },
        motion: { type: "slide-up", delay: 22 },
      },
      {
        id: "phone",
        label: "Phone",
        icon: "📞",
        kind: "text",
        textKey: "phone",
        style: accentLine,
        fields: [
          { key: "phone", type: "text", label: "Phone", default: "(555) 123-4567", maxLength: 20, showCount: false },
        ],
        position: { x: 0.075, y: 0.84, align: "left" },
        motion: { type: "fade", delay: 34 },
      },
      {
        id: "hours",
        label: "Hours",
        icon: "🕐",
        kind: "text",
        textKey: "hours",
        style: support,
        fields: [
          { key: "hours", type: "text", label: "Hours", default: "Mon–Sat  9am – 7pm", maxLength: 40 },
        ],
        position: { x: 0.075, y: 0.91, align: "left" },
        motion: { type: "fade", delay: 50 },
      },
    ],
  },
];

export const templatesByCategory = templates.reduce<Record<string, TemplateDef[]>>((acc, t) => {
  if (!acc[t.category]) acc[t.category] = [];
  acc[t.category].push(t);
  return acc;
}, {});
