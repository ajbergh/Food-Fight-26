export interface FoodFightRuntimeConfig {
  gameServerUrl?: string;
  platformApiUrl?: string;
  release?: string;
}

export interface ResolvedRuntimeConfig {
  gameServerUrl: string;
  platformApiUrl: string;
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
    release: cleanValue(runtime?.release) || cleanValue(build.release) || "dev",
  };
}

export function getRuntimeConfig() {
  return resolveRuntimeConfig(window.__FOOD_FIGHT_CONFIG__, {
    gameServerUrl: import.meta.env.VITE_GAME_SERVER_URL as string | undefined,
    platformApiUrl: import.meta.env.VITE_PLATFORM_API_URL as string | undefined,
    release: import.meta.env.VITE_FOOD_FIGHT_RELEASE as string | undefined,
  });
}
