/** Maps icon names to broad UX categories using keyword matching. */

export const CATEGORIES = [
  { id: "all", label: "All Icons" },
  { id: "arrows", label: "Arrows & Navigation" },
  { id: "communication", label: "Communication" },
  { id: "media", label: "Media & Audio" },
  { id: "files", label: "Files & Data" },
  { id: "weather", label: "Weather & Nature" },
  { id: "ui", label: "UI & Layout" },
  { id: "brands", label: "Brands & Logos" },
  { id: "other", label: "Other" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

const PATTERNS: Record<Exclude<CategoryId, "all" | "other">, RegExp> = {
  arrows:
    /arrow|chevron|caret|asc|desc|expand|collapse|navigate|direction|turn|rotate|flip|swap|transfer|move|forward|backward|undo|redo|back|next|prev|up|down|left|right/i,
  communication:
    /mail|email|message|chat|phone|call|speech|bubble|inbox|send|notification|bell|alert|comment|discuss|forum|voice|speak|announce|broadcast|reply|forward|share/i,
  media:
    /play|pause|stop|volume|mute|music|audio|video|camera|photo|image|film|movie|record|mic|microphone|headphone|speaker|radio|stream|youtube|tv|screen|display|monitor|projector/i,
  files:
    /file|folder|document|page|archive|clipboard|copy|paste|save|download|upload|attach|link|pdf|doc|sheet|slide|database|storage|drive|disk/i,
  weather:
    /sun|moon|cloud|rain|snow|wind|storm|thunder|weather|temperature|temp|hot|cold|fog|haze|drop|water|fire|flame|ice|leaf|tree|flower|nature|plant|earth|globe/i,
  brands:
    /github|twitter|facebook|instagram|youtube|google|apple|microsoft|amazon|vercel|nextjs|react|vue|angular|node|npm|docker|kubernetes|slack|discord|linkedin|twitch|reddit|pinterest|tiktok|figma|stripe|heroku|netlify/i,
  ui:
    /menu|grid|list|layout|panel|sidebar|modal|toggle|switch|checkbox|radio|input|form|tab|card|badge|tag|label|dashboard|settings|config|user|profile|avatar|search|filter|zoom|lock|unlock|eye|hide|show|tool|edit|delete|add|remove|close|check|cross|plus|minus|star|heart|bookmark|flag|pin|trash|recycle/i,
};

/** Returns the category id for a given icon name. Falls back to "other". */
export function categorizeIcon(iconName: string): CategoryId {
  for (const [id, pattern] of Object.entries(PATTERNS)) {
    if (pattern.test(iconName)) return id as CategoryId;
  }
  return "other";
}
