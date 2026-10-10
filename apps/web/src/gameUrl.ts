declare global {
  interface Window {
    __FOOD_FIGHT_CONFIG__?: {
      gameUrl?: string;
    };
  }
}

function validDestination(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  // Only allow web navigation: protocol-relative, javascript:, and data: are rejected.
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^https?:\/\/[^/\s]+/i.test(url)) return url;
  return null;
}

export function resolveGameUrl(runtime?: string, built?: string): string {
  return validDestination(runtime) ?? validDestination(built) ?? "http://localhost:5174";
}
