import { useCurrentFrame, useInterpolate, useVideoConfig } from "../../components/AnimationPlayer";
import { AnchoredStack, AnchoredItem, Scrim } from "../../components/layout";
import type { Anchor } from "../schema";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

function Row({
  icon,
  children,
  opacity,
  accentColor,
  divider = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  opacity: number;
  accentColor: string;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        opacity,
        borderTop: divider ? `1px solid ${accentColor}40` : undefined,
        paddingTop: divider ? "24px" : undefined,
      }}
    >
      {icon}
      {children}
    </div>
  );
}

export function FindUsComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const interpolate = useInterpolate();
  const { width, height } = useVideoConfig();
  const address = String(inputProps.address ?? "123 Main Street, Downtown");
  const phone = String(inputProps.phone ?? "(555) 123-4567");
  const hours = String(inputProps.hours ?? "Mon–Sat  9am – 7pm");
  const accentColor = String(inputProps.accentColor ?? "#F59E0B");
  const textAnchor = (inputProps.textAnchor as Anchor) ?? "bottom-left";
  const pinAnchor = (inputProps.pinAnchor as Anchor) ?? "top-center";

  const pinY = interpolate(frame, [0, 24], [-80, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pinOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOpacity = interpolate(frame, [22, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardY = interpolate(frame, [22, 44], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hoursOpacity = interpolate(frame, [50, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pinBounce = frame > 28 ? interpolate(frame % 60, [0, 10, 20], [0, -10, 0]) : 0;

  const iconProps = {
    width: "40",
    height: "40",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: accentColor,
    strokeWidth: "2",
    style: { flexShrink: 0 },
  } as const;

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>
      <Scrim anchor={textAnchor} opacity={cardOpacity} />

      {/* Feature: the map pin, placed independently of the copy. */}
      <AnchoredItem anchor={pinAnchor} width={width} height={height}>
        <div style={{ opacity: pinOpacity, transform: `translateY(${pinY + pinBounce}px)` }}>
          <svg width="96" height="116" viewBox="0 0 40 48" fill="none">
            <path d="M20 0C9 0 0 9 0 20C0 34 20 48 20 48C20 48 40 34 40 20C40 9 31 0 20 0Z" fill={accentColor} />
            <circle cx="20" cy="20" r="8" fill="white" />
          </svg>
        </div>
      </AnchoredItem>

      <AnchoredStack anchor={textAnchor} width={width} height={height} gap={24}>
        <div style={{ transform: `translateY(${cardY}px)`, display: "flex", flexDirection: "column", gap: "24px" }}>
          <Row
            opacity={cardOpacity}
            accentColor={accentColor}
            icon={
              <svg {...iconProps}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
          >
            <p style={{ margin: 0, fontSize: "54px", fontWeight: 600, color: "#fff", lineHeight: 1.35, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              {address}
            </p>
          </Row>

          <Row
            opacity={cardOpacity}
            accentColor={accentColor}
            icon={
              <svg {...iconProps}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l1.15-1.15a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            }
          >
            <p style={{ margin: 0, fontSize: "54px", fontWeight: 600, color: "#fff" }}>{phone}</p>
          </Row>

          <Row
            opacity={hoursOpacity}
            accentColor={accentColor}
            divider
            icon={
              <svg {...iconProps}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          >
            <p style={{ margin: 0, fontSize: "46px", fontWeight: 400, color: "rgba(255,255,255,0.78)" }}>{hours}</p>
          </Row>
        </div>
      </AnchoredStack>
    </div>
  );
}
