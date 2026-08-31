import { Client, type Room } from "@colyseus/sdk";
import type { PlayerInputMessage } from "@foodfight/protocol";

export interface MatchConnection {
  room: Room;
  sendInput(input: PlayerInputMessage): void;
  leave(): Promise<number>;
}

export async function connectToMatch(displayName: string): Promise<MatchConnection> {
  const endpoint = import.meta.env.VITE_GAME_SERVER_URL ?? "http://localhost:2567";
  const client = new Client(endpoint);
  const room = await client.joinOrCreate("food_fight", { displayName });

  return {
    room,
    sendInput(input) {
      room.send("input", input);
    },
    leave() {
      return room.leave();
    },
  };
}
