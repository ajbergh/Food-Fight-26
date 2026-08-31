import type { ArenaBounds, RectObstacle, Vec2 } from "./simulation";

export interface Projectile2D extends Vec2 {
  vx: number;
  vy: number;
}

export function normalizeAim(aim: Vec2): Vec2 {
  const length = Math.hypot(aim.x, aim.y);
  if (length < 0.0001) return { x: 0, y: 0 };
  return { x: aim.x / length, y: aim.y / length };
}

export function advanceProjectile(projectile: Projectile2D, dt: number): Vec2 {
  return {
    x: projectile.x + projectile.vx * dt,
    y: projectile.y + projectile.vy * dt,
  };
}

export function circlesOverlap(a: Vec2, aRadius: number, b: Vec2, bRadius: number): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radius = aRadius + bRadius;
  return dx * dx + dy * dy <= radius * radius;
}

export function projectileHitsObstacle(
  position: Vec2,
  radius: number,
  obstacles: readonly RectObstacle[],
): boolean {
  return obstacles.some((obstacle) => {
    const halfWidth = obstacle.width / 2 + radius;
    const halfHeight = obstacle.height / 2 + radius;
    return (
      Math.abs(position.x - obstacle.x) <= halfWidth &&
      Math.abs(position.y - obstacle.y) <= halfHeight
    );
  });
}

export function projectileOutsideBounds(position: Vec2, bounds: ArenaBounds, radius: number): boolean {
  return (
    position.x < bounds.minX - radius ||
    position.x > bounds.maxX + radius ||
    position.y < bounds.minY - radius ||
    position.y > bounds.maxY + radius
  );
}
