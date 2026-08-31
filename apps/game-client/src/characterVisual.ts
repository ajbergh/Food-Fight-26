import * as pc from "playcanvas";
import { GAME } from "@foodfight/game-core";
import {
  locomotionPose,
  resolveLocomotion,
  THROW_DURATION_SECONDS,
  throwPose,
} from "./characterAnimation";

type PrimitiveType = "box" | "sphere" | "cylinder" | "cone" | "capsule";

export interface CharacterVisual {
  root: pc.Entity;
  update(dt: number): void;
  triggerThrow(direction?: { x: number; z: number }): void;
}

interface CharacterVisualOptions {
  root: pc.Entity;
  accent: pc.Color;
  sessionId: string;
}

interface Limb {
  pivot: pc.Entity;
  joint: pc.Entity;
}

const SKIN_TONES = [
  new pc.Color(0.96, 0.76, 0.61),
  new pc.Color(0.86, 0.61, 0.43),
  new pc.Color(0.67, 0.43, 0.3),
  new pc.Color(0.43, 0.27, 0.2),
];

const HAIR_COLORS = [
  new pc.Color(0.12, 0.08, 0.07),
  new pc.Color(0.26, 0.14, 0.07),
  new pc.Color(0.76, 0.53, 0.2),
  new pc.Color(0.42, 0.3, 0.24),
];

function cloneColor(color: pc.Color) {
  return new pc.Color(color.r, color.g, color.b, color.a);
}

function makeMaterial(color: pc.Color, gloss = 0.34) {
  const value = new pc.StandardMaterial();
  value.diffuse = cloneColor(color);
  value.gloss = gloss;
  value.metalness = 0.02;
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

function addArm(
  body: pc.Entity,
  side: "left" | "right",
  x: number,
  coat: pc.Material,
  skin: pc.Material,
): Limb {
  const sign = side === "left" ? -1 : 1;
  const shoulder = new pc.Entity(`${side}-shoulder`);
  shoulder.setLocalPosition(x, 0.47, 0);
  body.addChild(shoulder);

  addPrimitive(shoulder, `${side}-upper-arm`, "capsule", coat, [0.22, 0.48, 0.22], [0, -0.23, 0], [0, 0, sign * 5]);

  const elbow = new pc.Entity(`${side}-elbow`);
  elbow.setLocalPosition(0, -0.44, 0);
  shoulder.addChild(elbow);
  addPrimitive(elbow, `${side}-forearm`, "capsule", coat, [0.2, 0.43, 0.2], [0, -0.2, 0]);
  addPrimitive(elbow, `${side}-hand`, "sphere", skin, [0.25, 0.25, 0.25], [0, -0.44, -0.01]);

  return { pivot: shoulder, joint: elbow };
}

function addLeg(
  body: pc.Entity,
  side: "left" | "right",
  x: number,
  pants: pc.Material,
  shoe: pc.Material,
): Limb {
  const hip = new pc.Entity(`${side}-hip`);
  hip.setLocalPosition(x, -0.08, 0);
  body.addChild(hip);
  addPrimitive(hip, `${side}-upper-leg`, "capsule", pants, [0.25, 0.4, 0.26], [0, -0.19, 0]);

  const knee = new pc.Entity(`${side}-knee`);
  knee.setLocalPosition(0, -0.37, 0);
  hip.addChild(knee);
  addPrimitive(knee, `${side}-lower-leg`, "capsule", pants, [0.22, 0.36, 0.23], [0, -0.17, 0]);
  addPrimitive(knee, `${side}-shoe`, "sphere", shoe, [0.34, 0.18, 0.47], [0, -0.36, -0.09]);

  return { pivot: hip, joint: knee };
}

function hashSession(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shortestAngleDelta(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}

export function createCharacterVisual(options: CharacterVisualOptions): CharacterVisual {
  const { root, accent, sessionId } = options;
  const variant = hashSession(sessionId);
  const skin = makeMaterial(SKIN_TONES[variant % SKIN_TONES.length]!);
  const hair = makeMaterial(HAIR_COLORS[(variant >>> 3) % HAIR_COLORS.length]!, 0.24);
  const white = makeMaterial(new pc.Color(0.96, 0.94, 0.9), 0.3);
  const coat = makeMaterial(accent, 0.38);
  const pants = makeMaterial(new pc.Color(0.16, 0.13, 0.2), 0.25);
  const shoe = makeMaterial(new pc.Color(0.055, 0.045, 0.065), 0.3);
  const dark = makeMaterial(new pc.Color(0.09, 0.07, 0.1), 0.25);

  const widthScale = 0.92 + ((variant >>> 6) % 5) * 0.035;
  const heightScale = 0.94 + ((variant >>> 10) % 5) * 0.025;
  const hatStyle = (variant >>> 14) % 3;
  const hairStyle = (variant >>> 17) % 3;

  const modelRoot = new pc.Entity("character-model");
  root.addChild(modelRoot);

  const body = new pc.Entity("character-body");
  modelRoot.addChild(body);

  addPrimitive(body, "hips", "capsule", pants, [0.64, 0.42, 0.5], [0, -0.01, 0]);
  addPrimitive(body, "torso", "capsule", coat, [0.77, 0.82, 0.55], [0, 0.31, 0]);
  addPrimitive(body, "apron", "box", white, [0.58, 0.66, 0.09], [0, 0.28, -0.52]);
  addPrimitive(body, "neck", "cylinder", skin, [0.2, 0.19, 0.2], [0, 0.72, 0]);

  const head = new pc.Entity("head-root");
  head.setLocalPosition(0, 0.94, 0);
  body.addChild(head);
  addPrimitive(head, "head", "sphere", skin, [0.64, 0.68, 0.62], [0, 0, 0]);
  addPrimitive(head, "nose", "sphere", skin, [0.14, 0.12, 0.18], [0, -0.02, -0.58]);
  addPrimitive(head, "eye-left", "sphere", dark, [0.07, 0.075, 0.05], [-0.2, 0.08, -0.57]);
  addPrimitive(head, "eye-right", "sphere", dark, [0.07, 0.075, 0.05], [0.2, 0.08, -0.57]);

  if (hairStyle === 0) {
    addPrimitive(head, "hair-cap", "sphere", hair, [0.66, 0.32, 0.64], [0, 0.34, 0.05]);
  } else if (hairStyle === 1) {
    addPrimitive(head, "hair-left", "sphere", hair, [0.22, 0.45, 0.2], [-0.55, 0.03, 0.06]);
    addPrimitive(head, "hair-right", "sphere", hair, [0.22, 0.45, 0.2], [0.55, 0.03, 0.06]);
  } else {
    addPrimitive(head, "hair-back", "capsule", hair, [0.32, 0.65, 0.28], [0, 0.03, 0.46], [90, 0, 0]);
  }

  if (hatStyle === 0) {
    addPrimitive(head, "toque-band", "cylinder", coat, [0.56, 0.16, 0.56], [0, 0.57, 0]);
    addPrimitive(head, "toque-a", "sphere", white, [0.4, 0.28, 0.4], [-0.2, 0.76, 0]);
    addPrimitive(head, "toque-b", "sphere", white, [0.44, 0.32, 0.44], [0.18, 0.79, 0.01]);
  } else if (hatStyle === 1) {
    addPrimitive(head, "cap", "sphere", coat, [0.64, 0.25, 0.62], [0, 0.5, 0]);
    addPrimitive(head, "cap-brim", "box", coat, [0.5, 0.08, 0.28], [0, 0.46, -0.48]);
  } else {
    addPrimitive(head, "bandana", "box", coat, [0.66, 0.16, 0.62], [0, 0.42, 0]);
    addPrimitive(head, "bandana-tail", "capsule", coat, [0.12, 0.36, 0.12], [0.5, 0.35, 0.3], [55, 0, -20]);
  }

  addPrimitive(body, "scarf", "cylinder", white, [0.35, 0.12, 0.35], [0, 0.67, 0]);
  addPrimitive(body, "button-left", "sphere", dark, [0.055, 0.055, 0.055], [-0.14, 0.38, -0.55]);
  addPrimitive(body, "button-right", "sphere", dark, [0.055, 0.055, 0.055], [0.14, 0.38, -0.55]);

  const leftArm = addArm(body, "left", -0.68, coat, skin);
  const rightArm = addArm(body, "right", 0.68, coat, skin);
  const leftLeg = addLeg(body, "left", -0.3, pants, shoe);
  const rightLeg = addLeg(body, "right", 0.3, pants, shoe);

  let locomotionPhase = (variant % 360) * (Math.PI / 180);
  let throwElapsed = THROW_DURATION_SECONDS;
  let currentYaw = 0;
  let targetYaw = 0;
  let lastPosition = root.getPosition().clone();

  function triggerThrow(direction?: { x: number; z: number }) {
    if (throwElapsed < 0.14) return;
    throwElapsed = 0;
    if (direction && Math.hypot(direction.x, direction.z) > 0.05) {
      targetYaw = Math.atan2(direction.x, -direction.z) * (180 / Math.PI);
    }
  }

  return {
    root,
    triggerThrow,
    update(dt: number) {
      const position = root.getPosition();
      const dx = position.x - lastPosition.x;
      const dz = position.z - lastPosition.z;
      const speed = dt > 0 ? Math.hypot(dx, dz) / dt : 0;
      lastPosition.copy(position);

      const state = resolveLocomotion(speed / GAME.playerSpeed);
      const frequency = state === "run" ? 11 : state === "walk" ? 7 : 2.2;
      locomotionPhase += dt * frequency;
      const locomotion = locomotionPose(state, locomotionPhase);

      if (speed > 0.12) {
        targetYaw = Math.atan2(dx, -dz) * (180 / Math.PI);
      }
      currentYaw += shortestAngleDelta(currentYaw, targetYaw) * (1 - Math.exp(-12 * dt));

      throwElapsed = Math.min(THROW_DURATION_SECONDS, throwElapsed + dt);
      const throwing = throwElapsed < THROW_DURATION_SECONDS;
      const throwLayer = throwing
        ? throwPose(throwElapsed / THROW_DURATION_SECONDS)
        : { shoulderDegrees: 0, elbowDegrees: 0, torsoTwistDegrees: 0, counterArmDegrees: 0 };

      const parentScale = root.getLocalScale();
      modelRoot.setLocalScale(
        widthScale / Math.max(0.01, parentScale.x),
        heightScale / Math.max(0.01, parentScale.y),
        widthScale / Math.max(0.01, parentScale.z),
      );
      modelRoot.setLocalEulerAngles(0, currentYaw, 0);

      const dodgePose = parentScale.y < 0.98;
      const bob = locomotion.bob - (dodgePose ? 0.08 : 0);
      body.setLocalPosition(0, bob, 0);
      body.setLocalEulerAngles(dodgePose ? 11 : locomotion.leanDegrees, throwLayer.torsoTwistDegrees, 0);
      head.setLocalEulerAngles(dodgePose ? -8 : -locomotion.leanDegrees * 0.28, -throwLayer.torsoTwistDegrees * 0.25, 0);

      leftLeg.pivot.setLocalEulerAngles(locomotion.strideDegrees, 0, 0);
      rightLeg.pivot.setLocalEulerAngles(-locomotion.strideDegrees, 0, 0);
      const kneeBend = state === "run" ? Math.max(0, Math.sin(locomotionPhase)) * 28 : Math.max(0, Math.sin(locomotionPhase)) * 14;
      leftLeg.joint.setLocalEulerAngles(Math.max(0, -Math.sin(locomotionPhase)) * kneeBend, 0, 0);
      rightLeg.joint.setLocalEulerAngles(Math.max(0, Math.sin(locomotionPhase)) * kneeBend, 0, 0);

      leftArm.pivot.setLocalEulerAngles(-locomotion.armSwingDegrees + throwLayer.counterArmDegrees, 0, -5);
      leftArm.joint.setLocalEulerAngles(state === "run" ? 18 : 8, 0, 0);
      rightArm.pivot.setLocalEulerAngles(locomotion.armSwingDegrees + throwLayer.shoulderDegrees, 0, 5);
      rightArm.joint.setLocalEulerAngles(throwLayer.elbowDegrees + (state === "run" && !throwing ? 16 : 4), 0, 0);
    },
  };
}
