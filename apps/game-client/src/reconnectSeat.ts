/** Short-lived session credentials stay in tab-scoped sessionStorage, not URLs or logs. */
export interface SavedSeat {
  key: string;
  token: string;
  savedAt: number;
}

export function connectionKey(
  serverUrl: string,
  name: string,
  options: { roomId?: string; privateRoom?: boolean },
): string {
  return JSON.stringify([serverUrl, name, options.roomId ?? "", !!options.privateRoom]);
}

/** Never attempt to resume an unrelated room, player or backend, or a stale seat. */
export function readReconnectToken(raw: string | null, key: string, now: number): SavedSeat | null {
  if (!raw) return null;
  try {
    const seat: unknown = JSON.parse(raw);
    if (!seat || typeof seat !== "object" || Array.isArray(seat)) return null;
    const value = seat as Partial<SavedSeat>;
    if (value.key !== key || typeof value.token !== "string" || !value.token) return null;
    if (typeof value.savedAt !== "number" || !Number.isFinite(value.savedAt)) return null;
    // While a tab stays connected, the seat token can legitimately be hours old.
  // The server enforces the 20-second reconnect grace period after a drop.
  if (value.savedAt > now || now - value.savedAt >= 24 * 60 * 60 * 1000) return null;
    return { key: value.key, token: value.token, savedAt: value.savedAt };
  } catch {
    return null;
  }
}
