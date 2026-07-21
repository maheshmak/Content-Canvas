import { Composition } from "remotion";
import { templates } from "../app/templates";
import { getDefaults } from "../app/templates/schema";

/**
 * Remotion composition registry.
 *
 * The editor's preview uses <Player>/<Thumbnail>, which take a component
 * directly and do not need this. It exists for the render side: the Remotion
 * CLI and @remotion/renderer discover compositions here, so producing an actual
 * MP4 or PNG becomes a configuration step rather than a refactor.
 *
 * Every template registers itself, so a new template is exportable the moment
 * it lands in the registry — no second place to update.
 */
export function RemotionRoot() {
  return (
    <>
      {templates.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={t.component}
          durationInFrames={t.durationInFrames}
          fps={t.fps}
          width={t.width}
          height={t.height}
          defaultProps={{ inputProps: getDefaults(t.fields) }}
        />
      ))}
    </>
  );
}
