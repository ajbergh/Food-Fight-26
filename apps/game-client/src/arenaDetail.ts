import * as pc from "playcanvas";
import { foodCourtMap } from "@foodfight/maps";

type PrimitiveType = "box" | "sphere" | "cylinder";

interface ArenaDetailOptions {
  app: pc.Application;
  mediumDetailRoot: pc.Entity;
  highDetailRoot: pc.Entity;
}

const C = {
  shell: new pc.Color(0.055, 0.045, 0.072),
  floor: new pc.Color(0.24, 0.205, 0.285),
  floorAccent: new pc.Color(0.33, 0.285, 0.38),
  wall: new pc.Color(0.17, 0.125, 0.205),
  wallDeep: new pc.Color(0.085, 0.065, 0.11),
  metal: new pc.Color(0.48, 0.5, 0.57),
  cream: new pc.Color(0.96, 0.84, 0.62),
  warmWhite: new pc.Color(1, 0.94, 0.82),
  red: new pc.Color(0.96, 0.16, 0.1),
  yellow: new pc.Color(1, 0.66, 0.04),
  mint: new pc.Color(0.19, 0.84, 0.68),
  aqua: new pc.Color(0.08, 0.67, 0.86),
  pink: new pc.Color(0.98, 0.29, 0.57),
  purple: new pc.Color(0.48, 0.25, 0.72),
  green: new pc.Color(0.12, 0.48, 0.25),
  dark: new pc.Color(0.035, 0.03, 0.05),
};

function colorCopy(color: pc.Color) {
  return new pc.Color(color.r, color.g, color.b, color.a);
}

function material(color: pc.Color, gloss = 0.34, metalness = 0.02, emissive?: pc.Color) {
  const value = new pc.StandardMaterial();
  value.diffuse = colorCopy(color);
  value.gloss = gloss;
  value.metalness = metalness;
  if (emissive) value.emissive = colorCopy(emissive);
  value.update();
  return value;
}

function primitive(
  parent: pc.Entity,
  name: string,
  type: PrimitiveType,
  mat: pc.Material,
  scale: [number, number, number],
  position: [number, number, number],
  euler?: [number, number, number],
) {
  const entity = new pc.Entity(name);
  entity.addComponent("render", { type, material: mat });
  if (entity.render) {
    entity.render.castShadows = false;
    entity.render.receiveShadows = false;
  }
  entity.setLocalScale(...scale);
  entity.setLocalPosition(...position);
  if (euler) entity.setLocalEulerAngles(...euler);
  parent.addChild(entity);
  return entity;
}

function storefront(
  parent: pc.Entity,
  name: string,
  x: number,
  accent: pc.Material,
  secondary: pc.Material,
  body: pc.Material,
  dark: pc.Material,
  metal: pc.Material,
  warmLight: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, 10.5);
  root.setLocalEulerAngles(0, 180, 0);
  parent.addChild(root);

  primitive(root, "body", "box", body, [5.45, 2.95, 1.6], [0, 1.38, 0.52]);
  primitive(root, "service-window", "box", dark, [4.05, 1.08, 0.1], [0, 2.2, -0.33]);
  primitive(root, "counter-rail", "box", metal, [4.45, 0.15, 0.34], [0, 1.53, -0.46]);
  primitive(root, "header", "box", accent, [4.92, 0.62, 0.2], [0, 3.3, -0.31]);
  primitive(root, "header-rule", "box", secondary, [3.45, 0.08, 0.05], [0, 3.31, -0.44]);
  primitive(root, "service-glow", "box", warmLight, [3.55, 0.06, 0.05], [0, 2.65, -0.45]);
}

export function createArenaDetail(options: ArenaDetailOptions) {
  const { mediumDetailRoot, highDetailRoot } = options;

  const shell = material(C.shell, 0.12);
  const floor = material(C.floor, 0.22);
  const floorAccent = material(C.floorAccent, 0.24);
  const wall = material(C.wall, 0.3);
  const wallDeep = material(C.wallDeep, 0.18);
  const metal = material(C.metal, 0.7, 0.34);
  const cream = material(C.cream, 0.48);
  const red = material(C.red, 0.52);
  const yellow = material(C.yellow, 0.5);
  const mint = material(C.mint, 0.48);
  const aqua = material(C.aqua, 0.5);
  const pink = material(C.pink, 0.5);
  const purple = material(C.purple, 0.42);
  const green = material(C.green, 0.26);
  const dark = material(C.dark, 0.12);
  const warmLight = material(C.warmWhite, 0.3, 0, C.warmWhite);
  const neonPink = material(C.pink, 0.32, 0, C.pink);
  const neonAqua = material(C.aqua, 0.32, 0, C.aqua);
  const neonYellow = material(C.yellow, 0.32, 0, C.yellow);

  // A dark architectural slab outside the authoritative arena removes the "floating board in black space" read.
  // It is presentation-only and deliberately sits below all gameplay geometry.
  primitive(mediumDetailRoot, "mall-shell", "box", shell, [foodCourtMap.width + 10, 0.32, foodCourtMap.height + 8], [0, -0.48, 0]);
  primitive(mediumDetailRoot, "north-concourse-deck", "box", floor, [foodCourtMap.width + 5.5, 0.08, 3.1], [0, -0.08, -10.45]);
  primitive(mediumDetailRoot, "south-concourse-deck", "box", floorAccent, [foodCourtMap.width + 5.5, 0.08, 3.1], [0, -0.08, 10.45]);

  // Layered walls, pilasters, and light rails create depth without expensive mesh density.
  primitive(mediumDetailRoot, "north-wall-band", "box", wall, [30.8, 1.9, 0.2], [0, 1.3, -10.82]);
  primitive(mediumDetailRoot, "south-wall-band", "box", wall, [30.8, 1.9, 0.2], [0, 1.3, 10.82]);
  primitive(mediumDetailRoot, "north-soffit", "box", wallDeep, [31.4, 0.48, 0.58], [0, 3.35, -10.67]);
  primitive(mediumDetailRoot, "south-soffit", "box", wallDeep, [31.4, 0.48, 0.58], [0, 3.35, 10.67]);

  for (const x of [-13.6, -6.8, 0, 6.8, 13.6]) {
    primitive(mediumDetailRoot, `north-pilaster-${x}`, "box", metal, [0.28, 3.15, 0.36], [x, 1.52, -10.52]);
  }

  // South-facing storefronts become the main environmental hero silhouettes.
  storefront(mediumDetailRoot, "pizza-kiosk", -9, red, cream, purple, dark, metal, warmLight);
  storefront(mediumDetailRoot, "burger-kiosk", 0, yellow, red, wall, dark, metal, warmLight);
  storefront(mediumDetailRoot, "shake-kiosk", 9, mint, pink, purple, dark, metal, warmLight);

  // Big signage and rails read at gameplay distance and mimic emissive mall signage without extra dynamic lights.
  primitive(mediumDetailRoot, "landmark-panel", "box", dark, [9.5, 1.25, 0.34], [0, 4.25, -9.45]);
  primitive(mediumDetailRoot, "landmark-pink", "box", neonPink, [3.7, 0.17, 0.07], [-2.15, 4.28, -9.67]);
  primitive(mediumDetailRoot, "landmark-aqua", "box", neonAqua, [3.7, 0.17, 0.07], [2.15, 4.28, -9.67]);
  primitive(mediumDetailRoot, "north-light-rail", "box", warmLight, [25.2, 0.055, 0.07], [0, 3.04, -10.42]);
  primitive(mediumDetailRoot, "south-light-rail", "box", warmLight, [25.2, 0.055, 0.07], [0, 3.04, 10.42]);

  // Team-colored side portals frame the board and provide fast left/right orientation from the pulled-back camera.
  primitive(mediumDetailRoot, "west-portal", "box", wallDeep, [0.75, 2.7, 5.1], [-17.25, 1.18, 0]);
  primitive(mediumDetailRoot, "east-portal", "box", wallDeep, [0.75, 2.7, 5.1], [17.25, 1.18, 0]);
  primitive(mediumDetailRoot, "west-portal-light", "box", neonAqua, [0.09, 1.85, 3.7], [-16.84, 1.42, 0]);
  primitive(mediumDetailRoot, "east-portal-light", "box", neonPink, [0.09, 1.85, 3.7], [16.84, 1.42, 0]);

  // High quality adds broad patterning and chunky silhouettes only; no micro-geometry or extra lights.
  for (const x of [-10, -5, 5, 10]) {
    primitive(highDetailRoot, `north-floor-inlay-${x}`, "box", metal, [0.055, 0.04, 2.45], [x, -0.005, -10.25]);
  }
  primitive(highDetailRoot, "south-floor-inlay-west", "box", neonPink, [7.2, 0.035, 0.07], [-7.4, -0.002, 9.12]);
  primitive(highDetailRoot, "south-floor-inlay-east", "box", neonAqua, [7.2, 0.035, 0.07], [7.4, -0.002, 9.12]);

  // Booth masses gain darker plinths and luminous backs, reading as designed furniture without chair-leg draw-call cost.
  for (const [x, z, rotation, seat, glow] of [
    [-15.2, -6.2, 90, pink, neonPink],
    [-15.2, 6.2, 90, pink, neonPink],
    [15.2, -6.2, -90, aqua, neonAqua],
    [15.2, 6.2, -90, aqua, neonAqua],
  ] as Array<[number, number, number, pc.Material, pc.Material]>) {
    const root = new pc.Entity(`booth-${x}-${z}`);
    root.setLocalPosition(x, 0, z);
    root.setLocalEulerAngles(0, rotation, 0);
    highDetailRoot.addChild(root);
    primitive(root, "plinth", "box", wallDeep, [3.0, 0.22, 1.02], [0, 0.11, 0]);
    primitive(root, "seat", "box", seat, [2.75, 0.92, 0.82], [0, 0.55, 0]);
    primitive(root, "back-glow", "box", glow, [2.35, 0.08, 0.05], [0, 0.92, -0.43]);
  }

  primitive(highDetailRoot, "vending-west", "box", aqua, [0.88, 2.55, 1.38], [-15.35, 1.22, 1.7], [0, 90, 0]);
  primitive(highDetailRoot, "recycling-west", "box", green, [0.88, 1.5, 1.38], [-15.35, 0.72, -2.2], [0, 90, 0]);
  primitive(highDetailRoot, "vending-east", "box", pink, [0.88, 2.55, 1.38], [15.35, 1.22, -1.7], [0, -90, 0]);
  primitive(highDetailRoot, "recycling-east", "box", green, [0.88, 1.5, 1.38], [15.35, 0.72, 2.2], [0, -90, 0]);

  // Counter-display silhouettes add recognizable food cues while keeping the arena floor quiet.
  primitive(highDetailRoot, "display-pizza", "sphere", red, [0.5, 0.34, 0.5], [-9.4, 1.55, 9.45]);
  primitive(highDetailRoot, "display-burger", "sphere", yellow, [0.52, 0.36, 0.52], [-0.4, 1.55, 9.45]);
  primitive(highDetailRoot, "display-lettuce", "sphere", green, [0.44, 0.34, 0.44], [0.75, 1.55, 9.45]);
  primitive(highDetailRoot, "display-shake", "cylinder", mint, [0.34, 0.6, 0.34], [9.2, 1.58, 9.45]);

  // A sparse implied ceiling gives the scene an indoor commercial-space read without actually closing the camera in.
  primitive(highDetailRoot, "ceiling-rib-west", "box", metal, [10.5, 0.08, 0.12], [-9.0, 5.42, 0]);
  primitive(highDetailRoot, "ceiling-rib-east", "box", metal, [10.5, 0.08, 0.12], [9.0, 5.42, 0]);
  primitive(highDetailRoot, "ceiling-card-west", "box", warmLight, [6.2, 0.055, 0.52], [-6.7, 5.35, 8.55]);
  primitive(highDetailRoot, "ceiling-card-center", "box", neonYellow, [4.4, 0.055, 0.38], [0, 5.35, 8.55]);
  primitive(highDetailRoot, "ceiling-card-east", "box", warmLight, [6.2, 0.055, 0.52], [6.7, 5.35, 8.55]);

  return { playableBounds: foodCourtMap.bounds };
}
