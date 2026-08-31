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
    value.emissiveIntensity = 1.15;
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
  dark: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, 10.55);
  root.setLocalEulerAngles(0, 180, 0);
  parent.addChild(root);
  primitive(root, "body", "box", body, [5.3, 2.8, 1.45], [0, 1.32, 0.48]);
  primitive(root, "counter", "box", metal, [5.55, 0.18, 1.8], [0, 1.3, -0.24]);
  primitive(root, "window", "box", dark, [3.9, 1.08, 0.08], [0, 2.25, -0.32]);
  primitive(root, "header", "box", accent, [4.75, 0.56, 0.18], [0, 3.24, -0.3]);
}

function seatingCluster(
  parent: pc.Entity,
  name: string,
  x: number,
  z: number,
  rotation: number,
  seat: pc.Material,
  table: pc.Material,
  metal: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, z);
  root.setLocalEulerAngles(0, rotation, 0);
  parent.addChild(root);
  primitive(root, "booth", "box", seat, [2.5, 1, 0.72], [0, 0.5, 0.62]);
  primitive(root, "table", "box", table, [2.2, 0.12, 1.08], [0, 0.72, -0.45]);
  primitive(root, "table-base", "box", metal, [0.22, 0.68, 0.6], [0, 0.35, -0.45]);
}

function utilityStation(
  parent: pc.Entity,
  name: string,
  x: number,
  z: number,
  rotation: number,
  body: pc.Material,
  accent: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, z);
  root.setLocalEulerAngles(0, rotation, 0);
  parent.addChild(root);
  primitive(root, "body", "box", body, [1.35, 1.75, 0.82], [0, 0.84, 0]);
  primitive(root, "face", "box", accent, [0.95, 0.9, 0.06], [0, 1.08, -0.44]);
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
  const aqua = material(C.aqua, 0.45, 0.04, true);
  const pink = material(C.pink, 0.45, 0.04, true);
  const purple = material(C.purple, 0.4);
  const green = material(C.green, 0.28);
  const dark = material(C.dark, 0.12);
  const white = material(C.white, 0.4);

  // Medium quality: large architectural masses only. These establish place without increasing combat clutter.
  primitive(mediumDetailRoot, "north-wall-band", "box", wall, [30, 1.8, 0.16], [0, 1.25, -10.7]);
  primitive(mediumDetailRoot, "south-wall-band", "box", wall, [30, 1.8, 0.16], [0, 1.25, 10.7]);
  for (const x of [-13.4, -9, -4.5, 0, 4.5, 9, 13.4]) {
    primitive(mediumDetailRoot, `north-column-${x}`, "box", metal, [0.16, 2.5, 0.2], [x, 1.3, -10.55]);
  }

  kiosk(mediumDetailRoot, "pizza-kiosk", -9, red, purple, metal, dark);
  kiosk(mediumDetailRoot, "burger-kiosk", 0, yellow, wall, metal, dark);
  kiosk(mediumDetailRoot, "shake-kiosk", 9, mint, purple, metal, dark);

  const sign = new pc.Entity("food-fight-landmark-sign");
  sign.setLocalPosition(0, 0, -9.48);
  mediumDetailRoot.addChild(sign);
  primitive(sign, "beam-left", "box", metal, [0.18, 2.6, 0.18], [-4.2, 2.35, 0]);
  primitive(sign, "beam-right", "box", metal, [0.18, 2.6, 0.18], [4.2, 2.35, 0]);
  primitive(sign, "panel", "box", dark, [8.7, 1.2, 0.28], [0, 4.12, 0]);
  primitive(sign, "neon-left", "box", pink, [3.55, 0.17, 0.08], [-2.02, 4.14, -0.18]);
  primitive(sign, "neon-right", "box", aqua, [3.55, 0.17, 0.08], [2.02, 4.14, -0.18]);

  // High quality: broad floor detail rather than a grid of individual tile meshes.
  primitive(highDetailRoot, "north-concourse", "box", floor, [30, 0.035, 2.25], [0, -0.02, -10.1]);
  primitive(highDetailRoot, "south-concourse", "box", floorAccent, [30, 0.035, 2.25], [0, -0.02, 10.1]);
  for (const x of [-12, -8, -4, 0, 4, 8, 12]) {
    primitive(highDetailRoot, `north-tile-line-${x}`, "box", floorAccent, [0.05, 0.038, 2.2], [x, -0.002, -10.1]);
  }

  // Four readable furniture clusters suggest a full food court without filling the renderer with tiny chair parts.
  seatingCluster(highDetailRoot, "seating-nw", -15.15, -6.2, 90, pink, wood, metal);
  seatingCluster(highDetailRoot, "seating-sw", -15.15, 6.2, 90, pink, wood, metal);
  seatingCluster(highDetailRoot, "seating-ne", 15.15, -6.2, -90, aqua, wood, metal);
  seatingCluster(highDetailRoot, "seating-se", 15.15, 6.2, -90, aqua, wood, metal);

  utilityStation(highDetailRoot, "vending-west", -15.45, 1.8, 90, wall, aqua);
  utilityStation(highDetailRoot, "recycling-west", -15.45, -2.3, 90, wall, green);
  utilityStation(highDetailRoot, "vending-east", 15.45, -1.8, -90, wall, pink);
  utilityStation(highDetailRoot, "recycling-east", 15.45, 2.3, -90, wall, green);

  // Large, chunky food silhouettes survive the gameplay camera and are cheaper than detailed prop sets.
  const displays: Array<[number, pc.Material, "sphere" | "cylinder"]> = [
    [-9.7, red, "sphere"],
    [-8.5, cream, "sphere"],
    [-0.6, yellow, "sphere"],
    [0.65, green, "sphere"],
    [8.6, pink, "cylinder"],
    [9.75, mint, "cylinder"],
  ];
  displays.forEach(([x, mat, type], index) => {
    primitive(
      highDetailRoot,
      `counter-food-${index}`,
      type,
      mat,
      type === "cylinder" ? [0.3, 0.56, 0.3] : [0.45, 0.34, 0.45],
      [x, 1.55, 9.45],
    );
  });

  for (const x of [-8, -2.7, 2.7, 8]) {
    primitive(highDetailRoot, `ceiling-card-${x}`, "box", white, [3.3, 0.05, 0.48], [x, 5.35, 8.65]);
  }

  return { playableBounds: foodCourtMap.bounds };
}
