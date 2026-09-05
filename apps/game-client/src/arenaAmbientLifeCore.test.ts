import { describe, expect, it } from "vitest";
import {
  equipmentPulse,
  escalatorStepProgress,
  handleRockDegrees,
  menuBoardAccentScale,
  menuBoardLineScale,
  patronBobOffset,
  patronSwayDegrees,
  serviceCartProgress,
  wayfindingSwayDegrees,
  wrap01,
} from "./arenaAmbientLifeCore";

describe("arena ambient life motion", () => {
  it("wraps normalized progress in both directions", () => {
    expect(wrap01(1.25)).toBeCloseTo(0.25);
    expect(wrap01(-0.2)).toBeCloseTo(0.8);
  });

  it("keeps escalator steps distributed and bounded while moving", () => {
    const values = Array.from({ length: 8 }, (_, index) =>
      escalatorStepProgress(index, 8, 3.5, 1),
    );
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(new Set(values.map((value) => value.toFixed(3))).size).toBe(8);
    expect(escalatorStepProgress(0, 8, 2, -1)).not.toBeCloseTo(
      escalatorStepProgress(0, 8, 2, 1),
    );
  });

  it("removes nonessential motion when reduced motion is active", () => {
    expect(wayfindingSwayDegrees(2, 1, true)).toBe(0);
    expect(equipmentPulse(2, 1, true)).toBe(1);
    expect(handleRockDegrees(2, 1, true)).toBe(20);
    expect(menuBoardAccentScale(2, 1, true)).toBe(1);
    expect(menuBoardLineScale(2, 1, 0, true)).toBe(1);
    expect(patronBobOffset(2, 1, true)).toBe(0);
    expect(patronSwayDegrees(2, 1, true)).toBe(0);
    expect(serviceCartProgress(16, true)).toBe(0);
  });

  it("keeps active ambient motion deliberately subtle", () => {
    expect(Math.abs(wayfindingSwayDegrees(4, 0.5, false))).toBeLessThanOrEqual(1.6);
    expect(equipmentPulse(4, 0.5, false)).toBeGreaterThanOrEqual(0.965);
    expect(equipmentPulse(4, 0.5, false)).toBeLessThanOrEqual(1.035);
    expect(handleRockDegrees(4, 0.5, false)).toBeGreaterThanOrEqual(15.5);
    expect(handleRockDegrees(4, 0.5, false)).toBeLessThanOrEqual(24.5);
    expect(menuBoardAccentScale(4, 0.5, false)).toBeGreaterThanOrEqual(0.982);
    expect(menuBoardAccentScale(4, 0.5, false)).toBeLessThanOrEqual(1.018);
    expect(menuBoardLineScale(4, 0.5, 1, false)).toBeGreaterThanOrEqual(0.988);
    expect(menuBoardLineScale(4, 0.5, 1, false)).toBeLessThanOrEqual(1.012);
    expect(Math.abs(patronBobOffset(4, 0.5, false))).toBeLessThanOrEqual(0.025);
    expect(Math.abs(patronSwayDegrees(4, 0.5, false))).toBeLessThanOrEqual(2.2);
  });

  it("keeps menu lines out of phase so boards do not pulse as one block", () => {
    const first = menuBoardLineScale(5, 0.4, 0, false);
    const second = menuBoardLineScale(5, 0.4, 1, false);
    expect(first).not.toBeCloseTo(second, 4);
  });

  it("keeps patron silhouettes out of phase", () => {
    expect(patronBobOffset(5, 0.2, false)).not.toBeCloseTo(
      patronBobOffset(5, 2.1, false),
      4,
    );
    expect(patronSwayDegrees(5, 0.2, false)).not.toBeCloseTo(
      patronSwayDegrees(5, 2.1, false),
      4,
    );
  });

  it("gives the service cart slow travel with long parked intervals", () => {
    expect(serviceCartProgress(0, false)).toBe(0);
    expect(serviceCartProgress(4.9, false)).toBe(0);
    expect(serviceCartProgress(11, false)).toBeCloseTo(0.5);
    expect(serviceCartProgress(17, false)).toBe(1);
    expect(serviceCartProgress(21.9, false)).toBe(1);
    expect(serviceCartProgress(28, false)).toBeCloseTo(0.5);
    expect(serviceCartProgress(34, false)).toBe(0);
    expect(serviceCartProgress(41, false)).toBe(0);
  });

  it("keeps service-cart travel normalized throughout its cycle", () => {
    for (let sample = 0; sample <= 80; sample += 0.5) {
      const progress = serviceCartProgress(sample, false);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }
  });
});
