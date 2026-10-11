export function isRematchVote(raw: unknown, expectedRound: number): raw is { roundNumber: number } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const round = (raw as Record<string, unknown>).roundNumber;
  return typeof round === "number" && Number.isInteger(round) && round === expectedRound;
}

/** Disconnected seats cannot vote and do not block the connected players' quorum. */
export function shouldStartPrivateRematch(
  seats: readonly { connected: boolean; rematchReady: boolean }[],
): boolean {
  const active = seats.filter((seat) => seat.connected);
  return active.length >= 2 && active.every((seat) => seat.rematchReady);
}
