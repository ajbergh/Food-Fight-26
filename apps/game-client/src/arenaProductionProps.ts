import * as pc from "playcanvas";

interface ArenaProductionPropsOptions {
  app: pc.Application;
  highDetailRoot: pc.Entity;
}

interface ContainerResourceLike {
  instantiateRenderEntity(options?: unknown): pc.Entity;
}

type ProductionPropId =
  | "pizza"
  | "pizza-box"
  | "can"
  | "carton"
  | "bench"
  | "chair"
  | "table-round"
  | "trashcan"
  | "service-window"
  | "freezers-standing"
  | "cash-register"
  | "bottle-return"
  | "stove-electric"
  | "hood-large"
  | "blender"
  | "coffee-machine"
  | "microwave";

type ProductionPropGroup = "food" | "furniture" | "mini-market" | "kitchen";

interface ProductionPropPlacement {
  position: [number, number, number];
  scale: number;
  euler?: [number, number, number];
  replaceName?: string;
}

interface ProductionPropDefinition {
  id: ProductionPropId;
  group: ProductionPropGroup;
  url: string;
  placements: readonly ProductionPropPlacement[];
}

const PRODUCTION_PROPS: readonly ProductionPropDefinition[] = [
  {
    id: "pizza",
    group: "food",
    url: "/assets/third-party/kenney-food-kit/pizza.glb",
    placements: [
      {
        position: [-9.35, 1.58, 9.34],
        scale: 1.28,
        euler: [0, 180, 0],
        replaceName: "display-pizza",
      },
    ],
  },
  {
    id: "pizza-box",
    group: "food",
    url: "/assets/third-party/kenney-food-kit/pizza-box.glb",
    placements: [{ position: [-8.15, 1.56, 9.38], scale: 1.12, euler: [0, 168, 0] }],
  },
  {
    id: "can",
    group: "food",
    url: "/assets/third-party/kenney-food-kit/can.glb",
    placements: [{ position: [0.58, 1.57, 9.37], scale: 0.92, euler: [0, 190, 0] }],
  },
  {
    id: "carton",
    group: "food",
    url: "/assets/third-party/kenney-food-kit/carton.glb",
    placements: [{ position: [9.28, 1.57, 9.36], scale: 0.96, euler: [0, 174, 0] }],
  },
  {
    id: "table-round",
    group: "furniture",
    url: "/assets/third-party/kenney-furniture-kit/table-round.glb",
    placements: [
      { position: [-14.9, 0, -7.7], scale: 1.08, replaceName: "perimeter-table-0" },
      { position: [14.9, 0, 7.7], scale: 1.08, replaceName: "perimeter-table-3" },
    ],
  },
  {
    id: "chair",
    group: "furniture",
    url: "/assets/third-party/kenney-furniture-kit/chair.glb",
    placements: [
      { position: [-13.55, 0, -7.7], scale: 1.02, euler: [0, 90, 0] },
      { position: [-16.15, 0, -7.7], scale: 1.02, euler: [0, -90, 0] },
      { position: [13.55, 0, 7.7], scale: 1.02, euler: [0, -90, 0] },
      { position: [16.15, 0, 7.7], scale: 1.02, euler: [0, 90, 0] },
    ],
  },
  {
    id: "bench",
    group: "furniture",
    url: "/assets/third-party/kenney-furniture-kit/bench.glb",
    placements: [
      { position: [-15.5, 0, -2.7], scale: 1.06, euler: [0, 90, 0] },
      { position: [15.5, 0, 2.7], scale: 1.06, euler: [0, -90, 0] },
    ],
  },
  {
    id: "trashcan",
    group: "furniture",
    url: "/assets/third-party/kenney-furniture-kit/trashcan.glb",
    placements: [
      { position: [-13.55, 0, -9.55], scale: 0.94, euler: [0, 18, 0] },
      { position: [13.55, 0, -9.55], scale: 0.94, euler: [0, -18, 0] },
    ],
  },
  {
    id: "service-window",
    group: "mini-market",
    url: "/assets/third-party/kenney-mini-market/service-window.glb",
    placements: [
      { position: [10.5, 0.02, -10.12], scale: 1.52, euler: [0, 180, 0] },
    ],
  },
  {
    id: "freezers-standing",
    group: "mini-market",
    url: "/assets/third-party/kenney-mini-market/freezers-standing.glb",
    placements: [
      {
        position: [-15.35, 0, 1.7],
        scale: 1.08,
        euler: [0, 90, 0],
        replaceName: "vending-west",
      },
      {
        position: [15.35, 0, -1.7],
        scale: 1.08,
        euler: [0, -90, 0],
        replaceName: "vending-east",
      },
    ],
  },
  {
    id: "cash-register",
    group: "mini-market",
    url: "/assets/third-party/kenney-mini-market/cash-register.glb",
    placements: [
      { position: [-10.5, 1.33, -9.48], scale: 0.82, euler: [0, 180, 0] },
      { position: [10.5, 1.33, -9.48], scale: 0.82, euler: [0, 180, 0] },
    ],
  },
  {
    id: "bottle-return",
    group: "mini-market",
    url: "/assets/third-party/kenney-mini-market/bottle-return.glb",
    placements: [
      {
        position: [-15.35, 0, -2.2],
        scale: 1.06,
        euler: [0, 90, 0],
        replaceName: "recycling-west",
      },
      {
        position: [15.35, 0, 2.2],
        scale: 1.06,
        euler: [0, -90, 0],
        replaceName: "recycling-east",
      },
    ],
  },
  {
    id: "stove-electric",
    group: "kitchen",
    url: "/assets/third-party/kenney-furniture-kit/stove-electric.glb",
    placements: [
      {
        position: [0, 1.48, 9.98],
        scale: 1.7,
        euler: [0, 180, 0],
        replaceName: "burger-grill",
      },
    ],
  },
  {
    id: "hood-large",
    group: "kitchen",
    url: "/assets/third-party/kenney-furniture-kit/hood-large.glb",
    placements: [{ position: [0, 3.18, 10.08], scale: 1.72, euler: [0, 180, 0] }],
  },
  {
    id: "blender",
    group: "kitchen",
    url: "/assets/third-party/kenney-furniture-kit/blender.glb",
    placements: [
      {
        position: [8.48, 1.5, 9.72],
        scale: 1.02,
        euler: [0, 180, 0],
        replaceName: "shake-machine",
      },
      { position: [9, 1.5, 9.72], scale: 1.02, euler: [0, 180, 0] },
      { position: [9.52, 1.5, 9.72], scale: 1.02, euler: [0, 180, 0] },
    ],
  },
  {
    id: "coffee-machine",
    group: "kitchen",
    url: "/assets/third-party/kenney-furniture-kit/coffee-machine.glb",
    placements: [{ position: [10.3, 1.5, 9.72], scale: 1.08, euler: [0, 180, 0] }],
  },
  {
    id: "microwave",
    group: "kitchen",
    url: "/assets/third-party/kenney-furniture-kit/microwave.glb",
    placements: [{ position: [-7.85, 1.5, 9.72], scale: 1.05, euler: [0, 180, 0] }],
  },
] as const;

const sharedAssets = new Map<string, Promise<pc.Asset>>();

export function createArenaProductionProps(options: ArenaProductionPropsOptions) {
  const { app, highDetailRoot } = options;
  let loadPromise: Promise<void> | undefined;

  function ensureLoaded() {
    if (loadPromise) return loadPromise;
    document.documentElement.dataset.productionProps = "loading";
    document.documentElement.dataset.productionFurniture = "loading";
    document.documentElement.dataset.productionMiniMarket = "loading";
    document.documentElement.dataset.productionKitchen = "loading";
    loadPromise = loadAllProps(app, highDetailRoot)
      .then(({ loaded, failed }) => {
        document.documentElement.dataset.productionProps = stateFor(loaded, failed);
        document.documentElement.dataset.productionFurniture = stateForGroup(
          "furniture",
          loaded,
          failed,
        );
        document.documentElement.dataset.productionMiniMarket = stateForGroup(
          "mini-market",
          loaded,
          failed,
        );
        document.documentElement.dataset.productionKitchen = stateForGroup(
          "kitchen",
          loaded,
          failed,
        );

        if (failed.length > 0) {
          console.warn(`Production prop fallback retained for: ${failed.join(", ")}.`);
        }
      })
      .catch((error: unknown) => {
        document.documentElement.dataset.productionProps = "fallback";
        document.documentElement.dataset.productionFurniture = "fallback";
        document.documentElement.dataset.productionMiniMarket = "fallback";
        document.documentElement.dataset.productionKitchen = "fallback";
        console.warn("Production props failed; retaining procedural arena dressing.", error);
      });
    return loadPromise;
  }

  return { ensureLoaded };
}

function stateForGroup(
  group: ProductionPropGroup,
  loaded: readonly ProductionPropId[],
  failed: readonly ProductionPropId[],
) {
  const ids = PRODUCTION_PROPS
    .filter((definition) => definition.group === group)
    .map((definition) => definition.id);
  return stateFor(
    loaded.filter((id) => ids.includes(id)),
    failed.filter((id) => ids.includes(id)),
  );
}

function stateFor(loaded: readonly ProductionPropId[], failed: readonly ProductionPropId[]) {
  return failed.length === 0 ? "ready" : loaded.length > 0 ? "partial" : "fallback";
}

async function loadAllProps(app: pc.Application, parent: pc.Entity) {
  const loaded: ProductionPropId[] = [];
  const failed: ProductionPropId[] = [];

  await Promise.all(
    PRODUCTION_PROPS.map(async (definition) => {
      try {
        await instantiateDefinition(app, parent, definition);
        loaded.push(definition.id);
      } catch {
        failed.push(definition.id);
      }
    }),
  );

  return { loaded, failed };
}

async function instantiateDefinition(
  app: pc.Application,
  parent: pc.Entity,
  definition: ProductionPropDefinition,
) {
  const asset = await loadContainer(app, definition.url);
  const resource = asset.resource as unknown as ContainerResourceLike;
  if (!resource || typeof resource.instantiateRenderEntity !== "function") {
    throw new Error("container did not expose a render hierarchy");
  }

  const created: pc.Entity[] = [];
  try {
    definition.placements.forEach((placement, index) => {
      const entity = resource.instantiateRenderEntity({
        castShadows: false,
        receiveShadows: false,
      });
      entity.name = definition.placements.length === 1
        ? `production-prop-${definition.id}`
        : `production-prop-${definition.id}-${index}`;
      entity.setLocalScale(placement.scale, placement.scale, placement.scale);
      entity.setLocalPosition(...placement.position);
      if (placement.euler) entity.setLocalEulerAngles(...placement.euler);
      parent.addChild(entity);
      created.push(entity);
    });

    for (const placement of definition.placements) {
      if (!placement.replaceName) continue;
      const fallback = parent.findByName(placement.replaceName);
      if (fallback) fallback.enabled = false;
    }
  } catch (error) {
    for (const entity of created) entity.destroy();
    throw error;
  }
}

function loadContainer(app: pc.Application, url: string) {
  const existing = sharedAssets.get(url);
  if (existing) return existing;

  const promise = new Promise<pc.Asset>((resolve, reject) => {
    app.assets.loadFromUrl(url, "container", (error, asset) => {
      if (error || !asset) {
        sharedAssets.delete(url);
        reject(
          new Error(
            `Unable to load production prop at ${url}: ${String(error ?? "unknown error")}`,
          ),
        );
        return;
      }
      resolve(asset);
    });
  });
  sharedAssets.set(url, promise);
  return promise;
}
