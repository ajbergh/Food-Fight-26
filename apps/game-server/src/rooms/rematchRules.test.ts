import { describe, expect, it } from "vitest";
import { isRematchVote, shouldStartPrivateRematch } from "./rematchRules";

describe("private rematch vote rules", () => {
  it("rejects malformed and stale round IDs", () => {
    expect(isRematchVote({ roundNumber: 2 }, 2)).toBe(true);
    for (const invalid of [null, [], {}, "2", {roundNumber:"2"}, {roundNumber:3},
      {roundNumber:2.5}, {roundNumber:Infinity}]) {
      expect(isRematchVote(invalid, 2)).toBe(false);
    }
  });
  it("requires at least two active players and their unanimous consent", () => {
    const players = (votes: [boolean,boolean][]) => votes.map(([connected,rematchReady]) => ({connected,rematchReady}));
    expect(shouldStartPrivateRematch(players([[true,true]]))).toBe(false);
    expect(shouldStartPrivateRematch(players([[true,true],[true,false]]))).toBe(false);
    expect(shouldStartPrivateRematch(players([[true,true],[true,true]]))).toBe(true);
    expect(shouldStartPrivateRematch(players([[true,true],[true,true],[false,false]]))).toBe(true);
    expect(shouldStartPrivateRematch(players([[true,true],[false,true]]))).toBe(false);
  });
});
