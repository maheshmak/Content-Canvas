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
  inputBg:       "var(--sp-input-bg)",

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

  blue:          "var(--sp-blue)",
  blueSubtle:    "var(--sp-blue-subtle)",
  blueBorder:    "var(--sp-blue-border)",
  blueDisabled:  "var(--sp-blue-disabled)",
  gold:          "var(--sp-gold)",
} as const;

export const FONT = "'Source Sans Pro', sans-serif";
