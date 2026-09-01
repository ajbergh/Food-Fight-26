import * as pc from "playcanvas";
import { foodCourtMap } from "@foodfight/maps";

type PrimitiveType = "box" | "sphere" | "cylinder" | "cone";

interface EnvironmentFinishOptions {
  mediumDetailRoot: pc.Entity;
  highDetailRoot: pc.Entity;
}

const C = {
  ink: new pc.Color(0.028, 0.022, 0.038),
  charcoal: new pc.Color(0.065, 0.052, 0.084),
  plum: new pc.Color(0.18, 0.115, 0.225),
  brass: new pc.Color(0.62, 0.46, 0.25),
  cream: new pc.Color(1, 0.91, 0.72),
  warm: new pc.Color(1, 0.7, 0.24),
  tomato: new pc.Color(0.96, 0.15, 0.09),
  berry: new pc.Color(0.96, 0.28, 0.58),
  aqua: new pc.Color(0.08, 0.73, 0.9),
  mint: new pc.Color(0.22, 0.86, 0.68),
  purple: new pc.Color(0.5, 0.26, 0.76),
  green: new pc.Color(0.12, 0.46, 0.24),
  steel: new pc.Color(0.42, 0.45, 0.54),
};

function copyColor(color: pc.Color) {
  return new pc.Color(color.r, color.g, color.b, color.a);
}

function material(color: pc.Color, gloss = 0.35, metalness = 0.02, emissive?: pc.Color) {
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

function lightbox(
  parent: pc.Entity,
  name: string,
  position: [number, number, number],
  scale: [number, number, number],
  face: pc.Material,
  trim: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(...position);
  parent.addChild(root);
  primitive(root, "case", "box", trim, [scale[0] + 0.18, scale[1] + 0.18, scale[2] + 0.1], [0, 0, 0]);
  primitive(root, "face", "box", face, scale, [0, 0, -0.08]);
  return root;
}

function menuBoard(
  parent: pc.Entity,
  name: string,
  x: number,
  accent: pc.Material,
  cream: pc.Material,
  dark: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 2.4, -10.39);
  parent.addChild(root);
  primitive(root, "panel", "box", dark, [3.2, 1.05, 0.12], [0, 0, 0]);
  primitive(root, "accent", "box", accent, [2.65, 0.12, 0.04], [0, 0.34, -0.09]);
  for (const [index, width] of [2.2, 1.75, 2.05].entries()) {
    primitive(root, `menu-line-${index}`, "box", cream, [width, 0.055, 0.035], [-0.2 + index * 0.08, 0.08 - index * 0.22, -0.095]);
  }
}

function iconMark(
  parent: pc.Entity,
  name: string,
  x: number,
  z: number,
  accent: pc.Material,
  secondary: pc.Material,
  kind: "burger" | "shake" | "pizza" | "dessert",
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 4.02, z);
  parent.addChild(root);

  if (kind === "burger") {
    primitive(root, "bun-top", "sphere", secondary, [0.72, 0.26, 0.22], [0, 0.18, 0]);
    primitive(root, "patty", "box", accent, [1.2, 0.13, 0.18], [0, 0, 0]);
    primitive(root, "bun-bottom", "box", secondary, [1.05, 0.13, 0.18], [0, -0.18, 0]);
  } else if (kind === "shake") {
    primitive(root, "cup", "cone", secondary, [0.42, 0.58, 0.2], [0, -0.05, 0], [180, 0, 0]);
    primitive(root, "cream", "sphere", accent, [0.45, 0.2, 0.2], [0, 0.34, 0]);
    primitive(root, "straw", "box", accent, [0.08, 0.54, 0.07], [0.22, 0.48, 0], [0, 0, -18]);
  } else if (kind === "pizza") {
    primitive(root, "slice", "cone", secondary, [0.55, 0.14, 0.55], [0, 0, 0], [90, 0, 0]);
    primitive(root, "topping-a", "sphere", accent, [0.12, 0.08, 0.06], [-0.13, 0.04, -0.04]);
    primitive(root, "topping-b", "sphere", accent, [0.12, 0.08, 0.06], [0.18, 0.03, 0.08]);
  } else {
    primitive(root, "dish", "cylinder", secondary, [0.58, 0.08, 0.2], [0, -0.15, 0]);
    primitive(root, "scoop-a", "sphere", accent, [0.34, 0.3, 0.18], [-0.22, 0.12, 0]);
    primitive(root, "scoop-b", "sphere", secondary, [0.34, 0.3, 0.18], [0.22, 0.13, 0]);
  }
}

function condimentIsland(
  parent: pc.Entity,
  name: string,
  x: number,
  z: number,
  rotation: number,
  body: pc.Material,
  top: pc.Material,
  accent: pc.Material,
) {
  const root = new pc.Entity(name);
  root.setLocalPosition(x, 0, z);
  root.setLocalEulerAngles(0, rotation, 0);
  parent.addChild(root);
  primitive(root, "base", "box", body, [2.2, 0.72, 0.88], [0, 0.34, 0]);
  primitive(root, "top", "box", top, [2.35, 0.12, 1.0], [0, 0.74, 0]);
  primitive(root, "napkin", "box", accent, [0.55, 0.38, 0.35], [-0.52, 0.98, 0]);
  primitive(root, "bottle-a", "cylinder", accent, [0.12, 0.42, 0.12], [0.28, 1.0, -0.16]);
  primitive(root, "bottle-b", "cylinder", top, [0.12, 0.42, 0.12], [0.56, 1.0, 0.14]);
}

export function createEnvironmentFinish(options: EnvironmentFinishOptions) {
  const { mediumDetailRoot, highDetailRoot } = options;

  const ink = material(C.ink, 0.12);
  const charcoal = material(C.charcoal, 0.18);
  const plum = material(C.plum, 0.28);
  const brass = material(C.brass, 0.62, 0.28);
  const cream = material(C.cream, 0.44);
  const steel = material(C.steel, 0.65, 0.36);
  const green = material(C.green, 0.22);
  const tomato = material(C.tomato, 0.38, 0, C.tomato);
  const berry = material(C.berry, 0.36, 0, C.berry);
  const aqua = material(C.aqua, 0.36, 0, C.aqua);
  const mint = material(C.mint, 0.36, 0, C.mint);
  const purple = material(C.purple, 0.34, 0, C.purple);
  const warm = material(C.warm, 0.38, 0, C.warm);
  const warmWhite = material(C.cream, 0.28, 0, C.cream);

  // A deeper proscenium gives the upper edge of the map a real mall/food-hall silhouette.
  primitive(mediumDetailRoot, "food-hall-header", "box", ink, [31.6, 0.7, 0.9], [0, 4.78, -10.3]);
  primitive(mediumDetailRoot, "food-hall-header-trim", "box", brass, [26.8, 0.07, 0.08], [0, 4.52, -10.76]);
  for (const x of [-12.8, -6.4, 0, 6.4, 12.8]) {
    primitive(mediumDetailRoot, `header-drop-${x}`, "box", steel, [0.18, 1.3, 0.18], [x, 4.04, -10.32]);
  }

  // Distinct vendor identities are readable from gameplay distance without font or texture dependencies.
  menuBoard(mediumDetailRoot, "menu-pizza", -10.5, tomato, cream, charcoal);
  menuBoard(mediumDetailRoot, "menu-burger", -3.5, warm, cream, charcoal);
  menuBoard(mediumDetailRoot, "menu-shake", 3.5, mint, cream, charcoal);
  menuBoard(mediumDetailRoot, "menu-dessert", 10.5, berry, cream, charcoal);
  iconMark(mediumDetailRoot, "icon-pizza", -10.5, -10.58, tomato, warm, "pizza");
  iconMark(mediumDetailRoot, "icon-burger", -3.5, -10.58, tomato, warm, "burger");
  iconMark(mediumDetailRoot, "icon-shake", 3.5, -10.58, mint, berry, "shake");
  iconMark(mediumDetailRoot, "icon-dessert", 10.5, -10.58, berry, cream, "dessert");

  // Hanging wayfinding creates vertical layering without intruding on collision or camera visibility.
  for (const [index, x, accent] of [
    [0, -8.5, aqua],
    [1, 0, warm],
    [2, 8.5, berry],
  ] as Array<[number, number, pc.Material]>) {
    const root = new pc.Entity(`hanging-wayfinding-${index}`);
    root.setLocalPosition(x, 5.55, -5.9);
    mediumDetailRoot.addChild(root);
    primitive(root, "drop-left", "box", steel, [0.05, 1.3, 0.05], [-1.1, -0.58, 0]);
    primitive(root, "drop-right", "box", steel, [0.05, 1.3, 0.05], [1.1, -0.58, 0]);
    lightbox(root, "sign", [0, -1.18, 0], [2.25, 0.48, 0.08], accent, ink);
  }

  // Side-wall posters and illuminated strips break up the long dark edges while preserving play-space clarity.
  for (const [side, x, rotation, accentA, accentB] of [
    ["west", -16.45, 90, aqua, mint],
    ["east", 16.45, -90, berry, tomato],
  ] as Array<[string, number, number, pc.Material, pc.Material]>) {
    for (const [index, z] of [-6.4, 0, 6.4].entries()) {
      const root = new pc.Entity(`${side}-poster-${index}`);
      root.setLocalPosition(x, 2.35, z);
      root.setLocalEulerAngles(0, rotation, 0);
      mediumDetailRoot.addChild(root);
      primitive(root, "frame", "box", brass, [2.15, 1.5, 0.12], [0, 0, 0]);
      primitive(root, "face", "box", charcoal, [1.92, 1.28, 0.08], [0, 0, -0.08]);
      primitive(root, "stripe-a", "box", index % 2 === 0 ? accentA : accentB, [1.45, 0.16, 0.04], [0, 0.3, -0.14]);
      primitive(root, "stripe-b", "box", cream, [1.15, 0.07, 0.04], [-0.1, -0.02, -0.14]);
      primitive(root, "stripe-c", "box", cream, [0.86, 0.07, 0.04], [0.08, -0.26, -0.14]);
    }
  }

  // Large floor zones create authored composition while remaining lower contrast than gameplay objects.
  primitive(mediumDetailRoot, "north-carpet-band", "box", plum, [25.5, 0.025, 1.18], [0, -0.02, -8.25]);
  primitive(mediumDetailRoot, "south-carpet-band", "box", charcoal, [25.5, 0.025, 1.18], [0, -0.02, 8.25]);
  for (const x of [-9.3, -3.1, 3.1, 9.3]) {
    primitive(mediumDetailRoot, `north-band-inlay-${x}`, "box", brass, [3.8, 0.028, 0.055], [x, -0.002, -8.2]);
  }

  // High quality: small but recognizable environmental stories around the safe perimeter.
  condimentIsland(highDetailRoot, "condiment-west", -14.1, -1.0, 90, charcoal, cream, tomato);
  condimentIsland(highDetailRoot, "condiment-east", 14.1, 1.0, -90, charcoal, cream, mint);

  for (const [index, x, accent] of [
    [0, -10.5, tomato],
    [1, -3.5, warm],
    [2, 3.5, mint],
    [3, 10.5, berry],
  ] as Array<[number, number, pc.Material]>) {
    const root = new pc.Entity(`service-display-${index}`);
    root.setLocalPosition(x, 1.52, -9.55);
    highDetailRoot.addChild(root);
    primitive(root, "tray", "box", steel, [2.3, 0.1, 0.65], [0, 0, 0]);
    primitive(root, "food-a", "sphere", accent, [0.34, 0.24, 0.3], [-0.62, 0.22, 0]);
    primitive(root, "food-b", "sphere", cream, [0.32, 0.22, 0.28], [0, 0.22, 0]);
    primitive(root, "food-c", "sphere", accent, [0.34, 0.24, 0.3], [0.62, 0.22, 0]);
  }

  // Ceiling ribs and broad luminous panels provide depth cues at high settings without dynamic lights.
  for (const z of [-8.5, -4.5, -0.5, 3.5, 7.5]) {
    primitive(highDetailRoot, `ceiling-rib-${z}`, "box", steel, [28.4, 0.09, 0.12], [0, 6.05, z]);
  }
  for (const [index, x] of [-9.5, -3.2, 3.2, 9.5].entries()) {
    primitive(highDetailRoot, `ceiling-panel-${index}`, "box", warmWhite, [4.6, 0.05, 1.05], [x, 5.98, -1.0]);
  }

  // A layered hero plinth makes the sundae feel like a sponsored arena centerpiece rather than a primitive cylinder.
  primitive(mediumDetailRoot, "objective-plinth-shadow", "cylinder", ink, [5.2, 0.18, 5.2], [foodCourtMap.objective.x, 0.02, foodCourtMap.objective.y]);
  primitive(mediumDetailRoot, "objective-plinth-brass", "cylinder", brass, [4.65, 0.12, 4.65], [foodCourtMap.objective.x, 0.12, foodCourtMap.objective.y]);
  primitive(mediumDetailRoot, "objective-plinth-inner", "cylinder", cream, [4.15, 0.08, 4.15], [foodCourtMap.objective.x, 0.19, foodCourtMap.objective.y]);
  for (const [index, angle] of [0, 90, 180, 270].entries()) {
    const radians = (angle * Math.PI) / 180;
    primitive(
      highDetailRoot,
      `objective-beacon-${index}`,
      "box",
      index % 2 === 0 ? aqua : berry,
      [0.18, 0.05, 1.05],
      [Math.sin(radians) * 2.55, 0.27, Math.cos(radians) * 2.55],
      [0, angle, 0],
    );
  }

  // Decorative planter clusters soften the architecture but remain entirely outside the authoritative lanes.
  for (const [index, x, z] of [
    [0, -15.7, -7.7],
    [1, -15.7, 7.7],
    [2, 15.7, -7.7],
    [3, 15.7, 7.7],
  ] as Array<[number, number, number]>) {
    const root = new pc.Entity(`premium-planter-${index}`);
    root.setLocalPosition(x, 0, z);
    highDetailRoot.addChild(root);
    primitive(root, "pot", "cylinder", brass, [0.72, 0.62, 0.72], [0, 0.3, 0]);
    primitive(root, "leaf-a", "sphere", green, [0.8, 0.88, 0.62], [-0.2, 0.98, 0]);
    primitive(root, "leaf-b", "sphere", green, [0.68, 0.8, 0.58], [0.3, 1.12, 0.08]);
  }

  // Repeated kick-light strips anchor the lower foreground edge and make the arena feel built rather than staged.
  primitive(mediumDetailRoot, "foreground-kick-left", "box", tomato, [6.6, 0.08, 0.07], [-8.4, 0.15, 10.58]);
  primitive(mediumDetailRoot, "foreground-kick-center", "box", warm, [6.6, 0.08, 0.07], [0, 0.15, 10.58]);
  primitive(mediumDetailRoot, "foreground-kick-right", "box", mint, [6.6, 0.08, 0.07], [8.4, 0.15, 10.58]);
  primitive(highDetailRoot, "foreground-lip", "box", ink, [27.4, 0.22, 0.45], [0, -0.02, 10.78]);

  // Purple acts as a neutral secondary commercial accent and keeps the environment from reading as team-owned.
  primitive(highDetailRoot, "south-neutral-accent-left", "box", purple, [5.4, 0.22, 0.14], [-9.5, 0.6, 9.8]);
  primitive(highDetailRoot, "south-neutral-accent-right", "box", purple, [5.4, 0.22, 0.14], [9.5, 0.6, 9.8]);
}
