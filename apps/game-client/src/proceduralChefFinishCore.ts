export interface ProceduralChefFinishVariant {
  towelSide: -1 | 1;
  pocketSide: -1 | 1;
  badgeTiltDegrees: number;
  neckerchiefTailBias: number;
}

export function resolveProceduralChefFinishVariant(
  sessionId: string,
): ProceduralChefFinishVariant {
  const hash = hashSession(sessionId);
  const towelSide: -1 | 1 = (hash & 1) === 0 ? -1 : 1;
  const pocketSide: -1 | 1 = ((hash >>> 1) & 1) === 0 ? -1 : 1;
  const badgeTiltDegrees = (((hash >>> 3) % 5) - 2) * 2;
  const neckerchiefTailBias = (((hash >>> 6) % 5) - 2) * 0.018;
  return { towelSide, pocketSide, badgeTiltDegrees, neckerchiefTailBias };
}

function hashSession(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
