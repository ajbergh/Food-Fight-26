import { GAME } from "./config";

export interface Vec2 { x: number; y: number }
export interface ArenaBounds { minX: number; maxX: number; minY: number; maxY: number }

export function movePlayer(position: Vec2, input: Vec2, dt: number, bounds: ArenaBounds): Vec2 {
  const length = Math.hypot(input.x, input.y);
  const normalized = length > 1 ? { x: input.x / length, y: input.y / length } : input;
  const x = position.x + normalized.x * GAME.playerSpeed * dt;
  const y = position.y + normalized.y * GAME.playerSpeed * dt;
  return {
    x: Math.max(bounds.minX + GAME.playerRadius, Math.min(bounds.maxX - GAME.playerRadius, x)),
    y: Math.max(bounds.minY + GAME.playerRadius, Math.min(bounds.maxY - GAME.playerRadius, y)),
  };
}
