import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { TemplateState } from "../templates/schema";
import { templates } from "../templates";
import { LayerCanvas } from "./LayerCanvas";
import { Scrim, scrimRegion } from "./layout";

/**
 * The Remotion-facing composition.
 *
 * Props are deliberately plain data — a template *id*, not a template object.
 * Remotion serialises inputProps to reach the renderer, and a template carries
 * React components that cannot survive that trip. Looking the template up by id
 * inside the composition keeps server-side export a configuration step rather
 * than a rewrite.
 */
export interface CompositionProps {
  templateId: string;
  state: TemplateState;
}

export function TemplateComposition({ templateId, state }: CompositionProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const template = templates.find((t) => t.id === templateId);
  if (!template) return null;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {template.scrim ? <Scrim region={scrimRegion(state)} /> : null}
      <LayerCanvas template={template} state={state} frame={frame} width={width} height={height} />
    </AbsoluteFill>
  );
}
