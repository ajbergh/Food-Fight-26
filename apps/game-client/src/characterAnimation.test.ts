import { describe, expect, it } from "vitest";
import {
  characterActionPose,
  locomotionPose,
  resolveCharacterAction,
  resolveLocomotion,
  throwPose,
} from "./characterAnimation";

describe("character animation poses", () => {
  it("selects idle, walk, and run from normalized speed", () => {
    expect(resolveLocomotion(0)).toBe("idle");
    expect(resolveLocomotion(0.3)).toBe("walk");
    expect(resolveLocomotion(0.9)).toBe("run");
  });

  it("gives running a larger stride and body lean than walking", () => {
    const walk = locomotionPose("walk", Math.PI / 2);
    const run = locomotionPose("run", Math.PI / 2);
    expect(Math.abs(run.strideDegrees)).toBeGreaterThan(Math.abs(walk.strideDegrees));
    expect(run.leanDegrees).toBeGreaterThan(walk.leanDegrees);
    expect(run.bob).toBeGreaterThan(walk.bob);
  });

  it("winds up, releases forward, then recovers a throw", () => {
    const windup = throwPose(0.3);
    const release = throwPose(0.58);
    const recovered = throwPose(1);

    expect(windup.shoulderDegrees).toBeLessThan(-40);
    expect(windup.elbowDegrees).toBeGreaterThan(70);
    expect(release.shoulderDegrees).toBeGreaterThan(90);
    expect(recovered.shoulderDegrees).toBeCloseTo(0);
    expect(recovered.elbowDegrees).toBeCloseTo(0);
    expect(recovered.torsoTwistDegrees).toBeCloseTo(0);
  });

  it("infers presentation-only dodge and slip states from the authoritative root scale", () => {
    expect(resolveCharacterAction(1.2)).toBe("normal");
    expect(resolveCharacterAction(1.02)).toBe("slip");
    expect(resolveCharacterAction(0.9)).toBe("dodge");
  });

  it("keeps action poses bounded while making dodge and slip visually distinct", () => {
    const normal = characterActionPose("normal", 0);
    const dodge = characterActionPose("dodge", Math.PI / 2);
    const slip = characterActionPose("slip", Math.PI / 2);

    expect(normal.expression).toBe(0);
    expect(dodge.crouch).toBeGreaterThan(0);
    expect(dodge.pitchDegrees).toBeGreaterThan(10);
    expect(slip.armLiftDegrees).toBeGreaterThan(dodge.armLiftDegrees);
    expect(Math.abs(slip.rollDegrees)).toBeLessThanOrEqual(14);
    expect(slip.expression).toBeGreaterThan(dodge.expression);
  });
});
