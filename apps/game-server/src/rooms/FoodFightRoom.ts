import { Client, Room } from "colyseus";
import { MapSchema, Schema, defineTypes } from "@colyseus/schema";
import {
  GAME,
  ITEMS,
  advanceProjectile,
  circlesOverlap,
  movePlayerWithObstacles,
  normalizeAim,
  projectileHitsObstacle,
  projectileOutsideBounds,
} from "@foodfight/game-core";
import { foodCourtMap } from "@foodfight/maps";
import type { ImpactMessage, PlayerInputMessage } from "@foodfight/protocol";

class PlayerState extends Schema {
  x = 0;
  y = 0;
  aimX = 1;
  aimY = 0;
  team = 0;
  displayName = "Guest";
  lastInputSeq = 0;
  stunRemaining = 0;
  moveX = 0;
  moveY = 0;
  throwCooldown = 0;
}

defineTypes(PlayerState, {
  x: "number",
  y: "number",
  aimX: "number",
  aimY: "number",
  team: "uint8",
  displayName: "string",
  lastInputSeq: "uint32",
  stunRemaining: "number",
});

class ProjectileState extends Schema {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  team = 0;
  ownerSessionId = "";
  lifetime = 0;
  kind = "tomato";
}

defineTypes(ProjectileState, {
  x: "number",
  y: "number",
  vx: "number",
  vy: "number",
  team: "uint8",
  ownerSessionId: "string",
  lifetime: "number",
  kind: "string",
});

class FoodFightState extends Schema {
  players = new MapSchema<PlayerState>();
  projectiles = new MapSchema<ProjectileState>();
  blueScore = 0;
  redScore = 0;
  timeRemaining: number = GAME.roundSeconds;
  phase = "playing";
}

defineTypes(FoodFightState, {
  players: { map: PlayerState },
  projectiles: { map: ProjectileState },
  blueScore: "uint16",
  redScore: "uint16",
  timeRemaining: "number",
  phase: "string",
});

export class FoodFightRoom extends Room<{ state: FoodFightState }> {
  state = new FoodFightState();
  maxClients = GAME.maxPlayers;
  private nextProjectileId = 1;

  onCreate() {
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

    if (input.throwPressed) this.tryThrowTomato(client.sessionId, player);
  }

  private tryThrowTomato(ownerSessionId: string, player: PlayerState) {
    if (player.throwCooldown > 0 || player.stunRemaining > 0) return;

    const aim = normalizeAim({ x: player.aimX, y: player.aimY });
    if (aim.x === 0 && aim.y === 0) return;

    const tomato = ITEMS.tomato;
    const speed = tomato.speed ?? 0;
    const spawnDistance = GAME.playerRadius + GAME.projectileRadius + 0.12;
    const projectile = new ProjectileState();
    projectile.x = player.x + aim.x * spawnDistance;
    projectile.y = player.y + aim.y * spawnDistance;
    projectile.vx = aim.x * speed;
    projectile.vy = aim.y * speed;
    projectile.team = player.team;
    projectile.ownerSessionId = ownerSessionId;
    projectile.lifetime = tomato.lifetimeSeconds;

    this.state.projectiles.set(`tomato-${this.nextProjectileId++}`, projectile);
    player.throwCooldown = tomato.cooldownSeconds;
  }

  private tick(dt: number) {
    if (this.state.phase !== "playing") return;
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - dt);

    this.state.players.forEach((player: PlayerState) => {
      player.throwCooldown = Math.max(0, player.throwCooldown - dt);
      player.stunRemaining = Math.max(0, player.stunRemaining - dt);
      if (player.stunRemaining > 0) return;

      const next = movePlayerWithObstacles(
        { x: player.x, y: player.y },
        { x: player.moveX, y: player.moveY },
        dt,
        foodCourtMap.bounds,
        foodCourtMap.obstacles,
      );
      player.x = next.x;
      player.y = next.y;
    });

    this.tickProjectiles(dt);
    if (this.state.timeRemaining <= 0) this.state.phase = "finished";
  }

  private tickProjectiles(dt: number) {
    const removals = new Map<string, ImpactMessage>();

    this.state.projectiles.forEach((projectile: ProjectileState, projectileId: string) => {
      const next = advanceProjectile(projectile, dt);
      projectile.x = next.x;
      projectile.y = next.y;
      projectile.lifetime = Math.max(0, projectile.lifetime - dt);

      if (
        projectile.lifetime <= 0 ||
        projectileOutsideBounds(projectile, foodCourtMap.bounds, GAME.projectileRadius) ||
        projectileHitsObstacle(projectile, GAME.projectileRadius, foodCourtMap.obstacles)
      ) {
        removals.set(projectileId, { x: projectile.x, y: projectile.y, kind: "tomato" });
        return;
      }

      let targetSessionId: string | undefined;
      this.state.players.forEach((target: PlayerState, sessionId: string) => {
        if (targetSessionId || sessionId === projectile.ownerSessionId || target.team === projectile.team) return;
        if (!circlesOverlap(projectile, GAME.projectileRadius, target, GAME.playerRadius)) return;
        targetSessionId = sessionId;
        target.stunRemaining = Math.max(target.stunRemaining, ITEMS.tomato.stunSeconds ?? 0);
      });

      if (targetSessionId) {
        removals.set(projectileId, {
          x: projectile.x,
          y: projectile.y,
          kind: "tomato",
          targetSessionId,
        });
      }
    });

    for (const [projectileId, impact] of removals) {
      this.state.projectiles.delete(projectileId);
      this.broadcast("impact", impact);
    }
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
