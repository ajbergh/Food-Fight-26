import { describe, expect, it } from "vitest";
import { InputRateLimiter, isValidPlayerInput, selectJoinTeam } from "./inputGuards";

const input = {
  seq: 1, moveX: 0, moveY: -1, aimX: 1, aimY: 0,
  throwPressed: false, bananaPressed: false, dodgePressed: false,
};

describe("authoritative room ingress", () => {
  it("accepts well-formed controller input", () => {
    expect(isValidPlayerInput(input)).toBe(true);
    expect(isValidPlayerInput({ ...input, seq: 4294967295 })).toBe(true);
  });

  it("rejects invalid input before reading fields", () => {
    for (const raw of [null, undefined, [], "input", 3, {}, { ...input, seq: NaN },
      { ...input, seq: 0 }, { ...input, seq: 1.5 },
      { ...input, seq: 4294967296 }, { ...input, aimX: Infinity },
      { ...input, moveX: 1.1 }, { ...input, dodgePressed: "true" }]) {
      expect(isValidPlayerInput(raw)).toBe(false);
    }
  });

  it("bounds one session without throttling others", () => {
    const limiter = new InputRateLimiter();
    for (let n = 0; n < 90; n += 1) expect(limiter.accept("a", 100 + n)).toBe(true);
    expect(limiter.accept("a", 200)).toBe(false);
    expect(limiter.accept("b", 200)).toBe(true);
    expect(limiter.accept("a", 1100)).toBe(true);
    limiter.forget("a");
    expect(limiter.accept("a", 1101)).toBe(true);
  });

  it("fills vacancies on the smaller team", () => {
    expect(selectJoinTeam(0, 0)).toBe(0);
    expect(selectJoinTeam(1, 0)).toBe(1);
    expect(selectJoinTeam(3, 4)).toBe(0);
    expect(selectJoinTeam(4, 3)).toBe(1);
  });
});
