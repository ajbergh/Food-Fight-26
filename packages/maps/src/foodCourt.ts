export interface MapPoint {
  x: number;
  y: number;
}

export interface MapObstacle extends MapPoint {
  id: string;
  width: number;
  height: number;
}

export interface PickupSpawn extends MapPoint {
  id: string;
  kind: "tomato" | "banana";
}

export const foodCourtMap = {
  id: "food-court-01",
  name: "Yum Yum Food Court",
  width: 28,
  height: 18,
  bounds: { minX: -14, maxX: 14, minY: -9, maxY: 9 },
  objective: { x: 0, y: 0, radius: 3 },
  spawns: [
    { x: -11, y: -6 },
    { x: -11, y: 6 },
    { x: -7, y: -7 },
    { x: -7, y: 7 },
    { x: 11, y: -6 },
    { x: 11, y: 6 },
    { x: 7, y: -7 },
    { x: 7, y: 7 },
  ],
  obstacles: [
    { id: "bench-nw", x: -6, y: 3.5, width: 4, height: 1.6 },
    { id: "bench-ne", x: 6, y: 3.5, width: 4, height: 1.6 },
    { id: "bench-sw", x: -6, y: -3.5, width: 4, height: 1.6 },
    { id: "bench-se", x: 6, y: -3.5, width: 4, height: 1.6 },
  ] satisfies MapObstacle[],
  pickupSpawns: [
    { id: "tomato-west", kind: "tomato", x: -10.5, y: 0 },
    { id: "tomato-east", kind: "tomato", x: 10.5, y: 0 },
    { id: "tomato-south", kind: "tomato", x: 0, y: -6.8 },
    { id: "banana-north", kind: "banana", x: 0, y: 6.8 },
    { id: "banana-west", kind: "banana", x: -10.5, y: 4.2 },
    { id: "banana-east", kind: "banana", x: 10.5, y: -4.2 },
  ] satisfies PickupSpawn[],
} as const;
