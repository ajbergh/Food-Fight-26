import { describe, expect, it } from "vitest";
import { resolveRuntimeConfig } from "./runtimeConfig";

describe("runtime configuration", () => {
  it("prefers container/runtime values over build fallbacks", () => {
    expect(
      resolveRuntimeConfig(
        {
          gameServerUrl: "https://match.example.test/",
          platformApiUrl: "https://api.example.test/",
          webShellUrl: "http://localhost:5173",
      release: "sha-runtime",
        },
        {
          gameServerUrl: "http://build-match:2567",
          platformApiUrl: "http://build-api:3000",
          release: "build",
        },
      ),
    ).toEqual({
      gameServerUrl: "https://match.example.test",
      platformApiUrl: "https://api.example.test",
      webShellUrl: "http://localhost:5173",
      release: "sha-runtime",
    });
  });

  it("falls back to build-time development configuration", () => {
    expect(
      resolveRuntimeConfig(undefined, {
        gameServerUrl: "http://127.0.0.1:2567/",
        platformApiUrl: "http://127.0.0.1:3000/",
      }),
    ).toEqual({
      gameServerUrl: "http://127.0.0.1:2567",
      platformApiUrl: "http://127.0.0.1:3000",
      webShellUrl: "http://localhost:5173",
      release: "dev",
    });
  });

  it("provides a local game-server default while leaving telemetry disabled", () => {
    expect(resolveRuntimeConfig({}, {})).toEqual({
      gameServerUrl: "http://localhost:2567",
      platformApiUrl: "",
      webShellUrl: "http://localhost:5173",
      release: "dev",
    });
  });
});

describe("web shell link", () => {
  it("uses deployed web origin and rejects unsafe URL schemes", () => {
    expect(resolveRuntimeConfig({ webShellUrl: "https://foodfight.example.com/" }, {}).webShellUrl).toBe("https://foodfight.example.com");
    expect(resolveRuntimeConfig({ webShellUrl: "javascript:alert(1)" }, {}).webShellUrl).toBe("http://localhost:5173");
    expect(resolveRuntimeConfig({ webShellUrl: "//evil.example" }, {}).webShellUrl).toBe("http://localhost:5173");
  });
});
