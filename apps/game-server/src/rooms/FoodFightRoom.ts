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
  dodgeRemaining = 0;
  tomatoAmmo = GAME.tomatoAmmoStart;
  bananaAmmo = GAME.bananaAmmoStart;
  moveX = 0;
  moveY = 0;
  dodgeX = 0;
  dodgeY = 0;
  throwCooldown = 0;
  bananaCooldown = 0;
  dodgeCooldown = 0;
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
  dodgeRemaining: "number",
  tomatoAmmo: "uint8",
  bananaAmmo: "uint8",
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

class BananaState extends Schema {
  x = 0;
  y = 0;
  team = 0;
  ownerSessionId = "";
  lifetime = 0;
  kind = "banana";
}

defineTypes(BananaState, {
  x: "number",
  y: "number",
  team: "uint8",
  ownerSessionId: "string",
  lifetime: "number",
  kind: "string",
});

class PickupState extends Schema {
  x = 0;
  y = 0;
  kind = "tomato";
  available = true;
  respawnRemaining = 0;
}

defineTypes(PickupState, {
  x: "number",
  y: "number",
  kind: "string",
  available: "boolean",
  respawnRemaining: "number",
});

class FoodFightState extends Schema {
  players = new MapSchema<PlayerState>();
  projectiles = new MapSchema<ProjectileState>();
  bananas = new MapSchema<BananaState>();
  pickups = new MapSchema<PickupState>();
  blueScore = 0;
  redScore = 0;
  timeRemaining: number = GAME.roundSeconds;
  phase = "playing";
}

defineTypes(FoodFightState, {
  players: { map: PlayerState },
  projectiles: { map: ProjectileState },
  bananas: { map: BananaState },
  pickups: { map: PickupState },
  blueScore: "uint16",
  redScore: "uint16",
  timeRemaining: "number",
  phase: "string",
});

export class FoodFightRoom extends Room<{ state: FoodFightState }> {
  state = new FoodFightState();
  maxClients = GAME.maxPlayers;
  private nextProjectileId = 1;
  private nextBananaId = 1;

  onCreate() {
    this.initializePickups();
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

  private initializePickups() {
    for (const spawn of foodCourtMap.pickupSpawns) {
      const pickup = new PickupState();
      pickup.x = spawn.x;
      pickup.y = spawn.y;
      pickup.kind = spawn.kind;
      this.state.pickups.set(spawn.id, pickup);
    }
  }

  private handleInput(client: Client, input: PlayerInputMessage) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !Number.isFinite(input.seq) || input.seq <= player.lastInputSeq) return;
    player.lastInputSeq = input.seq;
    player.moveX = clampAxis(input.moveX);
    player.moveY = clampAxis(input.moveY);
    player.aimX = clampAxis(input.aimX);
    player.aimY = clampAxis(input.aimY);

    if (input.dodgePressed) this.tryDodge(player);
    if (input.throwPressed) this.tryThrowTomato(client.sessionId, player);
    if (input.bananaPressed) this.tryDropBanana(client.sessionId, player);
  }

  private tryDodge(player: PlayerState) {
    if (player.dodgeCooldown > 0 || player.stunRemaining > 0 || player.dodgeRemaining > 0) return;
    let direction = normalizeAim({ x: player.moveX, y: player.moveY });
    if (direction.x === 0 && direction.y === 0) {
      direction = normalizeAim({ x: player.aimX, y: player.aimY });
    }
    if (direction.x === 0 && direction.y === 0) return;

    player.dodgeX = direction.x;
    player.dodgeY = direction.y;
    player.dodgeRemaining = GAME.dodgeSeconds;
    player.dodgeCooldown = GAME.dodgeCooldownSeconds;
  }

  private tryThrowTomato(ownerSessionId: string, player: PlayerState) {
    if (
      player.tomatoAmmo <= 0 ||
      player.throwCooldown > 0 ||
      player.stunRemaining > 0 ||
      player.dodgeRemaining > 0
    ) {
      return;
    }

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
    player.tomatoAmmo -= 1;
    player.throwCooldown = tomato.cooldownSeconds;
  }

  private tryDropBanana(ownerSessionId: string, player: PlayerState) {
    if (
      player.bananaAmmo <= 0 ||
      player.bananaCooldown > 0 ||
      player.stunRemaining > 0 ||
      player.dodgeRemaining > 0
    ) {
      return;
    }

    let aim = normalizeAim({ x: player.aimX, y: player.aimY });
    if (aim.x === 0 && aim.y === 0) aim = { x: 1, y: 0 };
    const distance = GAME.playerRadius + GAME.bananaRadius + 0.18;
    const position = {
      x: player.x - aim.x * distance,
      y: player.y - aim.y * distance,
    };

    if (
      projectileOutsideBounds(position, foodCourtMap.bounds, GAME.bananaRadius) ||
      projectileHitsObstacle(position, GAME.bananaRadius, foodCourtMap.obstacles)
    ) {
      return;
    }

    const banana = new BananaState();
    banana.x = position.x;
    banana.y = position.y;
    banana.team = player.team;
    banana.ownerSessionId = ownerSessionId;
    banana.lifetime = ITEMS.banana.lifetimeSeconds;
    this.state.bananas.set(`banana-${this.nextBananaId++}`, banana);
    player.bananaAmmo -= 1;
    player.bananaCooldown = ITEMS.banana.cooldownSeconds;
  }

  private tick(dt: number) {
    if (this.state.phase !== "playing") return;
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - dt);

    this.state.players.forEach((player: PlayerState) => {
      const dodging = player.dodgeRemaining > 0;
      player.throwCooldown = Math.max(0, player.throwCooldown - dt);
      player.bananaCooldown = Math.max(0, player.bananaCooldown - dt);
      player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt);
      player.stunRemaining = Math.max(0, player.stunRemaining - dt);
      player.dodgeRemaining = Math.max(0, player.dodgeRemaining - dt);
      if (player.stunRemaining > 0) {
        player.dodgeRemaining = 0;
        return;
      }

      const direction = dodging
        ? { x: player.dodgeX, y: player.dodgeY }
        : { x: player.moveX, y: player.moveY };
      const speed = GAME.playerSpeed * (dodging ? GAME.dodgeSpeedMultiplier : 1);
      const next = movePlayerWithObstacles(
        { x: player.x, y: player.y },
        direction,
        dt,
        foodCourtMap.bounds,
        foodCourtMap.obstacles,
        speed,
      );
      player.x = next.x;
      player.y = next.y;
    });

    this.tickProjectiles(dt);
    this.tickBananas(dt);
    this.tickPickups(dt);
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
        if (
          targetSessionId ||
          sessionId === projectile.ownerSessionId ||
          target.team === projectile.team ||
          target.dodgeRemaining > 0
        ) {
          return;
        }
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

  private tickBananas(dt: number) {
    const removals = new Map<string, ImpactMessage>();

    this.state.bananas.forEach((banana: BananaState, bananaId: string) => {
      banana.lifetime = Math.max(0, banana.lifetime - dt);
      if (banana.lifetime <= 0) {
        removals.set(bananaId, { x: banana.x, y: banana.y, kind: "banana" });
        return;
      }

      let targetSessionId: string | undefined;
      this.state.players.forEach((target: PlayerState, sessionId: string) => {
        if (
          targetSessionId ||
          sessionId === banana.ownerSessionId ||
          target.team === banana.team ||
          target.dodgeRemaining > 0 ||
          target.stunRemaining > 0
        ) {
          return;
        }
        if (!circlesOverlap(banana, GAME.bananaRadius, target, GAME.playerRadius)) return;
        targetSessionId = sessionId;
        target.stunRemaining = Math.max(target.stunRemaining, ITEMS.banana.stunSeconds ?? 0);
      });

      if (targetSessionId) {
        removals.set(bananaId, {
          x: banana.x,
          y: banana.y,
          kind: "banana",
          targetSessionId,
        });
      }
    });

    for (const [bananaId, impact] of removals) {
      this.state.bananas.delete(bananaId);
      this.broadcast("impact", impact);
    }
  }

  private tickPickups(dt: number) {
    this.state.pickups.forEach((pickup: PickupState) => {
      if (!pickup.available) {
        pickup.respawnRemaining = Math.max(0, pickup.respawnRemaining - dt);
        if (pickup.respawnRemaining <= 0) pickup.available = true;
        return;
      }

      let collector: PlayerState | undefined;
      this.state.players.forEach((player: PlayerState) => {
        if (collector || player.stunRemaining > 0) return;
        const needsPickup = pickup.kind === "tomato"
          ? player.tomatoAmmo < GAME.tomatoAmmoMax
          : player.bananaAmmo < GAME.bananaAmmoMax;
        if (!needsPickup) return;
        if (!circlesOverlap(pickup, GAME.pickupRadius, player, GAME.playerRadius)) return;
        collector = player;
      });

      if (!collector) return;
      if (pickup.kind === "tomato") {
        collector.tomatoAmmo = Math.min(GAME.tomatoAmmoMax, collector.tomatoAmmo + 2);
      } else {
        collector.bananaAmmo = Math.min(GAME.bananaAmmoMax, collector.bananaAmmo + 1);
      }
      pickup.available = false;
      pickup.respawnRemaining = GAME.pickupRespawnSeconds;
    });
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
