import { describe, expect, it } from "vitest";
import { shouldBeginPrivateRound } from "./privateReadyRules";

describe("private waiting-room ready gate", () => {
  it("does not start with fewer than two actively connected people", () => {
    expect(shouldBeginPrivateRound([])).toBe(false);
    expect(shouldBeginPrivateRound([{connected:true,lobbyReady:true}])).toBe(false);
    expect(shouldBeginPrivateRound([{connected:true,lobbyReady:true},{connected:false,lobbyReady:true}])).toBe(false);
  });
  it("waits for every connected player's explicit ready vote", () => {
    const ready = {connected:true,lobbyReady:true};
    const unready = {connected:true,lobbyReady:false};
    expect(shouldBeginPrivateRound([ready,unready])).toBe(false);
    expect(shouldBeginPrivateRound([ready,ready])).toBe(true);
    expect(shouldBeginPrivateRound([ready,ready,{connected:false,lobbyReady:false}])).toBe(true);
    expect(shouldBeginPrivateRound([ready,unready,{connected:false,lobbyReady:true}])).toBe(false);
  });
});
