import * as pc from "playcanvas";
import { foodCourtMap } from "@foodfight/maps";
import type { TeamName } from "@foodfight/protocol";

export type VisualQuality = "low" | "medium" | "high";

interface ArtPrototypeOptions {
  app: pc.Application;
  camera: pc.Entity;
  keyLight: pc.Entity;
  sundae: pc.Entity;
}

interface ArtPrototypeController {
  decoratePlayer(root: pc.Entity, accent: pc.Color, team: number): void;
  setObjectiveState(owner: TeamName, contested: boolean): void;
  update(dt: number): void;
  cycleQuality(): void;
  getQuality(): VisualQuality;
}

type PrimitiveType = "box" | "sphere" | "cylinder" | "cone" | "capsule";

const PALETTE = {
  floor: new pc.Color(0.2, 0.17, 0.23),
  floorInset: new pc.Color(0.28, 0.24, 0.31),
  counter: new pc.Color(0.31, 0.22, 0.35),
  counterTop: new pc.Color(0.83, 0.68, 0.48),
  wall: new pc.Color(0.14, 0.12, 0.17),
  cream: new pc.Color(0.96, 0.86, 0.66),
  pink: new pc.Color(0.96, 0.42, 0.63),
  mint: new pc.Color(0.28, 0.83, 0.69),
  blue: new pc.Color(0.16, 0.5, 1),
  red: new pc.Color(1, 0.24, 0.18),
  gold: new pc.Color(1, 0.72, 0.18),
  neutral: new pc.Color(0.78, 0.76, 0.82),
  foliage: new pc.Color(0.2, 0.55, 0.29),
};

function makeMaterial(color: pc.Color, gloss = 0.4, metalness = 0.03) {
  const value = new pc.StandardMaterial();
  value.diffuse = color;
  value.gloss = gloss;
  value.metalness = metalness;
  value.update();
  return value;
}

function addPrimitive(
  parent: pc.Entity,
  name: string,
  type: PrimitiveType,
  material: pc.Material,
  scale: [number, number, number],
  position: [number, number, number],
  euler?: [number, number, number],
) {
  const entity = new pc.Entity(name);
  entity.addComponent("render", { type, material });
  entity.setLocalScale(...scale);
  entity.setLocalPosition(...position);
  if (euler) entity.setLocalEulerAngles(...euler);
  parent.addChild(entity);
  return entity;
}

export function createArtPrototype(options: ArtPrototypeOptions): ArtPrototypeController {
  const { app, camera, keyLight, sundae } = options;
  const environmentRoot = new pc.Entity("art-prototype-environment");
  const mediumDetailRoot = new pc.Entity("medium-detail");
  const highDetailRoot = new pc.Entity("high-detail");
  environmentRoot.addChild(mediumDetailRoot);
  environmentRoot.addChild(highDetailRoot);
  app.root.addChild(environmentRoot);

  if (camera.camera) camera.camera.clearColor = new pc.Color(0.055, 0.045, 0.075);
  app.scene.ambientLight = new pc.Color(0.34, 0.3, 0.42);

  const floorInset = makeMaterial(PALETTE.floorInset, 0.3);
  const wallMaterial = makeMaterial(PALETTE.wall, 0.24);
  const counterMaterial = makeMaterial(PALETTE.counter, 0.3);
  const counterTopMaterial = makeMaterial(PALETTE.counterTop, 0.48);
  const pinkMaterial = makeMaterial(PALETTE.pink, 0.48);
  const mintMaterial = makeMaterial(PALETTE.mint, 0.45);
  const foliageMaterial = makeMaterial(PALETTE.foliage, 0.2);
  const creamMaterial = makeMaterial(PALETTE.cream, 0.52);

  // A quiet inset under the active arena separates gameplay from the decorative food court.
  addPrimitive(
    environmentRoot,
    "arena-inset",
    "box",
    floorInset,
    [foodCourtMap.width + 1, 0.12, foodCourtMap.height + 1],
    [0, -0.12, 0],
  );

  // Perimeter walls and restaurant blocks stay outside the playable bounds.
  addPrimitive(environmentRoot, "north-wall", "box", wallMaterial, [foodCourtMap.width + 7, 2.2, 0.7], [0, 1, -11]);
  addPrimitive(environmentRoot, "south-wall", "box", wallMaterial, [foodCourtMap.width + 7, 2.2, 0.7], [0, 1, 11]);
  addPrimitive(environmentRoot, "west-wall", "box", wallMaterial, [0.7, 2.2, foodCourtMap.height + 4], [-17, 1, 0]);
  addPrimitive(environmentRoot, "east-wall", "box", wallMaterial, [0.7, 2.2, foodCourtMap.height + 4], [17, 1, 0]);

  const stallXs = [-10.5, -3.5, 3.5, 10.5];
  stallXs.forEach((x, index) => {
    const stall = new pc.Entity(`north-stall-${index}`);
    stall.setLocalPosition(x, 0, -10.2);
    mediumDetailRoot.addChild(stall);
    addPrimitive(stall, "counter", "box", counterMaterial, [5.1, 1.3, 1.2], [0, 0.55, 0]);
    addPrimitive(stall, "counter-top", "box", counterTopMaterial, [5.35, 0.16, 1.45], [0, 1.23, 0]);
    addPrimitive(stall, "sign", "box", index % 2 === 0 ? pinkMaterial : mintMaterial, [3.6, 0.52, 0.18], [0, 2.25, -0.35]);
  });

  // Sparse tables and planters live in the visual perimeter, not the combat lanes.
  const tablePositions: Array<[number, number]> = [
    [-14.9, -7.7], [-14.9, 7.7], [14.9, -7.7], [14.9, 7.7],
    [-13.8, 0], [13.8, 0],
  ];
  tablePositions.forEach(([x, z], index) => {
    const prop = new pc.Entity(`perimeter-table-${index}`);
    prop.setLocalPosition(x, 0, z);
    highDetailRoot.addChild(prop);
    addPrimitive(prop, "top", "cylinder", counterTopMaterial, [1.45, 0.14, 1.45], [0, 0.72, 0]);
    addPrimitive(prop, "leg", "cylinder", wallMaterial, [0.22, 0.72, 0.22], [0, 0.32, 0]);
  });

  const planterPositions: Array<[number, number]> = [[-15.2, -4], [-15.2, 4], [15.2, -4], [15.2, 4]];
  planterPositions.forEach(([x, z], index) => {
    const planter = new pc.Entity(`planter-${index}`);
    planter.setLocalPosition(x, 0, z);
    highDetailRoot.addChild(planter);
    addPrimitive(planter, "pot", "cylinder", counterMaterial, [0.7, 0.75, 0.7], [0, 0.32, 0]);
    addPrimitive(planter, "leaves", "sphere", foliageMaterial, [1.1, 1.25, 1.1], [0, 1.18, 0]);
  });

  // Add readable trim to the existing gameplay benches without changing collision geometry.
  for (const obstacle of foodCourtMap.obstacles) {
    const obstacleEntity = app.root.findByName(obstacle.id);
    if (!obstacleEntity) continue;
    addPrimitive(
      obstacleEntity,
      `${obstacle.id}-topper`,
      "box",
      counterTopMaterial,
      [0.96, 0.12, 0.96],
      [0, 0.58, 0],
    );
  }

  // Turn the gray cylinder objective into a readable oversized sundae silhouette.
  addPrimitive(sundae, "glass-cup", "cone", creamMaterial, [0.7, 0.82, 0.7], [0, 0.58, 0], [180, 0, 0]);
  addPrimitive(sundae, "vanilla-scoop", "sphere", creamMaterial, [0.72, 0.55, 0.72], [-0.16, 1.02, 0.02]);
  addPrimitive(sundae, "berry-scoop", "sphere", pinkMaterial, [0.66, 0.52, 0.66], [0.28, 1.05, 0.04]);
  const cherry = addPrimitive(sundae, "cherry", "sphere", makeMaterial(PALETTE.red, 0.62), [0.25, 0.25, 0.25], [0.05, 1.48, 0]);
  addPrimitive(sundae, "cherry-stem", "cylinder", foliageMaterial, [0.05, 0.22, 0.05], [0.09, 1.68, 0], [0, 0, -18]);

  const ringMaterials = {
    none: makeMaterial(PALETTE.neutral, 0.45),
    blue: makeMaterial(PALETTE.blue, 0.55),
    red: makeMaterial(PALETTE.red, 0.55),
    contested: makeMaterial(PALETTE.gold, 0.58),
  };
  const ringEntities = new Map<string, pc.Entity>();
  for (const [state, ringMaterial] of Object.entries(ringMaterials)) {
    const ring = new pc.Entity(`objective-ring-${state}`);
    ring.addComponent("render", { type: "cylinder", material: ringMaterial });
    ring.setLocalScale(foodCourtMap.objective.radius * 2.08, 0.035, foodCourtMap.objective.radius * 2.08);
    ring.setPosition(foodCourtMap.objective.x, 0.025, foodCourtMap.objective.y);
    ring.enabled = state === "none";
    app.root.addChild(ring);
    ringEntities.set(state, ring);
  }

  const objectiveLight = new pc.Entity("objective-light");
  objectiveLight.addComponent("light", {
    type: "omni",
    color: PALETTE.cream,
    intensity: 1.3,
    range: 9,
    castShadows: false,
  });
  objectiveLight.setPosition(foodCourtMap.objective.x, 4.2, foodCourtMap.objective.y);
  app.root.addChild(objectiveLight);

  const fillLight = new pc.Entity("fill-light");
  fillLight.addComponent("light", {
    type: "directional",
    color: new pc.Color(0.42, 0.55, 0.86),
    intensity: 0.35,
    castShadows: false,
  });
  fillLight.setEulerAngles(70, 145, 0);
  app.root.addChild(fillLight);

  const qualityButton = document.querySelector<HTMLButtonElement>("#quality");
  let quality = readQuality();
  let activeRing = ringEntities.get("none")!;
  let elapsed = 0;

  function applyQuality(next: VisualQuality) {
    quality = next;
    mediumDetailRoot.enabled = next !== "low";
    highDetailRoot.enabled = next === "high";
    objectiveLight.enabled = next !== "low";
    fillLight.enabled = next !== "low";
    if (keyLight.light) keyLight.light.castShadows = next !== "low";
    if (qualityButton) qualityButton.textContent = `graphics · ${next}`;
    try {
      window.localStorage.setItem("foodfight.visualQuality", next);
    } catch {
      // Storage can be unavailable in privacy modes; quality still works for the session.
    }
  }

  function cycleQuality() {
    const next: Record<VisualQuality, VisualQuality> = { low: "medium", medium: "high", high: "low" };
    applyQuality(next[quality]);
  }

  qualityButton?.addEventListener("click", cycleQuality);
  window.addEventListener("keydown", (event) => {
    if (event.repeat || event.code !== "KeyG") return;
    cycleQuality();
  });
  applyQuality(quality);

  function setObjectiveState(owner: TeamName, contested: boolean) {
    const state = contested ? "contested" : owner;
    for (const ring of ringEntities.values()) ring.enabled = false;
    activeRing = ringEntities.get(state) ?? ringEntities.get("none")!;
    activeRing.enabled = true;
  }

  function decoratePlayer(root: pc.Entity, accent: pc.Color, team: number) {
    const accentMaterial = makeMaterial(accent, 0.42);
    const skinMaterial = makeMaterial(new pc.Color(0.92, 0.68, 0.52), 0.34);
    const whiteMaterial = makeMaterial(new pc.Color(0.96, 0.93, 0.9), 0.28);
    const shoeMaterial = makeMaterial(new pc.Color(0.08, 0.065, 0.09), 0.28);
    const teamMaterial = makeMaterial(team === 0 ? PALETTE.blue : PALETTE.red, 0.5);

    addPrimitive(root, "head", "sphere", skinMaterial, [0.72, 0.72, 0.72], [0, 0.75, 0]);
    addPrimitive(root, "apron", "box", whiteMaterial, [0.72, 0.68, 0.24], [0, 0.03, -0.42]);
    addPrimitive(root, "hat-band", "cylinder", accentMaterial, [0.62, 0.18, 0.62], [0, 1.22, 0]);
    addPrimitive(root, "hat-puff-a", "sphere", whiteMaterial, [0.46, 0.34, 0.46], [-0.22, 1.45, 0]);
    addPrimitive(root, "hat-puff-b", "sphere", whiteMaterial, [0.5, 0.38, 0.5], [0.18, 1.48, 0.02]);
    addPrimitive(root, "shoe-left", "sphere", shoeMaterial, [0.42, 0.23, 0.58], [-0.34, -0.75, -0.08]);
    addPrimitive(root, "shoe-right", "sphere", shoeMaterial, [0.42, 0.23, 0.58], [0.34, -0.75, -0.08]);
    addPrimitive(root, "team-ring", "cylinder", teamMaterial, [1.16, 0.045, 1.16], [0, -0.79, 0]);
  }

  return {
    decoratePlayer,
    setObjectiveState,
    update(dt: number) {
      elapsed += dt;
      const pulse = 1 + Math.sin(elapsed * 4.5) * 0.035;
      activeRing.setLocalScale(
        foodCourtMap.objective.radius * 2.08 * pulse,
        0.035,
        foodCourtMap.objective.radius * 2.08 * pulse,
      );
      cherry.rotateLocal(0, 45 * dt, 0);
    },
    cycleQuality,
    getQuality: () => quality,
  };
}

function readQuality(): VisualQuality {
  try {
    const stored = window.localStorage.getItem("foodfight.visualQuality");
    if (stored === "low" || stored === "medium" || stored === "high") return stored;
  } catch {
    // Ignore storage failures.
  }
  return "medium";
}
