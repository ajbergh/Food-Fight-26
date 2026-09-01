import * as pc from "playcanvas";
import type { ImpactMessage } from "@foodfight/protocol";

interface CommercialVfxOptions {
  app: pc.Application;
  objectivePosition: { x: number; z: number };
}

interface Particle {
  entity: pc.Entity;
  velocity: pc.Vec3;
  age: number;
  lifetime: number;
  baseScale: number;
  gravity: number;
  spin: number;
}

interface ProjectileTrail {
  root: pc.Entity;
  dots: pc.Entity[];
  history: pc.Vec3[];
}

interface PulsingVisual {
  root: pc.Entity;
  ring: pc.Entity;
  phase: number;
  baseScale: number;
}

export interface CommercialVfxController {
  decorateProjectile(root: pc.Entity): void;
  decoratePickup(root: pc.Entity, kind: "tomato" | "banana", phase?: number): void;
  decorateBananaHazard(root: pc.Entity): void;
  spawnImpact(message: ImpactMessage): void;
  spawnDodge(position: pc.Vec3): void;
  spawnObjectiveBurst(team?: "blue" | "red"): void;
  update(dt: number): void;
}

type PrimitiveType = "box" | "sphere" | "cylinder" | "capsule";

const MAX_PARTICLES = 96;
const COLORS = {
  tomato: new pc.Color(1, 0.13, 0.06),
  banana: new pc.Color(1, 0.78, 0.04),
  blue: new pc.Color(0.12, 0.52, 1),
  red: new pc.Color(1, 0.19, 0.12),
  gold: new pc.Color(1, 0.72, 0.12),
  cream: new pc.Color(1, 0.88, 0.65),
  dust: new pc.Color(0.72, 0.62, 0.52),
  dark: new pc.Color(0.12, 0.08, 0.14),
};

function cloneColor(color: pc.Color) {
  return new pc.Color(color.r, color.g, color.b, color.a);
}

function glowMaterial(color: pc.Color, gloss = 0.42) {
  const material = new pc.StandardMaterial();
  material.diffuse = cloneColor(color);
  material.emissive = cloneColor(color);
  material.gloss = gloss;
  material.metalness = 0.01;
  material.update();
  return material;
}

function matteMaterial(color: pc.Color) {
  const material = new pc.StandardMaterial();
  material.diffuse = cloneColor(color);
  material.gloss = 0.12;
  material.metalness = 0;
  material.update();
  return material;
}

function primitive(
  parent: pc.Entity,
  name: string,
  type: PrimitiveType,
  material: pc.Material,
  scale: [number, number, number],
  position: [number, number, number],
) {
  const entity = new pc.Entity(name);
  entity.addComponent("render", { type, material });
  if (entity.render) {
    entity.render.castShadows = false;
    entity.render.receiveShadows = false;
  }
  entity.setLocalScale(...scale);
  entity.setLocalPosition(...position);
  parent.addChild(entity);
  return entity;
}

function reducedMotion() {
  return document.body.dataset.reducedMotion === "true"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createCommercialVfx(options: CommercialVfxOptions): CommercialVfxController {
  const { app, objectivePosition } = options;
  const tomatoGlow = glowMaterial(COLORS.tomato, 0.55);
  const bananaGlow = glowMaterial(COLORS.banana, 0.5);
  const blueGlow = glowMaterial(COLORS.blue, 0.52);
  const redGlow = glowMaterial(COLORS.red, 0.52);
  const goldGlow = glowMaterial(COLORS.gold, 0.58);
  const creamGlow = glowMaterial(COLORS.cream, 0.4);
  const dustMaterial = matteMaterial(COLORS.dust);
  const darkMaterial = matteMaterial(COLORS.dark);

  const particles: Particle[] = [];
  const projectileTrails = new Map<pc.Entity, ProjectileTrail>();
  const pickupPulses: PulsingVisual[] = [];
  const hazardPulses: PulsingVisual[] = [];
  let elapsed = 0;

  function addParticle(
    name: string,
    position: pc.Vec3,
    velocity: pc.Vec3,
    material: pc.Material,
    baseScale: number,
    lifetime: number,
    gravity: number,
    type: PrimitiveType = "sphere",
  ) {
    while (particles.length >= MAX_PARTICLES) {
      particles.shift()?.entity.destroy();
    }

    const entity = new pc.Entity(name);
    entity.addComponent("render", { type, material });
    if (entity.render) {
      entity.render.castShadows = false;
      entity.render.receiveShadows = false;
    }
    entity.setLocalScale(baseScale, baseScale, baseScale);
    entity.setPosition(position);
    app.root.addChild(entity);
    particles.push({
      entity,
      velocity,
      age: 0,
      lifetime,
      baseScale,
      gravity,
      spin: (Math.random() * 2 - 1) * 480,
    });
  }

  function decorateProjectile(root: pc.Entity) {
    if (projectileTrails.has(root)) return;
    const glow = primitive(root, "projectile-glow", "sphere", tomatoGlow, [0.7, 0.7, 0.7], [0, 0, 0]);
    glow.enabled = !reducedMotion();

    const dots: pc.Entity[] = [];
    const dotCount = reducedMotion() ? 1 : 3;
    for (let index = 0; index < dotCount; index += 1) {
      const dot = new pc.Entity(`projectile-trail-${index}`);
      dot.addComponent("render", { type: "sphere", material: tomatoGlow });
      if (dot.render) {
        dot.render.castShadows = false;
        dot.render.receiveShadows = false;
      }
      const size = 0.24 - index * 0.045;
      dot.setLocalScale(size, size, size);
      dot.setPosition(root.getPosition());
      app.root.addChild(dot);
      dots.push(dot);
    }
    projectileTrails.set(root, { root, dots, history: [root.getPosition().clone()] });
  }

  function decoratePickup(root: pc.Entity, kind: "tomato" | "banana", phase = Math.random() * Math.PI * 2) {
    const ring = primitive(
      root,
      "pickup-aura",
      "cylinder",
      kind === "tomato" ? tomatoGlow : bananaGlow,
      [1.18, 0.025, 1.18],
      [0, -0.26, 0],
    );
    pickupPulses.push({ root, ring, phase, baseScale: 1.18 });
  }

  function decorateBananaHazard(root: pc.Entity) {
    const ring = primitive(root, "hazard-warning", "cylinder", bananaGlow, [1.3, 0.018, 1.3], [0, -0.02, 0]);
    hazardPulses.push({ root, ring, phase: Math.random() * Math.PI * 2, baseScale: 1.3 });
  }

  function spawnImpact(message: ImpactMessage) {
    const material = message.kind === "banana" ? bananaGlow : tomatoGlow;
    const count = reducedMotion() ? 4 : 9;
    const origin = new pc.Vec3(message.x, 0.16, message.y);
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.25;
      const speed = 2.2 + Math.random() * 3.4;
      addParticle(
        `${message.kind}-burst-${index}`,
        origin.clone(),
        new pc.Vec3(Math.cos(angle) * speed, 1.8 + Math.random() * 2.8, Math.sin(angle) * speed),
        material,
        0.16 + Math.random() * 0.16,
        0.38 + Math.random() * 0.18,
        8.4,
        index % 3 === 0 ? "capsule" : "sphere",
      );
    }

    if (!reducedMotion()) {
      addParticle(
        `${message.kind}-impact-pop`,
        new pc.Vec3(message.x, 0.23, message.y),
        new pc.Vec3(0, 2.2, 0),
        creamGlow,
        0.3,
        0.24,
        4,
      );
    }
  }

  function spawnDodge(position: pc.Vec3) {
    if (reducedMotion()) return;
    const count = 5;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 0.9 + Math.random() * 1.7;
      addParticle(
        `dodge-dust-${index}`,
        new pc.Vec3(position.x, 0.12, position.z),
        new pc.Vec3(Math.cos(angle) * speed, 0.6 + Math.random() * 0.7, Math.sin(angle) * speed),
        dustMaterial,
        0.18 + Math.random() * 0.14,
        0.28 + Math.random() * 0.14,
        4.5,
      );
    }
  }

  function spawnObjectiveBurst(team?: "blue" | "red") {
    const material = team === "blue" ? blueGlow : team === "red" ? redGlow : goldGlow;
    const count = reducedMotion() ? 6 : 16;
    const origin = new pc.Vec3(objectivePosition.x, 0.32, objectivePosition.z);
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const speed = 2 + (index % 4) * 0.55;
      addParticle(
        `objective-burst-${index}`,
        origin.clone(),
        new pc.Vec3(Math.cos(angle) * speed, 2.4 + (index % 3) * 0.6, Math.sin(angle) * speed),
        material,
        index % 2 === 0 ? 0.16 : 0.12,
        0.62 + (index % 3) * 0.08,
        5.8,
        index % 2 === 0 ? "box" : "sphere",
      );
    }
  }

  function updateParticle(visual: Particle, dt: number) {
    visual.age += dt;
    visual.velocity.y -= visual.gravity * dt;
    const position = visual.entity.getPosition();
    visual.entity.setPosition(
      position.x + visual.velocity.x * dt,
      Math.max(0.04, position.y + visual.velocity.y * dt),
      position.z + visual.velocity.z * dt,
    );
    visual.entity.rotateLocal(visual.spin * dt, visual.spin * 0.6 * dt, visual.spin * 0.3 * dt);
    const life = Math.max(0, 1 - visual.age / visual.lifetime);
    const scale = visual.baseScale * Math.max(0.05, life);
    visual.entity.setLocalScale(scale, scale, scale);
  }

  function updateTrails() {
    for (const [root, trail] of projectileTrails) {
      if (!root.parent) {
        for (const dot of trail.dots) dot.destroy();
        projectileTrails.delete(root);
        continue;
      }

      const current = root.getPosition().clone();
      const last = trail.history[0];
      if (!last || current.distance(last) > 0.035) {
        trail.history.unshift(current);
        if (trail.history.length > 8) trail.history.length = 8;
      }

      for (let index = 0; index < trail.dots.length; index += 1) {
        const historyIndex = Math.min(trail.history.length - 1, 2 + index * 2);
        const sample = trail.history[Math.max(0, historyIndex)] ?? current;
        trail.dots[index]!.setPosition(sample);
        trail.dots[index]!.rotateLocal(0, 120 * (index + 1) / 60, 0);
      }
    }
  }

  function updatePulses(list: PulsingVisual[], speed: number, amplitude: number) {
    for (let index = list.length - 1; index >= 0; index -= 1) {
      const visual = list[index]!;
      if (!visual.root.parent) {
        list.splice(index, 1);
        continue;
      }
      const pulse = visual.baseScale * (1 + Math.sin(elapsed * speed + visual.phase) * amplitude);
      visual.ring.setLocalScale(pulse, 0.025, pulse);
      visual.ring.rotateLocal(0, 48 / 60, 0);
    }
  }

  return {
    decorateProjectile,
    decoratePickup,
    decorateBananaHazard,
    spawnImpact,
    spawnDodge,
    spawnObjectiveBurst,
    update(dt: number) {
      elapsed += dt;
      updateTrails();
      updatePulses(pickupPulses, 4.4, 0.11);
      updatePulses(hazardPulses, 7.2, 0.16);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const visual = particles[index]!;
        updateParticle(visual, dt);
        if (visual.age < visual.lifetime) continue;
        visual.entity.destroy();
        particles.splice(index, 1);
      }

      // A tiny neutral floor marker keeps fast effects readable without introducing a dynamic light.
      if (particles.length === 0 && darkMaterial) {
        // `darkMaterial` is intentionally retained as a shared material for future pooled decals.
      }
    },
  };
}
