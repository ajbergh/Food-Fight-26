import { describe, expect, it } from "vitest";
import { resolveProceduralChefFinishVariant } from "./proceduralChefFinishCore";

describe("procedural chef finish variants", () => {
  it("is deterministic for a player session", () => {
    expect(resolveProceduralChefFinishVariant("player-alpha")).toEqual(
      resolveProceduralChefFinishVariant("player-alpha"),
    );
  });

  it("keeps every cosmetic variation inside the authored bounds", () => {
    for (const sessionId of [
      "player-alpha",
      "player-bravo",
      "player-charlie",
      "player-delta",
      "player-echo",
      "player-foxtrot",
      "player-golf",
      "player-hotel",
    ]) {
      const variant = resolveProceduralChefFinishVariant(sessionId);
      expect([-1, 1]).toContain(variant.towelSide);
      expect([-1, 1]).toContain(variant.pocketSide);
      expect(variant.badgeTiltDegrees).toBeGreaterThanOrEqual(-4);
      expect(variant.badgeTiltDegrees).toBeLessThanOrEqual(4);
      expect(variant.neckerchiefTailBias).toBeGreaterThanOrEqual(-0.036);
      expect(variant.neckerchiefTailBias).toBeLessThanOrEqual(0.036);
    }
  });
});
