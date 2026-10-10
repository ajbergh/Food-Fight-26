import { describe, expect, it } from "vitest";
import { inviteUrl, readJoinOptions } from "./joinOptions";

describe("match invitations", () => {
  it("resolves guest name and private-match request", () => {
    expect(readJoinOptions("?name=Chef%20A&private=1", "Guest-1")).toEqual({ displayName: "Chef A", roomId: undefined, privateRoom: true });
    expect(readJoinOptions("?name=%21%21%21&room=A12345", "Guest-1")).toEqual({ displayName: "Guest-1", roomId: "A12345", privateRoom: false });
  });
  it("generates a link for an explicit room without leaking guest/query preferences", () => {
    expect(inviteUrl("https://game.example/?name=Ada&visualValidation=1#frag", "room_ABCD")).toBe("https://game.example/?room=room_ABCD");
  });
  it("rejects dangerous/malformed room IDs", () => {
    expect(() => inviteUrl("https://game.example/", "?unsafe")).toThrow();
    expect(readJoinOptions("?room=%2Fbad&private=1", "Guest").roomId).toBeUndefined();
  });
});
