import * as pc from "playcanvas";
import { foodCourtMap } from "@foodfight/maps";

type PrimitiveType = "box" | "sphere" | "cylinder" | "cone" | "capsule";

interface ArenaDetailOptions {
  app: pc.Application;
  mediumDetailRoot: pc.Entity;
  highDetailRoot: pc.Entity;
}

const COLORS = {
  tileA: new pc.Color(0.34, 0.29, 0.39),
  tileB: new pc.Color(0.29, 0.25, 0.34),
  grout: new pc.Color(0.16, 0.14, 0.2),
  wallPanel: new pc.Color(0.23, 0.18, 0.28),
  metal: new pc.Color(0.36, 0.38, 0.44),
  chrome: new pc.Color(0.62, 0.66, 0.72),
  wood: new pc.Color(0.48, 0.29, 0.17),
  cream: new pc.Color(0.96, 0.87, 0.68),
  tomato: new pc.Color(0.94, 0.12, 0.08),
  mustard: new pc.Color(1, 0.67, 0.05),
  mint: new pc.Color(0.24, 0.8, 0.66),
  aqua: new pc.Color(0.13, 0.67, 0.82),
  pink: new pc.Color(0.96, 0.38, 0.6),
  purple: new pc.Color(0.53, 0.32, 0.75),
  green: new pc.Color(0.2, 0.56, 0.3),
  dark: new pc.Color(0.08, 0.07, 0.1),
  white: new pc.Color(0.96, 0.94, 0.9),
};

function cloneColor(color: pc.Color) {
  return new pc.Color(color.r, color.g, color.b, color.a);
}

function makeMaterial(color: pc.Color, gloss = 0.35, metalness = 0.02, emissive?: pc.Color) {
  const value = new pc.StandardMaterial();
  value.diffuse = cloneColor(color);
  value.gloss = gloss;
  value.metalness = metalness;
  if (emissive) {
    value.emissive = cloneColor(emissive);
    value.emissiveIntensity = 1.3;
  }
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

function addChair(parent: pc.Entity, x: number, z: number, rotation: number, metal: pc.Material, seat: pc.Material, name: string) {
  const chair = new pc.Entity(name);
  chair.setLocalPosition(x, 0, z);
  chair.setLocalEulerAngles(0, rotation, 0);
  parent.addChild(chair);
  addPrimitive(chair, "seat", "box", seat, [0.72, 0.12, 0.72], [0, 0.54, 0]);
  addPrimitive(chair, "back", "box", seat, [0.72, 0.72, 0.1], [0, 0.92, 0.31]);
  for (const [lx, lz] of [[-0.26, -0.25], [0.26, -0.25], [-0.26, 0.25], [0.26, 0.25]] as const) {
    addPrimitive(chair, `leg-${lx}-${lz}`, "cylinder", metal, [0.07, 0.52, 0.07], [lx, 0.25, lz]);
  }
}

function addCafeTable(parent: pc.Entity, x: number, z: number, top: pc.Material, metal: pc.Material, seat: pc.Material, index: number) {
  const table = new pc.Entity(`cafe-table-${index}`);
  table.setLocalPosition(x, 0, z);
  parent.addChild(table);
  addPrimitive(table, "top", "cylinder", top, [1.28, 0.12, 1.28], [0, 0.78, 0]);
  addPrimitive(table, "pedestal", "cylinder", metal, [0.17, 0.7, 0.17], [0, 0.36, 0]);
  addPrimitive(table, "base", "cylinder", metal, [0.64, 0.08, 0.64], [0, 0.05, 0]);
  addChair(table, 1.25, 0, 90, metal, seat, "chair-east");
  addChair(table, -1.25, 0, -90, metal, seat, "chair-west");
}

function addKiosk(
  parent: pc.Entity,
  name: string,
  position: [number, number, number],
  rotation: number,
  body: pc.Material,
  trim: pc.Material,
  accent: pc.Material,
  cream: pc.Material,
  dark: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(...position);
  root.setLocalEulerAngles(0, rotation, 0);
  parent.addChild(root);

  addPrimitive(root, "base", "box", body, [5.2, 1.3, 2.4], [0, 0.6, 0]);
  addPrimitive(root, "counter", "box", trim, [5.5, 0.18, 2.65], [0, 1.26, 0]);
  addPrimitive(root, "back", "box", body, [5.2, 2.35, 0.32], [0, 2.35, 0.95]);
  addPrimitive(root, "header", "box", accent, [4.55, 0.54, 0.26], [0, 3.34, 0.76]);
  addPrimitive(root, "awning", "box", cream, [5.35, 0.2, 1.25], [0, 3.78, 0.15], [8, 0, 0]);
  addPrimitive(root, "menu-a", "box", dark, [1.25, 1.05, 0.12], [-1.45, 2.33, 0.73]);
  addPrimitive(root, "menu-b", "box", dark, [1.25, 1.05, 0.12], [0, 2.33, 0.73]);
  addPrimitive(root, "menu-c", "box", dark, [1.25, 1.05, 0.12], [1.45, 2.33, 0.73]);
  addPrimitive(root, "service-window", "box", dark, [3.7, 0.16, 0.1], [0, 1.58, 0.72]);
}

function addCondimentStation(parent: pc.Entity, x: number, z: number, rotation: number, body: pc.Material, top: pc.Material, red: pc.Material, yellow: pc.Material) {
  const root = new pc.Entity(`condiment-${x}-${z}`);
  root.setLocalPosition(x, 0, z);
  root.setLocalEulerAngles(0, rotation, 0);
  parent.addChild(root);
  addPrimitive(root, "cabinet", "box", body, [1.6, 1.2, 0.85], [0, 0.55, 0]);
  addPrimitive(root, "top", "box", top, [1.75, 0.12, 1], [0, 1.16, 0]);
  addPrimitive(root, "ketchup", "cylinder", red, [0.16, 0.5, 0.16], [-0.28, 1.48, 0]);
  addPrimitive(root, "mustard", "cylinder", yellow, [0.16, 0.5, 0.16], [0.28, 1.48, 0]);
}

function addTrashStation(parent: pc.Entity, x: number, z: number, body: pc.Material, trim: pc.Material, dark: pc.Material) {
  const root = new pc.Entity(`trash-${x}-${z}`);
  root.setLocalPosition(x, 0, z);
  parent.addChild(root);
  addPrimitive(root, "left", "box", body, [0.82, 1.25, 0.82], [-0.45, 0.58, 0]);
  addPrimitive(root, "right", "box", trim, [0.82, 1.25, 0.82], [0.45, 0.58, 0]);
  addPrimitive(root, "left-hole", "box", dark, [0.48, 0.1, 0.48], [-0.45, 1.2, 0]);
  addPrimitive(root, "right-hole", "box", dark, [0.48, 0.1, 0.48], [0.45, 1.2, 0]);
}

function addVendingMachine(parent: pc.Entity, x: number, z: number, rotation: number, body: pc.Material, glass: pc.Material, accent: pc.Material, dark: pc.Material) {
  const root = new pc.Entity(`vending-${x}-${z}`);
  root.setLocalPosition(x, 0, z);
  root.setLocalEulerAngles(0, rotation, 0);
  parent.addChild(root);
  addPrimitive(root, "body", "box", body, [1.45, 2.65, 0.9], [0, 1.28, 0]);
  addPrimitive(root, "window", "box", glass, [1.08, 1.42, 0.08], [0, 1.62, -0.47]);
  addPrimitive(root, "brand", "box", accent, [1.08, 0.38, 0.08], [0, 2.43, -0.47]);
  addPrimitive(root, "slot", "box", dark, [0.58, 0.18, 0.08], [0, 0.54, -0.47]);
}

export function createArenaDetail(options: ArenaDetailOptions) {
  const { mediumDetailRoot, highDetailRoot } = options;

  const tileA = makeMaterial(COLORS.tileA, 0.22);
  const tileB = makeMaterial(COLORS.tileB, 0.22);
  const grout = makeMaterial(COLORS.grout, 0.14);
  const wallPanel = makeMaterial(COLORS.wallPanel, 0.25);
  const metal = makeMaterial(COLORS.metal, 0.55, 0.28);
  const chrome = makeMaterial(COLORS.chrome, 0.78, 0.52);
  const wood = makeMaterial(COLORS.wood, 0.34);
  const cream = makeMaterial(COLORS.cream, 0.42);
  const tomato = makeMaterial(COLORS.tomato, 0.46);
  const mustard = makeMaterial(COLORS.mustard, 0.44);
  const mint = makeMaterial(COLORS.mint, 0.42);
  const aqua = makeMaterial(COLORS.aqua, 0.48, 0.06, COLORS.aqua);
  const pink = makeMaterial(COLORS.pink, 0.48, 0.04, COLORS.pink);
  const purple = makeMaterial(COLORS.purple, 0.4);
  const green = makeMaterial(COLORS.green, 0.28);
  const dark = makeMaterial(COLORS.dark, 0.12);
  const white = makeMaterial(COLORS.white, 0.4);

  // A two-tone perimeter concourse gives the food court a sense of scale without adding collision.
  const concourseZ = [-10.22, 10.22];
  for (const z of concourseZ) {
    for (let x = -14; x <= 14; x += 2) {
      const material = (Math.abs(x / 2) + (z > 0 ? 1 : 0)) % 2 === 0 ? tileA : tileB;
      addPrimitive(highDetailRoot, `concourse-tile-${x}-${z}`, "box", material, [1.92, 0.025, 1.22], [x, -0.02, z]);
    }
  }
  for (let x = -15; x <= 15; x += 2) {
    addPrimitive(highDetailRoot, `north-grout-${x}`, "box", grout, [0.045, 0.028, 2.35], [x, -0.008, -10.2]);
    addPrimitive(highDetailRoot, `south-grout-${x}`, "box", grout, [0.045, 0.028, 2.35], [x, -0.008, 10.2]);
  }

  // Break the long perimeter walls into architectural bays.
  for (const z of [-10.72, 10.72]) {
    for (let x = -14; x <= 14; x += 4) {
      addPrimitive(mediumDetailRoot, `wall-bay-${x}-${z}`, "box", wallPanel, [3.45, 1.62, 0.12], [x, 1.15, z]);
      addPrimitive(mediumDetailRoot, `wall-column-${x}-${z}`, "box", chrome, [0.14, 2.2, 0.18], [x - 1.86, 1.2, z - Math.sign(z) * 0.05]);
    }
  }

  // South-side restaurant fronts stay behind the authoritative edge so players never visually run through them.
  addKiosk(mediumDetailRoot, "south-pizza", [-9, 0, 10.45], 180, purple, chrome, tomato, cream, dark);
  addKiosk(mediumDetailRoot, "south-burgers", [0, 0, 10.45], 180, wallPanel, chrome, mustard, cream, dark);
  addKiosk(mediumDetailRoot, "south-shakes", [9, 0, 10.45], 180, purple, chrome, mint, cream, dark);

  // Side-wall booth seating creates depth while leaving all gameplay lanes untouched.
  for (const side of [-1, 1] as const) {
    const x = side * 15.35;
    for (const z of [-6.3, -2.1, 2.1, 6.3]) {
      const booth = new pc.Entity(`booth-${side}-${z}`);
      booth.setLocalPosition(x, 0, z);
      booth.setLocalEulerAngles(0, side < 0 ? 90 : -90, 0);
      highDetailRoot.addChild(booth);
      addPrimitive(booth, "seat", "box", side < 0 ? pink : aqua, [2.65, 0.66, 0.82], [0, 0.36, 0.38]);
      addPrimitive(booth, "back", "box", side < 0 ? pink : aqua, [2.65, 1.15, 0.28], [0, 0.83, 0.78]);
      addPrimitive(booth, "table", "box", wood, [2.25, 0.12, 1.15], [0, 0.72, -0.55]);
    }
  }

  const tables: Array<[number, number]> = [
    [-15.15, -7.4], [-15.15, 7.4], [15.15, -7.4], [15.15, 7.4],
    [-6.6, -10.15], [6.6, -10.15], [-6.6, 10.15], [6.6, 10.15],
  ];
  tables.forEach(([x, z], index) => addCafeTable(highDetailRoot, x, z, cream, metal, index % 2 === 0 ? pink : aqua, index));

  addCondimentStation(highDetailRoot, -14.45, -4.2, 90, wallPanel, chrome, tomato, mustard);
  addCondimentStation(highDetailRoot, 14.45, 4.2, -90, wallPanel, chrome, tomato, mustard);
  addTrashStation(highDetailRoot, -14.55, 4.3, wallPanel, green, dark);
  addTrashStation(highDetailRoot, 14.55, -4.3, wallPanel, green, dark);
  addVendingMachine(highDetailRoot, -15.45, 0.5, 90, wallPanel, dark, aqua, dark);
  addVendingMachine(highDetailRoot, 15.45, -0.5, -90, wallPanel, dark, pink, dark);

  // Overhead landmark signage helps orient players and gives the court a distinct visual identity.
  const sign = new pc.Entity("food-fight-overhead-sign");
  sign.setLocalPosition(0, 0, -9.55);
  mediumDetailRoot.addChild(sign);
  addPrimitive(sign, "beam-left", "box", chrome, [0.18, 2.6, 0.18], [-4.2, 2.4, 0]);
  addPrimitive(sign, "beam-right", "box", chrome, [0.18, 2.6, 0.18], [4.2, 2.4, 0]);
  addPrimitive(sign, "panel", "box", dark, [8.6, 1.25, 0.28], [0, 4.25, 0]);
  addPrimitive(sign, "neon-left", "box", pink, [3.5, 0.16, 0.08], [-2.0, 4.28, -0.18]);
  addPrimitive(sign, "neon-right", "box", aqua, [3.5, 0.16, 0.08], [2.0, 4.28, -0.18]);
  addPrimitive(sign, "center-disc", "cylinder", mustard, [0.58, 0.16, 0.58], [0, 4.28, -0.2], [90, 0, 0]);

  // Decorative food silhouettes sit behind the south boundary and remain chunky at gameplay distance.
  for (const [x, z, material, kind] of [
    [-9.8, 9.45, tomato, "pizza"], [-8.4, 9.45, cream, "plate"],
    [-0.65, 9.45, mustard, "burger"], [0.65, 9.45, green, "lettuce"],
    [8.5, 9.45, pink, "shake"], [9.8, 9.45, mint, "shake"],
  ] as Array<[number, number, pc.Material, string]>) {
    const display = new pc.Entity(`counter-food-${kind}-${x}`);
    display.setLocalPosition(x, 1.55, z);
    highDetailRoot.addChild(display);
    addPrimitive(display, "food", kind === "shake" ? "cylinder" : "sphere", material, kind === "shake" ? [0.28, 0.58, 0.28] : [0.46, 0.32, 0.46], [0, 0, 0]);
    if (kind === "shake") addPrimitive(display, "straw", "cylinder", white, [0.045, 0.5, 0.045], [0.08, 0.52, 0], [0, 0, -12]);
  }

  // Soft ceiling-light cards sell illumination without adding several dynamic lights.
  for (const x of [-10, -5, 0, 5, 10]) {
    addPrimitive(highDetailRoot, `ceiling-light-north-${x}`, "box", white, [2.7, 0.05, 0.52], [x, 5.5, -8.7]);
    addPrimitive(highDetailRoot, `ceiling-light-south-${x}`, "box", white, [2.7, 0.05, 0.52], [x, 5.5, 8.7]);
  }

  return {
    mediumDetailRoot,
    highDetailRoot,
    playableBounds: foodCourtMap.bounds,
  };
}
