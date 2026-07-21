import type { TemplateDef } from "./schema";
import { StarRatingComposition } from "./compositions/StarRating";
import { SummerSaleComposition } from "./compositions/SummerSale";
import { TransformationComposition } from "./compositions/Transformation";
import { GrandOpeningComposition } from "./compositions/GrandOpening";
import { ServiceHighlightComposition } from "./compositions/ServiceHighlight";
import { ProTipComposition } from "./compositions/ProTip";
import { FindUsComposition } from "./compositions/FindUs";

export const templates: TemplateDef[] = [
  {
    id: "five-star-rating",
    name: "Star Rating",
    category: "Social Proof",
    description: "Showcase a glowing customer review with animated stars",
    previewColor: "#F5A623",
    component: StarRatingComposition,
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    fields: [
      { key: "rating", type: "number", label: "Stars", default: 5, min: 1, max: 5 },
      { key: "reviewText", type: "text", label: "Review", default: "Best haircut in town!", maxLength: 80 },
      { key: "customerName", type: "text", label: "Customer Name", default: "Happy Customer", maxLength: 30 },
      { key: "accentColor", type: "color", label: "Accent Color", default: "#F5A623" },
    ],
  },
  {
    id: "summer-sale",
    name: "Summer Sale",
    category: "Promotion / Offer",
    description: "Bold discount badge to promote a limited-time offer",
    previewColor: "#FF6B35",
    component: SummerSaleComposition,
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    fields: [
      { key: "headline", type: "text", label: "Headline", default: "Summer Sale", maxLength: 24 },
      { key: "discount", type: "number", label: "Discount %", default: 30, min: 5, max: 90 },
      { key: "tagline", type: "text", label: "Tagline", default: "Limited time only — shop now!", maxLength: 50 },
      { key: "bgColor", type: "color", label: "Background Color", default: "#FF6B35" },
    ],
  },
  {
    id: "transformation",
    name: "Transformation",
    category: "Before / After",
    description: "Dramatic reveal wipe showing before and after results",
    previewColor: "#27AE60",
    component: TransformationComposition,
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    fields: [
      { key: "beforeLabel", type: "text", label: "Before Label", default: "Before", maxLength: 20 },
      { key: "afterLabel", type: "text", label: "After Label", default: "After", maxLength: 20 },
      { key: "resultText", type: "text", label: "Result Text", default: "See the difference!", maxLength: 40 },
      { key: "accentColor", type: "color", label: "Accent Color", default: "#27AE60" },
    ],
  },
  {
    id: "grand-opening",
    name: "Grand Opening",
    category: "Announcement",
    description: "Celebratory reveal with confetti for big announcements",
    previewColor: "#8B5CF6",
    component: GrandOpeningComposition,
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    fields: [
      { key: "businessName", type: "text", label: "Business Name", default: "The Corner Cafe", maxLength: 30 },
      { key: "date", type: "text", label: "Opening Date", default: "July 28, 2025", maxLength: 30 },
      { key: "message", type: "text", label: "Message", default: "Join us for our grand opening!", maxLength: 50 },
      { key: "accentColor", type: "color", label: "Accent Color", default: "#8B5CF6" },
    ],
  },
  {
    id: "service-highlight",
    name: "Service Spotlight",
    category: "Service Showcase",
    description: "Clean spotlight layout to feature a single service",
    previewColor: "#0EA5E9",
    component: ServiceHighlightComposition,
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    fields: [
      { key: "serviceName", type: "text", label: "Service Name", default: "Classic Haircut", maxLength: 30 },
      { key: "price", type: "text", label: "Price", default: "$35", maxLength: 12 },
      { key: "description", type: "text", label: "Description", default: "Precision cut, wash & style included", maxLength: 60 },
      { key: "accentColor", type: "color", label: "Accent Color", default: "#0EA5E9" },
    ],
  },
  {
    id: "pro-tip",
    name: "Pro Tip",
    category: "Tip / Educational",
    description: "Eye-catching tip card to share knowledge with followers",
    previewColor: "#10B981",
    component: ProTipComposition,
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    fields: [
      { key: "tipNumber", type: "number", label: "Tip Number", default: 1, min: 1, max: 99 },
      { key: "tipText", type: "text", label: "Tip Text", default: "Always use heat protectant before styling your hair", maxLength: 80 },
      { key: "ctaText", type: "text", label: "Call to Action", default: "Follow for more tips!", maxLength: 40 },
      { key: "accentColor", type: "color", label: "Accent Color", default: "#10B981" },
    ],
  },
  {
    id: "find-us",
    name: "Find Us",
    category: "Contact / Location",
    description: "Location card with address, phone, and business hours",
    previewColor: "#F59E0B",
    component: FindUsComposition,
    durationInFrames: 90,
    fps: 30,
    width: 1080,
    height: 1920,
    fields: [
      { key: "address", type: "text", label: "Address", default: "123 Main Street, Downtown", maxLength: 50 },
      { key: "phone", type: "text", label: "Phone", default: "(555) 123-4567", maxLength: 20 },
      { key: "hours", type: "text", label: "Business Hours", default: "Mon–Sat  9am – 7pm", maxLength: 40 },
      { key: "accentColor", type: "color", label: "Accent Color", default: "#F59E0B" },
    ],
  },
];

export const templatesByCategory = templates.reduce<Record<string, TemplateDef[]>>((acc, t) => {
  if (!acc[t.category]) acc[t.category] = [];
  acc[t.category].push(t);
  return acc;
}, {});
