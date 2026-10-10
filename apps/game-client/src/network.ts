import { Client, type Room } from "@colyseus/sdk";
import type { PlayerInputMessage } from "@foodfight/protocol";
import { getRuntimeConfig } from "./runtimeConfig";

export interface MatchConnection {
  room: Room;
  sendInput(input: PlayerInputMessage): void;
  leave(): Promise<number>;
}

export async function connectToMatch(displayName: string, options: { roomId?: string; privateRoom?: boolean } = {}): Promise<MatchConnection> {
  const client = new Client(getRuntimeConfig().gameServerUrl);
  const room = options.roomId
    ? await client.joinById(options.roomId, { displayName })
    : options.privateRoom
      ? await client.create("food_fight", { displayName, privateRoom: true })
      : await client.joinOrCreate("food_fight", { displayName });

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
