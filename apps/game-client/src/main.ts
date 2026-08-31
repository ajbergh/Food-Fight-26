import * as pc from "playcanvas";
import { GAME, movePlayer } from "@foodfight/game-core";
import { foodCourtMap } from "@foodfight/maps";
import type { MatchStateShape, PlayerSnapshot } from "@foodfight/protocol";
import { connectToMatch, type MatchConnection } from "./network";
import "./styles.css";

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const networkLabel = document.querySelector<HTMLDivElement>("#network")!;
const timerLabel = document.querySelector<HTMLDivElement>("#timer")!;
const blueScoreLabel = document.querySelector<HTMLSpanElement>("#blue-score")!;
const redScoreLabel = document.querySelector<HTMLSpanElement>("#red-score")!;
const keyboard = new pc.Keyboard(window);

const app = new pc.Application(canvas, {
  mouse: new pc.Mouse(canvas),
  touch: new pc.TouchDevice(canvas),
  keyboard,
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.ambientLight = new pc.Color(0.42, 0.38, 0.48);
app.start();

const camera = new pc.Entity("camera");
camera.addComponent("camera", { clearColor: new pc.Color(0.08, 0.07, 0.1) });
camera.setPosition(0, 22, 19);
camera.lookAt(0, 0, 0);
app.root.addChild(camera);

const light = new pc.Entity("key-light");
light.addComponent("light", { type: "directional", intensity: 1.5, castShadows: true });
light.setEulerAngles(50, -35, 0);
app.root.addChild(light);

function material(color: pc.Color) {
  const value = new pc.StandardMaterial();
  value.diffuse = color;
  value.metalness = 0.05;
  value.gloss = 0.45;
  value.update();
  return value;
}

const floor = new pc.Entity("arena-floor");
floor.addComponent("render", { type: "box", material: material(new pc.Color(0.36, 0.3, 0.39)) });
floor.setLocalScale(foodCourtMap.width, 0.5, foodCourtMap.height);
floor.setPosition(0, -0.3, 0);
app.root.addChild(floor);

for (const obstacle of foodCourtMap.obstacles) {
  const entity = new pc.Entity(obstacle.id);
  entity.addComponent("render", { type: "box", material: material(new pc.Color(0.38, 0.31, 0.72)) });
  entity.setLocalScale(obstacle.width, 0.75, obstacle.height);
  entity.setPosition(obstacle.x, 0.36, obstacle.y);
  app.root.addChild(entity);
}

const sundae = new pc.Entity("sundae-objective");
sundae.addComponent("render", { type: "cylinder", material: material(new pc.Color(0.95, 0.87, 0.7)) });
sundae.setLocalScale(2.2, 3.2, 2.2);
sundae.setPosition(foodCourtMap.objective.x, 1.6, foodCourtMap.objective.y);
app.root.addChild(sundae);

const playerColors = [
  new pc.Color(0.2, 0.55, 1),
  new pc.Color(0.35, 0.85, 0.35),
  new pc.Color(0.65, 0.35, 0.95),
  new pc.Color(1, 0.8, 0.2),
  new pc.Color(1, 0.45, 0.15),
  new pc.Color(0.95, 0.2, 0.2),
  new pc.Color(0.1, 0.85, 0.85),
  new pc.Color(1, 0.35, 0.7),
];

interface PlayerCollection {
  size: number;
  forEach(callback: (player: PlayerSnapshot, sessionId: string) => void): void;
}

interface PlayerVisual {
  entity: pc.Entity;
  target: pc.Vec3;
  authoritative: pc.Vec3;
  local: boolean;
}

const playerVisuals = new Map<string, PlayerVisual>();
let connection: MatchConnection | undefined;
let inputSequence = 0;
let inputAccumulator = 0;
let lastAim = { x: 1, y: 0 };

function colorForSession(sessionId: string): pc.Color {
  let hash = 0;
  for (const character of sessionId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return playerColors[hash % playerColors.length]!;
}

function ensurePlayerVisual(sessionId: string, player: PlayerSnapshot): PlayerVisual {
  const existing = playerVisuals.get(sessionId);
  if (existing) return existing;

  const entity = new pc.Entity(`player-${sessionId}`);
  entity.addComponent("render", { type: "capsule", material: material(colorForSession(sessionId)) });
  entity.setLocalScale(0.85, 1.2, 0.85);
  entity.setPosition(player.x, 0.9, player.y);
  app.root.addChild(entity);

  const position = new pc.Vec3(player.x, 0.9, player.y);
  const visual: PlayerVisual = {
    entity,
    target: position.clone(),
    authoritative: position.clone(),
    local: connection?.room.sessionId === sessionId,
  };
  playerVisuals.set(sessionId, visual);
  return visual;
}

function syncState(state: MatchStateShape) {
  const players = state.players as unknown as PlayerCollection;
  const seen = new Set<string>();

  players.forEach((player, sessionId) => {
    seen.add(sessionId);
    const visual = ensurePlayerVisual(sessionId, player);
    visual.local = connection?.room.sessionId === sessionId;
    visual.target.set(player.x, 0.9, player.y);
    visual.authoritative.copy(visual.target);
  });

  for (const [sessionId, visual] of playerVisuals) {
    if (seen.has(sessionId)) continue;
    visual.entity.destroy();
    playerVisuals.delete(sessionId);
  }

  blueScoreLabel.textContent = String(state.blueScore);
  redScoreLabel.textContent = String(state.redScore);
  timerLabel.textContent = formatTime(state.timeRemaining);
  networkLabel.textContent = `online · ${players.size}/${GAME.maxPlayers} · ${state.phase}`;
}

function readMovement() {
  let x = 0;
  let y = 0;
  if (keyboard.isPressed(pc.KEY_A) || keyboard.isPressed(pc.KEY_LEFT)) x -= 1;
  if (keyboard.isPressed(pc.KEY_D) || keyboard.isPressed(pc.KEY_RIGHT)) x += 1;
  if (keyboard.isPressed(pc.KEY_W) || keyboard.isPressed(pc.KEY_UP)) y -= 1;
  if (keyboard.isPressed(pc.KEY_S) || keyboard.isPressed(pc.KEY_DOWN)) y += 1;
  const length = Math.hypot(x, y);
  if (length > 1) {
    x /= length;
    y /= length;
  }
  if (length > 0) lastAim = { x, y };
  return { x, y };
}

function smoothPosition(entity: pc.Entity, target: pc.Vec3, responsiveness: number, dt: number) {
  const current = entity.getPosition().clone();
  current.lerp(current, target, 1 - Math.exp(-responsiveness * dt));
  entity.setPosition(current);
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

app.on("update", (dt: number) => {
  const move = readMovement();
  const localVisual = connection ? playerVisuals.get(connection.room.sessionId) : undefined;

  if (localVisual) {
    const current = localVisual.entity.getPosition();
    const predicted = movePlayer(
      { x: current.x, y: current.z },
      move,
      dt,
      foodCourtMap.bounds,
    );
    localVisual.entity.setPosition(predicted.x, 0.9, predicted.y);

    const correctionDistance = localVisual.entity.getPosition().distance(localVisual.authoritative);
    if (correctionDistance > 2.5) {
      localVisual.entity.setPosition(localVisual.authoritative);
    } else {
      smoothPosition(localVisual.entity, localVisual.authoritative, 8, dt);
    }
  }

  for (const visual of playerVisuals.values()) {
    if (visual.local) continue;
    smoothPosition(visual.entity, visual.target, 14, dt);
  }

  if (!connection) return;
  inputAccumulator += dt;
  const sendInterval = 1 / GAME.serverHz;
  while (inputAccumulator >= sendInterval) {
    inputAccumulator -= sendInterval;
    connection.sendInput({
      seq: ++inputSequence,
      moveX: move.x,
      moveY: move.y,
      aimX: lastAim.x,
      aimY: lastAim.y,
      throwPressed: false,
    });
  }
});

window.addEventListener("resize", () => app.resizeCanvas());

connectToMatch(`Guest-${Math.floor(Math.random() * 9000 + 1000)}`)
  .then((matchConnection) => {
    connection = matchConnection;
    networkLabel.textContent = `connected · ${connection.room.sessionId.slice(0, 6)}`;
    connection.room.onStateChange((state) => syncState(state));
    syncState(connection.room.state);
  })
  .catch((error: unknown) => {
    console.error("Unable to connect to game server", error);
    networkLabel.textContent = "server unavailable · start apps/game-server";
  });
