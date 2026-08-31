import { GAME } from "./config";

export interface Vec2 {
  x: number;
  y: number;
}

export interface ArenaBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface RectObstacle extends Vec2 {
  width: number;
  height: number;
}

export function normalizeInput(input: Vec2): Vec2 {
  const length = Math.hypot(input.x, input.y);
  if (length <= 1 || length === 0) return input;
  return { x: input.x / length, y: input.y / length };
}

export function movePlayer(
  position: Vec2,
  input: Vec2,
  dt: number,
  bounds: ArenaBounds,
  speed: number = GAME.playerSpeed,
): Vec2 {
  const normalized = normalizeInput(input);
  const x = position.x + normalized.x * speed * dt;
  const y = position.y + normalized.y * speed * dt;
  return clampToBounds({ x, y }, bounds, GAME.playerRadius);
}

export function movePlayerWithObstacles(
  position: Vec2,
  input: Vec2,
  dt: number,
  bounds: ArenaBounds,
  obstacles: readonly RectObstacle[],
  speed: number = GAME.playerSpeed,
): Vec2 {
  return resolveAgainstObstacles(movePlayer(position, input, dt, bounds, speed), obstacles, GAME.playerRadius);
}

export function resolveAgainstObstacles(
  position: Vec2,
  obstacles: readonly RectObstacle[],
  radius: number,
): Vec2 {
  const resolved = { ...position };

  for (const obstacle of obstacles) {
    const halfWidth = obstacle.width / 2 + radius;
    const halfHeight = obstacle.height / 2 + radius;
    const dx = resolved.x - obstacle.x;
    const dy = resolved.y - obstacle.y;

    if (Math.abs(dx) >= halfWidth || Math.abs(dy) >= halfHeight) continue;

    const overlapX = halfWidth - Math.abs(dx);
    const overlapY = halfHeight - Math.abs(dy);
    if (overlapX < overlapY) {
      resolved.x = obstacle.x + (dx >= 0 ? halfWidth : -halfWidth);
    } else {
      resolved.y = obstacle.y + (dy >= 0 ? halfHeight : -halfHeight);
    }
  }

  return resolved;
}

export function clampToBounds(position: Vec2, bounds: ArenaBounds, radius: number): Vec2 {
  return {
    x: Math.max(bounds.minX + radius, Math.min(bounds.maxX - radius, position.x)),
    y: Math.max(bounds.minY + radius, Math.min(bounds.maxY - radius, position.y)),
  };
}
