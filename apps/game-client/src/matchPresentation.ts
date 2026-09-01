import * as pc from "playcanvas";
import type { MatchEventMessage, MatchStateShape } from "@foodfight/protocol";

interface MatchPresentationOptions {
  camera: pc.Entity;
  objectivePosition: { x: number; z: number };
}

export interface MatchPresentationController {
  handleMatchEvent(message: MatchEventMessage): void;
  syncState(state: MatchStateShape): void;
  update(dt: number): void;
}

type CameraMoment = "neutral" | "round" | "control" | "overtime" | "finish";

const BASE_POSITION = new pc.Vec3(0, 22, 19);

function reducedMotion() {
  return document.body.dataset.reducedMotion === "true"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeOutCubic(value: number) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

export function createMatchPresentation(options: MatchPresentationOptions): MatchPresentationController {
  const { camera, objectivePosition } = options;
  const baseTarget = new pc.Vec3(objectivePosition.x, 0.35, objectivePosition.z);
  const desiredPosition = BASE_POSITION.clone();
  const desiredTarget = baseTarget.clone();
  const currentTarget = baseTarget.clone();

  let moment: CameraMoment = "neutral";
  let momentElapsed = 0;
  let momentDuration = 0;
  let momentTeam: "blue" | "red" | undefined;
  let phase: MatchStateShape["phase"] = "waiting";

  function setBodyMoment(next: CameraMoment, team?: "blue" | "red") {
    document.body.dataset.matchMoment = next;
    if (team) document.body.dataset.presentationTeam = team;
    else delete document.body.dataset.presentationTeam;
  }

  function trigger(next: CameraMoment, duration: number, team?: "blue" | "red") {
    moment = next;
    momentElapsed = 0;
    momentDuration = duration;
    momentTeam = team;
    setBodyMoment(next, team);
  }

  function handleMatchEvent(message: MatchEventMessage) {
    if (message.type === "round_started") {
      trigger("round", 1.15, message.team);
    } else if (message.type === "objective_control") {
      trigger("control", 0.9, message.team);
    } else if (message.type === "overtime") {
      trigger("overtime", 1.35, message.team);
    } else if (message.type === "round_finished") {
      trigger("finish", 2.35, message.team);
    }
  }

  function syncState(state: MatchStateShape) {
    phase = state.phase;
    if (state.phase === "finished") {
      if (moment !== "finish") trigger("finish", 2.35, state.winner === "none" ? undefined : state.winner);
      return;
    }
    if (state.phase === "overtime") {
      if (moment === "neutral") setBodyMoment("overtime", state.objectiveOwner === "none" ? undefined : state.objectiveOwner);
      return;
    }
    if (state.phase === "waiting" && moment === "finish") {
      moment = "neutral";
      momentElapsed = 0;
      momentDuration = 0;
      momentTeam = undefined;
      setBodyMoment("neutral");
    }
  }

  function resolveMomentPose(progress: number) {
    desiredPosition.copy(BASE_POSITION);
    desiredTarget.copy(baseTarget);

    if (moment === "neutral") return;

    // A single smooth impulse gives the match moments weight without introducing camera shake.
    // The finish shot holds near its hero framing before easing home on the next round.
    const envelope = moment === "finish"
      ? Math.sin(Math.PI * Math.min(0.72, progress) / 0.72) * (progress < 0.72 ? 1 : 0.78)
      : Math.sin(Math.PI * progress);
    const teamSign = momentTeam === "blue" ? -1 : momentTeam === "red" ? 1 : 0;

    if (moment === "round") {
      desiredPosition.y += 0.8 * envelope;
      desiredPosition.z += 1.15 * envelope;
      desiredTarget.y += 0.22 * envelope;
    } else if (moment === "control") {
      desiredPosition.x += teamSign * 0.72 * envelope;
      desiredPosition.y -= 0.32 * envelope;
      desiredPosition.z -= 0.58 * envelope;
      desiredTarget.x += teamSign * 0.45 * envelope;
      desiredTarget.y += 0.2 * envelope;
    } else if (moment === "overtime") {
      desiredPosition.y -= 0.72 * envelope;
      desiredPosition.z -= 1.28 * envelope;
      desiredTarget.y += 0.38 * envelope;
    } else if (moment === "finish") {
      const hold = easeOutCubic(Math.min(1, progress / 0.34));
      desiredPosition.x += teamSign * 1.1 * hold;
      desiredPosition.y -= 1.35 * hold;
      desiredPosition.z -= 1.65 * hold;
      desiredTarget.x += teamSign * 0.55 * hold;
      desiredTarget.y += 0.7 * hold;
    }
  }

  function update(dt: number) {
    const safeDt = Math.min(0.05, Math.max(0, dt));
    if (moment !== "neutral") {
      momentElapsed += safeDt;
      const progress = momentDuration > 0 ? clamp01(momentElapsed / momentDuration) : 1;
      resolveMomentPose(reducedMotion() ? 0 : progress);

      if (momentElapsed >= momentDuration && moment !== "finish") {
        moment = "neutral";
        momentElapsed = 0;
        momentDuration = 0;
        momentTeam = undefined;
        if (phase !== "overtime") setBodyMoment("neutral");
      }
    } else {
      desiredPosition.copy(BASE_POSITION);
      desiredTarget.copy(baseTarget);
    }

    if (reducedMotion()) {
      desiredPosition.copy(BASE_POSITION);
      desiredTarget.copy(baseTarget);
    }

    const position = camera.getPosition().clone();
    position.lerp(position, desiredPosition, 1 - Math.exp(-7.5 * safeDt));
    camera.setPosition(position);
    currentTarget.lerp(currentTarget, desiredTarget, 1 - Math.exp(-8.5 * safeDt));
    camera.lookAt(currentTarget);
  }

  setBodyMoment("neutral");
  return { handleMatchEvent, syncState, update };
}
