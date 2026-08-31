import { describe, expect, it } from "vitest";
import { objectiveOrbitTarget, steeringTo } from "./behavior";

describe("bot steering", () => {
  it("normalizes movement toward a target", () => {
    const steering = steeringTo({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(steering.x).toBeCloseTo(0.6);
    expect(steering.y).toBeCloseTo(0.8);
  });

  it("returns zero steering at the target", () => {
    expect(steeringTo({ x: 2, y: -1 }, { x: 2, y: -1 })).toEqual({ x: 0, y: 0 });
  });

  it("keeps orbit targets near the objective radius", () => {
    const center = { x: 1, y: 2 };
    const target = objectiveOrbitTarget(3, 8, center, 2.5);
    expect(Math.hypot(target.x - center.x, target.y - center.y)).toBeCloseTo(2.5);
  });
});
