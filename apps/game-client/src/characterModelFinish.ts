import * as pc from "playcanvas";
import { findNamedAttachment, resolveChefModelFinish } from "./characterModelFinishCore";

type PrimitiveType = "box" | "sphere" | "cylinder";

export interface SkeletalChefFinishResult {
  headwearAttached: boolean;
  apronAttached: boolean;
}

function copyColor(color: pc.Color) {
  return new pc.Color(color.r, color.g, color.b, color.a);
}

function material(color: pc.Color, gloss = 0.34) {
  const value = new pc.StandardMaterial();
  value.diffuse = copyColor(color);
  value.gloss = gloss;
  value.metalness = 0.01;
  value.update();
  return value;
}

function primitive(
  parent: pc.GraphNode,
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

export function decorateSkeletalChefPilot(
  pilotRoot: pc.Entity,
  sessionId: string,
): SkeletalChefFinishResult {
  const profile = resolveChefModelFinish(sessionId);
  const cream = material(new pc.Color(0.97, 0.94, 0.86), 0.3);
  const warmWhite = material(new pc.Color(0.9, 0.86, 0.78), 0.25);
  const accent = material(new pc.Color(0.86, 0.52, 0.18), 0.42);
  const dark = material(new pc.Color(0.08, 0.065, 0.1), 0.22);

  const head = findNamedAttachment(pilotRoot, [
    "head",
    "def-head",
    "mixamorighead",
  ]);
  if (head) {
    const toque = new pc.Entity("foodfight-chef-toque");
    toque.setLocalPosition(0, 0.2, 0);
    head.addChild(toque);

    primitive(
      toque,
      "toque-band",
      "cylinder",
      accent,
      [0.3 * profile.toqueWidth, 0.085, 0.3 * profile.toqueWidth],
      [0, 0.02, 0],
    );
    primitive(
      toque,
      "toque-center",
      "sphere",
      cream,
      [0.27 * profile.toqueWidth, 0.22 * profile.toqueHeight, 0.27 * profile.toqueWidth],
      [0, 0.21 * profile.toqueHeight, 0],
    );
    primitive(
      toque,
      "toque-left",
      "sphere",
      cream,
      [0.19 * profile.toqueWidth, 0.17 * profile.toqueHeight, 0.19 * profile.toqueWidth],
      [-0.17, 0.19 * profile.toqueHeight, 0.01],
    );
    primitive(
      toque,
      "toque-right",
      "sphere",
      cream,
      [0.19 * profile.toqueWidth, 0.17 * profile.toqueHeight, 0.19 * profile.toqueWidth],
      [0.17, 0.19 * profile.toqueHeight, 0.01],
    );
  }

  const torso = findNamedAttachment(pilotRoot, [
    "upperchest",
    "chest",
    "spine.006",
    "spine_03",
    "spine2",
    "spine",
  ]);
  if (torso) {
    const apron = new pc.Entity("foodfight-chef-apron");
    torso.addChild(apron);
    primitive(
      apron,
      "bib",
      "box",
      warmWhite,
      [0.34 * profile.apronWidth, 0.37, 0.035],
      [0, -0.22, -0.18],
    );
    primitive(
      apron,
      "waist-band",
      "box",
      accent,
      [0.4 * profile.apronWidth, 0.055, 0.055],
      [0, -0.02, -0.2],
    );
    primitive(
      apron,
      "pocket",
      "box",
      dark,
      [0.16, 0.11, 0.025],
      [0.11, -0.31, -0.225],
      [0, 0, -4],
    );
  }

  return {
    headwearAttached: Boolean(head),
    apronAttached: Boolean(torso),
  };
}
