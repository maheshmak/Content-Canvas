import type { CSSProperties } from "react";
import type {
  Align,
  ExtraLayer,
  LayerDef,
  Motion,
  Position,
  TemplateDef,
  TemplateState,
} from "../templates/schema";
import { createInterpolate } from "./AnimationPlayer";
import type { Interpolate } from "./AnimationPlayer";
import { TEXT_STYLES } from "./textStyles";
import { BADGES } from "./badges";

/**
 * Draws a template's layers from data.
 *
 * Takes `frame` as a prop rather than calling Remotion's `useCurrentFrame()`,
 * so one renderer serves both hosts: inside Remotion a thin wrapper feeds it the
 * live frame; the edit canvas passes a settled frame and Remotion is not
 * involved at all. That is what makes the same pixels both playable and
 * directly editable.
 */

/** How `x` is interpreted, given the layer's alignment. */
const TRANSLATE: Record<Align, string> = {
  left: "translateX(0)",
  center: "translateX(-50%)",
  right: "translateX(-100%)",
};

export function motionStyle(motion: Motion, frame: number, interpolate: Interpolate): CSSProperties {
  if (motion.type === "none") return {};
  const { delay } = motion;
  const opacity = interpolate(frame, [delay, delay + 18], [0, 1]);

  switch (motion.type) {
    case "slide-up":
      return { opacity, transform: `translateY(${interpolate(frame, [delay, delay + 22], [40, 0])}px)` };
    case "pop":
      return { opacity, transform: `scale(${interpolate(frame, [delay, delay + 20], [0.4, 1])})` };
    default:
      return { opacity };
  }
}

/** Wraps one element at its position, with its entrance applied. */
function Positioned({
  position,
  motion,
  frame,
  interpolate,
  width,
  height,
  children,
}: {
  position: Position;
  motion: Motion;
  frame: number;
  interpolate: Interpolate;
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const inner = motionStyle(motion, frame, interpolate);
  // The entrance transform lives on an inner element so it never fights the
  // alignment transform that positions the layer.
  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x * width}px`,
        top: `${position.y * height}px`,
        transform: TRANSLATE[position.align],
        textAlign: position.align,
        maxWidth: `${(1 - 2 * 0.075) * width}px`,
      }}
    >
      <div style={inner}>{children}</div>
    </div>
  );
}

export function LayerCanvas({
  template,
  state,
  frame,
  width,
  height,
}: {
  template: TemplateDef;
  state: TemplateState;
  frame: number;
  width: number;
  height: number;
}) {
  const interpolate = createInterpolate(state.values.animationStyle as string | undefined);
  const accent = String(state.values.accentColor ?? template.previewColor);
  const renderProps = { values: state.values, accent, frame, width, height };

  const visible = template.layers.filter((l) => state.layers[l.id]?.visible !== false);

  return (
    <>
      {template.ambient ? <template.ambient {...renderProps} /> : null}

      {visible.map((layer) => {
        const pos = state.layers[layer.id] ?? layer.position;
        return (
          <Positioned
            key={layer.id}
            position={pos}
            motion={layer.motion}
            frame={frame}
            interpolate={interpolate}
            width={width}
            height={height}
          >
            <LayerBody layer={layer} accent={accent} renderProps={renderProps} />
          </Positioned>
        );
      })}

      {state.extras.map((extra) => (
        <Positioned
          key={extra.id}
          position={extra.position}
          motion={extra.motion}
          frame={frame}
          interpolate={interpolate}
          width={width}
          height={height}
        >
          <ExtraBody extra={extra} accent={accent} />
        </Positioned>
      ))}
    </>
  );
}

function LayerBody({
  layer,
  accent,
  renderProps,
}: {
  layer: LayerDef;
  accent: string;
  renderProps: Parameters<NonNullable<LayerDef["render"]>>[0];
}) {
  if (layer.kind === "custom" && layer.render) {
    return <layer.render {...renderProps} />;
  }
  const text = String(renderProps.values[layer.textKey ?? ""] ?? "");
  if (!text) return null;
  return <div style={layer.style?.(accent)}>{text}</div>;
}

function ExtraBody({ extra, accent }: { extra: ExtraLayer; accent: string }) {
  if (extra.kind === "text") {
    const style = TEXT_STYLES.find((s) => s.id === extra.styleId) ?? TEXT_STYLES[0];
    return <div style={style.style(accent)}>{extra.text}</div>;
  }
  const badge = BADGES.find((b) => b.id === extra.badgeId) ?? BADGES[0];
  return <badge.render accent={accent} />;
}
