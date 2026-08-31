import { Client, type Room } from "@colyseus/sdk";
import { GAME } from "@foodfight/game-core";
import { foodCourtMap } from "@foodfight/maps";
import type { MatchPhase, PlayerInputMessage } from "@foodfight/protocol";
import { objectiveOrbitTarget, steeringTo } from "./behavior";

interface PlayerLike {
  x: number;
  y: number;
}

interface PlayersLike {
  get(sessionId: string): PlayerLike | undefined;
  size?: number;
}

interface StateLike {
  players?: PlayersLike;
  blueScore?: number;
  redScore?: number;
  phase?: MatchPhase;
  roundNumber?: number;
}

interface BotRuntime {
  room: Room;
  interval: NodeJS.Timeout;
  seq: number;
  nextThrowAt: number;
  nextBananaAt: number;
  nextDodgeAt: number;
}

const endpoint = process.env.GAME_SERVER_URL ?? "http://localhost:2567";
const botCount = Math.min(GAME.maxPlayers, readPositiveInt("BOT_COUNT", 7));
const durationSeconds = readPositiveInt("BOT_DURATION_SECONDS", 180);
const tickMs = Math.round(1000 / GAME.serverHz);
const bots: BotRuntime[] = [];
const startedAt = Date.now();
let shuttingDown = false;

console.log(`Food Fight 26 bot harness: ${botCount} bots -> ${endpoint}`);
console.log(`Run duration: ${durationSeconds}s. Set BOT_DURATION_SECONDS or BOT_COUNT to override.`);

for (let index = 0; index < botCount; index += 1) {
  const client = new Client(endpoint);
  const room = await client.joinOrCreate("food_fight", { displayName: `Bot-${index + 1}` });
  const runtime: BotRuntime = {
    room,
    interval: setInterval(() => undefined, 60_000),
    seq: 0,
    nextThrowAt: randomBetween(0.35, 0.85),
    nextBananaAt: randomBetween(1.4, 2.8),
    nextDodgeAt: randomBetween(1.2, 2.4),
  };
  clearInterval(runtime.interval);
  runtime.interval = setInterval(() => tickBot(runtime, index), tickMs);
  bots.push(runtime);
  console.log(`joined Bot-${index + 1} · ${room.sessionId.slice(0, 6)} · room ${room.roomId}`);
}

const statusInterval = setInterval(printStatus, 5_000);
const stopTimer = setTimeout(() => void shutdown("duration complete"), durationSeconds * 1000);
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

function tickBot(bot: BotRuntime, botIndex: number) {
  const state = bot.room.state as unknown as StateLike;
  const player = state.players?.get(bot.room.sessionId);
  if (!player) return;

  const elapsedSeconds = (Date.now() - startedAt) / 1000;
  const active = state.phase === "playing" || state.phase === "overtime";
  const target = objectiveOrbitTarget(botIndex, elapsedSeconds, foodCourtMap.objective);
  const move = active ? steeringTo(player, target) : { x: 0, y: 0 };
  const aim = steeringTo(player, foodCourtMap.objective);

  const throwPressed = active && elapsedSeconds >= bot.nextThrowAt;
  const bananaPressed = active && elapsedSeconds >= bot.nextBananaAt;
  const dodgePressed = active && elapsedSeconds >= bot.nextDodgeAt;
  if (throwPressed) bot.nextThrowAt = elapsedSeconds + randomBetween(0.75, 1.25);
  if (bananaPressed) bot.nextBananaAt = elapsedSeconds + randomBetween(2.6, 4.2);
  if (dodgePressed) bot.nextDodgeAt = elapsedSeconds + randomBetween(1.8, 3.1);

  const input: PlayerInputMessage = {
    seq: ++bot.seq,
    moveX: move.x,
    moveY: move.y,
    aimX: aim.x,
    aimY: aim.y,
    throwPressed,
    bananaPressed,
    dodgePressed,
  };
  bot.room.send("input", input);
}

function printStatus() {
  const first = bots[0];
  if (!first) return;
  const state = first.room.state as unknown as StateLike;
  const players = state.players?.size ?? bots.length;
  console.log(
    `room ${first.room.roomId} · round ${state.roundNumber ?? "?"} · ${state.phase ?? "?"} · ` +
      `${state.blueScore ?? 0}-${state.redScore ?? 0} · ${players} players`,
  );
}

async function shutdown(reason: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearInterval(statusInterval);
  clearTimeout(stopTimer);
  for (const bot of bots) clearInterval(bot.interval);
  console.log(`stopping bot harness: ${reason}`);
  await Promise.allSettled(bots.map((bot) => bot.room.leave()));
  process.exit(0);
}

function readPositiveInt(name: string, fallback: number) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
