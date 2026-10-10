import { describe, expect, it } from "vitest";
import { resolveGameUrl } from "./gameUrl";

describe("web Play link", () => {
  it("prefers a valid runtime URL over build configuration", () => {
    expect(resolveGameUrl("https://game.example/fight", "http://localhost:5174"))
      .toBe("https://game.example/fight");
  });
  it("supports same-origin paths", () => {
    expect(resolveGameUrl("/play")).toBe("/play");
  });
  it("rejects unsafe or malformed URLs", () => {
    expect(resolveGameUrl("javascript:alert(1)", "/play")).toBe("/play");
    expect(resolveGameUrl("//evil.example", "data:text/html,test")).toBe("http://localhost:5174");
  });
  it("retains the developer fallback", () => {
    expect(resolveGameUrl()).toBe("http://localhost:5174");
  });
});
