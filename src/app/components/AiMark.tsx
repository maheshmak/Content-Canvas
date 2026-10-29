import { sp } from "../theme";

/**
 * `BaseAIFilled` — the real two-star path with its real fill, a three-stop
 * gradient rather than a flat colour.
 *
 * Pulled out of `Toast.tsx`, where it started as the toast's own progress
 * icon, so other screens can use the identical mark instead of a second copy
 * of the same gradient and paths. `animated` defaults to on, matching the
 * toast's twinkle; pass `false` for a context — like a static page heading —
 * where a resting mark is what's wanted. The animation classes
 * (`cc-ai-major`/`cc-ai-minor`) are scoped to whichever screen defines their
 * keyframes, so `animated` should only be left on inside one of those.
 */
export function AiMark({ size = 16, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
    >
      <defs>
        <linearGradient id="cc-ai-mark" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={sp.aiBlue} />
          <stop offset="55%" stopColor={sp.aiYellow} />
          <stop offset="100%" stopColor={sp.aiOrange} />
        </linearGradient>
      </defs>
      <path
        className={animated ? "cc-ai-major" : undefined}
        d="M18.857 12.5834C13.6412 12.5834 9.42851 8.35181 9.42851 3.15012C9.42851 8.35181 5.19905 12.5834 0 12.5834C5.19905 12.5834 9.42851 16.7983 9.42851 22C9.42851 16.7983 13.6412 12.5834 18.857 12.5834Z"
        fill="url(#cc-ai-mark)"
      />
      <path
        className={animated ? "cc-ai-minor" : undefined}
        d="M22 4.71665C19.3921 4.71665 17.2857 2.60085 17.2857 0C17.2857 2.60085 15.171 4.71665 12.5715 4.71665C15.171 4.71665 17.2857 6.82409 17.2857 9.42494C17.2857 6.82409 19.3921 4.71665 22 4.71665Z"
        fill="url(#cc-ai-mark)"
      />
    </svg>
  );
}
