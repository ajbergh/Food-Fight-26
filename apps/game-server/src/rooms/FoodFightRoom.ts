import { Client, Room } from "colyseus";
import { MapSchema, Schema, defineTypes } from "@colyseus/schema";
import { GAME, movePlayer } from "@foodfight/game-core";
import { foodCourtMap } from "@foodfight/maps";
import type { PlayerInputMessage } from "@foodfight/protocol";

class PlayerState extends Schema {
  x = 0;
  y = 0;
  aimX = 1;
  aimY = 0;
  team = 0;
  displayName = "Guest";
  lastInputSeq = 0;
  moveX = 0;
  moveY = 0;
}

defineTypes(PlayerState, {
  x: "number", y: "number", aimX: "number", aimY: "number",
  team: "uint8", displayName: "string", lastInputSeq: "uint32",
});

class FoodFightState extends Schema {
  players = new MapSchema<PlayerState>();
  blueScore = 0;
  redScore = 0;
  timeRemaining = GAME.roundSeconds;
  phase = "playing";
}

defineTypes(FoodFightState, {
  players: { map: PlayerState },
  blueScore: "uint16",
  redScore: "uint16",
  timeRemaining: "number",
  phase: "string",
});

export class FoodFightRoom extends Room<FoodFightState> {
  maxClients = GAME.maxPlayers;

  onCreate() {
    this.setState(new FoodFightState());
    this.onMessage("input", (client, raw: PlayerInputMessage) => this.handleInput(client, raw));
    this.setSimulationInterval((deltaMs) => this.tick(deltaMs / 1000), 1000 / GAME.serverHz);
  }

  onJoin(client: Client, options: { displayName?: string }) {
    const index = this.state.players.size;
    const spawn = foodCourtMap.spawns[index % foodCourtMap.spawns.length]!;
    const player = new PlayerState();
    player.x = spawn.x;
    player.y = spawn.y;
    player.team = index % 2;
    player.displayName = sanitizeName(options.displayName);
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  private handleInput(client: Client, input: PlayerInputMessage) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !Number.isFinite(input.seq) || input.seq <= player.lastInputSeq) return;
    player.lastInputSeq = input.seq;
    player.moveX = clampAxis(input.moveX);
    player.moveY = clampAxis(input.moveY);
    player.aimX = clampAxis(input.aimX);
    player.aimY = clampAxis(input.aimY);
    // TODO(vertical-slice): validate throw cooldown and spawn authoritative tomato entity.
  }

  private tick(dt: number) {
    if (this.state.phase !== "playing") return;
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - dt);

    this.state.players.forEach((player) => {
      const next = movePlayer(
        { x: player.x, y: player.y },
        { x: player.moveX, y: player.moveY },
        dt,
        foodCourtMap.bounds,
      );
      player.x = next.x;
      player.y = next.y;
    });

    if (this.state.timeRemaining <= 0) this.state.phase = "finished";
  }
}

function clampAxis(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

function sanitizeName(value: unknown): string {
  if (typeof value !== "string") return "Guest";
  const trimmed = value.replace(/[^a-zA-Z0-9 _-]/g, "").trim().slice(0, 20);
  return trimmed || "Guest";
}
