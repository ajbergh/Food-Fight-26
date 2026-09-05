import * as pc from "playcanvas";
import { resolveProceduralChefFinishVariant } from "./proceduralChefFinishCore";

type PrimitiveType = "box" | "sphere" | "cylinder" | "cone" | "capsule";

function cloneColor(color: pc.Color) {
  return new pc.Color(color.r, color.g, color.b, color.a);
}

function makeMaterial(color: pc.Color, gloss = 0.32) {
  const material = new pc.StandardMaterial();
  material.diffuse = cloneColor(color);
  material.gloss = gloss;
  material.metalness = 0.01;
  material.update();
  return material;
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

export function applyProceduralChefFinish(
  root: pc.Entity,
  accent: pc.Color,
  sessionId: string,
) {
  const body = root.findByName("character-body") as pc.Entity | null;
  const head = root.findByName("head-root") as pc.Entity | null;
  if (!body || !head) return false;
  if (body.findByName("procedural-chef-finish")) return true;

  const variant = resolveProceduralChefFinishVariant(sessionId);
  const finishRoot = new pc.Entity("procedural-chef-finish");
  body.addChild(finishRoot);

  const jacket = makeMaterial(new pc.Color(0.965, 0.945, 0.9), 0.28);
  const apron = makeMaterial(new pc.Color(0.88, 0.845, 0.78), 0.24);
  const ink = makeMaterial(new pc.Color(0.08, 0.06, 0.09), 0.22);
  const trim = makeMaterial(accent, 0.36);

  // Cover more of the colored prototype torso with a classic double-breasted chef jacket.
  addPrimitive(finishRoot, "jacket-left", "box", jacket, [0.31, 0.63, 0.06], [-0.31, 0.34, -0.585], [0, 0, -2]);
  addPrimitive(finishRoot, "jacket-right", "box", jacket, [0.31, 0.63, 0.06], [0.31, 0.34, -0.585], [0, 0, 2]);
  addPrimitive(finishRoot, "jacket-piping-left", "box", ink, [0.025, 0.48, 0.025], [-0.13, 0.34, -0.625]);
  addPrimitive(finishRoot, "jacket-piping-right", "box", ink, [0.025, 0.48, 0.025], [0.13, 0.34, -0.625]);

  const pocketX = variant.pocketSide * 0.35;
  addPrimitive(finishRoot, "chest-pocket", "box", apron, [0.19, 0.15, 0.026], [pocketX, 0.46, -0.627]);
  addPrimitive(finishRoot, "chest-pocket-lip", "box", trim, [0.2, 0.025, 0.028], [pocketX, 0.535, -0.632]);

  // A compact neckerchief gives the silhouette a clear chef read without competing with team markers.
  addPrimitive(
    finishRoot,
    "neckerchief-left",
    "box",
    trim,
    [0.12, 0.31, 0.045],
    [-0.08 + variant.neckerchiefTailBias, 0.58, -0.63],
    [0, 0, -23],
  );
  addPrimitive(
    finishRoot,
    "neckerchief-right",
    "box",
    trim,
    [0.12, 0.31, 0.045],
    [0.08 + variant.neckerchiefTailBias, 0.58, -0.635],
    [0, 0, 23],
  );

  addPrimitive(finishRoot, "apron-knot", "sphere", trim, [0.14, 0.1, 0.08], [0, -0.04, -0.67]);
  addPrimitive(finishRoot, "apron-tail-left", "box", apron, [0.13, 0.3, 0.04], [-0.1, -0.22, -0.645], [0, 0, 8]);
  addPrimitive(finishRoot, "apron-tail-right", "box", apron, [0.13, 0.3, 0.04], [0.1, -0.22, -0.645], [0, 0, -8]);

  const towelX = variant.towelSide * 0.72;
  addPrimitive(
    finishRoot,
    "side-towel",
    "box",
    jacket,
    [0.17, 0.43, 0.055],
    [towelX, -0.08, -0.08],
    [0, 0, variant.towelSide * -8],
  );
  addPrimitive(
    finishRoot,
    "side-towel-stripe",
    "box",
    trim,
    [0.18, 0.035, 0.058],
    [towelX, -0.12, -0.115],
    [0, 0, variant.towelSide * -8],
  );

  // Every existing procedural headwear style occupies this front band, so one badge works across all three.
  addPrimitive(
    head,
    "chef-headwear-badge",
    "box",
    trim,
    [0.17, 0.11, 0.025],
    [0, 0.55, -0.62],
    [0, 0, variant.badgeTiltDegrees],
  );

  return true;
}
