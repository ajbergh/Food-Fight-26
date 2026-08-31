import { appendFileSync, existsSync } from "node:fs";
import { once } from "node:events";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client, type Room } from "@colyseus/sdk";
import { GAME } from "@foodfight/game-core";
import type { PlayerInputMessage } from "@foodfight/protocol";
import {
  aggregateRoomTickPerf,
  formatBenchmarkReport,
  parseRoomTickPerfLine,
  type RoomTickPerfEvent,
} from "./metrics";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const serverEntry = resolve(repoRoot, "apps/game-server/dist/index.js");
const botCount = Math.min(GAME.maxPlayers, readPositiveInt("LOAD_BENCHMARK_BOTS", GAME.maxPlayers));
const durationSeconds = readPositiveNumber("LOAD_BENCHMARK_SECONDS", 10);
const reportWindowMs = readPositiveNumber("LOAD_BENCHMARK_REPORT_MS", 2_000);
const port = readPositiveInt("LOAD_BENCHMARK_PORT", 26_671);
const endpoint = `http://127.0.0.1:${port}`;
const tickMs = Math.round(1000 / GAME.serverHz);

if (!existsSync(serverEntry)) {
  throw new Error(`Built game server not found at ${serverEntry}. Run \`pnpm build\` first.`);
}

const telemetry: RoomTickPerfEvent[] = [];
const rooms: Room[] = [];
const inputIntervals: NodeJS.Timeout[] = [];
let server: ChildProcessWithoutNullStreams | undefined;
const stderrLines: string[] = [];

try {
  server = spawn(process.execPath, [serverEntry], {
    cwd: repoRoot,
    env: {
      ...process.env,
      GAME_SERVER_PORT: String(port),
      TICK_METRICS_REPORT_MS: String(reportWindowMs),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdout = createInterface({ input: server.stdout });
  const stderr = createInterface({ input: server.stderr });
  let markReady: (() => void) | undefined;
  const ready = new Promise<void>((resolveReady) => {
    markReady = resolveReady;
  });

  stdout.on("line", (line) => {
    const event = parseRoomTickPerfLine(line);
    if (event) telemetry.push(event);
    if (line.includes("Food Fight game server listening")) markReady?.();
  });
  stderr.on("line", (line) => {
    stderrLines.push(line);
    if (stderrLines.length > 20) stderrLines.shift();
  });

  await Promise.race([
    ready,
    once(server, "exit").then(([code, signal]) => {
      throw new Error(`Game server exited before readiness (code ${String(code)}, signal ${String(signal)}).`);
    }),
    sleep(10_000).then(() => {
      throw new Error("Timed out waiting for the game server to become ready.");
    }),
  ]);

  console.log(`Eight-player room benchmark -> ${endpoint}`);
  console.log(`Joining ${botCount} simulated clients for ${durationSeconds}s...`);

  for (let index = 0; index < botCount; index += 1) {
    const client = new Client(endpoint);
    const room = await client.joinOrCreate("food_fight", { displayName: `Load-${index + 1}` });
    rooms.push(room);
  }

  const roomIds = new Set(rooms.map((room) => room.roomId));
  if (roomIds.size !== 1) {
    throw new Error(`Expected all simulated clients in one room; observed ${[...roomIds].join(", ")}.`);
  }
  const expectedRoomId = rooms[0]?.roomId;
  if (!expectedRoomId) throw new Error("No benchmark room was created.");

  rooms.forEach((room, index) => {
    let seq = 0;
    const interval = setInterval(() => {
      seq += 1;
      const angle = seq / 18 + (index / Math.max(1, botCount)) * Math.PI * 2;
      const input: PlayerInputMessage = {
        seq,
        moveX: Math.cos(angle),
        moveY: Math.sin(angle),
        aimX: index < botCount / 2 ? 1 : -1,
        aimY: index % 2 === 0 ? 0.2 : -0.2,
        throwPressed: seq % 18 === 0,
        bananaPressed: seq % 72 === 0,
        dodgePressed: seq % 48 === 0,
      };
      room.send("input", input);
    }, tickMs);
    inputIntervals.push(interval);
  });

  await sleep(durationSeconds * 1000);
  inputIntervals.forEach(clearInterval);
  inputIntervals.length = 0;
  await sleep(Math.min(500, reportWindowMs / 2));

  const aggregate = aggregateRoomTickPerf(telemetry);
  if (!aggregate || aggregate.reports < 2) {
    throw new Error(`Expected at least 2 room_tick_perf reports; received ${aggregate?.reports ?? 0}.`);
  }
  if (aggregate.roomIds.length !== 1 || aggregate.roomIds[0] !== expectedRoomId) {
    throw new Error(`Telemetry room mismatch: expected ${expectedRoomId}, observed ${aggregate.roomIds.join(", ")}.`);
  }

  const report = formatBenchmarkReport(aggregate, botCount, durationSeconds);
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
} catch (error) {
  if (stderrLines.length > 0) {
    console.error("Recent game-server stderr:\n" + stderrLines.join("\n"));
  }
  throw error;
} finally {
  inputIntervals.forEach(clearInterval);
  await Promise.allSettled(rooms.map((room) => room.leave()));
  if (server && server.exitCode === null && server.signalCode === null) {
    server.kill("SIGTERM");
    await Promise.race([once(server, "exit"), sleep(2_000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill("SIGKILL");
  }
}

function readPositiveInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readPositiveNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));
}
