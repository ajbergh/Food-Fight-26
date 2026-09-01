import * as pc from "playcanvas";
import { foodCourtMap } from "@foodfight/maps";

type PrimitiveType = "box" | "sphere" | "cylinder";

interface ArenaDetailOptions {
  app: pc.Application;
  mediumDetailRoot: pc.Entity;
  highDetailRoot: pc.Entity;
}

const C = {
  floor: new pc.Color(0.3, 0.26, 0.35),
  floorAccent: new pc.Color(0.39, 0.33, 0.44),
  wall: new pc.Color(0.23, 0.18, 0.28),
  metal: new pc.Color(0.58, 0.61, 0.67),
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

function material(color: pc.Color, gloss = 0.34, metalness = 0.02) {
  const value = new pc.StandardMaterial();
  value.diffuse = new pc.Color(color.r, color.g, color.b, color.a);
  value.gloss = gloss;
  value.metalness = metalness;
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
  dark: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, 10.55);
  root.setLocalEulerAngles(0, 180, 0);
  parent.addChild(root);
  primitive(root, "body", "box", body, [5.3, 2.85, 1.45], [0, 1.34, 0.48]);
  primitive(root, "window", "box", dark, [3.9, 1.12, 0.08], [0, 2.25, -0.32]);
  primitive(root, "header", "box", accent, [4.75, 0.58, 0.18], [0, 3.26, -0.3]);
}

export function createArenaDetail(options: ArenaDetailOptions) {
  const { mediumDetailRoot, highDetailRoot } = options;

  const floor = material(C.floor, 0.2);
  const floorAccent = material(C.floorAccent, 0.22);
  const wall = material(C.wall, 0.28);
  const metal = material(C.metal, 0.66, 0.3);
  const cream = material(C.cream, 0.42);
  const red = material(C.red, 0.45);
  const yellow = material(C.yellow, 0.44);
  const mint = material(C.mint, 0.42);
  const aqua = material(C.aqua, 0.44);
  const pink = material(C.pink, 0.44);
  const purple = material(C.purple, 0.4);
  const green = material(C.green, 0.28);
  const dark = material(C.dark, 0.12);
  const white = material(C.white, 0.4);

  // Medium quality carries the important architectural storytelling with only a small number of draw calls.
  primitive(mediumDetailRoot, "north-wall-band", "box", wall, [30, 1.8, 0.16], [0, 1.25, -10.7]);
  primitive(mediumDetailRoot, "south-wall-band", "box", wall, [30, 1.8, 0.16], [0, 1.25, 10.7]);
  kiosk(mediumDetailRoot, "pizza-kiosk", -9, red, purple, dark);
  kiosk(mediumDetailRoot, "burger-kiosk", 0, yellow, wall, dark);
  kiosk(mediumDetailRoot, "shake-kiosk", 9, mint, purple, dark);

  // A large landmark sign provides orientation from the pulled-back camera without micro-geometry.
  primitive(mediumDetailRoot, "landmark-panel", "box", dark, [8.8, 1.2, 0.28], [0, 4.12, -9.48]);
  primitive(mediumDetailRoot, "landmark-pink", "box", pink, [3.6, 0.18, 0.08], [-2.05, 4.14, -9.66]);
  primitive(mediumDetailRoot, "landmark-aqua", "box", aqua, [3.6, 0.18, 0.08], [2.05, 4.14, -9.66]);

  // High quality adds broad floor patterning and a few chunky silhouettes. It intentionally avoids chair legs,
  // dense tile meshes, extra lights, and other small objects that punish software-rendered browsers.
  primitive(highDetailRoot, "north-concourse", "box", floor, [30, 0.035, 2.25], [0, -0.02, -10.1]);
  primitive(highDetailRoot, "south-concourse", "box", floorAccent, [30, 0.035, 2.25], [0, -0.02, 10.1]);
  for (const x of [-9, -3, 3, 9]) {
    primitive(highDetailRoot, `floor-stripe-${x}`, "box", metal, [0.05, 0.038, 2.18], [x, -0.001, -10.1]);
  }

  // Seating reads as booth masses at gameplay distance; tables are implied rather than modeled separately.
  for (const [x, z, rotation, seat] of [
    [-15.2, -6.2, 90, pink],
    [-15.2, 6.2, 90, pink],
    [15.2, -6.2, -90, aqua],
    [15.2, 6.2, -90, aqua],
  ] as Array<[number, number, number, pc.Material]>) {
    primitive(highDetailRoot, `booth-${x}-${z}`, "box", seat, [2.7, 1.05, 0.82], [x, 0.52, z], [0, rotation, 0]);
  }

  primitive(highDetailRoot, "vending-west", "box", aqua, [0.85, 2.5, 1.35], [-15.35, 1.22, 1.7], [0, 90, 0]);
  primitive(highDetailRoot, "recycling-west", "box", green, [0.85, 1.5, 1.35], [-15.35, 0.72, -2.2], [0, 90, 0]);
  primitive(highDetailRoot, "vending-east", "box", pink, [0.85, 2.5, 1.35], [15.35, 1.22, -1.7], [0, -90, 0]);
  primitive(highDetailRoot, "recycling-east", "box", green, [0.85, 1.5, 1.35], [15.35, 0.72, 2.2], [0, -90, 0]);

  // Four large counter-display props sell restaurant variety while remaining unmistakably decorative.
  primitive(highDetailRoot, "display-pizza", "sphere", red, [0.48, 0.34, 0.48], [-9.4, 1.55, 9.45]);
  primitive(highDetailRoot, "display-burger", "sphere", yellow, [0.5, 0.36, 0.5], [-0.4, 1.55, 9.45]);
  primitive(highDetailRoot, "display-lettuce", "sphere", green, [0.42, 0.34, 0.42], [0.75, 1.55, 9.45]);
  primitive(highDetailRoot, "display-shake", "cylinder", mint, [0.32, 0.58, 0.32], [9.2, 1.58, 9.45]);

  // Two light cards imply a larger indoor ceiling. They are geometry only, not dynamic lights.
  primitive(highDetailRoot, "ceiling-card-west", "box", white, [5.6, 0.05, 0.48], [-6.3, 5.35, 8.65]);
  primitive(highDetailRoot, "ceiling-card-east", "box", cream, [5.6, 0.05, 0.48], [6.3, 5.35, 8.65]);

  return { playableBounds: foodCourtMap.bounds };
}
