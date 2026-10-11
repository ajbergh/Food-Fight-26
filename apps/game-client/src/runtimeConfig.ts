export interface FoodFightRuntimeConfig {
  gameServerUrl?: string;
  platformApiUrl?: string;
  webShellUrl?: string;
  release?: string;
}

export interface ResolvedRuntimeConfig {
  gameServerUrl: string;
  platformApiUrl: string;
  webShellUrl: string;
  release: string;
}

declare global {
  interface Window {
    __FOOD_FIGHT_CONFIG__?: FoodFightRuntimeConfig;
  }
}

function cleanUrl(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\/$/, "");
}

function cleanWebUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href.replace(/\/$/, "") : "";
  } catch {
    return "";
  }
}

function cleanValue(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function resolveRuntimeConfig(
  runtime: FoodFightRuntimeConfig | undefined,
  build: FoodFightRuntimeConfig,
): ResolvedRuntimeConfig {
  return {
    gameServerUrl: cleanUrl(runtime?.gameServerUrl) || cleanUrl(build.gameServerUrl) || "http://localhost:2567",
    platformApiUrl: cleanUrl(runtime?.platformApiUrl) || cleanUrl(build.platformApiUrl),
    webShellUrl: cleanWebUrl(runtime?.webShellUrl) || cleanWebUrl(build.webShellUrl) || "http://localhost:5173",
    release: cleanValue(runtime?.release) || cleanValue(build.release) || "dev",
  };
}

export function getRuntimeConfig() {
  return resolveRuntimeConfig(window.__FOOD_FIGHT_CONFIG__, {
    gameServerUrl: import.meta.env.VITE_GAME_SERVER_URL as string | undefined,
    platformApiUrl: import.meta.env.VITE_PLATFORM_API_URL as string | undefined,
    webShellUrl: import.meta.env.VITE_WEB_SHELL_URL as string | undefined,
    release: import.meta.env.VITE_FOOD_FIGHT_RELEASE as string | undefined,
  });
}
