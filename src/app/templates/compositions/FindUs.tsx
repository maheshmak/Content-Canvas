import { useCurrentFrame, interpolate } from "../../components/AnimationPlayer";

interface Props {
  inputProps: { [key: string]: string | number | undefined };
}

export function FindUsComposition({ inputProps }: Props) {
  const frame = useCurrentFrame();
  const address = String(inputProps.address ?? "123 Main Street, Downtown");
  const phone = String(inputProps.phone ?? "(555) 123-4567");
  const hours = String(inputProps.hours ?? "Mon–Sat  9am – 7pm");
  const accentColor = String(inputProps.accentColor ?? "#F59E0B");

  const pinY = interpolate(frame, [0, 24], [-80, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pinOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOpacity = interpolate(frame, [22, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardY = interpolate(frame, [22, 44], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hoursOpacity = interpolate(frame, [50, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pinBounce = frame > 28 ? interpolate(frame % 60, [0, 10, 20], [0, -10, 0]) : 0;

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "transparent" }}>

      {/* Drop pin — top center */}
      <div
        className="absolute left-1/2 flex justify-center"
        style={{
          top: "18px",
          transform: `translate(-50%, ${pinY + pinBounce}px)`,
          opacity: pinOpacity,
        }}
      >
        <svg width="56" height="68" viewBox="0 0 40 48" fill="none">
          <path d="M20 0C9 0 0 9 0 20C0 34 20 48 20 48C20 48 40 34 40 20C40 9 31 0 20 0Z" fill={accentColor} />
          <circle cx="20" cy="20" r="8" fill="white" />
        </svg>
      </div>

      {/* Bottom info card overlay */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 60%, transparent 100%)",
          padding: "32px 40px 28px",
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
        }}
      >
        {/* Address */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" style={{ flexShrink: 0, marginTop: "4px" }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <p style={{ fontSize: "32px", fontWeight: 600, color: "#fff", lineHeight: 1.35, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {address}
          </p>
        </div>

        {/* Phone */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l1.15-1.15a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <p style={{ fontSize: "32px", fontWeight: 600, color: "#fff" }}>{phone}</p>
        </div>

        {/* Hours */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            opacity: hoursOpacity,
            borderTop: `1px solid ${accentColor}40`,
            paddingTop: "14px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <p style={{ fontSize: "28px", fontWeight: 400, color: "rgba(255,255,255,0.78)" }}>{hours}</p>
        </div>
      </div>
    </div>
  );
}
