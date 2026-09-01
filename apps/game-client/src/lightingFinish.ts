import * as pc from "playcanvas";

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

  // Medium quality keeps a static four-light vendor wash. Static accent lights avoid
  // per-frame light-list invalidation on software/headless renderers.
  const mediumLights = [
    addOmni(app, "vendor-light-pizza", [-10.5, 3.25, -8.1], COLORS.berry, 0.62, 6.0),
    addOmni(app, "vendor-light-grill", [-3.5, 3.2, -8.1], COLORS.warm, 0.68, 6.0),
    addOmni(app, "vendor-light-shake", [3.5, 3.2, -8.1], COLORS.mint, 0.6, 6.0),
    addOmni(app, "vendor-light-dessert", [10.5, 3.25, -8.1], COLORS.cream, 0.64, 6.0),
  ];

  // Rim and corner accents are high-only. They remain static and never cast shadows.
  const highLights = [
    addOmni(app, "rim-light-west", [-13.8, 2.8, 1.4], COLORS.aqua, 0.36, 7.0),
    addOmni(app, "rim-light-east", [13.8, 2.8, -1.4], COLORS.violet, 0.36, 7.0),
    addOmni(app, "corner-light-nw", [-13.5, 2.3, -6.9], COLORS.aqua, 0.26, 5.2),
    addOmni(app, "corner-light-ne", [13.5, 2.3, -6.9], COLORS.berry, 0.26, 5.2),
    addOmni(app, "corner-light-sw", [-13.5, 2.1, 6.9], COLORS.violet, 0.22, 4.9),
    addOmni(app, "corner-light-se", [13.5, 2.1, 6.9], COLORS.mint, 0.22, 4.9),
  ];

  let quality: LightingQuality = "medium";
  let elapsed = 0;

  function setQuality(next: LightingQuality) {
    quality = next;
    for (const light of mediumLights) light.enabled = next !== "low";
    for (const light of highLights) light.enabled = next === "high";

    if (keyLight.light) {
      keyLight.light.intensity = next === "low" ? 1.35 : next === "medium" ? 1.48 : 1.58;
      keyLight.light.castShadows = next !== "low";
    }
    if (fillLight.light) {
      fillLight.enabled = next !== "low";
      fillLight.light.intensity = next === "high" ? 0.4 : 0.33;
    }
    if (objectiveLight.light) {
      objectiveLight.enabled = next !== "low";
      objectiveLight.light.intensity = next === "high" ? 1.5 : 1.22;
      objectiveLight.light.range = next === "high" ? 10 : 8.25;
    }

    app.scene.ambientLight = next === "low"
      ? new pc.Color(0.4, 0.36, 0.46)
      : next === "medium"
        ? new pc.Color(0.31, 0.275, 0.37)
        : new pc.Color(0.27, 0.235, 0.33);
  }

  function update(dt: number) {
    elapsed += dt;
    if (quality === "low" || !objectiveLight.light) return;

    // Only the single pre-existing objective light animates. Accent lights are static.
    const base = quality === "high" ? 1.5 : 1.22;
    objectiveLight.light.intensity = base * (1 + Math.sin(elapsed * 2.1) * 0.03);
  }

  setQuality(quality);
  return { setQuality, update };
}
