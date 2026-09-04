import * as pc from "playcanvas";
import {
  equipmentPulse,
  escalatorStepProgress,
  handleRockDegrees,
  wayfindingSwayDegrees,
} from "./arenaAmbientLifeCore";

interface ArenaAmbientLifeOptions {
  app: pc.Application;
}

export interface ArenaAmbientLifeController {
  update(dt: number): void;
}

const UPDATE_INTERVAL_SECONDS = 1 / 30;
const ESCALATOR_BASE_Y = 0.74;
const ESCALATOR_RISE = 2.72;
const ESCALATOR_NEAR_Z = 2.05;
const ESCALATOR_RUN = 4.1;

interface EscalatorTrack {
  steps: pc.Entity[];
  direction: 1 | -1;
}

interface SwayTarget {
  entity: pc.Entity;
  phase: number;
}

interface PulseTarget {
  entity: pc.Entity;
  baseScale: [number, number, number];
  phase: number;
}

interface HandleTarget {
  entity: pc.Entity;
  phase: number;
}

export function createArenaAmbientLife(
  options: ArenaAmbientLifeOptions,
): ArenaAmbientLifeController {
  const { app } = options;
  const mediumDetailRoot = app.root.findByName("medium-detail") as pc.Entity | null;
  const highDetailRoot = app.root.findByName("high-detail") as pc.Entity | null;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const escalators: EscalatorTrack[] = [
    { steps: collectEscalatorSteps(app, "west-escalator"), direction: 1 },
    { steps: collectEscalatorSteps(app, "east-escalator"), direction: -1 },
  ];

  const swayTargets = [
    target(app, "hanging-wayfinding-0", 0),
    target(app, "hanging-wayfinding-1", 2.1),
    target(app, "hanging-wayfinding-2", 4.2),
  ].filter((value): value is SwayTarget => value !== null);

  const pulseTargets: PulseTarget[] = [];
  addPulseTarget(app, pulseTargets, "fire-bed", [0.88, 0.1, 0.05], 0.4);
  addPulseTarget(app, pulseTargets, "heat-line", [1.45, 0.045, 0.05], 2.2);

  const handles = [
    handle(app, "handle--0.42", 0),
    handle(app, "handle-0", 1.8),
    handle(app, "handle-0.42", 3.6),
  ].filter((value): value is HandleTarget => value !== null);

  let elapsed = 0;
  let accumulator = UPDATE_INTERVAL_SECONDS;
  let lastDiagnostic = "";

  function reducedMotion() {
    return (
      document.body.dataset.reducedMotion === "true" ||
      reducedMotionQuery.matches
    );
  }

  function update(dt: number) {
    elapsed += Math.max(0, dt);
    accumulator += Math.max(0, dt);
    if (accumulator < UPDATE_INTERVAL_SECONDS) return;
    accumulator %= UPDATE_INTERVAL_SECONDS;

    const reduced = reducedMotion();
    const diagnostic = reduced ? "reduced" : "active";
    if (diagnostic !== lastDiagnostic) {
      document.documentElement.dataset.arenaAmbientLife = diagnostic;
      lastDiagnostic = diagnostic;
    }

    if (mediumDetailRoot?.enabled) {
      updateEscalators(escalators, elapsed, reduced);
      for (const target of swayTargets) {
        target.entity.setLocalEulerAngles(
          0,
          0,
          wayfindingSwayDegrees(elapsed, target.phase, reduced),
        );
      }
    }

    if (highDetailRoot?.enabled) {
      for (const target of pulseTargets) {
        const pulse = equipmentPulse(elapsed, target.phase, reduced);
        target.entity.setLocalScale(
          target.baseScale[0] * pulse,
          target.baseScale[1],
          target.baseScale[2],
        );
      }
      for (const target of handles) {
        target.entity.setLocalEulerAngles(
          0,
          0,
          handleRockDegrees(elapsed, target.phase, reduced),
        );
      }
    }
  }

  update(0);
  return { update };
}

function collectEscalatorSteps(app: pc.Application, bankName: string) {
  const bank = app.root.findByName(bankName) as pc.Entity | null;
  if (!bank) return [];
  const steps: pc.Entity[] = [];
  for (let index = 0; index < 8; index += 1) {
    const step = bank.findByName(`step-${index}`) as pc.Entity | null;
    if (step) steps.push(step);
  }
  return steps;
}

function updateEscalators(
  tracks: readonly EscalatorTrack[],
  elapsed: number,
  reducedMotion: boolean,
) {
  for (const track of tracks) {
    const count = track.steps.length;
    for (let index = 0; index < count; index += 1) {
      const progress = reducedMotion
        ? count <= 1
          ? 0
          : index / (count - 1)
        : escalatorStepProgress(index, count, elapsed, track.direction);
      track.steps[index]!.setLocalPosition(
        0,
        ESCALATOR_BASE_Y + progress * ESCALATOR_RISE,
        ESCALATOR_NEAR_Z - progress * ESCALATOR_RUN,
      );
    }
  }
}

function target(
  app: pc.Application,
  name: string,
  phase: number,
): SwayTarget | null {
  const entity = app.root.findByName(name) as pc.Entity | null;
  return entity ? { entity, phase } : null;
}

function addPulseTarget(
  app: pc.Application,
  targets: PulseTarget[],
  name: string,
  baseScale: [number, number, number],
  phase: number,
) {
  const entity = app.root.findByName(name) as pc.Entity | null;
  if (entity) targets.push({ entity, baseScale, phase });
}

function handle(
  app: pc.Application,
  name: string,
  phase: number,
): HandleTarget | null {
  const entity = app.root.findByName(name) as pc.Entity | null;
  return entity ? { entity, phase } : null;
}
