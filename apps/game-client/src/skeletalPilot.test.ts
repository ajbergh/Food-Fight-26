import { describe, expect, it } from "vitest";
import {
  isSkeletalPilotEnabled,
  mapSkeletalPilotClips,
  missingSkeletalPilotClips,
  normalizeSkeletalClipName,
} from "./skeletalPilot";

describe("skeletal pilot contract", () => {
  it("normalizes exported clip names to the canonical contract", () => {
    expect(normalizeSkeletalClipName(" Throw-Food ")).toBe("throw_food");
    expect(normalizeSkeletalClipName("RUN")).toBe("run");
  });

  it("maps the required pilot clips by normalized animation name", () => {
    const clips = mapSkeletalPilotClips([
      { name: "pilot.glb/animation/0", resource: { name: "Idle" } },
      { name: "pilot.glb/animation/1", resource: { name: "Walk" } },
      { name: "pilot.glb/animation/2", resource: { name: "Run" } },
      { name: "pilot.glb/animation/3", resource: { name: "Throw-Food" } },
      { name: "Unused", resource: {} },
    ]);
    expect([...clips.keys()]).toEqual(["idle", "walk", "run", "throw_food"]);
    expect(missingSkeletalPilotClips([...clips.values()])).toEqual([]);
  });

  it("reports missing clips without weakening the contract", () => {
    expect(missingSkeletalPilotClips([{ name: "idle" }, { name: "walk" }])).toEqual(["run", "throw_food"]);
  });

  it("is explicitly opt-in through the skeletalPilot query flag", () => {
    expect(isSkeletalPilotEnabled("?skeletalPilot=1")).toBe(true);
    expect(isSkeletalPilotEnabled("?skeletalPilot=0")).toBe(false);
    expect(isSkeletalPilotEnabled("")).toBe(false);
  });
});
