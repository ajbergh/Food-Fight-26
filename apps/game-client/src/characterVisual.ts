import * as pc from "playcanvas";
import { GAME } from "@foodfight/game-core";
import {
  locomotionPose,
  resolveLocomotion,
  THROW_DURATION_SECONDS,
  throwPose,
} from "./characterAnimation";

type PrimitiveType = "box" | "sphere" | "cylinder" | "cone" | "capsule";
export type CharacterThrowKind = "tomato" | "banana";

export interface CharacterVisual {
  root: pc.Entity;
  setVisible(visible: boolean): void;
  update(dt: number): void;
  triggerThrow(direction?: { x: number; z: number }, kind?: CharacterThrowKind): void;
}

interface CharacterVisualOptions {
  root: pc.Entity;
  accent: pc.Color;
  sessionId: string;
}

interface Limb {
  pivot: pc.Entity;
  joint: pc.Entity;
  hand?: pc.Entity;
  shoe?: pc.Entity;
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

function makeMaterial(color: pc.Color, gloss = 0.34, emissive?: pc.Color) {
  const value = new pc.StandardMaterial();
  value.diffuse = cloneColor(color);
  value.gloss = gloss;
  value.metalness = 0.02;
  if (emissive) value.emissive = cloneColor(emissive);
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
  cuff: pc.Material,
  skin: pc.Material,
): Limb {
  const sign = side === "left" ? -1 : 1;
  const shoulder = new pc.Entity(`${side}-shoulder`);
  shoulder.setLocalPosition(x, 0.47, 0);
  body.addChild(shoulder);

  addPrimitive(shoulder, `${side}-upper-arm`, "capsule", coat, [0.23, 0.48, 0.23], [0, -0.23, 0], [0, 0, sign * 5]);

  const elbow = new pc.Entity(`${side}-elbow`);
  elbow.setLocalPosition(0, -0.44, 0);
  shoulder.addChild(elbow);
  addPrimitive(elbow, `${side}-forearm`, "capsule", coat, [0.21, 0.43, 0.21], [0, -0.2, 0]);
  addPrimitive(elbow, `${side}-cuff`, "cylinder", cuff, [0.24, 0.09, 0.24], [0, -0.39, 0]);
  const hand = addPrimitive(elbow, `${side}-hand`, "sphere", skin, [0.26, 0.25, 0.26], [0, -0.5, -0.01]);

  return { pivot: shoulder, joint: elbow, hand };
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
  addPrimitive(hip, `${side}-upper-leg`, "capsule", pants, [0.26, 0.4, 0.27], [0, -0.19, 0]);

  const knee = new pc.Entity(`${side}-knee`);
  knee.setLocalPosition(0, -0.37, 0);
  hip.addChild(knee);
  addPrimitive(knee, `${side}-lower-leg`, "capsule", pants, [0.23, 0.36, 0.24], [0, -0.17, 0]);
  const shoeEntity = addPrimitive(knee, `${side}-shoe`, "sphere", shoe, [0.35, 0.19, 0.5], [0, -0.36, -0.1]);

  return { pivot: hip, joint: knee, shoe: shoeEntity };
}

function addTomato(parent: pc.Entity, tomato: pc.Material, stem: pc.Material) {
  const root = new pc.Entity("held-tomato");
  root.setLocalPosition(0, -0.08, -0.24);
  root.setLocalScale(0.74, 0.74, 0.74);
  parent.addChild(root);
  addPrimitive(root, "fruit", "sphere", tomato, [0.5, 0.46, 0.5], [0, 0, 0]);
  addPrimitive(root, "stem", "cone", stem, [0.18, 0.17, 0.18], [0, 0.27, 0]);
  root.enabled = false;
  return root;
}

function addBanana(parent: pc.Entity, banana: pc.Material, stem: pc.Material) {
  const root = new pc.Entity("held-banana");
  root.setLocalPosition(0.04, -0.05, -0.27);
  root.setLocalScale(0.68, 0.68, 0.68);
  parent.addChild(root);
  for (const [index, angle] of [-28, 0, 28].entries()) {
    addPrimitive(
      root,
      `peel-${index}`,
      "capsule",
      banana,
      [0.13, 0.42, 0.13],
      [(index - 1) * 0.14, 0, Math.abs(index - 1) * 0.03],
      [68, 0, angle],
    );
  }
  addPrimitive(root, "stem", "cylinder", stem, [0.07, 0.11, 0.07], [0, 0.09, 0]);
  root.enabled = false;
  return root;
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
  const white = makeMaterial(new pc.Color(0.97, 0.95, 0.91), 0.32);
  const warmWhite = makeMaterial(new pc.Color(0.9, 0.86, 0.8), 0.28);
  const coat = makeMaterial(accent, 0.38);
  const pants = makeMaterial(new pc.Color(0.14, 0.115, 0.18), 0.25);
  const shoe = makeMaterial(new pc.Color(0.045, 0.038, 0.055), 0.34);
  const dark = makeMaterial(new pc.Color(0.075, 0.055, 0.085), 0.25);
  const tomato = makeMaterial(new pc.Color(0.95, 0.08, 0.045), 0.55);
  const green = makeMaterial(new pc.Color(0.12, 0.54, 0.2), 0.3);
  const banana = makeMaterial(new pc.Color(1, 0.78, 0.04), 0.42);
  const brown = makeMaterial(new pc.Color(0.31, 0.16, 0.055), 0.28);

  const widthScale = 0.92 + ((variant >>> 6) % 5) * 0.035;
  const heightScale = 0.94 + ((variant >>> 10) % 5) * 0.025;
  const hatStyle = (variant >>> 14) % 3;
  const hairStyle = (variant >>> 17) % 3;

  const modelRoot = new pc.Entity("character-model");
  root.addChild(modelRoot);

  const body = new pc.Entity("character-body");
  modelRoot.addChild(body);

  addPrimitive(body, "hips", "capsule", pants, [0.66, 0.43, 0.52], [0, -0.02, 0]);
  addPrimitive(body, "torso", "capsule", coat, [0.8, 0.84, 0.58], [0, 0.31, 0]);
  addPrimitive(body, "shirt-front", "box", white, [0.52, 0.55, 0.055], [0, 0.34, -0.55]);
  addPrimitive(body, "apron", "box", warmWhite, [0.62, 0.68, 0.07], [0, 0.05, -0.57]);
  addPrimitive(body, "apron-belt", "box", coat, [0.72, 0.1, 0.09], [0, 0.08, -0.62]);
  addPrimitive(body, "lapel-left", "box", white, [0.2, 0.52, 0.07], [-0.19, 0.48, -0.58], [0, 0, -18]);
  addPrimitive(body, "lapel-right", "box", white, [0.2, 0.52, 0.07], [0.19, 0.48, -0.58], [0, 0, 18]);
  addPrimitive(body, "neck", "cylinder", skin, [0.2, 0.19, 0.2], [0, 0.74, 0]);

  const head = new pc.Entity("head-root");
  head.setLocalPosition(0, 0.98, 0);
  body.addChild(head);
  addPrimitive(head, "head", "sphere", skin, [0.65, 0.69, 0.63], [0, 0, 0]);
  addPrimitive(head, "ear-left", "sphere", skin, [0.13, 0.18, 0.11], [-0.61, -0.02, 0]);
  addPrimitive(head, "ear-right", "sphere", skin, [0.13, 0.18, 0.11], [0.61, -0.02, 0]);
  addPrimitive(head, "nose", "sphere", skin, [0.15, 0.13, 0.19], [0, -0.02, -0.59]);
  addPrimitive(head, "eye-left", "sphere", dark, [0.072, 0.08, 0.052], [-0.2, 0.09, -0.58]);
  addPrimitive(head, "eye-right", "sphere", dark, [0.072, 0.08, 0.052], [0.2, 0.09, -0.58]);
  const browLeft = addPrimitive(head, "brow-left", "box", hair, [0.18, 0.035, 0.03], [-0.2, 0.22, -0.61], [0, 0, 4]);
  const browRight = addPrimitive(head, "brow-right", "box", hair, [0.18, 0.035, 0.03], [0.2, 0.22, -0.61], [0, 0, -4]);
  const mouth = addPrimitive(head, "mouth", "box", dark, [0.2, 0.035, 0.025], [0, -0.23, -0.61]);

  if (hairStyle === 0) {
    addPrimitive(head, "hair-cap", "sphere", hair, [0.67, 0.33, 0.65], [0, 0.35, 0.05]);
  } else if (hairStyle === 1) {
    addPrimitive(head, "hair-left", "sphere", hair, [0.22, 0.45, 0.2], [-0.55, 0.03, 0.06]);
    addPrimitive(head, "hair-right", "sphere", hair, [0.22, 0.45, 0.2], [0.55, 0.03, 0.06]);
  } else {
    addPrimitive(head, "hair-back", "capsule", hair, [0.32, 0.65, 0.28], [0, 0.03, 0.46], [90, 0, 0]);
  }

  if (hatStyle === 0) {
    addPrimitive(head, "toque-band", "cylinder", coat, [0.57, 0.16, 0.57], [0, 0.58, 0]);
    addPrimitive(head, "toque-a", "sphere", white, [0.4, 0.28, 0.4], [-0.2, 0.77, 0]);
    addPrimitive(head, "toque-b", "sphere", white, [0.44, 0.32, 0.44], [0.18, 0.8, 0.01]);
    addPrimitive(head, "toque-c", "sphere", white, [0.31, 0.26, 0.31], [0, 0.89, -0.08]);
  } else if (hatStyle === 1) {
    addPrimitive(head, "cap", "sphere", coat, [0.64, 0.25, 0.62], [0, 0.51, 0]);
    addPrimitive(head, "cap-brim", "box", coat, [0.5, 0.08, 0.28], [0, 0.47, -0.48]);
  } else {
    addPrimitive(head, "bandana", "box", coat, [0.66, 0.16, 0.62], [0, 0.43, 0]);
    addPrimitive(head, "bandana-tail", "capsule", coat, [0.12, 0.36, 0.12], [0.5, 0.35, 0.3], [55, 0, -20]);
  }

  const scarf = addPrimitive(body, "scarf", "cylinder", white, [0.36, 0.12, 0.36], [0, 0.69, 0]);
  addPrimitive(body, "button-left-top", "sphere", dark, [0.055, 0.055, 0.055], [-0.14, 0.43, -0.6]);
  addPrimitive(body, "button-right-top", "sphere", dark, [0.055, 0.055, 0.055], [0.14, 0.43, -0.6]);
  addPrimitive(body, "button-left-bottom", "sphere", dark, [0.05, 0.05, 0.05], [-0.14, 0.24, -0.61]);
  addPrimitive(body, "button-right-bottom", "sphere", dark, [0.05, 0.05, 0.05], [0.14, 0.24, -0.61]);

  const leftArm = addArm(body, "left", -0.7, coat, white, skin);
  const rightArm = addArm(body, "right", 0.7, coat, white, skin);
  const leftLeg = addLeg(body, "left", -0.3, pants, shoe);
  const rightLeg = addLeg(body, "right", 0.3, pants, shoe);

  const heldTomato = addTomato(rightArm.hand!, tomato, green);
  const heldBanana = addBanana(rightArm.hand!, banana, brown);

  let locomotionPhase = (variant % 360) * (Math.PI / 180);
  let throwElapsed = THROW_DURATION_SECONDS;
  let throwKind: CharacterThrowKind = "tomato";
  let currentYaw = 0;
  let targetYaw = 0;
  let lastPosition = root.getPosition().clone();

  function triggerThrow(direction?: { x: number; z: number }, kind: CharacterThrowKind = "tomato") {
    if (throwElapsed < 0.12) return;
    throwElapsed = 0;
    throwKind = kind;
    heldTomato.enabled = kind === "tomato";
    heldBanana.enabled = kind === "banana";
    if (direction && Math.hypot(direction.x, direction.z) > 0.05) {
      targetYaw = Math.atan2(direction.x, -direction.z) * (180 / Math.PI);
    }
  }

  return {
    root,
    setVisible(visible: boolean) {
      modelRoot.enabled = visible;
    },
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
      const throwProgress = Math.min(1, throwElapsed / THROW_DURATION_SECONDS);
      const throwLayer = throwing
        ? throwPose(throwProgress)
        : { shoulderDegrees: 0, elbowDegrees: 0, torsoTwistDegrees: 0, counterArmDegrees: 0 };

      // Hold the food through anticipation, then hide it just before the authoritative projectile appears to leave the hand.
      const propVisible = throwing && throwProgress < 0.53;
      heldTomato.enabled = propVisible && throwKind === "tomato";
      heldBanana.enabled = propVisible && throwKind === "banana";

      const parentScale = root.getLocalScale();
      const anticipation = throwing && throwProgress < 0.3 ? Math.sin((throwProgress / 0.3) * Math.PI) * 0.035 : 0;
      const releaseLift = throwing && throwProgress >= 0.3 && throwProgress < 0.62
        ? Math.sin(((throwProgress - 0.3) / 0.32) * Math.PI) * 0.045
        : 0;
      modelRoot.setLocalScale(
        widthScale * (1 + anticipation) / Math.max(0.01, parentScale.x),
        heightScale * (1 - anticipation + releaseLift) / Math.max(0.01, parentScale.y),
        widthScale * (1 - anticipation * 0.5) / Math.max(0.01, parentScale.z),
      );
      modelRoot.setLocalEulerAngles(0, currentYaw, 0);

      const dodgePose = parentScale.y < 0.98;
      const bob = locomotion.bob - (dodgePose ? 0.08 : 0) + releaseLift * 0.25;
      body.setLocalPosition(0, bob, 0);
      body.setLocalEulerAngles(dodgePose ? 11 : locomotion.leanDegrees, throwLayer.torsoTwistDegrees, 0);
      head.setLocalEulerAngles(dodgePose ? -8 : -locomotion.leanDegrees * 0.28, -throwLayer.torsoTwistDegrees * 0.25, 0);
      scarf.setLocalEulerAngles(Math.sin(locomotionPhase) * (state === "run" ? 9 : 4), 0, 0);

      const expression = throwing ? Math.sin(Math.min(1, throwProgress / 0.58) * Math.PI) : 0;
      browLeft.setLocalEulerAngles(0, 0, 4 - expression * 15);
      browRight.setLocalEulerAngles(0, 0, -4 + expression * 15);
      mouth.setLocalScale(0.2 + expression * 0.08, 0.035 + expression * 0.025, 0.025);

      leftLeg.pivot.setLocalEulerAngles(locomotion.strideDegrees, 0, 0);
      rightLeg.pivot.setLocalEulerAngles(-locomotion.strideDegrees, 0, 0);
      const kneeScale = state === "run" ? 30 : state === "walk" ? 15 : 0;
      leftLeg.joint.setLocalEulerAngles(Math.max(0, -Math.sin(locomotionPhase)) * kneeScale, 0, 0);
      rightLeg.joint.setLocalEulerAngles(Math.max(0, Math.sin(locomotionPhase)) * kneeScale, 0, 0);
      leftLeg.shoe?.setLocalEulerAngles(state === "run" ? Math.max(0, Math.sin(locomotionPhase)) * -18 : 0, 0, 0);
      rightLeg.shoe?.setLocalEulerAngles(state === "run" ? Math.max(0, -Math.sin(locomotionPhase)) * -18 : 0, 0, 0);

      leftArm.pivot.setLocalEulerAngles(-locomotion.armSwingDegrees + throwLayer.counterArmDegrees, 0, -5);
      leftArm.joint.setLocalEulerAngles(state === "run" ? 18 : 8, 0, 0);
      rightArm.pivot.setLocalEulerAngles(locomotion.armSwingDegrees + throwLayer.shoulderDegrees, 0, 5);
      rightArm.joint.setLocalEulerAngles(throwLayer.elbowDegrees + (state === "run" && !throwing ? 16 : 4), 0, 0);
    },
  };
}
