import * as pc from "playcanvas";

interface ArenaProductionPropsOptions {
  app: pc.Application;
  highDetailRoot: pc.Entity;
}

interface ContainerResourceLike {
  instantiateRenderEntity(options?: unknown): pc.Entity;
}

interface ProductionPropDefinition {
  id: "pizza" | "pizza-box" | "can" | "carton";
  url: string;
  position: [number, number, number];
  scale: number;
  euler?: [number, number, number];
}

const PRODUCTION_PROPS: readonly ProductionPropDefinition[] = [
  {
    id: "pizza",
    url: "/assets/third-party/kenney-food-kit/pizza.glb",
    position: [-9.35, 1.58, 9.34],
    scale: 1.28,
    euler: [0, 180, 0],
  },
  {
    id: "pizza-box",
    url: "/assets/third-party/kenney-food-kit/pizza-box.glb",
    position: [-8.15, 1.56, 9.38],
    scale: 1.12,
    euler: [0, 168, 0],
  },
  {
    id: "can",
    url: "/assets/third-party/kenney-food-kit/can.glb",
    position: [0.58, 1.57, 9.37],
    scale: 0.92,
    euler: [0, 190, 0],
  },
  {
    id: "carton",
    url: "/assets/third-party/kenney-food-kit/carton.glb",
    position: [9.28, 1.57, 9.36],
    scale: 0.96,
    euler: [0, 174, 0],
  },
] as const;

const sharedAssets = new Map<string, Promise<pc.Asset>>();

export function createArenaProductionProps(options: ArenaProductionPropsOptions) {
  const { app, highDetailRoot } = options;
  let loadPromise: Promise<void> | undefined;

  function ensureLoaded() {
    if (loadPromise) return loadPromise;
    document.documentElement.dataset.productionProps = "loading";
    loadPromise = loadAllProps(app, highDetailRoot)
      .then(({ loaded, failed }) => {
        if (loaded.includes("pizza")) {
          const proceduralPizza = highDetailRoot.findByName("display-pizza");
          if (proceduralPizza) proceduralPizza.enabled = false;
        }
        document.documentElement.dataset.productionProps =
          failed.length === 0 ? "ready" : loaded.length > 0 ? "partial" : "fallback";
        if (failed.length > 0) {
          console.warn(
            `Production prop fallback retained for: ${failed.join(", ")}.`,
          );
        }
      })
      .catch((error: unknown) => {
        document.documentElement.dataset.productionProps = "fallback";
        console.warn("Production props failed; retaining procedural arena dressing.", error);
      });
    return loadPromise;
  }

  return { ensureLoaded };
}

async function loadAllProps(app: pc.Application, parent: pc.Entity) {
  const loaded: ProductionPropDefinition["id"][] = [];
  const failed: ProductionPropDefinition["id"][] = [];

  await Promise.all(
    PRODUCTION_PROPS.map(async (definition) => {
      try {
        const asset = await loadContainer(app, definition.url);
        const resource = asset.resource as unknown as ContainerResourceLike;
        if (!resource || typeof resource.instantiateRenderEntity !== "function") {
          throw new Error("container did not expose a render hierarchy");
        }
        const entity = resource.instantiateRenderEntity({
          castShadows: false,
          receiveShadows: false,
        });
        entity.name = `production-prop-${definition.id}`;
        entity.setLocalScale(
          definition.scale,
          definition.scale,
          definition.scale,
        );
        entity.setLocalPosition(...definition.position);
        if (definition.euler) entity.setLocalEulerAngles(...definition.euler);
        parent.addChild(entity);
        loaded.push(definition.id);
      } catch {
        failed.push(definition.id);
      }
    }),
  );

  return { loaded, failed };
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
