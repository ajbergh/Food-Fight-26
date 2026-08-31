export interface Point2 {
  x: number;
  y: number;
}

export function steeringTo(from: Point2, to: Point2): Point2 {
  const x = to.x - from.x;
  const y = to.y - from.y;
  const length = Math.hypot(x, y);
  if (length <= 0.0001) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

export function objectiveOrbitTarget(
  botIndex: number,
  elapsedSeconds: number,
  center: Point2,
  radius = 2.1,
): Point2 {
  const direction = botIndex % 2 === 0 ? 1 : -1;
  const startingAngle = (botIndex / 8) * Math.PI * 2;
  const angle = startingAngle + elapsedSeconds * 0.22 * direction;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}
