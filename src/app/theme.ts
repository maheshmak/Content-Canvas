// SocialPilot design tokens.
//
// These map to the --sp-* aliases in src/styles/tokens.css, which in turn point
// at the real design-system tokens in src/DesignSystemWeb/styles.css. The alias
// hop exists because the design system's slash-separated names cannot be
// referenced from a JS inline style — see the comment in tokens.css.
//
// Nothing outside src/app/templates/compositions should hardcode a hex value.
export const sp = {
  white:         "var(--sp-white)",
  bg:            "var(--sp-bg)",
  surface2:      "var(--sp-surface-2)",
  inputBg:        "var(--sp-input-bg)",
  inputHover:     "var(--sp-input-hover)",
  inputActive:    "var(--sp-input-active)",
  inputDisabled:  "var(--sp-input-disabled)",
  borderInput:    "var(--sp-border-input)",
  borderInputDisabled: "var(--sp-border-input-disabled)",
  borderDanger:   "var(--sp-border-danger)",

  borderPrimary: "var(--sp-border-primary)",
  borderSub:     "var(--sp-border-sub)",
  // #89B9FF — the design uses this, not the bolder brand blue, for the
  // selected template row.
  borderActive:  "var(--sp-border-input-active)",
  track:         "var(--sp-track)",

  textPrimary:   "var(--sp-text-primary)",
  textSecondary: "var(--sp-text-secondary)",
  textTertiary:  "var(--sp-text-tertiary)",
  textDisabled:  "var(--sp-text-disabled)",
  iconSecondary: "var(--sp-icon-secondary)",
  danger:        "var(--sp-danger)",
  success:       "var(--sp-success)",
  successWash:   "var(--sp-success-wash)",
  infoWash:      "var(--sp-info-wash)",
  info:          "var(--sp-info)",
  borderInfo:    "var(--sp-border-info)",
  navbarBg:      "var(--sp-navbar-bg)",

  /* App chrome */
  sidebarBg:      "var(--sp-sidebar-bg)",
  sidebarDivider: "var(--sp-sidebar-divider)",
  divider:        "var(--sp-divider)",
  /* #FFCB00 — see the note in tokens.css; this is NOT `gold`. */
  brandSecondary: "var(--sp-brand-secondary)",

  blue:          "var(--sp-blue)",
  blueSubtle:    "var(--sp-blue-subtle)",
  blueBorder:    "var(--sp-blue-border)",
  blueDisabled:  "var(--sp-blue-disabled)",
  gold:          "var(--sp-gold)",
  aiYellow:      "var(--sp-ai-yellow)",
  aiBlue:        "var(--sp-ai-blue)",
  aiOrange:      "var(--sp-ai-orange)",
} as const;

/** One illustration hue: a sky, a ground, a lit face, a shaded face, and the
 *  one value that isn't part of the hue — paper, for anything that has to read
 *  as a printed surface whatever the backdrop behind it is doing. */
export interface Tint {
  wash: string;
  mid: string;
  solid: string;
  shade: string;
  paper: string;
}

const tintOf = (name: string): Tint => ({
  wash: `var(--sp-tint-${name}-wash)`,
  mid: `var(--sp-tint-${name}-mid)`,
  solid: `var(--sp-tint-${name}-solid)`,
  paper: "var(--sp-white)",
  // Mixed rather than aliased: two of these four families have no dark step in
  // the design system, and `color-mix` keeps the solid as the single source of
  // truth instead of hardcoding the missing hexes here.
  shade: `color-mix(in srgb, var(--sp-tint-${name}-solid) 68%, black)`,
});

/**
 * The idea-card palette, in the order cards consume it.
 *
 * Assigned by position in the row, not by what the card means. Colour-as-
 * meaning would be a promise the product can't keep — nobody learns that blue
 * means "answer the question" — whereas rotating by position guarantees that
 * no two cards in a row (there are four) ever share a hue. The *drawing*
 * carries the meaning; the colour just keeps the row legible.
 */
export const TINTS: readonly Tint[] = [
  tintOf("blue"),
  tintOf("green"),
  tintOf("orange"),
  tintOf("red"),
];

/** Spacing scale — SocialPilot --spacing/* tokens, as lengths. */
export const space = {
  0: "var(--sp-space-0)",
  2: "var(--sp-space-2)",
  4: "var(--sp-space-4)",
  8: "var(--sp-space-8)",
  12: "var(--sp-space-12)",
  16: "var(--sp-space-16)",
  24: "var(--sp-space-24)",
  32: "var(--sp-space-32)",
  48: "var(--sp-space-48)",
} as const;

/** Radius scale — SocialPilot --border-radius/* tokens, as lengths. */
export const radius = {
  0: "var(--sp-radius-0)",
  2: "var(--sp-radius-2)",
  4: "var(--sp-radius-4)",
  8: "var(--sp-radius-8)",
  16: "var(--sp-radius-16)",
} as const;

/** Type ramp — SocialPilot --font/size/* and --font/line-height/* tokens. */
export const type = {
  xs: { size: "var(--sp-font-xs)", line: "var(--sp-lh-xs)" },
  s:  { size: "var(--sp-font-s)",  line: "var(--sp-lh-s)" },
  m:  { size: "var(--sp-font-m)",  line: "var(--sp-lh-m)" },
} as const;

export const FONT = "'Source Sans Pro', sans-serif";
