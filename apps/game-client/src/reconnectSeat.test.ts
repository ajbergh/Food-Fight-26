import { describe, expect, it } from "vitest";
import { connectionKey, readReconnectToken } from "./reconnectSeat";

describe("short-lived session resumption", () => {
  const key = connectionKey("https://game.example", "Chef", { privateRoom: true });
  it("accepts matching unexpired tab-scoped tokens", () => {
    expect(readReconnectToken(JSON.stringify({key,token:"secret",savedAt:100}),key,101)).toEqual({key,token:"secret",savedAt:100});
  });
  it("prevents resumption for another name, room or endpoint", () => {
    const saved = JSON.stringify({key,token:"secret",savedAt:100});
    expect(readReconnectToken(saved,connectionKey("https://game.example","Other",{privateRoom:true}),101)).toBeNull();
    expect(readReconnectToken(saved,connectionKey("https://other.example","Chef",{privateRoom:true}),101)).toBeNull();
    expect(readReconnectToken(saved,connectionKey("https://game.example","Chef",{roomId:"room123"}),101)).toBeNull();
  });
  it("rejects invalid and stale seats", () => {
    for (const raw of ["not JSON", "null", "[]", "{}", JSON.stringify({key,token:123,savedAt:100}),
      JSON.stringify({key,token:"abc",savedAt:"100"})]) {
      expect(readReconnectToken(raw,key,101)).toBeNull();
    }
    const saved = JSON.stringify({key,token:"abc",savedAt:100});
    expect(readReconnectToken(saved,key,20100)).not.toBeNull();
    expect(readReconnectToken(saved,key,100 + 24 * 60 * 60 * 1000)).toBeNull();
    expect(readReconnectToken(saved,key,99)).toBeNull();
  });
});
