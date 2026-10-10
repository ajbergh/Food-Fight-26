import type { PlayerInputMessage } from "@foodfight/protocol";

const MAX_SEQUENCE = 0xffffffff;
const MAX_INPUT_MESSAGES_PER_SECOND = 90;

export function isValidPlayerInput(raw: unknown): raw is PlayerInputMessage {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const input = raw as Record<string, unknown>;
  if (typeof input.seq !== "number" || !Number.isInteger(input.seq) || input.seq < 1 || input.seq > MAX_SEQUENCE) return false;
  for (const axis of ["moveX", "moveY", "aimX", "aimY"]) {
    const value = input[axis];
    if (typeof value !== "number" || !Number.isFinite(value) || value < -1 || value > 1) return false;
  }
  return ["throwPressed", "bananaPressed", "dodgePressed"].every(
    (button) => typeof input[button] === "boolean",
  );
}

/** Per-session sliding fixed-window bound; one failed flood does not affect teammates. */
export class InputRateLimiter {
  private readonly windows = new Map<string, { start: number; count: number }>();

  accept(sessionId: string, atMs: number): boolean {
    const current = this.windows.get(sessionId);
    if (!current || atMs < current.start || atMs - current.start >= 1000) {
      this.windows.set(sessionId, { start: atMs, count: 1 });
      return true;
    }
    current.count += 1;
    return current.count <= MAX_INPUT_MESSAGES_PER_SECOND;
  }

  forget(sessionId: string): void {
    this.windows.delete(sessionId);
  }
}

/** Always put a new player on the less-populated team. Blue wins exact ties. */
export function selectJoinTeam(blueCount: number, redCount: number): 0 | 1 {
  return blueCount <= redCount ? 0 : 1;
}
