import { Client, type Room } from "@colyseus/sdk";
import type { PlayerInputMessage } from "@foodfight/protocol";
import { getRuntimeConfig } from "./runtimeConfig";
import { connectionKey, readReconnectToken, type SavedSeat } from "./reconnectSeat";

export interface MatchConnection {
  room: Room;
  sendInput(input: PlayerInputMessage): void;
  leave(): Promise<number>;
}

export async function connectToMatch(
  displayName: string,
  options: { roomId?: string; privateRoom?: boolean } = {},
): Promise<MatchConnection> {
  const config = getRuntimeConfig();
  const client = new Client(config.gameServerUrl);
  const key = connectionKey(config.gameServerUrl, displayName, options);
  let room: Room | undefined;
  const saved = readReconnectToken(sessionStorage.getItem("ff26-seat"), key, Date.now());
  if (saved) {
    try {
      room = await client.reconnect(saved.token);
    } catch {
      // The authoritative 20-second hold may have expired: join normally.
      sessionStorage.removeItem("ff26-seat");
    }
  }
  if (!room) {
    room = options.roomId
      ? await client.joinById(options.roomId, { displayName })
      : options.privateRoom
        ? await client.create("food_fight", { displayName, privateRoom: true })
        : await client.joinOrCreate("food_fight", { displayName });
  }
  const matchRoom = room;
  function rememberSeat() {
    const seat: SavedSeat = { key, token: matchRoom.reconnectionToken, savedAt: Date.now() };
    try { sessionStorage.setItem("ff26-seat", JSON.stringify(seat)); } catch { /* Storage may be disabled. */ }
  }
  rememberSeat();
  matchRoom.onReconnect(rememberSeat);
  matchRoom.onLeave(() => {
    try { sessionStorage.removeItem("ff26-seat"); } catch { /* Storage may be disabled. */ }
  });
  return {
    room: matchRoom,
    sendInput(input) {
      matchRoom.send("input", input);
    },
    leave() {
      try { sessionStorage.removeItem("ff26-seat"); } catch { /* Storage may be disabled. */ }
      return matchRoom.leave();
    },
  };
}
