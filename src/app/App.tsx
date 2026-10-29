import { useCallback, useMemo, useState } from "react";
import type { TemplateDef, TemplateState } from "./templates/schema";
import { EditMediaModal } from "./components/EditMediaModal";
import { BrandContextStep } from "./components/BrandContextStep";
import { ContentCanvasResults } from "./components/ContentCanvasResults";
import { AppShell } from "./components/chrome/AppShell";
import { useStagedReveal } from "./components/useStagedReveal";
import { CanvasBreadcrumb } from "./components/chrome/CanvasBreadcrumb";
import type { MediaItem, MediaType } from "./components/MediaPreview";
import { SAMPLE_BRANDS, findBrand } from "./brand/fixtures";
import type { GeneratedResult } from "./brand/generateIdea";
import { generateIdea } from "./brand/generateIdea";
import type { Brand, IdeaSeed } from "./brand/types";
import { sp, FONT } from "./theme";

import imgHeadphones from "@/assets/headphones.png";

// Stand-in for the post's media — this prototype has no brand photography, so
// every generated post reuses the same placeholder image underneath its
// (real, on-brand) type treatment.
const MEDIA: MediaItem = { id: "1", src: imgHeadphones, alt: "Generated post media" };
const MEDIA_TYPE: MediaType = "image";

type Screen = "brand" | "results";

/** Which screen the canvas opens on. */
const START_SCREEN: Screen = "brand";

/** The brand the canvas opens on, resolved once at startup. */
function startingBrand(): Brand {
  return findBrand(new URLSearchParams(window.location.search).get("brand")) ?? SAMPLE_BRANDS[0];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(START_SCREEN);
  // `?brand=copperline` reaches the cold-start fixture, which isn't in the
  // one-brand list. Read at init: resolving it after `activeBrandId` had
  // already defaulted meant the default always won and the param did nothing.
  //
  // No setter bound: switching brands mid-session went away with the header's
  // `BrandSwitcher` (the app ships one sample brand, so it was only ever
  // reachable by hand-editing fixtures). `?brand=` still picks which one a
  // session starts on.
  const [activeBrandId] = useState(() => startingBrand().id);
  // Generated at startup rather than on a button press, because with the brand
  // screen parked there is no button press to wait for.
  const [result, setResult] = useState<GeneratedResult | null>(() =>
    START_SCREEN === "results" ? generateIdea(startingBrand(), undefined, "", undefined) : null,
  );
  const [excludePresetId, setExcludePresetId] = useState<string | undefined>(undefined);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [runId, setRunId] = useState(0);

  /**
   * The run lives here rather than inside the results screen.
   *
   * The toast tells the user they can leave the page and it will finish on its
   * own; held in the screen's own state that was false — unmounting the screen
   * destroyed the run and returning restarted it from zero. Owned at the app
   * level, a generation outlives whatever is being displayed.
   */
  const platformTypes = useMemo(() => (findBrand(activeBrandId) ?? SAMPLE_BRANDS[0]).platforms.map((p) => p.type), [activeBrandId]);
  const reveal = useStagedReveal(platformTypes, runId);

  const base = findBrand(activeBrandId) ?? SAMPLE_BRANDS[0];
  // The name is a label the product guessed, so a rename has to be real state:
  // the results breadcrumb reads it too.
  const brand = brandName ? { ...base, name: brandName } : base;

  /**
   * Generation is synchronous, so the answer exists the moment the button is
   * pressed. There is no loading screen to hand off to: the results screen
   * mounts straight away and stages its own reveal over an already-known
   * result. See `useStagedReveal`.
   */
  const runGeneration = useCallback(
    (targetBrand: Brand, brief: string, chosen?: IdeaSeed, exclude?: string) => {
      const next = generateIdea(targetBrand, exclude, brief, chosen);
      setResult(next);
      setExcludePresetId(next.idea.presetId);
      // Keys the results screen, so every run remounts and replays its reveal.
      // Keying off the idea instead would silently skip the replay whenever a
      // run legitimately returns the same idea.
      setRunId((n) => n + 1);
      setScreen("results");
    },
    [],
  );

  const handleGenerateRequested = useCallback(
    (brief: string, chosen?: IdeaSeed) => {
      // The brief is the only real signal for a brand with no posting history,
      // and the seed is what makes a chip produce the idea it advertised.
      runGeneration(brand, brief, chosen, excludePresetId);
    },
    [brand, excludePresetId, runGeneration],
  );

  const handleSave = (template: TemplateDef | null, state: TemplateState) => {
    // Placeholder: the real app writes this back onto the post's media.
    console.log("save", template?.id, state);
    setEditorOpen(false);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT,
        background: sp.bg,
      }}
    >
      {/* No bar at all on the starting screen — it's the entry point, not a
          canvas anyone has navigated into yet, and the card's own "Content
          Canvas" heading already says where you are. The bar returns once a
          canvas exists, with the breadcrumb naming it. */}
      <AppShell
        pageTitle={
          screen === "results" && result ? (
            <CanvasBreadcrumb brandName={brand.name} canvasName={result.idea.direction} />
          ) : undefined
        }
      >
        {screen === "brand" && (
          <BrandContextStep
            brand={brand}
            onRenameBrand={setBrandName}
            onGenerate={handleGenerateRequested}
          />
        )}

        {screen === "results" && result && (
          <ContentCanvasResults
            brand={brand}
            idea={result.idea}
            template={result.template}
            state={result.state}
            reveal={reveal}
            runId={runId}
            onEditImage={() => setEditorOpen(true)}
          />
        )}
      </AppShell>

      {/* Kept a sibling of the shell, not a child of its content area, so the
          modal covers the chrome rather than being clipped inside the page. */}
      {editorOpen && result && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "rgba(24,24,26,0.64)", zIndex: 10 }} />
          <EditMediaModal
            media={MEDIA}
            mediaType={MEDIA_TYPE}
            post={{ headline: result.idea.hook, hook: result.idea.hook, cta: result.idea.cta }}
            initialTemplate={result.template}
            initialState={result.state}
            onClose={() => setEditorOpen(false)}
            onSave={handleSave}
          />
        </>
      )}
    </div>
  );
}
