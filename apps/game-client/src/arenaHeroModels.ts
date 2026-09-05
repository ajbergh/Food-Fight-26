import * as pc from "playcanvas";

type PrimitiveType = "box" | "sphere" | "cylinder" | "cone";

interface ArenaHeroModelsOptions {
  mediumDetailRoot: pc.Entity;
  highDetailRoot: pc.Entity;
}

const C = {
  ink: new pc.Color(0.035, 0.028, 0.048),
  charcoal: new pc.Color(0.08, 0.072, 0.09),
  plum: new pc.Color(0.19, 0.12, 0.23),
  steel: new pc.Color(0.42, 0.46, 0.54),
  glass: new pc.Color(0.22, 0.34, 0.42),
  brass: new pc.Color(0.66, 0.49, 0.26),
  cream: new pc.Color(0.96, 0.88, 0.7),
  tomato: new pc.Color(0.94, 0.14, 0.08),
  warm: new pc.Color(1, 0.65, 0.12),
  mint: new pc.Color(0.2, 0.82, 0.66),
  berry: new pc.Color(0.92, 0.28, 0.58),
};

function copyColor(color: pc.Color) {
  return new pc.Color(color.r, color.g, color.b, color.a);
}

function material(color: pc.Color, gloss = 0.34, metalness = 0.02, emissive?: pc.Color) {
  const value = new pc.StandardMaterial();
  value.diffuse = copyColor(color);
  value.gloss = gloss;
  value.metalness = metalness;
  if (emissive) value.emissive = copyColor(emissive);
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

function createMezzanine(
  parent: pc.Entity,
  name: string,
  z: number,
  facing: 1 | -1,
  deck: pc.Material,
  rail: pc.Material,
  glass: pc.Material,
  accent: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(0, 0, z);
  parent.addChild(root);

  primitive(root, "deck", "box", deck, [29.5, 0.34, 1.55], [0, 4.72, 0]);
  primitive(root, "fascia", "box", rail, [29.5, 0.24, 0.18], [0, 4.48, -facing * 0.76]);
  primitive(root, "handrail", "box", rail, [28.5, 0.08, 0.1], [0, 5.75, -facing * 0.7]);

  for (const x of [-12.8, -8.6, -4.3, 0, 4.3, 8.6, 12.8]) {
    primitive(root, `rail-post-${x}`, "box", rail, [0.08, 0.96, 0.08], [x, 5.25, -facing * 0.7]);
  }
  for (const x of [-10.7, -6.45, -2.15, 2.15, 6.45, 10.7]) {
    primitive(root, `glass-panel-${x}`, "box", glass, [3.7, 0.68, 0.035], [x, 5.23, -facing * 0.68]);
  }
  primitive(root, "accent-strip", "box", accent, [23.5, 0.045, 0.04], [0, 4.43, -facing * 0.87]);
}

function createEscalatorBank(
  parent: pc.Entity,
  name: string,
  x: number,
  z: number,
  rotation: number,
  frame: pc.Material,
  tread: pc.Material,
  accent: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, z);
  root.setLocalEulerAngles(0, rotation, 0);
  parent.addChild(root);

  for (const side of [-1, 1]) {
    primitive(root, `stringer-${side}`, "box", frame, [0.14, 0.18, 5.1], [side * 0.78, 2.15, 0], [28, 0, 0]);
    primitive(root, `handrail-${side}`, "box", accent, [0.08, 0.08, 5.0], [side * 0.82, 2.62, 0], [28, 0, 0]);
  }
  for (let index = 0; index < 8; index += 1) {
    const progress = index / 7;
    primitive(
      root,
      `step-${index}`,
      "box",
      tread,
      [1.35, 0.12, 0.5],
      [0, 0.74 + progress * 2.72, 2.05 - progress * 4.1],
    );
  }
}

function createPizzaOven(
  parent: pc.Entity,
  name: string,
  position: [number, number, number],
  shell: pc.Material,
  dark: pc.Material,
  glow: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(...position);
  parent.addChild(root);
  primitive(root, "oven-body", "box", shell, [2.0, 1.35, 0.75], [0, 0.65, 0]);
  primitive(root, "oven-mouth", "box", dark, [1.35, 0.62, 0.08], [0, 0.63, -0.39]);
  primitive(root, "fire-bed", "box", glow, [0.88, 0.1, 0.05], [0, 0.34, -0.45]);
  primitive(root, "chimney", "box", shell, [0.42, 0.75, 0.42], [0, 1.65, 0.08]);
}

function createGrillStation(
  parent: pc.Entity,
  name: string,
  position: [number, number, number],
  steel: pc.Material,
  dark: pc.Material,
  accent: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(...position);
  parent.addChild(root);
  primitive(root, "base", "box", dark, [2.1, 0.9, 0.82], [0, 0.45, 0]);
  primitive(root, "griddle", "box", steel, [2.2, 0.12, 0.9], [0, 0.94, 0]);
  primitive(root, "hood", "box", steel, [2.35, 0.42, 0.82], [0, 2.15, 0.12], [12, 0, 0]);
  primitive(root, "hood-stack", "box", dark, [0.58, 0.72, 0.52], [0, 2.68, 0.28]);
  primitive(root, "heat-line", "box", accent, [1.45, 0.045, 0.05], [0, 1.03, -0.48]);
}

function createShakeStation(
  parent: pc.Entity,
  name: string,
  position: [number, number, number],
  shell: pc.Material,
  steel: pc.Material,
  cream: pc.Material,
  accent: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(...position);
  parent.addChild(root);
  primitive(root, "cabinet", "box", shell, [1.75, 1.75, 0.78], [0, 0.86, 0]);
  primitive(root, "face", "box", cream, [1.42, 1.2, 0.07], [0, 1.06, -0.43]);
  for (const x of [-0.42, 0, 0.42]) {
    primitive(root, `nozzle-${x}`, "cylinder", steel, [0.09, 0.3, 0.09], [x, 1.22, -0.55]);
    primitive(root, `handle-${x}`, "box", accent, [0.08, 0.3, 0.08], [x, 1.55, -0.56], [0, 0, 20]);
  }
  primitive(root, "drip-tray", "box", steel, [1.25, 0.08, 0.38], [0, 0.5, -0.55]);
  primitive(root, "top-beacon", "sphere", accent, [0.22, 0.22, 0.22], [0, 2.0, 0]);
}

function createServiceCart(
  parent: pc.Entity,
  steel: pc.Material,
  dark: pc.Material,
  accent: pc.Material,
) {
  const root = new pc.Entity("service-cart");
  root.setLocalPosition(-5.5, 0, -9.25);
  parent.addChild(root);

  primitive(root, "upper-deck", "box", steel, [1.8, 0.12, 0.9], [0, 0.72, 0]);
  primitive(root, "lower-shelf", "box", dark, [1.55, 0.08, 0.72], [0, 0.28, 0]);
  primitive(root, "upright-left", "box", dark, [0.08, 0.92, 0.08], [-0.73, 0.72, 0.34]);
  primitive(root, "upright-right", "box", dark, [0.08, 0.92, 0.08], [0.73, 0.72, 0.34]);
  primitive(root, "handle", "box", accent, [1.55, 0.08, 0.08], [0, 1.18, 0.34]);
}

function createMezzaninePatron(
  parent: pc.Entity,
  index: number,
  position: [number, number, number],
  facing: number,
  body: pc.Material,
  head: pc.Material,
  heightScale: number,
) {
  const root = new pc.Entity(`mezzanine-patron-${index}`);
  root.setLocalPosition(...position);
  root.setLocalEulerAngles(0, facing, 0);
  parent.addChild(root);

  primitive(root, "body", "cylinder", body, [0.22, 0.48 * heightScale, 0.22], [0, 0.43 * heightScale, 0]);
  primitive(root, "head", "sphere", head, [0.23, 0.23, 0.23], [0, 1.02 * heightScale, 0]);
}

function createMezzaninePatrons(
  parent: pc.Entity,
  dark: pc.Material,
  mid: pc.Material,
  head: pc.Material,
) {
  const patrons = [
    [-11.2, 5.0, -11.25, 8, dark, 0.94],
    [-5.6, 5.0, -11.28, -10, mid, 1.04],
    [1.4, 5.0, -11.24, 7, dark, 1.0],
    [8.9, 5.0, -11.27, -6, mid, 0.9],
    [-8.8, 5.0, 11.26, 174, mid, 1.02],
    [-2.2, 5.0, 11.24, 188, dark, 0.92],
    [4.7, 5.0, 11.29, 177, mid, 1.06],
    [11.0, 5.0, 11.23, 184, dark, 0.96],
  ] as const;

  patrons.forEach(([x, y, z, facing, body, heightScale], index) => {
    createMezzaninePatron(parent, index, [x, y, z], facing, body, head, heightScale);
  });
}

export function createArenaHeroModels(options: ArenaHeroModelsOptions) {
  const { mediumDetailRoot, highDetailRoot } = options;

  const ink = material(C.ink, 0.15);
  const charcoal = material(C.charcoal, 0.16);
  const plum = material(C.plum, 0.26);
  const steel = material(C.steel, 0.68, 0.34);
  const glass = material(C.glass, 0.72, 0.05);
  const brass = material(C.brass, 0.58, 0.2);
  const cream = material(C.cream, 0.48);
  const tomato = material(C.tomato, 0.34, 0, C.tomato);
  const warm = material(C.warm, 0.34, 0, C.warm);
  const mint = material(C.mint, 0.34, 0, C.mint);
  const berry = material(C.berry, 0.34, 0, C.berry);

  // Medium: architectural depth beyond the authoritative playfield.
  createMezzanine(mediumDetailRoot, "north-mezzanine", -11.55, 1, plum, steel, glass, warm);
  createMezzanine(mediumDetailRoot, "south-mezzanine", 11.55, -1, ink, brass, glass, berry);

  // The escalators sit outside the authoritative arena bounds and visually connect the lower food court to the mezzanine.
  createEscalatorBank(mediumDetailRoot, "west-escalator", -16.0, -6.5, 90, steel, ink, warm);
  createEscalatorBank(mediumDetailRoot, "east-escalator", 16.0, 6.5, -90, steel, ink, berry);

  // High: recognizable back-of-counter equipment turns storefront blocks into believable food vendors.
  createPizzaOven(highDetailRoot, "pizza-oven", [-9, 1.52, 10.0], plum, ink, tomato);
  createGrillStation(highDetailRoot, "burger-grill", [0, 1.5, 10.0], steel, ink, warm);
  createShakeStation(highDetailRoot, "shake-machine", [9, 1.48, 10.0], mint, steel, cream, berry);

  // High: a compact, desaturated service cart occasionally crosses the north perimeter concourse.
  // It is presentation-only and stays outside the authoritative combat topology.
  createServiceCart(highDetailRoot, steel, charcoal, brass);

  // High: eight small, desaturated patron silhouettes sit behind the mezzanine rails.
  // They intentionally omit team colors, player rings, held items, and chef silhouettes so
  // they read as distant spectators rather than gameplay actors.
  createMezzaninePatrons(highDetailRoot, ink, charcoal, brass);
}
