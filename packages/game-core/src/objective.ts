import type { Vec2 } from "./simulation";

export type ObjectiveOwner = "none" | "blue" | "red";

export interface ObjectiveParticipant extends Vec2 {
  team: number;
}

export interface ObjectiveControl {
  owner: ObjectiveOwner;
  contested: boolean;
  blueCount: number;
  redCount: number;
}

export function resolveObjectiveControl(
  participants: readonly ObjectiveParticipant[],
  center: Vec2,
  radius: number,
): ObjectiveControl {
  const radiusSquared = radius * radius;
  let blueCount = 0;
  let redCount = 0;

  for (const participant of participants) {
    const dx = participant.x - center.x;
    const dy = participant.y - center.y;
    if (dx * dx + dy * dy > radiusSquared) continue;
    if (participant.team === 0) blueCount += 1;
    if (participant.team === 1) redCount += 1;
  }

  const contested = blueCount > 0 && redCount > 0;
  const owner: ObjectiveOwner = contested
    ? "none"
    : blueCount > 0
      ? "blue"
      : redCount > 0
        ? "red"
        : "none";

  return { owner, contested, blueCount, redCount };
}
