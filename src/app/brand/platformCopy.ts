import type { GeneratedIdea, PlatformType } from "./types";

/** Light per-platform caption formatting — same idea, different register. */
export function platformCaption(idea: GeneratedIdea, platform: PlatformType): string {
  switch (platform) {
    case "twitter":
      return `${idea.hook}\n\n${idea.cta}`;
    case "instagram":
      return `${idea.hook}\n\n${idea.cta}\n\n#strengthtraining #gymlife`;
    case "linkedin":
      return `${idea.direction}\n\n${idea.hook}`;
    case "facebook":
      return `${idea.hook} ${idea.cta}`;
    case "tiktok":
      return `${idea.hook} 🎥`;
    default:
      return idea.hook;
  }
}
