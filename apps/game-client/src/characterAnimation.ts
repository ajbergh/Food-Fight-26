export type LocomotionState = "idle" | "walk" | "run";
export type CharacterActionState = "normal" | "dodge" | "slip";

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

export interface CharacterActionPose {
  crouch: number;
  pitchDegrees: number;
  rollDegrees: number;
  headPitchDegrees: number;
  armLiftDegrees: number;
  legBendDegrees: number;
  squashX: number;
  squashY: number;
  expression: number;
}

export const THROW_DURATION_SECONDS = 0.48;

export function resolveLocomotion(normalizedSpeed: number): LocomotionState {
  const speed = Math.max(0, normalizedSpeed);
  if (speed < 0.08) return "idle";
  if (speed < 0.58) return "walk";
  return "run";
}

export function resolveCharacterAction(parentScaleY: number): CharacterActionState {
  if (parentScaleY < 0.98) return "dodge";
  if (parentScaleY < 1.1) return "slip";
  return "normal";
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

export function characterActionPose(
  state: CharacterActionState,
  phase: number,
): CharacterActionPose {
  if (state === "dodge") {
    const side = Math.sin(phase * 1.65);
    return {
      crouch: 0.1,
      pitchDegrees: 16,
      rollDegrees: side * 9,
      headPitchDegrees: -11,
      armLiftDegrees: 14,
      legBendDegrees: 24,
      squashX: 1.08,
      squashY: 0.9,
      expression: 0.55,
    };
  }

  if (state === "slip") {
    const wobble = Math.sin(phase * 1.9);
    return {
      crouch: 0.07,
      pitchDegrees: -4 + Math.abs(wobble) * 5,
      rollDegrees: wobble * 14,
      headPitchDegrees: 8,
      armLiftDegrees: 34 + Math.abs(wobble) * 8,
      legBendDegrees: 18,
      squashX: 1.03,
      squashY: 0.96,
      expression: 0.9,
    };
  }

  return {
    crouch: 0,
    pitchDegrees: 0,
    rollDegrees: 0,
    headPitchDegrees: 0,
    armLiftDegrees: 0,
    legBendDegrees: 0,
    squashX: 1,
    squashY: 1,
    expression: 0,
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
