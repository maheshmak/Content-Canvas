import { Composition } from "remotion";
import { templates } from "../app/templates";
import { getDefaults } from "../app/templates/schema";
import { TemplateComposition } from "../app/components/TemplateComposition";

/**
 * Remotion composition registry.
 *
 * The editor's preview uses <Player>/<Thumbnail>, which take a component
 * directly and don't need this. It exists for the render side: the Remotion CLI
 * and @remotion/renderer discover compositions here, so producing an MP4 or PNG
 * becomes configuration rather than a refactor.
 *
 * Props are plain data — a template id plus editor state — because Remotion
 * serialises them to reach the renderer, and a template carries React
 * components that could not survive that trip.
 */
export function RemotionRoot() {
  return (
    <>
      {templates.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={TemplateComposition}
          durationInFrames={t.durationInFrames}
          fps={t.fps}
          width={t.width}
          height={t.height}
          defaultProps={{ templateId: t.id, state: getDefaults(t) }}
        />
      ))}
    </>
  );
}
