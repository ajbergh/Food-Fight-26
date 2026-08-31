import * as pc from "playcanvas";
import { foodCourtMap } from "@foodfight/maps";

type PrimitiveType = "box" | "sphere" | "cylinder" | "cone" | "capsule";

interface ArenaDetailOptions {
  app: pc.Application;
  mediumDetailRoot: pc.Entity;
  highDetailRoot: pc.Entity;
}

const C = {
  floor: new pc.Color(0.3, 0.26, 0.35),
  floorAccent: new pc.Color(0.38, 0.32, 0.43),
  wall: new pc.Color(0.23, 0.18, 0.28),
  metal: new pc.Color(0.58, 0.61, 0.67),
  wood: new pc.Color(0.5, 0.3, 0.17),
  cream: new pc.Color(0.96, 0.87, 0.68),
  red: new pc.Color(0.94, 0.12, 0.08),
  yellow: new pc.Color(1, 0.67, 0.05),
  mint: new pc.Color(0.24, 0.8, 0.66),
  aqua: new pc.Color(0.13, 0.67, 0.82),
  pink: new pc.Color(0.96, 0.38, 0.6),
  purple: new pc.Color(0.53, 0.32, 0.75),
  green: new pc.Color(0.2, 0.56, 0.3),
  dark: new pc.Color(0.08, 0.07, 0.1),
  white: new pc.Color(0.96, 0.94, 0.9),
};

function material(color: pc.Color, gloss = 0.35, metalness = 0.02, emissive = false) {
  const value = new pc.StandardMaterial();
  value.diffuse = new pc.Color(color.r, color.g, color.b, color.a);
  value.gloss = gloss;
  value.metalness = metalness;
  if (emissive) {
    value.emissive = new pc.Color(color.r, color.g, color.b, color.a);
    value.emissiveIntensity = 1.2;
  }
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

function kiosk(
  parent: pc.Entity,
  name: string,
  x: number,
  accent: pc.Material,
  body: pc.Material,
  metal: pc.Material,
  cream: pc.Material,
  dark: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, 10.5);
  root.setLocalEulerAngles(0, 180, 0);
  parent.addChild(root);
  primitive(root, "body", "box", body, [5.25, 2.6, 1.55], [0, 1.25, 0.45]);
  primitive(root, "counter", "box", metal, [5.5, 0.18, 1.85], [0, 1.28, -0.25]);
  primitive(root, "service-window", "box", dark, [3.9, 1.1, 0.08], [0, 2.25, -0.36]);
  primitive(root, "header", "box", accent, [4.65, 0.52, 0.16], [0, 3.18, -0.34]);
  primitive(root, "awning", "box", cream, [5.35, 0.16, 1.05], [0, 3.62, -0.06], [-8, 0, 0]);
  primitive(root, "menu", "box", dark, [2.7, 0.68, 0.08], [0, 2.25, 0.29]);
}

function booth(parent: pc.Entity, x: number, z: number, facing: number, seat: pc.Material, wood: pc.Material) {
  const root = new pc.Entity(`booth-${x}-${z}`);
  root.setLocalPosition(x, 0, z);
  root.setLocalEulerAngles(0, facing, 0);
  parent.addChild(root);
  primitive(root, "bench", "box", seat, [2.7, 1.05, 0.75], [0, 0.52, 0.48]);
  primitive(root, "table", "box", wood, [2.35, 0.12, 1.05], [0, 0.72, -0.55]);
}

function tableCluster(parent: pc.Entity, x: number, z: number, top: pc.Material, metal: pc.Material, seat: pc.Material, index: number) {
  const root = new pc.Entity(`table-cluster-${index}`);
  root.setLocalPosition(x, 0, z);
  parent.addChild(root);
  primitive(root, "top", "cylinder", top, [1.22, 0.11, 1.22], [0, 0.74, 0]);
  primitive(root, "pedestal", "cylinder", metal, [0.17, 0.68, 0.17], [0, 0.35, 0]);
  primitive(root, "chair-a", "box", seat, [0.72, 0.68, 0.72], [1.23, 0.36, 0]);
  primitive(root, "chair-b", "box", seat, [0.72, 0.68, 0.72], [-1.23, 0.36, 0]);
}

function utilityStation(parent: pc.Entity, name: string, x: number, z: number, body: pc.Material, accent: pc.Material, dark: pc.Material) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, z);
  parent.addChild(root);
  primitive(root, "body", "box", body, [1.35, 1.65, 0.8], [0, 0.78, 0]);
  primitive(root, "face", "box", accent, [0.95, 0.78, 0.06], [0, 1.08, -0.43]);
  primitive(root, "slot", "box", dark, [0.62, 0.15, 0.06], [0, 0.38, -0.43]);
}

export function createArenaDetail(options: ArenaDetailOptions) {
  const { mediumDetailRoot, highDetailRoot } = options;

  const floor = material(C.floor, 0.2);
  const floorAccent = material(C.floorAccent, 0.22);
  const wall = material(C.wall, 0.28);
  const metal = material(C.metal, 0.72, 0.38);
  const wood = material(C.wood, 0.34);
  const cream = material(C.cream, 0.42);
  const red = material(C.red, 0.45);
  const yellow = material(C.yellow, 0.44);
  const mint = material(C.mint, 0.42);
  const aqua = material(C.aqua, 0.48, 0.05, true);
  const pink = material(C.pink, 0.48, 0.05, true);
  const purple = material(C.purple, 0.4);
  const green = material(C.green, 0.28);
  const dark = material(C.dark, 0.12);
  const white = material(C.white, 0.4);

  // Two broad concourse slabs establish a tiled mall floor without hundreds of individual tiles.
  primitive(highDetailRoot, "north-concourse", "box", floor, [30, 0.035, 2.35], [0, -0.02, -10.15]);
  primitive(highDetailRoot, "south-concourse", "box", floorAccent, [30, 0.035, 2.35], [0, -0.02, 10.15]);
  for (const x of [-12, -8, -4, 0, 4, 8, 12]) {
    primitive(highDetailRoot, `north-tile-line-${x}`, "box", floorAccent, [0.055, 0.038, 2.3], [x, -0.002, -10.15]);
    primitive(highDetailRoot, `south-tile-line-${x}`, "box", floor, [0.055, 0.038, 2.3], [x, -0.002, 10.15]);
  }

  // Repeating wall bays break up the box-shaped arena at medium quality.
  for (const z of [-10.72, 10.72]) {
    for (const x of [-12, -4, 4, 12]) {
      primitive(mediumDetailRoot, `wall-bay-${x}-${z}`, "box", wall, [6.8, 1.7, 0.12], [x, 1.2, z]);
      primitive(mediumDetailRoot, `wall-column-${x}-${z}`, "box", metal, [0.16, 2.4, 0.18], [x - 3.55, 1.25, z]);
    }
  }

  kiosk(mediumDetailRoot, "pizza-kiosk", -9, red, purple, metal, cream, dark);
  kiosk(mediumDetailRoot, "burger-kiosk", 0, yellow, wall, metal, cream, dark);
  kiosk(mediumDetailRoot, "shake-kiosk", 9, mint, purple, metal, cream, dark);

  // Booths and tables remain outside the authoritative x/z limits, so they never imply collision that does not exist.
  for (const side of [-1, 1] as const) {
    const x = side * 15.35;
    for (const z of [-5.7, 0, 5.7]) {
      booth(highDetailRoot, x, z, side < 0 ? 90 : -90, side < 0 ? pink : aqua, wood);
    }
  }

  const tables: Array<[number, number]> = [
    [-15.05, -8], [-15.05, 8], [15.05, -8], [15.05, 8],
    [-6.4, -10.1], [6.4, -10.1], [-6.4, 10.1], [6.4, 10.1],
  ];
  tables.forEach(([x, z], index) => tableCluster(highDetailRoot, x, z, cream, metal, index % 2 === 0 ? pink : aqua, index));

  utilityStation(highDetailRoot, "vending-west", -15.45, 2.2, wall, aqua, dark);
  utilityStation(highDetailRoot, "vending-east", 15.45, -2.2, wall, pink, dark);
  utilityStation(highDetailRoot, "recycling-west", -15.45, -2.2, wall, green, dark);
  utilityStation(highDetailRoot, "recycling-east", 15.45, 2.2, wall, green, dark);

  // Condiment silhouettes provide recognizable food-court clutter at almost no visual ambiguity.
  for (const [x, z, rotation] of [[-14.6, -5.1, 90], [14.6, 5.1, -90]] as const) {
    const station = new pc.Entity(`condiment-${x}-${z}`);
    station.setLocalPosition(x, 0, z);
    station.setLocalEulerAngles(0, rotation, 0);
    highDetailRoot.addChild(station);
    primitive(station, "cabinet", "box", wall, [1.45, 1.05, 0.72], [0, 0.5, 0]);
    primitive(station, "ketchup", "cylinder", red, [0.16, 0.48, 0.16], [-0.24, 1.25, 0]);
    primitive(station, "mustard", "cylinder", yellow, [0.16, 0.48, 0.16], [0.24, 1.25, 0]);
  }

  // Large landmark sign: readable at gameplay camera distance and cheap enough for medium quality.
  const sign = new pc.Entity("food-fight-landmark-sign");
  sign.setLocalPosition(0, 0, -9.5);
  mediumDetailRoot.addChild(sign);
  primitive(sign, "beam-left", "box", metal, [0.18, 2.65, 0.18], [-4.25, 2.35, 0]);
  primitive(sign, "beam-right", "box", metal, [0.18, 2.65, 0.18], [4.25, 2.35, 0]);
  primitive(sign, "panel", "box", dark, [8.75, 1.22, 0.28], [0, 4.15, 0]);
  primitive(sign, "neon-left", "box", pink, [3.55, 0.17, 0.08], [-2.02, 4.17, -0.18]);
  primitive(sign, "neon-right", "box", aqua, [3.55, 0.17, 0.08], [2.02, 4.17, -0.18]);
  primitive(sign, "food-disc", "cylinder", yellow, [0.58, 0.16, 0.58], [0, 4.17, -0.2], [90, 0, 0]);

  // Chunky counter-food silhouettes survive the pulled-back camera better than small realistic props.
  const displays: Array<[number, pc.Material, "sphere" | "cylinder"]> = [
    [-9.7, red, "sphere"], [-8.4, cream, "sphere"], [-0.65, yellow, "sphere"],
    [0.65, green, "sphere"], [8.55, pink, "cylinder"], [9.75, mint, "cylinder"],
  ];
  displays.forEach(([x, mat, type], index) => {
    const item = primitive(highDetailRoot, `counter-food-${index}`, type, mat, type === "cylinder" ? [0.3, 0.56, 0.3] : [0.45, 0.34, 0.45], [x, 1.55, 9.45]);
    if (type === "cylinder") primitive(item, "straw", "cylinder", white, [0.045, 0.48, 0.045], [0.08, 0.48, 0], [0, 0, -12]);
  });

  // A few emissive ceiling cards imply the larger mall ceiling without dynamic-light cost.
  for (const x of [-9, -3, 3, 9]) {
    primitive(highDetailRoot, `ceiling-north-${x}`, "box", white, [3.2, 0.05, 0.48], [x, 5.4, -8.8]);
    primitive(highDetailRoot, `ceiling-south-${x}`, "box", white, [3.2, 0.05, 0.48], [x, 5.4, 8.8]);
  }

  return { playableBounds: foodCourtMap.bounds };
}
