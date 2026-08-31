import { describe, expect, it } from "vitest";
import { GAME } from "./config";
import { movePlayerWithObstacles, normalizeInput, resolveAgainstObstacles } from "./simulation";

const bounds = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
const obstacle = { x: 0, y: 0, width: 4, height: 2 };

describe("normalizeInput", () => {
  it("normalizes diagonal movement", () => {
    const value = normalizeInput({ x: 1, y: 1 });
    expect(Math.hypot(value.x, value.y)).toBeCloseTo(1);
  });
});

describe("arena collision", () => {
  it("keeps the player radius outside expanded obstacle bounds", () => {
    const value = resolveAgainstObstacles({ x: 0, y: 0.2 }, [obstacle], GAME.playerRadius);
    expect(Math.abs(value.y)).toBeCloseTo(obstacle.height / 2 + GAME.playerRadius);
  });

  it("prevents movement through a bench", () => {
    const value = movePlayerWithObstacles(
      { x: -3, y: 0 },
      { x: 1, y: 0 },
      0.2,
      bounds,
      [obstacle],
    );
    expect(value.x).toBeLessThanOrEqual(-(obstacle.width / 2 + GAME.playerRadius));
  });
});
