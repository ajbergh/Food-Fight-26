export function wrap01(value: number) {
  const wrapped = value % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
}

export function escalatorStepProgress(
  index: number,
  stepCount: number,
  elapsedSeconds: number,
  direction: 1 | -1,
) {
  const count = Math.max(1, Math.floor(stepCount));
  const normalizedIndex = wrap01(index / count);
  return wrap01(normalizedIndex + elapsedSeconds * 0.055 * direction);
}

export function wayfindingSwayDegrees(
  elapsedSeconds: number,
  phase: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 0;
  return Math.sin(elapsedSeconds * 0.62 + phase) * 1.6;
}

export function equipmentPulse(
  elapsedSeconds: number,
  phase: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 1;
  return 1 + Math.sin(elapsedSeconds * 1.15 + phase) * 0.035;
}

export function handleRockDegrees(
  elapsedSeconds: number,
  phase: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 20;
  return 20 + Math.sin(elapsedSeconds * 0.9 + phase) * 4.5;
}

export function menuBoardAccentScale(
  elapsedSeconds: number,
  phase: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 1;
  return 1 + Math.sin(elapsedSeconds * 0.42 + phase) * 0.018;
}

export function menuBoardLineScale(
  elapsedSeconds: number,
  phase: number,
  lineIndex: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 1;
  return 1 + Math.sin(elapsedSeconds * 0.36 + phase + lineIndex * 1.65) * 0.012;
}

export function patronBobOffset(
  elapsedSeconds: number,
  phase: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 0;
  return Math.sin(elapsedSeconds * 0.48 + phase) * 0.025;
}

export function patronSwayDegrees(
  elapsedSeconds: number,
  phase: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 0;
  return Math.sin(elapsedSeconds * 0.34 + phase) * 2.2;
}

export function serviceCartProgress(
  elapsedSeconds: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 0;

  const cycleSeconds = wrap01(elapsedSeconds / 40) * 40;
  if (cycleSeconds < 5) return 0;
  if (cycleSeconds < 17) {
    return smoothStep01((cycleSeconds - 5) / 12);
  }
  if (cycleSeconds < 22) return 1;
  if (cycleSeconds < 34) {
    return 1 - smoothStep01((cycleSeconds - 22) / 12);
  }
  return 0;
}

function smoothStep01(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}
