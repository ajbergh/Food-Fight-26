export type LocomotionState = "idle" | "walk" | "run";

export interface LocomotionPose {
  strideDegrees: number;
  armSwingDegrees: number;
  bob: number;
  leanDegrees: number;
}

export interface ThrowPose {
  shoulderDegrees: number;
  elbowDegrees: number;
  torsoTwistDegrees: number;
  counterArmDegrees: number;
}

export const THROW_DURATION_SECONDS = 0.48;

export function resolveLocomotion(normalizedSpeed: number): LocomotionState {
  const speed = Math.max(0, normalizedSpeed);
  if (speed < 0.08) return "idle";
  if (speed < 0.58) return "walk";
  return "run";
}

export function locomotionPose(state: LocomotionState, phase: number): LocomotionPose {
  if (state === "idle") {
    return {
      strideDegrees: 0,
      armSwingDegrees: Math.sin(phase * 0.45) * 2.5,
      bob: Math.sin(phase * 0.5) * 0.012,
      leanDegrees: 0,
    };
  }

  const wave = Math.sin(phase);
  const step = Math.abs(Math.sin(phase));
  if (state === "walk") {
    return {
      strideDegrees: wave * 27,
      armSwingDegrees: wave * 22,
      bob: step * 0.035,
      leanDegrees: 3.5,
    };
  }

  return {
    strideDegrees: wave * 46,
    armSwingDegrees: wave * 38,
    bob: step * 0.07,
    leanDegrees: 10,
  };
}

export function throwPose(progress: number): ThrowPose {
  const t = clamp01(progress);

  if (t < 0.3) {
    const windup = smoothstep(t / 0.3);
    return {
      shoulderDegrees: lerp(0, -58, windup),
      elbowDegrees: lerp(4, 88, windup),
      torsoTwistDegrees: lerp(0, -24, windup),
      counterArmDegrees: lerp(0, 18, windup),
    };
  }

  if (t < 0.58) {
    const release = smoothstep((t - 0.3) / 0.28);
    return {
      shoulderDegrees: lerp(-58, 116, release),
      elbowDegrees: lerp(88, 16, release),
      torsoTwistDegrees: lerp(-24, 26, release),
      counterArmDegrees: lerp(18, -16, release),
    };
  }

  const recovery = smoothstep((t - 0.58) / 0.42);
  return {
    shoulderDegrees: lerp(116, 0, recovery),
    elbowDegrees: lerp(16, 0, recovery),
    torsoTwistDegrees: lerp(26, 0, recovery),
    counterArmDegrees: lerp(-16, 0, recovery),
  };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}
