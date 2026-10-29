import { useEffect, useRef, useState } from "react";
import type { Brand } from "../brand/types";
import { sp, space, radius, type, FONT } from "../theme";

function BrandMark({ brand, size }: { brand: Brand; size: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        flexShrink: 0,
        background: brand.logoColor,
        color: sp.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: `${Math.round(size * 0.42)}px`,
      }}
    >
      {brand.logoInitial}
    </span>
  );
}

/**
 * The brand name, as a switcher.
 *
 * With one brand there is nothing to switch to, so it renders as plain text —
 * a caret that opens a list of one is a promise the UI can't keep. With
 * several it becomes a chip: the product's own breadcrumb already uses this
 * pattern, and it keeps the 80% single-brand case at zero extra steps rather
 * than inserting a picker screen everyone has to clear.
 */
export function BrandSwitcher({
  brand,
  brands,
  onSelect,
}: {
  brand: Brand;
  brands: Brand[];
  onSelect: (brandId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    // Dismiss on `click`, not `pointerdown`. Closing on pointerdown unmounts
    // the option list before the pointer's own click can land on it, so
    // picking a brand silently did nothing. By the click phase React has
    // already run the option's handler (it delegates from the root, inside
    // document), so a real selection always wins the race.
    const onDocClick = (e: MouseEvent) => {
      const wrap = wrapRef.current;
      if (wrap && !e.composedPath().includes(wrap)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (brands.length < 2) return <>{brand.name}</>;

  return (
    <span ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: space[4],
          margin: `0 0 0 -${space[4]}`,
          padding: `2px ${space[4]} 2px ${space[4]}`,
          border: "none",
          borderRadius: radius[4],
          background: open ? sp.surface2 : "transparent",
          color: "inherit",
          font: "inherit",
          cursor: "pointer",
          transition: "background-color 0.12s",
        }}
      >
        {brand.name}
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M4 6.5L8 10.5L12 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 20,
            minWidth: "240px",
            padding: space[4],
            background: sp.white,
            border: `1px solid ${sp.borderSub}`,
            borderRadius: radius[8],
            boxShadow: "0px 8px 24px rgba(0,0,0,0.14)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {brands.map((b) => {
            const selected = b.id === brand.id;
            return (
              <button
                key={b.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onSelect(b.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: space[8],
                  width: "100%",
                  padding: space[8],
                  border: "none",
                  borderRadius: radius[4],
                  background: selected ? sp.surface2 : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: FONT,
                }}
              >
                <BrandMark brand={b} size={24} />
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: type.s.size, lineHeight: type.s.line, color: sp.textPrimary, fontWeight: selected ? 600 : 400 }}>
                    {b.name}
                  </span>
                  <span style={{ fontSize: type.xs.size, lineHeight: type.xs.line, color: sp.textTertiary }}>
                    {b.platforms.length} platform{b.platforms.length === 1 ? "" : "s"}
                  </span>
                </span>
                {selected && (
                  <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke={sp.blue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}

export { BrandMark };
