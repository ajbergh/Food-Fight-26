import * as pc from "playcanvas";
import { GAME, movePlayerWithObstacles } from "@foodfight/game-core";
import { foodCourtMap } from "@foodfight/maps";
import type {
  BananaSnapshot,
  ImpactMessage,
  MatchEventMessage,
  MatchStateShape,
  PickupSnapshot,
  PlayerSnapshot,
  ProjectileSnapshot,
} from "@foodfight/protocol";
import { createArtPrototype } from "./artPrototype";
import { connectToMatch, type MatchConnection } from "./network";
import "./styles.css";

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const networkLabel = document.querySelector<HTMLDivElement>("#network")!;
const timerLabel = document.querySelector<HTMLDivElement>("#timer")!;
const blueScoreLabel = document.querySelector<HTMLSpanElement>("#blue-score")!;
const redScoreLabel = document.querySelector<HTMLSpanElement>("#red-score")!;
const tomatoAmmoLabel = document.querySelector<HTMLElement>("#tomato-ammo")!;
const bananaAmmoLabel = document.querySelector<HTMLElement>("#banana-ammo")!;
const matchBanner = document.querySelector<HTMLDivElement>("#match-banner")!;
const eventToast = document.querySelector<HTMLDivElement>("#event-toast")!;
const objectiveLabel = document.querySelector<HTMLDivElement>("#objective")!;
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

const tomatoMaterial = material(new pc.Color(0.9, 0.08, 0.05));
const tomatoStemMaterial = material(new pc.Color(0.15, 0.6, 0.2));
const tomatoImpactMaterial = material(new pc.Color(1, 0.15, 0.08));
const bananaMaterial = material(new pc.Color(1, 0.82, 0.05));
const bananaStemMaterial = material(new pc.Color(0.35, 0.18, 0.05));
const bananaImpactMaterial = material(new pc.Color(1, 0.72, 0.04));
const pickupPadMaterial = material(new pc.Color(0.12, 0.75, 0.82));

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

const art = createArtPrototype({ app, camera, keyLight: light, sundae });

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

interface StateCollection<T> {
  size: number;
  forEach(callback: (value: T, key: string) => void): void;
}

interface PlayerVisual {
  entity: pc.Entity;
  target: pc.Vec3;
  authoritative: pc.Vec3;
  label: HTMLDivElement;
  local: boolean;
  stunned: boolean;
  dodging: boolean;
}

interface MovingVisual {
  entity: pc.Entity;
  target: pc.Vec3;
}

interface PickupVisual {
  entity: pc.Entity;
  baseY: number;
  phase: number;
}

interface ImpactVisual {
  entity: pc.Entity;
  age: number;
}

const playerVisuals = new Map<string, PlayerVisual>();
const projectileVisuals = new Map<string, MovingVisual>();
const bananaVisuals = new Map<string, pc.Entity>();
const pickupVisuals = new Map<string, PickupVisual>();
const impactVisuals: ImpactVisual[] = [];
let connection: MatchConnection | undefined;
let inputSequence = 0;
let inputAccumulator = 0;
let lastAim = { x: 1, y: 0 };
let throwQueued = false;
let bananaQueued = false;
let dodgeQueued = false;
let lastGamepadThrow = false;
let lastGamepadBanana = false;
let lastGamepadDodge = false;
let lastStateAt = performance.now();
let smoothedPatchHz = 0;
let currentPlayerCount = 0;
let currentBananaCount = 0;
let currentPickupCount = 0;
let toastTimer: number | undefined;

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "Space") {
    event.preventDefault();
    throwQueued = true;
  } else if (event.code === "KeyQ") {
    bananaQueued = true;
  } else if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
    dodgeQueued = true;
  }
});
canvas.addEventListener("pointerdown", () => {
  throwQueued = true;
});

function colorForSession(sessionId: string): pc.Color {
  let hash = 0;
  for (const character of sessionId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return playerColors[hash % playerColors.length]!;
}

function ensurePlayerVisual(sessionId: string, player: PlayerSnapshot): PlayerVisual {
  const existing = playerVisuals.get(sessionId);
  if (existing) {
    existing.label.textContent = player.stunRemaining > 0
      ? `${player.displayName} · SLIP!`
      : player.dodgeRemaining > 0
        ? `${player.displayName} · DODGE!`
        : player.displayName;
    existing.stunned = player.stunRemaining > 0;
    existing.dodging = player.dodgeRemaining > 0;
    return existing;
  }

  const entity = new pc.Entity(`player-${sessionId}`);
  const accent = colorForSession(sessionId);
  entity.addComponent("render", { type: "capsule", material: material(accent) });
  entity.setLocalScale(0.85, 1.2, 0.85);
  entity.setPosition(player.x, 0.9, player.y);
  art.decoratePlayer(entity, accent, player.team);
  app.root.addChild(entity);

  const label = document.createElement("div");
  label.className = "player-label";
  label.textContent = player.displayName;
  document.body.appendChild(label);

  const position = new pc.Vec3(player.x, 0.9, player.y);
  const visual: PlayerVisual = {
    entity,
    target: position.clone(),
    authoritative: position.clone(),
    label,
    local: connection?.room.sessionId === sessionId,
    stunned: player.stunRemaining > 0,
    dodging: player.dodgeRemaining > 0,
  };
  playerVisuals.set(sessionId, visual);
  return visual;
}

function createTomatoEntity(name: string, scale = 1) {
  const root = new pc.Entity(name);
  const fruit = new pc.Entity("fruit");
  fruit.addComponent("render", { type: "sphere", material: tomatoMaterial });
  fruit.setLocalScale(0.56 * scale, 0.56 * scale, 0.56 * scale);
  root.addChild(fruit);
  const stem = new pc.Entity("stem");
  stem.addComponent("render", { type: "cone", material: tomatoStemMaterial });
  stem.setLocalScale(0.18 * scale, 0.15 * scale, 0.18 * scale);
  stem.setLocalPosition(0, 0.28 * scale, 0);
  root.addChild(stem);
  return root;
}

function createBananaEntity(name: string, scale = 1) {
  const root = new pc.Entity(name);
  const angles = [-34, 0, 34];
  for (let index = 0; index < angles.length; index += 1) {
    const peel = new pc.Entity(`peel-${index}`);
    peel.addComponent("render", { type: "capsule", material: bananaMaterial });
    peel.setLocalScale(0.18 * scale, 0.55 * scale, 0.18 * scale);
    peel.setLocalEulerAngles(68, 0, angles[index]!);
    peel.setLocalPosition((index - 1) * 0.18 * scale, 0.12 * scale, Math.abs(index - 1) * 0.06 * scale);
    root.addChild(peel);
  }
  const stem = new pc.Entity("stem");
  stem.addComponent("render", { type: "cylinder", material: bananaStemMaterial });
  stem.setLocalScale(0.09 * scale, 0.12 * scale, 0.09 * scale);
  stem.setLocalPosition(0, 0.12 * scale, 0);
  root.addChild(stem);
  return root;
}

function createPickupEntity(pickupId: string, kind: PickupSnapshot["kind"]) {
  const root = new pc.Entity(`pickup-${pickupId}`);
  const pad = new pc.Entity("pad");
  pad.addComponent("render", { type: "cylinder", material: pickupPadMaterial });
  pad.setLocalScale(0.95, 0.08, 0.95);
  pad.setLocalPosition(0, -0.24, 0);
  root.addChild(pad);
  root.addChild(kind === "tomato" ? createTomatoEntity("food", 1.15) : createBananaEntity("food", 1.1));
  app.root.addChild(root);
  return root;
}

function syncState(state: MatchStateShape) {
  const now = performance.now();
  const elapsed = Math.max(1, now - lastStateAt);
  const instantaneousHz = 1000 / elapsed;
  smoothedPatchHz = smoothedPatchHz === 0 ? instantaneousHz : smoothedPatchHz * 0.85 + instantaneousHz * 0.15;
  lastStateAt = now;

  const players = state.players as unknown as StateCollection<PlayerSnapshot>;
  currentPlayerCount = players.size;
  const seenPlayers = new Set<string>();
  players.forEach((player, sessionId) => {
    seenPlayers.add(sessionId);
    const visual = ensurePlayerVisual(sessionId, player);
    visual.local = connection?.room.sessionId === sessionId;
    visual.stunned = player.stunRemaining > 0;
    visual.dodging = player.dodgeRemaining > 0;
    visual.target.set(player.x, 0.9, player.y);
    visual.authoritative.copy(visual.target);
    if (visual.local) {
      tomatoAmmoLabel.textContent = String(player.tomatoAmmo);
      bananaAmmoLabel.textContent = String(player.bananaAmmo);
    }
  });
  for (const [sessionId, visual] of playerVisuals) {
    if (seenPlayers.has(sessionId)) continue;
    visual.entity.destroy();
    visual.label.remove();
    playerVisuals.delete(sessionId);
  }

  const projectiles = state.projectiles as unknown as StateCollection<ProjectileSnapshot>;
  const seenProjectiles = new Set<string>();
  projectiles.forEach((projectile, projectileId) => {
    seenProjectiles.add(projectileId);
    let visual = projectileVisuals.get(projectileId);
    if (!visual) {
      const entity = createTomatoEntity(`projectile-${projectileId}`);
      app.root.addChild(entity);
      entity.setPosition(projectile.x, 0.45, projectile.y);
      visual = { entity, target: new pc.Vec3(projectile.x, 0.45, projectile.y) };
      projectileVisuals.set(projectileId, visual);
      art.triggerPlayerThrow(
        projectile.ownerSessionId,
        { x: projectile.vx, z: projectile.vy },
        "tomato",
      );
    }
    visual.target.set(projectile.x, 0.45, projectile.y);
  });
  for (const [projectileId, visual] of projectileVisuals) {
    if (seenProjectiles.has(projectileId)) continue;
    visual.entity.destroy();
    projectileVisuals.delete(projectileId);
  }

  const bananas = state.bananas as unknown as StateCollection<BananaSnapshot>;
  currentBananaCount = bananas.size;
  const seenBananas = new Set<string>();
  bananas.forEach((banana, bananaId) => {
    seenBananas.add(bananaId);
    let entity = bananaVisuals.get(bananaId);
    if (!entity) {
      entity = createBananaEntity(`hazard-${bananaId}`);
      app.root.addChild(entity);
      bananaVisuals.set(bananaId, entity);
      art.triggerPlayerThrow(banana.ownerSessionId, undefined, "banana");
    }
    entity.setPosition(banana.x, 0.06, banana.y);
  });
  for (const [bananaId, entity] of bananaVisuals) {
    if (seenBananas.has(bananaId)) continue;
    entity.destroy();
    bananaVisuals.delete(bananaId);
  }

  const pickups = state.pickups as unknown as StateCollection<PickupSnapshot>;
  currentPickupCount = 0;
  const seenPickups = new Set<string>();
  pickups.forEach((pickup, pickupId) => {
    seenPickups.add(pickupId);
    let visual = pickupVisuals.get(pickupId);
    if (!visual) {
      const entity = createPickupEntity(pickupId, pickup.kind);
      entity.setPosition(pickup.x, 0.48, pickup.y);
      visual = { entity, baseY: 0.48, phase: Math.random() * Math.PI * 2 };
      pickupVisuals.set(pickupId, visual);
    }
    visual.entity.enabled = pickup.available;
    if (pickup.available) currentPickupCount += 1;
  });
  for (const [pickupId, visual] of pickupVisuals) {
    if (seenPickups.has(pickupId)) continue;
    visual.entity.destroy();
    pickupVisuals.delete(pickupId);
  }

  blueScoreLabel.textContent = String(state.blueScore);
  redScoreLabel.textContent = String(state.redScore);
  timerLabel.textContent = formatTime(state.phase === "playing" ? state.timeRemaining : state.phaseRemaining);
  art.setObjectiveState(state.objectiveOwner, state.objectiveContested);
  updateMatchPresentation(state);
  updateNetworkLabel(state.phase, projectiles.size);
}

function updateMatchPresentation(state: MatchStateShape) {
  let banner = "";
  if (state.phase === "waiting") {
    banner = `ROUND ${state.roundNumber} · ${Math.max(1, Math.ceil(state.phaseRemaining))}`;
  } else if (state.phase === "overtime") {
    banner = "OVERTIME · SUDDEN CONTROL";
  } else if (state.phase === "finished") {
    banner = state.winner === "none" ? "ROUND OVER" : `${state.winner.toUpperCase()} WINS`;
  }
  matchBanner.textContent = banner;
  matchBanner.classList.toggle("visible", banner.length > 0);
  matchBanner.dataset.team = state.winner;

  const objectiveState = state.objectiveContested ? "contested" : state.objectiveOwner;
  objectiveLabel.dataset.state = objectiveState;
  objectiveLabel.textContent = state.objectiveContested
    ? "SUNDAE CONTESTED"
    : state.objectiveOwner === "blue"
      ? "BLUE CONTROLS THE SUNDAE"
      : state.objectiveOwner === "red"
        ? "RED CONTROLS THE SUNDAE"
        : "HOLD THE SUNDAE";
}

function handleMatchEvent(message: MatchEventMessage) {
  const team = message.team?.toUpperCase();
  const text = message.type === "round_started"
    ? `ROUND ${message.roundNumber} · FIGHT!`
    : message.type === "overtime"
      ? "OVERTIME!"
      : message.type === "objective_control"
        ? `${team} TOOK THE SUNDAE`
        : `${team ?? "ROUND"} FINISHED`;
  eventToast.textContent = text;
  eventToast.dataset.team = message.team ?? "none";
  eventToast.classList.add("visible");
  if (toastTimer !== undefined) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => eventToast.classList.remove("visible"), 1500);
}

function readMovement() {
  let x = 0;
  let y = 0;
  if (keyboard.isPressed(pc.KEY_A) || keyboard.isPressed(pc.KEY_LEFT)) x -= 1;
  if (keyboard.isPressed(pc.KEY_D) || keyboard.isPressed(pc.KEY_RIGHT)) x += 1;
  if (keyboard.isPressed(pc.KEY_W) || keyboard.isPressed(pc.KEY_UP)) y -= 1;
  if (keyboard.isPressed(pc.KEY_S) || keyboard.isPressed(pc.KEY_DOWN)) y += 1;

  const gamepad = navigator.getGamepads?.()[0];
  if (gamepad) {
    const gamepadX = applyDeadzone(gamepad.axes[0] ?? 0);
    const gamepadY = applyDeadzone(gamepad.axes[1] ?? 0);
    if (Math.hypot(gamepadX, gamepadY) > Math.hypot(x, y)) {
      x = gamepadX;
      y = gamepadY;
    }

    const gamepadThrow = Boolean(gamepad.buttons[0]?.pressed);
    const gamepadBanana = Boolean(gamepad.buttons[1]?.pressed);
    const gamepadDodge = Boolean(gamepad.buttons[5]?.pressed);
    if (gamepadThrow && !lastGamepadThrow) throwQueued = true;
    if (gamepadBanana && !lastGamepadBanana) bananaQueued = true;
    if (gamepadDodge && !lastGamepadDodge) dodgeQueued = true;
    lastGamepadThrow = gamepadThrow;
    lastGamepadBanana = gamepadBanana;
    lastGamepadDodge = gamepadDodge;
  } else {
    lastGamepadThrow = false;
    lastGamepadBanana = false;
    lastGamepadDodge = false;
  }

  const length = Math.hypot(x, y);
  if (length > 1) {
    x /= length;
    y /= length;
  }
  if (length > 0.05) lastAim = { x, y };
  return { x, y };
}

function applyDeadzone(value: number) {
  const deadzone = 0.18;
  if (Math.abs(value) <= deadzone) return 0;
  return ((Math.abs(value) - deadzone) / (1 - deadzone)) * Math.sign(value);
}

function smoothPosition(entity: pc.Entity, target: pc.Vec3, responsiveness: number, dt: number) {
  const current = entity.getPosition().clone();
  current.lerp(current, target, 1 - Math.exp(-responsiveness * dt));
  entity.setPosition(current);
}

function updateLabels() {
  const cameraComponent = camera.camera;
  if (!cameraComponent) return;
  const markerWorld = new pc.Vec3();
  const markerScreen = new pc.Vec3();
  for (const visual of playerVisuals.values()) {
    markerWorld.copy(visual.entity.getPosition());
    markerWorld.y += 2.25;
    cameraComponent.worldToScreen(markerWorld, markerScreen);
    visual.label.style.transform = `translate(-50%, -100%) translate(${markerScreen.x}px, ${markerScreen.y}px)`;
    visual.label.classList.toggle("local", visual.local);
    visual.label.classList.toggle("stunned", visual.stunned);
    visual.label.classList.toggle("dodging", visual.dodging);
  }
}

function spawnImpact(message: ImpactMessage) {
  const entity = new pc.Entity(`${message.kind}-impact`);
  entity.addComponent("render", {
    type: "cylinder",
    material: message.kind === "banana" ? bananaImpactMaterial : tomatoImpactMaterial,
  });
  entity.setLocalScale(0.2, 0.035, 0.2);
  entity.setPosition(message.x, 0.04, message.y);
  app.root.addChild(entity);
  impactVisuals.push({ entity, age: 0 });
}

function tickImpacts(dt: number) {
  for (let index = impactVisuals.length - 1; index >= 0; index -= 1) {
    const visual = impactVisuals[index]!;
    visual.age += dt;
    const scale = 0.2 + visual.age * 5;
    visual.entity.setLocalScale(scale, 0.035, scale);
    if (visual.age < 0.35) continue;
    visual.entity.destroy();
    impactVisuals.splice(index, 1);
  }
}

function tickPickups(dt: number) {
  const time = performance.now() / 1000;
  for (const visual of pickupVisuals.values()) {
    if (!visual.entity.enabled) continue;
    const position = visual.entity.getPosition();
    visual.entity.setPosition(position.x, visual.baseY + Math.sin(time * 3 + visual.phase) * 0.08, position.z);
    visual.entity.rotateLocal(0, 55 * dt, 0);
  }
}

function updateNetworkLabel(phase = "playing", projectileCount = projectileVisuals.size) {
  networkLabel.textContent = `online · ${currentPlayerCount}/${GAME.maxPlayers} · ${projectileCount} tomatoes · ${currentBananaCount} bananas · ${currentPickupCount} pickups · ${smoothedPatchHz.toFixed(0)} patch/s · ${phase}`;
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

app.on("update", (dt: number) => {
  const move = readMovement();
  const localVisual = connection ? playerVisuals.get(connection.room.sessionId) : undefined;

  if (localVisual && !localVisual.stunned) {
    const current = localVisual.entity.getPosition();
    const speed = GAME.playerSpeed * (localVisual.dodging ? GAME.dodgeSpeedMultiplier : 1);
    const predicted = movePlayerWithObstacles(
      { x: current.x, y: current.z },
      move,
      dt,
      foodCourtMap.bounds,
      foodCourtMap.obstacles,
      speed,
    );
    localVisual.entity.setPosition(predicted.x, 0.9, predicted.y);

    const correctionDistance = localVisual.entity.getPosition().distance(localVisual.authoritative);
    if (correctionDistance > 2.5) {
      localVisual.entity.setPosition(localVisual.authoritative);
    } else {
      smoothPosition(localVisual.entity, localVisual.authoritative, localVisual.dodging ? 14 : 8, dt);
    }
  }

  for (const visual of playerVisuals.values()) {
    if (!visual.local) smoothPosition(visual.entity, visual.target, visual.dodging ? 20 : 14, dt);
    if (visual.stunned) {
      visual.entity.setEulerAngles(0, 0, Math.sin(performance.now() * 0.025) * 12);
      visual.entity.setLocalScale(0.95, 1.02, 0.95);
    } else if (visual.dodging) {
      visual.entity.setEulerAngles(0, 0, 0);
      visual.entity.setLocalScale(1.08, 0.9, 1.08);
    } else {
      visual.entity.setEulerAngles(0, 0, 0);
      visual.entity.setLocalScale(0.85, 1.2, 0.85);
    }
  }

  for (const visual of projectileVisuals.values()) {
    smoothPosition(visual.entity, visual.target, 24, dt);
    visual.entity.rotateLocal(240 * dt, 180 * dt, 0);
  }
  for (const entity of bananaVisuals.values()) {
    entity.rotateLocal(0, 20 * dt, 0);
  }

  tickPickups(dt);
  tickImpacts(dt);
  art.update(dt);
  updateLabels();

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
      throwPressed: throwQueued,
      bananaPressed: bananaQueued,
      dodgePressed: dodgeQueued,
    });
    throwQueued = false;
    bananaQueued = false;
    dodgeQueued = false;
  }
});

window.addEventListener("resize", () => app.resizeCanvas());

connectToMatch(`Guest-${Math.floor(Math.random() * 9000 + 1000)}`)
  .then((matchConnection) => {
    connection = matchConnection;
    networkLabel.textContent = `connected · ${connection.room.sessionId.slice(0, 6)}`;
    connection.room.onStateChange((state) => syncState(state));
    connection.room.onMessage("impact", (message: ImpactMessage) => spawnImpact(message));
    connection.room.onMessage("match_event", (message: MatchEventMessage) => handleMatchEvent(message));
    syncState(connection.room.state);
  })
  .catch((error: unknown) => {
    console.error("Unable to connect to game server", error);
    networkLabel.textContent = "server unavailable · start apps/game-server";
  });