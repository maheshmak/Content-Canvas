import type { FC } from "react";

/**
 * Badges, every one doing a job a small business actually needs.
 *
 * No hearts, sparkles or seasonal decoration: this modal edits media the AI
 * already produced, and the only marks worth adding are ones that change what
 * the post asks of a viewer. Trimmed to six, with nothing trade-specific — a
 * hardware shop and a salon can both use all of them.
 *
 * Sizes are in 1080-wide canvas units.
 */
export interface Badge {
  id: string;
  label: string;
  render: FC<{ accent: string }>;
}

const pill = (accent: string): React.CSSProperties => ({
  display: "inline-block",
  fontSize: "40px",
  fontWeight: 800,
  letterSpacing: "4px",
  color: "#fff",
  background: accent,
  padding: "16px 44px",
  borderRadius: "80px",
  boxShadow: `0 10px 36px ${accent}66`,
  whiteSpace: "nowrap",
});

function textBadge(id: string, label: string, copy: string): Badge {
  return {
    id,
    label,
    render: ({ accent }) => <span style={pill(accent)}>{copy}</span>,
  };
}

export const BADGES: Badge[] = [
  textBadge("open-now", "Open now", "OPEN NOW"),
  textBadge("percent-off", "% off", "% OFF"),
  textBadge("new", "New", "NEW"),
  textBadge("book-now", "Book now", "BOOK NOW"),
  textBadge("call-us", "Call us", "CALL US"),
  {
    id: "five-star",
    label: "Five stars",
    render: ({ accent }) => (
      <span style={{ display: "inline-flex", gap: "10px" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width="72" height="72" viewBox="0 0 24 24" fill={accent}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </span>
    ),
  },
];
