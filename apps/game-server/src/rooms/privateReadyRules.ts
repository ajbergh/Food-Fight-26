/** A dropped seat has no vote, and two connected chefs are needed to begin. */
export function shouldBeginPrivateRound(
  seats: readonly { connected: boolean; lobbyReady: boolean }[],
): boolean {
  const active = seats.filter((seat) => seat.connected);
  return active.length >= 2 && active.every((seat) => seat.lobbyReady);
}
