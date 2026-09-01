import * as pc from "playcanvas";

export const SKELETAL_PILOT_URL = "/assets/third-party/kaykit-adventurers/chef-pilot.glb";
export const SKELETAL_PILOT_CLIPS = ["idle", "walk", "run", "throw_food"] as const;

export type SkeletalPilotClip = (typeof SKELETAL_PILOT_CLIPS)[number];

interface AnimationAssetLike {
  name: string;
  resource?: unknown;
}

interface ContainerResourceLike {
  animations?: AnimationAssetLike[];
  instantiateRenderEntity(options?: unknown): pc.Entity;
}

export interface SkeletalPilotInstance {
  entity: pc.Entity;
  transition(clip: SkeletalPilotClip, blendSeconds?: number): void;
  destroy(): void;
}

let sharedContainerPromise: Promise<pc.Asset> | undefined;

export function normalizeSkeletalClipName(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function isSkeletalPilotEnabled(search = window.location.search) {
  return new URLSearchParams(search).get("skeletalPilot") === "1";
}

export function mapSkeletalPilotClips(animations: readonly AnimationAssetLike[]) {
  const byName = new Map<string, AnimationAssetLike>();
  for (const animation of animations) {
    byName.set(normalizeSkeletalClipName(animation.name), animation);
  }

  const clips = new Map<SkeletalPilotClip, AnimationAssetLike>();
  for (const required of SKELETAL_PILOT_CLIPS) {
    const animation = byName.get(required);
    if (animation) clips.set(required, animation);
  }
  return clips;
}

export function missingSkeletalPilotClips(animations: readonly AnimationAssetLike[]) {
  const mapped = mapSkeletalPilotClips(animations);
  return SKELETAL_PILOT_CLIPS.filter((clip) => !mapped.has(clip));
}

export async function instantiateSkeletalPilot(app: pc.Application): Promise<SkeletalPilotInstance> {
  const asset = await loadPilotContainer(app);
  const resource = asset.resource as unknown as ContainerResourceLike;
  if (!resource || typeof resource.instantiateRenderEntity !== "function") {
    throw new Error("Skeletal pilot container did not expose a render hierarchy.");
  }

  const animations = Array.isArray(resource.animations) ? resource.animations : [];
  const missing = missingSkeletalPilotClips(animations);
  if (missing.length > 0) {
    throw new Error(`Skeletal pilot is missing required clips: ${missing.join(", ")}.`);
  }

  const clips = mapSkeletalPilotClips(animations);
  const entity = resource.instantiateRenderEntity({ castShadows: true, receiveShadows: true });
  entity.name = "skeletal-character-pilot";
  entity.addComponent("anim", { activate: false, speed: 1 });

  const anim = entity.anim;
  if (!anim) {
    entity.destroy();
    throw new Error("Skeletal pilot could not create a PlayCanvas anim component.");
  }

  anim.loadStateGraph({
    layers: [
      {
        name: "base",
        states: [
          { name: "START", speed: 1 },
          { name: "idle", speed: 1, loop: true, defaultState: true },
          { name: "walk", speed: 1, loop: true },
          { name: "run", speed: 1, loop: true },
          { name: "throw_food", speed: 1, loop: false },
        ],
        transitions: [{ from: "START", to: "idle" }],
      },
    ],
    parameters: {},
  });

  for (const clip of SKELETAL_PILOT_CLIPS) {
    const animation = clips.get(clip);
    if (!animation?.resource) {
      entity.destroy();
      throw new Error(`Skeletal pilot clip '${clip}' has no loaded animation track.`);
    }
    anim.assignAnimation(clip, animation.resource as pc.AnimTrack, "base", 1, clip !== "throw_food");
  }

  anim.activate = true;
  anim.baseLayer.transition("idle", 0);

  let destroyed = false;
  return {
    entity,
    transition(clip, blendSeconds = clip === "throw_food" ? 0.06 : 0.12) {
      if (destroyed || !entity.parent) return;
      anim.baseLayer.transition(clip, blendSeconds);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      entity.destroy();
    },
  };
}

function loadPilotContainer(app: pc.Application) {
  if (sharedContainerPromise) return sharedContainerPromise;

  sharedContainerPromise = new Promise<pc.Asset>((resolve, reject) => {
    app.assets.loadFromUrl(SKELETAL_PILOT_URL, "container", (error, asset) => {
      if (error || !asset) {
        sharedContainerPromise = undefined;
        reject(new Error(`Unable to load skeletal pilot at ${SKELETAL_PILOT_URL}: ${String(error ?? "unknown error")}`));
        return;
      }
      resolve(asset);
    });
  });
  return sharedContainerPromise;
}
