import type { TemplateDef } from "../templates/schema";
import { BADGES } from "./badges";
import { SHAPES } from "./shapes";
import { sp, FONT } from "../theme";
import { TabLabel } from "./TabLabel";
import { BadgeSwatch, ShapeSwatch } from "./swatches";

/**
 * Browse-and-insert grid for the Shape rail tab — same list-panel shell as
 * `TemplatePanel`, but each tile is a live-rendered swatch (from `swatches.tsx`)
 * rather than a bare icon, since the whole point here is "see the actual
 * thing before you drop it on the canvas."
 */
export function ElementsPanel({
  template,
  accent,
  onInsertBadge,
  onInsertShape,
}: {
  template: TemplateDef | null;
  accent: string;
  onInsertBadge: (badgeId: string) => void;
  onInsertShape: (shapeId: string) => void;
}) {
  return (
    <div
      style={{
        width: "240px",
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "8px",
        background: sp.white,
        borderRight: `1px solid ${sp.borderSub}`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", width: "100%", height: "32px", flexShrink: 0 }}>
        <TabLabel>Shape</TabLabel>
      </div>

      {!template ? (
        <p style={{ margin: 0, padding: "0 8px", fontFamily: FONT, fontSize: "14px", lineHeight: "18px", color: sp.textTertiary }}>
          Pick a template first — there's nowhere to drop an element without a post underneath it yet.
        </p>
      ) : (
        <div
          className="scroll-area"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "0 8px 8px",
          }}
        >
          <Section label="Badge">
            {BADGES.map((b) => (
              <BadgeSwatch key={b.id} badge={b} accent={accent} onClick={() => onInsertBadge(b.id)} />
            ))}
          </Section>

          <Section label="Shapes">
            {SHAPES.map((s) => (
              <ShapeSwatch key={s.id} shapeId={s.id} onClick={() => onInsertShape(s.id)} />
            ))}
          </Section>

          {/* Stickers (Offer/Location/Rating/Tip) are paused here — their
              current artwork isn't ready to ship, the same reasoning IconRail
              gives the Text tab. Re-add once Phase 11 rebuilds them from real
              SVG source. Editing a sticker already placed by a template is
              unaffected — that still goes through CustomizePanel. */}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ margin: 0, fontFamily: FONT, fontSize: "14px", lineHeight: "18px", fontWeight: 400, color: sp.textPrimary }}>
        {label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>{children}</div>
    </div>
  );
}
