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
