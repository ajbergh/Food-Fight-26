import { describe, expect, it } from "vitest";
import { advanceProjectile, circlesOverlap, normalizeAim, projectileHitsObstacle } from "./combat";

describe("combat helpers", () => {
  it("normalizes aim before projectile velocity is derived", () => {
    expect(normalizeAim({ x: 3, y: 4 })).toEqual({ x: 0.6, y: 0.8 });
  });

  it("advances projectile positions deterministically", () => {
    expect(advanceProjectile({ x: 1, y: 2, vx: 4, vy: -2 }, 0.5)).toEqual({ x: 3, y: 1 });
  });

  it("detects player-sized circle hits", () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 0.3, { x: 0.7, y: 0 }, 0.5)).toBe(true);
    expect(circlesOverlap({ x: 0, y: 0 }, 0.3, { x: 1, y: 0 }, 0.5)).toBe(false);
  });

  it("detects projectiles against expanded rectangular obstacles", () => {
    expect(
      projectileHitsObstacle(
        { x: 2.2, y: 0 },
        0.3,
        [{ x: 0, y: 0, width: 4, height: 2 }],
      ),
    ).toBe(true);
  });
});
