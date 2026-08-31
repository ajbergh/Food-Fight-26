import { describe, expect, it } from "vitest";
import { resolveRuntimeConfig } from "./runtimeConfig";

describe("runtime configuration", () => {
  it("prefers container/runtime values over build fallbacks", () => {
    expect(
      resolveRuntimeConfig(
        {
          gameServerUrl: "https://match.example.test/",
          platformApiUrl: "https://api.example.test/",
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
      release: "dev",
    });
  });

  it("provides a local game-server default while leaving telemetry disabled", () => {
    expect(resolveRuntimeConfig({}, {})).toEqual({
      gameServerUrl: "http://localhost:2567",
      platformApiUrl: "",
      release: "dev",
    });
  });
});
