export type ItemId = "tomato" | "banana" | "pie" | "watermelon" | "milkshake";

export interface ItemDefinition {
  id: ItemId;
  kind: "projectile" | "trap" | "rolling" | "area";
  cooldownSeconds: number;
  speed?: number;
  stunSeconds?: number;
  lifetimeSeconds: number;
}

export const ITEMS: Record<ItemId, ItemDefinition> = {
  tomato: {
    id: "tomato",
    kind: "projectile",
    cooldownSeconds: 0.65,
    speed: 14,
    stunSeconds: 0.4,
    lifetimeSeconds: 2.2,
  },
  banana: { id: "banana", kind: "trap", cooldownSeconds: 1.1, stunSeconds: 1.1, lifetimeSeconds: 12 },
  pie: { id: "pie", kind: "projectile", cooldownSeconds: 1.25, speed: 9, stunSeconds: 0.55, lifetimeSeconds: 3 },
  watermelon: { id: "watermelon", kind: "rolling", cooldownSeconds: 2.2, speed: 8, stunSeconds: 0.8, lifetimeSeconds: 6 },
  milkshake: { id: "milkshake", kind: "area", cooldownSeconds: 2, stunSeconds: 0.25, lifetimeSeconds: 5 },
};
