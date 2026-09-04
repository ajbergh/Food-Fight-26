import * as pc from "playcanvas";
import { createArenaProductionProps } from "./arenaProductionProps";

export type LightingQuality = "low" | "medium" | "high";

interface LightingFinishOptions {
  app: pc.Application;
  keyLight: pc.Entity;
  objectiveLight: pc.Entity;
  fillLight: pc.Entity;
}

export interface LightingFinishController {
  setQuality(quality: LightingQuality): void;
  update(dt: number): void;
}

const COLORS = {
  warm: new pc.Color(1, 0.64, 0.28),
  mint: new pc.Color(0.24, 0.88, 0.72),
};

function addOmni(
  app: pc.Application,
  name: string,
  position: [number, number, number],
  color: pc.Color,
  intensity: number,
  range: number,
) {
  const entity = new pc.Entity(name);
  entity.addComponent("light", {
    type: "omni",
    color,
    intensity,
    range,
    castShadows: false,
  });
  entity.setPosition(...position);
  app.root.addChild(entity);
  return entity;
}

export function createLightingFinish(options: LightingFinishOptions): LightingFinishController {
  const { app, keyLight, objectiveLight, fillLight } = options;

  // Keep the default medium renderer at the pre-M9 dynamic-light count. The commercial
  // separation at medium comes from material response plus key/fill/objective grading.
  // High adds only two static, non-shadow-casting vendor fills.
  const highLights = [
    addOmni(app, "vendor-fill-west", [-6.7, 3.1, -7.7], COLORS.warm, 0.38, 7.4),
    addOmni(app, "vendor-fill-east", [6.7, 3.1, -7.7], COLORS.mint, 0.34, 7.4),
  ];

  // Production prop assets are part of the High-quality visual tier. Resolve the
  // existing presentation root once and defer all network/parse cost until High is
  // actually requested. The procedural arena remains the fallback if loading fails.
  const highDetailRoot = app.root.findByName("high-detail") as pc.Entity | null;
  const productionProps = highDetailRoot
    ? createArenaProductionProps({ app, highDetailRoot })
    : undefined;

  let quality: LightingQuality = "medium";

  function setQuality(next: LightingQuality) {
    quality = next;
    for (const light of highLights) light.enabled = next === "high";
    if (next === "high") void productionProps?.ensureLoaded();

    if (keyLight.light) {
      keyLight.light.intensity = next === "low" ? 1.35 : next === "medium" ? 1.48 : 1.56;
      keyLight.light.castShadows = next !== "low";
    }
    if (fillLight.light) {
      fillLight.enabled = next !== "low";
      fillLight.light.intensity = next === "high" ? 0.39 : 0.33;
    }
    if (objectiveLight.light) {
      objectiveLight.enabled = next !== "low";
      objectiveLight.light.intensity = next === "high" ? 1.42 : 1.22;
      objectiveLight.light.range = next === "high" ? 9.3 : 8.25;
    }

    app.scene.ambientLight = next === "low"
      ? new pc.Color(0.4, 0.36, 0.46)
      : next === "medium"
        ? new pc.Color(0.31, 0.275, 0.37)
        : new pc.Color(0.27, 0.235, 0.33);
  }

  function update(_dt: number) {
    // Lighting state is static between quality changes. Objective life is carried by
    // the existing pulsing ring, avoiding per-frame light invalidation on slower GPUs.
  }

  setQuality(quality);
  return { setQuality, update };
}
