import * as pc from "playcanvas";

export type LightingQuality = "low" | "medium" | "high";

interface LightingFinishOptions {
  app: pc.Application;
  keyLight: pc.Entity;
  objectiveLight: pc.Entity;
  fillLight: pc.Entity;
}

interface AccentLight {
  entity: pc.Entity;
  baseIntensity: number;
  phase: number;
}

export interface LightingFinishController {
  setQuality(quality: LightingQuality): void;
  update(dt: number): void;
}

const COLORS = {
  warm: new pc.Color(1, 0.64, 0.28),
  cream: new pc.Color(1, 0.88, 0.68),
  berry: new pc.Color(1, 0.28, 0.58),
  mint: new pc.Color(0.24, 0.88, 0.72),
  aqua: new pc.Color(0.12, 0.66, 1),
  violet: new pc.Color(0.54, 0.34, 0.92),
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

  const mediumLights: AccentLight[] = [
    { entity: addOmni(app, "vendor-light-pizza", [-10.5, 3.25, -8.1], COLORS.berry, 0.72, 6.5), baseIntensity: 0.72, phase: 0.1 },
    { entity: addOmni(app, "vendor-light-grill", [-3.5, 3.2, -8.1], COLORS.warm, 0.78, 6.5), baseIntensity: 0.78, phase: 1.1 },
    { entity: addOmni(app, "vendor-light-shake", [3.5, 3.2, -8.1], COLORS.mint, 0.7, 6.5), baseIntensity: 0.7, phase: 2.2 },
    { entity: addOmni(app, "vendor-light-dessert", [10.5, 3.25, -8.1], COLORS.cream, 0.74, 6.5), baseIntensity: 0.74, phase: 3.2 },
    { entity: addOmni(app, "rim-light-west", [-13.8, 2.8, 1.4], COLORS.aqua, 0.44, 7.5), baseIntensity: 0.44, phase: 0.7 },
    { entity: addOmni(app, "rim-light-east", [13.8, 2.8, -1.4], COLORS.violet, 0.44, 7.5), baseIntensity: 0.44, phase: 2.7 },
  ];

  const highLights: AccentLight[] = [
    { entity: addOmni(app, "corner-light-nw", [-13.5, 2.3, -6.9], COLORS.aqua, 0.32, 5.6), baseIntensity: 0.32, phase: 0.4 },
    { entity: addOmni(app, "corner-light-ne", [13.5, 2.3, -6.9], COLORS.berry, 0.32, 5.6), baseIntensity: 0.32, phase: 1.4 },
    { entity: addOmni(app, "corner-light-sw", [-13.5, 2.1, 6.9], COLORS.violet, 0.28, 5.2), baseIntensity: 0.28, phase: 2.4 },
    { entity: addOmni(app, "corner-light-se", [13.5, 2.1, 6.9], COLORS.mint, 0.28, 5.2), baseIntensity: 0.28, phase: 3.4 },
  ];

  let quality: LightingQuality = "medium";
  let elapsed = 0;

  function setQuality(next: LightingQuality) {
    quality = next;
    for (const light of mediumLights) light.entity.enabled = next !== "low";
    for (const light of highLights) light.entity.enabled = next === "high";

    if (keyLight.light) {
      keyLight.light.intensity = next === "low" ? 1.35 : next === "medium" ? 1.52 : 1.62;
      keyLight.light.castShadows = next !== "low";
    }
    if (fillLight.light) {
      fillLight.enabled = next !== "low";
      fillLight.light.intensity = next === "high" ? 0.42 : 0.34;
    }
    if (objectiveLight.light) {
      objectiveLight.enabled = next !== "low";
      objectiveLight.light.intensity = next === "high" ? 1.55 : 1.25;
      objectiveLight.light.range = next === "high" ? 10.5 : 8.5;
    }

    app.scene.ambientLight = next === "low"
      ? new pc.Color(0.4, 0.36, 0.46)
      : next === "medium"
        ? new pc.Color(0.31, 0.275, 0.37)
        : new pc.Color(0.27, 0.235, 0.33);
  }

  function update(dt: number) {
    elapsed += dt;
    if (quality === "low") return;

    const density = quality === "high" ? 1 : 0.7;
    for (const light of mediumLights) {
      if (!light.entity.light) continue;
      light.entity.light.intensity = light.baseIntensity * (1 + Math.sin(elapsed * 1.8 + light.phase) * 0.035 * density);
    }
    if (quality === "high") {
      for (const light of highLights) {
        if (!light.entity.light) continue;
        light.entity.light.intensity = light.baseIntensity * (1 + Math.sin(elapsed * 1.35 + light.phase) * 0.045);
      }
    }

    if (objectiveLight.light) {
      const base = quality === "high" ? 1.55 : 1.25;
      objectiveLight.light.intensity = base * (1 + Math.sin(elapsed * 2.4) * 0.045);
    }
  }

  setQuality(quality);
  return { setQuality, update };
}
