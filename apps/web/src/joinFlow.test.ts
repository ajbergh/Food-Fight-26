import { describe, expect, it } from "vitest";
import { buildPlayUrl, cleanGuestName, cleanRoomId } from "./joinFlow";

describe("guest onboarding", () => {
  it("sanitizes a guest name to the room display name contract", () => {
    expect(cleanGuestName("  Chef! Zoe 🥇  ")).toBe("Chef Zoe");
    expect(cleanGuestName("???")).toBe("Guest");
    expect(cleanGuestName("x".repeat(25))).toHaveLength(20);
  });
  it("preserves runtime destination origin and supports all join modes", () => {
    expect(buildPlayUrl("https://game.example/play", "https://web.example", "Ada", "quick")).toBe("https://game.example/play?name=Ada");
    expect(buildPlayUrl("/fight", "https://web.example", "Ada", "private")).toBe("https://web.example/fight?name=Ada&private=1");
    expect(buildPlayUrl("https://game.example", "https://web.example", "Ada", "room", "ABC_12")).toContain("room=ABC_12");
  });
  it("rejects malformed room codes", () => {
    expect(cleanRoomId(" /not-a-room ")).toBe("");
    expect(() => buildPlayUrl("/fight", "https://web.example", "Ada", "room", "bad url")).toThrow("valid room code");
  });
});
