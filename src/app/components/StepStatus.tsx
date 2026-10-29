import { sp } from "../theme";

/** 0 not started · 1 in progress · 2 resolved. Named for what a checklist row
 *  is doing, not a raw count, since callers read it as a state machine. */
export type StepState = "pending" | "active" | "done";

/**
 * The marker a checklist row wears while its value is still arriving:
 * a hollow ring waiting its turn, a spinning ring while it's the one
 * being worked on, a checkmark once it has something to show.
 *
 * Pulled out of the results screen's `StepRow` — which owns the same three
 * states for the Idea panel's Direction/Audience/Hook/CTA rows — so the
 * starting page's own checklist (About your brand / Accounts / Post ideas)
 * can wear the identical marker instead of a second copy of the same three
 * SVGs quietly drifting from the original.
 */
export function StepStatus({ state }: { state: StepState }) {
  return (
    <span
      aria-hidden
      style={{ flexShrink: 0, width: "16px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {state === "done" ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke={sp.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : state === "active" ? (
        <span
          className="cc-spinner"
          style={{ width: "12px", height: "12px", borderRadius: "50%", border: `2px solid ${sp.borderSub}`, borderTopColor: sp.blue }}
        />
      ) : (
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", border: `1.5px solid ${sp.borderSub}` }} />
      )}
    </span>
  );
}
