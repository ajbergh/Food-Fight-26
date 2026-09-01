import { GAME } from "@foodfight/game-core";
import * as pc from "playcanvas";
import { resolveLocomotion } from "./characterAnimation";
import type { CharacterThrowKind, CharacterVisual } from "./characterVisual";
import type { SkeletalPilotInstance, SkeletalPilotClip } from "./skeletalPilot";

const PILOT_WORLD_SCALE = 0.9;
const PLAYER_ROOT_HEIGHT = 0.9;

interface SkeletalCharacterVisualOptions {
  root: pc.Entity;
  pilot: SkeletalPilotInstance;
}

export function createSkeletalCharacterVisual(
  options: SkeletalCharacterVisualOptions,
): CharacterVisual {
  const { root, pilot } = options;
  let lastPosition = root.getPosition().clone();
  let currentYaw = 0;
  let targetYaw = 0;
  let locomotion: SkeletalPilotClip = "idle";
  let throwRemaining = 0;

  function applyModelTransform() {
    const parentScale = root.getLocalScale();
    pilot.entity.setLocalScale(
      PILOT_WORLD_SCALE / Math.max(0.01, parentScale.x),
      PILOT_WORLD_SCALE / Math.max(0.01, parentScale.y),
      PILOT_WORLD_SCALE / Math.max(0.01, parentScale.z),
    );
    pilot.entity.setLocalPosition(
      0,
      -PLAYER_ROOT_HEIGHT / Math.max(0.01, parentScale.y),
      0,
    );
    pilot.entity.setLocalEulerAngles(0, currentYaw, 0);
  }

  applyModelTransform();

  return {
    root,
    setVisible(visible: boolean) {
      pilot.entity.enabled = visible;
    },
    triggerThrow(
      direction?: { x: number; z: number },
      _kind?: CharacterThrowKind,
    ) {
      if (direction && Math.hypot(direction.x, direction.z) > 0.05) {
        targetYaw = Math.atan2(direction.x, -direction.z) * (180 / Math.PI);
      }
      throwRemaining = Math.max(0.1, pilot.duration("throw_food"));
      pilot.transition("throw_food", 0.06);
    },
    update(dt: number) {
      const position = root.getPosition();
      const dx = position.x - lastPosition.x;
      const dz = position.z - lastPosition.z;
      const speed = dt > 0 ? Math.hypot(dx, dz) / dt : 0;
      lastPosition.copy(position);

      if (speed > 0.12) {
        targetYaw = Math.atan2(dx, -dz) * (180 / Math.PI);
      }
      currentYaw +=
        shortestAngleDelta(currentYaw, targetYaw) * (1 - Math.exp(-12 * dt));

      const nextLocomotion = resolveLocomotion(speed / GAME.playerSpeed);
      if (throwRemaining > 0) {
        throwRemaining = Math.max(0, throwRemaining - dt);
        if (throwRemaining === 0) {
          locomotion = nextLocomotion;
          pilot.transition(locomotion, 0.12);
        }
      } else if (nextLocomotion !== locomotion) {
        locomotion = nextLocomotion;
        pilot.transition(locomotion, 0.12);
      }

      applyModelTransform();
    },
  };
}

function shortestAngleDelta(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}
